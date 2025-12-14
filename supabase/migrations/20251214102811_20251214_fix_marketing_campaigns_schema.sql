/*
  # Standardize marketing_campaigns schema for client-based access
  
  ## Problem
  The existing marketing_campaigns table uses user_id (from revenue attribution)
  but MarketingAnalytics page expects client_id-based structure.
  
  ## Solution
  1. Rename old table to marketing_campaigns_legacy
  2. Create new client-based marketing_campaigns table
  3. Create supporting tables: campaign_metrics, marketing_goals
  4. Add proper indexes and RLS policies
  
  ## New Schema
  - marketing_campaigns: id, client_id, name, description, start_date, end_date, budget, spend, status, channel
  - campaign_metrics: id, campaign_id, date, channel, impressions, clicks, conversions, spend, revenue
  - marketing_goals: id, client_id, campaign_id, goal_name, target_value, current_value, status
*/

-- Step 1: Rename old table
ALTER TABLE IF EXISTS marketing_campaigns RENAME TO marketing_campaigns_legacy;

-- Step 2: Create new client-based marketing_campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  budget numeric DEFAULT 0,
  spend numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  channel text CHECK (channel IN ('organic_search', 'paid_search', 'social_organic', 'paid_social', 'email', 'direct', 'referral', 'content', 'events', 'partner', 'affiliate', 'display', 'video')),
  objective text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS marketing_campaigns_client_id_idx ON marketing_campaigns(client_id);
CREATE INDEX IF NOT EXISTS marketing_campaigns_status_idx ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS marketing_campaigns_start_date_idx ON marketing_campaigns(start_date);

CREATE POLICY "Users can view their client's campaigns"
  ON marketing_campaigns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = marketing_campaigns.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create campaigns for their clients"
  ON marketing_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their client's campaigns"
  ON marketing_campaigns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = marketing_campaigns.client_id
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their client's campaigns"
  ON marketing_campaigns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = marketing_campaigns.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- Step 3: Create campaign_metrics table
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  channel text,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  spend numeric DEFAULT 0,
  revenue numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS campaign_metrics_campaign_id_idx ON campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_metrics_date_idx ON campaign_metrics(metric_date);
CREATE INDEX IF NOT EXISTS campaign_metrics_campaign_date_idx ON campaign_metrics(campaign_id, metric_date);

CREATE POLICY "Users can view metrics for their campaign"
  ON campaign_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = campaign_metrics.campaign_id
      AND EXISTS (
        SELECT 1 FROM clients
        WHERE clients.id = marketing_campaigns.client_id
        AND clients.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert metrics for their campaign"
  ON campaign_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      WHERE marketing_campaigns.id = campaign_id
      AND EXISTS (
        SELECT 1 FROM clients
        WHERE clients.id = marketing_campaigns.client_id
        AND clients.user_id = auth.uid()
      )
    )
  );

-- Step 4: Create marketing_goals table
CREATE TABLE IF NOT EXISTS marketing_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  goal_name text NOT NULL,
  target_value numeric NOT NULL,
  current_value numeric DEFAULT 0,
  unit text,
  target_date date,
  status text DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'achieved', 'at_risk', 'missed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE marketing_goals ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS marketing_goals_client_id_idx ON marketing_goals(client_id);
CREATE INDEX IF NOT EXISTS marketing_goals_campaign_id_idx ON marketing_goals(campaign_id);

CREATE POLICY "Users can view their client's goals"
  ON marketing_goals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = marketing_goals.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create goals for their clients"
  ON marketing_goals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = client_id
      AND clients.user_id = auth.uid()
    )
  );
