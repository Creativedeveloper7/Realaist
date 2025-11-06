import { supabase } from '../lib/supabase';
import { campaignsConfig } from '../config/campaigns';

export interface Campaign {
  id: string;
  user_id: string;
  campaign_name: string;
  target_location: string[];
  target_age_group: string;
  duration_start: string;
  duration_end: string;
  audience_interests: string[];
  user_budget: number;
  ad_spend: number;
  platform_fee: number;
  total_paid: number;
  status: 'active' | 'pending' | 'failed' | 'completed';
  payment_status?: 'pending' | 'processing' | 'success' | 'failed' | 'refunded' | 'cancelled';
  payment_id?: string;
  google_ads_campaign_id?: string;
  property_ids: string[];
  platforms: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignData {
  target_location: string[];
  target_age_group: string;
  duration_start: string;
  duration_end: string;
  audience_interests: string[];
  budget: number;
  property_ids: string[];
  platforms: string[];
}

class CampaignsService {
  // Get all campaigns for the current user
  async getUserCampaigns(): Promise<{ campaigns: Campaign[]; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { campaigns: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        return { campaigns: [], error: error.message };
      }

      const campaigns: Campaign[] = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        campaign_name: item.campaign_name,
        target_location: Array.isArray(item.target_location) ? item.target_location : [item.target_location],
        target_age_group: item.target_age_group,
        duration_start: item.duration_start,
        duration_end: item.duration_end,
        audience_interests: Array.isArray(item.audience_interests) ? item.audience_interests : [],
        user_budget: item.user_budget,
        ad_spend: item.ad_spend,
        platform_fee: item.platform_fee,
        total_paid: item.total_paid,
        status: item.status,
        google_ads_campaign_id: item.google_ads_campaign_id,
        property_ids: Array.isArray(item.property_ids) ? item.property_ids : [],
        platforms: Array.isArray(item.platforms) ? item.platforms : [],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      return { campaigns, error: null };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return { campaigns: [], error: 'An unexpected error occurred' };
    }
  }

  // Create a new campaign (submitted for admin approval)
  async createCampaign(data: CreateCampaignData): Promise<{ campaign: Campaign | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { campaign: null, error: 'User not authenticated' };
      }

      // Validate required fields
      if (!data.budget || !data.duration_start || !data.duration_end || 
          !data.property_ids || data.property_ids.length === 0 || 
          !data.target_location || data.target_location.length === 0 || 
          !data.platforms || data.platforms.length === 0) {
        return { campaign: null, error: 'Missing required fields' };
      }

      // Generate campaign name
      const campaign_name = `Property Campaign - ${new Date().toLocaleDateString()}`;

      // Calculate fees
      const feeRate = campaignsConfig.feeRate; // 40% hidden platform fee
      const platformFee = data.budget * feeRate;
      const adSpend = data.budget - platformFee;

      // Prepare campaign data - status starts as 'pending' for admin approval
      // Payment status starts as 'pending' - payment will be collected before approval
      const campaignData: any = {
        user_id: user.id,
        campaign_name,
        target_location: data.target_location,
        target_age_group: data.target_age_group,
        duration_start: data.duration_start,
        duration_end: data.duration_end,
        audience_interests: data.audience_interests || [],
        user_budget: data.budget,
        ad_spend: adSpend,
        platform_fee: platformFee,
        total_paid: data.budget,
        status: 'pending', // Campaign starts as pending admin approval
        payment_status: 'pending', // Payment status starts as pending
        property_ids: data.property_ids
      };

      // Add platforms field if it exists in the database schema
      if (data.platforms && data.platforms.length > 0) {
        campaignData.platforms = data.platforms;
      }

      console.log('Creating campaign for admin approval:', campaignData);

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        console.error('Campaign data that failed:', campaignData);
        return { 
          campaign: null, 
          error: `Failed to save campaign: ${error.message}` 
        };
      }

      console.log('Campaign submitted for approval:', campaign);

      const createdCampaign: Campaign = {
        id: campaign.id,
        user_id: campaign.user_id,
        campaign_name: campaign.campaign_name,
        target_location: Array.isArray(campaign.target_location) ? campaign.target_location : [campaign.target_location],
        target_age_group: campaign.target_age_group,
        duration_start: campaign.duration_start,
        duration_end: campaign.duration_end,
        audience_interests: Array.isArray(campaign.audience_interests) ? campaign.audience_interests : [],
        user_budget: campaign.user_budget,
        ad_spend: campaign.ad_spend,
        platform_fee: campaign.platform_fee,
        total_paid: campaign.total_paid,
        status: campaign.status,
        payment_status: campaign.payment_status || 'pending',
        payment_id: campaign.payment_id,
        google_ads_campaign_id: campaign.google_ads_campaign_id,
        property_ids: Array.isArray(campaign.property_ids) ? campaign.property_ids : [],
        platforms: Array.isArray(campaign.platforms) ? campaign.platforms : [],
        created_at: campaign.created_at,
        updated_at: campaign.updated_at
      };

      return { campaign: createdCampaign, error: null };
    } catch (error) {
      console.error('Error creating campaign:', error);
      return { campaign: null, error: 'An unexpected error occurred' };
    }
  }

  // Get campaign by ID
  async getCampaignById(id: string): Promise<{ campaign: Campaign | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { campaign: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return { campaign: null, error: error.message };
      }

      const campaign: Campaign = {
        id: data.id,
        user_id: data.user_id,
        campaign_name: data.campaign_name,
        target_location: Array.isArray(data.target_location) ? data.target_location : [data.target_location],
        target_age_group: data.target_age_group,
        duration_start: data.duration_start,
        duration_end: data.duration_end,
        audience_interests: Array.isArray(data.audience_interests) ? data.audience_interests : [],
        user_budget: data.user_budget,
        ad_spend: data.ad_spend,
        platform_fee: data.platform_fee,
        total_paid: data.total_paid,
        status: data.status,
        google_ads_campaign_id: data.google_ads_campaign_id,
        property_ids: Array.isArray(data.property_ids) ? data.property_ids : [],
        platforms: Array.isArray(data.platforms) ? data.platforms : [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return { campaign, error: null };
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return { campaign: null, error: 'An unexpected error occurred' };
    }
  }

  // Update campaign status
  async updateCampaignStatus(id: string, status: Campaign['status']): Promise<{ error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('campaigns')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating campaign status:', error);
      return { error: 'An unexpected error occurred' };
    }
  }

  // Admin methods for campaign approval workflow
  async getAllCampaignsForAdmin(): Promise<{ campaigns: Campaign[]; error: string | null }> {
    try {
      // This would typically check for admin permissions
      // For now, we'll fetch all campaigns
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          user:profiles!campaigns_user_id_fkey(
            id,
            first_name,
            last_name,
            company_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns for admin:', error);
        return { campaigns: [], error: error.message };
      }

      const campaigns: Campaign[] = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        campaign_name: item.campaign_name,
        target_location: Array.isArray(item.target_location) ? item.target_location : [item.target_location],
        target_age_group: item.target_age_group,
        duration_start: item.duration_start,
        duration_end: item.duration_end,
        audience_interests: Array.isArray(item.audience_interests) ? item.audience_interests : [],
        user_budget: item.user_budget,
        ad_spend: item.ad_spend,
        platform_fee: item.platform_fee,
        total_paid: item.total_paid,
        status: item.status,
        google_ads_campaign_id: item.google_ads_campaign_id,
        property_ids: Array.isArray(item.property_ids) ? item.property_ids : [],
        platforms: Array.isArray(item.platforms) ? item.platforms : [],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      return { campaigns, error: null };
    } catch (error) {
      console.error('Error fetching campaigns for admin:', error);
      return { campaigns: [], error: 'An unexpected error occurred' };
    }
  }

  // Admin approve campaign
  async approveCampaign(id: string): Promise<{ error: string | null }> {
    try {
      // Get campaign details first
      const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !campaign) {
        return { error: 'Campaign not found' };
      }

      if (campaign.status !== 'pending') {
        return { error: 'Campaign is not in pending status' };
      }

      // Generate Google Ads campaign ID when approved
      const googleAdsResult = {
        success: true,
        campaignId: `gads_${Date.now()}_${campaign.user_id.slice(0, 8)}`
      };

      console.log(`Approving campaign and creating Google Ads campaign: ${googleAdsResult.campaignId}`);

      // Update campaign status to active and add Google Ads ID
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: 'active',
          google_ads_campaign_id: googleAdsResult.campaignId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      console.log('Campaign approved successfully:', id);
      return { error: null };
    } catch (error) {
      console.error('Error approving campaign:', error);
      return { error: 'An unexpected error occurred' };
    }
  }

  // Admin reject campaign
  async rejectCampaign(id: string, reason?: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      console.log('Campaign rejected:', id, reason ? `Reason: ${reason}` : '');
      return { error: null };
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      return { error: 'An unexpected error occurred' };
    }
  }
}

export const campaignsService = new CampaignsService();
