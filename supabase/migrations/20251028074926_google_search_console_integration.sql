/*
  # Google Search Console Integration

  1. New Tables
    - `google_oauth_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted)
      - `token_expiry` (timestamptz)
      - `scope` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `google_search_console_properties`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `client_id` (uuid, foreign key to clients, nullable)
      - `property_url` (text, unique per user)
      - `permission_level` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `google_search_console_data`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key to google_search_console_properties)
      - `date` (date)
      - `clicks` (integer)
      - `impressions` (integer)
      - `ctr` (decimal)
      - `position` (decimal)
      - `query_data` (jsonb) - top queries
      - `page_data` (jsonb) - top pages
      - `country_data` (jsonb) - geographic data
      - `device_data` (jsonb) - device breakdown
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Users can only access their own OAuth tokens
    - Users can only access their own GSC properties
    - Users can only access data for their properties

  3. Indexes
    - Index on user_id for fast lookups
    - Index on property_url for searches
    - Index on date for time-based queries
    - Composite index on property_id + date for performance
*/

-- Create google_oauth_tokens table
CREATE TABLE IF NOT EXISTS google_oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expiry timestamptz NOT NULL,
  scope text NOT NULL DEFAULT 'https://www.googleapis.com/auth/webmasters.readonly',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create google_search_console_properties table
CREATE TABLE IF NOT EXISTS google_search_console_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  property_url text NOT NULL,
  permission_level text DEFAULT 'owner',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, property_url)
);

-- Create google_search_console_data table
CREATE TABLE IF NOT EXISTS google_search_console_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES google_search_console_properties(id) ON DELETE CASCADE,
  date date NOT NULL,
  clicks integer DEFAULT 0,
  impressions integer DEFAULT 0,
  ctr decimal(5,4) DEFAULT 0,
  position decimal(5,2) DEFAULT 0,
  query_data jsonb DEFAULT '[]'::jsonb,
  page_data jsonb DEFAULT '[]'::jsonb,
  country_data jsonb DEFAULT '[]'::jsonb,
  device_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(property_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_google_oauth_tokens_user_id ON google_oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_gsc_properties_user_id ON google_search_console_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_gsc_properties_client_id ON google_search_console_properties(client_id);
CREATE INDEX IF NOT EXISTS idx_gsc_properties_url ON google_search_console_properties(property_url);
CREATE INDEX IF NOT EXISTS idx_gsc_data_property_id ON google_search_console_data(property_id);
CREATE INDEX IF NOT EXISTS idx_gsc_data_date ON google_search_console_data(date);
CREATE INDEX IF NOT EXISTS idx_gsc_data_property_date ON google_search_console_data(property_id, date);

-- Enable Row Level Security
ALTER TABLE google_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_search_console_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_search_console_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for google_oauth_tokens
CREATE POLICY "Users can view own OAuth tokens"
  ON google_oauth_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own OAuth tokens"
  ON google_oauth_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own OAuth tokens"
  ON google_oauth_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own OAuth tokens"
  ON google_oauth_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for google_search_console_properties
CREATE POLICY "Users can view own GSC properties"
  ON google_search_console_properties FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own GSC properties"
  ON google_search_console_properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GSC properties"
  ON google_search_console_properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own GSC properties"
  ON google_search_console_properties FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for google_search_console_data
CREATE POLICY "Users can view data for own properties"
  ON google_search_console_data FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM google_search_console_properties
      WHERE google_search_console_properties.id = google_search_console_data.property_id
      AND google_search_console_properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert data for own properties"
  ON google_search_console_data FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM google_search_console_properties
      WHERE google_search_console_properties.id = google_search_console_data.property_id
      AND google_search_console_properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update data for own properties"
  ON google_search_console_data FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM google_search_console_properties
      WHERE google_search_console_properties.id = google_search_console_data.property_id
      AND google_search_console_properties.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM google_search_console_properties
      WHERE google_search_console_properties.id = google_search_console_data.property_id
      AND google_search_console_properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete data for own properties"
  ON google_search_console_data FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM google_search_console_properties
      WHERE google_search_console_properties.id = google_search_console_data.property_id
      AND google_search_console_properties.user_id = auth.uid()
    )
  );