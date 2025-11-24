/*
  # Add Missing Foreign Key Indexes - Part 2A
  
  Content-related indexes
*/

-- Content Briefs & Calendar
CREATE INDEX IF NOT EXISTS idx_content_briefs_calendar_id ON public.content_briefs(calendar_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_client_id ON public.content_briefs(client_id);
CREATE INDEX IF NOT EXISTS idx_content_briefs_created_by ON public.content_briefs(created_by);
CREATE INDEX IF NOT EXISTS idx_content_calendar_assigned_to ON public.content_calendar(assigned_to);
CREATE INDEX IF NOT EXISTS idx_content_calendar_client_id ON public.content_calendar(client_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_content_id ON public.content_calendar(content_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_created_by ON public.content_calendar(created_by);

-- Content Comments & SEO
CREATE INDEX IF NOT EXISTS idx_content_comments_content_id ON public.content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_parent_comment_id ON public.content_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_user_id ON public.content_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_content_seo_scores_content_id ON public.content_seo_scores(content_id);

-- Content Templates & Versions
CREATE INDEX IF NOT EXISTS idx_content_templates_client_id ON public.content_templates(client_id);
CREATE INDEX IF NOT EXISTS idx_content_templates_user_id ON public.content_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_by ON public.content_versions(created_by);

-- Generated Content
CREATE INDEX IF NOT EXISTS idx_generated_content_brand_voice_id ON public.generated_content(brand_voice_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_client_id ON public.generated_content(client_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_parent_content_id ON public.generated_content(parent_content_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_user_id ON public.generated_content(user_id);