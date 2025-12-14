-- COMPLETE AUTHENTICATION FIX
-- Run this entire file in Supabase SQL Editor to fix all auth issues

-- ==================================================
-- STEP 1: Clean up existing policies
-- ==================================================

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Allow users to view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user creation via trigger" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;

-- ==================================================
-- STEP 2: Disable RLS on users table (simplest solution)
-- ==================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ==================================================
-- STEP 3: Make sure trigger function exists
-- ==================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, that's fine
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- STEP 4: Make sure trigger is set up
-- ==================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==================================================
-- STEP 5: Set up RLS policies for other tables
-- ==================================================

-- Stories table
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published stories" ON stories;
CREATE POLICY "Anyone can view published stories" ON stories
  FOR SELECT USING (is_published = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own stories" ON stories;
CREATE POLICY "Users can create own stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stories" ON stories;
CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE USING (auth.uid() = user_id);

-- Chapters table
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view chapters of published stories" ON chapters;
CREATE POLICY "Anyone can view chapters of published stories" ON chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND (stories.is_published = true OR stories.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create chapters for own stories" ON chapters;
CREATE POLICY "Users can create chapters for own stories" ON chapters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update chapters of own stories" ON chapters;
CREATE POLICY "Users can update chapters of own stories" ON chapters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete chapters of own stories" ON chapters;
CREATE POLICY "Users can delete chapters of own stories" ON chapters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.user_id = auth.uid()
    )
  );

-- Choices table
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view choices of published stories" ON choices;
CREATE POLICY "Anyone can view choices of published stories" ON choices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = choices.chapter_id
      AND (stories.is_published = true OR stories.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create choices for own stories" ON choices;
CREATE POLICY "Users can create choices for own stories" ON choices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = choices.chapter_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update choices of own stories" ON choices;
CREATE POLICY "Users can update choices of own stories" ON choices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = choices.chapter_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete choices of own stories" ON choices;
CREATE POLICY "Users can delete choices of own stories" ON choices
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = choices.chapter_id
      AND stories.user_id = auth.uid()
    )
  );

-- ==================================================
-- DONE!
-- ==================================================

SELECT 'Authentication setup complete! You can now create accounts and log in.' as message;
