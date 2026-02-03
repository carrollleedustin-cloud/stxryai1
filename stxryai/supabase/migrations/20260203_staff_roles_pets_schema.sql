-- StxryAI Staff Roles, Permissions & Pet System 2.0
-- Migration: 20260203_staff_roles_pets_schema
-- Description: Comprehensive RBAC system, staff tools, and next-gen pet companions

-- ============================================
-- ROLE & PERMISSION SYSTEM
-- ============================================

-- Define role hierarchy
CREATE TYPE staff_role AS ENUM ('user', 'moderator', 'admin', 'owner');

-- Staff roles table
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

-- Permission definitions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role-Permission mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role staff_role NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- Staff action audit log
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
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reports (for moderation)
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_content_type VARCHAR(50),
    reported_content_id UUID,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
        'spam', 'harassment', 'inappropriate_content', 'copyright', 
        'impersonation', 'hate_speech', 'violence', 'other'
    )),
    description TEXT,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed', 'escalated')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_type VARCHAR(50),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User moderation actions
CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'warning', 'mute', 'temp_ban', 'perm_ban', 'unmute', 
        'unban', 'content_removal', 'account_restriction', 'note'
    )),
    reason TEXT NOT NULL,
    evidence JSONB DEFAULT '{}'::jsonb,
    duration_hours INTEGER,
    expires_at TIMESTAMPTZ,
    related_report_id UUID REFERENCES user_reports(id) ON DELETE SET NULL,
    appeal_status VARCHAR(20) DEFAULT 'none' CHECK (appeal_status IN ('none', 'pending', 'approved', 'denied')),
    appeal_reason TEXT,
    appeal_reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff notes on users
CREATE TABLE IF NOT EXISTS staff_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN ('general', 'warning', 'positive', 'watch_list', 'vip')),
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature flags (owner controlled)
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT false,
    enabled_for_roles staff_role[] DEFAULT '{}',
    enabled_for_users UUID[] DEFAULT '{}',
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    config JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System announcements
CREATE TABLE IF NOT EXISTS system_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    announcement_type VARCHAR(50) DEFAULT 'info' CHECK (announcement_type IN ('info', 'warning', 'maintenance', 'celebration', 'update')),
    target_roles staff_role[] DEFAULT '{user, moderator, admin, owner}',
    is_dismissible BOOLEAN DEFAULT true,
    display_location VARCHAR(50)[] DEFAULT '{dashboard}',
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PET SYSTEM 2.0 - NEXT GENERATION
-- ============================================

-- Pet species definitions
CREATE TABLE IF NOT EXISTS pet_species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_key VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    lore TEXT,
    base_rarity VARCHAR(20) NOT NULL CHECK (base_rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
    element VARCHAR(50),
    habitat VARCHAR(100),
    base_stats JSONB NOT NULL DEFAULT '{
        "happiness": 50,
        "energy": 100,
        "intelligence": 10,
        "strength": 10,
        "agility": 10,
        "charisma": 10,
        "luck": 10
    }'::jsonb,
    evolution_chain JSONB DEFAULT '[]'::jsonb,
    abilities JSONB DEFAULT '[]'::jsonb,
    unlock_requirements JSONB DEFAULT '{}'::jsonb,
    model_config JSONB NOT NULL DEFAULT '{
        "model_type": "sprite",
        "idle_animation": "bounce",
        "size_scale": 1.0,
        "particle_effects": []
    }'::jsonb,
    is_available BOOLEAN DEFAULT true,
    is_limited_edition BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet evolution stages
CREATE TABLE IF NOT EXISTS pet_evolution_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_id UUID NOT NULL REFERENCES pet_species(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    description TEXT,
    stat_multiplier DECIMAL(3,2) DEFAULT 1.0,
    new_abilities JSONB DEFAULT '[]'::jsonb,
    visual_changes JSONB DEFAULT '{}'::jsonb,
    evolution_requirements JSONB NOT NULL DEFAULT '{
        "level": 10,
        "happiness": 80,
        "items": []
    }'::jsonb,
    model_config JSONB NOT NULL,
    unlock_animation VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(species_id, stage_number)
);

-- User pets (instances)
CREATE TABLE IF NOT EXISTS user_pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    species_id UUID NOT NULL REFERENCES pet_species(id) ON DELETE RESTRICT,
    custom_name VARCHAR(50),
    nickname VARCHAR(50),
    
    -- Core stats
    level INTEGER DEFAULT 1,
    experience_points BIGINT DEFAULT 0,
    current_evolution_stage INTEGER DEFAULT 1,
    
    -- Dynamic stats (change over time)
    happiness INTEGER DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
    energy INTEGER DEFAULT 100 CHECK (energy >= 0 AND energy <= 100),
    hunger INTEGER DEFAULT 100 CHECK (hunger >= 0 AND hunger <= 100),
    hygiene INTEGER DEFAULT 100 CHECK (hygiene >= 0 AND hygiene <= 100),
    health INTEGER DEFAULT 100 CHECK (health >= 0 AND health <= 100),
    
    -- Personality & mood
    personality_traits JSONB DEFAULT '[]'::jsonb,
    current_mood VARCHAR(50) DEFAULT 'content',
    mood_history JSONB DEFAULT '[]'::jsonb,
    
    -- Combat/RPG stats (grow with level)
    intelligence INTEGER DEFAULT 10,
    strength INTEGER DEFAULT 10,
    agility INTEGER DEFAULT 10,
    charisma INTEGER DEFAULT 10,
    luck INTEGER DEFAULT 10,
    
    -- Customization
    equipped_skin_id UUID,
    equipped_accessory_ids UUID[] DEFAULT '{}',
    color_overrides JSONB DEFAULT '{}'::jsonb,
    
    -- Relationships
    bond_level INTEGER DEFAULT 1,
    total_interactions INTEGER DEFAULT 0,
    favorite_activity VARCHAR(100),
    favorite_food VARCHAR(100),
    
    -- Milestones
    achievements JSONB DEFAULT '[]'::jsonb,
    titles_earned JSONB DEFAULT '[]'::jsonb,
    active_title VARCHAR(100),
    
    -- Timestamps
    born_at TIMESTAMPTZ DEFAULT NOW(),
    last_fed_at TIMESTAMPTZ DEFAULT NOW(),
    last_played_at TIMESTAMPTZ DEFAULT NOW(),
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_favorite BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet skins/cosmetics
CREATE TABLE IF NOT EXISTS pet_skins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_id UUID REFERENCES pet_species(id) ON DELETE CASCADE,
    skin_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'exclusive')),
    preview_image_url TEXT,
    model_overrides JSONB NOT NULL,
    particle_effects JSONB DEFAULT '[]'::jsonb,
    sound_effects JSONB DEFAULT '{}'::jsonb,
    unlock_type VARCHAR(50) DEFAULT 'shop' CHECK (unlock_type IN ('default', 'shop', 'event', 'achievement', 'gift', 'premium')),
    price_coins INTEGER,
    price_premium INTEGER,
    is_limited BOOLEAN DEFAULT false,
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet accessories
CREATE TABLE IF NOT EXISTS pet_accessories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accessory_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    accessory_type VARCHAR(50) NOT NULL CHECK (accessory_type IN (
        'hat', 'glasses', 'collar', 'wings', 'aura', 'companion', 
        'trail', 'background', 'frame', 'effect'
    )),
    compatible_species UUID[] DEFAULT '{}',
    rarity VARCHAR(20) NOT NULL,
    stat_bonuses JSONB DEFAULT '{}'::jsonb,
    visual_config JSONB NOT NULL,
    unlock_type VARCHAR(50) DEFAULT 'shop',
    price_coins INTEGER,
    price_premium INTEGER,
    is_limited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-owned skins
CREATE TABLE IF NOT EXISTS user_pet_skins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skin_id UUID NOT NULL REFERENCES pet_skins(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    acquired_via VARCHAR(50),
    UNIQUE(user_id, skin_id)
);

-- User-owned accessories
CREATE TABLE IF NOT EXISTS user_pet_accessories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    accessory_id UUID NOT NULL REFERENCES pet_accessories(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    acquired_via VARCHAR(50),
    UNIQUE(user_id, accessory_id)
);

-- Pet interactions log
CREATE TABLE IF NOT EXISTS pet_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN (
        'feed', 'play', 'pet', 'train', 'battle', 'explore', 
        'gift', 'heal', 'clean', 'sleep', 'wake', 'evolve', 'customize'
    )),
    details JSONB DEFAULT '{}'::jsonb,
    stat_changes JSONB DEFAULT '{}'::jsonb,
    rewards_earned JSONB DEFAULT '{}'::jsonb,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet activities/mini-games
CREATE TABLE IF NOT EXISTS pet_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'mini_game', 'exploration', 'training', 'social', 'rest', 'adventure'
    )),
    duration_minutes INTEGER,
    energy_cost INTEGER DEFAULT 10,
    rewards JSONB NOT NULL DEFAULT '{}'::jsonb,
    stat_requirements JSONB DEFAULT '{}'::jsonb,
    unlock_requirements JSONB DEFAULT '{}'::jsonb,
    cooldown_minutes INTEGER DEFAULT 0,
    is_multiplayer BOOLEAN DEFAULT false,
    max_participants INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet activity sessions
CREATE TABLE IF NOT EXISTS pet_activity_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES pet_activities(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'abandoned')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    score INTEGER,
    rewards_claimed JSONB,
    participants UUID[] DEFAULT '{}'
);

-- Pet friendship system (pet-to-pet bonds)
CREATE TABLE IF NOT EXISTS pet_friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
    friend_pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
    friendship_level INTEGER DEFAULT 1,
    interactions_count INTEGER DEFAULT 0,
    last_interaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pet_id, friend_pet_id)
);

-- Pet breeding (future feature)
CREATE TABLE IF NOT EXISTS pet_breeding_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_pet_1_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE SET NULL,
    parent_pet_2_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE SET NULL,
    offspring_pet_id UUID REFERENCES user_pets(id) ON DELETE SET NULL,
    breeding_started_at TIMESTAMPTZ DEFAULT NOW(),
    breeding_completed_at TIMESTAMPTZ,
    inherited_traits JSONB DEFAULT '{}'::jsonb,
    mutation_chance DECIMAL(5,4),
    is_successful BOOLEAN
);

-- ============================================
-- OWNER GOD MODE TOOLS
-- ============================================

-- System configuration
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

-- Message audit (owner can view all)
CREATE TABLE IF NOT EXISTS message_audit_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accessor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID,
    message_id UUID,
    access_reason TEXT NOT NULL,
    accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency controls log
CREATE TABLE IF NOT EXISTS emergency_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type VARCHAR(100) NOT NULL CHECK (action_type IN (
        'maintenance_mode', 'lockdown', 'mass_ban', 'data_purge',
        'feature_disable', 'rate_limit_override', 'backup_trigger'
    )),
    initiated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    affected_users INTEGER,
    config JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- Inventory management (god mode)
CREATE TABLE IF NOT EXISTS inventory_modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    modified_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    modification_type VARCHAR(50) NOT NULL CHECK (modification_type IN (
        'add_coins', 'remove_coins', 'add_premium', 'remove_premium',
        'add_item', 'remove_item', 'add_badge', 'remove_badge',
        'add_pet', 'modify_pet', 'reset_stats'
    )),
    item_type VARCHAR(50),
    item_id UUID,
    quantity INTEGER,
    old_value JSONB,
    new_value JSONB,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BADGE SYSTEM ENHANCED
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

-- Badge definitions (enhanced)
CREATE TABLE IF NOT EXISTS badge_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES badge_categories(id) ON DELETE SET NULL,
    icon_url TEXT,
    icon_animated_url TEXT,
    rarity VARCHAR(20) NOT NULL DEFAULT 'common',
    tier INTEGER DEFAULT 1,
    points_value INTEGER DEFAULT 10,
    requirements JSONB DEFAULT '{}'::jsonb,
    is_secret BOOLEAN DEFAULT false,
    is_limited BOOLEAN DEFAULT false,
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    max_recipients INTEGER,
    current_recipients INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges (enhanced)
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
-- EVENT SYSTEM ENHANCED
-- ============================================

-- Event templates
CREATE TABLE IF NOT EXISTS event_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'reading_challenge', 'writing_contest', 'community_event',
        'holiday', 'milestone', 'competition', 'seasonal'
    )),
    default_config JSONB NOT NULL,
    banner_template_url TEXT,
    reward_structure JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active events (enhanced)
CREATE TABLE IF NOT EXISTS platform_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES event_templates(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    
    -- Visual
    banner_url TEXT,
    banner_mobile_url TEXT,
    icon_url TEXT,
    theme_colors JSONB DEFAULT '{"primary": "#6366f1", "secondary": "#8b5cf6"}'::jsonb,
    
    -- Timing
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    registration_starts_at TIMESTAMPTZ,
    registration_ends_at TIMESTAMPTZ,
    
    -- Configuration
    config JSONB DEFAULT '{}'::jsonb,
    rules TEXT,
    prizes JSONB DEFAULT '[]'::jsonb,
    
    -- Participation
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    min_level_required INTEGER DEFAULT 1,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'ended', 'cancelled')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'members_only', 'premium_only', 'invite_only')),
    
    -- Meta
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event participation
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES platform_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    progress JSONB DEFAULT '{}'::jsonb,
    score INTEGER DEFAULT 0,
    rank INTEGER,
    completed_at TIMESTAMPTZ,
    rewards_claimed JSONB DEFAULT '[]'::jsonb,
    UNIQUE(event_id, user_id)
);

-- ============================================
-- ICONS & BANNERS SYSTEM
-- ============================================

-- Profile icons
CREATE TABLE IF NOT EXISTS profile_icons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    animated_url TEXT,
    category VARCHAR(50) DEFAULT 'general',
    rarity VARCHAR(20) DEFAULT 'common',
    unlock_type VARCHAR(50) DEFAULT 'default',
    unlock_requirements JSONB DEFAULT '{}'::jsonb,
    price_coins INTEGER,
    price_premium INTEGER,
    is_limited BOOLEAN DEFAULT false,
    available_from TIMESTAMPTZ,
    available_until TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile banners
CREATE TABLE IF NOT EXISTS profile_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    animated_url TEXT,
    category VARCHAR(50) DEFAULT 'general',
    rarity VARCHAR(20) DEFAULT 'common',
    unlock_type VARCHAR(50) DEFAULT 'default',
    unlock_requirements JSONB DEFAULT '{}'::jsonb,
    price_coins INTEGER,
    price_premium INTEGER,
    is_limited BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User owned icons
CREATE TABLE IF NOT EXISTS user_icons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    icon_id UUID NOT NULL REFERENCES profile_icons(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    acquired_via VARCHAR(50),
    UNIQUE(user_id, icon_id)
);

-- User owned banners
CREATE TABLE IF NOT EXISTS user_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    banner_id UUID NOT NULL REFERENCES profile_banners(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    acquired_via VARCHAR(50),
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
    bio_style JSONB DEFAULT '{}'::jsonb,
    card_style JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- META-PROGRESSION SYSTEM
-- ============================================

-- Season pass / battle pass
CREATE TABLE IF NOT EXISTS season_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_number INTEGER NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    theme VARCHAR(100),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    max_level INTEGER DEFAULT 100,
    free_rewards JSONB NOT NULL DEFAULT '[]'::jsonb,
    premium_rewards JSONB NOT NULL DEFAULT '[]'::jsonb,
    premium_price_usd DECIMAL(10,2),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User season pass progress
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

-- Daily/Weekly quests
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quest_key VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    quest_type VARCHAR(20) NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'special', 'story')),
    requirements JSONB NOT NULL,
    rewards JSONB NOT NULL,
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
-- INDEXES
-- ============================================

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_roles_user ON staff_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_role ON staff_roles(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_staff_audit_staff ON staff_audit_log(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_audit_target ON staff_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_audit_created ON staff_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_user_reports_assigned ON user_reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_user ON moderation_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_active ON moderation_actions(user_id, action_type) WHERE is_active = true;

-- Pet indexes
CREATE INDEX IF NOT EXISTS idx_user_pets_user ON user_pets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pets_species ON user_pets(species_id);
CREATE INDEX IF NOT EXISTS idx_user_pets_active ON user_pets(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pet_interactions_pet ON pet_interactions(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_activity_sessions_pet ON pet_activity_sessions(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_skins_species ON pet_skins(species_id);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_platform_events_active ON platform_events(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_platform_events_dates ON platform_events(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);

-- Badge indexes
CREATE INDEX IF NOT EXISTS idx_badge_definitions_category ON badge_definitions(category_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges_enhanced(user_id);

-- Customization indexes
CREATE INDEX IF NOT EXISTS idx_user_icons_user ON user_icons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_banners_user ON user_banners(user_id);

-- Season pass indexes
CREATE INDEX IF NOT EXISTS idx_season_passes_active ON season_passes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_season_progress_user ON user_season_progress(user_id);

-- Quest indexes
CREATE INDEX IF NOT EXISTS idx_quests_active ON quests(quest_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_user ON user_quest_progress(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_evolution_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pet_skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pet_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_season_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Staff can see their own role
CREATE POLICY "Users can see own role" ON staff_roles 
    FOR SELECT USING (auth.uid() = user_id);

-- Staff with appropriate roles can manage others
CREATE POLICY "Admins can manage roles" ON staff_roles 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM staff_roles sr 
            WHERE sr.user_id = auth.uid() 
            AND sr.role IN ('admin', 'owner')
            AND sr.is_active = true
        )
    );

-- Public permissions readable
CREATE POLICY "Anyone can view permissions" ON permissions FOR SELECT USING (true);
CREATE POLICY "Anyone can view role_permissions" ON role_permissions FOR SELECT USING (true);

-- Staff audit - only staff can see
CREATE POLICY "Staff can view audit log" ON staff_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff_roles sr 
            WHERE sr.user_id = auth.uid() 
            AND sr.role IN ('moderator', 'admin', 'owner')
            AND sr.is_active = true
        )
    );

-- Reports - reporters can see own, staff can see all
CREATE POLICY "Users can create reports" ON user_reports 
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can see own reports" ON user_reports 
    FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Staff can manage reports" ON user_reports 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM staff_roles sr 
            WHERE sr.user_id = auth.uid() 
            AND sr.role IN ('moderator', 'admin', 'owner')
            AND sr.is_active = true
        )
    );

-- Moderation actions - staff only
CREATE POLICY "Staff can manage moderation" ON moderation_actions 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM staff_roles sr 
            WHERE sr.user_id = auth.uid() 
            AND sr.role IN ('moderator', 'admin', 'owner')
            AND sr.is_active = true
        )
    );

-- Feature flags - public read, admin write
CREATE POLICY "Anyone can view feature flags" ON feature_flags FOR SELECT USING (true);
CREATE POLICY "Admins can manage feature flags" ON feature_flags 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM staff_roles sr 
            WHERE sr.user_id = auth.uid() 
            AND sr.role IN ('admin', 'owner')
            AND sr.is_active = true
        )
    );

-- Announcements - public read
CREATE POLICY "Anyone can view active announcements" ON system_announcements 
    FOR SELECT USING (is_active = true AND (ends_at IS NULL OR ends_at > NOW()));

-- Pet species - public read
CREATE POLICY "Anyone can view pet species" ON pet_species FOR SELECT USING (is_available = true);
CREATE POLICY "Anyone can view evolution stages" ON pet_evolution_stages FOR SELECT USING (true);

-- User pets - owner only
CREATE POLICY "Users manage own pets" ON user_pets FOR ALL USING (auth.uid() = user_id);

-- Pet skins/accessories - public read
CREATE POLICY "Anyone can view pet skins" ON pet_skins FOR SELECT USING (true);
CREATE POLICY "Anyone can view pet accessories" ON pet_accessories FOR SELECT USING (true);

-- User owned cosmetics
CREATE POLICY "Users manage own skins" ON user_pet_skins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own accessories" ON user_pet_accessories FOR ALL USING (auth.uid() = user_id);

-- Pet interactions
CREATE POLICY "Users manage own pet interactions" ON pet_interactions FOR ALL USING (auth.uid() = user_id);

-- Pet activities - public read
CREATE POLICY "Anyone can view pet activities" ON pet_activities FOR SELECT USING (true);

-- Activity sessions
CREATE POLICY "Users manage own activity sessions" ON pet_activity_sessions 
    FOR ALL USING (
        pet_id IN (SELECT id FROM user_pets WHERE user_id = auth.uid())
    );

-- Pet friendships
CREATE POLICY "Users can see and manage pet friendships" ON pet_friendships 
    FOR ALL USING (
        pet_id IN (SELECT id FROM user_pets WHERE user_id = auth.uid())
    );

-- System config - owner only
CREATE POLICY "Only owners can view system config" ON system_config 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff_roles sr 
            WHERE sr.user_id = auth.uid() 
            AND sr.role = 'owner'
            AND sr.is_active = true
        )
    );

-- Emergency actions - admin+ only
CREATE POLICY "Admins can view emergency actions" ON emergency_actions 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff_roles sr 
            WHERE sr.user_id = auth.uid() 
            AND sr.role IN ('admin', 'owner')
            AND sr.is_active = true
        )
    );

-- Inventory modifications - target user can see, staff can manage
CREATE POLICY "Users can see own inventory changes" ON inventory_modifications 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage inventory" ON inventory_modifications 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM staff_roles sr 
            WHERE sr.user_id = auth.uid() 
            AND sr.role IN ('admin', 'owner')
            AND sr.is_active = true
        )
    );

-- Badges - public read
CREATE POLICY "Anyone can view badge categories" ON badge_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view badges" ON badge_definitions FOR SELECT USING (NOT is_secret OR id IN (SELECT badge_id FROM user_badges_enhanced WHERE user_id = auth.uid()));

-- User badges
CREATE POLICY "Anyone can see user badges" ON user_badges_enhanced FOR SELECT USING (true);
CREATE POLICY "System can grant badges" ON user_badges_enhanced 
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM staff_roles sr 
            WHERE sr.user_id = auth.uid() 
            AND sr.role IN ('admin', 'owner')
            AND sr.is_active = true
        )
    );

-- Events - public read for active
CREATE POLICY "Anyone can view event templates" ON event_templates FOR SELECT USING (true);
CREATE POLICY "Anyone can view active events" ON platform_events 
    FOR SELECT USING (status = 'active' AND visibility = 'public');

-- Event participation
CREATE POLICY "Users manage own event participation" ON event_participants FOR ALL USING (auth.uid() = user_id);

-- Icons/Banners - public read
CREATE POLICY "Anyone can view icons" ON profile_icons FOR SELECT USING (true);
CREATE POLICY "Anyone can view banners" ON profile_banners FOR SELECT USING (true);

-- User cosmetics
CREATE POLICY "Users manage own icons" ON user_icons FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own banners" ON user_banners FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own customization" ON user_profile_customization FOR ALL USING (auth.uid() = user_id);

-- Season passes
CREATE POLICY "Anyone can view season passes" ON season_passes FOR SELECT USING (true);
CREATE POLICY "Users manage own season progress" ON user_season_progress FOR ALL USING (auth.uid() = user_id);

-- Quests
CREATE POLICY "Anyone can view active quests" ON quests FOR SELECT USING (is_active = true);
CREATE POLICY "Users manage own quest progress" ON user_quest_progress FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA: DEFAULT PERMISSIONS
-- ============================================

INSERT INTO permissions (permission_key, display_name, description, category, risk_level) VALUES
-- Moderation
('view_reports', 'View Reports', 'Access to view user reports', 'moderation', 'low'),
('manage_reports', 'Manage Reports', 'Ability to resolve/dismiss reports', 'moderation', 'medium'),
('warn_users', 'Warn Users', 'Issue warnings to users', 'moderation', 'medium'),
('mute_users', 'Mute Users', 'Temporarily mute users', 'moderation', 'medium'),
('temp_ban_users', 'Temp Ban Users', 'Issue temporary bans', 'moderation', 'high'),
('perm_ban_users', 'Permanent Ban Users', 'Issue permanent bans', 'moderation', 'critical'),
('remove_content', 'Remove Content', 'Delete stories, comments, etc.', 'moderation', 'medium'),
('view_staff_notes', 'View Staff Notes', 'Access staff notes on users', 'moderation', 'low'),
('add_staff_notes', 'Add Staff Notes', 'Create notes on user profiles', 'moderation', 'low'),

-- User Management
('view_user_details', 'View User Details', 'Access extended user information', 'users', 'low'),
('edit_user_profiles', 'Edit User Profiles', 'Modify user profile data', 'users', 'high'),
('manage_user_roles', 'Manage User Roles', 'Grant/revoke staff roles', 'users', 'critical'),
('reset_passwords', 'Reset Passwords', 'Force password resets', 'users', 'high'),
('view_user_activity', 'View User Activity', 'Access user activity logs', 'users', 'medium'),

-- Content
('feature_content', 'Feature Content', 'Mark content as featured', 'content', 'low'),
('edit_any_content', 'Edit Any Content', 'Modify any story/comment', 'content', 'high'),
('delete_any_content', 'Delete Any Content', 'Remove any content', 'content', 'high'),
('manage_collections', 'Manage Collections', 'Edit editorial collections', 'content', 'medium'),

-- Events
('view_events', 'View Events', 'Access event management', 'events', 'low'),
('create_events', 'Create Events', 'Create new platform events', 'events', 'medium'),
('edit_events', 'Edit Events', 'Modify existing events', 'events', 'medium'),
('delete_events', 'Delete Events', 'Remove events', 'events', 'high'),

-- System
('view_analytics', 'View Analytics', 'Access platform analytics', 'system', 'low'),
('view_full_analytics', 'View Full Analytics', 'Access detailed analytics', 'system', 'medium'),
('manage_feature_flags', 'Manage Feature Flags', 'Toggle feature flags', 'system', 'high'),
('view_audit_logs', 'View Audit Logs', 'Access staff action logs', 'system', 'medium'),
('manage_announcements', 'Manage Announcements', 'Create system announcements', 'system', 'medium'),
('access_admin_panel', 'Access Admin Panel', 'View admin dashboard', 'system', 'medium'),

-- Owner Only
('god_mode', 'God Mode', 'Full system access', 'owner', 'critical'),
('view_all_messages', 'View All Messages', 'Audit mode for messages', 'owner', 'critical'),
('edit_any_inventory', 'Edit Any Inventory', 'Modify user currencies/items', 'owner', 'critical'),
('manage_system_config', 'Manage System Config', 'Edit system configuration', 'owner', 'critical'),
('emergency_controls', 'Emergency Controls', 'Access emergency system controls', 'owner', 'critical'),
('manage_badges', 'Manage Badges', 'Create/edit/delete badges', 'owner', 'high'),
('manage_icons_banners', 'Manage Icons & Banners', 'Create/edit cosmetics', 'owner', 'high'),
('manage_pets', 'Manage Pets', 'Edit pet species/skins', 'owner', 'high'),
('manage_season_pass', 'Manage Season Pass', 'Edit battle pass content', 'owner', 'high')
ON CONFLICT (permission_key) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role, permission_id) 
SELECT 'moderator', id FROM permissions WHERE permission_key IN (
    'view_reports', 'manage_reports', 'warn_users', 'mute_users', 
    'view_staff_notes', 'add_staff_notes', 'view_user_details',
    'feature_content', 'view_events', 'view_analytics'
) ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'admin', id FROM permissions WHERE permission_key IN (
    'view_reports', 'manage_reports', 'warn_users', 'mute_users', 'temp_ban_users',
    'remove_content', 'view_staff_notes', 'add_staff_notes', 'view_user_details',
    'edit_user_profiles', 'manage_user_roles', 'view_user_activity',
    'feature_content', 'edit_any_content', 'delete_any_content', 'manage_collections',
    'view_events', 'create_events', 'edit_events', 'delete_events',
    'view_analytics', 'view_full_analytics', 'manage_feature_flags', 
    'view_audit_logs', 'manage_announcements', 'access_admin_panel'
) ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'owner', id FROM permissions ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: BADGE CATEGORIES
-- ============================================

INSERT INTO badge_categories (category_key, display_name, description, display_order) VALUES
('reading', 'Reading', 'Earned through reading stories', 1),
('writing', 'Writing', 'Earned through creating stories', 2),
('social', 'Social', 'Earned through community engagement', 3),
('achievement', 'Achievement', 'Special accomplishments', 4),
('event', 'Event', 'Limited-time event badges', 5),
('staff', 'Staff', 'Staff and contributor badges', 6),
('supporter', 'Supporter', 'Premium supporter badges', 7),
('pet', 'Pet Companion', 'Pet-related achievements', 8)
ON CONFLICT (category_key) DO NOTHING;

-- ============================================
-- SEED DATA: DEFAULT PET SPECIES
-- ============================================

INSERT INTO pet_species (species_key, display_name, description, lore, base_rarity, element, habitat, base_stats, model_config) VALUES
('inkblot', 'Inkblot', 'A sentient splash of living ink', 'Born from the first story ever written, Inkblots embody the essence of creativity itself.', 'common', 'ink', 'Library of Infinite Pages', 
 '{"happiness": 50, "energy": 100, "intelligence": 15, "strength": 5, "agility": 12, "charisma": 10, "luck": 8}'::jsonb,
 '{"model_type": "animated_sprite", "idle_animation": "wobble", "size_scale": 1.0, "particle_effects": ["ink_drip"], "color_scheme": ["#1a1a2e", "#4a4e69"]}'::jsonb),

('paperwing', 'Paperwing', 'A delicate creature made of folded pages', 'Paperwings are said to be the dreams of sleeping books, taking flight when no one is watching.', 'uncommon', 'paper', 'Origami Gardens', 
 '{"happiness": 50, "energy": 80, "intelligence": 12, "strength": 3, "agility": 18, "charisma": 12, "luck": 5}'::jsonb,
 '{"model_type": "animated_sprite", "idle_animation": "flutter", "size_scale": 0.8, "particle_effects": ["paper_trail"], "color_scheme": ["#f5f5dc", "#ffd700"]}'::jsonb),

('quillcat', 'Quillcat', 'A feline companion with quills for fur', 'Quillcats were once ordinary cats who fell asleep in writers'' studies and absorbed their creative energy.', 'rare', 'quill', 'Authors Attic', 
 '{"happiness": 50, "energy": 90, "intelligence": 14, "strength": 10, "agility": 16, "charisma": 15, "luck": 5}'::jsonb,
 '{"model_type": "animated_sprite", "idle_animation": "purr_write", "size_scale": 1.2, "particle_effects": ["sparkle_ink"], "color_scheme": ["#4a4e69", "#9a8c98"]}'::jsonb),

('storysprite', 'Storysprite', 'A luminescent fairy of narrative', 'Storysprites emerge from particularly beloved tales, carrying fragments of their origin stories.', 'epic', 'light', 'Realm of Beloved Tales', 
 '{"happiness": 50, "energy": 120, "intelligence": 18, "strength": 6, "agility": 14, "charisma": 20, "luck": 12}'::jsonb,
 '{"model_type": "animated_sprite", "idle_animation": "float_glow", "size_scale": 0.6, "particle_effects": ["story_sparkles", "light_trail"], "color_scheme": ["#e0aaff", "#c77dff"]}'::jsonb),

('lorewyrm', 'Lorewyrm', 'An ancient dragon of knowledge', 'Lorewyrms are born from epics that have been told for millennia, growing wiser with each retelling.', 'legendary', 'fire', 'Halls of Ancient Scrolls', 
 '{"happiness": 50, "energy": 150, "intelligence": 25, "strength": 20, "agility": 8, "charisma": 18, "luck": 9}'::jsonb,
 '{"model_type": "animated_sprite", "idle_animation": "coil_read", "size_scale": 2.0, "particle_effects": ["ember_letters", "wisdom_glow"], "color_scheme": ["#7b2cbf", "#ff6b6b"]}'::jsonb),

('mythweaver', 'Mythweaver', 'A cosmic entity of pure imagination', 'Said to exist at the boundary between fiction and reality, Mythweavers can reshape stories with a thought.', 'mythic', 'cosmic', 'The Space Between Stories', 
 '{"happiness": 50, "energy": 200, "intelligence": 30, "strength": 15, "agility": 15, "charisma": 25, "luck": 15}'::jsonb,
 '{"model_type": "animated_sprite", "idle_animation": "reality_weave", "size_scale": 1.5, "particle_effects": ["star_trail", "reality_ripple", "cosmic_dust"], "color_scheme": ["#240046", "#ff6d00", "#ffffff"]}'::jsonb)
ON CONFLICT (species_key) DO NOTHING;

COMMENT ON SCHEMA public IS 'StxryAI Staff Roles, Permissions & Pet System 2.0';
