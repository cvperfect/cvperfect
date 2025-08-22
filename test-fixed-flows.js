// COMPREHENSIVE TEST OF FIXED PAYMENT FLOWS
// Tests all critical fixes implemented for CvPerfect

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// Test configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  headless: false,
  timeout: 30000
};

class FixedFlowTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: { passed: 0, failed: 0 }
    };
  }

  async init() {
    console.log('🚀 Testing Fixed Payment Flows...');
    
    this.browser = await puppeteer.launch({
      headless: CONFIG.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.browser.newPage();
  }

  async logTest(name, success, details = '') {
    const result = { name, success, details, timestamp: new Date().toISOString() };
    this.results.tests.push(result);
    
    if (success) {
      this.results.summary.passed++;
      console.log(`✅ ${name} - PASSED ${details ? '(' + details + ')' : ''}`);
    } else {
      this.results.summary.failed++;
      console.log(`❌ ${name} - FAILED ${details ? '(' + details + ')' : ''}`);
    }
  }

  // TEST 1: Verify Main CTA Button Works
  async testMainCTA() {
    try {
      await this.page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle0' });
      
      // Look for main CTA with new data attribute
      const mainCTA = await this.page.$('[data-testid="main-cta"]');
      if (!mainCTA) {
        throw new Error('Main CTA button not found with data-testid');
      }
      
      // Click and verify modal opens
      await mainCTA.click();
      await this.page.waitForTimeout(2000);
      
      const modal = await this.page.$('.modal-overlay');
      if (!modal) {
        throw new Error('Modal did not open after clicking CTA');
      }
      
      await this.logTest('Main CTA Button', true, 'Opens modal correctly');
      return true;
    } catch (error) {
      await this.logTest('Main CTA Button', false, error.message);
      return false;
    }
  }

  // TEST 2: Verify Plan Buttons Have Correct Data Attributes
  async testPlanButtons() {
    try {
      // Check if we have modal open from previous test, if not open it
      let modal = await this.page.$('.modal-overlay');
      if (!modal) {
        const mainCTA = await this.page.$('[data-testid="main-cta"]');
        await mainCTA.click();
        await this.page.waitForTimeout(2000);
      }

      // Navigate to plan selection (step 2)
      const nextButton = await this.page.$('button[contains(text(), "Dalej")]');
      if (nextButton) {
        await nextButton.click();
        await this.page.waitForTimeout(1000);
      }

      // Check basic plan button
      const basicButton = await this.page.$('[data-testid="plan-basic"]');
      if (!basicButton) {
        throw new Error('Basic plan button missing data-testid');
      }

      const basicPlan = await this.page.evaluate((btn) => btn.dataset.plan, basicButton);
      const basicPrice = await this.page.evaluate((btn) => btn.dataset.price, basicButton);
      
      if (basicPlan !== 'basic' || basicPrice !== '19.99') {
        throw new Error(`Basic plan data incorrect: plan=${basicPlan}, price=${basicPrice}`);
      }

      // Check gold plan button
      const goldButton = await this.page.$('[data-testid="plan-gold"]');
      if (!goldButton) {
        throw new Error('Gold plan button missing data-testid');
      }

      const goldPlan = await this.page.evaluate((btn) => btn.dataset.plan, goldButton);
      const goldPrice = await this.page.evaluate((btn) => btn.dataset.price, goldButton);
      
      if (goldPlan !== 'gold' || goldPrice !== '49') {
        throw new Error(`Gold plan data incorrect: plan=${goldPlan}, price=${goldPrice}`);
      }

      // Check premium plan button  
      const premiumButton = await this.page.$('[data-testid="plan-premium"]');
      if (!premiumButton) {
        throw new Error('Premium plan button missing data-testid');
      }

      const premiumPlan = await this.page.evaluate((btn) => btn.dataset.plan, premiumButton);
      const premiumPrice = await this.page.evaluate((btn) => btn.dataset.price, premiumButton);
      
      if (premiumPlan !== 'premium' || premiumPrice !== '79') {
        throw new Error(`Premium plan data incorrect: plan=${premiumPlan}, price=${premiumPrice}`);
      }

      await this.logTest('Plan Button Data Attributes', true, 'All plans have correct data-plan and data-price');
      return true;
    } catch (error) {
      await this.logTest('Plan Button Data Attributes', false, error.message);
      return false;
    }
  }

  // TEST 3: Verify Usage Limits Are Displayed
  async testUsageLimitsDisplay() {
    try {
      // Check if usage limits are visible in plan descriptions
      const basicFeatures = await this.page.evaluate(() => {
        const basicCard = document.querySelector('[data-testid="plan-basic"]')?.closest('.plan-card-compact');
        if (!basicCard) return null;
        return Array.from(basicCard.querySelectorAll('li')).map(li => li.textContent);
      });

      if (!basicFeatures || !basicFeatures.some(feature => feature.includes('1 optymalizacja'))) {
        throw new Error('Basic plan usage limit (1 use) not clearly displayed');
      }

      const goldFeatures = await this.page.evaluate(() => {
        const goldCard = document.querySelector('[data-testid="plan-gold"]')?.closest('.plan-card-compact');
        if (!goldCard) return null;
        return Array.from(goldCard.querySelectorAll('li')).map(li => li.textContent);
      });

      if (!goldFeatures || !goldFeatures.some(feature => feature.includes('10 optymalizacji'))) {
        throw new Error('Gold plan usage limit (10 uses) not clearly displayed');
      }

      const premiumFeatures = await this.page.evaluate(() => {
        const premiumCard = document.querySelector('[data-testid="plan-premium"]')?.closest('.plan-card-compact');
        if (!premiumCard) return null;
        return Array.from(premiumCard.querySelectorAll('li')).map(li => li.textContent);
      });

      if (!premiumFeatures || !premiumFeatures.some(feature => feature.includes('25 optymalizacji'))) {
        throw new Error('Premium plan usage limit (25 uses) not clearly displayed');
      }

      await this.logTest('Usage Limits Display', true, 'All plans show clear usage limits');
      return true;
    } catch (error) {
      await this.logTest('Usage Limits Display', false, error.message);
      return false;
    }
  }

  // TEST 4: Test Demo AI Optimization Endpoint
  async testDemoAIEndpoint() {
    try {
      const testCV = 'Jan Kowalski\nDoświadczenie: 5 lat jako programista\nUmiejętności: JavaScript, React, Node.js';
      
      const response = await this.page.evaluate(async (cvText) => {
        const resp = await fetch('/api/demo-optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cvText: cvText,
            jobText: 'Software Developer position',
            language: 'pl'
          })
        });
        
        return {
          status: resp.status,
          ok: resp.ok,
          json: await resp.json()
        };
      }, testCV);

      if (!response.ok) {
        throw new Error(`Demo optimize endpoint failed: ${response.status}`);
      }

      if (!response.json.success || !response.json.optimizedCV) {
        throw new Error('Demo optimize returned invalid response format');
      }

      if (response.json.optimizedCV.length < 50) {
        throw new Error('Optimized CV is suspiciously short');
      }

      await this.logTest('Demo AI Optimization Endpoint', true, `Returned ${response.json.optimizedCV.length} chars`);
      return true;
    } catch (error) {
      await this.logTest('Demo AI Optimization Endpoint', false, error.message);
      return false;
    }
  }

  // TEST 5: Test Long CV Processing
  async testLongCVProcessing() {
    try {
      // Generate a CV longer than 50k characters
      const longCV = 'DŁUGIE CV\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(2000) + 
                    '\n\nDoświadczenie zawodowe:\n' + 'Pracowałem jako programista przez wiele lat. '.repeat(1000) +
                    '\n\nUmiejętności:\n' + 'JavaScript, React, Node.js, Python, Java. '.repeat(500);
      
      console.log(`📊 Testing with CV length: ${longCV.length} characters`);
      
      const response = await this.page.evaluate(async (cvText) => {
        const resp = await fetch('/api/demo-optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cvText: cvText,
            language: 'pl'
          })
        });
        
        return {
          status: resp.status,
          ok: resp.ok,
          json: await resp.json()
        };
      }, longCV);

      if (!response.ok) {
        throw new Error(`Long CV processing failed: ${response.status}`);
      }

      if (!response.json.success) {
        throw new Error(`Long CV processing error: ${response.json.error}`);
      }

      if (response.json.optimizedCV.length < 1000) {
        throw new Error('Long CV processing resulted in unexpectedly short output');
      }

      await this.logTest('Long CV Processing', true, `Processed ${longCV.length} → ${response.json.optimizedCV.length} chars`);
      return true;
    } catch (error) {
      await this.logTest('Long CV Processing', false, error.message);
      return false;
    }
  }

  // TEST 6: Test Stripe Integration Configuration
  async testStripeIntegration() {
    try {
      const response = await this.page.evaluate(async () => {
        const resp = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            plan: 'basic', 
            email: 'test@example.com',
            cv: 'Test CV content',
            job: 'Test job posting'
          })
        });
        
        return {
          status: resp.status,
          ok: resp.ok,
          text: await resp.text()
        };
      });

      if (response.status === 500 && response.text.includes('Stripe')) {
        throw new Error('Stripe configuration error - check API keys');
      }

      if (!response.ok && response.status !== 400) {
        throw new Error(`Unexpected Stripe API response: ${response.status}`);
      }

      // Parse response to check URL format
      let checkoutData;
      try {
        checkoutData = JSON.parse(response.text);
      } catch (e) {
        throw new Error('Invalid JSON response from checkout session');
      }

      // Check if URL uses localhost:3000 instead of hardcoded localhost:3004
      if (checkoutData.url && checkoutData.url.includes('localhost:3004')) {
        throw new Error('Still using hardcoded localhost:3004 in Stripe URLs');
      }

      await this.logTest('Stripe Integration', true, 'API responding correctly with fixed URLs');
      return true;
    } catch (error) {
      await this.logTest('Stripe Integration', false, error.message);
      return false;
    }
  }

  // TEST 7: Check for Critical Security Issues
  async testSecurityBasics() {
    try {
      const pageContent = await this.page.content();
      
      // Check for exposed secrets
      const secretPatterns = [
        /sk_live_[a-zA-Z0-9]+/g,
        /sk_test_[a-zA-Z0-9]+/g,
        /whsec_[a-zA-Z0-9]+/g
      ];

      for (const pattern of secretPatterns) {
        const matches = pageContent.match(pattern);
        if (matches) {
          throw new Error(`Potential secret exposed in HTML: ${matches[0].substring(0, 10)}...`);
        }
      }

      await this.logTest('Security Basics', true, 'No secrets exposed in client-side code');
      return true;
    } catch (error) {
      await this.logTest('Security Basics', false, error.message);
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    try {
      await this.init();

      await this.testMainCTA();
      await this.testPlanButtons();
      await this.testUsageLimitsDisplay();
      await this.testDemoAIEndpoint();
      await this.testLongCVProcessing();
      await this.testStripeIntegration();
      await this.testSecurityBasics();

      // Generate summary
      console.log('\n📊 TEST RESULTS SUMMARY');
      console.log('======================');
      console.log(`✅ Passed: ${this.results.summary.passed}`);
      console.log(`❌ Failed: ${this.results.summary.failed}`);
      console.log(`📈 Success Rate: ${Math.round((this.results.summary.passed / (this.results.summary.passed + this.results.summary.failed)) * 100)}%`);

      const allPassed = this.results.summary.failed === 0;
      console.log(`\n🎯 ALL TESTS: ${allPassed ? '✅ PASSED' : '❌ SOME FAILED'}`);

      if (allPassed) {
        console.log('🚀 Ready for production deployment!');
      } else {
        console.log('⚠️  Some issues remain - check failed tests above');
      }

      // Save detailed results
      await fs.writeFile('./test-fixed-flows-results.json', JSON.stringify(this.results, null, 2));
      console.log('📄 Detailed results saved to: test-fixed-flows-results.json');

    } catch (error) {
      console.error('❌ Test framework error:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the tests
const tester = new FixedFlowTester();
tester.runAllTests().catch(console.error);