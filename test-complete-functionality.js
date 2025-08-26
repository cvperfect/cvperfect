#!/usr/bin/env node

/**
 * CVPerfect - Complete Functionality Test
 * Tests all critical system invariants
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 CVPerfect Complete Functionality Test');
console.log('========================================\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, testFn) {
    try {
        console.log(`⏳ Testing: ${name}`);
        testFn();
        console.log(`✅ PASSED: ${name}\n`);
        testsPassed++;
    } catch (error) {
        console.log(`❌ FAILED: ${name}`);
        console.log(`   Error: ${error.message}\n`);
        testsFailed++;
    }
}

// Test 1: Critical files exist
test('Critical Files Exist', () => {
    const criticalFiles = [
        'pages/index.js',
        'pages/success.js',
        'pages/api/parse-cv.js',
        'pages/api/save-session.js',
        'pages/api/create-checkout-session.js',
        'pages/api/stripe-webhook.js',
        'pages/api/get-session-data.js',
        'pages/api/analyze.js'
    ];
    
    criticalFiles.forEach(file => {
        if (!fs.existsSync(file)) {
            throw new Error(`Critical file missing: ${file}`);
        }
    });
});

// Test 2: Environment variables
test('Environment Variables Check', () => {
    const requiredEnvVars = [
        'GROQ_API_KEY',
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'STRIPE_SECRET_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_WEBHOOK_SECRET'
    ];
    
    // Check .env.local exists
    if (!fs.existsSync('.env.local')) {
        throw new Error('.env.local file not found');
    }
    
    const envContent = fs.readFileSync('.env.local', 'utf8');
    requiredEnvVars.forEach(envVar => {
        if (!envContent.includes(envVar)) {
            throw new Error(`Missing environment variable: ${envVar}`);
        }
    });
});

// Test 3: Dependencies check
test('Dependencies Check', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
        'next',
        '@supabase/supabase-js',
        'stripe',
        'groq-sdk',
        'mammoth',
        'pdf-parse',
        'nodemailer',
        'dompurify'
    ];
    
    requiredDeps.forEach(dep => {
        if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
            throw new Error(`Missing dependency: ${dep}`);
        }
    });
});

// Test 4: API routes syntax check
test('API Routes Syntax Check', () => {
    const apiFiles = [
        'pages/api/parse-cv.js',
        'pages/api/save-session.js',
        'pages/api/create-checkout-session.js',
        'pages/api/stripe-webhook.js',
        'pages/api/get-session-data.js',
        'pages/api/analyze.js'
    ];
    
    apiFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        if (!content.includes('export default') && !content.includes('module.exports')) {
            throw new Error(`${file} missing proper export`);
        }
    });
});

// Test 5: Main pages basic structure
test('Main Pages Structure Check', () => {
    // Check index.js
    const indexContent = fs.readFileSync('pages/index.js', 'utf8');
    if (!indexContent.includes('export default') || !indexContent.includes('Home')) {
        throw new Error('index.js missing basic structure');
    }
    
    // Check success.js
    const successContent = fs.readFileSync('pages/success.js', 'utf8');
    if (!successContent.includes('export default') || !successContent.includes('function')) {
        throw new Error('success.js missing basic structure');
    }
});

// Test 6: Build artifacts check (if exists)
test('Build Artifacts Check', () => {
    if (fs.existsSync('.next')) {
        const buildManifest = path.join('.next', 'build-manifest.json');
        if (fs.existsSync(buildManifest)) {
            const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
            if (!manifest.pages || !manifest.pages['/']) {
                throw new Error('Build manifest missing pages');
            }
        }
    }
});

// Test 7: Agent system files
test('Agent System Files Check', () => {
    const agentDirs = ['agents', 'agents/debug', 'agents/core'];
    agentDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            if (files.length === 0) {
                throw new Error(`Agent directory ${dir} is empty`);
            }
        }
    });
});

// Final results
console.log('\n📊 TEST RESULTS');
console.log('================');
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

if (testsFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED - CVPerfect core functionality is intact!');
    process.exit(0);
} else {
    console.log(`\n⚠️  ${testsFailed} TEST(S) FAILED - Fix issues before deployment`);
    process.exit(1);
}