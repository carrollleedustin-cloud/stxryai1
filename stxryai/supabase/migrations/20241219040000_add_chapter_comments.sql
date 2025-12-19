-- Location: supabase/migrations/20241219040000_add_chapter_comments.sql
-- Schema Analysis: Existing comments table (story-level), chapters table
-- Integration Type: Extension - Adding chapter-level discussion threads
-- Dependencies: chapters, comments, auth.users

-- ========================================
-- 1. CHAPTER COMMENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.chapter_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.chapter_comments(id) ON DELETE CASCADE,
    
    -- Comment content
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE NOT NULL,
    edited_at TIMESTAMPTZ,
    
    -- Location in chapter (optional - for inline comments)
    paragraph_number INTEGER,
    sentence_start INTEGER,
    sentence_end INTEGER,
    selected_text TEXT,
    
    -- Engagement
    like_count INTEGER DEFAULT 0 NOT NULL,
    reply_count INTEGER DEFAULT 0 NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    pinned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    pinned_at TIMESTAMPTZ,
    
    -- Moderation
    is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
    hidden_reason TEXT,
    hidden_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    hidden_at TIMESTAMPTZ,
    
    -- Author interaction
    author_replied BOOLEAN DEFAULT FALSE NOT NULL,
    author_reply_id UUID REFERENCES public.chapter_comments(id) ON DELETE SET NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 2. CHAPTER COMMENT LIKES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.chapter_comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.chapter_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(comment_id, user_id)
);

-- ========================================
-- 3. CHAPTER COMMENT THREADS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.chapter_comment_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    
    -- Thread information
    thread_title TEXT,
    thread_type TEXT DEFAULT 'discussion' NOT NULL CHECK (thread_type IN ('discussion', 'question', 'theory', 'appreciation', 'critique')),
    
    -- Thread metrics
    comment_count INTEGER DEFAULT 0 NOT NULL,
    participant_count INTEGER DEFAULT 0 NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Thread status
    is_locked BOOLEAN DEFAULT FALSE NOT NULL,
    locked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    locked_at TIMESTAMPTZ,
    lock_reason TEXT,
    
    -- Featured threads
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    featured_until TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. CHAPTER COMMENT SUBSCRIPTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.chapter_comment_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.chapter_comments(id) ON DELETE CASCADE,
    
    -- Subscription type
    subscription_type TEXT DEFAULT 'chapter' NOT NULL CHECK (subscription_type IN ('chapter', 'thread', 'comment')),
    
    -- Notification preferences
    notify_on_reply BOOLEAN DEFAULT TRUE NOT NULL,
    notify_on_author_reply BOOLEAN DEFAULT TRUE NOT NULL,
    notify_on_like BOOLEAN DEFAULT FALSE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(user_id, chapter_id, comment_id, subscription_type)
);

-- ========================================
-- 5. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_chapter_comments_chapter ON public.chapter_comments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_comments_user ON public.chapter_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_comments_parent ON public.chapter_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_chapter_comments_created ON public.chapter_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapter_comments_pinned ON public.chapter_comments(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_chapter_comments_hidden ON public.chapter_comments(is_hidden) WHERE is_hidden = FALSE;
CREATE INDEX IF NOT EXISTS idx_chapter_comments_author_replied ON public.chapter_comments(author_replied) WHERE author_replied = TRUE;

CREATE INDEX IF NOT EXISTS idx_chapter_comment_likes_comment ON public.chapter_comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_chapter_comment_likes_user ON public.chapter_comment_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_chapter_comment_threads_chapter ON public.chapter_comment_threads(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_comment_threads_featured ON public.chapter_comment_threads(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_chapter_comment_threads_activity ON public.chapter_comment_threads(last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_chapter_comment_subscriptions_user ON public.chapter_comment_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_comment_subscriptions_chapter ON public.chapter_comment_subscriptions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_comment_subscriptions_comment ON public.chapter_comment_subscriptions(comment_id);

-- ========================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.chapter_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_comment_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_comment_subscriptions ENABLE ROW LEVEL SECURITY;

-- Chapter Comments Policies
CREATE POLICY "Anyone can view visible chapter comments"
    ON public.chapter_comments FOR SELECT
    USING (is_hidden = FALSE OR auth.uid() = user_id);

CREATE POLICY "Users can create chapter comments"
    ON public.chapter_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON public.chapter_comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.chapter_comments FOR DELETE
    USING (auth.uid() = user_id);

-- Chapter Comment Likes Policies
CREATE POLICY "Anyone can view comment likes"
    ON public.chapter_comment_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own likes"
    ON public.chapter_comment_likes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Chapter Comment Threads Policies
CREATE POLICY "Anyone can view visible threads"
    ON public.chapter_comment_threads FOR SELECT
    USING (true);

CREATE POLICY "Users can create threads"
    ON public.chapter_comment_threads FOR INSERT
    WITH CHECK (true);

-- Chapter Comment Subscriptions Policies
CREATE POLICY "Users can manage their own subscriptions"
    ON public.chapter_comment_subscriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 7. FUNCTIONS AND TRIGGERS
-- ========================================

-- Trigger for updated_at
CREATE TRIGGER update_chapter_comments_updated_at
    BEFORE UPDATE ON public.chapter_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapter_comment_threads_updated_at
    BEFORE UPDATE ON public.chapter_comment_threads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update comment reply count
CREATE OR REPLACE FUNCTION public.update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL THEN
        UPDATE public.chapter_comments
        SET reply_count = reply_count + 1
        WHERE id = NEW.parent_comment_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL THEN
        UPDATE public.chapter_comments
        SET reply_count = GREATEST(0, reply_count - 1)
        WHERE id = OLD.parent_comment_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_reply_count_trigger
    AFTER INSERT OR DELETE ON public.chapter_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comment_reply_count();

-- Function to update comment like count
CREATE OR REPLACE FUNCTION public.update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.chapter_comments
        SET like_count = like_count + 1
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.chapter_comments
        SET like_count = GREATEST(0, like_count - 1)
        WHERE id = OLD.comment_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_like_count_trigger
    AFTER INSERT OR DELETE ON public.chapter_comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comment_like_count();

-- Function to check if author replied
CREATE OR REPLACE FUNCTION public.check_author_reply()
RETURNS TRIGGER AS $$
DECLARE
    v_author_id UUID;
BEGIN
    -- Get chapter author
    SELECT author_id INTO v_author_id
    FROM public.chapters
    WHERE id = (SELECT chapter_id FROM public.chapter_comments WHERE id = NEW.comment_id);
    
    -- If commenter is the author, mark parent as author_replied
    IF NEW.user_id = v_author_id AND NEW.parent_comment_id IS NOT NULL THEN
        UPDATE public.chapter_comments
        SET author_replied = TRUE,
            author_reply_id = NEW.id
        WHERE id = NEW.parent_comment_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_author_reply_trigger
    AFTER INSERT ON public.chapter_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.check_author_reply();

-- Function to update thread activity
CREATE OR REPLACE FUNCTION public.update_thread_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_thread_id UUID;
BEGIN
    -- Find thread for this comment (if exists)
    SELECT id INTO v_thread_id
    FROM public.chapter_comment_threads
    WHERE chapter_id = NEW.chapter_id
    LIMIT 1;
    
    -- Update thread activity
    IF v_thread_id IS NOT NULL THEN
        UPDATE public.chapter_comment_threads
        SET comment_count = comment_count + 1,
            last_activity_at = NOW()
        WHERE id = v_thread_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_activity_trigger
    AFTER INSERT ON public.chapter_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_thread_activity();

-- Function to get chapter comment stats
CREATE OR REPLACE FUNCTION public.get_chapter_comment_stats(p_chapter_id UUID)
RETURNS TABLE (
    total_comments BIGINT,
    total_threads BIGINT,
    total_likes BIGINT,
    unique_commenters BIGINT,
    author_replies BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT cc.id)::BIGINT as total_comments,
        COUNT(DISTINCT cct.id)::BIGINT as total_threads,
        COALESCE(SUM(cc.like_count), 0)::BIGINT as total_likes,
        COUNT(DISTINCT cc.user_id)::BIGINT as unique_commenters,
        COUNT(DISTINCT CASE WHEN cc.author_replied THEN cc.id END)::BIGINT as author_replies
    FROM public.chapter_comments cc
    LEFT JOIN public.chapter_comment_threads cct ON cct.chapter_id = cc.chapter_id
    WHERE cc.chapter_id = p_chapter_id
    AND cc.is_hidden = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.chapter_comments IS 'Comments and discussion threads at the chapter level';
COMMENT ON TABLE public.chapter_comment_likes IS 'Likes on chapter comments';
COMMENT ON TABLE public.chapter_comment_threads IS 'Organized discussion threads for chapters';
COMMENT ON TABLE public.chapter_comment_subscriptions IS 'User subscriptions to chapter comments for notifications';

COMMENT ON COLUMN public.chapter_comments.paragraph_number IS 'Optional paragraph number for inline comments';
COMMENT ON COLUMN public.chapter_comments.author_replied IS 'Whether the story author has replied to this comment';
COMMENT ON COLUMN public.chapter_comment_threads.thread_type IS 'Type of discussion thread (discussion, question, theory, etc.)';

