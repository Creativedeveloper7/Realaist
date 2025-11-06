// Supabase Edge Function: Verify Paystack Payment
// This function verifies the status of a Paystack transaction

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  reference: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: VerifyPaymentRequest = await req.json();
    const { reference } = body;

    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Missing reference" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*, campaigns(*)")
      .eq("paystack_reference", reference)
      .eq("user_id", user.id)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Paystack secret key
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      return new Response(
        JSON.stringify({ error: "Paystack configuration missing" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify transaction with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || !verifyData.data) {
      return new Response(
        JSON.stringify({
          error: "Failed to verify payment",
          details: verifyData.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const transaction = verifyData.data;

    // Verify amount matches
    if (transaction.amount !== payment.amount_requested) {
      return new Response(
        JSON.stringify({
          error: "Amount mismatch",
          expected: payment.amount_requested,
          received: transaction.amount,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update payment status
    const paymentStatus =
      transaction.status === "success" ? "success" : "failed";
    const updateData: any = {
      status: paymentStatus,
      amount_paid: transaction.amount,
      payment_method: transaction.channel,
      payment_channel: transaction.channel,
    };

    if (transaction.status === "success" && transaction.paid_at) {
      updateData.paid_at = new Date(transaction.paid_at).toISOString();
    }

    const { data: updatedPayment, error: updateError } = await supabaseClient
      .from("payments")
      .update(updateData)
      .eq("id", payment.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating payment:", updateError);
    }

    // If payment successful, update campaign payment status
    if (transaction.status === "success" && updatedPayment) {
      await supabaseClient
        .from("campaigns")
        .update({
          payment_id: updatedPayment.id,
          payment_status: "success",
        })
        .eq("id", payment.campaign_id);
    }

    return new Response(
      JSON.stringify({
        success: transaction.status === "success",
        payment: {
          id: updatedPayment?.id || payment.id,
          status: paymentStatus,
          reference: payment.paystack_reference,
          amount: transaction.amount,
          amount_paid: transaction.amount,
          currency: transaction.currency,
          paid_at: transaction.paid_at,
          channel: transaction.channel,
        },
        transaction: {
          status: transaction.status,
          message: transaction.gateway_response,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

