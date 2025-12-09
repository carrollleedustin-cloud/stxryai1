-- Test for user_profiles table RLS policies

BEGIN;

-- Plan the tests
SELECT plan(8);

-- Create test users
INSERT INTO auth.users (id, email, encrypted_password) VALUES
    ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'testuser1@test.com', 'password'),
    ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'testuser2@test.com', 'password');

-- Create test profiles
INSERT INTO public.user_profiles (user_id, username, display_name) VALUES
    ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'testuser1', 'Test User 1'),
    ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'testuser2', 'Test User 2');

-- Test SELECT policy: "Users can view any profile"
-- Set the role to an authenticated user
SET ROLE authenticated;
-- Set the session user
SET aoi.user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f';

-- Test that user1 can see all profiles
SELECT results_eq(
    'SELECT COUNT(*)::INT FROM public.user_profiles',
    ARRAY[2],
    'Authenticated users can view all profiles'
);

-- Test INSERT policy: "Users can insert own profile"
-- User1 tries to insert their own profile
SELECT lives_ok(
    $$ INSERT INTO public.user_profiles (user_id, username, display_name) VALUES ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'testuser1_new', 'Test User 1 New') $$,
    'User can insert their own profile'
);

-- User1 tries to insert a profile for user2
SELECT throws_ok(
    $$ INSERT INTO public.user_profiles (user_id, username, display_name) VALUES ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'testuser2_new', 'Test User 2 New') $$,
    'new row violates row-level security policy for table "user_profiles"',
    'User cannot insert a profile for another user'
);

-- Test UPDATE policy: "Users can update own profile"
-- User1 tries to update their own profile
SELECT lives_ok(
    $$ UPDATE public.user_profiles SET bio = 'A new bio' WHERE user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f' $$,
    'User can update their own profile'
);

-- Check if the update was successful
SELECT results_eq(
    $$ SELECT bio FROM public.user_profiles WHERE user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f' $$,
    ARRAY['A new bio'],
    'User bio was updated correctly'
);

-- User1 tries to update user2's profile
SELECT results_eq(
    $$ UPDATE public.user_profiles SET bio = 'malicious bio' WHERE user_id = 'e4732a9e-1d57-4183-b7c1-e3da3b4b8897' RETURNING 1 $$,
    ARRAY[]::integer[],
    'User cannot update another user''s profile'
);

-- Test DELETE policy: No delete policy, so should be disallowed
-- User1 tries to delete their own profile
SELECT throws_ok(
    $$ DELETE FROM public.user_profiles WHERE user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f' $$,
    'permission denied for table user_profiles',
    'User cannot delete their own profile'
);

-- User1 tries to delete user2's profile
SELECT throws_ok(
    $$ DELETE FROM public.user_profiles WHERE user_id = 'e4732a9e-1d57-4183-b7c1-e3da3b4b8897' $$,
    'permission denied for table user_profiles',
    'User cannot delete another user''s profile'
);

-- Finish the tests
SELECT * FROM finish();

ROLLBACK;
