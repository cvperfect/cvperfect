// Stripe UI Payment Flow Test - Visual testing with Puppeteer
// Tests the complete payment flow through the browser interface

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:3007';
const SCREENSHOT_DIR = './';

// Test CV file content
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

class StripeUiFlowTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            timestamp: new Date().toISOString(),
            uiTests: [],
            screenshots: [],
            paymentFlows: [],
            errors: []
        };
    }

    async init() {
        console.log('🚀 Initializing Stripe UI Flow Test...');
        this.browser = await puppeteer.launch({
            headless: false, // Keep visible for visual debugging
            defaultViewport: { width: 1400, height: 1000 },
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security'
            ]
        });
        
        this.page = await this.browser.newPage();
        
        // Listen for network requests
        this.page.on('request', request => {
            if (request.url().includes('/api/')) {
                console.log(`📡 API Request: ${request.method()} ${request.url()}`);
            }
        });
        
        this.page.on('response', response => {
            if (response.url().includes('/api/')) {
                console.log(`📡 API Response: ${response.status()} ${response.url()}`);
            }
        });

        // Handle console messages
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`🔴 Browser Console Error: ${msg.text()}`);
            }
        });
    }

    async takeScreenshot(name, description = '') {
        const filename = `screenshot-stripe-ui-${name}.png`;
        const filepath = path.join(SCREENSHOT_DIR, filename);
        await this.page.screenshot({ path: filepath, fullPage: true });
        console.log(`📸 Screenshot: ${filename} - ${description}`);
        this.results.screenshots.push({ name, filename, description });
        return filename;
    }

    async navigateToHomepage() {
        console.log('🏠 Navigating to homepage...');
        await this.page.goto(BASE_URL, { waitUntil: 'networkidle2' });
        await this.takeScreenshot('01-homepage', 'Homepage loaded');
        
        // Check if page loaded correctly
        const title = await this.page.title();
        console.log(`📄 Page title: ${title}`);
        
        return title;
    }

    async findAndClickElement(selectors, description) {
        console.log(`🔍 Looking for: ${description}`);
        
        for (const selector of selectors) {
            try {
                console.log(`   Trying selector: ${selector}`);
                await this.page.waitForSelector(selector, { timeout: 5000 });
                const element = await this.page.$(selector);
                if (element) {
                    console.log(`✅ Found element with: ${selector}`);
                    await element.click();
                    return element;
                }
            } catch (e) {
                console.log(`   ❌ Not found: ${selector}`);
                continue;
            }
        }
        
        // Try alternative approach - search by text content
        try {
            const textSelectors = [
                'Premium', 'Kup', 'Płać', 'Wybierz', 'Upgrade', 
                '19.99', '49', '79', 'Basic', 'Gold'
            ];
            
            for (const text of textSelectors) {
                const elements = await this.page.$$('button, a, div[role="button"]');
                for (const element of elements) {
                    const content = await this.page.evaluate(el => el.textContent.trim(), element);
                    if (content.toLowerCase().includes(text.toLowerCase())) {
                        console.log(`✅ Found element by text: "${content}"`);
                        await element.click();
                        return element;
                    }
                }
            }
        } catch (e) {
            console.log(`❌ Text-based search failed: ${e.message}`);
        }
        
        throw new Error(`Could not find element: ${description}`);
    }

    async uploadTestCV() {
        console.log('📄 Attempting CV upload...');
        
        try {
            // Create temporary CV file
            const tempFile = path.join(process.cwd(), 'temp-test-cv.txt');
            await fs.writeFile(tempFile, TEST_CV_CONTENT);
            
            // Look for file input
            const fileSelectors = [
                'input[type="file"]',
                'input[accept*=".pdf"]',
                'input[accept*=".docx"]',
                '[data-testid="file-input"]',
                '.file-upload input',
                '#cv-upload'
            ];
            
            let fileInput = null;
            for (const selector of fileSelectors) {
                try {
                    fileInput = await this.page.$(selector);
                    if (fileInput) {
                        console.log(`✅ Found file input: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (fileInput) {
                await fileInput.uploadFile(tempFile);
                console.log('✅ CV file uploaded successfully');
                await this.page.waitForTimeout(2000); // Wait for processing
                await this.takeScreenshot('02-cv-uploaded', 'CV uploaded and processing');
            } else {
                console.log('⚠️ File input not found, skipping upload');
            }
            
            // Clean up temp file
            await fs.unlink(tempFile);
            
        } catch (error) {
            console.log(`⚠️ CV upload failed: ${error.message}`);
        }
    }

    async testPaymentModalFlow() {
        console.log('💳 Testing payment modal flow...');
        
        const paymentTest = {
            modalFound: false,
            plansVisible: false,
            clickSuccess: false,
            redirectToStripe: false,
            stripeFormVisible: false,
            error: null
        };
        
        try {
            // Look for payment/premium buttons
            const paymentSelectors = [
                'button[class*="premium"]',
                'button[class*="payment"]',
                'button[class*="upgrade"]',
                '[data-testid*="payment"]',
                '[data-testid*="premium"]',
                'button:contains("Premium")',
                'button:contains("Kup")',
                'button:contains("Wybierz")',
                '.pricing-button',
                '.payment-button'
            ];
            
            await this.takeScreenshot('03-looking-for-payment', 'Looking for payment buttons');
            
            // Try to find payment elements
            const element = await this.findAndClickElement(
                paymentSelectors, 
                'Payment/Premium button'
            );
            
            if (element) {
                paymentTest.clickSuccess = true;
                await this.page.waitForTimeout(3000); // Wait for modal/redirect
                await this.takeScreenshot('04-after-payment-click', 'After clicking payment button');
                
                // Check if modal appeared
                const modalSelectors = [
                    '.modal',
                    '.payment-modal',
                    '.premium-modal',
                    '[role="dialog"]',
                    '.overlay',
                    '.popup'
                ];
                
                for (const selector of modalSelectors) {
                    try {
                        const modal = await this.page.$(selector);
                        if (modal) {
                            paymentTest.modalFound = true;
                            console.log(`✅ Payment modal found: ${selector}`);
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
                
                // Check for plan options
                const planElements = await this.page.$$eval('*', elements => {
                    return elements.filter(el => {
                        const text = el.textContent || '';
                        return text.includes('19.99') || text.includes('49') || text.includes('79') ||
                               text.includes('Basic') || text.includes('Gold') || text.includes('Premium');
                    }).length;
                });
                
                paymentTest.plansVisible = planElements > 0;
                console.log(`📊 Found ${planElements} plan-related elements`);
                
                // Check if we got redirected to Stripe
                const currentUrl = this.page.url();
                if (currentUrl.includes('stripe.com') || currentUrl.includes('checkout')) {
                    paymentTest.redirectToStripe = true;
                    console.log('✅ Redirected to Stripe checkout');
                    
                    // Check for Stripe payment form
                    await this.page.waitForTimeout(3000);
                    const stripeElements = await this.page.evaluate(() => {
                        return {
                            hasCardInput: document.querySelector('input[name="cardnumber"]') !== null ||
                                        document.querySelector('[placeholder*="Card number"]') !== null,
                            hasEmailInput: document.querySelector('input[type="email"]') !== null,
                            hasPayButton: document.querySelector('button[type="submit"]') !== null ||
                                        document.querySelector('[data-testid*="pay"]') !== null
                        };
                    });
                    
                    paymentTest.stripeFormVisible = stripeElements.hasCardInput || stripeElements.hasEmailInput;
                    console.log('💳 Stripe form elements:', stripeElements);
                    
                    await this.takeScreenshot('05-stripe-checkout', 'Stripe checkout page');
                }
            }
            
        } catch (error) {
            paymentTest.error = error.message;
            console.log(`❌ Payment modal test error: ${error.message}`);
        }
        
        this.results.paymentFlows.push(paymentTest);
        return paymentTest;
    }

    async testSuccessPageAccess() {
        console.log('🎉 Testing success page access...');
        
        try {
            // Navigate directly to success page with test parameters
            const testSessionId = 'cs_test_fake_session_for_ui_test';
            const successUrl = `${BASE_URL}/success?session_id=${testSessionId}&plan=basic`;
            
            console.log(`🔗 Navigating to: ${successUrl}`);
            await this.page.goto(successUrl, { waitUntil: 'networkidle2' });
            await this.takeScreenshot('06-success-page', 'Success page loaded');
            
            // Check for success page elements
            const successElements = await this.page.evaluate(() => {
                return {
                    hasTitle: document.querySelector('h1, h2, .title, [class*="title"]') !== null,
                    hasTemplates: document.querySelectorAll('[class*="template"], [data-template]').length,
                    hasButtons: document.querySelectorAll('button').length,
                    hasDownloadOptions: document.querySelector('[class*="download"], button:contains("Pobierz")') !== null,
                    bodyContent: document.body.textContent.substring(0, 200)
                };
            });
            
            console.log('✅ Success page elements found:', successElements);
            
            this.results.uiTests.push({
                test: 'success_page_access',
                success: successElements.hasTitle || successElements.hasButtons > 0,
                details: successElements
            });
            
        } catch (error) {
            console.log(`❌ Success page test error: ${error.message}`);
            this.results.errors.push(`Success page: ${error.message}`);
        }
    }

    async inspectPageStructure() {
        console.log('🔍 Inspecting page structure for payment elements...');
        
        try {
            const pageStructure = await this.page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
                    text: btn.textContent.trim(),
                    className: btn.className,
                    id: btn.id,
                    visible: btn.offsetHeight > 0
                })).filter(btn => btn.text.length > 0);
                
                const forms = Array.from(document.querySelectorAll('form')).map(form => ({
                    action: form.action,
                    method: form.method,
                    className: form.className,
                    inputCount: form.querySelectorAll('input').length
                }));
                
                const links = Array.from(document.querySelectorAll('a[href*="stripe"], a[href*="payment"], a[href*="checkout"]')).map(link => ({
                    href: link.href,
                    text: link.textContent.trim()
                }));
                
                return {
                    buttons: buttons.slice(0, 10), // Limit to first 10 buttons
                    forms,
                    paymentLinks: links,
                    totalElements: {
                        buttons: buttons.length,
                        forms: forms.length,
                        inputs: document.querySelectorAll('input').length,
                        modals: document.querySelectorAll('.modal, [role="dialog"]').length
                    }
                };
            });
            
            console.log('📊 Page structure analysis:', pageStructure);
            
            this.results.uiTests.push({
                test: 'page_structure_analysis',
                success: true,
                details: pageStructure
            });
            
            await this.takeScreenshot('07-page-analysis', 'Page structure analysis complete');
            
        } catch (error) {
            console.log(`❌ Page inspection error: ${error.message}`);
        }
    }

    async runFullUiTest() {
        console.log('🧪 Running full UI payment flow test...');
        
        try {
            // Navigate to homepage
            await this.navigateToHomepage();
            
            // Inspect page structure
            await this.inspectPageStructure();
            
            // Try CV upload
            await this.uploadTestCV();
            
            // Test payment modal flow
            await this.testPaymentModalFlow();
            
            // Test success page
            await this.testSuccessPageAccess();
            
            console.log('✅ Full UI test completed');
            
        } catch (error) {
            console.log(`❌ UI test error: ${error.message}`);
            this.results.errors.push(error.message);
        }
    }

    async generateReport() {
        const report = {
            ...this.results,
            summary: {
                totalUiTests: this.results.uiTests.length,
                successfulUiTests: this.results.uiTests.filter(t => t.success).length,
                paymentFlowTests: this.results.paymentFlows.length,
                screenshotCount: this.results.screenshots.length,
                totalErrors: this.results.errors.length
            }
        };
        
        // Analysis
        report.analysis = {
            homepageAccessible: this.results.uiTests.some(t => t.test === 'page_structure_analysis'),
            paymentButtonsFound: this.results.paymentFlows.some(f => f.clickSuccess),
            stripeIntegrationWorking: this.results.paymentFlows.some(f => f.redirectToStripe),
            successPageAccessible: this.results.uiTests.some(t => t.test === 'success_page_access' && t.success)
        };
        
        // Recommendations
        report.recommendations = [];
        
        if (!report.analysis.paymentButtonsFound) {
            report.recommendations.push('Payment buttons may not be visible or properly labeled - review UI design');
        }
        
        if (!report.analysis.stripeIntegrationWorking) {
            report.recommendations.push('Stripe checkout integration needs verification - users may not reach payment page');
        }
        
        if (!report.analysis.successPageAccessible) {
            report.recommendations.push('Success page may have issues - verify post-payment user experience');
        }
        
        report.recommendations.push('Test payment flow with real Stripe test cards');
        report.recommendations.push('Add clearer payment button labels and visual indicators');
        report.recommendations.push('Implement loading states during payment processing');
        
        // Save report
        const reportFile = 'stripe-ui-flow-test-report.json';
        await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
        
        // Print summary
        console.log('\n' + '='.repeat(70));
        console.log('🎯 STRIPE UI FLOW TEST RESULTS');
        console.log('='.repeat(70));
        console.log(`🖥️  UI Tests: ${report.summary.successfulUiTests}/${report.summary.totalUiTests} successful`);
        console.log(`💳 Payment Flow Tests: ${report.summary.paymentFlowTests} performed`);
        console.log(`📸 Screenshots: ${report.summary.screenshotCount} taken`);
        console.log(`⚠️  Errors: ${report.summary.totalErrors}`);
        console.log('\n📋 ANALYSIS:');
        console.log(`✅ Homepage Accessible: ${report.analysis.homepageAccessible}`);
        console.log(`✅ Payment Buttons Found: ${report.analysis.paymentButtonsFound}`);
        console.log(`✅ Stripe Integration: ${report.analysis.stripeIntegrationWorking}`);
        console.log(`✅ Success Page Accessible: ${report.analysis.successPageAccessible}`);
        
        if (report.summary.totalErrors > 0) {
            console.log('\n❌ ERRORS:');
            this.results.errors.forEach(error => console.log(`   • ${error}`));
        }
        
        console.log('\n📝 RECOMMENDATIONS:');
        report.recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`));
        console.log('='.repeat(70));
        console.log(`📄 Full report saved: ${reportFile}`);
        
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
async function runStripeUiTest() {
    const tester = new StripeUiFlowTester();
    
    try {
        await tester.init();
        await tester.runFullUiTest();
        return await tester.generateReport();
    } catch (error) {
        console.error('❌ UI test execution error:', error);
        throw error;
    } finally {
        await tester.cleanup();
    }
}

// Run if called directly
if (require.main === module) {
    runStripeUiTest()
        .then(report => {
            console.log('\n✅ Stripe UI flow test completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ UI test failed:', error);
            process.exit(1);
        });
}

module.exports = { runStripeUiTest };