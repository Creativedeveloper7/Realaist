-- Campaigns table for ad campaign management
-- This script creates the campaigns table with all necessary fields for the approval workflow

-- Create campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_name TEXT NOT NULL,
    target_location TEXT[] NOT NULL DEFAULT '{}', -- Array of target locations
    target_age_group TEXT NOT NULL,
    duration_start DATE NOT NULL,
    duration_end DATE NOT NULL,
    audience_interests TEXT[] DEFAULT '{}', -- Array of interest tags
    user_budget DECIMAL(12,2) NOT NULL, -- Full amount paid by user
    ad_spend DECIMAL(12,2) NOT NULL, -- Amount actually spent on ads (after platform fee)
    platform_fee DECIMAL(12,2) NOT NULL, -- Hidden platform fee
    total_paid DECIMAL(12,2) NOT NULL, -- Total amount charged to user
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'completed')),
    creative_url TEXT, -- URL to uploaded creative (optional)
    google_ads_campaign_id TEXT, -- Google Ads campaign ID (set when approved)
    meta_ads_campaign_id TEXT, -- Meta Ads campaign ID (set when approved)
    property_ids UUID[] DEFAULT '{}', -- Array of property IDs for this campaign
    platforms TEXT[] DEFAULT '{}', -- Array of platforms (google, meta, etc.)
    admin_notes TEXT, -- Admin notes for approval/rejection
    rejection_reason TEXT, -- Reason for rejection if applicable
    approved_by UUID REFERENCES auth.users(id), -- Admin who approved the campaign
    approved_at TIMESTAMPTZ, -- When the campaign was approved
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_approved_at ON campaigns(approved_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_property_ids ON campaigns USING GIN(property_ids);
CREATE INDEX IF NOT EXISTS idx_campaigns_platforms ON campaigns USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_campaigns_target_location ON campaigns USING GIN(target_location);
CREATE INDEX IF NOT EXISTS idx_campaigns_audience_interests ON campaigns USING GIN(audience_interests);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_campaigns_updated_at ON campaigns;
CREATE TRIGGER trigger_update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_campaigns_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own campaigns
CREATE POLICY "Users can view own campaigns" ON campaigns
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own campaigns
CREATE POLICY "Users can insert own campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own campaigns (only if pending)
CREATE POLICY "Users can update own pending campaigns" ON campaigns
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all campaigns (assuming admin role check)
-- Note: You'll need to implement admin role checking in your application
CREATE POLICY "Admins can view all campaigns" ON campaigns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
        )
    );

-- Admins can update all campaigns
CREATE POLICY "Admins can update all campaigns" ON campaigns
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
        )
    );

-- Admins can delete campaigns (for cleanup)
CREATE POLICY "Admins can delete campaigns" ON campaigns
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.user_type = 'admin'
        )
    );

-- Add some sample data for testing (optional - remove in production)
-- INSERT INTO campaigns (
--     user_id,
--     campaign_name,
--     target_location,
--     target_age_group,
--     duration_start,
--     duration_end,
--     audience_interests,
--     user_budget,
--     ad_spend,
--     platform_fee,
--     total_paid,
--     status,
--     property_ids,
--     platforms
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
--     'Sample Campaign',
--     ARRAY['Nairobi', 'Mombasa'],
--     '25-34',
--     CURRENT_DATE,
--     CURRENT_DATE + INTERVAL '30 days',
--     ARRAY['Real Estate Investment', 'Luxury Living'],
--     1000.00,
--     600.00,
--     400.00,
--     1000.00,
--     'pending',
--     ARRAY['00000000-0000-0000-0000-000000000001'], -- Replace with actual property ID
--     ARRAY['google', 'meta']
-- );

-- Create a view for campaign statistics (useful for admin dashboard)
CREATE OR REPLACE VIEW campaign_stats AS
SELECT 
    status,
    COUNT(*) as count,
    SUM(user_budget) as total_budget,
    SUM(ad_spend) as total_ad_spend,
    SUM(platform_fee) as total_platform_fee,
    AVG(user_budget) as avg_budget
FROM campaigns
GROUP BY status;

-- Create a view for recent campaigns (last 30 days)
CREATE OR REPLACE VIEW recent_campaigns AS
SELECT 
    c.*,
    p.first_name,
    p.last_name,
    p.company_name,
    p.email
FROM campaigns c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE c.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY c.created_at DESC;

-- Grant necessary permissions
-- Note: Adjust these based on your specific security requirements

-- Grant select permission to authenticated users for their own campaigns
GRANT SELECT ON campaigns TO authenticated;
GRANT SELECT ON campaign_stats TO authenticated;
GRANT SELECT ON recent_campaigns TO authenticated;

-- Grant insert permission to authenticated users
GRANT INSERT ON campaigns TO authenticated;

-- Grant update permission to authenticated users (for their own campaigns)
GRANT UPDATE ON campaigns TO authenticated;

-- Grant all permissions to service role (for admin operations)
GRANT ALL ON campaigns TO service_role;
GRANT ALL ON campaign_stats TO service_role;
GRANT ALL ON recent_campaigns TO service_role;

-- Add comments for documentation
COMMENT ON TABLE campaigns IS 'Stores advertising campaigns created by developers';
COMMENT ON COLUMN campaigns.user_id IS 'ID of the user who created the campaign';
COMMENT ON COLUMN campaigns.campaign_name IS 'Name of the campaign';
COMMENT ON COLUMN campaigns.target_location IS 'Array of target locations for the campaign';
COMMENT ON COLUMN campaigns.target_age_group IS 'Target age group for the campaign';
COMMENT ON COLUMN campaigns.duration_start IS 'Campaign start date';
COMMENT ON COLUMN campaigns.duration_end IS 'Campaign end date';
COMMENT ON COLUMN campaigns.audience_interests IS 'Array of audience interests for targeting';
COMMENT ON COLUMN campaigns.user_budget IS 'Total budget paid by the user';
COMMENT ON COLUMN campaigns.ad_spend IS 'Amount actually spent on ads (after platform fee)';
COMMENT ON COLUMN campaigns.platform_fee IS 'Platform fee (hidden from user)';
COMMENT ON COLUMN campaigns.total_paid IS 'Total amount charged to user';
COMMENT ON COLUMN campaigns.status IS 'Campaign status: pending, active, failed, completed';
COMMENT ON COLUMN campaigns.google_ads_campaign_id IS 'Google Ads campaign ID (set when approved)';
COMMENT ON COLUMN campaigns.meta_ads_campaign_id IS 'Meta Ads campaign ID (set when approved)';
COMMENT ON COLUMN campaigns.property_ids IS 'Array of property IDs included in the campaign';
COMMENT ON COLUMN campaigns.platforms IS 'Array of advertising platforms (google, meta, etc.)';
COMMENT ON COLUMN campaigns.admin_notes IS 'Admin notes for the campaign';
COMMENT ON COLUMN campaigns.rejection_reason IS 'Reason for rejection if applicable';
COMMENT ON COLUMN campaigns.approved_by IS 'ID of the admin who approved the campaign';
COMMENT ON COLUMN campaigns.approved_at IS 'Timestamp when the campaign was approved';
