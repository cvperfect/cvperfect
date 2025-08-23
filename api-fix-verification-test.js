#!/usr/bin/env node

/**
 * Final verification test for API endpoints fix
 * Verifies that all endpoints now return JSON instead of HTML on errors
 */

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TIMEOUT = 10000; // 10 seconds per test

// Color console logging
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, ...args) {
  console.log(colors[color], ...args, colors.reset);
}

/**
 * Make HTTP request with timeout
 */
function makeRequest(options, postData = null, timeout = TIMEOUT) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
          contentType: res.headers['content-type'] || 'unknown'
        });
      });
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

/**
 * Check if response is proper JSON error response
 */
function isValidJSONError(response) {
  const isJSON = response.contentType.includes('application/json');
  let hasValidStructure = false;
  
  if (isJSON) {
    try {
      const parsed = JSON.parse(response.body);
      hasValidStructure = parsed.hasOwnProperty('success') && parsed.hasOwnProperty('error');
    } catch (e) {
      hasValidStructure = false;
    }
  }
  
  return {
    isJSON,
    hasValidStructure,
    isValid: isJSON && hasValidStructure
  };
}

/**
 * Test critical error scenarios that previously returned HTML
 */
async function testCriticalErrorScenarios() {
  log('cyan', '\\n🔍 Testing Critical Error Scenarios (Previously HTML)');
  
  const tests = [
    {
      name: '/api/save-session - Missing sessionId',
      options: {
        hostname: 'localhost',
        port: 3001,
        path: '/api/save-session',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      data: JSON.stringify({ cvData: 'test', email: 'test@example.com' })
    },
    {
      name: '/api/get-session-data - Missing session_id',
      options: {
        hostname: 'localhost',
        port: 3001,
        path: '/api/get-session-data',
        method: 'GET'
      },
      data: null
    },
    {
      name: '/api/save-session - Invalid sessionId format',
      options: {
        hostname: 'localhost',
        port: 3001,
        path: '/api/save-session',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      data: JSON.stringify({ 
        sessionId: 'invalid/session/id', 
        cvData: 'test', 
        email: 'test@example.com' 
      })
    },
    {
      name: '/api/analyze - Missing required fields',
      options: {
        hostname: 'localhost',
        port: 3001,
        path: '/api/analyze',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      data: JSON.stringify({ email: 'test@example.com' }) // missing currentCV
    }
  ];
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const test of tests) {
    totalTests++;
    log('yellow', `\\n  Testing: ${test.name}`);
    
    try {
      const response = await makeRequest(test.options, test.data, 5000);
      const validation = isValidJSONError(response);
      
      log('blue', `    Status: ${response.statusCode}`);
      log('blue', `    Content-Type: ${response.contentType}`);
      
      if (validation.isValid) {
        log('green', '    ✅ Returns proper JSON error response');
        passedTests++;
        
        // Show the JSON structure
        try {
          const parsed = JSON.parse(response.body);
          log('green', `    ✅ Structure: success=${parsed.success}, error="${parsed.error}"`);
        } catch (e) {
          // Should not happen since validation passed
        }
      } else {
        log('red', '    ❌ ERROR: Invalid response format');
        if (!validation.isJSON) {
          log('red', '    ❌ Not returning JSON!');
          log('yellow', `    Response preview: ${response.body.substring(0, 100)}...`);
        } else if (!validation.hasValidStructure) {
          log('red', '    ❌ JSON missing proper error structure!');
        }
      }
    } catch (error) {
      log('red', '    ❌ Request failed:', error.message);
    }
  }
  
  log('magenta', `\\n📊 Critical Error Tests: ${passedTests}/${totalTests} passed`);
  return { total: totalTests, passed: passedTests };
}

/**
 * Test that valid requests still work correctly
 */
async function testValidRequests() {
  log('cyan', '\\n🔍 Testing Valid Requests (Regression Check)');
  
  const tests = [
    {
      name: '/api/save-session - Valid request',
      options: {
        hostname: 'localhost',
        port: 3001,
        path: '/api/save-session',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      data: JSON.stringify({
        sessionId: 'sess_test_valid_123',
        cvData: 'Valid CV content',
        email: 'valid@example.com',
        plan: 'basic'
      }),
      expectSuccess: true
    },
    {
      name: '/api/get-session-data - Valid session',
      options: {
        hostname: 'localhost',
        port: 3001,
        path: '/api/get-session-data?session_id=sess_test_valid_123',
        method: 'GET'
      },
      data: null,
      expectSuccess: true
    }
  ];
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const test of tests) {
    totalTests++;
    log('yellow', `\\n  Testing: ${test.name}`);
    
    try {
      const response = await makeRequest(test.options, test.data, 5000);
      
      log('blue', `    Status: ${response.statusCode}`);
      log('blue', `    Content-Type: ${response.contentType}`);
      
      const isJSON = response.contentType.includes('application/json');
      const isSuccessStatus = response.statusCode >= 200 && response.statusCode < 300;
      
      if (isJSON && (test.expectSuccess ? isSuccessStatus : !isSuccessStatus)) {
        log('green', '    ✅ Valid request works correctly');
        passedTests++;
        
        try {
          const parsed = JSON.parse(response.body);
          if (parsed.success) {
            log('green', `    ✅ Success response: ${JSON.stringify(parsed).substring(0, 100)}...`);
          }
        } catch (e) {
          log('yellow', '    ⚠️ JSON parsing issue, but content-type is correct');
        }
      } else {
        log('red', '    ❌ Valid request failed');
        if (!isJSON) {
          log('red', '    ❌ Not returning JSON!');
        }
      }
    } catch (error) {
      log('red', '    ❌ Request failed:', error.message);
    }
  }
  
  log('magenta', `\\n📊 Valid Request Tests: ${passedTests}/${totalTests} passed`);
  return { total: totalTests, passed: passedTests };
}

/**
 * Main test runner
 */
async function runVerificationTests() {
  log('magenta', '='.repeat(70));
  log('magenta', '🧪 API ENDPOINTS FIX VERIFICATION');
  log('magenta', '   Testing that all APIs return JSON instead of HTML on errors');
  log('magenta', '='.repeat(70));
  
  const criticalResults = await testCriticalErrorScenarios();
  const validResults = await testValidRequests();
  
  const totalTests = criticalResults.total + validResults.total;
  const totalPassed = criticalResults.passed + validResults.passed;
  
  log('magenta', '\\n' + '='.repeat(70));
  log('magenta', '📈 FINAL RESULTS');
  log('magenta', '='.repeat(70));
  
  if (totalPassed === totalTests) {
    log('green', `\\n🎉 ALL TESTS PASSED! (${totalPassed}/${totalTests})`);
    log('green', '✅ API endpoints now properly return JSON on all errors');
    log('green', '✅ No more HTML responses from API endpoints');
    log('green', '✅ All valid requests continue to work correctly');
    log('green', '\\n🚀 API error handling fix is SUCCESSFUL!');
  } else {
    log('yellow', `\\n⚠️ Some tests failed: ${totalPassed}/${totalTests} passed`);
    
    if (criticalResults.passed < criticalResults.total) {
      log('red', '❌ Critical error scenarios still have issues');
    } else {
      log('green', '✅ Critical error scenarios are fixed');
    }
    
    if (validResults.passed < validResults.total) {
      log('red', '❌ Some valid requests are broken (regression)');
    } else {
      log('green', '✅ Valid requests work correctly (no regression)');
    }
  }
  
  log('magenta', '='.repeat(70));
}

// Run verification tests
runVerificationTests().catch(console.error);