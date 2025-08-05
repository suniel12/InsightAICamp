-- Manual script to set up Supabase Storage for resumes
-- Run this in your Supabase SQL Editor if migrations don't work

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'resumes';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes', 
  true,
  5242880, -- 5MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 
    'application/rtf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Create storage policies for resume uploads
CREATE POLICY IF NOT EXISTS "Anyone can upload resumes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resumes');

CREATE POLICY IF NOT EXISTS "Anyone can view resumes" ON storage.objects  
FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY IF NOT EXISTS "Allow resume updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'resumes');

CREATE POLICY IF NOT EXISTS "Allow resume deletion" ON storage.objects
FOR DELETE USING (bucket_id = 'resumes');

-- Verify setup
SELECT 
  'Bucket exists' as check_type,
  CASE WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'resumes') 
    THEN 'SUCCESS' 
    ELSE 'FAILED' 
  END as status
UNION ALL
SELECT 
  'Policies exist' as check_type,
  CASE WHEN (
    SELECT COUNT(*) FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname LIKE '%resume%'
  ) >= 4 
    THEN 'SUCCESS' 
    ELSE 'FAILED' 
  END as status;