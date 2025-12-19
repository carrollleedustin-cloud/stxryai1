-- Location: supabase/migrations/20241218130000_add_push_notifications.sql
-- Schema Analysis: Existing notifications table and notificationService
-- Integration Type: Extension - Adding push notification subscriptions and preferences
-- Dependencies: user_profiles, notifications

-- ========================================
-- 1. PUSH SUBSCRIPTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, endpoint)
);

-- ========================================
-- 2. NOTIFICATION PREFERENCES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Push notification preferences
    push_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    push_story_updates BOOLEAN DEFAULT TRUE NOT NULL,
    push_friend_activity BOOLEAN DEFAULT TRUE NOT NULL,
    push_engagement_reminders BOOLEAN DEFAULT TRUE NOT NULL,
    push_social_notifications BOOLEAN DEFAULT TRUE NOT NULL,
    push_personalized_recommendations BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Email notification preferences
    email_story_comments BOOLEAN DEFAULT TRUE NOT NULL,
    email_new_followers BOOLEAN DEFAULT TRUE NOT NULL,
    email_club_activity BOOLEAN DEFAULT FALSE NOT NULL,
    email_collaboration BOOLEAN DEFAULT TRUE NOT NULL,
    email_weekly_digest BOOLEAN DEFAULT TRUE NOT NULL,
    email_announcements BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- In-app notification preferences
    inapp_all BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    quiet_hours_start TIME DEFAULT '22:00:00' NOT NULL,
    quiet_hours_end TIME DEFAULT '08:00:00' NOT NULL,
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id)
);

-- ========================================
-- 3. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON public.push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- ========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Push Subscriptions Policies
CREATE POLICY "Users can view their own push subscriptions"
    ON public.push_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions"
    ON public.push_subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions"
    ON public.push_subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
    ON public.push_subscriptions FOR DELETE
    USING (auth.uid() = user_id);

-- Notification Preferences Policies
CREATE POLICY "Users can view their own notification preferences"
    ON public.notification_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
    ON public.notification_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
    ON public.notification_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- ========================================
-- 5. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at (using existing function)
CREATE TRIGGER update_push_subscriptions_updated_at
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 6. HELPER FUNCTIONS
-- ========================================

-- Function to get or create notification preferences
CREATE OR REPLACE FUNCTION public.get_or_create_notification_preferences(p_user_id UUID)
RETURNS public.notification_preferences AS $$
DECLARE
    v_prefs public.notification_preferences;
BEGIN
    SELECT * INTO v_prefs
    FROM public.notification_preferences
    WHERE user_id = p_user_id;

    IF v_prefs IS NULL THEN
        INSERT INTO public.notification_preferences (user_id)
        VALUES (p_user_id)
        RETURNING * INTO v_prefs;
    END IF;

    RETURN v_prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user should receive push notification
CREATE OR REPLACE FUNCTION public.should_send_push_notification(
    p_user_id UUID,
    p_notification_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_prefs public.notification_preferences;
    v_in_quiet_hours BOOLEAN;
    v_current_time TIME;
BEGIN
    -- Get user preferences
    SELECT * INTO v_prefs
    FROM public.notification_preferences
    WHERE user_id = p_user_id;

    -- If no preferences, default to true
    IF v_prefs IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Check if push is enabled
    IF NOT v_prefs.push_enabled THEN
        RETURN FALSE;
    END IF;

    -- Check type-specific preferences
    CASE p_notification_type
        WHEN 'story_update' THEN
            IF NOT v_prefs.push_story_updates THEN
                RETURN FALSE;
            END IF;
        WHEN 'friend_activity' THEN
            IF NOT v_prefs.push_friend_activity THEN
                RETURN FALSE;
            END IF;
        WHEN 'engagement_reminder' THEN
            IF NOT v_prefs.push_engagement_reminders THEN
                RETURN FALSE;
            END IF;
        WHEN 'social' THEN
            IF NOT v_prefs.push_social_notifications THEN
                RETURN FALSE;
            END IF;
        WHEN 'personalized_recommendation' THEN
            IF NOT v_prefs.push_personalized_recommendations THEN
                RETURN FALSE;
            END IF;
        ELSE
            -- Default to true for unknown types
            RETURN TRUE;
    END CASE;

    -- Check quiet hours
    IF v_prefs.quiet_hours_enabled THEN
        v_current_time := CURRENT_TIME;
        
        -- Handle quiet hours that span midnight
        IF v_prefs.quiet_hours_start > v_prefs.quiet_hours_end THEN
            -- Quiet hours span midnight (e.g., 22:00 to 08:00)
            IF v_current_time >= v_prefs.quiet_hours_start OR v_current_time < v_prefs.quiet_hours_end THEN
                RETURN FALSE;
            END IF;
        ELSE
            -- Normal quiet hours (e.g., 22:00 to 08:00 same day)
            IF v_current_time >= v_prefs.quiet_hours_start AND v_current_time < v_prefs.quiet_hours_end THEN
                RETURN FALSE;
            END IF;
        END IF;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.push_subscriptions IS 'Stores browser push notification subscriptions for users';
COMMENT ON TABLE public.notification_preferences IS 'User preferences for push, email, and in-app notifications';

COMMENT ON COLUMN public.push_subscriptions.endpoint IS 'Push service endpoint URL';
COMMENT ON COLUMN public.push_subscriptions.p256dh IS 'Public key for push encryption';
COMMENT ON COLUMN public.push_subscriptions.auth IS 'Authentication secret for push encryption';
COMMENT ON COLUMN public.notification_preferences.quiet_hours_start IS 'Start time for quiet hours (HH:MM:SS)';
COMMENT ON COLUMN public.notification_preferences.quiet_hours_end IS 'End time for quiet hours (HH:MM:SS)';
COMMENT ON COLUMN public.notification_preferences.timezone IS 'User timezone for quiet hours calculation';

