// Webhook for Paystack transfer.* events (success / failed / reversed). No polling.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const event = JSON.parse(payload);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const ev = event.event as string;
    const data = event.data as Record<string, unknown> | undefined;
    const reference = data?.reference as string | undefined;

    if (!reference) {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (ev === "transfer.success") {
      await supabaseClient
        .from("host_transfers")
        .update({
          status: "success",
          paystack_transfer_code: (data?.transfer_code as string) ?? undefined,
          failure_reason: null,
          metadata: { last_webhook: event },
        })
        .eq("transfer_reference", reference);
    } else if (ev === "transfer.failed" || ev === "transfer.reversed") {
      await supabaseClient
        .from("host_transfers")
        .update({
          status: "failed",
          failure_reason:
            (data?.failures as string) ||
            (data?.message as string) ||
            ev,
          metadata: { last_webhook: event },
        })
        .eq("transfer_reference", reference);
    } else {
      console.log("paystack-transfer-webhook: ignored event", ev);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("paystack-transfer-webhook:", e);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
