-- Proper Supabase Storage setup for resume uploads
-- Following Supabase best practices for file uploads

-- Drop existing bucket if it exists (for clean setup)
DELETE FROM storage.buckets WHERE id = 'resumes';

-- Create storage bucket with proper configuration
INSERT INTO storage.buckets (
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at,
  updated_at
) VALUES (
  'resumes',
  'resumes', 
  true, 
  5242880, -- 5MB limit
  ARRAY[
    'application/pdf',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ],
  now(),
  now()
);

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload resume" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view resume" ON storage.objects;

-- Policy 1: Allow anyone to upload resumes (anonymous users can upload)
CREATE POLICY "Anyone can upload resume" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'resumes');

-- Policy 2: Allow anyone to view/download resumes (public access)
CREATE POLICY "Anyone can view resume" ON storage.objects
FOR SELECT 
USING (bucket_id = 'resumes');

-- Policy 3: Allow deletion (for cleanup/admin purposes)
CREATE POLICY "Allow resume deletion" ON storage.objects
FOR DELETE 
USING (bucket_id = 'resumes');

-- Policy 4: Allow updates (for overwriting files)
CREATE POLICY "Allow resume updates" ON storage.objects
FOR UPDATE 
USING (bucket_id = 'resumes');

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;