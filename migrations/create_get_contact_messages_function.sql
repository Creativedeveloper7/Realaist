-- Create a function that bypasses RLS for admins to get contact messages
-- This is more reliable than RLS policies

-- Drop function if it exists
DROP FUNCTION IF EXISTS get_contact_messages_for_admin();

-- Create function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION get_contact_messages_for_admin()
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Get current user's email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if user is admin by email
  IF v_user_email IS NULL OR v_user_email NOT IN (
    'admin@realaist.tech',
    'admin@realaist.com',
    'superadmin@realaist.com',
    'support@realaist.com'
  ) THEN
    -- Also check if user_type is admin in profiles
    IF NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;
  END IF;
  
  -- Return all messages (bypassing RLS)
  RETURN QUERY
  SELECT 
    cm.id,
    cm.name,
    cm.email,
    cm.phone,
    cm.message,
    cm.status,
    cm.created_at,
    cm.updated_at
  FROM contact_messages cm
  ORDER BY cm.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_contact_messages_for_admin() TO authenticated;

