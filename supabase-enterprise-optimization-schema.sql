-- CVPerfect Enterprise Database Optimization Schema
-- Supabase PostgreSQL optimized for >10k concurrent users
-- Production-ready scaling with performance monitoring

-- ========================================
-- PART 1: CORE EXTENSIONS AND SETTINGS
-- ========================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "postgis" CASCADE; -- For location tracking
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes
CREATE EXTENSION IF NOT EXISTS "bloom"; -- For large data filtering

-- Configure pg_stat_statements for query monitoring
SELECT pg_stat_statements_reset();

-- ========================================
-- PART 2: CORE BUSINESS TABLES OPTIMIZATION
-- ========================================

-- CVPerfect Sessions Table - Optimized for enterprise scale
CREATE TABLE IF NOT EXISTS cvperfect_sessions (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    
    -- User and auth data
    user_id TEXT,
    stripe_customer_id TEXT,
    
    -- CV processing data
    cv_data JSONB,
    cv_text TEXT,
    parsed_data JSONB,
    original_filename TEXT,
    file_size INTEGER,
    
    -- Payment and plan data
    selected_plan TEXT CHECK (selected_plan IN ('Basic', 'Gold', 'Premium')),
    payment_status TEXT CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
    stripe_session_id TEXT,
    payment_amount INTEGER, -- in cents
    
    -- Metadata and tracking
    metadata JSONB DEFAULT '{}',
    processing_status TEXT DEFAULT 'initial',
    optimization_results JSONB,
    
    -- Geographic and device info
    country_code CHAR(2),
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    browser_info JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for sessions (automatic archiving)
CREATE TABLE cvperfect_sessions_2025_01 PARTITION OF cvperfect_sessions
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE cvperfect_sessions_2025_02 PARTITION OF cvperfect_sessions
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE cvperfect_sessions_2025_03 PARTITION OF cvperfect_sessions
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Session indexes for high-performance queries
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON cvperfect_sessions (session_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_stripe_id ON cvperfect_sessions (stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_payment_status ON cvperfect_sessions (payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_cleanup ON cvperfect_sessions (expires_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_user_recent ON cvperfect_sessions (user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- JSONB indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_sessions_metadata_gin ON cvperfect_sessions USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_sessions_parsed_data_gin ON cvperfect_sessions USING GIN (parsed_data);

-- Composite index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_sessions_dashboard ON cvperfect_sessions 
    (payment_status, selected_plan, created_at DESC) 
    WHERE deleted_at IS NULL;

-- User Analytics and Behavior Tracking
CREATE TABLE IF NOT EXISTS user_analytics (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT,
    session_id TEXT REFERENCES cvperfect_sessions(session_id),
    
    -- Event tracking
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    
    -- User journey
    page_path TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Device and location
    ip_address INET,
    country_code CHAR(2),
    city TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_resolution TEXT,
    
    -- Performance metrics
    page_load_time INTEGER,
    interaction_time INTEGER,
    
    -- Timestamps
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Partitioning
    CONSTRAINT check_timestamp CHECK (timestamp >= '2025-01-01'::timestamptz)
) PARTITION BY RANGE (timestamp);

-- Analytics partitions by day for high-volume data
CREATE TABLE user_analytics_2025_01 PARTITION OF user_analytics
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE user_analytics_2025_02 PARTITION OF user_analytics
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON user_analytics (event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON user_analytics (session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_user_journey ON user_analytics (user_id, timestamp) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_performance ON user_analytics (page_load_time) WHERE page_load_time IS NOT NULL;

-- Payment Transaction History
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction identification
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_charge_id TEXT,
    session_id TEXT REFERENCES cvperfect_sessions(session_id),
    user_id TEXT,
    
    -- Transaction details
    amount INTEGER NOT NULL, -- in cents
    currency CHAR(3) DEFAULT 'PLN',
    plan TEXT NOT NULL,
    status TEXT NOT NULL,
    
    -- Stripe webhook data
    webhook_data JSONB,
    webhook_processed_at TIMESTAMPTZ,
    
    -- Financial tracking
    fees INTEGER, -- Stripe fees in cents
    net_amount INTEGER, -- amount after fees
    tax_amount INTEGER,
    
    -- Geographic and compliance
    billing_country CHAR(2),
    tax_id TEXT,
    invoice_url TEXT,
    receipt_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Refund tracking
    refund_amount INTEGER DEFAULT 0,
    refunded_at TIMESTAMPTZ
);

-- Payment indexes for financial reporting
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payment_transactions (stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status_date ON payment_transactions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_plan_revenue ON payment_transactions (plan, created_at DESC) WHERE status = 'succeeded';
CREATE INDEX IF NOT EXISTS idx_payments_user_history ON payment_transactions (user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- ========================================
-- PART 3: PERFORMANCE OPTIMIZATION VIEWS
-- ========================================

-- Real-time business metrics view
CREATE OR REPLACE VIEW business_metrics_realtime AS
SELECT 
    -- Revenue metrics
    COUNT(*) FILTER (WHERE pt.status = 'succeeded' AND pt.created_at >= NOW() - INTERVAL '24 hours') as daily_successful_payments,
    COALESCE(SUM(pt.net_amount) FILTER (WHERE pt.status = 'succeeded' AND pt.created_at >= NOW() - INTERVAL '24 hours'), 0) as daily_revenue_cents,
    
    -- Session metrics
    COUNT(DISTINCT cs.session_id) FILTER (WHERE cs.created_at >= NOW() - INTERVAL '24 hours') as daily_sessions,
    COUNT(DISTINCT cs.user_id) FILTER (WHERE cs.user_id IS NOT NULL AND cs.created_at >= NOW() - INTERVAL '24 hours') as daily_users,
    
    -- Conversion metrics
    ROUND(
        (COUNT(*) FILTER (WHERE pt.status = 'succeeded' AND pt.created_at >= NOW() - INTERVAL '24 hours'))::numeric * 100.0 /
        NULLIF(COUNT(DISTINCT cs.session_id) FILTER (WHERE cs.created_at >= NOW() - INTERVAL '24 hours'), 0), 2
    ) as daily_conversion_rate,
    
    -- Plan distribution
    COUNT(*) FILTER (WHERE pt.plan = 'Basic' AND pt.status = 'succeeded' AND pt.created_at >= NOW() - INTERVAL '24 hours') as daily_basic_sales,
    COUNT(*) FILTER (WHERE pt.plan = 'Gold' AND pt.status = 'succeeded' AND pt.created_at >= NOW() - INTERVAL '24 hours') as daily_gold_sales,
    COUNT(*) FILTER (WHERE pt.plan = 'Premium' AND pt.status = 'succeeded' AND pt.created_at >= NOW() - INTERVAL '24 hours') as daily_premium_sales,
    
    -- Performance indicators
    AVG(ua.page_load_time) FILTER (WHERE ua.timestamp >= NOW() - INTERVAL '1 hour' AND ua.page_load_time < 10000) as avg_page_load_ms,
    
    -- Current system status
    NOW() as calculated_at
FROM payment_transactions pt
FULL OUTER JOIN cvperfect_sessions cs ON cs.session_id = pt.session_id
FULL OUTER JOIN user_analytics ua ON ua.session_id = cs.session_id;

-- Materialized view for expensive aggregations (updated hourly)
CREATE MATERIALIZED VIEW IF NOT EXISTS business_metrics_hourly AS
SELECT 
    DATE_TRUNC('hour', pt.created_at) as hour,
    
    -- Financial metrics
    COUNT(*) FILTER (WHERE pt.status = 'succeeded') as successful_payments,
    COALESCE(SUM(pt.amount), 0) as gross_revenue_cents,
    COALESCE(SUM(pt.net_amount), 0) as net_revenue_cents,
    COALESCE(AVG(pt.amount), 0) as avg_transaction_value,
    
    -- Plan breakdown
    COUNT(*) FILTER (WHERE pt.plan = 'Basic' AND pt.status = 'succeeded') as basic_sales,
    COUNT(*) FILTER (WHERE pt.plan = 'Gold' AND pt.status = 'succeeded') as gold_sales,
    COUNT(*) FILTER (WHERE pt.plan = 'Premium' AND pt.status = 'succeeded') as premium_sales,
    
    -- Geographic breakdown
    JSONB_OBJECT_AGG(pt.billing_country, 
        COUNT(*) FILTER (WHERE pt.status = 'succeeded')
    ) FILTER (WHERE pt.billing_country IS NOT NULL) as country_sales,
    
    -- Session metrics for the hour
    COUNT(DISTINCT cs.session_id) as unique_sessions,
    COUNT(DISTINCT cs.user_id) FILTER (WHERE cs.user_id IS NOT NULL) as unique_users
FROM payment_transactions pt
LEFT JOIN cvperfect_sessions cs ON cs.session_id = pt.session_id
WHERE pt.created_at >= NOW() - INTERVAL '30 days'
GROUP BY hour
ORDER BY hour DESC;

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_metrics_hourly_hour ON business_metrics_hourly (hour);

-- ========================================
-- PART 4: CONNECTION POOLING AND PERFORMANCE
-- ========================================

-- Configure connection pooling settings for Supabase Pro
-- These settings optimize for high-concurrency workloads

-- Adjust PostgreSQL settings for high performance
-- Note: These are recommendations for Supabase Pro configuration

/*
Recommended Supabase Pro Settings (configure in Supabase Dashboard):

Database Settings:
- max_connections: 500
- shared_buffers: 2GB
- effective_cache_size: 6GB
- maintenance_work_mem: 512MB
- checkpoint_completion_target: 0.9
- wal_buffers: 16MB
- default_statistics_target: 100
- random_page_cost: 1.1
- effective_io_concurrency: 200

Connection Pooler:
- Pool Mode: Transaction
- Default Pool Size: 50
- Max Client Connections: 1000
- Server Idle Timeout: 600s
*/

-- ========================================
-- PART 5: AUTOMATED MAINTENANCE AND MONITORING
-- ========================================

-- Automated cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
DECLARE
    expired_sessions_count INTEGER;
    old_analytics_count INTEGER;
    cleanup_stats JSONB;
BEGIN
    -- Delete expired sessions
    WITH deleted_sessions AS (
        DELETE FROM cvperfect_sessions 
        WHERE expires_at < NOW() - INTERVAL '1 hour'
        AND deleted_at IS NULL
        RETURNING session_id
    )
    SELECT COUNT(*) INTO expired_sessions_count FROM deleted_sessions;
    
    -- Archive old analytics data (keep 90 days)
    WITH deleted_analytics AS (
        DELETE FROM user_analytics
        WHERE timestamp < NOW() - INTERVAL '90 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO old_analytics_count FROM deleted_analytics;
    
    -- Update statistics
    ANALYZE cvperfect_sessions;
    ANALYZE user_analytics;
    ANALYZE payment_transactions;
    
    -- Refresh materialized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY business_metrics_hourly;
    
    -- Log cleanup results
    cleanup_stats := jsonb_build_object(
        'expired_sessions_deleted', expired_sessions_count,
        'old_analytics_deleted', old_analytics_count,
        'cleanup_time', NOW(),
        'next_cleanup', NOW() + INTERVAL '1 hour'
    );
    
    -- Insert cleanup log
    INSERT INTO user_analytics (event_type, event_data, timestamp)
    VALUES ('database_cleanup', cleanup_stats, NOW());
    
    -- Raise notice for monitoring
    RAISE NOTICE 'Database cleanup completed: % sessions, % analytics records', 
        expired_sessions_deleted, old_analytics_deleted;
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring function
CREATE OR REPLACE FUNCTION get_database_performance_stats()
RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    metric_unit TEXT,
    threshold_status TEXT,
    last_updated TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH performance_data AS (
        -- Connection stats
        SELECT 
            'active_connections' as metric,
            COUNT(*)::numeric as value,
            'connections' as unit,
            CASE WHEN COUNT(*) > 400 THEN 'critical'
                 WHEN COUNT(*) > 200 THEN 'warning' 
                 ELSE 'good' END as status
        FROM pg_stat_activity 
        WHERE state = 'active'
        
        UNION ALL
        
        -- Query performance
        SELECT 
            'avg_query_time_ms',
            ROUND(AVG(mean_exec_time), 2),
            'milliseconds',
            CASE WHEN AVG(mean_exec_time) > 1000 THEN 'critical'
                 WHEN AVG(mean_exec_time) > 500 THEN 'warning'
                 ELSE 'good' END
        FROM pg_stat_statements
        WHERE calls > 10
        
        UNION ALL
        
        -- Cache hit ratio
        SELECT 
            'buffer_cache_hit_ratio',
            ROUND(
                (SUM(blks_hit)::numeric / NULLIF(SUM(blks_hit) + SUM(blks_read), 0)) * 100, 2
            ),
            'percentage',
            CASE WHEN (SUM(blks_hit)::numeric / NULLIF(SUM(blks_hit) + SUM(blks_read), 0)) < 0.95 
                 THEN 'warning' ELSE 'good' END
        FROM pg_stat_database
        
        UNION ALL
        
        -- Slow queries count
        SELECT 
            'slow_queries_count',
            COUNT(*)::numeric,
            'queries',
            CASE WHEN COUNT(*) > 50 THEN 'critical'
                 WHEN COUNT(*) > 10 THEN 'warning'
                 ELSE 'good' END
        FROM pg_stat_statements
        WHERE mean_exec_time > 1000
        
        UNION ALL
        
        -- Table sizes (largest 5 tables)
        SELECT 
            'largest_table_size_gb',
            ROUND(MAX(pg_total_relation_size(schemaname||'.'||tablename))::numeric / 1024 / 1024 / 1024, 2),
            'gigabytes',
            'info'
        FROM pg_tables 
        WHERE schemaname = 'public'
    )
    SELECT 
        pd.metric,
        pd.value,
        pd.unit,
        pd.status,
        NOW()
    FROM performance_data pd;
END;
$$ LANGUAGE plpgsql;

-- Query optimization recommendations
CREATE OR REPLACE FUNCTION get_optimization_recommendations()
RETURNS TABLE (
    priority TEXT,
    recommendation TEXT,
    table_name TEXT,
    estimated_impact TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH missing_indexes AS (
        -- Find missing indexes based on query patterns
        SELECT 
            'high' as priority,
            'Add index on ' || schemaname || '.' || tablename || ' (' || attname || ')' as recommendation,
            tablename,
            'Significant query speedup' as impact
        FROM pg_stats
        WHERE schemaname = 'public'
        AND correlation < 0.1
        AND n_distinct > 100
        
        UNION ALL
        
        -- Tables needing VACUUM
        SELECT 
            'medium',
            'Run VACUUM ANALYZE on ' || schemaname || '.' || tablename,
            tablename,
            'Improved query planning'
        FROM pg_stat_user_tables
        WHERE n_dead_tup > n_live_tup * 0.1
        AND n_live_tup > 1000
        
        UNION ALL
        
        -- Slow queries needing optimization
        SELECT 
            'high',
            'Optimize query: ' || LEFT(query, 100) || '...',
            '<query>',
            'Major performance improvement'
        FROM pg_stat_statements
        WHERE mean_exec_time > 5000
        AND calls > 100
        ORDER BY mean_exec_time DESC
        LIMIT 5
    )
    SELECT mi.priority, mi.recommendation, mi.tablename, mi.impact
    FROM missing_indexes mi
    ORDER BY 
        CASE mi.priority 
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            ELSE 4 
        END;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 6: AUTOMATED SCALING AND ALERTS
-- ========================================

-- Performance alerts table
CREATE TABLE IF NOT EXISTS performance_alerts_enterprise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Alert details
    alert_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'warning',
    message TEXT NOT NULL,
    
    -- Metrics that triggered the alert
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    threshold_value NUMERIC NOT NULL,
    
    -- Context
    affected_table TEXT,
    query_info JSONB,
    system_info JSONB,
    
    -- Resolution tracking
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'ignored')),
    acknowledged_by TEXT,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_alerts_enterprise_severity ON performance_alerts_enterprise (severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_enterprise_status ON performance_alerts_enterprise (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_enterprise_metric ON performance_alerts_enterprise (metric_name, created_at DESC);

-- Automated alert generation function
CREATE OR REPLACE FUNCTION check_system_health()
RETURNS void AS $$
DECLARE
    connection_count INTEGER;
    slow_query_count INTEGER;
    cache_hit_ratio NUMERIC;
    largest_table_size BIGINT;
BEGIN
    -- Check connection count
    SELECT COUNT(*) INTO connection_count
    FROM pg_stat_activity WHERE state = 'active';
    
    IF connection_count > 400 THEN
        INSERT INTO performance_alerts_enterprise 
        (alert_type, severity, message, metric_name, metric_value, threshold_value, system_info)
        VALUES (
            'connection_limit',
            'critical',
            'High number of active connections: ' || connection_count,
            'active_connections',
            connection_count,
            400,
            jsonb_build_object('timestamp', NOW(), 'connection_count', connection_count)
        );
    END IF;
    
    -- Check for slow queries
    SELECT COUNT(*) INTO slow_query_count
    FROM pg_stat_statements
    WHERE mean_exec_time > 5000 AND calls > 10;
    
    IF slow_query_count > 10 THEN
        INSERT INTO performance_alerts_enterprise 
        (alert_type, severity, message, metric_name, metric_value, threshold_value)
        VALUES (
            'slow_queries',
            'warning',
            'Multiple slow queries detected: ' || slow_query_count,
            'slow_query_count',
            slow_query_count,
            10
        );
    END IF;
    
    -- Check cache hit ratio
    SELECT ROUND(
        (SUM(blks_hit)::numeric / NULLIF(SUM(blks_hit) + SUM(blks_read), 0)) * 100, 2
    ) INTO cache_hit_ratio
    FROM pg_stat_database;
    
    IF cache_hit_ratio < 95 THEN
        INSERT INTO performance_alerts_enterprise 
        (alert_type, severity, message, metric_name, metric_value, threshold_value)
        VALUES (
            'cache_hit_ratio',
            'warning',
            'Low cache hit ratio: ' || cache_hit_ratio || '%',
            'buffer_cache_hit_ratio',
            cache_hit_ratio,
            95
        );
    END IF;
    
    -- Check largest table size (alert if over 10GB)
    SELECT MAX(pg_total_relation_size(schemaname||'.'||tablename))
    INTO largest_table_size
    FROM pg_tables WHERE schemaname = 'public';
    
    IF largest_table_size > 10 * 1024 * 1024 * 1024 THEN -- 10GB
        INSERT INTO performance_alerts_enterprise 
        (alert_type, severity, message, metric_name, metric_value, threshold_value)
        VALUES (
            'table_size',
            'warning',
            'Large table detected: ' || ROUND(largest_table_size::numeric / 1024 / 1024 / 1024, 2) || ' GB',
            'largest_table_size_gb',
            ROUND(largest_table_size::numeric / 1024 / 1024 / 1024, 2),
            10
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 7: SCHEDULED MAINTENANCE
-- ========================================

-- Schedule regular maintenance tasks using pg_cron
-- Note: Requires pg_cron extension and proper permissions

-- Cleanup expired data every hour
SELECT cron.schedule('cvperfect-cleanup', '0 * * * *', 'SELECT cleanup_expired_data();');

-- Refresh materialized views every 15 minutes
SELECT cron.schedule('cvperfect-refresh-views', '*/15 * * * *', 
    'REFRESH MATERIALIZED VIEW CONCURRENTLY business_metrics_hourly;');

-- System health check every 5 minutes
SELECT cron.schedule('cvperfect-health-check', '*/5 * * * *', 'SELECT check_system_health();');

-- Daily statistics update (more comprehensive)
SELECT cron.schedule('cvperfect-daily-stats', '0 2 * * *', 
    'ANALYZE; VACUUM (ANALYZE, VERBOSE); SELECT pg_stat_statements_reset();');

-- Weekly optimization review
SELECT cron.schedule('cvperfect-weekly-optimization', '0 3 * * 0', 
    'SELECT * FROM get_optimization_recommendations();');

-- ========================================
-- PART 8: ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE cvperfect_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts_enterprise ENABLE ROW LEVEL SECURITY;

-- Session policies
CREATE POLICY "Users can access own sessions" ON cvperfect_sessions
    FOR ALL USING (
        user_id = current_setting('app.current_user_id', true) OR
        session_id = current_setting('app.current_session_id', true)
    );

CREATE POLICY "Service role full access" ON cvperfect_sessions
    FOR ALL TO service_role USING (true);

CREATE POLICY "Anonymous can create sessions" ON cvperfect_sessions
    FOR INSERT TO anon WITH CHECK (true);

-- Analytics policies
CREATE POLICY "Analytics read-only for service" ON user_analytics
    FOR SELECT TO service_role USING (true);

CREATE POLICY "Anonymous can insert analytics" ON user_analytics
    FOR INSERT TO anon WITH CHECK (true);

-- Payment policies (highly restrictive)
CREATE POLICY "Service role only payments" ON payment_transactions
    FOR ALL TO service_role USING (true);

-- Alerts policies
CREATE POLICY "Service role manage alerts" ON performance_alerts_enterprise
    FOR ALL TO service_role USING (true);

CREATE POLICY "Authenticated read alerts" ON performance_alerts_enterprise
    FOR SELECT TO authenticated USING (true);

-- ========================================
-- PART 9: BACKUP AND DISASTER RECOVERY
-- ========================================

-- Point-in-time recovery function
CREATE OR REPLACE FUNCTION create_backup_checkpoint(backup_label TEXT DEFAULT 'cvperfect_checkpoint')
RETURNS TABLE (
    checkpoint_lsn TEXT,
    backup_label TEXT,
    timestamp TIMESTAMPTZ
) AS $$
BEGIN
    -- This function helps coordinate backup operations
    -- Actual PITR is handled by Supabase infrastructure
    
    RETURN QUERY
    SELECT 
        pg_current_wal_lsn()::TEXT as lsn,
        backup_label,
        NOW() as ts;
    
    -- Log the checkpoint creation
    INSERT INTO user_analytics (event_type, event_data, timestamp)
    VALUES (
        'backup_checkpoint',
        jsonb_build_object(
            'label', backup_label,
            'lsn', pg_current_wal_lsn(),
            'database_size_bytes', pg_database_size(current_database())
        ),
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Data integrity check function
CREATE OR REPLACE FUNCTION verify_data_integrity()
RETURNS TABLE (
    table_name TEXT,
    check_type TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check for orphaned sessions
    SELECT 
        'cvperfect_sessions'::TEXT,
        'orphaned_records'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
        'Found ' || COUNT(*) || ' sessions without valid references'
    FROM cvperfect_sessions cs
    LEFT JOIN payment_transactions pt ON pt.session_id = cs.session_id
    WHERE cs.payment_status = 'completed' AND pt.id IS NULL
    
    UNION ALL
    
    -- Check payment transaction consistency
    SELECT 
        'payment_transactions'::TEXT,
        'amount_consistency'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END,
        'Found ' || COUNT(*) || ' transactions with inconsistent amounts'
    FROM payment_transactions
    WHERE amount <= 0 OR net_amount > amount
    
    UNION ALL
    
    -- Check session expiration logic
    SELECT 
        'cvperfect_sessions'::TEXT,
        'expiration_logic'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'WARN' END,
        'Found ' || COUNT(*) || ' expired sessions not cleaned up'
    FROM cvperfect_sessions
    WHERE expires_at < NOW() - INTERVAL '1 day' AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 10: PERFORMANCE TESTING AND VALIDATION
-- ========================================

-- Load testing data generation
CREATE OR REPLACE FUNCTION generate_test_data(
    session_count INTEGER DEFAULT 1000,
    analytics_events_per_session INTEGER DEFAULT 10
)
RETURNS void AS $$
DECLARE
    i INTEGER;
    session_id_var TEXT;
    test_plans TEXT[] := ARRAY['Basic', 'Gold', 'Premium'];
    test_countries CHAR(2)[] := ARRAY['PL', 'US', 'DE', 'GB', 'FR'];
BEGIN
    -- Generate test sessions
    FOR i IN 1..session_count LOOP
        session_id_var := 'load_test_' || i || '_' || EXTRACT(epoch FROM NOW())::TEXT;
        
        INSERT INTO cvperfect_sessions (
            session_id, user_id, selected_plan, payment_status,
            country_code, metadata, created_at, expires_at
        ) VALUES (
            session_id_var,
            'test_user_' || (i % 100),
            test_plans[1 + (i % 3)],
            CASE WHEN random() > 0.3 THEN 'completed' ELSE 'pending' END,
            test_countries[1 + (i % 5)],
            jsonb_build_object('test_session', true, 'load_test_batch', NOW()),
            NOW() - (random() * INTERVAL '30 days'),
            NOW() + INTERVAL '24 hours'
        );
        
        -- Generate analytics events for each session
        FOR j IN 1..analytics_events_per_session LOOP
            INSERT INTO user_analytics (
                session_id, event_type, page_path, timestamp,
                page_load_time, ip_address
            ) VALUES (
                session_id_var,
                (ARRAY['page_view', 'button_click', 'form_submit', 'file_upload'])[1 + (j % 4)],
                (ARRAY['/', '/success', '/performance', '/api/analyze'])[1 + (j % 4)],
                NOW() - (random() * INTERVAL '30 days'),
                (random() * 3000 + 200)::INTEGER,
                ('192.168.' || (1 + (i % 255)) || '.' || (1 + (j % 255)))::INET
            );
        END LOOP;
    END LOOP;
    
    -- Generate corresponding payment transactions
    INSERT INTO payment_transactions (
        session_id, user_id, amount, currency, plan, status,
        stripe_payment_intent_id, created_at
    )
    SELECT 
        cs.session_id,
        cs.user_id,
        CASE cs.selected_plan 
            WHEN 'Basic' THEN 1999
            WHEN 'Gold' THEN 4900
            WHEN 'Premium' THEN 7900
        END,
        'PLN',
        cs.selected_plan,
        'succeeded',
        'pi_test_' || cs.session_id,
        cs.created_at
    FROM cvperfect_sessions cs
    WHERE cs.payment_status = 'completed'
    AND cs.session_id LIKE 'load_test_%';
    
    RAISE NOTICE 'Generated % test sessions with analytics data', session_count;
END;
$$ LANGUAGE plpgsql;

-- Performance benchmark function
CREATE OR REPLACE FUNCTION run_performance_benchmark()
RETURNS TABLE (
    test_name TEXT,
    duration_ms NUMERIC,
    rows_affected INTEGER,
    performance_rating TEXT
) AS $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    duration_ms NUMERIC;
    row_count INTEGER;
BEGIN
    -- Test 1: Session lookup performance
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO row_count
    FROM cvperfect_sessions 
    WHERE payment_status = 'completed'
    AND created_at >= NOW() - INTERVAL '7 days';
    
    end_time := clock_timestamp();
    duration_ms := EXTRACT(milliseconds FROM end_time - start_time);
    
    RETURN QUERY
    SELECT 
        'session_lookup'::TEXT,
        duration_ms,
        row_count,
        CASE WHEN duration_ms < 100 THEN 'excellent'
             WHEN duration_ms < 500 THEN 'good'
             WHEN duration_ms < 1000 THEN 'acceptable'
             ELSE 'poor' END::TEXT;
    
    -- Test 2: Analytics aggregation performance
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO row_count
    FROM user_analytics ua
    JOIN cvperfect_sessions cs ON cs.session_id = ua.session_id
    WHERE ua.timestamp >= NOW() - INTERVAL '24 hours'
    AND cs.payment_status = 'completed';
    
    end_time := clock_timestamp();
    duration_ms := EXTRACT(milliseconds FROM end_time - start_time);
    
    RETURN QUERY
    SELECT 
        'analytics_aggregation'::TEXT,
        duration_ms,
        row_count,
        CASE WHEN duration_ms < 200 THEN 'excellent'
             WHEN duration_ms < 1000 THEN 'good'
             WHEN duration_ms < 2000 THEN 'acceptable'
             ELSE 'poor' END::TEXT;
             
    -- Test 3: Business metrics calculation
    start_time := clock_timestamp();
    
    SELECT 1 INTO row_count; -- Dummy value since it's a complex view
    PERFORM * FROM business_metrics_realtime;
    
    end_time := clock_timestamp();
    duration_ms := EXTRACT(milliseconds FROM end_time - start_time);
    
    RETURN QUERY
    SELECT 
        'business_metrics_view'::TEXT,
        duration_ms,
        row_count,
        CASE WHEN duration_ms < 500 THEN 'excellent'
             WHEN duration_ms < 2000 THEN 'good'
             WHEN duration_ms < 5000 THEN 'acceptable'
             ELSE 'poor' END::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 11: MONITORING DASHBOARD FUNCTIONS
-- ========================================

-- Real-time system dashboard
CREATE OR REPLACE FUNCTION get_system_dashboard()
RETURNS JSONB AS $$
DECLARE
    dashboard_data JSONB;
BEGIN
    WITH system_metrics AS (
        -- Database performance
        SELECT 
            'database' as category,
            jsonb_build_object(
                'active_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active'),
                'cache_hit_ratio', (
                    SELECT ROUND((SUM(blks_hit)::numeric / NULLIF(SUM(blks_hit) + SUM(blks_read), 0)) * 100, 2)
                    FROM pg_stat_database
                ),
                'database_size_gb', (
                    SELECT ROUND(pg_database_size(current_database())::numeric / 1024 / 1024 / 1024, 2)
                ),
                'avg_query_time_ms', (
                    SELECT ROUND(AVG(mean_exec_time), 2)
                    FROM pg_stat_statements
                    WHERE calls > 10
                )
            ) as metrics
        
        UNION ALL
        
        -- Business metrics
        SELECT 
            'business' as category,
            jsonb_build_object(
                'daily_sessions', (
                    SELECT COUNT(DISTINCT session_id)
                    FROM cvperfect_sessions
                    WHERE created_at >= CURRENT_DATE
                ),
                'daily_revenue_pln', (
                    SELECT COALESCE(SUM(net_amount), 0) / 100.0
                    FROM payment_transactions
                    WHERE status = 'succeeded'
                    AND created_at >= CURRENT_DATE
                ),
                'conversion_rate_percent', (
                    SELECT ROUND(
                        (COUNT(*) FILTER (WHERE pt.status = 'succeeded'))::numeric * 100.0 /
                        NULLIF(COUNT(DISTINCT cs.session_id), 0), 2
                    )
                    FROM payment_transactions pt
                    JOIN cvperfect_sessions cs ON cs.session_id = pt.session_id
                    WHERE pt.created_at >= CURRENT_DATE
                ),
                'active_alerts', (
                    SELECT COUNT(*)
                    FROM performance_alerts_enterprise
                    WHERE status = 'open'
                    AND created_at >= NOW() - INTERVAL '24 hours'
                )
            ) as metrics
        
        UNION ALL
        
        -- System health
        SELECT 
            'health' as category,
            jsonb_build_object(
                'uptime_hours', EXTRACT(hours FROM NOW() - pg_postmaster_start_time()),
                'slow_queries_count', (
                    SELECT COUNT(*)
                    FROM pg_stat_statements
                    WHERE mean_exec_time > 1000
                ),
                'table_bloat_check', (
                    SELECT COUNT(*)
                    FROM pg_stat_user_tables
                    WHERE n_dead_tup > n_live_tup * 0.1
                    AND n_live_tup > 1000
                ),
                'last_vacuum', (
                    SELECT MAX(last_vacuum)
                    FROM pg_stat_user_tables
                    WHERE schemaname = 'public'
                )
            ) as metrics
    )
    SELECT jsonb_object_agg(category, metrics)
    INTO dashboard_data
    FROM system_metrics;
    
    -- Add timestamp and system info
    dashboard_data := dashboard_data || jsonb_build_object(
        'generated_at', NOW(),
        'database_version', version(),
        'timezone', current_setting('timezone')
    );
    
    RETURN dashboard_data;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PART 12: GRANT PERMISSIONS
-- ========================================

-- Grant appropriate permissions for different roles
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;

-- Session table permissions
GRANT SELECT, INSERT, UPDATE ON cvperfect_sessions TO authenticated;
GRANT ALL ON cvperfect_sessions TO service_role;
GRANT INSERT ON cvperfect_sessions TO anon;

-- Analytics permissions  
GRANT SELECT ON user_analytics TO authenticated;
GRANT ALL ON user_analytics TO service_role;
GRANT INSERT ON user_analytics TO anon;

-- Payment permissions (restricted)
GRANT SELECT ON payment_transactions TO authenticated;
GRANT ALL ON payment_transactions TO service_role;

-- View permissions
GRANT SELECT ON business_metrics_realtime TO authenticated, service_role;
GRANT SELECT ON business_metrics_hourly TO authenticated, service_role;

-- Function permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_data() TO service_role;
GRANT EXECUTE ON FUNCTION get_database_performance_stats() TO service_role;
GRANT EXECUTE ON FUNCTION get_system_dashboard() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION run_performance_benchmark() TO service_role;

-- Sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- ========================================
-- PART 13: FINAL OPTIMIZATION SETTINGS
-- ========================================

-- Set table-specific optimization parameters
ALTER TABLE cvperfect_sessions SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_analyze_scale_factor = 0.02,
    autovacuum_vacuum_cost_delay = 10
);

ALTER TABLE user_analytics SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05,
    fillfactor = 95  -- Leave room for updates
);

ALTER TABLE payment_transactions SET (
    autovacuum_vacuum_scale_factor = 0.01,
    autovacuum_analyze_scale_factor = 0.01  -- Financial data needs frequent stats updates
);

-- Add helpful comments
COMMENT ON TABLE cvperfect_sessions IS 'Main sessions table - partitioned by creation date for performance';
COMMENT ON TABLE user_analytics IS 'User behavior tracking - high volume, partitioned by timestamp';
COMMENT ON TABLE payment_transactions IS 'Financial transactions - heavily indexed for reporting';
COMMENT ON VIEW business_metrics_realtime IS 'Real-time business dashboard metrics';
COMMENT ON MATERIALIZED VIEW business_metrics_hourly IS 'Hourly aggregated business metrics - refreshed every 15 minutes';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=€ CVPerfect Enterprise Database Optimization Complete!';
    RAISE NOTICE '=Ê Features enabled:';
    RAISE NOTICE '    Partitioned tables for scalability';
    RAISE NOTICE '    Optimized indexes for performance';
    RAISE NOTICE '    Automated maintenance tasks';
    RAISE NOTICE '    Real-time monitoring and alerts';
    RAISE NOTICE '    Business metrics dashboard';
    RAISE NOTICE '    Row-level security policies';
    RAISE NOTICE '    Performance testing functions';
    RAISE NOTICE '=¡ Next steps:';
    RAISE NOTICE '   1. Configure Supabase Pro connection pooling';
    RAISE NOTICE '   2. Run: SELECT * FROM get_system_dashboard();';
    RAISE NOTICE '   3. Test: SELECT * FROM run_performance_benchmark();';
    RAISE NOTICE '   4. Monitor: SELECT * FROM get_database_performance_stats();';
END $$;