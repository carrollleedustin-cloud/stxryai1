-- Test for stories table RLS policies

BEGIN;

-- Plan the tests
SELECT plan(10);

-- Create test users
INSERT INTO auth.users (id, email, encrypted_password) VALUES
    ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'testuser1@test.com', 'password'),
    ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'testuser2@test.com', 'password');

-- Create test stories
-- User 1 has one published and one unpublished story
INSERT INTO public.stories (author_id, title, description, content, genre, is_published) VALUES
    ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'User1 Published Story', 'Description', '{"data": "content"}', 'Fantasy', true),
    ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'User1 Unpublished Story', 'Description', '{"data": "content"}', 'Fantasy', false);

-- User 2 has one published story
INSERT INTO public.stories (author_id, title, description, content, genre, is_published) VALUES
    ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'User2 Published Story', 'Description', '{"data": "content"}', 'Sci-Fi', true);


-- Test SELECT policy: "Published stories are viewable by everyone"
-- As an anonymous user
SET ROLE anon;
SELECT results_eq(
    'SELECT COUNT(*)::INT FROM public.stories',
    ARRAY[2],
    'Anonymous users can only view published stories'
);

-- As an authenticated user (user2)
SET ROLE authenticated;
SET aoi.user_id = 'e4732a9e-1d57-4183-b7c1-e3da3b4b8897';

SELECT results_eq(
    'SELECT COUNT(*)::INT FROM public.stories',
    ARRAY[2],
    'Authenticated users can only view published stories (not other users'' unpublished ones)'
);

-- As the author (user1)
SET aoi.user_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f';
SELECT results_eq(
    'SELECT COUNT(*)::INT FROM public.stories',
    ARRAY[3],
    'Authors can view all published stories and their own unpublished stories'
);


-- Test INSERT policy: "Authors can insert own stories"
-- User1 tries to insert a story for themselves
SELECT lives_ok(
    $$ INSERT INTO public.stories (author_id, title, description, content, genre) VALUES ('8f7c9702-8f92-495a-b36a-3dd24f31d67f', 'Another story by User1', 'Desc', '{"d": "c"}', 'Fantasy') $$,
    'Author can insert their own story'
);

-- User1 tries to insert a story for user2
SELECT throws_ok(
    $$ INSERT INTO public.stories (author_id, title, description, content, genre) VALUES ('e4732a9e-1d57-4183-b7c1-e3da3b4b8897', 'Illegal story by User1', 'Desc', '{"d": "c"}', 'Fantasy') $$,
    'new row violates row-level security policy for table "stories"',
    'Author cannot insert a story for another user'
);


-- Test UPDATE policy: "Authors can update own stories"
-- User1 tries to update their own story
SELECT results_eq(
    $$ UPDATE public.stories SET title = 'Updated Title' WHERE author_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f' AND is_published = false RETURNING 1 $$,
    ARRAY[1],
    'Author can update their own story'
);

-- User1 tries to update user2's story
SELECT results_eq(
    $$ UPDATE public.stories SET title = 'Malicious Update' WHERE author_id = 'e4732a9e-1d57-4183-b7c1-e3da3b4b8897' RETURNING 1 $$,
    ARRAY[]::integer[],
    'Author cannot update another user''s story'
);


-- Test DELETE policy: "Authors can delete own stories"
-- User1 tries to delete their own unpublished story
SELECT results_eq(
    $$ DELETE FROM public.stories WHERE author_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f' AND is_published = false RETURNING 1 $$,
    ARRAY[1],
    'Author can delete their own story'
);

-- User1 tries to delete their own published story
SELECT results_eq(
    $$ DELETE FROM public.stories WHERE author_id = '8f7c9702-8f92-495a-b36a-3dd24f31d67f' AND is_published = true RETURNING 1 $$,
    ARRAY[1],
    'Author can delete their own published story'
);

-- User1 tries to delete user2's story
SELECT results_eq(
    $$ DELETE FROM public.stories WHERE author_id = 'e4732a9e-1d57-4183-b7c1-e3da3b4b8897' RETURNING 1 $$,
    ARRAY[]::integer[],
    'Author cannot delete another user''s story'
);

-- Finish the tests
SELECT * FROM finish();

ROLLBACK;
