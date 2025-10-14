# Database Schema Documentation - Content Hub v2

## Overview

Content Hub v2 introduces 14 new tables to support enterprise content marketing operations. All tables include Row Level Security (RLS) policies, automatic timestamps, and proper indexing for performance.

**Database:** PostgreSQL (Supabase)
**Migration Status:** ✅ All migrations applied successfully

---

## Table Overview

| Table Name | Purpose | Relationships |
|------------|---------|---------------|
| `brand_voice_profiles` | Store brand voice definitions | → clients |
| `brand_voice_examples` | Reference examples for AI | → brand_voice_profiles |
| `content_versions` | Track content revision history | → generated_content |
| `content_calendar` | Schedule and manage content | → generated_content, clients |
| `seo_keywords` | Manage SEO keyword targets | → clients |
| `content_seo_scores` | Track SEO performance | → generated_content |
| `content_performance` | Analytics and metrics | → generated_content |
| `content_ab_tests` | A/B testing framework | → generated_content |
| `content_approvals` | Approval workflow tracking | → generated_content |
| `content_comments` | Discussion threads | → generated_content |
| `content_assignments` | Task management | → generated_content |
| `content_templates` | Reusable content structures | → clients |
| `content_briefs` | Detailed content specs | → clients |
| `content_assets` | File attachments | → generated_content |

---

## Detailed Schema

### 1. brand_voice_profiles

Defines brand voice guidelines for consistent content generation.

```sql
CREATE TABLE brand_voice_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  tone_attributes jsonb DEFAULT '{}',
  sample_phrases text[] DEFAULT '{}',
  do_list text[] DEFAULT '{}',
  dont_list text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Fields:**
- `tone_attributes` - JSON object with attributes (e.g., `{"formal": 7, "friendly": 8}`)
- `sample_phrases` - Array of example phrases in brand voice
- `do_list` - Guidelines for what to include
- `dont_list` - Guidelines for what to avoid

**Indexes:**
- `idx_brand_voice_client` on `client_id`
- `idx_brand_voice_active` on `is_active`

**RLS Policy:**
```sql
CREATE POLICY "Users can view brand voices for their clients"
  ON brand_voice_profiles FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );
```

---

### 2. brand_voice_examples

Store example content demonstrating brand voice for AI training.

```sql
CREATE TABLE brand_voice_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_voice_id uuid REFERENCES brand_voice_profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  example_text text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `content_type` - Type of example (blog_post, social_media, email, etc.)
- `example_text` - Sample content in brand voice
- `notes` - Context about why this is a good example

**Indexes:**
- `idx_brand_examples_voice` on `brand_voice_id`
- `idx_brand_examples_type` on `content_type`

**RLS Policy:**
```sql
CREATE POLICY "Users can view examples for their brand voices"
  ON brand_voice_examples FOR SELECT
  TO authenticated
  USING (
    brand_voice_id IN (
      SELECT id FROM brand_voice_profiles
      WHERE client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
      )
    )
  );
```

---

### 3. content_versions

Complete revision history with rollback capability.

```sql
CREATE TABLE content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES generated_content(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  change_summary text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_id, version_number)
);
```

**Fields:**
- `version_number` - Incremental version (1, 2, 3...)
- `changed_by` - User who made the change
- `change_summary` - Description of what changed

**Indexes:**
- `idx_content_versions_content` on `content_id`
- `idx_content_versions_number` on `version_number`

**RLS Policy:**
```sql
CREATE POLICY "Users can view versions of their content"
  ON content_versions FOR SELECT
  TO authenticated
  USING (
    content_id IN (
      SELECT id FROM generated_content WHERE user_id = auth.uid()
    )
  );
```

---

### 4. content_calendar

Schedule content lifecycle from draft to published.

```sql
CREATE TABLE content_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES generated_content(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_date timestamptz NOT NULL,
  publish_date timestamptz,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  platform text,
  campaign_name text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Fields:**
- `scheduled_date` - When content should be published
- `publish_date` - Actual publication timestamp
- `status` - Current workflow state
- `platform` - Target channel (blog, social, email, etc.)
- `campaign_name` - Associated marketing campaign

**Indexes:**
- `idx_calendar_content` on `content_id`
- `idx_calendar_client` on `client_id`
- `idx_calendar_date` on `scheduled_date`
- `idx_calendar_status` on `status`

**RLS Policy:**
```sql
CREATE POLICY "Users can manage calendar for their clients"
  ON content_calendar FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );
```

---

### 5. seo_keywords

Manage target keywords and search volume data.

```sql
CREATE TABLE seo_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  search_volume integer DEFAULT 0,
  difficulty integer CHECK (difficulty >= 0 AND difficulty <= 100),
  current_rank integer,
  target_rank integer,
  category text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Fields:**
- `search_volume` - Monthly search volume
- `difficulty` - SEO difficulty score (0-100)
- `current_rank` - Current search engine ranking
- `target_rank` - Desired ranking position
- `is_primary` - Primary keyword for client

**Indexes:**
- `idx_keywords_client` on `client_id`
- `idx_keywords_primary` on `is_primary`
- `idx_keywords_keyword` on `keyword`

**RLS Policy:**
```sql
CREATE POLICY "Users can manage keywords for their clients"
  ON seo_keywords FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );
```

---

### 6. content_seo_scores

Historical SEO performance tracking.

```sql
CREATE TABLE content_seo_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES generated_content(id) ON DELETE CASCADE,
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  readability_score numeric(5,2),
  keyword_density numeric(5,2),
  meta_score integer,
  recommendations jsonb DEFAULT '[]',
  measured_at timestamptz DEFAULT now()
);
```

**Fields:**
- `overall_score` - Combined SEO score (0-100)
- `readability_score` - Flesch reading ease
- `keyword_density` - Percentage of target keywords
- `meta_score` - Meta tag quality score
- `recommendations` - JSON array of improvement suggestions

**Indexes:**
- `idx_seo_scores_content` on `content_id`
- `idx_seo_scores_measured` on `measured_at`

**RLS Policy:**
```sql
CREATE POLICY "Users can view SEO scores for their content"
  ON content_seo_scores FOR SELECT
  TO authenticated
  USING (
    content_id IN (
      SELECT id FROM generated_content WHERE user_id = auth.uid()
    )
  );
```

---

### 7. content_performance

Multi-channel analytics and metrics.

```sql
CREATE TABLE content_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES generated_content(id) ON DELETE CASCADE,
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  engagement_rate numeric(5,2),
  conversions integer DEFAULT 0,
  revenue_generated numeric(10,2),
  social_shares integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  avg_time_on_page integer,
  bounce_rate numeric(5,2),
  measured_date date DEFAULT CURRENT_DATE,
  platform text,
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `views` - Page/content views
- `clicks` - Click-through count
- `engagement_rate` - Percentage engaged
- `conversions` - Conversion actions
- `revenue_generated` - Direct revenue attribution
- `avg_time_on_page` - Average time in seconds
- `bounce_rate` - Percentage who left immediately

**Indexes:**
- `idx_performance_content` on `content_id`
- `idx_performance_date` on `measured_date`
- `idx_performance_platform` on `platform`

**RLS Policy:**
```sql
CREATE POLICY "Users can view performance for their content"
  ON content_performance FOR SELECT
  TO authenticated
  USING (
    content_id IN (
      SELECT id FROM generated_content WHERE user_id = auth.uid()
    )
  );
```

---

### 8. content_ab_tests

A/B testing framework for content optimization.

```sql
CREATE TABLE content_ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_a_id uuid REFERENCES generated_content(id) ON DELETE CASCADE,
  content_b_id uuid REFERENCES generated_content(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  hypothesis text,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  status text DEFAULT 'running'
    CHECK (status IN ('running', 'completed', 'cancelled')),
  winner_id uuid,
  confidence_level numeric(5,2),
  metrics jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `content_a_id` - First variant (control)
- `content_b_id` - Second variant (test)
- `hypothesis` - What you're testing
- `winner_id` - Winning content ID (if determined)
- `confidence_level` - Statistical confidence (0-100)
- `metrics` - JSON object with performance data

**Indexes:**
- `idx_ab_tests_content_a` on `content_a_id`
- `idx_ab_tests_content_b` on `content_b_id`
- `idx_ab_tests_status` on `status`

**RLS Policy:**
```sql
CREATE POLICY "Users can manage A/B tests for their content"
  ON content_ab_tests FOR ALL
  TO authenticated
  USING (
    content_a_id IN (
      SELECT id FROM generated_content WHERE user_id = auth.uid()
    )
  );
```

---

### 9. content_approvals

Multi-stage approval workflow with audit trail.

```sql
CREATE TABLE content_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES generated_content(id) ON DELETE CASCADE,
  approver_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
  comments text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `approver_id` - User responsible for approval
- `status` - Approval state
- `comments` - Feedback from approver
- `approved_at` - When approved/rejected

**Indexes:**
- `idx_approvals_content` on `content_id`
- `idx_approvals_approver` on `approver_id`
- `idx_approvals_status` on `status`

**RLS Policy:**
```sql
CREATE POLICY "Users can manage approvals for their content"
  ON content_approvals FOR ALL
  TO authenticated
  USING (
    content_id IN (
      SELECT id FROM generated_content WHERE user_id = auth.uid()
    )
    OR approver_id = auth.uid()
  );
```

---

### 10. content_comments

Threaded discussion on content pieces.

```sql
CREATE TABLE content_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES generated_content(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  parent_comment_id uuid REFERENCES content_comments(id),
  comment_text text NOT NULL,
  is_resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Fields:**
- `parent_comment_id` - For threaded replies
- `is_resolved` - Mark as addressed
- `comment_text` - The comment content

**Indexes:**
- `idx_comments_content` on `content_id`
- `idx_comments_parent` on `parent_comment_id`
- `idx_comments_user` on `user_id`

**RLS Policy:**
```sql
CREATE POLICY "Users can view comments on their content"
  ON content_comments FOR SELECT
  TO authenticated
  USING (
    content_id IN (
      SELECT id FROM generated_content WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );
```

---

### 11. content_assignments

Task management for content creation.

```sql
CREATE TABLE content_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES generated_content(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id),
  assigned_by uuid REFERENCES auth.users(id),
  role text CHECK (role IN ('creator', 'reviewer', 'approver', 'publisher')),
  status text DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date timestamptz,
  notes text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `assigned_to` - User responsible
- `assigned_by` - User who assigned
- `role` - Task type
- `due_date` - Deadline
- `completed_at` - When finished

**Indexes:**
- `idx_assignments_content` on `content_id`
- `idx_assignments_user` on `assigned_to`
- `idx_assignments_status` on `status`

**RLS Policy:**
```sql
CREATE POLICY "Users can view their assignments"
  ON content_assignments FOR SELECT
  TO authenticated
  USING (
    assigned_to = auth.uid()
    OR assigned_by = auth.uid()
    OR content_id IN (
      SELECT id FROM generated_content WHERE user_id = auth.uid()
    )
  );
```

---

### 12. content_templates

Reusable content structures for consistency.

```sql
CREATE TABLE content_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  content_type text NOT NULL,
  template_content text NOT NULL,
  variables jsonb DEFAULT '[]',
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Fields:**
- `template_content` - Template with placeholders
- `variables` - JSON array of variable definitions
- `category` - Template grouping

**Example Variables:**
```json
[
  {"name": "company_name", "type": "string", "required": true},
  {"name": "product_features", "type": "array", "required": false}
]
```

**Indexes:**
- `idx_templates_client` on `client_id`
- `idx_templates_type` on `content_type`
- `idx_templates_active` on `is_active`

**RLS Policy:**
```sql
CREATE POLICY "Users can manage templates for their clients"
  ON content_templates FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );
```

---

### 13. content_briefs

Detailed specifications for content projects.

```sql
CREATE TABLE content_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  objective text NOT NULL,
  target_audience jsonb DEFAULT '{}',
  key_messages text[] DEFAULT '{}',
  required_keywords text[] DEFAULT '{}',
  word_count_target integer,
  tone text,
  references jsonb DEFAULT '[]',
  status text DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'in_progress', 'completed')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Fields:**
- `objective` - Content goal
- `target_audience` - JSON with demographics, psychographics
- `key_messages` - Main points to communicate
- `references` - JSON array of source materials

**Example Target Audience:**
```json
{
  "demographics": {
    "age_range": "30-50",
    "income": "$75k-150k",
    "location": "Urban USA"
  },
  "psychographics": {
    "values": ["efficiency", "innovation"],
    "pain_points": ["time management", "ROI tracking"]
  }
}
```

**Indexes:**
- `idx_briefs_client` on `client_id`
- `idx_briefs_status` on `status`
- `idx_briefs_created` on `created_by`

**RLS Policy:**
```sql
CREATE POLICY "Users can manage briefs for their clients"
  ON content_briefs FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );
```

---

### 14. content_assets

File attachments and media management.

```sql
CREATE TABLE content_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES generated_content(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  storage_path text NOT NULL,
  alt_text text,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

**Fields:**
- `storage_path` - Supabase Storage path
- `file_type` - MIME type
- `file_size` - Bytes
- `alt_text` - Accessibility description
- `display_order` - Sort order in galleries

**Indexes:**
- `idx_assets_content` on `content_id`
- `idx_assets_type` on `file_type`
- `idx_assets_order` on `display_order`

**RLS Policy:**
```sql
CREATE POLICY "Users can manage assets for their content"
  ON content_assets FOR ALL
  TO authenticated
  USING (
    content_id IN (
      SELECT id FROM generated_content WHERE user_id = auth.uid()
    )
  );
```

---

## Enhanced Existing Tables

### generated_content (Enhanced)

Added 16 new fields to the existing table:

```sql
ALTER TABLE generated_content ADD COLUMN IF NOT EXISTS
  brand_voice_id uuid REFERENCES brand_voice_profiles(id),
  version integer DEFAULT 1,
  keywords text[] DEFAULT '{}',
  meta_description text,
  seo_score integer CHECK (seo_score >= 0 AND seo_score <= 100),
  word_count integer,
  reading_time integer,
  estimated_cost numeric(10,4),
  performance_score numeric(5,2),
  last_edited_by uuid REFERENCES auth.users(id),
  last_edited_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  view_count integer DEFAULT 0,
  engagement_score numeric(5,2),
  is_template boolean DEFAULT false;
```

**New Fields:**
- `brand_voice_id` - Associated brand voice
- `version` - Current version number
- `keywords` - SEO target keywords
- `meta_description` - SEO meta description
- `seo_score` - Overall SEO score (0-100)
- `word_count` - Total words
- `reading_time` - Estimated minutes
- `estimated_cost` - AI generation cost
- `performance_score` - Overall effectiveness
- `last_edited_by` - Last editor
- `last_edited_at` - Last edit timestamp
- `published_at` - Publication date
- `archived_at` - Archive date
- `view_count` - Total views
- `engagement_score` - Engagement metric
- `is_template` - Template flag

---

## Triggers & Automation

### Auto-Update Timestamps

All tables with `updated_at` columns have triggers:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brand_voice_profiles_updated_at
  BEFORE UPDATE ON brand_voice_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Auto-Increment Version Numbers

When creating content versions:

```sql
CREATE OR REPLACE FUNCTION set_version_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version_number = COALESCE(
    (SELECT MAX(version_number) FROM content_versions
     WHERE content_id = NEW.content_id), 0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_version_number
  BEFORE INSERT ON content_versions
  FOR EACH ROW
  EXECUTE FUNCTION set_version_number();
```

---

## Indexes Summary

### Performance Indexes

High-priority indexes for query optimization:

1. **Foreign Key Indexes** - All FK columns indexed
2. **Status Columns** - For workflow filtering
3. **Date Columns** - For time-based queries
4. **User ID Columns** - For RLS policy enforcement
5. **Composite Indexes** - For common query patterns

### Full-Text Search

GIN indexes for text search:

```sql
CREATE INDEX idx_content_fulltext
  ON generated_content
  USING GIN (to_tsvector('english', title || ' ' || content));

CREATE INDEX idx_templates_fulltext
  ON content_templates
  USING GIN (to_tsvector('english', name || ' ' || template_content));
```

---

## Data Relationships

### Entity Relationship Diagram (ERD)

```
clients
  ├─→ brand_voice_profiles
  │     └─→ brand_voice_examples
  ├─→ seo_keywords
  ├─→ content_templates
  ├─→ content_briefs
  └─→ generated_content
        ├─→ content_versions
        ├─→ content_calendar
        ├─→ content_seo_scores
        ├─→ content_performance
        ├─→ content_ab_tests
        ├─→ content_approvals
        ├─→ content_comments
        ├─→ content_assignments
        └─→ content_assets
```

### Cascade Behaviors

**ON DELETE CASCADE:**
- Deleting a client removes all related data
- Deleting content removes versions, comments, etc.
- Maintains referential integrity

**ON DELETE SET NULL:**
- Deleting a user preserves content (sets creator to NULL)

---

## Row Level Security (RLS)

### Security Principles

1. **Authentication Required** - All policies require `authenticated` role
2. **Ownership Verification** - Check `user_id = auth.uid()`
3. **Client Association** - Verify client ownership
4. **Least Privilege** - Only necessary access granted

### Policy Patterns

**Direct Ownership:**
```sql
USING (user_id = auth.uid())
```

**Client-Based:**
```sql
USING (
  client_id IN (
    SELECT id FROM clients WHERE user_id = auth.uid()
  )
)
```

**Content-Based:**
```sql
USING (
  content_id IN (
    SELECT id FROM generated_content WHERE user_id = auth.uid()
  )
)
```

---

## Query Examples

### Get Brand Voice with Examples

```sql
SELECT
  bv.*,
  json_agg(
    json_build_object(
      'content_type', bve.content_type,
      'example_text', bve.example_text
    )
  ) as examples
FROM brand_voice_profiles bv
LEFT JOIN brand_voice_examples bve ON bve.brand_voice_id = bv.id
WHERE bv.client_id = $1
GROUP BY bv.id;
```

### Get Content with Performance

```sql
SELECT
  gc.*,
  cp.views,
  cp.conversions,
  cp.revenue_generated,
  cs.overall_score as seo_score
FROM generated_content gc
LEFT JOIN content_performance cp ON cp.content_id = gc.id
LEFT JOIN content_seo_scores cs ON cs.content_id = gc.id
WHERE gc.user_id = auth.uid()
ORDER BY gc.created_at DESC;
```

### Get Content Calendar for Month

```sql
SELECT
  cc.*,
  gc.title,
  gc.content_type,
  c.company_name
FROM content_calendar cc
JOIN generated_content gc ON gc.id = cc.content_id
JOIN clients c ON c.id = cc.client_id
WHERE
  cc.scheduled_date >= date_trunc('month', CURRENT_DATE)
  AND cc.scheduled_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
  AND c.user_id = auth.uid()
ORDER BY cc.scheduled_date ASC;
```

---

## Migration History

### Applied Migrations

1. `20250703120000_feature_enhancements.sql` - All Content Hub v2 tables
   - 14 new tables
   - Enhanced `generated_content` with 16 fields
   - RLS policies for all tables
   - Indexes and triggers
   - Check constraints

**Status:** ✅ Successfully applied to production database

---

## Backup & Maintenance

### Backup Strategy

1. **Automatic Backups** - Supabase handles automated backups
2. **Point-in-Time Recovery** - Available for 7 days
3. **Manual Backups** - Before major changes

### Maintenance Tasks

**Weekly:**
- Vacuum analyze tables
- Check index usage
- Review slow queries

**Monthly:**
- Archive old content_versions
- Clean up test data
- Update statistics

---

## Performance Considerations

### Query Optimization

1. Use indexes for WHERE clauses
2. Limit result sets with pagination
3. Use partial indexes for filtered queries
4. Avoid SELECT * in production

### Scaling Considerations

- Content versions can grow large (consider archiving)
- Performance metrics generate time-series data (partition by date)
- Comments can be high-volume (consider pagination)

---

## Security Best Practices

### Data Protection

1. ✅ RLS enabled on all tables
2. ✅ Restrictive policies by default
3. ✅ Authentication required
4. ✅ Ownership verification
5. ✅ Foreign key constraints

### Audit Trail

- `created_at` on all tables
- `updated_at` where applicable
- `changed_by` in version history
- Approval workflow tracking

---

## Conclusion

The Content Hub v2 database schema provides enterprise-grade content management with:

- **Comprehensive Coverage** - 14 specialized tables
- **Strong Security** - RLS on every table
- **Performance** - Strategic indexing
- **Flexibility** - JSONB for extensibility
- **Integrity** - Foreign key constraints
- **Audit Trail** - Complete history tracking

The schema supports the full content lifecycle from planning through performance analysis, with robust collaboration tools and data-driven optimization capabilities.
