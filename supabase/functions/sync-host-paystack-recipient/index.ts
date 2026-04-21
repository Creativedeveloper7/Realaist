// Create/update Paystack transfer recipient (M-Pesa mobile_money, KES) from host profile fields.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  mpesa_phone?: string;
  account_holder_name?: string;
  mpesa_provider_code?: string;
}

/** Canonical storage form: 254 + 9 national digits (12 chars), e.g. 254712345678 */
function normalizeKenyaMsisdn(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) {
    const national = digits.slice(3);
    return national.length >= 9 ? `254${national.slice(0, 9)}` : digits;
  }
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

/**
 * Paystack Kenya M-Pesa transferrecipient expects local MSISDN, not international.
 * @see docs/paystack/transfers/createTransferRecipient.md — Kenya example uses "0751234987"
 */
function paystackKenyaMpesaAccountNumber(canonical254: string): string {
  const digits = canonical254.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length >= 12) {
    const national = digits.slice(3, 12);
    return national.length === 9 ? `0${national}` : digits;
  }
  if (digits.startsWith("0") && digits.length === 10) return digits;
  if (digits.length === 9) return `0${digits}`;
  return digits;
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

    const body = (await req.json().catch(() => ({}))) as Body;
    const defaultBank = Deno.env.get("PAYSTACK_KES_MOBILE_MONEY_BANK_CODE") ?? "";
    const payoutCurrency = Deno.env.get("HOST_PAYOUT_CURRENCY") ?? "KES";

    const { data: existing } = await supabaseClient
      .from("host_payment_profiles")
      .select("*")
      .eq("host_id", user.id)
      .maybeSingle();

    const mpesa_phone = normalizeKenyaMsisdn(
      body.mpesa_phone ?? existing?.mpesa_phone ?? "",
    );
    const account_holder_name =
      (body.account_holder_name ?? existing?.account_holder_name ?? "").trim();
    const mpesa_provider_code =
      (body.mpesa_provider_code ?? existing?.mpesa_provider_code ?? defaultBank).trim();

    if (!/^254\d{9}$/.test(mpesa_phone)) {
      return new Response(JSON.stringify({ error: "Valid Kenya M-Pesa phone required (e.g. 07… or +254…)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paystackAccountNumber = paystackKenyaMpesaAccountNumber(mpesa_phone);
    if (!/^0\d{9}$/.test(paystackAccountNumber)) {
      return new Response(JSON.stringify({ error: "Could not format phone for Paystack (expected 10-digit local 0…)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!account_holder_name) {
      return new Response(JSON.stringify({ error: "Account holder name required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!mpesa_provider_code) {
      return new Response(
        JSON.stringify({
          error:
            "M-Pesa provider code missing. Set host profile or PAYSTACK_KES_MOBILE_MONEY_BANK_CODE (from Paystack GET /bank?currency=KES&type=mobile_money).",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      return new Response(JSON.stringify({ error: "Paystack not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "mobile_money",
        name: account_holder_name,
        account_number: paystackAccountNumber,
        bank_code: mpesa_provider_code,
        currency: payoutCurrency,
      }),
    });

    const recipientJson = await recipientRes.json();
    if (!recipientJson.status || !recipientJson.data?.recipient_code) {
      console.error("Paystack transferrecipient:", recipientJson);
      return new Response(
        JSON.stringify({
          error: "Paystack could not create recipient",
          details: recipientJson.message,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const recipientCode = recipientJson.data.recipient_code as string;

    const { error: upsertErr } = await supabaseClient
      .from("host_payment_profiles")
      .upsert(
        {
          host_id: user.id,
          mpesa_phone,
          account_holder_name,
          mpesa_provider_code,
          paystack_recipient_code: recipientCode,
          payout_currency: payoutCurrency,
        },
        { onConflict: "host_id" },
      );

    if (upsertErr) {
      console.error("host_payment_profiles upsert:", upsertErr);
      return new Response(JSON.stringify({ error: "Failed to save payment profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        paystack_recipient_code: recipientCode,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("sync-host-paystack-recipient:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
