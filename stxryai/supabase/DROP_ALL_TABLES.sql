-- ============================================
-- DROP ALL TABLES AND DEPENDENCIES
-- Run this to completely reset your database
-- WARNING: This will delete ALL data!
-- ============================================

-- Disable RLS temporarily for easier cleanup
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- Drop all policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Drop all triggers
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.' || quote_ident(r.event_object_table);
    END LOOP;
END $$;

-- Drop all functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.reset_daily_choices() CASCADE;
DROP FUNCTION IF EXISTS public.update_story_like_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_story_bookmark_count() CASCADE;
DROP FUNCTION IF EXISTS public.get_or_create_reading_streak(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_reading_streak_on_read(UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.generate_referral_code(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.complete_referral(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.add_to_moderation_queue(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.update_moderation_stats(DATE, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.create_default_privacy_settings(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_or_create_cookie_preferences(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.should_send_push_notification(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_or_create_notification_preferences(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_story_access(UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_creator_earnings() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_tip_earnings() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_story_performance(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.generate_analytics_snapshot(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_draft_metrics() CASCADE;
DROP FUNCTION IF EXISTS public.increment_template_usage() CASCADE;
DROP FUNCTION IF EXISTS public.update_comment_reply_count() CASCADE;
DROP FUNCTION IF EXISTS public.update_comment_like_count() CASCADE;
DROP FUNCTION IF EXISTS public.check_author_reply() CASCADE;
DROP FUNCTION IF EXISTS public.get_chapter_comment_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_last_message() CASCADE;
DROP FUNCTION IF EXISTS public.increment_unread_count() CASCADE;
DROP FUNCTION IF EXISTS public.mark_messages_read(UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_or_create_direct_conversation(UUID, UUID) CASCADE;

-- Drop all tables (in reverse dependency order)
-- AI Enhancement & Personalization Tables
DROP TABLE IF EXISTS public.writing_prompts CASCADE;
DROP TABLE IF EXISTS public.reader_feedback CASCADE;
DROP TABLE IF EXISTS public.discovery_preferences CASCADE;
DROP TABLE IF EXISTS public.character_relationships CASCADE;
DROP TABLE IF EXISTS public.user_ui_themes CASCADE;
DROP TABLE IF EXISTS public.story_glossary CASCADE;
DROP TABLE IF EXISTS public.story_translations CASCADE;
DROP TABLE IF EXISTS public.reading_journey_recaps CASCADE;
DROP TABLE IF EXISTS public.story_path_analytics CASCADE;
DROP TABLE IF EXISTS public.procedural_content CASCADE;
DROP TABLE IF EXISTS public.dynamic_prompt_chains CASCADE;
DROP TABLE IF EXISTS public.ai_prompt_templates CASCADE;

-- AI Narrative Features Tables
DROP TABLE IF EXISTS public.narrative_pacing_adjustments CASCADE;
DROP TABLE IF EXISTS public.npc_user_memories CASCADE;
DROP TABLE IF EXISTS public.story_npcs CASCADE;
DROP TABLE IF EXISTS public.user_engagement_metrics CASCADE;

-- Community Hub Tables
DROP TABLE IF EXISTS public.user_reputation CASCADE;
DROP TABLE IF EXISTS public.mentorship_programs CASCADE;
DROP TABLE IF EXISTS public.event_participants CASCADE;
DROP TABLE IF EXISTS public.community_events CASCADE;
DROP TABLE IF EXISTS public.user_content CASCADE;
DROP TABLE IF EXISTS public.discussion_replies CASCADE;
DROP TABLE IF EXISTS public.discussion_forums CASCADE;
DROP TABLE IF EXISTS public.club_members CASCADE;
DROP TABLE IF EXISTS public.reading_clubs CASCADE;

-- GDPR Compliance Tables
DROP TABLE IF EXISTS public.cookie_preferences CASCADE;
DROP TABLE IF EXISTS public.privacy_settings CASCADE;
DROP TABLE IF EXISTS public.data_deletion_requests CASCADE;
DROP TABLE IF EXISTS public.data_export_requests CASCADE;
DROP TABLE IF EXISTS public.user_consents CASCADE;

-- Content Moderation Tables
DROP TABLE IF EXISTS public.moderation_statistics CASCADE;
DROP TABLE IF EXISTS public.content_flags CASCADE;
DROP TABLE IF EXISTS public.moderation_queue CASCADE;
DROP TABLE IF EXISTS public.ai_moderation_logs CASCADE;

-- Marketplace & Monetization Tables
DROP TABLE IF EXISTS public.creator_tips CASCADE;
DROP TABLE IF EXISTS public.story_subscriptions CASCADE;
DROP TABLE IF EXISTS public.creator_earnings CASCADE;
DROP TABLE IF EXISTS public.creator_payouts CASCADE;
DROP TABLE IF EXISTS public.story_purchases CASCADE;
DROP TABLE IF EXISTS public.premium_story_pricing CASCADE;

-- Creator Analytics Tables
DROP TABLE IF EXISTS public.revenue_analytics CASCADE;
DROP TABLE IF EXISTS public.audience_insights CASCADE;
DROP TABLE IF EXISTS public.story_performance_tracking CASCADE;
DROP TABLE IF EXISTS public.creator_analytics_snapshots CASCADE;

-- Advanced Creator Tools Tables
DROP TABLE IF EXISTS public.email_campaigns CASCADE;
DROP TABLE IF EXISTS public.social_media_posts CASCADE;
DROP TABLE IF EXISTS public.marketing_campaigns CASCADE;
DROP TABLE IF EXISTS public.template_usage CASCADE;
DROP TABLE IF EXISTS public.writing_templates CASCADE;
DROP TABLE IF EXISTS public.collaboration_sessions CASCADE;
DROP TABLE IF EXISTS public.story_collaborators CASCADE;
DROP TABLE IF EXISTS public.draft_comments CASCADE;
DROP TABLE IF EXISTS public.chapter_drafts CASCADE;
DROP TABLE IF EXISTS public.story_drafts CASCADE;

-- Chapter Comments Tables
DROP TABLE IF EXISTS public.chapter_comment_subscriptions CASCADE;
DROP TABLE IF EXISTS public.chapter_comment_threads CASCADE;
DROP TABLE IF EXISTS public.chapter_comment_likes CASCADE;
DROP TABLE IF EXISTS public.chapter_comments CASCADE;

-- Direct Messaging Tables
DROP TABLE IF EXISTS public.message_reactions CASCADE;
DROP TABLE IF EXISTS public.typing_indicators CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;

-- Social Sharing & Referrals Tables
DROP TABLE IF EXISTS public.share_tracking CASCADE;
DROP TABLE IF EXISTS public.referral_rewards CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;

-- Push Notifications Tables
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;

-- Reading Streaks & Gamification Tables
DROP TABLE IF EXISTS public.user_weekly_challenges CASCADE;
DROP TABLE IF EXISTS public.weekly_challenges CASCADE;
DROP TABLE IF EXISTS public.reading_calendar CASCADE;
DROP TABLE IF EXISTS public.daily_reading_goals CASCADE;
DROP TABLE IF EXISTS public.reading_streaks CASCADE;

-- Core Social & Activity Tables
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.story_bookmarks CASCADE;
DROP TABLE IF EXISTS public.story_likes CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.leaderboard CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.user_activity CASCADE;
DROP TABLE IF EXISTS public.reading_progress CASCADE;
DROP TABLE IF EXISTS public.chapters CASCADE;
DROP TABLE IF EXISTS public.stories CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS public.relationship_type CASCADE;
DROP TYPE IF EXISTS public.theme_category CASCADE;
DROP TYPE IF EXISTS public.translation_status CASCADE;
DROP TYPE IF EXISTS public.content_generation_type CASCADE;
DROP TYPE IF EXISTS public.prompt_category CASCADE;
DROP TYPE IF EXISTS public.npc_relationship_type CASCADE;
DROP TYPE IF EXISTS public.engagement_level CASCADE;
DROP TYPE IF EXISTS public.event_type CASCADE;
DROP TYPE IF EXISTS public.mentorship_status CASCADE;
DROP TYPE IF EXISTS public.discussion_category CASCADE;
DROP TYPE IF EXISTS public.club_status CASCADE;
DROP TYPE IF EXISTS public.challenge_type CASCADE;
DROP TYPE IF EXISTS public.goal_type CASCADE;
DROP TYPE IF EXISTS public.story_status CASCADE;
DROP TYPE IF EXISTS public.story_genre CASCADE;
DROP TYPE IF EXISTS public.difficulty_level CASCADE;
DROP TYPE IF EXISTS public.subscription_tier CASCADE;
DROP TYPE IF EXISTS public.badge_type CASCADE;

-- Drop extensions (optional - comment out if you want to keep them)
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
-- DROP EXTENSION IF EXISTS "pg_trgm" CASCADE;

SELECT 'All tables, functions, types, and policies dropped successfully!' AS status;

