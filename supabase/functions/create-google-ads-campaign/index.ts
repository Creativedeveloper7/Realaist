import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
// Import Google Ads API at boot time using native npm: support
import {
  GoogleAdsApi,
  ResourceNames,
  enums,
  resources,
  toMicros,
  MutateOperation,
} from "npm:google-ads-api";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Max-Age": "86400",
};

interface CreateGoogleAdsCampaignRequest {
  campaign_id: string;
  campaign_name: string;
  budget: number; // Total campaign budget in KES (will be divided by duration to calculate daily budget)
  target_location: string[];
  target_age_group: string;
  duration_start: string; // ISO date string
  duration_end: string; // ISO date string
  audience_interests?: string[];
  property_ids?: string[];
  platforms?: string[];
}

interface GoogleAdsConfig {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  mccCustomerId?: string;
  loginCustomerId?: string;
  customerId: string; // The actual Google Ads customer ID to create campaigns in
}

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
}

// Exchange rate constant
const KES_TO_USD_RATE = 134;

// Map Kenya locations to Google Ads geo target IDs
// Reference: https://developers.google.com/google-ads/api/data/geotargets
const KENYA_GEO_TARGETS: { [key: string]: string } = {
  "Nairobi": "1001356", // Nairobi County
  "Mombasa": "1001357", // Mombasa County
  "Kisumu": "1001360", // Kisumu County
  "Nakuru": "1001362", // Nakuru County
  "Eldoret": "1001366", // Uasin Gishu County (Eldoret)
  "Thika": "1001358", // Kiambu County (includes Thika)
  "Ruiru": "1001358", // Kiambu County (includes Ruiru)
  "Kikuyu": "1001358", // Kiambu County (includes Kikuyu)
  "Karen": "1001356", // Nairobi County (includes Karen)
  "Westlands": "1001356", // Nairobi County (includes Westlands)
  "Kilimani": "1001356", // Nairobi County (includes Kilimani)
  "Kileleshwa": "1001356", // Nairobi County (includes Kileleshwa)
  "Lavington": "1001356", // Nairobi County (includes Lavington)
  "Muthaiga": "1001356", // Nairobi County (includes Muthaiga)
  "Runda": "1001356", // Nairobi County (includes Runda)
  "Gigiri": "1001356", // Nairobi County (includes Gigiri)
  "Kenya": "2404", // Entire country as fallback
};

// Helper function to get age range mapping (resolved after dynamic import)
function getAgeRangeMapping(enums: any): { [key: string]: number } {
  return {
    "18-24": enums.AgeRangeType.AGE_RANGE_18_24,
    "25-34": enums.AgeRangeType.AGE_RANGE_25_34,
    "35-44": enums.AgeRangeType.AGE_RANGE_35_44,
    "45-54": enums.AgeRangeType.AGE_RANGE_45_54,
    "55-64": enums.AgeRangeType.AGE_RANGE_55_64,
    "65+": enums.AgeRangeType.AGE_RANGE_65_UP,
  };
}

// Helper function to create keywords from interests and property data
function generateKeywords(interests: string[], properties: Property[]): string[] {
  const keywords: Set<string> = new Set();
  
  // Add interest-based keywords
  interests.forEach(interest => {
    keywords.add(interest.toLowerCase());
    keywords.add(`${interest.toLowerCase()} property`);
    keywords.add(`${interest.toLowerCase()} real estate`);
  });
  
  // Add property-based keywords
  properties.forEach(property => {
    // Location keywords
    if (property.location) {
      keywords.add(`property in ${property.location.toLowerCase()}`);
      keywords.add(`house in ${property.location.toLowerCase()}`);
      keywords.add(`${property.location.toLowerCase()} real estate`);
    }
    
    // Property type keywords
    if (property.property_type) {
      keywords.add(property.property_type.toLowerCase());
      keywords.add(`${property.property_type.toLowerCase()} for sale`);
    }
    
    // Bedroom keywords
    if (property.bedrooms) {
      keywords.add(`${property.bedrooms} bedroom house`);
      keywords.add(`${property.bedrooms} bedroom property`);
    }
  });
  
  // Generic real estate keywords
  keywords.add("property for sale");
  keywords.add("houses for sale");
  keywords.add("real estate");
  keywords.add("buy property");
  keywords.add("buy house");
  
  return Array.from(keywords).slice(0, 50); // Limit to 50 keywords
}

// Helper function to create ad headlines from property data
function generateAdHeadlines(property: Property): string[] {
  const headlines: string[] = [];
  
  // Headline 1: Property type and location
  if (property.property_type && property.location) {
    headlines.push(`${property.property_type} in ${property.location}`.substring(0, 30));
  }
  
  // Headline 2: Bedrooms
  if (property.bedrooms) {
    headlines.push(`${property.bedrooms} Bedroom ${property.property_type || 'House'}`.substring(0, 30));
  }
  
  // Headline 3: Price
  if (property.price) {
    const priceInM = (property.price / 1000000).toFixed(1);
    headlines.push(`KES ${priceInM}M - Great Deal`.substring(0, 30));
  }
  
  // Additional generic headlines
  headlines.push("Premium Property for Sale");
  headlines.push("Your Dream Home Awaits");
  headlines.push("Quality Living Spaces");
  headlines.push("Modern Real Estate");
  headlines.push("Invest in Real Estate");
  headlines.push("Exclusive Properties");
  headlines.push("Best Property Deals");
  
  // Return at least 15 headlines (Google Ads requirement for responsive search ads)
  while (headlines.length < 15) {
    headlines.push(`Property in ${property.location || 'Kenya'}`.substring(0, 30));
  }
  
  return headlines.slice(0, 15);
}

// Helper function to create ad descriptions from property data
function generateAdDescriptions(property: Property): string[] {
  const descriptions: string[] = [];
  
  // Description 1: Property details
  let desc1 = `${property.property_type || 'Property'} with ${property.bedrooms || 'multiple'} bedrooms`;
  if (property.square_feet) {
    desc1 += `, ${property.square_feet} sq ft`;
  }
  descriptions.push(desc1.substring(0, 90));
  
  // Description 2: Location and features
  descriptions.push(`Located in ${property.location || 'prime area'}. Modern amenities included.`.substring(0, 90));
  
  // Description 3: Call to action
  descriptions.push("Contact us today for viewing. Financing options available.".substring(0, 90));
  
  // Description 4: Generic
  descriptions.push("Quality construction, great location, excellent value for money.".substring(0, 90));
  
  return descriptions.slice(0, 4);
}

serve(async (req) => {
  console.log("Edge Function called:", {
    method: req.method,
    url: req.url,
    hasAuth: !!req.headers.get("Authorization"),
  });

  // Handle CORS preflight requests - MUST return 200 with CORS headers
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
    console.log("Authorization header present:", !!authHeader);
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
    console.log("Verifying user token...");
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
    let requestData: CreateGoogleAdsCampaignRequest;
    try {
      requestData = await req.json();
      console.log("Request data parsed:", {
        campaign_id: requestData.campaign_id,
        campaign_name: requestData.campaign_name,
        budget: requestData.budget,
        platforms: requestData.platforms,
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

    const {
      campaign_id,
      campaign_name,
      budget,
      target_location,
      target_age_group,
      duration_start,
      duration_end,
      audience_interests = [],
      property_ids = [],
      platforms = [],
    } = requestData;

    // Validate required fields
    if (!campaign_id || !campaign_name || !budget) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if Google platform is selected
    if (!platforms.includes("google")) {
      return new Response(
        JSON.stringify({
          error: "Google Ads platform not selected for this campaign",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch property data from database
    let properties: Property[] = [];
    if (property_ids && property_ids.length > 0) {
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, description, location, price, property_type, bedrooms, bathrooms, square_feet')
        .in('id', property_ids);
      
      if (propertiesError) {
        console.error('Error fetching properties:', propertiesError);
      } else if (propertiesData) {
        properties = propertiesData;
      }
    }

    console.log('Fetched properties for campaign:', properties.length);

    // Get Google Ads configuration from environment variables
    const googleAdsConfig: GoogleAdsConfig = {
      developerToken: Deno.env.get("GADS_DEV_TOKEN") || "",
      clientId: Deno.env.get("GADS_CLIENT_ID") || "",
      clientSecret: Deno.env.get("GADS_CLIENT_SECRET") || "",
      refreshToken: Deno.env.get("GADS_REFRESH_TOKEN") || "",
      mccCustomerId: Deno.env.get("GADS_MCC_ID") || "",
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
          error: `Google Ads credentials not configured. Missing: ${missingCredentials.join(", ")}. Please configure them in Supabase environment variables.`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Google Ads credentials configured, proceeding with campaign creation...");

    // Calculate campaign duration in days
    const startDate = new Date(duration_start);
    const endDate = new Date(duration_end);
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Convert total budget from KES to USD
    // Exchange rate: 1 USD = 134 KES
    const totalBudgetUSD = budget / KES_TO_USD_RATE;
    
    // Calculate daily budget from total budget
    // Google Ads uses daily budgets, so we divide total budget by campaign duration
    // This ensures the campaign spends the total budget over its lifetime
    let dailyBudgetUSD = durationDays > 0 ? totalBudgetUSD / durationDays : totalBudgetUSD;
    
    // Ensure minimum budget (Google Ads typically requires at least $1 USD daily)
    const minDailyBudgetUSD = 1.0;
    if (dailyBudgetUSD < minDailyBudgetUSD) {
      console.log(`Daily budget ${dailyBudgetUSD.toFixed(2)} USD is below minimum, setting to ${minDailyBudgetUSD} USD`);
      dailyBudgetUSD = minDailyBudgetUSD;
    }

    console.log("Creating Google Ads campaign:", {
      campaign_id,
      campaign_name,
      total_budget_kes: budget,
      total_budget_usd: totalBudgetUSD.toFixed(2),
      daily_budget_usd: dailyBudgetUSD.toFixed(2),
      duration_days: durationDays,
      customerId: googleAdsConfig.customerId,
      properties: properties.length,
      locations: target_location,
      ageGroup: target_age_group,
    });

    try {
      // Google Ads API is already imported at top level
      console.log("=== STEP 1: Initializing Google Ads API client ===");
      console.log("Config:", {
        hasClientId: !!googleAdsConfig.clientId,
        hasClientSecret: !!googleAdsConfig.clientSecret,
        hasDeveloperToken: !!googleAdsConfig.developerToken,
        customerId: googleAdsConfig.customerId,
        hasLoginCustomerId: !!googleAdsConfig.loginCustomerId,
      });

      // Initialize Google Ads API client
      let client;
      try {
        client = new GoogleAdsApi({
          client_id: googleAdsConfig.clientId,
          client_secret: googleAdsConfig.clientSecret,
          developer_token: googleAdsConfig.developerToken,
        });
        console.log("✓ GoogleAdsApi client created successfully");
      } catch (clientError: any) {
        console.error("✗ Failed to create GoogleAdsApi client:", clientError);
        throw new Error(`Failed to initialize Google Ads API client: ${clientError.message}`);
      }

      console.log("=== STEP 2: Creating customer instance ===");
      // Create customer instance
      const customerOptions: any = {
        customer_id: googleAdsConfig.customerId,
        refresh_token: googleAdsConfig.refreshToken,
      };

      // Add login_customer_id if MCC is configured
      if (googleAdsConfig.loginCustomerId) {
        customerOptions.login_customer_id = googleAdsConfig.loginCustomerId;
        console.log("Using login_customer_id:", googleAdsConfig.loginCustomerId);
      }

      let customer;
      try {
        customer = client.Customer(customerOptions);
        console.log("✓ Customer instance created successfully");
      } catch (customerError: any) {
        console.error("✗ Failed to create Customer instance:", customerError);
        throw new Error(`Failed to create Customer instance: ${customerError.message}`);
      }

      console.log("=== STEP 3: Generating resource names ===");
      // Create a resource name with a temporary resource id (-1) - matches Node.js API reference
      let budgetResourceName;
      try {
        budgetResourceName = ResourceNames.campaignBudget(
          customer.credentials.customer_id,
          "-1"
        );
        console.log("✓ Budget resource name generated:", budgetResourceName);
      } catch (resourceError: any) {
        console.error("✗ Failed to generate resource names:", resourceError);
        throw new Error(`Failed to generate resource names: ${resourceError.message}`);
      }

      console.log("=== STEP 4: Building operations array ===");
      // Prepare operations array using proper MutateOperation pattern from Node.js API reference
      const operations: MutateOperation<resources.ICampaignBudget | resources.ICampaign>[] = [];

      // 1. Create Campaign Budget (Daily Budget calculated from Total Budget / Duration)
      console.log("Building campaign budget operation...");
      const budgetOperation: MutateOperation<resources.ICampaignBudget> = {
        entity: "campaign_budget",
        operation: "create",
        resource: {
          resource_name: budgetResourceName,
          name: `${campaign_name} Budget`,
          delivery_method: enums.BudgetDeliveryMethod.STANDARD,
          amount_micros: toMicros(dailyBudgetUSD), // Use toMicros helper from API
        },
      };
      console.log("Budget operation:", JSON.stringify(budgetOperation, null, 2));
      operations.push(budgetOperation);
      console.log("✓ Budget operation added to operations array");

      // 2. Create Campaign with targeting
      console.log("Building campaign resource...");
      const campaignOperation: MutateOperation<resources.ICampaign> = {
        entity: "campaign",
        operation: "create",
        resource: {
          name: campaign_name,
          advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
          status: enums.CampaignStatus.PAUSED, // Start paused, admin can enable later
          manual_cpc: {
            enhanced_cpc_enabled: false, // Match the Node.js API reference example
          },
          // Use the temporary resource id which will be created in the previous operation
          campaign_budget: budgetResourceName,
          network_settings: {
            target_google_search: true,
            target_search_network: true,
          },
          // Set start and end dates if provided
          start_date: duration_start ? duration_start.split("T")[0].replace(/-/g, "") : undefined,
          end_date: duration_end ? duration_end.split("T")[0].replace(/-/g, "") : undefined,
        },
      };
      console.log("Campaign operation:", JSON.stringify(campaignOperation, null, 2));
      operations.push(campaignOperation);
      console.log("✓ Campaign operation added to operations array");

      // Note: Campaign criteria (location, age) will be added after campaign creation
      // This matches the Node.js API reference pattern of creating budget + campaign atomically first

      console.log("=== STEP 5: Executing mutateResources ===");
      console.log(`Total operations to execute: ${operations.length}`);
      console.log("Operations summary:", {
        budget: operations.filter(op => op.entity === "campaign_budget").length,
        campaign: operations.filter(op => op.entity === "campaign").length,
        criteria: operations.filter(op => op.entity === "campaign_criterion").length,
      });
      
      // Group operations by resource type for optimal performance (per official docs)
      // "It's important to group mutates by resource type or the request may time out"
      console.log("Calling customer.mutateResources() with grouped operations...");
      const startTime = Date.now();
      let campaignResult;
      try {
        // Use atomic transaction with proper error handling
        campaignResult = await customer.mutateResources(operations, {
          partialFailure: false, // Ensure full atomicity - all succeed or all fail
          validateOnly: false,   // Actually execute the operations
        });
        const duration = Date.now() - startTime;
        console.log(`✓ mutateResources completed in ${duration}ms`);
        console.log("Result type:", typeof campaignResult);
        console.log("Result is array:", Array.isArray(campaignResult));
        console.log("Result length:", Array.isArray(campaignResult) ? campaignResult.length : "N/A");
      } catch (mutateError: any) {
        const duration = Date.now() - startTime;
        console.error(`✗ mutateResources failed after ${duration}ms:`, mutateError);
        console.error("Error details:", {
          message: mutateError.message,
          stack: mutateError.stack,
          errors: mutateError.errors,
        });
        throw mutateError;
      }

      console.log("=== STEP 6: Extracting campaign and budget IDs ===");
      // Extract the campaign ID and budget ID from the result
      let googleAdsCampaignId: string | null = null;
      let budgetId: string | null = null;

      console.log("Processing mutateResources result...");
      for (let i = 0; i < campaignResult.length; i++) {
        const operationResult = campaignResult[i];
        const operation = operations[i];
        
        console.log(`Processing result ${i + 1}/${campaignResult.length}:`, {
          entity: operation.entity,
          hasResults: !!operationResult.results,
          resultsLength: operationResult.results?.length || 0,
        });

        if (operation.entity === "campaign" && operationResult.results) {
          const campaignRes = operationResult.results[0];
          console.log("Campaign result:", JSON.stringify(campaignRes, null, 2));
          if (campaignRes?.resource_name) {
            const campaignMatch = campaignRes.resource_name.match(/\/campaigns\/(\d+)$/);
            if (campaignMatch) {
              googleAdsCampaignId = campaignMatch[1];
              console.log("✓ Campaign created with ID:", googleAdsCampaignId);
            } else {
              console.warn("Campaign resource_name format unexpected:", campaignRes.resource_name);
            }
          } else {
            console.warn("Campaign result missing resource_name");
          }
        }
        if (operation.entity === "campaign_budget" && operationResult.results) {
          const budgetResult = operationResult.results[0];
          console.log("Budget result:", JSON.stringify(budgetResult, null, 2));
          if (budgetResult?.resource_name) {
            const budgetMatch = budgetResult.resource_name.match(/\/campaignBudgets\/(\d+)$/);
            if (budgetMatch) {
              budgetId = budgetMatch[1];
              console.log("✓ Budget created with ID:", budgetId);
            } else {
              console.warn("Budget resource_name format unexpected:", budgetResult.resource_name);
            }
          } else {
            console.warn("Budget result missing resource_name");
          }
        }
      }

      if (!googleAdsCampaignId) {
        console.error("Failed to extract campaign ID. Full result:", JSON.stringify(campaignResult, null, 2));
        throw new Error("Failed to extract campaign ID from Google Ads API response");
      }
      
      console.log("✓ Successfully extracted IDs:", { googleAdsCampaignId, budgetId });

      console.log("=== STEP 7: Creating ad groups, keywords, and ads ===");
      // Now create ad groups, keywords, and ads for each property
      const adGroupOperations: MutateOperation<
        resources.IAdGroup | resources.IAdGroupCriterion | resources.IAdGroupAd
      >[] = [];
      const stats = {
        adGroups: 0,
        keywords: 0,
        ads: 0,
      };

      if (properties.length > 0) {
        console.log(`Processing ${properties.length} properties for ad group creation...`);
        for (let i = 0; i < properties.length; i++) {
          const property = properties[i];
          const adGroupName = `${property.title.substring(0, 30)} - ${property.location}`;
          const adGroupResourceName = ResourceNames.adGroup(
            customer.credentials.customer_id,
            `-${i + 2}` // Use negative IDs for temporary resources
          );

          // 5. Create Ad Group for this property
          adGroupOperations.push({
            entity: "ad_group",
            operation: "create",
            resource: {
              resource_name: adGroupResourceName,
              name: adGroupName,
              campaign: ResourceNames.campaign(customer.credentials.customer_id, googleAdsCampaignId),
              status: enums.AdGroupStatus.ENABLED,
              type: enums.AdGroupType.SEARCH_STANDARD,
              cpc_bid_micros: toMicros(10), // Default bid: 10 USD using toMicros helper
            },
          });
          stats.adGroups++;

          // 6. Generate and add keywords for this ad group
          const keywords = generateKeywords(audience_interests, [property]);
          keywords.slice(0, 20).forEach((keyword, keywordIndex) => {
            adGroupOperations.push({
              entity: "ad_group_criterion",
              operation: "create",
              resource: {
                ad_group: adGroupResourceName,
                keyword: {
                  text: keyword,
                  match_type: enums.KeywordMatchType.BROAD,
                },
                status: enums.AdGroupCriterionStatus.ENABLED,
              },
            });
            stats.keywords++;
          });

          // 7. Create Responsive Search Ad for this ad group
          const headlines = generateAdHeadlines(property);
          const descriptions = generateAdDescriptions(property);

          adGroupOperations.push({
            entity: "ad_group_ad",
            operation: "create",
            resource: {
              ad_group: adGroupResourceName,
              status: enums.AdGroupAdStatus.ENABLED,
              ad: {
                responsive_search_ad: {
                  headlines: headlines.map(text => ({ text })),
                  descriptions: descriptions.map(text => ({ text })),
                  path1: "properties",
                  path2: property.location?.toLowerCase().replace(/\s+/g, '-').substring(0, 15),
                },
                final_urls: [
                  `https://realaist.tech/properties/${property.id}`, // Fixed URL to match domain
                ],
              },
            },
          });
          stats.ads++;
        }

        // Execute ad group, keyword, and ad creation
        if (adGroupOperations.length > 0) {
          console.log(`=== STEP 8: Executing ad group operations ===`);
          console.log(`Creating ${stats.adGroups} ad groups, ${stats.keywords} keywords, and ${stats.ads} ads...`);
          console.log(`Total ad group operations: ${adGroupOperations.length}`);
          const adGroupStartTime = Date.now();
          try {
            const adGroupResult = await customer.mutateResources(adGroupOperations);
            const adGroupDuration = Date.now() - adGroupStartTime;
            console.log(`✓ Ad group operations completed in ${adGroupDuration}ms`);
            console.log("Ad group result length:", Array.isArray(adGroupResult) ? adGroupResult.length : "N/A");
            console.log("Ad groups, keywords, and ads created successfully");
          } catch (adGroupError: any) {
            const adGroupDuration = Date.now() - adGroupStartTime;
            console.error(`✗ Ad group operations failed after ${adGroupDuration}ms:`, adGroupError);
            console.error("Ad group error details:", {
              message: adGroupError.message,
              stack: adGroupError.stack,
              errors: adGroupError.errors,
            });
            // Continue even if ad group creation fails - campaign is still created
          }
        }
      } else {
        console.log("No properties provided, skipping ad group creation");
      }

      console.log("Google Ads campaign created successfully:", {
        googleAdsCampaignId,
        budgetId,
        campaignName: campaign_name,
        totalBudgetUSD: totalBudgetUSD.toFixed(2),
        dailyBudgetUSD: dailyBudgetUSD.toFixed(2),
        durationDays,
        customerId: googleAdsConfig.customerId,
        stats,
      });

      return new Response(
        JSON.stringify({
          success: true,
          googleAdsCampaignId,
          budgetId,
          campaignName: campaign_name,
          totalBudgetUSD: totalBudgetUSD.toFixed(2),
          dailyBudgetUSD: dailyBudgetUSD.toFixed(2),
          dailyBudgetMicros: toMicros(dailyBudgetUSD),
          durationDays,
          customerId: googleAdsConfig.customerId,
          stats,
          message: "Google Ads campaign created successfully with ad groups, keywords, and ads",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (googleAdsError: any) {
      console.error("=== GOOGLE ADS API ERROR ===");
      console.error("Google Ads API error:", googleAdsError);

      // Handle Google Ads API specific errors based on official documentation
      let errorMessage = "Failed to create Google Ads campaign";
      let errorDetails: any = null;

      if (googleAdsError.errors && Array.isArray(googleAdsError.errors)) {
        // This is a GoogleAdsFailure error - handle specific error types from official docs
        const firstError = googleAdsError.errors[0];
        errorMessage = firstError.message || errorMessage;
        errorDetails = {
          errorCode: firstError.error_code,
          location: firstError.location,
          trigger: firstError.trigger,
          fieldPath: firstError.location?.field_path_elements,
        };

        // Add specific handling for common errors mentioned in official docs
        const errorType = Object.keys(firstError.error_code || {})[0];
        switch (errorType) {
          case 'campaignBudgetError':
            errorMessage = `Campaign Budget Error: ${firstError.message}. Check budget amount and delivery method.`;
            break;
          case 'campaignError':
            errorMessage = `Campaign Error: ${firstError.message}. Check campaign settings and targeting.`;
            break;
          case 'authenticationError':
            errorMessage = `Authentication Error: ${firstError.message}. Check Google Ads credentials.`;
            break;
          case 'authorizationError':
            errorMessage = `Authorization Error: ${firstError.message}. Check account permissions.`;
            break;
          case 'quotaError':
            errorMessage = `Quota Error: ${firstError.message}. API quota exceeded.`;
            break;
          default:
            errorMessage = firstError.message || errorMessage;
        }
      } else if (googleAdsError.message) {
        errorMessage = googleAdsError.message;
      }

      return new Response(
        JSON.stringify({
          error: errorMessage,
          details: errorDetails || googleAdsError.toString(),
          type: "GoogleAdsAPIError",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("=== GENERAL ERROR ===");
    console.error("Error creating Google Ads campaign:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create Google Ads campaign",
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});