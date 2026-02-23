-- Add optional video URL for short stays (e.g. tour video; used by "Watch Video" on property details)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN properties.video_url IS 'Optional URL for property/tour video; shown as Watch Video on short stay details.';
