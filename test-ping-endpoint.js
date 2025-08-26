#!/usr/bin/env node

/**
 * Test script for /api/ping endpoint
 * Tests GET request functionality and method validation
 */

const http = require('http');

// Configuration
const BASE_URL = 'localhost';
const PORT = 3000;
const ENDPOINT = '/api/ping';

/**
 * Make HTTP request
 */
function makeRequest(method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: ENDPOINT,
      method: method,
      headers: {
        'User-Agent': 'CVPerfect-Test/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🏓 Running ping endpoint tests...\n');
  
  const tests = [
    {
      name: 'GET /api/ping should return pong:true',
      test: async () => {
        const response = await makeRequest('GET');
        
        if (response.statusCode !== 200) {
          throw new Error(`Expected 200, got ${response.statusCode}`);
        }
        
        if (!response.data || response.data.pong !== true) {
          throw new Error(`Expected {pong: true}, got ${JSON.stringify(response.data)}`);
        }
        
        return '✅ Returns correct pong response';
      }
    },
    
    {
      name: 'POST /api/ping should return 405 Method Not Allowed',
      test: async () => {
        const response = await makeRequest('POST');
        
        if (response.statusCode !== 405) {
          throw new Error(`Expected 405, got ${response.statusCode}`);
        }
        
        if (!response.data || !response.data.error) {
          throw new Error(`Expected error message, got ${JSON.stringify(response.data)}`);
        }
        
        return '✅ Correctly rejects non-GET methods';
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.test();
      console.log(`✅ ${test.name}: ${result}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the endpoint implementation.');
    process.exit(1);
  } else {
    console.log('\n🎉 All ping endpoint tests passed!');
    process.exit(0);
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  });
}