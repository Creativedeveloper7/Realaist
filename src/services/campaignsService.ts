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
        payment_status: item.payment_status || 'pending',
        payment_id: item.payment_id,
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
      // Fetch campaigns - campaigns.user_id references auth.users.id
      // profiles.id also references auth.users.id, so user_id = profiles.id
      // We'll fetch profiles separately and join in code
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsError) {
        console.error('Error fetching campaigns for admin:', campaignsError);
        return { campaigns: [], error: campaignsError.message };
      }

      if (!campaignsData || campaignsData.length === 0) {
        return { campaigns: [], error: null };
      }

      // Get unique user IDs
      const userIds = [...new Set(campaignsData.map((c: any) => c.user_id))];

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, company_name, email')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Error fetching profiles for campaigns:', profilesError);
        // Continue without profile data
      }

      // Create a map of user_id -> profile for quick lookup
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach((profile: any) => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Map campaigns with profile data
      const campaigns: Campaign[] = campaignsData.map((item: any) => {
        const profile = profilesMap.get(item.user_id);
        return {
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
          payment_status: item.payment_status || 'pending',
          payment_id: item.payment_id,
        google_ads_campaign_id: item.google_ads_campaign_id,
        property_ids: Array.isArray(item.property_ids) ? item.property_ids : [],
        platforms: Array.isArray(item.platforms) ? item.platforms : [],
        created_at: item.created_at,
          updated_at: item.updated_at,
          // Store profile data if needed (for future use)
          _profile: profile || null
        };
      });

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

      // Check if payment is successful
      if (campaign.payment_status !== 'success') {
        return { error: 'Campaign payment must be successful before approval' };
      }

      // Check if Google Ads platform is selected
      const platforms = campaign.platforms || [];
      const hasGooglePlatform = platforms.includes('google');

      let googleAdsCampaignId: string | null = null;

      // Create Google Ads campaign if Google platform is selected
      if (hasGooglePlatform) {
        try {
          console.log('Creating Google Ads campaign for campaign:', id);
          
          // Verify user is authenticated with a REAL Supabase session (not mock admin)
          // This is required for Edge Function calls which need a valid JWT token
          const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
          if (userError || !authUser) {
            console.error('Authentication error:', userError);
            return { 
              error: 'Valid Supabase authentication required. Please log in with a real admin account (not mock admin).' 
            };
          }

          // Get session after getUser (which refreshes it if needed)
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          let session = sessionData?.session;
          
          if (sessionError || !session) {
            console.error('Session error:', sessionError);
            // Try to refresh the session explicitly
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError || !refreshData.session) {
              console.error('Failed to refresh session:', refreshError);
              return { 
                error: 'No valid Supabase session found. Please log in with a real admin account. Mock admin accounts cannot approve campaigns.' 
              };
            }
            session = refreshData.session;
          }
          
          if (!session || !session.access_token) {
            return { 
              error: 'No valid session token available. Please log in with a real Supabase admin account to approve campaigns.' 
            };
          }
          
          // Additional check: Ensure this is a real Supabase user, not a mock admin
          // Mock admin users have IDs like 'admin-1' which are not valid UUIDs
          if (authUser.id && !authUser.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            console.error('Invalid user ID format (likely mock admin):', authUser.id);
            return { 
              error: 'Mock admin accounts cannot approve campaigns. Please log in with a real Supabase admin account.' 
            };
          }

          // Get Supabase URL from environment
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (!supabaseUrl) {
            return { error: 'Supabase URL not configured' };
          }

          const functionSuffix =
            import.meta.env.VITE_GOOGLE_ADS_EDGE_FUNCTION || 'create-google-ads-campaign-rest';
          const functionUrl = `${supabaseUrl}/functions/v1/${functionSuffix}`;

          console.log('Calling Google Ads Edge Function:', {
            url: functionUrl,
            campaign_id: campaign.id,
            hasToken: !!session.access_token,
            tokenPrefix: session.access_token?.substring(0, 20) + '...',
          });

          // Call Google Ads Edge Function
          let response: Response;
          try {
            response = await fetch(functionUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
              },
              body: JSON.stringify({
                campaign_id: campaign.id,
                campaign_name: campaign.campaign_name,
                budget: Number(campaign.ad_spend), // Use ad_spend (after platform fee)
                target_location: campaign.target_location || [],
                target_age_group: campaign.target_age_group,
                duration_start: campaign.duration_start,
                duration_end: campaign.duration_end,
                audience_interests: campaign.audience_interests || [],
                property_ids: campaign.property_ids || [],
                platforms: platforms,
              }),
            });
          } catch (fetchError: any) {
            console.error('Fetch error (network/CORS):', fetchError);
            return { 
              error: `Network error: ${fetchError.message || 'Failed to connect to server'}. Please check your internet connection and try again.` 
            };
          }

          // Check if response is ok before trying to parse JSON
          let result: any;
          try {
            const text = await response.text();
            console.log('Edge Function response status:', response.status);
            console.log('Edge Function response text:', text.substring(0, 500));
            
            if (!text) {
              return { 
                error: `Empty response from server (status ${response.status}). Please check Edge Function logs.` 
      };
            }
            
            result = JSON.parse(text);
          } catch (parseError: any) {
            console.error('Failed to parse response as JSON:', parseError);
            return { 
              error: `Invalid response from server (status ${response.status}). Please check Edge Function logs.` 
            };
          }

          if (!response.ok) {
            console.error('Google Ads API error response:', {
              status: response.status,
              statusText: response.statusText,
              result,
            });
            return { 
              error: result.error || result.message || `Failed to create Google Ads campaign (status ${response.status}). Please check Google Ads configuration in settings.` 
            };
          }

          if (result.success && result.googleAdsCampaignId) {
            googleAdsCampaignId = result.googleAdsCampaignId;
            console.log('Google Ads campaign created successfully:', googleAdsCampaignId);
          } else {
            console.warn('Google Ads campaign creation returned unexpected result:', result);
            return { error: 'Failed to create Google Ads campaign: Invalid response from API' };
          }
        } catch (googleAdsError: any) {
          console.error('Error creating Google Ads campaign:', googleAdsError);
          return { 
            error: `Failed to create Google Ads campaign: ${googleAdsError.message || 'Unknown error'}. Please verify Google Ads configuration in admin settings.` 
          };
        }
      }

      // Update campaign status to active and add Google Ads ID (if created)
      const updateData: any = {
        status: 'active',
        updated_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        approved_at: new Date().toISOString(),
      };

      if (googleAdsCampaignId) {
        updateData.google_ads_campaign_id = googleAdsCampaignId;
      }

      const { error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      console.log('Campaign approved successfully:', id);
      return { error: null };
    } catch (error: any) {
      console.error('Error approving campaign:', error);
      return { error: error.message || 'An unexpected error occurred' };
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

  // Get Google Ads analytics for a campaign
  async getCampaignAnalytics(
    googleAdsCampaignId: string,
    dateRange?: { startDate?: string; endDate?: string }
  ): Promise<{ analytics: any | null; error: string | null }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { analytics: null, error: 'User not authenticated' };
      }

      // Get session for Edge Function call
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      let session = sessionData?.session;
      
      if (sessionError || !session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          return { analytics: null, error: 'No valid session found' };
        }
        session = refreshData.session;
      }

      if (!session || !session.access_token) {
        return { analytics: null, error: 'No valid session token available' };
      }

      // Get Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        return { analytics: null, error: 'Supabase URL not configured' };
      }

      const functionUrl = `${supabaseUrl}/functions/v1/get-google-ads-analytics`;

      // Prepare request body
      const requestBody: any = {
        google_ads_campaign_id: googleAdsCampaignId,
      };

      if (dateRange) {
        requestBody.date_range = {
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        };
      }

      // Call Edge Function
      let response: Response;
      try {
        response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify(requestBody),
        });
      } catch (fetchError: any) {
        console.error('Fetch error:', fetchError);
        return { analytics: null, error: `Network error: ${fetchError.message}` };
      }

      // Parse response
      let result: any;
      try {
        const text = await response.text();
        if (!text) {
          return { analytics: null, error: `Empty response from server (status ${response.status})` };
        }
        result = JSON.parse(text);
      } catch (parseError: any) {
        console.error('Failed to parse response:', parseError);
        return { analytics: null, error: `Invalid response from server (status ${response.status})` };
      }

      if (!response.ok) {
        console.error('Analytics API error:', result);
        return { 
          analytics: null, 
          error: result.error || `Failed to fetch analytics (status ${response.status})` 
        };
      }

      if (result.success && result.analytics) {
        return { analytics: result.analytics, error: null };
      }

      return { analytics: null, error: 'Invalid response from analytics API' };
    } catch (error: any) {
      console.error('Error fetching campaign analytics:', error);
      return { analytics: null, error: error.message || 'An unexpected error occurred' };
    }
  }
}

export const campaignsService = new CampaignsService();
