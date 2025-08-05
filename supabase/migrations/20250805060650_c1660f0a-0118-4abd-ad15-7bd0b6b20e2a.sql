-- Drop the problematic admin policy for applications
DROP POLICY IF EXISTS "Admins can access all applications" ON applications;

-- Create separate policies for different operations to avoid conflicts with anonymous inserts
CREATE POLICY "Admins can select all applications" 
ON applications 
FOR SELECT 
USING (public.is_admin_user());

CREATE POLICY "Admins can update all applications" 
ON applications 
FOR UPDATE 
USING (public.is_admin_user());

CREATE POLICY "Admins can delete all applications" 
ON applications 
FOR DELETE 
USING (public.is_admin_user());

-- Update the insert policy to allow anonymous applications
DROP POLICY IF EXISTS "Users can insert their own application" ON applications;
CREATE POLICY "Users and anonymous can insert applications" 
ON applications 
FOR INSERT 
WITH CHECK (
  -- Allow if user_id is null (anonymous) OR if authenticated user matches user_id
  (user_id IS NULL) OR (auth.uid() = user_id)
);