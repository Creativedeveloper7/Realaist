import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Google Ads configuration from environment variables
    const developerToken = Deno.env.get("GADS_DEV_TOKEN") || "";
    const mccCustomerId = Deno.env.get("GADS_MCC_ID") || "";
    const loginCustomerId = Deno.env.get("GADS_LOGIN_CUSTOMER_ID") || "";
    const customerId = Deno.env.get("GADS_CUSTOMER_ID") || loginCustomerId || "";

    // Check configuration
    const configStatus = {
      developerToken: {
        configured: !!developerToken,
        length: developerToken.length,
      },
      customerId: {
        configured: !!customerId,
        value: customerId ? customerId.substring(0, 4) + "..." : "",
      },
      mccCustomerId: {
        configured: !!mccCustomerId,
        value: mccCustomerId ? mccCustomerId.substring(0, 4) + "..." : "",
      },
      loginCustomerId: {
        configured: !!loginCustomerId,
        value: loginCustomerId ? loginCustomerId.substring(0, 4) + "..." : "",
      },
    };

    const isFullyConfigured = !!developerToken && !!customerId;

    // In production, you would test the actual Google Ads API connection here
    // For now, we'll just verify the configuration is present
    let apiTestResult = null;
    if (isFullyConfigured) {
      // TODO: Add actual Google Ads API test
      // Example:
      // try {
      //   const googleAdsClient = new GoogleAdsClient({...});
      //   const customerService = googleAdsClient.getService("CustomerService");
      //   const customer = await customerService.getCustomer({ resourceName: `customers/${customerId}` });
      //   apiTestResult = { success: true, customerName: customer.descriptiveName };
      // } catch (error) {
      //   apiTestResult = { success: false, error: error.message };
      // }
      
      apiTestResult = {
        success: true,
        message: "Configuration verified (mock - replace with actual API test)",
        note: "To test actual API connectivity, implement Google Ads API client library",
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        configured: isFullyConfigured,
        configStatus,
        apiTest: apiTestResult,
        message: isFullyConfigured
          ? "Google Ads configuration is complete"
          : "Google Ads configuration is incomplete. Please configure Developer Token and Customer ID in admin settings.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error verifying Google Ads config:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to verify Google Ads configuration",
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});


