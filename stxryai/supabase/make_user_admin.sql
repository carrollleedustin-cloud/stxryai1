-- Make your user account an admin/owner
-- Run this in Supabase SQL Editor after replacing YOUR_EMAIL_HERE with your actual email

-- Step 1: Find your user ID (replace YOUR_EMAIL_HERE with your email)
-- SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';

-- Step 2: Update user_profiles table (replace YOUR_EMAIL_HERE with your email)
UPDATE public.user_profiles
SET 
  role = 'admin',
  is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'stonedape710@gmail.com');

-- Step 3: Update users table if it exists (replace YOUR_EMAIL_HERE with your email)
UPDATE public.users
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'stonedape710@gmail.com'
);

-- Step 4: Verify the update worked (replace YOUR_EMAIL_HERE with your email)
SELECT 
  up.id,
  up.username,
  up.display_name,
  au.email,
  up.role,
  up.is_admin,
  u.is_admin as users_table_is_admin
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id
LEFT JOIN public.users u ON up.id = u.id
WHERE au.email = 'stonedape710@gmail.com';

-- Alternative: If you want to update the first user (your account if you're the only one)
-- UPDATE public.user_profiles SET role = 'admin', is_admin = true WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);
-- UPDATE public.users SET is_admin = true WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);

