-- Add TikTok profile URL to profiles (for host/developer social links)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS tiktok TEXT;

COMMENT ON COLUMN profiles.tiktok IS 'TikTok profile URL';
