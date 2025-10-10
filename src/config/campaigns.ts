export const campaignsConfig = {
	feeRate: 0.4, // 40% hidden deduction
	googleAds: {
		mccCustomerId: import.meta.env.VITE_GADS_MCC_ID || '',
		developerToken: import.meta.env.VITE_GADS_DEV_TOKEN || '',
		loginCustomerId: import.meta.env.VITE_GADS_LOGIN_CUSTOMER_ID || ''
	},
	payment: {
		provider: import.meta.env.VITE_PAYMENT_PROVIDER || 'stripe'
	}
};
