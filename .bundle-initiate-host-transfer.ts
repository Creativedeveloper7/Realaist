// Host withdrawal: create host_transfers row with UUID v4 reference, call Paystack Transfer API (source: balance).
//
// Paystack Initiate Transfer (docs/paystack/transfers/paystackSIngleTransfer.md):
// - source: "balance", recipient: saved RCP_* from M-Pesa mobile_money recipient
// - amount: KES **cents** (subunits) — same rule as charges: multiply KES × 100 (Paystack docs: KES uses cent)
// - currency: "KES" (required; API defaults to NGN if omitted — wrong default for M-Pesa)
// - reference: unique, 16–50 chars, lowercase a-z / digits / - / _
//
// IMPORTANT: `source: "balance"` withdraws from your **Paystack business KES balance** (Dashboard), not from
// our Supabase ledger. Guest charges must settle into that same Paystack account with enough **KES** liquid
// for payout; otherwise Paystack returns “insufficient balance” even when in-app earnings look fine.
//
// Reserve statuses must match TRANSFER_RESERVE_STATUSES in src/services/hostPayoutService.ts.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Paystack KES amount rules (charges + transfers):
 * - API `amount` is always in **currency subunits** (KES **cents**): integer = whole KES × 100.
 * - Same convention as `amount` in Initialize Transaction and Initiate Transfer
 *   (see docs/paystack/transfers/paystackSIngleTransfer.md — body uses integer subunits).
 *
 * Our ledger columns `*_minor` / `host_net_minor` store these same integers so withdrawals
 * can pass `amount` to Paystack without rescaling drift.
 */

const KES_SUBUNITS_PER_UNIT = 100;

/** Convert a decimal KES value from user/API input to Paystack subunits (integer). */
function kesAmountToPaystackSubunits(amountKes: number): number {
  if (!Number.isFinite(amountKes)) return NaN;
  return Math.round(amountKes * KES_SUBUNITS_PER_UNIT);
}

type WithdrawalBody = {
  amount_minor?: unknown;
  amount_kes?: unknown;
};

/**
 * Resolve withdrawal size for host transfers: prefer integer `amount_minor` (matches UI + ledger);
 * fall back to `amount_kes` with the same rounding as booking flows.
 */
function resolveWithdrawalAmountMinor(
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


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Amounts held against wallet until excluded from available (mirror frontend reserve list). */
const HOST_TRANSFER_RESERVE_STATUSES = [
  "pending",
  "queued",
  "processing",
  "success",
  "otp_required",
] as const;

/** Paystack transfer reference: UUID v4 (lowercase hex + hyphens; meets Paystack reference rules). */
function transferReference(): string {
  return crypto.randomUUID().toLowerCase();
}

/** Paystack error envelope (common fields). */
function paystackHintForMessage(message: string, code?: string): string | undefined {
  const m = message.toLowerCase();
  const c = (code ?? "").toLowerCase();
  const looksLikeBalance =
    m.includes("insufficient") && m.includes("balance") ||
    m.includes("not enough") ||
    m.includes("do not have enough") ||
    c.includes("insufficient") ||
    c === "insufficient_funds";
  if (!looksLikeBalance) return undefined;
  return (
    "Paystack rejected this based on your Paystack KES transfer balance (money available for disbursement in " +
    "that currency), not your in-app wallet. Guest charges must settle into the same Paystack business as this " +
    "integration’s secret key, with enough KES liquid for payouts (check Paystack Dashboard balance by currency)."
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({})) as {
      amount_minor?: unknown;
      amount_kes?: unknown;
      reason?: string;
    };

    const resolved = resolveWithdrawalAmountMinor(body);
    if (!resolved.ok) {
      return new Response(JSON.stringify({ error: resolved.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const amountMinor = resolved.amountMinor;

    const reasonStr = typeof body.reason === "string" ? body.reason.trim() : "";
    const payoutReason = reasonStr || "Host payout";

    const { data: profile } = await supabaseClient
      .from("host_payment_profiles")
      .select("paystack_recipient_code, payout_currency")
      .eq("host_id", user.id)
      .maybeSingle();

    if (!profile?.paystack_recipient_code) {
      return new Response(
        JSON.stringify({
          error: "Complete payout profile and register M-Pesa with Paystack first",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: creditSum } = await supabaseClient
      .from("booking_payments")
      .select("host_net_minor")
      .eq("host_id", user.id)
      .eq("status", "success");

    const credits = (creditSum ?? []).reduce(
      (s, r) => s + Number(r.host_net_minor ?? 0),
      0,
    );

    const { data: debitRows } = await supabaseClient
      .from("host_transfers")
      .select("amount_minor, status")
      .eq("host_id", user.id)
      .in("status", [...HOST_TRANSFER_RESERVE_STATUSES]);

    const reserved = (debitRows ?? []).reduce(
      (s, r) => s + Number(r.amount_minor ?? 0),
      0,
    );

    const available = Math.max(0, credits - reserved);
    if (amountMinor > available) {
      return new Response(
        JSON.stringify({
          error:
            "Withdrawal exceeds your in-app available amount (earnings minus pending or completed withdrawals).",
          error_code: "insufficient_ledger",
          available_kes: available / 100,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const reference = transferReference();
    const currency = profile.payout_currency || "KES";

    const { data: transferRow, error: insertErr } = await supabaseClient
      .from("host_transfers")
      .insert({
        host_id: user.id,
        amount_minor: amountMinor,
        currency,
        transfer_reference: reference,
        recipient_code_snapshot: profile.paystack_recipient_code,
        status: "pending",
        reason: payoutReason,
        metadata: {},
      })
      .select("id")
      .single();

    if (insertErr || !transferRow) {
      console.error("host_transfers insert:", insertErr);
      return new Response(JSON.stringify({ error: "Could not create transfer request" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      await supabaseClient.from("host_transfers").update({
        status: "failed",
        failure_reason: "Paystack not configured",
      }).eq("id", transferRow.id);
      return new Response(JSON.stringify({ error: "Paystack not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      // amount: KES subunits (integer), identical to booking_payments.host_net_minor units
      body: JSON.stringify({
        source: "balance",
        amount: amountMinor,
        reference,
        recipient: profile.paystack_recipient_code,
        reason: payoutReason,
        currency,
      }),
    });

    const transferJson = await transferRes.json() as {
      status?: boolean;
      message?: string;
      code?: string;
      data?: Record<string, unknown>;
    };

    const data = transferJson.data;

    if (!transferRes.ok || !transferJson.status || !data) {
      console.error("Paystack POST /transfer failed:", {
        http_status: transferRes.status,
        body: transferJson,
      });
    }

    if (!transferJson.status || !data) {
      const msg = transferJson.message || "Paystack transfer rejected";
      const hint = paystackHintForMessage(msg, transferJson.code);

      await supabaseClient.from("host_transfers").update({
        status: "failed",
        failure_reason: msg,
      }).eq("id", transferRow.id);

      return new Response(
        JSON.stringify({
          error: msg,
          error_code: "paystack",
          paystack_code: transferJson.code ?? null,
          hint,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const nextStatus =
      data.status === "otp"
        ? "otp_required"
        : data.status === "success" || data.status === "pending"
        ? "queued"
        : "processing";

    await supabaseClient
      .from("host_transfers")
      .update({
        status: nextStatus,
        paystack_transfer_code: data.transfer_code ?? null,
        paystack_transfer_numeric_id: typeof data.id === "number" ? data.id : null,
        metadata: { paystack_response: data },
      })
      .eq("id", transferRow.id);

    return new Response(
      JSON.stringify({
        success: true,
        transfer_id: transferRow.id,
        reference,
        paystack_status: data.status,
        transfer_code: data.transfer_code,
        requires_otp: data.status === "otp",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("initiate-host-transfer:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
