-- Migration: update_currency_to_kes
-- Date: 2025-01-27
-- Time: 00:00:02
-- Description: Updates default currency from USD to KES for payments table
-- Project ID: zviqhszbluqturpeoiuk
-- Status: Applied

-- ============================================
-- MIGRATION SQL STARTS HERE
-- ============================================

-- Update default currency for payments table
ALTER TABLE payments 
  ALTER COLUMN currency SET DEFAULT 'KES';

-- Update existing payments with NULL or 'USD' currency to 'KES'
-- (Only if there are any existing records)
UPDATE payments 
SET currency = 'KES' 
WHERE currency IS NULL OR currency = 'USD';

-- Update comments to reflect KES
COMMENT ON COLUMN payments.amount_requested IS 'Amount in cents (e.g., 100000 = 1000.00 KES)';
COMMENT ON COLUMN payments.amount_paid IS 'Actual amount paid in cents (KES)';
COMMENT ON COLUMN payments.currency IS 'Currency code (default: KES)';

