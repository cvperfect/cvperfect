// COMPREHENSIVE PRODUCTION AUDIT FOR CVPERFECT
// Tests all critical payment flows and identifies P0/P1/P2 issues

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// Test configuration
const CONFIG = {
  baseUrl: 'http://localhost:3000', // Change to production URL for live testing
  headless: false, // Set to true for CI/production testing
  timeout: 60000,
  screenshotPath: './audit-screenshots/',
  testResultsPath: './audit-results.json'
};

// Issue priority system
const PRIORITY = {
  P0: 'CRITICAL - Blocks payment/core functionality',
  P1: 'HIGH - Affects user experience significantly', 
  P2: 'MEDIUM - Minor UX issues or cosmetic problems'
};

class CvPerfectAuditor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.issues = [];
    this.results = {
      testSuite: 'CvPerfect Production Audit',
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        critical: 0,
        high: 0,
        medium: 0
      },
      flows: {},
      issues: []
    };
  }

  async init() {
    console.log('🚀 Starting CvPerfect Production Audit...');
    
    // Create screenshot directory
    try {
      await fs.mkdir(CONFIG.screenshotPath, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    this.browser = await puppeteer.launch({
      headless: CONFIG.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 }
    });
    
    this.page = await this.browser.newPage();
    
    // Setup error monitoring
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
        this.addIssue('CRITICAL', 'Console Error', msg.text(), 'N/A');
      }
    });

    this.page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
      this.addIssue('CRITICAL', 'JavaScript Error', error.message, 'N/A');
    });

    this.page.on('requestfailed', request => {
      console.log('❌ Failed Request:', request.url(), request.failure().errorText);
      this.addIssue('HIGH', 'Network Error', `${request.url()}: ${request.failure().errorText}`, 'N/A');
    });
  }

  addIssue(priority, title, description, reproductionSteps, environment = 'localhost:3000') {
    const issue = {
      priority,
      title,
      description,
      reproductionSteps,
      environment,
      timestamp: new Date().toISOString()
    };
    
    this.issues.push(issue);
    this.results.issues.push(issue);
    
    // Update counters
    switch(priority) {
      case 'CRITICAL': this.results.summary.critical++; break;
      case 'HIGH': this.results.summary.high++; break;
      case 'MEDIUM': this.results.summary.medium++; break;
    }
    
    console.log(`🔴 ${priority}: ${title} - ${description}`);
  }

  async takeScreenshot(name) {
    const filename = `${CONFIG.screenshotPath}${Date.now()}-${name}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }

  async testFlow(flowName, testFunction) {
    console.log(`\n🧪 Testing Flow: ${flowName}`);
    this.results.summary.totalTests++;
    
    const startTime = Date.now();
    let success = false;
    
    try {
      await testFunction();
      success = true;
      this.results.summary.passed++;
      console.log(`✅ ${flowName} - PASSED`);
    } catch (error) {
      this.results.summary.failed++;
      this.addIssue('CRITICAL', `${flowName} Failed`, error.message, 'Run automated test');
      console.log(`❌ ${flowName} - FAILED:`, error.message);
    }
    
    this.results.flows[flowName] = {
      success,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  // TEST 1: 49 PLN Subscription Flow
  async test49PLNSubscriptionFlow() {
    await this.page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle0' });
    await this.takeScreenshot('homepage-loaded');

    // Check if main CTA exists
    const ctaButton = await this.page.$('[data-test="main-cta"], .optimize-button, button[contains(text(), "Zoptymalizuj")]');
    if (!ctaButton) {
      throw new Error('Main CTA button not found on homepage');
    }

    // Click main CTA
    await ctaButton.click();
    await this.page.waitForTimeout(2000);
    await this.takeScreenshot('modal-opened');

    // Look for 49 PLN option
    const subscription49Button = await this.page.$('[data-plan="gold"], [data-price="49"], button[contains(text(), "49")]');
    if (!subscription49Button) {
      throw new Error('49 PLN subscription option not found');
    }

    // Verify subscription features are displayed
    const usageLimit = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.find(el => el.textContent.includes('10 użyć') || el.textContent.includes('10 uses'));
    });

    if (!usageLimit) {
      this.addIssue('HIGH', '49 PLN Plan Features Missing', 'Usage limit (10 uses) not clearly displayed', 'Check 49 PLN plan display');
    }

    console.log('✅ 49 PLN subscription flow elements found');
  }

  // TEST 2: 79 PLN Express Flow (No Account)
  async test79PLNExpressFlow() {
    await this.page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle0' });

    // Look for 79 PLN express option
    const express79Button = await this.page.$('[data-plan="premium"], [data-price="79"], button[contains(text(), "79")]');
    if (!express79Button) {
      throw new Error('79 PLN express option not found');
    }

    // Check for "no account needed" messaging
    const noAccountText = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.find(el => 
        el.textContent.includes('bez konta') || 
        el.textContent.includes('no account') ||
        el.textContent.includes('bez rejestracji')
      );
    });

    if (!noAccountText) {
      this.addIssue('HIGH', '79 PLN Express Messaging Missing', 'No clear indication that account is not required', 'Check 79 PLN plan messaging');
    }

    // Verify 25 uses are mentioned
    const uses25 = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.find(el => el.textContent.includes('25 użyć') || el.textContent.includes('25 uses'));
    });

    if (!uses25) {
      this.addIssue('HIGH', '79 PLN Plan Features Missing', 'Usage limit (25 uses) not clearly displayed', 'Check 79 PLN plan display');
    }

    console.log('✅ 79 PLN express flow elements found');
  }

  // TEST 3: 19.99 PLN One-time Purchase
  async test1999PLNOneTimeFlow() {
    await this.page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle0' });

    // Look for 19.99 PLN option
    const oneTime1999Button = await this.page.$('[data-plan="basic"], [data-price="19.99"], button[contains(text(), "19")]');
    if (!oneTime1999Button) {
      throw new Error('19.99 PLN one-time option not found');
    }

    // Check for one-time messaging
    const oneTimeText = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.find(el => 
        el.textContent.includes('jednorazowo') || 
        el.textContent.includes('one-time') ||
        el.textContent.includes('1 użycie')
      );
    });

    if (!oneTimeText) {
      this.addIssue('HIGH', '19.99 PLN One-time Messaging Missing', 'No clear indication this is a one-time purchase', 'Check 19.99 PLN plan messaging');
    }

    console.log('✅ 19.99 PLN one-time flow elements found');
  }

  // TEST 4: Stripe Integration Test
  async testStripeIntegration() {
    // Check if Stripe secret key is configured (test with a dummy request)
    try {
      const response = await this.page.evaluate(async () => {
        const resp = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: 'basic', email: 'test@example.com' })
        });
        return {
          status: resp.status,
          ok: resp.ok,
          text: await resp.text()
        };
      });

      if (response.status === 500 && response.text.includes('Stripe')) {
        this.addIssue('CRITICAL', 'Stripe Configuration Error', 'Stripe API not properly configured', 'Check STRIPE_SECRET_KEY environment variable');
      } else if (response.status === 400) {
        this.addIssue('HIGH', 'Stripe Validation Error', 'Request validation failed', 'Check request format and required fields');
      } else if (response.ok) {
        console.log('✅ Stripe API responding correctly');
      }
    } catch (error) {
      this.addIssue('CRITICAL', 'Stripe API Unreachable', error.message, 'Check network connectivity and API endpoint');
    }
  }

  // TEST 5: AI Processing Test with Long CV
  async testLongCVProcessing() {
    // Generate a long CV (50k+ characters)
    const longCV = this.generateLongCV();
    
    try {
      const response = await this.page.evaluate(async (cvText) => {
        const resp = await fetch('/api/demo-optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cvText: cvText,
            jobText: 'Software Developer position requiring strong programming skills',
            language: 'pl'
          })
        });
        
        const result = await resp.json();
        return {
          status: resp.status,
          success: result.success,
          hasOptimizedCV: !!result.optimizedCV,
          responseLength: result.optimizedCV?.length || 0,
          error: result.error
        };
      }, longCV);

      if (!response.success) {
        this.addIssue('CRITICAL', 'Long CV Processing Failed', `AI optimization failed: ${response.error}`, 'Submit CV longer than 50k characters');
      } else if (response.responseLength < 1000) {
        this.addIssue('HIGH', 'AI Response Too Short', 'Optimized CV is suspiciously short', 'Check AI processing logic for long inputs');
      } else {
        console.log('✅ Long CV processing successful');
      }
    } catch (error) {
      this.addIssue('CRITICAL', 'AI API Error', error.message, 'Test with long CV content');
    }
  }

  generateLongCV() {
    const sections = [
      'Dane osobowe',
      'Profil zawodowy',
      'Doświadczenie zawodowe',
      'Wykształcenie',
      'Umiejętności techniczne',
      'Certyfikaty',
      'Projekty',
      'Języki obce',
      'Zainteresowania'
    ];

    let cv = '';
    for (let i = 0; i < 50; i++) {
      sections.forEach(section => {
        cv += `\n\n${section}:\n`;
        cv += 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
        cv += 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '.repeat(15);
        cv += 'Ut enim ad minim veniam, quis nostrud exercitation ullamco. '.repeat(10);
      });
    }
    
    console.log(`📊 Generated CV length: ${cv.length} characters`);
    return cv;
  }

  // TEST 6: PDF Export Test
  async testPDFExport() {
    await this.page.goto(`${CONFIG.baseUrl}/success?demo=true`, { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(3000);

    // Look for PDF export button
    const pdfButton = await this.page.$('[data-action="export-pdf"], button[contains(text(), "PDF")]');
    if (!pdfButton) {
      this.addIssue('HIGH', 'PDF Export Button Missing', 'PDF export functionality not found', 'Navigate to success page');
      return;
    }

    // Test PDF export (won't actually download in headless mode, but will test the function)
    try {
      await this.page.evaluate(() => {
        // Simulate PDF export by checking if html2canvas is available
        if (typeof html2canvas === 'undefined') {
          throw new Error('html2canvas library not loaded');
        }
        
        // Check if jsPDF is available
        if (typeof window.jsPDF === 'undefined' && typeof jsPDF === 'undefined') {
          throw new Error('jsPDF library not loaded');
        }
        
        return true;
      });
      
      console.log('✅ PDF export libraries loaded');
    } catch (error) {
      this.addIssue('HIGH', 'PDF Export Libraries Missing', error.message, 'Click PDF export button');
    }
  }

  // TEST 7: Security Audit
  async testSecurity() {
    // Check for exposed secrets in client-side code
    const pageContent = await this.page.content();
    
    const secretPatterns = [
      /sk_live_[a-zA-Z0-9]+/g,  // Stripe live secret key
      /sk_test_[a-zA-Z0-9]+/g,  // Stripe test secret key
      /whsec_[a-zA-Z0-9]+/g,    // Stripe webhook secret
      /GROQ_API_KEY/g,          // Groq API key name
      /SUPABASE_SERVICE_ROLE_KEY/g // Supabase service key
    ];

    secretPatterns.forEach((pattern, index) => {
      const matches = pageContent.match(pattern);
      if (matches) {
        this.addIssue('CRITICAL', 'Secret Exposed in Client', `Potential secret found in HTML: ${matches[0]}`, 'View page source');
      }
    });

    // Check for proper CORS headers
    const response = await this.page.goto(`${CONFIG.baseUrl}/api/analyze`, { waitUntil: 'networkidle0' });
    const headers = response.headers();
    
    if (!headers['content-security-policy']) {
      this.addIssue('MEDIUM', 'Missing CSP Header', 'Content Security Policy not implemented', 'Check API response headers');
    }

    console.log('✅ Security audit completed');
  }

  // Run all tests
  async runFullAudit() {
    try {
      await this.init();

      await this.testFlow('49 PLN Subscription Flow', () => this.test49PLNSubscriptionFlow());
      await this.testFlow('79 PLN Express Flow', () => this.test79PLNExpressFlow());
      await this.testFlow('19.99 PLN One-time Flow', () => this.test1999PLNOneTimeFlow());
      await this.testFlow('Stripe Integration', () => this.testStripeIntegration());
      await this.testFlow('Long CV Processing', () => this.testLongCVProcessing());
      await this.testFlow('PDF Export', () => this.testPDFExport());
      await this.testFlow('Security Audit', () => this.testSecurity());

      // Generate final report
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Audit failed:', error);
      this.addIssue('CRITICAL', 'Audit Framework Error', error.message, 'Run audit script');
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async generateReport() {
    console.log('\n📊 AUDIT REPORT SUMMARY');
    console.log('========================');
    console.log(`Total Tests: ${this.results.summary.totalTests}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Critical Issues (P0): ${this.results.summary.critical}`);
    console.log(`High Issues (P1): ${this.results.summary.high}`);
    console.log(`Medium Issues (P2): ${this.results.summary.medium}`);

    console.log('\n🔴 ISSUES FOUND:');
    this.issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.priority}] ${issue.title}`);
      console.log(`   Description: ${issue.description}`);
      console.log(`   Reproduction: ${issue.reproductionSteps}`);
      console.log(`   Environment: ${issue.environment}\n`);
    });

    // Save results to file
    await fs.writeFile(CONFIG.testResultsPath, JSON.stringify(this.results, null, 2));
    console.log(`📄 Full report saved to: ${CONFIG.testResultsPath}`);

    // Production readiness assessment
    const isProductionReady = this.results.summary.critical === 0 && this.results.summary.high <= 2;
    console.log(`\n🎯 PRODUCTION READY: ${isProductionReady ? '✅ YES' : '❌ NO'}`);
    
    if (!isProductionReady) {
      console.log('❌ Critical issues must be fixed before production deployment');
      console.log('⚠️  High priority issues should be addressed for optimal user experience');
    }
  }
}

// Run the audit
const auditor = new CvPerfectAuditor();
auditor.runFullAudit().catch(console.error);