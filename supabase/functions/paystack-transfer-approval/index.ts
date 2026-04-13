// Paystack Transfer Approval URL (Dashboard → Settings → Transfer Approval).
// Validates reference + amount against host_transfers before Paystack debits platform balance.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function pickReference(body: Record<string, unknown>): string | undefined {
  const d = body.data as Record<string, unknown> | undefined;
  return (
    (typeof body.reference === "string" && body.reference) ||
    (d && typeof d.reference === "string" && d.reference) ||
    undefined
  );
}

function pickAmountMinor(body: Record<string, unknown>): number | undefined {
  const d = body.data as Record<string, unknown> | undefined;
  const raw = body.amount ?? d?.amount;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const raw = await req.text();
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return new Response(JSON.stringify({}), { status: 400 });
    }

    const reference = pickReference(body);
    const amountMinor = pickAmountMinor(body);

    if (!reference || amountMinor === undefined) {
      console.warn("transfer-approval: missing reference or amount", { reference, amountMinor });
      return new Response(JSON.stringify({}), { status: 400 });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: row, error } = await supabaseClient
      .from("host_transfers")
      .select("id, amount_minor, status, transfer_reference")
      .eq("transfer_reference", reference)
      .maybeSingle();

    if (error || !row) {
      console.warn("transfer-approval: unknown reference", reference);
      return new Response(JSON.stringify({}), { status: 400 });
    }

    if (Number(row.amount_minor) !== amountMinor) {
      console.warn("transfer-approval: amount mismatch", {
        expected: row.amount_minor,
        got: amountMinor,
      });
      return new Response(JSON.stringify({}), { status: 400 });
    }

    const okStatus = ["pending", "queued", "processing", "otp_required"];
    if (!okStatus.includes(row.status)) {
      console.warn("transfer-approval: invalid status", row.status);
      return new Response(JSON.stringify({}), { status: 400 });
    }

    // Do not mutate row here — avoids racing initiate-host-transfer status updates.
    // Approval is validation-only; Paystack proceeds on HTTP 200.

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("paystack-transfer-approval:", e);
    return new Response(JSON.stringify({}), { status: 400 });
  }
});
