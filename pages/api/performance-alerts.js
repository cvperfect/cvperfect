// API endpoint for performance alerts retrieval
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { range = '1h', severity = 'all', page = 'all' } = req.query
    
    // Calculate time range
    const now = new Date()
    let startTime
    
    switch (range) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      default:
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
    }

    // Build query for alerts (using performance_metrics table)
    const { data: alerts, error: alertsError } = await supabase
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', startTime.toISOString())
      .in('metric_name', ['PERFORMANCE_CRITICAL_ALERT', 'BUNDLE_BUDGET_EXCEEDED', 'LCP', 'FID', 'CLS'])
      .order('timestamp', { ascending: false })
      .limit(50)

    if (alertsError) {
      console.error('Alerts fetch error:', alertsError)
      return res.status(500).json({ error: 'Failed to fetch alerts' })
    }

    // Transform metrics to alert format
    const transformedAlerts = (alerts || []).map(metric => ({
      id: metric.id,
      metric_type: metric.metric_name,
      page: metric.url || 'unknown',
      value: metric.metric_value,
      threshold: getThresholdForMetric(metric.metric_name),
      severity: getSeverityForMetric(metric.metric_name, parseFloat(metric.metric_value)),
      timestamp: metric.timestamp
    }))

    return res.status(200).json({
      success: true,
      alerts: transformedAlerts,
      range: range,
      count: transformedAlerts.length
    })

  } catch (error) {
    console.error('Performance alerts API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

function getThresholdForMetric(metricName) {
  const thresholds = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    FCP: 1800,
    TTFB: 600,
    BUNDLE_BUDGET_EXCEEDED: 300000
  }
  return thresholds[metricName] || 0
}

function getSeverityForMetric(metricName, value) {
  const criticalThresholds = {
    LCP: 4000,
    FID: 300,
    CLS: 0.25,
    FCP: 3000,
    TTFB: 1500
  }
  
  const criticalThreshold = criticalThresholds[metricName]
  if (criticalThreshold && value > criticalThreshold) {
    return 'critical'
  }
  return 'warning'
}
