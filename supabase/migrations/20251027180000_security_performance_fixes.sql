/*
  # Security and Performance Optimization Migration

  This migration addresses critical security and performance issues identified in the database audit:

  ## 1. Missing Foreign Key Indexes
  Adds indexes to all foreign key columns to improve query performance and prevent full table scans
  during JOIN operations.

  ## 2. RLS Policy Optimization
  Optimizes all Row Level Security policies by wrapping auth.uid() calls in SELECT subqueries.
  This prevents re-evaluation on each row and significantly improves query performance at scale.

  ## 3. Function Search Path Security
  Sets explicit search_path for all functions to prevent potential security vulnerabilities
  from search path manipulation attacks.

  ## Impact:
  - Dramatically improved query performance for large datasets
  - Enhanced security through proper function isolation
  - Reduced CPU usage for RLS policy evaluation
  - Better index utilization for foreign key lookups

  ## Breaking Changes:
  None - this is purely an optimization and security hardening migration.
*/

-- =====================================================
-- PART 1: Add Missing Foreign Key Indexes
-- =====================================================

-- Content AB Tests
CREATE INDEX IF NOT EXISTS idx_content_ab_tests_variation_content_id
ON public.content_ab_tests(variation_content_id);

-- Content Assets
CREATE INDEX IF NOT EXISTS idx_content_assets_uploaded_by
ON public.content_assets(uploaded_by);

-- Content Assignments
CREATE INDEX IF NOT EXISTS idx_content_assignments_assigned_by
ON public.content_assignments(assigned_by);

-- Content Briefs
CREATE INDEX IF NOT EXISTS idx_content_briefs_created_by
ON public.content_briefs(created_by);

-- Content Calendar
CREATE INDEX IF NOT EXISTS idx_content_calendar_content_id
ON public.content_calendar(content_id);

CREATE INDEX IF NOT EXISTS idx_content_calendar_created_by
ON public.content_calendar(created_by);

-- Content Comments
CREATE INDEX IF NOT EXISTS idx_content_comments_parent_comment_id
ON public.content_comments(parent_comment_id);

-- Content Versions
CREATE INDEX IF NOT EXISTS idx_content_versions_created_by
ON public.content_versions(created_by);

-- =====================================================
-- PART 2: Optimize RLS Policies for Performance
-- =====================================================

-- Drop and recreate all policies with optimized auth.uid() calls

-- Profiles Table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

-- Clients Table
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients"
ON public.clients FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
CREATE POLICY "Users can insert own clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients"
ON public.clients FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients"
ON public.clients FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Reports Table
DROP POLICY IF EXISTS "Users can view reports for own clients" ON public.reports;
CREATE POLICY "Users can view reports for own clients"
ON public.reports FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = reports.client_id
    AND clients.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can insert reports for own clients" ON public.reports;
CREATE POLICY "Users can insert reports for own clients"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = reports.client_id
    AND clients.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can update reports for own clients" ON public.reports;
CREATE POLICY "Users can update reports for own clients"
ON public.reports FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = reports.client_id
    AND clients.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = reports.client_id
    AND clients.user_id = (SELECT auth.uid())
  )
);

-- Playbooks Table
DROP POLICY IF EXISTS "Users can view own playbooks" ON public.playbooks;
CREATE POLICY "Users can view own playbooks"
ON public.playbooks FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own playbooks" ON public.playbooks;
CREATE POLICY "Users can insert own playbooks"
ON public.playbooks FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own playbooks" ON public.playbooks;
CREATE POLICY "Users can update own playbooks"
ON public.playbooks FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own playbooks" ON public.playbooks;
CREATE POLICY "Users can delete own playbooks"
ON public.playbooks FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Generated Content Table
DROP POLICY IF EXISTS "Users can manage own generated content" ON public.generated_content;
CREATE POLICY "Users can manage own generated content"
ON public.generated_content FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Content Versions Table
DROP POLICY IF EXISTS "Users can view versions of own content" ON public.content_versions;
CREATE POLICY "Users can view versions of own content"
ON public.content_versions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_versions.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can create versions of own content" ON public.content_versions;
CREATE POLICY "Users can create versions of own content"
ON public.content_versions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_versions.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
);

-- Brand Voice Profiles Table
DROP POLICY IF EXISTS "Users can manage brand voices for own clients" ON public.brand_voice_profiles;
CREATE POLICY "Users can manage brand voices for own clients"
ON public.brand_voice_profiles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = brand_voice_profiles.client_id
    AND clients.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = brand_voice_profiles.client_id
    AND clients.user_id = (SELECT auth.uid())
  )
);

-- Brand Voice Examples Table
DROP POLICY IF EXISTS "Users can manage brand voice examples" ON public.brand_voice_examples;
CREATE POLICY "Users can manage brand voice examples"
ON public.brand_voice_examples FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.brand_voice_profiles bvp
    INNER JOIN public.clients c ON c.id = bvp.client_id
    WHERE bvp.id = brand_voice_examples.brand_voice_id
    AND c.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.brand_voice_profiles bvp
    INNER JOIN public.clients c ON c.id = bvp.client_id
    WHERE bvp.id = brand_voice_examples.brand_voice_id
    AND c.user_id = (SELECT auth.uid())
  )
);

-- Content Calendar Table
DROP POLICY IF EXISTS "Users can manage content calendar for own clients" ON public.content_calendar;
CREATE POLICY "Users can manage content calendar for own clients"
ON public.content_calendar FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = content_calendar.client_id
    AND clients.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = content_calendar.client_id
    AND clients.user_id = (SELECT auth.uid())
  )
);

-- Content Templates Table
DROP POLICY IF EXISTS "Users can manage own templates" ON public.content_templates;
CREATE POLICY "Users can manage own templates"
ON public.content_templates FOR ALL
TO authenticated
USING (
  user_id = (SELECT auth.uid()) OR is_public = true
)
WITH CHECK (
  user_id = (SELECT auth.uid())
);

-- Content Briefs Table
DROP POLICY IF EXISTS "Users can manage briefs for own clients" ON public.content_briefs;
CREATE POLICY "Users can manage briefs for own clients"
ON public.content_briefs FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = content_briefs.client_id
    AND clients.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = content_briefs.client_id
    AND clients.user_id = (SELECT auth.uid())
  )
);

-- SEO Keywords Table
DROP POLICY IF EXISTS "Users can manage SEO keywords for own content" ON public.seo_keywords;
CREATE POLICY "Users can manage SEO keywords for own content"
ON public.seo_keywords FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = seo_keywords.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = seo_keywords.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
);

-- Content SEO Scores Table
DROP POLICY IF EXISTS "Users can view SEO scores for own content" ON public.content_seo_scores;
CREATE POLICY "Users can view SEO scores for own content"
ON public.content_seo_scores FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_seo_scores.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "System can insert SEO scores" ON public.content_seo_scores;
CREATE POLICY "System can insert SEO scores"
ON public.content_seo_scores FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_seo_scores.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
);

-- Content Performance Table
DROP POLICY IF EXISTS "Users can view performance for own content" ON public.content_performance;
CREATE POLICY "Users can view performance for own content"
ON public.content_performance FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_performance.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_performance.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
);

-- Content AB Tests Table
DROP POLICY IF EXISTS "Users can manage A/B tests for own content" ON public.content_ab_tests;
CREATE POLICY "Users can manage A/B tests for own content"
ON public.content_ab_tests FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_ab_tests.parent_content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_ab_tests.parent_content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
);

-- Content Approvals Table
DROP POLICY IF EXISTS "Users can view approvals for own content" ON public.content_approvals;
CREATE POLICY "Users can view approvals for own content"
ON public.content_approvals FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_approvals.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  ) OR approver_id = (SELECT auth.uid())
);

DROP POLICY IF EXISTS "Users can create approval requests for own content" ON public.content_approvals;
CREATE POLICY "Users can create approval requests for own content"
ON public.content_approvals FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_approvals.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Approvers can update their approvals" ON public.content_approvals;
CREATE POLICY "Approvers can update their approvals"
ON public.content_approvals FOR UPDATE
TO authenticated
USING (approver_id = (SELECT auth.uid()))
WITH CHECK (approver_id = (SELECT auth.uid()));

-- Content Comments Table
DROP POLICY IF EXISTS "Users can manage comments on accessible content" ON public.content_comments;
CREATE POLICY "Users can manage comments on accessible content"
ON public.content_comments FOR ALL
TO authenticated
USING (
  user_id = (SELECT auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_comments.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  user_id = (SELECT auth.uid())
);

-- Content Assignments Table
DROP POLICY IF EXISTS "Users can view assignments for own content or assigned to them" ON public.content_assignments;
CREATE POLICY "Users can view assignments for own content or assigned to them"
ON public.content_assignments FOR SELECT
TO authenticated
USING (
  assigned_to = (SELECT auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_assignments.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can create assignments for own content" ON public.content_assignments;
CREATE POLICY "Users can create assignments for own content"
ON public.content_assignments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_assignments.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Assignees can update their assignments" ON public.content_assignments;
CREATE POLICY "Assignees can update their assignments"
ON public.content_assignments FOR UPDATE
TO authenticated
USING (assigned_to = (SELECT auth.uid()))
WITH CHECK (assigned_to = (SELECT auth.uid()));

-- Content Assets Table
DROP POLICY IF EXISTS "Users can manage assets for own content" ON public.content_assets;
CREATE POLICY "Users can manage assets for own content"
ON public.content_assets FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_assets.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.generated_content
    WHERE generated_content.id = content_assets.content_id
    AND generated_content.user_id = (SELECT auth.uid())
  )
);

-- Deals Table
DROP POLICY IF EXISTS "Users can view own deals" ON public.deals;
CREATE POLICY "Users can view own deals"
ON public.deals FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own deals" ON public.deals;
CREATE POLICY "Users can insert own deals"
ON public.deals FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own deals" ON public.deals;
CREATE POLICY "Users can update own deals"
ON public.deals FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own deals" ON public.deals;
CREATE POLICY "Users can delete own deals"
ON public.deals FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Deal Touchpoints Table
DROP POLICY IF EXISTS "Users can view own deal touchpoints" ON public.deal_touchpoints;
CREATE POLICY "Users can view own deal touchpoints"
ON public.deal_touchpoints FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id = deal_touchpoints.deal_id
    AND deals.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can insert own deal touchpoints" ON public.deal_touchpoints;
CREATE POLICY "Users can insert own deal touchpoints"
ON public.deal_touchpoints FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id = deal_touchpoints.deal_id
    AND deals.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can update own deal touchpoints" ON public.deal_touchpoints;
CREATE POLICY "Users can update own deal touchpoints"
ON public.deal_touchpoints FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id = deal_touchpoints.deal_id
    AND deals.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id = deal_touchpoints.deal_id
    AND deals.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can delete own deal touchpoints" ON public.deal_touchpoints;
CREATE POLICY "Users can delete own deal touchpoints"
ON public.deal_touchpoints FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id = deal_touchpoints.deal_id
    AND deals.user_id = (SELECT auth.uid())
  )
);

-- Attribution Settings Table
DROP POLICY IF EXISTS "Users can view own attribution settings" ON public.attribution_settings;
CREATE POLICY "Users can view own attribution settings"
ON public.attribution_settings FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own attribution settings" ON public.attribution_settings;
CREATE POLICY "Users can insert own attribution settings"
ON public.attribution_settings FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own attribution settings" ON public.attribution_settings;
CREATE POLICY "Users can update own attribution settings"
ON public.attribution_settings FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own attribution settings" ON public.attribution_settings;
CREATE POLICY "Users can delete own attribution settings"
ON public.attribution_settings FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Deal Stage History Table
DROP POLICY IF EXISTS "Users can view own deal stage history" ON public.deal_stage_history;
CREATE POLICY "Users can view own deal stage history"
ON public.deal_stage_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id = deal_stage_history.deal_id
    AND deals.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can insert own deal stage history" ON public.deal_stage_history;
CREATE POLICY "Users can insert own deal stage history"
ON public.deal_stage_history FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id = deal_stage_history.deal_id
    AND deals.user_id = (SELECT auth.uid())
  )
);

-- Marketing Campaigns Table
DROP POLICY IF EXISTS "Users can view own marketing campaigns" ON public.marketing_campaigns;
CREATE POLICY "Users can view own marketing campaigns"
ON public.marketing_campaigns FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own marketing campaigns" ON public.marketing_campaigns;
CREATE POLICY "Users can insert own marketing campaigns"
ON public.marketing_campaigns FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own marketing campaigns" ON public.marketing_campaigns;
CREATE POLICY "Users can update own marketing campaigns"
ON public.marketing_campaigns FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own marketing campaigns" ON public.marketing_campaigns;
CREATE POLICY "Users can delete own marketing campaigns"
ON public.marketing_campaigns FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Campaign Touchpoints Table
DROP POLICY IF EXISTS "Users can view own campaign touchpoints" ON public.campaign_touchpoints;
CREATE POLICY "Users can view own campaign touchpoints"
ON public.campaign_touchpoints FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.marketing_campaigns
    WHERE marketing_campaigns.id = campaign_touchpoints.campaign_id
    AND marketing_campaigns.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can insert own campaign touchpoints" ON public.campaign_touchpoints;
CREATE POLICY "Users can insert own campaign touchpoints"
ON public.campaign_touchpoints FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.marketing_campaigns
    WHERE marketing_campaigns.id = campaign_touchpoints.campaign_id
    AND marketing_campaigns.user_id = (SELECT auth.uid())
  )
);

-- Revenue Forecasts Table
DROP POLICY IF EXISTS "Users can view own revenue forecasts" ON public.revenue_forecasts;
CREATE POLICY "Users can view own revenue forecasts"
ON public.revenue_forecasts FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own revenue forecasts" ON public.revenue_forecasts;
CREATE POLICY "Users can insert own revenue forecasts"
ON public.revenue_forecasts FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own revenue forecasts" ON public.revenue_forecasts;
CREATE POLICY "Users can update own revenue forecasts"
ON public.revenue_forecasts FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own revenue forecasts" ON public.revenue_forecasts;
CREATE POLICY "Users can delete own revenue forecasts"
ON public.revenue_forecasts FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- PART 3: Secure Function Search Paths
-- =====================================================

-- Fix search path for all functions to prevent security vulnerabilities

ALTER FUNCTION public.track_deal_stage_change()
SET search_path = public, pg_temp;

ALTER FUNCTION public.update_campaign_metrics()
SET search_path = public, pg_temp;

ALTER FUNCTION public.handle_new_user()
SET search_path = public, pg_temp;

ALTER FUNCTION public.create_initial_content_version()
SET search_path = public, pg_temp;

ALTER FUNCTION public.calculate_content_metrics()
SET search_path = public, pg_temp;

ALTER FUNCTION public.sync_calendar_on_publish()
SET search_path = public, pg_temp;

-- =====================================================
-- PART 4: Analyze Tables for Query Planner
-- =====================================================

-- Update statistics for query planner to use new indexes effectively
ANALYZE public.content_ab_tests;
ANALYZE public.content_assets;
ANALYZE public.content_assignments;
ANALYZE public.content_briefs;
ANALYZE public.content_calendar;
ANALYZE public.content_comments;
ANALYZE public.content_versions;
ANALYZE public.profiles;
ANALYZE public.clients;
ANALYZE public.reports;
ANALYZE public.playbooks;
ANALYZE public.deals;
ANALYZE public.deal_touchpoints;
ANALYZE public.attribution_settings;
ANALYZE public.marketing_campaigns;
ANALYZE public.revenue_forecasts;
