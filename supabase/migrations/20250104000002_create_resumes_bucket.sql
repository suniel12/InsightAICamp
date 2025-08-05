-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes', 
  'resumes', 
  true, 
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf']
);

-- Create storage policy to allow public uploads
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'resumes'
);

-- Create storage policy to allow public access to resume files
CREATE POLICY "Allow public access" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes'
);

-- Create storage policy to allow users to delete their own files (optional)
CREATE POLICY "Allow users to delete own files" ON storage.objects FOR DELETE USING (
  bucket_id = 'resumes'
);