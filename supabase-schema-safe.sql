-- Safe database schema that handles existing types and tables
-- This script can be run multiple times without errors

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

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  user_type user_type NOT NULL,
  company_name TEXT,
  license_number TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table if it doesn't exist
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

-- Create blogs table if it doesn't exist
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

-- Create scheduled_visits table if it doesn't exist
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

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_properties_developer_id ON properties(developer_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_buyer_id ON scheduled_visits(buyer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_developer_id ON scheduled_visits(developer_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_property_id ON scheduled_visits(property_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
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

-- Create RLS policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view active properties" ON properties FOR SELECT USING (status = 'active');
CREATE POLICY "Developers can view own properties" ON properties FOR SELECT USING (auth.uid() = developer_id);
CREATE POLICY "Developers can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = developer_id);
CREATE POLICY "Developers can update own properties" ON properties FOR UPDATE USING (auth.uid() = developer_id);
CREATE POLICY "Developers can delete own properties" ON properties FOR DELETE USING (auth.uid() = developer_id);

CREATE POLICY "Anyone can view published blogs" ON blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view own blogs" ON blogs FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authors can insert own blogs" ON blogs FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own blogs" ON blogs FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own blogs" ON blogs FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can view own visits" ON scheduled_visits FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = developer_id
);
CREATE POLICY "Buyers can insert visits" ON scheduled_visits FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update own visits" ON scheduled_visits FOR UPDATE USING (
  auth.uid() = buyer_id OR auth.uid() = developer_id
);

CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);
