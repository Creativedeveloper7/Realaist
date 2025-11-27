-- Fix admin access to contact_messages
-- Ensure admins can view all messages

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Admins can view contact messages" ON contact_messages;

-- Create a more permissive SELECT policy for admins
-- Check if user is admin by email (since user_type might not be set correctly)
CREATE POLICY "Admins can view contact messages" ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.user_type = 'admin'
        OR profiles.email IN (
          'admin@realaist.tech',
          'admin@realaist.com',
          'superadmin@realaist.com',
          'support@realaist.com'
        )
      )
    )
  );

-- Also allow service role (for backend operations)
-- This is a fallback in case the profile check doesn't work
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'contact_messages'
ORDER BY policyname;

