/*
  # Comprehensive SMB Marketing Features Schema

  1. New Tables
    - `kpis` - Key Performance Indicators tracking
    - `competitors` - Competitor information
    - `competitive_alerts` - Automated competitor alerts
    - `generated_content` - AI-generated marketing content
    - `tasks` - Marketing tasks and collaboration
    - `messages` - In-app messaging for collaboration
    - `documents` - Shared document storage
    - `budgets` - Marketing budget allocations
    - `campaigns` - Individual marketing campaigns

  2. Security
    - Enable RLS on all new tables
    - Add policies for user access control
    - Ensure data isolation between users

  3. Indexes
    - Performance optimization indexes
    - Foreign key indexes for relationships
*/

-- Create KPIs table for performance tracking
CREATE TABLE IF NOT EXISTS kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  value numeric DEFAULT 0,
  target numeric,
  unit text DEFAULT '',
  period text DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  tracked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  domain text NOT NULL,
  tracked_since timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create competitive alerts table
CREATE TABLE IF NOT EXISTS competitive_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid REFERENCES competitors(id) ON DELETE CASCADE NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('new_content', 'pricing_change', 'ad_campaign', 'product_update', 'website_change')),
  description text NOT NULL,
  details jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  alerted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create generated content table
CREATE TABLE IF NOT EXISTS generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  content_type text NOT NULL CHECK (content_type IN ('blog_post', 'social_media_post', 'email_copy', 'ad_copy', 'landing_page', 'press_release')),
  title text NOT NULL,
  content text NOT NULL,
  ai_prompt text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table for collaboration
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table for in-app communication
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  message_text text NOT NULL,
  sent_at timestamptz DEFAULT now()
);

-- Create documents table for file sharing
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  description text,
  uploaded_at timestamptz DEFAULT now()
);

-- Create budgets table for financial planning
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  period text NOT NULL,
  allocated_amount numeric NOT NULL DEFAULT 0,
  spent_amount numeric DEFAULT 0,
  currency text DEFAULT 'GBP',
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create campaigns table for marketing campaign tracking
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  channel text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  cost numeric DEFAULT 0,
  revenue numeric DEFAULT 0,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'running', 'completed', 'paused')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- KPIs policies
CREATE POLICY "Users can manage KPIs for own clients"
  ON kpis FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = kpis.client_id 
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = kpis.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Competitors policies
CREATE POLICY "Users can manage competitors for own clients"
  ON competitors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = competitors.client_id 
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = competitors.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Competitive alerts policies
CREATE POLICY "Users can view alerts for own clients' competitors"
  ON competitive_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM competitors 
      JOIN clients ON clients.id = competitors.client_id
      WHERE competitors.id = competitive_alerts.competitor_id 
      AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update alerts for own clients' competitors"
  ON competitive_alerts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM competitors 
      JOIN clients ON clients.id = competitors.client_id
      WHERE competitors.id = competitive_alerts.competitor_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Generated content policies
CREATE POLICY "Users can manage own generated content"
  ON generated_content FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can manage tasks for own clients"
  ON tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = tasks.client_id 
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = tasks.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can manage messages for own clients"
  ON messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = messages.client_id 
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = messages.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Documents policies
CREATE POLICY "Users can manage documents for own clients"
  ON documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = documents.client_id 
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = documents.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Budgets policies
CREATE POLICY "Users can manage budgets for own clients"
  ON budgets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = budgets.client_id 
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = budgets.client_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Campaigns policies
CREATE POLICY "Users can manage campaigns for own budgets"
  ON campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM budgets 
      JOIN clients ON clients.id = budgets.client_id
      WHERE budgets.id = campaigns.budget_id 
      AND clients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets 
      JOIN clients ON clients.id = budgets.client_id
      WHERE budgets.id = campaigns.budget_id 
      AND clients.user_id = auth.uid()
    )
  );

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS kpis_client_id_idx ON kpis(client_id);
CREATE INDEX IF NOT EXISTS kpis_tracked_at_idx ON kpis(tracked_at);
CREATE INDEX IF NOT EXISTS kpis_period_idx ON kpis(period);

CREATE INDEX IF NOT EXISTS competitors_client_id_idx ON competitors(client_id);
CREATE INDEX IF NOT EXISTS competitors_domain_idx ON competitors(domain);

CREATE INDEX IF NOT EXISTS competitive_alerts_competitor_id_idx ON competitive_alerts(competitor_id);
CREATE INDEX IF NOT EXISTS competitive_alerts_is_read_idx ON competitive_alerts(is_read);
CREATE INDEX IF NOT EXISTS competitive_alerts_alerted_at_idx ON competitive_alerts(alerted_at);

CREATE INDEX IF NOT EXISTS generated_content_user_id_idx ON generated_content(user_id);
CREATE INDEX IF NOT EXISTS generated_content_client_id_idx ON generated_content(client_id);
CREATE INDEX IF NOT EXISTS generated_content_content_type_idx ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS generated_content_status_idx ON generated_content(status);

CREATE INDEX IF NOT EXISTS tasks_client_id_idx ON tasks(client_id);
CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);

CREATE INDEX IF NOT EXISTS messages_client_id_idx ON messages(client_id);
CREATE INDEX IF NOT EXISTS messages_task_id_idx ON messages(task_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_sent_at_idx ON messages(sent_at);

CREATE INDEX IF NOT EXISTS documents_client_id_idx ON documents(client_id);
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);
CREATE INDEX IF NOT EXISTS documents_file_type_idx ON documents(file_type);

CREATE INDEX IF NOT EXISTS budgets_client_id_idx ON budgets(client_id);
CREATE INDEX IF NOT EXISTS budgets_status_idx ON budgets(status);
CREATE INDEX IF NOT EXISTS budgets_period_idx ON budgets(period);

CREATE INDEX IF NOT EXISTS campaigns_budget_id_idx ON campaigns(budget_id);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(status);
CREATE INDEX IF NOT EXISTS campaigns_channel_idx ON campaigns(channel);
CREATE INDEX IF NOT EXISTS campaigns_start_date_idx ON campaigns(start_date);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Users can upload documents for own clients"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view documents for own clients"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM documents
    JOIN clients ON clients.id = documents.client_id
    WHERE documents.file_url LIKE '%' || storage.objects.name || '%'
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents for own clients"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM documents
    JOIN clients ON clients.id = documents.client_id
    WHERE documents.file_url LIKE '%' || storage.objects.name || '%'
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents for own clients"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM documents
    JOIN clients ON clients.id = documents.client_id
    WHERE documents.file_url LIKE '%' || storage.objects.name || '%'
    AND clients.user_id = auth.uid()
  )
);

-- Create functions for automated tasks
CREATE OR REPLACE FUNCTION update_budget_spent_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Update budget spent amount when campaign cost changes
  UPDATE budgets 
  SET spent_amount = (
    SELECT COALESCE(SUM(cost), 0) 
    FROM campaigns 
    WHERE budget_id = NEW.budget_id
  ),
  updated_at = now()
  WHERE id = NEW.budget_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update budget spent amount
DROP TRIGGER IF EXISTS on_campaign_cost_updated ON campaigns;
CREATE TRIGGER on_campaign_cost_updated
  AFTER INSERT OR UPDATE OF cost ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_spent_amount();

-- Create function to automatically mark old alerts as read
CREATE OR REPLACE FUNCTION mark_old_alerts_read()
RETURNS void AS $$
BEGIN
  UPDATE competitive_alerts 
  SET is_read = true 
  WHERE alerted_at < now() - interval '30 days' 
  AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up old generated content
CREATE OR REPLACE FUNCTION cleanup_old_content()
RETURNS void AS $$
BEGIN
  DELETE FROM generated_content 
  WHERE status = 'archived' 
  AND updated_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for demonstration (optional)
DO $$
DECLARE
  sample_client_id uuid;
  sample_budget_id uuid;
  sample_competitor_id uuid;
BEGIN
  -- Only insert sample data if no clients exist
  IF NOT EXISTS (SELECT 1 FROM clients LIMIT 1) THEN
    -- This would be populated by actual user signups
    NULL;
  END IF;
END $$;