# Testing Payment Endpoint

## Quick Test

To verify the payment initialization endpoint is working:

1. **Open Browser Console** (F12)
2. **Create a campaign** and launch it
3. **Check console logs** for:
   - `Initializing payment:` - Shows the endpoint URL and request data
   - `Payment initialization response:` - Shows HTTP status
   - Any error messages

## Expected Console Output

**On Success:**
```
Initializing payment: {
  endpoint: "https://zviqhszbluqturpeoiuk.supabase.co/functions/v1/initialize-payment",
  campaignId: "...",
  amount: 1000,
  email: "user@example.com",
  supabaseUrl: "https://zviqhszbluqturpeoiuk.supabase.co"
}

Payment initialization response: {
  status: 200,
  statusText: "OK",
  ok: true
}

Payment initialization success: {
  success: true,
  payment: { ... }
}
```

**On Error:**
```
Payment initialization response: {
  status: 400,  // or 401, 500, etc.
  statusText: "Bad Request",
  ok: false
}

Payment initialization error response: {
  error: "Error message"
}
```

## Common 400 Errors

- **"Missing required fields"** - Check campaign_id, amount, email are provided
- **"Campaign not found"** - Campaign doesn't exist or doesn't belong to user
- **"Campaign is not in pending status"** - Campaign already has payment or is active
- **"Paystack configuration missing"** - PAYSTACK_SECRET_KEY not set in Edge Function

## Verify Endpoint is Correct

The endpoint should be:
```
https://zviqhszbluqturpeoiuk.supabase.co/functions/v1/initialize-payment
```

Check the console log to confirm the URL is correct.

