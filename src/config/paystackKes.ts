/**
 * Paystack represents KES in API bodies as integer **subunits** (cents): `amount = KES × this`.
 * Keep in sync with `supabase/functions/_shared/paystackKesAmounts.ts`.
 */
export const KES_PAYSTACK_SUBUNITS_PER_UNIT = 100 as const;
