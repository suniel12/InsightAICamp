-- Fix security warnings by updating function search paths

-- Update track_application_status_change function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';