/*
  # Drop Unused Indexes - Part 3: Content Management Tables
  
  Removes indexes from content-related tables that are not being queried frequently.
  The content hub functionality works well with the primary key indexes.
  These secondary indexes can be re-added if specific query patterns emerge.
  
  Tables affected:
  - brand_voice_examples
  - brand_voice_profiles
  - content_ab_tests
  - content_approvals
  - content_assets
  - content_assignments
  - content_briefs
  - content_calendar
  - content_comments
  - content_seo_scores
  - content_templates
  - content_versions
  - seo_keywords
  
  Security Impact: Reduces database overhead, improves write performance
*/

-- Drop indexes from brand_voice tables
DROP INDEX IF EXISTS idx_brand_voice_examples_brand_voice_id;
DROP INDEX IF EXISTS idx_brand_voice_profiles_client_id;

-- Drop indexes from content A/B testing
DROP INDEX IF EXISTS idx_content_ab_tests_parent_content_id;
DROP INDEX IF EXISTS idx_content_ab_tests_variation_content_id;

-- Drop indexes from content approvals
DROP INDEX IF EXISTS idx_content_approvals_approver_id;
DROP INDEX IF EXISTS idx_content_approvals_content_id;

-- Drop indexes from content assets
DROP INDEX IF EXISTS idx_content_assets_content_id;
DROP INDEX IF EXISTS idx_content_assets_uploaded_by;

-- Drop indexes from content assignments
DROP INDEX IF EXISTS idx_content_assignments_assigned_by;
DROP INDEX IF EXISTS idx_content_assignments_assigned_to;
DROP INDEX IF EXISTS idx_content_assignments_content_id;

-- Drop indexes from content briefs
DROP INDEX IF EXISTS idx_content_briefs_calendar_id;
DROP INDEX IF EXISTS idx_content_briefs_client_id;
DROP INDEX IF EXISTS idx_content_briefs_created_by;

-- Drop indexes from content calendar
DROP INDEX IF EXISTS idx_content_calendar_assigned_to;
DROP INDEX IF EXISTS idx_content_calendar_client_id;
DROP INDEX IF EXISTS idx_content_calendar_content_id;
DROP INDEX IF EXISTS idx_content_calendar_created_by;

-- Drop indexes from content comments
DROP INDEX IF EXISTS idx_content_comments_content_id;
DROP INDEX IF EXISTS idx_content_comments_parent_comment_id;
DROP INDEX IF EXISTS idx_content_comments_user_id;

-- Drop indexes from content SEO scores
DROP INDEX IF EXISTS idx_content_seo_scores_content_id;

-- Drop indexes from content templates
DROP INDEX IF EXISTS idx_content_templates_client_id;
DROP INDEX IF EXISTS idx_content_templates_user_id;

-- Drop indexes from content versions
DROP INDEX IF EXISTS idx_content_versions_created_by;

-- Drop indexes from SEO keywords
DROP INDEX IF EXISTS idx_seo_keywords_content_id;