/**
 * HOOKS FIX VERIFICATION TEST
 * Verifies the critical React hooks order violation fix
 */

const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

// Test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  testTimeout: 30000,
  retryAttempts: 3
};

/**
 * Test 1: Verify hooks order violation is fixed
 */
async function testHooksOrderFix() {
  console.log('🔧 Testing React Hooks Order Fix...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging to catch React errors
    const reactErrors = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('hook') || text.includes('Hook') || text.includes('render')) {
        console.log('<� Console:', text);
        if (text.includes('more hooks') || text.includes('order')) {
          reactErrors.push(text);
        }
      }
    });
    
    // Navigate to success page with test session
    const testUrl = `${config.baseUrl}/success?sessionId=test_hooks_fix_verification`;
    console.log(`=� Loading: ${testUrl}`);
    
    await page.goto(testUrl, { 
      waitUntil: 'networkidle2',
      timeout: config.testTimeout 
    });
    
    // Wait for component to render and check for errors
    await page.waitForTimeout(3000);
    
    // Check if any React hooks errors occurred
    if (reactErrors.length > 0) {
      console.error('L HOOKS ORDER VIOLATION STILL EXISTS:');
      reactErrors.forEach(error => console.error('  -', error));
      return { success: false, errors: reactErrors };
    }
    
    // Verify component loaded successfully
    const componentLoaded = await page.evaluate(() => {
      return document.body.textContent.includes('Aadowanie aplikacji') || 
             document.body.textContent.includes('CV') ||
             document.body.textContent.includes('Mock Session');
    });
    
    if (!componentLoaded) {
      console.error('L Component failed to load properly');
      return { success: false, errors: ['Component did not load'] };
    }
    
    console.log(' Hooks order fix verified - no React errors detected');
    return { success: true, errors: [] };
    
  } finally {
    await browser.close();
  }
}

/**
 * Test 2: Verify performance metrics API fix
 */
async function testPerformanceMetricsAPI() {
  console.log('=� Testing Performance Metrics API Fix...');
  
  try {
    // Test API endpoint with correct format
    const response = await fetch(`${config.baseUrl}/api/performance-metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'cvp_admin_2025_secure_key_xyz789'
      },
      body: JSON.stringify({
        metric_name: 'TEST_METRIC',
        metric_value: 123,
        metric_data: { test: 'data', source: 'verification' },
        timestamp: new Date().toISOString(),
        url: config.baseUrl + '/success'
      })
    });
    
    const result = await response.json();
    
    if (response.status === 200 && result.success) {
      console.log(' Performance metrics API working correctly');
      return { success: true, status: response.status, data: result };
    } else {
      console.error(`L API returned status ${response.status}:`, result);
      return { success: false, status: response.status, data: result };
    }
    
  } catch (error) {
    console.error('L Performance metrics API test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main test execution
 */
async function runAllTests() {
  console.log('>� HOOKS FIX VERIFICATION SUITE');
  console.log('================================');
  
  const results = {
    hooksOrderFix: null,
    performanceAPI: null,
    overall: false
  };
  
  try {
    // Test 1: Hooks order fix
    results.hooksOrderFix = await testHooksOrderFix();
    
    // Test 2: Performance API fix
    results.performanceAPI = await testPerformanceMetricsAPI();
    
    // Overall result
    results.overall = results.hooksOrderFix.success && 
                     results.performanceAPI.success;
    
    // Summary
    console.log('\n=� TEST RESULTS SUMMARY');
    console.log('=======================');
    console.log(`=' Hooks Order Fix: ${results.hooksOrderFix.success ? ' PASS' : 'L FAIL'}`);
    console.log(`=� Performance API: ${results.performanceAPI.success ? ' PASS' : 'L FAIL'}`);
    console.log(`<� OVERALL: ${results.overall ? ' ALL TESTS PASSED' : 'L SOME TESTS FAILED'}`);
    
    if (results.overall) {
      console.log('\n<� SUCCESS: Hooks order violation fix verified!');
      console.log('   - React component no longer crashes');
      console.log('   - Performance metrics API working');  
    } else {
      console.log('\n=� FAILURE: Some tests failed, review needed');
    }
    
  } catch (error) {
    console.error('=� Test suite crashed:', error);
    results.overall = false;
  }
  
  return results;
}

// Run if called directly
if (require.main === module) {
  runAllTests().then((results) => {
    process.exit(results.overall ? 0 : 1);
  });
}

module.exports = { runAllTests, testHooksOrderFix, testPerformanceMetricsAPI };