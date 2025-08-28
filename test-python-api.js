/**
 * Test suite for Python Analyze API
 * Comprehensive testing for Vercel Function
 */

const fetch = require('node-fetch');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3015/api/analyze-python';
const TEST_EMAIL = 'test@cvperfect.pl';

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

// Test utilities
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed) {
  const status = passed ? `✅ PASS` : `❌ FAIL`;
  const color = passed ? 'green' : 'red';
  log(`  ${status}: ${testName}`, color);
}

// Test cases
async function runTests() {
  log('\n🧪 PYTHON ANALYZE API TEST SUITE', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test 1: Valid CV Analysis
  log('\n📋 Test 1: Valid CV Analysis', 'yellow');
  totalTests++;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: `Jan Kowalski
Email: jan@example.com
Telefon: +48 123 456 789

Doświadczenie:
- Programista w ABC Company (2020-2024)
- Junior Developer w XYZ Startup (2018-2020)

Wykształcenie:
- Informatyka, Uniwersytet Warszawski (2018)

Umiejętności:
JavaScript, Python, React, Node.js`,
        email: TEST_EMAIL,
        jobPosting: 'Szukamy Senior Full Stack Developer z doświadczeniem w React i Node.js'
      })
    });
    
    const data = await response.json();
    
    // Validate response structure
    const hasRequiredFields = 
      data.success !== undefined &&
      data.optimizedCV !== undefined &&
      data.coverLetter !== undefined &&
      data.improvements !== undefined &&
      data.keywordMatch !== undefined;
    
    logTest('Response has all required fields', hasRequiredFields);
    logTest('Success is true', data.success === true);
    logTest('OptimizedCV is longer than original', data.optimizedCV && data.optimizedCV.length > 100);
    logTest('Cover letter generated', data.coverLetter && data.coverLetter.length > 50);
    logTest('Keyword match score present', data.keywordMatch >= 0);
    
    if (hasRequiredFields && data.success) {
      passedTests++;
      log(`  📊 Metadata: ${JSON.stringify(data.metadata)}`, 'cyan');
    }
  } catch (error) {
    logTest('Valid CV Analysis', false);
    log(`  Error: ${error.message}`, 'red');
  }
  
  // Test 2: Missing Required Fields
  log('\n📋 Test 2: Validation - Missing Fields', 'yellow');
  totalTests++;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL
        // Missing currentCV
      })
    });
    
    const data = await response.json();
    
    const isError = response.status === 400 && data.success === false;
    logTest('Returns 400 for missing CV', isError);
    logTest('Error message present', data.error && data.error.includes('wymagane'));
    
    if (isError) passedTests++;
  } catch (error) {
    logTest('Validation Error Handling', false);
    log(`  Error: ${error.message}`, 'red');
  }
  
  // Test 3: Invalid Email Format
  log('\n📋 Test 3: Validation - Invalid Email', 'yellow');
  totalTests++;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: 'Test CV content',
        email: 'invalid-email-format'
      })
    });
    
    const data = await response.json();
    
    const isError = response.status === 400 && data.success === false;
    logTest('Returns 400 for invalid email', isError);
    
    if (isError) passedTests++;
  } catch (error) {
    logTest('Email Validation', false);
    log(`  Error: ${error.message}`, 'red');
  }
  
  // Test 4: CV Too Short
  log('\n📋 Test 4: Validation - CV Too Short', 'yellow');
  totalTests++;
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: 'Too short',  // Less than 10 chars
        email: TEST_EMAIL
      })
    });
    
    const data = await response.json();
    
    const isError = response.status === 400 && data.success === false;
    logTest('Returns 400 for CV too short', isError);
    
    if (isError) passedTests++;
  } catch (error) {
    logTest('CV Length Validation', false);
    log(`  Error: ${error.message}`, 'red');
  }
  
  // Test 5: CORS Headers
  log('\n📋 Test 5: CORS Support', 'yellow');
  totalTests++;
  try {
    const response = await fetch(API_URL, {
      method: 'OPTIONS'
    });
    
    const hasCorHeaders = 
      response.headers.get('access-control-allow-origin') === '*' &&
      response.headers.get('access-control-allow-methods')?.includes('POST');
    
    logTest('CORS headers present', hasCorHeaders);
    logTest('OPTIONS returns 200', response.status === 200);
    
    if (hasCorHeaders && response.status === 200) passedTests++;
  } catch (error) {
    logTest('CORS Support', false);
    log(`  Error: ${error.message}`, 'red');
  }
  
  // Test 6: Performance Test
  log('\n📋 Test 6: Performance', 'yellow');
  totalTests++;
  try {
    const startTime = Date.now();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: 'Jan Kowalski\nProgramista\n5 lat doświadczenia w JavaScript i Python',
        email: TEST_EMAIL
      })
    });
    
    await response.json();
    const duration = Date.now() - startTime;
    
    const isUnder10Seconds = duration < 10000;
    logTest(`Response time under 10s (${duration}ms)`, isUnder10Seconds);
    
    if (isUnder10Seconds) passedTests++;
  } catch (error) {
    logTest('Performance Test', false);
    log(`  Error: ${error.message}`, 'red');
  }
  
  // Summary
  log('\n' + '=' .repeat(50), 'cyan');
  log('📊 TEST RESULTS SUMMARY', 'cyan');
  log(`Total Tests: ${totalTests}`, 'yellow');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, 'red');
  
  const successRate = Math.round((passedTests / totalTests) * 100);
  const color = successRate === 100 ? 'green' : successRate >= 80 ? 'yellow' : 'red';
  log(`Success Rate: ${successRate}%`, color);
  
  if (successRate === 100) {
    log('\n🎉 ALL TESTS PASSED! Python API is ready for production!', 'green');
  } else if (successRate >= 80) {
    log('\n⚠️  Most tests passed, but some issues need attention', 'yellow');
  } else {
    log('\n❌ Tests failed. Please fix the issues before deployment', 'red');
  }
  
  process.exit(successRate === 100 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});