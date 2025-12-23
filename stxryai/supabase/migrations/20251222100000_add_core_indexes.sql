-- ============================================================================
-- CORE TABLE INDEXES
-- Critical indexes for performance optimization
-- ============================================================================

-- ============================================================================
-- STORIES TABLE INDEXES
-- ============================================================================

-- Primary listing queries - most common access pattern
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_stories_published_at ON stories(published_at DESC NULLS LAST) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_stories_genre ON stories(genre) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);

-- Composite index for filtered story listings (most common query)
CREATE INDEX IF NOT EXISTS idx_stories_listing ON stories(is_published, genre, published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_stories_listing_rating ON stories(is_published, average_rating DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_stories_listing_views ON stories(is_published, view_count DESC) WHERE is_published = true;

-- Premium content filtering
CREATE INDEX IF NOT EXISTS idx_stories_premium ON stories(is_premium, is_published) WHERE is_published = true;

-- Featured stories (fast homepage loading)
CREATE INDEX IF NOT EXISTS idx_stories_featured ON stories(is_featured, published_at DESC) WHERE is_featured = true AND is_published = true;

-- Full-text search on title and description
CREATE INDEX IF NOT EXISTS idx_stories_title_trgm ON stories USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_stories_description_trgm ON stories USING gin(description gin_trgm_ops);

-- Tags array search
CREATE INDEX IF NOT EXISTS idx_stories_tags ON stories USING gin(tags);

-- ============================================================================
-- CHAPTERS TABLE INDEXES
-- ============================================================================

-- Primary access pattern: chapters by story
CREATE INDEX IF NOT EXISTS idx_chapters_story ON chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_chapters_story_order ON chapters(story_id, chapter_number);

-- ============================================================================
-- CHOICES TABLE INDEXES
-- ============================================================================

-- Fast choice lookup by chapter
CREATE INDEX IF NOT EXISTS idx_choices_chapter ON choices(chapter_id);
CREATE INDEX IF NOT EXISTS idx_choices_chapter_order ON choices(chapter_id, position);

-- ============================================================================
-- COMMENTS TABLE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_comments_story ON comments(story_id);
CREATE INDEX IF NOT EXISTS idx_comments_story_created ON comments(story_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

-- ============================================================================
-- USER ACTIVITY & PROGRESS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_story ON reading_progress(story_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_story ON reading_progress(user_id, story_id);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_recent ON user_activity(user_id, created_at DESC);

-- ============================================================================
-- REVIEWS & RATINGS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_reviews_story ON reviews(story_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_story_rating ON reviews(story_id, rating);

-- ============================================================================
-- SOCIAL FEATURES INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_pair ON follows(follower_id, following_id);

CREATE INDEX IF NOT EXISTS idx_story_likes_story ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_user ON story_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_story ON bookmarks(story_id);

-- ============================================================================
-- NOTIFICATIONS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_recent ON notifications(user_id, created_at DESC);

-- ============================================================================
-- ACHIEVEMENTS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_id);

-- ============================================================================
-- PARTIAL INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Active stories only (reduces index size)
CREATE INDEX IF NOT EXISTS idx_stories_active ON stories(updated_at DESC) 
  WHERE is_published = true AND view_count > 0;

-- Recent stories (last 30 days) - frequently accessed
CREATE INDEX IF NOT EXISTS idx_stories_recent ON stories(published_at DESC) 
  WHERE is_published = true AND published_at > NOW() - INTERVAL '30 days';

-- ============================================================================
-- ANALYZE TABLES
-- ============================================================================
-- Run ANALYZE to update statistics after index creation
ANALYZE stories;
ANALYZE chapters;
ANALYZE comments;
ANALYZE reading_progress;
ANALYZE user_activity;

