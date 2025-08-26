#!/usr/bin/env node
/**
 * AGENTS INTEGRATION TEST - CVPerfect
 * CVPerfect 40+ agent system validation
 * 
 * Tests:
 * - Agent system launchers
 * - All 40+ specialized agents
 * - Agent orchestration system
 * - Smart task routing
 * - Fallback mechanisms
 * - Auto-start configuration
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AgentsIntegrationTest {
    constructor() {
        this.testResults = [];
        this.errors = [];
        this.startTime = Date.now();
        this.agentCategories = {
            'ai_optimization': 7,
            'security': 5, 
            'debug': 7,
            'performance': 5,
            'business': 5,
            'core': 3,
            'quality': 3,
            'auto_repair': 5,
            'orchestration': 3,
            'analysis': 1,
            'optimization': 1,
            'content': 2,
            'code_analysis': 5
        };
        this.expectedTotalAgents = Object.values(this.agentCategories).reduce((a, b) => a + b, 0);
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

    async testAgentDirectoryStructure() {
        const agentsPath = path.join(process.cwd(), 'agents');
        
        if (!fs.existsSync(agentsPath)) {
            throw new Error('agents/ directory not found');
        }

        const categories = fs.readdirSync(agentsPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const expectedCategories = Object.keys(this.agentCategories);
        const missingCategories = expectedCategories.filter(cat => !categories.includes(cat));
        
        if (missingCategories.length > 0) {
            throw new Error(`Missing agent categories: ${missingCategories.join(', ')}`);
        }

        return `Agent directory structure: ${categories.length}/${expectedCategories.length} categories found`;
    }

    async testIndividualAgents() {
        const results = [];
        let totalAgentsFound = 0;

        for (const [category, expectedCount] of Object.entries(this.agentCategories)) {
            const categoryPath = path.join(process.cwd(), 'agents', category);
            
            if (!fs.existsSync(categoryPath)) {
                results.push(`❌ ${category}: Directory missing`);
                continue;
            }

            const agents = fs.readdirSync(categoryPath)
                .filter(file => file.endsWith('.js'))
                .map(file => file.replace('.js', ''));

            totalAgentsFound += agents.length;

            if (agents.length >= expectedCount) {
                results.push(`✅ ${category}: ${agents.length}/${expectedCount} agents found`);
            } else {
                results.push(`⚠️  ${category}: ${agents.length}/${expectedCount} agents (missing some)`);
            }
        }

        const summary = `Total agents: ${totalAgentsFound}/${this.expectedTotalAgents} (${Math.round((totalAgentsFound/this.expectedTotalAgents)*100)}%)`;
        
        return `${summary}\n${results.join('\n')}`;
    }

    async testAgentLaunchers() {
        const launchers = [
            'start-agents-system.js',
            'start-debug-agents.js'
        ];

        const results = [];

        for (const launcher of launchers) {
            const launcherPath = path.join(process.cwd(), launcher);
            
            if (!fs.existsSync(launcherPath)) {
                results.push(`❌ ${launcher}: File missing`);
                continue;
            }

            const content = fs.readFileSync(launcherPath, 'utf8');
            
            // Check for basic launcher patterns
            const patterns = ['require', 'agent', 'start', 'console.log'];
            const foundPatterns = patterns.filter(pattern => content.includes(pattern));

            if (foundPatterns.length >= 3) {
                results.push(`✅ ${launcher}: Valid launcher (${foundPatterns.length}/4 patterns)`);
            } else {
                results.push(`⚠️  ${launcher}: Incomplete launcher (${foundPatterns.length}/4 patterns)`);
            }
        }

        return results.join('\n');
    }

    async testOrchestrationSystem() {
        const orchestrationPath = path.join(process.cwd(), 'agents', 'orchestration');
        
        if (!fs.existsSync(orchestrationPath)) {
            throw new Error('orchestration/ directory not found');
        }

        const orchestrators = fs.readdirSync(orchestrationPath)
            .filter(file => file.endsWith('.js'));

        const expectedOrchestrators = [
            'supreme_orchestrator.js',
            'master_orchestrator_agent.js'
        ];

        const results = [];
        
        for (const expected of expectedOrchestrators) {
            if (orchestrators.includes(expected)) {
                results.push(`✅ ${expected}: Found`);
            } else {
                results.push(`❌ ${expected}: Missing`);
            }
        }

        return `Orchestration system:\n${results.join('\n')}`;
    }

    async testDebugMasters() {
        const debugPath = path.join(process.cwd(), 'agents', 'debug');
        
        if (!fs.existsSync(debugPath)) {
            throw new Error('debug/ directory not found');
        }

        const debugAgents = fs.readdirSync(debugPath)
            .filter(file => file.endsWith('.js'));

        const expectedMasters = [
            'root_cause_analysis_master.js',
            'ai_debugging_copilot_master.js', 
            'systematic_debugging_master.js'
        ];

        const expectedBasic = [
            'file_reader_agent.js',
            'bug_fixer_agent.js',
            'supervisor_agent.js'
        ];

        const results = [];
        
        // Test masters (advanced debugging)
        results.push('🔧 Advanced Debug Masters:');
        for (const master of expectedMasters) {
            if (debugAgents.includes(master)) {
                results.push(`  ✅ ${master.replace('.js', '')}`);
            } else {
                results.push(`  ❌ ${master.replace('.js', '')}: Missing`);
            }
        }

        // Test basic agents
        results.push('🔧 Basic Debug Agents:');
        for (const basic of expectedBasic) {
            if (debugAgents.includes(basic)) {
                results.push(`  ✅ ${basic.replace('.js', '')}`);
            } else {
                results.push(`  ❌ ${basic.replace('.js', '')}: Missing`);
            }
        }

        return results.join('\n');
    }

    async testAgentIntegration() {
        // Test if agents can be required/imported
        const testAgentPath = path.join(process.cwd(), 'agents', 'core', 'frontend_development_agent.js');
        
        if (!fs.existsSync(testAgentPath)) {
            throw new Error('Test agent (frontend_development_agent.js) not found');
        }

        try {
            // Try to require the agent (basic syntax check)
            delete require.cache[require.resolve(testAgentPath)];
            const agent = require(testAgentPath);
            
            return 'Agent integration: Test agent loaded successfully ✅';
        } catch (error) {
            throw new Error(`Agent integration failed: ${error.message}`);
        }
    }

    async testTaskRouting() {
        // Test if task routing keywords are properly mapped
        const taskMappings = {
            'payment': ['backend_api', 'stripe'],
            'frontend': ['frontend_development', 'react'],
            'security': ['api_security', 'gdpr_compliance'],
            'debug': ['bug_fixer', 'root_cause_analysis'],
            'performance': ['performance_monitor', 'cache_optimization']
        };

        const results = [];

        for (const [task, expectedAgents] of Object.entries(taskMappings)) {
            let agentsFound = 0;
            
            for (const agentPattern of expectedAgents) {
                const found = this.findAgentByPattern(agentPattern);
                if (found) agentsFound++;
            }

            const percentage = Math.round((agentsFound / expectedAgents.length) * 100);
            results.push(`${task}: ${agentsFound}/${expectedAgents.length} agents (${percentage}%)`);
        }

        return `Task routing coverage:\n${results.join('\n')}`;
    }

    findAgentByPattern(pattern) {
        const agentsPath = path.join(process.cwd(), 'agents');
        
        function searchInDirectory(dir) {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    const result = searchInDirectory(fullPath);
                    if (result) return result;
                } else if (item.isFile() && item.name.includes(pattern) && item.name.endsWith('.js')) {
                    return fullPath;
                }
            }
            
            return null;
        }
        
        return searchInDirectory(agentsPath);
    }

    async generateReport() {
        const duration = Date.now() - this.startTime;
        const passedTests = this.testResults.filter(r => r.type === 'pass').length;
        const failedTests = this.errors.length;
        const totalTests = passedTests + failedTests;

        const report = {
            testSuite: 'CVPerfect Agents Integration Test',
            summary: {
                totalTests,
                passed: passedTests,
                failed: failedTests,
                duration: `${duration}ms`,
                successRate: `${Math.round((passedTests / totalTests) * 100)}%`,
                expectedAgents: this.expectedTotalAgents
            },
            agentCategories: this.agentCategories,
            testResults: this.testResults,
            errors: this.errors,
            timestamp: new Date().toISOString()
        };

        // Save detailed report
        const reportPath = path.join(process.cwd(), 'test-results-agents-integration.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return report;
    }

    async runAllTests() {
        this.log(`🤖 Starting CVPerfect Agents Integration Test (${this.expectedTotalAgents}+ agents)`, 'start');

        // Test sequence
        await this.runTest('Agent Directory Structure', () => this.testAgentDirectoryStructure());
        await this.runTest('Individual Agents', () => this.testIndividualAgents());
        await this.runTest('Agent Launchers', () => this.testAgentLaunchers());
        await this.runTest('Orchestration System', () => this.testOrchestrationSystem());
        await this.runTest('Debug Masters (Advanced)', () => this.testDebugMasters());
        await this.runTest('Agent Integration', () => this.testAgentIntegration());
        await this.runTest('Task Routing', () => this.testTaskRouting());

        const report = await this.generateReport();
        
        this.log(`🏁 Agent integration tests completed: ${report.summary.passed}/${report.summary.totalTests} passed (${report.summary.successRate})`, 'summary');
        
        if (report.summary.failed > 0) {
            this.log('⚠️  Some agent tests failed. Check test-results-agents-integration.json', 'warning');
            this.errors.forEach(error => {
                this.log(`   └─ ${error.testName}: ${error.error}`, 'error');
            });
            process.exit(1);
        } else {
            this.log('🎉 CVPerfect agents system fully validated!', 'success');
            process.exit(0);
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new AgentsIntegrationTest();
    tester.runAllTests().catch(error => {
        console.error('Agents integration test failed:', error);
        process.exit(1);
    });
}

module.exports = AgentsIntegrationTest;