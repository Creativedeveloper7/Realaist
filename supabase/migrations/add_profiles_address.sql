-- Add address column to profiles (for host signup).
-- Run this in Supabase Dashboard → SQL Editor if your DB was created before this column existed.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
