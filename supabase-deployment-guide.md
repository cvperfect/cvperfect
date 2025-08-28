# CVPerfect Enterprise Database Deployment Guide

## Overview
Complete deployment guide for CVPerfect's enterprise-scale Supabase PostgreSQL optimization. This guide covers database setup, performance tuning, monitoring implementation, and production deployment.

## =€ Deployment Steps

### 1. Pre-Deployment Requirements

#### Supabase Pro Plan Features Required:
- **Connection Pooling**: Enabled with transaction mode
- **Point-in-Time Recovery**: 7-day retention minimum  
- **Custom Extensions**: pg_cron, pg_stat_statements, postgis
- **Database Compute**: At least 4 CPU cores, 8GB RAM
- **Storage**: 100GB+ with automatic scaling

#### Environment Preparation:
```bash
# Verify Supabase CLI installation
supabase --version

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID
```

### 2. Database Schema Deployment

#### Step 1: Execute Enterprise Optimization Schema
```sql
-- Execute in Supabase SQL Editor
-- File: supabase-enterprise-optimization-schema.sql
-- Run sections sequentially to avoid timeout issues
```

#### Step 2: Verify Installation
```sql
-- Test schema deployment
SELECT * FROM validate_performance_schema();

-- Check partitions
SELECT schemaname, tablename, partitiontype 
FROM pg_tables 
WHERE tablename LIKE '%2025%';

-- Verify indexes
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

#### Step 3: Configure Extensions
```sql
-- Enable extensions (may require superuser privileges)
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "postgis" CASCADE;
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### 3. Supabase Pro Configuration

#### Connection Pooler Settings (Dashboard ’ Settings ’ Database):
```
Pool Mode: Transaction
Default Pool Size: 50
Max Client Connections: 1000
Server Idle Timeout: 600s
Max Database Connections: 500
```

#### Database Settings (Dashboard ’ Settings ’ Database ’ Custom Config):
```sql
-- Add to postgresql.conf via Supabase Dashboard
shared_buffers = '2GB'
effective_cache_size = '6GB'
maintenance_work_mem = '512MB'
checkpoint_completion_target = 0.9
wal_buffers = '16MB'
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = '32MB'
max_worker_processes = 8
max_parallel_workers = 4
max_parallel_workers_per_gather = 2
```

### 4. Performance Testing and Validation

#### Load Testing
```sql
-- Generate test data for performance validation
SELECT generate_test_data(10000, 15); -- 10k sessions, 15 events each

-- Run performance benchmarks
SELECT * FROM run_performance_benchmark();

-- Check system performance
SELECT * FROM get_database_performance_stats();
```

#### Connection Testing
```bash
# Test connection pooling under load
node test-db-connection.js

# Monitor connection usage
psql "postgresql://postgres:[password]@[host]:5432/postgres" \
  -c "SELECT count(*) as connections, state FROM pg_stat_activity GROUP BY state;"
```

### 5. Monitoring Setup

#### Real-time Dashboard
```sql
-- Test dashboard functionality
SELECT get_system_dashboard();

-- Business metrics
SELECT * FROM business_metrics_realtime;

-- Performance alerts
SELECT * FROM performance_alerts_enterprise WHERE status = 'open';
```

#### Scheduled Jobs Verification
```sql
-- Check pg_cron jobs
SELECT * FROM cron.job;

-- Manual trigger test
SELECT check_system_health();
SELECT cleanup_expired_data();
```

## =Ê Production Monitoring

### 1. Key Metrics to Monitor

#### Database Performance:
- **Active Connections**: Target <80% of max_connections (400 of 500)
- **Cache Hit Ratio**: Maintain >95%
- **Query Performance**: Average <500ms
- **Slow Query Count**: <10 queries >5 seconds
- **Table Bloat**: Monitor dead tuple ratio

#### Business Metrics:
- **Daily Sessions**: Track growth trends
- **Conversion Rate**: Monitor payment completion %
- **Revenue Metrics**: Real-time financial tracking
- **User Analytics**: Page load times, user journeys

### 2. Alert Thresholds

#### Critical Alerts:
- Active connections >400
- Cache hit ratio <90%
- Query timeouts >30 seconds
- Database size >500GB

#### Warning Alerts:
- Cache hit ratio <95%
- Slow queries >10
- Table size >10GB
- Connection usage >70%

### 3. Automated Monitoring Queries

```sql
-- Daily health check report
WITH health_summary AS (
  SELECT 
    COUNT(*) FILTER (WHERE state = 'active') as active_connections,
    COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
    COUNT(*) FILTER (WHERE query_start < NOW() - INTERVAL '30 seconds') as long_queries
  FROM pg_stat_activity
),
cache_stats AS (
  SELECT ROUND(
    (SUM(blks_hit)::numeric / NULLIF(SUM(blks_hit) + SUM(blks_read), 0)) * 100, 2
  ) as cache_hit_ratio
  FROM pg_stat_database
),
business_summary AS (
  SELECT 
    COUNT(DISTINCT session_id) as daily_sessions,
    COUNT(*) FILTER (WHERE payment_status = 'completed') as completed_payments,
    ROUND(AVG(page_load_time)) as avg_page_load_ms
  FROM cvperfect_sessions s
  LEFT JOIN user_analytics a ON s.session_id = a.session_id
  WHERE s.created_at >= CURRENT_DATE
)
SELECT 
  h.active_connections,
  h.idle_connections,
  h.long_queries,
  c.cache_hit_ratio,
  b.daily_sessions,
  b.completed_payments,
  b.avg_page_load_ms,
  NOW() as report_time
FROM health_summary h, cache_stats c, business_summary b;
```

## =à Maintenance Procedures

### 1. Daily Maintenance (Automated)
- **2:00 AM**: Full ANALYZE and VACUUM
- **Every hour**: Expired session cleanup
- **Every 15min**: Materialized view refresh
- **Every 5min**: Health check and alerts

### 2. Weekly Maintenance (Manual Review)
- Review optimization recommendations
- Check partition pruning efficiency
- Analyze slow query reports
- Validate backup integrity
- Review security logs

### 3. Monthly Maintenance
- Partition management (add new, remove old)
- Index usage analysis
- Connection pool optimization
- Performance trend analysis
- Capacity planning review

## =' Troubleshooting Guide

### 1. High Connection Usage
```sql
-- Identify connection sources
SELECT client_addr, count(*) as connections, state 
FROM pg_stat_activity 
WHERE state != 'idle'
GROUP BY client_addr, state 
ORDER BY connections DESC;

-- Kill problematic connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'active' 
AND query_start < NOW() - INTERVAL '5 minutes';
```

### 2. Slow Query Investigation
```sql
-- Top slow queries
SELECT query, mean_exec_time, calls, total_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Current running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > INTERVAL '5 minutes';
```

### 3. Storage and Bloat Issues
```sql
-- Table sizes
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Table bloat check
SELECT schemaname, tablename, n_dead_tup, n_live_tup,
  ROUND((n_dead_tup::float / NULLIF(n_live_tup, 0)) * 100, 2) as bloat_percent
FROM pg_stat_user_tables 
WHERE n_live_tup > 1000
ORDER BY bloat_percent DESC;
```

## = Security and Compliance

### 1. Row Level Security Validation
```sql
-- Test RLS policies
SET app.current_user_id = 'test_user_123';
SET app.current_session_id = 'test_session_456';

-- Should only return user's data
SELECT * FROM cvperfect_sessions LIMIT 5;

-- Reset settings
RESET app.current_user_id;
RESET app.current_session_id;
```

### 2. Data Retention Compliance
```sql
-- GDPR compliance check
SELECT table_name, check_type, status, details 
FROM verify_data_integrity();

-- Data age analysis
SELECT 
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '90 days') as old_sessions,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as soft_deleted
FROM cvperfect_sessions;
```

## =È Performance Optimization Tips

### 1. Index Maintenance
```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_scan = 0
ORDER BY schemaname, tablename;

-- Reindex if needed (during maintenance window)
REINDEX INDEX CONCURRENTLY idx_sessions_payment_status;
```

### 2. Query Plan Analysis
```sql
-- Enable query planning insights
SET auto_explain.log_min_duration = 1000;
SET auto_explain.log_analyze = true;
SET auto_explain.log_buffers = true;

-- Analyze specific queries
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM business_metrics_realtime;
```

### 3. Connection Pool Optimization
- Monitor pool utilization in Supabase Dashboard
- Adjust pool size based on actual usage patterns
- Use read replicas for analytics queries
- Implement query timeout at application level

## =Ë Deployment Checklist

### Pre-deployment:
- [ ] Supabase Pro plan activated
- [ ] Database compute scaled appropriately
- [ ] Connection pooling configured
- [ ] Backup schedule verified
- [ ] Extensions enabled

### Schema Deployment:
- [ ] Enterprise optimization schema executed
- [ ] Partitions created for current/future months
- [ ] Indexes created and verified
- [ ] Functions and views operational
- [ ] RLS policies enabled and tested

### Performance Testing:
- [ ] Load test data generated
- [ ] Benchmarks executed and passing
- [ ] Connection limits tested
- [ ] Query performance validated
- [ ] Materialized views refreshing

### Monitoring Setup:
- [ ] Dashboard functions working
- [ ] Automated alerts configured
- [ ] pg_cron jobs scheduled
- [ ] Performance metrics collecting
- [ ] Business metrics accurate

### Production Readiness:
- [ ] Security policies verified
- [ ] Data retention working
- [ ] Backup/restore tested
- [ ] Monitoring alerts tested
- [ ] Documentation complete

## <¯ Expected Performance Targets

### Database Performance:
- **Query Response**: <200ms for 95th percentile
- **Connection Setup**: <50ms average
- **Cache Hit Ratio**: >95% sustained
- **Concurrent Users**: 10,000+ simultaneous
- **Daily Throughput**: 100,000+ transactions

### Business Metrics:
- **Session Creation**: <100ms response time
- **Payment Processing**: <2s end-to-end
- **Analytics Queries**: <1s for dashboard
- **Export Generation**: <30s for premium templates
- **File Upload**: <5s for 10MB files

This deployment guide ensures CVPerfect's database infrastructure can scale to enterprise levels while maintaining optimal performance and reliability.