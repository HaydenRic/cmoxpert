/*
  # Revenue Attribution & Pipeline Intelligence System

  ## Overview
  This migration adds comprehensive revenue attribution capabilities to track
  marketing's influence on pipeline and closed revenue. It enables multi-touch
  attribution modeling and pipeline velocity analysis.

  ## New Tables

  ### 1. `deals` - Sales opportunities and pipeline
  - Tracks all deals/opportunities with stages and revenue
  - Links to clients for marketing attribution
  - Includes win/loss reasons and close dates

  ### 2. `deal_touchpoints` - Marketing touchpoints that influenced deals
  - Records every marketing interaction (campaigns, content, events)
  - Timestamp tracking for attribution modeling
  - Channel and source tracking

  ### 3. `attribution_settings` - User-defined attribution models
  - Configure attribution model preferences (first-touch, last-touch, etc.)
  - Custom weighting for different touchpoint types
  - Time decay settings

  ### 4. `deal_stage_history` - Pipeline velocity tracking
  - Tracks movement through sales stages
  - Calculates time in each stage
  - Identifies bottlenecks

  ### 5. `marketing_campaigns` - Campaign tracking
  - Central repository for all marketing campaigns
  - Budget, spend, and ROI tracking
  - Cross-channel campaign management

  ### 6. `campaign_touchpoints` - Link campaigns to deal touchpoints
  - Many-to-many relationship
  - Attribution credit allocation

  ### 7. `revenue_forecasts` - Pipeline-based revenue predictions
  - AI-powered revenue forecasting
  - Confidence intervals
  - Marketing influence projections

  ## Security
  - RLS enabled on all tables
  - User-scoped data access only
  - Audit trails for financial data

  ## Performance
  - Indexes on foreign keys and date ranges
  - Materialized views for attribution calculations (added separately)
*/

-- =====================================================
-- 1. DEALS / OPPORTUNITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,

  -- Deal identification
  deal_name text NOT NULL,
  deal_owner text,
  external_id text, -- Salesforce/HubSpot deal ID

  -- Deal details
  stage text NOT NULL CHECK (stage IN (
    'lead', 'qualified', 'demo', 'proposal', 'negotiation',
    'closed_won', 'closed_lost'
  )),
  probability integer DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  amount decimal(12,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',

  -- Dates
  created_date date NOT NULL DEFAULT CURRENT_DATE,
  close_date date,
  closed_date date,
  first_contact_date date,

  -- Win/Loss tracking
  win_reason text,
  loss_reason text,
  competitor_lost_to text,

  -- Source attribution
  lead_source text, -- First touch source
  lead_source_detail text,

  -- Metadata
  industry text,
  company_size text,
  annual_contract_value decimal(12,2),
  contract_length_months integer,

  -- Marketing influence
  marketing_influenced boolean DEFAULT false,
  marketing_sourced boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_client_id ON deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_close_date ON deals(close_date);
CREATE INDEX IF NOT EXISTS idx_deals_created_date ON deals(created_date);

-- =====================================================
-- 2. DEAL TOUCHPOINTS
-- =====================================================

CREATE TABLE IF NOT EXISTS deal_touchpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE NOT NULL,

  -- Touchpoint details
  touchpoint_date timestamptz NOT NULL DEFAULT now(),
  touchpoint_type text NOT NULL CHECK (touchpoint_type IN (
    'website_visit', 'content_download', 'email_click', 'email_open',
    'webinar_attended', 'demo_requested', 'trial_started',
    'ad_click', 'social_engagement', 'event_attended',
    'sales_call', 'proposal_viewed', 'case_study_viewed'
  )),

  -- Channel attribution
  channel text NOT NULL CHECK (channel IN (
    'organic_search', 'paid_search', 'social_organic', 'social_paid',
    'email', 'direct', 'referral', 'content', 'events', 'partner'
  )),

  -- Source details
  source text, -- google, linkedin, facebook, etc.
  medium text, -- cpc, organic, email, social
  campaign_name text,
  content_title text,

  -- Attribution metrics
  attribution_credit decimal(5,4) DEFAULT 0, -- 0 to 1, calculated by model
  revenue_credit decimal(12,2) DEFAULT 0, -- Attributed revenue

  -- Metadata
  page_url text,
  utm_params jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_touchpoints_deal_id ON deal_touchpoints(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_touchpoints_date ON deal_touchpoints(touchpoint_date);
CREATE INDEX IF NOT EXISTS idx_deal_touchpoints_type ON deal_touchpoints(touchpoint_type);
CREATE INDEX IF NOT EXISTS idx_deal_touchpoints_channel ON deal_touchpoints(channel);

-- =====================================================
-- 3. ATTRIBUTION SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS attribution_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Model configuration
  model_type text NOT NULL CHECK (model_type IN (
    'first_touch', 'last_touch', 'linear', 'time_decay',
    'u_shaped', 'w_shaped', 'custom'
  )),
  is_default boolean DEFAULT false,

  -- Time decay settings
  decay_rate decimal(3,2) DEFAULT 0.5, -- For time decay model
  decay_unit text DEFAULT 'days' CHECK (decay_unit IN ('hours', 'days', 'weeks')),

  -- Position-based weights (for U-shaped, W-shaped)
  first_touch_weight decimal(3,2) DEFAULT 0.40,
  last_touch_weight decimal(3,2) DEFAULT 0.40,
  middle_touches_weight decimal(3,2) DEFAULT 0.20,

  -- Custom weights by touchpoint type
  custom_weights jsonb DEFAULT '{}'::jsonb,

  -- Lookback window
  lookback_days integer DEFAULT 90,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id, model_type)
);

CREATE INDEX IF NOT EXISTS idx_attribution_settings_user_id ON attribution_settings(user_id);

-- =====================================================
-- 4. DEAL STAGE HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS deal_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE NOT NULL,

  -- Stage transition
  from_stage text,
  to_stage text NOT NULL,

  -- Timing
  entered_at timestamptz NOT NULL DEFAULT now(),
  exited_at timestamptz,
  days_in_stage integer,

  -- Context
  changed_by text,
  change_reason text,
  probability_at_entry integer,
  amount_at_entry decimal(12,2),

  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal_id ON deal_stage_history(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_stage ON deal_stage_history(to_stage);
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_entered ON deal_stage_history(entered_at);

-- =====================================================
-- 5. MARKETING CAMPAIGNS
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Campaign identification
  campaign_name text NOT NULL,
  campaign_type text CHECK (campaign_type IN (
    'paid_search', 'paid_social', 'display', 'content',
    'email', 'event', 'webinar', 'partner', 'organic'
  )),

  -- Campaign details
  description text,
  channel text,
  objective text CHECK (objective IN (
    'awareness', 'consideration', 'conversion', 'retention'
  )),

  -- Budget and spend
  budget_allocated decimal(12,2) DEFAULT 0,
  actual_spend decimal(12,2) DEFAULT 0,

  -- Dates
  start_date date NOT NULL,
  end_date date,

  -- Performance metrics
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  leads integer DEFAULT 0,
  mql_count integer DEFAULT 0,
  sql_count integer DEFAULT 0,
  opportunities integer DEFAULT 0,
  closed_won integer DEFAULT 0,
  revenue_generated decimal(12,2) DEFAULT 0,

  -- Status
  status text DEFAULT 'active' CHECK (status IN (
    'draft', 'active', 'paused', 'completed', 'cancelled'
  )),

  -- Metadata
  target_audience text,
  utm_campaign text,
  external_id text, -- Platform campaign ID
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user_id ON marketing_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON marketing_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);

-- =====================================================
-- 6. CAMPAIGN TOUCHPOINTS
-- =====================================================

CREATE TABLE IF NOT EXISTS campaign_touchpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES marketing_campaigns(id) ON DELETE CASCADE NOT NULL,
  touchpoint_id uuid REFERENCES deal_touchpoints(id) ON DELETE CASCADE NOT NULL,

  -- Attribution
  attribution_credit decimal(5,4) DEFAULT 0,

  created_at timestamptz DEFAULT now(),

  UNIQUE(campaign_id, touchpoint_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_touchpoints_campaign ON campaign_touchpoints(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_touchpoints_touchpoint ON campaign_touchpoints(touchpoint_id);

-- =====================================================
-- 7. REVENUE FORECASTS
-- =====================================================

CREATE TABLE IF NOT EXISTS revenue_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Forecast details
  forecast_name text NOT NULL,
  forecast_period text NOT NULL CHECK (forecast_period IN (
    'month', 'quarter', 'year'
  )),
  period_start date NOT NULL,
  period_end date NOT NULL,

  -- Forecast values
  forecasted_revenue decimal(12,2) NOT NULL,
  confidence_level decimal(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),

  -- Range estimates
  pessimistic_forecast decimal(12,2),
  optimistic_forecast decimal(12,2),

  -- Breakdown by source
  marketing_influenced_forecast decimal(12,2),
  marketing_sourced_forecast decimal(12,2),
  organic_forecast decimal(12,2),

  -- Model info
  model_type text DEFAULT 'ml' CHECK (model_type IN (
    'linear_regression', 'time_series', 'ml', 'manual'
  )),
  model_accuracy decimal(5,2), -- Historical accuracy percentage

  -- Metadata
  assumptions text,
  methodology text,
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_user_id ON revenue_forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_period ON revenue_forecasts(period_start, period_end);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_forecasts ENABLE ROW LEVEL SECURITY;

-- Deals policies
CREATE POLICY "Users can view own deals"
  ON deals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deals"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals"
  ON deals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals"
  ON deals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Deal touchpoints policies
CREATE POLICY "Users can view own deal touchpoints"
  ON deal_touchpoints FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_touchpoints.deal_id
      AND deals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own deal touchpoints"
  ON deal_touchpoints FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_touchpoints.deal_id
      AND deals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own deal touchpoints"
  ON deal_touchpoints FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_touchpoints.deal_id
      AND deals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own deal touchpoints"
  ON deal_touchpoints FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_touchpoints.deal_id
      AND deals.user_id = auth.uid()
    )
  );

-- Attribution settings policies
CREATE POLICY "Users can view own attribution settings"
  ON attribution_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attribution settings"
  ON attribution_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attribution settings"
  ON attribution_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own attribution settings"
  ON attribution_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Deal stage history policies
CREATE POLICY "Users can view own deal stage history"
  ON deal_stage_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_stage_history.deal_id
      AND deals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own deal stage history"
  ON deal_stage_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_stage_history.deal_id
      AND deals.user_id = auth.uid()
    )
  );

-- Marketing campaigns policies
CREATE POLICY "Users can view own marketing campaigns"
  ON marketing_campaigns FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own marketing campaigns"
  ON marketing_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own marketing campaigns"
  ON marketing_campaigns FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own marketing campaigns"
  ON marketing_campaigns FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Campaign touchpoints policies
CREATE POLICY "Users can view own campaign touchpoints"
  ON campaign_touchpoints FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = campaign_touchpoints.campaign_id
      AND marketing_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own campaign touchpoints"
  ON campaign_touchpoints FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = campaign_touchpoints.campaign_id
      AND marketing_campaigns.user_id = auth.uid()
    )
  );

-- Revenue forecasts policies
CREATE POLICY "Users can view own revenue forecasts"
  ON revenue_forecasts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own revenue forecasts"
  ON revenue_forecasts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own revenue forecasts"
  ON revenue_forecasts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own revenue forecasts"
  ON revenue_forecasts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update deal stage history
CREATE OR REPLACE FUNCTION track_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Close out the previous stage
  UPDATE deal_stage_history
  SET exited_at = now(),
      days_in_stage = EXTRACT(DAY FROM now() - entered_at)
  WHERE deal_id = NEW.id
    AND exited_at IS NULL;

  -- Insert new stage entry
  INSERT INTO deal_stage_history (
    deal_id,
    from_stage,
    to_stage,
    probability_at_entry,
    amount_at_entry
  ) VALUES (
    NEW.id,
    OLD.stage,
    NEW.stage,
    NEW.probability,
    NEW.amount
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for deal stage changes
DROP TRIGGER IF EXISTS deal_stage_change_trigger ON deals;
CREATE TRIGGER deal_stage_change_trigger
  AFTER UPDATE OF stage ON deals
  FOR EACH ROW
  WHEN (OLD.stage IS DISTINCT FROM NEW.stage)
  EXECUTE FUNCTION track_deal_stage_change();

-- Function to auto-update marketing campaign metrics
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update campaign metrics when deals are created/updated
  IF NEW.stage = 'closed_won' THEN
    UPDATE marketing_campaigns mc
    SET
      closed_won = closed_won + 1,
      revenue_generated = revenue_generated + NEW.amount,
      updated_at = now()
    FROM campaign_touchpoints ct
    JOIN deal_touchpoints dt ON ct.touchpoint_id = dt.id
    WHERE dt.deal_id = NEW.id
      AND mc.id = ct.campaign_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for campaign metric updates
DROP TRIGGER IF EXISTS campaign_metrics_trigger ON deals;
CREATE TRIGGER campaign_metrics_trigger
  AFTER UPDATE OF stage ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_metrics();
