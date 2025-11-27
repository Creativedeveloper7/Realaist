-- Create a function that bypasses RLS for inserting contact messages
-- This is more reliable than RLS policies for anonymous inserts

-- Drop function if it exists
DROP FUNCTION IF EXISTS create_contact_message(TEXT, TEXT, TEXT, TEXT);

-- Create function with SECURITY DEFINER to bypass RLS
-- Returns the full message record as JSONB
CREATE OR REPLACE FUNCTION create_contact_message(
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_message TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message contact_messages%ROWTYPE;
BEGIN
  INSERT INTO contact_messages (name, email, phone, message, status)
  VALUES (p_name, p_email, p_phone, p_message, 'new')
  RETURNING * INTO v_message;
  
  RETURN to_jsonb(v_message);
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION create_contact_message(TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_contact_message(TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Also ensure the insert policy exists (as backup)
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

