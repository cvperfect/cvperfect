const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test results storage
let testResults = [];

// Helper function to add test result
function addTestResult(category, test, status, details = '') {
    testResults.push({
        category,
        test,
        status, // 'PASS', 'FAIL', 'WARNING'
        details,
        timestamp: new Date().toISOString()
    });
    console.log(`[${category.toUpperCase()}] ${test}: ${status}${details ? ' - ' + details : ''}`);
}

// Helper function to take screenshots
async function takeScreenshot(page, name) {
    try {
        const screenshotPath = path.join(__dirname, `screenshot-${name}-${Date.now()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
        return screenshotPath;
    } catch (error) {
        console.log(`❌ Screenshot failed: ${error.message}`);
        return null;
    }
}

// Helper function to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFixedTests() {
    let browser;
    
    try {
        console.log('🚀 Starting comprehensive CvPerfect website testing...');
        
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--start-maximized', '--disable-dev-shm-usage']
        });
        
        const page = await browser.newPage();
        
        // Monitor console errors
        const consoleErrors = [];
        const consoleWarnings = [];
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            } else if (msg.type() === 'warning') {
                consoleWarnings.push(msg.text());
            }
        });
        
        page.on('pageerror', error => {
            consoleErrors.push(`Page Error: ${error.message}`);
        });
        
        console.log('\n📄 Testing Main Page Load...');
        await page.goto('http://localhost:3009', { waitUntil: 'networkidle2', timeout: 30000 });
        await wait(2000);
        await takeScreenshot(page, 'main-page-load');
        
        // Test 1: Page loads successfully
        const title = await page.title();
        if (title && (title.includes('CvPerfect') || title.includes('CV'))) {
            addTestResult('mainPage', 'Page loads with correct title', 'PASS', `Title: ${title}`);
        } else {
            addTestResult('mainPage', 'Page loads with correct title', 'FAIL', `Title: ${title || 'No title found'}`);
        }
        
        // Test 2: Language switching
        console.log('\n🌐 Testing Language Switching...');
        try {
            // Look for language elements with different approaches
            let langElement = null;
            
            // Try different selectors
            const langSelectors = [
                'button[data-language]',
                'button:contains("EN")',
                'button:contains("PL")',
                '.language-switch',
                '[onclick*="language"]',
                'button[class*="lang"]'
            ];
            
            for (const selector of langSelectors) {
                try {
                    langElement = await page.$(selector);
                    if (langElement) break;
                } catch (e) {
                    continue;
                }
            }
            
            // Alternative approach - find buttons with specific text
            if (!langElement) {
                const buttons = await page.$$('button');
                for (const button of buttons) {
                    const text = await page.evaluate(el => el.textContent, button);
                    if (text && (text.includes('EN') || text.includes('PL') || text.includes('English') || text.includes('Polski'))) {
                        langElement = button;
                        break;
                    }
                }
            }
            
            if (langElement) {
                await langElement.click();
                await wait(1000);
                addTestResult('mainPage', 'Language switcher found and clicked', 'PASS');
                await takeScreenshot(page, 'language-switched');
            } else {
                addTestResult('mainPage', 'Language switcher', 'FAIL', 'No language switcher found');
            }
        } catch (error) {
            addTestResult('mainPage', 'Language switching', 'FAIL', error.message);
        }
        
        // Test 3: CV File Upload Elements
        console.log('\n📁 Testing CV File Upload Elements...');
        try {
            // Look for file input
            const fileInput = await page.$('input[type="file"]');
            if (fileInput) {
                addTestResult('mainPage', 'File input element exists', 'PASS');
            } else {
                addTestResult('mainPage', 'File input element', 'FAIL', 'No file input found');
            }
            
            // Look for upload button or area
            const uploadSelectors = [
                '.upload-btn',
                'button[class*="upload"]',
                '.file-upload',
                '.drop-zone',
                '[data-testid*="upload"]'
            ];
            
            let uploadElement = null;
            for (const selector of uploadSelectors) {
                uploadElement = await page.$(selector);
                if (uploadElement) break;
            }
            
            // Look for buttons with upload-related text
            if (!uploadElement) {
                const buttons = await page.$$('button');
                for (const button of buttons) {
                    const text = await page.evaluate(el => el.textContent, button);
                    if (text && (text.includes('Upload') || text.includes('Prześlij') || text.includes('Wybierz') || text.includes('CV'))) {
                        uploadElement = button;
                        break;
                    }
                }
            }
            
            if (uploadElement) {
                addTestResult('mainPage', 'Upload button/area found', 'PASS');
            } else {
                addTestResult('mainPage', 'Upload interface', 'WARNING', 'No clear upload interface found');
            }
        } catch (error) {
            addTestResult('mainPage', 'CV file upload elements', 'FAIL', error.message);
        }
        
        // Test 4: Form Elements
        console.log('\n✅ Testing Form Elements...');
        try {
            // Look for email input
            const emailSelectors = [
                'input[type="email"]',
                'input[name*="email"]',
                'input[id*="email"]',
                'input[placeholder*="email"]',
                'input[placeholder*="@"]'
            ];
            
            let emailInput = null;
            for (const selector of emailSelectors) {
                emailInput = await page.$(selector);
                if (emailInput) break;
            }
            
            if (emailInput) {
                addTestResult('mainPage', 'Email input field exists', 'PASS');
                
                // Test email input
                await emailInput.click();
                await emailInput.type('test@example.com');
                await wait(500);
                addTestResult('mainPage', 'Email input accepts text', 'PASS');
            } else {
                addTestResult('mainPage', 'Email input field', 'FAIL', 'No email input found');
            }
            
            // Look for other form elements
            const formElements = await page.$$('input, textarea, select');
            addTestResult('mainPage', 'Form elements present', 'PASS', `Found ${formElements.length} form elements`);
        } catch (error) {
            addTestResult('mainPage', 'Form elements testing', 'FAIL', error.message);
        }
        
        // Test 5: Pricing Information
        console.log('\n💰 Testing Pricing Information...');
        try {
            // Look for pricing elements
            const pricingSelectors = [
                '.price',
                '[class*="price"]',
                '.pricing',
                '.plan',
                '[data-price]'
            ];
            
            let pricingFound = false;
            for (const selector of pricingSelectors) {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    pricingFound = true;
                    addTestResult('mainPage', 'Pricing elements found', 'PASS', `Found ${elements.length} pricing elements`);
                    break;
                }
            }
            
            // Look for currency symbols or price patterns
            if (!pricingFound) {
                const pageContent = await page.content();
                if (pageContent.includes('zł') || pageContent.includes('$') || pageContent.includes('€') || pageContent.match(/\d+\.\d{2}/)) {
                    addTestResult('mainPage', 'Price information detected in content', 'PASS');
                    pricingFound = true;
                }
            }
            
            if (!pricingFound) {
                addTestResult('mainPage', 'Pricing information', 'FAIL', 'No pricing information found');
            }
        } catch (error) {
            addTestResult('mainPage', 'Pricing information testing', 'FAIL', error.message);
        }
        
        // Test 6: Navigation Elements
        console.log('\n🔗 Testing Navigation...');
        try {
            const navElements = await page.$$('nav, .nav, .navigation, .menu');
            if (navElements.length > 0) {
                addTestResult('navigation', 'Navigation structure exists', 'PASS', `Found ${navElements.length} nav elements`);
            }
            
            const links = await page.$$('a[href]');
            addTestResult('navigation', 'Links present', 'PASS', `Found ${links.length} links`);
            
            // Test a few internal links
            let workingLinks = 0;
            let brokenLinks = 0;
            
            for (let i = 0; i < Math.min(links.length, 3); i++) {
                try {
                    const href = await page.evaluate(el => el.getAttribute('href'), links[i]);
                    if (href && href.startsWith('/') && !href.includes('#')) {
                        const currentUrl = page.url();
                        await links[i].click();
                        await wait(2000);
                        
                        const newUrl = page.url();
                        if (newUrl !== currentUrl && !newUrl.includes('error')) {
                            workingLinks++;
                            await page.goBack();
                            await wait(1000);
                        } else {
                            brokenLinks++;
                        }
                    }
                } catch (error) {
                    brokenLinks++;
                }
            }
            
            addTestResult('navigation', 'Link functionality', workingLinks > 0 ? 'PASS' : 'WARNING', 
                `Working: ${workingLinks}, Broken: ${brokenLinks}`);
        } catch (error) {
            addTestResult('navigation', 'Navigation testing', 'FAIL', error.message);
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
                await wait(1000);
                await takeScreenshot(page, `responsive-${viewport.name.toLowerCase()}`);
                
                // Check if main content is visible
                const bodyRect = await page.evaluate(() => {
                    const body = document.body;
                    const rect = body.getBoundingClientRect();
                    return {
                        width: rect.width,
                        height: rect.height,
                        overflow: window.getComputedStyle(body).overflowX
                    };
                });
                
                if (bodyRect.width > 0 && bodyRect.width <= viewport.width * 1.1) {
                    addTestResult('responsive', `${viewport.name} layout`, 'PASS', 
                        `Body width: ${bodyRect.width}px, no horizontal overflow`);
                } else {
                    addTestResult('responsive', `${viewport.name} layout`, 'WARNING', 
                        `Body width: ${bodyRect.width}px, potential overflow`);
                }
            } catch (error) {
                addTestResult('responsive', `${viewport.name} responsive design`, 'FAIL', error.message);
            }
        }
        
        // Reset to desktop
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Test 8: API Endpoints
        console.log('\n🌐 Testing API Endpoints...');
        const endpoints = [
            { path: '/api/demo-optimize', method: 'POST' },
            { path: '/api/analyze', method: 'POST' },
            { path: '/api/create-checkout-session', method: 'POST' }
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await page.evaluate(async (url, method) => {
                    try {
                        const res = await fetch(url, {
                            method: method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ test: 'data' })
                        });
                        return {
                            status: res.status,
                            ok: res.ok,
                            statusText: res.statusText
                        };
                    } catch (error) {
                        return { error: error.message };
                    }
                }, `http://localhost:3009${endpoint.path}`, endpoint.method);
                
                if (response.error) {
                    addTestResult('apiEndpoints', `${endpoint.path}`, 'FAIL', response.error);
                } else if (response.status === 200 || response.status === 400 || response.status === 405) {
                    addTestResult('apiEndpoints', `${endpoint.path}`, 'PASS', `Status: ${response.status}`);
                } else {
                    addTestResult('apiEndpoints', `${endpoint.path}`, 'WARNING', `Status: ${response.status}`);
                }
            } catch (error) {
                addTestResult('apiEndpoints', `${endpoint.path}`, 'FAIL', error.message);
            }
        }
        
        // Test 9: Success Page
        console.log('\n🎉 Testing Success Page...');
        try {
            await page.goto('http://localhost:3009/success', { waitUntil: 'networkidle2', timeout: 15000 });
            await wait(2000);
            
            const successTitle = await page.title();
            if (successTitle && successTitle.includes('Success')) {
                addTestResult('navigation', 'Success page loads', 'PASS', `Title: ${successTitle}`);
            } else {
                addTestResult('navigation', 'Success page loads', 'WARNING', `Title: ${successTitle}`);
            }
            
            await takeScreenshot(page, 'success-page');
            
            // Check for success page elements
            const successElements = await page.$$('.success, .template, .download, [class*="success"]');
            if (successElements.length > 0) {
                addTestResult('navigation', 'Success page content', 'PASS', `Found ${successElements.length} success elements`);
            } else {
                addTestResult('navigation', 'Success page content', 'WARNING', 'No clear success elements found');
            }
        } catch (error) {
            addTestResult('navigation', 'Success page access', 'FAIL', error.message);
        }
        
        // Test 10: Contact Page
        console.log('\n📧 Testing Contact Page...');
        try {
            await page.goto('http://localhost:3009/kontakt', { waitUntil: 'networkidle2', timeout: 15000 });
            await wait(2000);
            
            const contactTitle = await page.title();
            addTestResult('navigation', 'Contact page loads', 'PASS', `Title: ${contactTitle}`);
            
            await takeScreenshot(page, 'contact-page');
        } catch (error) {
            addTestResult('navigation', 'Contact page access', 'FAIL', error.message);
        }
        
        // Final: Check Console Errors
        console.log('\n🚨 Checking Console Errors...');
        if (consoleErrors.length > 0) {
            addTestResult('errors', 'Console errors', 'FAIL', 
                `${consoleErrors.length} errors found: ${consoleErrors.slice(0, 3).join(' | ')}`);
        } else {
            addTestResult('errors', 'Console errors', 'PASS', 'No console errors detected');
        }
        
        if (consoleWarnings.length > 0) {
            addTestResult('errors', 'Console warnings', 'WARNING', 
                `${consoleWarnings.length} warnings found`);
        } else {
            addTestResult('errors', 'Console warnings', 'PASS', 'No console warnings detected');
        }
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        addTestResult('errors', 'Test suite execution', 'FAIL', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Generate final report
    console.log('\n📊 Generating Final Test Report...');
    generateFinalReport();
}

function generateFinalReport() {
    const summary = {
        totalTests: testResults.length,
        passed: testResults.filter(r => r.status === 'PASS').length,
        failed: testResults.filter(r => r.status === 'FAIL').length,
        warnings: testResults.filter(r => r.status === 'WARNING').length
    };
    
    const report = {
        summary,
        testResults,
        generatedAt: new Date().toISOString()
    };
    
    // Save detailed report
    const reportPath = path.join(__dirname, `detailed-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n🎯 FINAL TEST SUMMARY:');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Print critical issues
    const criticalIssues = testResults.filter(r => r.status === 'FAIL');
    if (criticalIssues.length > 0) {
        console.log('\n🚨 CRITICAL ISSUES FOUND:');
        criticalIssues.forEach((issue, index) => {
            console.log(`${index + 1}. [${issue.category}] ${issue.test}: ${issue.details}`);
        });
    }
    
    return reportPath;
}

// Run the fixed tests
runFixedTests().catch(console.error);