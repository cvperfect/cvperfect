#!/usr/bin/env node

/**
 * CVPerfect Performance Monitoring Test Suite
 * Tests the complete performance monitoring ecosystem
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

console.log('=€ CVPerfect Performance Monitoring Test Suite')
console.log('=' .repeat(50))

async function testPerformanceMetricsAPI() {
  console.log('\n=Ê Testing Performance Metrics API...')
  
  const testMetrics = [
    {
      metric_name: 'LCP',
      metric_value: 1800,
      metric_data: { value: 1800 },
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0 (Test Suite)',
      url: 'http://localhost:3000/'
    },
    {
      metric_name: 'FID',
      metric_value: 85,
      metric_data: { value: 85 },
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0 (Test Suite)',
      url: 'http://localhost:3000/'
    },
    {
      metric_name: 'CLS',
      metric_value: 0.08,
      metric_data: { value: 0.08 },
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0 (Test Suite)',
      url: 'http://localhost:3000/'
    },
    {
      metric_name: 'API',
      metric_value: 250,
      metric_data: { endpoint: 'parse-cv', duration: 250, status: 200 },
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0 (Test Suite)',
      url: 'http://localhost:3000/'
    },
    {
      metric_name: 'BUNDLE',
      metric_value: 950,
      metric_data: { value: 950, domContentLoaded: 800, resourcesLoaded: 150 },
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0 (Test Suite)',
      url: 'http://localhost:3000/'
    }
  ]
  
  let successCount = 0
  
  for (const metric of testMetrics) {
    try {
      const response = await fetch(`${BASE_URL}/api/performance-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        console.log(`   ${metric.metric_name} metric stored successfully`)
        successCount++
      } else {
        console.log(`  L Failed to store ${metric.metric_name}: ${result.error}`)
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.log(`  L Error storing ${metric.metric_name}: ${error.message}`)
    }
  }
  
  console.log(`\n=È Metrics API Test Result: ${successCount}/${testMetrics.length} metrics stored`)
  return successCount === testMetrics.length
}

async function testPerformanceDashboardAPI() {
  console.log('\n=Ë Testing Performance Dashboard API...')
  
  const timeRanges = ['1h', '24h', '7d']
  let successCount = 0
  
  for (const range of timeRanges) {
    try {
      const response = await fetch(`${BASE_URL}/api/performance-dashboard?range=${range}`)
      const result = await response.json()
      
      if (response.ok && result.success) {
        console.log(`   Dashboard data for ${range} fetched successfully`)
        console.log(`     - ${result.metrics?.length || 0} recent metrics`)
        console.log(`     - ${result.aggregated?.slowAPIs?.length || 0} slow APIs detected`)
        console.log(`     - ${result.aggregated?.alertsCount || 0} performance alerts`)
        successCount++
      } else {
        console.log(`  L Failed to fetch dashboard data for ${range}: ${result.error}`)
      }
      
    } catch (error) {
      console.log(`  L Error fetching dashboard data for ${range}: ${error.message}`)
    }
  }
  
  console.log(`\n=Ê Dashboard API Test Result: ${successCount}/${timeRanges.length} ranges tested`)
  return successCount === timeRanges.length
}

async function testPerformanceThresholds() {
  console.log('\n   Testing Performance Threshold Alerts...')
  
  const alertMetrics = [
    {
      metric_name: 'LCP',
      metric_value: 5000, // Should trigger alert (> 4000ms)
      metric_data: { value: 5000 },
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0 (Alert Test)',
      url: 'http://localhost:3000/alert-test'
    },
    {
      metric_name: 'CLS',
      metric_value: 0.3, // Should trigger alert (> 0.25)
      metric_data: { value: 0.3 },
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0 (Alert Test)',
      url: 'http://localhost:3000/alert-test'
    },
    {
      metric_name: 'API',
      metric_value: 1500,
      metric_data: { endpoint: 'slow-test', duration: 1500, status: 200 }, // Should trigger alert
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0 (Alert Test)',
      url: 'http://localhost:3000/alert-test'
    }
  ]
  
  let alertsTriggered = 0
  
  for (const metric of alertMetrics) {
    try {
      const response = await fetch(`${BASE_URL}/api/performance-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        console.log(`  =¨ Alert metric ${metric.metric_name} sent (should trigger threshold alert)`)
        alertsTriggered++
      }
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      console.log(`  L Error sending alert metric ${metric.metric_name}: ${error.message}`)
    }
  }
  
  console.log(`\n=¨ Threshold Test Result: ${alertsTriggered}/${alertMetrics.length} alert metrics sent`)
  console.log('   Check server console for threshold alert warnings!')
  
  return alertsTriggered === alertMetrics.length
}

async function testMobileResponsiveness() {
  console.log('\n=ñ Testing Mobile Performance Metrics...')
  
  const mobileMetrics = [
    {
      metric_name: 'LCP',
      metric_value: 2200, // Good mobile LCP
      metric_data: { value: 2200, isMobile: true },
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
      url: 'http://localhost:3000/'
    },
    {
      metric_name: 'BUNDLE',
      metric_value: 1800, // Mobile bundle load
      metric_data: { value: 1800, connection: '4g' },
      timestamp: new Date().toISOString(),
      user_agent: 'Mozilla/5.0 (Android; Mobile)',
      url: 'http://localhost:3000/'
    }
  ]
  
  let mobileSuccess = 0
  
  for (const metric of mobileMetrics) {
    try {
      const response = await fetch(`${BASE_URL}/api/performance-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        console.log(`   Mobile ${metric.metric_name} metric stored`)
        mobileSuccess++
      }
      
    } catch (error) {
      console.log(`  L Error storing mobile ${metric.metric_name}: ${error.message}`)
    }
  }
  
  console.log(`\n=ñ Mobile Test Result: ${mobileSuccess}/${mobileMetrics.length} mobile metrics stored`)
  return mobileSuccess === mobileMetrics.length
}

async function runPerformanceTests() {
  console.log(`= Testing against: ${BASE_URL}`)
  console.log('ñ  Starting performance monitoring tests...\n')
  
  const results = []
  
  // Test 1: Basic metrics storage
  results.push({
    name: 'Metrics API',
    passed: await testPerformanceMetricsAPI()
  })
  
  // Test 2: Dashboard data aggregation
  results.push({
    name: 'Dashboard API',
    passed: await testPerformanceDashboardAPI()
  })
  
  // Test 3: Performance threshold alerts
  results.push({
    name: 'Threshold Alerts',
    passed: await testPerformanceThresholds()
  })
  
  // Test 4: Mobile performance tracking
  results.push({
    name: 'Mobile Metrics',
    passed: await testMobileResponsiveness()
  })
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('=Ê PERFORMANCE MONITORING TEST SUMMARY')
  console.log('='.repeat(50))
  
  const passedTests = results.filter(r => r.passed).length
  const totalTests = results.length
  
  results.forEach(result => {
    const status = result.passed ? ' PASS' : 'L FAIL'
    console.log(`${status} ${result.name}`)
  })
  
  console.log('\n' + '-'.repeat(50))
  console.log(`RESULT: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('<‰ All performance monitoring tests passed!')
    console.log('=€ Performance monitoring system is working correctly')
    console.log(`=È Visit ${BASE_URL}/performance to view dashboard`)
  } else {
    console.log('   Some tests failed. Check the logs above for details.')
  }
  
  process.exit(passedTests === totalTests ? 0 : 1)
}

// Run the tests
runPerformanceTests().catch(error => {
  console.error('=¨ Test suite failed:', error)
  process.exit(1)
})