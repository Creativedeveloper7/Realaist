// Host withdrawal: create host_transfers row with UUID v4 reference, call Paystack Transfer API (source: balance).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Paystack transfer reference: UUID v4 per product requirement */
function transferReference(): string {
  return crypto.randomUUID();
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

    const { amount_kes, reason } = await req.json() as {
      amount_kes?: number;
      reason?: string;
    };

    if (!amount_kes || amount_kes <= 0) {
      return new Response(JSON.stringify({ error: "amount_kes required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountMinor = Math.round(amount_kes * 100);

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
      .in("status", ["pending", "queued", "processing", "success", "otp_required"]);

    const reserved = (debitRows ?? []).reduce(
      (s, r) => s + Number(r.amount_minor ?? 0),
      0,
    );

    const available = credits - reserved;
    if (amountMinor > available) {
      return new Response(
        JSON.stringify({
          error: "Insufficient available balance",
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
        reason: reason ?? "Host payout",
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
      body: JSON.stringify({
        source: "balance",
        amount: amountMinor,
        reference,
        recipient: profile.paystack_recipient_code,
        reason: reason ?? "Host payout",
        currency,
      }),
    });

    const transferJson = await transferRes.json();
    const data = transferJson.data;

    if (!transferJson.status || !data) {
      await supabaseClient.from("host_transfers").update({
        status: "failed",
        failure_reason: transferJson.message || "Paystack transfer rejected",
      }).eq("id", transferRow.id);

      return new Response(
        JSON.stringify({
          error: transferJson.message || "Transfer failed",
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
