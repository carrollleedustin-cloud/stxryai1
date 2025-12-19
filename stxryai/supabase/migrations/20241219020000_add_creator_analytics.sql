-- Location: supabase/migrations/20241219020000_add_creator_analytics.sql
-- Schema Analysis: Existing stories, chapters, reading_progress, story_purchases, creator_earnings
-- Integration Type: Analytics aggregation and tracking
-- Dependencies: stories, chapters, reading_progress, story_purchases, creator_earnings, comments, reviews

-- ========================================
-- 1. CREATOR ANALYTICS SNAPSHOTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.creator_analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Snapshot period
    snapshot_date DATE NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all_time')),
    
    -- Story metrics
    total_views INTEGER DEFAULT 0,
    unique_readers INTEGER DEFAULT 0,
    total_reads INTEGER DEFAULT 0,
    average_reading_time_minutes DECIMAL(10, 2) DEFAULT 0,
    completion_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Engagement metrics
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_bookmarks INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    
    -- Revenue metrics
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    total_subscriptions INTEGER DEFAULT 0,
    total_tips DECIMAL(10, 2) DEFAULT 0,
    average_purchase_value DECIMAL(10, 2) DEFAULT 0,
    
    -- Audience metrics
    new_readers INTEGER DEFAULT 0,
    returning_readers INTEGER DEFAULT 0,
    top_countries JSONB DEFAULT '[]' NOT NULL,
    top_demographics JSONB DEFAULT '{}' NOT NULL,
    
    -- Content metrics
    chapters_published INTEGER DEFAULT 0,
    words_written INTEGER DEFAULT 0,
    average_chapter_length INTEGER DEFAULT 0,
    
    -- Growth metrics
    views_growth_percentage DECIMAL(5, 2) DEFAULT 0,
    revenue_growth_percentage DECIMAL(5, 2) DEFAULT 0,
    readers_growth_percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(creator_id, story_id, snapshot_date, period_type)
);

-- ========================================
-- 2. STORY PERFORMANCE TRACKING TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.story_performance_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Real-time metrics (updated frequently)
    current_views INTEGER DEFAULT 0,
    current_readers INTEGER DEFAULT 0,
    current_likes INTEGER DEFAULT 0,
    current_comments INTEGER DEFAULT 0,
    current_reviews INTEGER DEFAULT 0,
    current_bookmarks INTEGER DEFAULT 0,
    current_rating DECIMAL(3, 2) DEFAULT 0,
    current_rating_count INTEGER DEFAULT 0,
    
    -- Revenue tracking
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    total_subscriptions INTEGER DEFAULT 0,
    total_tips DECIMAL(10, 2) DEFAULT 0,
    
    -- Performance scores
    engagement_score DECIMAL(5, 2) DEFAULT 0,
    popularity_score DECIMAL(5, 2) DEFAULT 0,
    revenue_score DECIMAL(5, 2) DEFAULT 0,
    overall_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Trends
    views_trend TEXT CHECK (views_trend IN ('up', 'down', 'stable')),
    revenue_trend TEXT CHECK (revenue_trend IN ('up', 'down', 'stable')),
    engagement_trend TEXT CHECK (engagement_trend IN ('up', 'down', 'stable')),
    
    -- Last updated
    last_calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(story_id)
);

-- ========================================
-- 3. AUDIENCE INSIGHTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.audience_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Geographic data
    country_distribution JSONB DEFAULT '{}' NOT NULL, -- {country_code: count}
    city_distribution JSONB DEFAULT '{}' NOT NULL,
    
    -- Demographic data
    age_distribution JSONB DEFAULT '{}' NOT NULL, -- {age_range: count}
    gender_distribution JSONB DEFAULT '{}' NOT NULL,
    
    -- Device data
    device_distribution JSONB DEFAULT '{}' NOT NULL, -- {device_type: count}
    browser_distribution JSONB DEFAULT '{}' NOT NULL,
    os_distribution JSONB DEFAULT '{}' NOT NULL,
    
    -- Reading behavior
    average_session_duration_minutes DECIMAL(10, 2) DEFAULT 0,
    average_chapters_per_session DECIMAL(5, 2) DEFAULT 0,
    peak_reading_times JSONB DEFAULT '{}' NOT NULL, -- {hour: count}
    preferred_genres JSONB DEFAULT '[]' NOT NULL,
    
    -- Engagement patterns
    most_active_days JSONB DEFAULT '{}' NOT NULL, -- {day_of_week: count}
    retention_rate DECIMAL(5, 2) DEFAULT 0,
    churn_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. REVENUE ANALYTICS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.revenue_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    
    -- Revenue breakdown
    purchase_revenue DECIMAL(10, 2) DEFAULT 0,
    subscription_revenue DECIMAL(10, 2) DEFAULT 0,
    tip_revenue DECIMAL(10, 2) DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    
    -- Transaction counts
    purchase_count INTEGER DEFAULT 0,
    subscription_count INTEGER DEFAULT 0,
    tip_count INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    
    -- Averages
    average_purchase_value DECIMAL(10, 2) DEFAULT 0,
    average_subscription_value DECIMAL(10, 2) DEFAULT 0,
    average_tip_value DECIMAL(10, 2) DEFAULT 0,
    
    -- Conversion metrics
    views_to_purchase_rate DECIMAL(5, 2) DEFAULT 0,
    readers_to_purchase_rate DECIMAL(5, 2) DEFAULT 0,
    conversion_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Revenue sources
    revenue_by_story JSONB DEFAULT '{}' NOT NULL, -- {story_id: amount}
    revenue_by_country JSONB DEFAULT '{}' NOT NULL, -- {country: amount}
    
    -- Growth
    revenue_growth_percentage DECIMAL(5, 2) DEFAULT 0,
    transaction_growth_percentage DECIMAL(5, 2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 5. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_creator_analytics_snapshots_creator ON public.creator_analytics_snapshots(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_analytics_snapshots_story ON public.creator_analytics_snapshots(story_id);
CREATE INDEX IF NOT EXISTS idx_creator_analytics_snapshots_date ON public.creator_analytics_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_creator_analytics_snapshots_period ON public.creator_analytics_snapshots(period_type, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_story_performance_tracking_story ON public.story_performance_tracking(story_id);
CREATE INDEX IF NOT EXISTS idx_story_performance_tracking_updated ON public.story_performance_tracking(last_calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_audience_insights_creator ON public.audience_insights(creator_id);
CREATE INDEX IF NOT EXISTS idx_audience_insights_story ON public.audience_insights(story_id);
CREATE INDEX IF NOT EXISTS idx_audience_insights_period ON public.audience_insights(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_revenue_analytics_creator ON public.revenue_analytics(creator_id);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_story ON public.revenue_analytics(story_id);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_period ON public.revenue_analytics(period_start, period_end);

-- ========================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.creator_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_performance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audience_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_analytics ENABLE ROW LEVEL SECURITY;

-- Creator Analytics Snapshots Policies
CREATE POLICY "Creators can view their own analytics snapshots"
    ON public.creator_analytics_snapshots FOR SELECT
    USING (auth.uid() = creator_id);

-- Story Performance Tracking Policies
CREATE POLICY "Creators can view their story performance"
    ON public.story_performance_tracking FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.stories
            WHERE stories.id = story_performance_tracking.story_id
            AND stories.author_id = auth.uid()
        )
    );

-- Audience Insights Policies
CREATE POLICY "Creators can view their audience insights"
    ON public.audience_insights FOR SELECT
    USING (auth.uid() = creator_id);

-- Revenue Analytics Policies
CREATE POLICY "Creators can view their revenue analytics"
    ON public.revenue_analytics FOR SELECT
    USING (auth.uid() = creator_id);

-- ========================================
-- 7. FUNCTIONS AND TRIGGERS
-- ========================================

-- Trigger for updated_at
CREATE TRIGGER update_creator_analytics_snapshots_updated_at
    BEFORE UPDATE ON public.creator_analytics_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_story_performance_tracking_updated_at
    BEFORE UPDATE ON public.story_performance_tracking
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audience_insights_updated_at
    BEFORE UPDATE ON public.audience_insights
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revenue_analytics_updated_at
    BEFORE UPDATE ON public.revenue_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate story performance metrics
CREATE OR REPLACE FUNCTION public.calculate_story_performance(p_story_id UUID)
RETURNS VOID AS $$
DECLARE
    v_views INTEGER;
    v_readers INTEGER;
    v_likes INTEGER;
    v_comments INTEGER;
    v_reviews INTEGER;
    v_bookmarks INTEGER;
    v_rating DECIMAL(3, 2);
    v_rating_count INTEGER;
    v_revenue DECIMAL(10, 2);
    v_purchases INTEGER;
    v_subscriptions INTEGER;
    v_tips DECIMAL(10, 2);
    v_engagement_score DECIMAL(5, 2);
    v_popularity_score DECIMAL(5, 2);
    v_revenue_score DECIMAL(5, 2);
    v_overall_score DECIMAL(5, 2);
BEGIN
    -- Get views (from reading progress)
    SELECT COUNT(DISTINCT user_id) INTO v_readers
    FROM public.reading_progress
    WHERE story_id = p_story_id;

    SELECT COUNT(*) INTO v_views
    FROM public.reading_progress
    WHERE story_id = p_story_id;

    -- Get engagement metrics
    SELECT COUNT(*) INTO v_likes
    FROM public.story_likes
    WHERE story_id = p_story_id;

    SELECT COUNT(*) INTO v_comments
    FROM public.comments
    WHERE story_id = p_story_id;

    SELECT COUNT(*) INTO v_reviews
    FROM public.reviews
    WHERE story_id = p_story_id;

    SELECT COUNT(*) INTO v_bookmarks
    FROM public.story_bookmarks
    WHERE story_id = p_story_id;

    -- Get rating
    SELECT COALESCE(AVG(rating), 0), COUNT(*) INTO v_rating, v_rating_count
    FROM public.reviews
    WHERE story_id = p_story_id;

    -- Get revenue metrics
    SELECT COALESCE(SUM(amount_paid), 0), COUNT(*) INTO v_revenue, v_purchases
    FROM public.story_purchases
    WHERE story_id = p_story_id
    AND payment_status = 'succeeded';

    SELECT COUNT(*) INTO v_subscriptions
    FROM public.story_subscriptions
    WHERE story_id = p_story_id
    AND subscription_status = 'active';

    SELECT COALESCE(SUM(tip_amount), 0) INTO v_tips
    FROM public.creator_tips
    WHERE story_id = p_story_id
    AND payment_status = 'succeeded';

    -- Calculate scores (simplified scoring algorithm)
    v_engagement_score := LEAST(100, (v_likes * 2 + v_comments * 3 + v_reviews * 5 + v_bookmarks * 1) / 10.0);
    v_popularity_score := LEAST(100, (v_readers * 0.5 + v_views * 0.1 + v_rating * 20) / 10.0);
    v_revenue_score := LEAST(100, (v_revenue + v_tips) / 100.0);
    v_overall_score := (v_engagement_score * 0.4 + v_popularity_score * 0.4 + v_revenue_score * 0.2);

    -- Upsert performance tracking
    INSERT INTO public.story_performance_tracking (
        story_id,
        current_views,
        current_readers,
        current_likes,
        current_comments,
        current_reviews,
        current_bookmarks,
        current_rating,
        current_rating_count,
        total_revenue,
        total_purchases,
        total_subscriptions,
        total_tips,
        engagement_score,
        popularity_score,
        revenue_score,
        overall_score,
        last_calculated_at
    ) VALUES (
        p_story_id,
        v_views,
        v_readers,
        v_likes,
        v_comments,
        v_reviews,
        v_bookmarks,
        v_rating,
        v_rating_count,
        v_revenue,
        v_purchases,
        v_subscriptions,
        v_tips,
        v_engagement_score,
        v_popularity_score,
        v_revenue_score,
        v_overall_score,
        NOW()
    )
    ON CONFLICT (story_id) DO UPDATE SET
        current_views = EXCLUDED.current_views,
        current_readers = EXCLUDED.current_readers,
        current_likes = EXCLUDED.current_likes,
        current_comments = EXCLUDED.current_comments,
        current_reviews = EXCLUDED.current_reviews,
        current_bookmarks = EXCLUDED.current_bookmarks,
        current_rating = EXCLUDED.current_rating,
        current_rating_count = EXCLUDED.current_rating_count,
        total_revenue = EXCLUDED.total_revenue,
        total_purchases = EXCLUDED.total_purchases,
        total_subscriptions = EXCLUDED.total_subscriptions,
        total_tips = EXCLUDED.total_tips,
        engagement_score = EXCLUDED.engagement_score,
        popularity_score = EXCLUDED.popularity_score,
        revenue_score = EXCLUDED.revenue_score,
        overall_score = EXCLUDED.overall_score,
        last_calculated_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate analytics snapshot
CREATE OR REPLACE FUNCTION public.generate_analytics_snapshot(
    p_creator_id UUID,
    p_story_id UUID DEFAULT NULL,
    p_period_type TEXT DEFAULT 'daily'
)
RETURNS UUID AS $$
DECLARE
    v_snapshot_id UUID;
    v_snapshot_date DATE;
    v_period_start DATE;
    v_period_end DATE;
BEGIN
    v_snapshot_date := CURRENT_DATE;
    
    -- Determine period dates based on period_type
    CASE p_period_type
        WHEN 'daily' THEN
            v_period_start := v_snapshot_date;
            v_period_end := v_snapshot_date;
        WHEN 'weekly' THEN
            v_period_start := v_snapshot_date - INTERVAL '7 days';
            v_period_end := v_snapshot_date;
        WHEN 'monthly' THEN
            v_period_start := DATE_TRUNC('month', v_snapshot_date);
            v_period_end := v_snapshot_date;
        WHEN 'all_time' THEN
            v_period_start := '2000-01-01'::DATE;
            v_period_end := v_snapshot_date;
    END CASE;

    -- This is a simplified version - in production, you'd calculate all metrics
    -- For now, we'll create a placeholder snapshot
    INSERT INTO public.creator_analytics_snapshots (
        creator_id,
        story_id,
        snapshot_date,
        period_type
    ) VALUES (
        p_creator_id,
        p_story_id,
        v_snapshot_date,
        p_period_type
    )
    ON CONFLICT (creator_id, story_id, snapshot_date, period_type) DO NOTHING
    RETURNING id INTO v_snapshot_id;

    RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.creator_analytics_snapshots IS 'Historical snapshots of creator analytics data';
COMMENT ON TABLE public.story_performance_tracking IS 'Real-time performance metrics for stories';
COMMENT ON TABLE public.audience_insights IS 'Detailed audience demographic and behavioral insights';
COMMENT ON TABLE public.revenue_analytics IS 'Revenue analytics and breakdowns by period';

COMMENT ON FUNCTION public.calculate_story_performance IS 'Calculates and updates story performance metrics';
COMMENT ON FUNCTION public.generate_analytics_snapshot IS 'Generates analytics snapshot for a creator/story';

