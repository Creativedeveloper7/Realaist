# Paystack Payment Implementation Guide

## Overview

This document outlines the complete Paystack payment integration for campaign ads using Supabase Edge Functions and USD currency.

## Architecture

### Payment Flow

```
1. User creates campaign → Campaign saved with status 'pending'
2. Frontend calls initialize-payment Edge Function
3. Edge Function creates Paystack transaction → Returns access_code
4. Frontend uses Paystack Popup to complete payment
5. Payment verified via webhook OR verify-payment endpoint
6. Campaign payment_status updated to 'success'
7. Admin can now approve campaign
```

## Database Schema

### Payments Table

- **amount_requested**: Amount in cents (e.g., 100000 = $1000.00 USD)
- **amount_paid**: Actual amount paid in cents
- **currency**: 'USD' (default)
- **status**: pending, processing, success, failed, refunded, cancelled
- **paystack_reference**: Unique transaction reference

### Campaigns Table Updates

- **payment_id**: Reference to payments table
- **payment_status**: Payment status enum (pending, success, failed, etc.)

## Supabase Edge Functions

### 1. initialize-payment

**Endpoint**: `/functions/v1/initialize-payment`

**Method**: POST

**Request Body**:
```json
{
  "campaign_id": "uuid",
  "amount": 1000.00,  // USD amount
  "email": "user@example.com",
  "metadata": {}  // Optional
}
```

**Response**:
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

**Environment Variables Required**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `SITE_URL` (for callback URL)

### 2. verify-payment

**Endpoint**: `/functions/v1/verify-payment`

**Method**: POST

**Request Body**:
```json
{
  "reference": "campaign_xxx_timestamp"
}
```

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": "payment-uuid",
    "status": "success",
    "reference": "campaign_xxx_timestamp",
    "amount": 100000,  // in cents
    "amount_paid": 100000,
    "currency": "USD",
    "paid_at": "2025-01-27T12:00:00Z",
    "channel": "card"
  },
  "transaction": {
    "status": "success",
    "message": "Approved"
  }
}
```

### 3. paystack-webhook

**Endpoint**: `/functions/v1/paystack-webhook`

**Method**: POST (called by Paystack)

**Handles Events**:
- `charge.success` - Updates payment and campaign status
- `charge.failed` - Updates payment status to failed

**Webhook URL Configuration**:
Set in Paystack Dashboard: `https://your-project.supabase.co/functions/v1/paystack-webhook`

## Frontend Integration

### 1. Install Paystack Package

```bash
npm install @paystack/inline-js
```

### 2. Payment Service

Create `src/services/paymentService.ts`:

```typescript
import { supabase } from '../lib/supabase';
import { campaignsConfig } from '../config/campaigns';
import PaystackPop from '@paystack/inline-js';

export async function initializePayment(campaignId: string, amount: number, email: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}${campaignsConfig.payment.endpoints.initialize}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        campaign_id: campaignId,
        amount,
        email,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to initialize payment');
  }

  return await response.json();
}

export async function verifyPayment(reference: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}${campaignsConfig.payment.endpoints.verify}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ reference }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to verify payment');
  }

  return await response.json();
}

export function openPaystackPopup(publicKey: string, accessCode: string) {
  const handler = new PaystackPop();
  handler.resumeTransaction(accessCode);
}
```

### 3. Update Campaign Creation Flow

In `DashboardCampaignAds.tsx`, update `handleLaunch`:

```typescript
const handleLaunch = async () => {
  try {
    // ... existing validation ...

    // Create campaign first
    const { campaign, error: campaignError } = await campaignsService.createCampaign(campaignData);
    
    if (campaignError || !campaign) {
      throw new Error(campaignError || 'Failed to create campaign');
    }

    // Initialize payment
    const paymentInit = await initializePayment(
      campaign.id,
      Number(form.budget),
      user?.email || ''
    );

    // Open Paystack popup
    openPaystackPopup(
      campaignsConfig.payment.publicKey,
      paymentInit.payment.access_code
    );

    // Listen for payment completion (via callback or polling)
    // Verify payment after popup closes
    // Update campaign status
    
  } catch (error) {
    // Handle error
  }
};
```

## Environment Variables

### Frontend (.env)

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Supabase Edge Functions (Set in Supabase Dashboard)

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
SITE_URL=https://yourdomain.com
```

## Currency Handling

- **Frontend**: Amounts in USD (e.g., 1000.00)
- **Backend**: Amounts converted to cents (e.g., 100000)
- **Database**: Stored in cents (BIGINT)
- **Paystack API**: Amounts in cents

### Conversion

```typescript
// USD to cents
const amountInCents = Math.round(amount * 100);

// Cents to USD
const amountInUSD = amountInCents / 100;
```

## Payment Status Flow

```
pending → processing → success
pending → failed
success → refunded (if refunded)
```

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Always verify payment** on backend before delivering value
3. **Verify amount** matches expected amount
4. **Use webhooks** as primary source of truth (not just callbacks)
5. **Implement signature verification** for webhooks (HMAC-SHA512)

## Testing

### Test Mode

1. Use Paystack test keys (`pk_test_...`, `sk_test_...`)
2. Use test card: `4084084084084081`
3. CVV: Any 3 digits
4. Expiry: Any future date
5. PIN: Any 4 digits

### Test Webhook

Use Paystack's webhook testing tool or ngrok for local testing.

## Deployment Checklist

- [ ] Set environment variables in Supabase Dashboard
- [ ] Configure webhook URL in Paystack Dashboard
- [ ] Test payment flow end-to-end
- [ ] Verify webhook receives events
- [ ] Test payment verification
- [ ] Test failed payment handling
- [ ] Update frontend to handle payment states
- [ ] Add payment status UI indicators
- [ ] Test refund flow (if applicable)

## Troubleshooting

### Payment not initializing
- Check Paystack secret key is set correctly
- Verify campaign exists and belongs to user
- Check network requests in browser console

### Webhook not receiving events
- Verify webhook URL is publicly accessible
- Check webhook URL in Paystack dashboard
- Verify signature validation (if implemented)

### Payment verified but campaign not updated
- Check webhook handler logs
- Verify database permissions
- Check RLS policies

## Next Steps

1. Implement frontend payment service
2. Update campaign creation UI
3. Add payment status indicators
4. Implement refund functionality (if needed)
5. Add payment history page
6. Implement proper webhook signature verification

