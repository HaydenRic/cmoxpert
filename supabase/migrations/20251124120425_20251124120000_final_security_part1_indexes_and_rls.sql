/*
  # Final Security Fixes - Part 1: Indexes and RLS

  ## 1. Unindexed Foreign Keys
     - Add index on clients.user_id

  ## 2. RLS Policy Optimization (9 policies)
     - Fix auth.uid() calls to use (select auth.uid()) pattern
*/

-- Add missing foreign key index
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Fix videos table policy
DROP POLICY IF EXISTS "Authenticated users can view active videos" ON public.videos;
CREATE POLICY "Authenticated users can view active videos"
  ON public.videos FOR SELECT TO authenticated
  USING (status = 'active' OR uploaded_by = (select auth.uid()));

-- Fix client_contracts policy
DROP POLICY IF EXISTS "CMO can manage all client contracts" ON public.client_contracts;
CREATE POLICY "CMO can manage all client contracts"
  ON public.client_contracts FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_contracts.client_id AND clients.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_contracts.client_id AND clients.user_id = (select auth.uid())));

-- Fix client_health_scores policies
DROP POLICY IF EXISTS "CMO can insert client health scores" ON public.client_health_scores;
CREATE POLICY "CMO can insert client health scores"
  ON public.client_health_scores FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_health_scores.client_id AND clients.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "CMO can view client health scores" ON public.client_health_scores;
CREATE POLICY "CMO can view client health scores"
  ON public.client_health_scores FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_health_scores.client_id AND clients.user_id = (select auth.uid())));

-- Fix client_meetings policy
DROP POLICY IF EXISTS "CMO can manage all client meetings" ON public.client_meetings;
CREATE POLICY "CMO can manage all client meetings"
  ON public.client_meetings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_meetings.client_id AND clients.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_meetings.client_id AND clients.user_id = (select auth.uid())));

-- Fix client_notes policy
DROP POLICY IF EXISTS "CMO can manage all client notes" ON public.client_notes;
CREATE POLICY "CMO can manage all client notes"
  ON public.client_notes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_notes.client_id AND clients.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_notes.client_id AND clients.user_id = (select auth.uid())));

-- Fix client_documents policy
DROP POLICY IF EXISTS "CMO can manage all client documents" ON public.client_documents;
CREATE POLICY "CMO can manage all client documents"
  ON public.client_documents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_documents.client_id AND clients.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_documents.client_id AND clients.user_id = (select auth.uid())));

-- Fix client_kpi_targets policy
DROP POLICY IF EXISTS "CMO can manage all client KPI targets" ON public.client_kpi_targets;
CREATE POLICY "CMO can manage all client KPI targets"
  ON public.client_kpi_targets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_kpi_targets.client_id AND clients.user_id = (select auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients WHERE clients.id = client_kpi_targets.client_id AND clients.user_id = (select auth.uid())));

-- Fix business_metrics policy
DROP POLICY IF EXISTS "CMO can manage own business metrics" ON public.business_metrics;
CREATE POLICY "CMO can manage own business metrics"
  ON public.business_metrics FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));