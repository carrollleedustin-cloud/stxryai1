-- Location: supabase/migrations/20241218150000_enhance_content_moderation.sql
-- Schema Analysis: Existing reported_content and moderation_actions tables
-- Integration Type: Extension - Adding AI moderation logs and enhanced tracking
-- Dependencies: user_profiles, stories, comments

-- ========================================
-- 1. AI MODERATION LOGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.ai_moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('story', 'comment', 'profile', 'message', 'chapter')),
    content_text TEXT NOT NULL,
    author_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    
    -- Moderation results
    flagged BOOLEAN DEFAULT FALSE NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
    auto_action TEXT CHECK (auto_action IN ('allow', 'review', 'block')),
    
    -- Detected categories (stored as JSONB)
    detected_categories JSONB DEFAULT '{}' NOT NULL,
    category_scores JSONB DEFAULT '{}' NOT NULL,
    
    -- Moderation source
    moderation_source TEXT DEFAULT 'openai' CHECK (moderation_source IN ('openai', 'perspective', 'hybrid', 'manual')),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'false_positive')),
    reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 2. MODERATION QUEUE TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.moderation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('story', 'comment', 'profile', 'message', 'chapter')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(content_id, content_type)
);

-- ========================================
-- 3. CONTENT FLAGS TABLE (for keyword-based filtering)
-- ========================================

CREATE TABLE IF NOT EXISTS public.content_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('story', 'comment', 'profile', 'message', 'chapter')),
    flag_type TEXT NOT NULL CHECK (flag_type IN ('keyword', 'pattern', 'ml_detection', 'user_report')),
    flag_value TEXT NOT NULL,
    severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    auto_action TEXT CHECK (auto_action IN ('allow', 'review', 'block')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. MODERATION STATISTICS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.moderation_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('story', 'comment', 'profile', 'message', 'chapter')),
    
    -- Counts
    total_checked INTEGER DEFAULT 0,
    flagged_count INTEGER DEFAULT 0,
    blocked_count INTEGER DEFAULT 0,
    reviewed_count INTEGER DEFAULT 0,
    false_positive_count INTEGER DEFAULT 0,
    
    -- Category breakdown
    category_counts JSONB DEFAULT '{}' NOT NULL,
    
    -- Performance metrics
    avg_processing_time_ms INTEGER,
    api_calls_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(date, content_type)
);

-- ========================================
-- 5. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_content ON public.ai_moderation_logs(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_author ON public.ai_moderation_logs(author_id);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_flagged ON public.ai_moderation_logs(flagged) WHERE flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_status ON public.ai_moderation_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_moderation_logs_created_at ON public.ai_moderation_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON public.moderation_queue(priority, status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_content ON public.moderation_queue(content_id, content_type);

CREATE INDEX IF NOT EXISTS idx_content_flags_content ON public.content_flags(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_content_flags_type ON public.content_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_content_flags_severity ON public.content_flags(severity);

CREATE INDEX IF NOT EXISTS idx_moderation_statistics_date ON public.moderation_statistics(date, content_type);

-- ========================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.ai_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_statistics ENABLE ROW LEVEL SECURITY;

-- AI Moderation Logs Policies
CREATE POLICY "Users can view their own moderation logs"
    ON public.ai_moderation_logs FOR SELECT
    USING (auth.uid() = author_id);

CREATE POLICY "Moderators can view all moderation logs"
    ON public.ai_moderation_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "System can insert moderation logs"
    ON public.ai_moderation_logs FOR INSERT
    WITH CHECK (true); -- System inserts via service role

CREATE POLICY "Moderators can update moderation logs"
    ON public.ai_moderation_logs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'moderator')
        )
    );

-- Moderation Queue Policies
CREATE POLICY "Moderators can view moderation queue"
    ON public.moderation_queue FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "System can manage moderation queue"
    ON public.moderation_queue FOR ALL
    USING (true); -- System manages via service role

-- Content Flags Policies
CREATE POLICY "Moderators can view content flags"
    ON public.content_flags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "System can insert content flags"
    ON public.content_flags FOR INSERT
    WITH CHECK (true); -- System inserts via service role

-- Moderation Statistics Policies
CREATE POLICY "Moderators can view moderation statistics"
    ON public.moderation_statistics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "System can manage moderation statistics"
    ON public.moderation_statistics FOR ALL
    USING (true); -- System manages via service role

-- ========================================
-- 7. FUNCTIONS AND TRIGGERS
-- ========================================

-- Trigger for updated_at
CREATE TRIGGER update_ai_moderation_logs_updated_at
    BEFORE UPDATE ON public.ai_moderation_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_moderation_queue_updated_at
    BEFORE UPDATE ON public.moderation_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_moderation_statistics_updated_at
    BEFORE UPDATE ON public.moderation_statistics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to add content to moderation queue
CREATE OR REPLACE FUNCTION public.add_to_moderation_queue(
    p_content_id UUID,
    p_content_type TEXT,
    p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
    v_queue_id UUID;
BEGIN
    INSERT INTO public.moderation_queue (
        content_id,
        content_type,
        priority,
        status
    )
    VALUES (
        p_content_id,
        p_content_type,
        p_priority,
        'pending'
    )
    ON CONFLICT (content_id, content_type) DO UPDATE
    SET
        priority = GREATEST(moderation_queue.priority, p_priority),
        status = 'pending',
        retry_count = 0,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_queue_id;

    RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update moderation statistics
CREATE OR REPLACE FUNCTION public.update_moderation_stats(
    p_date DATE,
    p_content_type TEXT,
    p_flagged BOOLEAN DEFAULT FALSE,
    p_blocked BOOLEAN DEFAULT FALSE,
    p_reviewed BOOLEAN DEFAULT FALSE,
    p_false_positive BOOLEAN DEFAULT FALSE,
    p_category_counts JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.moderation_statistics (
        date,
        content_type,
        total_checked,
        flagged_count,
        blocked_count,
        reviewed_count,
        false_positive_count,
        category_counts
    )
    VALUES (
        p_date,
        p_content_type,
        1,
        CASE WHEN p_flagged THEN 1 ELSE 0 END,
        CASE WHEN p_blocked THEN 1 ELSE 0 END,
        CASE WHEN p_reviewed THEN 1 ELSE 0 END,
        CASE WHEN p_false_positive THEN 1 ELSE 0 END,
        p_category_counts
    )
    ON CONFLICT (date, content_type) DO UPDATE
    SET
        total_checked = moderation_statistics.total_checked + 1,
        flagged_count = moderation_statistics.flagged_count + CASE WHEN p_flagged THEN 1 ELSE 0 END,
        blocked_count = moderation_statistics.blocked_count + CASE WHEN p_blocked THEN 1 ELSE 0 END,
        reviewed_count = moderation_statistics.reviewed_count + CASE WHEN p_reviewed THEN 1 ELSE 0 END,
        false_positive_count = moderation_statistics.false_positive_count + CASE WHEN p_false_positive THEN 1 ELSE 0 END,
        category_counts = moderation_statistics.category_counts || p_category_counts,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.ai_moderation_logs IS 'Logs all AI moderation checks and results';
COMMENT ON TABLE public.moderation_queue IS 'Queue for content awaiting moderation';
COMMENT ON TABLE public.content_flags IS 'Flags applied to content (keywords, patterns, ML detection)';
COMMENT ON TABLE public.moderation_statistics IS 'Daily statistics for moderation activity';

COMMENT ON COLUMN public.ai_moderation_logs.detected_categories IS 'JSONB object with detected categories and their status';
COMMENT ON COLUMN public.ai_moderation_logs.category_scores IS 'JSONB object with confidence scores for each category';
COMMENT ON COLUMN public.ai_moderation_logs.moderation_source IS 'Which moderation service was used (openai, perspective, hybrid)';
COMMENT ON COLUMN public.moderation_queue.priority IS 'Priority level: low, normal, high, urgent';

