-- Location: supabase/migrations/20241219000000_add_monthly_challenges_community.sql
-- Schema Analysis: Existing weekly_challenges table from Phase 1
-- Integration Type: Extension - Adding monthly challenges and community competitions
-- Dependencies: weekly_challenges, user_weekly_challenges, user_profiles, stories

-- ========================================
-- 1. MONTHLY CHALLENGES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.monthly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_month DATE NOT NULL, -- First day of the month
    challenge_type public.challenge_type NOT NULL,
    challenge_data JSONB NOT NULL DEFAULT '{}',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_xp INTEGER DEFAULT 0 NOT NULL CHECK (reward_xp >= 0),
    reward_badge TEXT,
    reward_title TEXT, -- Special title for completion
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(challenge_month, challenge_type)
);

-- ========================================
-- 2. USER MONTHLY CHALLENGE PROGRESS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_monthly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.monthly_challenges(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0 NOT NULL CHECK (progress >= 0),
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMPTZ,
    reward_claimed BOOLEAN DEFAULT FALSE NOT NULL,
    reward_claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, challenge_id)
);

-- ========================================
-- 3. COMMUNITY COMPETITIONS TABLE
-- ========================================

CREATE TYPE public.competition_status AS ENUM ('upcoming', 'active', 'voting', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS public.community_competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    competition_type TEXT NOT NULL CHECK (competition_type IN ('reading', 'writing', 'social', 'creative')),
    status public.competition_status DEFAULT 'upcoming'::public.competition_status,
    
    -- Competition details
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    voting_end_date TIMESTAMPTZ, -- For competitions with voting
    
    -- Requirements
    requirements JSONB DEFAULT '{}' NOT NULL, -- {min_stories: 3, genres: ['fantasy'], etc}
    
    -- Rewards
    rewards JSONB DEFAULT '{}' NOT NULL, -- {winner_xp: 1000, badges: ['champion'], featured: true}
    
    -- Competition metrics
    participant_count INTEGER DEFAULT 0 NOT NULL,
    submission_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Visual
    cover_image_url TEXT,
    banner_image_url TEXT,
    
    -- Metadata
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    is_official BOOLEAN DEFAULT FALSE NOT NULL, -- Official vs user-created
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. COMPETITION PARTICIPANTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.competition_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.community_competitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Participation data
    progress_data JSONB DEFAULT '{}' NOT NULL, -- Tracks progress based on competition type
    submission_ids UUID[] DEFAULT '{}', -- Story IDs or other submissions
    score INTEGER DEFAULT 0, -- Calculated score for ranking
    rank INTEGER, -- Final rank in competition
    
    -- Status
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMPTZ,
    reward_claimed BOOLEAN DEFAULT FALSE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(competition_id, user_id)
);

-- ========================================
-- 5. COMPETITION LEADERBOARD TABLE (for caching)
-- ========================================

CREATE TABLE IF NOT EXISTS public.competition_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competition_id UUID NOT NULL REFERENCES public.community_competitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Leaderboard data
    rank INTEGER NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    progress_percentage NUMERIC(5,2) DEFAULT 0.00,
    
    -- Cached user data for performance
    user_display_name TEXT,
    user_avatar_url TEXT,
    
    -- Timestamps
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(competition_id, user_id)
);

-- ========================================
-- 6. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_monthly_challenges_month ON public.monthly_challenges(challenge_month);
CREATE INDEX IF NOT EXISTS idx_monthly_challenges_type ON public.monthly_challenges(challenge_type);
CREATE INDEX IF NOT EXISTS idx_monthly_challenges_featured ON public.monthly_challenges(is_featured) WHERE is_featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_monthly_challenges_user ON public.user_monthly_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_monthly_challenges_challenge ON public.user_monthly_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_monthly_challenges_completed ON public.user_monthly_challenges(completed) WHERE completed = TRUE;

CREATE INDEX IF NOT EXISTS idx_community_competitions_status ON public.community_competitions(status);
CREATE INDEX IF NOT EXISTS idx_community_competitions_dates ON public.community_competitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_community_competitions_type ON public.community_competitions(competition_type);
CREATE INDEX IF NOT EXISTS idx_community_competitions_official ON public.community_competitions(is_official) WHERE is_official = TRUE;

CREATE INDEX IF NOT EXISTS idx_competition_participants_competition ON public.competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_user ON public.competition_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_competition_participants_score ON public.competition_participants(competition_id, score DESC);

CREATE INDEX IF NOT EXISTS idx_competition_leaderboard_competition ON public.competition_leaderboard(competition_id, rank);
CREATE INDEX IF NOT EXISTS idx_competition_leaderboard_user ON public.competition_leaderboard(user_id);

-- ========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.monthly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_monthly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_leaderboard ENABLE ROW LEVEL SECURITY;

-- Monthly Challenges Policies
CREATE POLICY "Anyone can view monthly challenges"
    ON public.monthly_challenges FOR SELECT
    USING (true);

CREATE POLICY "Users can view their own monthly challenge progress"
    ON public.user_monthly_challenges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly challenge progress"
    ON public.user_monthly_challenges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly challenge progress"
    ON public.user_monthly_challenges FOR UPDATE
    USING (auth.uid() = user_id);

-- Community Competitions Policies
CREATE POLICY "Anyone can view active competitions"
    ON public.community_competitions FOR SELECT
    USING (true);

CREATE POLICY "Creators can manage their own competitions"
    ON public.community_competitions FOR ALL
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Competition Participants Policies
CREATE POLICY "Anyone can view competition participants"
    ON public.competition_participants FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own participation"
    ON public.competition_participants FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Competition Leaderboard Policies
CREATE POLICY "Anyone can view competition leaderboards"
    ON public.competition_leaderboard FOR SELECT
    USING (true);

-- ========================================
-- 8. FUNCTIONS AND TRIGGERS
-- ========================================

-- Trigger for updated_at
CREATE TRIGGER update_monthly_challenges_updated_at
    BEFORE UPDATE ON public.monthly_challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_monthly_challenges_updated_at
    BEFORE UPDATE ON public.user_monthly_challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_competitions_updated_at
    BEFORE UPDATE ON public.community_competitions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competition_participants_updated_at
    BEFORE UPDATE ON public.competition_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update competition participant count
CREATE OR REPLACE FUNCTION public.update_competition_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_competitions
        SET participant_count = participant_count + 1
        WHERE id = NEW.competition_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_competitions
        SET participant_count = GREATEST(0, participant_count - 1)
        WHERE id = OLD.competition_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER competition_participant_count_trigger
    AFTER INSERT OR DELETE ON public.competition_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_competition_participant_count();

-- Function to update competition status based on dates
CREATE OR REPLACE FUNCTION public.update_competition_status()
RETURNS TRIGGER AS $$
DECLARE
    v_now TIMESTAMPTZ := CURRENT_TIMESTAMP;
BEGIN
    -- Auto-update status based on current date
    IF v_now < NEW.start_date THEN
        NEW.status := 'upcoming'::public.competition_status;
    ELSIF v_now >= NEW.start_date AND v_now < NEW.end_date THEN
        NEW.status := 'active'::public.competition_status;
    ELSIF NEW.voting_end_date IS NOT NULL AND v_now >= NEW.end_date AND v_now < NEW.voting_end_date THEN
        NEW.status := 'voting'::public.competition_status;
    ELSIF v_now >= COALESCE(NEW.voting_end_date, NEW.end_date) THEN
        NEW.status := 'completed'::public.competition_status;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competition_status_trigger
    BEFORE INSERT OR UPDATE ON public.community_competitions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_competition_status();

-- ========================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.monthly_challenges IS 'Monthly reading challenges with extended rewards';
COMMENT ON TABLE public.user_monthly_challenges IS 'User progress on monthly challenges';
COMMENT ON TABLE public.community_competitions IS 'Community-wide competitions with leaderboards and voting';
COMMENT ON TABLE public.competition_participants IS 'Users participating in community competitions';
COMMENT ON TABLE public.competition_leaderboard IS 'Cached leaderboard data for competitions';

COMMENT ON COLUMN public.monthly_challenges.challenge_month IS 'First day of the month (YYYY-MM-01)';
COMMENT ON COLUMN public.community_competitions.competition_type IS 'Type: reading, writing, social, or creative';
COMMENT ON COLUMN public.competition_participants.progress_data IS 'JSONB tracking progress based on competition requirements';
COMMENT ON COLUMN public.competition_leaderboard.last_updated IS 'When the leaderboard entry was last recalculated';


