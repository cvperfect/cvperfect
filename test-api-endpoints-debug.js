#!/usr/bin/env node

/**
 * Test script to debug API endpoints returning HTML instead of JSON
 * Tests each endpoint individually to identify issues
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001'; // Adjust port as needed
const TEST_SESSION_ID = 'sess_test_123456789';

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
 * Make HTTP request and return detailed response info
 */
function makeRequest(options, postData = null) {
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
 * Test /api/save-session endpoint
 */
async function testSaveSession() {
  log('cyan', '\n🔍 Testing /api/save-session');
  
  const testData = {
    sessionId: TEST_SESSION_ID,
    cvData: 'Test CV content for debugging purposes',
    email: 'test@example.com',
    plan: 'basic',
    template: 'simple'
  };
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/save-session',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  try {
    const response = await makeRequest(options, JSON.stringify(testData));
    
    log('blue', `Status: ${response.statusCode}`);
    log('blue', `Content-Type: ${response.contentType}`);
    
    if (response.contentType.includes('application/json')) {
      log('green', '✅ Returned JSON');
      try {
        const parsed = JSON.parse(response.body);
        log('green', 'JSON Content:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        log('red', '❌ Invalid JSON despite content-type');
        log('yellow', 'Response body (first 500 chars):', response.body.substring(0, 500));
      }
    } else {
      log('red', '❌ Returned HTML/other instead of JSON');
      log('yellow', 'Response body (first 500 chars):', response.body.substring(0, 500));
    }
  } catch (error) {
    log('red', '❌ Request failed:', error.message);
  }
}

/**
 * Test /api/get-session-data endpoint
 */
async function testGetSessionData() {
  log('cyan', '\n🔍 Testing /api/get-session-data');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: `/api/get-session-data?session_id=${TEST_SESSION_ID}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  try {
    const response = await makeRequest(options);
    
    log('blue', `Status: ${response.statusCode}`);
    log('blue', `Content-Type: ${response.contentType}`);
    
    if (response.contentType.includes('application/json')) {
      log('green', '✅ Returned JSON');
      try {
        const parsed = JSON.parse(response.body);
        log('green', 'JSON Content:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        log('red', '❌ Invalid JSON despite content-type');
        log('yellow', 'Response body (first 500 chars):', response.body.substring(0, 500));
      }
    } else {
      log('red', '❌ Returned HTML/other instead of JSON');
      log('yellow', 'Response body (first 500 chars):', response.body.substring(0, 500));
    }
  } catch (error) {
    log('red', '❌ Request failed:', error.message);
  }
}

/**
 * Test /api/parse-cv endpoint
 */
async function testParseCV() {
  log('cyan', '\n🔍 Testing /api/parse-cv');
  
  // Create a simple text file to upload
  const testContent = 'Test CV\nName: John Doe\nEmail: john@example.com\nExperience: 5 years';
  const boundary = '----WebKitFormBoundary' + Math.random().toString(16);
  
  const formData = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="cv"; filename="test-cv.txt"',
    'Content-Type: text/plain',
    '',
    testContent,
    `--${boundary}--`,
    ''
  ].join('\r\n');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/parse-cv',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(formData)
    }
  };
  
  try {
    const response = await makeRequest(options, formData);
    
    log('blue', `Status: ${response.statusCode}`);
    log('blue', `Content-Type: ${response.contentType}`);
    
    if (response.contentType.includes('application/json')) {
      log('green', '✅ Returned JSON');
      try {
        const parsed = JSON.parse(response.body);
        log('green', 'JSON Content:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        log('red', '❌ Invalid JSON despite content-type');
        log('yellow', 'Response body (first 500 chars):', response.body.substring(0, 500));
      }
    } else {
      log('red', '❌ Returned HTML/other instead of JSON');
      log('yellow', 'Response body (first 500 chars):', response.body.substring(0, 500));
    }
  } catch (error) {
    log('red', '❌ Request failed:', error.message);
  }
}

/**
 * Test /api/analyze endpoint
 */
async function testAnalyze() {
  log('cyan', '\n🔍 Testing /api/analyze');
  
  const testData = {
    currentCV: 'Test CV content for analysis',
    email: 'test@example.com',
    paid: true,
    plan: 'basic'
  };
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/analyze',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  try {
    const response = await makeRequest(options, JSON.stringify(testData));
    
    log('blue', `Status: ${response.statusCode}`);
    log('blue', `Content-Type: ${response.contentType}`);
    
    if (response.contentType.includes('application/json')) {
      log('green', '✅ Returned JSON');
      try {
        const parsed = JSON.parse(response.body);
        log('green', 'JSON Content:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        log('red', '❌ Invalid JSON despite content-type');
        log('yellow', 'Response body (first 500 chars):', response.body.substring(0, 500));
      }
    } else {
      log('red', '❌ Returned HTML/other instead of JSON');
      log('yellow', 'Response body (first 500 chars):', response.body.substring(0, 500));
    }
  } catch (error) {
    log('red', '❌ Request failed:', error.message);
  }
}

/**
 * Check if server is running
 */
async function checkServer() {
  log('cyan', '\n🔍 Checking if server is running on localhost:3001');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET',
    timeout: 5000
  };
  
  try {
    const response = await makeRequest(options);
    log('green', '✅ Server is running');
    log('blue', `Status: ${response.statusCode}`);
    return true;
  } catch (error) {
    log('red', '❌ Server is not running or not accessible:', error.message);
    log('yellow', '💡 Make sure to start the server first: npm run dev');
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log('magenta', '='.repeat(60));
  log('magenta', '🧪 API ENDPOINTS DEBUG TESTING');
  log('magenta', '='.repeat(60));
  
  // Check if server is running first
  const serverRunning = await checkServer();
  if (!serverRunning) {
    log('red', '\n❌ Cannot run tests - server is not accessible');
    process.exit(1);
  }
  
  // Run individual endpoint tests
  await testSaveSession();
  await testGetSessionData();
  await testParseCV();
  await testAnalyze();
  
  log('magenta', '\n='.repeat(60));
  log('magenta', '✅ API ENDPOINTS TESTING COMPLETED');
  log('magenta', '='.repeat(60));
  
  log('yellow', '\n💡 If you see HTML responses instead of JSON:');
  log('yellow', '   1. Check the server logs for error details');
  log('yellow', '   2. Verify environment variables are set');
  log('yellow', '   3. Check for missing imports or syntax errors');
  log('yellow', '   4. Look for unhandled exceptions in catch blocks');
}

// Run the tests
runTests().catch(console.error);