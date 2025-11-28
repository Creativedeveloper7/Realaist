# Google Ads Analytics Integration - Setup Guide

This guide walks you through setting up and using the Google Ads analytics integration on the developer dashboard.

## Prerequisites

1. **Active Google Ads Campaign**: You need at least one campaign that has been:
   - Created by a developer
   - Paid for (payment status = 'success')
   - Approved by an admin
   - Has a `google_ads_campaign_id` in the database

2. **Google Ads API Credentials**: Ensure these are configured in Supabase (same as for campaign creation)

## Step-by-Step Setup

### Step 1: Verify Environment Variables

The analytics function uses the same Google Ads API credentials as campaign creation. Verify they're set in Supabase:

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Verify these secrets are configured:
   - `GADS_DEV_TOKEN` - Google Ads Developer Token
   - `GADS_CLIENT_ID` - OAuth 2.0 Client ID
   - `GADS_CLIENT_SECRET` - OAuth 2.0 Client Secret
   - `GADS_REFRESH_TOKEN` - OAuth 2.0 Refresh Token
   - `GADS_CUSTOMER_ID` - Google Ads Customer Account ID
   - `GADS_LOGIN_CUSTOMER_ID` - (Optional) MCC Manager Account ID

### Step 2: Deploy the Edge Function

Deploy the new analytics edge function to Supabase:

```bash
# Navigate to your project root
cd /Users/alexgitonga/Realaist

# Deploy the function
supabase functions deploy get-google-ads-analytics
```

**Alternative: Using Supabase CLI locally**

If you have Supabase CLI set up locally:

```bash
# Make sure you're logged in
supabase login

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy get-google-ads-analytics
```

**Verify Deployment:**

1. Go to **Supabase Dashboard** → **Edge Functions**
2. You should see `get-google-ads-analytics` in the list
3. Click on it to see the function details

### Step 3: Test the Integration

#### 3.1 Test with an Active Campaign

1. **Log in as a Developer**:
   - Navigate to your application
   - Log in with a developer account

2. **Go to Campaign Ads Page**:
   - Click on "Campaign Ads" in the dashboard
   - Or navigate to `/dashboard/campaign-ads`

3. **Verify Campaign Status**:
   - Ensure you have at least one campaign that:
     - Status = `active`
     - Payment status = `success`
     - Has `google_ads_campaign_id` populated
     - Includes `google` in the `platforms` array

4. **Check Analytics Display**:
   - Scroll to an active Google Ads campaign
   - You should see a "Campaign Analytics" section below the campaign details
   - Analytics should automatically load after a few seconds

#### 3.2 What You Should See

For active Google Ads campaigns, you'll see:

```
Campaign Analytics
┌──────────────┬──────────┬──────┬────────┬─────────┬────────────┬──────┬─────────────────┐
│ Impressions  │  Clicks  │ CTR  │ Spent  │ Avg CPC │ Conversions│ CPM  │ Conversion Value│
├──────────────┼──────────┼──────┼────────┼─────────┼────────────┼──────┼─────────────────┤
│  10,234      │   234    │ 2.29%│ $45.67 │  $0.20  │     5      │$4.46 │     $125.00     │
└──────────────┴──────────┴──────┴────────┴─────────┴────────────┴──────┴─────────────────┘
```

#### 3.3 Manual Refresh

- Click the refresh icon (🔄) next to "Campaign Analytics" header
- The analytics will reload with the latest data from Google Ads

### Step 4: Troubleshooting

#### No Analytics Appearing?

1. **Check Campaign Status**:
   ```sql
   SELECT id, campaign_name, status, payment_status, google_ads_campaign_id, platforms
   FROM campaigns
   WHERE user_id = 'YOUR_USER_ID';
   ```
   
   Ensure:
   - `status` = `'active'`
   - `payment_status` = `'success'`
   - `google_ads_campaign_id` IS NOT NULL
   - `platforms` contains `'google'`

2. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for any error messages related to analytics fetching

3. **Check Edge Function Logs**:
   - Go to **Supabase Dashboard** → **Edge Functions** → **get-google-ads-analytics**
   - Click on **Logs** tab
   - Check for any errors when fetching analytics

4. **Verify Google Ads API Access**:
   - Ensure the Google Ads campaign exists and is active in Google Ads
   - Check that the campaign has received some traffic (analytics won't show if there's no data)

#### Common Errors

**Error: "Campaign not found in Google Ads"**
- The `google_ads_campaign_id` might be incorrect
- The campaign might have been deleted in Google Ads
- Check the campaign ID in Google Ads dashboard

**Error: "Google Ads authentication failed"**
- Verify all credentials are correct in Supabase secrets
- Check that the refresh token hasn't expired
- Ensure the customer ID is correct

**Error: "No analytics data available yet"**
- This is normal for new campaigns
- Analytics will appear once the campaign receives traffic
- Wait a few hours after campaign activation

**Error: "Network error"**
- Check your internet connection
- Verify Supabase URL is correct in `.env` file
- Ensure Edge Functions are accessible

### Step 5: Understanding the Analytics Data

#### Metrics Explained

- **Impressions**: Number of times your ad was shown
- **Clicks**: Number of times users clicked your ad
- **CTR (Click-Through Rate)**: Percentage of impressions that resulted in clicks (Clicks/Impressions × 100)
- **Spent**: Total amount spent on the campaign (in USD)
- **Avg CPC (Average Cost Per Click)**: Average amount paid for each click
- **Conversions**: Number of conversions (actions completed by users)
- **CPM (Cost Per 1000 Impressions)**: Cost to show your ad 1000 times
- **Conversion Value**: Total value of all conversions (if conversion tracking is set up)

#### Data Freshness

- Analytics are fetched in real-time when you visit the page
- Use the refresh button to get the latest data
- Google Ads typically updates data within a few hours

### Step 6: API Usage (Optional)

If you want to fetch analytics programmatically:

```typescript
import { campaignsService } from '../services/campaignsService';

// Get analytics for a campaign
const { analytics, error } = await campaignsService.getCampaignAnalytics(
  '1234567890', // google_ads_campaign_id
  {
    startDate: '2024-01-01', // Optional: YYYY-MM-DD format
    endDate: '2024-01-31'    // Optional: YYYY-MM-DD format
  }
);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Analytics:', analytics);
  // {
  //   campaign_id: "1234567890",
  //   campaign_name: "My Campaign",
  //   metrics: {
  //     impressions: 10234,
  //     clicks: 234,
  //     cost: 45.67,
  //     ctr: 2.29,
  //     average_cpc: 0.20,
  //     conversions: 5,
  //     cpm: 4.46,
  //     conversion_value: 125.00
  //   }
  // }
}
```

## Next Steps

1. **Monitor Performance**: Check analytics regularly to see how campaigns are performing
2. **Optimize Campaigns**: Use the data to adjust budgets, targeting, and keywords
3. **Set Up Alerts**: Consider setting up notifications for campaign performance thresholds
4. **Export Data**: You can extend the functionality to export analytics data as CSV/PDF

## Support

If you encounter issues:
1. Check the Supabase Edge Function logs
2. Verify Google Ads API credentials
3. Ensure campaigns are properly set up
4. Review the browser console for client-side errors

---

**Last Updated**: January 2024
**Function Version**: 1.0.0

