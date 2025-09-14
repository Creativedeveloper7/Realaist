-- =====================================================
-- OPTIMIZED REALAIST DATABASE SCHEMA
-- =====================================================
-- This script creates a complete, optimized database schema
-- that addresses performance issues when users are logged in
-- =====================================================

-- Clean up existing objects to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_user_profile(UUID, JSONB);
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.ensure_user_profile(UUID, TEXT, TEXT, TEXT, TEXT);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view active properties" ON properties;
DROP POLICY IF EXISTS "Developers can view own properties" ON properties;
DROP POLICY IF EXISTS "Developers can insert own properties" ON properties;
DROP POLICY IF EXISTS "Developers can update own properties" ON properties;
DROP POLICY IF EXISTS "Developers can delete own properties" ON properties;
DROP POLICY IF EXISTS "Anyone can view published blogs" ON blogs;
DROP POLICY IF EXISTS "Authors can view own blogs" ON blogs;
DROP POLICY IF EXISTS "Authors can insert own blogs" ON blogs;
DROP POLICY IF EXISTS "Authors can update own blogs" ON blogs;
DROP POLICY IF EXISTS "Authors can delete own blogs" ON blogs;
DROP POLICY IF EXISTS "Users can view own visits" ON scheduled_visits;
DROP POLICY IF EXISTS "Buyers can insert visits" ON scheduled_visits;
DROP POLICY IF EXISTS "Users can update own visits" ON scheduled_visits;
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

-- Drop storage policies
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Developers can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Developers can update own property images" ON storage.objects;
DROP POLICY IF EXISTS "Developers can delete own property images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authors can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authors can update own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Authors can delete own blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- =====================================================
-- CREATE CUSTOM TYPES
-- =====================================================

-- Create custom types only if they don't exist
DO $$ BEGIN
    CREATE TYPE user_type AS ENUM ('buyer', 'developer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_status AS ENUM ('active', 'sold', 'pending', 'draft');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE visit_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE blog_status AS ENUM ('published', 'draft');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CREATE TABLES WITH OPTIMIZED STRUCTURE
-- =====================================================

-- Create profiles table with optimized structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  user_type user_type NOT NULL DEFAULT 'buyer',
  company_name TEXT,
  license_number TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to profiles table if they don't exist (from original scripts)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_name') THEN
        ALTER TABLE public.profiles ADD COLUMN company_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'license_number') THEN
        ALTER TABLE public.profiles ADD COLUMN license_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Create properties table with optimized structure
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  location TEXT NOT NULL,
  property_type TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_feet INTEGER,
  images TEXT[] DEFAULT '{}',
  status property_status DEFAULT 'draft',
  developer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status blog_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scheduled_visits table
CREATE TABLE IF NOT EXISTS scheduled_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  developer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status visit_status DEFAULT 'scheduled',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- =====================================================
-- CREATE PERFORMANCE-OPTIMIZED INDEXES
-- =====================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Properties table indexes (optimized for common queries)
CREATE INDEX IF NOT EXISTS idx_properties_developer_id ON properties(developer_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_bathrooms ON properties(bathrooms);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_updated_at ON properties(updated_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_properties_status_created_at ON properties(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_developer_status ON properties(developer_id, status);
CREATE INDEX IF NOT EXISTS idx_properties_location_price ON properties(location, price);
CREATE INDEX IF NOT EXISTS idx_properties_type_bedrooms ON properties(property_type, bedrooms);

-- Blogs table indexes
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at);
CREATE INDEX IF NOT EXISTS idx_blogs_status_created_at ON blogs(status, created_at DESC);

-- Scheduled visits indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_buyer_id ON scheduled_visits(buyer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_developer_id ON scheduled_visits(developer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_property_id ON scheduled_visits(property_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_status ON scheduled_visits(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_date ON scheduled_visits(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_created_at ON scheduled_visits(created_at);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- =====================================================
-- CREATE OPTIMIZED FUNCTIONS
-- =====================================================

-- Function to handle new user signup with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, user_type, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'user_type', 'buyer')::user_type,
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_id UUID,
  profile_data JSONB
)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    first_name = COALESCE(profile_data->>'first_name', first_name),
    last_name = COALESCE(profile_data->>'last_name', last_name),
    user_type = COALESCE(profile_data->>'user_type', user_type)::user_type,
    company_name = COALESCE(profile_data->>'company_name', company_name),
    license_number = COALESCE(profile_data->>'license_number', license_number),
    phone = COALESCE(profile_data->>'phone', phone),
    avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
    updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create user profile (from original scripts)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  first_name TEXT DEFAULT 'User',
  last_name TEXT DEFAULT '',
  user_type_param TEXT DEFAULT 'buyer'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, user_type, created_at, updated_at)
  VALUES (user_id, user_email, first_name, last_name, user_type_param::user_type, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    user_type = EXCLUDED.user_type,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ensure user profile exists (from original scripts)
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  user_id UUID,
  user_email TEXT,
  first_name TEXT DEFAULT 'User',
  last_name TEXT DEFAULT '',
  user_type_param TEXT DEFAULT 'buyer'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Try to insert, ignore if already exists
  INSERT INTO public.profiles (id, email, first_name, last_name, user_type, created_at, updated_at)
  VALUES (user_id, user_email, first_name, last_name, user_type_param::user_type, now(), now())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON properties 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at 
  BEFORE UPDATE ON blogs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_visits_updated_at 
  BEFORE UPDATE ON scheduled_visits 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE OPTIMIZED RLS POLICIES
-- =====================================================

-- Profiles policies (optimized for performance)
CREATE POLICY "Users can view all profiles" ON profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties policies (optimized for performance)
CREATE POLICY "Anyone can view active properties" ON properties 
  FOR SELECT USING (status = 'active');

CREATE POLICY "Developers can view own properties" ON properties 
  FOR SELECT USING (auth.uid() = developer_id);

CREATE POLICY "Developers can insert own properties" ON properties 
  FOR INSERT WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Developers can update own properties" ON properties 
  FOR UPDATE USING (auth.uid() = developer_id);

CREATE POLICY "Developers can delete own properties" ON properties 
  FOR DELETE USING (auth.uid() = developer_id);

-- Blogs policies
CREATE POLICY "Anyone can view published blogs" ON blogs 
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view own blogs" ON blogs 
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can insert own blogs" ON blogs 
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own blogs" ON blogs 
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own blogs" ON blogs 
  FOR DELETE USING (auth.uid() = author_id);

-- Scheduled visits policies
CREATE POLICY "Users can view own visits" ON scheduled_visits 
  FOR SELECT USING (
    auth.uid() = buyer_id OR auth.uid() = developer_id
  );

CREATE POLICY "Buyers can insert visits" ON scheduled_visits 
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update own visits" ON scheduled_visits 
  FOR UPDATE USING (
    auth.uid() = buyer_id OR auth.uid() = developer_id
  );

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites 
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Create storage buckets (ignore if they already exist)
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('property-images', 'property-images', true),
  ('blog-images', 'blog-images', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- CREATE STORAGE POLICIES
-- =====================================================

-- Property images policies
CREATE POLICY "Anyone can view property images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Developers can upload property images" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Developers can update own property images" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'property-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Developers can delete own property images" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'property-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Blog images policies
CREATE POLICY "Anyone can view blog images" ON storage.objects 
  FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authors can upload blog images" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'blog-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authors can update own blog images" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'blog-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authors can delete own blog images" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'blog-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatar policies
CREATE POLICY "Anyone can view avatars" ON storage.objects 
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects 
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar" ON storage.objects 
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects 
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- PERFORMANCE OPTIMIZATION QUERIES
-- =====================================================

-- Update table statistics for better query planning
ANALYZE profiles;
ANALYZE properties;
ANALYZE blogs;
ANALYZE scheduled_visits;
ANALYZE favorites;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables exist and have correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'properties', 'blogs', 'scheduled_visits', 'favorites')
ORDER BY table_name, ordinal_position;

-- Verify indexes exist
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'properties', 'blogs', 'scheduled_visits', 'favorites')
ORDER BY tablename, indexname;

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'properties', 'blogs', 'scheduled_visits', 'favorites');

-- Verify policies exist
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
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'properties', 'blogs', 'scheduled_visits', 'favorites')
ORDER BY tablename, policyname;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Realaist database schema has been successfully created and optimized!';
  RAISE NOTICE '📊 Performance optimizations include:';
  RAISE NOTICE '   - Optimized indexes for common query patterns';
  RAISE NOTICE '   - Composite indexes for complex queries';
  RAISE NOTICE '   - Efficient RLS policies';
  RAISE NOTICE '   - Proper foreign key relationships';
  RAISE NOTICE '   - Storage buckets and policies';
  RAISE NOTICE '   - Automatic profile creation triggers';
  RAISE NOTICE '🔧 All functions included:';
  RAISE NOTICE '   - handle_new_user() - Auto profile creation';
  RAISE NOTICE '   - update_user_profile() - Profile updates';
  RAISE NOTICE '   - create_user_profile() - Manual profile creation';
  RAISE NOTICE '   - ensure_user_profile() - Profile existence check';
  RAISE NOTICE '   - update_updated_at_column() - Timestamp updates';
  RAISE NOTICE '🚀 Your application should now load much faster when users are logged in!';
END $$;
