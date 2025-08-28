#!/usr/bin/env node

/**
 * CVPerfect Analytics Dashboard Test Suite
 * Comprehensive testing of enterprise analytics API and dashboard
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'cvp_admin_2025_secure_key_xyz789';

console.log('🧪 CVPerfect Analytics Dashboard Test Suite');
console.log('==========================================\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function test(name, fn) {
  return new Promise(async (resolve) => {
    try {
      const result = await fn();
      if (result === true) {
        console.log(`✅ ${name}`);
        results.passed++;
        results.tests.push({ name, status: 'PASSED' });
      } else if (result === 'warning') {
        console.log(`⚠️  ${name}`);
        results.warnings++;
        results.tests.push({ name, status: 'WARNING' });
      } else {
        console.log(`❌ ${name}: ${result}`);
        results.failed++;
        results.tests.push({ name, status: 'FAILED', error: result });
      }
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      results.failed++;
      results.tests.push({ name, status: 'FAILED', error: error.message });
    }
    resolve();
  });
}

// Test 1: Analytics API endpoint accessibility
await test('Analytics API endpoint accessibility', async () => {
  const response = await fetch(`${BASE_URL}/api/analytics-dashboard?metric=overview&timeframe=7d`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ADMIN_API_KEY
    }
  });

  if (!response.ok) {
    return `HTTP ${response.status}: ${response.statusText}`;
  }

  const data = await response.json();
  if (!data.success) {
    return `API error: ${data.error}`;
  }

  return true;
});

// Test 2: Authentication with invalid key
await test('Authentication with invalid API key', async () => {
  const response = await fetch(`${BASE_URL}/api/analytics-dashboard?metric=overview`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'invalid_key'
    }
  });

  if (response.status === 401) {
    return true;
  }

  return `Expected 401, got ${response.status}`;
});

// Test 3: Overview metrics structure
await test('Overview metrics data structure', async () => {
  const response = await fetch(`${BASE_URL}/api/analytics-dashboard?metric=overview&timeframe=30d`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ADMIN_API_KEY
    }
  });

  const data = await response.json();
  
  if (!data.success) {
    return `API error: ${data.error}`;
  }

  const { kpis } = data.data;
  const requiredFields = ['totalRevenue', 'totalSessions', 'conversionRate', 'successRate'];
  
  for (const field of requiredFields) {
    if (kpis[field] === undefined) {
      return `Missing required field: ${field}`;
    }
  }

  return true;
});

// Test 4: Revenue analytics endpoint
await test('Revenue analytics endpoint', async () => {
  const response = await fetch(`${BASE_URL}/api/analytics-dashboard?metric=revenue&timeframe=30d`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ADMIN_API_KEY
    }
  });

  const data = await response.json();
  
  if (!data.success) {
    return `API error: ${data.error}`;
  }

  if (!data.data.summary || !data.data.planBreakdown) {
    return 'Missing revenue analytics structure';
  }

  return true;
});

// Test 5: ML performance metrics endpoint
await test('ML performance metrics endpoint', async () => {
  const response = await fetch(`${BASE_URL}/api/analytics-dashboard?metric=ml-performance&timeframe=30d`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ADMIN_API_KEY
    }
  });

  const data = await response.json();
  
  if (!data.success) {
    return `API error: ${data.error}`;
  }

  if (!data.data.modelPerformance || !data.data.summary) {
    return 'Missing ML performance structure';
  }

  return true;
});

// Test 6: Comprehensive dashboard data
await test('Comprehensive dashboard data', async () => {
  const response = await fetch(`${BASE_URL}/api/analytics-dashboard?timeframe=7d`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ADMIN_API_KEY
    }
  });

  const data = await response.json();
  
  if (!data.success) {
    return `API error: ${data.error}`;
  }

  const requiredSections = ['overview', 'revenue', 'mlPerformance'];
  
  for (const section of requiredSections) {
    if (!data.data[section]) {
      return `Missing dashboard section: ${section}`;
    }
  }

  return true;
});

// Test 7: Different timeframe support
await test('Multiple timeframe support', async () => {
  const timeframes = ['7d', '30d', '90d'];
  
  for (const timeframe of timeframes) {
    const response = await fetch(`${BASE_URL}/api/analytics-dashboard?metric=overview&timeframe=${timeframe}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ADMIN_API_KEY
      }
    });

    if (!response.ok) {
      return `Timeframe ${timeframe} failed: ${response.status}`;
    }

    const data = await response.json();
    if (!data.success) {
      return `Timeframe ${timeframe} error: ${data.error}`;
    }
  }

  return true;
});

// Test 8: Response metadata structure
await test('Response metadata completeness', async () => {
  const response = await fetch(`${BASE_URL}/api/analytics-dashboard?metric=overview`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ADMIN_API_KEY
    }
  });

  const data = await response.json();
  
  if (!data.success) {
    return `API error: ${data.error}`;
  }

  const requiredMetadata = ['timeframe', 'metric', 'generatedAt', 'cacheExpiry'];
  
  for (const field of requiredMetadata) {
    if (!data.metadata[field]) {
      return `Missing metadata field: ${field}`;
    }
  }

  return true;
});

// Test 9: CORS headers
await test('CORS headers configuration', async () => {
  const response = await fetch(`${BASE_URL}/api/analytics-dashboard`, {
    method: 'OPTIONS'
  });

  if (response.status !== 200) {
    return `OPTIONS request failed: ${response.status}`;
  }

  const corsHeaders = [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers'
  ];

  for (const header of corsHeaders) {
    if (!response.headers.get(header)) {
      return `Missing CORS header: ${header}`;
    }
  }

  return true;
});

// Test 10: Admin page accessibility (basic check)
await test('Admin analytics page accessibility', async () => {
  try {
    const response = await fetch(`${BASE_URL}/admin/analytics`);
    
    if (response.status === 200) {
      return true;
    } else if (response.status === 404) {
      return 'Admin page not found - may need to be added to routing';
    } else {
      return `Unexpected status: ${response.status}`;
    }
  } catch (error) {
    return `Connection error: ${error.message}`;
  }
});

// Test 11: Performance timing
await test('API response time performance', async () => {
  const startTime = Date.now();
  
  const response = await fetch(`${BASE_URL}/api/analytics-dashboard?metric=overview`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ADMIN_API_KEY
    }
  });

  const endTime = Date.now();
  const responseTime = endTime - startTime;

  if (!response.ok) {
    return `HTTP ${response.status}`;
  }

  if (responseTime > 5000) {
    return `Response too slow: ${responseTime}ms (target: <5000ms)`;
  }

  console.log(`   Response time: ${responseTime}ms`);
  return true;
});

// Test 12: Data validation
await test('Analytics data validation', async () => {
  const response = await fetch(`${BASE_URL}/api/analytics-dashboard?metric=overview`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ADMIN_API_KEY
    }
  });

  const data = await response.json();
  
  if (!data.success) {
    return `API error: ${data.error}`;
  }

  const { kpis } = data.data;
  
  // Validate data types and ranges
  if (typeof kpis.totalRevenue !== 'number' || kpis.totalRevenue < 0) {
    return 'Invalid totalRevenue value';
  }
  
  if (typeof kpis.conversionRate !== 'number' || kpis.conversionRate < 0 || kpis.conversionRate > 100) {
    return 'Invalid conversionRate value';
  }
  
  if (typeof kpis.totalSessions !== 'number' || kpis.totalSessions < 0) {
    return 'Invalid totalSessions value';
  }

  return true;
});

console.log('\n📊 Analytics Dashboard Test Results');
console.log('===================================');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📝 Total Tests: ${results.tests.length}`);

const successRate = Math.round((results.passed / results.tests.length) * 100);
console.log(`📈 Success Rate: ${successRate}%`);

if (results.failed > 0) {
  console.log('\n❌ Failed Tests:');
  results.tests
    .filter(t => t.status === 'FAILED')
    .forEach(t => console.log(`   - ${t.name}: ${t.error}`));
}

if (results.warnings > 0) {
  console.log('\n⚠️  Warnings:');
  results.tests
    .filter(t => t.status === 'WARNING')
    .forEach(t => console.log(`   - ${t.name}`));
}

console.log('\n🚀 Next Steps:');
if (results.failed === 0) {
  console.log('✅ Analytics dashboard tests passed!');
  console.log('📋 Ready for production deployment');
  console.log('🔐 Admin access: /admin/analytics');
  console.log('🎯 API endpoint: /api/analytics-dashboard');
} else {
  console.log('❌ Fix failed tests before proceeding');
  console.log('📖 Review API implementation');
  console.log('🛠️  Update missing components');
}

console.log('\n📚 Usage Examples:');
console.log('- Overview metrics: GET /api/analytics-dashboard?metric=overview&timeframe=30d');
console.log('- Revenue analytics: GET /api/analytics-dashboard?metric=revenue&timeframe=7d');
console.log('- ML performance: GET /api/analytics-dashboard?metric=ml-performance&timeframe=90d');
console.log('- Admin dashboard: /admin/analytics');

console.log('\n🔑 Authentication:');
console.log('- Header: X-API-Key: cvp_admin_2025_secure_key_xyz789');
console.log('- Or JWT: Authorization: Bearer <admin_jwt_token>');

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);