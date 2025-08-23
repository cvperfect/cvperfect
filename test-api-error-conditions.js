#!/usr/bin/env node

/**
 * Test script to reproduce API error conditions that cause 500 responses
 * Tests edge cases and error scenarios
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

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
 * Test /api/save-session with missing required fields
 */
async function testSaveSessionErrors() {
  log('cyan', '\n🔍 Testing /api/save-session error conditions');
  
  const testCases = [
    {
      name: 'Missing sessionId',
      data: { cvData: 'test', email: 'test@example.com' }
    },
    {
      name: 'Missing cvData', 
      data: { sessionId: 'sess_123', email: 'test@example.com' }
    },
    {
      name: 'Missing email',
      data: { sessionId: 'sess_123', cvData: 'test' }
    },
    {
      name: 'Invalid JSON',
      data: '{ invalid json }'
    },
    {
      name: 'Empty request body',
      data: ''
    },
    {
      name: 'Very large cvData (might cause memory issues)',
      data: { 
        sessionId: 'sess_123',
        email: 'test@example.com',
        cvData: 'A'.repeat(10000000) // 10MB string
      }
    }
  ];
  
  for (const testCase of testCases) {
    log('yellow', `\n  Testing: ${testCase.name}`);
    
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
      const postData = typeof testCase.data === 'string' ? testCase.data : JSON.stringify(testCase.data);
      const response = await makeRequest(options, postData);
      
      log('blue', `    Status: ${response.statusCode}`);
      log('blue', `    Content-Type: ${response.contentType}`);
      
      if (response.statusCode >= 500) {
        log('red', '    ❌ 500 ERROR DETECTED!');
        if (response.contentType.includes('text/html')) {
          log('red', '    ❌ Returning HTML instead of JSON!');
          log('yellow', `    HTML Response (first 200 chars): ${response.body.substring(0, 200)}`);
        } else {
          log('green', '    ✅ Still returning JSON on error');
        }
      }
      
    } catch (error) {
      log('red', '    ❌ Request failed:', error.message);
    }
  }
}

/**
 * Test /api/get-session-data with various session IDs
 */
async function testGetSessionDataErrors() {
  log('cyan', '\n🔍 Testing /api/get-session-data error conditions');
  
  const testCases = [
    {
      name: 'Missing session_id parameter',
      sessionId: ''
    },
    {
      name: 'Invalid session ID format',
      sessionId: 'invalid-session'
    },
    {
      name: 'Non-existent session ID',
      sessionId: 'sess_nonexistent_123456789'
    },
    {
      name: 'SQL injection attempt',
      sessionId: 'sess_123\'; DROP TABLE sessions; --'
    }
  ];
  
  for (const testCase of testCases) {
    log('yellow', `\n  Testing: ${testCase.name}`);
    
    const queryString = testCase.sessionId ? `?session_id=${encodeURIComponent(testCase.sessionId)}` : '';
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/get-session-data${queryString}`,
      method: 'GET'
    };
    
    try {
      const response = await makeRequest(options);
      
      log('blue', `    Status: ${response.statusCode}`);
      log('blue', `    Content-Type: ${response.contentType}`);
      
      if (response.statusCode >= 500) {
        log('red', '    ❌ 500 ERROR DETECTED!');
        if (response.contentType.includes('text/html')) {
          log('red', '    ❌ Returning HTML instead of JSON!');
          log('yellow', `    HTML Response (first 200 chars): ${response.body.substring(0, 200)}`);
        }
      }
      
    } catch (error) {
      log('red', '    ❌ Request failed:', error.message);
    }
  }
}

/**
 * Test /api/analyze with various error conditions
 */
async function testAnalyzeErrors() {
  log('cyan', '\n🔍 Testing /api/analyze error conditions');
  
  const testCases = [
    {
      name: 'Missing environment variables (simulate)',
      data: { currentCV: 'test', email: 'noauth@example.com' }
    },
    {
      name: 'Invalid email format',
      data: { currentCV: 'test', email: 'invalid-email' }
    },
    {
      name: 'Missing currentCV',
      data: { email: 'test@example.com' }
    },
    {
      name: 'Unauthorized user',
      data: { currentCV: 'test', email: 'unauthorized@example.com', paid: false }
    }
  ];
  
  for (const testCase of testCases) {
    log('yellow', `\n  Testing: ${testCase.name}`);
    
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
      const response = await makeRequest(options, JSON.stringify(testCase.data));
      
      log('blue', `    Status: ${response.statusCode}`);
      log('blue', `    Content-Type: ${response.contentType}`);
      
      if (response.statusCode >= 500) {
        log('red', '    ❌ 500 ERROR DETECTED!');
        if (response.contentType.includes('text/html')) {
          log('red', '    ❌ Returning HTML instead of JSON!');
          log('yellow', `    HTML Response (first 200 chars): ${response.body.substring(0, 200)}`);
        }
      }
      
    } catch (error) {
      log('red', '    ❌ Request failed:', error.message);
    }
  }
}

/**
 * Test /api/parse-cv with invalid files
 */
async function testParseCVErrors() {
  log('cyan', '\n🔍 Testing /api/parse-cv error conditions');
  
  const testCases = [
    {
      name: 'Missing file',
      filename: null,
      content: null
    },
    {
      name: 'Invalid file format',
      filename: 'test.exe',
      content: 'This is not a CV file',
      mimeType: 'application/x-msdownload'
    },
    {
      name: 'Corrupted PDF simulation',
      filename: 'corrupt.pdf',
      content: '%PDF-1.4 corrupted content',
      mimeType: 'application/pdf'
    },
    {
      name: 'Empty file',
      filename: 'empty.txt',
      content: '',
      mimeType: 'text/plain'
    }
  ];
  
  for (const testCase of testCases) {
    log('yellow', `\n  Testing: ${testCase.name}`);
    
    if (testCase.filename === null) {
      // Test with no file uploaded
      const boundary = '----WebKitFormBoundary' + Math.random().toString(16);
      const formData = `--${boundary}--\r\n`;
      
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
        
        log('blue', `    Status: ${response.statusCode}`);
        log('blue', `    Content-Type: ${response.contentType}`);
        
        if (response.statusCode >= 500) {
          log('red', '    ❌ 500 ERROR DETECTED!');
          if (response.contentType.includes('text/html')) {
            log('red', '    ❌ Returning HTML instead of JSON!');
          }
        }
      } catch (error) {
        log('red', '    ❌ Request failed:', error.message);
      }
      
    } else {
      // Test with file upload
      const boundary = '----WebKitFormBoundary' + Math.random().toString(16);
      const formData = [
        `--${boundary}`,
        `Content-Disposition: form-data; name="cv"; filename="${testCase.filename}"`,
        `Content-Type: ${testCase.mimeType}`,
        '',
        testCase.content,
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
        
        log('blue', `    Status: ${response.statusCode}`);
        log('blue', `    Content-Type: ${response.contentType}`);
        
        if (response.statusCode >= 500) {
          log('red', '    ❌ 500 ERROR DETECTED!');
          if (response.contentType.includes('text/html')) {
            log('red', '    ❌ Returning HTML instead of JSON!');
            log('yellow', `    HTML Response (first 200 chars): ${response.body.substring(0, 200)}`);
          }
        }
      } catch (error) {
        log('red', '    ❌ Request failed:', error.message);
      }
    }
  }
}

/**
 * Main test runner for error conditions
 */
async function runErrorTests() {
  log('magenta', '='.repeat(60));
  log('magenta', '🧪 API ERROR CONDITIONS TESTING');
  log('magenta', '='.repeat(60));
  
  await testSaveSessionErrors();
  await testGetSessionDataErrors();
  await testAnalyzeErrors();
  await testParseCVErrors();
  
  log('magenta', '\n='.repeat(60));
  log('magenta', '✅ ERROR CONDITIONS TESTING COMPLETED');
  log('magenta', '='.repeat(60));
}

// Run the error tests
runErrorTests().catch(console.error);