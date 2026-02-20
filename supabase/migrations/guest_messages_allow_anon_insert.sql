-- Fix RLS so anyone (including anonymous) can insert into guest_messages.
-- Run this in Supabase Dashboard → SQL Editor if you get 401 / RLS violation on send.

-- Ensure anon and authenticated can insert (table-level grant).
GRANT INSERT ON guest_messages TO anon;
GRANT INSERT ON guest_messages TO authenticated;

-- Replace insert policy so it applies to all roles (including anon).
DROP POLICY IF EXISTS "Allow insert guest messages" ON guest_messages;
CREATE POLICY "Allow insert guest messages"
  ON guest_messages
  FOR INSERT
  TO public
  WITH CHECK (true);
