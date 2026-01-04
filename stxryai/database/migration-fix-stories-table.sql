-- ============================================================================
-- MIGRATION: Fix Stories Table Structure
-- ============================================================================
-- This migration adds missing columns to the existing stories table
-- Run this BEFORE running init.sql if you have an existing database
-- ============================================================================

-- Add missing columns to stories table if they don't exist
DO $$ 
BEGIN
  -- Add published_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE stories ADD COLUMN published_at TIMESTAMPTZ;
    RAISE NOTICE 'Added published_at column to stories table';
  END IF;

  -- Add difficulty column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'difficulty'
  ) THEN
    -- Create enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_difficulty') THEN
      CREATE TYPE story_difficulty AS ENUM ('easy', 'medium', 'hard');
    END IF;
    ALTER TABLE stories ADD COLUMN difficulty story_difficulty DEFAULT 'medium';
    RAISE NOTICE 'Added difficulty column to stories table';
  END IF;

  -- Add tags column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'tags'
  ) THEN
    ALTER TABLE stories ADD COLUMN tags TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Added tags column to stories table';
  END IF;

  -- Add rating column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'rating'
  ) THEN
    ALTER TABLE stories ADD COLUMN rating DECIMAL(3,2) DEFAULT 0.00;
    RAISE NOTICE 'Added rating column to stories table';
  END IF;

  -- Add rating_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'rating_count'
  ) THEN
    ALTER TABLE stories ADD COLUMN rating_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added rating_count column to stories table';
  END IF;

  -- Add view_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE stories ADD COLUMN view_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added view_count column to stories table';
  END IF;

  -- Add read_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'read_count'
  ) THEN
    ALTER TABLE stories ADD COLUMN read_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added read_count column to stories table';
  END IF;

  -- Add favorite_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'favorite_count'
  ) THEN
    ALTER TABLE stories ADD COLUMN favorite_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added favorite_count column to stories table';
  END IF;

  -- Add chapter_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'chapter_count'
  ) THEN
    ALTER TABLE stories ADD COLUMN chapter_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added chapter_count column to stories table';
  END IF;

  -- Add word_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'word_count'
  ) THEN
    ALTER TABLE stories ADD COLUMN word_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added word_count column to stories table';
  END IF;

  -- Add estimated_duration column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'estimated_duration'
  ) THEN
    ALTER TABLE stories ADD COLUMN estimated_duration INTEGER DEFAULT 0;
    RAISE NOTICE 'Added estimated_duration column to stories table';
  END IF;

END $$;

-- Create index on published_at if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(is_published, published_at DESC);

-- Create index on tags if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_stories_tags ON stories USING GIN(tags);

-- Create index on rating if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_stories_rating ON stories(rating DESC);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Stories table migration completed successfully!';
