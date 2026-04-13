/**
 * Supabase Edge Function paths for booking charges and host payouts (Paystack).
 * Campaign payments continue to use `campaignsConfig.payment.endpoints`.
 */
export const bookingAndPayoutEndpoints = {
  initializeBooking: '/functions/v1/initialize-booking-payment',
  verifyBooking: '/functions/v1/verify-booking-payment',
  syncHostPaystackRecipient: '/functions/v1/sync-host-paystack-recipient',
  initiateHostTransfer: '/functions/v1/initiate-host-transfer',
} as const;
