-- Remove email column from users table to avoid conflicts with Supabase Auth
-- The email is already managed by auth.users table

-- Drop the unique constraint first (if it exists)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Remove the email column
ALTER TABLE users DROP COLUMN IF EXISTS email;

-- Add comment to clarify the relationship
COMMENT ON TABLE users IS 'User profiles linked to Supabase Auth. Email is managed in auth.users table.'; 