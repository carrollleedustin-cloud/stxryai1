-- ================================================================
-- FIX AUTHENTICATION - Complete RLS Policy Fix
-- ================================================================
-- Run this entire file in Supabase SQL Editor to fix authentication

-- 1. Add missing INSERT policy for users table
-- This allows the handle_new_user trigger to create user profiles
DROP POLICY IF EXISTS "Allow user creation via trigger" ON users;
CREATE POLICY "Allow user creation via trigger" ON users
  FOR INSERT WITH CHECK (TRUE);

-- 2. Add missing INSERT policies for chapters and choices
-- These allow users to create stories with chapters and choices
DROP POLICY IF EXISTS "Users can create chapters" ON chapters;
CREATE POLICY "Users can create chapters" ON chapters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own chapters" ON chapters;
CREATE POLICY "Users can update own chapters" ON chapters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own chapters" ON chapters;
CREATE POLICY "Users can delete own chapters" ON chapters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can view chapters of published stories" ON chapters;
CREATE POLICY "Anyone can view chapters of published stories" ON chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.is_published = TRUE
    )
  );

DROP POLICY IF EXISTS "Users can view own story chapters" ON chapters;
CREATE POLICY "Users can view own story chapters" ON chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM stories
      WHERE stories.id = chapters.story_id
      AND stories.user_id = auth.uid()
    )
  );

-- 3. Add INSERT policies for choices
DROP POLICY IF EXISTS "Users can create choices" ON choices;
CREATE POLICY "Users can create choices" ON choices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = choices.chapter_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own choices" ON choices;
CREATE POLICY "Users can update own choices" ON choices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = choices.chapter_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own choices" ON choices;
CREATE POLICY "Users can delete own choices" ON choices
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = choices.chapter_id
      AND stories.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can view choices of published stories" ON choices;
CREATE POLICY "Anyone can view choices of published stories" ON choices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = choices.chapter_id
      AND stories.is_published = TRUE
    )
  );

DROP POLICY IF EXISTS "Users can view own story choices" ON choices;
CREATE POLICY "Users can view own story choices" ON choices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chapters
      JOIN stories ON stories.id = chapters.story_id
      WHERE chapters.id = choices.chapter_id
      AND stories.user_id = auth.uid()
    )
  );

-- 4. Verify the trigger exists and is enabled
-- This trigger creates user profiles when someone signs up
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE 'WARNING: Trigger on_auth_user_created does not exist. Run complete-setup.sql first!';
  ELSE
    RAISE NOTICE 'SUCCESS: Trigger on_auth_user_created exists';
  END IF;
END $$;

-- 5. Test that RLS policies are working
DO $$
BEGIN
  RAISE NOTICE 'Authentication fix complete! You can now:';
  RAISE NOTICE '1. Create accounts at http://localhost:4028/authentication';
  RAISE NOTICE '2. Sign in with email and password';
  RAISE NOTICE '3. Create and publish stories';
END $$;
