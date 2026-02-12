import { supabase } from '../lib/supabase';
import { campaignsConfig } from '../config/campaigns';

// Dynamic import for Paystack (to avoid SSR issues)
let PaystackPop: any = null;

async function getPaystackPop() {
  if (!PaystackPop) {
    try {
      const module = await import('@paystack/inline-js');
      PaystackPop = module.default || module;
      console.log('Paystack library loaded:', { 
        hasDefault: !!module.default, 
        hasModule: !!module,
        type: typeof PaystackPop 
      });
    } catch (error) {
      console.error('Failed to load Paystack library:', error);
      throw new Error('Failed to load Paystack payment library');
    }
  }
  return PaystackPop;
}

export interface PaymentInitResponse {
  success: boolean;
  payment: {
    id: string;
    reference: string;
    access_code: string;
    authorization_url?: string;
  };
}

export interface PaymentVerifyResponse {
  success: boolean;
  payment: {
    id: string;
    status: string;
    reference: string;
    amount: number;
    amount_paid: number;
    currency: string;
    paid_at?: string;
    channel?: string;
  };
  transaction: {
    status: string;
    message: string;
  };
}

/**
 * Initialize a Paystack payment for a campaign
 */
export async function initializePayment(
  campaignId: string,
  amount: number,
  email: string,
  metadata?: Record<string, any>
): Promise<PaymentInitResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  const endpoint = `${supabaseUrl}${campaignsConfig.payment.endpoints.initialize}`;
  const requestBody = {
    campaign_id: campaignId,
    amount,
    email,
    metadata: metadata || {},
  };

  console.log('Initializing payment:', {
    endpoint,
    campaignId,
    amount,
    email,
    supabaseUrl,
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Payment initialization response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
  });

  if (!response.ok) {
    let errorData;
    try {
      const text = await response.text();
      console.error('Payment initialization error response:', text);
      errorData = JSON.parse(text);
    } catch (e) {
      errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
    }
    throw new Error(errorData.error || errorData.message || 'Failed to initialize payment');
  }

  const result = await response.json();
  console.log('Payment initialization success:', result);
  return result;
}

/**
 * Verify a Paystack payment transaction
 */
export async function verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  const response = await fetch(
    `${supabaseUrl}${campaignsConfig.payment.endpoints.verify}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({ reference }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to verify payment' }));
    throw new Error(error.error || 'Failed to verify payment');
  }

  return await response.json();
}

/**
 * Open Paystack payment popup
 * The popup opens immediately and payment status is handled via webhook
 * If popup is blocked, falls back to opening authorization_url in a new window
 */
export async function openPaystackPopup(
  publicKey: string, 
  accessCode: string, 
  authorizationUrl?: string
): Promise<void> {
  try {
    console.log('Opening Paystack popup:', { publicKey: publicKey?.substring(0, 10) + '...', accessCode });
    
    // Load Paystack library
    const PaystackPopClass = await getPaystackPop();
    
    if (!PaystackPopClass) {
      throw new Error('Paystack library failed to load');
    }
    
    // Create new instance and open popup
    const handler = new PaystackPopClass();
    
    if (!handler || typeof handler.resumeTransaction !== 'function') {
      throw new Error('Paystack handler not properly initialized');
    }
    
    // Try to open the payment popup
    // This opens a modal/popup window for the user to complete payment
    try {
      handler.resumeTransaction(accessCode);
      console.log('Paystack popup opened successfully');
    } catch (popupError: any) {
      console.warn('Popup library failed, trying fallback with authorization URL:', popupError);
      
      // Fallback: Open authorization URL in a new window if popup is blocked
      if (authorizationUrl) {
        const popupWindow = window.open(
          authorizationUrl,
          'paystack_payment',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        
        if (!popupWindow || popupWindow.closed || typeof popupWindow.closed === 'undefined') {
          // Popup was blocked - redirect in current window instead
          const userConfirmed = window.confirm(
            'Popup was blocked. Would you like to be redirected to complete the payment?'
          );
          if (userConfirmed) {
            window.location.href = authorizationUrl;
          } else {
            throw new Error('Payment popup was blocked. Please allow popups for this site and try again.');
          }
        } else {
          console.log('Payment window opened successfully');
        }
      } else {
        throw new Error('Popup failed and no authorization URL available');
      }
    }
  } catch (error: any) {
    console.error('Error opening Paystack popup:', error);
    throw new Error(`Failed to open payment popup: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Check if payment is required for a campaign
 */
export function isPaymentRequired(campaign: { payment_status?: string; status: string }): boolean {
  return campaign.status === 'pending' && campaign.payment_status !== 'success';
}

/**
 * Format amount from cents to KES
 */
export function formatAmountFromCents(cents: number): number {
  return cents / 100;
}

/**
 * Format amount from KES to cents
 */
export function formatAmountToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Open a generic Paystack inline payment for short-stay bookings
 * Uses the public key directly in the browser and resolves when
 * the user either completes or cancels the payment.
 */
export async function openPaystackInlineForBooking(params: {
  amountKES: number;
  email: string;
  metadata?: Record<string, any>;
}): Promise<{ reference: string } | null> {
  const { amountKES, email, metadata } = params;

  if (!campaignsConfig.payment.publicKey) {
    throw new Error('Paystack public key is not configured');
  }

  if (!amountKES || amountKES <= 0) {
    throw new Error('Invalid booking amount');
  }

  const PaystackPopClass = await getPaystackPop();
  if (!PaystackPopClass) {
    throw new Error('Failed to load Paystack payment library');
  }

  const handler = new PaystackPopClass();
  if (!handler || typeof handler.newTransaction !== 'function') {
    throw new Error('Paystack handler not properly initialized for bookings');
  }

  const amountInKobo = formatAmountToCents(amountKES);

  return new Promise((resolve, reject) => {
    try {
      handler.newTransaction({
        key: campaignsConfig.payment.publicKey,
        email,
        amount: amountInKobo,
        currency: campaignsConfig.payment.currency || 'KES',
        metadata: metadata || {},
        callback: (response: any) => {
          console.log('Short-stay booking payment success:', response);
          resolve({ reference: response.reference });
        },
        onClose: () => {
          console.log('Short-stay booking payment popup closed by user');
          resolve(null);
        }
      });
    } catch (error) {
      console.error('Error starting Paystack booking transaction:', error);
      reject(error);
    }
  });
}

