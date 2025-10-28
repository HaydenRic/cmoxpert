/*
  # Competitive Intelligence System

  ## Overview
  Automated competitor tracking and alerting system with web scraping capabilities.

  ## New Tables

  ### 1. `competitors` - Tracked competitor companies
  - Company identification and monitoring settings
  - Funding and hiring data tracking
  - Last check timestamps

  ### 2. `competitor_alerts` - Real-time competitive alerts
  - Funding rounds, pricing changes, product launches
  - Hiring surges and market movements
  - Severity levels and read status

  ## Security
  - RLS enabled on all tables
  - User-scoped data access

  ## Performance
  - Indexes on foreign keys and timestamps
  - Efficient alert queries
*/

-- =====================================================
-- 1. COMPETITORS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Company identification
  name text NOT NULL,
  domain text NOT NULL,
  industry text,
  description text,

  -- Monitoring settings
  monitoring_enabled boolean DEFAULT true,
  check_frequency text DEFAULT 'daily' CHECK (check_frequency IN ('hourly', 'daily', 'weekly')),

  -- Tracked metrics
  last_funding_round text,
  last_funding_amount decimal(15,2),
  last_funding_date date,
  last_job_count integer DEFAULT 0,
  employee_count integer,
  estimated_revenue decimal(15,2),

  -- Product tracking
  product_count integer DEFAULT 0,
  latest_product_launch text,
  latest_product_date date,

  -- Pricing tracking
  pricing_model text,
  starting_price decimal(12,2),
  pricing_last_changed date,

  -- SEO metrics
  estimated_monthly_traffic integer,
  top_keywords text[],
  domain_authority integer,

  -- Timestamps
  last_check_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitors_user ON competitors(user_id);
CREATE INDEX IF NOT EXISTS idx_competitors_domain ON competitors(domain);
CREATE INDEX IF NOT EXISTS idx_competitors_monitoring ON competitors(monitoring_enabled);
CREATE INDEX IF NOT EXISTS idx_competitors_last_check ON competitors(last_check_at);

-- =====================================================
-- 2. COMPETITOR ALERTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS competitor_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid REFERENCES competitors(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Alert details
  alert_type text NOT NULL CHECK (alert_type IN (
    'funding', 'pricing_change', 'product_launch', 'hiring_surge',
    'market_move', 'partnership', 'acquisition', 'executive_change',
    'traffic_spike', 'keyword_ranking'
  )),

  title text NOT NULL,
  description text,
  details jsonb DEFAULT '{}'::jsonb,

  -- Severity and status
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,

  -- Actions
  action_taken text,
  action_notes text,

  -- Metadata
  source_url text,
  screenshot_url text,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_competitor ON competitor_alerts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON competitor_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON competitor_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON competitor_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON competitor_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON competitor_alerts(created_at);

-- Composite index for unread alerts query
CREATE INDEX IF NOT EXISTS idx_alerts_unread_user ON competitor_alerts(user_id, is_read, created_at DESC);

-- =====================================================
-- 3. COMPETITOR METRICS HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS competitor_metrics_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid REFERENCES competitors(id) ON DELETE CASCADE NOT NULL,

  -- Metric snapshot
  metric_date date NOT NULL,
  funding_amount decimal(15,2),
  job_count integer,
  employee_count integer,
  estimated_revenue decimal(15,2),
  monthly_traffic integer,
  domain_authority integer,

  -- Pricing snapshot
  starting_price decimal(12,2),
  pricing_tiers jsonb DEFAULT '[]'::jsonb,

  created_at timestamptz DEFAULT now(),

  UNIQUE(competitor_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_metrics_history_competitor ON competitor_metrics_history(competitor_id);
CREATE INDEX IF NOT EXISTS idx_metrics_history_date ON competitor_metrics_history(metric_date);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_metrics_history ENABLE ROW LEVEL SECURITY;

-- Competitors policies
CREATE POLICY "Users can manage own competitors"
  ON competitors FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view own competitor alerts"
  ON competitor_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own competitor alerts"
  ON competitor_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Metrics history policies
CREATE POLICY "Users can view metrics for own competitors"
  ON competitor_metrics_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM competitors
      WHERE competitors.id = competitor_metrics_history.competitor_id
      AND competitors.user_id = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get unread alert count
CREATE OR REPLACE FUNCTION get_unread_alert_count(p_user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM competitor_alerts
    WHERE user_id = p_user_id
    AND is_read = false
    AND is_archived = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive old alerts
CREATE OR REPLACE FUNCTION archive_old_alerts()
RETURNS void AS $$
BEGIN
  UPDATE competitor_alerts
  SET is_archived = true
  WHERE created_at < now() - interval '90 days'
  AND is_archived = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to snapshot competitor metrics
CREATE OR REPLACE FUNCTION snapshot_competitor_metrics()
RETURNS void AS $$
BEGIN
  INSERT INTO competitor_metrics_history (
    competitor_id,
    metric_date,
    funding_amount,
    job_count,
    employee_count,
    estimated_revenue,
    monthly_traffic,
    domain_authority,
    starting_price
  )
  SELECT
    id,
    CURRENT_DATE,
    last_funding_amount,
    last_job_count,
    employee_count,
    estimated_revenue,
    estimated_monthly_traffic,
    domain_authority,
    starting_price
  FROM competitors
  WHERE monitoring_enabled = true
  ON CONFLICT (competitor_id, metric_date) DO UPDATE
  SET
    funding_amount = EXCLUDED.funding_amount,
    job_count = EXCLUDED.job_count,
    employee_count = EXCLUDED.employee_count,
    estimated_revenue = EXCLUDED.estimated_revenue,
    monthly_traffic = EXCLUDED.monthly_traffic,
    domain_authority = EXCLUDED.domain_authority,
    starting_price = EXCLUDED.starting_price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
