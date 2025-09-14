-- Quick database test queries
-- Run these in Supabase SQL Editor to verify everything is working

-- Test 1: Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'properties', 'blogs', 'scheduled_visits', 'favorites');

-- Test 2: Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'update_user_profile', 'create_user_profile');

-- Test 3: Check if triggers exist
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Test 4: Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'properties');

-- Test 5: Check if policies exist
SELECT policyname FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Test 6: Try to select from profiles (should work)
SELECT COUNT(*) as profile_count FROM profiles;

-- Test 7: Check if indexes exist
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'profiles';
