# Deploy Google Ads Analytics Function

## Method 1: Using Supabase CLI (Recommended)

### Step 1: Link Your Project

First, you need to link your local project to your Supabase project:

```bash
# Get your project reference ID from Supabase Dashboard (Settings → General → Reference ID)
supabase link --project-ref YOUR_PROJECT_REF_ID
```

You'll be prompted to enter your database password. This can be found in:
- Supabase Dashboard → Settings → Database → Database password

### Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

### Step 3: Deploy the Function

```bash
cd /Users/alexgitonga/Realaist
supabase functions deploy get-google-ads-analytics
```

---

## Method 2: Using Supabase Dashboard (Alternative)

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project

### Step 2: Navigate to Edge Functions
1. Click on **Edge Functions** in the left sidebar
2. Click **Create a new function**

### Step 3: Create the Function
1. **Function Name**: `get-google-ads-analytics`
2. **Copy the code** from `supabase/functions/get-google-ads-analytics/index.ts`
3. Paste it into the code editor
4. Click **Deploy**

### Step 4: Verify Deployment
1. You should see `get-google-ads-analytics` in your functions list
2. Click on it to verify it's active

---

## Method 3: Using Supabase CLI with Access Token

If you prefer non-interactive deployment:

### Step 1: Get Your Access Token
1. Go to Supabase Dashboard → Account Settings → Access Tokens
2. Generate a new access token
3. Copy it

### Step 2: Link and Deploy
```bash
# Set the access token
export SUPABASE_ACCESS_TOKEN=your_access_token_here

# Link project (will use token automatically)
supabase link --project-ref YOUR_PROJECT_REF_ID

# Deploy the function
supabase functions deploy get-google-ads-analytics
```

---

## Verification

After deployment, verify the function works:

1. **Check in Dashboard**: Go to Edge Functions → `get-google-ads-analytics` → Logs
2. **Test the endpoint**: The function should be accessible at:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-google-ads-analytics
   ```

## Troubleshooting

### "Function already exists"
If the function already exists, you can update it by deploying again:
```bash
supabase functions deploy get-google-ads-analytics --no-verify-jwt
```

### "Authentication failed"
Make sure you're logged in:
```bash
supabase login
```

### "Project not linked"
Link your project first:
```bash
supabase link --project-ref YOUR_PROJECT_REF_ID
```

---

**Need Help?**
- Check Supabase docs: https://supabase.com/docs/guides/functions
- View function logs in Supabase Dashboard



