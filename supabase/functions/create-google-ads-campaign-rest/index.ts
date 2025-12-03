import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Max-Age": "86400",
};

const GOOGLE_ADS_API_VERSION = "22";
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/v${GOOGLE_ADS_API_VERSION}/customers`;

interface CreateGoogleAdsCampaignRequest {
  campaign_id: string;
  campaign_name: string;
  budget: number;
  target_location: string[];
  target_age_group: string;
  duration_start: string;
  duration_end: string;
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
  customerId: string;
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

const KES_TO_USD_RATE = 134;

const KENYA_GEO_TARGETS: Record<string, string> = {
  Nairobi: "1001356",
  Mombasa: "1001357",
  Kisumu: "1001360",
  Nakuru: "1001362",
  Eldoret: "1001366",
  Thika: "1001358",
  Ruiru: "1001358",
  Kikuyu: "1001358",
  Karen: "1001356",
  Westlands: "1001356",
  Kilimani: "1001356",
  Kileleshwa: "1001356",
  Lavington: "1001356",
  Muthaiga: "1001356",
  Runda: "1001356",
  Gigiri: "1001356",
  Kenya: "2404",
};

const AGE_RANGE_MAPPING: Record<string, string> = {
  "18-24": "AGE_RANGE_18_24",
  "25-34": "AGE_RANGE_25_34",
  "35-44": "AGE_RANGE_35_44",
  "45-54": "AGE_RANGE_45_54",
  "55-64": "AGE_RANGE_55_64",
  "65+": "AGE_RANGE_65_UP",
};

function formatDate(date?: string) {
  if (!date) return undefined;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return undefined;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  // Google Ads API requires YYYYMMDD format (no dashes)
  return `${y}${m}${day}`;
}

// Sanitize campaign name to remove invalid characters (null, NL, CR)
function sanitizeCampaignName(name: string): string {
  return name
    .replace(/\0/g, "")      // Remove null characters (0x0)
    .replace(/\n/g, " ")     // Replace newlines (0xA) with spaces
    .replace(/\r/g, "");     // Remove carriage returns (0xD)
}

// Generate unique campaign name with property details, campaign ID, and timestamp
function generateUniqueCampaignName(
  baseName: string, 
  properties: Property[], 
  campaignId: string
): string {
  // Get Unix timestamp for uniqueness
  const timestamp = Math.floor(Date.now() / 1000);
  
  // If we have properties, use the first one for naming
  if (properties.length > 0) {
    const property = properties[0];
    const propertyName = (property.title || "property")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
      .substring(0, 20); // Limit length
    
    // For now, use location as "developer" since we don't have developer field
    const developerName = (property.location || "developer")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 15);
    
    return `${propertyName}-${developerName}-${campaignId}-${timestamp}`;
  }
  
  // Fallback if no properties
  const sanitizedBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 30);
  
  return `${sanitizedBase}-${campaignId}-${timestamp}`;
}

async function getGoogleAccessToken(config: GoogleAdsConfig) {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: config.refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(`[getGoogleAccessToken] OAuth response was not JSON, dumping raw text:`, text.substring(0, 500));
      console.error(`[getGoogleAccessToken] Response status:`, response.status, response.statusText);
      console.error(`[getGoogleAccessToken] Response headers:`, Object.fromEntries(response.headers.entries()));
      throw new Error(`Google OAuth API returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
    }
  }

  if (!response.ok) {
    console.error("[getGoogleAccessToken] Failed to refresh Google access token:", data);
    throw new Error(data.error_description || data.error || `Failed to refresh Google access token (${response.status})`);
  }

  if (!data.access_token) {
    throw new Error("Google OAuth token response missing access_token");
  }

  return data.access_token as string;
}

async function callGoogleAdsMutate(
  customerId: string,
  accessToken: string,
  operations: any[],
  config: GoogleAdsConfig,
  label: string
) {
  console.log(`[${label}] Sending ${operations.length} mutate operations`);
  console.log(`[${label}] Operations payload:`, JSON.stringify(operations, null, 2));

  const url = `${GOOGLE_ADS_BASE_URL}/${customerId}/googleAds:mutate`;
  console.log(`[${label}] Calling Google Ads API:`, url);
  
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "developer-token": config.developerToken,
    ...(config.loginCustomerId ? { "login-customer-id": config.loginCustomerId } : {}),
  };
  
  console.log(`[${label}] Request headers:`, { ...headers, Authorization: "Bearer [REDACTED]" });
  
  const payload = { mutateOperations: operations };
  console.log(`[${label}] Request payload:`, JSON.stringify(payload, null, 2));
  
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(`[${label}] Google Ads mutate response was not JSON, dumping raw text:`, text.substring(0, 500));
      console.error(`[${label}] Response status:`, response.status, response.statusText);
      console.error(`[${label}] Response headers:`, Object.fromEntries(response.headers.entries()));
      throw new Error(`Google Ads API returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
    }
  }

  if (!response.ok) {
    console.error(`[${label}] Google Ads mutate error:`, data);
    
    // Handle Google Ads API specific errors
    if (data.error?.details) {
      const details = data.error.details;
      console.error(`[${label}] Error details:`, JSON.stringify(details, null, 2));
      
      // Extract specific error messages from details
      if (Array.isArray(details)) {
        const errorMessages = details
          .map((detail: any) => detail.error?.errors?.map((e: any) => e.message).join("; "))
          .filter(Boolean)
          .join(" | ");
        if (errorMessages) {
          throw new Error(`Google Ads API error: ${errorMessages}`);
        }
      }
    }
    
    throw new Error(data.error?.message || data.error?.description || `Google Ads mutate failed (${response.status})`);
  }

  console.log(`[${label}] mutate response summary:`, {
    responses: data.mutateOperationResponses?.length || 0,
    partialFailureError: data.partialFailureError ? true : false,
  });

  // Log detailed response information
  if (data.mutateOperationResponses && data.mutateOperationResponses.length > 0) {
    console.log(`[${label}] Processing ${data.mutateOperationResponses.length} operation responses:`);
    
    data.mutateOperationResponses.forEach((response: any, index: number) => {
      console.log(`[${label}] Response ${index + 1}:`, {
        responseKeys: Object.keys(response),
        hasAdGroupResult: !!response.adGroupResult,
        hasAdGroupCriterionResult: !!response.adGroupCriterionResult,
        hasAdGroupAdResult: !!response.adGroupAdResult,
        fullResponse: JSON.stringify(response, null, 2)
      });
      
      // Extract resource names from different operation types
      if (response.adGroupResult?.resourceName) {
        const adGroupId = extractId(response.adGroupResult.resourceName, "adGroup");
        console.log(`[${label}] Ad Group created:`, {
          resourceName: response.adGroupResult.resourceName,
          adGroupId: adGroupId
        });
      }
      
      if (response.adGroupCriterionResult?.resourceName) {
        const criterionId = extractId(response.adGroupCriterionResult.resourceName, "criterion");
        console.log(`[${label}] Keyword created:`, {
          resourceName: response.adGroupCriterionResult.resourceName,
          criterionId: criterionId
        });
      }
      
      if (response.adGroupAdResult?.resourceName) {
        const adId = extractId(response.adGroupAdResult.resourceName, "ad");
        console.log(`[${label}] Ad created:`, {
          resourceName: response.adGroupAdResult.resourceName,
          adId: adId
        });
      }
    });
  }

  // Check for partial failure errors
  if (data.partialFailureError) {
    console.error(`[${label}] Partial failure detected:`, JSON.stringify(data.partialFailureError, null, 2));
    
    // Try to extract specific error details from partial failure
    if (data.partialFailureError.details) {
      console.error(`[${label}] Partial failure details:`, JSON.stringify(data.partialFailureError.details, null, 2));
    }
  }

  return data.mutateOperationResponses || [];
}

// Call specific resource mutate endpoint (e.g., /campaigns:mutate, /campaignBudgets:mutate)
async function callResourceMutate(
  customerId: string,
  accessToken: string,
  resourceType: string,
  operations: any[],
  config: GoogleAdsConfig,
  label: string
) {
  console.log(`[${label}] Sending ${operations.length} ${resourceType} mutate operations`);
  console.log(`[${label}] Operations payload:`, JSON.stringify(operations, null, 2));

  const url = `${GOOGLE_ADS_BASE_URL}/${customerId}/${resourceType}:mutate`;
  console.log(`[${label}] Calling Google Ads API:`, url);
  
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "developer-token": config.developerToken,
    ...(config.loginCustomerId ? { "login-customer-id": config.loginCustomerId } : {}),
  };
  
  console.log(`[${label}] Request headers:`, { ...headers, Authorization: "Bearer [REDACTED]" });
  
  const payload = { operations: operations };
  console.log(`[${label}] Request payload:`, JSON.stringify(payload, null, 2));
  
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(`[${label}] Google Ads mutate response was not JSON, dumping raw text:`, text.substring(0, 500));
      console.error(`[${label}] Response status:`, response.status, response.statusText);
      console.error(`[${label}] Response headers:`, Object.fromEntries(response.headers.entries()));
      throw new Error(`Google Ads API returned non-JSON response (${response.status}): ${text.substring(0, 200)}`);
    }
  }

  if (!response.ok) {
    console.error(`[${label}] Google Ads mutate error:`, data);
    
    // Handle Google Ads API specific errors
    if (data.error?.details) {
      const details = data.error.details;
      console.error(`[${label}] Error details:`, JSON.stringify(details, null, 2));
      
      // Extract specific error messages from details
      if (Array.isArray(details)) {
        const errorMessages = details
          .map((detail: any) => detail.error?.errors?.map((e: any) => e.message).join("; "))
          .filter(Boolean)
          .join(" | ");
        if (errorMessages) {
          throw new Error(`Google Ads API error: ${errorMessages}`);
        }
      }
    }
    
    throw new Error(data.error?.message || data.error?.description || `Google Ads mutate failed (${response.status})`);
  }

  console.log(`[${label}] mutate response summary:`, {
    results: data.results?.length || 0,
    partialFailureError: data.partialFailureError ? true : false,
  });

  // Check for partial failure errors
  if (data.partialFailureError) {
    console.warn(`[${label}] Partial failure detected:`, data.partialFailureError);
  }

  return data.results || [];
}

function extractId(resourceName?: string, type?: string) {
  if (!resourceName) return null;
  const match = resourceName.match(/\/([0-9]+)$/);
  if (match) return match[1];
  console.warn(`Unable to extract id for ${type}:`, resourceName);
  return null;
}

async function createCampaignAndBudget(
  request: CreateGoogleAdsCampaignRequest,
  config: GoogleAdsConfig,
  dailyBudgetMicros: number,
  accessToken: string,
  geoTargets: string[],
  properties: Property[],
  ageRange?: string
) {
  // Ensure minimum budget (Google Ads typically requires at least $1 USD daily)
  const minBudgetMicros = 1_000_000; // $1 USD in micros
  // Round to nearest multiple of 10,000 micros (minimum currency unit for USD = $0.01)
  const MIN_CURRENCY_UNIT_MICROS = 10_000; // $0.01 USD
  const roundedBudgetMicros = Math.round(dailyBudgetMicros / MIN_CURRENCY_UNIT_MICROS) * MIN_CURRENCY_UNIT_MICROS;
  const finalBudgetMicros = Math.max(roundedBudgetMicros, minBudgetMicros);
  
  console.log("Budget calculation:", {
    originalBudgetMicros: dailyBudgetMicros,
    roundedBudgetMicros: roundedBudgetMicros,
    finalBudgetMicros,
    budgetUSD: finalBudgetMicros / 1_000_000,
    roundedToCurrencyUnit: true,
  });

  const uniqueCampaignName = generateUniqueCampaignName(
    request.campaign_name,
    properties,
    request.campaign_id
  );
  
  console.log("[createCampaignAndBudget] Starting budget and campaign creation", {
    budgetCustomerId: config.customerId, // Customer ID for budget
    campaignCustomerId: config.customerId, // Customer ID for campaign
    originalCampaignName: request.campaign_name,
    uniqueCampaignName,
    originalBudgetMicros: dailyBudgetMicros,
    finalBudgetMicros,
    budgetUSD: finalBudgetMicros / 1_000_000,
    geoTargets,
    ageRange,
    propertiesCount: properties.length,
  });
  
  // Step 1: Create budget first using Customer ID
  // Per official REST API example: Use /campaignBudgets:mutate endpoint with { operations: [{ create: {...} }] }
  console.log("[createCampaignAndBudget] Step 1: Creating budget using customer ID:", config.customerId);
  const budgetOperation = {
    create: {
      // Do NOT include resourceName in create operation - let Google Ads assign it
      name: `${uniqueCampaignName} Budget`,
      deliveryMethod: "STANDARD",
      amountMicros: finalBudgetMicros,
      explicitlyShared: false,
    },
  };
  
  console.log("[createCampaignAndBudget] Budget operation prepared:", {
    operation: "CREATE",
    budgetName: `${uniqueCampaignName} Budget`,
    deliveryMethod: "STANDARD",
    amountMicros: finalBudgetMicros,
    amountUSD: finalBudgetMicros / 1_000_000,
    explicitlyShared: false,
    fullOperation: JSON.stringify(budgetOperation, null, 2),
  });
  
  const budgetRequestStartTime = Date.now();
  let budgetResponses: any[];
  
  try {
    budgetResponses = await callResourceMutate(
      config.customerId, // Use Customer ID for budget creation
      accessToken,
      "campaignBudgets",
      [budgetOperation],
      config,
      "budget-creation"
    );
    
    const budgetRequestDuration = Date.now() - budgetRequestStartTime;
    console.log("[createCampaignAndBudget] Budget creation completed successfully", {
      durationMs: budgetRequestDuration,
      responseCount: budgetResponses.length,
      fullResponse: JSON.stringify(budgetResponses, null, 2),
    });
  } catch (error: any) {
    const budgetRequestDuration = Date.now() - budgetRequestStartTime;
    console.error("[createCampaignAndBudget] Budget creation failed", {
      durationMs: budgetRequestDuration,
      error: error.message,
      errorStack: error.stack,
    });
    throw error;
  }

  // Extract budget ID from response
  // Response structure from /campaignBudgets:mutate: { results: [{ resourceName: "...", ... }] }
  let budgetId: string | null = null;
  let actualBudgetResourceName: string | null = null;
  
  budgetResponses.forEach((resp: any, index: number) => {
    console.log(`[createCampaignAndBudget] Processing budget response ${index + 1}/${budgetResponses.length}:`, {
      responseKeys: Object.keys(resp),
      hasResourceName: !!resp.resourceName,
      fullResponse: JSON.stringify(resp, null, 2),
    });
    
    if (resp.resourceName) {
      actualBudgetResourceName = resp.resourceName;
      budgetId = extractId(actualBudgetResourceName || undefined, "budget");
      console.log("[createCampaignAndBudget] Budget created successfully:", {
        budgetId,
        resourceName: actualBudgetResourceName,
        extractedId: budgetId,
      });
    }
  });

  if (!budgetId || !actualBudgetResourceName) {
    console.error("[createCampaignAndBudget] Failed to extract budget ID", {
      responses: JSON.stringify(budgetResponses, null, 2),
    });
    throw new Error("Failed to extract budget ID from Google Ads response");
  }

  // Step 2: Create campaign using GADS_CUSTOMER_ID referencing the actual budget resource name
  // Per official REST API example: Use /campaigns:mutate endpoint with { operations: [{ create: {...} }] }
  console.log("[createCampaignAndBudget] Step 2: Creating campaign using customer ID:", config.customerId, "with budget:", actualBudgetResourceName);
  
  // Per campaignoperation.md: "Create operation: No resource name is expected for the new campaign."
  const campaignCreate: any = {
    // Do NOT include resourceName in create operation - per official docs
    campaignBudget: actualBudgetResourceName,  // Use actual budget resource name (camelCase)
    name: uniqueCampaignName,  // Unique name with property details and UUID
    advertisingChannelType: "SEARCH",  // Required field (camelCase)
    status: "ENABLED",
    containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",  // Required field (camelCase)
    manualCpc: {
      enhancedCpcEnabled: false,
    },  // Use target_spend bidding strategy as per guide example
    networkSettings: {
      targetGoogleSearch: true,  // camelCase
      targetSearchNetwork: true,
      targetContentNetwork: false,
      targetPartnerSearchNetwork: false,
    },
  };

  // Add optional date fields only if they have valid values (camelCase)
  const startDate = formatDate(request.duration_start);
  const endDate = formatDate(request.duration_end);
  if (startDate) {
    campaignCreate.startDate = startDate;  // camelCase, YYYYMMDD format
    console.log("[createCampaignAndBudget] Campaign start date set:", startDate);
  } else {
    console.log("[createCampaignAndBudget] No start date provided, campaign will start immediately");
  }
  if (endDate) {
    campaignCreate.endDate = endDate;  // camelCase, YYYYMMDD format
    console.log("[createCampaignAndBudget] Campaign end date set:", endDate);
  } else {
    console.log("[createCampaignAndBudget] No end date provided, campaign will run indefinitely");
  }

  // Use /campaigns:mutate endpoint per official REST API example
  // Structure: { operations: [{ create: {...} }] }
  const campaignOperation = {
    create: campaignCreate,
  };
  
  console.log("[createCampaignAndBudget] Campaign operation prepared:", {
    operation: "CREATE",
    campaignName: uniqueCampaignName,
    advertisingChannelType: "SEARCH",
    status: "PAUSED",
    campaignBudget: actualBudgetResourceName,
    containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
    biddingStrategy: "targetSpend (empty object)",
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: true,
      targetPartnerSearchNetwork: false,
    },
    startDate: campaignCreate.startDate || "not set",
    endDate: campaignCreate.endDate || "not set",
    fullOperation: JSON.stringify(campaignOperation, null, 2),
  });
  
  const campaignRequestStartTime = Date.now();
  let campaignResponses: any[];
  
  try {
    campaignResponses = await callResourceMutate(
      config.customerId,
      accessToken,
      "campaigns",
      [campaignOperation],
      config,
      "campaign-creation"
    );
    
    const campaignRequestDuration = Date.now() - campaignRequestStartTime;
    console.log("[createCampaignAndBudget] Campaign creation completed successfully", {
      durationMs: campaignRequestDuration,
      responseCount: campaignResponses.length,
      fullResponse: JSON.stringify(campaignResponses, null, 2),
    });
  } catch (error: any) {
    const campaignRequestDuration = Date.now() - campaignRequestStartTime;
    console.error("[createCampaignAndBudget] Campaign creation failed", {
      durationMs: campaignRequestDuration,
      error: error.message,
      errorStack: error.stack,
    });
    throw error;
  }

  // Extract campaign ID from response
  // Response structure from /campaigns:mutate: { results: [{ resourceName: "...", ... }] }
  let campaignId: string | null = null;
  let actualCampaignResourceName: string | null = null;
  
  campaignResponses.forEach((resp: any, index: number) => {
    console.log(`[createCampaignAndBudget] Processing campaign response ${index + 1}/${campaignResponses.length}:`, {
      responseKeys: Object.keys(resp),
      hasResourceName: !!resp.resourceName,
      fullResponse: JSON.stringify(resp, null, 2),
    });
    
    if (resp.resourceName) {
      actualCampaignResourceName = resp.resourceName;
      campaignId = extractId(actualCampaignResourceName || undefined, "campaign");
      console.log("[createCampaignAndBudget] Campaign created successfully:", {
        campaignId,
        resourceName: actualCampaignResourceName,
        extractedId: campaignId,
      });
    }
  });

  if (!campaignId || !actualCampaignResourceName) {
    console.error("[createCampaignAndBudget] Failed to extract campaign ID", {
      responses: JSON.stringify(campaignResponses, null, 2),
    });
    throw new Error("Failed to extract campaign ID from Google Ads response");
  }
  
  console.log("[createCampaignAndBudget] Campaign and budget created successfully:", {
    budgetId,
    campaignId,
    budgetResourceName: actualBudgetResourceName,
    campaignResourceName: actualCampaignResourceName,
    success: true,
  });

  return {
    campaignId,
    budgetId,
    campaignResourceName: actualCampaignResourceName,
  };
}

async function createAdGroupsAds(
  config: GoogleAdsConfig,
  campaignId: string,
  properties: Property[],
  audienceInterests: string[],
  accessToken: string,
  campaignResourceName?: string  // Optional: temp resource name for atomic transactions
) {
  if (!properties.length) {
    console.log("No properties provided, skipping ad group creation");
    return { adGroups: 0, keywords: 0, ads: 0 };
  }

  // Use actual campaign resource name (campaign already created)
  const actualCampaignResourceName = campaignResourceName || `customers/${config.customerId}/campaigns/${campaignId}`;
  const operations: any[] = [];
  const stats = { adGroups: 0, keywords: 0, ads: 0 };

  properties.forEach((property, index) => {
    // Use unique negative temp IDs: -2, -3, -4, etc. (-1 is used for budget)
    const adGroupTempId = -(index + 2);
    const adGroupResourceName = `customers/${config.customerId}/adGroups/${adGroupTempId}`;
    const adGroupName = `${property.title.substring(0, 255)} - ${property.location}`.substring(0, 255);

    operations.push({
      adGroupOperation: {
        create: {
          resourceName: adGroupResourceName,  // camelCase for REST API JSON
          name: adGroupName,
          campaign: actualCampaignResourceName,  // Use actual or temp campaign resource name
          status: "ENABLED",
          type: "SEARCH_STANDARD",
          cpcBidMicros: 10_000_000,  // camelCase
        },
      },
    });
    stats.adGroups++;

    const keywords = generateKeywords(audienceInterests, [property]);
    keywords.slice(0, 20).forEach((keyword) => {
      operations.push({
        adGroupCriterionOperation: {
          create: {
            adGroup: adGroupResourceName,  // camelCase for REST API JSON
            status: "ENABLED",
            keyword: {
              text: keyword,
              matchType: "BROAD",  // camelCase
            },
          },
        },
      });
      stats.keywords++;
    });

    const headlines = generateAdHeadlines(property);
    const descriptions = generateAdDescriptions(property);

    // Sanitize path2: remove commas, keep only letters/numbers/hyphens, limit to 15 chars
    const sanitizePath = (text: string): string => {
      return text
        .toLowerCase()
        .replace(/,/g, "") // Remove commas
        .replace(/[^a-z0-9\s-]/g, "") // Keep only letters, numbers, spaces, and hyphens
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .substring(0, 15); // Limit to 15 characters
    };

    operations.push({
      adGroupAdOperation: {
        create: {
          adGroup: adGroupResourceName,  // camelCase for REST API JSON
          status: "ENABLED",
          ad: {
            responsiveSearchAd: {  // camelCase
              headlines: headlines.map((text) => ({ text })),
              descriptions: descriptions.map((text) => ({ text })),
              path1: "properties", // Already clean - no commas, under 15 chars
              path2: sanitizePath(property.location || "kenya"),
            },
            finalUrls: [`https://realaist.tech/properties/${property.id}`],  // camelCase
          },
        },
      },
    });
    stats.ads++;
  });

  console.log(`[createAdGroupsAds] Starting ad group creation for ${properties.length} properties`);
  console.log(`[createAdGroupsAds] Total operations to send:`, {
    adGroups: stats.adGroups,
    keywords: stats.keywords,
    ads: stats.ads,
    totalOperations: operations.length
  });

  try {
    const responses = await callGoogleAdsMutate(
      config.customerId,
      accessToken,
      operations,
      config,
      "ad-groups"
    );

    console.log(`[createAdGroupsAds] Ad group creation completed successfully`);
    
    // Count successful creations from responses
    let actualStats = {
      adGroups: 0,
      keywords: 0,
      ads: 0,
      totalResponses: responses.length
    };

    responses.forEach((response: any, index: number) => {
      if (response.adGroupResult?.resourceName) {
        actualStats.adGroups++;
      }
      if (response.adGroupCriterionResult?.resourceName) {
        actualStats.keywords++;
      }
      if (response.adGroupAdResult?.resourceName) {
        actualStats.ads++;
      }
    });

    console.log(`[createAdGroupsAds] Final creation stats:`, {
      expected: stats,
      actual: actualStats,
      success: actualStats.totalResponses === operations.length
    });

    return actualStats;
  } catch (error: any) {
    console.error(`[createAdGroupsAds] Ad group creation failed:`, {
      error: error.message,
      expectedOperations: operations.length,
      errorStack: error.stack
    });
    throw error;
  }
}

function generateKeywords(interests: string[], properties: Property[]) {
  const keywords = new Set<string>();

  interests.forEach((interest) => {
    const value = interest.toLowerCase().replace(/,/g, ""); // Remove commas
    keywords.add(value);
    keywords.add(`${value} property`);
    keywords.add(`${value} real estate`);
  });

  properties.forEach((property) => {
    if (property.location) {
      const loc = property.location.toLowerCase().replace(/,/g, ""); // Remove commas
      keywords.add(`property in ${loc}`);
      keywords.add(`${loc} real estate`);
      keywords.add(`${loc} houses`);
    }
    if (property.property_type) {
      const type = property.property_type.toLowerCase().replace(/,/g, ""); // Remove commas
      keywords.add(type);
      keywords.add(`${type} for sale`);
    }
    if (property.bedrooms) {
      keywords.add(`${property.bedrooms} bedroom house`);
    }
  });

  keywords.add("property for sale");
  keywords.add("houses for sale");
  keywords.add("real estate in kenya");

  return Array.from(keywords);
}

function generateAdHeadlines(property: Property) {
  const headlines: string[] = [];

  // Headlines must be 15-30 characters each, minimum 3, maximum 15 headlines
  if (property.property_type && property.location) {
    const headline = `${property.property_type} in ${property.location}`;
    if (headline.length >= 15 && headline.length <= 30) {
      headlines.push(headline);
    } else if (headline.length > 30) {
      headlines.push(headline.substring(0, 30));
    }
  }

  if (property.bedrooms) {
    const headline = `${property.bedrooms} Bedroom ${property.property_type || "Home"}`;
    if (headline.length >= 15 && headline.length <= 30) {
      headlines.push(headline);
    } else if (headline.length > 30) {
      headlines.push(headline.substring(0, 30));
    }
  }

  if (property.price) {
    const priceInM = (property.price / 1_000_000).toFixed(1);
    const headline = `KES ${priceInM}M Great Deal`;
    if (headline.length >= 15 && headline.length <= 30) {
      headlines.push(headline);
    } else {
      headlines.push(headline.substring(0, 30));
    }
  }

  const fallbacks = [
    "Premium Property for Sale",
    "Your Dream Home Awaits",
    "Invest in Real Estate",
    "Modern Living Spaces",
    "Exclusive Listings",
  ];

  // Add fallback headlines ensuring they meet length requirements
  fallbacks.forEach(fallback => {
    if (headlines.length < 15 && fallback.length >= 15 && fallback.length <= 30) {
      headlines.push(fallback);
    }
  });

  // Fill remaining slots (minimum 3, maximum 15)
  while (headlines.length < 3) {
    const location = property.location || "Kenya";
    const headline = `Property in ${location}`;
    const paddedHeadline = headline.length < 15 
      ? headline.padEnd(15, " - View Now")
      : headline.substring(0, 30);
    headlines.push(paddedHeadline);
  }

  // Ensure we have at least 3 and at most 15 headlines
  return headlines.slice(0, 15);
}

function generateAdDescriptions(property: Property) {
  const descriptions: string[] = [];

  // Descriptions must be 30-90 characters each, minimum 2, maximum 4 descriptions
  const desc1 = `${property.property_type || "Property"} with ${property.bedrooms || "spacious"} rooms`;
  if (desc1.length >= 30 && desc1.length <= 90) {
    descriptions.push(desc1);
  } else if (desc1.length < 30) {
    descriptions.push(desc1 + ". Modern amenities included. Great location.");
  } else {
    descriptions.push(desc1.substring(0, 90));
  }

  const desc2 = `Located in ${property.location || "prime area"}. Modern amenities included.`;
  if (desc2.length >= 30 && desc2.length <= 90) {
    descriptions.push(desc2);
  } else {
    descriptions.push(desc2.substring(0, 90));
  }

  const desc3 = "Book a viewing today. Flexible payment plans available.";
  if (desc3.length >= 30 && desc3.length <= 90) {
    descriptions.push(desc3);
  } else {
    descriptions.push(desc3.substring(0, 90));
  }

  const desc4 = "Quality construction, secure neighborhood, great investment opportunity.";
  if (desc4.length >= 30 && desc4.length <= 90) {
    descriptions.push(desc4);
  } else {
    descriptions.push(desc4.substring(0, 90));
  }

  // Ensure we have at least 2 and at most 4 descriptions
  return descriptions.slice(0, 4);
}

serve(async (req) => {
  console.log("Edge Function (REST) called:", {
    method: req.method,
    url: req.url,
    hasAuth: !!req.headers.get("Authorization"),
  });

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("User authentication failed:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let requestData: CreateGoogleAdsCampaignRequest;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("Failed to parse request body", parseError);
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      campaign_id,
      campaign_name,
      budget,
      target_location = [],
      target_age_group,
      duration_start,
      duration_end,
      audience_interests = [],
      property_ids = [],
      platforms = [],
    } = requestData;

    if (!campaign_id || !campaign_name || !budget) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!platforms.includes("google")) {
      return new Response(
        JSON.stringify({ error: "Google Ads platform not selected for this campaign" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let properties: Property[] = [];
    if (property_ids.length) {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, description, location, price, property_type, bedrooms, bathrooms, square_feet")
        .in("id", property_ids);

      if (error) {
        console.error("Error fetching properties:", error);
      } else {
        properties = data as Property[];
      }
    }

    let customerId = Deno.env.get("GADS_CUSTOMER_ID") || Deno.env.get("GADS_LOGIN_CUSTOMER_ID") || "";
    // Remove dashes from customer ID if present (Google Ads expects numeric format)
    customerId = customerId.replace(/-/g, "");

    let loginCustomerId = Deno.env.get("GADS_LOGIN_CUSTOMER_ID") || "";
    // Remove dashes from login customer ID if present
    loginCustomerId = loginCustomerId.replace(/-/g, "");
    
    // If loginCustomerId is a placeholder, empty, or same as customerId, don't use it
    if (!loginCustomerId || 
        loginCustomerId.includes("your_") || 
        loginCustomerId.includes("placeholder") ||
        loginCustomerId === customerId) {
      loginCustomerId = "";
    }

    const googleAdsConfig: GoogleAdsConfig = {
      developerToken: Deno.env.get("GADS_DEV_TOKEN") || "",
      clientId: Deno.env.get("GADS_CLIENT_ID") || "",
      clientSecret: Deno.env.get("GADS_CLIENT_SECRET") || "",
      refreshToken: Deno.env.get("GADS_REFRESH_TOKEN") || "",
      mccCustomerId: Deno.env.get("GADS_MCC_ID") || "",
      loginCustomerId: loginCustomerId || undefined,
      customerId: customerId,
    };

    console.log("Google Ads Config:", {
      customerId: googleAdsConfig.customerId, // Used for both budget and campaign creation
      mccCustomerId: googleAdsConfig.mccCustomerId || "not set", // Available but not used
      budgetCustomerId: googleAdsConfig.customerId, // Same as customer ID
      hasDeveloperToken: !!googleAdsConfig.developerToken,
      hasClientId: !!googleAdsConfig.clientId,
      hasRefreshToken: !!googleAdsConfig.refreshToken,
      loginCustomerId: googleAdsConfig.loginCustomerId || "not set",
    });

    const missingCredentials = Object.entries(googleAdsConfig)
      .filter(([key, value]) => !value && key !== "mccCustomerId" && key !== "loginCustomerId")
      .map(([key]) => key);

    if (missingCredentials.length) {
      return new Response(
        JSON.stringify({ error: `Missing Google Ads credentials: ${missingCredentials.join(", ")}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const startDate = duration_start ? new Date(duration_start) : null;
    const endDate = duration_end ? new Date(duration_end) : null;
    const durationMs =
      startDate && endDate && !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())
        ? endDate.getTime() - startDate.getTime()
        : null;
    const durationDays = durationMs && durationMs > 0 ? Math.ceil(durationMs / (1000 * 60 * 60 * 24)) : 1;
    const totalBudgetUSD = budget / KES_TO_USD_RATE;
    const dailyBudgetUSD = durationDays > 0 ? totalBudgetUSD / durationDays : totalBudgetUSD;
    const dailyBudgetMicros = Math.round(dailyBudgetUSD * 1_000_000);

    const ageRange = target_age_group ? AGE_RANGE_MAPPING[target_age_group] : undefined;
    const geoTargets = target_location.length
      ? target_location.map((loc) => KENYA_GEO_TARGETS[loc] || KENYA_GEO_TARGETS["Kenya"])
      : [KENYA_GEO_TARGETS["Kenya"]];

    try {
      const accessToken = await getGoogleAccessToken(googleAdsConfig);

      const { campaignId, budgetId } = await createCampaignAndBudget(
        requestData,
        googleAdsConfig,
        dailyBudgetMicros,
        accessToken,
        geoTargets,
        properties,
        ageRange
      );

      console.log(`[main] Starting ad groups and ads creation...`);
      let stats: any = null;
      try {
        stats = await createAdGroupsAds(
          googleAdsConfig,
          campaignId,
          properties,
          audience_interests,
          accessToken
        );
      } catch (adGroupError: any) {
        console.error("[main] Ad groups/ads creation failed but campaign was created successfully", {
          campaignId,
          budgetId,
          error: adGroupError?.message,
          errorStack: adGroupError?.stack,
        });
        // Do not rethrow here so that the overall campaign creation can still be treated as success
      }

      console.log(`[main] Campaign creation process completed successfully:`, {
        campaignId,
        budgetId,
        stats,
        success: true
      });

      const successResponse = {
        success: true,
        googleAdsCampaignId: campaignId,  // Frontend expects this field name
        campaignId,  // Keep for backwards compatibility
        budgetId,
        stats,
        message: "Google Ads campaign created successfully via REST",
      };

      console.log(`[main] Sending success response:`, JSON.stringify(successResponse, null, 2));

      return new Response(
        JSON.stringify(successResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (err: any) {
      console.error("[main] Google Ads REST error:", {
        message: err.message,
        stack: err.stack,
        name: err.name,
        cause: err.cause,
        errorObject: JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
      });
      
      const errorResponse = { 
        error: err.message || "Failed to create Google Ads campaign",
        errorType: err.name || "Unknown",
        timestamp: new Date().toISOString()
      };
      
      console.error("[main] Sending error response:", JSON.stringify(errorResponse, null, 2));
      
      return new Response(
        JSON.stringify(errorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("[edge-function] REST Edge Function error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    });
    
    const errorResponse = { 
      error: error.message || "Failed to create Google Ads campaign",
      errorType: error.name || "Unknown",
      location: "edge-function",
      timestamp: new Date().toISOString()
    };
    
    console.error("[edge-function] Sending error response:", JSON.stringify(errorResponse, null, 2));
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
