-- ================================================================
-- STXRYAI COMPLETE DATABASE SETUP - FRESH INSTALL
-- Run this ONE file on a brand new Supabase project
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PART 1: CORE TYPES
-- ============================================

DO $$ BEGIN
    CREATE TYPE story_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE story_genre AS ENUM ('fantasy', 'sci-fi', 'mystery', 'romance', 'horror', 'adventure', 'thriller', 'historical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'vip');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE badge_type AS ENUM ('reader', 'explorer', 'completionist', 'social', 'creator');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE staff_role AS ENUM ('user', 'moderator', 'admin', 'owner');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- PART 2: CORE TABLES (No Dependencies)
-- ============================================

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    total_reading_time INTEGER DEFAULT 0,
    stories_completed INTEGER DEFAULT 0,
    choices_made INTEGER DEFAULT 0,
    daily_choice_limit INTEGER DEFAULT 10,
    daily_choices_used INTEGER DEFAULT 0,
    last_choice_reset TIMESTAMPTZ DEFAULT NOW(),
    is_admin BOOLEAN DEFAULT false,
    coins INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    genre story_genre DEFAULT 'fantasy',
    difficulty difficulty_level DEFAULT 'beginner',
    estimated_duration INTEGER,
    status story_status DEFAULT 'draft',
    is_premium BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    total_chapters INTEGER DEFAULT 0,
    total_choices INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    play_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    age_rating VARCHAR(10) DEFAULT 'all',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story chapters table
CREATE TABLE IF NOT EXISTS story_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    is_ending BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, chapter_number)
);

-- Story choices table
CREATE TABLE IF NOT EXISTS story_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    consequence_text TEXT,
    next_chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    choice_order INTEGER NOT NULL DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reading progress
CREATE TABLE IF NOT EXISTS user_reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    current_chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    last_choice_id UUID REFERENCES story_choices(id) ON DELETE SET NULL,
    progress_percentage INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- User badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    badge_type badge_type DEFAULT 'reader',
    badge_description TEXT,
    badge_icon TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_name)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_id TEXT,
    status TEXT DEFAULT 'inactive',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User wallets
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance INTEGER DEFAULT 0,
    lifetime_earned INTEGER DEFAULT 0,
    lifetime_spent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 3: PET SYSTEM
-- ============================================

-- Pet species definitions
CREATE TABLE IF NOT EXISTS pet_species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_key VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    lore TEXT,
    base_rarity VARCHAR(20) NOT NULL DEFAULT 'common',
    element VARCHAR(50),
    habitat VARCHAR(100),
    base_stats JSONB DEFAULT '{"happiness": 50, "energy": 100, "intelligence": 10, "strength": 10, "agility": 10, "charisma": 10, "luck": 10}'::jsonb,
    evolution_chain JSONB DEFAULT '[]'::jsonb,
    abilities JSONB DEFAULT '[]'::jsonb,
    unlock_requirements JSONB DEFAULT '{}'::jsonb,
    model_config JSONB DEFAULT '{"model_type": "sprite", "idle_animation": "bounce", "size_scale": 1.0}'::jsonb,
    is_available BOOLEAN DEFAULT true,
    is_limited_edition BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User pets
CREATE TABLE IF NOT EXISTS user_pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    species_id UUID NOT NULL REFERENCES pet_species(id) ON DELETE RESTRICT,
    custom_name VARCHAR(50),
    nickname VARCHAR(50),
    level INTEGER DEFAULT 1,
    experience_points BIGINT DEFAULT 0,
    current_evolution_stage INTEGER DEFAULT 1,
    happiness INTEGER DEFAULT 50,
    energy INTEGER DEFAULT 100,
    hunger INTEGER DEFAULT 100,
    hygiene INTEGER DEFAULT 100,
    health INTEGER DEFAULT 100,
    personality_traits JSONB DEFAULT '[]'::jsonb,
    current_mood VARCHAR(50) DEFAULT 'content',
    intelligence INTEGER DEFAULT 10,
    strength INTEGER DEFAULT 10,
    agility INTEGER DEFAULT 10,
    charisma INTEGER DEFAULT 10,
    luck INTEGER DEFAULT 10,
    equipped_skin_id UUID,
    equipped_accessory_ids UUID[] DEFAULT '{}',
    bond_level INTEGER DEFAULT 1,
    total_interactions INTEGER DEFAULT 0,
    favorite_activity VARCHAR(100),
    favorite_food VARCHAR(100),
    achievements JSONB DEFAULT '[]'::jsonb,
    titles_earned JSONB DEFAULT '[]'::jsonb,
    active_title VARCHAR(100),
    born_at TIMESTAMPTZ DEFAULT NOW(),
    last_fed_at TIMESTAMPTZ DEFAULT NOW(),
    last_played_at TIMESTAMPTZ DEFAULT NOW(),
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    is_favorite BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet skins
CREATE TABLE IF NOT EXISTS pet_skins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_id UUID REFERENCES pet_species(id) ON DELETE CASCADE,
    skin_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    rarity VARCHAR(20) NOT NULL DEFAULT 'common',
    preview_image_url TEXT,
    model_overrides JSONB DEFAULT '{}'::jsonb,
    particle_effects JSONB DEFAULT '[]'::jsonb,
    price_coins INTEGER,
    price_premium INTEGER,
    is_limited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet accessories
CREATE TABLE IF NOT EXISTS pet_accessories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accessory_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    accessory_type VARCHAR(50) NOT NULL DEFAULT 'hat',
    rarity VARCHAR(20) NOT NULL DEFAULT 'common',
    stat_bonuses JSONB DEFAULT '{}'::jsonb,
    visual_config JSONB DEFAULT '{}'::jsonb,
    price_coins INTEGER,
    price_premium INTEGER,
    is_limited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet interactions log
CREATE TABLE IF NOT EXISTS pet_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    stat_changes JSONB DEFAULT '{}'::jsonb,
    rewards_earned JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 4: STAFF & ROLES SYSTEM
-- ============================================

-- Staff roles
CREATE TABLE IF NOT EXISTS staff_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    role staff_role NOT NULL DEFAULT 'user',
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'low',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role permissions mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role staff_role NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- Staff audit log
CREATE TABLE IF NOT EXISTS staff_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reports
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_content_type VARCHAR(50),
    reported_content_id UUID,
    report_type VARCHAR(50) NOT NULL,
    description TEXT,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_type VARCHAR(50),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderation actions
CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    evidence JSONB DEFAULT '{}'::jsonb,
    duration_hours INTEGER,
    expires_at TIMESTAMPTZ,
    related_report_id UUID REFERENCES user_reports(id) ON DELETE SET NULL,
    appeal_status VARCHAR(20) DEFAULT 'none',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff notes
CREATE TABLE IF NOT EXISTS staff_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    note_type VARCHAR(50) DEFAULT 'general',
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT false,
    enabled_for_roles staff_role[] DEFAULT '{}',
    rollout_percentage INTEGER DEFAULT 0,
    config JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System config
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency actions
CREATE TABLE IF NOT EXISTS emergency_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type VARCHAR(100) NOT NULL,
    initiated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    affected_users INTEGER,
    config JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- ============================================
-- PART 5: SOCIAL & MESSAGING
-- ============================================

-- Story likes
CREATE TABLE IF NOT EXISTS story_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- Story comments
CREATE TABLE IF NOT EXISTS story_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User follows
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) DEFAULT 'direct',
    title VARCHAR(255),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT false,
    UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    metadata JSONB DEFAULT '{}'::jsonb,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Direct messages (simple version)
CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 6: NOTIFICATIONS & STREAKS
-- ============================================

-- Push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    story_updates BOOLEAN DEFAULT true,
    social_notifications BOOLEAN DEFAULT true,
    marketing_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reading streaks
CREATE TABLE IF NOT EXISTS user_reading_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_read_date DATE,
    streak_started_at TIMESTAMPTZ,
    total_days_read INTEGER DEFAULT 0,
    freeze_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 7: BADGES & ACHIEVEMENTS
-- ============================================

-- Badge categories
CREATE TABLE IF NOT EXISTS badge_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_key VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badge definitions
CREATE TABLE IF NOT EXISTS badge_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES badge_categories(id) ON DELETE SET NULL,
    icon_url TEXT,
    rarity VARCHAR(20) DEFAULT 'common',
    tier INTEGER DEFAULT 1,
    points_value INTEGER DEFAULT 10,
    requirements JSONB DEFAULT '{}'::jsonb,
    is_secret BOOLEAN DEFAULT false,
    is_limited BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges enhanced
CREATE TABLE IF NOT EXISTS user_badges_enhanced (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    earned_via VARCHAR(50) DEFAULT 'automatic',
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_displayed BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    UNIQUE(user_id, badge_id)
);

-- ============================================
-- PART 8: SEASON PASS & QUESTS
-- ============================================

-- Season passes
CREATE TABLE IF NOT EXISTS season_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_number INTEGER NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    theme VARCHAR(100),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    max_level INTEGER DEFAULT 100,
    free_rewards JSONB DEFAULT '[]'::jsonb,
    premium_rewards JSONB DEFAULT '[]'::jsonb,
    premium_price_usd DECIMAL(10,2),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User season progress
CREATE TABLE IF NOT EXISTS user_season_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    season_id UUID NOT NULL REFERENCES season_passes(id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    has_premium BOOLEAN DEFAULT false,
    premium_purchased_at TIMESTAMPTZ,
    claimed_free_rewards INTEGER[] DEFAULT '{}',
    claimed_premium_rewards INTEGER[] DEFAULT '{}',
    UNIQUE(user_id, season_id)
);

-- Quests
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    quest_type VARCHAR(20) NOT NULL DEFAULT 'daily',
    requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    rewards JSONB NOT NULL DEFAULT '[]'::jsonb,
    xp_reward INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User quest progress
CREATE TABLE IF NOT EXISTS user_quest_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    progress JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMPTZ,
    rewards_claimed_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- ============================================
-- PART 9: PROFILE CUSTOMIZATION
-- ============================================

-- Profile icons
CREATE TABLE IF NOT EXISTS profile_icons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    rarity VARCHAR(20) DEFAULT 'common',
    unlock_type VARCHAR(50) DEFAULT 'default',
    price_coins INTEGER,
    price_premium INTEGER,
    is_limited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile banners
CREATE TABLE IF NOT EXISTS profile_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    rarity VARCHAR(20) DEFAULT 'common',
    unlock_type VARCHAR(50) DEFAULT 'default',
    price_coins INTEGER,
    price_premium INTEGER,
    is_limited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User owned icons
CREATE TABLE IF NOT EXISTS user_icons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    icon_id UUID NOT NULL REFERENCES profile_icons(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, icon_id)
);

-- User owned banners
CREATE TABLE IF NOT EXISTS user_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    banner_id UUID NOT NULL REFERENCES profile_banners(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, banner_id)
);

-- User profile customization
CREATE TABLE IF NOT EXISTS user_profile_customization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    equipped_icon_id UUID REFERENCES profile_icons(id) ON DELETE SET NULL,
    equipped_banner_id UUID REFERENCES profile_banners(id) ON DELETE SET NULL,
    equipped_title VARCHAR(100),
    profile_theme JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 10: BOOK CLUBS
-- ============================================

CREATE TABLE IF NOT EXISTS book_clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    member_count INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 100,
    current_book_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);

-- ============================================
-- PART 11: ANALYTICS
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    event_data JSONB DEFAULT '{}'::jsonb,
    page_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    words_read INTEGER,
    choices_made INTEGER DEFAULT 0
);

-- ============================================
-- PART 12: INDEXES
-- ============================================

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_genre ON stories(genre);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_story_chapters_story ON story_chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_story_choices_chapter ON story_choices(chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_progress_user ON user_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_progress_story ON user_reading_progress(story_id);

-- Social indexes
CREATE INDEX IF NOT EXISTS idx_story_likes_story ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story ON story_comments(story_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- Pet indexes
CREATE INDEX IF NOT EXISTS idx_user_pets_user ON user_pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_interactions_pet ON pet_interactions(pet_id);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_roles_user ON staff_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_role ON staff_roles(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_user ON moderation_actions(user_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user ON reading_sessions(user_id);

-- ============================================
-- PART 13: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_season_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 14: RLS POLICIES
-- ============================================

-- User profiles: Anyone can view, users manage own
CREATE POLICY "Anyone can view profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Stories: Public stories visible to all, authors manage own
CREATE POLICY "Anyone can view published stories" ON stories FOR SELECT USING (is_published = true OR author_id = auth.uid());
CREATE POLICY "Authors can manage own stories" ON stories FOR ALL USING (author_id = auth.uid());

-- Story chapters: Visible for published stories
CREATE POLICY "Anyone can view chapters of published stories" ON story_chapters FOR SELECT 
USING (story_id IN (SELECT id FROM stories WHERE is_published = true OR author_id = auth.uid()));
CREATE POLICY "Authors can manage chapters" ON story_chapters FOR ALL 
USING (story_id IN (SELECT id FROM stories WHERE author_id = auth.uid()));

-- Story choices: Visible for published stories
CREATE POLICY "Anyone can view choices" ON story_choices FOR SELECT USING (true);
CREATE POLICY "Authors can manage choices" ON story_choices FOR ALL 
USING (chapter_id IN (SELECT id FROM story_chapters WHERE story_id IN (SELECT id FROM stories WHERE author_id = auth.uid())));

-- User reading progress: Users manage own
CREATE POLICY "Users can manage own reading progress" ON user_reading_progress FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: Users view own
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Wallets: Users manage own
CREATE POLICY "Users can manage own wallet" ON user_wallets FOR ALL USING (auth.uid() = user_id);

-- Pet species: Anyone can view available
CREATE POLICY "Anyone can view pet species" ON pet_species FOR SELECT USING (is_available = true);

-- User pets: Users manage own
CREATE POLICY "Users can manage own pets" ON user_pets FOR ALL USING (auth.uid() = user_id);

-- Pet skins/accessories: Anyone can view
CREATE POLICY "Anyone can view pet skins" ON pet_skins FOR SELECT USING (true);
CREATE POLICY "Anyone can view pet accessories" ON pet_accessories FOR SELECT USING (true);

-- Pet interactions: Users manage own
CREATE POLICY "Users can manage own pet interactions" ON pet_interactions FOR ALL USING (auth.uid() = user_id);

-- Staff roles: Users see own, staff see all
CREATE POLICY "Users can see own role" ON staff_roles FOR SELECT USING (auth.uid() = user_id);

-- Permissions: Anyone can view
CREATE POLICY "Anyone can view permissions" ON permissions FOR SELECT USING (true);
CREATE POLICY "Anyone can view role_permissions" ON role_permissions FOR SELECT USING (true);

-- Feature flags: Anyone can view
CREATE POLICY "Anyone can view feature flags" ON feature_flags FOR SELECT USING (true);

-- Story likes: Anyone can view, users manage own
CREATE POLICY "Anyone can view likes" ON story_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON story_likes FOR ALL USING (auth.uid() = user_id);

-- Comments: Anyone can view, users manage own
CREATE POLICY "Anyone can view comments" ON story_comments FOR SELECT USING (NOT is_hidden);
CREATE POLICY "Users can manage own comments" ON story_comments FOR ALL USING (auth.uid() = user_id);

-- Follows: Anyone can view, users manage own
CREATE POLICY "Anyone can view follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON user_follows FOR ALL USING (auth.uid() = follower_id);

-- Messages: Participants only
CREATE POLICY "Users can view own messages" ON direct_messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Streaks: Users manage own
CREATE POLICY "Users can manage own streaks" ON user_reading_streaks FOR ALL USING (auth.uid() = user_id);

-- Badges: Anyone can view definitions, users manage own earned
CREATE POLICY "Anyone can view badge definitions" ON badge_definitions FOR SELECT USING (NOT is_secret);
CREATE POLICY "Anyone can view earned badges" ON user_badges_enhanced FOR SELECT USING (true);
CREATE POLICY "System can grant badges" ON user_badges_enhanced FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Season passes: Anyone can view
CREATE POLICY "Anyone can view season passes" ON season_passes FOR SELECT USING (true);
CREATE POLICY "Users can manage own season progress" ON user_season_progress FOR ALL USING (auth.uid() = user_id);

-- Quests: Anyone can view active
CREATE POLICY "Anyone can view active quests" ON quests FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own quest progress" ON user_quest_progress FOR ALL USING (auth.uid() = user_id);

-- Profile customization: Anyone view, users manage own
CREATE POLICY "Anyone can view icons" ON profile_icons FOR SELECT USING (true);
CREATE POLICY "Anyone can view banners" ON profile_banners FOR SELECT USING (true);
CREATE POLICY "Users manage own icons" ON user_icons FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own banners" ON user_banners FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own customization" ON user_profile_customization FOR ALL USING (auth.uid() = user_id);

-- Book clubs: Public visible, members manage
CREATE POLICY "Anyone can view public clubs" ON book_clubs FOR SELECT USING (is_public = true);
CREATE POLICY "Owners can manage clubs" ON book_clubs FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Members can view memberships" ON book_club_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own membership" ON book_club_members FOR ALL USING (auth.uid() = user_id);

-- Analytics: Users view own
CREATE POLICY "Users can view own analytics" ON analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create analytics" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage own sessions" ON reading_sessions FOR ALL USING (auth.uid() = user_id);

-- Notifications: Users manage own
CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notification prefs" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PART 15: SEED DATA
-- ============================================

-- Default permissions
INSERT INTO permissions (permission_key, display_name, description, category, risk_level) VALUES
('view_reports', 'View Reports', 'Access to view user reports', 'moderation', 'low'),
('manage_reports', 'Manage Reports', 'Ability to resolve/dismiss reports', 'moderation', 'medium'),
('warn_users', 'Warn Users', 'Issue warnings to users', 'moderation', 'medium'),
('mute_users', 'Mute Users', 'Temporarily mute users', 'moderation', 'medium'),
('temp_ban_users', 'Temp Ban Users', 'Issue temporary bans', 'moderation', 'high'),
('perm_ban_users', 'Permanent Ban Users', 'Issue permanent bans', 'moderation', 'critical'),
('view_user_details', 'View User Details', 'Access extended user information', 'users', 'low'),
('edit_user_profiles', 'Edit User Profiles', 'Modify user profile data', 'users', 'high'),
('manage_user_roles', 'Manage User Roles', 'Grant/revoke staff roles', 'users', 'critical'),
('view_analytics', 'View Analytics', 'Access platform analytics', 'system', 'low'),
('manage_feature_flags', 'Manage Feature Flags', 'Toggle feature flags', 'system', 'high'),
('god_mode', 'God Mode', 'Full system access', 'owner', 'critical'),
('edit_any_inventory', 'Edit Any Inventory', 'Modify user currencies/items', 'owner', 'critical')
ON CONFLICT (permission_key) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role, permission_id) 
SELECT 'moderator', id FROM permissions WHERE permission_key IN (
    'view_reports', 'manage_reports', 'warn_users', 'mute_users', 'view_user_details', 'view_analytics'
) ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'admin', id FROM permissions WHERE permission_key IN (
    'view_reports', 'manage_reports', 'warn_users', 'mute_users', 'temp_ban_users',
    'view_user_details', 'edit_user_profiles', 'manage_user_roles', 'view_analytics', 'manage_feature_flags'
) ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'owner', id FROM permissions ON CONFLICT DO NOTHING;

-- Default badge categories
INSERT INTO badge_categories (category_key, display_name, description, display_order) VALUES
('reading', 'Reading', 'Earned through reading stories', 1),
('writing', 'Writing', 'Earned through creating stories', 2),
('social', 'Social', 'Earned through community engagement', 3),
('achievement', 'Achievement', 'Special accomplishments', 4),
('staff', 'Staff', 'Staff and contributor badges', 5)
ON CONFLICT (category_key) DO NOTHING;

-- Default pet species
INSERT INTO pet_species (species_key, display_name, description, lore, base_rarity, element, habitat) VALUES
('inkblot', 'Inkblot', 'A sentient splash of living ink', 'Born from the first story ever written, Inkblots embody the essence of creativity itself.', 'common', 'ink', 'Library of Infinite Pages'),
('paperwing', 'Paperwing', 'A delicate creature made of folded pages', 'Paperwings are said to be the dreams of sleeping books, taking flight when no one is watching.', 'uncommon', 'paper', 'Origami Gardens'),
('quillcat', 'Quillcat', 'A feline companion with quills for fur', 'Quillcats were once ordinary cats who fell asleep in writers studies and absorbed their creative energy.', 'rare', 'quill', 'Authors Attic'),
('storysprite', 'Storysprite', 'A luminescent fairy of narrative', 'Storysprites emerge from particularly beloved tales, carrying fragments of their origin stories.', 'epic', 'light', 'Realm of Beloved Tales'),
('lorewyrm', 'Lorewyrm', 'An ancient dragon of knowledge', 'Lorewyrms are born from epics that have been told for millennia, growing wiser with each retelling.', 'legendary', 'fire', 'Halls of Ancient Scrolls')
ON CONFLICT (species_key) DO NOTHING;

-- ============================================
-- PART 16: HELPER FUNCTION FOR AUTO-CREATING PROFILES
-- ============================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', 'New User')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- COMPLETE!
-- ============================================

SELECT 'StxryAI database setup complete!' AS status;
