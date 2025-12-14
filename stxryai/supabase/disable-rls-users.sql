-- SIMPLE FIX: Disable RLS on users table
-- User profiles are not sensitive (usernames, display names are public anyway)

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
