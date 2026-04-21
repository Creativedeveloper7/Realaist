import { supabase } from '../lib/supabase';
import { bookingAndPayoutEndpoints } from '../config/payments';
import { defaultKesMobileMoneyBankCode } from '../config/paystackKenya';

export type WalletUserLike = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  companyName?: string | null;
  userType?: string | null;
};

/** Name sent to Paystack transferrecipient (required by API). */
export function resolvePaystackRecipientDisplayName(u: WalletUserLike): string {
  if (u.userType === 'developer') {
    const co = (u.companyName || '').trim();
    if (co) return co;
  }
  const full = `${u.firstName || ''} ${u.lastName || ''}`.trim();
  if (full) return full;
  const email = (u.email || '').split('@')[0]?.trim();
  if (email) return email;
  return 'Account holder';
}

export interface HostWalletBalance {
  totalEarnedMinor: number;
  reservedMinor: number;
  availableMinor: number;
}

export interface BookingPaymentLedgerRow {
  id: string;
  paystack_reference: string;
  status: string;
  amount_requested_minor: number;
  host_net_minor: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
  property_id: string;
  properties?: { title: string | null } | null;
}

export interface HostTransferLedgerRow {
  id: string;
  transfer_reference: string;
  amount_minor: number;
  currency: string;
  status: string;
  reason: string | null;
  failure_reason: string | null;
  created_at: string;
}

export interface PayerBookingPaymentRow {
  id: string;
  paystack_reference: string;
  status: string;
  amount_requested_minor: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
  property_id: string;
  properties?: { title: string | null } | null;
}

export interface HostPaymentProfileRow {
  host_id: string;
  mpesa_phone: string;
  account_holder_name: string | null;
  mpesa_provider_code: string | null;
  paystack_recipient_code: string | null;
  payout_currency: string;
}

export async function fetchHostPaymentProfile(): Promise<HostPaymentProfileRow | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('host_payment_profiles')
    .select('*')
    .eq('host_id', user.id)
    .maybeSingle();
  if (error) {
    console.error('fetchHostPaymentProfile', error);
    return null;
  }
  return data as HostPaymentProfileRow | null;
}

export async function upsertHostPaymentProfile(fields: {
  mpesa_phone: string;
  account_holder_name: string;
  mpesa_provider_code?: string | null;
}): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const { error } = await supabase.from('host_payment_profiles').upsert(
    {
      host_id: user.id,
      mpesa_phone: fields.mpesa_phone.replace(/\s/g, ''),
      account_holder_name: fields.account_holder_name.trim(),
      mpesa_provider_code: fields.mpesa_provider_code?.trim() || null,
      payout_currency: 'KES',
    },
    { onConflict: 'host_id' }
  );

  return { error: error?.message ?? null };
}

/** Keep in sync with HOST_TRANSFER_RESERVE_STATUSES in initiate-host-transfer edge function. */
const TRANSFER_RESERVE_STATUSES = [
  'pending',
  'queued',
  'processing',
  'success',
  'otp_required',
] as const;

export async function fetchHostWalletBalance(): Promise<HostWalletBalance | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: credits, error: e1 } = await supabase
    .from('booking_payments')
    .select('host_net_minor')
    .eq('host_id', user.id)
    .eq('status', 'success');
  if (e1) {
    console.error('fetchHostWalletBalance credits', e1);
    return null;
  }

  const { data: debits, error: e2 } = await supabase
    .from('host_transfers')
    .select('amount_minor')
    .eq('host_id', user.id)
    .in('status', [...TRANSFER_RESERVE_STATUSES]);
  if (e2) {
    console.error('fetchHostWalletBalance debits', e2);
    return null;
  }

  const totalEarnedMinor = (credits ?? []).reduce((s, r) => s + Number(r.host_net_minor ?? 0), 0);
  const reservedMinor = (debits ?? []).reduce((s, r) => s + Number(r.amount_minor ?? 0), 0);
  return {
    totalEarnedMinor,
    reservedMinor,
    availableMinor: Math.max(0, totalEarnedMinor - reservedMinor),
  };
}

export async function fetchHostBookingPaymentsLedger(
  limit = 40
): Promise<BookingPaymentLedgerRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('booking_payments')
    .select(
      'id, paystack_reference, status, amount_requested_minor, host_net_minor, currency, paid_at, created_at, property_id, properties(title)'
    )
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('fetchHostBookingPaymentsLedger', error);
    return [];
  }
  return (data ?? []) as BookingPaymentLedgerRow[];
}

export async function fetchHostTransfersLedger(limit = 40): Promise<HostTransferLedgerRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('host_transfers')
    .select('id, transfer_reference, amount_minor, currency, status, reason, failure_reason, created_at')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('fetchHostTransfersLedger', error);
    return [];
  }
  return (data ?? []) as HostTransferLedgerRow[];
}

export async function fetchPayerBookingPayments(limit = 40): Promise<PayerBookingPaymentRow[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('booking_payments')
    .select(
      'id, paystack_reference, status, amount_requested_minor, currency, paid_at, created_at, property_id, properties(title)'
    )
    .eq('payer_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('fetchPayerBookingPayments', error);
    return [];
  }
  return (data ?? []) as PayerBookingPaymentRow[];
}

/**
 * Saves M-Pesa number, applies Kenya individual M-Pesa Paystack bank code (see paystackKenya config),
 * then creates/updates the Paystack transfer recipient via Edge Function.
 */
export async function saveMpesaNumberAndSyncPaystackRecipient(
  mpesaPhone: string,
  walletUser: WalletUserLike
): Promise<{ success: boolean; error?: string; recipientCode?: string }> {
  const normalized = mpesaPhone.replace(/\s/g, '');
  if (!normalized || normalized.length < 9) {
    return { success: false, error: 'Enter a valid M-Pesa number.' };
  }

  const accountHolderName = resolvePaystackRecipientDisplayName(walletUser);
  const mpesaProviderCode = defaultKesMobileMoneyBankCode();

  const { error: upErr } = await upsertHostPaymentProfile({
    mpesa_phone: normalized,
    account_holder_name: accountHolderName,
    mpesa_provider_code: mpesaProviderCode,
  });
  if (upErr) {
    return { success: false, error: upErr };
  }

  const sync = await syncHostPaystackRecipient({
    mpesa_phone: normalized,
    account_holder_name: accountHolderName,
    mpesa_provider_code: mpesaProviderCode,
  });
  if (!sync.success) {
    return { success: false, error: sync.error };
  }
  return { success: true, recipientCode: sync.recipientCode };
}

export async function syncHostPaystackRecipient(body?: {
  mpesa_phone?: string;
  account_holder_name?: string;
  mpesa_provider_code?: string;
}): Promise<{ success: boolean; error?: string; recipientCode?: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not signed in' };

  const res = await fetch(`${supabaseUrl}${bookingAndPayoutEndpoints.syncHostPaystackRecipient}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify(body ?? {}),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, error: json.error || json.details || 'Sync failed' };
  }
  return { success: true, recipientCode: json.paystack_recipient_code };
}

/**
 * Withdraw to M-Pesa: send `amount_minor` (KES cents) so the Edge call matches ledger + Paystack `amount`
 * without float rescaling (see docs/paystack/transfers/paystackSIngleTransfer.md).
 */
export async function initiateHostTransfer(params: {
  amount_minor: number;
  reason?: string;
}): Promise<{
  success: boolean;
  error?: string;
  hint?: string;
  errorCode?: string;
  availableKes?: number;
  requiresOtp?: boolean;
  transferCode?: string;
  reference?: string;
}> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not signed in' };

  if (
    !Number.isFinite(params.amount_minor) ||
    params.amount_minor <= 0 ||
    !Number.isInteger(params.amount_minor)
  ) {
    return { success: false, error: 'Invalid withdrawal amount' };
  }

  const res = await fetch(`${supabaseUrl}${bookingAndPayoutEndpoints.initiateHostTransfer}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({
      amount_minor: params.amount_minor,
      reason: params.reason,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    error?: string;
    hint?: string;
    error_code?: string;
    available_kes?: number;
    requires_otp?: boolean;
    transfer_code?: string;
    reference?: string;
  };

  if (!res.ok) {
    return {
      success: false,
      error: json.error || 'Transfer failed',
      hint: json.hint,
      errorCode: json.error_code,
      availableKes:
        typeof json.available_kes === 'number' ? json.available_kes : undefined,
    };
  }

  return {
    success: true,
    requiresOtp: json.requires_otp,
    transferCode: json.transfer_code,
    reference: json.reference,
  };
}
