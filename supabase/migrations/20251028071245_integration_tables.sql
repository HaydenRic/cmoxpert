/*
  # Integration Tables Migration
  
  Creates tables for the data integration hub:
  - integrations: Third-party service connections
  - integration_syncs: Sync history and logs
  - connected_accounts: OAuth tokens and credentials
  
  ## Security
  - RLS enabled on all tables
  - Users can only access their own integrations
*/

-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name text NOT NULL,
  service_type text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
  config jsonb DEFAULT '{}'::jsonb,
  credentials_encrypted text,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create integration_syncs table
CREATE TABLE IF NOT EXISTS integration_syncs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE NOT NULL,
  sync_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  records_synced integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create connected_accounts table
CREATE TABLE IF NOT EXISTS connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  account_id text NOT NULL,
  account_name text,
  account_metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_service ON integrations(service_name);
CREATE INDEX IF NOT EXISTS idx_integration_syncs_integration ON integration_syncs(integration_id);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integrations
CREATE POLICY "Users can view own integrations"
  ON integrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON integrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON integrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON integrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for integration_syncs
CREATE POLICY "Users can view own integration syncs"
  ON integration_syncs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM integrations 
      WHERE integrations.id = integration_syncs.integration_id 
      AND integrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own integration syncs"
  ON integration_syncs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM integrations 
      WHERE integrations.id = integration_syncs.integration_id 
      AND integrations.user_id = auth.uid()
    )
  );

-- RLS Policies for connected_accounts
CREATE POLICY "Users can view own connected accounts"
  ON connected_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM integrations 
      WHERE integrations.id = connected_accounts.integration_id 
      AND integrations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own connected accounts"
  ON connected_accounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM integrations 
      WHERE integrations.id = connected_accounts.integration_id 
      AND integrations.user_id = auth.uid()
    )
  );