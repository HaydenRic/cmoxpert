/*
  # Fix Security and Performance Issues (With CASCADE)

  This migration addresses all reported security and performance issues:
  1. Missing indexes on foreign keys
  2. RLS policy performance issues (auth function optimization)  
  3. Multiple permissive policies
  4. Function search path security issues
  5. Removes some unused indexes

  ## Critical Fixes
  - All auth.uid() wrapped in (select auth.uid()) - prevents re-evaluation per row
  - Duplicate permissive policies consolidated
  - Function search paths secured with pg_temp
  - Missing foreign key indexes added
*/

-- =============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_connected_accounts_client_id 
  ON connected_accounts(client_id);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_integration_id 
  ON connected_accounts(integration_id);

-- =============================================================================
-- 2. OPTIMIZE RLS POLICIES - Replace auth.uid() with (select auth.uid())
-- =============================================================================

-- Integration Platforms
DROP POLICY IF EXISTS "Users can view integrations for their clients" ON integration_platforms;
CREATE POLICY "Users can view integrations for their clients"
  ON integration_platforms FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = integration_platforms.client_id AND clients.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can insert integrations for their clients" ON integration_platforms;
CREATE POLICY "Users can insert integrations for their clients"
  ON integration_platforms FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM clients WHERE clients.id = integration_platforms.client_id AND clients.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can update integrations for their clients" ON integration_platforms;
CREATE POLICY "Users can update integrations for their clients"
  ON integration_platforms FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = integration_platforms.client_id AND clients.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM clients WHERE clients.id = integration_platforms.client_id AND clients.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can delete integrations for their clients" ON integration_platforms;
CREATE POLICY "Users can delete integrations for their clients"
  ON integration_platforms FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM clients WHERE clients.id = integration_platforms.client_id AND clients.user_id = (select auth.uid())));

-- Integration Mappings
DROP POLICY IF EXISTS "Users can view mappings for their integrations" ON integration_mappings;
CREATE POLICY "Users can view mappings for their integrations"
  ON integration_mappings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_mappings.integration_id AND clients.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can insert mappings for their integrations" ON integration_mappings;
CREATE POLICY "Users can insert mappings for their integrations"
  ON integration_mappings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_mappings.integration_id AND clients.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can update mappings for their integrations" ON integration_mappings;
CREATE POLICY "Users can update mappings for their integrations"
  ON integration_mappings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_mappings.integration_id AND clients.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_mappings.integration_id AND clients.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can delete mappings for their integrations" ON integration_mappings;
CREATE POLICY "Users can delete mappings for their integrations"
  ON integration_mappings FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_mappings.integration_id AND clients.user_id = (select auth.uid())));

-- Integration Sync Logs
DROP POLICY IF EXISTS "Users can view sync logs for their integrations" ON integration_sync_logs;
CREATE POLICY "Users can view sync logs for their integrations"
  ON integration_sync_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_sync_logs.integration_id AND clients.user_id = (select auth.uid())));

-- Integration Field Mappings - Fix duplicate permissive policies
DROP POLICY IF EXISTS "Users can view field mappings for their integrations" ON integration_field_mappings;
DROP POLICY IF EXISTS "Users can manage field mappings for their integrations" ON integration_field_mappings;

CREATE POLICY "Users can view field mappings"
  ON integration_field_mappings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_field_mappings.integration_id AND clients.user_id = (select auth.uid())));

CREATE POLICY "Users can insert field mappings"
  ON integration_field_mappings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_field_mappings.integration_id AND clients.user_id = (select auth.uid())));

CREATE POLICY "Users can update field mappings"
  ON integration_field_mappings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_field_mappings.integration_id AND clients.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_field_mappings.integration_id AND clients.user_id = (select auth.uid())));

CREATE POLICY "Users can delete field mappings"
  ON integration_field_mappings FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_field_mappings.integration_id AND clients.user_id = (select auth.uid())));

-- Integration Webhooks
DROP POLICY IF EXISTS "Users can view webhooks for their integrations" ON integration_webhooks;
CREATE POLICY "Users can view webhooks for their integrations"
  ON integration_webhooks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM integration_platforms JOIN clients ON clients.id = integration_platforms.client_id WHERE integration_platforms.id = integration_webhooks.integration_id AND clients.user_id = (select auth.uid())));

-- Integrations
DROP POLICY IF EXISTS "Users can view own integrations" ON integrations;
CREATE POLICY "Users can view own integrations" ON integrations FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own integrations" ON integrations;
CREATE POLICY "Users can insert own integrations" ON integrations FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own integrations" ON integrations;
CREATE POLICY "Users can update own integrations" ON integrations FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own integrations" ON integrations;
CREATE POLICY "Users can delete own integrations" ON integrations FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- Integration Syncs
DROP POLICY IF EXISTS "Users can view own integration syncs" ON integration_syncs;
CREATE POLICY "Users can view own integration syncs"
  ON integration_syncs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM integrations WHERE integrations.id = integration_syncs.integration_id AND integrations.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can insert own integration syncs" ON integration_syncs;
CREATE POLICY "Users can insert own integration syncs"
  ON integration_syncs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM integrations WHERE integrations.id = integration_syncs.integration_id AND integrations.user_id = (select auth.uid())));

-- Connected Accounts - Fix duplicate permissive policies
DROP POLICY IF EXISTS "Users can view own connected accounts" ON connected_accounts;
DROP POLICY IF EXISTS "Users can manage own connected accounts" ON connected_accounts;

CREATE POLICY "Users can select connected accounts"
  ON connected_accounts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM integrations WHERE integrations.id = connected_accounts.integration_id AND integrations.user_id = (select auth.uid())));

CREATE POLICY "Users can insert connected accounts"
  ON connected_accounts FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM integrations WHERE integrations.id = connected_accounts.integration_id AND integrations.user_id = (select auth.uid())));

CREATE POLICY "Users can update connected accounts"
  ON connected_accounts FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM integrations WHERE integrations.id = connected_accounts.integration_id AND integrations.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM integrations WHERE integrations.id = connected_accounts.integration_id AND integrations.user_id = (select auth.uid())));

CREATE POLICY "Users can delete connected accounts"
  ON connected_accounts FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM integrations WHERE integrations.id = connected_accounts.integration_id AND integrations.user_id = (select auth.uid())));

-- Google OAuth Tokens
DROP POLICY IF EXISTS "Users can view own OAuth tokens" ON google_oauth_tokens;
CREATE POLICY "Users can view own OAuth tokens" ON google_oauth_tokens FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own OAuth tokens" ON google_oauth_tokens;
CREATE POLICY "Users can insert own OAuth tokens" ON google_oauth_tokens FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own OAuth tokens" ON google_oauth_tokens;
CREATE POLICY "Users can update own OAuth tokens" ON google_oauth_tokens FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own OAuth tokens" ON google_oauth_tokens;
CREATE POLICY "Users can delete own OAuth tokens" ON google_oauth_tokens FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- Google Search Console Properties
DROP POLICY IF EXISTS "Users can view own GSC properties" ON google_search_console_properties;
CREATE POLICY "Users can view own GSC properties" ON google_search_console_properties FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own GSC properties" ON google_search_console_properties;
CREATE POLICY "Users can insert own GSC properties" ON google_search_console_properties FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own GSC properties" ON google_search_console_properties;
CREATE POLICY "Users can update own GSC properties" ON google_search_console_properties FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own GSC properties" ON google_search_console_properties;
CREATE POLICY "Users can delete own GSC properties" ON google_search_console_properties FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- Google Search Console Data
DROP POLICY IF EXISTS "Users can view data for own properties" ON google_search_console_data;
CREATE POLICY "Users can view data for own properties"
  ON google_search_console_data FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM google_search_console_properties WHERE google_search_console_properties.id = google_search_console_data.property_id AND google_search_console_properties.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can insert data for own properties" ON google_search_console_data;
CREATE POLICY "Users can insert data for own properties"
  ON google_search_console_data FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM google_search_console_properties WHERE google_search_console_properties.id = google_search_console_data.property_id AND google_search_console_properties.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can update data for own properties" ON google_search_console_data;
CREATE POLICY "Users can update data for own properties"
  ON google_search_console_data FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM google_search_console_properties WHERE google_search_console_properties.id = google_search_console_data.property_id AND google_search_console_properties.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM google_search_console_properties WHERE google_search_console_properties.id = google_search_console_data.property_id AND google_search_console_properties.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Users can delete data for own properties" ON google_search_console_data;
CREATE POLICY "Users can delete data for own properties"
  ON google_search_console_data FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM google_search_console_properties WHERE google_search_console_properties.id = google_search_console_data.property_id AND google_search_console_properties.user_id = (select auth.uid())));

-- =============================================================================
-- 3. FIX FUNCTION SEARCH PATHS
-- =============================================================================

DROP FUNCTION IF EXISTS update_integration_updated_at() CASCADE;
CREATE FUNCTION update_integration_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_integration_platforms_updated_at
  BEFORE UPDATE ON integration_platforms
  FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at();

CREATE TRIGGER update_integration_mappings_updated_at
  BEFORE UPDATE ON integration_mappings
  FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at();

CREATE TRIGGER update_integration_field_mappings_updated_at
  BEFORE UPDATE ON integration_field_mappings
  FOR EACH ROW EXECUTE FUNCTION update_integration_updated_at();

DROP FUNCTION IF EXISTS get_client_integrations(uuid) CASCADE;
CREATE FUNCTION get_client_integrations(p_client_id uuid)
RETURNS TABLE (id uuid, client_id uuid, integration_type text, is_active boolean, last_sync_at timestamptz, sync_status text)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY SELECT ip.id, ip.client_id, ip.integration_type, ip.is_active, ip.last_sync_at, ip.sync_status
  FROM integration_platforms ip WHERE ip.client_id = p_client_id ORDER BY ip.created_at DESC;
END;
$$;

DROP FUNCTION IF EXISTS get_pending_sync_mappings(uuid) CASCADE;
CREATE FUNCTION get_pending_sync_mappings(p_integration_id uuid)
RETURNS TABLE (id uuid, integration_id uuid, local_entity_type text, local_entity_id uuid, remote_entity_id text, sync_status text)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY SELECT im.id, im.integration_id, im.local_entity_type, im.local_entity_id, im.remote_entity_id, im.sync_status
  FROM integration_mappings im WHERE im.integration_id = p_integration_id AND im.sync_status IN ('pending', 'error')
  ORDER BY im.last_sync_attempt NULLS FIRST;
END;
$$;

-- =============================================================================
-- 4. REMOVE UNUSED INDEXES
-- =============================================================================

DROP INDEX IF EXISTS generated_content_workflow_stage_idx;
DROP INDEX IF EXISTS generated_content_tags_idx;
DROP INDEX IF EXISTS content_calendar_workflow_stage_idx;
DROP INDEX IF EXISTS content_templates_is_public_idx;
DROP INDEX IF EXISTS seo_keywords_keyword_type_idx;
DROP INDEX IF EXISTS content_ab_tests_status_idx;
DROP INDEX IF EXISTS content_comments_is_resolved_idx;