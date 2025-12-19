-- Location: supabase/migrations/20241218140000_add_referral_system.sql
-- Schema Analysis: Existing user_profiles and notifications
-- Integration Type: Extension - Adding referral tracking system
-- Dependencies: user_profiles

-- ========================================
-- 1. REFERRALS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    referral_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'rewarded')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMPTZ,
    rewarded_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}' NOT NULL,
    UNIQUE(referrer_id, referee_id)
);

-- ========================================
-- 2. REFERRAL REWARDS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('premium_month', 'discount', 'energy', 'badge')),
    reward_value TEXT NOT NULL, -- e.g., "1", "50%", "100", "referral_badge"
    reward_status TEXT DEFAULT 'pending' NOT NULL CHECK (reward_status IN ('pending', 'applied', 'expired')),
    applied_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 3. SHARE TRACKING TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.share_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    share_platform TEXT NOT NULL CHECK (share_platform IN ('twitter', 'facebook', 'linkedin', 'reddit', 'whatsapp', 'telegram', 'email', 'clipboard', 'native', 'other')),
    share_type TEXT DEFAULT 'story' NOT NULL CHECK (share_type IN ('story', 'achievement', 'streak', 'milestone', 'referral')),
    share_url TEXT NOT NULL,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referral_id ON public.referral_rewards(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON public.referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_share_tracking_user_id ON public.share_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_share_tracking_story_id ON public.share_tracking(story_id);
CREATE INDEX IF NOT EXISTS idx_share_tracking_platform ON public.share_tracking(share_platform);
CREATE INDEX IF NOT EXISTS idx_share_tracking_created_at ON public.share_tracking(created_at);

-- ========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_tracking ENABLE ROW LEVEL SECURITY;

-- Referrals Policies
CREATE POLICY "Users can view their own referrals"
    ON public.referrals FOR SELECT
    USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "Users can insert their own referrals"
    ON public.referrals FOR INSERT
    WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referrals"
    ON public.referrals FOR UPDATE
    USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Referral Rewards Policies
CREATE POLICY "Users can view their own referral rewards"
    ON public.referral_rewards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view rewards for their referrals"
    ON public.referral_rewards FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.referrals
            WHERE referrals.id = referral_rewards.referral_id
            AND referrals.referrer_id = auth.uid()
        )
    );

-- Share Tracking Policies (users can see their own shares, admins can see all)
CREATE POLICY "Users can view their own share tracking"
    ON public.share_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own share tracking"
    ON public.share_tracking FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ========================================
-- 6. FUNCTIONS AND TRIGGERS
-- ========================================

-- Trigger for updated_at
CREATE TRIGGER update_referral_rewards_updated_at
    BEFORE UPDATE ON public.referral_rewards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate code: STXRY-{first 8 chars of user_id in uppercase}
        v_code := 'STXRY-' || UPPER(SUBSTRING(p_user_id::TEXT FROM 1 FOR 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = v_code) INTO v_exists;
        
        -- If code doesn't exist, return it
        IF NOT v_exists THEN
            RETURN v_code;
        END IF;
        
        -- If code exists, add random suffix
        v_code := v_code || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 4));
        
        -- Check again
        SELECT EXISTS(SELECT 1 FROM public.referrals WHERE referral_code = v_code) INTO v_exists;
        
        IF NOT v_exists THEN
            RETURN v_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to complete referral and award rewards
CREATE OR REPLACE FUNCTION public.complete_referral(
    p_referral_code TEXT,
    p_referee_id UUID
)
RETURNS public.referrals AS $$
DECLARE
    v_referral public.referrals;
    v_referrer_id UUID;
BEGIN
    -- Get referral
    SELECT * INTO v_referral
    FROM public.referrals
    WHERE referral_code = p_referral_code
    AND status = 'pending'
    AND referrer_id != p_referee_id; -- Can't refer yourself

    IF v_referral IS NULL THEN
        RAISE EXCEPTION 'Invalid or already used referral code';
    END IF;

    v_referrer_id := v_referral.referrer_id;

    -- Update referral status
    UPDATE public.referrals
    SET
        referee_id = p_referee_id,
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP
    WHERE id = v_referral.id
    RETURNING * INTO v_referral;

    -- Award rewards
    -- Referrer: 1 month free Premium
    INSERT INTO public.referral_rewards (
        referral_id,
        user_id,
        reward_type,
        reward_value,
        reward_status,
        expires_at
    ) VALUES (
        v_referral.id,
        v_referrer_id,
        'premium_month',
        '1',
        'pending',
        CURRENT_TIMESTAMP + INTERVAL '30 days'
    );

    -- Referee: 50% off first month
    INSERT INTO public.referral_rewards (
        referral_id,
        user_id,
        reward_type,
        reward_value,
        reward_status,
        expires_at
    ) VALUES (
        v_referral.id,
        p_referee_id,
        'discount',
        '50%',
        'pending',
        CURRENT_TIMESTAMP + INTERVAL '30 days'
    );

    RETURN v_referral;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 7. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.referrals IS 'Tracks user referrals and referral codes';
COMMENT ON TABLE public.referral_rewards IS 'Rewards given for successful referrals';
COMMENT ON TABLE public.share_tracking IS 'Tracks social media shares for analytics';

COMMENT ON COLUMN public.referrals.referral_code IS 'Unique referral code (format: STXRY-XXXXXXXX)';
COMMENT ON COLUMN public.referrals.status IS 'pending: code generated, completed: used by referee, rewarded: rewards given';
COMMENT ON COLUMN public.referral_rewards.reward_type IS 'Type of reward: premium_month, discount, energy, badge';
COMMENT ON COLUMN public.referral_rewards.reward_value IS 'Value of reward (e.g., "1" for 1 month, "50%" for discount)';

