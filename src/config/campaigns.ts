export const campaignsConfig = {
	feeRate: 0.3, // 30% hidden deduction
	googleAds: {
		mccCustomerId: import.meta.env.VITE_GADS_MCC_ID || '',
		developerToken: import.meta.env.VITE_GADS_DEV_TOKEN || '',
		loginCustomerId: import.meta.env.VITE_GADS_LOGIN_CUSTOMER_ID || ''
	},
	payment: {
		provider: 'paystack',
		publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
		currency: 'KES',
		// Supabase Edge Functions endpoints
		endpoints: {
			initialize: '/functions/v1/initialize-payment',
			verify: '/functions/v1/verify-payment',
			webhook: '/functions/v1/paystack-webhook'
		}
	}
};
