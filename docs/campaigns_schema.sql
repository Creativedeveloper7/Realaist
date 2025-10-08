-- Campaigns table for ad campaign management
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    campaign_name TEXT NOT NULL,
    target_location TEXT,
    target_age_group TEXT,
    duration_start DATE,
    duration_end DATE,
    audience_interests TEXT[], -- Array of interest tags
    user_budget DECIMAL(12,2) NOT NULL, -- Full amount paid by user
    ad_spend DECIMAL(12,2) NOT NULL, -- Amount actually spent on ads (after platform fee)
    platform_fee DECIMAL(12,2) NOT NULL, -- Hidden platform fee
    total_paid DECIMAL(12,2) NOT NULL, -- Total amount charged to user
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'failed', 'completed')),
    creative_url TEXT, -- URL to uploaded creative
    google_ads_campaign_id TEXT, -- Google Ads campaign ID
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

-- RLS policies (if using Supabase)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Users can only see their own campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own campaigns
CREATE POLICY "Users can insert own campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own campaigns
CREATE POLICY "Users can update own campaigns" ON campaigns
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can see all campaigns
CREATE POLICY "Admins can view all campaigns" ON campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'admin@realaist.com',
                'admin@realaist.tech', 
                'superadmin@realaist.com',
                'support@realaist.com'
            )
        )
    );