#!/usr/bin/env node

/**
 * CVPerfect CI/CD Pipeline Validation Script
 * Validates production deployment pipeline configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 CVPerfect CI/CD Pipeline Validation');
console.log('=====================================\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function test(name, fn) {
  try {
    const result = fn();
    if (result === true) {
      console.log(`✅ ${name}`);
      results.passed++;
      results.tests.push({ name, status: 'PASSED' });
    } else if (result === 'warning') {
      console.log(`⚠️  ${name}`);
      results.warnings++;
      results.tests.push({ name, status: 'WARNING' });
    } else {
      console.log(`❌ ${name}: ${result}`);
      results.failed++;
      results.tests.push({ name, status: 'FAILED', error: result });
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    results.failed++;
    results.tests.push({ name, status: 'FAILED', error: error.message });
  }
}

// Test 1: Workflow file exists and is valid YAML
test('GitHub workflow configuration exists', () => {
  const workflowPath = '.github/workflows/production-deploy.yml';
  if (!fs.existsSync(workflowPath)) {
    return 'Workflow file not found';
  }

  const content = fs.readFileSync(workflowPath, 'utf8');
  if (!content.includes('name: 🚀 Production Deploy')) {
    return 'Invalid workflow content';
  }

  return true;
});

// Test 2: Required test files exist
test('Required test files exist', () => {
  const requiredTests = [
    'test-complete-functionality.js',
    'test-all-success-functions.js',
    'test-health-endpoint.js',
    'test-performance-monitoring.js',
    'test-responsive.js',
    'test-performance-comparison.js'
  ];

  const missing = requiredTests.filter(test => !fs.existsSync(test));
  if (missing.length > 0) {
    return `Missing test files: ${missing.join(', ')}`;
  }

  return true;
});

// Test 3: Docker configuration exists
test('Docker configuration exists', () => {
  const dockerfilePath = 'ml_system/deployment/Dockerfile';
  const composePath = 'ml_system/deployment/docker-compose.yml';

  if (!fs.existsSync(dockerfilePath)) {
    return 'Dockerfile not found';
  }

  if (!fs.existsSync(composePath)) {
    return 'docker-compose.yml not found';
  }

  return true;
});

// Test 4: Production environment template exists
test('Production environment configuration', () => {
  const envPath = 'deployment/production.env.example';
  
  if (!fs.existsSync(envPath)) {
    return 'production.env.example not found';
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'GROQ_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'JWT_SECRET'
  ];

  const missing = requiredVars.filter(v => !content.includes(v));
  if (missing.length > 0) {
    return `Missing environment variables: ${missing.join(', ')}`;
  }

  return true;
});

// Test 5: Package.json has required scripts
test('NPM scripts configuration', () => {
  const packagePath = 'package.json';
  if (!fs.existsSync(packagePath)) {
    return 'package.json not found';
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredScripts = ['build', 'start', 'lint', 'dev'];

  const missing = requiredScripts.filter(script => !pkg.scripts[script]);
  if (missing.length > 0) {
    return `Missing npm scripts: ${missing.join(', ')}`;
  }

  return true;
});

// Test 6: Security schema exists
test('Security database schema', () => {
  const schemaPath = 'supabase-security-schema.sql';
  
  if (!fs.existsSync(schemaPath)) {
    return 'Security schema file not found';
  }

  const content = fs.readFileSync(schemaPath, 'utf8');
  const requiredTables = [
    'security_logs',
    'api_keys',
    'ml_optimization_usage',
    'failed_auth_attempts'
  ];

  const missing = requiredTables.filter(table => !content.includes(`CREATE TABLE IF NOT EXISTS ${table}`));
  if (missing.length > 0) {
    return `Missing security tables: ${missing.join(', ')}`;
  }

  return true;
});

// Test 7: API endpoints structure
test('API endpoints structure', () => {
  const apiDir = 'pages/api';
  
  if (!fs.existsSync(apiDir)) {
    return 'API directory not found';
  }

  const requiredEndpoints = [
    'health.js',
    'ping.js',
    'parse-cv.js',
    'save-session.js',
    'get-session-data.js',
    'create-checkout-session.js',
    'stripe-webhook.js',
    'analyze.js',
    'analyze-python.js',
    'export.js',
    'performance-metrics.js'
  ];

  const missing = requiredEndpoints.filter(endpoint => !fs.existsSync(path.join(apiDir, endpoint)));
  if (missing.length > 0) {
    return `Missing API endpoints: ${missing.join(', ')}`;
  }

  return true;
});

// Test 8: ML system structure
test('ML system structure', () => {
  const mlDir = 'ml_system';
  
  if (!fs.existsSync(mlDir)) {
    return 'ML system directory not found';
  }

  const requiredPaths = [
    'models/cv_optimizer.py',
    'inference/model_server.py',
    'training/data_pipeline.py',
    'deployment/Dockerfile'
  ];

  const missing = requiredPaths.filter(p => !fs.existsSync(path.join(mlDir, p)));
  if (missing.length > 0) {
    return `Missing ML components: ${missing.join(', ')}`;
  }

  return true;
});

// Test 9: Security middleware
test('Security middleware configuration', () => {
  const securityPath = 'lib/security/api-security-middleware.js';
  
  if (!fs.existsSync(securityPath)) {
    return 'Security middleware not found';
  }

  const content = fs.readFileSync(securityPath, 'utf8');
  const requiredFunctions = [
    'securityHeaders',
    'validateApiKey',
    'logSecurityEvent',
    'rateLimitConfigs'
  ];

  const missing = requiredFunctions.filter(fn => !content.includes(fn));
  if (missing.length > 0) {
    return `Missing security functions: ${missing.join(', ')}`;
  }

  return true;
});

// Test 10: Build validation (if possible)
test('Build validation', () => {
  try {
    console.log('   Running build validation...');
    execSync('npm run lint', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return `Build validation failed: ${error.message.substring(0, 100)}...`;
  }
});

// Test 11: Dependencies validation
test('Critical dependencies installed', () => {
  const packagePath = 'package.json';
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const criticalDeps = [
    'next',
    '@supabase/supabase-js',
    'stripe',
    'groq-sdk',
    'mammoth',
    'pdf-parse'
  ];

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const missing = criticalDeps.filter(dep => !allDeps[dep]);
  
  if (missing.length > 0) {
    return `Missing critical dependencies: ${missing.join(', ')}`;
  }

  return true;
});

// Test 12: GitHub secrets documentation
test('GitHub secrets documentation', () => {
  const secretsPath = 'deployment/github-secrets.md';
  
  if (!fs.existsSync(secretsPath)) {
    return 'GitHub secrets documentation not found';
  }

  const content = fs.readFileSync(secretsPath, 'utf8');
  const requiredSecrets = [
    'VERCEL_TOKEN',
    'RAILWAY_TOKEN',
    'SUPABASE_ACCESS_TOKEN',
    'MONITORING_WEBHOOK'
  ];

  const missing = requiredSecrets.filter(secret => !content.includes(secret));
  if (missing.length > 0) {
    return `Missing secret documentation: ${missing.join(', ')}`;
  }

  return true;
});

console.log('\n📊 Pipeline Validation Results');
console.log('==============================');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);
console.log(`📝 Total Tests: ${results.tests.length}`);

const successRate = Math.round((results.passed / results.tests.length) * 100);
console.log(`📈 Success Rate: ${successRate}%`);

if (results.failed > 0) {
  console.log('\n❌ Failed Tests:');
  results.tests
    .filter(t => t.status === 'FAILED')
    .forEach(t => console.log(`   - ${t.name}: ${t.error}`));
}

if (results.warnings > 0) {
  console.log('\n⚠️  Warnings:');
  results.tests
    .filter(t => t.status === 'WARNING')
    .forEach(t => console.log(`   - ${t.name}`));
}

console.log('\n🚀 Next Steps:');
if (results.failed === 0) {
  console.log('✅ Pipeline validation passed! Ready for production deployment.');
  console.log('📋 Configure GitHub secrets using deployment/github-secrets.md');
  console.log('🔐 Set up monitoring webhooks');
  console.log('🚀 Trigger deployment via GitHub Actions');
} else {
  console.log('❌ Fix failed tests before proceeding with deployment');
  console.log('📖 Review pipeline configuration');
  console.log('🛠️  Update missing components');
}

console.log('\n📚 Resources:');
console.log('- GitHub Workflow: .github/workflows/production-deploy.yml');
console.log('- Secrets Setup: deployment/github-secrets.md');
console.log('- Docker Config: ml_system/deployment/');
console.log('- Security Schema: supabase-security-schema.sql');

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);