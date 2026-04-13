import { supabase } from '../lib/supabase';
import { bookingAndPayoutEndpoints } from '../config/payments';

export interface InitializeBookingPaymentInput {
  propertyId: string;
  amountKes: number;
  email: string;
  customerName?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  guests?: number;
  metadata?: Record<string, unknown>;
}

export interface InitializeBookingPaymentResult {
  id: string;
  reference: string;
  access_code: string;
  authorization_url?: string;
}

/**
 * Creates `booking_payments` row and initializes Paystack transaction (server-side).
 * Works for guests without login; sends Bearer token when session exists.
 */
export async function initializeBookingPayment(
  input: InitializeBookingPaymentInput
): Promise<InitializeBookingPaymentResult> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('Supabase URL not configured');

  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${supabaseUrl}${bookingAndPayoutEndpoints.initializeBooking}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      property_id: input.propertyId,
      amount_kes: input.amountKes,
      email: input.email,
      customer_name: input.customerName,
      check_in: input.checkIn,
      check_out: input.checkOut,
      nights: input.nights,
      guests: input.guests,
      metadata: input.metadata ?? {},
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || json.message || 'Failed to start booking payment');
  }

  const bp = json.booking_payment;
  if (!bp?.id || !bp?.reference || !bp?.access_code) {
    throw new Error('Invalid response from payment service');
  }

  return {
    id: bp.id,
    reference: bp.reference,
    access_code: bp.access_code,
    authorization_url: bp.authorization_url,
  };
}

export async function verifyBookingPayment(params: {
  reference: string;
  bookingPaymentId: string;
  email: string;
}): Promise<{ success: boolean; status?: string; message?: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) throw new Error('Supabase URL not configured');

  const res = await fetch(`${supabaseUrl}${bookingAndPayoutEndpoints.verifyBooking}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify({
      reference: params.reference,
      booking_payment_id: params.bookingPaymentId,
      email: params.email,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || 'Verification failed');
  }
  return json;
}
