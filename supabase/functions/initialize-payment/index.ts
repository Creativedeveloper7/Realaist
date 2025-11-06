// Supabase Edge Function: Initialize Paystack Payment
// This function initializes a Paystack transaction for campaign payment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InitializePaymentRequest {
  campaign_id: string;
  amount: number; // Amount in KES (will be converted to cents)
  email: string;
  metadata?: Record<string, any>;
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
    const body: InitializePaymentRequest = await req.json();
    const { campaign_id, amount, email, metadata = {} } = body;

    // Validate input
    if (!campaign_id || !amount || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify campaign exists and belongs to user
    const { data: campaign, error: campaignError } = await supabaseClient
      .from("campaigns")
      .select("id, user_id, user_budget, status")
      .eq("id", campaign_id)
      .eq("user_id", user.id)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if campaign already has a successful payment
    if (campaign.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Campaign is not in pending status" }),
        {
          status: 400,
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

    // Convert amount to cents (smallest currency unit for KES: 1 KES = 100 cents)
    const amountInCents = Math.round(amount * 100);

    // Generate unique reference
    const reference = `campaign_${campaign_id}_${Date.now()}`;

    // Get user profile for metadata
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("first_name, last_name, company_name")
      .eq("id", user.id)
      .single();

    // Initialize Paystack transaction
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
          amount: amountInCents,
          reference,
          currency: "KES",
          callback_url: `${Deno.env.get("SITE_URL")}/campaigns/payment/callback?campaign_id=${campaign_id}`,
          metadata: {
            custom_fields: [
              {
                display_name: "Campaign ID",
                variable_name: "campaign_id",
                value: campaign_id,
              },
              {
                display_name: "User ID",
                variable_name: "user_id",
                value: user.id,
              },
              {
                display_name: "Campaign Budget",
                variable_name: "campaign_budget",
                value: amount.toString(),
              },
            ],
            ...metadata,
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || !paystackData.data) {
      return new Response(
        JSON.stringify({
          error: "Failed to initialize payment",
          details: paystackData.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create payment record in database
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        campaign_id,
        user_id: user.id,
        paystack_reference: reference,
        paystack_access_code: paystackData.data.access_code,
        paystack_authorization_url: paystackData.data.authorization_url,
        amount_requested: amountInCents,
        currency: "KES",
        status: "pending",
        customer_email: email,
        customer_name: profile
          ? `${profile.first_name} ${profile.last_name}`
          : null,
        metadata: {
          campaign_id,
          user_id: user.id,
          ...metadata,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      return new Response(
        JSON.stringify({ error: "Failed to create payment record" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return payment initialization data
    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          reference: payment.paystack_reference,
          access_code: payment.paystack_access_code,
          authorization_url: payment.paystack_authorization_url,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error initializing payment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

