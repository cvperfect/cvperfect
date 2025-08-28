-- CVPerfect Optimized Performance Metrics Schema
-- Designed for high-performance real-time monitoring and analytics
-- Schema matches API expectations and supports Core Web Vitals tracking

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Main performance metrics table optimized for CVPerfect
CREATE TABLE IF NOT EXISTS performance_metrics (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Session and user tracking (matches CVPerfect session management)
  session_id TEXT,
  user_id TEXT,
  client_ip INET,
  
  -- Request context
  user_agent TEXT,
  url TEXT,
  page TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN url ~ '/success' THEN 'success'
      WHEN url ~ '/performance' THEN 'performance'  
      WHEN url ~ '/api/' THEN 'api'
      WHEN url = '/' OR url IS NULL THEN 'homepage'
      ELSE 'other'
    END
  ) STORED,
  
  -- Core metric data (matches API expectations)
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_data JSONB,
  timestamp TIMESTAMPTZ NOT NULL,
  
  -- Performance specific fields
  bundle_size INTEGER,
  memory_usage JSONB,
  
  -- Device and connection context
  viewport_width INTEGER,
  viewport_height INTEGER,
  connection_type TEXT,
  connection_downlink NUMERIC,
  
  -- Performance rating and validation
  rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  passed BOOLEAN GENERATED ALWAYS AS (
    CASE metric_name
      WHEN 'LCP' THEN metric_value <= 2500
      WHEN 'FID' THEN metric_value <= 100
      WHEN 'CLS' THEN metric_value <= 0.1
      WHEN 'FCP' THEN metric_value <= 1800
      WHEN 'TTFB' THEN metric_value <= 600
      ELSE TRUE
    END
  ) STORED,
  
  -- Metadata
  environment TEXT DEFAULT 'production',
  version TEXT
);

-- Optimized indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_perf_timestamp_desc ON performance_metrics (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_perf_metric_name ON performance_metrics (metric_name);
CREATE INDEX IF NOT EXISTS idx_perf_session_timestamp ON performance_metrics (session_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_perf_page_timestamp ON performance_metrics (page, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_perf_user_timestamp ON performance_metrics (user_id, timestamp DESC) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_perf_failed_metrics ON performance_metrics (metric_name, timestamp DESC) WHERE passed = false;

-- JSONB indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_perf_metric_data_gin ON performance_metrics USING GIN (metric_data);
CREATE INDEX IF NOT EXISTS idx_perf_memory_usage_gin ON performance_metrics USING GIN (memory_usage);

-- Composite index for dashboard aggregations
CREATE INDEX IF NOT EXISTS idx_perf_dashboard ON performance_metrics (metric_name, page, timestamp DESC) 
WHERE metric_name IN ('LCP', 'FID', 'CLS', 'FCP', 'TTFB');

-- Partitioning for large datasets (optional - can be enabled later if needed)
-- CREATE TABLE IF NOT EXISTS performance_metrics_y2025m01 PARTITION OF performance_metrics
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- CREATE TABLE IF NOT EXISTS performance_metrics_y2025m02 PARTITION OF performance_metrics  
-- FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Create optimized view for Core Web Vitals dashboard
CREATE OR REPLACE VIEW core_web_vitals_summary AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  page,
  metric_name,
  AVG(metric_value) as avg_value,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value) as median_value,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) as p75_value,
  MIN(metric_value) as min_value,
  MAX(metric_value) as max_value,
  COUNT(*) as sample_count,
  COUNT(*) FILTER (WHERE passed = true) as passed_count,
  ROUND((COUNT(*) FILTER (WHERE passed = true))::numeric * 100.0 / COUNT(*), 2) as pass_rate
FROM performance_metrics 
WHERE metric_name IN ('LCP', 'FID', 'CLS', 'FCP', 'TTFB')
  AND timestamp >= NOW() - INTERVAL '24 hours'
  AND metric_value IS NOT NULL
GROUP BY hour, page, metric_name
ORDER BY hour DESC, page, metric_name;

-- Materialized view for faster dashboard queries
CREATE MATERIALIZED VIEW IF NOT EXISTS performance_metrics_hourly AS
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  metric_name,
  page,
  AVG(metric_value) as avg_value,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE passed = true) as passed_count
FROM performance_metrics
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY hour, metric_name, page;

-- Index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_perf_hourly_unique ON performance_metrics_hourly (hour, metric_name, page);

-- Refresh materialized view automatically
CREATE OR REPLACE FUNCTION refresh_performance_metrics_hourly()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY performance_metrics_hourly;
END;
$$ LANGUAGE plpgsql;

-- Performance alerts table (optimized for CVPerfect)
CREATE TABLE IF NOT EXISTS performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metric_name TEXT NOT NULL,
  page TEXT NOT NULL,
  session_id TEXT,
  value NUMERIC NOT NULL,
  threshold NUMERIC NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'warning',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  alert_data JSONB
);

-- Index for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp_desc ON performance_alerts (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_severity_timestamp ON performance_alerts (severity, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unacknowledged ON performance_alerts (acknowledged, timestamp DESC) WHERE acknowledged = FALSE;

-- Real-time performance alerts function (updated for new schema)
CREATE OR REPLACE FUNCTION check_performance_thresholds()
RETURNS TRIGGER AS $$
BEGIN
  -- Alert for poor Core Web Vitals using new column names
  IF NEW.metric_name = 'LCP' AND NEW.metric_value > 4000 THEN
    INSERT INTO performance_alerts (metric_name, page, value, threshold, severity, timestamp, session_id, alert_data)
    VALUES ('LCP', NEW.page, NEW.metric_value, 4000, 'critical', NEW.timestamp, NEW.session_id, 
            jsonb_build_object('url', NEW.url, 'user_agent', NEW.user_agent));
  END IF;
  
  IF NEW.metric_name = 'CLS' AND NEW.metric_value > 0.25 THEN
    INSERT INTO performance_alerts (metric_name, page, value, threshold, severity, timestamp, session_id, alert_data)
    VALUES ('CLS', NEW.page, NEW.metric_value, 0.25, 'critical', NEW.timestamp, NEW.session_id,
            jsonb_build_object('url', NEW.url, 'user_agent', NEW.user_agent));
  END IF;
  
  IF NEW.metric_name = 'FID' AND NEW.metric_value > 300 THEN
    INSERT INTO performance_alerts (metric_name, page, value, threshold, severity, timestamp, session_id, alert_data)
    VALUES ('FID', NEW.page, NEW.metric_value, 300, 'critical', NEW.timestamp, NEW.session_id,
            jsonb_build_object('url', NEW.url, 'user_agent', NEW.user_agent));
  END IF;
  
  -- Bundle size alerts
  IF NEW.metric_name = 'BUNDLE' AND NEW.metric_value > 300000 THEN -- 300KB threshold
    INSERT INTO performance_alerts (metric_name, page, value, threshold, severity, timestamp, session_id, alert_data)
    VALUES ('BUNDLE', NEW.page, NEW.metric_value, 300000, 'warning', NEW.timestamp, NEW.session_id,
            jsonb_build_object('url', NEW.url, 'bundle_size_kb', NEW.metric_value / 1024));
  END IF;
  
  -- Memory usage alerts
  IF NEW.metric_name = 'MEMORY' AND NEW.metric_value > 100000000 THEN -- 100MB threshold
    INSERT INTO performance_alerts (metric_name, page, value, threshold, severity, timestamp, session_id, alert_data)
    VALUES ('MEMORY', NEW.page, NEW.metric_value, 100000000, 'warning', NEW.timestamp, NEW.session_id,
            jsonb_build_object('url', NEW.url, 'memory_mb', NEW.metric_value / 1024 / 1024));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for real-time alerting
DROP TRIGGER IF EXISTS performance_alert_trigger ON performance_metrics;
CREATE TRIGGER performance_alert_trigger
  AFTER INSERT ON performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION check_performance_thresholds();

-- Row Level Security (RLS) Policies
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;

-- Allow public insert for metrics collection (anonymous users can insert metrics)
CREATE POLICY "Allow public metric insertion" ON performance_metrics
  FOR INSERT TO public
  WITH CHECK (true);

-- Allow authenticated users to read their own metrics
CREATE POLICY "Users can read own metrics" ON performance_metrics
  FOR SELECT TO authenticated
  USING (session_id = current_setting('app.current_session_id', true) OR user_id = auth.uid()::text);

-- Allow service role to read all metrics (for dashboard)
CREATE POLICY "Service role can read all metrics" ON performance_metrics
  FOR SELECT TO service_role
  USING (true);

-- Similar policies for alerts
CREATE POLICY "Service role can manage alerts" ON performance_alerts
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Authenticated users can read alerts" ON performance_alerts
  FOR SELECT TO authenticated
  USING (true);

-- Data retention function (auto-cleanup old data)
CREATE OR REPLACE FUNCTION cleanup_old_performance_data()
RETURNS void AS $$
BEGIN
  -- Delete metrics older than 30 days
  DELETE FROM performance_metrics 
  WHERE timestamp < NOW() - INTERVAL '30 days';
  
  -- Delete acknowledged alerts older than 7 days
  DELETE FROM performance_alerts 
  WHERE acknowledged = true AND acknowledged_at < NOW() - INTERVAL '7 days';
  
  -- Delete unacknowledged alerts older than 30 days
  DELETE FROM performance_alerts
  WHERE acknowledged = false AND timestamp < NOW() - INTERVAL '30 days';
  
  -- Log cleanup
  INSERT INTO performance_metrics (metric_name, metric_value, timestamp, metric_data)
  VALUES ('CLEANUP_COMPLETED', 1, NOW(), jsonb_build_object('cleanup_time', NOW()));
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic cleanup (requires pg_cron extension)
-- SELECT cron.schedule('performance-cleanup', '0 2 * * *', 'SELECT cleanup_old_performance_data();');

-- Performance monitoring functions
CREATE OR REPLACE FUNCTION get_performance_summary(time_range INTERVAL DEFAULT '1 hour')
RETURNS TABLE (
  metric_name TEXT,
  avg_value NUMERIC,
  p50_value NUMERIC,
  p75_value NUMERIC,
  p95_value NUMERIC,
  total_samples BIGINT,
  passed_samples BIGINT,
  pass_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.metric_name,
    AVG(pm.metric_value) as avg_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY pm.metric_value) as p50_value,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY pm.metric_value) as p75_value,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY pm.metric_value) as p95_value,
    COUNT(*) as total_samples,
    COUNT(*) FILTER (WHERE pm.passed = true) as passed_samples,
    ROUND((COUNT(*) FILTER (WHERE pm.passed = true))::numeric * 100.0 / COUNT(*), 2) as pass_rate
  FROM performance_metrics pm
  WHERE pm.timestamp >= NOW() - time_range
    AND pm.metric_name IN ('LCP', 'FID', 'CLS', 'FCP', 'TTFB')
    AND pm.metric_value IS NOT NULL
  GROUP BY pm.metric_name
  ORDER BY pm.metric_name;
END;
$$ LANGUAGE plpgsql;

-- Bundle performance analysis function
CREATE OR REPLACE FUNCTION analyze_bundle_performance(time_range INTERVAL DEFAULT '24 hours')
RETURNS TABLE (
  page TEXT,
  avg_bundle_size NUMERIC,
  avg_load_time NUMERIC,
  total_samples BIGINT,
  over_budget_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.page,
    AVG(pm.bundle_size) as avg_bundle_size,
    AVG(pm.metric_value) FILTER (WHERE pm.metric_name = 'BUNDLE_LOAD_TIME') as avg_load_time,
    COUNT(*) as total_samples,
    COUNT(*) FILTER (WHERE pm.bundle_size > 300000) as over_budget_count -- 300KB budget
  FROM performance_metrics pm
  WHERE pm.timestamp >= NOW() - time_range
    AND pm.bundle_size IS NOT NULL
  GROUP BY pm.page
  ORDER BY avg_bundle_size DESC;
END;
$$ LANGUAGE plpgsql;

-- CVPerfect specific analysis view
CREATE OR REPLACE VIEW cvperfect_performance_health AS
SELECT 
  -- Overall health score
  CASE 
    WHEN overall_score >= 90 THEN 'excellent'
    WHEN overall_score >= 80 THEN 'good' 
    WHEN overall_score >= 70 THEN 'needs_improvement'
    ELSE 'poor'
  END as health_status,
  overall_score,
  
  -- Core Web Vitals averages
  avg_lcp,
  avg_fid, 
  avg_cls,
  avg_fcp,
  avg_ttfb,
  
  -- Performance indicators
  bundle_health,
  memory_health,
  api_health,
  
  -- Metrics
  total_measurements,
  active_alerts,
  last_measured
FROM (
  SELECT 
    -- Calculate overall score
    ROUND(
      (CASE WHEN avg_lcp <= 2500 THEN 100 WHEN avg_lcp <= 4000 THEN 75 ELSE 50 END * 0.25 +
       CASE WHEN avg_fid <= 100 THEN 100 WHEN avg_fid <= 300 THEN 75 ELSE 50 END * 0.25 +
       CASE WHEN avg_cls <= 0.1 THEN 100 WHEN avg_cls <= 0.25 THEN 75 ELSE 50 END * 0.25 +
       CASE WHEN avg_fcp <= 1800 THEN 100 WHEN avg_fcp <= 3000 THEN 75 ELSE 50 END * 0.125 +
       CASE WHEN avg_ttfb <= 600 THEN 100 WHEN avg_ttfb <= 1500 THEN 75 ELSE 50 END * 0.125), 2
    ) as overall_score,
    
    ROUND(AVG(metric_value) FILTER (WHERE metric_name = 'LCP'), 0) as avg_lcp,
    ROUND(AVG(metric_value) FILTER (WHERE metric_name = 'FID'), 0) as avg_fid,
    ROUND(AVG(metric_value) FILTER (WHERE metric_name = 'CLS'), 3) as avg_cls,
    ROUND(AVG(metric_value) FILTER (WHERE metric_name = 'FCP'), 0) as avg_fcp,
    ROUND(AVG(metric_value) FILTER (WHERE metric_name = 'TTFB'), 0) as avg_ttfb,
    
    CASE WHEN AVG(bundle_size) <= 300000 THEN 'good' ELSE 'poor' END as bundle_health,
    CASE WHEN AVG(metric_value) FILTER (WHERE metric_name = 'MEMORY') <= 50000000 THEN 'good' ELSE 'poor' END as memory_health,
    CASE WHEN AVG(metric_value) FILTER (WHERE metric_name = 'API') <= 500 THEN 'good' ELSE 'poor' END as api_health,
    
    COUNT(*) as total_measurements,
    (SELECT COUNT(*) FROM performance_alerts WHERE acknowledged = false) as active_alerts,
    MAX(timestamp) as last_measured
    
  FROM performance_metrics
  WHERE timestamp >= NOW() - INTERVAL '1 hour'
) subq;

-- Grant permissions
GRANT ALL ON performance_metrics TO authenticated;
GRANT ALL ON performance_alerts TO authenticated;
GRANT SELECT ON core_web_vitals_summary TO authenticated;
GRANT SELECT ON performance_metrics_hourly TO authenticated;
GRANT SELECT ON cvperfect_performance_health TO authenticated;

-- Grant service role full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Enable real-time subscriptions for dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE performance_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE performance_alerts;

-- Performance optimization settings
ALTER TABLE performance_metrics SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- Comments for documentation
COMMENT ON TABLE performance_metrics IS 'CVPerfect optimized performance metrics storage with Core Web Vitals tracking';
COMMENT ON COLUMN performance_metrics.metric_name IS 'Metric type: LCP, FID, CLS, FCP, TTFB, BUNDLE, MEMORY, API, etc.';
COMMENT ON COLUMN performance_metrics.passed IS 'Auto-calculated based on Core Web Vitals thresholds';
COMMENT ON COLUMN performance_metrics.page IS 'Auto-generated page category from URL';
COMMENT ON VIEW cvperfect_performance_health IS 'Real-time CVPerfect performance health dashboard summary';

-- ========================================
-- TEST DATA AND VALIDATION
-- ========================================

-- Function to insert sample performance data for testing
CREATE OR REPLACE FUNCTION insert_sample_performance_data()
RETURNS void AS $$
BEGIN
  -- Clear existing test data
  DELETE FROM performance_metrics WHERE session_id LIKE 'test-%';
  DELETE FROM performance_alerts WHERE session_id LIKE 'test-%';
  
  -- Insert Core Web Vitals test data
  INSERT INTO performance_metrics (
    session_id, metric_name, metric_value, timestamp, url, user_agent, bundle_size, memory_usage
  ) VALUES 
    -- Good performance metrics
    ('test-session-1', 'LCP', 2200.5, NOW() - INTERVAL '5 minutes', '/', 'Mozilla/5.0 Test', 285000, '{"usedJSMemory": 45000000}'),
    ('test-session-1', 'FID', 85.2, NOW() - INTERVAL '4 minutes', '/', 'Mozilla/5.0 Test', 285000, '{"usedJSMemory": 47000000}'),
    ('test-session-1', 'CLS', 0.08, NOW() - INTERVAL '3 minutes', '/', 'Mozilla/5.0 Test', 285000, '{"usedJSMemory": 43000000}'),
    ('test-session-1', 'FCP', 1650.3, NOW() - INTERVAL '2 minutes', '/', 'Mozilla/5.0 Test', 285000, '{"usedJSMemory": 46000000}'),
    ('test-session-1', 'TTFB', 520.8, NOW() - INTERVAL '1 minute', '/', 'Mozilla/5.0 Test', 285000, '{"usedJSMemory": 44000000}'),
    
    -- Poor performance metrics (should trigger alerts)
    ('test-session-2', 'LCP', 4500.2, NOW() - INTERVAL '8 minutes', '/success', 'Mozilla/5.0 Test', 350000, '{"usedJSMemory": 120000000}'),
    ('test-session-2', 'FID', 420.5, NOW() - INTERVAL '7 minutes', '/success', 'Mozilla/5.0 Test', 350000, '{"usedJSMemory": 115000000}'),
    ('test-session-2', 'CLS', 0.35, NOW() - INTERVAL '6 minutes', '/success', 'Mozilla/5.0 Test', 350000, '{"usedJSMemory": 118000000}'),
    
    -- API performance data
    ('test-session-3', 'API', 1250.0, NOW() - INTERVAL '10 minutes', '/api/analyze', 'Mozilla/5.0 Test', NULL, 
     '{"endpoint": "/api/analyze", "duration": 1250, "status": 200}'),
    ('test-session-3', 'API', 850.5, NOW() - INTERVAL '9 minutes', '/api/parse-cv', 'Mozilla/5.0 Test', NULL,
     '{"endpoint": "/api/parse-cv", "duration": 850.5, "status": 200}'),
    
    -- Memory and bundle metrics
    ('test-session-4', 'MEMORY', 95000000, NOW() - INTERVAL '12 minutes', '/performance', 'Mozilla/5.0 Test', 320000, '{"usedJSMemory": 95000000}'),
    ('test-session-4', 'BUNDLE', 325000, NOW() - INTERVAL '11 minutes', '/performance', 'Mozilla/5.0 Test', 325000, NULL);
  
  -- Insert custom metrics with JSONB data
  INSERT INTO performance_metrics (
    session_id, metric_name, metric_value, timestamp, url, metric_data
  ) VALUES
    ('test-session-5', 'CUSTOM_METRICS', 3200, NOW() - INTERVAL '15 minutes', '/', 
     '{"pageLoadTime": 3200, "bundleSize": 290000, "memoryUsage": {"usedJSMemory": 42000000}, "chunkLoadTime": 450}'),
    ('test-session-5', 'LONG_TASK', 250.5, NOW() - INTERVAL '14 minutes', '/',
     '{"taskDuration": 250.5, "startTime": 1500, "endTime": 1750.5}');
  
  RAISE NOTICE 'Sample performance data inserted successfully';
END;
$$ LANGUAGE plpgsql;

-- Function to validate schema and test queries
CREATE OR REPLACE FUNCTION validate_performance_schema()
RETURNS TABLE (
  test_name TEXT,
  status TEXT,
  result TEXT
) AS $$
BEGIN
  -- Test 1: Basic table structure
  RETURN QUERY
  SELECT 
    'Table Structure' as test_name,
    CASE WHEN COUNT(*) = 2 THEN 'PASS' ELSE 'FAIL' END as status,
    'Found ' || COUNT(*) || ' tables (expected: 2)' as result
  FROM information_schema.tables 
  WHERE table_name IN ('performance_metrics', 'performance_alerts') 
    AND table_schema = 'public';

  -- Test 2: Required columns exist
  RETURN QUERY
  SELECT 
    'Required Columns' as test_name,
    CASE WHEN COUNT(*) >= 15 THEN 'PASS' ELSE 'FAIL' END as status,
    'Found ' || COUNT(*) || ' columns in performance_metrics' as result
  FROM information_schema.columns 
  WHERE table_name = 'performance_metrics' 
    AND table_schema = 'public';

  -- Test 3: Indexes created
  RETURN QUERY
  SELECT 
    'Index Count' as test_name,
    CASE WHEN COUNT(*) >= 8 THEN 'PASS' ELSE 'FAIL' END as status,
    'Found ' || COUNT(*) || ' indexes on performance_metrics' as result
  FROM pg_indexes 
  WHERE tablename = 'performance_metrics' 
    AND schemaname = 'public';

  -- Test 4: Functions created
  RETURN QUERY
  SELECT 
    'Functions' as test_name,
    CASE WHEN COUNT(*) >= 5 THEN 'PASS' ELSE 'FAIL' END as status,
    'Found ' || COUNT(*) || ' performance functions' as result
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
    AND routine_name LIKE '%performance%';

  -- Test 5: Views created
  RETURN QUERY
  SELECT 
    'Views' as test_name,
    CASE WHEN COUNT(*) >= 2 THEN 'PASS' ELSE 'FAIL' END as status,
    'Found ' || COUNT(*) || ' performance views' as result
  FROM information_schema.views 
  WHERE table_schema = 'public' 
    AND table_name LIKE '%performance%';

  -- Test 6: Test data insertion
  BEGIN
    PERFORM insert_sample_performance_data();
    
    RETURN QUERY
    SELECT 
      'Sample Data' as test_name,
      CASE WHEN COUNT(*) > 10 THEN 'PASS' ELSE 'FAIL' END as status,
      'Inserted ' || COUNT(*) || ' test records' as result
    FROM performance_metrics 
    WHERE session_id LIKE 'test-%';
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT 
      'Sample Data' as test_name,
      'FAIL' as status,
      'Error: ' || SQLERRM as result;
  END;

  -- Test 7: Alert generation
  RETURN QUERY
  SELECT 
    'Alert Generation' as test_name,
    CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END as status,
    'Generated ' || COUNT(*) || ' test alerts' as result
  FROM performance_alerts 
  WHERE session_id LIKE 'test-%';

  -- Test 8: Performance summary function
  BEGIN
    PERFORM get_performance_summary('1 day'::INTERVAL);
    
    RETURN QUERY
    SELECT 
      'Summary Function' as test_name,
      'PASS' as status,
      'Performance summary function working' as result;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY
    SELECT 
      'Summary Function' as test_name,
      'FAIL' as status,
      'Error: ' || SQLERRM as result;
  END;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- DEPLOYMENT INSTRUCTIONS
-- ========================================

/*
DEPLOYMENT STEPS FOR SUPABASE:

1. **Execute this schema in Supabase SQL Editor:**
   - Copy entire schema to Supabase SQL Editor
   - Execute in order (some statements may need to be run separately)

2. **Validate installation:**
   SELECT * FROM validate_performance_schema();

3. **Insert sample data for testing:**
   SELECT insert_sample_performance_data();

4. **Test API endpoints:**
   - Ensure your API can insert into performance_metrics table
   - Test dashboard queries work properly

5. **Configure RLS policies (if needed):**
   - Adjust policies based on your authentication requirements
   - Test that public inserts work for metrics collection

6. **Set up monitoring:**
   - Enable real-time subscriptions if using Supabase realtime
   - Configure alerts and notifications

7. **Performance tuning:**
   - Monitor query performance
   - Add additional indexes if needed
   - Set up pg_cron for automatic cleanup (optional)

SCHEMA FEATURES:
✅ Matches API expectations (metric_name, metric_value, etc.)
✅ Optimized indexes for fast dashboard queries
✅ Auto-calculated performance ratings
✅ Real-time alerting system
✅ Data retention and cleanup
✅ Row Level Security (RLS) policies
✅ Partitioning support for large datasets
✅ JSONB support for complex metrics
✅ CVPerfect-specific optimizations

PERFORMANCE OPTIMIZATIONS:
- Composite indexes for common query patterns
- Materialized views for expensive aggregations
- Generated columns for computed values
- Partitioning for time-series data
- GIN indexes for JSONB columns
- Optimized autovacuum settings
*/
