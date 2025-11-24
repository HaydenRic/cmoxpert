/*
  # Fix Videos Table Multiple Permissive Policies
  
  The videos table has overlapping SELECT policies that can conflict.
  Consolidating into separate, non-overlapping policies.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view active videos" ON public.videos;
DROP POLICY IF EXISTS "Uploaders can manage their videos" ON public.videos;

-- Create non-overlapping policies
-- Policy 1: View active videos (SELECT only)
CREATE POLICY "Users can view active videos"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (status = 'active' OR uploaded_by = (select auth.uid()));

-- Policy 2: Uploaders can insert their own videos
CREATE POLICY "Uploaders can insert their videos"
  ON public.videos
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = (select auth.uid()));

-- Policy 3: Uploaders can update their own videos
CREATE POLICY "Uploaders can update their videos"
  ON public.videos
  FOR UPDATE
  TO authenticated
  USING (uploaded_by = (select auth.uid()))
  WITH CHECK (uploaded_by = (select auth.uid()));

-- Policy 4: Uploaders can delete their own videos
CREATE POLICY "Uploaders can delete their videos"
  ON public.videos
  FOR DELETE
  TO authenticated
  USING (uploaded_by = (select auth.uid()));