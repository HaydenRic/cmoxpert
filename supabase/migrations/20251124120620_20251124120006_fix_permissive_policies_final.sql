/*
  # Fix Multiple Permissive Policies - Final Version
  
  Consolidates duplicate SELECT policies based on actual table structures
*/

-- Fix automated_deliverables
DROP POLICY IF EXISTS "CMOs can manage client deliverables" ON public.automated_deliverables;
DROP POLICY IF EXISTS "CMOs can view client deliverables" ON public.automated_deliverables;

CREATE POLICY "CMOs can view and manage client deliverables"
  ON public.automated_deliverables FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = automated_deliverables.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = automated_deliverables.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Fix client_subscriptions
DROP POLICY IF EXISTS "CMOs can manage client subscriptions" ON public.client_subscriptions;
DROP POLICY IF EXISTS "CMOs can view client subscriptions" ON public.client_subscriptions;

CREATE POLICY "CMOs can view and manage client subscriptions"
  ON public.client_subscriptions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_subscriptions.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_subscriptions.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Fix client_success_metrics
DROP POLICY IF EXISTS "CMOs can manage client success metrics" ON public.client_success_metrics;
DROP POLICY IF EXISTS "CMOs can view client success metrics" ON public.client_success_metrics;

CREATE POLICY "CMOs can view and manage client success metrics"
  ON public.client_success_metrics FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_success_metrics.client_id
      AND clients.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients
      WHERE clients.id = client_success_metrics.client_id
      AND clients.user_id = (select auth.uid())
    )
  );

-- Fix service_packages (public table, no created_by column)
DROP POLICY IF EXISTS "Admins can manage packages" ON public.service_packages;
DROP POLICY IF EXISTS "Anyone can view active packages" ON public.service_packages;

CREATE POLICY "Anyone can view active packages"
  ON public.service_packages FOR SELECT TO authenticated
  USING (is_active = true);

-- Fix videos
DROP POLICY IF EXISTS "Admins can manage all videos" ON public.videos;
DROP POLICY IF EXISTS "Authenticated users can view active videos" ON public.videos;

CREATE POLICY "Users can view active videos"
  ON public.videos FOR SELECT TO authenticated
  USING (status = 'active' OR uploaded_by = (select auth.uid()));

CREATE POLICY "Uploaders can manage their videos"
  ON public.videos FOR ALL TO authenticated
  USING (uploaded_by = (select auth.uid()))
  WITH CHECK (uploaded_by = (select auth.uid()));