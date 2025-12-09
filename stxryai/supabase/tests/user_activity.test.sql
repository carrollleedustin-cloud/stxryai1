-- Test for user_activity table RLS policies

BEGIN;

-- Plan the tests
SELECT plan(7);

-- Create test users
INSERT INTO auth.users (id, email, encrypted_password) VALUES
    ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'testuser1@test.com', 'password'),
    ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'testuser2@test.com', 'password');

-- Create test user activity
INSERT INTO public.user_activity (user_id, activity_type, metadata) VALUES
    ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'liked_story', '{"story_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef"}'),
    ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'commented_on_story', '{"story_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef"}');


-- Set the role to an authenticated user (user1)
SET ROLE authenticated;
SET aoi.user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f';

-- Test SELECT policy: "Users can view own activity"
-- User1 should only see their own activity
SELECT results_eq(
    'SELECT COUNT(*)::INT FROM public.user_activity',
    ARRAY[1],
    'User can only select their own activity'
);

SELECT results_eq(
    $$ SELECT activity_type FROM public.user_activity WHERE user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f' $$,
    ARRAY['liked_story'],
    'User sees the correct activity type for their own record'
);


-- Test INSERT policy: "Users can insert own activity"
-- User1 tries to insert their own activity
SELECT lives_ok(
    $$ INSERT INTO public.user_activity (user_id, activity_type) VALUES ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'new_activity') $$,
    'User can insert their own activity'
);

-- User1 tries to insert activity for user2
SELECT throws_ok(
    $$ INSERT INTO public.user_activity (user_id, activity_type) VALUES ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'illegal_activity') $$,
    'new row violates row-level security policy for table "user_activity"',
    'User cannot insert activity for another user'
);


-- Test UPDATE policy: No update policy, should be denied
SELECT throws_ok(
    $$ UPDATE public.user_activity SET metadata = '{}' WHERE user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f' $$,
    'permission denied for table user_activity',
    'User cannot update their own activity'
);


-- Test DELETE policy: No delete policy, should be denied
SELECT throws_ok(
    $$ DELETE FROM public.user_activity WHERE user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f' $$,
    'permission denied for table user_activity',
    'User cannot delete their own activity'
);

SELECT throws_ok(
    $$ DELETE FROM public.user_activity WHERE user_id = 'e4732a9e-1d57-4183-b7c1-e3da3b4b8897' $$,
    'permission denied for table user_activity',
    'User cannot delete another user''s activity'
);


-- Finish the tests
SELECT * FROM finish();

ROLLBACK;
