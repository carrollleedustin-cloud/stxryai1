-- StxryAI New Features Database Schema
-- Migration: 20260203_new_features_schema
-- Description: Database tables for all new features

-- ============================================
-- FEATURE 1: ENHANCED READING STREAKS
-- ============================================

-- Streak rewards definitions
CREATE TABLE IF NOT EXISTS streak_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    streak_days INTEGER NOT NULL UNIQUE,
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('xp', 'coins', 'badge', 'freeze_token', 'premium_day')),
    reward_amount INTEGER NOT NULL,
    badge_id UUID REFERENCES user_badges(id),
    title VARCHAR(100),
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streak freeze tokens
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

-- Streak milestone celebrations
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

-- Daily login bonuses
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
-- FEATURE 2: READING PROGRESS SYNC
-- ============================================

-- Cross-device reading positions
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

-- Reading history timeline
CREATE TABLE IF NOT EXISTS reading_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('started', 'resumed', 'completed_chapter', 'completed_story', 'bookmarked', 'choice_made')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Continue reading queue
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
-- FEATURE 3: RECOMMENDATIONS ENGINE
-- ============================================

-- User reading preferences (learned)
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

-- Story similarity scores (precomputed)
CREATE TABLE IF NOT EXISTS story_similarities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id_a UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    story_id_b UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    similarity_score DECIMAL(5,4) NOT NULL,
    similarity_reasons JSONB DEFAULT '[]'::jsonb,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id_a, story_id_b)
);

-- Personalized recommendations
CREATE TABLE IF NOT EXISTS user_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('because_you_read', 'similar_readers', 'trending', 'new_release', 'personalized', 'staff_pick', 'daily_pick')),
    score DECIMAL(5,4) NOT NULL,
    reason TEXT,
    source_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    shown_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Daily picks
CREATE TABLE IF NOT EXISTS daily_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pick_date DATE NOT NULL,
    story_ids JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, pick_date)
);

-- ============================================
-- FEATURE 4: SOCIAL PROOF
-- ============================================

-- Real-time reader counts
CREATE TABLE IF NOT EXISTS story_live_readers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Trending stories cache
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

-- Story milestones
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
-- FEATURE 5: AUDIO NARRATION PLAYER
-- ============================================

-- Audio player state (persistent)
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

-- Character voice assignments
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

-- Sleep timer settings
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

-- Audio generation cache
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
-- FEATURE 6: STORY COLLECTIONS
-- ============================================

-- Reading lists (user-created)
CREATE TABLE IF NOT EXISTS reading_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    list_type VARCHAR(50) DEFAULT 'custom' CHECK (list_type IN ('custom', 'read_later', 'favorites', 'currently_reading', 'completed')),
    cover_image_url TEXT,
    story_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading list items
CREATE TABLE IF NOT EXISTS reading_list_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(list_id, story_id)
);

-- List followers
CREATE TABLE IF NOT EXISTS reading_list_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(list_id, user_id)
);

-- Editorial/staff collections
CREATE TABLE IF NOT EXISTS editorial_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    cover_image_url TEXT,
    curator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    collection_type VARCHAR(50) NOT NULL CHECK (collection_type IN ('staff_picks', 'seasonal', 'themed', 'new_releases', 'hidden_gems', 'classics')),
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Editorial collection stories
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
-- FEATURE 7: WRITING CHALLENGES & CONTESTS
-- ============================================

-- Writing prompts
CREATE TABLE IF NOT EXISTS writing_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    prompt_text TEXT NOT NULL,
    genre VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    word_limit_min INTEGER,
    word_limit_max INTEGER,
    time_limit_hours INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_daily BOOLEAN DEFAULT false,
    prompt_date DATE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Writing contests
CREATE TABLE IF NOT EXISTS writing_contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rules TEXT,
    prompt_id UUID REFERENCES writing_prompts(id) ON DELETE SET NULL,
    contest_type VARCHAR(50) NOT NULL CHECK (contest_type IN ('weekly', 'monthly', 'seasonal', 'special')),
    theme VARCHAR(255),
    genre_restriction VARCHAR(100),
    word_limit_min INTEGER,
    word_limit_max INTEGER,
    prize_pool_coins INTEGER DEFAULT 0,
    prize_pool_description TEXT,
    entry_fee_coins INTEGER DEFAULT 0,
    max_entries INTEGER,
    voting_type VARCHAR(50) DEFAULT 'community' CHECK (voting_type IN ('community', 'judges', 'mixed')),
    submission_start TIMESTAMPTZ NOT NULL,
    submission_end TIMESTAMPTZ NOT NULL,
    voting_start TIMESTAMPTZ,
    voting_end TIMESTAMPTZ,
    results_announced_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'submissions_open', 'voting', 'judging', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contest entries
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

-- Contest votes
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

-- Contest judges
CREATE TABLE IF NOT EXISTS contest_judges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES writing_contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_lead_judge BOOLEAN DEFAULT false,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contest_id, user_id)
);

-- Seasonal events
CREATE TABLE IF NOT EXISTS seasonal_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    theme VARCHAR(255),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('halloween', 'holiday', 'summer', 'spring', 'custom')),
    badge_id UUID,
    special_rewards JSONB DEFAULT '[]'::jsonb,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FEATURE 8: ENHANCED SOCIAL FEATURES
-- ============================================

-- Author follows
CREATE TABLE IF NOT EXISTS author_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true,
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, author_id)
);

-- Activity feed
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'started_reading', 'completed_story', 'published_story', 'new_chapter',
        'joined_club', 'achievement_earned', 'streak_milestone', 'followed_you',
        'liked_story', 'commented', 'shared_story', 'contest_entered', 'contest_won'
    )),
    target_type VARCHAR(50),
    target_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reading buddies
CREATE TABLE IF NOT EXISTS reading_buddies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    buddy_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(user_id, buddy_id)
);

-- Book clubs (enhanced)
CREATE TABLE IF NOT EXISTS book_clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    max_members INTEGER DEFAULT 100,
    current_book_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    reading_pace VARCHAR(20) CHECK (reading_pace IN ('slow', 'moderate', 'fast', 'custom')),
    chapters_per_week INTEGER,
    discussion_day VARCHAR(20),
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Book club members
CREATE TABLE IF NOT EXISTS book_club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);

-- Book club discussions
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

-- Discussion replies
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
-- FEATURE 9: COLLABORATIVE WRITING
-- ============================================

-- Collaboration rooms
CREATE TABLE IF NOT EXISTS collaboration_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    name VARCHAR(255),
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('realtime', 'turn_based', 'voting')),
    max_collaborators INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    turn_duration_hours INTEGER,
    current_turn_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    turn_started_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room collaborators
CREATE TABLE IF NOT EXISTS room_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES collaboration_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'writer' CHECK (role IN ('owner', 'editor', 'writer', 'viewer')),
    is_online BOOLEAN DEFAULT false,
    cursor_position JSONB,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Collaborative edits (for operational transforms)
CREATE TABLE IF NOT EXISTS collaborative_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES collaboration_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE CASCADE,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('insert', 'delete', 'replace', 'move')),
    position INTEGER NOT NULL,
    content TEXT,
    length INTEGER,
    version INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community chapter voting
CREATE TABLE IF NOT EXISTS chapter_voting_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),
    description TEXT,
    voting_starts_at TIMESTAMPTZ NOT NULL,
    voting_ends_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapter voting options
CREATE TABLE IF NOT EXISTS chapter_voting_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chapter_voting_sessions(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content_preview TEXT NOT NULL,
    full_content TEXT,
    vote_count INTEGER DEFAULT 0,
    is_winner BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapter votes
CREATE TABLE IF NOT EXISTS chapter_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chapter_voting_sessions(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES chapter_voting_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

-- Writer room chat
CREATE TABLE IF NOT EXISTS room_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES collaboration_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'suggestion')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FEATURE 10: STORY BRANCHING VISUALIZER
-- ============================================

-- Story branch nodes
CREATE TABLE IF NOT EXISTS story_branch_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE CASCADE,
    node_type VARCHAR(20) NOT NULL CHECK (node_type IN ('start', 'chapter', 'choice', 'ending')),
    label VARCHAR(255),
    x_position DECIMAL(10,2),
    y_position DECIMAL(10,2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story branch edges
CREATE TABLE IF NOT EXISTS story_branch_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    from_node_id UUID NOT NULL REFERENCES story_branch_nodes(id) ON DELETE CASCADE,
    to_node_id UUID NOT NULL REFERENCES story_branch_nodes(id) ON DELETE CASCADE,
    choice_text TEXT,
    condition JSONB,
    traversal_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User path history
CREATE TABLE IF NOT EXISTS user_story_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    path_nodes JSONB NOT NULL,
    ending_reached VARCHAR(100),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Path completion tracking
CREATE TABLE IF NOT EXISTS story_path_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    total_paths INTEGER DEFAULT 0,
    paths_completed INTEGER DEFAULT 0,
    endings_discovered JSONB DEFAULT '[]'::jsonb,
    all_endings_badge_awarded BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- Choice popularity heatmap
CREATE TABLE IF NOT EXISTS choice_heatmap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
    choice_id UUID REFERENCES story_choices(id) ON DELETE CASCADE,
    choice_index INTEGER NOT NULL,
    selection_count INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, chapter_id, choice_index)
);

-- ============================================
-- FEATURE 11: AI STORY COMPANION
-- ============================================

-- Character chat sessions
CREATE TABLE IF NOT EXISTS character_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    character_name VARCHAR(255) NOT NULL,
    character_persona TEXT,
    is_active BOOLEAN DEFAULT true,
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);

-- Character chat messages
CREATE TABLE IF NOT EXISTS character_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES character_chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'character')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- What-if scenarios
CREATE TABLE IF NOT EXISTS what_if_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    generated_scenario TEXT,
    tokens_used INTEGER,
    is_saved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story recaps
CREATE TABLE IF NOT EXISTS story_recaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    recap_type VARCHAR(20) NOT NULL CHECK (recap_type IN ('quick', 'detailed', 'character_focused', 'plot_focused')),
    recap_content TEXT NOT NULL,
    chapters_covered JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI mood recommendations
CREATE TABLE IF NOT EXISTS mood_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    detected_mood VARCHAR(50),
    user_stated_mood VARCHAR(50),
    recommended_stories JSONB NOT NULL,
    reasoning TEXT,
    feedback VARCHAR(20) CHECK (feedback IN ('helpful', 'not_helpful', 'perfect')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FEATURE 12: PWA ENHANCEMENTS
-- ============================================

-- Offline downloads
CREATE TABLE IF NOT EXISTS offline_story_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    download_version INTEGER DEFAULT 1,
    chapters_downloaded JSONB DEFAULT '[]'::jsonb,
    audio_downloaded BOOLEAN DEFAULT false,
    images_downloaded BOOLEAN DEFAULT false,
    total_size_bytes BIGINT,
    downloaded_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, story_id)
);

-- Push notification tokens
CREATE TABLE IF NOT EXISTS push_notification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('web', 'ios', 'android')),
    device_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    UNIQUE(user_id, token)
);

-- Notification queue
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0
);

-- Data usage preferences
CREATE TABLE IF NOT EXISTS data_usage_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reduced_data_mode BOOLEAN DEFAULT false,
    auto_download_wifi_only BOOLEAN DEFAULT true,
    image_quality VARCHAR(20) DEFAULT 'high' CHECK (image_quality IN ('low', 'medium', 'high', 'original')),
    preload_next_chapter BOOLEAN DEFAULT true,
    cache_audio BOOLEAN DEFAULT false,
    max_cache_size_mb INTEGER DEFAULT 500,
    UNIQUE(user_id)
);

-- ============================================
-- FEATURE 13: TIERED CONTENT
-- ============================================

-- Story access tiers
CREATE TABLE IF NOT EXISTS story_access_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    tier_type VARCHAR(50) NOT NULL CHECK (tier_type IN ('free', 'free_preview', 'premium', 'early_access', 'subscriber_only')),
    free_chapters INTEGER DEFAULT 0,
    preview_percentage INTEGER DEFAULT 0,
    early_access_days INTEGER DEFAULT 0,
    price_coins INTEGER,
    price_usd DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id)
);

-- User content purchases
CREATE TABLE IF NOT EXISTS content_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    purchase_type VARCHAR(50) NOT NULL CHECK (purchase_type IN ('full_access', 'chapter', 'early_access')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('coins', 'stripe', 'gift')),
    amount_paid DECIMAL(10,2),
    coins_spent INTEGER,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, story_id, purchase_type)
);

-- Early access queue
CREATE TABLE IF NOT EXISTS early_access_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
    early_access_until TIMESTAMPTZ NOT NULL,
    public_release_at TIMESTAMPTZ NOT NULL,
    notified_subscribers BOOLEAN DEFAULT false
);

-- ============================================
-- FEATURE 14: CREATOR TIPPING
-- ============================================

-- Author tip jars
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

-- Tips received
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

-- Super comments
CREATE TABLE IF NOT EXISTS super_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES story_comments(id) ON DELETE CASCADE,
    highlight_color VARCHAR(20) DEFAULT 'gold',
    amount_paid_coins INTEGER NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly supporters
CREATE TABLE IF NOT EXISTS author_supporters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier VARCHAR(50) DEFAULT 'supporter' CHECK (tier IN ('supporter', 'super_supporter', 'patron')),
    monthly_amount_usd DECIMAL(10,2),
    stripe_subscription_id VARCHAR(255),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    UNIQUE(author_id, supporter_id)
);

-- Supporter badges
CREATE TABLE IF NOT EXISTS supporter_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    months_supported INTEGER DEFAULT 1,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(author_id, supporter_id, badge_type)
);

-- Patron-exclusive content
CREATE TABLE IF NOT EXISTS patron_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('story', 'chapter', 'post', 'poll', 'behind_the_scenes')),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    minimum_tier VARCHAR(50) DEFAULT 'supporter',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FEATURE 15: STORY MARKETPLACE
-- ============================================

-- Marketplace listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_type VARCHAR(50) NOT NULL CHECK (listing_type IN ('single_purchase', 'subscription', 'bundle', 'rental')),
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

-- Bundle deals
CREATE TABLE IF NOT EXISTS story_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_usd DECIMAL(10,2) NOT NULL,
    savings_percentage INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bundle contents
CREATE TABLE IF NOT EXISTS bundle_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES story_bundles(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    UNIQUE(bundle_id, story_id)
);

-- Marketplace purchases
CREATE TABLE IF NOT EXISTS marketplace_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
    bundle_id UUID REFERENCES story_bundles(id) ON DELETE SET NULL,
    amount_paid_usd DECIMAL(10,2) NOT NULL,
    platform_fee_usd DECIMAL(10,2),
    seller_revenue_usd DECIMAL(10,2),
    stripe_payment_id VARCHAR(255),
    purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift transactions
CREATE TABLE IF NOT EXISTS story_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    gift_message TEXT,
    amount_paid_usd DECIMAL(10,2),
    redeemed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Author revenue tracking
CREATE TABLE IF NOT EXISTS author_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_revenue_usd DECIMAL(12,2) DEFAULT 0,
    platform_fees_usd DECIMAL(12,2) DEFAULT 0,
    net_revenue_usd DECIMAL(12,2) DEFAULT 0,
    tips_received_usd DECIMAL(12,2) DEFAULT 0,
    subscriptions_revenue_usd DECIMAL(12,2) DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    payout_status VARCHAR(20) DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid', 'held')),
    payout_date TIMESTAMPTZ,
    UNIQUE(author_id, period_start)
);

-- ============================================
-- FEATURE 16: DYNAMIC STORY PERSONAS
-- ============================================

-- Reader personas
CREATE TABLE IF NOT EXISTS reader_personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    background_story TEXT,
    personality_traits JSONB DEFAULT '[]'::jsonb,
    preferred_choices JSONB DEFAULT '{}'::jsonb,
    stats JSONB DEFAULT '{"strength": 10, "intelligence": 10, "charisma": 10, "luck": 10}'::jsonb,
    experience_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Persona story states
CREATE TABLE IF NOT EXISTS persona_story_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES reader_personas(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    current_stats JSONB,
    inventory JSONB DEFAULT '[]'::jsonb,
    relationships JSONB DEFAULT '{}'::jsonb,
    flags JSONB DEFAULT '{}'::jsonb,
    choices_made JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, story_id)
);

-- Persona achievements
CREATE TABLE IF NOT EXISTS persona_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES reader_personas(id) ON DELETE CASCADE,
    achievement_name VARCHAR(255) NOT NULL,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id, achievement_name)
);

-- Persona evolution history
CREATE TABLE IF NOT EXISTS persona_evolution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES reader_personas(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('level_up', 'stat_change', 'trait_gained', 'trait_lost', 'story_completed')),
    old_value JSONB,
    new_value JSONB,
    source_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FEATURE 17: LIVING WORLD STORIES
-- ============================================

-- Living world stories
CREATE TABLE IF NOT EXISTS living_world_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    is_living BOOLEAN DEFAULT true,
    update_frequency VARCHAR(20) CHECK (update_frequency IN ('daily', 'weekly', 'event_based', 'realtime')),
    current_state JSONB DEFAULT '{}'::jsonb,
    total_participants INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id)
);

-- World events
CREATE TABLE IF NOT EXISTS world_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    living_world_id UUID NOT NULL REFERENCES living_world_stories(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('story_update', 'community_decision', 'seasonal', 'milestone', 'random')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    effects JSONB DEFAULT '{}'::jsonb,
    triggered_by VARCHAR(50),
    trigger_threshold INTEGER,
    current_progress INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community decisions
CREATE TABLE IF NOT EXISTS community_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    living_world_id UUID NOT NULL REFERENCES living_world_stories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    votes JSONB DEFAULT '{}'::jsonb,
    winning_option_index INTEGER,
    voting_ends_at TIMESTAMPTZ NOT NULL,
    result_applied BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community decision votes
CREATE TABLE IF NOT EXISTS community_decision_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID NOT NULL REFERENCES community_decisions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(decision_id, user_id)
);

-- Seasonal story updates
CREATE TABLE IF NOT EXISTS seasonal_story_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    living_world_id UUID NOT NULL REFERENCES living_world_stories(id) ON DELETE CASCADE,
    season VARCHAR(20) NOT NULL CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'holiday')),
    year INTEGER NOT NULL,
    changes JSONB NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(living_world_id, season, year)
);

-- ============================================
-- FEATURE 18: AI WRITING COACH
-- ============================================

-- Writing sessions
CREATE TABLE IF NOT EXISTS writing_coach_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('general', 'story_specific', 'genre_focused', 'style_improvement')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    feedback_count INTEGER DEFAULT 0,
    words_analyzed INTEGER DEFAULT 0
);

-- Writing feedback
CREATE TABLE IF NOT EXISTS writing_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES writing_coach_sessions(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('grammar', 'style', 'pacing', 'dialogue', 'description', 'plot', 'character', 'general')),
    severity VARCHAR(20) CHECK (severity IN ('suggestion', 'minor', 'moderate', 'major')),
    original_text TEXT,
    suggestion TEXT,
    explanation TEXT,
    position_start INTEGER,
    position_end INTEGER,
    accepted BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Genre analysis
CREATE TABLE IF NOT EXISTS genre_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    analyzed_genre VARCHAR(100),
    genre_fit_score DECIMAL(5,2),
    genre_elements JSONB DEFAULT '[]'::jsonb,
    missing_elements JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id)
);

-- Pacing analysis
CREATE TABLE IF NOT EXISTS pacing_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE CASCADE,
    pacing_score DECIMAL(5,2),
    pacing_curve JSONB,
    slow_sections JSONB DEFAULT '[]'::jsonb,
    fast_sections JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character consistency
CREATE TABLE IF NOT EXISTS character_consistency_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    character_name VARCHAR(255) NOT NULL,
    consistency_score DECIMAL(5,2),
    personality_drift JSONB DEFAULT '[]'::jsonb,
    dialogue_consistency DECIMAL(5,2),
    issues_found JSONB DEFAULT '[]'::jsonb,
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plot hole detection
CREATE TABLE IF NOT EXISTS plot_hole_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    potential_holes JSONB DEFAULT '[]'::jsonb,
    timeline_issues JSONB DEFAULT '[]'::jsonb,
    continuity_errors JSONB DEFAULT '[]'::jsonb,
    unresolved_threads JSONB DEFAULT '[]'::jsonb,
    severity_score DECIMAL(5,2),
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id)
);

-- ============================================
-- FEATURE 19: STORY SOUNDTRACKS
-- ============================================

-- Story soundtracks
CREATE TABLE IF NOT EXISTS story_soundtracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255),
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    platform VARCHAR(50) CHECK (platform IN ('spotify', 'apple_music', 'youtube_music', 'custom')),
    playlist_url TEXT,
    playlist_id VARCHAR(255),
    track_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(story_id, name)
);

-- Soundtrack tracks
CREATE TABLE IF NOT EXISTS soundtrack_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    soundtrack_id UUID NOT NULL REFERENCES story_soundtracks(id) ON DELETE CASCADE,
    track_name VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    platform_track_id VARCHAR(255),
    duration_seconds INTEGER,
    preview_url TEXT,
    order_index INTEGER DEFAULT 0
);

-- Chapter music cues
CREATE TABLE IF NOT EXISTS chapter_music_cues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
    soundtrack_id UUID REFERENCES story_soundtracks(id) ON DELETE SET NULL,
    track_id UUID REFERENCES soundtrack_tracks(id) ON DELETE SET NULL,
    cue_type VARCHAR(50) CHECK (cue_type IN ('chapter_start', 'mood_change', 'action', 'emotional', 'ending')),
    trigger_position INTEGER,
    trigger_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ambient sounds
CREATE TABLE IF NOT EXISTS ambient_sounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('nature', 'weather', 'urban', 'fantasy', 'scifi', 'horror', 'calm')),
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER,
    is_loopable BOOLEAN DEFAULT true
);

-- Chapter ambient sounds
CREATE TABLE IF NOT EXISTS chapter_ambient_sounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
    ambient_sound_id UUID NOT NULL REFERENCES ambient_sounds(id) ON DELETE CASCADE,
    volume DECIMAL(3,2) DEFAULT 0.5,
    starts_at_position INTEGER DEFAULT 0,
    ends_at_position INTEGER,
    UNIQUE(chapter_id, ambient_sound_id)
);

-- User sound preferences
CREATE TABLE IF NOT EXISTS user_sound_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    music_enabled BOOLEAN DEFAULT true,
    ambient_enabled BOOLEAN DEFAULT true,
    music_volume DECIMAL(3,2) DEFAULT 0.7,
    ambient_volume DECIMAL(3,2) DEFAULT 0.5,
    auto_play_music BOOLEAN DEFAULT false,
    preferred_platform VARCHAR(50) DEFAULT 'spotify',
    connected_spotify BOOLEAN DEFAULT false,
    spotify_access_token TEXT,
    spotify_refresh_token TEXT,
    UNIQUE(user_id)
);

-- ============================================
-- FEATURE 20: READING ANALYTICS DASHBOARD
-- ============================================

-- User reading analytics
CREATE TABLE IF NOT EXISTS user_reading_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly', 'all_time')),
    period_start DATE NOT NULL,
    stories_read INTEGER DEFAULT 0,
    chapters_read INTEGER DEFAULT 0,
    words_read BIGINT DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    choices_made INTEGER DEFAULT 0,
    stories_completed INTEGER DEFAULT 0,
    genres_breakdown JSONB DEFAULT '{}'::jsonb,
    reading_days INTEGER DEFAULT 0,
    avg_session_minutes DECIMAL(10,2) DEFAULT 0,
    favorite_genre VARCHAR(100),
    favorite_author_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period, period_start)
);

-- Reading challenges
CREATE TABLE IF NOT EXISTS reading_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    challenge_type VARCHAR(50) NOT NULL CHECK (challenge_type IN ('books_goal', 'pages_goal', 'genre_diversity', 'author_variety', 'streak_goal')),
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, year, challenge_type)
);

-- Reading trends
CREATE TABLE IF NOT EXISTS reading_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trend_date DATE NOT NULL,
    minutes_read INTEGER DEFAULT 0,
    chapters_read INTEGER DEFAULT 0,
    mood VARCHAR(50),
    time_of_day VARCHAR(20) CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
    device_type VARCHAR(50),
    UNIQUE(user_id, trend_date)
);

-- Genre exploration
CREATE TABLE IF NOT EXISTS genre_exploration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    genre VARCHAR(100) NOT NULL,
    stories_read INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    first_read_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ,
    preference_score DECIMAL(5,2) DEFAULT 0,
    UNIQUE(user_id, genre)
);

-- Yearly wrapped
CREATE TABLE IF NOT EXISTS yearly_wrapped (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_stories INTEGER DEFAULT 0,
    total_chapters INTEGER DEFAULT 0,
    total_words BIGINT DEFAULT 0,
    total_time_hours INTEGER DEFAULT 0,
    top_genres JSONB DEFAULT '[]'::jsonb,
    top_authors JSONB DEFAULT '[]'::jsonb,
    top_stories JSONB DEFAULT '[]'::jsonb,
    longest_streak INTEGER DEFAULT 0,
    achievements_earned INTEGER DEFAULT 0,
    reading_personality VARCHAR(100),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, year)
);

-- ============================================
-- INDEXES
-- ============================================

-- Streaks
CREATE INDEX IF NOT EXISTS idx_streak_rewards_days ON streak_rewards(streak_days);
CREATE INDEX IF NOT EXISTS idx_daily_login_user_date ON daily_login_bonuses(user_id, login_date);

-- Reading sync
CREATE INDEX IF NOT EXISTS idx_reading_positions_user ON reading_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user ON reading_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_continue_reading_user ON continue_reading(user_id, last_read_at DESC);

-- Recommendations
CREATE INDEX IF NOT EXISTS idx_user_recommendations_user ON user_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_story_similarities_a ON story_similarities(story_id_a);
CREATE INDEX IF NOT EXISTS idx_daily_picks_user_date ON daily_picks(user_id, pick_date);

-- Social proof
CREATE INDEX IF NOT EXISTS idx_story_live_readers_story ON story_live_readers(story_id);
CREATE INDEX IF NOT EXISTS idx_trending_stories_period ON trending_stories(period, rank);

-- Audio
CREATE INDEX IF NOT EXISTS idx_audio_cache_hash ON audio_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_audio_player_user ON audio_player_state(user_id);

-- Collections
CREATE INDEX IF NOT EXISTS idx_reading_lists_user ON reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_stories_list ON reading_list_stories(list_id);
CREATE INDEX IF NOT EXISTS idx_editorial_featured ON editorial_collections(is_featured) WHERE is_featured = true;

-- Challenges
CREATE INDEX IF NOT EXISTS idx_writing_contests_status ON writing_contests(status);
CREATE INDEX IF NOT EXISTS idx_contest_entries_contest ON contest_entries(contest_id);

-- Social
CREATE INDEX IF NOT EXISTS idx_author_follows_author ON author_follows(author_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_book_clubs_public ON book_clubs(is_public) WHERE is_public = true;

-- Collaboration
CREATE INDEX IF NOT EXISTS idx_collab_rooms_story ON collaboration_rooms(story_id);
CREATE INDEX IF NOT EXISTS idx_chapter_voting_story ON chapter_voting_sessions(story_id);

-- Branching
CREATE INDEX IF NOT EXISTS idx_branch_nodes_story ON story_branch_nodes(story_id);
CREATE INDEX IF NOT EXISTS idx_user_story_paths_user ON user_story_paths(user_id);

-- AI Companion
CREATE INDEX IF NOT EXISTS idx_char_chat_user ON character_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_what_if_user ON what_if_scenarios(user_id);

-- PWA
CREATE INDEX IF NOT EXISTS idx_offline_downloads_user ON offline_story_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON notification_queue(scheduled_for) WHERE sent_at IS NULL;

-- Marketplace
CREATE INDEX IF NOT EXISTS idx_marketplace_active ON marketplace_listings(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer ON marketplace_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_author_revenue_author ON author_revenue(author_id);

-- Personas
CREATE INDEX IF NOT EXISTS idx_reader_personas_user ON reader_personas(user_id);
CREATE INDEX IF NOT EXISTS idx_persona_states_persona ON persona_story_states(persona_id);

-- Living worlds
CREATE INDEX IF NOT EXISTS idx_world_events_world ON world_events(living_world_id, is_active);
CREATE INDEX IF NOT EXISTS idx_community_decisions_world ON community_decisions(living_world_id);

-- Writing coach
CREATE INDEX IF NOT EXISTS idx_writing_sessions_user ON writing_coach_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_feedback_session ON writing_feedback(session_id);

-- Soundtracks
CREATE INDEX IF NOT EXISTS idx_soundtracks_story ON story_soundtracks(story_id);
CREATE INDEX IF NOT EXISTS idx_music_cues_chapter ON chapter_music_cues(chapter_id);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_reading_analytics_user ON user_reading_analytics(user_id, period);
CREATE INDEX IF NOT EXISTS idx_reading_trends_user ON reading_trends(user_id, trend_date);
CREATE INDEX IF NOT EXISTS idx_yearly_wrapped_user ON yearly_wrapped(user_id, year);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE streak_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_freeze_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_login_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE continue_reading ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_similarities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_live_readers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_player_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_character_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_sleep_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_collection_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_club_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_club_discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_voting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_voting_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_branch_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_branch_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_story_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_path_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE choice_heatmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE what_if_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_recaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_story_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_usage_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_access_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE early_access_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_tip_jars ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE super_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporter_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE patron_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE reader_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_story_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE living_world_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_decision_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_story_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacing_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_consistency_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_hole_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_soundtracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE soundtrack_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_music_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambient_sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_ambient_sounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sound_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_exploration ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_wrapped ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BASIC RLS POLICIES (User owns their data)
-- ============================================

-- User-owned tables pattern
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'streak_freeze_tokens', 'streak_milestones', 'daily_login_bonuses',
        'reading_positions', 'reading_history', 'continue_reading',
        'user_reading_preferences', 'user_recommendations', 'daily_picks',
        'audio_player_state', 'audio_sleep_timers', 'activity_feed',
        'offline_story_downloads', 'push_notification_tokens', 'data_usage_preferences',
        'reader_personas', 'user_sound_preferences', 'user_reading_analytics',
        'reading_challenges', 'reading_trends', 'genre_exploration', 'yearly_wrapped',
        'character_chat_sessions', 'what_if_scenarios', 'story_recaps', 'mood_recommendations',
        'writing_coach_sessions', 'story_path_completions', 'user_story_paths'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format('CREATE POLICY "Users manage own %I" ON %I FOR ALL USING (auth.uid() = user_id)', tbl, tbl);
    END LOOP;
END $$;

-- Public readable tables
CREATE POLICY "Anyone can view streak rewards" ON streak_rewards FOR SELECT USING (true);
CREATE POLICY "Anyone can view trending stories" ON trending_stories FOR SELECT USING (true);
CREATE POLICY "Anyone can view story milestones" ON story_milestones FOR SELECT USING (true);
CREATE POLICY "Anyone can view editorial collections" ON editorial_collections FOR SELECT USING (true);
CREATE POLICY "Anyone can view editorial stories" ON editorial_collection_stories FOR SELECT USING (true);
CREATE POLICY "Anyone can view writing prompts" ON writing_prompts FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active contests" ON writing_contests FOR SELECT USING (status != 'cancelled');
CREATE POLICY "Anyone can view seasonal events" ON seasonal_events FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view public book clubs" ON book_clubs FOR SELECT USING (is_public = true);
CREATE POLICY "Anyone can view ambient sounds" ON ambient_sounds FOR SELECT USING (true);
CREATE POLICY "Anyone can view story similarities" ON story_similarities FOR SELECT USING (true);
CREATE POLICY "Anyone can view choice heatmap" ON choice_heatmap FOR SELECT USING (true);
CREATE POLICY "Anyone can view story access tiers" ON story_access_tiers FOR SELECT USING (true);
CREATE POLICY "Anyone can view active listings" ON marketplace_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view bundles" ON story_bundles FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view author tip jars" ON author_tip_jars FOR SELECT USING (is_enabled = true);
CREATE POLICY "Anyone can view living world stories" ON living_world_stories FOR SELECT USING (is_living = true);
CREATE POLICY "Anyone can view world events" ON world_events FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view branch nodes" ON story_branch_nodes FOR SELECT USING (true);
CREATE POLICY "Anyone can view branch edges" ON story_branch_edges FOR SELECT USING (true);
CREATE POLICY "Anyone can view soundtracks" ON story_soundtracks FOR SELECT USING (true);
CREATE POLICY "Anyone can view soundtrack tracks" ON soundtrack_tracks FOR SELECT USING (true);

-- Public reading lists
CREATE POLICY "Anyone can view public lists" ON reading_lists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users manage own lists" ON reading_lists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "View list stories" ON reading_list_stories FOR SELECT USING (
    list_id IN (SELECT id FROM reading_lists WHERE is_public = true OR user_id = auth.uid())
);
CREATE POLICY "Manage own list stories" ON reading_list_stories FOR ALL USING (
    list_id IN (SELECT id FROM reading_lists WHERE user_id = auth.uid())
);

-- Author follows
CREATE POLICY "Manage own follows" ON author_follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Authors see their followers" ON author_follows FOR SELECT USING (auth.uid() = author_id);

-- Reading buddies
CREATE POLICY "Manage buddy requests" ON reading_buddies FOR ALL USING (auth.uid() = user_id OR auth.uid() = buddy_id);

-- Contest entries
CREATE POLICY "View contest entries" ON contest_entries FOR SELECT USING (true);
CREATE POLICY "Create own entries" ON contest_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Manage own entries" ON contest_entries FOR UPDATE USING (auth.uid() = user_id);

-- Contest votes
CREATE POLICY "Vote in contests" ON contest_votes FOR ALL USING (auth.uid() = voter_id);

-- Book club membership
CREATE POLICY "View club members" ON book_club_members FOR SELECT USING (true);
CREATE POLICY "Join clubs" ON book_club_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Leave clubs" ON book_club_members FOR DELETE USING (auth.uid() = user_id);

-- Purchases
CREATE POLICY "Users see own purchases" ON content_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users see own marketplace purchases" ON marketplace_purchases FOR SELECT USING (auth.uid() = buyer_id);

-- Tips
CREATE POLICY "Create tips" ON author_tips FOR INSERT WITH CHECK (auth.uid() = tipper_id OR is_anonymous = true);
CREATE POLICY "Authors see received tips" ON author_tips FOR SELECT USING (auth.uid() = author_id);

-- Revenue
CREATE POLICY "Authors see own revenue" ON author_revenue FOR SELECT USING (auth.uid() = author_id);

-- Live readers (for counting)
CREATE POLICY "Manage own live status" ON story_live_readers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "View live reader counts" ON story_live_readers FOR SELECT USING (true);

-- ============================================
-- COMPLETE
-- ============================================

COMMENT ON SCHEMA public IS 'StxryAI new features schema - v2.0.0';
