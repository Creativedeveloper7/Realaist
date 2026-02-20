-- Add 'host' to user_type enum (required for host signup).
-- Run this once in Supabase Dashboard → SQL Editor.
-- If you see "already exists", the value is already there and you can ignore it.
ALTER TYPE user_type ADD VALUE 'host';
