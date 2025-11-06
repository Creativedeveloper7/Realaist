-- Migration: initial_campaigns_table
-- Date: 2025-01-27
-- Time: 00:00:00
-- Description: Initial creation of campaigns table with all required fields for advertising campaign management
-- Project ID: zviqhszbluqturpeoiuk
-- Status: Applied (already exists in database)

-- ============================================
-- MIGRATION SQL STARTS HERE
-- ============================================

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_approved_at ON campaigns(approved_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_property_ids ON campaigns USING GIN(property_ids);
CREATE INDEX IF NOT EXISTS idx_campaigns_platforms ON campaigns USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_campaigns_target_location ON campaigns USING GIN(target_location);
CREATE INDEX IF NOT EXISTS idx_campaigns_audience_interests ON campaigns USING GIN(audience_interests);

-- Create function to automatically update updated_at timestamp
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

-- Admin policies (using email-based check as per current database implementation)
CREATE POLICY "Admins can view all campaigns" ON campaigns
    FOR SELECT USING (
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

CREATE POLICY "Admins can update all campaigns" ON campaigns
    FOR UPDATE USING (
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

CREATE POLICY "Admins can delete campaigns" ON campaigns
    FOR DELETE USING (
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

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON campaigns TO authenticated;
GRANT ALL ON campaigns TO service_role;

-- ============================================
-- MIGRATION SQL ENDS HERE
-- ============================================

-- Notes:
-- - This migration creates the complete campaigns table structure
-- - Includes all fields: platforms, meta_ads_campaign_id, admin fields
-- - RLS policies use email-based admin check (matching current database)
-- - All indexes are created for optimal query performance
-- - Auto-update trigger for updated_at timestamp

-- Rollback SQL (if needed):
-- DROP TRIGGER IF EXISTS trigger_update_campaigns_updated_at ON campaigns;
-- DROP FUNCTION IF EXISTS update_campaigns_updated_at();
-- DROP POLICY IF EXISTS "Users can view own campaigns" ON campaigns;
-- DROP POLICY IF EXISTS "Users can insert own campaigns" ON campaigns;
-- DROP POLICY IF EXISTS "Users can update own pending campaigns" ON campaigns;
-- DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;
-- DROP POLICY IF EXISTS "Admins can update all campaigns" ON campaigns;
-- DROP POLICY IF EXISTS "Admins can delete campaigns" ON campaigns;
-- DROP TABLE IF EXISTS campaigns;

