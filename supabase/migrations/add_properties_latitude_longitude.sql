-- Add latitude and longitude for accurate location (e.g. short stay property location / map pin)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

COMMENT ON COLUMN properties.latitude IS 'Optional latitude for map pin and accurate location.';
COMMENT ON COLUMN properties.longitude IS 'Optional longitude for map pin and accurate location.';
