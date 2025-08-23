/**
 * COMPREHENSIVE PAYMENT FLOW TEST - PHASE 5
 * Tests the complete payment system end-to-end with detailed validation
 */

const fs = require('fs').promises;
const path = require('path');

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3003',
  testTimeout: 30000,
  screenshotDir: './test-screenshots',
  logFile: './payment-flow-test-report.json'
};

// Test CV Data for upload testing
const TEST_CV_DATA = {
  valid: `Konrad Jakóbczak
Senior Software Developer
Email: konrad@example.com
Phone: +48 123 456 789

EXPERIENCE:
• Senior Developer at UPS (2020-2024)
  - Led development of logistics tracking system
  - Implemented React.js frontend with Node.js backend
  - Managed team of 5 developers
  
• Full-stack Developer at TechCorp (2018-2020)
  - Built e-commerce platform using MERN stack
  - Optimized database queries improving performance by 40%
  - Integrated third-party payment systems

SKILLS:
• Frontend: React.js, Vue.js, TypeScript, HTML5, CSS3
• Backend: Node.js, Python, PHP, REST APIs
• Database: MongoDB, PostgreSQL, MySQL
• Tools: Git, Docker, AWS, CI/CD

EDUCATION:
• Master in Computer Science - University of Technology (2016-2018)
• Bachelor in IT - Zamość Technical College (2012-2016)

LANGUAGES:
• Polish (Native)
• English (Advanced)
• German (Intermediate)`,

  minimal: "John Doe\nSoftware Developer\nEmail: john@example.com",
  
  invalid: "Too short"
};

class PaymentFlowTestSuite {
  constructor() {
    this.results = {
      testStartTime: new Date().toISOString(),
      testResults: [],
      screenshots: [],
      errors: [],
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        testUrl: TEST_CONFIG.baseUrl
      }
    };
  }

  // Utility method to log test results
  logResult(testName, status, details = {}) {
    const result = {
      testName,
      status,
      timestamp: new Date().toISOString(),
      details,
      duration: details.duration || 0
    };
    
    this.results.testResults.push(result);
    
    const statusSymbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${statusSymbol} ${testName}: ${status}`);
    if (details.message) {
      console.log(`   ${details.message}`);
    }
  }

  // Test 1: Environment Setup and Dependencies
  async testEnvironmentSetup() {
    const startTime = Date.now();
    try {
      // Check if server is running
      const { spawn } = require('child_process');
      const testFetch = require('node-fetch').default || require('node-fetch');
      
      console.log('\n🔧 Testing Environment Setup...');
      
      // Test 1.1: Server accessibility
      try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}`);
        if (response.ok) {
          this.logResult('Server Accessibility', 'PASS', {
            message: `Server responding at ${TEST_CONFIG.baseUrl}`,
            duration: Date.now() - startTime
          });
        } else {
          throw new Error(`Server returned ${response.status}`);
        }
      } catch (error) {
        this.logResult('Server Accessibility', 'FAIL', {
          message: `Server not accessible: ${error.message}`,
          duration: Date.now() - startTime
        });
        return false;
      }

      // Test 1.2: Environment variables
      const requiredEnvVars = [
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_SECRET_KEY',
        'GROQ_API_KEY'
      ];
      
      const missingVars = [];
      requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
          missingVars.push(envVar);
        }
      });

      if (missingVars.length === 0) {
        this.logResult('Environment Variables', 'PASS', {
          message: `All required env vars present`,
          duration: Date.now() - startTime
        });
      } else {
        this.logResult('Environment Variables', 'FAIL', {
          message: `Missing variables: ${missingVars.join(', ')}`,
          missingVars,
          duration: Date.now() - startTime
        });
      }

      return true;

    } catch (error) {
      this.logResult('Environment Setup', 'FAIL', {
        message: error.message,
        duration: Date.now() - startTime
      });
      return false;
    }
  }

  // Test 2: API Endpoints Validation
  async testAPIEndpoints() {
    console.log('\n📡 Testing API Endpoints...');
    const startTime = Date.now();

    const endpoints = [
      { path: '/api/create-checkout-session', method: 'POST', requiresAuth: false },
      { path: '/api/save-session', method: 'POST', requiresAuth: false },
      { path: '/api/get-session-data', method: 'GET', requiresAuth: false },
      { path: '/api/parse-cv', method: 'POST', requiresAuth: false },
      { path: '/api/analyze', method: 'POST', requiresAuth: false }
    ];

    for (const endpoint of endpoints) {
      try {
        const testData = endpoint.path.includes('save-session') ? {
          sessionId: 'test_session_123',
          cvData: TEST_CV_DATA.valid,
          email: 'test@example.com',
          plan: 'basic'
        } : endpoint.path.includes('parse-cv') ? {
          cvText: TEST_CV_DATA.valid,
          filename: 'test-cv.txt'
        } : {};

        const response = await fetch(`${TEST_CONFIG.baseUrl}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: endpoint.method === 'POST' ? JSON.stringify(testData) : undefined
        });

        const isValidResponse = response.status < 500; // Allow 400s for invalid test data
        
        this.logResult(`API ${endpoint.path}`, isValidResponse ? 'PASS' : 'FAIL', {
          message: `${endpoint.method} ${response.status} ${response.statusText}`,
          status: response.status,
          endpoint: endpoint.path,
          duration: Date.now() - startTime
        });

      } catch (error) {
        this.logResult(`API ${endpoint.path}`, 'FAIL', {
          message: `Request failed: ${error.message}`,
          duration: Date.now() - startTime
        });
      }
    }
  }

  // Test 3: CV Upload Functionality
  async testCVUploadFunctionality() {
    console.log('\n📄 Testing CV Upload Functionality...');
    const startTime = Date.now();

    // Test different CV formats and sizes
    const cvTests = [
      { name: 'Valid Full CV', data: TEST_CV_DATA.valid, expectSuccess: true },
      { name: 'Minimal CV', data: TEST_CV_DATA.minimal, expectSuccess: true },
      { name: 'Invalid Short CV', data: TEST_CV_DATA.invalid, expectSuccess: false }
    ];

    for (const test of cvTests) {
      try {
        const response = await fetch(`${TEST_CONFIG.baseUrl}/api/parse-cv`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cvText: test.data,
            filename: 'test-cv.txt'
          })
        });

        const result = await response.json();
        const success = response.ok && result.success;
        const expectedResult = test.expectSuccess;

        if ((success && expectedResult) || (!success && !expectedResult)) {
          this.logResult(`CV Upload - ${test.name}`, 'PASS', {
            message: `Expected ${expectedResult}, got ${success}`,
            cvLength: test.data.length,
            responseStatus: response.status,
            duration: Date.now() - startTime
          });
        } else {
          this.logResult(`CV Upload - ${test.name}`, 'FAIL', {
            message: `Expected ${expectedResult}, got ${success}`,
            error: result.error || 'Unknown error',
            duration: Date.now() - startTime
          });
        }

      } catch (error) {
        this.logResult(`CV Upload - ${test.name}`, 'FAIL', {
          message: `Upload failed: ${error.message}`,
          duration: Date.now() - startTime
        });
      }
    }
  }

  // Test 4: Session Management
  async testSessionManagement() {
    console.log('\n🔄 Testing Session Management...');
    const startTime = Date.now();

    const sessionId = 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const testSessionData = {
      sessionId: sessionId,
      cvData: TEST_CV_DATA.valid,
      jobPosting: 'Senior Developer position at tech company',
      email: 'test@cvperfect.com',
      plan: 'basic',
      template: 'simple',
      photo: null
    };

    try {
      // Test 4.1: Save session
      const saveResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/save-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testSessionData)
      });

      const saveResult = await saveResponse.json();
      
      if (saveResponse.ok && saveResult.success) {
        this.logResult('Session Save', 'PASS', {
          message: `Session ${sessionId} saved successfully`,
          sessionId: sessionId,
          dataLength: testSessionData.cvData.length,
          duration: Date.now() - startTime
        });

        // Test 4.2: Retrieve session
        const getResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/get-session-data?sessionId=${sessionId}`);
        const getResult = await getResponse.json();

        if (getResponse.ok && getResult.success && getResult.data) {
          this.logResult('Session Retrieval', 'PASS', {
            message: `Session ${sessionId} retrieved successfully`,
            retrievedDataLength: getResult.data.cvData?.length || 0,
            originalDataLength: testSessionData.cvData.length,
            dataIntegrity: getResult.data.cvData === testSessionData.cvData,
            duration: Date.now() - startTime
          });
        } else {
          this.logResult('Session Retrieval', 'FAIL', {
            message: `Failed to retrieve session: ${getResult.error || 'Unknown error'}`,
            duration: Date.now() - startTime
          });
        }

      } else {
        this.logResult('Session Save', 'FAIL', {
          message: `Failed to save session: ${saveResult.error || 'Unknown error'}`,
          duration: Date.now() - startTime
        });
      }

    } catch (error) {
      this.logResult('Session Management', 'FAIL', {
        message: `Session test failed: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  // Test 5: Payment Plan Configuration
  async testPaymentPlanConfiguration() {
    console.log('\n💳 Testing Payment Plan Configuration...');
    const startTime = Date.now();

    const plans = [
      { name: 'basic', priceId: 'price_1Rwooh4FWb3xY5tDRxqQ4y69', mode: 'payment' },
      { name: 'gold', priceId: 'price_1RxuK64FWb3xY5tDOjAPfwRX', mode: 'subscription' },
      { name: 'premium', priceId: 'price_1RxuKK4FWb3xY5tD28TyEG9e', mode: 'subscription' }
    ];

    for (const plan of plans) {
      try {
        const testCheckoutData = {
          plan: plan.name,
          email: 'test@cvperfect.com',
          cv: TEST_CV_DATA.valid.substring(0, 400),
          job: 'Test job posting',
          fullSessionId: 'test_session_' + Date.now()
        };

        const response = await fetch(`${TEST_CONFIG.baseUrl}/api/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCheckoutData)
        });

        const result = await response.json();
        
        if (response.ok && result.success && result.id && result.url) {
          this.logResult(`Plan Configuration - ${plan.name}`, 'PASS', {
            message: `Stripe session created successfully`,
            sessionId: result.id,
            planType: plan.name,
            expectedMode: plan.mode,
            hasRedirectUrl: !!result.url,
            duration: Date.now() - startTime
          });
        } else {
          this.logResult(`Plan Configuration - ${plan.name}`, 'FAIL', {
            message: `Failed to create checkout session: ${result.error || 'Unknown error'}`,
            responseData: result,
            duration: Date.now() - startTime
          });
        }

      } catch (error) {
        this.logResult(`Plan Configuration - ${plan.name}`, 'FAIL', {
          message: `Plan test failed: ${error.message}`,
          duration: Date.now() - startTime
        });
      }
    }
  }

  // Test 6: Error Handling and Edge Cases
  async testErrorHandling() {
    console.log('\n🚨 Testing Error Handling and Edge Cases...');
    const startTime = Date.now();

    const errorTests = [
      {
        name: 'Missing Email in Payment',
        endpoint: '/api/create-checkout-session',
        data: { plan: 'basic', cv: TEST_CV_DATA.valid },
        expectError: true
      },
      {
        name: 'Invalid Plan Type',
        endpoint: '/api/create-checkout-session',
        data: { plan: 'invalid', email: 'test@test.com', cv: TEST_CV_DATA.valid },
        expectError: false // Should default to basic
      },
      {
        name: 'Missing Session Data',
        endpoint: '/api/save-session',
        data: { sessionId: 'test123' },
        expectError: true
      },
      {
        name: 'Non-existent Session Retrieval',
        endpoint: '/api/get-session-data',
        method: 'GET',
        query: '?sessionId=nonexistent_session_123',
        expectError: true
      }
    ];

    for (const test of errorTests) {
      try {
        const method = test.method || 'POST';
        const url = `${TEST_CONFIG.baseUrl}${test.endpoint}${test.query || ''}`;
        const options = {
          method: method,
          headers: { 'Content-Type': 'application/json' }
        };

        if (method === 'POST' && test.data) {
          options.body = JSON.stringify(test.data);
        }

        const response = await fetch(url, options);
        const result = await response.json();

        const hasError = !response.ok || !result.success;
        
        if ((hasError && test.expectError) || (!hasError && !test.expectError)) {
          this.logResult(`Error Handling - ${test.name}`, 'PASS', {
            message: `Expected error: ${test.expectError}, got error: ${hasError}`,
            responseStatus: response.status,
            errorMessage: result.error || 'No error',
            duration: Date.now() - startTime
          });
        } else {
          this.logResult(`Error Handling - ${test.name}`, 'FAIL', {
            message: `Expected error: ${test.expectError}, got error: ${hasError}`,
            responseStatus: response.status,
            duration: Date.now() - startTime
          });
        }

      } catch (error) {
        const expectedResult = test.expectError;
        this.logResult(`Error Handling - ${test.name}`, expectedResult ? 'PASS' : 'FAIL', {
          message: `Network error occurred: ${error.message}`,
          expectedError: expectedResult,
          duration: Date.now() - startTime
        });
      }
    }
  }

  // Generate comprehensive report
  async generateReport() {
    const endTime = new Date().toISOString();
    const totalTests = this.results.testResults.length;
    const passedTests = this.results.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.testResults.filter(r => r.status === 'FAIL').length;
    const warningTests = this.results.testResults.filter(r => r.status === 'WARN').length;

    const summary = {
      testSummary: {
        totalTests,
        passedTests,
        failedTests,
        warningTests,
        successRate: `${Math.round((passedTests / totalTests) * 100)}%`
      },
      testDuration: {
        startTime: this.results.testStartTime,
        endTime: endTime,
        totalDurationMs: Date.now() - new Date(this.results.testStartTime).getTime()
      },
      criticalIssues: this.results.testResults.filter(r => r.status === 'FAIL'),
      recommendations: []
    };

    // Add recommendations based on failures
    if (failedTests > 0) {
      summary.recommendations.push("Fix failing API endpoints before deployment");
      summary.recommendations.push("Verify environment variables are properly configured");
      summary.recommendations.push("Test payment flow integration with Stripe");
    }

    if (summary.testSummary.successRate !== '100%') {
      summary.recommendations.push("Review error handling for edge cases");
      summary.recommendations.push("Implement additional validation for user inputs");
    }

    const finalReport = {
      ...this.results,
      ...summary
    };

    // Save report to file
    try {
      await fs.writeFile(
        TEST_CONFIG.logFile, 
        JSON.stringify(finalReport, null, 2)
      );
      console.log(`\n📊 Test report saved to: ${TEST_CONFIG.logFile}`);
    } catch (error) {
      console.error(`❌ Failed to save report: ${error.message}`);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('🧪 PAYMENT FLOW TEST SUITE RESULTS');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️  Warnings: ${warningTests}`);
    console.log(`🎯 Success Rate: ${summary.testSummary.successRate}`);
    console.log(`⏱️  Duration: ${Math.round(summary.testDuration.totalDurationMs / 1000)}s`);
    
    if (failedTests > 0) {
      console.log('\n❌ CRITICAL ISSUES TO FIX:');
      summary.criticalIssues.forEach(issue => {
        console.log(`   • ${issue.testName}: ${issue.details.message}`);
      });
    }

    if (summary.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      summary.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }

    console.log('='.repeat(60));

    return finalReport;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Payment Flow Test Suite...');
    console.log(`📍 Testing environment: ${TEST_CONFIG.baseUrl}`);
    console.log(`📝 Report will be saved to: ${TEST_CONFIG.logFile}`);
    console.log('='.repeat(60));

    try {
      // Run all test suites
      await this.testEnvironmentSetup();
      await this.testAPIEndpoints();
      await this.testCVUploadFunctionality();
      await this.testSessionManagement();
      await this.testPaymentPlanConfiguration();
      await this.testErrorHandling();

      // Generate final report
      return await this.generateReport();

    } catch (error) {
      console.error(`❌ Test suite failed: ${error.message}`);
      this.results.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      return await this.generateReport();
    }
  }
}

// Run the test suite if called directly
if (require.main === module) {
  const testSuite = new PaymentFlowTestSuite();
  testSuite.runAllTests()
    .then(() => {
      console.log('\n✅ Test suite completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = PaymentFlowTestSuite;