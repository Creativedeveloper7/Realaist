/**
 * Paystack KES amount rules (charges + transfers):
 * - API `amount` is always in **currency subunits** (KES **cents**): integer = whole KES × 100.
 * - Same convention as `amount` in Initialize Transaction and Initiate Transfer
 *   (see docs/paystack/transfers/paystackSIngleTransfer.md — body uses integer subunits).
 *
 * Our ledger columns `*_minor` / `host_net_minor` store these same integers so withdrawals
 * can pass `amount` to Paystack without rescaling drift.
 */

export const KES_SUBUNITS_PER_UNIT = 100;

/** Convert a decimal KES value from user/API input to Paystack subunits (integer). */
export function kesAmountToPaystackSubunits(amountKes: number): number {
  if (!Number.isFinite(amountKes)) return NaN;
  return Math.round(amountKes * KES_SUBUNITS_PER_UNIT);
}

export type WithdrawalBody = {
  amount_minor?: unknown;
  amount_kes?: unknown;
};

/**
 * Resolve withdrawal size for host transfers: prefer integer `amount_minor` (matches UI + ledger);
 * fall back to `amount_kes` with the same rounding as booking flows.
 */
export function resolveWithdrawalAmountMinor(
  body: WithdrawalBody,
): { ok: true; amountMinor: number } | { ok: false; error: string } {
  if (body.amount_minor !== undefined && body.amount_minor !== null) {
    const n =
      typeof body.amount_minor === "number"
        ? body.amount_minor
        : typeof body.amount_minor === "string"
        ? Number(body.amount_minor)
        : NaN;
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
      return {
        ok: false,
        error: "amount_minor must be a positive integer (KES cents, same as ledger)",
      };
    }
    return { ok: true, amountMinor: n };
  }

  const amount_kes =
    typeof body.amount_kes === "number"
      ? body.amount_kes
      : typeof body.amount_kes === "string"
      ? Number(body.amount_kes)
      : NaN;

  if (!Number.isFinite(amount_kes) || amount_kes <= 0 || amount_kes > 1e9) {
    return { ok: false, error: "Provide amount_minor (preferred) or valid amount_kes" };
  }

  const minor = kesAmountToPaystackSubunits(amount_kes);
  if (!Number.isFinite(minor) || minor < 1) {
    return { ok: false, error: "Amount too small after conversion to KES subunits" };
  }

  return { ok: true, amountMinor: minor };
}
