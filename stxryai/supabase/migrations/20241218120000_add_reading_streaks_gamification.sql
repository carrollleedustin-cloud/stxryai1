-- Location: supabase/migrations/20241218120000_add_reading_streaks_gamification.sql
-- Schema Analysis: Existing gamification features (achievements, user_achievements, reading_progress)
-- Integration Type: Extension - Adding reading streaks, daily goals, and calendar heatmap
-- Dependencies: user_profiles, reading_progress, achievements

-- ========================================
-- 1. READING STREAKS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.reading_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0 NOT NULL CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 NOT NULL CHECK (longest_streak >= 0),
    last_read_date DATE NOT NULL DEFAULT CURRENT_DATE,
    streak_recovery_used INTEGER DEFAULT 0 NOT NULL CHECK (streak_recovery_used >= 0 AND streak_recovery_used <= 1),
    streak_recovery_reset_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id)
);

-- ========================================
-- 2. DAILY READING GOALS TABLE
-- ========================================

CREATE TYPE public.goal_type AS ENUM ('time', 'stories', 'chapters');

CREATE TABLE IF NOT EXISTS public.daily_reading_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    goal_type public.goal_type NOT NULL,
    goal_value INTEGER NOT NULL CHECK (goal_value > 0),
    current_value INTEGER DEFAULT 0 NOT NULL CHECK (current_value >= 0),
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    reward_claimed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, goal_date)
);

-- ========================================
-- 3. READING CALENDAR HEATMAP TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.reading_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    read_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reading_time INTEGER DEFAULT 0 NOT NULL CHECK (reading_time >= 0), -- in minutes
    stories_read INTEGER DEFAULT 0 NOT NULL CHECK (stories_read >= 0),
    chapters_read INTEGER DEFAULT 0 NOT NULL CHECK (chapters_read >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, read_date)
);

-- ========================================
-- 4. WEEKLY CHALLENGES TABLE
-- ========================================

CREATE TYPE public.challenge_type AS ENUM ('genre', 'count', 'time', 'explore', 'social');

CREATE TABLE IF NOT EXISTS public.weekly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_week DATE NOT NULL, -- Monday of the week
    challenge_type public.challenge_type NOT NULL,
    challenge_data JSONB NOT NULL DEFAULT '{}',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_xp INTEGER DEFAULT 0 NOT NULL CHECK (reward_xp >= 0),
    reward_badge TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(challenge_week, challenge_type)
);

-- ========================================
-- 5. USER WEEKLY CHALLENGE PROGRESS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_weekly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 NOT NULL CHECK (progress >= 0),
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    reward_claimed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, challenge_id)
);

-- ========================================
-- 6. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_reading_streaks_user_id ON public.reading_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_streaks_last_read_date ON public.reading_streaks(last_read_date);

CREATE INDEX IF NOT EXISTS idx_daily_goals_user_id ON public.daily_reading_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON public.daily_reading_goals(user_id, goal_date);
CREATE INDEX IF NOT EXISTS idx_daily_goals_date ON public.daily_reading_goals(goal_date);

CREATE INDEX IF NOT EXISTS idx_reading_calendar_user_id ON public.reading_calendar(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_calendar_user_date ON public.reading_calendar(user_id, read_date);
CREATE INDEX IF NOT EXISTS idx_reading_calendar_date ON public.reading_calendar(read_date);

CREATE INDEX IF NOT EXISTS idx_weekly_challenges_week ON public.weekly_challenges(challenge_week);
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_type ON public.weekly_challenges(challenge_type);

CREATE INDEX IF NOT EXISTS idx_user_weekly_challenges_user ON public.user_weekly_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_weekly_challenges_challenge ON public.user_weekly_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_weekly_challenges_user_challenge ON public.user_weekly_challenges(user_id, challenge_id);

-- ========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.reading_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reading_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_weekly_challenges ENABLE ROW LEVEL SECURITY;

-- Reading Streaks Policies
CREATE POLICY "Users can view their own reading streaks"
    ON public.reading_streaks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading streaks"
    ON public.reading_streaks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading streaks"
    ON public.reading_streaks FOR UPDATE
    USING (auth.uid() = user_id);

-- Daily Goals Policies
CREATE POLICY "Users can view their own daily goals"
    ON public.daily_reading_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily goals"
    ON public.daily_reading_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily goals"
    ON public.daily_reading_goals FOR UPDATE
    USING (auth.uid() = user_id);

-- Reading Calendar Policies
CREATE POLICY "Users can view their own reading calendar"
    ON public.reading_calendar FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading calendar entries"
    ON public.reading_calendar FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading calendar entries"
    ON public.reading_calendar FOR UPDATE
    USING (auth.uid() = user_id);

-- Weekly Challenges Policies (public read, user-specific progress)
CREATE POLICY "Anyone can view weekly challenges"
    ON public.weekly_challenges FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own weekly challenge progress"
    ON public.user_weekly_challenges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly challenge progress"
    ON public.user_weekly_challenges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly challenge progress"
    ON public.user_weekly_challenges FOR UPDATE
    USING (auth.uid() = user_id);

-- ========================================
-- 8. FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_reading_streaks_updated_at
    BEFORE UPDATE ON public.reading_streaks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_goals_updated_at
    BEFORE UPDATE ON public.daily_reading_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reading_calendar_updated_at
    BEFORE UPDATE ON public.reading_calendar
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_challenges_updated_at
    BEFORE UPDATE ON public.weekly_challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_weekly_challenges_updated_at
    BEFORE UPDATE ON public.user_weekly_challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 9. HELPER FUNCTIONS
-- ========================================

-- Function to get or create reading streak for a user
CREATE OR REPLACE FUNCTION public.get_or_create_reading_streak(p_user_id UUID)
RETURNS public.reading_streaks AS $$
DECLARE
    v_streak public.reading_streaks;
BEGIN
    SELECT * INTO v_streak
    FROM public.reading_streaks
    WHERE user_id = p_user_id;

    IF v_streak IS NULL THEN
        INSERT INTO public.reading_streaks (user_id, current_streak, longest_streak, last_read_date)
        VALUES (p_user_id, 0, 0, CURRENT_DATE)
        RETURNING * INTO v_streak;
    END IF;

    RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update reading streak when user reads
CREATE OR REPLACE FUNCTION public.update_reading_streak_on_read(p_user_id UUID, p_read_date DATE DEFAULT CURRENT_DATE)
RETURNS public.reading_streaks AS $$
DECLARE
    v_streak public.reading_streaks;
    v_days_diff INTEGER;
    v_new_streak INTEGER;
BEGIN
    -- Get or create streak
    v_streak := public.get_or_create_reading_streak(p_user_id);

    -- Calculate days difference
    v_days_diff := p_read_date - v_streak.last_read_date;

    -- Update streak based on days difference
    IF v_days_diff = 0 THEN
        -- Already read today, no change
        RETURN v_streak;
    ELSIF v_days_diff = 1 THEN
        -- Consecutive day, increment streak
        v_new_streak := v_streak.current_streak + 1;
    ELSE
        -- Streak broken, reset to 1
        v_new_streak := 1;
    END IF;

    -- Update streak
    UPDATE public.reading_streaks
    SET
        current_streak = v_new_streak,
        longest_streak = GREATEST(v_new_streak, v_streak.longest_streak),
        last_read_date = p_read_date,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id
    RETURNING * INTO v_streak;

    RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 10. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.reading_streaks IS 'Tracks user reading streaks and recovery passes';
COMMENT ON TABLE public.daily_reading_goals IS 'User daily reading goals (time, stories, or chapters)';
COMMENT ON TABLE public.reading_calendar IS 'Daily reading activity for calendar heatmap visualization';
COMMENT ON TABLE public.weekly_challenges IS 'Weekly community reading challenges';
COMMENT ON TABLE public.user_weekly_challenges IS 'User progress on weekly challenges';

COMMENT ON COLUMN public.reading_streaks.streak_recovery_used IS 'Number of free passes used this month (0 or 1)';
COMMENT ON COLUMN public.reading_streaks.streak_recovery_reset_date IS 'Date when recovery count resets (first of next month)';
COMMENT ON COLUMN public.daily_reading_goals.goal_type IS 'Type of goal: time (minutes), stories (count), or chapters (count)';
COMMENT ON COLUMN public.reading_calendar.reading_time IS 'Total reading time in minutes for the day';

