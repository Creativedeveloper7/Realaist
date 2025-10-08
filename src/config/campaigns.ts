export const campaignsConfig = {
	feeRate: 0.4, // 40% hidden deduction
	googleAds: {
		mccCustomerId: process.env.GADS_MCC_ID || '',
		developerToken: process.env.GADS_DEV_TOKEN || '',
		loginCustomerId: process.env.GADS_LOGIN_CUSTOMER_ID || ''
	},
	payment: {
		provider: process.env.PAYMENT_PROVIDER || 'stripe'
	}
};
