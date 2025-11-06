# Paystack Payment Implementation Checklist

## ✅ Completed Tasks

### Database & Migrations
- [x] Created payments table migration with USD currency support
- [x] Added payment_status and payment_id columns to campaigns table
- [x] Created payment_status enum type
- [x] Set up RLS policies for payments table
- [x] Migration file saved locally in `migrations/` directory

### Supabase Edge Functions
- [x] Created `initialize-payment` function
  - Initializes Paystack transaction
  - Creates payment record in database
  - Returns access_code for frontend
  - Uses USD currency (converts to cents)
  
- [x] Created `verify-payment` function
  - Verifies transaction with Paystack
  - Updates payment status
  - Updates campaign payment_status
  - Validates amount matches
  
- [x] Created `paystack-webhook` function
  - Handles `charge.success` events
  - Handles `charge.failed` events
  - Updates payment and campaign status
  - Returns 200 OK to acknowledge webhook

### Frontend Integration
- [x] Added `@paystack/inline-js` package to package.json
- [x] Created `paymentService.ts` with:
  - `initializePayment()` function
  - `verifyPayment()` function
  - `openPaystackPopup()` function
  - Helper functions for payment status checks
  - Currency conversion utilities

- [x] Updated `campaignsService.ts`:
  - Added `payment_status` and `payment_id` to Campaign interface
  - Set `payment_status: 'pending'` on campaign creation
  - Include payment fields in campaign response

- [x] Updated `DashboardCampaignAds.tsx`:
  - Integrated payment flow into `handleLaunch()`
  - Added payment initialization after campaign creation
  - Opens Paystack popup for payment
  - Verifies payment after popup
  - Added payment status display in campaign list
  - Added payment status color coding

- [x] Updated `campaigns.ts` config:
  - Changed currency to 'USD'
  - Added Paystack public key configuration
  - Added Edge Function endpoints

## 📋 Pending Tasks

### Environment Variables Setup
- [x] Set `VITE_PAYSTACK_PUBLIC_KEY` in frontend `.env` ✅
- [x] Set `PAYSTACK_SECRET_KEY` in Supabase Edge Functions secrets ✅
- [x] Set `SITE_URL` in Supabase Edge Functions secrets ✅
- [x] Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set ✅

### Database Migration
- [x] Run migration: `migrations/20250127_000001_create_payments_table.sql` ✅
- [x] Verify payments table created ✅
- [x] Verify payment_status enum created ✅
- [x] Verify campaigns table has payment_status and payment_id columns ✅
- [x] Test RLS policies ✅

### Supabase Edge Functions Deployment
- [x] Deploy `initialize-payment` function ✅
- [x] Deploy `verify-payment` function ✅
- [x] Deploy `paystack-webhook` function ✅
- [x] Set environment variables for each function (PAYSTACK_SECRET_KEY, SITE_URL) ✅
- [ ] Test function endpoints (Ready for testing)

### Paystack Configuration
- [x] Create Paystack account (if not exists) ✅
- [x] Get test API keys ✅
- [x] Configure webhook URL in Paystack dashboard ✅
  - `https://zviqhszbluqturpeoiuk.supabase.co/functions/v1/paystack-webhook`
- [ ] Test webhook with Paystack test tool (Ready for testing)
- [ ] Switch to live keys when ready for production

### Testing
- [ ] Test campaign creation flow
- [ ] Test payment initialization
- [ ] Test Paystack popup opens correctly
- [ ] Test payment with test card (4084084084084081)
- [ ] Test payment verification
- [ ] Test webhook receives events
- [ ] Test payment status updates in UI
- [ ] Test failed payment handling
- [ ] Test campaign approval after payment

### UI/UX Improvements
- [ ] Add payment status indicator in campaign cards
- [ ] Add "Pay Now" button for unpaid campaigns
- [ ] Add payment loading states
- [ ] Add payment error handling UI
- [ ] Add payment success confirmation
- [ ] Add payment history view (optional)

### Documentation
- [ ] Update README with payment setup instructions
- [ ] Document environment variables needed
- [ ] Create payment flow diagram
- [ ] Document webhook setup process

## 🚀 Deployment Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Database Migration**
   - Go to Supabase SQL Editor
   - Run `migrations/20250127_000001_create_payments_table.sql`

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy initialize-payment
   supabase functions deploy verify-payment
   supabase functions deploy paystack-webhook
   ```

4. **Set Environment Variables**
   - In Supabase Dashboard → Edge Functions → Settings
   - Add: `PAYSTACK_SECRET_KEY`, `SITE_URL`

5. **Configure Paystack Webhook**
   - In Paystack Dashboard → Settings → Webhooks
   - Add: `https://your-project.supabase.co/functions/v1/paystack-webhook`

6. **Test Payment Flow**
   - Create a test campaign
   - Complete payment with test card
   - Verify webhook receives event
   - Check payment status updates

## 🔍 Verification Checklist

After deployment, verify:

- [ ] Campaigns can be created
- [ ] Payment popup opens when launching campaign
- [ ] Payment can be completed with test card
- [ ] Payment status updates to 'success' after payment
- [ ] Webhook receives `charge.success` event
- [ ] Campaign shows payment status in UI
- [ ] Admin can see payment status when reviewing campaigns
- [ ] Failed payments are handled gracefully

## 📝 Notes

- Payment is collected **at campaign creation** (before admin approval)
- If payment fails, campaign remains in 'pending' status with 'pending' payment_status
- Admin should only approve campaigns with `payment_status = 'success'`
- Webhooks are the primary source of truth for payment status
- Frontend verification is a fallback (3-second delay)

## 🐛 Known Issues / TODO

- [ ] Implement proper HMAC signature verification for webhooks
- [ ] Add payment retry mechanism for failed payments
- [ ] Add refund functionality for rejected campaigns
- [ ] Add payment receipt generation
- [ ] Add payment analytics/reporting
- [ ] Improve payment verification timing (use webhooks primarily)

