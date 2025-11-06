# Payment Initialization Debug Guide

## Issue: Payment Initialization Failing

When launching a campaign, the error "Payment initialization failed: Failed to initialize payment" appears.

## Debugging Steps

### 1. Check Browser Console

Open browser DevTools (F12) → Console tab and look for:
- `Initializing payment:` log with endpoint details
- `Payment initialization response:` log with status
- Any error messages

### 2. Check Network Tab

Open browser DevTools → Network tab:
- Look for request to `/functions/v1/initialize-payment`
- Check request URL is correct
- Check request headers (Authorization, apikey)
- Check request payload
- Check response status and body

### 3. Verify Endpoint URL

The endpoint should be:
```
https://zviqhszbluqturpeoiuk.supabase.co/functions/v1/initialize-payment
```

**Check:**
- `VITE_SUPABASE_URL` environment variable is set correctly
- URL doesn't have trailing slash
- Endpoint path is `/functions/v1/initialize-payment`

### 4. Check Environment Variables

**Frontend (.env file):**
```env
VITE_SUPABASE_URL=https://zviqhszbluqturpeoiuk.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_public_key
```

**Supabase Edge Functions (Dashboard → Edge Functions → Settings → Secrets):**
- `PAYSTACK_SECRET_KEY` - Must be set
- `SITE_URL` - Must be set (e.g., `http://localhost:5175` for dev)

### 5. Common Issues

#### Issue: 401 Unauthorized
**Cause:** Invalid or missing auth token
**Fix:** 
- Check user is logged in
- Check `session.access_token` is valid
- Verify token hasn't expired

#### Issue: 404 Not Found
**Cause:** Wrong endpoint URL or function not deployed
**Fix:**
- Verify function is deployed: `supabase functions list`
- Check endpoint path matches exactly
- Ensure no typos in URL

#### Issue: 500 Internal Server Error
**Cause:** Edge Function error (missing env vars, Paystack API error, etc.)
**Fix:**
- Check Supabase Edge Function logs
- Verify `PAYSTACK_SECRET_KEY` is set
- Verify `SITE_URL` is set
- Check Paystack API key is valid

#### Issue: CORS Error
**Cause:** CORS not configured properly
**Fix:**
- Edge Functions should handle CORS (already implemented)
- Check CORS headers in response

### 6. Test Edge Function Directly

Use curl or Postman to test:

```bash
curl -X POST https://zviqhszbluqturpeoiuk.supabase.co/functions/v1/initialize-payment \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "your-campaign-id",
    "amount": 1000.00,
    "email": "test@example.com"
  }'
```

### 7. Check Supabase Logs

1. Go to Supabase Dashboard
2. Navigate to Edge Functions → Logs
3. Select `initialize-payment` function
4. Check for error messages
5. Look for:
   - Missing environment variables
   - Paystack API errors
   - Database errors
   - Authentication errors

### 8. Verify Campaign Exists

The function checks:
- Campaign exists in database
- Campaign belongs to the authenticated user
- Campaign status is 'pending'

**Check in database:**
```sql
SELECT id, user_id, status, payment_status 
FROM campaigns 
WHERE id = 'your-campaign-id';
```

### 9. Expected Request Format

**URL:** `POST https://zviqhszbluqturpeoiuk.supabase.co/functions/v1/initialize-payment`

**Headers:**
```
Authorization: Bearer <user_access_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

**Body:**
```json
{
  "campaign_id": "uuid",
  "amount": 1000.00,
  "email": "user@example.com",
  "metadata": {}
}
```

### 10. Expected Response Format

**Success (200):**
```json
{
  "success": true,
  "payment": {
    "id": "payment-uuid",
    "reference": "campaign_xxx_timestamp",
    "access_code": "paystack-access-code",
    "authorization_url": "https://paystack.com/..."
  }
}
```

**Error (400/401/500):**
```json
{
  "error": "Error message"
}
```

## Quick Fixes

1. **Restart dev server** after setting environment variables
2. **Clear browser cache** and reload
3. **Check browser console** for detailed error messages
4. **Verify Edge Function logs** in Supabase Dashboard
5. **Test with curl** to isolate frontend vs backend issues

## Next Steps

After identifying the issue:
1. Fix the root cause
2. Test payment initialization again
3. Verify payment popup opens
4. Test complete payment flow

