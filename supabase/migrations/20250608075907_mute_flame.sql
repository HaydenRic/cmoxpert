/*
  # Add Video Management and User Profiles

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `role` (text, default 'user')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `videos`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `url` (text) - Supabase Storage URL
      - `thumbnail_url` (text, optional)
      - `duration` (integer, optional)
      - `views_count` (integer, default 0)
      - `is_featured` (boolean, default false)
      - `status` (text, default 'active')
      - `uploaded_by` (uuid, references profiles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `video_views`
      - `id` (uuid, primary key)
      - `video_id` (uuid, references videos)
      - `user_id` (uuid, references profiles, nullable for anonymous)
      - `ip_address` (text, optional)
      - `user_agent` (text, optional)
      - `viewed_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Profiles: Users can read all, update own
    - Videos: All can read active videos, admins can manage all
    - Video views: All can insert, admins can read all
    
  3. Functions
    - Auto-create profile on user signup
    - Trigger to update video views count
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  thumbnail_url text,
  duration integer, -- in seconds
  views_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'processing')),
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create video views table for analytics
CREATE TABLE IF NOT EXISTS video_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  viewed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Videos policies
CREATE POLICY "Active videos are viewable by everyone"
  ON videos FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage all videos"
  ON videos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Video views policies
CREATE POLICY "Anyone can record video views"
  ON video_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all video analytics"
  ON video_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Function to update video views count
CREATE OR REPLACE FUNCTION update_video_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE videos 
  SET views_count = views_count + 1,
      updated_at = now()
  WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update views count
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_video_view_created'
  ) THEN
    CREATE TRIGGER on_video_view_created
      AFTER INSERT ON video_views
      FOR EACH ROW EXECUTE FUNCTION update_video_views_count();
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS videos_status_idx ON videos(status);
CREATE INDEX IF NOT EXISTS videos_is_featured_idx ON videos(is_featured);
CREATE INDEX IF NOT EXISTS videos_uploaded_by_idx ON videos(uploaded_by);
CREATE INDEX IF NOT EXISTS video_views_video_id_idx ON video_views(video_id);
CREATE INDEX IF NOT EXISTS video_views_user_id_idx ON video_views(user_id);
CREATE INDEX IF NOT EXISTS video_views_viewed_at_idx ON video_views(viewed_at);

-- Insert a sample admin user (you'll need to update this with your actual user ID)
-- You can get your user ID from the auth.users table after signing up
-- INSERT INTO profiles (id, email, role) 
-- VALUES ('your-user-id-here', 'admin@cmoxpert.com', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';