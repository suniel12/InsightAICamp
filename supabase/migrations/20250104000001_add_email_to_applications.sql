-- Add email field to applications table
-- This migration adds the email field and makes user_id nullable to support anonymous applications

-- Add email column to applications table
ALTER TABLE public.applications 
ADD COLUMN email TEXT;

-- Add index on email for performance
CREATE INDEX idx_applications_email ON public.applications(email);

-- Make user_id nullable to support anonymous applications (before account creation)
ALTER TABLE public.applications 
ALTER COLUMN user_id DROP NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.applications.email IS 'Email address of the applicant, required for all applications';
COMMENT ON COLUMN public.applications.user_id IS 'User ID from auth, can be null for anonymous applications before account creation';