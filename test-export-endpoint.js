const http = require('http');

class ExportEndpointTester {
  constructor() {
    this.baseUrl = 'localhost';
    this.port = 3000;
    this.testResults = [];
  }

  async makeRequest(data) {
    const postData = JSON.stringify(data);
    const options = {
      hostname: this.baseUrl,
      port: this.port,
      path: '/api/export',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseData,
            parsed: responseData ? JSON.parse(responseData) : null
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  logTest(name, expectedStatus, actualStatus, details) {
    const passed = expectedStatus === actualStatus;
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}`);
    console.log(`   Expected: ${expectedStatus}, Got: ${actualStatus}`);
    console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    console.log('');
    
    this.testResults.push({ name, passed, expectedStatus, actualStatus });
    return passed;
  }

  async runAllTests() {
    console.log('🔐 CVPerfect Export Endpoint - Payment Gating Tests');
    console.log('=' .repeat(60));

    // Test 1: Block export without payment (402)
    console.log('### TEST 1: Block export without payment ###');
    try {
      const response1 = await this.makeRequest({
        format: 'pdf',
        paymentStatus: 'pending',
        plan: 'basic'
      });
      this.logTest('Block without payment', 402, response1.statusCode, response1.parsed);
    } catch (error) {
      console.log('❌ Test 1 failed:', error.message);
    }

    // Test 2: Allow export with premium + pdf (200)
    console.log('### TEST 2: Allow export with premium + pdf ###');
    try {
      const response2 = await this.makeRequest({
        format: 'pdf',
        paymentStatus: 'completed',
        plan: 'premium'
      });
      this.logTest('Allow premium PDF', 200, response2.statusCode, response2.parsed);
    } catch (error) {
      console.log('❌ Test 2 failed:', error.message);
    }

    // Test 3: Block HTML export for basic plan (403)
    console.log('### TEST 3: Block HTML export for basic plan ###');
    try {
      const response3 = await this.makeRequest({
        format: 'html',
        paymentStatus: 'completed',
        plan: 'basic'
      });
      this.logTest('Block HTML for basic', 403, response3.statusCode, response3.parsed);
    } catch (error) {
      console.log('❌ Test 3 failed:', error.message);
    }

    // Test 4: Allow HTML export for premium (200)
    console.log('### TEST 4: Allow HTML export for premium ###');
    try {
      const response4 = await this.makeRequest({
        format: 'html',
        paymentStatus: 'completed',
        plan: 'premium'
      });
      this.logTest('Allow HTML for premium', 200, response4.statusCode, response4.parsed);
    } catch (error) {
      console.log('❌ Test 4 failed:', error.message);
    }

    // Summary
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    const passRate = Math.round((passed / total) * 100);

    console.log('📊 EXPORT ENDPOINT TEST SUMMARY');
    console.log('=' .repeat(35));
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Pass Rate: ${passRate}%`);

    if (passRate === 100) {
      console.log('\n🎉 All export endpoint tests passed!');
      return true;
    } else {
      console.log(`\n❌ ${total - passed} test(s) failed.`);
      return false;
    }
  }
}

// Run the tests
const tester = new ExportEndpointTester();
tester.runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Test suite crashed:', error.message);
    process.exit(1);
  });