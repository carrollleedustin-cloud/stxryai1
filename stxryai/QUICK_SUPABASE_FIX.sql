-- ============================================================================
-- QUICK SUPABASE FIX - Only creates missing items
-- ============================================================================
-- Run this if you got "policy already exists" error
-- ============================================================================

-- Create reading_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS reading_progress (
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_story ON reading_progress(story_id);

-- Enable RLS if not already enabled
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Create storage buckets (these will be skipped if they exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('user-avatars', 'user-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('story-covers', 'story-covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('user-uploads', 'user-uploads', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('story-assets', 'story-assets', false, 20971520, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('system-assets', 'system-assets', true, 104857600, NULL)
ON CONFLICT (id) DO NOTHING;

-- Check status
DO $$
DECLARE
  bucket_count INTEGER;
  table_exists BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO bucket_count FROM storage.buckets
  WHERE id IN ('user-avatars', 'story-covers', 'user-uploads', 'story-assets', 'system-assets');

  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reading_progress') INTO table_exists;

  RAISE NOTICE '';
  RAISE NOTICE '📊 SUPABASE STATUS:';
  RAISE NOTICE '  Storage buckets: %/5', bucket_count;
  RAISE NOTICE '  Reading progress table: %', CASE WHEN table_exists THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE '';

  IF bucket_count = 5 AND table_exists THEN
    RAISE NOTICE '🎉 SETUP COMPLETE! Run the test script next.';
  ELSE
    RAISE NOTICE '⚠️  Some items still missing.';
  END IF;
END $$;