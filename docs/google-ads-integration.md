# Google Ads API Integration

## Overview

This document describes the Google Ads API integration for creating campaigns when they are approved by an admin.

## Flow

1. **Campaign Creation**: Developer creates a campaign with Google Ads platform selected
2. **Payment**: Developer pays for the campaign via Paystack
3. **Admin Approval**: Admin reviews and approves the campaign
4. **Google Ads Campaign Creation**: When approved, the system automatically creates a Google Ads campaign using the Google Ads API

## Edge Function: `create-google-ads-campaign`

### Location
`supabase/functions/create-google-ads-campaign/index.ts`

### Purpose
Creates a Google Ads campaign and budget atomically when a campaign is approved.

### Required Environment Variables

Set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

- `GADS_DEV_TOKEN` - Google Ads Developer Token
- `GADS_CLIENT_ID` - OAuth 2.0 Client ID
- `GADS_CLIENT_SECRET` - OAuth 2.0 Client Secret
- `GADS_REFRESH_TOKEN` - OAuth 2.0 Refresh Token
- `GADS_CUSTOMER_ID` - Google Ads Customer Account ID (where campaigns will be created)
- `GADS_LOGIN_CUSTOMER_ID` - (Optional) MCC Manager Account ID
- `GADS_MCC_ID` - (Optional) MCC Customer ID

### Request Body

```typescript
{
  campaign_id: string;           // Internal campaign ID
  campaign_name: string;          // Campaign name
  budget: number;                 // Budget in KES
  target_location: string[];      // Target locations
  target_age_group: string;      // Target age group
  duration_start: string;         // ISO date string
  duration_end: string;          // ISO date string
  audience_interests?: string[]; // Optional audience interests
  property_ids?: string[];       // Optional property IDs
  platforms?: string[];          // Selected platforms (must include "google")
}
```

### Response

**Success:**
```json
{
  "success": true,
  "googleAdsCampaignId": "1234567890",
  "budgetId": "9876543210",
  "campaignName": "Campaign Name",
  "budgetMicros": 1000000000,
  "customerId": "1234567890",
  "message": "Google Ads campaign created successfully"
}
```

**Error:**
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "type": "GoogleAdsAPIError"
}
```

## Implementation Details

### Campaign Creation Process

1. **Budget Creation**: Creates a campaign budget with the specified amount (converted to micros)
2. **Campaign Creation**: Creates a Search campaign with:
   - Status: `PAUSED` (admin can enable later)
   - Bidding: Manual CPC
   - Networks: Google Search and Search Network only
   - Start/End dates: From campaign duration

### Budget Conversion

- Google Ads uses micros (1/1,000,000 of currency unit)
- KES budget is converted using `toMicros()` function
- Example: 1000 KES = 1,000,000,000 micros

### Error Handling

The function handles:
- Missing credentials
- Google Ads API errors (GoogleAdsFailure)
- Network/connection errors
- Invalid campaign data

## Service Integration

### `campaignsService.approveCampaign()`

When an admin approves a campaign:

1. Validates campaign status is `pending`
2. Validates payment status is `success`
3. Checks if Google platform is selected
4. Calls the Edge Function to create Google Ads campaign
5. Updates campaign with:
   - Status: `active`
   - `google_ads_campaign_id`: The Google Ads campaign ID
   - `approved_by`: Admin user ID
   - `approved_at`: Timestamp

## Testing

### Prerequisites

1. Set up Google Ads API credentials
2. Configure environment variables in Supabase
3. Have a test Google Ads account with API access

### Test Flow

1. Create a campaign with Google platform selected
2. Complete payment
3. Approve the campaign as admin
4. Verify Google Ads campaign is created in Google Ads account
5. Check that `google_ads_campaign_id` is saved in database

## Notes

- Campaigns are created in `PAUSED` status - admin must enable them in Google Ads
- Budget is set to the `ad_spend` amount (after platform fee deduction)
- The integration uses atomic operations to ensure budget and campaign are created together
- If Google Ads creation fails, the campaign approval is rejected with an error message

## Troubleshooting

### Common Issues

1. **Missing Credentials**: Check all environment variables are set
2. **Invalid Customer ID**: Verify the customer ID has API access
3. **OAuth Token Expired**: Refresh token may need to be regenerated
4. **Budget Too Low**: Google Ads has minimum budget requirements
5. **API Quota Exceeded**: Check Google Ads API quota limits

### Debugging

- Check Edge Function logs in Supabase Dashboard
- Verify Google Ads API response in function logs
- Test credentials using Google Ads API test mode


