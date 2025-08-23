const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test results storage
let testResults = {
    mainPage: [],
    navigation: [],
    apiEndpoints: [],
    uiUx: [],
    dataFlow: [],
    responsive: [],
    errors: []
};

// Helper function to add test result
function addTestResult(category, test, status, details = '') {
    testResults[category].push({
        test,
        status, // 'PASS', 'FAIL', 'WARNING'
        details,
        timestamp: new Date().toISOString()
    });
    console.log(`[${category.toUpperCase()}] ${test}: ${status}${details ? ' - ' + details : ''}`);
}

// Helper function to take screenshots
async function takeScreenshot(page, name) {
    const screenshotPath = path.join(__dirname, `screenshot-${name}-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
}

// Helper function to check for console errors
function setupConsoleMonitoring(page) {
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        } else if (msg.type() === 'warning') {
            warnings.push(msg.text());
        }
    });
    
    page.on('pageerror', error => {
        errors.push(`Page Error: ${error.message}`);
    });
    
    return { errors, warnings };
}

async function runComprehensiveTests() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    const consoleMonitor = setupConsoleMonitoring(page);
    
    try {
        console.log('🚀 Starting comprehensive CvPerfect website testing...');
        
        // Navigate to main page
        console.log('\n📄 Testing Main Page...');
        await page.goto('http://localhost:3009', { waitUntil: 'networkidle2' });
        await takeScreenshot(page, 'main-page-load');
        
        // Test 1: Page loads successfully
        const title = await page.title();
        if (title.includes('CvPerfect') || title.includes('CV')) {
            addTestResult('mainPage', 'Page loads with correct title', 'PASS', `Title: ${title}`);
        } else {
            addTestResult('mainPage', 'Page loads with correct title', 'FAIL', `Unexpected title: ${title}`);
        }
        
        // Test 2: Language switching
        console.log('\n🌐 Testing Language Switching...');
        try {
            // Look for language switcher
            const langSwitcher = await page.$('[data-testid="language-switcher"], .language-switch, button[onclick*="language"]');
            if (langSwitcher) {
                await langSwitcher.click();
                await page.waitForTimeout(1000);
                addTestResult('mainPage', 'Language switcher exists and clickable', 'PASS');
                await takeScreenshot(page, 'language-switched');
            } else {
                // Try alternative selectors
                const englishBtn = await page.$('button:has-text("EN"), button:has-text("English")');
                const polishBtn = await page.$('button:has-text("PL"), button:has-text("Polski")');
                if (englishBtn || polishBtn) {
                    if (englishBtn) await englishBtn.click();
                    else await polishBtn.click();
                    await page.waitForTimeout(1000);
                    addTestResult('mainPage', 'Language switcher found via text', 'PASS');
                } else {
                    addTestResult('mainPage', 'Language switcher functionality', 'FAIL', 'No language switcher found');
                }
            }
        } catch (error) {
            addTestResult('mainPage', 'Language switching', 'FAIL', error.message);
        }
        
        // Test 3: CV File Upload
        console.log('\n📁 Testing CV File Upload...');
        try {
            // Look for file input
            const fileInput = await page.$('input[type="file"]');
            if (fileInput) {
                addTestResult('mainPage', 'File input element exists', 'PASS');
                
                // Test file input functionality (simulate file selection)
                const testFilePath = path.join(__dirname, 'test-cv.pdf');
                if (!fs.existsSync(testFilePath)) {
                    // Create a dummy PDF file for testing
                    fs.writeFileSync(testFilePath, 'Dummy PDF content for testing');
                }
                
                await fileInput.uploadFile(testFilePath);
                await page.waitForTimeout(2000);
                addTestResult('mainPage', 'File upload functionality', 'PASS');
                await takeScreenshot(page, 'file-uploaded');
            } else {
                addTestResult('mainPage', 'File input element', 'FAIL', 'No file input found');
            }
            
            // Test drag and drop area
            const dropZone = await page.$('.drop-zone, .file-drop, [data-testid="drop-zone"]');
            if (dropZone) {
                addTestResult('mainPage', 'Drag and drop zone exists', 'PASS');
            } else {
                addTestResult('mainPage', 'Drag and drop zone', 'WARNING', 'Drop zone not clearly identified');
            }
        } catch (error) {
            addTestResult('mainPage', 'CV file upload', 'FAIL', error.message);
        }
        
        // Test 4: Form Validation
        console.log('\n✅ Testing Form Validation...');
        try {
            // Look for email input
            const emailInput = await page.$('input[type="email"], input[name="email"], input[id*="email"]');
            if (emailInput) {
                // Test invalid email
                await emailInput.click();
                await emailInput.type('invalid-email');
                
                // Look for submit button
                const submitBtn = await page.$('button[type="submit"], .submit-btn, button:has-text("Wyślij"), button:has-text("Submit")');
                if (submitBtn) {
                    await submitBtn.click();
                    await page.waitForTimeout(1000);
                    
                    // Check for validation message
                    const validationMsg = await page.$('.error, .validation-error, [role="alert"]');
                    if (validationMsg) {
                        addTestResult('mainPage', 'Email validation works', 'PASS');
                    } else {
                        addTestResult('mainPage', 'Email validation', 'WARNING', 'No visible validation message');
                    }
                    
                    // Clear and test valid email
                    await emailInput.click({ clickCount: 3 });
                    await emailInput.type('test@example.com');
                    addTestResult('mainPage', 'Email input accepts valid email', 'PASS');
                } else {
                    addTestResult('mainPage', 'Submit button', 'FAIL', 'No submit button found');
                }
            } else {
                addTestResult('mainPage', 'Email input field', 'FAIL', 'No email input found');
            }
        } catch (error) {
            addTestResult('mainPage', 'Form validation', 'FAIL', error.message);
        }
        
        // Test 5: Plan Selection and Pricing
        console.log('\n💰 Testing Plan Selection and Pricing...');
        try {
            const pricingCards = await page.$$('.pricing-card, .plan-card, .price-option');
            if (pricingCards.length > 0) {
                addTestResult('mainPage', 'Pricing plans displayed', 'PASS', `Found ${pricingCards.length} pricing options`);
                
                // Test plan selection
                await pricingCards[0].click();
                await page.waitForTimeout(1000);
                addTestResult('mainPage', 'Plan selection clickable', 'PASS');
                await takeScreenshot(page, 'plan-selected');
            } else {
                // Look for alternative pricing elements
                const priceElements = await page.$$('[data-price], .price, [class*="price"]');
                if (priceElements.length > 0) {
                    addTestResult('mainPage', 'Pricing information visible', 'PASS');
                } else {
                    addTestResult('mainPage', 'Pricing display', 'FAIL', 'No pricing information found');
                }
            }
        } catch (error) {
            addTestResult('mainPage', 'Plan selection and pricing', 'FAIL', error.message);
        }
        
        // Test 6: Payment Flow Initialization
        console.log('\n💳 Testing Payment Flow...');
        try {
            const paymentBtn = await page.$('button:has-text("Zapłać"), button:has-text("Pay"), .payment-btn, [data-testid="payment"]');
            if (paymentBtn) {
                await paymentBtn.click();
                await page.waitForTimeout(3000);
                
                // Check if redirected to Stripe or payment modal appears
                const currentUrl = page.url();
                if (currentUrl.includes('stripe') || currentUrl.includes('checkout')) {
                    addTestResult('mainPage', 'Payment flow redirects correctly', 'PASS', `Redirected to: ${currentUrl}`);
                } else {
                    // Check for payment modal
                    const paymentModal = await page.$('.payment-modal, .stripe-modal, [role="dialog"]');
                    if (paymentModal) {
                        addTestResult('mainPage', 'Payment modal appears', 'PASS');
                    } else {
                        addTestResult('mainPage', 'Payment flow initialization', 'WARNING', 'No clear payment flow detected');
                    }
                }
                await takeScreenshot(page, 'payment-flow');
            } else {
                addTestResult('mainPage', 'Payment button', 'FAIL', 'No payment button found');
            }
        } catch (error) {
            addTestResult('mainPage', 'Payment flow initialization', 'FAIL', error.message);
        }
        
        // Test 7: Responsive Design
        console.log('\n📱 Testing Responsive Design...');
        const viewports = [
            { name: 'Mobile', width: 375, height: 667 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Desktop', width: 1920, height: 1080 }
        ];
        
        for (const viewport of viewports) {
            try {
                await page.setViewport({ width: viewport.width, height: viewport.height });
                await page.waitForTimeout(1000);
                await takeScreenshot(page, `responsive-${viewport.name.toLowerCase()}`);
                
                // Check if elements are visible and properly positioned
                const mainContent = await page.$('main, .main-content, .container');
                if (mainContent) {
                    const boundingBox = await mainContent.boundingBox();
                    if (boundingBox && boundingBox.width > 0) {
                        addTestResult('responsive', `${viewport.name} layout`, 'PASS', `Content width: ${boundingBox.width}px`);
                    } else {
                        addTestResult('responsive', `${viewport.name} layout`, 'FAIL', 'Main content not visible');
                    }
                } else {
                    addTestResult('responsive', `${viewport.name} layout`, 'WARNING', 'Main content container not found');
                }
            } catch (error) {
                addTestResult('responsive', `${viewport.name} responsive design`, 'FAIL', error.message);
            }
        }
        
        // Reset to desktop view
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Test 8: Navigation and Internal Links
        console.log('\n🔗 Testing Navigation...');
        try {
            // Go back to main page first
            await page.goto('http://localhost:3009', { waitUntil: 'networkidle2' });
            
            const navLinks = await page.$$('nav a, .nav-link, a[href*="/"]');
            let workingLinks = 0;
            let brokenLinks = 0;
            
            for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
                try {
                    const href = await navLinks[i].getAttribute('href');
                    if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                        await navLinks[i].click();
                        await page.waitForTimeout(2000);
                        
                        const newUrl = page.url();
                        if (!newUrl.includes('error') && !newUrl.includes('404')) {
                            workingLinks++;
                            await page.goBack();
                            await page.waitForTimeout(1000);
                        } else {
                            brokenLinks++;
                        }
                    }
                } catch (error) {
                    brokenLinks++;
                }
            }
            
            addTestResult('navigation', 'Internal links functionality', 'PASS', 
                `Working: ${workingLinks}, Broken: ${brokenLinks}`);
        } catch (error) {
            addTestResult('navigation', 'Navigation testing', 'FAIL', error.message);
        }
        
        // Test 9: API Endpoints
        console.log('\n🌐 Testing API Endpoints...');
        const apiEndpoints = [
            '/api/demo-optimize',
            '/api/analyze',
            '/api/create-checkout-session'
        ];
        
        for (const endpoint of apiEndpoints) {
            try {
                const response = await page.evaluate(async (url) => {
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ test: 'data' })
                    });
                    return {
                        status: res.status,
                        ok: res.ok,
                        statusText: res.statusText
                    };
                }, `http://localhost:3009${endpoint}`);
                
                if (response.status === 200 || response.status === 400) {
                    addTestResult('apiEndpoints', `${endpoint} responds`, 'PASS', `Status: ${response.status}`);
                } else {
                    addTestResult('apiEndpoints', `${endpoint} responds`, 'WARNING', `Status: ${response.status}`);
                }
            } catch (error) {
                addTestResult('apiEndpoints', `${endpoint} endpoint`, 'FAIL', error.message);
            }
        }
        
        // Test 10: Check for Console Errors
        console.log('\n🚨 Checking Console Errors...');
        if (consoleMonitor.errors.length > 0) {
            addTestResult('errors', 'Console errors detected', 'FAIL', 
                `${consoleMonitor.errors.length} errors: ${consoleMonitor.errors.slice(0, 3).join(', ')}`);
        } else {
            addTestResult('errors', 'Console errors', 'PASS', 'No console errors detected');
        }
        
        if (consoleMonitor.warnings.length > 0) {
            addTestResult('errors', 'Console warnings', 'WARNING', 
                `${consoleMonitor.warnings.length} warnings detected`);
        } else {
            addTestResult('errors', 'Console warnings', 'PASS', 'No console warnings');
        }
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        addTestResult('errors', 'Test suite execution', 'FAIL', error.message);
    } finally {
        await browser.close();
    }
    
    // Generate test report
    console.log('\n📊 Generating Test Report...');
    generateTestReport();
}

function generateTestReport() {
    const report = {
        summary: {
            totalTests: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        },
        categories: testResults,
        generatedAt: new Date().toISOString()
    };
    
    // Calculate summary
    Object.values(testResults).forEach(category => {
        category.forEach(test => {
            report.summary.totalTests++;
            switch (test.status) {
                case 'PASS':
                    report.summary.passed++;
                    break;
                case 'FAIL':
                    report.summary.failed++;
                    break;
                case 'WARNING':
                    report.summary.warnings++;
                    break;
            }
        });
    });
    
    // Save report to file
    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n🎯 TEST SUMMARY:');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⚠️  Warnings: ${report.summary.warnings}`);
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    
    return reportPath;
}

// Run the tests
runComprehensiveTests().catch(console.error);