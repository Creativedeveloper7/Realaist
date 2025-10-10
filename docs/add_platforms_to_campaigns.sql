-- Add platforms field to campaigns table if it doesn't exist
-- This script can be run safely multiple times

-- Add platforms column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'platforms'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN platforms TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add index for platforms field for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_platforms ON campaigns USING GIN(platforms);

-- Update existing campaigns to have empty platforms array if they don't have one
UPDATE campaigns SET platforms = '{}' WHERE platforms IS NULL;
