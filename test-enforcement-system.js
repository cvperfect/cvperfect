// TEST COMMAND ENFORCEMENT SYSTEM
// Weryfikuje czy system automatycznego wykrywania i wymuszania skrótów działa poprawnie
// Created: 2025-08-25 for CVPerfect

const { CommandEnforcementSystem } = require('./command-enforcement.js');
const { ComplianceTracker } = require('./compliance-tracker.js');
const fs = require('fs').promises;
const path = require('path');

async function testEnforcementSystem() {
  console.log('🧪 TESTING COMMAND ENFORCEMENT SYSTEM...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  const testResults = [];
  
  // Initialize systems
  const enforcement = new CommandEnforcementSystem();
  const compliance = new ComplianceTracker();
  
  console.log('📋 Systems initialized. Running test suite...\n');
  
  // ========================
  // TEST 1: Flag Detection
  // ========================
  console.log('TEST 1: Flag Detection');
  totalTests++;
  
  const testInput1 = "Napraw błąd w payment system -ut -debug -test -check";
  const result1 = enforcement.enforceExecution(testInput1);
  
  if (result1.success && result1.flagsCount === 4) {
    console.log('✅ PASS: Detected 4 flags correctly');
    passedTests++;
    testResults.push({ test: 'Flag Detection', status: 'PASS', expected: 4, actual: result1.flagsCount });
  } else {
    console.log(`❌ FAIL: Expected 4 flags, got ${result1.flagsCount}`);
    testResults.push({ test: 'Flag Detection', status: 'FAIL', expected: 4, actual: result1.flagsCount });
  }
  console.log('');
  
  // ========================
  // TEST 2: Priority Ordering
  // ========================
  console.log('TEST 2: Priority Ordering');
  totalTests++;
  
  const testInput2 = "Zaimplementuj feature -test -ut -p -check";
  const result2 = enforcement.enforceExecution(testInput2);
  
  // -ut should be first (priority 1), then -p (priority 4), etc.
  const firstFlag = result2.actions[0].flag;
  
  if (firstFlag === '-ut') {
    console.log('✅ PASS: Highest priority flag (-ut) is first');
    passedTests++;
    testResults.push({ test: 'Priority Ordering', status: 'PASS', expected: '-ut first', actual: firstFlag + ' first' });
  } else {
    console.log(`❌ FAIL: Expected -ut first, got ${firstFlag}`);
    testResults.push({ test: 'Priority Ordering', status: 'FAIL', expected: '-ut first', actual: firstFlag + ' first' });
  }
  console.log('');
  
  // ========================
  // TEST 3: Compliance Tracking
  // ========================
  console.log('TEST 3: Compliance Tracking');
  totalTests++;
  
  const testInput3 = "Debug issue -dm -fix -check";
  const tracking = compliance.trackUserCommand(testInput3);
  
  if (tracking.success && tracking.flagsCount === 3) {
    console.log('✅ PASS: Compliance tracking works');
    passedTests++;
    testResults.push({ test: 'Compliance Tracking', status: 'PASS', expected: 3, actual: tracking.flagsCount });
  } else {
    console.log(`❌ FAIL: Compliance tracking failed`);
    testResults.push({ test: 'Compliance Tracking', status: 'FAIL', expected: 'tracking success', actual: 'tracking failed' });
  }
  console.log('');
  
  // ========================
  // TEST 4: Compliance Verification
  // ========================
  console.log('TEST 4: Compliance Verification');
  totalTests++;
  
  // Simulate partial execution
  compliance.markFlagExecuted('-dm', 'Debug Masters activated');
  compliance.markFlagExecuted('-fix', 'Safe fix implemented');
  // Missing: -check
  
  const verification = await compliance.verifyCompliance(false);
  
  if (verification.compliance.status === 'VIOLATION' && verification.execution.missed === 1) {
    console.log('✅ PASS: Compliance violation detected correctly');
    passedTests++;
    testResults.push({ test: 'Compliance Verification', status: 'PASS', expected: 'violation detected', actual: 'violation detected' });
  } else {
    console.log(`❌ FAIL: Compliance verification incorrect`);
    testResults.push({ test: 'Compliance Verification', status: 'FAIL', expected: 'violation detected', actual: verification.compliance.status });
  }
  console.log('');
  
  // ========================
  // TEST 5: Hook Script Existence
  // ========================
  console.log('TEST 5: Hook Script Existence');
  totalTests++;
  
  try {
    const hookPath = '.claude/hooks/pre-response.sh';
    await fs.access(hookPath);
    console.log('✅ PASS: Pre-response hook exists');
    passedTests++;
    testResults.push({ test: 'Hook Script Existence', status: 'PASS', expected: 'file exists', actual: 'file exists' });
  } catch (error) {
    console.log('❌ FAIL: Pre-response hook missing');
    testResults.push({ test: 'Hook Script Existence', status: 'FAIL', expected: 'file exists', actual: 'file missing' });
  }
  console.log('');
  
  // ========================
  // TEST 6: Settings Configuration
  // ========================
  console.log('TEST 6: Settings Configuration');
  totalTests++;
  
  try {
    const settingsPath = '.claude/settings.json';
    const settingsContent = await fs.readFile(settingsPath, 'utf8');
    const settings = JSON.parse(settingsContent);
    
    if (settings.commandEnforcement && settings.commandEnforcement.enabled) {
      console.log('✅ PASS: Command enforcement enabled in settings');
      passedTests++;
      testResults.push({ test: 'Settings Configuration', status: 'PASS', expected: 'enforcement enabled', actual: 'enforcement enabled' });
    } else {
      console.log('❌ FAIL: Command enforcement not properly configured');
      testResults.push({ test: 'Settings Configuration', status: 'FAIL', expected: 'enforcement enabled', actual: 'enforcement disabled' });
    }
  } catch (error) {
    console.log(`❌ FAIL: Settings configuration error: ${error.message}`);
    testResults.push({ test: 'Settings Configuration', status: 'FAIL', expected: 'valid config', actual: 'config error' });
  }
  console.log('');
  
  // ========================
  // TEST 7: Unknown Flag Handling
  // ========================
  console.log('TEST 7: Unknown Flag Handling');
  totalTests++;
  
  const testInput7 = "Test command -ut -unknown -test";
  const result7 = enforcement.enforceExecution(testInput7);
  
  // Should detect 2 known flags, ignore unknown
  if (result7.flagsCount === 2) {
    console.log('✅ PASS: Unknown flags ignored correctly');
    passedTests++;
    testResults.push({ test: 'Unknown Flag Handling', status: 'PASS', expected: 2, actual: result7.flagsCount });
  } else {
    console.log(`❌ FAIL: Expected 2 known flags, got ${result7.flagsCount}`);
    testResults.push({ test: 'Unknown Flag Handling', status: 'FAIL', expected: 2, actual: result7.flagsCount });
  }
  console.log('');
  
  // ========================
  // TEST 8: No Flags Input
  // ========================
  console.log('TEST 8: No Flags Input');
  totalTests++;
  
  const testInput8 = "Simple command without any flags";
  const result8 = enforcement.enforceExecution(testInput8);
  
  if (result8.success && result8.flagsCount === 0) {
    console.log('✅ PASS: No flags detected correctly');
    passedTests++;
    testResults.push({ test: 'No Flags Input', status: 'PASS', expected: 0, actual: result8.flagsCount });
  } else {
    console.log(`❌ FAIL: Expected 0 flags, got ${result8.flagsCount}`);
    testResults.push({ test: 'No Flags Input', status: 'FAIL', expected: 0, actual: result8.flagsCount });
  }
  console.log('');
  
  // ========================
  // FINAL RESULTS
  // ========================
  console.log('📊 TEST RESULTS SUMMARY:');
  console.log('========================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('');
  
  // Detailed results
  console.log('📋 DETAILED RESULTS:');
  testResults.forEach((result, index) => {
    const status = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.test}`);
    if (result.status === 'FAIL') {
      console.log(`   Expected: ${result.expected}`);
      console.log(`   Actual: ${result.actual}`);
    }
  });
  console.log('');
  
  // System statistics
  console.log('📊 SYSTEM STATISTICS:');
  console.log('Enforcement Stats:', enforcement.getSessionStats());
  console.log('Compliance Stats:', compliance.getSessionStatistics());
  console.log('');
  
  // Save test report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = `.claude/test-reports/enforcement-test-${timestamp}.json`;
  
  // Ensure test-reports directory exists
  await fs.mkdir('.claude/test-reports', { recursive: true }).catch(() => {});
  
  const fullReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: ((passedTests / totalTests) * 100).toFixed(1) + '%'
    },
    results: testResults,
    systemStats: {
      enforcement: enforcement.getSessionStats(),
      compliance: compliance.getSessionStatistics()
    }
  };
  
  try {
    await fs.writeFile(reportPath, JSON.stringify(fullReport, null, 2));
    console.log(`📄 Test report saved: ${reportPath}`);
  } catch (error) {
    console.log(`⚠️  Could not save test report: ${error.message}`);
  }
  
  // Final status
  const overallSuccess = passedTests === totalTests;
  
  if (overallSuccess) {
    console.log('🎉 ALL TESTS PASSED! Command Enforcement System is ready!');
    console.log('✅ System will now automatically detect and enforce all user flags');
  } else {
    console.log(`⚠️  ${totalTests - passedTests} tests failed. Review issues before deployment.`);
  }
  
  return {
    success: overallSuccess,
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    results: testResults
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  testEnforcementSystem()
    .then(results => {
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testEnforcementSystem };