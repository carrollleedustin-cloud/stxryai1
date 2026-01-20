-- ============================================================================
-- SUPABASE SETUP - RUN THIS ENTIRE FILE IN SUPABASE SQL EDITOR
-- ============================================================================
-- Instructions:
-- 1. Go to: https://app.supabase.com/project/kdqgpnbymjzuzdscaiko/sql
-- 2. Copy this ENTIRE file
-- 3. Paste into SQL Editor
-- 4. Click "Run" button
-- 5. Wait for "Success" message
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE READING_PROGRESS TABLE
-- ============================================================================

-- Create reading_progress table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reading_progress_user 
  ON reading_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_reading_progress_story 
  ON reading_progress(story_id);

-- Enable RLS
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own reading progress" ON reading_progress;
DROP POLICY IF EXISTS "Users can insert own reading progress" ON reading_progress;
DROP POLICY IF EXISTS "Users can update own reading progress" ON reading_progress;
DROP POLICY IF EXISTS "Users can delete own reading progress" ON reading_progress;

-- Create policies
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

-- ============================================================================
-- PART 2: CREATE STORAGE BUCKETS
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
-- PART 3: STORAGE POLICIES - USER AVATARS
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Anyone can view avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-avatars');

-- Users can upload own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- PART 4: STORAGE POLICIES - STORY COVERS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view published story covers" ON storage.objects;
DROP POLICY IF EXISTS "Creators can view own story covers" ON storage.objects;
DROP POLICY IF EXISTS "Creators can upload story covers" ON storage.objects;
DROP POLICY IF EXISTS "Creators can update own story covers" ON storage.objects;
DROP POLICY IF EXISTS "Creators can delete own story covers" ON storage.objects;

-- Anyone can view published story covers
CREATE POLICY "Anyone can view published story covers"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'story-covers'
    AND EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.is_published = true
    )
  );

-- Creators can view own story covers
CREATE POLICY "Creators can view own story covers"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'story-covers'
    AND EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.user_id = auth.uid()
    )
  );

-- Creators can upload story covers
CREATE POLICY "Creators can upload story covers"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'story-covers'
    AND EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.user_id = auth.uid()
    )
  );

-- Creators can update own story covers
CREATE POLICY "Creators can update own story covers"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'story-covers'
    AND EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.user_id = auth.uid()
    )
  );

-- Creators can delete own story covers
CREATE POLICY "Creators can delete own story covers"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'story-covers'
    AND EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 5: STORAGE POLICIES - USER UPLOADS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;

-- Users can view own uploads
CREATE POLICY "Users can view own uploads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can upload own files
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update own uploads
CREATE POLICY "Users can update own uploads"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete own uploads
CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- PART 6: STORAGE POLICIES - STORY ASSETS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view published story assets" ON storage.objects;
DROP POLICY IF EXISTS "Creators can view own story assets" ON storage.objects;
DROP POLICY IF EXISTS "Creators can upload story assets" ON storage.objects;
DROP POLICY IF EXISTS "Creators can update own story assets" ON storage.objects;
DROP POLICY IF EXISTS "Creators can delete own story assets" ON storage.objects;

-- Anyone can view assets from published stories
CREATE POLICY "Anyone can view published story assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'story-assets'
    AND EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.is_published = true
    )
  );

-- Creators can view own story assets
CREATE POLICY "Creators can view own story assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'story-assets'
    AND EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.user_id = auth.uid()
    )
  );

-- Creators can upload story assets
CREATE POLICY "Creators can upload story assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'story-assets'
    AND EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.user_id = auth.uid()
    )
  );

-- Creators can update own story assets
CREATE POLICY "Creators can update own story assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'story-assets'
    AND EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.user_id = auth.uid()
    )
  );

-- Creators can delete own story assets
CREATE POLICY "Creators can delete own story assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'story-assets'
    AND EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id::text = (storage.foldername(name))[1]
      AND stories.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 7: STORAGE POLICIES - SYSTEM ASSETS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view system assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload system assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update system assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete system assets" ON storage.objects;

-- Anyone can view system assets
CREATE POLICY "Anyone can view system assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'system-assets');

-- Only admins can upload system assets
CREATE POLICY "Admins can upload system assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'system-assets'
    AND EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.role IN ('admin', 'owner'))
    )
  );

-- Only admins can update system assets
CREATE POLICY "Admins can update system assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'system-assets'
    AND EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.role IN ('admin', 'owner'))
    )
  );

-- Only admins can delete system assets
CREATE POLICY "Admins can delete system assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'system-assets'
    AND EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.role IN ('admin', 'owner'))
    )
  );

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Setup completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  ✅ reading_progress table';
  RAISE NOTICE '  ✅ 5 storage buckets';
  RAISE NOTICE '  ✅ All storage policies';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Run: node test-supabase-connection.js';
  RAISE NOTICE '  2. Start dev server: npm run dev';
  RAISE NOTICE '  3. Test file uploads and reading progress';
END $$;
