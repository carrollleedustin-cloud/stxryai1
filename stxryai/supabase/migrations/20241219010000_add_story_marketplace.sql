-- Location: supabase/migrations/20241219010000_add_story_marketplace.sql
-- Schema Analysis: Existing stories table and user_profiles
-- Integration Type: Extension - Adding premium story marketplace and creator monetization
-- Dependencies: stories, user_profiles, auth.users

-- ========================================
-- 1. PREMIUM STORY PRICING TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.premium_story_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Pricing model
    pricing_model TEXT NOT NULL CHECK (pricing_model IN ('one_time', 'chapter_based', 'subscription', 'free_with_ads')),
    price_amount DECIMAL(10, 2) NOT NULL CHECK (price_amount >= 0),
    currency TEXT DEFAULT 'USD' NOT NULL,
    
    -- Chapter-based pricing
    chapter_price DECIMAL(10, 2), -- Price per chapter if chapter_based
    free_chapters INTEGER DEFAULT 0, -- Number of free chapters
    
    -- Subscription pricing
    subscription_duration_days INTEGER, -- For subscription model
    
    -- Discounts
    discount_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_expires_at TIMESTAMPTZ,
    
    -- Revenue sharing
    creator_share_percentage DECIMAL(5, 2) DEFAULT 70.00 CHECK (creator_share_percentage >= 0 AND creator_share_percentage <= 100),
    platform_share_percentage DECIMAL(5, 2) DEFAULT 30.00 CHECK (platform_share_percentage >= 0 AND platform_share_percentage <= 100),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(story_id)
);

-- ========================================
-- 2. STORY PURCHASES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.story_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Purchase details
    purchase_type TEXT NOT NULL CHECK (purchase_type IN ('full_story', 'chapter', 'subscription')),
    pricing_id UUID REFERENCES public.premium_story_pricing(id) ON DELETE SET NULL,
    
    -- Payment information
    payment_intent_id TEXT, -- Stripe payment intent ID
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
    amount_paid DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    
    -- Chapter-specific (if chapter purchase)
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    chapter_number INTEGER,
    
    -- Access details
    access_granted_at TIMESTAMPTZ,
    access_expires_at TIMESTAMPTZ, -- For subscription-based purchases
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 3. CREATOR PAYOUTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.creator_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Payout period
    payout_period_start DATE NOT NULL,
    payout_period_end DATE NOT NULL,
    
    -- Earnings
    total_earnings DECIMAL(10, 2) NOT NULL DEFAULT 0,
    platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    net_earnings DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Payout status
    payout_status TEXT DEFAULT 'pending' NOT NULL CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payout_method TEXT CHECK (payout_method IN ('stripe', 'paypal', 'bank_transfer', 'crypto')),
    payout_reference TEXT, -- External payout reference
    
    -- Payment details
    paid_at TIMESTAMPTZ,
    payout_notes TEXT,
    
    -- Breakdown
    earnings_breakdown JSONB DEFAULT '{}' NOT NULL, -- {story_id: amount, etc}
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. CREATOR EARNINGS TABLE (for tracking)
-- ========================================

CREATE TABLE IF NOT EXISTS public.creator_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    purchase_id UUID NOT NULL REFERENCES public.story_purchases(id) ON DELETE CASCADE,
    
    -- Earnings calculation
    purchase_amount DECIMAL(10, 2) NOT NULL,
    creator_share_percentage DECIMAL(5, 2) NOT NULL,
    creator_earnings DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    
    -- Payout status
    payout_id UUID REFERENCES public.creator_payouts(id) ON DELETE SET NULL,
    is_paid_out BOOLEAN DEFAULT FALSE NOT NULL,
    paid_out_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 5. STORY SUBSCRIPTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.story_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    pricing_id UUID NOT NULL REFERENCES public.premium_story_pricing(id) ON DELETE CASCADE,
    
    -- Subscription details
    subscription_status TEXT NOT NULL CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'paused')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    
    -- Payment
    stripe_subscription_id TEXT,
    payment_intent_id TEXT,
    
    -- Auto-renewal
    auto_renew BOOLEAN DEFAULT TRUE NOT NULL,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, story_id)
);

-- ========================================
-- 6. TIPPING SYSTEM TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.creator_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    
    -- Tip details
    tip_amount DECIMAL(10, 2) NOT NULL CHECK (tip_amount > 0),
    currency TEXT DEFAULT 'USD' NOT NULL,
    message TEXT, -- Optional message from tipper
    
    -- Payment
    payment_intent_id TEXT,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded')),
    
    -- Platform fee
    platform_fee_percentage DECIMAL(5, 2) DEFAULT 5.00, -- Lower fee for tips
    platform_fee DECIMAL(10, 2) NOT NULL,
    creator_receives DECIMAL(10, 2) NOT NULL,
    
    -- Payout
    payout_id UUID REFERENCES public.creator_payouts(id) ON DELETE SET NULL,
    is_paid_out BOOLEAN DEFAULT FALSE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 7. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_premium_story_pricing_story ON public.premium_story_pricing(story_id);
CREATE INDEX IF NOT EXISTS idx_premium_story_pricing_active ON public.premium_story_pricing(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_story_purchases_user ON public.story_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_story_purchases_story ON public.story_purchases(story_id);
CREATE INDEX IF NOT EXISTS idx_story_purchases_payment_status ON public.story_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_story_purchases_payment_intent ON public.story_purchases(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_story_purchases_created ON public.story_purchases(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_creator_payouts_creator ON public.creator_payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_status ON public.creator_payouts(payout_status);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_period ON public.creator_payouts(payout_period_start, payout_period_end);

CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator ON public.creator_earnings(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_story ON public.creator_earnings(story_id);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_payout ON public.creator_earnings(payout_id);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_paid_out ON public.creator_earnings(is_paid_out) WHERE is_paid_out = FALSE;

CREATE INDEX IF NOT EXISTS idx_story_subscriptions_user ON public.story_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_story_subscriptions_story ON public.story_subscriptions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_subscriptions_status ON public.story_subscriptions(subscription_status);
CREATE INDEX IF NOT EXISTS idx_story_subscriptions_period_end ON public.story_subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_creator_tips_creator ON public.creator_tips(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_tips_tipper ON public.creator_tips(tipper_id);
CREATE INDEX IF NOT EXISTS idx_creator_tips_story ON public.creator_tips(story_id);
CREATE INDEX IF NOT EXISTS idx_creator_tips_payment_status ON public.creator_tips(payment_status);

-- ========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.premium_story_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_tips ENABLE ROW LEVEL SECURITY;

-- Premium Story Pricing Policies
CREATE POLICY "Anyone can view active premium pricing"
    ON public.premium_story_pricing FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Creators can manage their own story pricing"
    ON public.premium_story_pricing FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.stories
            WHERE stories.id = premium_story_pricing.story_id
            AND stories.author_id = auth.uid()
        )
    );

-- Story Purchases Policies
CREATE POLICY "Users can view their own purchases"
    ON public.story_purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
    ON public.story_purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Creator Payouts Policies
CREATE POLICY "Creators can view their own payouts"
    ON public.creator_payouts FOR SELECT
    USING (auth.uid() = creator_id);

-- Creator Earnings Policies
CREATE POLICY "Creators can view their own earnings"
    ON public.creator_earnings FOR SELECT
    USING (auth.uid() = creator_id);

-- Story Subscriptions Policies
CREATE POLICY "Users can manage their own subscriptions"
    ON public.story_subscriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Creator Tips Policies
CREATE POLICY "Users can view tips they gave"
    ON public.creator_tips FOR SELECT
    USING (auth.uid() = tipper_id);

CREATE POLICY "Creators can view tips they received"
    ON public.creator_tips FOR SELECT
    USING (auth.uid() = creator_id);

CREATE POLICY "Users can create tips"
    ON public.creator_tips FOR INSERT
    WITH CHECK (auth.uid() = tipper_id);

-- ========================================
-- 9. FUNCTIONS AND TRIGGERS
-- ========================================

-- Trigger for updated_at
CREATE TRIGGER update_premium_story_pricing_updated_at
    BEFORE UPDATE ON public.premium_story_pricing
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_story_purchases_updated_at
    BEFORE UPDATE ON public.story_purchases
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_payouts_updated_at
    BEFORE UPDATE ON public.creator_payouts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_story_subscriptions_updated_at
    BEFORE UPDATE ON public.story_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate creator earnings on purchase
CREATE OR REPLACE FUNCTION public.calculate_creator_earnings()
RETURNS TRIGGER AS $$
DECLARE
    v_pricing public.premium_story_pricing;
    v_creator_id UUID;
    v_creator_share DECIMAL(10, 2);
    v_platform_fee DECIMAL(10, 2);
BEGIN
    -- Only process successful payments
    IF NEW.payment_status != 'succeeded' THEN
        RETURN NEW;
    END IF;

    -- Get pricing information
    SELECT * INTO v_pricing
    FROM public.premium_story_pricing
    WHERE id = NEW.pricing_id;

    IF v_pricing IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get creator ID
    SELECT author_id INTO v_creator_id
    FROM public.stories
    WHERE id = NEW.story_id;

    IF v_creator_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Calculate earnings
    v_creator_share := (NEW.amount_paid * v_pricing.creator_share_percentage / 100);
    v_platform_fee := NEW.amount_paid - v_creator_share;

    -- Create earnings record
    INSERT INTO public.creator_earnings (
        creator_id,
        story_id,
        purchase_id,
        purchase_amount,
        creator_share_percentage,
        creator_earnings,
        platform_fee
    ) VALUES (
        v_creator_id,
        NEW.story_id,
        NEW.id,
        NEW.amount_paid,
        v_pricing.creator_share_percentage,
        v_creator_share,
        v_platform_fee
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_creator_earnings_trigger
    AFTER INSERT OR UPDATE ON public.story_purchases
    FOR EACH ROW
    WHEN (NEW.payment_status = 'succeeded')
    EXECUTE FUNCTION public.calculate_creator_earnings();

-- Function to calculate tip earnings
CREATE OR REPLACE FUNCTION public.calculate_tip_earnings()
RETURNS TRIGGER AS $$
DECLARE
    v_creator_receives DECIMAL(10, 2);
    v_platform_fee DECIMAL(10, 2);
BEGIN
    -- Only process successful payments
    IF NEW.payment_status != 'succeeded' THEN
        RETURN NEW;
    END IF;

    -- Calculate tip earnings (lower platform fee for tips)
    v_platform_fee := (NEW.tip_amount * NEW.platform_fee_percentage / 100);
    v_creator_receives := NEW.tip_amount - v_platform_fee;

    -- Update tip record
    NEW.platform_fee := v_platform_fee;
    NEW.creator_receives := v_creator_receives;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_tip_earnings_trigger
    BEFORE INSERT OR UPDATE ON public.creator_tips
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_tip_earnings();

-- Function to check story access
CREATE OR REPLACE FUNCTION public.check_story_access(
    p_user_id UUID,
    p_story_id UUID,
    p_chapter_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_story public.stories;
    v_pricing public.premium_story_pricing;
    v_purchase public.story_purchases;
    v_subscription public.story_subscriptions;
    v_user_tier TEXT;
    v_chapter_number INTEGER;
BEGIN
    -- Get story
    SELECT * INTO v_story
    FROM public.stories
    WHERE id = p_story_id;

    IF v_story IS NULL THEN
        RETURN FALSE;
    END IF;

    -- If user is the author, always allow access
    IF v_story.author_id = p_user_id THEN
        RETURN TRUE;
    END IF;

    -- Check if story is premium
    SELECT * INTO v_pricing
    FROM public.premium_story_pricing
    WHERE story_id = p_story_id
    AND is_active = TRUE;

    -- If not premium, allow access
    IF v_pricing IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Check user subscription tier
    SELECT subscription_tier INTO v_user_tier
    FROM public.user_profiles
    WHERE user_id = p_user_id;

    -- Premium/Creator Pro users might have access
    IF v_user_tier IN ('premium', 'lifetime') AND v_pricing.pricing_model = 'free_with_ads' THEN
        RETURN TRUE;
    END IF;

    -- Check for full story purchase
    SELECT * INTO v_purchase
    FROM public.story_purchases
    WHERE user_id = p_user_id
    AND story_id = p_story_id
    AND purchase_type = 'full_story'
    AND payment_status = 'succeeded'
    AND (access_expires_at IS NULL OR access_expires_at > NOW())
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_purchase IS NOT NULL THEN
        RETURN TRUE;
    END IF;

    -- Check for chapter purchase
    IF p_chapter_id IS NOT NULL THEN
        SELECT * INTO v_purchase
        FROM public.story_purchases
        WHERE user_id = p_user_id
        AND story_id = p_story_id
        AND chapter_id = p_chapter_id
        AND purchase_type = 'chapter'
        AND payment_status = 'succeeded'
        ORDER BY created_at DESC
        LIMIT 1;

        IF v_purchase IS NOT NULL THEN
            RETURN TRUE;
        END IF;
    END IF;

    -- Check for subscription
    SELECT * INTO v_subscription
    FROM public.story_subscriptions
    WHERE user_id = p_user_id
    AND story_id = p_story_id
    AND subscription_status = 'active'
    AND current_period_end > NOW();

    IF v_subscription IS NOT NULL THEN
        RETURN TRUE;
    END IF;

    -- Check free chapters
    IF p_chapter_id IS NOT NULL AND v_pricing.free_chapters > 0 THEN
        SELECT chapter_number INTO v_chapter_number
        FROM public.chapters
        WHERE id = p_chapter_id;

        IF v_chapter_number IS NOT NULL AND v_chapter_number <= v_pricing.free_chapters THEN
            RETURN TRUE;
        END IF;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 10. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.premium_story_pricing IS 'Pricing configuration for premium stories';
COMMENT ON TABLE public.story_purchases IS 'User purchases of premium stories or chapters';
COMMENT ON TABLE public.creator_payouts IS 'Creator payout records for earnings';
COMMENT ON TABLE public.creator_earnings IS 'Individual earnings records from story purchases';
COMMENT ON TABLE public.story_subscriptions IS 'User subscriptions to premium stories';
COMMENT ON TABLE public.creator_tips IS 'Tips given to creators by readers';

COMMENT ON COLUMN public.premium_story_pricing.creator_share_percentage IS 'Percentage of revenue that goes to creator (default 70%)';
COMMENT ON COLUMN public.premium_story_pricing.platform_share_percentage IS 'Percentage of revenue that goes to platform (default 30%)';
COMMENT ON COLUMN public.story_purchases.access_expires_at IS 'When access expires (for subscription-based purchases)';
COMMENT ON COLUMN public.creator_tips.platform_fee_percentage IS 'Lower platform fee for tips (default 5% vs 30% for purchases)';

