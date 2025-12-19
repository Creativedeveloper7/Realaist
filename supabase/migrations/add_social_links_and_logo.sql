-- Add social links and logo fields to profiles table
-- This migration adds fields for website, instagram, x (twitter), facebook, and logo_url

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS x TEXT, -- X (formerly Twitter)
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.website IS 'Developer/User website URL';
COMMENT ON COLUMN profiles.instagram IS 'Instagram profile URL';
COMMENT ON COLUMN profiles.x IS 'X (Twitter) profile URL';
COMMENT ON COLUMN profiles.facebook IS 'Facebook profile URL';
COMMENT ON COLUMN profiles.logo_url IS 'Company/Developer logo image URL';


