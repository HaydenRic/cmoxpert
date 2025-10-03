/*
  # Feature Enhancements Migration

  ## New Features

  1. **Data Integration Hub**
     - `integrations` - Third-party service connections
     - `integration_syncs` - Sync history and logs
     - `connected_accounts` - OAuth tokens and credentials

  2. **Client Collaboration Portal**
     - `client_users` - Client-side user accounts
     - `client_permissions` - Granular permission system
     - `shared_reports` - Report sharing with clients
     - `comments` - Threaded comments on reports/playbooks
     - `notifications` - User notification system

  3. **Automated Workflow Engine**
     - `workflows` - Workflow definitions
     - `workflow_triggers` - Event-based triggers
     - `workflow_actions` - Action configurations
     - `workflow_runs` - Execution history

  4. **Real-time Competitive Alerts**
     - `competitor_snapshots` - Historical competitor data
     - `competitor_changes` - Detected changes
     - `alert_rules` - User-defined alert rules
     - `serp_tracking` - Search position tracking

  5. **Enhanced Analytics & Forecasting**
     - `forecasts` - Revenue and metric predictions
     - `benchmarks` - Industry benchmark data
     - `attribution_models` - Channel attribution
     - `cohort_analysis` - Cohort tracking data

  ## Security
  - RLS enabled on all tables
  - Restrictive policies for data access
*/

-- =====================================================
-- 1. DATA INTEGRATION HUB
-- =====================================================

CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_name text NOT NULL, -- 'google_analytics', 'hubspot', 'google_ads', etc.
  service_type text NOT NULL, -- 'analytics', 'crm', 'ads', 'seo'
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'pending')),
  config jsonb DEFAULT '{}'::jsonb,
  credentials_encrypted text,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integration_syncs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE NOT NULL,
  sync_type text NOT NULL, -- 'full', 'incremental'
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  records_synced integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  account_id text NOT NULL, -- External account ID
  account_name text,
  account_metadata jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. CLIENT COLLABORATION PORTAL
-- =====================================================

CREATE TABLE IF NOT EXISTS client_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  avatar_url text,
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id uuid REFERENCES client_users(id) ON DELETE CASCADE NOT NULL,
  resource_type text NOT NULL, -- 'report', 'playbook', 'dashboard', 'analytics'
  resource_id uuid,
  can_view boolean DEFAULT true,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  can_share boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shared_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  shared_by uuid REFERENCES auth.users(id) NOT NULL,
  shared_with_client_user uuid REFERENCES client_users(id) ON DELETE CASCADE,
  share_token text UNIQUE,
  expires_at timestamptz,
  view_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_user_id uuid REFERENCES client_users(id) ON DELETE CASCADE,
  resource_type text NOT NULL, -- 'report', 'playbook', 'campaign'
  resource_id uuid NOT NULL,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_or_client_user CHECK (
    (user_id IS NOT NULL AND client_user_id IS NULL) OR
    (user_id IS NULL AND client_user_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'alert', 'comment', 'workflow', 'system'
  title text NOT NULL,
  message text,
  action_url text,
  is_read boolean DEFAULT false,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- =====================================================
-- 3. AUTOMATED WORKFLOW ENGINE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL, -- 'schedule', 'event', 'webhook'
  trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  last_run_at timestamptz,
  run_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL, -- 'client.created', 'report.completed', 'alert.triggered'
  conditions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL, -- 'send_email', 'create_task', 'generate_report', 'send_notification'
  action_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  trigger_data jsonb DEFAULT '{}'::jsonb,
  actions_completed integer DEFAULT 0,
  actions_failed integer DEFAULT 0,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  execution_time_ms integer
);

-- =====================================================
-- 4. REAL-TIME COMPETITIVE ALERTS
-- =====================================================

CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid REFERENCES competitors(id) ON DELETE CASCADE NOT NULL,
  snapshot_type text NOT NULL, -- 'website', 'pricing', 'features', 'social', 'seo'
  snapshot_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text,
  captured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competitor_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid REFERENCES competitors(id) ON DELETE CASCADE NOT NULL,
  change_type text NOT NULL, -- 'content_update', 'pricing_change', 'new_feature', 'serp_position'
  change_description text,
  old_value jsonb,
  new_value jsonb,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  detected_at timestamptz DEFAULT now(),
  is_notified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  rule_type text NOT NULL, -- 'competitor_change', 'metric_threshold', 'keyword_ranking'
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  notification_channels jsonb DEFAULT '["in_app"]'::jsonb, -- ['email', 'slack', 'sms', 'in_app']
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS serp_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  keyword text NOT NULL,
  search_engine text DEFAULT 'google',
  location text DEFAULT 'us',
  client_position integer,
  client_url text,
  competitor_positions jsonb DEFAULT '[]'::jsonb,
  search_volume integer,
  tracked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 5. ENHANCED ANALYTICS & FORECASTING
-- =====================================================

CREATE TABLE IF NOT EXISTS forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  metric_name text NOT NULL, -- 'revenue', 'leads', 'conversions', 'traffic'
  forecast_type text NOT NULL, -- 'linear', 'exponential', 'ml_model'
  time_period text NOT NULL, -- 'next_month', 'next_quarter', 'next_year'
  predicted_value numeric,
  confidence_level numeric, -- 0.0 to 1.0
  forecast_data jsonb DEFAULT '[]'::jsonb,
  model_metadata jsonb DEFAULT '{}'::jsonb,
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  percentile integer, -- 25th, 50th, 75th, 90th
  sample_size integer,
  time_period text, -- 'Q1_2025', '2024', etc.
  source text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attribution_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  model_name text NOT NULL,
  model_type text NOT NULL, -- 'first_touch', 'last_touch', 'linear', 'time_decay', 'custom'
  attribution_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  date_range_start date NOT NULL,
  date_range_end date NOT NULL,
  total_conversions integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cohort_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  cohort_date date NOT NULL,
  cohort_type text NOT NULL, -- 'acquisition', 'activation', 'campaign'
  cohort_size integer NOT NULL,
  period_number integer NOT NULL, -- 0, 1, 2, 3... (weeks/months since cohort start)
  retention_rate numeric,
  revenue numeric DEFAULT 0,
  metrics jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, cohort_date, cohort_type, period_number)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_integrations_user ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_service ON integrations(service_name);
CREATE INDEX IF NOT EXISTS idx_integration_syncs_integration ON integration_syncs(integration_id);
CREATE INDEX IF NOT EXISTS idx_client_users_client ON client_users(client_id);
CREATE INDEX IF NOT EXISTS idx_client_users_email ON client_users(email);
CREATE INDEX IF NOT EXISTS idx_comments_resource ON comments(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_workflows_user ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow ON workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_competitor_snapshots_competitor ON competitor_snapshots(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_changes_competitor ON competitor_changes(competitor_id);
CREATE INDEX IF NOT EXISTS idx_serp_tracking_client ON serp_tracking(client_id);
CREATE INDEX IF NOT EXISTS idx_serp_tracking_keyword ON serp_tracking(keyword);
CREATE INDEX IF NOT EXISTS idx_forecasts_client ON forecasts(client_id);
CREATE INDEX IF NOT EXISTS idx_benchmarks_industry ON benchmarks(industry, metric_name);
CREATE INDEX IF NOT EXISTS idx_attribution_client ON attribution_models(client_id);
CREATE INDEX IF NOT EXISTS idx_cohort_client ON cohort_analysis(client_id, cohort_date);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Integrations
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own integrations" ON integrations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE integration_syncs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own integration syncs" ON integration_syncs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM integrations WHERE integrations.id = integration_syncs.integration_id AND integrations.user_id = auth.uid())
);

ALTER TABLE connected_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own connected accounts" ON connected_accounts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM integrations WHERE integrations.id = connected_accounts.integration_id AND integrations.user_id = auth.uid())
);

-- Client Collaboration
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage client users for own clients" ON client_users FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = client_users.client_id AND clients.user_id = auth.uid())
);

ALTER TABLE client_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage permissions for own client users" ON client_permissions FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM client_users
    JOIN clients ON clients.id = client_users.client_id
    WHERE client_users.id = client_permissions.client_user_id
    AND clients.user_id = auth.uid()
  )
);

ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own shared reports" ON shared_reports FOR ALL TO authenticated USING (auth.uid() = shared_by);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own comments" ON comments FOR ALL TO authenticated USING (auth.uid() = user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Workflows
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workflows" ON workflows FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workflow triggers" ON workflow_triggers FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM workflows WHERE workflows.id = workflow_triggers.workflow_id AND workflows.user_id = auth.uid())
);

ALTER TABLE workflow_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own workflow actions" ON workflow_actions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM workflows WHERE workflows.id = workflow_actions.workflow_id AND workflows.user_id = auth.uid())
);

ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workflow runs" ON workflow_runs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM workflows WHERE workflows.id = workflow_runs.workflow_id AND workflows.user_id = auth.uid())
);

-- Competitive Intelligence
ALTER TABLE competitor_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view snapshots for own competitors" ON competitor_snapshots FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM competitors
    JOIN clients ON clients.id = competitors.client_id
    WHERE competitors.id = competitor_snapshots.competitor_id
    AND clients.user_id = auth.uid()
  )
);

ALTER TABLE competitor_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view changes for own competitors" ON competitor_changes FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM competitors
    JOIN clients ON clients.id = competitors.client_id
    WHERE competitors.id = competitor_changes.competitor_id
    AND clients.user_id = auth.uid()
  )
);

ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own alert rules" ON alert_rules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE serp_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view SERP data for own clients" ON serp_tracking FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = serp_tracking.client_id AND clients.user_id = auth.uid())
);

-- Analytics & Forecasting
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view forecasts for own clients" ON forecasts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = forecasts.client_id AND clients.user_id = auth.uid())
);

ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated users can view benchmarks" ON benchmarks FOR SELECT TO authenticated USING (true);

ALTER TABLE attribution_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage attribution for own clients" ON attribution_models FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = attribution_models.client_id AND clients.user_id = auth.uid())
);

ALTER TABLE cohort_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view cohorts for own clients" ON cohort_analysis FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = cohort_analysis.client_id AND clients.user_id = auth.uid())
);
