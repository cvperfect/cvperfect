/**
 * Performance Comparison: JavaScript vs Python API
 * CVPerfect Optimization Endpoints
 */

const fetch = require('node-fetch');

// Configuration
const JS_API = 'http://localhost:3015/api/analyze';
const PY_API = 'http://localhost:3015/api/analyze-python';

// Test data
const TEST_CV = `Jan Kowalski
Email: jan.kowalski@example.com
Telefon: +48 123 456 789

Doświadczenie:
- Senior Developer w TechCorp (2020-2024)
- Mid-Level Developer w StartupXYZ (2018-2020)
- Junior Developer w WebAgency (2016-2018)

Wykształcenie:
- Magister Informatyki, Uniwersytet Warszawski (2016)

Umiejętności:
JavaScript, React, Node.js, TypeScript, Python, SQL, Docker, AWS, 
Git, Scrum, REST API, MongoDB, Redis, Kubernetes, CI/CD`;

const TEST_EMAIL = 'test@cvperfect.pl';
const TEST_JOB = 'Szukamy Senior Full Stack Developer z doświadczeniem w React i Node.js';

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function measurePerformance(apiUrl, name, iterations = 10) {
  const times = [];
  let successCount = 0;
  let errorCount = 0;
  
  log(`\n📊 Testing ${name}...`, 'cyan');
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCV: TEST_CV,
          email: TEST_EMAIL,
          jobPosting: TEST_JOB
        })
      });
      
      const data = await response.json();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (data.success) {
        times.push(duration);
        successCount++;
        process.stdout.write(`${colors.green}.${colors.reset}`);
      } else {
        errorCount++;
        process.stdout.write(`${colors.red}x${colors.reset}`);
      }
    } catch (error) {
      errorCount++;
      process.stdout.write(`${colors.red}!${colors.reset}`);
    }
  }
  
  console.log(); // New line after dots
  
  if (times.length === 0) {
    return {
      name,
      error: true,
      message: 'All requests failed'
    };
  }
  
  // Calculate statistics
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
  
  return {
    name,
    successRate: (successCount / iterations) * 100,
    avgTime: Math.round(avg),
    minTime: min,
    maxTime: max,
    medianTime: median,
    samples: times.length,
    errors: errorCount
  };
}

async function compareAPIs() {
  log('\n🚀 CVPerfect API Performance Comparison', 'magenta');
  log('=' .repeat(50), 'magenta');
  
  // Test JavaScript API
  const jsResults = await measurePerformance(JS_API, 'JavaScript API (analyze.js)');
  
  // Test Python API
  const pyResults = await measurePerformance(PY_API, 'Python API (analyze-python)');
  
  // Display results
  log('\n📈 RESULTS SUMMARY', 'cyan');
  log('=' .repeat(50), 'cyan');
  
  // JavaScript results
  log('\n🟨 JavaScript API:', 'yellow');
  if (jsResults.error) {
    log(`  ❌ ${jsResults.message}`, 'red');
  } else {
    log(`  Success Rate: ${jsResults.successRate}%`, jsResults.successRate === 100 ? 'green' : 'yellow');
    log(`  Avg Response: ${jsResults.avgTime}ms`, 'reset');
    log(`  Min/Max: ${jsResults.minTime}ms / ${jsResults.maxTime}ms`, 'reset');
    log(`  Median: ${jsResults.medianTime}ms`, 'reset');
    if (jsResults.errors > 0) {
      log(`  Errors: ${jsResults.errors}`, 'red');
    }
  }
  
  // Python results
  log('\n🐍 Python API:', 'yellow');
  if (pyResults.error) {
    log(`  ❌ ${pyResults.message}`, 'red');
  } else {
    log(`  Success Rate: ${pyResults.successRate}%`, pyResults.successRate === 100 ? 'green' : 'yellow');
    log(`  Avg Response: ${pyResults.avgTime}ms`, 'reset');
    log(`  Min/Max: ${pyResults.minTime}ms / ${pyResults.maxTime}ms`, 'reset');
    log(`  Median: ${pyResults.medianTime}ms`, 'reset');
    if (pyResults.errors > 0) {
      log(`  Errors: ${pyResults.errors}`, 'red');
    }
  }
  
  // Comparison
  if (!jsResults.error && !pyResults.error) {
    log('\n🎯 COMPARISON:', 'magenta');
    const speedup = ((jsResults.avgTime - pyResults.avgTime) / jsResults.avgTime * 100).toFixed(1);
    
    if (pyResults.avgTime < jsResults.avgTime) {
      log(`  🚀 Python is ${Math.abs(speedup)}% FASTER`, 'green');
    } else if (jsResults.avgTime < pyResults.avgTime) {
      log(`  🚀 JavaScript is ${Math.abs(speedup)}% FASTER`, 'green');
    } else {
      log(`  🤝 Both have similar performance`, 'yellow');
    }
    
    // Reliability comparison
    if (pyResults.successRate > jsResults.successRate) {
      log(`  ✅ Python is more reliable (${pyResults.successRate}% vs ${jsResults.successRate}%)`, 'green');
    } else if (jsResults.successRate > pyResults.successRate) {
      log(`  ✅ JavaScript is more reliable (${jsResults.successRate}% vs ${pyResults.successRate}%)`, 'green');
    } else {
      log(`  🤝 Both have equal reliability`, 'yellow');
    }
  }
  
  // Recommendations
  log('\n💡 RECOMMENDATIONS:', 'cyan');
  if (!jsResults.error && !pyResults.error) {
    if (pyResults.avgTime < jsResults.avgTime * 0.8) {
      log('  ➡️  Use Python API for better performance', 'green');
    } else if (jsResults.avgTime < pyResults.avgTime * 0.8) {
      log('  ➡️  Keep JavaScript API for better performance', 'green');
    } else {
      log('  ➡️  Both are suitable, choose based on maintenance preference', 'yellow');
    }
  }
  
  // Memory usage estimation
  log('\n💾 RESOURCE USAGE (estimated):', 'cyan');
  log('  JavaScript: ~50-80MB RAM (Node.js process)', 'reset');
  log('  Python: ~30-50MB RAM (Python process)', 'reset');
  log('  Vercel Functions: Both run serverless, auto-scaled', 'reset');
  
  log('\n✨ Test completed successfully!\n', 'green');
}

// Run comparison
compareAPIs().catch(error => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});