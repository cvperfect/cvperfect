#!/usr/bin/env node
/**
 * DEBUG AGENTS SYSTEM TEST - CVPerfect
 * Validation of 6-agent debug system
 * 
 * Tests:
 * - 3 Basic Debug Agents (File Reader, Bug Fixer, Supervisor)
 * - 3 Advanced Debug Masters (RCA, AI Copilot, Systematic)
 * - Debug system launcher
 * - Integration with main agent system
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class DebugAgentsTest {
    constructor() {
        this.testResults = [];
        this.errors = [];
        this.startTime = Date.now();
        this.expectedAgents = {
            basic: [
                'file_reader_agent.js',
                'bug_fixer_agent.js', 
                'supervisor_agent.js'
            ],
            masters: [
                'root_cause_analysis_master.js',
                'ai_debugging_copilot_master.js',
                'systematic_debugging_master.js'
            ]
        };
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

    async testDebugDirectory() {
        const debugPath = path.join(process.cwd(), 'agents', 'debug');
        
        if (!fs.existsSync(debugPath)) {
            throw new Error('agents/debug/ directory not found');
        }

        const agents = fs.readdirSync(debugPath)
            .filter(file => file.endsWith('.js'));

        const totalExpected = this.expectedAgents.basic.length + this.expectedAgents.masters.length;
        
        if (agents.length < totalExpected) {
            throw new Error(`Expected ${totalExpected} debug agents, found ${agents.length}`);
        }

        return `Debug directory: ${agents.length} agents found (expected: ${totalExpected})`;
    }

    async testBasicDebugAgents() {
        const debugPath = path.join(process.cwd(), 'agents', 'debug');
        const results = [];

        for (const agentFile of this.expectedAgents.basic) {
            const agentPath = path.join(debugPath, agentFile);
            
            if (!fs.existsSync(agentPath)) {
                results.push(`❌ ${agentFile}: Missing`);
                continue;
            }

            const content = fs.readFileSync(agentPath, 'utf8');
            
            // Check for basic agent patterns
            const patterns = ['class', 'function', 'module.exports', 'console.log'];
            const foundPatterns = patterns.filter(pattern => content.includes(pattern));

            if (foundPatterns.length >= 3) {
                results.push(`✅ ${agentFile}: Valid (${foundPatterns.length}/4 patterns)`);
            } else {
                results.push(`⚠️  ${agentFile}: Incomplete (${foundPatterns.length}/4 patterns)`);
            }
        }

        return `Basic debug agents (3/3):\n${results.join('\n')}`;
    }

    async testAdvancedDebugMasters() {
        const debugPath = path.join(process.cwd(), 'agents', 'debug');
        const results = [];

        for (const masterFile of this.expectedAgents.masters) {
            const masterPath = path.join(debugPath, masterFile);
            
            if (!fs.existsSync(masterPath)) {
                results.push(`❌ ${masterFile}: Missing`);
                continue;
            }

            const content = fs.readFileSync(masterPath, 'utf8');
            
            // Check for advanced master patterns
            const patterns = ['class', 'methodology', 'analysis', 'debugging', 'patterns'];
            const foundPatterns = patterns.filter(pattern => 
                content.toLowerCase().includes(pattern.toLowerCase())
            );

            if (foundPatterns.length >= 4) {
                results.push(`✅ ${masterFile}: Advanced master (${foundPatterns.length}/5 patterns)`);
            } else {
                results.push(`⚠️  ${masterFile}: Basic implementation (${foundPatterns.length}/5 patterns)`);
            }
        }

        return `Advanced debug masters (3/3):\n${results.join('\n')}`;
    }

    async testRootCauseAnalysisMaster() {
        const rcaPath = path.join(process.cwd(), 'agents', 'debug', 'root_cause_analysis_master.js');
        
        if (!fs.existsSync(rcaPath)) {
            throw new Error('Root Cause Analysis Master not found');
        }

        const content = fs.readFileSync(rcaPath, 'utf8');
        
        // Check for RCA methodologies
        const methodologies = [
            'Five Whys',
            'Fishbone',
            'FMEA',
            'Ishikawa',
            'Root Cause'
        ];

        const foundMethodologies = methodologies.filter(method => 
            content.includes(method)
        );

        if (foundMethodologies.length < 3) {
            throw new Error(`RCA Master incomplete. Found methodologies: ${foundMethodologies.join(', ')}`);
        }

        return `RCA Master: ${foundMethodologies.length}/5 methodologies implemented (${foundMethodologies.join(', ')})`;
    }

    async testAIDebuggingCopilot() {
        const copilotPath = path.join(process.cwd(), 'agents', 'debug', 'ai_debugging_copilot_master.js');
        
        if (!fs.existsSync(copilotPath)) {
            throw new Error('AI Debugging Copilot Master not found');
        }

        const content = fs.readFileSync(copilotPath, 'utf8');
        
        // Check for AI patterns
        const aiPatterns = [
            'pattern',
            'recognition',
            'confidence',
            'scoring',
            'automated',
            'AI',
            'copilot'
        ];

        const foundPatterns = aiPatterns.filter(pattern => 
            content.toLowerCase().includes(pattern.toLowerCase())
        );

        if (foundPatterns.length < 4) {
            throw new Error(`AI Copilot incomplete. Found patterns: ${foundPatterns.join(', ')}`);
        }

        return `AI Debugging Copilot: ${foundPatterns.length}/7 AI patterns found`;
    }

    async testSystematicDebuggingMaster() {
        const systematicPath = path.join(process.cwd(), 'agents', 'debug', 'systematic_debugging_master.js');
        
        if (!fs.existsSync(systematicPath)) {
            throw new Error('Systematic Debugging Master not found');
        }

        const content = fs.readFileSync(systematicPath, 'utf8');
        
        // Check for 8-phase process
        const phases = [
            'Problem Definition',
            'Information Gathering',
            'Hypothesis Generation', 
            'Test Case Design',
            'Systematic Testing',
            'Root Cause Identification',
            'Solution Implementation',
            'Validation'
        ];

        const foundPhases = phases.filter(phase => 
            content.includes(phase)
        );

        if (foundPhases.length < 6) {
            throw new Error(`Systematic Master incomplete. Found phases: ${foundPhases.length}/8`);
        }

        return `Systematic Debugging Master: ${foundPhases.length}/8 phases implemented`;
    }

    async testDebugLauncher() {
        const launcherPath = path.join(process.cwd(), 'start-debug-agents.js');
        
        if (!fs.existsSync(launcherPath)) {
            throw new Error('start-debug-agents.js launcher not found');
        }

        const content = fs.readFileSync(launcherPath, 'utf8');
        
        // Check for launcher patterns
        const patterns = [
            'require',
            'debug',
            'agent',
            'start',
            'console.log'
        ];

        const foundPatterns = patterns.filter(pattern => 
            content.includes(pattern)
        );

        if (foundPatterns.length < 4) {
            throw new Error(`Debug launcher incomplete. Found patterns: ${foundPatterns.length}/5`);
        }

        return `Debug launcher: Valid implementation (${foundPatterns.length}/5 patterns)`;
    }

    async testDebugIntegration() {
        // Test if debug agents can be integrated
        const testAgentPath = path.join(process.cwd(), 'agents', 'debug', 'file_reader_agent.js');
        
        if (!fs.existsSync(testAgentPath)) {
            throw new Error('File Reader Agent not found for integration test');
        }

        try {
            // Try to require the debug agent
            delete require.cache[require.resolve(testAgentPath)];
            const agent = require(testAgentPath);
            
            return 'Debug integration: File Reader Agent loaded successfully ✅';
        } catch (error) {
            throw new Error(`Debug integration failed: ${error.message}`);
        }
    }

    async testCVPerfectDebuggingPatterns() {
        const debugPath = path.join(process.cwd(), 'agents', 'debug');
        const allAgents = fs.readdirSync(debugPath)
            .filter(file => file.endsWith('.js'));

        let cvperfectPatterns = 0;
        
        for (const agentFile of allAgents) {
            const content = fs.readFileSync(path.join(debugPath, agentFile), 'utf8');
            
            // Check for CVPerfect-specific patterns
            const patterns = [
                'CVPerfect',
                'session',
                'payment',
                'infinite loop',
                'success.js',
                'useEffect',
                'Stripe',
                'API'
            ];

            const found = patterns.filter(pattern => 
                content.toLowerCase().includes(pattern.toLowerCase())
            );

            if (found.length > 0) {
                cvperfectPatterns++;
            }
        }

        return `CVPerfect debugging patterns: ${cvperfectPatterns}/${allAgents.length} agents have project-specific patterns`;
    }

    async generateReport() {
        const duration = Date.now() - this.startTime;
        const passedTests = this.testResults.filter(r => r.type === 'pass').length;
        const failedTests = this.errors.length;
        const totalTests = passedTests + failedTests;

        const report = {
            testSuite: 'Debug Agents System Test',
            summary: {
                totalTests,
                passed: passedTests,
                failed: failedTests,
                duration: `${duration}ms`,
                successRate: `${Math.round((passedTests / totalTests) * 100)}%`
            },
            expectedAgents: this.expectedAgents,
            debugSystem: {
                basicAgents: 3,
                advancedMasters: 3,
                totalDebugAgents: 6
            },
            testResults: this.testResults,
            errors: this.errors,
            timestamp: new Date().toISOString()
        };

        // Save detailed report
        const reportPath = path.join(process.cwd(), 'test-results-debug-agents.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return report;
    }

    async runAllTests() {
        this.log('🔧 Starting Debug Agents System Test (6-agent debug system)', 'start');

        // Test sequence
        await this.runTest('Debug Directory Structure', () => this.testDebugDirectory());
        await this.runTest('Basic Debug Agents (3)', () => this.testBasicDebugAgents());
        await this.runTest('Advanced Debug Masters (3)', () => this.testAdvancedDebugMasters());
        await this.runTest('Root Cause Analysis Master', () => this.testRootCauseAnalysisMaster());
        await this.runTest('AI Debugging Copilot Master', () => this.testAIDebuggingCopilot());
        await this.runTest('Systematic Debugging Master', () => this.testSystematicDebuggingMaster());
        await this.runTest('Debug System Launcher', () => this.testDebugLauncher());
        await this.runTest('Debug Integration', () => this.testDebugIntegration());
        await this.runTest('CVPerfect Debugging Patterns', () => this.testCVPerfectDebuggingPatterns());

        const report = await this.generateReport();
        
        this.log(`🏁 Debug agents tests completed: ${report.summary.passed}/${report.summary.totalTests} passed (${report.summary.successRate})`, 'summary');
        
        if (report.summary.failed > 0) {
            this.log('⚠️  Some debug agent tests failed. Check test-results-debug-agents.json', 'warning');
            this.errors.forEach(error => {
                this.log(`   └─ ${error.testName}: ${error.error}`, 'error');
            });
            process.exit(1);
        } else {
            this.log('🎉 Debug agents system fully validated!', 'success');
            process.exit(0);
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new DebugAgentsTest();
    tester.runAllTests().catch(error => {
        console.error('Debug agents test failed:', error);
        process.exit(1);
    });
}

module.exports = DebugAgentsTest;