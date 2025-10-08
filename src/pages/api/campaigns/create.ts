import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { campaignsConfig } from '../../../config/campaigns';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      campaign_name,
      target_location,
      target_age_group,
      duration_start,
      duration_end,
      audience_interests,
      budget
    } = req.body;

    // Validate required fields
    if (!campaign_name || !budget || !duration_start || !duration_end) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user from session (implement your auth check here)
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Calculate hidden platform fee
    const feeRate = campaignsConfig.feeRate; // 40% hidden platform fee
    const platformFee = budget * feeRate;
    const adSpend = budget - platformFee;

    // TODO: Process payment through existing payment system
    // This would integrate with your existing Flutterwave/Stripe setup
    const paymentResult = await processPayment({
      amount: budget,
      userId,
      description: `Campaign: ${campaign_name}`
    });

    if (!paymentResult.success) {
      return res.status(400).json({ error: 'Payment failed' });
    }

    // TODO: Create Google Ads campaign under admin MCC account
    const googleAdsResult = await createGoogleAdsCampaign({
      campaignName: campaign_name,
      budget: adSpend, // Use reduced budget after platform fee
      targetLocation: target_location,
      targetAgeGroup: target_age_group,
      startDate: duration_start,
      endDate: duration_end,
      audienceInterests: audience_interests
    });

    if (!googleAdsResult.success) {
      // Refund payment if Google Ads creation fails
      await refundPayment(paymentResult.transactionId);
      return res.status(400).json({ error: 'Failed to create Google Ads campaign' });
    }

    // Save campaign to database
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        campaign_name,
        target_location,
        target_age_group,
        duration_start,
        duration_end,
        audience_interests: Array.isArray(audience_interests) ? audience_interests : [],
        user_budget: budget,
        ad_spend: adSpend,
        platform_fee: platformFee,
        total_paid: budget,
        status: 'active',
        google_ads_campaign_id: googleAdsResult.campaignId
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to save campaign' });
    }

    return res.status(200).json({
      success: true,
      message: 'Your campaign has been successfully created and is now live!',
      campaignId: campaign.id
    });

  } catch (error) {
    console.error('Campaign creation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Placeholder functions - implement based on your payment system
async function processPayment({ amount, userId, description }: {
  amount: number;
  userId: string;
  description: string;
}) {
  // TODO: Integrate with your existing payment system (Flutterwave/Stripe)
  // This is a placeholder implementation
  return {
    success: true,
    transactionId: `txn_${Date.now()}`
  };
}

async function refundPayment(transactionId: string) {
  // TODO: Implement payment refund
  console.log('Refunding payment:', transactionId);
}

async function createGoogleAdsCampaign({
  campaignName,
  budget,
  targetLocation,
  targetAgeGroup,
  startDate,
  endDate,
  audienceInterests
}: {
  campaignName: string;
  budget: number;
  targetLocation: string;
  targetAgeGroup: string;
  startDate: string;
  endDate: string;
  audienceInterests: string[];
}) {
  // TODO: Implement Google Ads API integration
  // This would use the Google Ads API to create campaigns under the admin MCC
  // For now, return a mock success
  return {
    success: true,
    campaignId: `gads_${Date.now()}`
  };
}