# Google Ads API v22 - Mutate Operations Reference

This document provides comprehensive reference for all mutate operations used in the Realaist Google Ads campaign creation flow. All information is based on the official Google Ads API v22 documentation.

**Reference Links:**
- [MutateOperation](https://developers.google.com/google-ads/api/reference/rpc/v22/MutateOperation)
- [GoogleAdsService.Mutate](https://developers.google.com/google-ads/api/reference/rpc/v22/GoogleAdsService/Mutate?transport=rest)
- [Campaign](https://developers.google.com/google-ads/api/reference/rpc/v22/Campaign)

---

## Table of Contents

1. [CampaignBudgetOperation](#campaignbudgetoperation)
2. [CampaignOperation](#campaignoperation)
3. [AdGroupOperation](#adgroupoperation)
4. [AdGroupCriterionOperation](#adgroupcriterionoperation)
5. [AdGroupAdOperation](#adgroupadoperation)
6. [Related Objects](#related-objects)

---

## CampaignBudgetOperation

**Reference:** [CampaignBudgetOperation](https://developers.google.com/google-ads/api/reference/rpc/v22/CampaignBudgetOperation)

### Structure

```typescript
{
  campaign_budget_operation: {
    create: {
      resource_name: string,  // Required: e.g., "customers/{customer_id}/campaignBudgets/-1"
      name: string,           // Required: Budget name
      delivery_method: enum,  // Required: BudgetDeliveryMethod
      amount_micros: int64,   // Required: Budget amount in micros (1 USD = 1,000,000 micros)
      explicitly_shared?: bool, // Optional: Whether budget is shared
      // ... other optional fields
    }
  }
}
```

### Required Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `resource_name` | string | Resource name with temp ID for atomic operations | Format: `customers/{customer_id}/campaignBudgets/-1` |
| `name` | string | Budget name | Cannot be empty, max 255 characters |
| `delivery_method` | enum | Budget delivery method | Must be `STANDARD` or `ACCELERATED` |
| `amount_micros` | int64 | Daily budget in micros | Minimum: 1,000,000 micros ($1 USD) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `explicitly_shared` | bool | Whether budget is shared across campaigns |
| `period` | enum | Budget period (DAILY, CUSTOM_PERIOD) |
| `total_amount_micros` | int64 | Total budget for custom period |

### BudgetDeliveryMethod Enum

- `STANDARD`: Budget is delivered evenly throughout the day
- `ACCELERATED`: Budget is delivered as quickly as possible

### Example

```typescript
{
  entity: "campaign_budget",
  operation: "create",
  resource: {
    resource_name: "customers/1234567890/campaignBudgets/-1",
    name: "Property Campaign Budget",
    delivery_method: enums.BudgetDeliveryMethod.STANDARD,
    amount_micros: 10000000, // $10 USD daily
    explicitly_shared: false
  }
}
```

---

## CampaignOperation

**Reference:** [CampaignOperation](https://developers.google.com/google-ads/api/reference/rpc/v22/CampaignOperation) | [Campaign](https://developers.google.com/google-ads/api/reference/rpc/v22/Campaign)

### Structure

```typescript
{
  campaign_operation: {
    create: {
      name: string,                    // Required
      advertising_channel_type: enum,  // Required
      status: enum,                    // Optional (defaults to ENABLED)
      campaign_budget: string,         // Required: Resource name
      // Bidding strategy (one of the following):
      manual_cpc?: ManualCpc,
      target_spend?: TargetSpend,
      // ... other bidding strategies
      network_settings?: NetworkSettings,
      start_date?: string,             // Format: YYYYMMDD
      end_date?: string,               // Format: YYYYMMDD
      // ... other optional fields
    }
  }
}
```

### Required Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `name` | string | Campaign name | Cannot be empty, cannot contain null (0x0), NL (0xA), or CR (0xD) |
| `advertising_channel_type` | enum | Primary serving target | Must be `SEARCH`, `DISPLAY`, `SHOPPING`, etc. |
| `campaign_budget` | string | Budget resource name | Can use temp resource name from same request |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `status` | enum | Campaign status | `ENABLED` |
| `manual_cpc` | ManualCpc | Manual CPC bidding | - |
| `target_spend` | TargetSpend | Target spend bidding | - |
| `network_settings` | NetworkSettings | Network targeting | - |
| `start_date` | string | Start date | Current date |
| `end_date` | string | End date | 2037-12-30 (indefinite) |
| `geo_target_type_setting` | GeoTargetTypeSetting | Geo targeting settings | - |

### AdvertisingChannelType Enum

- `SEARCH`: Search campaigns
- `DISPLAY`: Display campaigns
- `SHOPPING`: Shopping campaigns
- `HOTEL`: Hotel campaigns
- `VIDEO`: Video campaigns
- `MULTI_CHANNEL`: Multi-channel campaigns
- `PERFORMANCE_MAX`: Performance Max campaigns

### CampaignStatus Enum

- `UNSPECIFIED`: Not specified
- `UNKNOWN`: Unknown status
- `ENABLED`: Campaign is enabled
- `PAUSED`: Campaign is paused
- `REMOVED`: Campaign is removed

### ManualCpc Object

```typescript
{
  enhanced_cpc_enabled: bool  // Optional: Enable Enhanced CPC
}
```

### TargetSpend Object

```typescript
{
  // Empty object - no additional fields required
}
```

### NetworkSettings Object

**Reference:** [NetworkSettings](https://developers.google.com/google-ads/api/reference/rpc/v22/NetworkSettings)

```typescript
{
  target_google_search: bool,           // Show on Google Search
  target_search_network: bool,          // Show on search partner sites
  target_content_network: bool,         // Show on Google Display Network
  target_partner_search_network: bool   // Show on search partner sites
}
```

### GeoTargetTypeSetting Object

**Reference:** [GeoTargetTypeSetting](https://developers.google.com/google-ads/api/reference/rpc/v22/GeoTargetTypeSetting)

```typescript
{
  positive_geo_target_type: enum,  // PRESENCE_OR_INTEREST, PRESENCE
  negative_geo_target_type: enum   // PRESENCE_OR_INTEREST, PRESENCE
}
```

### Example

```typescript
{
  entity: "campaign",
  operation: "create",
  resource: {
    name: "Property Campaign - 11/18/2025",
    advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
    status: enums.CampaignStatus.PAUSED,
    manual_cpc: {
      enhanced_cpc_enabled: false
    },
    campaign_budget: "customers/1234567890/campaignBudgets/-1", // Temp resource name
    network_settings: {
      target_google_search: true,
      target_search_network: true,
      target_content_network: false,
      target_partner_search_network: false
    },
    start_date: "20251118",  // YYYYMMDD format
    end_date: "20251231"     // YYYYMMDD format
  }
}
```

---

## AdGroupOperation

**Reference:** [AdGroupOperation](https://developers.google.com/google-ads/api/reference/rpc/v22/AdGroupOperation) | [AdGroup](https://developers.google.com/google-ads/api/reference/rpc/v22/AdGroup)

### Structure

```typescript
{
  ad_group_operation: {
    create: {
      resource_name: string,  // Required: Temp resource name
      name: string,           // Required: Ad group name
      campaign: string,       // Required: Campaign resource name
      status: enum,           // Optional (defaults to ENABLED)
      type: enum,             // Optional: Ad group type
      cpc_bid_micros: int64,  // Optional: Default CPC bid
      // ... other optional fields
    }
  }
}
```

### Required Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `resource_name` | string | Resource name with temp ID | Format: `customers/{customer_id}/adGroups/-2` |
| `name` | string | Ad group name | Cannot be empty, max 255 characters |
| `campaign` | string | Campaign resource name | Can use actual or temp resource name |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `status` | enum | Ad group status | `ENABLED` |
| `type` | enum | Ad group type | `SEARCH_STANDARD` |
| `cpc_bid_micros` | int64 | Default CPC bid in micros | - |
| `cpm_bid_micros` | int64 | Default CPM bid in micros | - |
| `cpv_bid_micros` | int64 | Default CPV bid in micros | - |

### AdGroupStatus Enum

- `UNSPECIFIED`: Not specified
- `UNKNOWN`: Unknown status
- `ENABLED`: Ad group is enabled
- `PAUSED`: Ad group is paused
- `REMOVED`: Ad group is removed

### AdGroupType Enum

- `UNSPECIFIED`: Not specified
- `UNKNOWN`: Unknown type
- `SEARCH_STANDARD`: Standard search ad group
- `SEARCH_DYNAMIC_ADS`: Dynamic search ads
- `DISPLAY_STANDARD`: Standard display ad group
- `SHOPPING_PRODUCT_ADS`: Shopping product ads
- `HOTEL_ADS`: Hotel ads
- `VIDEO_RESPONSIVE`: Video responsive ads
- `VIDEO_TRUE_VIEW_IN_STREAM`: TrueView in-stream
- `VIDEO_TRUE_VIEW_IN_DISPLAY`: TrueView in-display
- `VIDEO_NON_SKIPPABLE_IN_STREAM`: Non-skippable in-stream
- `VIDEO_OUTSTREAM`: Video outstream
- `VIDEO_SEQUENCE`: Video sequence

### Example

```typescript
{
  entity: "ad_group",
  operation: "create",
  resource: {
    resource_name: "customers/1234567890/adGroups/-2",
    name: "Property Title - Location",
    campaign: "customers/1234567890/campaigns/12345",
    status: enums.AdGroupStatus.ENABLED,
    type: enums.AdGroupType.SEARCH_STANDARD,
    cpc_bid_micros: 10000000  // $10 USD
  }
}
```

---

## AdGroupCriterionOperation

**Reference:** [AdGroupCriterionOperation](https://developers.google.com/google-ads/api/reference/rpc/v22/AdGroupCriterionOperation) | [AdGroupCriterion](https://developers.google.com/google-ads/api/reference/rpc/v22/AdGroupCriterion)

### Structure

```typescript
{
  ad_group_criterion_operation: {
    create: {
      ad_group: string,       // Required: Ad group resource name
      status: enum,           // Optional (defaults to ENABLED)
      keyword?: KeywordInfo,  // For keyword targeting
      // ... other criterion types
    }
  }
}
```

### Required Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `ad_group` | string | Ad group resource name | Can use temp resource name |
| `keyword` | KeywordInfo | Keyword information | Required for keyword criteria |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `status` | enum | Criterion status | `ENABLED` |
| `negative` | bool | Whether this is a negative criterion | `false` |

### KeywordInfo Object

**Reference:** [KeywordInfo](https://developers.google.com/google-ads/api/reference/rpc/v22/KeywordInfo)

```typescript
{
  text: string,        // Required: Keyword text
  match_type: enum     // Required: Keyword match type
}
```

### KeywordMatchType Enum

- `UNSPECIFIED`: Not specified
- `UNKNOWN`: Unknown match type
- `EXACT`: Exact match
- `PHRASE`: Phrase match
- `BROAD`: Broad match

### AdGroupCriterionStatus Enum

- `UNSPECIFIED`: Not specified
- `UNKNOWN`: Unknown status
- `ENABLED`: Criterion is enabled
- `PAUSED`: Criterion is paused
- `REMOVED`: Criterion is removed

### Example

```typescript
{
  entity: "ad_group_criterion",
  operation: "create",
  resource: {
    ad_group: "customers/1234567890/adGroups/-2", // Temp resource name
    keyword: {
      text: "property for sale",
      match_type: enums.KeywordMatchType.BROAD
    },
    status: enums.AdGroupCriterionStatus.ENABLED
  }
}
```

---

## AdGroupAdOperation

**Reference:** [AdGroupAdOperation](https://developers.google.com/google-ads/api/reference/rpc/v22/AdGroupAdOperation) | [AdGroupAd](https://developers.google.com/google-ads/api/reference/rpc/v22/AdGroupAd) | [Ad](https://developers.google.com/google-ads/api/reference/rpc/v22/Ad)

### Structure

```typescript
{
  ad_group_ad_operation: {
    create: {
      ad_group: string,       // Required: Ad group resource name
      status: enum,           // Optional (defaults to ENABLED)
      ad: {
        responsive_search_ad?: ResponsiveSearchAdInfo,
        final_urls: string[]  // Required: Landing page URLs
      }
    }
  }
}
```

### Required Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `ad_group` | string | Ad group resource name | Can use temp resource name |
| `ad.final_urls` | string[] | Landing page URLs | At least one URL required |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `status` | enum | Ad status | `ENABLED` |
| `ad.responsive_search_ad` | ResponsiveSearchAdInfo | Responsive search ad | - |

### ResponsiveSearchAdInfo Object

**Reference:** [ResponsiveSearchAdInfo](https://developers.google.com/google-ads/api/reference/rpc/v22/ResponsiveSearchAdInfo)

```typescript
{
  headlines: AdTextAsset[],     // Required: 3-15 headlines
  descriptions: AdTextAsset[],  // Required: 2-4 descriptions
  path1?: string,               // Optional: First path (max 15 chars)
  path2?: string                // Optional: Second path (max 15 chars)
}
```

### AdTextAsset Object

```typescript
{
  text: string  // Required: Headline or description text
}
```

**Constraints:**
- Headlines: 15-30 characters each, 3-15 headlines required
- Descriptions: 30-90 characters each, 2-4 descriptions required

### AdGroupAdStatus Enum

- `UNSPECIFIED`: Not specified
- `UNKNOWN`: Unknown status
- `ENABLED`: Ad is enabled
- `PAUSED`: Ad is paused
- `REMOVED`: Ad is removed

### Example

```typescript
{
  entity: "ad_group_ad",
  operation: "create",
  resource: {
    ad_group: "customers/1234567890/adGroups/-2", // Temp resource name
    status: enums.AdGroupAdStatus.ENABLED,
    ad: {
      responsive_search_ad: {
        headlines: [
          { text: "Property in Nairobi" },
          { text: "3 Bedroom House" },
          { text: "KES 5M Great Deal" },
          // ... 12 more headlines (15 total)
        ],
        descriptions: [
          { text: "Modern property with 3 bedrooms. Located in prime area." },
          { text: "Contact us today for viewing. Financing options available." },
          { text: "Quality construction, great location, excellent value." },
          { text: "Book a viewing today. Flexible payment plans available." }
        ],
        path1: "properties",
        path2: "nairobi"
      },
      final_urls: [
        "https://realaist.tech/properties/12345"
      ]
    }
  }
}
```

---

## Related Objects

### CampaignCriterionOperation (For Location/Age Targeting)

**Reference:** [CampaignCriterionOperation](https://developers.google.com/google-ads/api/reference/rpc/v22/CampaignCriterionOperation)

#### Location Targeting

```typescript
{
  campaign_criterion_operation: {
    create: {
      campaign: string,  // Required: Campaign resource name
      location: {
        geo_target_constant: string  // Required: Geo target constant resource name
      },
      negative: bool  // Optional: Whether this is negative targeting
    }
  }
}
```

**Geo Target Constant Format:** `geoTargetConstants/{location_id}`

#### Age Range Targeting

```typescript
{
  campaign_criterion_operation: {
    create: {
      campaign: string,  // Required: Campaign resource name
      age_range: {
        type: enum  // Required: Age range type
      }
    }
  }
}
```

**AgeRangeType Enum:**
- `AGE_RANGE_18_24`
- `AGE_RANGE_25_34`
- `AGE_RANGE_35_44`
- `AGE_RANGE_45_54`
- `AGE_RANGE_55_64`
- `AGE_RANGE_65_UP`

---

## Atomic Transaction Best Practices

### 1. Temporary Resource Names

- Use negative numbers for temp IDs: `-1`, `-2`, `-3`, etc.
- Each temp ID must be unique across all resource types in the request
- Resources with temp names must be created before they can be referenced

### 2. Operation Ordering

**Correct Order:**
1. Create CampaignBudget (with temp ID `-1`)
2. Create Campaign (references budget `-1`)
3. Create AdGroups (with temp IDs `-2`, `-3`, etc.)
4. Create AdGroupCriteria (references ad groups)
5. Create AdGroupAds (references ad groups)

**Incorrect Order:**
- Creating Campaign before CampaignBudget (will fail)
- Referencing temp resource before it's created (will fail)

### 3. Grouping by Resource Type

Group operations by resource type to optimize performance:
- All CampaignBudget operations together
- All Campaign operations together
- All AdGroup operations together
- All AdGroupCriterion operations together
- All AdGroupAd operations together

### 4. Error Handling

The mutate operation is atomic:
- If `partialFailure: false` (default): All operations succeed or all fail
- If `partialFailure: true`: Valid operations succeed, invalid ones return errors

---

## Common Field Constraints

### Date Format
- Format: `YYYYMMDD` (e.g., `20251118`)
- No dashes or separators
- Start date: Campaign start date
- End date: Campaign end date (defaults to `20371230` for indefinite)

### Resource Names
- Format: `customers/{customer_id}/{resource_type}/{resource_id}`
- Temp format: `customers/{customer_id}/{resource_type}/-{number}`
- Customer ID: Numeric string (no dashes)

### Amounts (Micros)
- 1 USD = 1,000,000 micros
- Minimum budget: 1,000,000 micros ($1 USD)
- Minimum bid: Varies by currency and location

### String Constraints
- Campaign names: Cannot contain null (0x0), NL (0xA), or CR (0xD) characters
- Ad group names: Max 255 characters
- Headlines: 15-30 characters
- Descriptions: 30-90 characters

---

## References

- [Google Ads API v22 Documentation](https://developers.google.com/google-ads/api/docs/start)
- [MutateOperation Reference](https://developers.google.com/google-ads/api/reference/rpc/v22/MutateOperation)
- [Campaign Reference](https://developers.google.com/google-ads/api/reference/rpc/v22/Campaign)
- [CampaignBudget Reference](https://developers.google.com/google-ads/api/reference/rpc/v22/CampaignBudget)
- [AdGroup Reference](https://developers.google.com/google-ads/api/reference/rpc/v22/AdGroup)
- [AdGroupCriterion Reference](https://developers.google.com/google-ads/api/reference/rpc/v22/AdGroupCriterion)
- [AdGroupAd Reference](https://developers.google.com/google-ads/api/reference/rpc/v22/AdGroupAd)

---

**Last Updated:** 2025-01-27  
**API Version:** v22



