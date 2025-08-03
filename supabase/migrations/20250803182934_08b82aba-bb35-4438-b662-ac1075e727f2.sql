-- Fix security issue: Set search_path for the get_my_claim function
CREATE OR REPLACE FUNCTION public.get_my_claim(claim_name text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(auth.jwt() ->> claim_name, null);
$$;