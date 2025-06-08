/*
  # Create branding storage bucket

  1. Storage
    - Create 'branding' bucket for logo and favicon uploads
    - Set up public access policies
    - Configure file type restrictions

  2. Security
    - Only admins can upload to branding bucket
    - Public read access for serving assets
    - File type validation (images only)
*/

-- Create the branding storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
);

-- Allow admins to upload branding assets
CREATE POLICY "Admins can upload branding assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'branding' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to update branding assets
CREATE POLICY "Admins can update branding assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'branding' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to delete branding assets
CREATE POLICY "Admins can delete branding assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'branding' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow public read access to branding assets
CREATE POLICY "Public can view branding assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'branding');