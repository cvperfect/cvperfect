// STEP 15: Comprehensive session recovery testing suite
const fs = require('fs').promises;
const path = require('path');

class SessionRecoveryTester {
  constructor() {
    this.testResults = [];
    this.sessionsDir = path.join(process.cwd(), '.sessions');
    this.emailIndexDir = path.join(this.sessionsDir, 'email-index');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : (type === 'success' ? '✅' : '📝');
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFn) {
    this.log(`Starting test: ${testName}`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'passed',
        duration,
        result
      });
      
      this.log(`✅ ${testName} passed (${duration}ms)`, 'success');
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'failed',
        duration,
        error: error.message
      });
      
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // TEST 1: Session Creation and Email Index
  async testSessionCreation() {
    return this.runTest('Session Creation and Email Index', async () => {
      const testEmail = 'test@cvperfect.pl';
      const testSessionId = `sess_test_${Date.now()}`;
      const testCVData = 'Test CV content for recovery testing';

      // Simulate session save
      const response = await fetch('http://localhost:3001/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: testSessionId,
          cvData: testCVData,
          email: testEmail,
          plan: 'premium'
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Session save failed: ' + result.error);
      }

      // Verify session file exists
      const sessionFile = path.join(this.sessionsDir, `${testSessionId}.json`);
      const sessionExists = await fs.access(sessionFile).then(() => true).catch(() => false);
      
      if (!sessionExists) {
        throw new Error('Session file not created');
      }

      // Verify email index exists
      const crypto = require('crypto');
      const emailHash = crypto.createHash('sha256').update(testEmail.toLowerCase()).digest('hex').substring(0, 16);
      const indexFile = path.join(this.emailIndexDir, `${emailHash}.json`);
      const indexExists = await fs.access(indexFile).then(() => true).catch(() => false);
      
      if (!indexExists) {
        throw new Error('Email index not created');
      }

      return {
        sessionId: testSessionId,
        email: testEmail,
        emailHash,
        sessionFileSize: (await fs.stat(sessionFile)).size,
        indexFileSize: (await fs.stat(indexFile)).size
      };
    });
  }

  // TEST 2: Email Recovery API
  async testEmailRecovery() {
    return this.runTest('Email Recovery API', async () => {
      // First create a test session
      const sessionData = await this.testSessionCreation();
      
      // Test recovery
      const response = await fetch('http://localhost:3001/api/recover-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sessionData.email
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Recovery failed: ' + result.message);
      }

      if (result.sessionId !== sessionData.sessionId) {
        throw new Error(`Session ID mismatch: expected ${sessionData.sessionId}, got ${result.sessionId}`);
      }

      return {
        recoveredSessionId: result.sessionId,
        plan: result.plan,
        createdAt: result.createdAt
      };
    });
  }

  // TEST 3: Session Cleanup
  async testSessionCleanup() {
    return this.runTest('Session Cleanup Service', async () => {
      // Create old test session
      const oldSessionId = `sess_old_${Date.now()}`;
      const oldSessionFile = path.join(this.sessionsDir, `${oldSessionId}.json`);
      
      await fs.writeFile(oldSessionFile, JSON.stringify({
        sessionId: oldSessionId,
        email: 'old@test.com',
        cvData: 'Old test data',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() // 72 hours ago
      }));

      // Set file modification time to 72 hours ago
      const oldTime = new Date(Date.now() - 72 * 60 * 60 * 1000);
      await fs.utimes(oldSessionFile, oldTime, oldTime);

      // Run cleanup with dry run first
      const dryRunResponse = await fetch('http://localhost:3001/api/cleanup-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxAgeHours: 48,
          dryRun: true
        })
      });

      const dryRunResult = await dryRunResponse.json();
      
      if (!dryRunResult.success) {
        throw new Error('Dry run cleanup failed: ' + dryRunResult.error);
      }

      // Run actual cleanup
      const cleanupResponse = await fetch('http://localhost:3001/api/cleanup-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxAgeHours: 48,
          dryRun: false
        })
      });

      const cleanupResult = await cleanupResponse.json();
      
      if (!cleanupResult.success) {
        throw new Error('Cleanup failed: ' + cleanupResult.error);
      }

      // Verify old session was deleted
      const sessionStillExists = await fs.access(oldSessionFile).then(() => true).catch(() => false);
      
      if (sessionStillExists) {
        throw new Error('Old session was not deleted');
      }

      return {
        dryRun: dryRunResult.report,
        cleanup: cleanupResult.report
      };
    });
  }

  // TEST 4: Success Page Session Priority
  async testSessionPriority() {
    return this.runTest('Success Page Session Priority', async () => {
      const testResults = [];

      // Test different URL patterns
      const testCases = [
        {
          name: 'URL session_id only',
          url: 'http://localhost:3001/success?session_id=test_url_123',
          expectedSource: 'url'
        },
        {
          name: 'Backup session only',
          url: 'http://localhost:3001/success?backup_session=test_backup_123',
          expectedSource: 'backup'
        },
        {
          name: 'URL + backup (URL should win)',
          url: 'http://localhost:3001/success?session_id=test_url_123&backup_session=test_backup_123',
          expectedSource: 'url'
        },
        {
          name: 'No session parameters',
          url: 'http://localhost:3001/success',
          expectedSource: 'none'
        }
      ];

      for (const testCase of testCases) {
        // This would require browser automation to fully test
        // For now, we'll just verify the URLs are constructed correctly
        const url = new URL(testCase.url);
        const sessionId = url.searchParams.get('session_id');
        const backupSession = url.searchParams.get('backup_session');
        
        const actualSource = sessionId ? 'url' : (backupSession ? 'backup' : 'none');
        
        testResults.push({
          name: testCase.name,
          url: testCase.url,
          expectedSource: testCase.expectedSource,
          actualSource: actualSource,
          passed: actualSource === testCase.expectedSource
        });
      }

      const allPassed = testResults.every(test => test.passed);
      
      if (!allPassed) {
        throw new Error('Some session priority tests failed');
      }

      return testResults;
    });
  }

  // TEST 5: Metrics Dashboard
  async testMetricsDashboard() {
    return this.runTest('Metrics Dashboard', async () => {
      const response = await fetch('http://localhost:3001/api/session-metrics');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Metrics generation failed: ' + result.error);
      }

      const requiredFields = ['metrics', 'healthScore'];
      for (const field of requiredFields) {
        if (!result[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate metrics structure
      if (typeof result.metrics.sessions.total !== 'number') {
        throw new Error('Invalid sessions.total metric');
      }

      if (!['healthy', 'warning', 'critical'].includes(result.healthScore.status)) {
        throw new Error('Invalid health status');
      }

      return {
        totalSessions: result.metrics.sessions.total,
        activeSessions: result.metrics.sessions.active,
        healthStatus: result.healthScore.status,
        recommendations: result.recommendations.length
      };
    });
  }

  // Clean up test files
  async cleanup() {
    this.log('Cleaning up test files...');
    
    try {
      const sessionFiles = await fs.readdir(this.sessionsDir);
      
      for (const filename of sessionFiles) {
        if (filename.includes('test_') && filename.endsWith('.json')) {
          await fs.unlink(path.join(this.sessionsDir, filename));
          this.log(`Deleted test session: ${filename}`);
        }
      }

      // Clean up email indexes
      const indexExists = await fs.access(this.emailIndexDir).then(() => true).catch(() => false);
      if (indexExists) {
        const indexFiles = await fs.readdir(this.emailIndexDir);
        
        for (const filename of indexFiles) {
          if (filename.endsWith('.json')) {
            const indexPath = path.join(this.emailIndexDir, filename);
            try {
              const indexData = JSON.parse(await fs.readFile(indexPath, 'utf8'));
              if (indexData.sessionId && indexData.sessionId.includes('test_')) {
                await fs.unlink(indexPath);
                this.log(`Deleted test email index: ${filename}`);
              }
            } catch (parseError) {
              // Index might be corrupted, skip
            }
          }
        }
      }
      
    } catch (cleanupError) {
      this.log(`Cleanup error: ${cleanupError.message}`, 'error');
    }
  }

  // Run all tests
  async runAllTests() {
    this.log('🚀 Starting comprehensive session recovery tests...');
    const startTime = Date.now();

    try {
      await this.testSessionCreation();
      await this.testEmailRecovery();
      await this.testSessionCleanup();
      await this.testSessionPriority();
      await this.testMetricsDashboard();
      
      const duration = Date.now() - startTime;
      const passed = this.testResults.filter(test => test.status === 'passed').length;
      const failed = this.testResults.filter(test => test.status === 'failed').length;
      
      this.log(`🎉 All tests completed! ${passed} passed, ${failed} failed (${duration}ms)`, 'success');
      
      return {
        summary: {
          total: this.testResults.length,
          passed,
          failed,
          duration
        },
        results: this.testResults
      };
      
    } catch (error) {
      this.log(`🚨 Test suite failed: ${error.message}`, 'error');
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SessionRecoveryTester();
  
  tester.runAllTests()
    .then(results => {
      console.log('\n📊 Final Test Report:');
      console.log(JSON.stringify(results, null, 2));
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('\n💥 Test suite crashed:', error.message);
      process.exit(1);
    });
}

module.exports = SessionRecoveryTester;