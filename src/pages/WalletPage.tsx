import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchHostPaymentProfile,
  fetchHostWalletBalance,
  fetchHostBookingPaymentsLedger,
  fetchHostTransfersLedger,
  fetchPayerBookingPayments,
  saveMpesaNumberAndSyncPaystackRecipient,
  initiateHostTransfer,
  type BookingPaymentLedgerRow,
  type HostTransferLedgerRow,
  type PayerBookingPaymentRow,
} from '../services/hostPayoutService';
import { KES_PAYSTACK_SUBUNITS_PER_UNIT } from '../config/paystackKes';
import { Wallet, RefreshCw, Smartphone, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface WalletPageProps {
  isDarkMode: boolean;
}

function kesFromMinor(minor: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minor / KES_PAYSTACK_SUBUNITS_PER_UNIT);
}

type ActivityRow =
  | {
      key: string;
      kind: 'earning';
      at: string;
      label: string;
      amountMinor: number;
      status: string;
      detail: string;
    }
  | {
      key: string;
      kind: 'withdrawal';
      at: string;
      label: string;
      amountMinor: number;
      status: string;
      detail: string;
    };

function buildActivity(bookings: BookingPaymentLedgerRow[], transfers: HostTransferLedgerRow[]): ActivityRow[] {
  const earnings: ActivityRow[] = bookings.map((b) => ({
    key: `b-${b.id}`,
    kind: 'earning' as const,
    at: b.paid_at || b.created_at,
    label: 'Short-stay booking',
    amountMinor: b.status === 'success' ? Number(b.host_net_minor) : 0,
    status: b.status,
    detail: `${b.properties?.title ? b.properties.title : 'Property'} · ${b.paystack_reference.slice(0, 14)}…`,
  }));
  const outs: ActivityRow[] = transfers.map((t) => ({
    key: `t-${t.id}`,
    kind: 'withdrawal' as const,
    at: t.created_at,
    label: 'Withdrawal',
    amountMinor: Number(t.amount_minor),
    status: t.status,
    detail: t.failure_reason || t.reason || t.transfer_reference.slice(0, 13) + '…',
  }));
  return [...earnings, ...outs].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

const WalletPage: React.FC<WalletPageProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const isHostWallet = user?.userType === 'host' || user?.userType === 'developer';
  const isBuyer = user?.userType === 'buyer';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<Awaited<ReturnType<typeof fetchHostWalletBalance>>>(null);
  const [bookings, setBookings] = useState<BookingPaymentLedgerRow[]>([]);
  const [transfers, setTransfers] = useState<HostTransferLedgerRow[]>([]);
  const [payerBookings, setPayerBookings] = useState<PayerBookingPaymentRow[]>([]);

  const [mpesaPhone, setMpesaPhone] = useState('');
  const [recipientOk, setRecipientOk] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  const cardClass = isDarkMode
    ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-5'
    : 'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm';

  const labelMuted = isDarkMode ? 'text-white/55' : 'text-gray-600';
  const inputClass = isDarkMode
    ? 'w-full px-4 py-3 rounded-lg border border-white/15 bg-white/5 text-white placeholder:text-white/35'
    : 'w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400';

  const loadHostData = useCallback(async () => {
    const [bal, b, t, prof] = await Promise.all([
      fetchHostWalletBalance(),
      fetchHostBookingPaymentsLedger(50),
      fetchHostTransfersLedger(50),
      fetchHostPaymentProfile(),
    ]);
    setBalance(bal);
    setBookings(b);
    setTransfers(t);
    if (prof?.mpesa_phone) setMpesaPhone(prof.mpesa_phone);
    setRecipientOk(!!prof?.paystack_recipient_code);
  }, []);

  const loadBuyerData = useCallback(async () => {
    const pb = await fetchPayerBookingPayments(50);
    setPayerBookings(pb);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (isHostWallet) await loadHostData();
      else if (isBuyer) await loadBuyerData();
    } finally {
      setRefreshing(false);
    }
  }, [isHostWallet, isBuyer, loadHostData, loadBuyerData]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (isHostWallet) await loadHostData();
        else if (isBuyer) await loadBuyerData();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isHostWallet, isBuyer, loadHostData, loadBuyerData]);

  const activity = useMemo(() => buildActivity(bookings, transfers), [bookings, transfers]);

  /** Live validation: parsed KES vs available balance (minor units, matches Edge rounding). */
  const withdrawValidation = useMemo(() => {
    const raw = withdrawAmount.trim().replace(/,/g, '');
    if (raw === '') {
      return { state: 'empty' as const };
    }
    const n = parseFloat(raw);
    if (Number.isNaN(n)) {
      return { state: 'invalid' as const, message: 'Enter a valid number.' };
    }
    if (n <= 0) {
      return { state: 'nonpositive' as const, message: 'Amount must be greater than zero.' };
    }
    const amountMinor = Math.round(n * KES_PAYSTACK_SUBUNITS_PER_UNIT);
    if (balance != null && amountMinor > balance.availableMinor) {
      const overMinor = amountMinor - balance.availableMinor;
      return {
        state: 'exceeds' as const,
        message: `Exceeds available balance by ${kesFromMinor(overMinor)}. Maximum you can withdraw is ${kesFromMinor(balance.availableMinor)}.`,
      };
    }
    return { state: 'ok' as const, amountKes: n, amountMinor };
  }, [withdrawAmount, balance]);

  const withdrawAmountHasError =
    withdrawValidation.state === 'invalid' ||
    withdrawValidation.state === 'nonpositive' ||
    withdrawValidation.state === 'exceeds';

  const canSubmitWithdraw = withdrawValidation.state === 'ok' && !withdrawLoading;

  const handleSaveMpesa = async () => {
    if (!user) return;
    setPayoutLoading(true);
    setPayoutMsg(null);
    const r = await saveMpesaNumberAndSyncPaystackRecipient(mpesaPhone, user);
    setPayoutLoading(false);
    if (r.success) {
      setRecipientOk(true);
      setPayoutMsg('M-Pesa number saved and Paystack recipient updated.');
      await loadHostData();
    } else {
      setPayoutMsg(r.error || 'Could not update Paystack recipient.');
    }
  };

  const handleWithdraw = async () => {
    if (withdrawValidation.state !== 'ok') {
      if (withdrawValidation.state === 'exceeds') {
        setWithdrawMsg(withdrawValidation.message);
      } else if (withdrawValidation.state === 'empty') {
        setWithdrawMsg('Enter an amount in KES.');
      } else if (withdrawValidation.state === 'invalid' || withdrawValidation.state === 'nonpositive') {
        setWithdrawMsg(withdrawValidation.message);
      }
      return;
    }
    setWithdrawLoading(true);
    setWithdrawMsg(null);
    const r = await initiateHostTransfer({
      amount_minor: withdrawValidation.amountMinor,
      reason: 'Host withdrawal',
    });
    setWithdrawLoading(false);
    if (r.success) {
      setWithdrawAmount('');
      setWithdrawMsg(
        r.requiresOtp
          ? 'Transfer needs OTP approval in Paystack.'
          : 'Withdrawal submitted. Status updates when Paystack confirms.'
      );
      await loadHostData();
    } else {
      const lines = [r.error, r.hint].filter(Boolean);
      if (
        typeof r.availableKes === 'number' &&
        r.errorCode === 'insufficient_ledger'
      ) {
        lines.push(`In-app available (KES): ${r.availableKes.toFixed(2)}`);
      }
      setWithdrawMsg(lines.join(' ') || 'Transfer failed.');
    }
  };

  if (!user) {
    return null;
  }

  if (!isHostWallet && !isBuyer) {
    return (
      <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
        <h1 className="text-2xl font-bold mb-2">Wallet</h1>
        <p className={labelMuted}>Wallet is available for guests (payments) and for hosts or developers (payouts).</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-10 h-10 border-2 border-[#C7A667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Wallet className="w-7 h-7 text-[#C7A667]" />
            Wallet
          </h1>
          <p className={`mt-1 text-sm ${labelMuted}`}>
            {isHostWallet
              ? 'Short-stay earnings, withdrawals to M-Pesa, and Paystack recipient.'
              : 'Your short-stay booking payments.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          disabled={refreshing}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            isDarkMode
              ? 'border-white/20 text-white hover:bg-white/10'
              : 'border-gray-300 text-gray-800 hover:bg-gray-50'
          } disabled:opacity-50`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isBuyer && (
        <div className={cardClass}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Your payments
          </h2>
          {payerBookings.length === 0 ? (
            <p className={labelMuted}>No short-stay booking payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-left border-b ${isDarkMode ? 'border-white/10 text-white/50' : 'border-gray-200 text-gray-500'}`}>
                    <th className="pb-2 pr-4 font-medium">Date</th>
                    <th className="pb-2 pr-4 font-medium">Stay</th>
                    <th className="pb-2 pr-4 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payerBookings.map((p) => (
                    <tr key={p.id} className={`border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                      <td className="py-3 pr-4 whitespace-nowrap">{new Date(p.created_at).toLocaleString()}</td>
                      <td className="py-3 pr-4">{p.properties?.title || '—'}</td>
                      <td className="py-3 pr-4">{kesFromMinor(Number(p.amount_requested_minor))}</td>
                      <td className="py-3 capitalize">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isHostWallet && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className={cardClass}>
              <p className={`text-sm ${labelMuted}`}>Available balance</p>
              <p className={`mt-2 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {balance ? kesFromMinor(balance.availableMinor) : '—'}
              </p>
              <p className={`mt-2 text-xs ${labelMuted}`}>After reserved withdrawals</p>
            </div>
            <div className={cardClass}>
              <p className={`text-sm ${labelMuted}`}>Reserved / in flight</p>
              <p className={`mt-2 text-2xl font-bold ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                {balance ? kesFromMinor(balance.reservedMinor) : '—'}
              </p>
              <p className={`mt-2 text-xs ${labelMuted}`}>Pending, queued, or completed debits</p>
            </div>
            <div className={cardClass}>
              <p className={`text-sm ${labelMuted}`}>Total earned (net)</p>
              <p className={`mt-2 text-2xl font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                {balance ? kesFromMinor(balance.totalEarnedMinor) : '—'}
              </p>
              <p className={`mt-2 text-xs ${labelMuted}`}>Successful short-stay payouts to you</p>
            </div>
          </div>

          <div className={`grid gap-6 lg:grid-cols-2`}>
            <div className={cardClass}>
              <h2 className={`text-lg font-semibold mb-1 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Smartphone className="w-5 h-5 text-[#C7A667]" />
                M-Pesa payout number
              </h2>
              <p className={`text-sm mb-4 ${labelMuted}`}>
                Enter the Safaricom number that receives withdrawals.
                
              </p>
             
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/90' : 'text-gray-800'}`}>
                M-Pesa phone
              </label>
              <input
                type="tel"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                placeholder="2547XXXXXXXX or 07XXXXXXXX"
                className={inputClass}
              />
              {payoutMsg && (
                <p
                  className={`mt-3 text-sm ${
                    payoutMsg.startsWith('M-Pesa') || payoutMsg.includes('saved')
                      ? isDarkMode
                        ? 'text-emerald-400'
                        : 'text-emerald-700'
                      : isDarkMode
                        ? 'text-red-400'
                        : 'text-red-600'
                  }`}
                >
                  {payoutMsg}
                </p>
              )}
              {recipientOk && (
                <p className={`mt-2 text-xs ${isDarkMode ? 'text-emerald-400/90' : 'text-emerald-700'}`}>
                  Linked with Paystack for transfers.
                </p>
              )}
              <button
                type="button"
                disabled={payoutLoading}
                onClick={handleSaveMpesa}
                className="mt-4 w-full sm:w-auto px-6 py-3 rounded-lg bg-[#C7A667] text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {payoutLoading ? 'Saving…' : 'Save M-Pesa number'}
              </button>
            </div>

            <div className={cardClass}>
              <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Withdraw to M-Pesa
              </h2>
              <p className={`text-sm mb-4 ${labelMuted}`}>
                Amount cannot exceed your in-app available balance. The transfer itself is sent from your Paystack
                business balance (the same account that receives guest payments); Paystack may require OTP for some
                transfers.
              </p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[140px]">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white/90' : 'text-gray-800'}`}>
                    Amount (KES)
                    {balance != null && (
                      <span className={`font-normal ${labelMuted}`}>
                        {' '}
                        · max {kesFromMinor(balance.availableMinor)}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min={balance != null && balance.availableMinor > 0 ? 0.01 : 1}
                    max={
                      balance != null
                        ? balance.availableMinor / KES_PAYSTACK_SUBUNITS_PER_UNIT
                        : undefined
                    }
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => {
                      setWithdrawAmount(e.target.value);
                      setWithdrawMsg(null);
                    }}
                    aria-invalid={withdrawAmountHasError}
                    className={`${inputClass} ${
                      withdrawAmountHasError
                        ? isDarkMode
                          ? 'border-red-400/80 ring-1 ring-red-400/25'
                          : 'border-red-500 ring-1 ring-red-200'
                        : withdrawValidation.state === 'ok'
                          ? isDarkMode
                            ? 'border-emerald-500/45'
                            : 'border-emerald-500/70'
                          : ''
                    }`}
                  />
                  {withdrawAmount.trim() !== '' && withdrawValidation.state !== 'empty' && (
                    <div className="mt-2 space-y-1 text-sm" role="status" aria-live="polite">
                      {withdrawAmountHasError && 'message' in withdrawValidation && (
                        <p className={isDarkMode ? 'text-red-400' : 'text-red-600'}>{withdrawValidation.message}</p>
                      )}
                      {withdrawValidation.state === 'ok' && balance != null && (
                        <p className={isDarkMode ? 'text-emerald-400/90' : 'text-emerald-700'}>
                          Within available balance
                          {balance.availableMinor > withdrawValidation.amountMinor
                            ? ` · ${kesFromMinor(balance.availableMinor - withdrawValidation.amountMinor)} left after this withdrawal`
                            : ''}
                          .
                        </p>
                      )}
                    </div>
                  )}
                  {withdrawAmount.trim() === '' && balance != null && (
                    <p className={`mt-2 text-sm ${labelMuted}`}>
                      Available to withdraw: {kesFromMinor(balance.availableMinor)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!canSubmitWithdraw}
                  onClick={handleWithdraw}
                  className="px-6 py-3 rounded-lg bg-[#C7A667] text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawLoading ? 'Submitting…' : 'Request withdrawal'}
                </button>
              </div>
              {withdrawMsg && (
                <p className={`mt-3 text-sm ${isDarkMode ? 'text-white/80' : 'text-gray-700'}`}>{withdrawMsg}</p>
              )}
            </div>
          </div>

          <div className={cardClass}>
            <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Activity
            </h2>
            {activity.length === 0 ? (
              <p className={labelMuted}>No earnings or withdrawals yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`text-left border-b ${isDarkMode ? 'border-white/10 text-white/50' : 'border-gray-200 text-gray-500'}`}>
                      <th className="pb-2 pr-3 font-medium">Type</th>
                      <th className="pb-2 pr-3 font-medium">Date</th>
                      <th className="pb-2 pr-3 font-medium">Amount</th>
                      <th className="pb-2 pr-3 font-medium">Status</th>
                      <th className="pb-2 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.map((row) => (
                      <tr key={row.key} className={`border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                        <td className="py-3 pr-3">
                          <span className="inline-flex items-center gap-1.5">
                            {row.kind === 'earning' ? (
                              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-amber-500" />
                            )}
                            {row.label}
                          </span>
                        </td>
                        <td className="py-3 pr-3 whitespace-nowrap">{new Date(row.at).toLocaleString()}</td>
                        <td className="py-3 pr-3">
                          {row.kind === 'earning' && row.status !== 'success'
                            ? '—'
                            : kesFromMinor(row.amountMinor)}
                        </td>
                        <td className="py-3 pr-3 capitalize">{row.status.replace(/_/g, ' ')}</td>
                        <td className="py-3 text-xs max-w-[220px] truncate" title={row.detail}>
                          {row.detail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default WalletPage;
