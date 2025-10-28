/*
  # OAuth States and Marketing Channel Metrics Tables

  ## Overview
  Adds required tables for OAuth integrations and detailed marketing channel metrics tracking.

  ## New Tables

  ### 1. `oauth_states` - Temporary OAuth state storage
  - Stores OAuth state parameters during authentication flow
  - Prevents CSRF attacks with time-limited state tokens
  - Auto-cleanup of expired states

  ### 2. `marketing_channel_metrics` - Granular channel performance data
  - Daily metrics by channel, source, and campaign
  - Supports multi-platform attribution
  - Real-time data sync from ad platforms

  ## Security
  - RLS enabled on all tables
  - User-scoped data access
  - Automatic expiration of OAuth states

  ## Performance
  - Indexes on foreign keys and date fields
  - Composite indexes for common queries
*/

-- =====================================================
-- 1. OAUTH STATES - Temporary state storage
-- =====================================================

CREATE TABLE IF NOT EXISTS oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,

  -- State data
  state text UNIQUE NOT NULL,
  provider text NOT NULL CHECK (provider IN (
    'google_ads', 'meta_ads', 'linkedin_ads', 'google_analytics',
    'hubspot', 'salesforce', 'stripe', 'plaid'
  )),

  -- Expiration
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oauth_states_user ON oauth_states(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

-- Auto-delete expired states
CREATE OR REPLACE FUNCTION delete_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_states
  WHERE expires_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. MARKETING CHANNEL METRICS - Granular metrics
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_channel_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  integration_id uuid REFERENCES integrations(id) ON DELETE SET NULL,

  -- Time dimension
  metric_date date NOT NULL,
  hour_of_day integer CHECK (hour_of_day >= 0 AND hour_of_day <= 23),

  -- Channel hierarchy
  channel text NOT NULL CHECK (channel IN (
    'organic_search', 'paid_search', 'social_organic', 'paid_social',
    'email', 'direct', 'referral', 'content', 'events', 'partner',
    'affiliate', 'display', 'video'
  )),
  source text,
  medium text,
  campaign_name text,
  campaign_id text,

  -- Platform details
  platform text,
  ad_group_name text,
  keyword text,
  placement text,

  -- Performance metrics
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  spend decimal(12,2) DEFAULT 0,
  conversions integer DEFAULT 0,
  conversion_value decimal(12,2) DEFAULT 0,
  revenue decimal(12,2) DEFAULT 0,

  -- Calculated metrics
  ctr decimal(5,4),
  cpc decimal(10,2),
  cpm decimal(10,2),
  cpa decimal(10,2),
  roas decimal(10,2),

  -- Engagement metrics
  video_views integer DEFAULT 0,
  video_completions integer DEFAULT 0,
  engagement_rate decimal(5,4),
  bounce_rate decimal(5,4),

  -- Attribution data
  assisted_conversions integer DEFAULT 0,
  first_touch_conversions integer DEFAULT 0,
  last_touch_conversions integer DEFAULT 0,

  -- Metadata
  device_type text,
  geo_country text,
  geo_region text,
  audience_segment text,
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id, metric_date, channel, source, campaign_name, platform, hour_of_day)
);

CREATE INDEX IF NOT EXISTS idx_marketing_metrics_user ON marketing_channel_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_client ON marketing_channel_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_date ON marketing_channel_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_channel ON marketing_channel_metrics(channel);
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_campaign ON marketing_channel_metrics(campaign_name);
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_source ON marketing_channel_metrics(source);
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_integration ON marketing_channel_metrics(integration_id);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_marketing_metrics_composite ON marketing_channel_metrics(
  user_id, metric_date, channel
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE oauth_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_channel_metrics ENABLE ROW LEVEL SECURITY;

-- OAuth states policies
CREATE POLICY "Users can manage own oauth states"
  ON oauth_states FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Marketing metrics policies
CREATE POLICY "Users can view own marketing metrics"
  ON marketing_channel_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marketing metrics"
  ON marketing_channel_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marketing metrics"
  ON marketing_channel_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own marketing metrics"
  ON marketing_channel_metrics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Calculate derived metrics on insert/update
CREATE OR REPLACE FUNCTION calculate_marketing_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.impressions > 0 THEN
    NEW.ctr = (NEW.clicks::decimal / NEW.impressions::decimal);
    NEW.cpm = (NEW.spend / NEW.impressions::decimal) * 1000;
  END IF;

  IF NEW.clicks > 0 THEN
    NEW.cpc = NEW.spend / NEW.clicks::decimal;
  END IF;

  IF NEW.conversions > 0 THEN
    NEW.cpa = NEW.spend / NEW.conversions::decimal;
  END IF;

  IF NEW.spend > 0 THEN
    NEW.roas = (NEW.revenue / NEW.spend);
  END IF;

  NEW.updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_marketing_metrics_trigger
  BEFORE INSERT OR UPDATE ON marketing_channel_metrics
  FOR EACH ROW
  EXECUTE FUNCTION calculate_marketing_metrics();
