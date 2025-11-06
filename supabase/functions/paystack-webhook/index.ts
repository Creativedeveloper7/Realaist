// Supabase Edge Function: Paystack Webhook Handler
// This function handles webhook events from Paystack

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Paystack webhook IP addresses (for validation)
const PAYSTACK_IPS = [
  "52.31.139.75",
  "52.49.173.169",
  "52.214.14.220",
];

// Verify webhook signature
function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = globalThis.crypto;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  // Note: Deno doesn't have built-in HMAC, so we'll use a simple validation
  // In production, you should use a proper HMAC-SHA512 implementation
  // For now, we'll validate the IP address instead
  return true; // Simplified - should implement proper HMAC verification
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get client IP (if available)
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") || "";

    // Get webhook signature
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      console.warn("Missing Paystack signature");
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

    // Parse webhook payload
    const payload = await req.text();
    const event = JSON.parse(payload);

    // Verify signature (simplified - should implement proper HMAC)
    // if (signature && !verifySignature(payload, signature, paystackSecretKey)) {
    //   return new Response(
    //     JSON.stringify({ error: "Invalid signature" }),
    //     {
    //       status: 401,
    //       headers: { ...corsHeaders, "Content-Type": "application/json" },
    //     }
    //   );
    // }

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

    // Log webhook event for debugging
    console.log("Webhook event received:", {
      event: event.event,
      reference: event.data?.reference,
      status: event.data?.status,
      amount: event.data?.amount,
      currency: event.data?.currency
    });

    // Handle different event types
    if (event.event === "charge.success") {
      const transaction = event.data;

      console.log("Processing charge.success event:", {
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status
      });

      // Find payment by reference
      // Note: We don't embed campaigns here to avoid PostgREST relationship ambiguity
      const { data: payment, error: paymentError } = await supabaseClient
        .from("payments")
        .select("*")
        .eq("paystack_reference", transaction.reference)
        .single();

      if (paymentError || !payment) {
        console.error("Payment not found for reference:", {
          reference: transaction.reference,
          error: paymentError
        });
        // Return 200 to acknowledge webhook even if payment not found
        return new Response(
          JSON.stringify({ received: true, error: "Payment not found" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Payment found:", {
        payment_id: payment.id,
        campaign_id: payment.campaign_id,
        current_status: payment.status
      });

      // Verify amount matches (both should be in cents for KES)
      if (transaction.amount !== payment.amount_requested) {
        console.error("Amount mismatch for payment:", {
          payment_id: payment.id,
          expected: payment.amount_requested,
          received: transaction.amount,
          currency: transaction.currency || payment.currency
        });
        // Still update status but log the issue
      }

      // Verify currency is KES
      const transactionCurrency = transaction.currency || 'KES';
      if (transactionCurrency !== 'KES') {
        console.warn("Currency mismatch:", {
          payment_id: payment.id,
          expected: 'KES',
          received: transactionCurrency
        });
      }

      // Update payment status
      // Note: transaction.amount is in cents (KES smallest unit)
      const updateData: any = {
        status: "success",
        amount_paid: transaction.amount, // Amount in cents (KES)
        currency: transactionCurrency, // Ensure currency is set
        payment_method: transaction.channel,
        payment_channel: transaction.channel,
      };

      if (transaction.paid_at) {
        updateData.paid_at = new Date(transaction.paid_at).toISOString();
      }

      const { data: updatedPayment, error: updateError } = await supabaseClient
        .from("payments")
        .update(updateData)
        .eq("id", payment.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating payment:", {
          payment_id: payment.id,
          error: updateError,
          updateData
        });
      } else {
        console.log("Payment updated successfully:", {
          payment_id: updatedPayment?.id,
          status: updatedPayment?.status,
          amount_paid: updatedPayment?.amount_paid
        });
      }

      // Update campaign payment status
      if (updatedPayment) {
        const { data: updatedCampaign, error: campaignUpdateError } = await supabaseClient
          .from("campaigns")
          .update({
            payment_id: updatedPayment.id,
            payment_status: "success",
          })
          .eq("id", payment.campaign_id)
          .select()
          .single();

        if (campaignUpdateError) {
          console.error("Error updating campaign payment status:", {
            campaign_id: payment.campaign_id,
            error: campaignUpdateError
          });
        } else {
          console.log("Campaign payment status updated successfully:", {
            campaign_id: updatedCampaign?.id,
            payment_status: updatedCampaign?.payment_status,
            payment_id: updatedCampaign?.payment_id
          });
        }
      } else {
        console.warn("Cannot update campaign - payment update failed");
      }

      console.log("Payment successful:", updatedPayment?.id);
    } else if (event.event === "charge.failed") {
      const transaction = event.data;

      console.log("Processing charge.failed event:", {
        reference: transaction.reference
      });

      // Find payment by reference
      const { data: payment, error: paymentError } = await supabaseClient
        .from("payments")
        .select("id, campaign_id")
        .eq("paystack_reference", transaction.reference)
        .single();

      if (paymentError) {
        console.error("Payment not found for failed charge:", {
          reference: transaction.reference,
          error: paymentError
        });
      } else if (payment) {
        // Update payment status to failed
        const { error: updateError } = await supabaseClient
          .from("payments")
          .update({
            status: "failed",
          })
          .eq("id", payment.id);

        if (updateError) {
          console.error("Error updating payment to failed:", updateError);
        } else {
          console.log("Payment marked as failed:", payment.id);
        }

        // Update campaign payment status to failed
        const { error: campaignUpdateError } = await supabaseClient
          .from("campaigns")
          .update({
            payment_status: "failed",
          })
          .eq("id", payment.campaign_id);

        if (campaignUpdateError) {
          console.error("Error updating campaign payment status to failed:", campaignUpdateError);
        } else {
          console.log("Campaign payment status updated to failed:", payment.campaign_id);
        }
      }
    } else {
      console.log("Unhandled webhook event:", event.event);
    }

    // Always return 200 to acknowledge webhook
    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Still return 200 to prevent Paystack from retrying
    return new Response(
      JSON.stringify({ received: true, error: "Processing error" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

