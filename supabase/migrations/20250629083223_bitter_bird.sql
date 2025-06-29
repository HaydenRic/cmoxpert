/*
  # Marketing Analytics Dashboard Schema

  1. New Tables
    - `marketing_campaigns`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `budget` (numeric)
      - `spend` (numeric)
      - `status` (text)
      - `channel` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `campaign_metrics`
      - `id` (uuid, primary key)
      - `campaign_id` (uuid, foreign key)
      - `date` (date)
      - `impressions` (integer)
      - `clicks` (integer)
      - `conversions` (integer)
      - `cost` (numeric)
      - `revenue` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `marketing_goals`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `target_value` (numeric)
      - `current_value` (numeric)
      - `unit` (text)
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create marketing_campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  budget numeric DEFAULT 0,
  spend numeric DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  channel text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create campaign_metrics table
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES marketing_campaigns(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  cost numeric DEFAULT 0,
  revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create marketing_goals table
CREATE TABLE IF NOT EXISTS marketing_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  target_value numeric NOT NULL,
  current_value numeric DEFAULT 0,
  unit text DEFAULT '',
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_goals ENABLE ROW LEVEL SECURITY;

-- Policies for marketing_campaigns
CREATE POLICY "Users can manage campaigns for own clients"
  ON marketing_campaigns FOR ALL
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
      WHERE clients.id = marketing_campaigns.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Policies for campaign_metrics
CREATE POLICY "Users can manage metrics for own campaigns"
  ON campaign_metrics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      JOIN clients ON clients.id = marketing_campaigns.client_id
      WHERE marketing_campaigns.id = campaign_metrics.campaign_id
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketing_campaigns
      JOIN clients ON clients.id = marketing_campaigns.client_id
      WHERE marketing_campaigns.id = campaign_metrics.campaign_id
      AND clients.user_id = auth.uid()
    )
  );

-- Policies for marketing_goals
CREATE POLICY "Users can manage goals for own clients"
  ON marketing_goals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = marketing_goals.client_id 
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = marketing_goals.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS marketing_campaigns_client_id_idx ON marketing_campaigns(client_id);
CREATE INDEX IF NOT EXISTS marketing_campaigns_status_idx ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS marketing_campaigns_channel_idx ON marketing_campaigns(channel);
CREATE INDEX IF NOT EXISTS marketing_campaigns_start_date_idx ON marketing_campaigns(start_date);

CREATE INDEX IF NOT EXISTS campaign_metrics_campaign_id_idx ON campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_metrics_date_idx ON campaign_metrics(date);

CREATE INDEX IF NOT EXISTS marketing_goals_client_id_idx ON marketing_goals(client_id);
CREATE INDEX IF NOT EXISTS marketing_goals_status_idx ON marketing_goals(status);

-- Create function to update campaign spend when metrics are added
CREATE OR REPLACE FUNCTION update_campaign_spend()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE marketing_campaigns 
  SET 
    spend = (
      SELECT COALESCE(SUM(cost), 0) 
      FROM campaign_metrics 
      WHERE campaign_id = NEW.campaign_id
    ),
    updated_at = now()
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update campaign spend
DROP TRIGGER IF EXISTS on_campaign_metric_updated ON campaign_metrics;
CREATE TRIGGER on_campaign_metric_updated
  AFTER INSERT OR UPDATE OF cost ON campaign_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_spend();

-- Create function to update marketing goal status
CREATE OR REPLACE FUNCTION update_goal_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If current value meets or exceeds target, mark as completed
  IF NEW.current_value >= NEW.target_value AND NEW.status = 'active' THEN
    NEW.status := 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update goal status
DROP TRIGGER IF EXISTS on_goal_value_updated ON marketing_goals;
CREATE TRIGGER on_goal_value_updated
  BEFORE UPDATE OF current_value ON marketing_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_status();