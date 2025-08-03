-- Create waitlist table for email collection
CREATE TABLE public.waitlist (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT DEFAULT 'pending' -- pending, contacted, etc.
);

-- Create applications table for storing job applications
CREATE TABLE public.applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    resume_url TEXT,
    answers JSONB DEFAULT '{}', -- Store question/answer pairs
    education_history JSONB DEFAULT '[]', -- Array of education entries
    work_history JSONB DEFAULT '[]', -- Array of work experience entries
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies for waitlist (public can insert, only admins can view all)
CREATE POLICY "Anyone can join waitlist" 
ON public.waitlist 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Waitlist entries are viewable by everyone" 
ON public.waitlist 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Create policies for applications (public can insert their own, view their own)
CREATE POLICY "Anyone can submit applications" 
ON public.applications 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Applications are viewable by everyone" 
ON public.applications 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on applications
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();