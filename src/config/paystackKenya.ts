/**
 * Kenya M-Pesa (individual) on Paystack Transfers.
 * @see docs/paystack/transfers/createTransferRecipient.md — "MPESA for individual Mpesa users"
 * List telcos: GET https://api.paystack.co/bank?currency=KES&type=mobile_money
 */
export const KES_INDIVIDUAL_MPESA_PAYSTACK_BANK_CODE = 'MPESA' as const;

export function defaultKesMobileMoneyBankCode(): string {
  const fromEnv = import.meta.env.VITE_PAYSTACK_KES_MOBILE_MONEY_BANK_CODE as string | undefined;
  return (fromEnv && fromEnv.trim()) || KES_INDIVIDUAL_MPESA_PAYSTACK_BANK_CODE;
}
