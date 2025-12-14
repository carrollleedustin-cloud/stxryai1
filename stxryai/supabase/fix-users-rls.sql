-- Fix RLS policy for users table to allow reading profiles

-- Drop old restrictive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create new policy that allows users to read all profiles (needed for the app)
CREATE POLICY "Allow users to view all profiles" ON users
  FOR SELECT USING (TRUE);

-- Keep update policy restricted to own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
