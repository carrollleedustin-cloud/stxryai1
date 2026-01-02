-- ============================================================================
-- SUPABASE STORAGE BUCKETS CONFIGURATION
-- Version: 1.0.0
-- Date: January 2026
-- Description: Storage bucket creation and security policies
-- ============================================================================

-- ============================================================================
-- CREATE STORAGE BUCKETS
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
-- STORAGE POLICIES - USER AVATARS
-- ============================================================================

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
-- STORAGE POLICIES - STORY COVERS
-- ============================================================================

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
-- STORAGE POLICIES - USER UPLOADS
-- ============================================================================

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
-- STORAGE POLICIES - STORY ASSETS
-- ============================================================================

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
-- STORAGE POLICIES - SYSTEM ASSETS
-- ============================================================================

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
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Storage buckets configuration completed successfully!';
  RAISE NOTICE 'Buckets created: user-avatars, story-covers, user-uploads, story-assets, system-assets';
  RAISE NOTICE 'Security policies applied to all buckets';
  RAISE NOTICE 'File size limits and MIME type restrictions configured';
END $$;
