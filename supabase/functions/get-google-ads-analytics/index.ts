import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import {
  GoogleAdsApi,
  enums,
} from "npm:google-ads-api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Max-Age": "86400",
};

interface GetAnalyticsRequest {
  google_ads_campaign_id: string;
  date_range?: {
    start_date?: string; // YYYY-MM-DD format
    end_date?: string; // YYYY-MM-DD format
  };
}

interface GoogleAdsConfig {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  loginCustomerId?: string;
  customerId: string;
}

interface DemographicsData {
  age_range: string;
  gender: string;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
}

interface GeographyData {
  country: string;
  region: string;
  city: string;
  impressions: number;
  clicks: number;
  cost_micros: number;
  conversions: number;
}

interface BudgetUsage {
  budget_amount_micros: number;
  budget_amount: number;
  spent_micros: number;
  spent: number;
  remaining_micros: number;
  remaining: number;
  usage_percentage: number;
}

interface CampaignAnalytics {
  campaign_id: string;
  campaign_name: string;
  metrics: {
    impressions: number;
    clicks: number;
    cost_micros: number;
    cost: number; // Converted from micros to currency
    conversions: number;
    conversion_value: number;
    ctr: number; // Click-through rate
    average_cpc: number; // Average cost per click
    cpm: number; // Cost per 1000 impressions
  };
  budget_usage?: BudgetUsage;
  demographics?: DemographicsData[];
  geography?: GeographyData[];
  date_range?: {
    start_date?: string;
    end_date?: string;
  };
}

serve(async (req) => {
  console.log("Get Analytics Edge Function called:", {
    method: req.method,
    url: req.url,
    hasAuth: !!req.headers.get("Authorization"),
  });

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
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
      console.error("User authentication failed:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("User authenticated:", user.id);

    // Parse request body
    let requestData: GetAnalyticsRequest;
    try {
      requestData = await req.json();
      console.log("Request data parsed:", {
        google_ads_campaign_id: requestData.google_ads_campaign_id,
        date_range: requestData.date_range,
      });
    } catch (parseError: any) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request body. Expected JSON." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { google_ads_campaign_id, date_range } = requestData;

    // Validate required fields
    if (!google_ads_campaign_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: google_ads_campaign_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify user owns a campaign with this google_ads_campaign_id
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, user_id, campaign_name')
      .eq('google_ads_campaign_id', google_ads_campaign_id)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign not found:", campaignError);
      return new Response(
        JSON.stringify({ error: "Campaign not found or access denied" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify user owns this campaign
    if (campaign.user_id !== user.id) {
      console.error("User does not own this campaign");
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Google Ads configuration from environment variables
    const googleAdsConfig: GoogleAdsConfig = {
      developerToken: Deno.env.get("GADS_DEV_TOKEN") || "",
      clientId: Deno.env.get("GADS_CLIENT_ID") || "",
      clientSecret: Deno.env.get("GADS_CLIENT_SECRET") || "",
      refreshToken: Deno.env.get("GADS_REFRESH_TOKEN") || "",
      loginCustomerId: Deno.env.get("GADS_LOGIN_CUSTOMER_ID") || "",
      customerId: Deno.env.get("GADS_CUSTOMER_ID") || Deno.env.get("GADS_LOGIN_CUSTOMER_ID") || "",
    };

    // Verify Google Ads credentials are configured
    const missingCredentials: string[] = [];
    if (!googleAdsConfig.developerToken) missingCredentials.push("GADS_DEV_TOKEN");
    if (!googleAdsConfig.clientId) missingCredentials.push("GADS_CLIENT_ID");
    if (!googleAdsConfig.clientSecret) missingCredentials.push("GADS_CLIENT_SECRET");
    if (!googleAdsConfig.refreshToken) missingCredentials.push("GADS_REFRESH_TOKEN");
    if (!googleAdsConfig.customerId) missingCredentials.push("GADS_CUSTOMER_ID");

    if (missingCredentials.length > 0) {
      console.error("Missing Google Ads credentials:", missingCredentials);
      return new Response(
        JSON.stringify({
          error: `Google Ads credentials not configured. Missing: ${missingCredentials.join(", ")}.`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Initialize Google Ads API client
      console.log("Initializing Google Ads API client...");
      const client = new GoogleAdsApi({
        client_id: googleAdsConfig.clientId,
        client_secret: googleAdsConfig.clientSecret,
        developer_token: googleAdsConfig.developerToken,
      });

      // Create customer instance
      const customerOptions: any = {
        customer_id: googleAdsConfig.customerId,
        refresh_token: googleAdsConfig.refreshToken,
      };

      if (googleAdsConfig.loginCustomerId) {
        customerOptions.login_customer_id = googleAdsConfig.loginCustomerId;
      }

      const customer = client.Customer(customerOptions);
      console.log("Google Ads customer instance created");

      // Prepare date range for query
      const reportOptions: any = {
        entity: "campaign",
        attributes: [
          "campaign.id",
          "campaign.name",
          "campaign_budget.amount_micros", // Budget amount
        ],
        metrics: [
          "metrics.impressions",
          "metrics.clicks",
          "metrics.cost_micros",
          "metrics.conversions",
          "metrics.conversions_value",
        ],
        constraints: {
          "campaign.id": google_ads_campaign_id,
        },
      };

      // Add date range if provided
      if (date_range?.start_date || date_range?.end_date) {
        reportOptions.from_date = date_range.start_date || undefined;
        reportOptions.to_date = date_range.end_date || undefined;
      }

      // Fetch campaign metrics
      console.log("Fetching campaign metrics for campaign ID:", google_ads_campaign_id);
      const [campaignData] = await customer.report(reportOptions);

      if (!campaignData) {
        return new Response(
          JSON.stringify({
            error: "Campaign not found in Google Ads or has no data",
            analytics: null,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Extract metrics
      const impressions = campaignData.metrics?.impressions || 0;
      const clicks = campaignData.metrics?.clicks || 0;
      const costMicros = campaignData.metrics?.cost_micros || 0;
      const conversions = campaignData.metrics?.conversions || 0;
      const conversionValue = campaignData.metrics?.conversions_value || 0;
      const budgetAmountMicros = campaignData.campaign_budget?.amount_micros || 0;

      // Convert cost from micros to currency (divide by 1,000,000)
      const cost = costMicros / 1000000;
      const budgetAmount = budgetAmountMicros / 1000000;

      // Calculate derived metrics
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const averageCpc = clicks > 0 ? cost / clicks : 0;
      const cpm = impressions > 0 ? (cost / impressions) * 1000 : 0;

      // Calculate budget usage
      const remainingMicros = Math.max(0, budgetAmountMicros - costMicros);
      const remaining = remainingMicros / 1000000;
      const usagePercentage = budgetAmountMicros > 0 
        ? (costMicros / budgetAmountMicros) * 100 
        : 0;

      const budgetUsage: BudgetUsage = {
        budget_amount_micros: budgetAmountMicros,
        budget_amount: Number(budgetAmount.toFixed(2)),
        spent_micros: costMicros,
        spent: Number(cost.toFixed(2)),
        remaining_micros: remainingMicros,
        remaining: Number(remaining.toFixed(2)),
        usage_percentage: Number(usagePercentage.toFixed(2)),
      };

      // Fetch demographics data (age and gender breakdowns)
      console.log("Fetching demographics data...");
      const demographicsOptions: any = {
        entity: "campaign",
        attributes: [
          "campaign.id",
        ],
        segments: [
          "segments.age_range",
          "segments.gender",
        ],
        metrics: [
          "metrics.impressions",
          "metrics.clicks",
          "metrics.cost_micros",
          "metrics.conversions",
        ],
        constraints: {
          "campaign.id": google_ads_campaign_id,
        },
      };

      if (date_range?.start_date || date_range?.end_date) {
        demographicsOptions.from_date = date_range.start_date || undefined;
        demographicsOptions.to_date = date_range.end_date || undefined;
      }

      let demographics: DemographicsData[] = [];
      try {
        const demographicsData = await customer.report(demographicsOptions);
        demographics = demographicsData.map((row: any) => ({
          age_range: row.segments?.age_range || "unknown",
          gender: row.segments?.gender || "unknown",
          impressions: row.metrics?.impressions || 0,
          clicks: row.metrics?.clicks || 0,
          cost_micros: row.metrics?.cost_micros || 0,
          conversions: row.metrics?.conversions || 0,
        }));
        console.log(`Retrieved ${demographics.length} demographics data points`);
      } catch (demographicsError: any) {
        console.warn("Error fetching demographics data:", demographicsError.message);
        // Continue without demographics if there's an error
      }

      // Fetch geography data (location breakdowns)
      console.log("Fetching geography data...");
      const geographyOptions: any = {
        entity: "campaign",
        attributes: [
          "campaign.id",
        ],
        segments: [
          "segments.geo_target_country",
          "segments.geo_target_region",
          "segments.geo_target_city",
        ],
        metrics: [
          "metrics.impressions",
          "metrics.clicks",
          "metrics.cost_micros",
          "metrics.conversions",
        ],
        constraints: {
          "campaign.id": google_ads_campaign_id,
        },
      };

      if (date_range?.start_date || date_range?.end_date) {
        geographyOptions.from_date = date_range.start_date || undefined;
        geographyOptions.to_date = date_range.end_date || undefined;
      }

      let geography: GeographyData[] = [];
      try {
        const geographyData = await customer.report(geographyOptions);
        geography = geographyData.map((row: any) => ({
          country: row.segments?.geo_target_country || "unknown",
          region: row.segments?.geo_target_region || "unknown",
          city: row.segments?.geo_target_city || "unknown",
          impressions: row.metrics?.impressions || 0,
          clicks: row.metrics?.clicks || 0,
          cost_micros: row.metrics?.cost_micros || 0,
          conversions: row.metrics?.conversions || 0,
        }));
        console.log(`Retrieved ${geography.length} geography data points`);
      } catch (geographyError: any) {
        console.warn("Error fetching geography data:", geographyError.message);
        // Continue without geography if there's an error
      }

      const analytics: CampaignAnalytics = {
        campaign_id: google_ads_campaign_id,
        campaign_name: campaignData.campaign?.name || campaign.campaign_name,
        metrics: {
          impressions,
          clicks,
          cost_micros: costMicros,
          cost: Number(cost.toFixed(2)),
          conversions,
          conversion_value: conversionValue,
          ctr: Number(ctr.toFixed(2)),
          average_cpc: Number(averageCpc.toFixed(2)),
          cpm: Number(cpm.toFixed(2)),
        },
        budget_usage: budgetUsage,
        demographics: demographics.length > 0 ? demographics : undefined,
        geography: geography.length > 0 ? geography : undefined,
        date_range: date_range,
      };

      console.log("Campaign analytics retrieved successfully:", {
        campaign_id: analytics.campaign_id,
        impressions: analytics.metrics.impressions,
        clicks: analytics.metrics.clicks,
        cost: analytics.metrics.cost,
      });

      return new Response(
        JSON.stringify({
          success: true,
          analytics,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (googleAdsError: any) {
      console.error("Google Ads API error:", googleAdsError);

      // Handle Google Ads specific errors
      if (googleAdsError.message?.includes("Authentication")) {
        return new Response(
          JSON.stringify({
            error: "Google Ads authentication failed. Please check credentials.",
            details: googleAdsError.message,
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (googleAdsError.message?.includes("not found") || googleAdsError.message?.includes("INVALID_ARGUMENT")) {
        return new Response(
          JSON.stringify({
            error: "Campaign not found in Google Ads",
            details: googleAdsError.message,
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Failed to fetch campaign analytics",
          details: googleAdsError.message || "Unknown error",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

