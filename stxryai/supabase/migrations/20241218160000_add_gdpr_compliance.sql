-- Location: supabase/migrations/20241218160000_add_gdpr_compliance.sql
-- Schema Analysis: Existing user_profiles and auth.users
-- Integration Type: Extension - Adding GDPR compliance features
-- Dependencies: user_profiles, auth.users

-- ========================================
-- 1. CONSENT MANAGEMENT TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Consent types
    consent_type TEXT NOT NULL CHECK (consent_type IN (
        'essential',
        'analytics',
        'marketing',
        'personalization',
        'third_party'
    )),
    
    -- Consent status
    consented BOOLEAN DEFAULT FALSE NOT NULL,
    consent_date TIMESTAMPTZ,
    consent_version TEXT, -- Version of privacy policy when consent was given
    
    -- Withdrawal
    withdrawn BOOLEAN DEFAULT FALSE NOT NULL,
    withdrawn_date TIMESTAMPTZ,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(user_id, consent_type)
);

-- ========================================
-- 2. DATA EXPORT REQUESTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.data_export_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Request status
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
    
    -- Export details
    export_format TEXT DEFAULT 'json' CHECK (export_format IN ('json', 'csv', 'xml')),
    include_types TEXT[] DEFAULT ARRAY['all'], -- ['stories', 'comments', 'profile', 'progress', 'all']
    
    -- File information
    file_url TEXT,
    file_size_bytes BIGINT,
    expires_at TIMESTAMPTZ, -- Export files expire after 30 days
    
    -- Processing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 3. DATA DELETION REQUESTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Request status
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Deletion scope
    deletion_scope TEXT DEFAULT 'full' CHECK (deletion_scope IN ('full', 'partial')),
    exclude_types TEXT[] DEFAULT ARRAY[], -- Types to exclude from deletion
    
    -- Processing
    requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ, -- Can schedule deletion for future date
    
    -- Verification
    verification_token TEXT,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    verified_at TIMESTAMPTZ,
    
    -- Metadata
    reason TEXT,
    metadata JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. PRIVACY SETTINGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.privacy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Profile visibility
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
    show_reading_activity BOOLEAN DEFAULT TRUE NOT NULL,
    show_achievements BOOLEAN DEFAULT TRUE NOT NULL,
    show_followers BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Data sharing
    allow_data_sharing BOOLEAN DEFAULT FALSE NOT NULL,
    allow_analytics BOOLEAN DEFAULT TRUE NOT NULL,
    allow_personalization BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Search visibility
    show_in_search BOOLEAN DEFAULT TRUE NOT NULL,
    show_email_in_search BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Third-party sharing
    allow_third_party_sharing BOOLEAN DEFAULT FALSE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(user_id)
);

-- ========================================
-- 5. COOKIE PREFERENCES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.cookie_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- For anonymous users
    
    -- Cookie categories
    essential BOOLEAN DEFAULT TRUE NOT NULL, -- Always true, required
    analytics BOOLEAN DEFAULT FALSE NOT NULL,
    marketing BOOLEAN DEFAULT FALSE NOT NULL,
    functional BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(COALESCE(user_id::TEXT, ''), COALESCE(session_id, ''))
);

-- ========================================
-- 6. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON public.user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_consented ON public.user_consents(consented) WHERE consented = TRUE;

CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON public.data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_created_at ON public.data_export_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user_id ON public.data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_status ON public.data_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_scheduled_for ON public.data_deletion_requests(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON public.privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_cookie_preferences_user_id ON public.cookie_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_cookie_preferences_session_id ON public.cookie_preferences(session_id);

-- ========================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_preferences ENABLE ROW LEVEL SECURITY;

-- User Consents Policies
CREATE POLICY "Users can view their own consents"
    ON public.user_consents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own consents"
    ON public.user_consents FOR ALL
    USING (auth.uid() = user_id);

-- Data Export Requests Policies
CREATE POLICY "Users can view their own export requests"
    ON public.data_export_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export requests"
    ON public.data_export_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own export requests"
    ON public.data_export_requests FOR UPDATE
    USING (auth.uid() = user_id);

-- Data Deletion Requests Policies
CREATE POLICY "Users can view their own deletion requests"
    ON public.data_deletion_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deletion requests"
    ON public.data_deletion_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deletion requests"
    ON public.data_deletion_requests FOR UPDATE
    USING (auth.uid() = user_id);

-- Privacy Settings Policies
CREATE POLICY "Users can view their own privacy settings"
    ON public.privacy_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own privacy settings"
    ON public.privacy_settings FOR ALL
    USING (auth.uid() = user_id);

-- Cookie Preferences Policies
CREATE POLICY "Users can view their own cookie preferences"
    ON public.cookie_preferences FOR SELECT
    USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can manage their own cookie preferences"
    ON public.cookie_preferences FOR ALL
    USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- ========================================
-- 8. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_user_consents_updated_at
    BEFORE UPDATE ON public.user_consents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_export_requests_updated_at
    BEFORE UPDATE ON public.data_export_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_deletion_requests_updated_at
    BEFORE UPDATE ON public.data_deletion_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at
    BEFORE UPDATE ON public.privacy_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cookie_preferences_updated_at
    BEFORE UPDATE ON public.cookie_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default privacy settings
CREATE OR REPLACE FUNCTION public.create_default_privacy_settings(p_user_id UUID)
RETURNS public.privacy_settings AS $$
DECLARE
    v_settings public.privacy_settings;
BEGIN
    INSERT INTO public.privacy_settings (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING * INTO v_settings;

    IF v_settings IS NULL THEN
        SELECT * INTO v_settings
        FROM public.privacy_settings
        WHERE user_id = p_user_id;
    END IF;

    RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create cookie preferences
CREATE OR REPLACE FUNCTION public.get_or_create_cookie_preferences(
    p_user_id UUID,
    p_session_id TEXT
)
RETURNS public.cookie_preferences AS $$
DECLARE
    v_prefs public.cookie_preferences;
BEGIN
    SELECT * INTO v_prefs
    FROM public.cookie_preferences
    WHERE (user_id = p_user_id OR (user_id IS NULL AND session_id = p_session_id))
    LIMIT 1;

    IF v_prefs IS NULL THEN
        INSERT INTO public.cookie_preferences (user_id, session_id)
        VALUES (p_user_id, p_session_id)
        RETURNING * INTO v_prefs;
    END IF;

    RETURN v_prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.user_consents IS 'Tracks user consent for GDPR compliance';
COMMENT ON TABLE public.data_export_requests IS 'GDPR data export requests (Right to Data Portability)';
COMMENT ON TABLE public.data_deletion_requests IS 'GDPR data deletion requests (Right to be Forgotten)';
COMMENT ON TABLE public.privacy_settings IS 'User privacy and visibility settings';
COMMENT ON TABLE public.cookie_preferences IS 'User cookie consent preferences';

COMMENT ON COLUMN public.data_export_requests.expires_at IS 'Export files expire after 30 days for security';
COMMENT ON COLUMN public.data_deletion_requests.scheduled_for IS 'Can schedule account deletion for future date';
COMMENT ON COLUMN public.cookie_preferences.session_id IS 'For tracking anonymous users cookie preferences';

