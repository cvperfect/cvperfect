-- CVPerfect Security Schema for Supabase
-- Production-ready security tables and policies

-- Security logs table for comprehensive security monitoring
CREATE TABLE IF NOT EXISTS security_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id TEXT,
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    endpoint TEXT,
    method TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    severity VARCHAR(20) DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for security logs
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);

-- API keys management table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash of the actual key
    key_type VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (key_type IN ('general', 'admin', 'ml', 'webhook')),
    permissions TEXT[] DEFAULT '{}',
    rate_limit INTEGER DEFAULT 100, -- requests per window
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_type ON api_keys(key_type);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- ML optimization usage tracking for quota management
CREATE TABLE IF NOT EXISTS ml_optimization_usage (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_id UUID,
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('basic', 'gold', 'premium')),
    optimization_type VARCHAR(50) DEFAULT 'standard',
    processing_time_ms INTEGER,
    ats_score DECIMAL(5,2),
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ML usage tracking
CREATE INDEX IF NOT EXISTS idx_ml_usage_user_id ON ml_optimization_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_usage_date ON ml_optimization_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_usage_plan ON ml_optimization_usage(plan);
CREATE INDEX IF NOT EXISTS idx_ml_usage_success ON ml_optimization_usage(success);

-- Failed authentication attempts tracking
CREATE TABLE IF NOT EXISTS failed_auth_attempts (
    id BIGSERIAL PRIMARY KEY,
    ip_address INET NOT NULL,
    user_agent TEXT,
    attempted_user_id TEXT,
    failure_reason VARCHAR(100),
    endpoint TEXT,
    attempt_count INTEGER DEFAULT 1,
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for failed auth tracking
CREATE INDEX IF NOT EXISTS idx_failed_auth_ip ON failed_auth_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_auth_blocked_until ON failed_auth_attempts(blocked_until);
CREATE INDEX IF NOT EXISTS idx_failed_auth_created ON failed_auth_attempts(created_at DESC);

-- Session security tracking
CREATE TABLE IF NOT EXISTS session_security (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    location_country VARCHAR(2),
    location_city VARCHAR(100),
    is_suspicious BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    security_events INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for session security
CREATE INDEX IF NOT EXISTS idx_session_security_session_id ON session_security(session_id);
CREATE INDEX IF NOT EXISTS idx_session_security_suspicious ON session_security(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_session_security_risk_score ON session_security(risk_score DESC);

-- Data encryption keys management (for sensitive data)
CREATE TABLE IF NOT EXISTS encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(100) NOT NULL UNIQUE,
    key_version INTEGER DEFAULT 1,
    algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    rotated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Audit trail for sensitive operations
CREATE TABLE IF NOT EXISTS audit_trail (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id TEXT NOT NULL,
    user_id TEXT,
    session_id UUID,
    old_values JSONB,
    new_values JSONB,
    changed_columns TEXT[],
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit trail
CREATE INDEX IF NOT EXISTS idx_audit_trail_table ON audit_trail(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_trail_operation ON audit_trail(operation);
CREATE INDEX IF NOT EXISTS idx_audit_trail_record_id ON audit_trail(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created ON audit_trail(created_at DESC);

-- GDPR compliance - data processing logs
CREATE TABLE IF NOT EXISTS data_processing_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT,
    session_id UUID,
    processing_type VARCHAR(100) NOT NULL, -- 'cv_optimization', 'data_export', 'data_deletion', etc.
    data_types TEXT[] NOT NULL, -- ['personal_data', 'cv_content', 'payment_info', etc.]
    legal_basis VARCHAR(100), -- 'consent', 'contract', 'legitimate_interest'
    purpose TEXT NOT NULL,
    retention_period INTERVAL,
    data_location VARCHAR(100) DEFAULT 'EU', -- For data residency compliance
    automated_processing BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for GDPR compliance
CREATE INDEX IF NOT EXISTS idx_data_processing_user_id ON data_processing_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_data_processing_type ON data_processing_logs(processing_type);
CREATE INDEX IF NOT EXISTS idx_data_processing_created ON data_processing_logs(created_at DESC);

-- Enhanced user_sessions table with security fields (ALTER existing table)
DO $$
BEGIN
    -- Add security columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'security_validated') THEN
        ALTER TABLE user_sessions ADD COLUMN security_validated BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'risk_score') THEN
        ALTER TABLE user_sessions ADD COLUMN risk_score INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'ip_address') THEN
        ALTER TABLE user_sessions ADD COLUMN ip_address INET;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_agent') THEN
        ALTER TABLE user_sessions ADD COLUMN user_agent TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'refresh_token') THEN
        ALTER TABLE user_sessions ADD COLUMN refresh_token VARCHAR(64); -- Hashed refresh token
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'last_activity') THEN
        ALTER TABLE user_sessions ADD COLUMN last_activity TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Row Level Security (RLS) Policies

-- Enable RLS on all security tables
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_optimization_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_logs ENABLE ROW LEVEL SECURITY;

-- Security logs policies
CREATE POLICY "security_logs_admin_full_access" ON security_logs
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "security_logs_service_insert" ON security_logs
    FOR INSERT WITH CHECK (true); -- Allow service to insert logs

CREATE POLICY "security_logs_user_own_data" ON security_logs
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

-- API keys policies (admin only)
CREATE POLICY "api_keys_admin_only" ON api_keys
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ML usage policies
CREATE POLICY "ml_usage_user_own_data" ON ml_optimization_usage
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "ml_usage_service_insert" ON ml_optimization_usage
    FOR INSERT WITH CHECK (true);

CREATE POLICY "ml_usage_admin_full_access" ON ml_optimization_usage
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Failed auth attempts (admin only for security)
CREATE POLICY "failed_auth_admin_only" ON failed_auth_attempts
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Session security policies
CREATE POLICY "session_security_user_own_data" ON session_security
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM user_sessions WHERE user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "session_security_service_manage" ON session_security
    FOR ALL WITH CHECK (true); -- Allow service to manage

-- Audit trail policies
CREATE POLICY "audit_trail_admin_full_access" ON audit_trail
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "audit_trail_user_own_data" ON audit_trail
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

-- GDPR data processing logs
CREATE POLICY "data_processing_user_own_data" ON data_processing_logs
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "data_processing_service_insert" ON data_processing_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "data_processing_admin_full_access" ON data_processing_logs
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Functions for security monitoring

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION is_ip_blocked(check_ip INET)
RETURNS BOOLEAN AS $$
DECLARE
    block_record RECORD;
BEGIN
    SELECT * INTO block_record
    FROM failed_auth_attempts
    WHERE ip_address = check_ip
    AND blocked_until > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment failed auth attempts
CREATE OR REPLACE FUNCTION increment_failed_auth(
    attempt_ip INET,
    attempt_user_agent TEXT DEFAULT NULL,
    attempted_user TEXT DEFAULT NULL,
    failure_reason TEXT DEFAULT 'unknown'
)
RETURNS VOID AS $$
DECLARE
    current_attempts INTEGER;
    block_duration INTERVAL;
BEGIN
    -- Get current attempt count
    SELECT attempt_count INTO current_attempts
    FROM failed_auth_attempts
    WHERE ip_address = attempt_ip
    AND created_at > NOW() - INTERVAL '1 hour';
    
    IF NOT FOUND THEN
        current_attempts := 0;
    END IF;
    
    current_attempts := current_attempts + 1;
    
    -- Determine block duration based on attempt count
    IF current_attempts >= 10 THEN
        block_duration := INTERVAL '24 hours';
    ELSIF current_attempts >= 5 THEN
        block_duration := INTERVAL '1 hour';
    ELSIF current_attempts >= 3 THEN
        block_duration := INTERVAL '15 minutes';
    ELSE
        block_duration := INTERVAL '0';
    END IF;
    
    -- Insert or update failed attempt record
    INSERT INTO failed_auth_attempts (
        ip_address,
        user_agent,
        attempted_user_id,
        failure_reason,
        attempt_count,
        blocked_until
    )
    VALUES (
        attempt_ip,
        attempt_user_agent,
        attempted_user,
        failure_reason,
        current_attempts,
        CASE WHEN block_duration > INTERVAL '0' THEN NOW() + block_duration ELSE NULL END
    )
    ON CONFLICT (ip_address)
    DO UPDATE SET
        attempt_count = EXCLUDED.attempt_count,
        blocked_until = EXCLUDED.blocked_until,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old security logs
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS VOID AS $$
BEGIN
    -- Delete logs older than 90 days (adjust retention as needed)
    DELETE FROM security_logs
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Delete old failed auth attempts
    DELETE FROM failed_auth_attempts
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete old ML usage records (keep for analytics)
    -- DELETE FROM ml_optimization_usage
    -- WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_security ON user_sessions(security_validated, risk_score);
CREATE INDEX IF NOT EXISTS idx_user_sessions_activity ON user_sessions(last_activity DESC);

-- Views for security monitoring

-- Security dashboard view
CREATE OR REPLACE VIEW security_dashboard AS
SELECT
    DATE(created_at) as date,
    event_type,
    severity,
    COUNT(*) as event_count,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT user_id) as unique_users
FROM security_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), event_type, severity
ORDER BY date DESC, event_count DESC;

-- High risk sessions view
CREATE OR REPLACE VIEW high_risk_sessions AS
SELECT
    us.id,
    us.user_id,
    us.created_at,
    us.risk_score,
    ss.is_suspicious,
    ss.security_events,
    ss.ip_address,
    ss.location_country
FROM user_sessions us
LEFT JOIN session_security ss ON us.id = ss.session_id
WHERE us.risk_score > 70 OR ss.is_suspicious = true
ORDER BY us.risk_score DESC, us.created_at DESC;

-- ML usage analytics view
CREATE OR REPLACE VIEW ml_usage_analytics AS
SELECT
    DATE(created_at) as date,
    plan,
    COUNT(*) as optimization_count,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(processing_time_ms) as avg_processing_time,
    AVG(ats_score) as avg_ats_score,
    COUNT(*) FILTER (WHERE success = false) as failed_optimizations
FROM ml_optimization_usage
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), plan
ORDER BY date DESC, optimization_count DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE security_logs IS 'Comprehensive security event logging for monitoring and compliance';
COMMENT ON TABLE api_keys IS 'API key management with hashing and rate limiting';
COMMENT ON TABLE ml_optimization_usage IS 'ML optimization usage tracking for quota management';
COMMENT ON TABLE failed_auth_attempts IS 'Failed authentication attempts tracking for security';
COMMENT ON TABLE session_security IS 'Session-based security monitoring and risk assessment';
COMMENT ON TABLE audit_trail IS 'Audit trail for sensitive data operations';
COMMENT ON TABLE data_processing_logs IS 'GDPR compliance data processing activity logs';