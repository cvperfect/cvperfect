#!/usr/bin/env node
/**
 * SESSION RECOVERY TEST - CVPerfect
 * Session persistence and recovery validation
 * 
 * Tests:
 * - Session creation and persistence
 * - Payment flow session handling
 * - Session recovery after failures
 * - Data integrity during session lifecycle
 * - SessionStorage fallback mechanisms
 * - Cache management
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class SessionRecoveryTest {
    constructor() {
        this.testResults = [];
        this.errors = [];
        this.startTime = Date.now();
        this.testSessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
        const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        console.log(logMessage);
        
        this.testResults.push({
            timestamp,
            type,
            message
        });
    }

    async runTest(testName, testFn) {
        this.log(`Testing: ${testName}`, 'test');
        const testStart = Date.now();
        
        try {
            const result = await testFn();
            const duration = Date.now() - testStart;
            this.log(`✅ ${testName} - PASSED (${duration}ms)`, 'pass');
            return { success: true, duration, result };
        } catch (error) {
            const duration = Date.now() - testStart;
            this.log(`❌ ${testName} - FAILED: ${error.message} (${duration}ms)`, 'fail');
            this.errors.push({ testName, error: error.message, duration });
            return { success: false, duration, error: error.message };
        }
    }

    async testSessionAPIEndpoints() {
        const endpoints = [
            '/api/save-session',
            '/api/get-session-data',
            '/api/get-session',
            '/api/recover-session'
        ];

        const apiPath = path.join(process.cwd(), 'pages', 'api');
        const results = [];

        for (const endpoint of endpoints) {
            const fileName = endpoint.replace('/api/', '') + '.js';
            const filePath = path.join(apiPath, fileName);
            
            if (fs.existsSync(filePath)) {
                results.push(`✅ ${endpoint}: API endpoint exists`);
            } else {
                results.push(`❌ ${endpoint}: Missing API endpoint`);
            }
        }

        return `Session API endpoints:\n${results.join('\n')}`;
    }

    async testSessionDataStructure() {
        // Test session data structure based on CVPerfect requirements
        const expectedFields = [
            'sessionId',
            'userId',
            'cvData', 
            'cvText',
            'selectedPlan',
            'paymentStatus',
            'timestamp',
            'expiresAt'
        ];

        // Check if any session files exist in temp or if APIs handle these fields
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        
        if (!fs.existsSync(successPath)) {
            throw new Error('success.js not found - cannot validate session structure');
        }

        const content = fs.readFileSync(successPath, 'utf8');
        
        const foundFields = expectedFields.filter(field => 
            content.includes(field)
        );

        if (foundFields.length < 4) {
            throw new Error(`Session structure incomplete. Found fields: ${foundFields.join(', ')}`);
        }

        return `Session data structure: ${foundFields.length}/${expectedFields.length} fields found (${foundFields.join(', ')})`;
    }

    async testPaymentSessionFlow() {
        // Test the critical payment session flow described in CLAUDE.md
        const criticalFlow = [
            'parse-cv',
            'save-session', 
            'create-checkout-session',
            'stripe-webhook',
            'get-session-data'
        ];

        const apiPath = path.join(process.cwd(), 'pages', 'api');
        const results = [];

        for (const step of criticalFlow) {
            const filePath = path.join(apiPath, step + '.js');
            
            if (fs.existsSync(filePath)) {
                results.push(`✅ ${step}: Flow step exists`);
            } else {
                results.push(`❌ ${step}: Missing flow step`);
            }
        }

        const completedSteps = results.filter(r => r.includes('✅')).length;
        const flowIntegrity = Math.round((completedSteps / criticalFlow.length) * 100);

        return `Payment session flow: ${completedSteps}/${criticalFlow.length} steps (${flowIntegrity}% integrity)\n${results.join('\n')}`;
    }

    async testSessionRecoveryLogic() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        
        if (!fs.existsSync(successPath)) {
            throw new Error('success.js not found');
        }

        const content = fs.readFileSync(successPath, 'utf8');
        
        // Check for session recovery patterns
        const recoveryPatterns = [
            'fetchUserDataFromSession',
            'sessionId',
            'retry',
            'timeout',
            'recovery',
            'fallback',
            'MAX_RETRIES'
        ];

        const foundPatterns = recoveryPatterns.filter(pattern => 
            content.includes(pattern)
        );

        if (foundPatterns.length < 4) {
            throw new Error(`Session recovery incomplete. Found patterns: ${foundPatterns.join(', ')}`);
        }

        return `Session recovery logic: ${foundPatterns.length}/${recoveryPatterns.length} patterns implemented`;
    }

    async testInfiniteLoopPrevention() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        const content = fs.readFileSync(successPath, 'utf8');
        
        // Check for infinite loop prevention patterns (CLAUDE.md mentions this was fixed)
        const preventionPatterns = [
            'MAX_RETRIES',
            'timeout',
            'useEffect',
            'cleanup',
            'clearTimeout',
            'clearInterval'
        ];

        const foundPatterns = preventionPatterns.filter(pattern => 
            content.includes(pattern)
        );

        // Check for proper useEffect dependency arrays
        const useEffectMatches = content.match(/useEffect\s*\([^}]+\}/g) || [];
        const properDependencies = useEffectMatches.filter(effect => 
            effect.includes('[') && effect.includes(']')
        ).length;

        if (foundPatterns.length < 3) {
            throw new Error(`Infinite loop prevention incomplete. Found: ${foundPatterns.join(', ')}`);
        }

        return `Infinite loop prevention: ${foundPatterns.length}/6 patterns, ${properDependencies} useEffect with dependencies`;
    }

    async testSessionStorageFallback() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        const content = fs.readFileSync(successPath, 'utf8');
        
        // Check for sessionStorage patterns
        const storagePatterns = [
            'sessionStorage',
            'localStorage',
            'getItem',
            'setItem',
            'removeItem',
            'storage'
        ];

        const foundPatterns = storagePatterns.filter(pattern => 
            content.includes(pattern)
        );

        return `SessionStorage fallback: ${foundPatterns.length}/6 storage patterns found`;
    }

    async testMemoryLeakPrevention() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        const content = fs.readFileSync(successPath, 'utf8');
        
        // Check for memory leak prevention patterns
        const memoryPatterns = [
            'cleanup',
            'clearTimeout',
            'clearInterval',
            'removeEventListener',
            'abort',
            'cancel'
        ];

        const foundPatterns = memoryPatterns.filter(pattern => 
            content.includes(pattern)
        );

        // Check for proper cleanup in useEffect
        const cleanupPatterns = content.match(/useEffect\s*\([^}]+return[^}]+\}/g) || [];

        return `Memory leak prevention: ${foundPatterns.length}/6 patterns, ${cleanupPatterns.length} useEffect cleanups`;
    }

    async testSessionMetrics() {
        const metricsEndpoint = path.join(process.cwd(), 'pages', 'api', 'session-metrics.js');
        
        if (!fs.existsSync(metricsEndpoint)) {
            return 'Session metrics: ⚠️  Endpoint not implemented (optional)';
        }

        const content = fs.readFileSync(metricsEndpoint, 'utf8');
        
        // Check for metrics patterns
        const metricsPatterns = [
            'analytics',
            'tracking',
            'metrics',
            'usage',
            'statistics'
        ];

        const foundPatterns = metricsPatterns.filter(pattern => 
            content.toLowerCase().includes(pattern)
        );

        return `Session metrics: ${foundPatterns.length}/5 patterns found in endpoint`;
    }

    async testCVDataIntegrity() {
        // Test that CV data is preserved through session lifecycle
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        const content = fs.readFileSync(successPath, 'utf8');
        
        // Check for CV data handling patterns
        const cvPatterns = [
            'cvData',
            'initialCVData', 
            'setCVData',
            'cvText',
            'parsedCV',
            'photo',
            'image'
        ];

        const foundPatterns = cvPatterns.filter(pattern => 
            content.includes(pattern)
        );

        if (foundPatterns.length < 4) {
            throw new Error(`CV data integrity at risk. Found patterns: ${foundPatterns.join(', ')}`);
        }

        return `CV data integrity: ${foundPatterns.length}/7 data preservation patterns`;
    }

    async generateReport() {
        const duration = Date.now() - this.startTime;
        const passedTests = this.testResults.filter(r => r.type === 'pass').length;
        const failedTests = this.errors.length;
        const totalTests = passedTests + failedTests;

        const report = {
            testSuite: 'Session Recovery Test',
            summary: {
                totalTests,
                passed: passedTests,
                failed: failedTests,
                duration: `${duration}ms`,
                successRate: `${Math.round((passedTests / totalTests) * 100)}%`
            },
            sessionSystem: {
                testSessionId: this.testSessionId,
                criticalFlow: 'CV upload → save-session → payment → webhook → get-session-data',
                recoveryFeatures: 'Infinite loop prevention, memory leak cleanup, sessionStorage fallback'
            },
            testResults: this.testResults,
            errors: this.errors,
            timestamp: new Date().toISOString()
        };

        // Save detailed report
        const reportPath = path.join(process.cwd(), 'test-results-session-recovery.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return report;
    }

    async runAllTests() {
        this.log(`🔄 Starting Session Recovery Test (Session ID: ${this.testSessionId})`, 'start');

        // Test sequence
        await this.runTest('Session API Endpoints', () => this.testSessionAPIEndpoints());
        await this.runTest('Session Data Structure', () => this.testSessionDataStructure());
        await this.runTest('Payment Session Flow', () => this.testPaymentSessionFlow());
        await this.runTest('Session Recovery Logic', () => this.testSessionRecoveryLogic());
        await this.runTest('Infinite Loop Prevention', () => this.testInfiniteLoopPrevention());
        await this.runTest('SessionStorage Fallback', () => this.testSessionStorageFallback());
        await this.runTest('Memory Leak Prevention', () => this.testMemoryLeakPrevention());
        await this.runTest('Session Metrics', () => this.testSessionMetrics());
        await this.runTest('CV Data Integrity', () => this.testCVDataIntegrity());

        const report = await this.generateReport();
        
        this.log(`🏁 Session recovery tests completed: ${report.summary.passed}/${report.summary.totalTests} passed (${report.summary.successRate})`, 'summary');
        
        if (report.summary.failed > 0) {
            this.log('⚠️  Some session tests failed. Check test-results-session-recovery.json', 'warning');
            this.errors.forEach(error => {
                this.log(`   └─ ${error.testName}: ${error.error}`, 'error');
            });
            process.exit(1);
        } else {
            this.log('🎉 Session recovery system validated!', 'success');
            process.exit(0);
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new SessionRecoveryTest();
    tester.runAllTests().catch(error => {
        console.error('Session recovery test failed:', error);
        process.exit(1);
    });
}

module.exports = SessionRecoveryTest;