-- Location: supabase/migrations/20241219130000_add_enterprise_licensing.sql
-- Schema Analysis: Existing user_profiles, stories
-- Integration Type: Extension - Adding enterprise licensing features
-- Dependencies: user_profiles, stories, auth.users

-- ========================================
-- 1. ENTERPRISE ACCOUNTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.enterprise_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Account details
    company_name TEXT NOT NULL,
    company_type TEXT NOT NULL CHECK (company_type IN ('corporation', 'nonprofit', 'government', 'education', 'publisher', 'media')),
    industry TEXT,
    
    -- Contact information
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    billing_email TEXT,
    address TEXT,
    city TEXT,
    state_province TEXT,
    country TEXT,
    postal_code TEXT,
    
    -- Account admin
    primary_admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    
    -- Subscription
    subscription_tier TEXT DEFAULT 'enterprise' CHECK (subscription_tier IN ('enterprise', 'enterprise_plus', 'custom')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled', 'expired')),
    subscription_start_date DATE,
    subscription_end_date DATE,
    billing_cycle TEXT DEFAULT 'annual' CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual', 'custom')),
    
    -- License details
    license_type TEXT DEFAULT 'white_label' CHECK (license_type IN ('white_label', 'api_access', 'custom', 'hybrid')),
    max_users INTEGER,
    max_stories INTEGER,
    max_storage_gb INTEGER,
    
    -- Features
    features_enabled JSONB DEFAULT '{}' NOT NULL,
    custom_features JSONB DEFAULT '{}' NOT NULL,
    api_access_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    api_rate_limit INTEGER DEFAULT 1000, -- Requests per hour
    
    -- White-label settings
    white_label_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    custom_domain TEXT,
    custom_branding JSONB DEFAULT '{}' NOT NULL, -- Logo, colors, etc.
    custom_terms_url TEXT,
    custom_privacy_url TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 2. ENTERPRISE USERS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.enterprise_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL REFERENCES public.enterprise_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- User role
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'editor', 'viewer', 'api_user')),
    department TEXT,
    team TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    
    -- Permissions
    permissions JSONB DEFAULT '{}' NOT NULL,
    api_access_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    api_key TEXT UNIQUE,
    api_key_created_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(enterprise_id, user_id)
);

-- ========================================
-- 3. API KEYS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL REFERENCES public.enterprise_accounts(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    
    -- Key details
    key_name TEXT NOT NULL,
    api_key TEXT NOT NULL UNIQUE,
    api_secret TEXT,
    
    -- Permissions
    scopes TEXT[] DEFAULT '{}' NOT NULL, -- ['read:stories', 'write:stories', 'read:users', etc.]
    rate_limit INTEGER DEFAULT 1000, -- Requests per hour
    rate_limit_window TEXT DEFAULT 'hour' CHECK (rate_limit_window IN ('minute', 'hour', 'day', 'month')),
    
    -- Restrictions
    allowed_ips TEXT[] DEFAULT '{}', -- IP whitelist
    allowed_origins TEXT[] DEFAULT '{}', -- CORS origins
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    
    -- Usage tracking
    total_requests INTEGER DEFAULT 0 NOT NULL,
    failed_requests INTEGER DEFAULT 0 NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 4. API USAGE LOGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
    enterprise_id UUID NOT NULL REFERENCES public.enterprise_accounts(id) ON DELETE CASCADE,
    
    -- Request details
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    
    -- Request data
    request_ip TEXT,
    user_agent TEXT,
    request_body_size INTEGER,
    response_body_size INTEGER,
    
    -- Error tracking
    error_message TEXT,
    error_code TEXT,
    
    -- Timestamp
    requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 5. WHITE-LABEL CUSTOMIZATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.white_label_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL REFERENCES public.enterprise_accounts(id) ON DELETE CASCADE,
    
    -- Branding
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    accent_color TEXT,
    background_color TEXT,
    text_color TEXT,
    
    -- Typography
    font_family TEXT,
    heading_font TEXT,
    
    -- Custom content
    custom_css TEXT,
    custom_javascript TEXT,
    footer_text TEXT,
    help_docs_url TEXT,
    
    -- Domain
    custom_domain TEXT UNIQUE,
    ssl_certificate_status TEXT CHECK (ssl_certificate_status IN ('pending', 'active', 'expired', 'error')),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    UNIQUE(enterprise_id)
);

-- ========================================
-- 6. ENTERPRISE ANALYTICS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.enterprise_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL REFERENCES public.enterprise_accounts(id) ON DELETE CASCADE,
    
    -- Time period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Usage metrics
    active_users INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    stories_created INTEGER DEFAULT 0,
    stories_published INTEGER DEFAULT 0,
    total_reads INTEGER DEFAULT 0,
    total_reading_time_minutes INTEGER DEFAULT 0,
    
    -- API metrics
    api_requests INTEGER DEFAULT 0,
    api_success_rate DECIMAL(5, 2) DEFAULT 0,
    api_average_response_time_ms DECIMAL(10, 2) DEFAULT 0,
    
    -- Storage metrics
    storage_used_gb DECIMAL(10, 2) DEFAULT 0,
    storage_limit_gb DECIMAL(10, 2),
    
    -- Engagement metrics
    user_engagement_score DECIMAL(5, 2) DEFAULT 0,
    content_quality_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}' NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ========================================
-- 7. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_status ON public.enterprise_accounts(subscription_status);
CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_admin ON public.enterprise_accounts(primary_admin_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_accounts_active ON public.enterprise_accounts(subscription_status) WHERE subscription_status = 'active';

CREATE INDEX IF NOT EXISTS idx_enterprise_users_enterprise ON public.enterprise_users(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_user ON public.enterprise_users(user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_users_active ON public.enterprise_users(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_api_keys_enterprise ON public.api_keys(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON public.api_keys(api_key);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_key ON public.api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_enterprise ON public.api_usage_logs(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_requested ON public.api_usage_logs(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_endpoint ON public.api_usage_logs(endpoint);

CREATE INDEX IF NOT EXISTS idx_white_label_customizations_enterprise ON public.white_label_customizations(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_white_label_customizations_domain ON public.white_label_customizations(custom_domain) WHERE custom_domain IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_enterprise_analytics_enterprise ON public.enterprise_analytics(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_analytics_period ON public.enterprise_analytics(period_start, period_end);

-- ========================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

ALTER TABLE public.enterprise_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_label_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_analytics ENABLE ROW LEVEL SECURITY;

-- Enterprise Accounts Policies
CREATE POLICY "Enterprise admins can manage their account"
    ON public.enterprise_accounts FOR ALL
    USING (primary_admin_id = auth.uid())
    WITH CHECK (primary_admin_id = auth.uid());

-- Enterprise Users Policies
CREATE POLICY "Enterprise users can view their enterprise"
    ON public.enterprise_users FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.enterprise_accounts
        WHERE enterprise_accounts.id = enterprise_users.enterprise_id
        AND enterprise_accounts.primary_admin_id = auth.uid()
    ));

-- API Keys Policies
CREATE POLICY "Enterprise admins can manage API keys"
    ON public.api_keys FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.enterprise_accounts
            WHERE enterprise_accounts.id = api_keys.enterprise_id
            AND enterprise_accounts.primary_admin_id = auth.uid()
        )
    );

-- API Usage Logs Policies
CREATE POLICY "Enterprise admins can view usage logs"
    ON public.api_usage_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.enterprise_accounts
            WHERE enterprise_accounts.id = api_usage_logs.enterprise_id
            AND enterprise_accounts.primary_admin_id = auth.uid()
        )
    );

-- White-Label Customizations Policies
CREATE POLICY "Enterprise admins can manage customizations"
    ON public.white_label_customizations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.enterprise_accounts
            WHERE enterprise_accounts.id = white_label_customizations.enterprise_id
            AND enterprise_accounts.primary_admin_id = auth.uid()
        )
    );

-- Enterprise Analytics Policies
CREATE POLICY "Enterprise admins can view analytics"
    ON public.enterprise_analytics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.enterprise_accounts
            WHERE enterprise_accounts.id = enterprise_analytics.enterprise_id
            AND enterprise_accounts.primary_admin_id = auth.uid()
        )
    );

-- ========================================
-- 9. FUNCTIONS AND TRIGGERS
-- ========================================

-- Triggers for updated_at
CREATE TRIGGER update_enterprise_accounts_updated_at
    BEFORE UPDATE ON public.enterprise_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprise_users_updated_at
    BEFORE UPDATE ON public.enterprise_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON public.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_white_label_customizations_updated_at
    BEFORE UPDATE ON public.white_label_customizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprise_analytics_updated_at
    BEFORE UPDATE ON public.enterprise_analytics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate API key
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT AS $$
BEGIN
    RETURN 'sk_' || encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to update API usage stats
CREATE OR REPLACE FUNCTION public.update_api_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.api_keys
        SET 
            total_requests = total_requests + 1,
            last_used_at = NEW.requested_at,
            failed_requests = failed_requests + CASE WHEN NEW.status_code >= 400 THEN 1 ELSE 0 END
        WHERE id = NEW.api_key_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_api_usage_stats_trigger
    AFTER INSERT ON public.api_usage_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_api_usage_stats();

-- ========================================
-- 10. COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE public.enterprise_accounts IS 'Enterprise customer accounts';
COMMENT ON TABLE public.enterprise_users IS 'Users within enterprise accounts';
COMMENT ON TABLE public.api_keys IS 'API keys for enterprise API access';
COMMENT ON TABLE public.api_usage_logs IS 'API request logs for usage tracking';
COMMENT ON TABLE public.white_label_customizations IS 'White-label branding and customization';
COMMENT ON TABLE public.enterprise_analytics IS 'Analytics for enterprise accounts';

COMMENT ON COLUMN public.enterprise_accounts.license_type IS 'Type of license (white_label, api_access, custom, hybrid)';
COMMENT ON COLUMN public.api_keys.scopes IS 'Array of permission scopes for the API key';
COMMENT ON COLUMN public.white_label_customizations.custom_domain IS 'Custom domain for white-label deployment';

