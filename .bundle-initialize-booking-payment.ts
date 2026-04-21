// Initialize Paystack charge for short-stay booking; persists row in booking_payments (not campaign payments).
// Guests may be anonymous: Authorization optional; apikey required.

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

function bookingReference(): string {
  const id = crypto.randomUUID().replace(/-/g, "");
  return `bk_${id}`;
}

interface InitBody {
  property_id: string;
  amount_kes: number;
  email: string;
  customer_name?: string;
  check_in?: string;
  check_out?: string;
  nights?: number;
  guests?: number;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    let payerUserId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      if (user) payerUserId = user.id;
    }

    const body = (await req.json()) as InitBody;
    const {
      property_id,
      amount_kes,
      email,
      customer_name,
      check_in,
      check_out,
      nights,
      guests,
      metadata = {},
    } = body;

    if (!property_id || !amount_kes || amount_kes <= 0 || !email) {
      return new Response(
        JSON.stringify({ error: "Missing property_id, amount_kes, or email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: property, error: propErr } = await supabaseClient
      .from("properties")
      .select("id, developer_id, property_type, title, status")
      .eq("id", property_id)
      .single();

    if (propErr || !property) {
      return new Response(JSON.stringify({ error: "Property not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ptype = (property.property_type || "").toLowerCase();
    if (ptype !== "short stay") {
      return new Response(
        JSON.stringify({ error: "Property is not a short stay listing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (property.status !== "active") {
      return new Response(JSON.stringify({ error: "Listing is not active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hostId = property.developer_id as string;

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      return new Response(JSON.stringify({ error: "Paystack not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const feeRate = parseFloat(Deno.env.get("BOOKING_PLATFORM_FEE_RATE") ?? "0");
    const amountMinor = kesAmountToPaystackSubunits(amount_kes);
    if (!Number.isFinite(amountMinor) || amountMinor < 1) {
      return new Response(JSON.stringify({ error: "Invalid amount_kes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const platformFeeMinor = Math.round(amountMinor * Math.max(0, Math.min(feeRate, 1)));
    const hostNetMinor = Math.max(0, amountMinor - platformFeeMinor);

    const reference = bookingReference();
    const siteUrl = Deno.env.get("SITE_URL") ?? "";

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountMinor,
          reference,
          currency: "KES",
          callback_url: siteUrl ? `${siteUrl}/short-stays` : undefined,
          metadata: {
            type: "short_stay_booking",
            booking_reference: reference,
            property_id,
            host_id: hostId,
            check_in,
            check_out,
            nights,
            guests,
            ...metadata,
          },
        }),
      },
    );

    const paystackData = await paystackResponse.json();
    if (!paystackData.status || !paystackData.data) {
      return new Response(
        JSON.stringify({
          error: "Failed to initialize Paystack transaction",
          details: paystackData.message,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: row, error: insertErr } = await supabaseClient
      .from("booking_payments")
      .insert({
        property_id,
        host_id: hostId,
        payer_user_id: payerUserId,
        paystack_reference: reference,
        amount_requested_minor: amountMinor,
        platform_fee_minor: platformFeeMinor,
        host_net_minor: hostNetMinor,
        currency: "KES",
        status: "pending",
        customer_email: email,
        customer_name: customer_name ?? null,
        metadata: {
          check_in,
          check_out,
          nights,
          guests,
          ...metadata,
        },
      })
      .select("id")
      .single();

    if (insertErr || !row) {
      console.error("booking_payments insert:", insertErr);
      return new Response(
        JSON.stringify({ error: "Failed to create booking payment record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        booking_payment: {
          id: row.id,
          reference,
          access_code: paystackData.data.access_code,
          authorization_url: paystackData.data.authorization_url,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("initialize-booking-payment:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
