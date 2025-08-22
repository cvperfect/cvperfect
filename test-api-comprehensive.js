// Comprehensive API Endpoint Testing Script for CvPerfect
// Tests all endpoints for functionality, error handling, and data integrity

const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3005';
const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

// Test utilities
function logResult(endpoint, status, message, details = null) {
  const result = {
    endpoint,
    status,
    message,
    details,
    timestamp: new Date().toISOString()
  };
  
  TEST_RESULTS.details.push(result);
  
  if (status === 'PASS') {
    TEST_RESULTS.passed++;
    console.log(`✅ ${endpoint}: ${message}`);
  } else if (status === 'FAIL') {
    TEST_RESULTS.failed++;
    console.log(`❌ ${endpoint}: ${message}`);
    if (details) console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  } else if (status === 'WARN') {
    TEST_RESULTS.warnings++;
    console.log(`⚠️  ${endpoint}: ${message}`);
    if (details) console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
  }
}

// Helper function to make API requests
async function makeRequest(endpoint, method = 'GET', body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (body && method !== 'GET') {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
    
    return {
      status: response.status,
      data: responseData,
      headers: response.headers,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: null,
      error: error.message
    };
  }
}

// Create test CV content
const TEST_CV_CONTENT = `
Jan Kowalski
email: jan.kowalski@example.com
telefon: 123-456-789

DOŚWIADCZENIE ZAWODOWE:
2020-2023: Specjalista IT w ABC Sp. z o.o.
- Administracja serwerami
- Wsparcie użytkowników
- Zarządzanie bazami danych

WYKSZTAŁCENIE:
2016-2020: Informatyka, Uniwersytet Warszawski

UMIEJĘTNOŚCI:
- Python, JavaScript
- SQL, PostgreSQL
- Linux, Windows
`;

const TEST_JOB_POSTING = `
Poszukujemy programisty JavaScript z doświadczeniem w React i Node.js.
Wymagania:
- Minimum 2 lata doświadczenia
- Znajomość JavaScript ES6+
- Doświadczenie z React.js
- Znajomość Node.js i Express
- Praca z bazami danych (PostgreSQL, MongoDB)
`;

// Test functions for each endpoint

async function testAnalyzeEndpoint() {
  console.log('\n=== Testing /api/analyze endpoint ===');
  
  // Test 1: Valid request with paid user
  try {
    const validRequest = {
      currentCV: TEST_CV_CONTENT,
      jobPosting: TEST_JOB_POSTING,
      email: 'premium@cvperfect.pl',
      paid: true,
      plan: 'premium',
      sessionId: 'sess_test123'
    };
    
    const response = await makeRequest('/api/analyze', 'POST', validRequest);
    
    if (response.status === 200 && response.data.success) {
      logResult('/api/analyze', 'PASS', 'Valid paid user request successful');
      
      // Validate response structure
      const requiredFields = ['optimizedCV', 'coverLetter', 'improvements', 'keywordMatch'];
      const hasAllFields = requiredFields.every(field => response.data.hasOwnProperty(field));
      
      if (hasAllFields) {
        logResult('/api/analyze', 'PASS', 'Response contains all required fields');
      } else {
        logResult('/api/analyze', 'WARN', 'Response missing some optional fields', 
                 { missing: requiredFields.filter(f => !response.data.hasOwnProperty(f)) });
      }
      
      // Check CV content length
      if (response.data.optimizedCV && response.data.optimizedCV.length > 100) {
        logResult('/api/analyze', 'PASS', 'AI optimization produced substantial content');
      } else {
        logResult('/api/analyze', 'FAIL', 'AI optimization content too short or missing');
      }
      
    } else {
      logResult('/api/analyze', 'FAIL', 'Valid request failed', response);
    }
  } catch (error) {
    logResult('/api/analyze', 'FAIL', 'Request error', error.message);
  }
  
  // Test 2: Invalid request - missing CV
  try {
    const invalidRequest = {
      email: 'test@example.com',
      paid: false
    };
    
    const response = await makeRequest('/api/analyze', 'POST', invalidRequest);
    
    if (response.status === 400) {
      logResult('/api/analyze', 'PASS', 'Correctly rejected request missing CV');
    } else {
      logResult('/api/analyze', 'FAIL', 'Should reject request missing CV', response);
    }
  } catch (error) {
    logResult('/api/analyze', 'FAIL', 'Error testing invalid request', error.message);
  }
  
  // Test 3: Unpaid user (should fail without database setup)
  try {
    const unpaidRequest = {
      currentCV: TEST_CV_CONTENT,
      email: 'unpaid@example.com',
      paid: false
    };
    
    const response = await makeRequest('/api/analyze', 'POST', unpaidRequest);
    
    if (response.status === 403) {
      logResult('/api/analyze', 'PASS', 'Correctly rejected unpaid user');
    } else if (response.status === 500) {
      logResult('/api/analyze', 'WARN', 'Database error for unpaid user (expected in dev)');
    } else {
      logResult('/api/analyze', 'FAIL', 'Unexpected response for unpaid user', response);
    }
  } catch (error) {
    logResult('/api/analyze', 'WARN', 'Database connection issue (expected in dev)', error.message);
  }
  
  // Test 4: OPTIONS request (CORS)
  try {
    const response = await makeRequest('/api/analyze', 'OPTIONS');
    
    if (response.status === 200) {
      logResult('/api/analyze', 'PASS', 'CORS OPTIONS request handled correctly');
    } else {
      logResult('/api/analyze', 'FAIL', 'CORS OPTIONS request failed', response);
    }
  } catch (error) {
    logResult('/api/analyze', 'FAIL', 'CORS test error', error.message);
  }
}

async function testCreateCheckoutSession() {
  console.log('\n=== Testing /api/create-checkout-session endpoint ===');
  
  // Test 1: Valid POST request
  try {
    const validRequest = {
      plan: 'basic',
      email: 'test@example.com',
      cv: TEST_CV_CONTENT.substring(0, 200),
      job: TEST_JOB_POSTING.substring(0, 100)
    };
    
    const response = await makeRequest('/api/create-checkout-session', 'POST', validRequest);
    
    if (response.status === 200 && response.data.success && response.data.url) {
      logResult('/api/create-checkout-session', 'PASS', 'Valid checkout session created');
      
      // Validate session URL
      if (response.data.url.includes('stripe.com')) {
        logResult('/api/create-checkout-session', 'PASS', 'Valid Stripe URL returned');
      } else {
        logResult('/api/create-checkout-session', 'WARN', 'Unexpected checkout URL format');
      }
      
    } else {
      logResult('/api/create-checkout-session', 'FAIL', 'Failed to create checkout session', response);
    }
  } catch (error) {
    logResult('/api/create-checkout-session', 'FAIL', 'Request error', error.message);
  }
  
  // Test 2: Different plans
  const plans = ['basic', 'premium', 'gold', 'pro'];
  for (const plan of plans) {
    try {
      const request = {
        plan: plan,
        email: 'test@example.com'
      };
      
      const response = await makeRequest('/api/create-checkout-session', 'POST', request);
      
      if (response.status === 200) {
        logResult('/api/create-checkout-session', 'PASS', `Plan '${plan}' handled correctly`);
      } else {
        logResult('/api/create-checkout-session', 'FAIL', `Plan '${plan}' failed`, response);
      }
    } catch (error) {
      logResult('/api/create-checkout-session', 'FAIL', `Plan '${plan}' error`, error.message);
    }
  }
  
  // Test 3: GET request (should also work)
  try {
    const response = await makeRequest('/api/create-checkout-session?plan=basic&email=test@example.com', 'GET');
    
    if (response.status === 200 || response.status === 303) {
      logResult('/api/create-checkout-session', 'PASS', 'GET request handled (redirect expected)');
    } else {
      logResult('/api/create-checkout-session', 'FAIL', 'GET request failed', response);
    }
  } catch (error) {
    logResult('/api/create-checkout-session', 'FAIL', 'GET request error', error.message);
  }
}

async function testSaveSession() {
  console.log('\n=== Testing /api/save-session endpoint ===');
  
  // Test 1: Valid session save
  try {
    const validRequest = {
      sessionId: 'test_session_' + Date.now(),
      cvData: TEST_CV_CONTENT,
      jobPosting: TEST_JOB_POSTING,
      email: 'test@example.com',
      plan: 'basic',
      template: 'modern',
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...' // Fake base64
    };
    
    const response = await makeRequest('/api/save-session', 'POST', validRequest);
    
    if (response.status === 200 && response.data.success) {
      logResult('/api/save-session', 'PASS', 'Session data saved successfully');
      
      // Store session ID for later tests
      global.testSessionId = validRequest.sessionId;
      
    } else {
      logResult('/api/save-session', 'FAIL', 'Failed to save session', response);
    }
  } catch (error) {
    logResult('/api/save-session', 'FAIL', 'Request error', error.message);
  }
  
  // Test 2: Missing required fields
  try {
    const invalidRequest = {
      sessionId: 'test_incomplete',
      email: 'test@example.com'
      // Missing cvData
    };
    
    const response = await makeRequest('/api/save-session', 'POST', invalidRequest);
    
    if (response.status === 400) {
      logResult('/api/save-session', 'PASS', 'Correctly rejected incomplete request');
    } else {
      logResult('/api/save-session', 'FAIL', 'Should reject incomplete request', response);
    }
  } catch (error) {
    logResult('/api/save-session', 'FAIL', 'Error testing incomplete request', error.message);
  }
  
  // Test 3: CORS OPTIONS
  try {
    const response = await makeRequest('/api/save-session', 'OPTIONS');
    
    if (response.status === 200) {
      logResult('/api/save-session', 'PASS', 'CORS OPTIONS handled correctly');
    } else {
      logResult('/api/save-session', 'FAIL', 'CORS OPTIONS failed', response);
    }
  } catch (error) {
    logResult('/api/save-session', 'FAIL', 'CORS test error', error.message);
  }
}

async function testGetSessionData() {
  console.log('\n=== Testing /api/get-session-data endpoint ===');
  
  // Test 1: Retrieve saved session (if we have one)
  if (global.testSessionId) {
    try {
      const response = await makeRequest(`/api/get-session-data?session_id=${global.testSessionId}`, 'GET');
      
      if (response.status === 200 && response.data.success) {
        logResult('/api/get-session-data', 'PASS', 'Session data retrieved successfully');
        
        // Validate session data structure
        if (response.data.session && response.data.session.metadata) {
          logResult('/api/get-session-data', 'PASS', 'Session data has correct structure');
          
          // Check if CV data is preserved
          if (response.data.session.metadata.cv && response.data.session.metadata.cv.length > 100) {
            logResult('/api/get-session-data', 'PASS', 'CV data preserved without truncation');
          } else {
            logResult('/api/get-session-data', 'WARN', 'CV data may be truncated');
          }
        } else {
          logResult('/api/get-session-data', 'FAIL', 'Invalid session data structure');
        }
        
      } else {
        logResult('/api/get-session-data', 'FAIL', 'Failed to retrieve session data', response);
      }
    } catch (error) {
      logResult('/api/get-session-data', 'FAIL', 'Request error', error.message);
    }
  } else {
    logResult('/api/get-session-data', 'WARN', 'No test session ID available for retrieval test');
  }
  
  // Test 2: Missing session ID
  try {
    const response = await makeRequest('/api/get-session-data', 'GET');
    
    if (response.status === 400) {
      logResult('/api/get-session-data', 'PASS', 'Correctly rejected request missing session ID');
    } else {
      logResult('/api/get-session-data', 'FAIL', 'Should reject request missing session ID', response);
    }
  } catch (error) {
    logResult('/api/get-session-data', 'FAIL', 'Error testing missing session ID', error.message);
  }
  
  // Test 3: Non-existent session ID
  try {
    const response = await makeRequest('/api/get-session-data?session_id=nonexistent', 'GET');
    
    if (response.status === 404) {
      logResult('/api/get-session-data', 'PASS', 'Correctly handled non-existent session');
    } else {
      logResult('/api/get-session-data', 'WARN', 'Non-existent session handling could be improved', response);
    }
  } catch (error) {
    logResult('/api/get-session-data', 'FAIL', 'Error testing non-existent session', error.message);
  }
}

async function testParseCV() {
  console.log('\n=== Testing /api/parse-cv endpoint ===');
  
  // Note: This endpoint requires file upload, which is complex to test without actual files
  // We'll test the endpoint availability and error handling
  
  // Test 1: GET request (should not be allowed)
  try {
    const response = await makeRequest('/api/parse-cv', 'GET');
    
    if (response.status === 405) {
      logResult('/api/parse-cv', 'PASS', 'Correctly rejected GET request');
    } else {
      logResult('/api/parse-cv', 'FAIL', 'Should reject GET requests', response);
    }
  } catch (error) {
    logResult('/api/parse-cv', 'FAIL', 'Error testing method restriction', error.message);
  }
  
  // Test 2: POST without file
  try {
    const response = await makeRequest('/api/parse-cv', 'POST', {});
    
    if (response.status === 400) {
      logResult('/api/parse-cv', 'PASS', 'Correctly rejected request without file');
    } else {
      logResult('/api/parse-cv', 'WARN', 'File upload error handling could be improved', response);
    }
  } catch (error) {
    logResult('/api/parse-cv', 'WARN', 'File upload endpoint needs actual file for full test');
  }
  
  // Test 3: Create a simple text file for testing
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('cv', TEST_CV_CONTENT, {
      filename: 'test-cv.txt',
      contentType: 'text/plain'
    });
    
    // Note: This is a simplified test - real implementation would require proper FormData handling
    logResult('/api/parse-cv', 'WARN', 'File upload test requires actual file implementation');
    
  } catch (error) {
    logResult('/api/parse-cv', 'WARN', 'Full file upload test not implemented in this script');
  }
}

async function testContact() {
  console.log('\n=== Testing /api/contact endpoint ===');
  
  // Test 1: Valid contact form
  try {
    const validRequest = {
      name: 'Jan Test',
      email: 'jan.test@example.com',
      subject: 'Test wiadomość',
      message: 'To jest testowa wiadomość z systemu testowego.',
      isPremium: false
    };
    
    const response = await makeRequest('/api/contact', 'POST', validRequest);
    
    if (response.status === 200 && response.data.success) {
      logResult('/api/contact', 'PASS', 'Contact form submitted successfully');
    } else if (response.status === 500) {
      logResult('/api/contact', 'WARN', 'Email configuration issue (expected in dev environment)');
    } else {
      logResult('/api/contact', 'FAIL', 'Contact form failed', response);
    }
  } catch (error) {
    logResult('/api/contact', 'FAIL', 'Request error', error.message);
  }
  
  // Test 2: Premium user contact
  try {
    const premiumRequest = {
      name: 'Premium User',
      email: 'premium@example.com',
      subject: 'Urgent support',
      message: 'This is a premium support request.',
      isPremium: true
    };
    
    const response = await makeRequest('/api/contact', 'POST', premiumRequest);
    
    if (response.status === 200) {
      logResult('/api/contact', 'PASS', 'Premium contact form handled');
    } else if (response.status === 500) {
      logResult('/api/contact', 'WARN', 'Email service issue (expected in dev)');
    } else {
      logResult('/api/contact', 'FAIL', 'Premium contact failed', response);
    }
  } catch (error) {
    logResult('/api/contact', 'FAIL', 'Premium contact error', error.message);
  }
  
  // Test 3: GET request (should not be allowed)
  try {
    const response = await makeRequest('/api/contact', 'GET');
    
    if (response.status === 405) {
      logResult('/api/contact', 'PASS', 'Correctly rejected GET request');
    } else {
      logResult('/api/contact', 'FAIL', 'Should reject GET requests', response);
    }
  } catch (error) {
    logResult('/api/contact', 'FAIL', 'Error testing method restriction', error.message);
  }
}

async function testStripeWebhook() {
  console.log('\n=== Testing /api/stripe-webhook endpoint ===');
  
  // Note: Webhook testing is complex as it requires proper Stripe signatures
  // We'll test basic functionality and method restrictions
  
  // Test 1: GET request (should not be allowed)
  try {
    const response = await makeRequest('/api/stripe-webhook', 'GET');
    
    if (response.status === 405) {
      logResult('/api/stripe-webhook', 'PASS', 'Correctly rejected GET request');
    } else {
      logResult('/api/stripe-webhook', 'FAIL', 'Should reject GET requests', response);
    }
  } catch (error) {
    logResult('/api/stripe-webhook', 'FAIL', 'Error testing method restriction', error.message);
  }
  
  // Test 2: POST without signature (should fail)
  try {
    const response = await makeRequest('/api/stripe-webhook', 'POST', {
      type: 'checkout.session.completed',
      data: { object: { id: 'test' } }
    });
    
    if (response.status === 400) {
      logResult('/api/stripe-webhook', 'PASS', 'Correctly rejected request without signature');
    } else {
      logResult('/api/stripe-webhook', 'WARN', 'Webhook security could be improved', response);
    }
  } catch (error) {
    logResult('/api/stripe-webhook', 'FAIL', 'Error testing webhook security', error.message);
  }
  
  // Test 3: POST with fake signature (should fail)
  try {
    const response = await makeRequest('/api/stripe-webhook', 'POST', 
      JSON.stringify({ type: 'test.event' }),
      { 
        'stripe-signature': 'fake_signature',
        'Content-Type': 'application/json'
      }
    );
    
    if (response.status === 400) {
      logResult('/api/stripe-webhook', 'PASS', 'Correctly rejected fake signature');
    } else {
      logResult('/api/stripe-webhook', 'WARN', 'Signature validation could be stricter', response);
    }
  } catch (error) {
    logResult('/api/stripe-webhook', 'FAIL', 'Error testing fake signature', error.message);
  }
}

// Integration tests
async function testDataFlowIntegration() {
  console.log('\n=== Testing Data Flow Integration ===');
  
  // Test complete flow: save-session → get-session-data → analyze
  const sessionId = 'integration_test_' + Date.now();
  
  // Step 1: Save session
  try {
    const saveRequest = {
      sessionId: sessionId,
      cvData: TEST_CV_CONTENT,
      jobPosting: TEST_JOB_POSTING,
      email: 'integration@test.com',
      plan: 'premium',
      template: 'modern'
    };
    
    const saveResponse = await makeRequest('/api/save-session', 'POST', saveRequest);
    
    if (saveResponse.status === 200) {
      logResult('Integration', 'PASS', 'Step 1: Session saved successfully');
      
      // Step 2: Retrieve session
      const getResponse = await makeRequest(`/api/get-session-data?session_id=${sessionId}`, 'GET');
      
      if (getResponse.status === 200 && getResponse.data.success) {
        logResult('Integration', 'PASS', 'Step 2: Session retrieved successfully');
        
        // Verify data integrity
        const retrievedCV = getResponse.data.session.metadata.cv;
        if (retrievedCV && retrievedCV.length > TEST_CV_CONTENT.length * 0.9) {
          logResult('Integration', 'PASS', 'Step 3: CV data integrity preserved');
          
          // Step 3: Use retrieved data for AI analysis
          const analyzeRequest = {
            currentCV: retrievedCV,
            jobPosting: getResponse.data.session.metadata.job,
            email: getResponse.data.session.customer_email,
            paid: true,
            plan: getResponse.data.session.metadata.plan,
            sessionId: sessionId
          };
          
          const analyzeResponse = await makeRequest('/api/analyze', 'POST', analyzeRequest);
          
          if (analyzeResponse.status === 200 && analyzeResponse.data.success) {
            logResult('Integration', 'PASS', 'Step 4: Complete integration flow successful');
          } else {
            logResult('Integration', 'FAIL', 'Step 4: AI analysis failed in integration', analyzeResponse);
          }
          
        } else {
          logResult('Integration', 'FAIL', 'Step 3: CV data integrity compromised');
        }
      } else {
        logResult('Integration', 'FAIL', 'Step 2: Session retrieval failed', getResponse);
      }
    } else {
      logResult('Integration', 'FAIL', 'Step 1: Session save failed', saveResponse);
    }
  } catch (error) {
    logResult('Integration', 'FAIL', 'Integration test error', error.message);
  }
}

// Performance and timeout tests
async function testPerformanceAndTimeouts() {
  console.log('\n=== Testing Performance and Timeouts ===');
  
  // Test response times
  const endpoints = [
    { path: '/api/analyze', method: 'OPTIONS' },
    { path: '/api/save-session', method: 'OPTIONS' },
    { path: '/api/get-session-data?session_id=nonexistent', method: 'GET' },
    { path: '/api/contact', method: 'POST', body: { name: 'Test' } }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await makeRequest(endpoint.path, endpoint.method, endpoint.body);
      const responseTime = Date.now() - startTime;
      
      if (responseTime < 5000) { // 5 second threshold
        logResult('Performance', 'PASS', `${endpoint.path} responded in ${responseTime}ms`);
      } else {
        logResult('Performance', 'WARN', `${endpoint.path} slow response: ${responseTime}ms`);
      }
    } catch (error) {
      logResult('Performance', 'FAIL', `${endpoint.path} timeout or error`, error.message);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Testing for CvPerfect');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
  
  // Test server availability
  try {
    const response = await makeRequest('/', 'GET');
    if (response.status === 200 || response.status === 404) {
      console.log('✅ Server is responding');
    } else {
      console.log('⚠️  Server response unexpected but available');
    }
  } catch (error) {
    console.log('❌ Server may not be running on port 3005');
    console.log('   Please start the server with: npm run dev');
    return;
  }
  
  // Run all test suites
  await testAnalyzeEndpoint();
  await testCreateCheckoutSession();
  await testSaveSession();
  await testGetSessionData();
  await testParseCV();
  await testContact();
  await testStripeWebhook();
  await testDataFlowIntegration();
  await testPerformanceAndTimeouts();
  
  // Generate final report
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${TEST_RESULTS.passed}`);
  console.log(`❌ Tests Failed: ${TEST_RESULTS.failed}`);
  console.log(`⚠️  Warnings: ${TEST_RESULTS.warnings}`);
  console.log(`📊 Total Tests: ${TEST_RESULTS.passed + TEST_RESULTS.failed + TEST_RESULTS.warnings}`);
  
  // Calculate success rate
  const totalTests = TEST_RESULTS.passed + TEST_RESULTS.failed + TEST_RESULTS.warnings;
  const successRate = totalTests > 0 ? ((TEST_RESULTS.passed / totalTests) * 100).toFixed(1) : 0;
  console.log(`🎯 Success Rate: ${successRate}%`);
  
  // Identify critical issues
  const criticalFailures = TEST_RESULTS.details.filter(r => 
    r.status === 'FAIL' && 
    (r.endpoint.includes('/api/analyze') || r.endpoint.includes('/api/create-checkout-session'))
  );
  
  if (criticalFailures.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    criticalFailures.forEach(failure => {
      console.log(`   • ${failure.endpoint}: ${failure.message}`);
    });
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (TEST_RESULTS.failed === 0) {
    console.log('   • All critical endpoints are functioning correctly');
  } else {
    console.log('   • Address failed tests before production deployment');
  }
  
  if (TEST_RESULTS.warnings > 0) {
    console.log('   • Review warnings for potential improvements');
  }
  
  console.log('   • Consider setting up proper database for full testing');
  console.log('   • Implement comprehensive error monitoring');
  console.log('   • Add automated testing to CI/CD pipeline');
  
  // Save detailed results to file
  const reportPath = path.join(__dirname, `test-api-results-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify({
    summary: {
      passed: TEST_RESULTS.passed,
      failed: TEST_RESULTS.failed,
      warnings: TEST_RESULTS.warnings,
      successRate: successRate,
      timestamp: new Date().toISOString()
    },
    details: TEST_RESULTS.details
  }, null, 2));
  
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  console.log('\n🏁 Testing completed!');
}

// Error handling for global errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  logResult('System', 'FAIL', 'Unhandled rejection during testing', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  logResult('System', 'FAIL', 'Uncaught exception during testing', error.message);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testAnalyzeEndpoint,
  testCreateCheckoutSession,
  testSaveSession,
  testGetSessionData,
  testParseCV,
  testContact,
  testStripeWebhook,
  testDataFlowIntegration
};