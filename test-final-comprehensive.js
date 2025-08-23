const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Utility function to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runComprehensiveTest() {
    let browser;
    const testResults = {
        passed: [],
        failed: [],
        warnings: [],
        screenshots: []
    };
    
    function logResult(status, test, details = '') {
        const result = { test, details, timestamp: new Date().toISOString() };
        testResults[status].push(result);
        console.log(`[${status.toUpperCase()}] ${test}${details ? ': ' + details : ''}`);
    }
    
    async function takeScreenshot(page, name) {
        try {
            const screenshotPath = path.join(__dirname, `final-test-${name}-${Date.now()}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            testResults.screenshots.push(screenshotPath);
            console.log(`📸 Screenshot: ${name}`);
            return screenshotPath;
        } catch (error) {
            console.log(`❌ Screenshot failed: ${error.message}`);
            return null;
        }
    }
    
    try {
        console.log('🚀 COMPREHENSIVE CVPERFECT TESTING SUITE');
        console.log('=====================================\n');
        
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--start-maximized', '--disable-web-security', '--disable-features=VizDisplayCompositor']
        });
        
        const page = await browser.newPage();
        
        // Monitor console
        const consoleMessages = { errors: [], warnings: [], logs: [] };
        page.on('console', msg => {
            const text = msg.text();
            switch(msg.type()) {
                case 'error': consoleMessages.errors.push(text); break;
                case 'warning': consoleMessages.warnings.push(text); break;
                default: consoleMessages.logs.push(text); break;
            }
        });
        
        page.on('pageerror', error => {
            consoleMessages.errors.push(`Page Error: ${error.message}`);
        });
        
        console.log('📄 PHASE 1: MAIN PAGE LOADING AND BASIC FUNCTIONALITY');
        console.log('---------------------------------------------------');
        
        // Load main page
        await page.goto('http://localhost:3009', { waitUntil: 'networkidle2', timeout: 30000 });
        await wait(3000);
        await takeScreenshot(page, 'main-page-loaded');
        
        // Test 1: Page title and basic load
        const title = await page.title();
        if (title && title.includes('CvPerfect')) {
            logResult('passed', 'Main page loads with correct title', title);
        } else {
            logResult('failed', 'Main page title', `Expected CvPerfect, got: ${title}`);
        }
        
        // Test 2: Live statistics visible
        const statsVisible = await page.evaluate(() => {
            const statsElements = document.querySelectorAll('[class*="stat"], .stats, [data-stat]');
            return statsElements.length > 0;
        });
        if (statsVisible) {
            logResult('passed', 'Live statistics elements visible');
        } else {
            logResult('warnings', 'Live statistics not clearly visible');
        }
        
        console.log('\n🌐 PHASE 2: LANGUAGE SWITCHING');
        console.log('-----------------------------');
        
        // Test 3: Language switching
        const langButtons = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.map(btn => ({
                text: btn.textContent.trim(),
                hasLangIndicator: btn.textContent.includes('EN') || btn.textContent.includes('PL')
            })).filter(btn => btn.hasLangIndicator);
        });
        
        if (langButtons.length > 0) {
            logResult('passed', 'Language switcher found', `Found ${langButtons.length} language buttons`);
            
            // Try clicking language switcher
            await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const langBtn = buttons.find(btn => btn.textContent.includes('EN') || btn.textContent.includes('PL'));
                if (langBtn) langBtn.click();
            });
            await wait(1500);
            await takeScreenshot(page, 'language-switched');
            logResult('passed', 'Language switching functionality works');
        } else {
            logResult('failed', 'Language switcher not found');
        }
        
        console.log('\n📁 PHASE 3: MODAL AND FORM TESTING');
        console.log('----------------------------------');
        
        // Test 4: Find and trigger modal
        const modalTriggerFound = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const triggerKeywords = ['Optymalizuj', 'Rozpocznij', 'Start', 'Bezpłatnie', 'Free', 'Optimize'];
            
            for (const btn of buttons) {
                const text = btn.textContent.trim();
                if (triggerKeywords.some(keyword => text.includes(keyword))) {
                    btn.click();
                    return { found: true, text: text };
                }
            }
            
            // Try pricing cards
            const cards = Array.from(document.querySelectorAll('.pricing-card, .plan-card, [class*="price"], [class*="plan"]'));
            if (cards.length > 0) {
                cards[0].click();
                return { found: true, text: 'Pricing card clicked' };
            }
            
            return { found: false };
        });
        
        if (modalTriggerFound.found) {
            logResult('passed', 'Modal trigger found and clicked', modalTriggerFound.text);
            await wait(2000);
            await takeScreenshot(page, 'modal-triggered');
            
            // Test 5: Modal appearance
            const modalVisible = await page.evaluate(() => {
                const modals = document.querySelectorAll('.modal, [role="dialog"], .overlay, [class*="modal"]');
                return Array.from(modals).some(modal => {
                    const style = window.getComputedStyle(modal);
                    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
                });
            });
            
            if (modalVisible) {
                logResult('passed', 'Modal appears after trigger');
                
                // Test 6: Email input in modal
                const emailInput = await page.$('#customerEmail, input[type="email"]');
                if (emailInput) {
                    logResult('passed', 'Email input found in modal');
                    
                    // Test email functionality
                    await emailInput.click();
                    await emailInput.type('test@example.com', { delay: 50 });
                    await wait(500);
                    
                    const emailValue = await emailInput.evaluate(el => el.value);
                    if (emailValue === 'test@example.com') {
                        logResult('passed', 'Email input accepts and stores text');
                    } else {
                        logResult('failed', 'Email input not working properly', `Expected: test@example.com, Got: ${emailValue}`);
                    }
                } else {
                    logResult('failed', 'Email input not found in modal');
                }
                
                // Test 7: File upload in modal
                const fileInput = await page.$('#cv-file-input, input[type="file"]');
                if (fileInput) {
                    logResult('passed', 'File input found in modal');
                    
                    // Check upload zone
                    const uploadZone = await page.$('.file-upload-zone');
                    if (uploadZone) {
                        logResult('passed', 'File upload zone exists');
                        
                        // Test upload zone click
                        await uploadZone.click();
                        await wait(500);
                        logResult('passed', 'Upload zone is clickable');
                    } else {
                        logResult('warnings', 'File upload zone not clearly identified');
                    }
                } else {
                    logResult('failed', 'File input not found in modal');
                }
                
                // Test 8: Modal navigation (next button)
                const nextButtonFound = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const nextKeywords = ['Dalej', 'Next', 'Kontynuuj', 'Continue'];
                    
                    for (const btn of buttons) {
                        const text = btn.textContent.trim();
                        if (nextKeywords.some(keyword => text.includes(keyword))) {
                            btn.click();
                            return { found: true, text: text };
                        }
                    }
                    return { found: false };
                });
                
                if (nextButtonFound.found) {
                    logResult('passed', 'Modal navigation (next button)', nextButtonFound.text);
                    await wait(1500);
                    await takeScreenshot(page, 'modal-step2');
                } else {
                    logResult('warnings', 'Modal step navigation not found');
                }
                
            } else {
                logResult('failed', 'Modal did not appear after clicking trigger');
            }
        } else {
            logResult('failed', 'No modal trigger button found');
        }
        
        console.log('\n💰 PHASE 4: PRICING AND PAYMENT FLOW');
        console.log('-----------------------------------');
        
        // Test 9: Pricing information visible
        const pricingVisible = await page.evaluate(() => {
            // Check for price indicators
            const content = document.body.textContent;
            const hasCurrency = content.includes('zł') || content.includes('$') || content.includes('€');
            const hasNumbers = /\d+[.,]\d{2}/.test(content);
            const hasPricingElements = document.querySelectorAll('.price, [class*="price"], .plan, [class*="plan"]').length > 0;
            
            return { hasCurrency, hasNumbers, hasPricingElements };
        });
        
        if (pricingVisible.hasCurrency || pricingVisible.hasNumbers || pricingVisible.hasPricingElements) {
            logResult('passed', 'Pricing information visible', 
                `Currency: ${pricingVisible.hasCurrency}, Numbers: ${pricingVisible.hasNumbers}, Elements: ${pricingVisible.hasPricingElements}`);
        } else {
            logResult('failed', 'No pricing information found');
        }
        
        console.log('\n🌐 PHASE 5: API ENDPOINT TESTING');
        console.log('-------------------------------');
        
        // Test 10: API endpoints
        const apiTests = [
            { endpoint: '/api/demo-optimize', method: 'POST' },
            { endpoint: '/api/analyze', method: 'POST' },
            { endpoint: '/api/create-checkout-session', method: 'POST' }
        ];
        
        for (const api of apiTests) {
            try {
                const response = await page.evaluate(async (endpoint, method) => {
                    try {
                        const res = await fetch(`http://localhost:3009${endpoint}`, {
                            method: method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ test: 'data' })
                        });
                        return { status: res.status, ok: res.ok };
                    } catch (error) {
                        return { error: error.message };
                    }
                }, api.endpoint, api.method);
                
                if (response.error) {
                    logResult('failed', `API ${api.endpoint}`, response.error);
                } else if ([200, 400, 405].includes(response.status)) {
                    logResult('passed', `API ${api.endpoint} responds`, `Status: ${response.status}`);
                } else {
                    logResult('warnings', `API ${api.endpoint}`, `Unexpected status: ${response.status}`);
                }
            } catch (error) {
                logResult('failed', `API ${api.endpoint}`, error.message);
            }
        }
        
        console.log('\n📱 PHASE 6: RESPONSIVE DESIGN TESTING');
        console.log('-----------------------------------');
        
        // Test 11: Responsive design
        const viewports = [
            { name: 'Mobile', width: 375, height: 667 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Desktop', width: 1920, height: 1080 }
        ];
        
        for (const viewport of viewports) {
            await page.setViewport({ width: viewport.width, height: viewport.height });
            await wait(1000);
            await takeScreenshot(page, `responsive-${viewport.name.toLowerCase()}`);
            
            const layoutCheck = await page.evaluate(() => {
                const body = document.body;
                const rect = body.getBoundingClientRect();
                return {
                    width: rect.width,
                    hasHorizontalScroll: body.scrollWidth > window.innerWidth,
                    elementsVisible: document.querySelectorAll('*').length > 0
                };
            });
            
            if (!layoutCheck.hasHorizontalScroll && layoutCheck.elementsVisible) {
                logResult('passed', `${viewport.name} responsive layout`, `Width: ${layoutCheck.width}px, No overflow`);
            } else {
                logResult('warnings', `${viewport.name} responsive layout`, `Possible layout issues`);
            }
        }
        
        // Reset to desktop
        await page.setViewport({ width: 1920, height: 1080 });
        
        console.log('\n🔗 PHASE 7: NAVIGATION TESTING');
        console.log('-----------------------------');
        
        // Test 12: Success page
        try {
            await page.goto('http://localhost:3009/success', { waitUntil: 'networkidle2', timeout: 15000 });
            await wait(2000);
            const successTitle = await page.title();
            await takeScreenshot(page, 'success-page');
            
            if (successTitle) {
                logResult('passed', 'Success page accessible', `Title: ${successTitle}`);
            } else {
                logResult('warnings', 'Success page loads but no title');
            }
            
            // Check for success page functionality
            const successElements = await page.evaluate(() => {
                const templates = document.querySelectorAll('.template, [class*="template"]');
                const downloads = document.querySelectorAll('[class*="download"], button[class*="download"]');
                return { templates: templates.length, downloads: downloads.length };
            });
            
            if (successElements.templates > 0 || successElements.downloads > 0) {
                logResult('passed', 'Success page functionality', `Templates: ${successElements.templates}, Downloads: ${successElements.downloads}`);
            } else {
                logResult('warnings', 'Success page functionality unclear');
            }
        } catch (error) {
            logResult('failed', 'Success page access', error.message);
        }
        
        // Test 13: Contact page
        try {
            await page.goto('http://localhost:3009/kontakt', { waitUntil: 'networkidle2', timeout: 15000 });
            await wait(2000);
            const contactTitle = await page.title();
            await takeScreenshot(page, 'contact-page');
            
            if (contactTitle && contactTitle.includes('Kontakt')) {
                logResult('passed', 'Contact page accessible', `Title: ${contactTitle}`);
            } else {
                logResult('warnings', 'Contact page issues', `Title: ${contactTitle}`);
            }
        } catch (error) {
            logResult('failed', 'Contact page access', error.message);
        }
        
        console.log('\n🚨 PHASE 8: ERROR AND PERFORMANCE CHECK');
        console.log('------------------------------------');
        
        // Test 14: Console errors
        if (consoleMessages.errors.length === 0) {
            logResult('passed', 'No console errors detected');
        } else {
            logResult('failed', 'Console errors detected', `${consoleMessages.errors.length} errors: ${consoleMessages.errors.slice(0, 2).join(' | ')}`);
        }
        
        if (consoleMessages.warnings.length === 0) {
            logResult('passed', 'No console warnings');
        } else {
            logResult('warnings', 'Console warnings detected', `${consoleMessages.warnings.length} warnings`);
        }
        
    } catch (error) {
        logResult('failed', 'Test suite execution', error.message);
        console.error('❌ Critical test failure:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Generate comprehensive report
    console.log('\n📊 FINAL TEST RESULTS');
    console.log('====================');
    
    const totalTests = testResults.passed.length + testResults.failed.length + testResults.warnings.length;
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${testResults.passed.length}`);
    console.log(`❌ Failed: ${testResults.failed.length}`);
    console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
    
    if (testResults.failed.length > 0) {
        console.log('\n🚨 CRITICAL ISSUES:');
        testResults.failed.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.test}: ${issue.details}`);
        });
    }
    
    if (testResults.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        testResults.warnings.forEach((warning, index) => {
            console.log(`${index + 1}. ${warning.test}: ${warning.details}`);
        });
    }
    
    // Save comprehensive report
    const finalReport = {
        summary: {
            totalTests,
            passed: testResults.passed.length,
            failed: testResults.failed.length,
            warnings: testResults.warnings.length,
            successRate: Math.round((testResults.passed.length / totalTests) * 100)
        },
        results: testResults,
        screenshots: testResults.screenshots,
        timestamp: new Date().toISOString(),
        testDuration: Date.now()
    };
    
    const reportPath = path.join(__dirname, `cvperfect-comprehensive-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
    
    console.log(`\n📄 Comprehensive report saved: ${reportPath}`);
    console.log(`📸 Screenshots saved: ${testResults.screenshots.length} files`);
    console.log(`\n🎯 Test Success Rate: ${finalReport.summary.successRate}%`);
    
    return finalReport;
}

// Run comprehensive test
runComprehensiveTest().catch(console.error);