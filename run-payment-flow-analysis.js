/**
 * PAYMENT FLOW ANALYSIS RUNNER - PHASE 5
 * Orchestrates comprehensive payment system testing and analysis
 */

const PaymentFlowTestSuite = require('./test-payment-flow-fix');
const PaymentFlowBrowserTest = require('./test-payment-browser-automation');
const fs = require('fs').promises;

class PaymentFlowAnalysisRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      apiTestResults: null,
      browserTestResults: null,
      overallStatus: null,
      criticalIssues: [],
      recommendations: [],
      fixPriority: []
    };
  }

  async runCompleteAnalysis() {
    console.log('🚀 PAYMENT FLOW ANALYSIS - PHASE 5');
    console.log('=====================================');
    console.log('Running comprehensive payment system analysis...\n');

    try {
      // Step 1: Run API Tests
      console.log('📡 STEP 1: API & Backend Testing');
      console.log('-'.repeat(40));
      
      const apiTestSuite = new PaymentFlowTestSuite();
      this.results.apiTestResults = await apiTestSuite.runAllTests();
      
      console.log('✅ API tests completed\n');

      // Step 2: Run Browser Tests
      console.log('🌐 STEP 2: Browser Automation Testing');
      console.log('-'.repeat(40));
      
      const browserTestSuite = new PaymentFlowBrowserTest();
      this.results.browserTestResults = await browserTestSuite.runAllTests();
      
      console.log('✅ Browser tests completed\n');

      // Step 3: Analyze Results
      console.log('🔍 STEP 3: Results Analysis');
      console.log('-'.repeat(40));
      
      this.analyzeResults();
      
      // Step 4: Generate Final Report
      console.log('📊 STEP 4: Final Report Generation');
      console.log('-'.repeat(40));
      
      await this.generateFinalReport();
      
      console.log('✅ Analysis completed successfully!\n');
      
      return this.results;

    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      this.results.error = error.message;
      return this.results;
    }
  }

  analyzeResults() {
    const apiResults = this.results.apiTestResults;
    const browserResults = this.results.browserTestResults;

    // Calculate overall success rates
    const apiSuccessRate = apiResults ? 
      Math.round((apiResults.testSummary.passedTests / apiResults.testSummary.totalTests) * 100) : 0;
    
    const browserSuccessRate = browserResults ? 
      Math.round((browserResults.summary.passedTests / browserResults.summary.totalTests) * 100) : 0;

    const overallSuccessRate = (apiSuccessRate + browserSuccessRate) / 2;

    // Determine overall status
    this.results.overallStatus = {
      apiSuccessRate: `${apiSuccessRate}%`,
      browserSuccessRate: `${browserSuccessRate}%`,
      overallSuccessRate: `${Math.round(overallSuccessRate)}%`,
      status: overallSuccessRate >= 80 ? 'HEALTHY' : 
              overallSuccessRate >= 50 ? 'NEEDS_ATTENTION' : 'CRITICAL'
    };

    // Extract critical issues
    if (apiResults && apiResults.criticalIssues) {
      this.results.criticalIssues.push(...apiResults.criticalIssues.map(issue => ({
        source: 'API',
        test: issue.testName,
        issue: issue.details.message,
        severity: 'HIGH'
      })));
    }

    if (browserResults && browserResults.criticalIssues) {
      this.results.criticalIssues.push(...browserResults.criticalIssues.map(issue => ({
        source: 'Browser',
        test: issue.testName, 
        issue: issue.details.message,
        severity: 'HIGH'
      })));
    }

    // Generate specific recommendations
    this.generateRecommendations();
    this.prioritizeFixes();

    console.log('🎯 Analysis Summary:');
    console.log(`   API Success Rate: ${this.results.overallStatus.apiSuccessRate}`);
    console.log(`   Browser Success Rate: ${this.results.overallStatus.browserSuccessRate}`);
    console.log(`   Overall Status: ${this.results.overallStatus.status}`);
    console.log(`   Critical Issues: ${this.results.criticalIssues.length}`);
  }

  generateRecommendations() {
    const issues = this.results.criticalIssues;
    const recommendations = new Set();

    // Environment variable issues
    if (issues.some(issue => issue.issue.includes('Missing variables'))) {
      recommendations.add('CRITICAL: Set up environment variables (.env.local) with Stripe and Groq API keys');
    }

    // API endpoint issues  
    if (issues.some(issue => issue.issue.includes('500 Internal Server Error'))) {
      recommendations.add('HIGH: Fix API endpoint error handling to return proper JSON responses');
    }

    // Frontend interaction issues
    if (issues.some(issue => issue.issue.includes('not clickable') || issue.issue.includes('Console Error'))) {
      recommendations.add('MEDIUM: Debug frontend JavaScript errors and DOM element interactions');
    }

    // JSON parsing issues
    if (issues.some(issue => issue.issue.includes('JSON') || issue.issue.includes('DOCTYPE'))) {
      recommendations.add('HIGH: Fix API middleware - endpoints returning HTML instead of JSON');
    }

    // Stripe integration issues
    if (issues.some(issue => issue.issue.includes('Stripe') || issue.issue.includes('process is not defined'))) {
      recommendations.add('MEDIUM: Fix Stripe integration environment variable access in browser');
    }

    this.results.recommendations = Array.from(recommendations);
  }

  prioritizeFixes() {
    this.results.fixPriority = [
      {
        priority: 1,
        category: 'Environment Setup',
        tasks: [
          'Create .env.local with NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
          'Add STRIPE_SECRET_KEY for server-side operations', 
          'Add GROQ_API_KEY for AI functionality',
          'Verify all environment variables load correctly'
        ],
        estimatedTime: '30 minutes',
        impact: 'CRITICAL'
      },
      {
        priority: 2,
        category: 'API Error Handling',
        tasks: [
          'Fix /api/save-session to return JSON instead of HTML',
          'Fix /api/get-session-data error handling',
          'Fix /api/parse-cv JSON response format',
          'Add proper CORS headers to all API endpoints'
        ],
        estimatedTime: '2-3 hours',
        impact: 'HIGH'
      },
      {
        priority: 3,
        category: 'Frontend Interactions',
        tasks: [
          'Fix payment button click handlers',
          'Debug CV upload element interactions',
          'Resolve console errors preventing user interactions',
          'Test responsive design across devices'
        ],
        estimatedTime: '1-2 hours',
        impact: 'MEDIUM'
      },
      {
        priority: 4,
        category: 'Integration Testing',
        tasks: [
          'End-to-end payment flow validation',
          'Cross-browser compatibility testing',
          'Performance optimization',
          'Error message user experience'
        ],
        estimatedTime: '2-3 hours',
        impact: 'LOW'
      }
    ];
  }

  async generateFinalReport() {
    const reportData = {
      ...this.results,
      metadata: {
        testDate: new Date().toISOString(),
        testEnvironment: 'http://localhost:3003',
        testFrameworks: ['Node.js', 'Puppeteer', 'Custom Test Suite'],
        reportVersion: '1.0.0'
      }
    };

    // Save detailed JSON report
    const jsonReportPath = './payment-flow-final-analysis.json';
    await fs.writeFile(jsonReportPath, JSON.stringify(reportData, null, 2));

    // Generate executive summary
    const summary = this.generateExecutiveSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 EXECUTIVE SUMMARY - PAYMENT FLOW ANALYSIS');
    console.log('='.repeat(60));
    console.log(summary);
    console.log('='.repeat(60));
    console.log(`📊 Detailed report saved: ${jsonReportPath}`);
    console.log(`📄 Comprehensive report: PAYMENT_FLOW_COMPREHENSIVE_TEST_REPORT.md`);
    console.log(`📸 Screenshots available: ./test-screenshots/`);
  }

  generateExecutiveSummary() {
    const status = this.results.overallStatus;
    const issues = this.results.criticalIssues;
    const recs = this.results.recommendations;

    return `
🎯 OVERALL STATUS: ${status.status}
   Success Rate: ${status.overallSuccessRate} (API: ${status.apiSuccessRate}, Browser: ${status.browserSuccessRate})

❌ CRITICAL ISSUES (${issues.length}):
${issues.slice(0, 5).map(issue => `   • ${issue.test}: ${issue.issue}`).join('\n')}
${issues.length > 5 ? `   • ... and ${issues.length - 5} more issues` : ''}

💡 TOP RECOMMENDATIONS (${recs.length}):
${recs.slice(0, 3).map(rec => `   • ${rec}`).join('\n')}

🚀 NEXT STEPS:
   1. Fix environment variables (.env.local) - 30 minutes
   2. Repair API JSON responses - 2-3 hours  
   3. Debug frontend interactions - 1-2 hours
   4. Run validation tests - 1 hour

📈 EXPECTED OUTCOME: 90%+ success rate after fixes applied
`;
  }
}

// Run analysis if called directly
if (require.main === module) {
  const runner = new PaymentFlowAnalysisRunner();
  runner.runCompleteAnalysis()
    .then(() => {
      console.log('\n✅ Payment flow analysis completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Payment flow analysis failed:', error.message);
      process.exit(1);
    });
}

module.exports = PaymentFlowAnalysisRunner;