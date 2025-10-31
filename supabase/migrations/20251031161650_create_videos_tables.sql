/*
  # Create Videos Tables

  1. New Tables
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
    - Videos: All can read active videos, admins can manage all
    - Video views: All can insert, admins can read all
    
  3. Functions
    - Trigger to update video views count
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  url text NOT NULL,
  thumbnail_url text DEFAULT '',
  duration integer DEFAULT 0,
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
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  viewed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;

-- Videos policies
DROP POLICY IF EXISTS "Active videos are viewable by everyone" ON videos;
CREATE POLICY "Active videos are viewable by everyone"
  ON videos FOR SELECT
  USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage all videos" ON videos;
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
DROP POLICY IF EXISTS "Anyone can record video views" ON video_views;
CREATE POLICY "Anyone can record video views"
  ON video_views FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all video analytics" ON video_views;
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

-- Function to update video views count
CREATE OR REPLACE FUNCTION update_video_views_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE videos 
  SET views_count = views_count + 1,
      updated_at = now()
  WHERE id = NEW.video_id;
  RETURN NEW;
END;
$$;

-- Trigger to update views count
DROP TRIGGER IF EXISTS on_video_view_created ON video_views;
CREATE TRIGGER on_video_view_created
  AFTER INSERT ON video_views
  FOR EACH ROW 
  EXECUTE FUNCTION update_video_views_count();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS videos_status_idx ON videos(status);
CREATE INDEX IF NOT EXISTS videos_is_featured_idx ON videos(is_featured);
CREATE INDEX IF NOT EXISTS videos_uploaded_by_idx ON videos(uploaded_by);
CREATE INDEX IF NOT EXISTS video_views_video_id_idx ON video_views(video_id);
CREATE INDEX IF NOT EXISTS video_views_user_id_idx ON video_views(user_id);
CREATE INDEX IF NOT EXISTS video_views_viewed_at_idx ON video_views(viewed_at);
