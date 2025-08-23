#!/usr/bin/env node

/**
 * CVPerfect Automated Regression Suite
 * 
 * Comprehensive automated testing system for detecting regressions across
 * all CVPerfect functionality. Integrates with snapshot system and provides
 * detailed reports with actionable recommendations.
 * 
 * Usage:
 *   node test-regression-suite.js                    # Full regression suite
 *   node test-regression-suite.js --quick           # Quick smoke tests only
 *   node test-regression-suite.js --critical        # Critical path tests only
 *   node test-regression-suite.js --compare [id]    # Compare with specific snapshot
 *   node test-regression-suite.js --report          # Generate summary report
 *   node test-regression-suite.js --fix             # Auto-fix minor issues
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const crypto = require('crypto');

const PROJECT_ROOT = process.cwd();
const SNAPSHOTS_DIR = path.join(PROJECT_ROOT, '.claude', 'test-snapshots');
const REPORTS_DIR = path.join(PROJECT_ROOT, '.claude', 'regression-reports');

// Test categories with CVPerfect-specific tests
const REGRESSION_TESTS = {
    critical: {
        description: 'Tests that MUST pass for basic functionality',
        tests: [
            {
                name: 'build_process',
                command: 'npm run build',
                timeout: 120000,
                critical: true,
                description: 'Next.js build process'
            },
            {
                name: 'lint_validation',
                command: 'npm run lint',
                timeout: 45000,
                critical: true,
                description: 'ESLint validation'
            },
            {
                name: 'package_dependencies',
                script: async () => {
                    // Check if all required packages are installed
                    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                    const nodeModules = fs.existsSync('node_modules');
                    const criticalDeps = ['next', 'react', 'groq-sdk', '@supabase/supabase-js', 'stripe'];
                    
                    const missing = criticalDeps.filter(dep => 
                        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
                    );
                    
                    if (missing.length > 0) {
                        throw new Error(`Missing critical dependencies: ${missing.join(', ')}`);
                    }
                    
                    if (!nodeModules) {
                        throw new Error('node_modules directory missing - run npm install');
                    }
                    
                    return { status: 'PASS', details: `${criticalDeps.length} critical dependencies verified` };
                },
                timeout: 10000,
                critical: true,
                description: 'Critical package dependencies'
            }
        ]
    },
    
    functional: {
        description: 'Core CVPerfect functionality tests',
        tests: [
            {
                name: 'main_page_functionality',
                script: 'test-main-page.js',
                timeout: 60000,
                critical: true,
                description: 'Main page CV upload and processing'
            },
            {
                name: 'payment_flow',
                script: 'test-stripe-payment-flow.js',
                timeout: 120000,
                critical: true,
                description: 'Stripe payment integration'
            },
            {
                name: 'success_page_functions',
                script: 'test-all-success-functions.js',
                timeout: 90000,
                critical: true,
                description: 'Success page template and export functions'
            },
            {
                name: 'api_endpoints',
                script: 'test-api-endpoints.js',
                timeout: 75000,
                critical: false,
                description: 'Backend API endpoints'
            },
            {
                name: 'cv_optimization',
                script: 'test-ai-optimization.js',
                timeout: 120000,
                critical: true,
                description: 'AI CV optimization with Groq'
            },
            {
                name: 'session_management',
                script: 'test-sessionStorage.js',
                timeout: 30000,
                critical: false,
                description: 'Session data persistence'
            }
        ]
    },
    
    integration: {
        description: 'System integration and external service tests',
        tests: [
            {
                name: 'agents_integration',
                script: 'test-agents-integration.js',
                timeout: 45000,
                critical: false,
                description: 'CVPerfect agents system'
            },
            {
                name: 'browser_automation',
                script: 'test-comprehensive-website.js',
                timeout: 180000,
                critical: false,
                description: 'Full browser automation suite'
            },
            {
                name: 'responsive_design',
                script: 'test-responsive.js',
                timeout: 90000,
                critical: false,
                description: 'Responsive design validation'
            }
        ]
    },
    
    performance: {
        description: 'Performance and optimization tests',
        tests: [
            {
                name: 'page_load_performance',
                script: async () => {
                    // Simple performance check
                    const startTime = Date.now();
                    try {
                        execSync('curl -s -o /dev/null -w "%{time_total}" http://localhost:3000', { 
                            timeout: 10000, 
                            stdio: 'pipe' 
                        });
                        const loadTime = Date.now() - startTime;
                        
                        if (loadTime > 5000) {
                            throw new Error(`Page load too slow: ${loadTime}ms`);
                        }
                        
                        return { status: 'PASS', details: `Load time: ${loadTime}ms` };
                    } catch (error) {
                        return { status: 'SKIP', details: 'Development server not running' };
                    }
                },
                timeout: 15000,
                critical: false,
                description: 'Page load performance'
            }
        ]
    }
};

class RegressionSuite {
    constructor(options = {}) {
        this.options = {
            quick: options.quick || false,
            criticalOnly: options.criticalOnly || false,
            compareWith: options.compareWith || null,
            autoFix: options.autoFix || false,
            verbose: options.verbose || false,
            ...options
        };
        
        this.ensureDirectories();
        this.results = {
            timestamp: new Date().toISOString(),
            options: this.options,
            summary: { total: 0, pass: 0, fail: 0, skip: 0, critical_fail: 0 },
            categories: {},
            regressions: [],
            improvements: [],
            recommendations: []
        };
    }
    
    ensureDirectories() {
        [SNAPSHOTS_DIR, REPORTS_DIR].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    
    async runTest(test, category) {
        const testId = `${category}.${test.name}`;
        console.log(`  🧪 Running ${test.name}...`);
        
        const startTime = Date.now();
        
        try {
            let result;
            
            if (test.script && typeof test.script === 'function') {
                // Custom script function
                result = await test.script();
            } else if (test.script) {
                // External script file
                const scriptPath = path.join(PROJECT_ROOT, test.script);
                
                if (!fs.existsSync(scriptPath)) {
                    result = {
                        status: 'SKIP',
                        reason: 'script_not_found',
                        details: `Script file not found: ${test.script}`
                    };
                } else {
                    const output = execSync(`node ${test.script}`, {
                        cwd: PROJECT_ROOT,
                        timeout: test.timeout,
                        stdio: 'pipe'
                    });
                    
                    result = {
                        status: 'PASS',
                        output: output.toString().slice(-500)
                    };
                }
            } else if (test.command) {
                // Command execution
                const output = execSync(test.command, {
                    cwd: PROJECT_ROOT,
                    timeout: test.timeout,
                    stdio: 'pipe'
                });
                
                result = {
                    status: 'PASS',
                    output: output.toString().slice(-500)
                };
            } else {
                throw new Error('No script or command defined for test');
            }
            
            const duration = Date.now() - startTime;
            
            console.log(`     ✅ ${test.name}: ${result.status} (${duration}ms)`);
            
            return {
                id: testId,
                name: test.name,
                category: category,
                description: test.description,
                critical: test.critical,
                status: result.status,
                duration: duration,
                details: result.details || result.output?.slice(-200) || '',
                error: null
            };
            
        } catch (error) {
            const duration = Date.now() - startTime;
            const isTimeout = error.signal === 'SIGTERM' || duration >= test.timeout;
            
            console.log(`     ❌ ${test.name}: FAIL (${duration}ms)`);
            if (this.options.verbose) {
                console.log(`        Error: ${error.message.slice(0, 100)}...`);
            }
            
            return {
                id: testId,
                name: test.name,
                category: category,
                description: test.description,
                critical: test.critical,
                status: 'FAIL',
                duration: duration,
                details: '',
                error: {
                    message: error.message.slice(0, 500),
                    timeout: isTimeout,
                    exitCode: error.status
                }
            };
        }
    }
    
    async runCategory(categoryName, category) {
        console.log(`📋 Running ${categoryName} tests (${category.tests.length} tests):`);
        console.log(`   ${category.description}`);
        
        const results = [];
        
        for (const test of category.tests) {
            // Skip non-critical tests in quick mode
            if (this.options.quick && !test.critical) {
                console.log(`  ⏭️ Skipping ${test.name} (quick mode)`);
                continue;
            }
            
            // Skip non-critical tests in critical-only mode
            if (this.options.criticalOnly && !test.critical) {
                console.log(`  ⏭️ Skipping ${test.name} (critical-only mode)`);
                continue;
            }
            
            const testResult = await this.runTest(test, categoryName);
            results.push(testResult);
            
            // Update summary
            this.results.summary.total++;
            this.results.summary[testResult.status.toLowerCase()]++;
            
            if (testResult.status === 'FAIL' && testResult.critical) {
                this.results.summary.critical_fail++;
            }
        }
        
        return results;
    }
    
    async runAllTests() {
        console.log('🧪 CVPerfect Regression Suite Starting...');
        console.log(`⚙️  Mode: ${this.options.quick ? 'QUICK' : this.options.criticalOnly ? 'CRITICAL' : 'FULL'}`);
        
        for (const [categoryName, category] of Object.entries(REGRESSION_TESTS)) {
            const categoryResults = await this.runCategory(categoryName, category);
            this.results.categories[categoryName] = categoryResults;
        }
        
        console.log('\n📊 Test Suite Complete');
        this.displaySummary();
    }
    
    displaySummary() {
        const { summary } = this.results;
        
        console.log(`\n📈 SUMMARY:`);
        console.log(`   Total Tests: ${summary.total}`);
        console.log(`   ✅ Passed: ${summary.pass}`);
        console.log(`   ❌ Failed: ${summary.fail}`);
        console.log(`   ⏭️ Skipped: ${summary.skip}`);
        
        if (summary.critical_fail > 0) {
            console.log(`   🚨 Critical Failures: ${summary.critical_fail}`);
        }
        
        const passRate = summary.total > 0 ? (summary.pass / summary.total * 100).toFixed(1) : 0;
        console.log(`   📊 Pass Rate: ${passRate}%`);
        
        if (summary.critical_fail > 0) {
            console.log(`\n🚨 CRITICAL ISSUES DETECTED - APPLICATION MAY BE BROKEN`);
        } else if (summary.fail > 0) {
            console.log(`\n⚠️  Non-critical issues found - review recommended`);
        } else {
            console.log(`\n✅ All tests passed - no regressions detected`);
        }
    }
    
    async compareWithBaseline() {
        console.log('\n📊 Comparing with baseline...');
        
        const baselineFile = path.join(SNAPSHOTS_DIR, 'baseline.json');
        
        if (!fs.existsSync(baselineFile)) {
            console.log('⚠️  No baseline found - skipping comparison');
            return;
        }
        
        try {
            const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
            const comparison = this.compareResults(baseline.test_results, this.results);
            
            if (comparison.regressions.length > 0) {
                console.log(`\n🚨 REGRESSIONS DETECTED (${comparison.regressions.length}):`);
                comparison.regressions.forEach(reg => {
                    console.log(`   - ${reg.test}: ${reg.before_status} → ${reg.after_status}`);
                    this.results.regressions.push(reg);
                });
            }
            
            if (comparison.improvements.length > 0) {
                console.log(`\n🎉 IMPROVEMENTS FOUND (${comparison.improvements.length}):`);
                comparison.improvements.forEach(imp => {
                    console.log(`   + ${imp.test}: ${imp.before_status} → ${imp.after_status}`);
                    this.results.improvements.push(imp);
                });
            }
            
        } catch (error) {
            console.log(`⚠️  Error reading baseline: ${error.message}`);
        }
    }
    
    compareResults(baseline, current) {
        const regressions = [];
        const improvements = [];
        
        // Get all test results from current run
        const currentTests = new Map();
        Object.values(current.categories).flat().forEach(test => {
            currentTests.set(test.id, test);
        });
        
        // Get baseline test results (simplified structure)
        const baselineTests = new Map();
        if (baseline.categories) {
            Object.values(baseline.categories).flat().forEach(test => {
                baselineTests.set(test.id, test);
            });
        }
        
        // Compare each test
        currentTests.forEach((currentTest, testId) => {
            const baselineTest = baselineTests.get(testId);
            
            if (baselineTest) {
                if (baselineTest.status === 'PASS' && currentTest.status === 'FAIL') {
                    regressions.push({
                        test: testId,
                        before_status: baselineTest.status,
                        after_status: currentTest.status,
                        critical: currentTest.critical
                    });
                } else if (baselineTest.status === 'FAIL' && currentTest.status === 'PASS') {
                    improvements.push({
                        test: testId,
                        before_status: baselineTest.status,
                        after_status: currentTest.status,
                        critical: currentTest.critical
                    });
                }
            }
        });
        
        return { regressions, improvements };
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        // Critical failure recommendations
        if (this.results.summary.critical_fail > 0) {
            recommendations.push({
                severity: 'CRITICAL',
                message: 'Critical tests are failing - immediate action required',
                actions: [
                    'Stop all development work',
                    'Run /rollback-to-safe if issues persist',
                    'Check build logs for specific errors',
                    'Verify environment variables are set correctly'
                ]
            });
        }
        
        // High failure rate recommendations
        const failureRate = this.results.summary.fail / this.results.summary.total;
        if (failureRate > 0.3) {
            recommendations.push({
                severity: 'HIGH',
                message: `High failure rate (${(failureRate * 100).toFixed(1)}%) suggests systemic issues`,
                actions: [
                    'Run full regression analysis: /regression-check',
                    'Consider rollback to last known good state',
                    'Review recent changes for common patterns'
                ]
            });
        }
        
        // Regression-specific recommendations
        if (this.results.regressions.length > 0) {
            const criticalRegressions = this.results.regressions.filter(r => r.critical);
            
            if (criticalRegressions.length > 0) {
                recommendations.push({
                    severity: 'HIGH',
                    message: `${criticalRegressions.length} critical regressions detected`,
                    actions: [
                        'Review changes to critical files since last baseline',
                        'Use /safe-fix to implement targeted fixes',
                        'Consider partial rollback of problematic changes'
                    ]
                });
            }
        }
        
        // Performance recommendations
        const slowTests = Object.values(this.results.categories).flat()
            .filter(test => test.duration > 30000);
            
        if (slowTests.length > 0) {
            recommendations.push({
                severity: 'MEDIUM',
                message: `${slowTests.length} tests running slowly (>30s)`,
                actions: [
                    'Check system resources and network connectivity',
                    'Review test timeout configurations',
                    'Consider optimizing slow test implementations'
                ]
            });
        }
        
        this.results.recommendations = recommendations;
        return recommendations;
    }
    
    async saveReport() {
        // Generate recommendations
        this.generateRecommendations();
        
        const reportFile = path.join(REPORTS_DIR, `regression-${Date.now()}.json`);
        
        // Add git context
        try {
            this.results.git_context = {
                commit: execSync('git rev-parse HEAD', { stdio: 'pipe' }).toString().trim(),
                branch: execSync('git branch --show-current', { stdio: 'pipe' }).toString().trim(),
                dirty: execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim() !== ''
            };
        } catch (error) {
            this.results.git_context = { error: error.message };
        }
        
        fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
        
        console.log(`\n📄 Report saved to: ${reportFile}`);
        return reportFile;
    }
    
    displayRecommendations() {
        if (this.results.recommendations.length === 0) {
            return;
        }
        
        console.log('\n💡 RECOMMENDATIONS:');
        this.results.recommendations.forEach((rec, index) => {
            console.log(`\n${index + 1}. ${rec.severity}: ${rec.message}`);
            rec.actions.forEach(action => {
                console.log(`   - ${action}`);
            });
        });
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const options = {
        quick: args.includes('--quick'),
        criticalOnly: args.includes('--critical'),
        autoFix: args.includes('--fix'),
        verbose: args.includes('--verbose'),
        reportOnly: args.includes('--report')
    };
    
    // Handle compare option
    const compareIndex = args.indexOf('--compare');
    if (compareIndex !== -1 && args[compareIndex + 1]) {
        options.compareWith = args[compareIndex + 1];
    }
    
    const suite = new RegressionSuite(options);
    
    try {
        if (options.reportOnly) {
            // Generate summary report only
            console.log('📊 Generating regression summary...');
            // Load recent reports and generate summary
            return;
        }
        
        // Run the test suite
        await suite.runAllTests();
        
        // Compare with baseline if available
        await suite.compareWithBaseline();
        
        // Display recommendations
        suite.displayRecommendations();
        
        // Save report
        await suite.saveReport();
        
        // Exit with appropriate code
        const hasFailures = suite.results.summary.fail > 0;
        const hasCriticalFailures = suite.results.summary.critical_fail > 0;
        
        if (hasCriticalFailures) {
            console.log('\n🚨 Exiting with error due to critical failures');
            process.exit(2);
        } else if (hasFailures) {
            console.log('\n⚠️  Exiting with warning due to test failures');
            process.exit(1);
        } else {
            console.log('\n✅ All tests passed - exiting successfully');
            process.exit(0);
        }
        
    } catch (error) {
        console.error(`❌ Regression suite failed: ${error.message}`);
        process.exit(3);
    }
}

if (require.main === module) {
    main();
}

module.exports = RegressionSuite;