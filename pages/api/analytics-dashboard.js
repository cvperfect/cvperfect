/**
 * CVPerfect Enterprise Analytics Dashboard API
 * Comprehensive business intelligence and KPI metrics
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Admin API key validation
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'cvp_admin_2025_secure_key_xyz789';

export default async function handler(req, res) {
  // Apply basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    // Authentication check
    const authResult = await authenticateAdmin(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: authResult.error,
        code: 'UNAUTHORIZED'
      });
    }

    const { metric, timeframe = '30d', plan = 'all' } = req.query;

    let analyticsData = {};

    // Route to specific analytics based on metric parameter
    switch (metric) {
      case 'overview':
        analyticsData = await getOverviewMetrics(timeframe, plan);
        break;
      
      case 'revenue':
        analyticsData = await getRevenueAnalytics(timeframe, plan);
        break;
      
      case 'users':
        analyticsData = await getUserAnalytics(timeframe);
        break;
      
      case 'ml-performance':
        analyticsData = await getMLPerformanceMetrics(timeframe);
        break;
      
      case 'conversion-funnel':
        analyticsData = await getConversionFunnelMetrics(timeframe);
        break;
      
      case 'geographic':
        analyticsData = await getGeographicAnalytics(timeframe);
        break;
      
      case 'security':
        analyticsData = await getSecurityAnalytics(timeframe);
        break;
      
      default:
        // Return comprehensive dashboard if no specific metric requested
        analyticsData = await getComprehensiveDashboard(timeframe, plan);
    }

    // Log analytics access
    await logAnalyticsAccess(authResult.user, metric, req);

    return res.status(200).json({
      success: true,
      data: analyticsData,
      metadata: {
        timeframe,
        plan,
        metric: metric || 'comprehensive',
        generatedAt: new Date().toISOString(),
        cacheExpiry: 300 // 5 minutes cache recommendation
      }
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Analytics processing failed',
      code: 'ANALYTICS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Authentication functions
async function authenticateAdmin(req) {
  // Check for API key
  const apiKey = req.headers['x-api-key'];
  if (apiKey === ADMIN_API_KEY) {
    return { success: true, user: { type: 'admin', method: 'api_key' } };
  }

  return { success: false, error: 'Invalid or missing admin API key' };
}

// Analytics data functions
async function getOverviewMetrics(timeframe, plan) {
  const timeFilter = getTimeFilter(timeframe);
  
  // Get current month MRR
  const { data: mrrData } = await supabase.rpc('calculate_mrr');
  
  // Get key metrics
  const { data: sessionStats } = await supabase
    .from('user_sessions')
    .select('payment_status, plan, amount_paid, created_at')
    .gte('created_at', timeFilter);

  const totalSessions = sessionStats?.length || 0;
  const paidSessions = sessionStats?.filter(s => s.payment_status === 'completed').length || 0;
  const totalRevenue = sessionStats
    ?.filter(s => s.payment_status === 'completed')
    ?.reduce((sum, s) => sum + (s.amount_paid / 100), 0) || 0;

  const conversionRate = totalSessions > 0 ? (paidSessions / totalSessions * 100) : 0;

  // Get ML optimization stats
  const { data: mlStats } = await supabase
    .from('ml_optimization_usage')
    .select('success, processing_time_ms')
    .gte('created_at', timeFilter);

  const totalOptimizations = mlStats?.length || 0;
  const successfulOptimizations = mlStats?.filter(m => m.success).length || 0;
  const avgProcessingTime = mlStats?.length ? 
    mlStats.reduce((sum, m) => sum + m.processing_time_ms, 0) / mlStats.length : 0;

  return {
    kpis: {
      mrr: mrrData || 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalSessions,
      paidSessions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalOptimizations,
      successRate: totalOptimizations > 0 ? Math.round((successfulOptimizations / totalOptimizations) * 100) : 0,
      avgProcessingTime: Math.round(avgProcessingTime)
    },
    timeframe
  };
}

async function getRevenueAnalytics(timeframe, plan) {
  const { data } = await supabase
    .from('revenue_analytics')
    .select('*')
    .gte('date', getTimeFilter(timeframe).split('T')[0])
    .order('date', { ascending: false });

  // Calculate growth rates and trends
  const dailyRevenue = data || [];
  const totalRevenue = dailyRevenue.reduce((sum, day) => sum + (day.revenue || 0), 0);
  const totalTransactions = dailyRevenue.reduce((sum, day) => sum + (day.transactions || 0), 0);
  
  return {
    dailyRevenue,
    summary: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTransactions,
      avgOrderValue: totalTransactions > 0 ? Math.round((totalRevenue / totalTransactions) * 100) / 100 : 0
    },
    planBreakdown: await getPlanBreakdown(timeframe)
  };
}

async function getMLPerformanceMetrics(timeframe) {
  const { data: mlData } = await supabase.rpc('get_ml_performance_metrics');
  
  const { data: optimizationTrends } = await supabase
    .from('ml_optimization_analytics')
    .select('*')
    .gte('date', getTimeFilter(timeframe).split('T')[0])
    .order('date', { ascending: false });

  return {
    modelPerformance: mlData || [],
    optimizationTrends: optimizationTrends || [],
    summary: {
      totalOptimizations: optimizationTrends?.reduce((sum, day) => sum + (day.optimizations || 0), 0) || 0,
      avgSuccessRate: mlData?.length ?
        mlData.reduce((sum, model) => sum + (model.success_rate || 0), 0) / mlData.length : 0
    }
  };
}

async function getComprehensiveDashboard(timeframe, plan) {
  const [overview, revenue, mlPerformance] = await Promise.all([
    getOverviewMetrics(timeframe, plan),
    getRevenueAnalytics(timeframe, plan),
    getMLPerformanceMetrics(timeframe)
  ]);

  return { overview, revenue, mlPerformance };
}

// Helper functions
function getTimeFilter(timeframe) {
  const now = new Date();
  switch (timeframe) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }
}

async function getPlanBreakdown(timeframe) {
  const { data } = await supabase
    .from('user_sessions')
    .select('plan, amount_paid, payment_status')
    .gte('created_at', getTimeFilter(timeframe))
    .eq('payment_status', 'completed');

  const breakdown = (data || []).reduce((acc, session) => {
    if (!acc[session.plan]) {
      acc[session.plan] = { count: 0, revenue: 0 };
    }
    acc[session.plan].count++;
    acc[session.plan].revenue += session.amount_paid / 100;
    return acc;
  }, {});

  return Object.entries(breakdown).map(([plan, stats]) => ({
    plan,
    ...stats,
    revenue: Math.round(stats.revenue * 100) / 100
  }));
}

async function logAnalyticsAccess(user, metric, req) {
  try {
    await supabase
      .from('security_logs')
      .insert({
        event_type: 'ANALYTICS_ACCESS',
        user_id: user.type === 'admin' ? 'admin' : user.sub,
        metadata: {
          metric,
          method: user.method,
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent']
        },
        severity: 'LOW'
      });
  } catch (error) {
    console.error('Failed to log analytics access:', error);
  }
}

// Additional analytics functions for missing cases
async function getUserAnalytics(timeframe) {
  // Placeholder implementation - extend as needed
  return { message: 'User analytics not yet implemented' };
}

async function getConversionFunnelMetrics(timeframe) {
  // Placeholder implementation - extend as needed
  return { message: 'Conversion funnel not yet implemented' };
}

async function getGeographicAnalytics(timeframe) {
  // Placeholder implementation - extend as needed
  return { message: 'Geographic analytics not yet implemented' };
}

async function getSecurityAnalytics(timeframe) {
  // Placeholder implementation - extend as needed
  return { message: 'Security analytics not yet implemented' };
}
