-- Test for reading_progress table RLS policies

BEGIN;

-- Plan the tests
SELECT plan(8);

-- Create test users
INSERT INTO auth.users (id, email, encrypted_password) VALUES
    ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'testuser1@test.com', 'password'),
    ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'testuser2@test.com', 'password');

-- Create a test story
INSERT INTO public.stories (id, author_id, title, description, content, genre, is_published) VALUES
    ('a1b2c3d4-e5f6-7890-1234-567890abcdef', '8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'Test Story', 'Desc', '{"d":"c"}', 'Fantasy', true);

-- Create test reading progress
INSERT INTO public.reading_progress (user_id, story_id, progress_percentage) VALUES
    ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 50),
    ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 25);


-- Set the role to an authenticated user (user1)
SET ROLE authenticated;
SET aoi.user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f';

-- Test SELECT policy
-- User1 should only see their own reading progress
SELECT results_eq(
    'SELECT COUNT(*)::INT FROM public.reading_progress',
    ARRAY[1],
    'User can only select their own reading progress'
);

SELECT results_eq(
    'SELECT progress_percentage FROM public.reading_progress',
    ARRAY[50],
    'User sees the correct progress percentage for their own record'
);


-- Test INSERT policy
-- User1 tries to insert their own progress
SELECT lives_ok(
    $$ INSERT INTO public.reading_progress (user_id, story_id) VALUES ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'a1b2c3d4-e5f6-7890-1234-567890abcdef') $$,
    'User can insert their own reading progress (violates unique but policy passes)'
);

-- User1 tries to insert progress for user2
SELECT throws_ok(
    $$ INSERT INTO public.reading_progress (user_id, story_id) VALUES ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'a1b2c3d4-e5f6-7890-1234-567890abcdef') $$,
    'new row violates row-level security policy for table "reading_progress"',
    'User cannot insert reading progress for another user'
);


-- Test UPDATE policy
-- User1 tries to update their own progress
SELECT results_eq(
    $$ UPDATE public.reading_progress SET progress_percentage = 75 WHERE user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f' RETURNING 1 $$,
    ARRAY[1],
    'User can update their own reading progress'
);

-- User1 tries to update user2's progress
SELECT results_eq(
    $$ UPDATE public.reading_progress SET progress_percentage = 100 WHERE user_id = 'e4732a9e-1d57-4183-b7c1-e3da3b4b8897' RETURNING 1 $$,
    ARRAY[]::integer[],
    'User cannot update another user''s reading progress'
);


-- Test DELETE policy
-- User1 tries to delete another user's progress
SELECT results_eq(
    $$ DELETE FROM public.reading_progress WHERE user_id = 'e4732a9e-1d57-4183-b7c1-e3da3b4b8897' RETURNING 1 $$,
    ARRAY[]::integer[],
    'User cannot delete another user''s reading progress'
);

-- User1 tries to delete their own progress
SELECT results_eq(
    $$ DELETE FROM public.reading_progress WHERE user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f' RETURNING 1 $$,
    ARRAY[1],
    'User can delete their own reading progress'
);


-- Finish the tests
SELECT * FROM finish();

ROLLBACK;
