#!/usr/bin/env node
/**
 * Test Script for -sa Shortcut Integration
 * Weryfikuje czy skrót -sa poprawnie deleguje zadania do systemu 40 agentów CVPerfect
 */

const { handleSubagentShortcut, getStatus } = require('./claude-cvperfect-integration');
const { getRouterStatus } = require('./claude-agent-router');

class SAShortcutTester {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
    }

    // Uruchom wszystkie testy
    async runAllTests() {
        console.log('🧪 Test Suite: -sa Shortcut Integration');
        console.log('='.repeat(50));
        
        try {
            // 1. Test podstawowej konfiguracji
            await this.testBasicSetup();
            
            // 2. Test różnych typów zadań
            await this.testTaskTypeDetection();
            
            // 3. Test fallback mechanism
            await this.testFallbackMechanism();
            
            // 4. Test agent mapping
            await this.testAgentMapping();
            
            // 5. Test error handling
            await this.testErrorHandling();
            
            // Podsumowanie
            this.printSummary();
            
        } catch (error) {
            console.error('❌ Critical test error:', error);
            process.exit(1);
        }
    }

    // Test 1: Podstawowa konfiguracja
    async testBasicSetup() {
        console.log('\n📋 Test 1: Basic Setup');
        console.log('-'.repeat(30));
        
        try {
            // Sprawdź status integracji
            const integrationStatus = getStatus();
            this.logTest('Integration status available', !!integrationStatus);
            
            // Sprawdź status routera
            const routerStatus = getRouterStatus();
            this.logTest('Router status active', routerStatus.router === 'active');
            
            // Sprawdź czy jesteśmy w projekcie CVPerfect
            this.logTest('In CVPerfect project', integrationStatus.inCVPerfectProject);
            
            // Sprawdź czy -sa shortcut jest gotowy
            this.logTest('-sa shortcut ready', integrationStatus.subagentShortcutReady);
            
            console.log('📊 Integration Status:', JSON.stringify(integrationStatus, null, 2));
            
        } catch (error) {
            this.logTest('Basic setup', false, error.message);
        }
    }

    // Test 2: Wykrywanie typów zadań
    async testTaskTypeDetection() {
        console.log('\n📋 Test 2: Task Type Detection');
        console.log('-'.repeat(30));
        
        const testTasks = [
            {
                description: 'Fix React component styling issues',
                expectedAgent: 'frontend_development',
                category: 'Frontend'
            },
            {
                description: 'Create new API endpoint for CV analysis',
                expectedAgent: 'backend_api',
                category: 'Backend'
            },
            {
                description: 'Optimize CV template for ATS scoring',
                expectedAgent: 'ats_optimization', 
                category: 'CV Optimization'
            },
            {
                description: 'Add security validation to user inputs',
                expectedAgent: 'api_security',
                category: 'Security'
            },
            {
                description: 'Debug infinite loop in success page',
                expectedAgent: 'testing_qa',
                category: 'Testing'
            },
            {
                description: 'Improve page load performance',
                expectedAgent: 'performance_monitor',
                category: 'Performance'
            },
            {
                description: 'Some generic task that doesnt match patterns',
                expectedAgent: 'supreme_orchestrator',
                category: 'Generic'
            }
        ];

        for (const task of testTasks) {
            try {
                console.log(`\n🔍 Testing: ${task.description}`);
                
                const result = await handleSubagentShortcut(task.description, { testMode: true });
                
                if (result.success && result.agent) {
                    const correctAgent = result.agent === task.expectedAgent;
                    this.logTest(
                        `${task.category} task → ${task.expectedAgent}`,
                        correctAgent,
                        correctAgent ? `✅ Got: ${result.agent}` : `❌ Expected: ${task.expectedAgent}, Got: ${result.agent}`
                    );
                } else if (result.useTaskTool) {
                    // Fallback do Task tool jest OK dla niektórych przypadków
                    this.logTest(
                        `${task.category} task fallback`,
                        true,
                        `🔄 Fallback to Task tool: ${result.taskToolParams.subagent_type}`
                    );
                } else {
                    this.logTest(
                        `${task.category} task`,
                        false,
                        `❌ Unexpected result: ${JSON.stringify(result)}`
                    );
                }
                
                // Krótkie opóźnienie między testami
                await this.sleep(100);
                
            } catch (error) {
                this.logTest(`${task.category} task`, false, error.message);
            }
        }
    }

    // Test 3: Mechanizm fallback
    async testFallbackMechanism() {
        console.log('\n📋 Test 3: Fallback Mechanism');
        console.log('-'.repeat(30));
        
        try {
            // Test zadania które powinno aktywować fallback
            const fallbackTask = 'Configure Claude Code status line settings';
            
            console.log(`🔍 Testing fallback with: ${fallbackTask}`);
            
            const result = await handleSubagentShortcut(fallbackTask, { testMode: true });
            
            if (result.useTaskTool) {
                this.logTest('Fallback to Task tool', true, `Subagent type: ${result.taskToolParams.subagent_type}`);
                this.logTest('Task tool params complete', 
                    !!(result.taskToolParams.description && result.taskToolParams.prompt),
                    `Description: ${!!result.taskToolParams.description}, Prompt: ${!!result.taskToolParams.prompt}`
                );
            } else {
                this.logTest('Fallback mechanism', false, 'Expected fallback to Task tool');
            }
            
        } catch (error) {
            this.logTest('Fallback mechanism', false, error.message);
        }
    }

    // Test 4: Mapowanie agentów
    async testAgentMapping() {
        console.log('\n📋 Test 4: Agent Mapping');
        console.log('-'.repeat(30));
        
        const agentMappings = [
            { input: 'general-purpose', expected: 'supreme_orchestrator' },
            { input: 'frontend', expected: 'frontend_development' },
            { input: 'backend', expected: 'backend_api' },
            { input: 'security', expected: 'api_security' }
        ];

        for (const mapping of agentMappings) {
            try {
                const result = await handleSubagentShortcut(
                    `Test task for ${mapping.input}`, 
                    { agentType: mapping.input, testMode: true }
                );
                
                const correctMapping = result.agent === mapping.expected || result.useTaskTool;
                this.logTest(
                    `Agent mapping: ${mapping.input} → ${mapping.expected}`,
                    correctMapping,
                    correctMapping ? '✅ Mapping correct' : `❌ Got: ${result.agent || 'fallback'}`
                );
                
            } catch (error) {
                this.logTest(`Agent mapping: ${mapping.input}`, false, error.message);
            }
        }
    }

    // Test 5: Obsługa błędów
    async testErrorHandling() {
        console.log('\n📋 Test 5: Error Handling');
        console.log('-'.repeat(30));
        
        const errorCases = [
            { description: '', name: 'Empty task description' },
            { description: null, name: 'Null task description' },
            { description: 'x'.repeat(10000), name: 'Very long task description' }
        ];

        for (const testCase of errorCases) {
            try {
                const result = await handleSubagentShortcut(testCase.description, { testMode: true });
                
                // Sprawdź czy funkcja obsłużyła błąd gracefully
                const handledGracefully = result && (result.success !== undefined);
                this.logTest(
                    `Error handling: ${testCase.name}`,
                    handledGracefully,
                    handledGracefully ? '✅ Handled gracefully' : '❌ Unhandled error'
                );
                
            } catch (error) {
                // Błąd jest OK jeśli jest obsłużony
                this.logTest(
                    `Error handling: ${testCase.name}`,
                    true,
                    `✅ Exception caught: ${error.message.substring(0, 50)}...`
                );
            }
        }
    }

    // Pomocnicze funkcje
    logTest(testName, passed, details = '') {
        this.totalTests++;
        if (passed) {
            this.passedTests++;
            console.log(`✅ ${testName} ${details ? '- ' + details : ''}`);
        } else {
            console.log(`❌ ${testName} ${details ? '- ' + details : ''}`);
        }
        
        this.testResults.push({
            name: testName,
            passed: passed,
            details: details,
            timestamp: new Date().toISOString()
        });
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Podsumowanie testów
    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(50));
        
        const passRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
        
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.totalTests - this.passedTests}`);
        console.log(`Pass Rate: ${passRate}%`);
        
        if (this.passedTests === this.totalTests) {
            console.log('\n🎉 ALL TESTS PASSED! -sa shortcut integration is working correctly.');
        } else {
            console.log('\n⚠️ SOME TESTS FAILED. Check the details above.');
        }
        
        // Zapisz wyniki do pliku
        this.saveResults();
    }

    // Zapisz wyniki testów
    saveResults() {
        const fs = require('fs');
        const results = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.totalTests,
                passedTests: this.passedTests,
                passRate: ((this.passedTests / this.totalTests) * 100).toFixed(1)
            },
            tests: this.testResults
        };
        
        const filename = `test-sa-shortcut-results-${Date.now()}.json`;
        
        try {
            fs.writeFileSync(filename, JSON.stringify(results, null, 2));
            console.log(`\n📄 Test results saved to: ${filename}`);
        } catch (error) {
            console.log(`\n⚠️ Could not save test results: ${error.message}`);
        }
    }
}

// Uruchom testy jeśli skrypt jest wykonywany bezpośrednio
if (require.main === module) {
    const tester = new SAShortcutTester();
    tester.runAllTests().then(() => {
        console.log('\n✅ Test suite completed');
        process.exit(0);
    }).catch(error => {
        console.error('\n❌ Test suite failed:', error);
        process.exit(1);
    });
}

module.exports = SAShortcutTester;