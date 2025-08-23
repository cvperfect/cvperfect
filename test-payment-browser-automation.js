/**
 * BROWSER AUTOMATION TEST FOR PAYMENT FLOW
 * Uses MCP Puppeteer to test real user interactions with payment system
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class PaymentFlowBrowserTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      testStartTime: new Date().toISOString(),
      testResults: [],
      screenshots: [],
      consoleErrors: [],
      networkErrors: [],
      performanceMetrics: {}
    };
    this.config = {
      baseUrl: 'http://localhost:3003',
      headless: false, // Set to false for debugging, true for CI
      timeout: 30000,
      screenshotDir: './test-screenshots'
    };
  }

  async setup() {
    console.log('🔧 Setting up browser automation test...');
    
    try {
      // Ensure screenshot directory exists
      try {
        await fs.access(this.config.screenshotDir);
      } catch {
        await fs.mkdir(this.config.screenshotDir, { recursive: true });
      }

      // Launch browser with appropriate options
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        defaultViewport: { width: 1366, height: 768 },
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.page = await this.browser.newPage();

      // Set up console logging
      this.page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        
        if (type === 'error') {
          this.results.consoleErrors.push({
            message: text,
            timestamp: new Date().toISOString()
          });
          console.log(`🔍 Console Error: ${text}`);
        }
      });

      // Set up network monitoring
      this.page.on('requestfailed', req => {
        this.results.networkErrors.push({
          url: req.url(),
          errorText: req.failure().errorText,
          timestamp: new Date().toISOString()
        });
        console.log(`🌐 Network Error: ${req.url()} - ${req.failure().errorText}`);
      });

      // Add additional headers that might be needed
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8'
      });

      console.log('✅ Browser setup completed');
      return true;

    } catch (error) {
      console.error('❌ Browser setup failed:', error.message);
      this.logResult('Browser Setup', 'FAIL', { message: error.message });
      return false;
    }
  }

  logResult(testName, status, details = {}) {
    const result = {
      testName,
      status,
      timestamp: new Date().toISOString(),
      details
    };
    
    this.results.testResults.push(result);
    
    const statusSymbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${statusSymbol} ${testName}: ${status}`);
    if (details.message) {
      console.log(`   ${details.message}`);
    }
  }

  async takeScreenshot(name, fullPage = false) {
    try {
      const filename = `${name}-${Date.now()}.png`;
      const filepath = path.join(this.config.screenshotDir, filename);
      
      await this.page.screenshot({ 
        path: filepath,
        fullPage: fullPage
      });
      
      this.results.screenshots.push({
        name: name,
        filename: filename,
        filepath: filepath,
        timestamp: new Date().toISOString()
      });
      
      console.log(`📸 Screenshot saved: ${filename}`);
      return filepath;
      
    } catch (error) {
      console.error(`❌ Failed to take screenshot ${name}:`, error.message);
      return null;
    }
  }

  async testHomepageLoad() {
    console.log('\n🏠 Testing Homepage Load...');
    
    try {
      const startTime = Date.now();
      
      // Navigate to homepage
      await this.page.goto(this.config.baseUrl, { 
        waitUntil: 'networkidle0',
        timeout: this.config.timeout 
      });
      
      const loadTime = Date.now() - startTime;
      
      // Take screenshot
      await this.takeScreenshot('01-homepage-loaded');
      
      // Check if essential elements are present
      const titleExists = await this.page.$('h1') !== null;
      const uploadAreaExists = await this.page.$('.upload-area, .file-upload-area') !== null;
      const ctaButtonExists = await this.page.$('.cta-button, .upload-button') !== null;
      
      // Check for critical JavaScript errors
      const hasConsoleErrors = this.results.consoleErrors.length > 0;
      
      if (titleExists && (uploadAreaExists || ctaButtonExists) && !hasConsoleErrors) {
        this.logResult('Homepage Load', 'PASS', {
          message: `Loaded in ${loadTime}ms, all elements present`,
          loadTime: loadTime,
          elements: { titleExists, uploadAreaExists, ctaButtonExists }
        });
      } else {
        this.logResult('Homepage Load', 'FAIL', {
          message: 'Missing critical elements or console errors',
          loadTime: loadTime,
          elements: { titleExists, uploadAreaExists, ctaButtonExists },
          consoleErrors: this.results.consoleErrors.length
        });
      }

    } catch (error) {
      this.logResult('Homepage Load', 'FAIL', { 
        message: `Failed to load homepage: ${error.message}` 
      });
      await this.takeScreenshot('01-homepage-error');
    }
  }

  async testCVUploadInteraction() {
    console.log('\n📄 Testing CV Upload Interaction...');
    
    try {
      // Look for upload trigger elements - try multiple possible selectors
      const uploadSelectors = [
        '.upload-area',
        '.file-upload-area',
        '.drag-drop-area',
        '[data-testid="upload-area"]',
        '.upload-section button',
        '.cta-button',
        'button[type="button"]'
      ];

      let uploadElement = null;
      for (const selector of uploadSelectors) {
        uploadElement = await this.page.$(selector);
        if (uploadElement) {
          console.log(`🎯 Found upload element with selector: ${selector}`);
          break;
        }
      }

      if (!uploadElement) {
        // Try to find any clickable element that might open upload modal
        const allButtons = await this.page.$$('button');
        if (allButtons.length > 0) {
          uploadElement = allButtons[0]; // Try the first button
          console.log(`🎯 Using first button as upload trigger`);
        }
      }

      if (uploadElement) {
        // Click to trigger upload or modal
        await uploadElement.click();
        await this.page.waitForTimeout(2000); // Wait for modal/response

        await this.takeScreenshot('02-upload-triggered');

        // Check if modal appeared or file input is available
        const modalExists = await this.page.$('.modal, .popup, .overlay') !== null;
        const fileInputExists = await this.page.$('input[type="file"]') !== null;
        
        if (modalExists || fileInputExists) {
          this.logResult('CV Upload Trigger', 'PASS', {
            message: 'Upload interface accessible',
            modalExists,
            fileInputExists
          });

          // If there's a file input, test it
          if (fileInputExists) {
            try {
              // Create a test CV file
              const testCVPath = path.join(__dirname, 'test-cv.txt');
              await fs.writeFile(testCVPath, `Konrad Jakóbczak
Senior Software Developer
Email: konrad@example.com

EXPERIENCE:
Senior Developer at UPS (2020-2024)
- React.js, Node.js development
- Team leadership

SKILLS:
JavaScript, React, Node.js, Python

EDUCATION:
Master in Computer Science
University of Technology (2016-2018)`);

              const fileInput = await this.page.$('input[type="file"]');
              await fileInput.uploadFile(testCVPath);
              
              await this.page.waitForTimeout(3000); // Wait for processing
              await this.takeScreenshot('03-cv-uploaded');

              // Clean up test file
              try {
                await fs.unlink(testCVPath);
              } catch (e) {
                // Ignore cleanup errors
              }

              this.logResult('CV File Upload', 'PASS', {
                message: 'CV file uploaded successfully'
              });

            } catch (error) {
              this.logResult('CV File Upload', 'FAIL', {
                message: `File upload failed: ${error.message}`
              });
            }
          }

        } else {
          this.logResult('CV Upload Trigger', 'FAIL', {
            message: 'No upload interface found after clicking'
          });
        }

      } else {
        this.logResult('CV Upload Trigger', 'FAIL', {
          message: 'No upload button or area found on page'
        });
        await this.takeScreenshot('02-no-upload-element');
      }

    } catch (error) {
      this.logResult('CV Upload Interaction', 'FAIL', {
        message: `Upload interaction failed: ${error.message}`
      });
      await this.takeScreenshot('02-upload-error');
    }
  }

  async testPaymentButtonInteraction() {
    console.log('\n💳 Testing Payment Button Interaction...');
    
    try {
      // Look for payment-related buttons
      const paymentSelectors = [
        '.payment-button',
        '.checkout-button',
        '.pay-button',
        '[data-testid="payment-btn"]',
        'button:contains("płatności")',
        'button:contains("payment")',
        'button:contains("Przejdź do")'
      ];

      // Also try text-based search
      const paymentTexts = [
        'płatność', 'payment', 'checkout', 'basic', 'premium', 'gold'
      ];

      let paymentElement = null;

      // Try CSS selectors first
      for (const selector of paymentSelectors) {
        try {
          paymentElement = await this.page.$(selector);
          if (paymentElement) {
            console.log(`🎯 Found payment element with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Some selectors might not be valid, continue
        }
      }

      // If not found, try text-based search
      if (!paymentElement) {
        for (const text of paymentTexts) {
          try {
            paymentElement = await this.page.evaluateHandle((searchText) => {
              const buttons = Array.from(document.querySelectorAll('button'));
              return buttons.find(button => 
                button.textContent.toLowerCase().includes(searchText.toLowerCase())
              );
            }, text);

            if (paymentElement && await paymentElement.asElement()) {
              console.log(`🎯 Found payment button with text: ${text}`);
              paymentElement = await paymentElement.asElement();
              break;
            }
          } catch (e) {
            // Continue searching
          }
        }
      }

      if (paymentElement) {
        // Scroll element into view
        await paymentElement.scrollIntoView();
        await this.page.waitForTimeout(1000);

        await this.takeScreenshot('04-before-payment-click');

        // Click the payment button
        await paymentElement.click();
        await this.page.waitForTimeout(5000); // Wait for processing/redirect

        await this.takeScreenshot('05-after-payment-click');

        // Check what happened after click
        const currentUrl = this.page.url();
        const hasStripeInUrl = currentUrl.includes('stripe') || currentUrl.includes('checkout');
        const hasModalOpen = await this.page.$('.modal, .popup, .overlay') !== null;
        const hasEmailInput = await this.page.$('input[type="email"]') !== null;
        
        if (hasStripeInUrl) {
          this.logResult('Payment Button Click - Stripe Redirect', 'PASS', {
            message: 'Successfully redirected to Stripe',
            newUrl: currentUrl
          });
        } else if (hasModalOpen || hasEmailInput) {
          this.logResult('Payment Button Click - Modal Opened', 'PASS', {
            message: 'Payment modal or form opened',
            currentUrl: currentUrl
          });
        } else {
          this.logResult('Payment Button Click', 'WARN', {
            message: 'Button clicked but unclear result',
            currentUrl: currentUrl
          });
        }

      } else {
        this.logResult('Payment Button Search', 'FAIL', {
          message: 'No payment button found on page'
        });
        await this.takeScreenshot('04-no-payment-button');
      }

    } catch (error) {
      this.logResult('Payment Button Interaction', 'FAIL', {
        message: `Payment interaction failed: ${error.message}`
      });
      await this.takeScreenshot('04-payment-error');
    }
  }

  async testStripeIntegration() {
    console.log('\n💰 Testing Stripe Integration...');
    
    try {
      // Check if Stripe.js is loaded
      const stripeLoaded = await this.page.evaluate(() => {
        return typeof window.Stripe !== 'undefined';
      });

      if (stripeLoaded) {
        this.logResult('Stripe.js Loading', 'PASS', {
          message: 'Stripe.js loaded successfully'
        });

        // Test if environment variables are accessible
        const hasPublicKey = await this.page.evaluate(() => {
          return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        });

        if (hasPublicKey) {
          this.logResult('Stripe Public Key', 'PASS', {
            message: 'Stripe publishable key is accessible'
          });
        } else {
          this.logResult('Stripe Public Key', 'WARN', {
            message: 'Stripe publishable key not found in browser'
          });
        }

      } else {
        this.logResult('Stripe.js Loading', 'FAIL', {
          message: 'Stripe.js not loaded'
        });
      }

      // Test if checkout session creation endpoint is working
      const checkoutTest = await this.page.evaluate(async () => {
        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plan: 'basic',
              email: 'test@cvperfect.com',
              cv: 'Test CV content for stripe integration test',
              job: 'Test job posting'
            })
          });

          return {
            ok: response.ok,
            status: response.status,
            hasSession: response.ok
          };
        } catch (error) {
          return {
            ok: false,
            error: error.message
          };
        }
      });

      if (checkoutTest.ok) {
        this.logResult('Stripe Session Creation', 'PASS', {
          message: 'Checkout session creation endpoint working'
        });
      } else {
        this.logResult('Stripe Session Creation', 'FAIL', {
          message: `Session creation failed: ${checkoutTest.error || 'HTTP ' + checkoutTest.status}`
        });
      }

    } catch (error) {
      this.logResult('Stripe Integration', 'FAIL', {
        message: `Stripe integration test failed: ${error.message}`
      });
    }
  }

  async testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design...');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1366, height: 768 }
    ];

    for (const viewport of viewports) {
      try {
        await this.page.setViewport(viewport);
        await this.page.waitForTimeout(2000); // Allow layout to settle

        await this.takeScreenshot(`06-responsive-${viewport.name.toLowerCase()}`);

        // Check if critical elements are still visible
        const elementsVisible = await this.page.evaluate(() => {
          const checkVisibility = (selector) => {
            const element = document.querySelector(selector);
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          };

          return {
            title: checkVisibility('h1'),
            buttons: document.querySelectorAll('button').length > 0,
            content: checkVisibility('main, .main, .content')
          };
        });

        if (elementsVisible.title && elementsVisible.buttons && elementsVisible.content) {
          this.logResult(`Responsive - ${viewport.name}`, 'PASS', {
            message: 'All elements visible and accessible',
            viewport: viewport
          });
        } else {
          this.logResult(`Responsive - ${viewport.name}`, 'FAIL', {
            message: 'Some elements not visible',
            elementsVisible,
            viewport: viewport
          });
        }

      } catch (error) {
        this.logResult(`Responsive - ${viewport.name}`, 'FAIL', {
          message: `Responsive test failed: ${error.message}`
        });
      }
    }

    // Reset to desktop viewport
    await this.page.setViewport({ width: 1366, height: 768 });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser cleanup completed');
    }
  }

  async generateReport() {
    const endTime = new Date().toISOString();
    const totalTests = this.results.testResults.length;
    const passedTests = this.results.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.results.testResults.filter(r => r.status === 'FAIL').length;
    const warningTests = this.results.testResults.filter(r => r.status === 'WARN').length;

    const report = {
      ...this.results,
      testEndTime: endTime,
      summary: {
        totalTests,
        passedTests,
        failedTests,
        warningTests,
        successRate: `${Math.round((passedTests / totalTests) * 100)}%`
      },
      criticalIssues: this.results.testResults.filter(r => r.status === 'FAIL'),
      screenshots: this.results.screenshots
    };

    // Save report
    const reportPath = './payment-browser-test-report.json';
    try {
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📊 Browser test report saved to: ${reportPath}`);
    } catch (error) {
      console.error(`❌ Failed to save browser test report: ${error.message}`);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('🌐 BROWSER AUTOMATION TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️  Warnings: ${warningTests}`);
    console.log(`🎯 Success Rate: ${report.summary.successRate}`);
    console.log(`📸 Screenshots: ${this.results.screenshots.length}`);
    console.log(`🚨 Console Errors: ${this.results.consoleErrors.length}`);
    console.log(`🌐 Network Errors: ${this.results.networkErrors.length}`);

    if (this.results.screenshots.length > 0) {
      console.log('\n📸 Screenshots Generated:');
      this.results.screenshots.forEach(screenshot => {
        console.log(`   • ${screenshot.name}: ${screenshot.filename}`);
      });
    }

    return report;
  }

  async runAllTests() {
    console.log('🚀 Starting Browser Automation Test Suite...');
    console.log(`🌐 Testing URL: ${this.config.baseUrl}`);
    console.log('='.repeat(60));

    try {
      // Setup browser
      const setupSuccess = await this.setup();
      if (!setupSuccess) {
        throw new Error('Browser setup failed');
      }

      // Run all browser tests
      await this.testHomepageLoad();
      await this.testCVUploadInteraction();
      await this.testPaymentButtonInteraction();
      await this.testStripeIntegration();
      await this.testResponsiveDesign();

      // Generate and return report
      return await this.generateReport();

    } catch (error) {
      console.error(`❌ Browser test suite failed: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const browserTest = new PaymentFlowBrowserTest();
  browserTest.runAllTests()
    .then(() => {
      console.log('\n✅ Browser automation test completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Browser automation test failed:', error.message);
      process.exit(1);
    });
}

module.exports = PaymentFlowBrowserTest;