-- Add check_out_date for short-stay bookings (date range = unavailable)
ALTER TABLE scheduled_visits
ADD COLUMN IF NOT EXISTS check_out_date DATE;

COMMENT ON COLUMN scheduled_visits.check_out_date IS 'For short-stay bookings: last night of stay. NULL = single-day visit.';

-- Allow anyone to read visit date ranges for property availability (no PII in our usage)
DROP POLICY IF EXISTS "Public can view visit dates for availability" ON scheduled_visits;
CREATE POLICY "Public can view visit dates for availability" ON scheduled_visits
  FOR SELECT USING (true);
