/*
  # Enhance Client Search Functionality

  ## Summary
  This migration enhances the searchability of clients in the application by adding
  full-text search capabilities and improving query performance.

  ## Changes Made

  1. **Full-Text Search Column**
     - Add a generated `search_vector` column to the clients table
     - Automatically combines name, domain, and industry for efficient searching
     - Uses PostgreSQL's tsvector type for advanced text search

  2. **Search Indexes**
     - Add GIN index on search_vector for fast full-text queries
     - Add B-tree indexes on individual columns for traditional filtering
     - Optimize case-insensitive searches

  3. **Search Helper Function**
     - Create a function to search clients with relevance ranking
     - Support partial and fuzzy matching
     - Return results ordered by relevance

  ## Performance Impact
  - Dramatically improves search performance for large client datasets
  - Enables instant search as you type
  - Supports multi-word queries and partial matches
*/

-- Add full-text search vector column to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE clients
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
      to_tsvector('english',
        coalesce(name, '') || ' ' ||
        coalesce(domain, '') || ' ' ||
        coalesce(industry, '')
      )
    ) STORED;
  END IF;
END $$;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_clients_search_vector
ON clients USING GIN (search_vector);

-- Create indexes for individual column searches (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_clients_name_lower
ON clients (LOWER(name));

CREATE INDEX IF NOT EXISTS idx_clients_domain_lower
ON clients (LOWER(domain));

CREATE INDEX IF NOT EXISTS idx_clients_industry_lower
ON clients (LOWER(industry));

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_clients_status
ON clients (status);

-- Create composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_clients_user_status
ON clients (user_id, status);

-- Create a function to search clients with relevance ranking
CREATE OR REPLACE FUNCTION search_clients(
  search_query text,
  user_uuid uuid
)
RETURNS TABLE (
  id uuid,
  name text,
  domain text,
  industry text,
  status text,
  user_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  relevance real
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.domain,
    c.industry,
    c.status,
    c.user_id,
    c.created_at,
    c.updated_at,
    ts_rank(c.search_vector, websearch_to_tsquery('english', search_query)) as relevance
  FROM clients c
  WHERE
    c.user_id = user_uuid
    AND (
      -- Full-text search
      c.search_vector @@ websearch_to_tsquery('english', search_query)
      OR
      -- Fallback to ILIKE for partial matches
      c.name ILIKE '%' || search_query || '%'
      OR
      c.domain ILIKE '%' || search_query || '%'
      OR
      c.industry ILIKE '%' || search_query || '%'
    )
  ORDER BY relevance DESC, c.name ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_clients(text, uuid) TO authenticated;

-- Update existing clients to populate the search_vector
-- (The GENERATED ALWAYS AS ensures new/updated rows are automatically indexed)
UPDATE clients SET updated_at = updated_at WHERE search_vector IS NULL;

-- Add helpful comment
COMMENT ON COLUMN clients.search_vector IS 'Full-text search vector combining name, domain, and industry for efficient searching';
COMMENT ON FUNCTION search_clients IS 'Search clients with relevance ranking. Returns clients matching the search query for the specified user.';
