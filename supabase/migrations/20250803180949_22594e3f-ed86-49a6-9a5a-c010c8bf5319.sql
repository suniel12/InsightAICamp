-- Improved Database Architecture for Gigawatt Academy
-- Based on Security First, Data Integrity, Scalability & Flexibility, Performance principles

-- First, let's backup existing data and drop current tables to recreate with improved structure
-- Note: This assumes the tables have minimal test data. In production, you'd want to migrate data.

-- Drop existing tables to recreate with improved structure
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.waitlist CASCADE;

--
-- TABLE: waitlist
-- This table captures the email addresses of users who want to join the waitlist.
-- It's the first entry point for potential applicants.
--
CREATE TABLE public.waitlist (
    -- Core Fields
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE, -- UNIQUE constraint prevents duplicate sign-ups
    
    -- Tracking & Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'applied', 'archived')),
    source TEXT -- Optional field to track where the user came from
);

-- Add an index on the email column for faster lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);

-- Add comments for clarity
COMMENT ON TABLE public.waitlist IS 'Stores email sign-ups for the program waitlist.';
COMMENT ON COLUMN public.waitlist.status IS 'The current status of the waitlist entry in the marketing/admissions funnel.';

--
-- TABLE: applications
-- This table stores the full application for each candidate. It is linked
-- to the user's authentication profile and their initial waitlist entry.
--
CREATE TABLE public.applications (
    -- Core Fields & Foreign Keys
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE, -- One application per user
    waitlist_id UUID REFERENCES public.waitlist(id) UNIQUE, -- Can be NULL if they apply directly

    -- Application Status & Metadata
    application_status TEXT NOT NULL DEFAULT 'draft' CHECK (application_status IN ('draft', 'submitted', 'under_review', 'interviewing', 'accepted', 'rejected', 'waitlisted')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

    -- Personal Information
    full_name TEXT,
    phone_number TEXT,
    linkedin_profile_url TEXT,
    github_profile_url TEXT,
    personal_website_url TEXT,
    current_location TEXT,
    work_authorization_status TEXT CHECK (work_authorization_status IN ('authorized', 'requires_sponsorship', 'not_specified')),
    selected_persona TEXT CHECK (selected_persona IN ('career_pivoter', 'ambitious_newcomer', 'veteran')),

    -- Resume / CV
    resume_url TEXT, -- URL to the resume file stored in cloud storage

    -- Education & Work History (using JSONB for flexibility)
    education_history JSONB DEFAULT '[]'::jsonb,
    work_history JSONB DEFAULT '[]'::jsonb,

    -- Essay Questions (using JSONB for flexibility)
    essay_answers JSONB DEFAULT '{}'::jsonb,

    -- Technical Skills
    technical_skills TEXT
);

-- Add indexes for performance on foreign keys and status
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_waitlist_id ON public.applications(waitlist_id);
CREATE INDEX idx_applications_status ON public.applications(application_status);

-- Add comments for clarity
COMMENT ON TABLE public.applications IS 'Stores comprehensive user applications for the program.';
COMMENT ON COLUMN public.applications.resume_url IS 'Link to a resume file stored in a cloud bucket, not in the database directly.';
COMMENT ON COLUMN public.applications.education_history IS 'JSONB array of education objects.';
COMMENT ON COLUMN public.applications.work_history IS 'JSONB array of work experience objects.';

-- Create the trigger on the applications table for automatic timestamp updates
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security on both tables
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create a helper function to get user claims (needed for admin role checking)
CREATE OR REPLACE FUNCTION public.get_my_claim(claim_name text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> claim_name, null);
$$;

--
-- POLICIES for `waitlist` table
--
-- Allow anyone to add their email to the waitlist
CREATE POLICY "Public can insert into waitlist" ON public.waitlist
    FOR INSERT WITH CHECK (true);

-- Only administrators can view the waitlist emails (secure by default)
CREATE POLICY "Admins can view waitlist" ON public.waitlist
    FOR SELECT USING (get_my_claim('user_role') = 'admin');

--
-- POLICIES for `applications` table
--
-- Allow an authenticated user to create their own application
CREATE POLICY "Users can insert their own application" ON public.applications
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow a user to view ONLY their own application
CREATE POLICY "Users can view their own application" ON public.applications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Allow a user to update ONLY their own application
CREATE POLICY "Users can update their own application" ON public.applications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Allow administrators to access all applications for review purposes
CREATE POLICY "Admins can access all applications" ON public.applications
    FOR ALL USING (get_my_claim('user_role') = 'admin');