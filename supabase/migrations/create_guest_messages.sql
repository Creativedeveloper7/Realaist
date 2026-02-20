-- Guest messages: messages from guests to hosts about a short stay property.
CREATE TABLE IF NOT EXISTS guest_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_messages_property_id ON guest_messages(property_id);
CREATE INDEX IF NOT EXISTS idx_guest_messages_created_at ON guest_messages(created_at DESC);

ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can send a message (guest or logged-in user).
DROP POLICY IF EXISTS "Allow insert guest messages" ON guest_messages;
CREATE POLICY "Allow insert guest messages" ON guest_messages FOR INSERT WITH CHECK (true);

-- Only the host (property owner) can read messages for their properties.
DROP POLICY IF EXISTS "Host can view messages for own properties" ON guest_messages;
CREATE POLICY "Host can view messages for own properties" ON guest_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = guest_messages.property_id
    AND p.developer_id = auth.uid()
  )
);

-- Host can update read status.
DROP POLICY IF EXISTS "Host can update own property messages" ON guest_messages;
CREATE POLICY "Host can update own property messages" ON guest_messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM properties p
    WHERE p.id = guest_messages.property_id
    AND p.developer_id = auth.uid()
  )
);
