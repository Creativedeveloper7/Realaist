-- Enable Row Level Security
-- Note: JWT secret is automatically managed by Supabase

-- Create custom types
CREATE TYPE user_type AS ENUM ('buyer', 'developer');
CREATE TYPE property_status AS ENUM ('active', 'sold', 'pending', 'draft');
CREATE TYPE visit_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled');
CREATE TYPE blog_status AS ENUM ('published', 'draft');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
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

-- Create properties table
CREATE TABLE properties (
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
CREATE TABLE blogs (
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
CREATE TABLE scheduled_visits (
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
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Create indexes for better performance
CREATE INDEX idx_properties_developer_id ON properties(developer_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_scheduled_visits_buyer_id ON scheduled_visits(buyer_id);
CREATE INDEX idx_scheduled_visits_developer_id ON scheduled_visits(developer_id);
CREATE INDEX idx_scheduled_visits_property_id ON scheduled_visits(property_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_property_id ON favorites(property_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties policies
CREATE POLICY "Anyone can view active properties" ON properties FOR SELECT USING (status = 'active');
CREATE POLICY "Developers can view own properties" ON properties FOR SELECT USING (auth.uid() = developer_id);
CREATE POLICY "Developers can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = developer_id);
CREATE POLICY "Developers can update own properties" ON properties FOR UPDATE USING (auth.uid() = developer_id);
CREATE POLICY "Developers can delete own properties" ON properties FOR DELETE USING (auth.uid() = developer_id);

-- Blogs policies
CREATE POLICY "Anyone can view published blogs" ON blogs FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can view own blogs" ON blogs FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Authors can insert own blogs" ON blogs FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own blogs" ON blogs FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own blogs" ON blogs FOR DELETE USING (auth.uid() = author_id);

-- Scheduled visits policies
CREATE POLICY "Users can view own visits" ON scheduled_visits FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = developer_id
);
CREATE POLICY "Buyers can insert visits" ON scheduled_visits FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update own visits" ON scheduled_visits FOR UPDATE USING (
  auth.uid() = buyer_id OR auth.uid() = developer_id
);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_visits_updated_at BEFORE UPDATE ON scheduled_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer')::user_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Anyone can view property images" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "Developers can upload property images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Developers can update own property images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'property-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Developers can delete own property images" ON storage.objects FOR DELETE USING (
  bucket_id = 'property-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Authors can upload blog images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'blog-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Authors can update own blog images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'blog-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Authors can delete own blog images" ON storage.objects FOR DELETE USING (
  bucket_id = 'blog-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
