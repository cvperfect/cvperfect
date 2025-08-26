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
                error: error.message.slice(0, 500),
                code: error.status || -1
            };
        }
    }

    async createSnapshot(name = null) {
        const timestamp = this.generateTimestamp();
        const snapshotId = name ? `${name}-${timestamp}` : timestamp;
        const snapshotPath = path.join(SNAPSHOTS_DIR, `snapshot-${snapshotId}.json`);
        
        console.log(`📸 Creating snapshot: ${snapshotId}`);
        console.log(`🔄 Running test suite...`);
        
        const snapshot = {
            id: snapshotId,
            timestamp: new Date().toISOString(),
            name: name,
            git: this.getGitInfo(),
            system: this.getSystemInfo(),
            tests: {}
        };
        
        // Run all test suites
        for (const [category, tests] of Object.entries(TEST_SUITE)) {
            console.log(`\n🧪 ${category.toUpperCase()} Tests:`);
            snapshot.tests[category] = [];
            
            for (const test of tests) {
                const result = await this.runTest(test);
                snapshot.tests[category].push(result);
            }
        }
        
        // Calculate overall stats
        const allTests = Object.values(snapshot.tests).flat();
        snapshot.summary = {
            total: allTests.length,
            passed: allTests.filter(t => t.status === 'PASS').length,
            failed: allTests.filter(t => t.status === 'FAIL').length,
            skipped: allTests.filter(t => t.status === 'SKIP').length,
            success_rate: (allTests.filter(t => t.status === 'PASS').length / allTests.length * 100).toFixed(2)
        };
        
        // Save snapshot
        fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
        
        console.log(`\n✅ Snapshot created: ${snapshotPath}`);
        console.log(`📊 Results: ${snapshot.summary.passed}/${snapshot.summary.total} tests passed (${snapshot.summary.success_rate}%)`);
        
        return snapshot;
    }

    getGitInfo() {
        try {
            return {
                branch: execSync('git branch --show-current', { encoding: 'utf8' }).trim(),
                commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
                status: execSync('git status --porcelain', { encoding: 'utf8' }).trim()
            };
        } catch (error) {
            return { error: 'Git not available' };
        }
    }

    getSystemInfo() {
        return {
            node: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
        };
    }

    async validate() {
        console.log('🔍 Validating current state against baseline...');
        
        const baselinePath = path.join(SNAPSHOTS_DIR, 'baseline.json');
        if (!fs.existsSync(baselinePath)) {
            console.log('❌ No baseline found. Create one with: node snapshot-manager.js baseline');
            process.exit(1);
        }
        
        const currentSnapshot = await this.createSnapshot('validation');
        const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
        
        return this.compareSnapshots(baseline, currentSnapshot);
    }

    compareSnapshots(snapshot1, snapshot2) {
        console.log(`\n📊 Comparing snapshots:`);
        console.log(`  Baseline: ${snapshot1.id} (${snapshot1.summary.success_rate}% success)`);
        console.log(`  Current:  ${snapshot2.id} (${snapshot2.summary.success_rate}% success)`);
        
        const regressions = [];
        const improvements = [];
        
        // Compare each test category
        for (const category of Object.keys(TEST_SUITE)) {
            const tests1 = snapshot1.tests[category] || [];
            const tests2 = snapshot2.tests[category] || [];
            
            for (const test1 of tests1) {
                const test2 = tests2.find(t => t.name === test1.name);
                if (!test2) continue;
                
                if (test1.status === 'PASS' && test2.status === 'FAIL') {
                    regressions.push({ category, name: test1.name, was: test1.status, now: test2.status });
                } else if (test1.status === 'FAIL' && test2.status === 'PASS') {
                    improvements.push({ category, name: test1.name, was: test1.status, now: test2.status });
                }
            }
        }
        
        // Report results
        if (regressions.length > 0) {
            console.log(`\n🚨 REGRESSIONS DETECTED (${regressions.length}):`);
            regressions.forEach(r => {
                console.log(`  ❌ ${r.category}/${r.name}: ${r.was} → ${r.now}`);
            });
        }
        
        if (improvements.length > 0) {
            console.log(`\n✅ IMPROVEMENTS (${improvements.length}):`);
            improvements.forEach(i => {
                console.log(`  ✅ ${i.category}/${i.name}: ${i.was} → ${i.now}`);
            });
        }
        
        if (regressions.length === 0 && improvements.length === 0) {
            console.log(`\n✅ NO CHANGES DETECTED`);
        }
        
        return {
            regressions,
            improvements,
            success: regressions.length === 0
        };
    }

    setBaseline() {
        console.log('📋 Creating new baseline...');
        return this.createSnapshot('baseline').then(snapshot => {
            const baselinePath = path.join(SNAPSHOTS_DIR, 'baseline.json');
            fs.writeFileSync(baselinePath, JSON.stringify(snapshot, null, 2));
            console.log(`✅ Baseline set: ${baselinePath}`);
            return snapshot;
        });
    }
}

// CLI interface
if (require.main === module) {
    const manager = new SnapshotManager();
    const args = process.argv.slice(2);
    const command = args[0];
    
    (async () => {
        try {
            switch (command) {
                case 'create':
                    await manager.createSnapshot(args[1]);
                    break;
                case 'baseline':
                    await manager.setBaseline();
                    break;
                case 'validate':
                    const result = await manager.validate();
                    process.exit(result.success ? 0 : 1);
                    break;
                default:
                    console.log(`
Usage: node snapshot-manager.js <command>

Commands:
  create [name]    Create new snapshot
  baseline        Set current state as baseline
  validate        Validate against baseline (exit 1 if regressions)
  
Examples:
  node snapshot-manager.js baseline
  node snapshot-manager.js validate
  node snapshot-manager.js create pre-deploy
`);
            }
        } catch (error) {
            console.error('Error:', error.message);
            process.exit(1);
        }
    })();
}

module.exports = { SnapshotManager };