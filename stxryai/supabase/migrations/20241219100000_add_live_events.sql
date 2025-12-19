-- Location: supabase/migrations/20241219100000_add_live_events.sql
-- Schema Analysis: Existing stories, user_profiles
-- Integration Type: Extension - Adding live events platform
-- Dependencies: stories, user_profiles, auth.users

-- ========================================
-- 1. LIVE EVENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.live_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Event details
    event_type TEXT NOT NULL CHECK (event_type IN ('author_qa', 'writing_workshop', 'virtual_gathering', 'book_club', 'writing_contest', 'collaboration_session')),
    title TEXT NOT NULL,
    description TEXT,
    
    -- Scheduling
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    duration_minutes INTEGER,
    
    -- Event settings
    max_participants INTEGER,
    is_public BOOLEAN DEFAULT TRUE NOT NULL,
    requires_registration BOOLEAN DEFAULT TRUE NOT NULL,
    registration_deadline TIMESTAMPTZ,
    
    -- Event status
    status TEXT DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled', 'postponed')),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    
    -- Event content
    agenda JSONB DEFAULT '[]' NOT NULL, -- Array of agenda items
    resources JSONB DEFAULT '[]' NOT NULL, -- Links, documents, etc.
    recording_url TEXT,
    
    -- Related content
    related_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    
    -- Metrics
    participant_count INTEGER DEFAULT 0 NOT NULL,
    viewer_count INTEGER DEFAULT 0 NOT NULL,
    engagement_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 2. EVENT REGISTRATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Registration details
    registration_status TEXT DEFAULT 'registered' NOT NULL CHECK (registration_status IN ('registered', 'attended', 'no_show', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Attendance
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    attendance_duration_minutes INTEGER DEFAULT 0,
    
    -- Participation
    questions_asked INTEGER DEFAULT 0,
    comments_made INTEGER DEFAULT 0,
    participation_score DECIMAL(3, 2) DEFAULT 0 CHECK (participation_score >= 0 AND participation_score <= 1),
    
    -- Feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(event_id, user_id)
);

-- ========================================
-- 3. EVENT PARTICIPANTS TABLE (ACTIVE)
-- ========================================

CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Participation state
    is_present BOOLEAN DEFAULT TRUE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Role
    role TEXT DEFAULT 'participant' NOT NULL CHECK (role IN ('host', 'moderator', 'speaker', 'participant', 'viewer')),
    
    -- Interaction
    is_muted BOOLEAN DEFAULT FALSE NOT NULL,
    is_video_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    hand_raised BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(event_id, user_id)
);

-- ========================================
-- 4. EVENT MESSAGES TABLE (CHAT)
-- ========================================

CREATE TABLE IF NOT EXISTS public.event_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Message content
    message_type TEXT DEFAULT 'chat' NOT NULL CHECK (message_type IN ('chat', 'question', 'answer', 'announcement', 'system')),
    content TEXT NOT NULL,
    
    -- Message context
    parent_message_id UUID REFERENCES public.event_messages(id) ON DELETE SET NULL, -- For replies
    is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
    is_highlighted BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Moderation
    is_moderated BOOLEAN DEFAULT FALSE NOT NULL,
    moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMPTZ,
    
    -- Reactions
    reaction_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 5. EVENT QUESTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.event_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
    questioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Question details
    question_text TEXT NOT NULL,
    question_status TEXT DEFAULT 'pending' NOT NULL CHECK (question_status IN ('pending', 'answered', 'dismissed', 'featured')),
    
    -- Answer
    answered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    answer_text TEXT,
    answered_at TIMESTAMPTZ,
    
    -- Voting
    upvote_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 6. EVENT POLLS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.event_polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.live_events(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Poll details
    question TEXT NOT NULL,
    options JSONB DEFAULT '[]' NOT NULL, -- Array of option objects
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    
    -- Results
    total_votes INTEGER DEFAULT 0 NOT NULL,
    results JSONB DEFAULT '{}' NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 7. POLL RESPONSES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.poll_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.event_polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Response
    selected_option_index INTEGER NOT NULL,
    selected_option_text TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(poll_id, user_id)
);

-- ========================================
-- 8. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_live_events_host ON public.live_events(host_id);
CREATE INDEX IF NOT EXISTS idx_live_events_type ON public.live_events(event_type);
CREATE INDEX IF NOT EXISTS idx_live_events_status ON public.live_events(status);
CREATE INDEX IF NOT EXISTS idx_live_events_scheduled ON public.live_events(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_live_events_public ON public.live_events(is_public) WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON public.event_registrations(registration_status);

CREATE INDEX IF NOT EXISTS idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_present ON public.event_participants(is_present) WHERE is_present = TRUE;

CREATE INDEX IF NOT EXISTS idx_event_messages_event ON public.event_messages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_user ON public.event_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_event_messages_type ON public.event_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_event_messages_created ON public.event_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_questions_event ON public.event_questions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_questions_status ON public.event_questions(question_status);
CREATE INDEX IF NOT EXISTS idx_event_questions_pending ON public.event_questions(question_status) WHERE question_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_event_polls_event ON public.event_polls(event_id);
CREATE INDEX IF NOT EXISTS idx_event_polls_active ON public.event_polls(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_poll_responses_poll ON public.poll_responses(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_responses_user ON public.poll_responses(user_id);

-- ========================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.live_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_responses ENABLE ROW LEVEL SECURITY;

-- Live Events Policies
CREATE POLICY "Anyone can view public events"
    ON public.live_events FOR SELECT
    USING (is_public = TRUE OR host_id = auth.uid());

CREATE POLICY "Hosts can manage their events"
    ON public.live_events FOR ALL
    USING (host_id = auth.uid())
    WITH CHECK (host_id = auth.uid());

-- Event Registrations Policies
CREATE POLICY "Users can view their own registrations"
    ON public.event_registrations FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.live_events
        WHERE live_events.id = event_registrations.event_id
        AND live_events.host_id = auth.uid()
    ));

CREATE POLICY "Users can register for events"
    ON public.event_registrations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
    ON public.event_registrations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Event Participants Policies
CREATE POLICY "Anyone can view participants of public events"
    ON public.event_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.live_events
            WHERE live_events.id = event_participants.event_id
            AND (live_events.is_public = TRUE OR live_events.host_id = auth.uid())
        )
    );

CREATE POLICY "Users can join events"
    ON public.event_participants FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
    ON public.event_participants FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Event Messages Policies
CREATE POLICY "Participants can view messages"
    ON public.event_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.live_events
            WHERE live_events.id = event_messages.event_id
            AND (live_events.is_public = TRUE OR live_events.host_id = auth.uid())
        )
    );

CREATE POLICY "Participants can send messages"
    ON public.event_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Event Questions Policies
CREATE POLICY "Anyone can view questions for public events"
    ON public.event_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.live_events
            WHERE live_events.id = event_questions.event_id
            AND (live_events.is_public = TRUE OR live_events.host_id = auth.uid())
        )
    );

CREATE POLICY "Users can ask questions"
    ON public.event_questions FOR INSERT
    WITH CHECK (auth.uid() = questioner_id);

-- Event Polls Policies
CREATE POLICY "Anyone can view polls for public events"
    ON public.event_polls FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.live_events
            WHERE live_events.id = event_polls.event_id
            AND (live_events.is_public = TRUE OR live_events.host_id = auth.uid())
        )
    );

CREATE POLICY "Hosts can create polls"
    ON public.event_polls FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.live_events
            WHERE live_events.id = event_polls.event_id
            AND live_events.host_id = auth.uid()
        )
    );

-- Poll Responses Policies
CREATE POLICY "Participants can view poll responses"
    ON public.poll_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.event_polls
            JOIN public.live_events ON live_events.id = event_polls.event_id
            WHERE event_polls.id = poll_responses.poll_id
            AND (live_events.is_public = TRUE OR live_events.host_id = auth.uid())
        )
    );

CREATE POLICY "Users can respond to polls"
    ON public.poll_responses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 10. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_live_events_updated_at
    BEFORE UPDATE ON public.live_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
    BEFORE UPDATE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_participants_updated_at
    BEFORE UPDATE ON public.event_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_messages_updated_at
    BEFORE UPDATE ON public.event_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_questions_updated_at
    BEFORE UPDATE ON public.event_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_polls_updated_at
    BEFORE UPDATE ON public.event_polls
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update event participant count
CREATE OR REPLACE FUNCTION public.update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.live_events
        SET participant_count = (
            SELECT COUNT(*) FROM public.event_participants
            WHERE event_id = NEW.event_id
            AND is_present = TRUE
        )
        WHERE id = NEW.event_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_present != NEW.is_present THEN
            UPDATE public.live_events
            SET participant_count = (
                SELECT COUNT(*) FROM public.event_participants
                WHERE event_id = NEW.event_id
                AND is_present = TRUE
            )
            WHERE id = NEW.event_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.live_events
        SET participant_count = (
            SELECT COUNT(*) FROM public.event_participants
            WHERE event_id = OLD.event_id
            AND is_present = TRUE
        )
        WHERE id = OLD.event_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_participant_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.event_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_event_participant_count();

-- Function to update poll vote count
CREATE OR REPLACE FUNCTION public.update_poll_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.event_polls
        SET total_votes = total_votes + 1
        WHERE id = NEW.poll_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.event_polls
        SET total_votes = GREATEST(0, total_votes - 1)
        WHERE id = OLD.poll_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_poll_vote_count_trigger
    AFTER INSERT OR DELETE ON public.poll_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_poll_vote_count();

-- ========================================
-- 11. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.live_events IS 'Live events: Q&As, workshops, virtual gatherings';
COMMENT ON TABLE public.event_registrations IS 'User registrations for live events';
COMMENT ON TABLE public.event_participants IS 'Active participants in live events';
COMMENT ON TABLE public.event_messages IS 'Chat messages during live events';
COMMENT ON TABLE public.event_questions IS 'Questions asked during events';
COMMENT ON TABLE public.event_polls IS 'Polls created during events';
COMMENT ON TABLE public.poll_responses IS 'User responses to event polls';

COMMENT ON COLUMN public.live_events.event_type IS 'Type of event (author_qa, writing_workshop, etc.)';
COMMENT ON COLUMN public.event_participants.role IS 'User role in the event (host, moderator, speaker, participant, viewer)';
COMMENT ON COLUMN public.event_questions.question_status IS 'Status of question (pending, answered, dismissed, featured)';

