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

    // Check if user is an admin by querying the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.user_type === 'admin';
    console.log("User admin status:", { user_id: user.id, is_admin: isAdmin, user_type: profile?.user_type });

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

    const { google_ads_campaign_id: rawCampaignId, date_range } = requestData;

    // Validate required fields
    if (!rawCampaignId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: google_ads_campaign_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Received campaign ID from request:", rawCampaignId);

    // Extract numeric Google Ads campaign ID from the provided format
    // The ID might be in various formats:
    // 1. Numeric string: "23270860686"
    // 2. Resource name: "customers/1234567890/campaigns/23270860686"
    // 3. Custom format: "gads_TIMESTAMP_ID" (incorrectly stored)
    let extractedCampaignId: string | null = null;
    
    // Try to extract from resource name format: customers/XXX/campaigns/YYY
    const resourceNameMatch = rawCampaignId.match(/\/campaigns\/(\d+)$/);
    if (resourceNameMatch) {
      extractedCampaignId = resourceNameMatch[1];
      console.log(`Extracted campaign ID from resource name: ${rawCampaignId} -> ${extractedCampaignId}`);
    } 
    // Check if it's already a numeric string
    else if (/^\d+$/.test(rawCampaignId)) {
      extractedCampaignId = rawCampaignId;
      console.log(`Using numeric campaign ID directly: ${extractedCampaignId}`);
    }
    // Try to extract from prefixed format: gads_TIMESTAMP_ID
    // Note: This format is incorrect - the actual Google Ads ID should be stored
    // But we'll try to find the campaign in the database first
    else if (rawCampaignId.startsWith('gads_')) {
      console.log(`Received custom format ID: ${rawCampaignId}. Will look up campaign in database.`);
      // We'll look up the campaign and extract the ID from the stored value
    }
    else {
      console.log(`Unknown campaign ID format: ${rawCampaignId}. Will attempt database lookup.`);
    }

    // Verify user owns a campaign with this google_ads_campaign_id
    // We search using the raw ID as it's stored in the database
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, user_id, campaign_name, google_ads_campaign_id')
      .eq('google_ads_campaign_id', rawCampaignId)
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

    // Verify user owns this campaign (unless user is admin)
    if (!isAdmin && campaign.user_id !== user.id) {
      console.error("User does not own this campaign and is not an admin");
      return new Response(
        JSON.stringify({ error: "Access denied. User does not own this campaign." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (isAdmin) {
      console.log("Admin user accessing campaign analytics - ownership check bypassed");
    }

    // Now extract the actual numeric Google Ads campaign ID from the stored value
    // The database might have the correct numeric ID even if the request had a custom format
    let google_ads_campaign_id: string;
    const storedId = campaign.google_ads_campaign_id || rawCampaignId;
    
    console.log("Stored campaign ID from database:", storedId);
    
    // If we already extracted a valid ID, use it
    if (extractedCampaignId) {
      google_ads_campaign_id = extractedCampaignId;
    }
    // Otherwise, try to extract from the stored value
    else {
      // Try to extract from resource name format: customers/XXX/campaigns/YYY
      const storedResourceMatch = storedId.match(/\/campaigns\/(\d+)$/);
      if (storedResourceMatch) {
        google_ads_campaign_id = storedResourceMatch[1];
        console.log(`Extracted campaign ID from stored resource name: ${storedId} -> ${google_ads_campaign_id}`);
      } 
      // Check if stored value is already numeric
      else if (/^\d+$/.test(storedId)) {
        google_ads_campaign_id = storedId;
        console.log(`Using stored numeric campaign ID: ${google_ads_campaign_id}`);
      }
      // Try to extract from custom format: gads_TIMESTAMP_ID
      // This is a fallback - ideally the database should store the numeric ID
      else if (storedId.startsWith('gads_')) {
        // The format is gads_TIMESTAMP_ID - try to extract the last numeric part
        // But this is unreliable - we should fix the data storage instead
        const parts = storedId.split('_');
        if (parts.length >= 3) {
          // The last part might be the actual campaign ID, but it's likely not
          // For now, return an error asking to fix the data
          console.error(`Invalid campaign ID format in database: ${storedId}`);
          return new Response(
            JSON.stringify({ 
              error: "Invalid Google Ads campaign ID format in database",
              details: `The campaign's google_ads_campaign_id is stored in an invalid format: "${storedId}". It should be a numeric ID (e.g., "23270860686") or a resource name (e.g., "customers/1234567890/campaigns/23270860686"). Please update the campaign's google_ads_campaign_id field in the database with the correct numeric ID from Google Ads.`,
              received_id: rawCampaignId,
              stored_id: storedId,
              campaign_uuid: campaign.id,
              campaign_name: campaign.campaign_name,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              error: "Invalid Google Ads campaign ID format",
              details: `Cannot extract numeric campaign ID from: ${storedId}. The google_ads_campaign_id should be a numeric ID (e.g., "23270860686") or a resource name format.`,
              received_id: rawCampaignId,
              stored_id: storedId,
              campaign_uuid: campaign.id,
              campaign_name: campaign.campaign_name,
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
      else {
        // Unknown format
        console.error(`Unknown campaign ID format: ${storedId}`);
        return new Response(
          JSON.stringify({ 
            error: "Invalid Google Ads campaign ID format",
            details: `Expected numeric ID (e.g., "23270860686") or resource name format, received: "${storedId}". Please update the campaign's google_ads_campaign_id field in the database with the correct numeric ID from Google Ads.`,
            received_id: rawCampaignId,
            stored_id: storedId,
            campaign_uuid: campaign.id,
            campaign_name: campaign.campaign_name,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    console.log(`Using Google Ads campaign ID for API query: ${google_ads_campaign_id} (extracted from stored: ${storedId})`);

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
      const overallStartTime = Date.now();
      
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

      // First, fetch campaign details to get start date and budget info
      console.log("Fetching campaign details (start date, budget)...");
      const campaignDetailsOptions: any = {
        entity: "campaign",
        attributes: [
          "campaign.id",
          "campaign.name",
          "campaign.start_date",
          "campaign.end_date",
          "campaign_budget.amount_micros", // Daily budget amount
          "campaign_budget.total_amount_micros", // Total budget amount (if set)
        ],
        constraints: {
          "campaign.id": google_ads_campaign_id,
        },
      };

      const [campaignDetails] = await customer.report(campaignDetailsOptions);
      if (!campaignDetails) {
        return new Response(
          JSON.stringify({
            error: "Campaign not found in Google Ads",
            analytics: null,
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const campaignStartDate = campaignDetails.campaign?.start_date;
      const campaignEndDate = campaignDetails.campaign?.end_date;
      const dailyBudgetMicros = campaignDetails.campaign_budget?.amount_micros || 0;
      const totalBudgetMicros = campaignDetails.campaign_budget?.total_amount_micros || 0;

      console.log("Campaign details:", {
        start_date: campaignStartDate,
        end_date: campaignEndDate,
        daily_budget_micros: dailyBudgetMicros,
        total_budget_micros: totalBudgetMicros,
      });

      // Calculate total budget: use total_amount_micros if available, otherwise calculate from daily budget
      let calculatedTotalBudgetMicros = totalBudgetMicros;
      if (!calculatedTotalBudgetMicros && campaignStartDate && dailyBudgetMicros > 0) {
        // Calculate total budget from daily budget * number of days
        const startDate = new Date(
          parseInt(campaignStartDate.substring(0, 4)),
          parseInt(campaignStartDate.substring(4, 6)) - 1,
          parseInt(campaignStartDate.substring(6, 8))
        );
        const endDate = campaignEndDate
          ? new Date(
              parseInt(campaignEndDate.substring(0, 4)),
              parseInt(campaignEndDate.substring(4, 6)) - 1,
              parseInt(campaignEndDate.substring(6, 8))
            )
          : new Date(); // Use today if no end date
        
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        calculatedTotalBudgetMicros = dailyBudgetMicros * Math.max(1, daysDiff);
        console.log(`Calculated total budget from daily budget: ${dailyBudgetMicros} * ${daysDiff} days = ${calculatedTotalBudgetMicros}`);
      }

      // Prepare date range for metrics query - use campaign start date if no date range provided
      const reportOptions: any = {
        entity: "campaign",
        attributes: [
          "campaign.id",
          "campaign.name",
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

      // Use provided date range, or default to campaign start date to now
      if (date_range?.start_date || date_range?.end_date) {
        reportOptions.from_date = date_range.start_date || undefined;
        reportOptions.to_date = date_range.end_date || undefined;
      } else if (campaignStartDate) {
        // Default to campaign start date to now for total cost since campaign start
        reportOptions.from_date = campaignStartDate.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
        reportOptions.to_date = undefined; // Will default to today
        console.log(`Using campaign start date for total cost calculation: ${reportOptions.from_date}`);
      }

      // Fetch campaign metrics
      console.log("Fetching campaign metrics for campaign ID:", google_ads_campaign_id);
      console.log("Report options:", JSON.stringify({
        entity: reportOptions.entity,
        attributes: reportOptions.attributes,
        metrics: reportOptions.metrics,
        constraints: reportOptions.constraints,
        date_range: { from: reportOptions.from_date, to: reportOptions.to_date }
      }));
      
      const startTime = Date.now();
      const [campaignData] = await customer.report(reportOptions);
      const fetchDuration = Date.now() - startTime;
      
      console.log(`Campaign metrics fetched in ${fetchDuration}ms`);

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
      const costMicros = campaignData.metrics?.cost_micros || 0; // Total cost since campaign start (or date range)
      const conversions = campaignData.metrics?.conversions || 0;
      const conversionValue = campaignData.metrics?.conversions_value || 0;

      // Use calculated total budget (not daily budget)
      const budgetAmountMicros = calculatedTotalBudgetMicros || dailyBudgetMicros;

      // Convert cost from micros to currency (divide by 1,000,000)
      const cost = costMicros / 1000000;
      const budgetAmount = budgetAmountMicros / 1000000;

      console.log("Budget and cost calculations:", {
        daily_budget_micros: dailyBudgetMicros,
        total_budget_micros: calculatedTotalBudgetMicros,
        used_budget_micros: budgetAmountMicros,
        total_cost_micros: costMicros,
        budget_amount_usd: budgetAmount,
        cost_usd: cost,
        date_range: { from: reportOptions.from_date, to: reportOptions.to_date },
      });

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
        console.log("Fetching demographics data with options:", JSON.stringify({
          entity: demographicsOptions.entity,
          segments: demographicsOptions.segments,
          metrics: demographicsOptions.metrics,
          date_range: { from: demographicsOptions.from_date, to: demographicsOptions.to_date }
        }));
        
        const demographicsStartTime = Date.now();
        const demographicsData = await customer.report(demographicsOptions);
        const demographicsDuration = Date.now() - demographicsStartTime;
        
        console.log(`Demographics data fetched in ${demographicsDuration}ms, ${demographicsData.length} rows returned`);
        
        demographics = demographicsData.map((row: any) => ({
          age_range: row.segments?.age_range || "unknown",
          gender: row.segments?.gender || "unknown",
          impressions: row.metrics?.impressions || 0,
          clicks: row.metrics?.clicks || 0,
          cost_micros: row.metrics?.cost_micros || 0,
          conversions: row.metrics?.conversions || 0,
        }));
        
        console.log(`Processed ${demographics.length} demographics data points:`, {
          total_impressions: demographics.reduce((sum, d) => sum + d.impressions, 0),
          total_clicks: demographics.reduce((sum, d) => sum + d.clicks, 0),
          unique_age_ranges: [...new Set(demographics.map(d => d.age_range))],
          unique_genders: [...new Set(demographics.map(d => d.gender))],
        });
      } catch (demographicsError: any) {
        console.error("Error fetching demographics data:", {
          message: demographicsError.message,
          stack: demographicsError.stack,
          error: demographicsError,
        });
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
        console.log("Fetching geography data with options:", JSON.stringify({
          entity: geographyOptions.entity,
          segments: geographyOptions.segments,
          metrics: geographyOptions.metrics,
          date_range: { from: geographyOptions.from_date, to: geographyOptions.to_date }
        }));
        
        const geographyStartTime = Date.now();
        const geographyData = await customer.report(geographyOptions);
        const geographyDuration = Date.now() - geographyStartTime;
        
        console.log(`Geography data fetched in ${geographyDuration}ms, ${geographyData.length} rows returned`);
        
        geography = geographyData.map((row: any) => ({
          country: row.segments?.geo_target_country || "unknown",
          region: row.segments?.geo_target_region || "unknown",
          city: row.segments?.geo_target_city || "unknown",
          impressions: row.metrics?.impressions || 0,
          clicks: row.metrics?.clicks || 0,
          cost_micros: row.metrics?.cost_micros || 0,
          conversions: row.metrics?.conversions || 0,
        }));
        
        console.log(`Processed ${geography.length} geography data points:`, {
          total_impressions: geography.reduce((sum, g) => sum + g.impressions, 0),
          total_clicks: geography.reduce((sum, g) => sum + g.clicks, 0),
          unique_countries: [...new Set(geography.map(g => g.country))],
          unique_regions: [...new Set(geography.map(g => g.region))].slice(0, 10), // Top 10
          unique_cities: [...new Set(geography.map(g => g.city))].slice(0, 10), // Top 10
        });
      } catch (geographyError: any) {
        console.error("Error fetching geography data:", {
          message: geographyError.message,
          stack: geographyError.stack,
          error: geographyError,
        });
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

      const totalDuration = Date.now() - overallStartTime;
      console.log("Campaign analytics retrieved successfully:", {
        campaign_id: analytics.campaign_id,
        campaign_name: analytics.campaign_name,
        metrics: {
          impressions: analytics.metrics.impressions,
          clicks: analytics.metrics.clicks,
          cost: analytics.metrics.cost,
          conversions: analytics.metrics.conversions,
          ctr: analytics.metrics.ctr,
        },
        budget_usage: analytics.budget_usage ? {
          budget_amount: analytics.budget_usage.budget_amount,
          spent: analytics.budget_usage.spent,
          remaining: analytics.budget_usage.remaining,
          usage_percentage: analytics.budget_usage.usage_percentage,
        } : null,
        demographics_count: analytics.demographics?.length || 0,
        geography_count: analytics.geography?.length || 0,
        total_fetch_duration_ms: totalDuration,
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




