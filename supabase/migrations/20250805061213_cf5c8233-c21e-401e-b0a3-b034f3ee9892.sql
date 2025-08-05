-- Drop all existing policies on applications table
DROP POLICY IF EXISTS "Admins can select all applications" ON applications;
DROP POLICY IF EXISTS "Admins can update all applications" ON applications; 
DROP POLICY IF EXISTS "Admins can delete all applications" ON applications;
DROP POLICY IF EXISTS "Users and anonymous can insert applications" ON applications;
DROP POLICY IF EXISTS "Users can update their own application" ON applications;
DROP POLICY IF EXISTS "Users can view their own application" ON applications;

-- Create simple policies that don't reference admin functions for INSERT operations
CREATE POLICY "Allow anonymous application submissions" 
ON applications 
FOR INSERT 
WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow authenticated user applications" 
ON applications 
FOR INSERT 
WITH CHECK (user_id IS NOT NULL AND auth.uid() = user_id);

-- For SELECT operations - separate policies for different user types
CREATE POLICY "Users can view their own applications" 
ON applications 
FOR SELECT 
USING (user_id IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Allow viewing anonymous applications by ID" 
ON applications 
FOR SELECT 
USING (user_id IS NULL);

-- For UPDATE operations
CREATE POLICY "Users can update their own applications" 
ON applications 
FOR UPDATE 
USING (user_id IS NOT NULL AND auth.uid() = user_id);

-- Admin policies using a different approach - check if we're already an admin
CREATE POLICY "Admins can manage all applications" 
ON applications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);