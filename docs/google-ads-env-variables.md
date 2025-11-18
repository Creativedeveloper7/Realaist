# Google Ads API - Environment Variables Configuration

## Required Environment Variables

Configure these in **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**

### Core Credentials (REQUIRED)

```bash
# Google Ads Developer Token
# Get it from: https://ads.google.com/aw/apicenter
# Format: A string token from your Google Ads Manager account
GADS_DEV_TOKEN=your_developer_token_here

# OAuth 2.0 Client ID
# Get it from: https://console.cloud.google.com/apis/credentials
# Create an OAuth 2.0 Client ID for "Desktop App" or "Web App"
GADS_CLIENT_ID=your_client_id.apps.googleusercontent.com

# OAuth 2.0 Client Secret
# Get it from: https://console.cloud.google.com/apis/credentials
# This is provided when you create the OAuth Client ID
GADS_CLIENT_SECRET=your_client_secret_here

# OAuth 2.0 Refresh Token
# Generate using the OAuth 2.0 Playground or Google Ads API authentication flow
# Guide: https://developers.google.com/google-ads/api/docs/oauth/overview
GADS_REFRESH_TOKEN=your_refresh_token_here

# Google Ads Customer ID (REQUIRED)
# Format: 10-digit number WITHOUT hyphens (e.g., 1234567890)
# Find it in your Google Ads account (top right corner)
# This is the account where campaigns will be created
GADS_CUSTOMER_ID=1234567890
```

---

### Optional (For MCC/Manager Accounts Only)

```bash
# Login Customer ID (MCC Account)
# Format: 10-digit number WITHOUT hyphens
# This is your MCC (Manager) account ID
# Only needed if managing multiple accounts through an MCC
GADS_LOGIN_CUSTOMER_ID=9876543210

# MCC Customer ID (same as Login Customer ID)
# Alternative/duplicate field for MCC configuration
GADS_MCC_ID=9876543210
```

---

## Setup Guide

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Ads API** for your project
4. Go to **APIs & Services** → **Credentials**

### Step 2: Create OAuth 2.0 Credentials

1. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select application type: **Desktop app** (recommended) or **Web application**
3. Name it: "Realaist Google Ads Integration"
4. Click **Create**
5. Copy the **Client ID** and **Client Secret**
6. Download the JSON credentials (optional, for backup)

### Step 3: Generate Refresh Token

#### Option A: Using OAuth 2.0 Playground

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret
5. In the left panel, find **Google Ads API v17**
6. Select: `https://www.googleapis.com/auth/adwords`
7. Click **Authorize APIs**
8. Sign in with your Google Ads account
9. Click **Exchange authorization code for tokens**
10. Copy the **Refresh token**

#### Option B: Using Google Ads API Authentication Script

Use the official authentication example from Google Ads API documentation.

### Step 4: Get Developer Token

1. Go to [Google Ads API Center](https://ads.google.com/aw/apicenter)
2. Sign in with your Google Ads Manager account
3. Apply for a developer token (if you don't have one)
4. For testing: You'll get a test token immediately
5. For production: Apply for standard access (requires approval)

### Step 5: Find Your Customer ID

1. Log in to [Google Ads](https://ads.google.com/)
2. Look at the top right corner
3. You'll see a 10-digit number (e.g., 123-456-7890)
4. Remove the hyphens: `1234567890`
5. This is your `GADS_CUSTOMER_ID`

### Step 6: Configure in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **Realaist (zviqhszbluqturpeoiuk)**
3. Go to **Project Settings** (gear icon in sidebar)
4. Click **Edge Functions** in the left menu
5. Scroll to **Secrets** section
6. Click **Add secret** for each variable:
   - Name: `GADS_DEV_TOKEN` | Value: (paste your token)
   - Name: `GADS_CLIENT_ID` | Value: (paste your client ID)
   - Name: `GADS_CLIENT_SECRET` | Value: (paste your secret)
   - Name: `GADS_REFRESH_TOKEN` | Value: (paste your refresh token)
   - Name: `GADS_CUSTOMER_ID` | Value: (paste your 10-digit number)

---

## Verification

### Test Configuration

You can test your configuration by:

1. Creating a test campaign in the Realaist admin dashboard
2. Approving it
3. Checking the Edge Function logs:
   - Go to **Edge Functions** → **create-google-ads-campaign**
   - Click **Logs** tab
   - Look for "Creating Google Ads campaign" messages

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing: GADS_DEV_TOKEN" | Variable not set | Add all required variables in Supabase |
| "Could not authenticate" | Invalid refresh token | Regenerate refresh token using OAuth flow |
| "Customer ID not found" | Wrong format or invalid ID | Verify 10-digit number without hyphens |
| "PERMISSION_DENIED" | Developer token not approved | Use test token or apply for standard access |

---

## Security Notes

1. **NEVER** commit these credentials to Git
2. **NEVER** expose credentials in frontend code
3. All credentials should ONLY be in Supabase Edge Function secrets
4. Rotate credentials periodically
5. Use test tokens during development
6. Apply for production access only when ready to launch

---

## Resources

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [OAuth 2.0 Setup Guide](https://developers.google.com/google-ads/api/docs/oauth/cloud-project)
- [API Authentication Guide](https://developers.google.com/google-ads/api/docs/oauth/overview)
- [Developer Token Guide](https://developers.google.com/google-ads/api/docs/first-call/dev-token)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

---

## Quick Copy Template

Use this template when setting up in Supabase:

```
GADS_DEV_TOKEN=
GADS_CLIENT_ID=
GADS_CLIENT_SECRET=
GADS_REFRESH_TOKEN=
GADS_CUSTOMER_ID=
```

Optional (MCC only):
```
GADS_LOGIN_CUSTOMER_ID=
GADS_MCC_ID=
```

---

## Exchange Rate

The system uses a hardcoded exchange rate:
- **134 KES = 1 USD**
- This is defined in the edge function as `KES_TO_USD_RATE = 134`
- Update this constant if the exchange rate changes significantly

---

**Last Updated**: 2025-11-17  
**Function Version**: 4  
**Status**: Production Ready ✅

