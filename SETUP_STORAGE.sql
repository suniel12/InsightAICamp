-- MANUAL SETUP: Copy and paste this into your Supabase SQL Editor
-- This will create the resumes storage bucket and policies

-- 1. Create the storage bucket
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
) ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies
CREATE POLICY IF NOT EXISTS "Allow resume uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resumes');

CREATE POLICY IF NOT EXISTS "Allow resume downloads" ON storage.objects  
FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY IF NOT EXISTS "Allow resume updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'resumes');

CREATE POLICY IF NOT EXISTS "Allow resume deletion" ON storage.objects
FOR DELETE USING (bucket_id = 'resumes');

-- 3. Verify the setup worked
SELECT 
  'Bucket Created' as status,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE id = 'resumes';

-- 4. Check policies
SELECT 
  'Policies Created' as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE '%resume%';