-- Update RLS policies to allow anonymous application submissions

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert their own application" ON public.applications;
DROP POLICY IF EXISTS "Users can view their own application" ON public.applications;
DROP POLICY IF EXISTS "Users can update their own application" ON public.applications;

-- Create new policy to allow anonymous application submission
CREATE POLICY "Allow anonymous application submission" ON public.applications
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own applications (authenticated users only)
CREATE POLICY "Users can view their own applications" ON public.applications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Allow users to update their own applications (authenticated users only)
CREATE POLICY "Users can update their own applications" ON public.applications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Allow admins to access all applications (keep existing admin policy)
-- The admin policy should already exist from the previous migration

-- Update waitlist policies to also allow anonymous inserts
DROP POLICY IF EXISTS "Public can insert into waitlist" ON public.waitlist;

CREATE POLICY "Allow anonymous waitlist signup" ON public.waitlist
    FOR INSERT WITH CHECK (true);