-- Location: supabase/migrations/20251208105005_add_community_hub_features.sql
-- Schema Analysis: Existing social features (user_profiles, user_friendships, user_activities)
-- Integration Type: Extension - Adding community hub specific tables
-- Dependencies: user_profiles, stories, user_friendships

-- ========================================
-- 1. TYPES
-- ========================================
CREATE TYPE public.club_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE public.discussion_category AS ENUM ('general', 'genre_specific', 'story_specific', 'writing_tips', 'community');
CREATE TYPE public.mentorship_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE public.event_type AS ENUM ('reading_marathon', 'author_qa', 'writing_workshop', 'collaborative_story');

-- ========================================
-- 2. CORE TABLES
-- ========================================

-- Reading Clubs
CREATE TABLE public.reading_clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    cover_image_url TEXT,
    member_count INTEGER DEFAULT 0,
    current_story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    status public.club_status DEFAULT 'active'::public.club_status,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Club Members
CREATE TABLE public.club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.reading_clubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, user_id)
);

-- Discussion Forums
CREATE TABLE public.discussion_forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category public.discussion_category NOT NULL,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    club_id UUID REFERENCES public.reading_clubs(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    is_pinned BOOLEAN DEFAULT false,
    reply_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Discussion Replies
CREATE TABLE public.discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL REFERENCES public.discussion_forums(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
    upvote_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Generated Content
CREATE TABLE public.user_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_url TEXT,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Community Events
CREATE TABLE public.community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type public.event_type NOT NULL,
    host_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    club_id UUID REFERENCES public.reading_clubs(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    max_participants INTEGER,
    participant_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Event Participants
CREATE TABLE public.event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.community_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rsvp_status TEXT DEFAULT 'going',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Mentorship Programs
CREATE TABLE public.mentorship_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    focus_area TEXT NOT NULL,
    status public.mentorship_status DEFAULT 'pending'::public.mentorship_status,
    progress_notes JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mentor_id, mentee_id)
);

-- User Reputation
CREATE TABLE public.user_reputation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    reputation_points INTEGER DEFAULT 0,
    contribution_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ========================================
-- 3. INDEXES
-- ========================================
CREATE INDEX idx_reading_clubs_creator ON public.reading_clubs(creator_id);
CREATE INDEX idx_reading_clubs_status ON public.reading_clubs(status);
CREATE INDEX idx_club_members_club ON public.club_members(club_id);
CREATE INDEX idx_club_members_user ON public.club_members(user_id);
CREATE INDEX idx_discussion_forums_category ON public.discussion_forums(category);
CREATE INDEX idx_discussion_forums_story ON public.discussion_forums(story_id);
CREATE INDEX idx_discussion_forums_club ON public.discussion_forums(club_id);
CREATE INDEX idx_discussion_replies_forum ON public.discussion_replies(forum_id);
CREATE INDEX idx_discussion_replies_user ON public.discussion_replies(user_id);
CREATE INDEX idx_user_content_user ON public.user_content(user_id);
CREATE INDEX idx_user_content_story ON public.user_content(story_id);
CREATE INDEX idx_community_events_host ON public.community_events(host_id);
CREATE INDEX idx_community_events_club ON public.community_events(club_id);
CREATE INDEX idx_community_events_start_time ON public.community_events(start_time);
CREATE INDEX idx_event_participants_event ON public.event_participants(event_id);
CREATE INDEX idx_event_participants_user ON public.event_participants(user_id);
CREATE INDEX idx_mentorship_mentor ON public.mentorship_programs(mentor_id);
CREATE INDEX idx_mentorship_mentee ON public.mentorship_programs(mentee_id);
CREATE INDEX idx_user_reputation_user ON public.user_reputation(user_id);

-- ========================================
-- 4. ENABLE RLS
-- ========================================
ALTER TABLE public.reading_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. RLS POLICIES
-- ========================================

-- Reading Clubs Policies
CREATE POLICY "public_can_view_active_clubs"
ON public.reading_clubs
FOR SELECT
TO public
USING (status = 'active'::public.club_status AND is_private = false);

CREATE POLICY "members_can_view_private_clubs"
ON public.reading_clubs
FOR SELECT
TO authenticated
USING (
    is_private = false OR
    EXISTS (
        SELECT 1 FROM public.club_members cm
        WHERE cm.club_id = id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "creators_manage_own_clubs"
ON public.reading_clubs
FOR ALL
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

-- Club Members Policies
CREATE POLICY "members_view_club_members"
ON public.club_members
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.club_members cm
        WHERE cm.club_id = club_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "users_manage_own_memberships"
ON public.club_members
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Discussion Forums Policies
CREATE POLICY "public_can_view_forums"
ON public.discussion_forums
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_create_forums"
ON public.discussion_forums
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "creators_manage_own_forums"
ON public.discussion_forums
FOR ALL
TO authenticated
USING (created_by = auth.uid());

-- Discussion Replies Policies
CREATE POLICY "public_can_view_replies"
ON public.discussion_replies
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_replies"
ON public.discussion_replies
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- User Content Policies
CREATE POLICY "public_can_view_content"
ON public.user_content
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_content"
ON public.user_content
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Community Events Policies
CREATE POLICY "public_can_view_events"
ON public.community_events
FOR SELECT
TO public
USING (is_public = true);

CREATE POLICY "members_view_club_events"
ON public.community_events
FOR SELECT
TO authenticated
USING (
    is_public = true OR
    EXISTS (
        SELECT 1 FROM public.club_members cm
        WHERE cm.club_id = club_id AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "hosts_manage_own_events"
ON public.community_events
FOR ALL
TO authenticated
USING (host_id = auth.uid())
WITH CHECK (host_id = auth.uid());

-- Event Participants Policies
CREATE POLICY "public_can_view_participants"
ON public.event_participants
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_manage_own_participation"
ON public.event_participants
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Mentorship Programs Policies
CREATE POLICY "participants_view_own_mentorships"
ON public.mentorship_programs
FOR SELECT
TO authenticated
USING (mentor_id = auth.uid() OR mentee_id = auth.uid());

CREATE POLICY "mentors_manage_mentorships"
ON public.mentorship_programs
FOR ALL
TO authenticated
USING (mentor_id = auth.uid())
WITH CHECK (mentor_id = auth.uid());

CREATE POLICY "mentees_create_requests"
ON public.mentorship_programs
FOR INSERT
TO authenticated
WITH CHECK (mentee_id = auth.uid());

-- User Reputation Policies
CREATE POLICY "public_can_view_reputation"
ON public.user_reputation
FOR SELECT
TO public
USING (true);

CREATE POLICY "users_view_own_reputation"
ON public.user_reputation
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- ========================================
-- 6. MOCK DATA
-- ========================================
DO $$
DECLARE
    existing_user1_id UUID;
    existing_user2_id UUID;
    existing_story1_id UUID;
    existing_story2_id UUID;
    club1_id UUID := gen_random_uuid();
    club2_id UUID := gen_random_uuid();
    forum1_id UUID := gen_random_uuid();
    forum2_id UUID := gen_random_uuid();
    event1_id UUID := gen_random_uuid();
BEGIN
    -- Get existing users and stories
    SELECT id INTO existing_user1_id FROM public.user_profiles LIMIT 1 OFFSET 0;
    SELECT id INTO existing_user2_id FROM public.user_profiles LIMIT 1 OFFSET 1;
    SELECT id INTO existing_story1_id FROM public.stories LIMIT 1 OFFSET 0;
    SELECT id INTO existing_story2_id FROM public.stories LIMIT 1 OFFSET 1;

    -- Only create mock data if users exist
    IF existing_user1_id IS NOT NULL AND existing_user2_id IS NOT NULL THEN
        -- Reading Clubs
        INSERT INTO public.reading_clubs (id, name, description, creator_id, current_story_id, member_count, status, is_private)
        VALUES
            (club1_id, 'Fantasy Readers Circle', 'Exploring magical worlds together', existing_user1_id, existing_story1_id, 156, 'active'::public.club_status, false),
            (club2_id, 'Sci-Fi Adventure Club', 'Journey through space and time', existing_user2_id, existing_story2_id, 89, 'active'::public.club_status, false);

        -- Club Members
        INSERT INTO public.club_members (club_id, user_id, role)
        VALUES
            (club1_id, existing_user1_id, 'admin'),
            (club1_id, existing_user2_id, 'member'),
            (club2_id, existing_user2_id, 'admin'),
            (club2_id, existing_user1_id, 'member');

        -- Discussion Forums
        INSERT INTO public.discussion_forums (id, title, category, story_id, club_id, created_by, reply_count, view_count)
        VALUES
            (forum1_id, 'Best plot twists in fantasy', 'genre_specific'::public.discussion_category, existing_story1_id, club1_id, existing_user1_id, 24, 312),
            (forum2_id, 'Time travel paradoxes', 'general'::public.discussion_category, existing_story2_id, club2_id, existing_user2_id, 18, 189);

        -- Discussion Replies
        INSERT INTO public.discussion_replies (forum_id, user_id, content, upvote_count)
        VALUES
            (forum1_id, existing_user2_id, 'I love how the story reveals the true villain at the end!', 15),
            (forum1_id, existing_user1_id, 'The magical system is so well thought out', 12),
            (forum2_id, existing_user1_id, 'The bootstrap paradox in chapter 5 was mind-blowing', 9);

        -- User Content
        INSERT INTO public.user_content (user_id, story_id, content_type, title, description, vote_count)
        VALUES
            (existing_user1_id, existing_story1_id, 'review', 'Amazing fantasy journey', 'A comprehensive review of the enchanted forest story', 23),
            (existing_user2_id, existing_story2_id, 'fan_art', 'Cyber City Concept', 'Digital painting of the main cyberpunk setting', 45);

        -- Community Events
        INSERT INTO public.community_events (id, title, description, event_type, host_id, club_id, story_id, start_time, end_time, max_participants, participant_count)
        VALUES
            (event1_id, 'Fantasy Marathon Weekend', 'Read through popular fantasy stories together', 'reading_marathon'::public.event_type, existing_user1_id, club1_id, existing_story1_id, NOW() + INTERVAL '7 days', NOW() + INTERVAL '9 days', 50, 23),
            (gen_random_uuid(), 'Author Q&A with Top Writers', 'Interactive session with successful story creators', 'author_qa'::public.event_type, existing_user2_id, club2_id, NULL, NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days 2 hours', 100, 67);

        -- Event Participants
        INSERT INTO public.event_participants (event_id, user_id, rsvp_status)
        VALUES
            (event1_id, existing_user1_id, 'going'),
            (event1_id, existing_user2_id, 'going');

        -- Mentorship Programs
        INSERT INTO public.mentorship_programs (mentor_id, mentee_id, focus_area, status, started_at)
        VALUES
            (existing_user1_id, existing_user2_id, 'Story Structure and Pacing', 'active'::public.mentorship_status, NOW() - INTERVAL '30 days'),
            (existing_user2_id, existing_user1_id, 'Character Development', 'pending'::public.mentorship_status, NULL);

        -- User Reputation
        INSERT INTO public.user_reputation (user_id, reputation_points, contribution_count)
        VALUES
            (existing_user1_id, 450, 23),
            (existing_user2_id, 320, 18);
    END IF;
END $$;