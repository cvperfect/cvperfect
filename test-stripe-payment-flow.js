// Comprehensive Stripe Payment Flow Test for CvPerfect
// Tests all payment plans and verifies complete payment process

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:3005';
const SCREENSHOT_DIR = './';

// Test CV content for payment flow
const TEST_CV_CONTENT = `Jan Kowalski
Software Developer

DOŚWIADCZENIE ZAWODOWE:
• Senior Developer w TechCorp (2021-2024)
  - Rozwój aplikacji webowych w React i Node.js
  - Zarządzanie zespołem 5 programistów
  - Wdrażanie nowych technologii i best practices

• Mid-level Developer w StartupXYZ (2019-2021)
  - Tworzenie API REST w Node.js i Express
  - Praca z bazami danych MongoDB i PostgreSQL
  - Optymalizacja wydajności aplikacji

WYKSZTAŁCENIE:
• Informatyka, Politechnika Warszawska (2015-2019)
  - Specjalizacja: Inżynieria Oprogramowania
  - Praca dyplomowa: Systemy rozproszone w chmurze

UMIEJĘTNOŚCI TECHNICZNE:
• Języki programowania: JavaScript, Python, TypeScript, Java
• Frameworki: React, Vue.js, Angular, Express, FastAPI
• Bazy danych: MongoDB, PostgreSQL, Redis, MySQL
• Narzędzia: Git, Docker, Kubernetes, AWS, Azure
• Metodyki: Agile, Scrum, DevOps, CI/CD`;

const JOB_POSTING = `Poszukujemy Senior Full-Stack Developer do zespołu e-commerce:

WYMAGANIA:
• Min. 5 lat doświadczenia w JavaScript/TypeScript
• Znajomość React, Node.js, i baz danych
• Doświadczenie z systemami płatności online
• Znajomość AWS/Azure

OFERUJEMY:
• Pracę zdalną lub hybrydową
• Konkurencyjne wynagrodzenie 15000-20000 zł
• Pakiet benefit i rozwój zawodowy
• Praca nad nowoczesnym stackiem technologicznym`;

class StripePaymentFlowTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            timestamp: new Date().toISOString(),
            testResults: [],
            screenshots: [],
            apiTests: [],
            errors: []
        };
    }

    async init() {
        console.log('🚀 Initializing Stripe Payment Flow Test...');
        this.browser = await puppeteer.launch({
            headless: false, // Keep visible for debugging
            defaultViewport: { width: 1400, height: 1000 },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--allow-running-insecure-content'
            ]
        });
        this.page = await this.browser.newPage();
        
        // Enable request interception to log API calls
        await this.page.setRequestInterception(true);
        this.page.on('request', request => {
            if (request.url().includes('/api/')) {
                console.log(`📡 API Request: ${request.method()} ${request.url()}`);
            }
            request.continue();
        });

        // Listen for responses
        this.page.on('response', response => {
            if (response.url().includes('/api/')) {
                console.log(`📡 API Response: ${response.status()} ${response.url()}`);
            }
        });
    }

    async takeScreenshot(name, description = '') {
        const filename = `screenshot-stripe-${name}.png`;
        const filepath = path.join(SCREENSHOT_DIR, filename);
        await this.page.screenshot({ path: filepath, fullPage: true });
        console.log(`📸 Screenshot saved: ${filename} - ${description}`);
        this.results.screenshots.push({ name, filename, description });
        return filename;
    }

    async testApiEndpoint(url, method = 'GET', data = null) {
        console.log(`🧪 Testing API endpoint: ${method} ${url}`);
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: data ? JSON.stringify(data) : null
            });
            
            const result = {
                url,
                method,
                status: response.status,
                ok: response.ok,
                data: null,
                error: null
            };

            try {
                result.data = await response.json();
            } catch (e) {
                result.data = await response.text();
            }

            this.results.apiTests.push(result);
            console.log(`✅ API Test Result: ${response.status} ${url}`);
            return result;
        } catch (error) {
            const result = {
                url,
                method,
                status: 0,
                ok: false,
                data: null,
                error: error.message
            };
            this.results.apiTests.push(result);
            console.log(`❌ API Test Error: ${error.message} for ${url}`);
            return result;
        }
    }

    async navigateToHomepage() {
        console.log('🏠 Navigating to homepage...');
        await this.page.goto(BASE_URL, { waitUntil: 'networkidle2' });
        await this.takeScreenshot('01-homepage', 'Initial homepage load');
    }

    async uploadCV() {
        console.log('📄 Starting CV upload process...');
        
        // Look for CV upload elements
        await new Promise(resolve => setTimeout(resolveSelector('[accept=".pdf,.docx"]', { timeout: 10000 });
        
        // Create a temporary CV file
        const tempFile = path.join(process.cwd(), 'temp-cv-test.txt');
        await fs.writeFile(tempFile, TEST_CV_CONTENT);
        
        // Upload the file
        const fileInput = await this.page.$('[accept=".pdf,.docx"]');
        await fileInput.uploadFile(tempFile);
        
        await this.takeScreenshot('02-cv-uploaded', 'CV file uploaded');
        
        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Clean up temp file
        await fs.unlink(tempFile);
    }

    async fillJobPosting() {
        console.log('💼 Adding job posting...');
        
        // Look for job posting textarea
        try {
            const jobTextarea = await this.page.$('textarea[placeholder*="job"], textarea[placeholder*="stanowisk"], textarea[placeholder*="ogłoszeni"]');
            if (jobTextarea) {
                await jobTextarea.type(JOB_POSTING);
                await this.takeScreenshot('03-job-posting', 'Job posting added');
            }
        } catch (e) {
            console.log('ℹ️ Job posting field not found or not required');
        }
    }

    async testPaymentPlan(planName, expectedPrice) {
        console.log(`💳 Testing payment plan: ${planName} (${expectedPrice})`);
        
        const testResult = {
            plan: planName,
            price: expectedPrice,
            success: false,
            steps: [],
            sessionData: null,
            stripeSession: null,
            errors: []
        };

        try {
            // Navigate to homepage first
            await this.navigateToHomepage();
            
            // Upload CV and fill job posting
            await this.uploadCV();
            await this.fillJobPosting();
            
            // Look for payment/upgrade buttons
            const paymentSelectors = [
                `button[data-plan="${planName}"]`,
                `[data-plan="${planName}"] button`,
                `button:has-text("${expectedPrice}")`,
                'button[class*="premium"], button[class*="payment"], button[class*="upgrade"]',
                'button:contains("Kup"), button:contains("Wybierz"), button:contains("Premium")'
            ];

            let paymentButton = null;
            for (const selector of paymentSelectors) {
                try {
                    paymentButton = await this.page.$(selector);
                    if (paymentButton) break;
                } catch (e) {
                    continue;
                }
            }

            if (!paymentButton) {
                // Try to find any button with payment-related text
                const buttons = await this.page.$$('button');
                for (const button of buttons) {
                    const text = await this.page.evaluate(el => el.textContent.toLowerCase(), button);
                    if (text.includes('premium') || text.includes('kup') || text.includes('płać') || 
                        text.includes('wybierz') || text.includes(expectedPrice.replace(/\s/g, ''))) {
                        paymentButton = button;
                        break;
                    }
                }
            }

            if (!paymentButton) {
                throw new Error(`Payment button for plan ${planName} not found`);
            }

            await this.takeScreenshot(`04-${planName}-before-payment`, `Before clicking payment for ${planName}`);
            
            // Click payment button
            await paymentButton.click();
            testResult.steps.push('Payment button clicked');
            
            // Wait for any modals or payment forms
            await new Promise(resolve => setTimeout(resolve, 3000));
            await this.takeScreenshot(`05-${planName}-payment-modal`, `Payment modal/form for ${planName}`);

            // Test session saving before payment
            const sessionId = `test_session_${Date.now()}_${planName}`;
            const sessionData = {
                sessionId,
                cvData: TEST_CV_CONTENT,
                jobPosting: JOB_POSTING,
                email: 'test@example.com',
                plan: planName,
                template: 'simple',
                photo: null
            };

            // Test save-session API
            const saveResult = await this.testApiEndpoint(
                `${BASE_URL}/api/save-session`,
                'POST',
                sessionData
            );
            
            if (saveResult.ok) {
                testResult.steps.push('Session data saved successfully');
                testResult.sessionData = saveResult.data;
            } else {
                testResult.errors.push('Failed to save session data');
            }

            // Test create-checkout-session API
            const checkoutData = {
                plan: planName,
                email: 'test@example.com',
                cv: TEST_CV_CONTENT.substring(0, 400), // Stripe metadata limit
                job: JOB_POSTING.substring(0, 200),
                fullSessionId: sessionId
            };

            const checkoutResult = await this.testApiEndpoint(
                `${BASE_URL}/api/create-checkout-session`,
                'POST',
                checkoutData
            );

            if (checkoutResult.ok && checkoutResult.data.url) {
                testResult.steps.push('Stripe checkout session created');
                testResult.stripeSession = checkoutResult.data;
                
                // Navigate to Stripe checkout
                console.log(`🔗 Navigating to Stripe checkout: ${checkoutResult.data.url}`);
                await this.page.goto(checkoutResult.data.url, { waitUntil: 'networkidle2' });
                await this.takeScreenshot(`06-${planName}-stripe-checkout`, `Stripe checkout page for ${planName}`);
                
                // Test Stripe page elements
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Check if we're on Stripe
                const isStripe = await this.page.evaluate(() => {
                    return window.location.hostname.includes('checkout.stripe.com') || 
                           document.querySelector('[data-testid="checkout"]') !== null ||
                           document.querySelector('.App-Payment') !== null;
                });

                if (isStripe) {
                    testResult.steps.push('Successfully redirected to Stripe checkout');
                    
                    // Look for payment form elements
                    const hasPaymentForm = await this.page.evaluate(() => {
                        return document.querySelector('input[name="cardnumber"]') !== null ||
                               document.querySelector('input[placeholder*="card" i]') !== null ||
                               document.querySelector('.CardField') !== null;
                    });

                    if (hasPaymentForm) {
                        testResult.steps.push('Payment form found on Stripe page');
                    }

                } else {
                    testResult.errors.push('Failed to redirect to Stripe checkout');
                }

                testResult.success = true;
                
            } else {
                testResult.errors.push('Failed to create Stripe checkout session');
            }

            // Test get-session-data API
            const getSessionResult = await this.testApiEndpoint(
                `${BASE_URL}/api/get-session-data?session_id=${sessionId}`
            );

            if (getSessionResult.ok) {
                testResult.steps.push('Session data retrieved successfully');
            }

        } catch (error) {
            console.error(`❌ Error testing ${planName}:`, error.message);
            testResult.errors.push(error.message);
        }

        this.results.testResults.push(testResult);
        return testResult;
    }

    async testPaymentCancellation() {
        console.log('❌ Testing payment cancellation flow...');
        
        try {
            // Start a payment flow
            await this.navigateToHomepage();
            await this.uploadCV();
            
            // Try to find and click a payment button
            const paymentButton = await this.page.$('button[class*="premium"], button[class*="payment"]');
            if (paymentButton) {
                await paymentButton.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Look for cancel/close buttons
                const cancelSelectors = [
                    'button:contains("Anuluj")',
                    'button:contains("Cancel")', 
                    'button:contains("Zamknij")',
                    '.close-button',
                    '[data-dismiss="modal"]',
                    '.modal-close'
                ];

                for (const selector of cancelSelectors) {
                    try {
                        const cancelButton = await this.page.$(selector);
                        if (cancelButton) {
                            await cancelButton.click();
                            await this.takeScreenshot('07-payment-cancelled', 'Payment cancelled');
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }
            
        } catch (error) {
            console.error('❌ Payment cancellation test error:', error.message);
            this.results.errors.push(`Payment cancellation test: ${error.message}`);
        }
    }

    async testSuccessPageIntegration() {
        console.log('🎉 Testing success page integration...');
        
        try {
            // Navigate directly to success page with test session
            const testSessionId = `test_success_${Date.now()}`;
            const successUrl = `${BASE_URL}/success?session_id=${testSessionId}&plan=basic`;
            
            await this.page.goto(successUrl, { waitUntil: 'networkidle2' });
            await this.takeScreenshot('08-success-page', 'Success page with test session');
            
            // Check for success page elements
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const successElements = await this.page.evaluate(() => {
                return {
                    hasTitle: document.querySelector('h1, h2, .title') !== null,
                    hasTemplates: document.querySelectorAll('[class*="template"]').length > 0,
                    hasDownloadButtons: document.querySelectorAll('button:contains("Pobierz"), button[class*="download"]').length > 0,
                    hasAIOptimization: document.querySelector('[class*="ai"], [class*="optimization"]') !== null
                };
            });

            console.log('✅ Success page elements:', successElements);
            
        } catch (error) {
            console.error('❌ Success page test error:', error.message);
            this.results.errors.push(`Success page test: ${error.message}`);
        }
    }

    async testAllPaymentScenarios() {
        console.log('🧪 Testing all payment scenarios...');

        // Test different payment plans
        const plans = [
            { name: 'basic', price: '19.99 zł' },
            { name: 'gold', price: '49 zł' },
            { name: 'premium', price: '79 zł' }
        ];

        for (const plan of plans) {
            await this.testPaymentPlan(plan.name, plan.price);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Brief pause between tests
        }

        // Test payment cancellation
        await this.testPaymentCancellation();
        
        // Test success page integration
        await this.testSuccessPageIntegration();
    }

    async generateReport() {
        const report = {
            ...this.results,
            summary: {
                totalTests: this.results.testResults.length,
                successfulTests: this.results.testResults.filter(t => t.success).length,
                failedTests: this.results.testResults.filter(t => !t.success).length,
                apiTests: this.results.apiTests.length,
                successfulApiTests: this.results.apiTests.filter(t => t.ok).length,
                totalErrors: this.results.errors.length,
                screenshots: this.results.screenshots.length
            },
            recommendations: []
        };

        // Add recommendations based on test results
        if (report.summary.failedTests > 0) {
            report.recommendations.push('Review failed payment flows and fix integration issues');
        }
        
        if (this.results.apiTests.some(t => !t.ok)) {
            report.recommendations.push('Fix API endpoint errors for better payment processing');
        }

        if (this.results.testResults.some(t => t.errors.length > 0)) {
            report.recommendations.push('Improve error handling in payment process');
        }

        report.recommendations.push('Consider adding more payment methods (PayPal, bank transfer)');
        report.recommendations.push('Implement better loading states during payment processing');
        report.recommendations.push('Add email notifications for successful payments');

        // Save detailed report
        const reportFile = 'stripe-payment-flow-test-report.json';
        await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
        console.log(`📋 Detailed report saved: ${reportFile}`);

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('🎯 STRIPE PAYMENT FLOW TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Successful Tests: ${report.summary.successfulTests}/${report.summary.totalTests}`);
        console.log(`❌ Failed Tests: ${report.summary.failedTests}/${report.summary.totalTests}`);
        console.log(`🔌 API Tests: ${report.summary.successfulApiTests}/${report.summary.apiTests}`);
        console.log(`📸 Screenshots: ${report.summary.screenshots}`);
        console.log(`⚠️  Total Errors: ${report.summary.totalErrors}`);
        console.log('\n📊 RECOMMENDATIONS:');
        report.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
        });
        console.log('='.repeat(60));

        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        console.log('🧹 Browser cleanup completed');
    }
}

// Main execution
async function runStripePaymentFlowTest() {
    const tester = new StripePaymentFlowTester();
    
    try {
        await tester.init();
        await tester.testAllPaymentScenarios();
        const report = await tester.generateReport();
        return report;
    } catch (error) {
        console.error('❌ Test execution error:', error);
        throw error;
    } finally {
        await tester.cleanup();
    }
}

// Run if called directly
if (require.main === module) {
    runStripePaymentFlowTest()
        .then(report => {
            console.log('✅ Stripe payment flow test completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Test failed:', error);
            process.exit(1);
        });
}

module.exports = { runStripePaymentFlowTest };