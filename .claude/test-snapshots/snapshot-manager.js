#!/usr/bin/env node

/**
 * CVPerfect Test Snapshot Manager
 * 
 * Comprehensive system for managing test state snapshots to prevent regressions.
 * Supports creating, comparing, and managing test baselines.
 * 
 * Usage:
 *   node snapshot-manager.js create [name]     - Create new snapshot
 *   node snapshot-manager.js compare [id1] [id2] - Compare snapshots  
 *   node snapshot-manager.js baseline         - Set current state as baseline
 *   node snapshot-manager.js validate         - Validate current state against baseline
 *   node snapshot-manager.js cleanup [days]   - Clean old snapshots
 *   node snapshot-manager.js report           - Generate regression report
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const SNAPSHOTS_DIR = path.resolve(__dirname);

// Test suite configuration
const TEST_SUITE = {
    critical: [
        { name: 'build', command: 'npm run build', timeout: 120000 },
        { name: 'lint', command: 'npm run lint', timeout: 30000 }
    ],
    functional: [
        { name: 'main_page', script: 'test-main-page.js', timeout: 60000 },
        { name: 'payment_flow', script: 'test-stripe-payment-flow.js', timeout: 90000 },
        { name: 'success_functions', script: 'test-all-success-functions.js', timeout: 60000 },
        { name: 'api_endpoints', script: 'test-api-endpoints.js', timeout: 75000 },
        { name: 'responsive', script: 'test-responsive.js', timeout: 45000 },
        { name: 'agents_integration', script: 'test-agents-integration.js', timeout: 30000 }
    ],
    performance: [
        { name: 'bundle_size', script: 'test-bundle-size.js', timeout: 30000 },
        { name: 'page_load', script: 'test-performance.js', timeout: 60000 }
    ]
};

class SnapshotManager {
    constructor() {
        this.ensureDirectoryExists();
    }

    ensureDirectoryExists() {
        if (!fs.existsSync(SNAPSHOTS_DIR)) {
            fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
        }
    }

    generateTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    }

    async runTest(test) {
        const startTime = Date.now();
        
        try {
            console.log(`  Running ${test.name}...`);
            
            let command;
            if (test.command) {
                command = test.command;
            } else if (test.script) {
                command = `node ${test.script}`;
            } else {
                throw new Error(`No command or script defined for test: ${test.name}`);
            }

            // Check if test file exists for script-based tests
            if (test.script && !fs.existsSync(path.join(PROJECT_ROOT, test.script))) {
                console.log(`    ⚠️ ${test.name}: SKIP (test file not found)`);
                return {
                    name: test.name,
                    status: 'SKIP',
                    reason: 'test_file_not_found',
                    duration: Date.now() - startTime
                };
            }

            // Run the test with timeout
            const options = {
                cwd: PROJECT_ROOT,
                timeout: test.timeout || 30000,
                stdio: 'pipe'
            };

            const result = execSync(command, options);
            
            console.log(`    ✅ ${test.name}: PASS`);
            return {
                name: test.name,
                status: 'PASS',
                duration: Date.now() - startTime,
                output: result.toString().trim().slice(-500) // Last 500 chars
            };

        } catch (error) {
            console.log(`    ❌ ${test.name}: FAIL`);
            return {
                name: test.name,
                status: 'FAIL',
                duration: Date.now() - startTime,
                error: error.message.slice(0, 500), // First 500 chars
                exitCode: error.status
            };
        }
    }

    async runTestSuite(suites = ['critical', 'functional']) {
        console.log('🧪 Running test suite...');
        
        const results = {
            timestamp: new Date().toISOString(),
            suites: {},
            summary: { total: 0, pass: 0, fail: 0, skip: 0 }
        };

        for (const suiteName of suites) {
            if (!TEST_SUITE[suiteName]) {
                console.log(`⚠️ Unknown test suite: ${suiteName}`);
                continue;
            }

            console.log(`📋 Running ${suiteName} tests...`);
            results.suites[suiteName] = [];

            for (const test of TEST_SUITE[suiteName]) {
                const testResult = await this.runTest(test);
                results.suites[suiteName].push(testResult);
                
                results.summary.total++;
                results.summary[testResult.status.toLowerCase()]++;
            }
        }

        return results;
    }

    async createSnapshot(name = null) {
        const timestamp = this.generateTimestamp();
        const snapshotName = name || `snapshot-${timestamp}`;
        const snapshotFile = path.join(SNAPSHOTS_DIR, `${snapshotName}.json`);

        console.log(`📸 Creating snapshot: ${snapshotName}`);

        // Collect system information
        const systemInfo = {
            node_version: process.version,
            platform: process.platform,
            cwd: process.cwd(),
            git_commit: this.getGitCommit(),
            git_branch: this.getGitBranch(),
            package_hash: this.getPackageHash()
        };

        // Run comprehensive test suite
        const testResults = await this.runTestSuite(['critical', 'functional']);

        const snapshot = {
            id: snapshotName,
            created_at: new Date().toISOString(),
            system_info: systemInfo,
            test_results: testResults,
            file_checksums: this.getCriticalFileChecksums(),
            metadata: {
                type: name ? 'named' : 'automatic',
                creator: 'snapshot-manager'
            }
        };

        fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2));
        
        console.log(`✅ Snapshot created: ${snapshotFile}`);
        console.log(`📊 Test Summary: ${testResults.summary.pass}/${testResults.summary.total} passed`);
        
        return snapshot;
    }

    async setBaseline() {
        console.log('📌 Setting current state as baseline...');
        
        const snapshot = await this.createSnapshot('baseline');
        const baselineFile = path.join(SNAPSHOTS_DIR, 'baseline.json');
        
        // Copy snapshot to baseline
        fs.writeFileSync(baselineFile, JSON.stringify(snapshot, null, 2));
        
        console.log(`✅ Baseline established: ${baselineFile}`);
        return snapshot;
    }

    async validateAgainstBaseline() {
        console.log('🔍 Validating against baseline...');
        
        const baselineFile = path.join(SNAPSHOTS_DIR, 'baseline.json');
        
        if (!fs.existsSync(baselineFile)) {
            console.log('⚠️ No baseline found. Creating baseline first...');
            return await this.setBaseline();
        }

        const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8'));
        const current = await this.runTestSuite(['critical', 'functional']);
        
        const comparison = this.compareSnapshots(baseline.test_results, current);
        
        // Save comparison report
        const reportFile = path.join(SNAPSHOTS_DIR, `validation-${this.generateTimestamp()}.json`);
        const report = {
            timestamp: new Date().toISOString(),
            baseline_id: baseline.id,
            baseline_created: baseline.created_at,
            current_results: current,
            comparison: comparison,
            status: comparison.regressions.length === 0 ? 'PASS' : 'FAIL'
        };

        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        // Display results
        if (comparison.regressions.length === 0) {
            console.log('✅ Validation PASSED - no regressions detected');
        } else {
            console.log(`❌ Validation FAILED - ${comparison.regressions.length} regressions detected:`);
            comparison.regressions.forEach(reg => {
                console.log(`  - ${reg.test}: ${reg.before_status} → ${reg.after_status}`);
            });
        }

        if (comparison.improvements.length > 0) {
            console.log(`🎉 ${comparison.improvements.length} improvements found:`);
            comparison.improvements.forEach(imp => {
                console.log(`  + ${imp.test}: ${imp.before_status} → ${imp.after_status}`);
            });
        }

        console.log(`📄 Full report saved to: ${reportFile}`);
        return report;
    }

    compareSnapshots(baseline, current) {
        const regressions = [];
        const improvements = [];
        const changes = [];

        // Get all test names from both results
        const allTests = new Set();
        
        Object.values(baseline.suites || {}).flat().forEach(test => allTests.add(test.name));
        Object.values(current.suites || {}).flat().forEach(test => allTests.add(test.name));

        allTests.forEach(testName => {
            const baselineTest = this.findTest(baseline, testName);
            const currentTest = this.findTest(current, testName);

            if (!baselineTest && !currentTest) return;

            const beforeStatus = baselineTest?.status || 'MISSING';
            const afterStatus = currentTest?.status || 'MISSING';

            if (beforeStatus !== afterStatus) {
                const change = {
                    test: testName,
                    before_status: beforeStatus,
                    after_status: afterStatus
                };

                if (beforeStatus === 'PASS' && afterStatus === 'FAIL') {
                    regressions.push(change);
                } else if (beforeStatus === 'FAIL' && afterStatus === 'PASS') {
                    improvements.push(change);
                } else {
                    changes.push(change);
                }
            }
        });

        return { regressions, improvements, changes };
    }

    findTest(results, testName) {
        if (!results.suites) return null;
        
        for (const suite of Object.values(results.suites)) {
            const test = suite.find(t => t.name === testName);
            if (test) return test;
        }
        return null;
    }

    getGitCommit() {
        try {
            return execSync('git rev-parse HEAD', { cwd: PROJECT_ROOT, stdio: 'pipe' }).toString().trim();
        } catch {
            return 'unknown';
        }
    }

    getGitBranch() {
        try {
            return execSync('git branch --show-current', { cwd: PROJECT_ROOT, stdio: 'pipe' }).toString().trim();
        } catch {
            return 'unknown';
        }
    }

    getPackageHash() {
        try {
            const packagePath = path.join(PROJECT_ROOT, 'package.json');
            const content = fs.readFileSync(packagePath, 'utf8');
            const crypto = require('crypto');
            return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
        } catch {
            return 'unknown';
        }
    }

    getCriticalFileChecksums() {
        const criticalFiles = [
            'pages/index.js',
            'pages/success.js',
            'pages/api/analyze.js',
            'pages/api/create-checkout-session.js',
            'package.json'
        ];

        const checksums = {};
        const crypto = require('crypto');

        criticalFiles.forEach(file => {
            try {
                const filePath = path.join(PROJECT_ROOT, file);
                const content = fs.readFileSync(filePath, 'utf8');
                checksums[file] = crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
            } catch {
                checksums[file] = 'missing';
            }
        });

        return checksums;
    }

    cleanup(daysOld = 7) {
        console.log(`🧹 Cleaning snapshots older than ${daysOld} days...`);
        
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        const files = fs.readdirSync(SNAPSHOTS_DIR);
        let cleaned = 0;

        files.forEach(file => {
            if (file.endsWith('.json') && file !== 'baseline.json') {
                const filePath = path.join(SNAPSHOTS_DIR, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime.getTime() < cutoffTime) {
                    fs.unlinkSync(filePath);
                    console.log(`  🗑️ Removed: ${file}`);
                    cleaned++;
                }
            }
        });

        console.log(`✅ Cleaned ${cleaned} old snapshot files`);
    }

    generateReport() {
        console.log('📊 Generating regression report...');
        
        const files = fs.readdirSync(SNAPSHOTS_DIR);
        const snapshots = [];
        const validations = [];

        files.forEach(file => {
            if (file.endsWith('.json')) {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, file), 'utf8'));
                    
                    if (file.startsWith('validation-')) {
                        validations.push(data);
                    } else if (file !== 'baseline.json') {
                        snapshots.push(data);
                    }
                } catch (error) {
                    console.log(`  ⚠️ Error reading ${file}: ${error.message}`);
                }
            }
        });

        const report = {
            generated_at: new Date().toISOString(),
            summary: {
                total_snapshots: snapshots.length,
                recent_validations: validations.length,
                last_validation: validations.length > 0 ? validations[validations.length - 1] : null
            },
            recent_snapshots: snapshots.slice(-5),
            recent_validations: validations.slice(-3)
        };

        const reportFile = path.join(SNAPSHOTS_DIR, `report-${this.generateTimestamp()}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        console.log(`📄 Report saved to: ${reportFile}`);
        
        if (report.summary.last_validation) {
            const lastValidation = report.summary.last_validation;
            console.log(`\n📋 Last Validation Summary:`);
            console.log(`  Status: ${lastValidation.status}`);
            console.log(`  Date: ${new Date(lastValidation.timestamp).toLocaleString()}`);
            
            if (lastValidation.comparison.regressions.length > 0) {
                console.log(`  Regressions: ${lastValidation.comparison.regressions.length}`);
            }
            if (lastValidation.comparison.improvements.length > 0) {
                console.log(`  Improvements: ${lastValidation.comparison.improvements.length}`);
            }
        }

        return report;
    }
}

// CLI Interface
async function main() {
    const manager = new SnapshotManager();
    const [,, command, ...args] = process.argv;

    try {
        switch (command) {
            case 'create':
                await manager.createSnapshot(args[0]);
                break;
                
            case 'baseline':
                await manager.setBaseline();
                break;
                
            case 'validate':
                await manager.validateAgainstBaseline();
                break;
                
            case 'cleanup':
                manager.cleanup(parseInt(args[0]) || 7);
                break;
                
            case 'report':
                manager.generateReport();
                break;
                
            default:
                console.log('Usage:');
                console.log('  node snapshot-manager.js create [name]   - Create new snapshot');
                console.log('  node snapshot-manager.js baseline       - Set current as baseline');
                console.log('  node snapshot-manager.js validate       - Validate against baseline');
                console.log('  node snapshot-manager.js cleanup [days] - Clean old snapshots');
                console.log('  node snapshot-manager.js report         - Generate regression report');
                process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = SnapshotManager;