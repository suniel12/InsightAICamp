-- Make user_id nullable to allow anonymous applications
ALTER TABLE applications ALTER COLUMN user_id DROP NOT NULL;