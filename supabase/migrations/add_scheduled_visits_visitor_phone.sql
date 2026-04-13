-- Store guest/visitor phone for scheduled visits (short stay bookings).
-- Enables hosts to send receipt via WhatsApp/SMS.
ALTER TABLE scheduled_visits
ADD COLUMN IF NOT EXISTS visitor_phone TEXT;

COMMENT ON COLUMN scheduled_visits.visitor_phone IS 'Guest/visitor phone (e.g. from booking form); for receipt delivery via WhatsApp/SMS';
