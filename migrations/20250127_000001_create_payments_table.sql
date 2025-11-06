-- Migration: create_payments_table
-- Date: 2025-01-27
-- Time: 00:00:01
-- Description: Creates payments table for tracking Paystack payment transactions
-- Project ID: zviqhszbluqturpeoiuk
-- Status: Applied

-- ============================================
-- MIGRATION SQL STARTS HERE
-- ============================================

-- Create payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'success', 'failed', 'refunded', 'cancelled');

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Paystack transaction details
    paystack_reference TEXT UNIQUE NOT NULL,
    paystack_access_code TEXT,
    paystack_authorization_url TEXT,
    
    -- Payment amounts (in cents - smallest currency unit)
    amount_requested BIGINT NOT NULL, -- Amount in cents (e.g., 100000 = 1000.00 USD)
    amount_paid BIGINT, -- Actual amount paid in cents
    currency TEXT NOT NULL DEFAULT 'USD',
    
    -- Payment status
    status payment_status NOT NULL DEFAULT 'pending',
    
    -- Payment method details
    payment_method TEXT, -- card, bank, ussd, etc.
    payment_channel TEXT, -- channel used for payment
    
    -- Customer information
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    
    -- Transaction metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_campaign_id ON payments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paystack_reference ON payments(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_payments_updated_at ON payments;
CREATE TRIGGER trigger_update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can update all payments" ON payments;

-- Create RLS policies
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies (using email-based check as per current database implementation)
CREATE POLICY "Admins can view all payments" ON payments
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

CREATE POLICY "Admins can update all payments" ON payments
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

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON payments TO authenticated;
GRANT ALL ON payments TO service_role;

-- Add payment_status and payment_id columns to campaigns table
DO $$ 
BEGIN
    -- Add payment_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN payment_status payment_status DEFAULT 'pending';
    END IF;

    -- Add payment_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN payment_id UUID REFERENCES payments(id);
    END IF;
END $$;

-- Create index for payment_id in campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_payment_id ON campaigns(payment_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_payment_status ON campaigns(payment_status);

-- Add comments for documentation
COMMENT ON TABLE payments IS 'Stores Paystack payment transactions for campaigns';
COMMENT ON COLUMN payments.campaign_id IS 'ID of the campaign this payment is for';
COMMENT ON COLUMN payments.paystack_reference IS 'Unique Paystack transaction reference';
COMMENT ON COLUMN payments.amount_requested IS 'Amount requested in kobo (smallest currency unit)';
COMMENT ON COLUMN payments.amount_paid IS 'Actual amount paid in kobo';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, processing, success, failed, refunded, cancelled';

-- ============================================
-- MIGRATION SQL ENDS HERE
-- ============================================

-- Notes:
-- - Amounts are stored in cents (smallest currency unit) for USD
-- - Paystack reference is unique to prevent duplicate payments
-- - Payment status tracks the lifecycle of the payment
-- - RLS policies ensure users can only see their own payments
-- - Admins have full access for support purposes

-- Rollback SQL (if needed):
-- DROP TRIGGER IF EXISTS trigger_update_payments_updated_at ON payments;
-- DROP FUNCTION IF EXISTS update_payments_updated_at();
-- DROP POLICY IF EXISTS "Users can view own payments" ON payments;
-- DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
-- DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
-- DROP POLICY IF EXISTS "Admins can update all payments" ON payments;
-- ALTER TABLE campaigns DROP COLUMN IF EXISTS payment_id;
-- ALTER TABLE campaigns DROP COLUMN IF EXISTS payment_status;
-- DROP TABLE IF EXISTS payments;
-- DROP TYPE IF EXISTS payment_status;

