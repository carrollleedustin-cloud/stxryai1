-- ============================================================================
-- SUPABASE FIX - RUN THIS IF POLICIES ALREADY EXIST
-- ============================================================================
-- This script only creates missing items and handles existing policies
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE READING_PROGRESS TABLE (if missing)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reading_progress') THEN
    CREATE TABLE reading_progress (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
      chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
      progress_percentage INTEGER DEFAULT 0,
      last_read_position INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, story_id)
    );

    CREATE INDEX idx_reading_progress_user ON reading_progress(user_id);
    CREATE INDEX idx_reading_progress_story ON reading_progress(story_id);
    ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view own reading progress"
      ON reading_progress FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own reading progress"
      ON reading_progress FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own reading progress"
      ON reading_progress FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own reading progress"
      ON reading_progress FOR DELETE
      USING (auth.uid() = user_id);

    RAISE NOTICE '✅ Created reading_progress table';
  ELSE
    RAISE NOTICE 'ℹ️ reading_progress table already exists';
  END IF;
END $$;

-- ============================================================================
-- PART 2: CREATE STORAGE BUCKETS (if missing)
-- ============================================================================

-- User avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Story covers bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-covers',
  'story-covers',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- User uploads bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  false,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Story assets bucket (conditional public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-assets',
  'story-assets',
  false,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- System assets bucket (admin only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'system-assets',
  'system-assets',
  true,
  104857600, -- 100MB
  NULL -- Allow all file types
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PART 3: CHECK WHAT EXISTS
-- ============================================================================

DO $$
DECLARE
  bucket_count INTEGER;
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bucket_count FROM storage.buckets
  WHERE id IN ('user-avatars', 'story-covers', 'user-uploads', 'story-assets', 'system-assets');

  SELECT COUNT(*) INTO table_count FROM information_schema.tables
  WHERE table_name = 'reading_progress';

  RAISE NOTICE '';
  RAISE NOTICE '📊 SETUP STATUS:';
  RAISE NOTICE '  Storage buckets: %/5 created', bucket_count;
  RAISE NOTICE '  Reading progress table: %s', CASE WHEN table_count > 0 THEN '✅ Created' ELSE '❌ Missing' END;
  RAISE NOTICE '';

  IF bucket_count = 5 AND table_count > 0 THEN
    RAISE NOTICE '🎉 SUPABASE SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Run: node test-supabase-connection.js';
    RAISE NOTICE '  2. Start: npm run dev';
    RAISE NOTICE '  3. Test file uploads and user registration';
  ELSE
    RAISE NOTICE '⚠️  Some items still missing. Check above.';
  END IF;
END $$;
