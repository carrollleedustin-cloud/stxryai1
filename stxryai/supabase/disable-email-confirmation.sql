-- DISABLE EMAIL CONFIRMATION - Run this in Supabase SQL Editor NOW
-- This will let you sign up and login immediately without email verification

-- This is a configuration change that needs to be done in the Supabase Dashboard
-- Go to: Authentication → Settings → Email Auth
-- Set "Enable email confirmations" to OFF

-- Then run this to confirm your existing unverified account:
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
