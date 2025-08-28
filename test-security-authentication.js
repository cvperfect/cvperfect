/**
 * Test script for Performance Dashboard Security Authentication
 * Tests both page-level and API-level authentication
 */

const fs = require('fs');

async function testAuthentication() {
  const baseUrl = 'http://localhost:3000';
  const adminKey = 'cvp_admin_2025_secure_key_xyz789';
  
  console.log('🔐 Testing Performance Dashboard Authentication...\n');

  // Test 1: Page access without authentication (should fail)
  console.log('1. Testing page access without auth...');
  try {
    const response = await fetch(`${baseUrl}/performance`);
    if (response.status === 404) {
      console.log('✅ PASS: Page correctly returns 404 for unauthorized access');
    } else {
      console.log(`❌ FAIL: Expected 404, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: Could not test page access: ${error.message}`);
  }

  // Test 2: Page access with URL parameter (should succeed)
  console.log('\n2. Testing page access with URL parameter...');
  try {
    const response = await fetch(`${baseUrl}/performance?key=${adminKey}`);
    if (response.status === 200) {
      console.log('✅ PASS: Page correctly allows access with URL parameter');
    } else {
      console.log(`❌ FAIL: Expected 200, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: Could not test page access: ${error.message}`);
  }

  // Test 3: API endpoint without authentication (should fail)
  console.log('\n3. Testing API endpoint without auth...');
  try {
    const response = await fetch(`${baseUrl}/api/performance-dashboard`);
    if (response.status === 404) {
      console.log('✅ PASS: API correctly returns 404 for unauthorized access');
    } else {
      console.log(`❌ FAIL: Expected 404, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: Could not test API endpoint: ${error.message}`);
  }

  // Test 4: API endpoint with URL parameter (should succeed) 
  console.log('\n4. Testing API endpoint with URL parameter...');
  try {
    const response = await fetch(`${baseUrl}/api/performance-dashboard?key=${adminKey}`);
    if (response.status === 200) {
      console.log('✅ PASS: API correctly allows access with URL parameter');
    } else {
      console.log(`❌ FAIL: Expected 200, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: Could not test API endpoint: ${error.message}`);
  }

  // Test 5: API endpoint with header authentication (should succeed)
  console.log('\n5. Testing API endpoint with header auth...');
  try {
    const response = await fetch(`${baseUrl}/api/performance-dashboard`, {
      headers: {
        'x-admin-key': adminKey
      }
    });
    if (response.status === 200) {
      console.log('✅ PASS: API correctly allows access with header authentication');
    } else {
      console.log(`❌ FAIL: Expected 200, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: Could not test API endpoint: ${error.message}`);
  }

  // Test 6: Performance metrics API without auth (should fail)
  console.log('\n6. Testing performance metrics API without auth...');
  try {
    const response = await fetch(`${baseUrl}/api/performance-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric_name: 'TEST',
        metric_value: '100',
        timestamp: new Date().toISOString()
      })
    });
    if (response.status === 404) {
      console.log('✅ PASS: Metrics API correctly returns 404 for unauthorized access');
    } else {
      console.log(`❌ FAIL: Expected 404, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: Could not test metrics API: ${error.message}`);
  }

  // Test 7: Performance metrics API with auth (should succeed)
  console.log('\n7. Testing performance metrics API with auth...');
  try {
    const response = await fetch(`${baseUrl}/api/performance-metrics?key=${adminKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric_name: 'TEST_AUTH',
        metric_value: '200',
        timestamp: new Date().toISOString()
      })
    });
    if (response.status === 200) {
      console.log('✅ PASS: Metrics API correctly allows access with authentication');
    } else {
      console.log(`❌ FAIL: Expected 200, got ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ERROR: Could not test metrics API: ${error.message}`);
  }

  console.log('\n🔐 Authentication tests completed!');
  console.log('\n📝 USAGE INSTRUCTIONS:');
  console.log('- Page access: http://localhost:3000/performance?key=cvp_admin_2025_secure_key_xyz789');
  console.log('- API with URL param: /api/performance-dashboard?key=cvp_admin_2025_secure_key_xyz789');
  console.log('- API with header: Add "x-admin-key: cvp_admin_2025_secure_key_xyz789" header');
}

// Run tests
testAuthentication().catch(console.error);
