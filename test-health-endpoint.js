const http = require('http');

class HealthEndpointTester {
  constructor() {
    this.baseUrl = 'localhost';
    this.port = 3000;
    this.testResults = [];
  }

  async makeRequest(method = 'GET', path = '/api/health') {
    const options = {
      hostname: this.baseUrl,
      port: this.port,
      path: path,
      method: method
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            parsed: data ? JSON.parse(data) : null
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  logTest(name, passed, details) {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${name}: ${details}`);
    this.testResults.push({ name, passed, details });
  }

  async testGetHealth() {
    console.log('\n🧪 Testing GET /api/health...');
    
    try {
      const response = await this.makeRequest('GET', '/api/health');
      const { statusCode, parsed } = response;

      // Test 1: Status Code
      this.logTest('Status Code 200', statusCode === 200, `Got ${statusCode}`);

      // Test 2: Response Structure
      const hasRequiredFields = parsed && 
        parsed.status && 
        parsed.timestamp && 
        parsed.service && 
        parsed.version &&
        parsed.orchestration;
      this.logTest('Required Fields Present', hasRequiredFields, 
        `Fields: ${Object.keys(parsed || {}).join(', ')}`);

      // Test 3: Status Value
      this.logTest('Status is Healthy', parsed?.status === 'healthy', 
        `Status: ${parsed?.status}`);

      // Test 4: Service Name
      this.logTest('Service Name Correct', parsed?.service === 'CVPerfect API', 
        `Service: ${parsed?.service}`);

      // Test 5: Memory Info
      const hasMemoryInfo = parsed?.memory && 
        typeof parsed.memory.used === 'number' && 
        typeof parsed.memory.total === 'number';
      this.logTest('Memory Info Present', hasMemoryInfo, 
        `Memory: ${JSON.stringify(parsed?.memory)}`);

      // Test 6: Uptime
      this.logTest('Uptime Present', typeof parsed?.uptime === 'number', 
        `Uptime: ${parsed?.uptime}s`);

      // Test 7: Health Checks
      const hasChecks = parsed?.checks && 
        parsed.checks.database && 
        parsed.checks.stripe && 
        parsed.checks.groq;
      this.logTest('Health Checks Present', hasChecks, 
        `Checks: ${JSON.stringify(parsed?.checks)}`);

      return response;
    } catch (error) {
      this.logTest('GET Request', false, error.message);
      throw error;
    }
  }

  async testInvalidMethod() {
    console.log('\n🧪 Testing invalid method (POST)...');
    
    try {
      const response = await this.makeRequest('POST', '/api/health');
      const { statusCode, parsed } = response;

      // Test 1: Method Not Allowed Status
      this.logTest('Method Not Allowed Status', statusCode === 405, 
        `Got ${statusCode}`);

      // Test 2: Error Message
      this.logTest('Error Message Present', parsed?.error?.includes('Not Allowed'), 
        `Error: ${parsed?.error}`);

      // Test 3: Allowed Methods
      this.logTest('Allowed Methods Specified', parsed?.allowed?.includes('GET'), 
        `Allowed: ${JSON.stringify(parsed?.allowed)}`);

      return response;
    } catch (error) {
      this.logTest('POST Request', false, error.message);
      throw error;
    }
  }

  async runAllTests() {
    console.log('🚀 CVPerfect Health Endpoint - Comprehensive Test Suite');
    console.log('=' .repeat(60));

    try {
      await this.testGetHealth();
      await this.testInvalidMethod();

      // Summary
      const passed = this.testResults.filter(t => t.passed).length;
      const total = this.testResults.length;
      const passRate = Math.round((passed / total) * 100);

      console.log('\n📊 TEST SUMMARY');
      console.log('=' .repeat(30));
      console.log(`Total Tests: ${total}`);
      console.log(`Passed: ${passed}`);
      console.log(`Failed: ${total - passed}`);
      console.log(`Pass Rate: ${passRate}%`);

      if (passRate === 100) {
        console.log('\n🎉 All tests passed! Health endpoint is working perfectly.');
        return true;
      } else {
        console.log(`\n⚠️  ${total - passed} test(s) failed. Check the output above.`);
        return false;
      }
    } catch (error) {
      console.error('\n❌ Test suite failed:', error.message);
      return false;
    }
  }
}

// Run the comprehensive test suite
const tester = new HealthEndpointTester();
tester.runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Test suite crashed:', error.message);
    process.exit(1);
  });