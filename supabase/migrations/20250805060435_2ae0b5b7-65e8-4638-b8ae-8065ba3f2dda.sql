-- Grant necessary permissions to the authenticator role for admin_users table
GRANT USAGE ON SCHEMA public TO authenticator;
GRANT SELECT ON public.admin_users TO authenticator;

-- Also ensure the anon role has access since that's what's used for anonymous submissions
GRANT SELECT ON public.admin_users TO anon;