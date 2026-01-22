-- Make User Admin - Direct SQL Method
-- Run this in your Supabase SQL Editor

-- Replace 'Stonedape710@gmail.com' with your email if different
-- This will make your existing user an admin

-- Update user in users table
UPDATE users
SET 
  role = 'admin',
  is_admin = true,
  updated_at = NOW()
WHERE email = 'Stonedape710@gmail.com';

-- Verify the update
SELECT 
  id,
  email,
  username,
  role,
  is_admin,
  created_at
FROM users
WHERE email = 'Stonedape710@gmail.com';

-- If no rows returned, the user doesn't exist in the users table yet
-- In that case, you need to sign up on the platform first