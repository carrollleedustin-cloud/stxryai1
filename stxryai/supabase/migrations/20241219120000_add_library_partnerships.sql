-- Location: supabase/migrations/20241219120000_add_library_partnerships.sql
-- Schema Analysis: Existing stories, user_profiles
-- Integration Type: Extension - Adding library partnership features
-- Dependencies: stories, user_profiles, auth.users

-- ========================================
-- 1. LIBRARIES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Library details
    library_name TEXT NOT NULL,
    library_type TEXT NOT NULL CHECK (library_type IN ('public', 'school', 'academic', 'special', 'mobile')),
    library_system TEXT, -- Library system name
    branch_name TEXT,
    
    -- Location
    address TEXT,
    city TEXT,
    state_province TEXT,
    country TEXT DEFAULT 'US',
    postal_code TEXT,
    
    -- Contact
    contact_email TEXT,
    contact_phone TEXT,
    website_url TEXT,
    
    -- Partnership details
    partnership_status TEXT DEFAULT 'pending' CHECK (partnership_status IN ('pending', 'active', 'suspended', 'terminated')),
    partnership_start_date DATE,
    partnership_end_date DATE,
    partnership_tier TEXT DEFAULT 'basic' CHECK (partnership_tier IN ('basic', 'premium', 'enterprise')),
    
    -- OverDrive integration
    overdrive_library_id TEXT UNIQUE,
    overdrive_api_key TEXT,
    overdrive_sync_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    last_overdrive_sync TIMESTAMPTZ,
    
    -- Features
    features_enabled JSONB DEFAULT '{}' NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 2. LIBRARY MEMBERSHIPS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.library_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Membership details
    library_card_number TEXT,
    membership_status TEXT DEFAULT 'active' NOT NULL CHECK (membership_status IN ('active', 'expired', 'suspended', 'cancelled')),
    membership_type TEXT DEFAULT 'standard' CHECK (membership_type IN ('standard', 'premium', 'student', 'senior')),
    
    -- Dates
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMPTZ,
    
    -- Borrowing limits
    max_concurrent_borrows INTEGER DEFAULT 5,
    current_borrows INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(library_id, user_id)
);

-- ========================================
-- 3. LIBRARY BORROWS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.library_borrows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    
    -- Borrow details
    borrow_status TEXT DEFAULT 'active' NOT NULL CHECK (borrow_status IN ('active', 'returned', 'overdue', 'lost')),
    borrowed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date DATE NOT NULL,
    returned_at TIMESTAMPTZ,
    
    -- Renewals
    renewal_count INTEGER DEFAULT 0 NOT NULL,
    max_renewals INTEGER DEFAULT 2,
    
    -- OverDrive sync
    overdrive_loan_id TEXT,
    is_overdrive_loan BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. LIBRARY PROGRAMS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.library_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Program details
    program_name TEXT NOT NULL,
    program_type TEXT NOT NULL CHECK (program_type IN ('reading_challenge', 'book_club', 'workshop', 'author_event', 'summer_reading', 'community_story')),
    description TEXT,
    
    -- Scheduling
    start_date DATE NOT NULL,
    end_date DATE,
    registration_deadline DATE,
    max_participants INTEGER,
    
    -- Status
    program_status TEXT DEFAULT 'scheduled' NOT NULL CHECK (program_status IN ('scheduled', 'active', 'completed', 'cancelled')),
    
    -- Requirements
    required_stories UUID[] DEFAULT '{}',
    reading_goals JSONB DEFAULT '{}' NOT NULL,
    
    -- Metrics
    participant_count INTEGER DEFAULT 0 NOT NULL,
    completion_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 5. PROGRAM PARTICIPATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.program_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.library_programs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Participation details
    participation_status TEXT DEFAULT 'registered' NOT NULL CHECK (participation_status IN ('registered', 'active', 'completed', 'dropped')),
    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMPTZ,
    
    -- Progress
    stories_read INTEGER DEFAULT 0 NOT NULL,
    chapters_read INTEGER DEFAULT 0 NOT NULL,
    reading_time_minutes INTEGER DEFAULT 0 NOT NULL,
    goals_achieved INTEGER DEFAULT 0 NOT NULL,
    
    -- Rewards
    rewards_earned JSONB DEFAULT '[]' NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(program_id, user_id)
);

-- ========================================
-- 6. OVERDRIVE SYNC LOG TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.overdrive_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    
    -- Sync details
    sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'borrows', 'returns')),
    sync_status TEXT DEFAULT 'pending' NOT NULL CHECK (sync_status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Results
    items_synced INTEGER DEFAULT 0,
    items_added INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    items_removed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_messages TEXT[] DEFAULT '{}',
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 7. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_libraries_status ON public.libraries(partnership_status);
CREATE INDEX IF NOT EXISTS idx_libraries_overdrive ON public.libraries(overdrive_sync_enabled) WHERE overdrive_sync_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_library_memberships_library ON public.library_memberships(library_id);
CREATE INDEX IF NOT EXISTS idx_library_memberships_user ON public.library_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_library_memberships_status ON public.library_memberships(membership_status);

CREATE INDEX IF NOT EXISTS idx_library_borrows_library ON public.library_borrows(library_id);
CREATE INDEX IF NOT EXISTS idx_library_borrows_user ON public.library_borrows(user_id);
CREATE INDEX IF NOT EXISTS idx_library_borrows_story ON public.library_borrows(story_id);
CREATE INDEX IF NOT EXISTS idx_library_borrows_status ON public.library_borrows(borrow_status);
CREATE INDEX IF NOT EXISTS idx_library_borrows_due_date ON public.library_borrows(due_date);
CREATE INDEX IF NOT EXISTS idx_library_borrows_overdue ON public.library_borrows(due_date) WHERE borrow_status = 'active' AND due_date < CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_library_programs_library ON public.library_programs(library_id);
CREATE INDEX IF NOT EXISTS idx_library_programs_status ON public.library_programs(program_status);
CREATE INDEX IF NOT EXISTS idx_library_programs_active ON public.library_programs(program_status) WHERE program_status = 'active';

CREATE INDEX IF NOT EXISTS idx_program_participations_program ON public.program_participations(program_id);
CREATE INDEX IF NOT EXISTS idx_program_participations_user ON public.program_participations(user_id);

CREATE INDEX IF NOT EXISTS idx_overdrive_sync_log_library ON public.overdrive_sync_log(library_id);
CREATE INDEX IF NOT EXISTS idx_overdrive_sync_log_status ON public.overdrive_sync_log(sync_status);

-- ========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_borrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overdrive_sync_log ENABLE ROW LEVEL SECURITY;

-- Libraries Policies
CREATE POLICY "Anyone can view active libraries"
    ON public.libraries FOR SELECT
    USING (partnership_status = 'active');

-- Library Memberships Policies
CREATE POLICY "Users can view their own memberships"
    ON public.library_memberships FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create memberships"
    ON public.library_memberships FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Library Borrows Policies
CREATE POLICY "Users can view their own borrows"
    ON public.library_borrows FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create borrows"
    ON public.library_borrows FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Library Programs Policies
CREATE POLICY "Anyone can view active programs"
    ON public.library_programs FOR SELECT
    USING (program_status IN ('scheduled', 'active'));

-- Program Participations Policies
CREATE POLICY "Users can view their own participations"
    ON public.program_participations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can register for programs"
    ON public.program_participations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- OverDrive Sync Log Policies
CREATE POLICY "Library admins can view sync logs"
    ON public.overdrive_sync_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.libraries
            WHERE libraries.id = overdrive_sync_log.library_id
            AND libraries.partnership_status = 'active'
        )
    );

-- ========================================
-- 9. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_libraries_updated_at
    BEFORE UPDATE ON public.libraries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_library_memberships_updated_at
    BEFORE UPDATE ON public.library_memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_library_borrows_updated_at
    BEFORE UPDATE ON public.library_borrows
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_library_programs_updated_at
    BEFORE UPDATE ON public.library_programs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_program_participations_updated_at
    BEFORE UPDATE ON public.program_participations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update borrow count
CREATE OR REPLACE FUNCTION public.update_borrow_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.borrow_status = 'active' THEN
        UPDATE public.library_memberships
        SET current_borrows = current_borrows + 1
        WHERE library_id = NEW.library_id
        AND user_id = NEW.user_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.borrow_status = 'active' AND NEW.borrow_status != 'active' THEN
        UPDATE public.library_memberships
        SET current_borrows = GREATEST(0, current_borrows - 1)
        WHERE library_id = NEW.library_id
        AND user_id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' AND OLD.borrow_status = 'active' THEN
        UPDATE public.library_memberships
        SET current_borrows = GREATEST(0, current_borrows - 1)
        WHERE library_id = OLD.library_id
        AND user_id = OLD.user_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_borrow_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.library_borrows
    FOR EACH ROW
    EXECUTE FUNCTION public.update_borrow_count();

-- ========================================
-- 10. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.libraries IS 'Library partnerships and integrations';
COMMENT ON TABLE public.library_memberships IS 'User memberships in libraries';
COMMENT ON TABLE public.library_borrows IS 'Story borrowing from libraries';
COMMENT ON TABLE public.library_programs IS 'Library programs and events';
COMMENT ON TABLE public.program_participations IS 'User participation in library programs';
COMMENT ON TABLE public.overdrive_sync_log IS 'OverDrive API sync logs';

COMMENT ON COLUMN public.libraries.overdrive_library_id IS 'OverDrive library identifier';
COMMENT ON COLUMN public.library_borrows.overdrive_loan_id IS 'OverDrive loan identifier for syncing';
COMMENT ON COLUMN public.library_programs.program_type IS 'Type of library program (reading_challenge, book_club, etc.)';

