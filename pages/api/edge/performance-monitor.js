// Edge function for global performance monitoring
export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  const { method, url, headers } = request
  const { searchParams } = new URL(url)
  
  // Get client location and connection info
  const country = request.geo?.country || 'US'
  const region = request.geo?.region || 'default'
  const city = request.geo?.city || 'unknown'
  const latitude = request.geo?.latitude || 0
  const longitude = request.geo?.longitude || 0
  
  if (method === 'POST') {
    try {
      const startTime = Date.now()
      const body = await request.json()
      
      const {
        metrics,
        sessionId,
        userAgent,
        viewport,
        connection,
        performanceEntries,
        coreWebVitals,
        customMetrics
      } = body
      
      // Process and enrich performance data
      const enrichedMetrics = await processPerformanceMetrics({
        ...body,
        geo: {
          country,
          region,
          city,
          latitude,
          longitude
        },
        edge: {
          processingTime: Date.now() - startTime,
          edgeRegion: region,
          timestamp: new Date().toISOString()
        }
      })
      
      // Store metrics in regional database
      const dbRegion = getOptimalDBRegion(country)
      const storageResult = await storePerformanceData(enrichedMetrics, dbRegion)
      
      // Real-time alerting for critical issues
      const alerts = await checkPerformanceAlerts(enrichedMetrics)
      
      // Performance optimization recommendations
      const recommendations = generateOptimizationRecommendations(enrichedMetrics)
      
      return new Response(JSON.stringify({
        success: true,
        stored: storageResult.success,
        alerts: alerts,
        recommendations: recommendations,
        geo: {
          country,
          region,
          city
        },
        processing: {
          edgeRegion: region,
          dbRegion: dbRegion,
          processingTime: Date.now() - startTime
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Edge-Region': region,
          'X-DB-Region': dbRegion,
          'X-Processing-Time': (Date.now() - startTime).toString(),
          'Cache-Control': 'no-store'
        }
      })
      
    } catch (error) {
      console.error('Edge performance monitoring error:', error)
      
      return new Response(JSON.stringify({ 
        error: 'Performance monitoring failed',
        region: region,
        message: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Edge-Region': region,
          'X-Error': 'PERFORMANCE_MONITORING_FAILED'
        }
      })
    }
  }
  
  // GET endpoint for performance dashboard
  if (method === 'GET') {
    try {
      const timeRange = searchParams.get('timeRange') || '1h'
      const metricType = searchParams.get('type') || 'all'
      
      // Get regional performance summary
      const performanceSummary = await getPerformanceSummary(country, region, timeRange, metricType)
      
      return new Response(JSON.stringify({
        success: true,
        summary: performanceSummary,
        region: {
          country,
          region,
          city
        },
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Edge-Region': region,
          'Cache-Control': 'public, max-age=60' // Cache for 1 minute
        }
      })
      
    } catch (error) {
      console.error('Performance summary error:', error)
      
      return new Response(JSON.stringify({ 
        error: 'Failed to get performance summary',
        message: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  }
  
  return new Response('Method not allowed', { status: 405 })
}

// Process and enrich performance metrics
async function processPerformanceMetrics(data) {
  const { metrics, geo, edge, coreWebVitals, customMetrics } = data
  
  return {
    id: generateMetricId(),
    timestamp: edge.timestamp,
    geo: geo,
    edge: edge,
    coreWebVitals: {
      lcp: coreWebVitals?.lcp || null,
      fid: coreWebVitals?.fid || null,
      cls: coreWebVitals?.cls || null,
      fcp: coreWebVitals?.fcp || null,
      ttfb: coreWebVitals?.ttfb || null
    },
    performance: {
      pageLoadTime: customMetrics?.pageLoadTime || 0,
      apiResponseTimes: customMetrics?.apiResponseTimes || [],
      bundleSize: customMetrics?.bundleSize || 0,
      memoryUsage: customMetrics?.memoryUsage || 0,
      networkLatency: calculateNetworkLatency(geo),
      cdnHitRate: customMetrics?.cdnHitRate || 0
    },
    user: {
      userAgent: data.userAgent,
      viewport: data.viewport,
      connection: data.connection,
      sessionId: data.sessionId
    }
  }
}

// Calculate expected network latency based on geography
function calculateNetworkLatency(geo) {
  const { country, latitude, longitude } = geo
  
  // Base latency estimates by region (in ms)
  const baseLatencies = {
    'US': 50,
    'CA': 60,
    'MX': 80,
    'GB': 40,
    'DE': 35,
    'FR': 45,
    'PL': 50,
    'JP': 30,
    'AU': 70,
    'BR': 90,
    'IN': 85,
    'SG': 40
  }
  
  const baseLatency = baseLatencies[country] || 100
  
  // Add geographic distance factor
  const distanceFactor = Math.abs(latitude - 52) + Math.abs(longitude - 21) // Distance from Poland
  const adjustedLatency = baseLatency + (distanceFactor * 0.5)
  
  return Math.round(adjustedLatency)
}

// Store performance data in regional database
async function storePerformanceData(metrics, dbRegion) {
  try {
    // In production, this would store in regional Supabase instance
    console.log(`Storing performance data in ${dbRegion}:`, {
      id: metrics.id,
      geo: metrics.geo,
      coreWebVitals: metrics.coreWebVitals
    })
    
    return { success: true, id: metrics.id, region: dbRegion }
  } catch (error) {
    console.error('Failed to store performance data:', error)
    return { success: false, error: error.message }
  }
}

// Check for performance alerts
async function checkPerformanceAlerts(metrics) {
  const alerts = []
  
  // Core Web Vitals alerts
  if (metrics.coreWebVitals.lcp > 4000) {
    alerts.push({
      type: 'critical',
      metric: 'LCP',
      value: metrics.coreWebVitals.lcp,
      threshold: 2500,
      message: 'Largest Contentful Paint is critically slow'
    })
  }
  
  if (metrics.coreWebVitals.cls > 0.25) {
    alerts.push({
      type: 'critical',
      metric: 'CLS',
      value: metrics.coreWebVitals.cls,
      threshold: 0.1,
      message: 'Cumulative Layout Shift is causing poor user experience'
    })
  }
  
  if (metrics.coreWebVitals.fid > 300) {
    alerts.push({
      type: 'warning',
      metric: 'FID',
      value: metrics.coreWebVitals.fid,
      threshold: 100,
      message: 'First Input Delay is affecting interactivity'
    })
  }
  
  // Custom performance alerts
  if (metrics.performance.pageLoadTime > 5000) {
    alerts.push({
      type: 'warning',
      metric: 'PAGE_LOAD',
      value: metrics.performance.pageLoadTime,
      threshold: 3000,
      message: 'Page load time is slower than expected'
    })
  }
  
  if (metrics.performance.memoryUsage > 100000000) { // 100MB
    alerts.push({
      type: 'warning',
      metric: 'MEMORY',
      value: Math.round(metrics.performance.memoryUsage / 1024 / 1024),
      threshold: 50,
      message: 'High memory usage detected'
    })
  }
  
  return alerts
}

// Generate optimization recommendations
function generateOptimizationRecommendations(metrics) {
  const recommendations = []
  
  // CDN optimization
  if (metrics.performance.cdnHitRate < 0.9) {
    recommendations.push({
      type: 'cdn',
      priority: 'high',
      message: 'Improve CDN cache hit rate by optimizing cache headers'
    })
  }
  
  // Bundle optimization
  if (metrics.performance.bundleSize > 1000000) { // 1MB
    recommendations.push({
      type: 'bundle',
      priority: 'medium',
      message: 'Consider code splitting to reduce initial bundle size'
    })
  }
  
  // Network optimization
  if (metrics.performance.networkLatency > 200) {
    recommendations.push({
      type: 'network',
      priority: 'medium',
      message: `Consider using closer edge locations for ${metrics.geo.region}`
    })
  }
  
  // Regional optimization
  if (metrics.geo.country === 'PL' && metrics.performance.apiResponseTimes.length > 0) {
    const avgApiTime = metrics.performance.apiResponseTimes.reduce((a, b) => a + b, 0) / metrics.performance.apiResponseTimes.length
    if (avgApiTime > 500) {
      recommendations.push({
        type: 'regional',
        priority: 'high',
        message: 'Consider deploying dedicated Polish API endpoints'
      })
    }
  }
  
  return recommendations
}

// Get performance summary for dashboard
async function getPerformanceSummary(country, region, timeRange, metricType) {
  // Mock data - in production would query regional analytics
  return {
    country,
    region,
    timeRange,
    metrics: {
      averageLCP: 2150,
      averageFID: 85,
      averageCLS: 0.08,
      averagePageLoad: 2800,
      cdnHitRate: 0.94,
      uptime: 0.999,
      totalRequests: 15420,
      errorRate: 0.002
    },
    trends: {
      lcp: 'improving',
      fid: 'stable', 
      cls: 'improving',
      pageLoad: 'stable'
    },
    recommendations: 3,
    alerts: 1
  }
}

// Optimal database region selection
function getOptimalDBRegion(country) {
  const dbRegions = {
    'US': 'us-east-1',
    'CA': 'us-east-1',
    'GB': 'eu-west-2',
    'DE': 'eu-central-1',
    'FR': 'eu-west-3',
    'PL': 'eu-central-1',
    'JP': 'ap-northeast-1',
    'AU': 'ap-southeast-2',
    'BR': 'sa-east-1',
    'IN': 'ap-south-1'
  }
  
  return dbRegions[country] || 'us-east-1'
}

// Generate unique metric ID
function generateMetricId() {
  return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}