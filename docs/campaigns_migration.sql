-- Safe migration script for campaigns table
-- This script can be run multiple times without errors

-- Create campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_name TEXT NOT NULL,
    target_location TEXT[] NOT NULL DEFAULT '{}',
    target_age_group TEXT NOT NULL,
    duration_start DATE NOT NULL,
    duration_end DATE NOT NULL,
    audience_interests TEXT[] DEFAULT '{}',
    user_budget DECIMAL(12,2) NOT NULL,
    ad_spend DECIMAL(12,2) NOT NULL,
    platform_fee DECIMAL(12,2) NOT NULL,
    total_paid DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'failed', 'completed')),
    creative_url TEXT,
    google_ads_campaign_id TEXT,
    meta_ads_campaign_id TEXT,
    property_ids UUID[] DEFAULT '{}',
    platforms TEXT[] DEFAULT '{}',
    admin_notes TEXT,
    rejection_reason TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns that might not exist (safe to run multiple times)
DO $$ 
BEGIN
    -- Add platforms column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'platforms'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN platforms TEXT[] DEFAULT '{}';
    END IF;

    -- Add meta_ads_campaign_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'meta_ads_campaign_id'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN meta_ads_campaign_id TEXT;
    END IF;

    -- Add admin_notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN admin_notes TEXT;
    END IF;

    -- Add rejection_reason column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'rejection_reason'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN rejection_reason TEXT;
    END IF;

    -- Add approved_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'approved_by'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN approved_by UUID REFERENCES auth.users(id);
    END IF;

    -- Add approved_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_approved_at ON campaigns(approved_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_property_ids ON campaigns USING GIN(property_ids);
CREATE INDEX IF NOT EXISTS idx_campaigns_platforms ON campaigns USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_campaigns_target_location ON campaigns USING GIN(target_location);
CREATE INDEX IF NOT EXISTS idx_campaigns_audience_interests ON campaigns USING GIN(audience_interests);

-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_campaigns_updated_at ON campaigns;
CREATE TRIGGER trigger_update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_campaigns_updated_at();

-- Enable RLS if not already enabled
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can insert own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can update own pending campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can update all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON campaigns;

-- Create RLS policies
CREATE POLICY "Users can view own campaigns" ON campaigns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending campaigns" ON campaigns
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Note: Admin policies require admin role implementation
-- For now, we'll create basic admin policies
-- You may need to adjust these based on your admin role system
CREATE POLICY "Admins can view all campaigns" ON campaigns
    FOR SELECT USING (true); -- Adjust this based on your admin role system

CREATE POLICY "Admins can update all campaigns" ON campaigns
    FOR UPDATE USING (true); -- Adjust this based on your admin role system

CREATE POLICY "Admins can delete campaigns" ON campaigns
    FOR DELETE USING (true); -- Adjust this based on your admin role system

-- Update existing campaigns to have empty platforms array if they don't have one
UPDATE campaigns SET platforms = '{}' WHERE platforms IS NULL;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON campaigns TO authenticated;
GRANT ALL ON campaigns TO service_role;
