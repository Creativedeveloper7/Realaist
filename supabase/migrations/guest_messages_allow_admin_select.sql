-- Allow admins to read all guest messages (for admin panel).
-- Uses JWT email; keep in sync with app admin allowlist.
DROP POLICY IF EXISTS "Allow admin to view all guest messages" ON guest_messages;
CREATE POLICY "Allow admin to view all guest messages" ON guest_messages
  FOR SELECT
  USING (
    LOWER(auth.jwt() ->> 'email') IN (
      'admin@realaist.com',
      'admin@realaist.tech',
      'superadmin@realaist.com',
      'support@realaist.com'
    )
  );
