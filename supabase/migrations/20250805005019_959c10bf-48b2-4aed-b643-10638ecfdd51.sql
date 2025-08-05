-- ATS Database Schema - Complete Implementation
-- Phase 1: Clean up and redesign applications table

-- First, drop the existing applications table to recreate with new structure
DROP TABLE IF EXISTS public.applications CASCADE;

-- Create updated applications table with cleaned structure
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    waitlist_id UUID REFERENCES public.waitlist(id) ON DELETE SET NULL,
    
    -- Personal Information
    full_name TEXT NOT NULL,
    email_id TEXT NOT NULL,
    phone_number TEXT,
    current_location TEXT,
    linkedin_profile_url TEXT,
    work_authorization_status TEXT,
    
    -- Application Data
    background_type TEXT, -- renamed from selected_persona
    resume_url TEXT,
    essay_answers JSONB DEFAULT '{"motivation": "", "experience": "", "goals": ""}'::jsonb,
    
    -- Status and Timestamps
    application_status TEXT NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 2: Authentication and User Management

-- User profiles table (extends Supabase Auth)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin users table
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'reviewer',
    permissions JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 3: ATS Core Features

-- Application reviews table
CREATE TABLE public.application_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE NOT NULL,
    stage TEXT NOT NULL, -- 'initial', 'technical', 'final'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_info'
    score INTEGER CHECK (score >= 1 AND score <= 10),
    comments TEXT,
    feedback JSONB DEFAULT '{}'::jsonb,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Interviews table
CREATE TABLE public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    interviewer_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE NOT NULL,
    interview_type TEXT NOT NULL, -- 'phone', 'video', 'in_person', 'technical'
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    notes TEXT,
    feedback JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
    score INTEGER CHECK (score >= 1 AND score <= 10),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Application status history table (audit trail)
CREATE TABLE public.application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Phase 4: Enhanced Features

-- Cohorts table (program batches)
CREATE TABLE public.cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 30,
    current_enrolled INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'active', 'completed'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Communication log table
CREATE TABLE public.communication_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    email_type TEXT NOT NULL, -- 'welcome', 'rejection', 'interview_invite', 'status_update'
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document versions table (resume history)
CREATE TABLE public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'resume',
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_current BOOLEAN NOT NULL DEFAULT false,
    version_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add cohort relationship to applications
ALTER TABLE public.applications ADD COLUMN cohort_id UUID REFERENCES public.cohorts(id) ON DELETE SET NULL;

-- Create Indexes for Performance
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_status ON public.applications(application_status);
CREATE INDEX idx_applications_submitted_at ON public.applications(submitted_at);
CREATE INDEX idx_applications_email ON public.applications(email_id);
CREATE INDEX idx_applications_cohort_id ON public.applications(cohort_id);

CREATE INDEX idx_application_reviews_application_id ON public.application_reviews(application_id);
CREATE INDEX idx_application_reviews_reviewer_id ON public.application_reviews(reviewer_id);
CREATE INDEX idx_application_reviews_stage ON public.application_reviews(stage);
CREATE INDEX idx_application_reviews_status ON public.application_reviews(status);

CREATE INDEX idx_interviews_application_id ON public.interviews(application_id);
CREATE INDEX idx_interviews_interviewer_id ON public.interviews(interviewer_id);
CREATE INDEX idx_interviews_scheduled_at ON public.interviews(scheduled_at);

CREATE INDEX idx_status_history_application_id ON public.application_status_history(application_id);
CREATE INDEX idx_status_history_created_at ON public.application_status_history(created_at);

CREATE INDEX idx_communication_log_application_id ON public.communication_log(application_id);
CREATE INDEX idx_communication_log_sent_at ON public.communication_log(sent_at);

CREATE INDEX idx_document_versions_application_id ON public.document_versions(application_id);
CREATE INDEX idx_document_versions_current ON public.document_versions(is_current);

-- Enable Row Level Security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications (keeping existing structure)
CREATE POLICY "Users can view their own application" ON public.applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own application" ON public.applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own application" ON public.applications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can access all applications" ON public.applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for admin_users
CREATE POLICY "Admins can view admin users" ON public.admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for application_reviews
CREATE POLICY "Admins can manage reviews" ON public.application_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can view their application reviews" ON public.application_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE id = application_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for interviews
CREATE POLICY "Admins can manage interviews" ON public.interviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can view their interviews" ON public.interviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE id = application_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for application_status_history
CREATE POLICY "Admins can view status history" ON public.application_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can view their status history" ON public.application_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE id = application_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for cohorts
CREATE POLICY "Public can view active cohorts" ON public.cohorts
    FOR SELECT USING (status = 'active' OR status = 'upcoming');

CREATE POLICY "Admins can manage cohorts" ON public.cohorts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for communication_log
CREATE POLICY "Admins can view communication log" ON public.communication_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for document_versions
CREATE POLICY "Users can view their document versions" ON public.document_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE id = application_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their document versions" ON public.document_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE id = application_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage document versions" ON public.document_versions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Triggers for updated_at timestamps
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_application_reviews_updated_at
    BEFORE UPDATE ON public.application_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
    BEFORE UPDATE ON public.interviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cohorts_updated_at
    BEFORE UPDATE ON public.cohorts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically track application status changes
CREATE OR REPLACE FUNCTION public.track_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.application_status IS DISTINCT FROM NEW.application_status THEN
        INSERT INTO public.application_status_history (
            application_id,
            previous_status,
            new_status,
            changed_by,
            reason
        ) VALUES (
            NEW.id,
            OLD.application_status,
            NEW.application_status,
            auth.uid(),
            'Status updated'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically track status changes
CREATE TRIGGER track_application_status_changes
    AFTER UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.track_application_status_change();

-- Function to auto-create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile automatically
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();