-- StxryAI Complete Database Schema
-- Migration: 20260203_complete_schema
-- Description: Creates all missing tables for production launch

-- ============================================
-- SECTION 1: FAMILY & PROFILES
-- ============================================

-- Family profiles table
CREATE TABLE IF NOT EXISTS family_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    birth_year INTEGER,
    age_range VARCHAR(20) CHECK (age_range IN ('child', 'teen', 'adult')),
    content_restrictions JSONB DEFAULT '{"max_age_rating": "all", "blocked_genres": [], "time_limits": null}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    pin_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reading streaks (enhanced)
CREATE TABLE IF NOT EXISTS user_reading_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_read_date DATE,
    streak_started_at TIMESTAMPTZ,
    total_days_read INTEGER DEFAULT 0,
    freeze_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- SECTION 2: PUSH NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    story_updates BOOLEAN DEFAULT true,
    social_notifications BOOLEAN DEFAULT true,
    achievement_notifications BOOLEAN DEFAULT true,
    marketing_notifications BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 3: MESSAGING SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
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
    is_admin BOOLEAN DEFAULT false,
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'story_share', 'system')),
    metadata JSONB DEFAULT '{}'::jsonb,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 4: SOCIAL FEATURES
-- ============================================

CREATE TABLE IF NOT EXISTS story_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitter', 'facebook', 'linkedin', 'email', 'copy_link', 'internal')),
    shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pet_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES user_pets(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('feed', 'play', 'pet', 'train', 'accessorize', 'name')),
    xp_earned INTEGER DEFAULT 0,
    happiness_change INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 5: CHALLENGES & GAMIFICATION
-- ============================================

CREATE TABLE IF NOT EXISTS story_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50) NOT NULL CHECK (challenge_type IN ('writing', 'reading', 'community', 'creative')),
    requirements JSONB NOT NULL,
    rewards JSONB NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    max_participants INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES story_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),
    progress JSONB DEFAULT '{}'::jsonb,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS challenge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES story_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    submission_content TEXT,
    submission_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'winner')),
    score INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS challenge_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES challenge_submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) DEFAULT 'upvote' CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, user_id)
);

CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50) NOT NULL,
    requirements JSONB NOT NULL,
    rewards JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_reading_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    target_minutes INTEGER DEFAULT 30,
    actual_minutes INTEGER DEFAULT 0,
    target_chapters INTEGER DEFAULT 1,
    actual_chapters INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS reading_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    minutes_read INTEGER DEFAULT 0,
    chapters_read INTEGER DEFAULT 0,
    stories_completed INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS weekly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements JSONB NOT NULL,
    rewards JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(week_start)
);

CREATE TABLE IF NOT EXISTS user_weekly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weekly_challenge_id UUID NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
    progress JSONB DEFAULT '{}'::jsonb,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, weekly_challenge_id)
);

-- ============================================
-- SECTION 6: CONTENT & EXPORTS
-- ============================================

CREATE TABLE IF NOT EXISTS story_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    format VARCHAR(20) NOT NULL CHECK (format IN ('pdf', 'epub', 'txt', 'html', 'json')),
    file_url TEXT,
    file_size INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    options JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS chapter_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    target_chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    consequence_text TEXT,
    is_premium BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    conditions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS writing_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('story_structure', 'character', 'world', 'chapter', 'prompt')),
    content JSONB NOT NULL,
    is_premium BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES writing_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 7: ANALYTICS & SESSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    words_read INTEGER,
    choices_made INTEGER DEFAULT 0,
    device_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES story_chapters(id) ON DELETE CASCADE,
    choice_id UUID REFERENCES story_choices(id) ON DELETE SET NULL,
    choice_text TEXT,
    chosen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, story_id)
);

-- ============================================
-- SECTION 8: MILESTONES
-- ============================================

CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    milestone_type VARCHAR(50) NOT NULL CHECK (milestone_type IN ('reading', 'writing', 'social', 'streak', 'achievement')),
    threshold INTEGER NOT NULL,
    rewards JSONB DEFAULT '{}'::jsonb,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    celebrated BOOLEAN DEFAULT false,
    UNIQUE(user_id, milestone_id)
);

CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_stories_read INTEGER DEFAULT 0,
    total_chapters_read INTEGER DEFAULT 0,
    total_words_read INTEGER DEFAULT 0,
    total_time_reading_seconds INTEGER DEFAULT 0,
    total_stories_written INTEGER DEFAULT 0,
    total_chapters_written INTEGER DEFAULT 0,
    total_words_written INTEGER DEFAULT 0,
    total_likes_received INTEGER DEFAULT 0,
    total_comments_received INTEGER DEFAULT 0,
    total_followers INTEGER DEFAULT 0,
    total_following INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- SECTION 9: REFERRALS
-- ============================================

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referral_code VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'qualified', 'rewarded')),
    referred_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    signed_up_at TIMESTAMPTZ,
    qualified_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('coins', 'premium_days', 'badge', 'xp')),
    reward_value INTEGER NOT NULL,
    claimed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS share_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('story', 'profile', 'achievement', 'club')),
    content_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL,
    tracking_code VARCHAR(100),
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 10: AUDIO/TTS
-- ============================================

CREATE TABLE IF NOT EXISTS audio_playback_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES story_chapters(id) ON DELETE SET NULL,
    voice_id VARCHAR(100),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    position_seconds INTEGER DEFAULT 0,
    playback_speed DECIMAL(3,2) DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS user_tts_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    default_voice VARCHAR(100) DEFAULT 'alloy',
    playback_speed DECIMAL(3,2) DEFAULT 1.0,
    auto_play BOOLEAN DEFAULT false,
    highlight_text BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- SECTION 11: ANALYTICS STORAGE (for production)
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50),
    event_data JSONB DEFAULT '{}'::jsonb,
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_hash VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    page_url TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20,4) NOT NULL,
    metric_unit VARCHAR(50),
    dimensions JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SECTION 12: NEWSLETTER
-- ============================================

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    preferences JSONB DEFAULT '{"marketing": true, "product_updates": true, "weekly_digest": true}'::jsonb,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- ============================================
-- SECTION 13: INDEXES FOR PERFORMANCE
-- ============================================

-- Family profiles
CREATE INDEX IF NOT EXISTS idx_family_profiles_parent ON family_profiles(parent_user_id);

-- Reading streaks
CREATE INDEX IF NOT EXISTS idx_user_reading_streaks_user ON user_reading_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_streaks_date ON user_reading_streaks(last_read_date);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user_status ON scheduled_notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled ON scheduled_notifications(scheduled_for) WHERE status = 'pending';

-- Messaging
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);

-- Challenges
CREATE INDEX IF NOT EXISTS idx_story_challenges_active ON story_challenges(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_story ON reading_sessions(story_id);

-- Referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- ============================================
-- SECTION 14: ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reading_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_playback_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tts_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 15: RLS POLICIES
-- ============================================

-- Family profiles: Users can manage their own family profiles
CREATE POLICY "Users can view own family profiles" ON family_profiles FOR SELECT USING (auth.uid() = parent_user_id);
CREATE POLICY "Users can create own family profiles" ON family_profiles FOR INSERT WITH CHECK (auth.uid() = parent_user_id);
CREATE POLICY "Users can update own family profiles" ON family_profiles FOR UPDATE USING (auth.uid() = parent_user_id);
CREATE POLICY "Users can delete own family profiles" ON family_profiles FOR DELETE USING (auth.uid() = parent_user_id);

-- User reading streaks: Users can manage their own streaks
CREATE POLICY "Users can view own streaks" ON user_reading_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own streaks" ON user_reading_streaks FOR ALL USING (auth.uid() = user_id);

-- Push subscriptions: Users can manage their own subscriptions
CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Notification preferences: Users can manage their own preferences
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- Scheduled notifications: Users can view their own notifications
CREATE POLICY "Users can view own scheduled notifications" ON scheduled_notifications FOR SELECT USING (auth.uid() = user_id);

-- Conversations: Participants can view their conversations
CREATE POLICY "Participants can view conversations" ON conversations FOR SELECT 
USING (id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

-- Messages: Participants can view and send messages
CREATE POLICY "Participants can view messages" ON messages FOR SELECT 
USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));
CREATE POLICY "Users can send messages" ON messages FOR INSERT 
WITH CHECK (sender_id = auth.uid() AND conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

-- Story shares: Users can manage their own shares
CREATE POLICY "Users can manage own shares" ON story_shares FOR ALL USING (auth.uid() = shared_by);
CREATE POLICY "Anyone can view shares" ON story_shares FOR SELECT USING (true);

-- Challenges: Public viewing, authenticated participation
CREATE POLICY "Anyone can view active challenges" ON story_challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own challenge participation" ON challenge_participants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own submissions" ON challenge_submissions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can vote once" ON challenge_votes FOR ALL USING (auth.uid() = user_id);

-- Daily challenges: Public viewing
CREATE POLICY "Anyone can view daily challenges" ON daily_challenges FOR SELECT USING (true);

-- Reading goals: Users manage their own
CREATE POLICY "Users can manage own reading goals" ON daily_reading_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reading calendar" ON reading_calendar FOR ALL USING (auth.uid() = user_id);

-- Collections: Public can view public, owners manage all
CREATE POLICY "Anyone can view public collections" ON user_collections FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own collections" ON user_collections FOR ALL USING (auth.uid() = user_id);

-- Templates: Public can view public templates
CREATE POLICY "Anyone can view public templates" ON writing_templates FOR SELECT USING (is_public = true);
CREATE POLICY "Authors can manage own templates" ON writing_templates FOR ALL USING (auth.uid() = created_by);

-- Milestones: Public viewing
CREATE POLICY "Anyone can view milestones" ON milestones FOR SELECT USING (true);
CREATE POLICY "Users can manage own milestone progress" ON user_milestones FOR ALL USING (auth.uid() = user_id);

-- User stats: Users can view all, manage own
CREATE POLICY "Anyone can view user stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "Users can manage own stats" ON user_stats FOR ALL USING (auth.uid() = user_id);

-- Referrals: Users manage their own
CREATE POLICY "Users can manage own referrals" ON referrals FOR ALL USING (auth.uid() = referrer_id);

-- Analytics: Service role only for writes, users can view own
CREATE POLICY "Users can view own analytics" ON analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own errors" ON analytics_errors FOR SELECT USING (auth.uid() = user_id);

-- TTS preferences: Users manage their own
CREATE POLICY "Users can manage own TTS preferences" ON user_tts_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own audio sessions" ON audio_playback_sessions FOR ALL USING (auth.uid() = user_id);

-- Newsletter: Public can subscribe
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can manage own subscription" ON newsletter_subscriptions FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SECTION 16: FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_stats (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update conversation last message time
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NOW(), updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for conversation updates
CREATE TRIGGER on_message_insert
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- Function to increment template usage
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE writing_templates
    SET usage_count = usage_count + 1, updated_at = NOW()
    WHERE id = NEW.template_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for template usage
CREATE TRIGGER on_template_use
    AFTER INSERT ON template_usage
    FOR EACH ROW
    EXECUTE FUNCTION increment_template_usage();

-- ============================================
-- COMPLETE
-- ============================================

COMMENT ON SCHEMA public IS 'StxryAI production schema - v1.0.0';
