-- PRIVATE RESUME STORAGE SETUP
-- This ensures resumes are secure and only accessible by authorized users

-- 1. Update bucket to be private (if you accidentally made it public)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'resumes';

-- 2. Remove any existing public policies
DROP POLICY IF EXISTS "Allow resume uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow resume downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow resume updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow resume deletion" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view resumes" ON storage.objects;

-- 3. Create PRIVATE storage policies

-- Policy 1: Allow anonymous users to upload resumes (but not read them)
CREATE POLICY "Anonymous can upload resumes" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'resumes');

-- Policy 2: Only admins can view all resumes
CREATE POLICY "Admins can view all resumes" ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'resumes' 
  AND (
    auth.jwt() ->> 'user_role' = 'admin'
    OR auth.jwt() ->> 'role' = 'admin'
  )
);

-- Policy 3: Authenticated users can only view their own resumes
CREATE POLICY "Users can view own resumes" ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Only admins can delete resumes (for cleanup)
CREATE POLICY "Admins can delete resumes" ON storage.objects
FOR DELETE 
USING (
  bucket_id = 'resumes' 
  AND (
    auth.jwt() ->> 'user_role' = 'admin'
    OR auth.jwt() ->> 'role' = 'admin'
  )
);

-- 5. Verify the setup
SELECT 
  'Bucket Configuration' as check_type,
  id,
  name,
  public as is_public,
  file_size_limit,
  CASE WHEN public = false THEN 'SECURE ✓' ELSE 'PUBLIC ⚠️' END as security_status
FROM storage.buckets 
WHERE id = 'resumes';

-- 6. Check policies
SELECT 
  'Security Policies' as check_type,
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname LIKE '%admin%' THEN 'ADMIN ACCESS ✓'
    WHEN policyname LIKE '%upload%' THEN 'UPLOAD ALLOWED ✓'
    ELSE 'OTHER'
  END as access_level
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE '%resume%';