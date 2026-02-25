-- Store guest/visitor name and email for scheduled visits (short stay bookings).
-- Enables hosts to email payment receipts to the paying guest.
ALTER TABLE scheduled_visits
ADD COLUMN IF NOT EXISTS visitor_name TEXT,
ADD COLUMN IF NOT EXISTS visitor_email TEXT;

COMMENT ON COLUMN scheduled_visits.visitor_name IS 'Guest/visitor name (e.g. from booking form)';
COMMENT ON COLUMN scheduled_visits.visitor_email IS 'Guest/visitor email (e.g. used for payment); for receipt delivery';
