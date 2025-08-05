-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate the policy using the security definer function
CREATE POLICY "Admins can view admin users" 
ON admin_users 
FOR SELECT 
USING (public.is_admin_user());

-- Also fix other admin policies that might have the same issue
DROP POLICY IF EXISTS "Admins can manage reviews" ON application_reviews;
CREATE POLICY "Admins can manage reviews" 
ON application_reviews 
FOR ALL 
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can view status history" ON application_status_history;
CREATE POLICY "Admins can view status history" 
ON application_status_history 
FOR SELECT 
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can access all applications" ON applications;
CREATE POLICY "Admins can access all applications" 
ON applications 
FOR ALL 
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage cohorts" ON cohorts;
CREATE POLICY "Admins can manage cohorts" 
ON cohorts 
FOR ALL 
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can view communication log" ON communication_log;
CREATE POLICY "Admins can view communication log" 
ON communication_log 
FOR SELECT 
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage document versions" ON document_versions;
CREATE POLICY "Admins can manage document versions" 
ON document_versions 
FOR ALL 
USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can manage interviews" ON interviews;
CREATE POLICY "Admins can manage interviews" 
ON interviews 
FOR ALL 
USING (public.is_admin_user());