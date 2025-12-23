-- ============================================================================
-- STXRYAI RLS POLICIES - COMPREHENSIVE SECURITY
-- ============================================================================
-- Version: 3.0.0 | Date: December 23, 2024
-- Run AFTER all STXRYAI_MASTER_SETUP parts
-- ============================================================================

-- ============================================================================
-- USER TABLES POLICIES
-- ============================================================================

-- User Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users (alternate)
DROP POLICY IF EXISTS "Public users viewable" ON public.users;
CREATE POLICY "Public users viewable" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own" ON public.users;
CREATE POLICY "Users can manage own" ON public.users FOR ALL USING (auth.uid() = id);

-- User Preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own preferences" ON public.user_preferences;
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- User Levels
DROP POLICY IF EXISTS "Users can view all levels" ON public.user_levels;
CREATE POLICY "Users can view all levels" ON public.user_levels FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own level" ON public.user_levels;
CREATE POLICY "Users can manage own level" ON public.user_levels FOR ALL USING (auth.uid() = user_id);

-- User Stats
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own stats" ON public.user_stats;
CREATE POLICY "Users can manage own stats" ON public.user_stats FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- STORY TABLES POLICIES
-- ============================================================================

-- Stories
DROP POLICY IF EXISTS "Anyone can view published stories" ON public.stories;
CREATE POLICY "Anyone can view published stories" ON public.stories FOR SELECT USING (status = 'published' OR is_published = true OR author_id = auth.uid());
DROP POLICY IF EXISTS "Authors can manage own stories" ON public.stories;
CREATE POLICY "Authors can manage own stories" ON public.stories FOR ALL USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can create stories" ON public.stories;
CREATE POLICY "Users can create stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Story Chapters
DROP POLICY IF EXISTS "Anyone can view chapters" ON public.story_chapters;
CREATE POLICY "Anyone can view chapters" ON public.story_chapters FOR SELECT USING (true);

-- Chapters
DROP POLICY IF EXISTS "Anyone can view chapter content" ON public.chapters;
CREATE POLICY "Anyone can view chapter content" ON public.chapters FOR SELECT USING (true);

-- Story Choices
DROP POLICY IF EXISTS "Anyone can view choices" ON public.story_choices;
CREATE POLICY "Anyone can view choices" ON public.story_choices FOR SELECT USING (true);

-- Story Templates
DROP POLICY IF EXISTS "Anyone can view approved templates" ON public.story_templates;
CREATE POLICY "Anyone can view approved templates" ON public.story_templates FOR SELECT USING (is_approved = true OR is_public = true OR author_id = auth.uid());
DROP POLICY IF EXISTS "Users can create templates" ON public.story_templates;
CREATE POLICY "Users can create templates" ON public.story_templates FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can update own templates" ON public.story_templates;
CREATE POLICY "Users can update own templates" ON public.story_templates FOR UPDATE USING (auth.uid() = author_id);

-- Comments
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own comments" ON public.comments;
CREATE POLICY "Users can manage own comments" ON public.comments FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PROGRESS & ACTIVITY POLICIES
-- ============================================================================

-- Reading Progress
DROP POLICY IF EXISTS "Users view own reading_progress" ON public.reading_progress;
CREATE POLICY "Users view own reading_progress" ON public.reading_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own reading_progress" ON public.reading_progress;
CREATE POLICY "Users manage own reading_progress" ON public.reading_progress FOR ALL USING (auth.uid() = user_id);

-- User Reading Progress
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_reading_progress;
CREATE POLICY "Users can view own progress" ON public.user_reading_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_reading_progress;
CREATE POLICY "Users can manage own progress" ON public.user_reading_progress FOR ALL USING (auth.uid() = user_id);

-- User Progress
DROP POLICY IF EXISTS "Users view own user_progress" ON public.user_progress;
CREATE POLICY "Users view own user_progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own user_progress" ON public.user_progress;
CREATE POLICY "Users manage own user_progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- User Activities
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;
CREATE POLICY "Users can view own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create activities" ON public.user_activities;
CREATE POLICY "Users can create activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookmarks
DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- Activity Feed
DROP POLICY IF EXISTS "Users view activity" ON public.activity_feed;
CREATE POLICY "Users view activity" ON public.activity_feed FOR SELECT USING (is_public = true OR auth.uid() = user_id);
DROP POLICY IF EXISTS "Users create activity" ON public.activity_feed;
CREATE POLICY "Users create activity" ON public.activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- GAMIFICATION POLICIES
-- ============================================================================

-- Achievements
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- User Achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlock achievements" ON public.user_achievements;
CREATE POLICY "Users can unlock achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Badges
DROP POLICY IF EXISTS "Anyone can view badges" ON public.user_badges;
CREATE POLICY "Anyone can view badges" ON public.user_badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can earn badges" ON public.user_badges;
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reading Streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON public.reading_streaks;
CREATE POLICY "Users can view own streaks" ON public.reading_streaks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own streaks" ON public.reading_streaks;
CREATE POLICY "Users can manage own streaks" ON public.reading_streaks FOR ALL USING (auth.uid() = user_id);

-- Challenges
DROP POLICY IF EXISTS "Anyone can view challenges" ON public.daily_challenges;
CREATE POLICY "Anyone can view challenges" ON public.daily_challenges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can view weekly challenges" ON public.weekly_challenges;
CREATE POLICY "Anyone can view weekly challenges" ON public.weekly_challenges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can view monthly challenges" ON public.monthly_challenges;
CREATE POLICY "Anyone can view monthly challenges" ON public.monthly_challenges FOR SELECT USING (true);

-- ============================================================================
-- SOCIAL POLICIES
-- ============================================================================

-- Friendships
DROP POLICY IF EXISTS "Users can view friendships" ON public.user_friendships;
CREATE POLICY "Users can view friendships" ON public.user_friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
DROP POLICY IF EXISTS "Users can manage friendships" ON public.user_friendships;
CREATE POLICY "Users can manage friendships" ON public.user_friendships FOR ALL USING (auth.uid() = user_id);

-- Reviews and Likes
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.story_reviews;
CREATE POLICY "Anyone can view reviews" ON public.story_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own reviews" ON public.story_reviews;
CREATE POLICY "Users can manage own reviews" ON public.story_reviews FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view likes" ON public.story_likes;
CREATE POLICY "Anyone can view likes" ON public.story_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own likes" ON public.story_likes;
CREATE POLICY "Users can manage own likes" ON public.story_likes FOR ALL USING (auth.uid() = user_id);

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- MESSAGING POLICIES
-- ============================================================================

-- Conversations
DROP POLICY IF EXISTS "Users view their conversations" ON public.conversations;
CREATE POLICY "Users view their conversations" ON public.conversations FOR SELECT USING (auth.uid() = ANY(participants));
DROP POLICY IF EXISTS "Users create conversations" ON public.conversations;
CREATE POLICY "Users create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = ANY(participants));
DROP POLICY IF EXISTS "Users update conversations" ON public.conversations;
CREATE POLICY "Users update conversations" ON public.conversations FOR UPDATE USING (auth.uid() = ANY(participants));

-- Messages
DROP POLICY IF EXISTS "Users view messages in conversations" ON public.messages;
CREATE POLICY "Users view messages in conversations" ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND auth.uid() = ANY(participants)));
DROP POLICY IF EXISTS "Users send messages" ON public.messages;
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Users update own messages" ON public.messages;
CREATE POLICY "Users update own messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- Announcements
DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;
CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT USING (is_active = true);

-- ============================================================================
-- COMMUNITY POLICIES
-- ============================================================================

-- Reading Clubs
DROP POLICY IF EXISTS "Public clubs viewable" ON public.reading_clubs;
CREATE POLICY "Public clubs viewable" ON public.reading_clubs FOR SELECT USING (is_private = false OR creator_id = auth.uid());
DROP POLICY IF EXISTS "Creators manage clubs" ON public.reading_clubs;
CREATE POLICY "Creators manage clubs" ON public.reading_clubs FOR ALL USING (auth.uid() = creator_id);

-- Discussion Forums
DROP POLICY IF EXISTS "Anyone view forums" ON public.discussion_forums;
CREATE POLICY "Anyone view forums" ON public.discussion_forums FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users create forums" ON public.discussion_forums;
CREATE POLICY "Users create forums" ON public.discussion_forums FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Community Events
DROP POLICY IF EXISTS "Public events viewable" ON public.community_events;
CREATE POLICY "Public events viewable" ON public.community_events FOR SELECT USING (is_public = true OR host_id = auth.uid());

-- ============================================================================
-- MONETIZATION POLICIES
-- ============================================================================

-- User Wallets
DROP POLICY IF EXISTS "Users view own wallet" ON public.user_wallets;
CREATE POLICY "Users view own wallet" ON public.user_wallets FOR SELECT USING (auth.uid() = user_id);

-- Coin Transactions
DROP POLICY IF EXISTS "Users view own transactions" ON public.coin_transactions;
CREATE POLICY "Users view own transactions" ON public.coin_transactions FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions
DROP POLICY IF EXISTS "Users view own subscription" ON public.subscriptions;
CREATE POLICY "Users view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Content Unlocks
DROP POLICY IF EXISTS "Users view own unlocks" ON public.content_unlocks;
CREATE POLICY "Users view own unlocks" ON public.content_unlocks FOR SELECT USING (auth.uid() = user_id);

-- Story Collections
DROP POLICY IF EXISTS "Anyone can view public collections" ON public.story_collections;
CREATE POLICY "Anyone can view public collections" ON public.story_collections FOR SELECT USING (is_public = true OR curator_id = auth.uid());
DROP POLICY IF EXISTS "Users can manage own collections" ON public.story_collections;
CREATE POLICY "Users can manage own collections" ON public.story_collections FOR ALL USING (auth.uid() = curator_id);

-- ============================================================================
-- AI & NARRATIVE POLICIES
-- ============================================================================

-- AI Sessions
DROP POLICY IF EXISTS "Users manage own sessions" ON public.reader_story_sessions;
CREATE POLICY "Users manage own sessions" ON public.reader_story_sessions FOR ALL USING (auth.uid() = user_id);

-- Story Series
DROP POLICY IF EXISTS "Anyone view published series" ON public.story_series;
CREATE POLICY "Anyone view published series" ON public.story_series FOR SELECT USING (is_published = true OR auth.uid() = author_id);
DROP POLICY IF EXISTS "Authors manage series" ON public.story_series;
CREATE POLICY "Authors manage series" ON public.story_series FOR ALL USING (auth.uid() = author_id);

-- Persistent Characters
DROP POLICY IF EXISTS "Users can view own characters" ON public.persistent_characters;
CREATE POLICY "Users can view own characters" ON public.persistent_characters FOR SELECT USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can manage own characters" ON public.persistent_characters;
CREATE POLICY "Users can manage own characters" ON public.persistent_characters FOR ALL USING (auth.uid() = author_id);

-- World Elements
DROP POLICY IF EXISTS "Users can view own world elements" ON public.world_elements;
CREATE POLICY "Users can view own world elements" ON public.world_elements FOR SELECT USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can manage own world elements" ON public.world_elements;
CREATE POLICY "Users can manage own world elements" ON public.world_elements FOR ALL USING (auth.uid() = author_id);

-- Narrative Arcs
DROP POLICY IF EXISTS "Users can view own arcs" ON public.narrative_arcs;
CREATE POLICY "Users can view own arcs" ON public.narrative_arcs FOR SELECT USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Users can manage own arcs" ON public.narrative_arcs;
CREATE POLICY "Users can manage own arcs" ON public.narrative_arcs FOR ALL USING (auth.uid() = author_id);

-- ============================================================================
-- GLOBAL STORY POLICIES
-- ============================================================================

-- Global Stories
DROP POLICY IF EXISTS "Anyone view global stories" ON public.global_stories;
CREATE POLICY "Anyone view global stories" ON public.global_stories FOR SELECT USING (status != 'draft' OR created_by = auth.uid());

-- Global Story Chapters
DROP POLICY IF EXISTS "Anyone view global chapters" ON public.global_story_chapters;
CREATE POLICY "Anyone view global chapters" ON public.global_story_chapters FOR SELECT USING (true);

-- Global Story Actions
DROP POLICY IF EXISTS "Anyone view actions" ON public.global_story_actions;
CREATE POLICY "Anyone view actions" ON public.global_story_actions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users create own actions" ON public.global_story_actions;
CREATE POLICY "Users create own actions" ON public.global_story_actions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- DONATIONS POLICIES
-- ============================================================================

-- Donation Tiers
DROP POLICY IF EXISTS "Anyone view donation tiers" ON public.donation_tiers;
CREATE POLICY "Anyone view donation tiers" ON public.donation_tiers FOR SELECT USING (is_active = true);

-- Donations
DROP POLICY IF EXISTS "Users view own donations" ON public.donations;
CREATE POLICY "Users view own donations" ON public.donations FOR SELECT USING (auth.uid() = user_id OR is_anonymous = false);

-- User Donation Badges
DROP POLICY IF EXISTS "Anyone view donation badges" ON public.user_donation_badges;
CREATE POLICY "Anyone view donation badges" ON public.user_donation_badges FOR SELECT USING (true);

-- ============================================================================
-- GDPR POLICIES
-- ============================================================================

-- Privacy Settings
DROP POLICY IF EXISTS "Users manage own privacy" ON public.privacy_settings;
CREATE POLICY "Users manage own privacy" ON public.privacy_settings FOR ALL USING (auth.uid() = user_id);

-- User Consents
DROP POLICY IF EXISTS "Users manage own consents" ON public.user_consents;
CREATE POLICY "Users manage own consents" ON public.user_consents FOR ALL USING (auth.uid() = user_id);

-- Data Export Requests
DROP POLICY IF EXISTS "Users view own exports" ON public.data_export_requests;
CREATE POLICY "Users view own exports" ON public.data_export_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users create exports" ON public.data_export_requests;
CREATE POLICY "Users create exports" ON public.data_export_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Data Deletion Requests
DROP POLICY IF EXISTS "Users view own deletions" ON public.data_deletion_requests;
CREATE POLICY "Users view own deletions" ON public.data_deletion_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users create deletions" ON public.data_deletion_requests;
CREATE POLICY "Users create deletions" ON public.data_deletion_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notification Preferences
DROP POLICY IF EXISTS "Users manage notification prefs" ON public.notification_preferences;
CREATE POLICY "Users manage notification prefs" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- COMPLETE!
-- ============================================================================

SELECT '✅ All RLS policies applied successfully!' AS status;


