-- Location: supabase/migrations/20241219030000_add_advanced_creator_tools.sql
-- Schema Analysis: Existing stories, chapters, user_profiles
-- Integration Type: Extension - Adding collaboration, enhanced editing, and marketing tools
-- Dependencies: stories, chapters, auth.users

-- ========================================
-- 1. STORY DRAFTS & VERSION CONTROL
-- ========================================

CREATE TABLE IF NOT EXISTS public.story_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Draft information
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    genre TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Draft status
    draft_status TEXT DEFAULT 'draft' NOT NULL CHECK (draft_status IN ('draft', 'review', 'ready', 'archived')),
    is_auto_save BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Version control
    version_number INTEGER DEFAULT 1 NOT NULL,
    parent_draft_id UUID REFERENCES public.story_drafts(id) ON DELETE SET NULL,
    
    -- Metadata
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    last_edited_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chapter_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    story_draft_id UUID NOT NULL REFERENCES public.story_drafts(id) ON DELETE CASCADE,
    
    -- Chapter draft information
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Version control
    version_number INTEGER DEFAULT 1 NOT NULL,
    parent_draft_id UUID REFERENCES public.chapter_drafts(id) ON DELETE SET NULL,
    
    -- Metadata
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER,
    last_edited_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS public.draft_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES public.story_drafts(id) ON DELETE CASCADE,
    chapter_draft_id UUID REFERENCES public.chapter_drafts(id) ON DELETE CASCADE,
    commenter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Comment details
    content TEXT NOT NULL,
    comment_type TEXT DEFAULT 'general' NOT NULL CHECK (comment_type IN ('general', 'suggestion', 'question', 'praise', 'issue')),
    
    -- Location in draft (for chapter comments)
    start_position INTEGER,
    end_position INTEGER,
    selected_text TEXT,
    
    -- Status
    is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 2. COLLABORATION FEATURES
-- ========================================

CREATE TABLE IF NOT EXISTS public.story_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    collaborator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Collaboration details
    role TEXT NOT NULL CHECK (role IN ('co_author', 'editor', 'beta_reader', 'proofreader', 'illustrator')),
    permissions JSONB DEFAULT '{}' NOT NULL, -- {can_edit: true, can_publish: false, etc}
    
    -- Status
    invitation_status TEXT DEFAULT 'pending' NOT NULL CHECK (invitation_status IN ('pending', 'accepted', 'declined', 'revoked')),
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    accepted_at TIMESTAMPTZ,
    
    -- Contribution tracking
    contribution_percentage DECIMAL(5, 2) DEFAULT 0, -- For revenue sharing
    words_contributed INTEGER DEFAULT 0,
    chapters_contributed INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(story_id, collaborator_id)
);

CREATE TABLE IF NOT EXISTS public.collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_draft_id UUID REFERENCES public.chapter_drafts(id) ON DELETE CASCADE,
    
    -- Session details
    session_name TEXT,
    started_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at TIMESTAMPTZ,
    
    -- Participants
    participants UUID[] DEFAULT '{}' NOT NULL,
    active_participants UUID[] DEFAULT '{}' NOT NULL,
    
    -- Session data
    changes_log JSONB DEFAULT '[]' NOT NULL, -- Track all changes made during session
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 3. WRITING TEMPLATES
-- ========================================

CREATE TABLE IF NOT EXISTS public.writing_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Template information
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('story_structure', 'character_development', 'plot_outline', 'world_building', 'dialogue', 'custom')),
    
    -- Template content
    template_content JSONB NOT NULL, -- Structured template data
    template_type TEXT DEFAULT 'outline' NOT NULL CHECK (template_type IN ('outline', 'checklist', 'form', 'guide')),
    
    -- Usage
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    usage_count INTEGER DEFAULT 0 NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS public.template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.writing_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    
    used_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata JSONB DEFAULT '{}' NOT NULL
);

-- ========================================
-- 4. MARKETING TOOLS
-- ========================================

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Campaign details
    campaign_name TEXT NOT NULL,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN ('story_launch', 'chapter_release', 'promotion', 'event', 'newsletter', 'social_media')),
    description TEXT,
    
    -- Scheduling
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
    recurrence_pattern TEXT, -- JSON string for recurrence rules
    
    -- Status
    campaign_status TEXT DEFAULT 'draft' NOT NULL CHECK (campaign_status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    
    -- Content
    campaign_content JSONB DEFAULT '{}' NOT NULL, -- {subject, body, images, links, etc}
    target_audience JSONB DEFAULT '{}' NOT NULL, -- {segments, filters, etc}
    
    -- Channels
    channels TEXT[] DEFAULT '{}' NOT NULL, -- ['email', 'push', 'social_media', 'in_app']
    social_media_platforms TEXT[] DEFAULT '{}', -- ['twitter', 'facebook', 'instagram', etc]
    
    -- Metrics
    reach_count INTEGER DEFAULT 0,
    engagement_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS public.social_media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    
    -- Post details
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'reddit')),
    post_type TEXT DEFAULT 'text' NOT NULL CHECK (post_type IN ('text', 'image', 'video', 'link', 'carousel', 'story')),
    
    -- Content
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    link_url TEXT,
    hashtags TEXT[] DEFAULT '{}',
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    posted_at TIMESTAMPTZ,
    
    -- Status
    post_status TEXT DEFAULT 'draft' NOT NULL CHECK (post_status IN ('draft', 'scheduled', 'posted', 'failed', 'deleted')),
    external_post_id TEXT, -- ID from social media platform
    
    -- Metrics
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    
    -- Email details
    subject TEXT NOT NULL,
    from_name TEXT,
    from_email TEXT,
    
    -- Content
    html_content TEXT,
    text_content TEXT,
    preview_text TEXT,
    
    -- Recipients
    recipient_list JSONB DEFAULT '[]' NOT NULL, -- List of user IDs or segments
    recipient_count INTEGER DEFAULT 0,
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    
    -- Status
    email_status TEXT DEFAULT 'draft' NOT NULL CHECK (email_status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
    
    -- Metrics
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 5. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_story_drafts_author ON public.story_drafts(author_id);
CREATE INDEX IF NOT EXISTS idx_story_drafts_story ON public.story_drafts(story_id);
CREATE INDEX IF NOT EXISTS idx_story_drafts_status ON public.story_drafts(draft_status);

CREATE INDEX IF NOT EXISTS idx_chapter_drafts_story_draft ON public.chapter_drafts(story_draft_id);
CREATE INDEX IF NOT EXISTS idx_chapter_drafts_chapter ON public.chapter_drafts(chapter_id);

CREATE INDEX IF NOT EXISTS idx_draft_comments_draft ON public.draft_comments(draft_id);
CREATE INDEX IF NOT EXISTS idx_draft_comments_commenter ON public.draft_comments(commenter_id);

CREATE INDEX IF NOT EXISTS idx_story_collaborators_story ON public.story_collaborators(story_id);
CREATE INDEX IF NOT EXISTS idx_story_collaborators_collaborator ON public.story_collaborators(collaborator_id);
CREATE INDEX IF NOT EXISTS idx_story_collaborators_status ON public.story_collaborators(invitation_status);

CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_story ON public.collaboration_sessions(story_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_started_by ON public.collaboration_sessions(started_by);

CREATE INDEX IF NOT EXISTS idx_writing_templates_creator ON public.writing_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_writing_templates_public ON public.writing_templates(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_writing_templates_category ON public.writing_templates(category);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_creator ON public.marketing_campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_story ON public.marketing_campaigns(story_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(campaign_status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_scheduled ON public.marketing_campaigns(scheduled_start) WHERE campaign_status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_social_media_posts_creator ON public.social_media_posts(creator_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_campaign ON public.social_media_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON public.social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_scheduled ON public.social_media_posts(scheduled_at) WHERE post_status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_email_campaigns_creator ON public.email_campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_campaign ON public.email_campaigns(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON public.email_campaigns(scheduled_at) WHERE email_status = 'scheduled';

-- ========================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.story_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Story Drafts Policies
CREATE POLICY "Authors can manage their own drafts"
    ON public.story_drafts FOR ALL
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Collaborators can view drafts they have access to"
    ON public.story_drafts FOR SELECT
    USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM public.story_collaborators
            WHERE story_collaborators.story_id = story_drafts.story_id
            AND story_collaborators.collaborator_id = auth.uid()
            AND story_collaborators.invitation_status = 'accepted'
        )
    );

-- Chapter Drafts Policies
CREATE POLICY "Authors can manage chapter drafts"
    ON public.chapter_drafts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.story_drafts
            WHERE story_drafts.id = chapter_drafts.story_draft_id
            AND story_drafts.author_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.story_drafts
            WHERE story_drafts.id = chapter_drafts.story_draft_id
            AND story_drafts.author_id = auth.uid()
        )
    );

-- Draft Comments Policies
CREATE POLICY "Users can view comments on accessible drafts"
    ON public.draft_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.story_drafts
            WHERE story_drafts.id = draft_comments.draft_id
            AND (
                story_drafts.author_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.story_collaborators
                    WHERE story_collaborators.story_id = story_drafts.story_id
                    AND story_collaborators.collaborator_id = auth.uid()
                    AND story_collaborators.invitation_status = 'accepted'
                )
            )
        )
    );

CREATE POLICY "Users can create comments on accessible drafts"
    ON public.draft_comments FOR INSERT
    WITH CHECK (
        auth.uid() = commenter_id AND
        EXISTS (
            SELECT 1 FROM public.story_drafts
            WHERE story_drafts.id = draft_comments.draft_id
            AND (
                story_drafts.author_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.story_collaborators
                    WHERE story_collaborators.story_id = story_drafts.story_id
                    AND story_collaborators.collaborator_id = auth.uid()
                    AND story_collaborators.invitation_status = 'accepted'
                )
            )
        )
    );

-- Story Collaborators Policies
CREATE POLICY "Story authors can manage collaborators"
    ON public.story_collaborators FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.stories
            WHERE stories.id = story_collaborators.story_id
            AND stories.author_id = auth.uid()
        )
    );

CREATE POLICY "Collaborators can view their own invitations"
    ON public.story_collaborators FOR SELECT
    USING (auth.uid() = collaborator_id);

-- Collaboration Sessions Policies
CREATE POLICY "Session participants can view sessions"
    ON public.collaboration_sessions FOR SELECT
    USING (
        auth.uid() = ANY(participants) OR
        auth.uid() = started_by
    );

CREATE POLICY "Story authors can manage sessions"
    ON public.collaboration_sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.stories
            WHERE stories.id = collaboration_sessions.story_id
            AND stories.author_id = auth.uid()
        )
    );

-- Writing Templates Policies
CREATE POLICY "Users can view public templates"
    ON public.writing_templates FOR SELECT
    USING (is_public = TRUE OR auth.uid() = creator_id);

CREATE POLICY "Users can manage their own templates"
    ON public.writing_templates FOR ALL
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- Marketing Campaigns Policies
CREATE POLICY "Creators can manage their own campaigns"
    ON public.marketing_campaigns FOR ALL
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- Social Media Posts Policies
CREATE POLICY "Creators can manage their own posts"
    ON public.social_media_posts FOR ALL
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- Email Campaigns Policies
CREATE POLICY "Creators can manage their own email campaigns"
    ON public.email_campaigns FOR ALL
    USING (auth.uid() = creator_id)
    WITH CHECK (auth.uid() = creator_id);

-- ========================================
-- 7. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_story_drafts_updated_at
    BEFORE UPDATE ON public.story_drafts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapter_drafts_updated_at
    BEFORE UPDATE ON public.chapter_drafts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_draft_comments_updated_at
    BEFORE UPDATE ON public.draft_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_story_collaborators_updated_at
    BEFORE UPDATE ON public.story_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaboration_sessions_updated_at
    BEFORE UPDATE ON public.collaboration_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_writing_templates_updated_at
    BEFORE UPDATE ON public.writing_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at
    BEFORE UPDATE ON public.marketing_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_media_posts_updated_at
    BEFORE UPDATE ON public.social_media_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON public.email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate word/character counts
CREATE OR REPLACE FUNCTION public.calculate_draft_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'chapter_drafts' THEN
        NEW.word_count := array_length(string_to_array(NEW.content, ' '), 1);
        NEW.character_count := length(NEW.content);
        NEW.reading_time_minutes := CEIL((NEW.word_count::DECIMAL / 200)); -- Average reading speed
    ELSIF TG_TABLE_NAME = 'story_drafts' THEN
        -- Calculate from all chapter drafts
        SELECT 
            COALESCE(SUM(word_count), 0),
            COALESCE(SUM(character_count), 0)
        INTO NEW.word_count, NEW.character_count
        FROM public.chapter_drafts
        WHERE story_draft_id = NEW.id;
    END IF;
    
    NEW.last_edited_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_chapter_draft_metrics
    BEFORE INSERT OR UPDATE OF content ON public.chapter_drafts
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_draft_metrics();

CREATE TRIGGER calculate_story_draft_metrics
    BEFORE UPDATE ON public.story_drafts
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_draft_metrics();

-- Function to increment template usage
CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.writing_templates
    SET usage_count = usage_count + 1
    WHERE id = NEW.template_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_template_usage_trigger
    AFTER INSERT ON public.template_usage
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_template_usage();

-- ========================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.story_drafts IS 'Draft versions of stories with version control';
COMMENT ON TABLE public.chapter_drafts IS 'Draft versions of chapters';
COMMENT ON TABLE public.draft_comments IS 'Comments and feedback on drafts';
COMMENT ON TABLE public.story_collaborators IS 'Collaborators on stories with roles and permissions';
COMMENT ON TABLE public.collaboration_sessions IS 'Real-time collaboration sessions';
COMMENT ON TABLE public.writing_templates IS 'Reusable writing templates for creators';
COMMENT ON TABLE public.marketing_campaigns IS 'Marketing campaigns for stories';
COMMENT ON TABLE public.social_media_posts IS 'Scheduled and posted social media content';
COMMENT ON TABLE public.email_campaigns IS 'Email marketing campaigns';

