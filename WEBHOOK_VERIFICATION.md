# Webhook Verification Guide

## Current Status

Based on database queries:
- **All payments**: Status = `pending` (4 payments)
- **All campaigns**: `payment_status` = `pending` (13 campaigns)
- **Webhook logs**: Shows POST 200 responses, indicating webhook is being called

## Issue

The webhook is receiving requests (status 200), but payment statuses are not being updated. This suggests:
1. Webhook might not be receiving `charge.success` events
2. Payment references might not match
3. Webhook might be receiving events but failing silently

## Enhanced Logging

The webhook has been updated with comprehensive logging to track:
- Event type received
- Payment reference lookup
- Payment update operations
- Campaign update operations
- Any errors during processing

## Next Steps to Verify

1. **Check webhook logs** after the next payment:
   ```bash
   # View logs in Supabase dashboard or via MCP
   ```

2. **Verify Paystack webhook configuration**:
   - Webhook URL should be: `https://zviqhszbluqturpeoiuk.supabase.co/functions/v1/paystack-webhook`
   - Events to listen for: `charge.success`, `charge.failed`

3. **Test with a payment** and check:
   - Webhook logs for "Webhook event received"
   - Webhook logs for "Processing charge.success event"
   - Webhook logs for "Payment updated successfully"
   - Webhook logs for "Campaign payment status updated successfully"

4. **Check database** after payment:
   ```sql
   SELECT 
     p.id,
     p.paystack_reference,
     p.status,
     c.payment_status,
     c.id as campaign_id
   FROM payments p
   LEFT JOIN campaigns c ON p.campaign_id = c.id
   ORDER BY p.created_at DESC
   LIMIT 5;
   ```

## Expected Flow

1. User completes payment in Paystack popup
2. Paystack sends `charge.success` webhook event
3. Webhook finds payment by `paystack_reference`
4. Webhook updates `payments.status` to `success`
5. Webhook updates `campaigns.payment_status` to `success`
6. Supabase Realtime triggers UI update

## Troubleshooting

If webhook logs show "Unhandled webhook event", Paystack might be sending a different event type. Check the event type in logs.

If webhook logs show "Payment not found", the reference might not match. Check that `paystack_reference` in database matches `transaction.reference` from Paystack.

