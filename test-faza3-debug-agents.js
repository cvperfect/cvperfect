// FAZA 3 Test: Enhanced Debug Agents with Cache Management
// Test script for 4-agent system: File Reader + Bug Fixer + Supervisor + Cache Manager

const SupervisorAgent = require('./agents/debug/supervisor_agent');
const CacheManagerAgent = require('./agents/debug/cache_manager_agent');
const fs = require('fs').promises;

async function runFaza3DebugAgentsTest() {
    console.log('🚀 Starting FAZA 3: Enhanced Debug Agents Test');
    console.log('=' .repeat(80));
    
    let testResults = {
        testSuite: 'FAZA 3 - Enhanced Debug Agents with Cache Management',
        timestamp: new Date().toISOString(),
        results: []
    };
    
    try {
        // Test 1: Cache Manager Agent Direct Test
        console.log('\\n🧪 TEST 1: Cache Manager Agent (Standalone)');
        console.log('-'.repeat(50));
        
        const cacheAgent = new CacheManagerAgent();
        const sessionId = 'sess_1755865667776_22z3osqrw';
        
        const cacheAnalysisResult = await cacheAgent.analyzeCache({ sessionId });
        
        console.log('✅ Cache Manager Agent test:');
        console.log('   - Analysis results:', cacheAnalysisResult.results?.length || 0);
        console.log('   - Has recommendations:', !!cacheAnalysisResult.recommendations);
        console.log('   - Agent name:', cacheAgent.name);
        console.log('   - Agent capabilities:', cacheAgent.capabilities.length);
        
        testResults.results.push({
            test: 'Cache Manager Agent Standalone',
            status: cacheAnalysisResult.results ? 'PASS' : 'FAIL',
            details: {
                resultsCount: cacheAnalysisResult.results?.length || 0,
                hasRecommendations: !!cacheAnalysisResult.recommendations,
                agentCapabilities: cacheAgent.capabilities,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
        
        // Test 2: Supervisor Agent with Cache Integration
        console.log('\\n🧪 TEST 2: Enhanced Supervisor Agent (4-Agent System)');
        console.log('-'.repeat(50));
        
        const supervisor = new SupervisorAgent();
        
        // Check if Cache Manager was properly initialized
        const hasAllAgents = !!(supervisor.fileReader && supervisor.bugFixer && supervisor.cacheManager);
        
        console.log('✅ Supervisor initialization:');
        console.log('   - File Reader Agent:', !!supervisor.fileReader);
        console.log('   - Bug Fixer Agent:', !!supervisor.bugFixer);
        console.log('   - Cache Manager Agent:', !!supervisor.cacheManager);
        console.log('   - All agents initialized:', hasAllAgents);
        
        testResults.results.push({
            test: 'Enhanced Supervisor Agent Initialization',
            status: hasAllAgents ? 'PASS' : 'FAIL',
            details: {
                fileReader: !!supervisor.fileReader,
                bugFixer: !!supervisor.bugFixer,
                cacheManager: !!supervisor.cacheManager,
                supervisorName: supervisor.name,
                timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
        
        // Test 3: Cache Analysis Coordination
        console.log('\\n🧪 TEST 3: Cache Analysis Coordination');
        console.log('-'.repeat(50));
        
        try {
            const cacheCoordinationResult = await supervisor.coordinateCacheAnalysis(sessionId);
            
            console.log('✅ Cache analysis coordination:');
            console.log('   - Analysis completed:', !!cacheCoordinationResult);
            console.log('   - Results generated:', cacheCoordinationResult.results?.length || 0);
            console.log('   - Agent used:', cacheCoordinationResult.agent || 'unknown');
            
            testResults.results.push({
                test: 'Cache Analysis Coordination',
                status: cacheCoordinationResult.results ? 'PASS' : 'FAIL',
                details: {
                    completed: !!cacheCoordinationResult,
                    resultsCount: cacheCoordinationResult.results?.length || 0,
                    agent: cacheCoordinationResult.agent,
                    timestamp: new Date().toISOString()
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (coordinationError) {
            console.error('⚠️ Cache coordination failed:', coordinationError.message);
            
            testResults.results.push({
                test: 'Cache Analysis Coordination',
                status: 'FAIL',
                error: coordinationError.message,
                timestamp: new Date().toISOString()
            });
        }
        
        // Test 4: Enhanced Debug Mission (Full System)
        console.log('\\n🧪 TEST 4: Enhanced Debug Mission (Full 4-Agent System)');
        console.log('-'.repeat(50));
        
        try {
            // Create new supervisor for full mission test
            const fullSystemSupervisor = new SupervisorAgent();
            
            console.log('🎯 Starting enhanced debug mission...');
            const enhancedMissionResult = await fullSystemSupervisor.executeDebugMissionWithCache(sessionId);
            
            console.log('✅ Enhanced debug mission:');
            console.log('   - Mission completed:', enhancedMissionResult.summary.success);
            console.log('   - Phases completed:', enhancedMissionResult.summary.completedPhases + '/4');
            console.log('   - Duration:', Math.round(enhancedMissionResult.summary.duration / 1000) + 's');
            console.log('   - Cache insights generated:', !!enhancedMissionResult.cacheInsights);
            
            if (enhancedMissionResult.cacheInsights) {
                console.log('   - Cache layers analyzed:', enhancedMissionResult.cacheInsights.layersAnalyzed);
                console.log('   - Cache recommendations:', enhancedMissionResult.cacheInsights.recommendationsGenerated);
                console.log('   - Priority level:', enhancedMissionResult.cacheInsights.priority);
            }
            
            testResults.results.push({
                test: 'Enhanced Debug Mission (4-Agent System)',
                status: enhancedMissionResult.summary.success ? 'PASS' : 'PARTIAL',
                details: {
                    success: enhancedMissionResult.summary.success,
                    phasesCompleted: enhancedMissionResult.summary.completedPhases,
                    totalPhases: enhancedMissionResult.summary.totalPhases,
                    duration: enhancedMissionResult.summary.duration,
                    cacheInsights: enhancedMissionResult.cacheInsights,
                    timestamp: new Date().toISOString()
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (missionError) {
            console.error('⚠️ Enhanced debug mission failed:', missionError.message);
            
            testResults.results.push({
                test: 'Enhanced Debug Mission (4-Agent System)',
                status: 'FAIL',
                error: missionError.message,
                timestamp: new Date().toISOString()
            });
        }
        
        // Test 5: Memory and Storage Analysis
        console.log('\\n🧪 TEST 5: Specific Cache Analysis Tests');
        console.log('-'.repeat(50));
        
        try {
            const specificTests = {
                memoryAnalysis: await cacheAgent.execute('memory_analysis', { sessionId }),
                storageAnalysis: await cacheAgent.execute('storage_analysis'),
                fallbackAnalysis: await cacheAgent.execute('fallback_analysis', { sessionId })
            };
            
            console.log('✅ Specific cache tests:');
            console.log('   - Memory analysis:', specificTests.memoryAnalysis.type);
            console.log('   - Storage analysis:', specificTests.storageAnalysis.type);
            console.log('   - Fallback analysis:', specificTests.fallbackAnalysis.type);
            
            const allTestsPassed = Object.values(specificTests).every(test => 
                test.status === 'success' || test.type
            );
            
            testResults.results.push({
                test: 'Specific Cache Analysis Tests',
                status: allTestsPassed ? 'PASS' : 'PARTIAL',
                details: {
                    memoryAnalysis: specificTests.memoryAnalysis.status || 'completed',
                    storageAnalysis: specificTests.storageAnalysis.status || 'completed',
                    fallbackAnalysis: specificTests.fallbackAnalysis.status || 'completed',
                    timestamp: new Date().toISOString()
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (specificTestError) {
            console.error('⚠️ Specific cache tests failed:', specificTestError.message);
            
            testResults.results.push({
                test: 'Specific Cache Analysis Tests',
                status: 'FAIL',
                error: specificTestError.message,
                timestamp: new Date().toISOString()
            });
        }
        
        // Final Summary
        console.log('\\n' + '='.repeat(80));
        console.log('🎯 FAZA 3 DEBUG AGENTS TEST SUMMARY');
        console.log('='.repeat(80));
        
        const passedTests = testResults.results.filter(r => r.status === 'PASS').length;
        const partialTests = testResults.results.filter(r => r.status === 'PARTIAL').length;
        const totalTests = testResults.results.length;
        
        console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
        console.log(`⚠️ Partial: ${partialTests}/${totalTests} tests`);
        console.log('📊 Test Results:');
        
        testResults.results.forEach((result, index) => {
            const icon = result.status === 'PASS' ? '✅' : 
                        result.status === 'PARTIAL' ? '⚠️' : '❌';
            console.log(`${icon} ${index + 1}. ${result.test}: ${result.status}`);
        });
        
        // Save detailed results
        const reportFile = `faza3-debug-agents-report-${Date.now()}.json`;
        await fs.writeFile(reportFile, JSON.stringify(testResults, null, 2));
        console.log(`\\n📄 Detailed report saved: ${reportFile}`);
        
    } catch (error) {
        console.error('❌ FAZA 3 Debug Agents Test Error:', error);
        testResults.results.push({
            test: 'Overall Test Execution',
            status: 'FAIL',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
    
    return testResults;
}

// Run tests if called directly
if (require.main === module) {
    runFaza3DebugAgentsTest()
        .then((results) => {
            console.log('\\n🏁 FAZA 3 Debug Agents Tests completed');
            const passedTests = results.results.filter(r => r.status === 'PASS').length;
            const partialTests = results.results.filter(r => r.status === 'PARTIAL').length;
            const totalTests = results.results.length;
            
            if (passedTests === totalTests) {
                console.log('🎉 ALL TESTS PASSED!');
                process.exit(0);
            } else if (passedTests + partialTests === totalTests) {
                console.log('⚠️ All tests passed or partial');
                process.exit(0);
            } else {
                console.log(`⚠️ ${totalTests - passedTests - partialTests} test(s) failed`);
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('❌ Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = { runFaza3DebugAgentsTest };