/*
  # Create data pipeline and metrics tracking system

  1. New Tables
    - `integrations` - tracks connection status for Stripe, GA4, and future integrations
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `type` (text, check: stripe, ga4)
      - `status` (text, check: disconnected, connected, error)
      - `connected_at` (timestamptz)
      - `last_sync_at` (timestamptz)
      - `last_error` (text)
      - `config` (jsonb, for non-sensitive config)
      - `created_at`, `updated_at` (timestamptz)

    - `integration_credentials` - encrypted credentials storage (restricted access)
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `type` (text, check: stripe, ga4)
      - `credentials_json` (jsonb, encrypted)
      - `created_at`, `updated_at` (timestamptz)

    - `sync_runs` - audit log of all data sync operations
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `type` (text, check: stripe, ga4, csv_import, manual)
      - `status` (text, check: running, success, error)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `cursor` (text, for incremental syncs)
      - `error` (text)
      - `rows_processed` (integer)

    - `raw_events` - immutable event log from all sources
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `source` (text, check: stripe, ga4, csv, manual)
      - `event_type` (text)
      - `payload` (jsonb)
      - `event_time` (timestamptz)
      - `created_at` (timestamptz)

    - `metrics_daily` - single source of truth for dashboard metrics
      - `id` (uuid, primary key)
      - `client_id` (uuid, references clients)
      - `metric_name` (text)
      - `metric_date` (date)
      - `value` (numeric)
      - `source` (text, check: stripe, ga4, manual, csv)
      - `created_at`, `updated_at` (timestamptz)
      - Unique constraint on (client_id, metric_name, metric_date, source)

  2. Security
    - Enable RLS on all tables
    - Users can only access data for their own clients
    - integration_credentials has restrictive RLS (edge functions only)

  3. Indexes
    - Foreign keys indexed for joins
    - Frequently queried columns indexed
    - Composite indexes for dashboard queries
*/

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS metrics_daily CASCADE;
DROP TABLE IF EXISTS raw_events CASCADE;
DROP TABLE IF EXISTS sync_runs CASCADE;
DROP TABLE IF EXISTS integration_credentials CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;

-- integrations: track connection status
CREATE TABLE integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('stripe', 'ga4')),
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connected', 'error')),
  connected_at timestamptz,
  last_sync_at timestamptz,
  last_error text,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_integrations_client_id ON integrations(client_id);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_client_type ON integrations(client_id, type);
CREATE INDEX idx_integrations_status ON integrations(status);

-- integration_credentials: restricted access for secrets
CREATE TABLE integration_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('stripe', 'ga4')),
  credentials_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, type)
);

CREATE INDEX idx_integration_credentials_client_id ON integration_credentials(client_id);
CREATE INDEX idx_integration_credentials_type ON integration_credentials(client_id, type);

-- sync_runs: audit log
CREATE TABLE sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('stripe', 'ga4', 'csv_import', 'manual')),
  status text NOT NULL CHECK (status IN ('running', 'success', 'error')),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  cursor text,
  error text,
  rows_processed integer DEFAULT 0
);

CREATE INDEX idx_sync_runs_client_id ON sync_runs(client_id);
CREATE INDEX idx_sync_runs_type ON sync_runs(type);
CREATE INDEX idx_sync_runs_status ON sync_runs(status);
CREATE INDEX idx_sync_runs_started_at ON sync_runs(started_at DESC);

-- raw_events: immutable event log
CREATE TABLE raw_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('stripe', 'ga4', 'csv', 'manual')),
  event_type text,
  payload jsonb NOT NULL,
  event_time timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_raw_events_client_id ON raw_events(client_id);
CREATE INDEX idx_raw_events_source ON raw_events(source);
CREATE INDEX idx_raw_events_event_time ON raw_events(event_time DESC);
CREATE INDEX idx_raw_events_event_type ON raw_events(event_type);

-- metrics_daily: single source of truth for dashboards
CREATE TABLE metrics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_date date NOT NULL,
  value numeric NOT NULL,
  source text NOT NULL CHECK (source IN ('stripe', 'ga4', 'manual', 'csv')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, metric_name, metric_date, source)
);

CREATE INDEX idx_metrics_daily_client_id ON metrics_daily(client_id);
CREATE INDEX idx_metrics_daily_date ON metrics_daily(metric_date DESC);
CREATE INDEX idx_metrics_daily_metric ON metrics_daily(metric_name);
CREATE INDEX idx_metrics_daily_client_date ON metrics_daily(client_id, metric_date DESC);
CREATE INDEX idx_metrics_daily_client_metric ON metrics_daily(client_id, metric_name);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies: integrations
CREATE POLICY "Users can view integrations for their clients"
  ON integrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = integrations.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert integrations for their clients"
  ON integrations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = integrations.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update integrations for their clients"
  ON integrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = integrations.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete integrations for their clients"
  ON integrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = integrations.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- RLS Policies: integration_credentials (very restrictive - edge functions only)
CREATE POLICY "Service role can manage credentials"
  ON integration_credentials FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies: sync_runs
CREATE POLICY "Users can view sync_runs for their clients"
  ON sync_runs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = sync_runs.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- RLS Policies: raw_events
CREATE POLICY "Users can view raw_events for their clients"
  ON raw_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = raw_events.client_id
      AND clients.user_id = auth.uid()
    )
  );

-- RLS Policies: metrics_daily
CREATE POLICY "Users can view metrics_daily for their clients"
  ON metrics_daily FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = metrics_daily.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert metrics_daily for their clients"
  ON metrics_daily FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = metrics_daily.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update metrics_daily for their clients"
  ON metrics_daily FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = metrics_daily.client_id
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete metrics_daily for their clients"
  ON metrics_daily FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = metrics_daily.client_id
      AND clients.user_id = auth.uid()
    )
  );
