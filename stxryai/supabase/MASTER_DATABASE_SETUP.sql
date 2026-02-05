-- ================================================================
-- STXRYAI MASTER DATABASE SETUP
-- Run this ONE file on a COMPLETELY NEW Supabase project
-- Created: February 4, 2026
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PART 1: ALL ENUM TYPES
-- ============================================

DO $$ BEGIN CREATE TYPE story_status AS ENUM ('draft', 'published', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE story_genre AS ENUM ('fantasy', 'sci-fi', 'mystery', 'romance', 'horror', 'adventure', 'thriller', 'historical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'vip'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE badge_type AS ENUM ('reader', 'explorer', 'completionist', 'social', 'creator'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE staff_role AS ENUM ('user', 'moderator', 'admin', 'owner'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- PART 2: CORE USER & STORY TABLES
-- ============================================

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

-- ============================================
-- PART 3: BADGES & ACHIEVEMENTS
-- ============================================

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

CREATE TABLE IF NOT EXISTS badge_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_key VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- PART 4: SUBSCRIPTIONS & WALLETS
-- ============================================

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
-- PART 5: SOCIAL & COMMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS story_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

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

CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- ============================================
-- PART 6: MESSAGING
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) DEFAULT 'direct',
    title VARCHAR(255),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT false,
    UNIQUE(conversation_id, user_id)
);

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

CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 7: PET SYSTEM
-- ============================================

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
-- PART 8: STAFF & MODERATION
-- ============================================

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

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'low',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role staff_role NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

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
-- PART 9: NOTIFICATIONS & STREAKS
-- ============================================

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
-- PART 10: SEASON PASS & QUESTS
-- ============================================

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
-- PART 11: PROFILE CUSTOMIZATION
-- ============================================

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

CREATE TABLE IF NOT EXISTS user_icons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    icon_id UUID NOT NULL REFERENCES profile_icons(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, icon_id)
);

CREATE TABLE IF NOT EXISTS user_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    banner_id UUID NOT NULL REFERENCES profile_banners(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, banner_id)
);

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
-- PART 12: BOOK CLUBS
-- ============================================

CREATE TABLE IF NOT EXISTS book_clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    member_count INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 100,
    current_book_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    reading_pace VARCHAR(20) CHECK (reading_pace IN ('slow', 'moderate', 'fast', 'custom')),
    chapters_per_week INTEGER,
    discussion_day VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);

CREATE TABLE IF NOT EXISTS book_club_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_pinned BOOLEAN DEFAULT false,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_club_discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES book_club_discussions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES book_club_discussion_replies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 13: ANALYTICS
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

CREATE TABLE IF NOT EXISTS story_reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    words_read INTEGER DEFAULT 0,
    choices_made INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 14: ENHANCED STREAKS
-- ============================================

CREATE TABLE IF NOT EXISTS streak_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    streak_days INTEGER NOT NULL UNIQUE,
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('xp', 'coins', 'badge', 'freeze_token', 'premium_day')),
    reward_amount INTEGER NOT NULL,
    badge_id UUID,
    title VARCHAR(100),
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS streak_freeze_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tokens_available INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS streak_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_days INTEGER NOT NULL,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    celebrated BOOLEAN DEFAULT false,
    shared_socially BOOLEAN DEFAULT false,
    rewards_claimed JSONB DEFAULT '[]'::jsonb,
    UNIQUE(user_id, milestone_days)
);

CREATE TABLE IF NOT EXISTS daily_login_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    login_date DATE NOT NULL,
    bonus_type VARCHAR(50) NOT NULL,
    bonus_amount INTEGER NOT NULL,
    streak_multiplier DECIMAL(3,2) DEFAULT 1.0,
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, login_date)
);

-- ============================================
-- PART 15: READING SYNC
-- ============================================

CREATE TABLE IF NOT EXISTS reading_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    scroll_position DECIMAL(10,4) DEFAULT 0,
    paragraph_index INTEGER DEFAULT 0,
    word_index INTEGER DEFAULT 0,
    device_id VARCHAR(100),
    device_name VARCHAR(100),
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

CREATE TABLE IF NOT EXISTS reading_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('started', 'resumed', 'completed_chapter', 'completed_story', 'bookmarked', 'choice_made')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS continue_reading (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- ============================================
-- PART 16: RECOMMENDATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS user_reading_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_genres JSONB DEFAULT '[]'::jsonb,
    preferred_themes JSONB DEFAULT '[]'::jsonb,
    preferred_length VARCHAR(20) CHECK (preferred_length IN ('short', 'medium', 'long', 'any')),
    preferred_mood JSONB DEFAULT '[]'::jsonb,
    disliked_genres JSONB DEFAULT '[]'::jsonb,
    reading_speed VARCHAR(20) CHECK (reading_speed IN ('slow', 'medium', 'fast')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS story_similarities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id_a UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    story_id_b UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5,4) NOT NULL,
    similarity_reasons JSONB DEFAULT '[]'::jsonb,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id_a, story_id_b)
);

CREATE TABLE IF NOT EXISTS user_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    score DECIMAL(5,4) NOT NULL,
    reason TEXT,
    source_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    shown_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS daily_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pick_date DATE NOT NULL,
    story_ids JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, pick_date)
);

-- ============================================
-- PART 17: SOCIAL PROOF
-- ============================================

CREATE TABLE IF NOT EXISTS story_live_readers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

CREATE TABLE IF NOT EXISTS trending_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL CHECK (period IN ('hourly', 'daily', 'weekly', 'monthly')),
    rank INTEGER NOT NULL,
    score DECIMAL(10,2) NOT NULL,
    reads_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, period)
);

CREATE TABLE IF NOT EXISTS story_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL CHECK (milestone_type IN ('readers', 'likes', 'comments', 'shares', 'completions')),
    milestone_value INTEGER NOT NULL,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    announced BOOLEAN DEFAULT false,
    UNIQUE(story_id, milestone_type, milestone_value)
);

-- ============================================
-- PART 18: AUDIO FEATURES
-- ============================================

CREATE TABLE IF NOT EXISTS audio_player_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    position_seconds DECIMAL(10,2) DEFAULT 0,
    playback_speed DECIMAL(3,2) DEFAULT 1.0,
    volume DECIMAL(3,2) DEFAULT 1.0,
    is_playing BOOLEAN DEFAULT false,
    voice_id VARCHAR(100) DEFAULT 'alloy',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS story_character_voices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    character_name VARCHAR(255) NOT NULL,
    voice_id VARCHAR(100) NOT NULL,
    voice_settings JSONB DEFAULT '{"speed": 1.0, "pitch": 1.0}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, character_name)
);

CREATE TABLE IF NOT EXISTS audio_sleep_timers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timer_type VARCHAR(20) NOT NULL CHECK (timer_type IN ('duration', 'chapter_end', 'story_end')),
    duration_minutes INTEGER,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT false,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS audio_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_hash VARCHAR(64) NOT NULL UNIQUE,
    voice_id VARCHAR(100) NOT NULL,
    audio_url TEXT NOT NULL,
    duration_seconds DECIMAL(10,2),
    file_size_bytes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 1
);

-- ============================================
-- PART 19: READING LISTS & COLLECTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS reading_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    list_type VARCHAR(50) DEFAULT 'custom',
    cover_image_url TEXT,
    story_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_list_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(list_id, story_id)
);

CREATE TABLE IF NOT EXISTS reading_list_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(list_id, user_id)
);

CREATE TABLE IF NOT EXISTS editorial_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    cover_image_url TEXT,
    curator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    collection_type VARCHAR(50) NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS editorial_collection_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES editorial_collections(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    curator_note TEXT,
    order_index INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, story_id)
);

-- ============================================
-- PART 20: WRITING CHALLENGES
-- ============================================

CREATE TABLE IF NOT EXISTS writing_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    prompt_text TEXT NOT NULL,
    genre VARCHAR(100),
    difficulty VARCHAR(20),
    word_limit_min INTEGER,
    word_limit_max INTEGER,
    time_limit_hours INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_daily BOOLEAN DEFAULT false,
    prompt_date DATE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS writing_contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rules TEXT,
    prompt_id UUID REFERENCES writing_prompts(id) ON DELETE SET NULL,
    contest_type VARCHAR(50) NOT NULL,
    theme VARCHAR(255),
    genre_restriction VARCHAR(100),
    word_limit_min INTEGER,
    word_limit_max INTEGER,
    prize_pool_coins INTEGER DEFAULT 0,
    prize_pool_description TEXT,
    entry_fee_coins INTEGER DEFAULT 0,
    max_entries INTEGER,
    voting_type VARCHAR(50) DEFAULT 'community',
    submission_start TIMESTAMPTZ NOT NULL,
    submission_end TIMESTAMPTZ NOT NULL,
    voting_start TIMESTAMPTZ,
    voting_end TIMESTAMPTZ,
    results_announced_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contest_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES writing_contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    entry_title VARCHAR(255),
    word_count INTEGER,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    is_disqualified BOOLEAN DEFAULT false,
    disqualification_reason TEXT,
    final_rank INTEGER,
    final_score DECIMAL(10,2),
    prize_awarded JSONB,
    UNIQUE(contest_id, user_id)
);

CREATE TABLE IF NOT EXISTS contest_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES writing_contests(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES contest_entries(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 1 AND score <= 10),
    feedback TEXT,
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entry_id, voter_id)
);

CREATE TABLE IF NOT EXISTS seasonal_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    theme VARCHAR(255),
    event_type VARCHAR(50) NOT NULL,
    badge_id UUID,
    special_rewards JSONB DEFAULT '[]'::jsonb,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 21: ENHANCED SOCIAL
-- ============================================

CREATE TABLE IF NOT EXISTS author_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, author_id)
);

CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_buddies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    buddy_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(user_id, buddy_id)
);

-- ============================================
-- PART 22: MARKETPLACE & TIPPING
-- ============================================

CREATE TABLE IF NOT EXISTS author_tip_jars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    minimum_tip_usd DECIMAL(10,2) DEFAULT 1.00,
    suggested_amounts JSONB DEFAULT '[1, 3, 5, 10]'::jsonb,
    thank_you_message TEXT,
    total_received_usd DECIMAL(12,2) DEFAULT 0,
    total_received_coins INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(author_id)
);

CREATE TABLE IF NOT EXISTS author_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipper_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    amount_usd DECIMAL(10,2),
    amount_coins INTEGER,
    message TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    stripe_payment_id VARCHAR(255),
    tipped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS super_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES story_comments(id) ON DELETE CASCADE,
    highlight_color VARCHAR(20) DEFAULT 'gold',
    amount_paid_coins INTEGER NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_type VARCHAR(50) NOT NULL,
    price_usd DECIMAL(10,2) NOT NULL,
    price_coins INTEGER,
    discount_percentage INTEGER DEFAULT 0,
    discount_ends_at TIMESTAMPTZ,
    rental_duration_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    sales_count INTEGER DEFAULT 0,
    revenue_total DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id)
);

-- ============================================
-- PART 23: COMPANION & IDENTITY
-- ============================================

CREATE TABLE IF NOT EXISTS companion_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    reaction JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companion_opinions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    opinion TEXT NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'conflicted')),
    confidence DECIMAL(3,2) DEFAULT 0.5,
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    memory_type TEXT,
    title TEXT NOT NULL,
    description TEXT,
    choice_text TEXT,
    quote_text TEXT,
    character_name TEXT,
    emotional_tone TEXT,
    intensity INTEGER CHECK (intensity >= 0 AND intensity <= 100),
    screenshot_url TEXT,
    background_color TEXT DEFAULT '#EDE9FE',
    accent_color TEXT DEFAULT '#8B5CF6',
    story_title TEXT,
    story_genre TEXT,
    chapter_title TEXT,
    reading_progress INTEGER,
    is_public BOOLEAN DEFAULT FALSE,
    likes INTEGER DEFAULT 0,
    story_date TIMESTAMPTZ,
    captured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    memory_ids UUID[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    theme TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES reading_memories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(memory_id, user_id)
);

CREATE TABLE IF NOT EXISTS reader_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    primary_archetype TEXT DEFAULT 'Undefined',
    archetype_confidence INTEGER DEFAULT 0,
    archetype_evolution JSONB DEFAULT '[]',
    secondary_traits TEXT[] DEFAULT '{}',
    choice_patterns JSONB DEFAULT '{"bravery": 0, "morality": 0, "logic": 0, "social": 0, "curiosity": 0, "aggression": 0}',
    genre_affinity JSONB DEFAULT '{}',
    reading_style JSONB DEFAULT '{}',
    total_choices_made INTEGER DEFAULT 0,
    stories_completed INTEGER DEFAULT 0,
    unique_paths_explored INTEGER DEFAULT 0,
    rare_choices_found INTEGER DEFAULT 0,
    earned_titles TEXT[] DEFAULT '{}',
    active_title TEXT,
    first_read_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ,
    identity_formed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emotional_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    emotional_profile JSONB DEFAULT '{}',
    pacing_profile JSONB DEFAULT '{}',
    sensitivity_profile JSONB DEFAULT '{}',
    engagement_signals JSONB DEFAULT '{}',
    temporal_patterns JSONB DEFAULT '{}',
    emotional_journey_preference TEXT DEFAULT 'balanced',
    personalized_recommendation_factors TEXT[] DEFAULT '{}',
    data_points INTEGER DEFAULT 0,
    confidence_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 24: STORY ECHOES
-- ============================================

CREATE TABLE IF NOT EXISTS choice_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    choice_point_id TEXT NOT NULL,
    choice_id TEXT NOT NULL,
    choice_text TEXT NOT NULL,
    selection_count INTEGER DEFAULT 0,
    recent_selections INTEGER DEFAULT 0,
    previous_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, chapter_id, choice_point_id, choice_id)
);

CREATE TABLE IF NOT EXISTS reader_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    choice_point_id TEXT NOT NULL,
    choice_id TEXT NOT NULL,
    choice_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS active_reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    progress INTEGER DEFAULT 0,
    reading_speed INTEGER,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS story_activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL,
    story_title TEXT,
    activity_type TEXT,
    chapter_id UUID,
    chapter_title TEXT,
    choice_text TEXT,
    emotional_tone TEXT,
    anonymous_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS story_momentum (
    story_id UUID PRIMARY KEY,
    current_readers INTEGER DEFAULT 0,
    readers_today INTEGER DEFAULT 0,
    readers_yesterday INTEGER DEFAULT 0,
    completions_today INTEGER DEFAULT 0,
    emotional_pulse JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emotional_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL,
    chapter_id UUID NOT NULL,
    event_type TEXT,
    emotional_context TEXT,
    duration INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 25: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_genre ON stories(genre);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_story_chapters_story ON story_chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_story_choices_chapter ON story_choices(chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_progress_user ON user_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_progress_story ON user_reading_progress(story_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_story ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story ON story_comments(story_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_pets_user ON user_pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_interactions_pet ON pet_interactions(pet_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_user ON staff_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_role ON staff_roles(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_user ON moderation_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_positions_user ON reading_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_continue_reading_user ON continue_reading(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_story_live_readers_story ON story_live_readers(story_id);
CREATE INDEX IF NOT EXISTS idx_trending_stories_period ON trending_stories(period, rank);
CREATE INDEX IF NOT EXISTS idx_reading_lists_user ON reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_author_follows_author ON author_follows(author_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companion_memories_pet ON companion_memories(pet_id);
CREATE INDEX IF NOT EXISTS idx_reading_memories_user ON reading_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_choice_statistics_story ON choice_statistics(story_id);
CREATE INDEX IF NOT EXISTS idx_reader_identities_user ON reader_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_fingerprints_user ON emotional_fingerprints(user_id);

-- ============================================
-- PART 26: ENABLE ROW LEVEL SECURITY
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
ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_tip_jars ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE choice_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reader_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_momentum ENABLE ROW LEVEL SECURITY;
ALTER TABLE reader_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotional_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 27: RLS POLICIES
-- ============================================

-- User profiles
CREATE POLICY "Anyone can view profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Stories
CREATE POLICY "Anyone can view published stories" ON stories FOR SELECT USING (is_published = true OR author_id = auth.uid());
CREATE POLICY "Authors can manage own stories" ON stories FOR ALL USING (author_id = auth.uid());

-- Story chapters
CREATE POLICY "Anyone can view chapters of published stories" ON story_chapters FOR SELECT 
USING (story_id IN (SELECT id FROM stories WHERE is_published = true OR author_id = auth.uid()));
CREATE POLICY "Authors can manage chapters" ON story_chapters FOR ALL 
USING (story_id IN (SELECT id FROM stories WHERE author_id = auth.uid()));

-- Story choices
CREATE POLICY "Anyone can view choices" ON story_choices FOR SELECT USING (true);
CREATE POLICY "Authors can manage choices" ON story_choices FOR ALL 
USING (chapter_id IN (SELECT id FROM story_chapters WHERE story_id IN (SELECT id FROM stories WHERE author_id = auth.uid())));

-- Reading progress
CREATE POLICY "Users can manage own reading progress" ON user_reading_progress FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Wallets
CREATE POLICY "Users can manage own wallet" ON user_wallets FOR ALL USING (auth.uid() = user_id);

-- Pet species
CREATE POLICY "Anyone can view pet species" ON pet_species FOR SELECT USING (is_available = true);

-- User pets
CREATE POLICY "Users can manage own pets" ON user_pets FOR ALL USING (auth.uid() = user_id);

-- Pet skins/accessories
CREATE POLICY "Anyone can view pet skins" ON pet_skins FOR SELECT USING (true);
CREATE POLICY "Anyone can view pet accessories" ON pet_accessories FOR SELECT USING (true);

-- Pet interactions
CREATE POLICY "Users can manage own pet interactions" ON pet_interactions FOR ALL USING (auth.uid() = user_id);

-- Staff roles
CREATE POLICY "Users can see own role" ON staff_roles FOR SELECT USING (auth.uid() = user_id);

-- Permissions
CREATE POLICY "Anyone can view permissions" ON permissions FOR SELECT USING (true);
CREATE POLICY "Anyone can view role_permissions" ON role_permissions FOR SELECT USING (true);

-- Feature flags
CREATE POLICY "Anyone can view feature flags" ON feature_flags FOR SELECT USING (true);

-- Story likes
CREATE POLICY "Anyone can view likes" ON story_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON story_likes FOR ALL USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Anyone can view comments" ON story_comments FOR SELECT USING (NOT is_hidden);
CREATE POLICY "Users can manage own comments" ON story_comments FOR ALL USING (auth.uid() = user_id);

-- Follows
CREATE POLICY "Anyone can view follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON user_follows FOR ALL USING (auth.uid() = follower_id);

-- Messages
CREATE POLICY "Users can view own messages" ON direct_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON direct_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Streaks
CREATE POLICY "Users can manage own streaks" ON user_reading_streaks FOR ALL USING (auth.uid() = user_id);

-- Badges
CREATE POLICY "Anyone can view badge definitions" ON badge_definitions FOR SELECT USING (NOT is_secret);
CREATE POLICY "Anyone can view earned badges" ON user_badges_enhanced FOR SELECT USING (true);
CREATE POLICY "System can grant badges" ON user_badges_enhanced FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Season passes
CREATE POLICY "Anyone can view season passes" ON season_passes FOR SELECT USING (true);
CREATE POLICY "Users can manage own season progress" ON user_season_progress FOR ALL USING (auth.uid() = user_id);

-- Quests
CREATE POLICY "Anyone can view active quests" ON quests FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own quest progress" ON user_quest_progress FOR ALL USING (auth.uid() = user_id);

-- Profile customization
CREATE POLICY "Anyone can view icons" ON profile_icons FOR SELECT USING (true);
CREATE POLICY "Anyone can view banners" ON profile_banners FOR SELECT USING (true);
CREATE POLICY "Users manage own icons" ON user_icons FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own banners" ON user_banners FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own customization" ON user_profile_customization FOR ALL USING (auth.uid() = user_id);

-- Book clubs
CREATE POLICY "Anyone can view public clubs" ON book_clubs FOR SELECT USING (is_public = true);
CREATE POLICY "Owners can manage clubs" ON book_clubs FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Members can view memberships" ON book_club_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own membership" ON book_club_members FOR ALL USING (auth.uid() = user_id);

-- Analytics
CREATE POLICY "Users can view own analytics" ON analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create analytics" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage own sessions" ON reading_sessions FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notification prefs" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- Reading lists
CREATE POLICY "Anyone can view public lists" ON reading_lists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users manage own lists" ON reading_lists FOR ALL USING (auth.uid() = user_id);

-- Author follows
CREATE POLICY "Manage own author follows" ON author_follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Authors see their followers" ON author_follows FOR SELECT USING (auth.uid() = author_id);

-- Activity feed
CREATE POLICY "Users manage own activity" ON activity_feed FOR ALL USING (auth.uid() = user_id);

-- Reading buddies
CREATE POLICY "Manage buddy requests" ON reading_buddies FOR ALL USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Tips
CREATE POLICY "Create tips" ON author_tips FOR INSERT WITH CHECK (auth.uid() = tipper_id OR is_anonymous = true);
CREATE POLICY "Authors see received tips" ON author_tips FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Anyone can view tip jars" ON author_tip_jars FOR SELECT USING (is_enabled = true);

-- Marketplace
CREATE POLICY "Anyone can view active listings" ON marketplace_listings FOR SELECT USING (is_active = true);

-- Companion memories
CREATE POLICY "Users can manage own companion memories" ON companion_memories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own companion opinions" ON companion_opinions FOR ALL USING (auth.uid() = user_id);

-- Reading memories
CREATE POLICY "Users can manage own reading memories" ON reading_memories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public memories" ON reading_memories FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Users can manage own memory collections" ON memory_collections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage memory likes" ON memory_likes FOR ALL USING (auth.uid() = user_id);

-- Choice statistics (public)
CREATE POLICY "Anyone can view choice statistics" ON choice_statistics FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated can update statistics" ON choice_statistics FOR ALL USING (auth.uid() IS NOT NULL);

-- Reader choices
CREATE POLICY "Users can manage own reader choices" ON reader_choices FOR ALL USING (auth.uid() = user_id);

-- Active sessions
CREATE POLICY "Users can manage own sessions" ON active_reading_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "View active readers" ON active_reading_sessions FOR SELECT USING (TRUE);

-- Activity feed (story)
CREATE POLICY "Anyone can view story activity" ON story_activity_feed FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated can insert activity" ON story_activity_feed FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Story momentum
CREATE POLICY "Anyone can view momentum" ON story_momentum FOR SELECT USING (TRUE);
CREATE POLICY "Authenticated can update momentum" ON story_momentum FOR ALL USING (auth.uid() IS NOT NULL);

-- Reader identities
CREATE POLICY "Users can manage own identity" ON reader_identities FOR ALL USING (auth.uid() = user_id);

-- Emotional fingerprints
CREATE POLICY "Users can manage own fingerprint" ON emotional_fingerprints FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own emotional events" ON emotional_events FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PART 28: HELPER FUNCTIONS
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

-- Function to increment memory likes
CREATE OR REPLACE FUNCTION increment_memory_likes(memory_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE reading_memories SET likes = likes + 1 WHERE id = memory_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 29: SEED DATA
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
('inkblot', 'Inkblot', 'A sentient splash of living ink', 'Born from the first story ever written.', 'common', 'ink', 'Library of Infinite Pages'),
('paperwing', 'Paperwing', 'A delicate creature made of folded pages', 'Dreams of sleeping books taking flight.', 'uncommon', 'paper', 'Origami Gardens'),
('quillcat', 'Quillcat', 'A feline companion with quills for fur', 'Cats who absorbed creative energy.', 'rare', 'quill', 'Authors Attic'),
('storysprite', 'Storysprite', 'A luminescent fairy of narrative', 'Emerge from beloved tales.', 'epic', 'light', 'Realm of Beloved Tales'),
('lorewyrm', 'Lorewyrm', 'An ancient dragon of knowledge', 'Born from epics told for millennia.', 'legendary', 'fire', 'Halls of Ancient Scrolls')
ON CONFLICT (species_key) DO NOTHING;

-- ============================================
-- COMPLETE!
-- ============================================

SELECT 'StxryAI MASTER database setup complete!' AS status;
