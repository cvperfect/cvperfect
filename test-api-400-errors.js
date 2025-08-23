const puppeteer = require('puppeteer');

async function testAPI400Errors() {
  console.log('🔍 Testing for API 400 errors...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Collect console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Collect network errors
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() === 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Test main page load
    console.log('📄 Loading main page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Test modal opening
    console.log('🔘 Testing modal...');
    const modalTrigger = await page.$('.hero-button, [data-testid="start-now"], .nav-cta');
    if (modalTrigger) {
      await modalTrigger.click();
      await page.waitForTimeout(2000);
    }
    
    // Test API endpoints directly
    console.log('🧪 Testing API endpoints...');
    
    const apiTests = [
      '/api/analyze',
      '/api/demo-optimize', 
      '/api/save-session',
      '/api/get-session',
      '/api/create-checkout-session'
    ];
    
    for (const endpoint of apiTests) {
      try {
        const response = await page.evaluate(async (url) => {
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                test: true,
                cvText: 'Test CV content',
                email: 'test@example.com'
              })
            });
            return {
              status: res.status,
              ok: res.ok,
              statusText: res.statusText
            };
          } catch (error) {
            return { error: error.message };
          }
        }, `http://localhost:3000${endpoint}`);
        
        console.log(`📊 ${endpoint}: ${response.status} ${response.statusText || ''}`);
        
        if (response.status === 400) {
          networkErrors.push({
            url: endpoint,
            status: response.status,
            statusText: response.statusText,
            source: 'direct_test'
          });
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
    
    // Report results
    console.log('\n🔍 RESULTS:');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`400 Network Errors: ${networkErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors:');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (networkErrors.length > 0) {
      console.log('\n🚫 400 Network Errors:');
      networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.url} - ${error.status} ${error.statusText}`);
      });
    }
    
    // Save detailed results
    const results = {
      timestamp: new Date().toISOString(),
      consoleErrors,
      networkErrors,
      summary: {
        totalConsoleErrors: consoleErrors.length,
        total400Errors: networkErrors.length,
        status: networkErrors.length === 0 ? 'PASSED' : 'FAILED'
      }
    };
    
    require('fs').writeFileSync('api-400-test-results.json', JSON.stringify(results, null, 2));
    console.log('\n✅ Results saved to api-400-test-results.json');
    
    return results;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// Run test if called directly
if (require.main === module) {
  testAPI400Errors()
    .then(results => {
      process.exit(results.summary?.status === 'PASSED' ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = testAPI400Errors;