// Server-side Paystack verify for short-stay booking_payments (no polling loop in UI — call after checkout).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  reference: string;
  booking_payment_id: string;
  email: string;
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

    const body = (await req.json()) as Body;
    const { reference, booking_payment_id, email } = body;
    if (!reference || !booking_payment_id || !email) {
      return new Response(
        JSON.stringify({ error: "reference, booking_payment_id, and email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: row, error: rowErr } = await supabaseClient
      .from("booking_payments")
      .select("id, paystack_reference, customer_email, status")
      .eq("id", booking_payment_id)
      .eq("paystack_reference", reference)
      .single();

    if (rowErr || !row) {
      return new Response(JSON.stringify({ error: "Booking payment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if ((row.customer_email || "").toLowerCase().trim() !== email.toLowerCase().trim()) {
      return new Response(JSON.stringify({ error: "Email does not match this payment" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (row.status === "success") {
      return new Response(
        JSON.stringify({ success: true, status: "success", already_confirmed: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      return new Response(JSON.stringify({ error: "Paystack not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackSecretKey}` } },
    );
    const verifyJson = await verifyRes.json();
    const tx = verifyJson.data;

    if (!verifyJson.status || tx?.status !== "success") {
      return new Response(
        JSON.stringify({
          success: false,
          status: tx?.status || "unknown",
          message: verifyJson.message,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    await supabaseClient
      .from("booking_payments")
      .update({
        status: "success",
        amount_paid_minor: tx.amount,
        paid_at: tx.paid_at ? new Date(tx.paid_at).toISOString() : new Date().toISOString(),
      })
      .eq("id", row.id);

    return new Response(
      JSON.stringify({ success: true, status: "success" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("verify-booking-payment:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
