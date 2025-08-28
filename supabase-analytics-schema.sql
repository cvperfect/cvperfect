-- CVPerfect Enterprise Analytics Schema
-- Optimized views and functions for real-time business intelligence

-- ====================================
-- PERFORMANCE OPTIMIZED ANALYTICS VIEWS
-- ====================================

-- Revenue analytics view
CREATE OR REPLACE VIEW revenue_analytics AS
SELECT 
    DATE(created_at) as date,
    plan,
    COUNT(*) as transactions,
    SUM(CASE WHEN status = 'completed' THEN amount_paid/100.0 ELSE 0 END) as revenue,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_payments,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
    ROUND(AVG(CASE WHEN status = 'completed' THEN amount_paid/100.0 END), 2) as avg_order_value
FROM user_sessions 
WHERE payment_status IS NOT NULL
AND created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at), plan
ORDER BY date DESC, revenue DESC;

-- User engagement analytics view
CREATE OR REPLACE VIEW user_engagement_analytics AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_sessions,
    COUNT(*) FILTER (WHERE payment_status = 'completed') as paid_sessions,
    ROUND(
        COUNT(*) FILTER (WHERE payment_status = 'completed') * 100.0 / COUNT(*), 
        2
    ) as conversion_rate,
    COUNT(*) FILTER (WHERE plan = 'basic') as basic_conversions,
    COUNT(*) FILTER (WHERE plan = 'gold') as gold_conversions,
    COUNT(*) FILTER (WHERE plan = 'premium') as premium_conversions
FROM user_sessions 
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ML optimization analytics view
CREATE OR REPLACE VIEW ml_optimization_analytics AS
SELECT 
    DATE(created_at) as date,
    plan,
    optimization_type,
    COUNT(*) as optimizations,
    COUNT(*) FILTER (WHERE success = true) as successful_optimizations,
    ROUND(AVG(processing_time_ms), 2) as avg_processing_time,
    ROUND(AVG(ats_score), 2) as avg_ats_score,
    ROUND(
        COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*), 
        2
    ) as success_rate
FROM ml_optimization_usage
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY DATE(created_at), plan, optimization_type
ORDER BY date DESC, optimizations DESC;

-- System performance analytics view  
CREATE OR REPLACE VIEW system_performance_analytics AS
SELECT 
    DATE(timestamp) as date,
    EXTRACT(HOUR FROM timestamp) as hour,
    COUNT(*) as total_requests,
    ROUND(AVG(response_time_ms), 2) as avg_response_time,
    COUNT(*) FILTER (WHERE response_time_ms > 2000) as slow_requests,
    COUNT(*) FILTER (WHERE status_code >= 400) as error_requests,
    ROUND(
        COUNT(*) FILTER (WHERE status_code >= 400) * 100.0 / COUNT(*), 
        2
    ) as error_rate
FROM performance_metrics 
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY DATE(timestamp), EXTRACT(HOUR FROM timestamp)
ORDER BY date DESC, hour DESC;

-- Security events summary view
CREATE OR REPLACE VIEW security_analytics AS
SELECT 
    DATE(created_at) as date,
    event_type,
    severity,
    COUNT(*) as event_count,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT user_id) as affected_users
FROM security_logs 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), event_type, severity
ORDER BY date DESC, event_count DESC;

-- Geographic usage analytics
CREATE OR REPLACE VIEW geographic_analytics AS
SELECT 
    COALESCE(location_country, 'Unknown') as country,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT us.user_id) as unique_users,
    COUNT(*) FILTER (WHERE us.payment_status = 'completed') as paid_conversions,
    ROUND(AVG(ss.risk_score), 2) as avg_risk_score
FROM session_security ss
JOIN user_sessions us ON ss.session_id = us.id
WHERE ss.created_at >= NOW() - INTERVAL '30 days'
GROUP BY location_country
ORDER BY unique_sessions DESC
LIMIT 20;

-- ====================================
-- REAL-TIME KPI FUNCTIONS
-- ====================================

-- Get current month revenue
CREATE OR REPLACE FUNCTION get_current_month_revenue()
RETURNS TABLE(
    plan TEXT,
    revenue DECIMAL,
    transactions BIGINT,
    avg_order_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.plan::TEXT,
        SUM(CASE WHEN us.payment_status = 'completed' THEN us.amount_paid/100.0 ELSE 0 END)::DECIMAL as revenue,
        COUNT(*) FILTER (WHERE us.payment_status = 'completed') as transactions,
        ROUND(AVG(CASE WHEN us.payment_status = 'completed' THEN us.amount_paid/100.0 END), 2)::DECIMAL as avg_order_value
    FROM user_sessions us
    WHERE DATE_TRUNC('month', us.created_at) = DATE_TRUNC('month', CURRENT_DATE)
    AND us.payment_status IS NOT NULL
    GROUP BY us.plan
    ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get daily active users
CREATE OR REPLACE FUNCTION get_daily_active_users(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
    date DATE,
    active_users BIGINT,
    new_users BIGINT,
    returning_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_activity AS (
        SELECT 
            DATE(created_at) as activity_date,
            user_id,
            MIN(DATE(created_at)) OVER (PARTITION BY user_id) as first_seen
        FROM user_sessions
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    )
    SELECT 
        activity_date as date,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(DISTINCT CASE WHEN activity_date = first_seen THEN user_id END) as new_users,
        COUNT(DISTINCT CASE WHEN activity_date != first_seen THEN user_id END) as returning_users
    FROM user_activity
    GROUP BY activity_date
    ORDER BY activity_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get ML model performance metrics
CREATE OR REPLACE FUNCTION get_ml_performance_metrics()
RETURNS TABLE(
    optimization_type TEXT,
    total_optimizations BIGINT,
    success_rate DECIMAL,
    avg_processing_time DECIMAL,
    avg_ats_improvement DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mou.optimization_type::TEXT,
        COUNT(*) as total_optimizations,
        ROUND(
            COUNT(*) FILTER (WHERE mou.success = true) * 100.0 / COUNT(*), 
            2
        )::DECIMAL as success_rate,
        ROUND(AVG(mou.processing_time_ms), 2)::DECIMAL as avg_processing_time,
        ROUND(AVG(mou.ats_score), 2)::DECIMAL as avg_ats_improvement
    FROM ml_optimization_usage mou
    WHERE mou.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY mou.optimization_type
    ORDER BY total_optimizations DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get conversion funnel metrics
CREATE OR REPLACE FUNCTION get_conversion_funnel()
RETURNS TABLE(
    stage TEXT,
    count BIGINT,
    conversion_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH funnel_data AS (
        SELECT 
            COUNT(*) as total_sessions,
            COUNT(*) FILTER (WHERE cv_text IS NOT NULL) as cv_uploaded,
            COUNT(*) FILTER (WHERE payment_intent_id IS NOT NULL) as payment_initiated,
            COUNT(*) FILTER (WHERE payment_status = 'completed') as payment_completed
        FROM user_sessions
        WHERE created_at >= NOW() - INTERVAL '30 days'
    )
    SELECT 
        'Total Sessions' as stage,
        total_sessions as count,
        100.0::DECIMAL as conversion_rate
    FROM funnel_data
    UNION ALL
    SELECT 
        'CV Uploaded' as stage,
        cv_uploaded as count,
        ROUND(cv_uploaded * 100.0 / total_sessions, 2)::DECIMAL as conversion_rate
    FROM funnel_data
    UNION ALL
    SELECT 
        'Payment Initiated' as stage,
        payment_initiated as count,
        ROUND(payment_initiated * 100.0 / total_sessions, 2)::DECIMAL as conversion_rate
    FROM funnel_data
    UNION ALL
    SELECT 
        'Payment Completed' as stage,
        payment_completed as count,
        ROUND(payment_completed * 100.0 / total_sessions, 2)::DECIMAL as conversion_rate
    FROM funnel_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- BUSINESS INTELLIGENCE FUNCTIONS
-- ====================================

-- Calculate Monthly Recurring Revenue (MRR)
CREATE OR REPLACE FUNCTION calculate_mrr()
RETURNS DECIMAL AS $$
DECLARE
    mrr DECIMAL;
BEGIN
    -- Calculate MRR based on completed payments in current month
    SELECT 
        SUM(
            CASE 
                WHEN plan = 'basic' THEN 19.99
                WHEN plan = 'gold' THEN 49.00  
                WHEN plan = 'premium' THEN 79.00
                ELSE 0
            END
        ) INTO mrr
    FROM user_sessions
    WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    AND payment_status = 'completed';

    RETURN COALESCE(mrr, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get churn prediction indicators
CREATE OR REPLACE FUNCTION get_churn_indicators()
RETURNS TABLE(
    indicator TEXT,
    count BIGINT,
    percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH total_users AS (
        SELECT COUNT(DISTINCT user_id) as total FROM user_sessions
        WHERE created_at >= NOW() - INTERVAL '30 days'
    ),
    churn_signals AS (
        SELECT 
            COUNT(DISTINCT us.user_id) FILTER (
                WHERE us.created_at < NOW() - INTERVAL '7 days'
                AND NOT EXISTS (
                    SELECT 1 FROM user_sessions us2 
                    WHERE us2.user_id = us.user_id 
                    AND us2.created_at >= NOW() - INTERVAL '7 days'
                )
            ) as inactive_7_days,
            COUNT(DISTINCT mou.user_id) FILTER (
                WHERE mou.success = false
            ) as failed_optimizations,
            COUNT(DISTINCT us.user_id) FILTER (
                WHERE us.payment_status = 'failed'
            ) as failed_payments
        FROM user_sessions us
        LEFT JOIN ml_optimization_usage mou ON us.user_id = mou.user_id
        WHERE us.created_at >= NOW() - INTERVAL '30 days'
    )
    SELECT 
        'Inactive 7+ Days' as indicator,
        cs.inactive_7_days as count,
        ROUND(cs.inactive_7_days * 100.0 / tu.total, 2) as percentage
    FROM churn_signals cs, total_users tu
    UNION ALL
    SELECT 
        'Failed Optimizations' as indicator,
        cs.failed_optimizations as count,
        ROUND(cs.failed_optimizations * 100.0 / tu.total, 2) as percentage
    FROM churn_signals cs, total_users tu
    UNION ALL
    SELECT 
        'Failed Payments' as indicator,
        cs.failed_payments as count,
        ROUND(cs.failed_payments * 100.0 / tu.total, 2) as percentage
    FROM churn_signals cs, total_users tu;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- INDEXES FOR ANALYTICS PERFORMANCE
-- ====================================

-- Indexes for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_analytics ON user_sessions(created_at DESC, plan, payment_status);
CREATE INDEX IF NOT EXISTS idx_ml_usage_analytics ON ml_optimization_usage(created_at DESC, plan, success);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_analytics ON performance_metrics(timestamp DESC, response_time_ms);
CREATE INDEX IF NOT EXISTS idx_security_logs_analytics ON security_logs(created_at DESC, event_type, severity);
CREATE INDEX IF NOT EXISTS idx_session_security_analytics ON session_security(created_at DESC, location_country);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_revenue ON user_sessions(DATE(created_at), plan, payment_status, amount_paid);
CREATE INDEX IF NOT EXISTS idx_ml_usage_performance ON ml_optimization_usage(DATE(created_at), optimization_type, success, processing_time_ms);

-- ====================================
-- ANALYTICS PERMISSIONS
-- ====================================

-- Grant permissions for analytics access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON VIEW revenue_analytics IS 'Daily revenue breakdown by plan with conversion metrics';
COMMENT ON VIEW user_engagement_analytics IS 'User engagement and conversion rate metrics';
COMMENT ON VIEW ml_optimization_analytics IS 'ML model performance and usage analytics';
COMMENT ON VIEW system_performance_analytics IS 'System performance and error rate metrics';
COMMENT ON FUNCTION calculate_mrr() IS 'Calculate Monthly Recurring Revenue based on current month payments';
COMMENT ON FUNCTION get_conversion_funnel() IS 'Get conversion funnel metrics from session to payment';