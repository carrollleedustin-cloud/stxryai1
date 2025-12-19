-- Location: supabase/migrations/20241219080000_add_collaborative_creation.sql
-- Schema Analysis: Existing stories, chapters, story_collaborators
-- Integration Type: Extension - Adding community stories and remix features
-- Dependencies: stories, chapters, story_collaborators, auth.users

-- ========================================
-- 1. COMMUNITY STORIES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.community_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Community story details
    story_type TEXT DEFAULT 'community' NOT NULL CHECK (story_type IN ('community', 'remix', 'fork', 'collaborative')),
    original_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL, -- For remixes/forks
    
    -- Community management
    is_open_for_contributions BOOLEAN DEFAULT TRUE NOT NULL,
    contribution_guidelines TEXT,
    moderation_level TEXT DEFAULT 'moderate' CHECK (moderation_level IN ('open', 'moderate', 'strict', 'curated')),
    
    -- Participation
    contributor_count INTEGER DEFAULT 0 NOT NULL,
    chapter_count INTEGER DEFAULT 0 NOT NULL,
    total_words INTEGER DEFAULT 0 NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'archived', 'paused')),
    completion_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Community metrics
    community_rating DECIMAL(3, 2) DEFAULT 0 CHECK (community_rating >= 0 AND community_rating <= 5),
    community_rating_count INTEGER DEFAULT 0 NOT NULL,
    discussion_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(story_id)
);

-- ========================================
-- 2. STORY CONTRIBUTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.story_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_story_id UUID NOT NULL REFERENCES public.community_stories(id) ON DELETE CASCADE,
    contributor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    
    -- Contribution details
    contribution_type TEXT NOT NULL CHECK (contribution_type IN ('chapter', 'edit', 'suggestion', 'review', 'illustration', 'translation')),
    contribution_content TEXT,
    
    -- Status
    contribution_status TEXT DEFAULT 'pending' NOT NULL CHECK (contribution_status IN ('pending', 'approved', 'rejected', 'merged', 'needs_revision')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- Quality metrics
    quality_score DECIMAL(3, 2) CHECK (quality_score >= 0 AND quality_score <= 1),
    community_votes INTEGER DEFAULT 0 NOT NULL,
    community_rating DECIMAL(3, 2) CHECK (community_rating >= 0 AND community_rating <= 5),
    
    -- Contribution metrics
    words_added INTEGER DEFAULT 0,
    characters_added INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 3. STORY REMIXES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.story_remixes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    remix_story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    remixer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Remix details
    remix_type TEXT NOT NULL CHECK (remix_type IN ('alternate_ending', 'prequel', 'sequel', 'spin_off', 'genre_shift', 'perspective_shift', 'complete_remix')),
    remix_description TEXT,
    
    -- Attribution
    credits_original_author BOOLEAN DEFAULT TRUE NOT NULL,
    remix_license TEXT DEFAULT 'remix' CHECK (remix_license IN ('remix', 'derivative', 'inspired_by')),
    
    -- Status
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    
    -- Metrics
    similarity_score DECIMAL(3, 2) CHECK (similarity_score >= 0 AND similarity_score <= 1),
    originality_score DECIMAL(3, 2) CHECK (originality_score >= 0 AND originality_score <= 1),
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(remix_story_id)
);

-- ========================================
-- 4. STORY FORKS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.story_forks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    forked_story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    forker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Fork details
    fork_point_chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    fork_reason TEXT,
    fork_description TEXT,
    
    -- Attribution
    credits_original BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Metrics
    divergence_point INTEGER, -- Chapter number where fork occurred
    chapters_added INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(forked_story_id)
);

-- ========================================
-- 5. CONTRIBUTION VOTES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.contribution_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contribution_id UUID NOT NULL REFERENCES public.story_contributions(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Vote details
    vote_type TEXT DEFAULT 'upvote' NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    vote_weight INTEGER DEFAULT 1 NOT NULL, -- For weighted voting systems
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(contribution_id, voter_id)
);

-- ========================================
-- 6. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_community_stories_story ON public.community_stories(story_id);
CREATE INDEX IF NOT EXISTS idx_community_stories_original ON public.community_stories(original_story_id);
CREATE INDEX IF NOT EXISTS idx_community_stories_status ON public.community_stories(status);
CREATE INDEX IF NOT EXISTS idx_community_stories_open ON public.community_stories(is_open_for_contributions) WHERE is_open_for_contributions = TRUE;

CREATE INDEX IF NOT EXISTS idx_story_contributions_community ON public.story_contributions(community_story_id);
CREATE INDEX IF NOT EXISTS idx_story_contributions_contributor ON public.story_contributions(contributor_id);
CREATE INDEX IF NOT EXISTS idx_story_contributions_status ON public.story_contributions(contribution_status);
CREATE INDEX IF NOT EXISTS idx_story_contributions_pending ON public.story_contributions(contribution_status) WHERE contribution_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_story_remixes_original ON public.story_remixes(original_story_id);
CREATE INDEX IF NOT EXISTS idx_story_remixes_remix ON public.story_remixes(remix_story_id);
CREATE INDEX IF NOT EXISTS idx_story_remixes_remixer ON public.story_remixes(remixer_id);
CREATE INDEX IF NOT EXISTS idx_story_remixes_approved ON public.story_remixes(is_approved) WHERE is_approved = TRUE;

CREATE INDEX IF NOT EXISTS idx_story_forks_original ON public.story_forks(original_story_id);
CREATE INDEX IF NOT EXISTS idx_story_forks_forked ON public.story_forks(forked_story_id);
CREATE INDEX IF NOT EXISTS idx_story_forks_forker ON public.story_forks(forker_id);

CREATE INDEX IF NOT EXISTS idx_contribution_votes_contribution ON public.contribution_votes(contribution_id);
CREATE INDEX IF NOT EXISTS idx_contribution_votes_voter ON public.contribution_votes(voter_id);

-- ========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_remixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_forks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_votes ENABLE ROW LEVEL SECURITY;

-- Community Stories Policies
CREATE POLICY "Anyone can view community stories"
    ON public.community_stories FOR SELECT
    USING (true);

CREATE POLICY "Story authors can manage their community stories"
    ON public.community_stories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.stories
            WHERE stories.id = community_stories.story_id
            AND stories.author_id = auth.uid()
        )
    );

-- Story Contributions Policies
CREATE POLICY "Anyone can view approved contributions"
    ON public.story_contributions FOR SELECT
    USING (contribution_status IN ('approved', 'merged') OR auth.uid() = contributor_id);

CREATE POLICY "Users can create contributions"
    ON public.story_contributions FOR INSERT
    WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Contributors can update their own contributions"
    ON public.story_contributions FOR UPDATE
    USING (auth.uid() = contributor_id)
    WITH CHECK (auth.uid() = contributor_id);

-- Story Remixes Policies
CREATE POLICY "Anyone can view approved remixes"
    ON public.story_remixes FOR SELECT
    USING (is_approved = TRUE OR auth.uid() = remixer_id);

CREATE POLICY "Users can create remixes"
    ON public.story_remixes FOR INSERT
    WITH CHECK (auth.uid() = remixer_id);

-- Story Forks Policies
CREATE POLICY "Anyone can view forks"
    ON public.story_forks FOR SELECT
    USING (true);

CREATE POLICY "Users can create forks"
    ON public.story_forks FOR INSERT
    WITH CHECK (auth.uid() = forker_id);

-- Contribution Votes Policies
CREATE POLICY "Anyone can view votes"
    ON public.contribution_votes FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own votes"
    ON public.contribution_votes FOR ALL
    USING (auth.uid() = voter_id)
    WITH CHECK (auth.uid() = voter_id);

-- ========================================
-- 8. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_community_stories_updated_at
    BEFORE UPDATE ON public.community_stories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_story_contributions_updated_at
    BEFORE UPDATE ON public.story_contributions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_story_remixes_updated_at
    BEFORE UPDATE ON public.story_remixes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_story_forks_updated_at
    BEFORE UPDATE ON public.story_forks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update contribution vote count
CREATE OR REPLACE FUNCTION public.update_contribution_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.story_contributions
        SET community_votes = community_votes + NEW.vote_weight
        WHERE id = NEW.contribution_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.story_contributions
        SET community_votes = GREATEST(0, community_votes - OLD.vote_weight)
        WHERE id = OLD.contribution_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.story_contributions
        SET community_votes = community_votes - OLD.vote_weight + NEW.vote_weight
        WHERE id = NEW.contribution_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contribution_vote_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.contribution_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contribution_vote_count();

-- Function to update community story contributor count
CREATE OR REPLACE FUNCTION public.update_contributor_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.contribution_status = 'approved' THEN
        UPDATE public.community_stories
        SET contributor_count = (
            SELECT COUNT(DISTINCT contributor_id)
            FROM public.story_contributions
            WHERE community_story_id = NEW.community_story_id
            AND contribution_status = 'approved'
        )
        WHERE id = NEW.community_story_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.contribution_status != NEW.contribution_status THEN
        UPDATE public.community_stories
        SET contributor_count = (
            SELECT COUNT(DISTINCT contributor_id)
            FROM public.story_contributions
            WHERE community_story_id = NEW.community_story_id
            AND contribution_status = 'approved'
        )
        WHERE id = NEW.community_story_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contributor_count_trigger
    AFTER INSERT OR UPDATE ON public.story_contributions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_contributor_count();

-- ========================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.community_stories IS 'Community-driven collaborative stories';
COMMENT ON TABLE public.story_contributions IS 'Individual contributions to community stories';
COMMENT ON TABLE public.story_remixes IS 'Remixed versions of original stories';
COMMENT ON TABLE public.story_forks IS 'Forked versions of stories at specific points';
COMMENT ON TABLE public.contribution_votes IS 'Community votes on story contributions';

COMMENT ON COLUMN public.community_stories.story_type IS 'Type of community story (community, remix, fork, collaborative)';
COMMENT ON COLUMN public.story_remixes.remix_type IS 'Type of remix (alternate_ending, prequel, sequel, etc.)';
COMMENT ON COLUMN public.story_forks.fork_point_chapter_id IS 'Chapter where the story was forked';

