-- Fix RLS policies for users table
-- This allows the handle_new_user trigger to insert new users

-- Add INSERT policy for users table (allows trigger to create user profiles)
CREATE POLICY "Allow user creation via trigger" ON users
  FOR INSERT WITH CHECK (TRUE);

-- Verify all users table policies
-- Expected policies:
-- 1. SELECT: "Users can view all profiles" (✓ exists)
-- 2. UPDATE: "Users can update own profile" (✓ exists)
-- 3. INSERT: "Allow user creation via trigger" (NEW - added above)
