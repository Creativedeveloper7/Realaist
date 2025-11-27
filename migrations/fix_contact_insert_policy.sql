-- Quick fix for contact_messages insert policy
-- This ensures anonymous users can insert messages

-- First, drop the existing insert policy
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;

-- Create a new policy that explicitly allows anonymous users
-- Using FOR ALL instead of FOR INSERT to be more explicit
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Verify the policy was created (this will show in the results)
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
WHERE tablename = 'contact_messages';

