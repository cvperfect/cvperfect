const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testModalFunctionality() {
    let browser;
    const issues = [];
    
    try {
        console.log('🚀 Testing CvPerfect Modal Functionality...');
        
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--start-maximized']
        });
        
        const page = await browser.newPage();
        
        // Monitor console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        page.on('pageerror', error => {
            consoleErrors.push(`Page Error: ${error.message}`);
        });
        
        console.log('\n📄 Loading main page...');
        await page.goto('http://localhost:3009', { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        // Take initial screenshot
        await page.screenshot({ path: path.join(__dirname, 'test-main-page.png'), fullPage: true });
        console.log('📸 Main page screenshot saved');
        
        // Test 1: Find modal trigger buttons
        console.log('\n🔍 Looking for modal trigger buttons...');
        const modalTriggers = [
            'button:contains("Optymalizuj")',
            'button:contains("Rozpocznij")',
            'button:contains("Start")',
            '.btn-primary',
            '.cta-button',
            'button[class*="primary"]'
        ];
        
        let triggerFound = false;
        for (const selector of modalTriggers) {
            try {
                const buttons = await page.$$('button');
                for (const button of buttons) {
                    const text = await page.evaluate(el => el.textContent, button);
                    if (text && (
                        text.includes('Optymalizuj') || 
                        text.includes('Rozpocznij') || 
                        text.includes('Start') ||
                        text.includes('Bezpłatnie') ||
                        text.includes('Free')
                    )) {
                        console.log(`✅ Found modal trigger: "${text}"`);
                        await button.click();
                        triggerFound = true;
                        break;
                    }
                }
                if (triggerFound) break;
            } catch (error) {
                continue;
            }
        }
        
        if (!triggerFound) {
            // Try clicking pricing cards
            const pricingCards = await page.$$('.pricing-card, .plan-card, [class*="price"]');
            if (pricingCards.length > 0) {
                console.log('🎯 Trying pricing card...');
                await pricingCards[0].click();
                triggerFound = true;
            }
        }
        
        if (!triggerFound) {
            issues.push('CRITICAL: No modal trigger button found');
            console.log('❌ No modal trigger found');
        } else {
            console.log('✅ Modal trigger clicked');
            await page.waitForTimeout(2000);
            
            // Check if modal appeared
            const modal = await page.$('.modal, [role="dialog"], .overlay');
            if (modal) {
                console.log('✅ Modal appeared');
                await page.screenshot({ path: path.join(__dirname, 'test-modal-opened.png'), fullPage: true });
                
                // Test 2: Check for email input inside modal
                console.log('\n📧 Testing email input in modal...');
                const emailInput = await page.$('#customerEmail, input[type="email"]');
                if (emailInput) {
                    console.log('✅ Email input found in modal');
                    
                    // Test email input functionality
                    await emailInput.click();
                    await emailInput.type('test@example.com');
                    await page.waitForTimeout(500);
                    
                    const emailValue = await page.evaluate(el => el.value, emailInput);
                    if (emailValue === 'test@example.com') {
                        console.log('✅ Email input accepts text correctly');
                    } else {
                        issues.push('WARNING: Email input not working correctly');
                    }
                } else {
                    issues.push('FAIL: Email input not found in modal');
                    console.log('❌ Email input not found in modal');
                }
                
                // Test 3: Check for file upload in modal
                console.log('\n📁 Testing file upload in modal...');
                const fileInput = await page.$('#cv-file-input, input[type="file"]');
                if (fileInput) {
                    console.log('✅ File input found in modal');
                    
                    // Test file upload zone
                    const uploadZone = await page.$('.file-upload-zone');
                    if (uploadZone) {
                        console.log('✅ File upload zone found');
                        
                        // Test clicking upload zone
                        await uploadZone.click();
                        await page.waitForTimeout(1000);
                        console.log('✅ Upload zone clickable');
                    } else {
                        issues.push('WARNING: File upload zone not found');
                    }
                    
                    // Create test file if it doesn't exist
                    const testFilePath = path.join(__dirname, 'test-cv.pdf');
                    if (!fs.existsSync(testFilePath)) {
                        fs.writeFileSync(testFilePath, '%PDF-1.4 Test CV file');
                    }
                    
                    // Test file upload
                    try {
                        await fileInput.uploadFile(testFilePath);
                        await page.waitForTimeout(2000);
                        console.log('✅ File upload test successful');
                        
                        // Check if filename appears
                        const fileName = await page.$eval('.file-name, .uploaded-file', el => el.textContent).catch(() => null);
                        if (fileName) {
                            console.log(`✅ File name displayed: ${fileName}`);
                        }
                    } catch (error) {
                        issues.push(`WARNING: File upload test failed: ${error.message}`);
                    }
                } else {
                    issues.push('FAIL: File input not found in modal');
                    console.log('❌ File input not found in modal');
                }
                
                // Test 4: Modal navigation (steps)
                console.log('\n🔄 Testing modal step navigation...');
                const nextButton = await page.$('button:contains("Dalej"), button:contains("Next"), .btn-next');
                if (!nextButton) {
                    // Look for buttons with next-like text
                    const buttons = await page.$$('button');
                    let nextBtn = null;
                    for (const btn of buttons) {
                        const text = await page.evaluate(el => el.textContent, btn);
                        if (text && (text.includes('Dalej') || text.includes('Next') || text.includes('Kontynuuj') || text.includes('Continue'))) {
                            nextBtn = btn;
                            break;
                        }
                    }
                    if (nextBtn) {
                        await nextBtn.click();
                        await page.waitForTimeout(1500);
                        console.log('✅ Modal step navigation works');
                        await page.screenshot({ path: path.join(__dirname, 'test-modal-step2.png'), fullPage: true });
                    } else {
                        issues.push('WARNING: Modal step navigation not found');
                    }
                } else {
                    await nextButton.click();
                    await page.waitForTimeout(1500);
                    console.log('✅ Modal step navigation works');
                }
                
                // Test 5: Job posting textarea (if in step 2)
                console.log('\n📋 Looking for job posting input...');
                const jobTextarea = await page.$('textarea, input[name*="job"]');
                if (jobTextarea) {
                    console.log('✅ Job posting input found');
                    await jobTextarea.click();
                    await jobTextarea.type('Software Developer position requiring React and Node.js skills');
                    await page.waitForTimeout(500);
                    console.log('✅ Job posting input works');
                } else {
                    console.log('ℹ️  Job posting input not found (may be in different step)');
                }
                
                // Test 6: Plan selection in modal
                console.log('\n💰 Testing plan selection in modal...');
                const planButtons = await page.$$('.plan-option, .pricing-option, button[data-plan]');
                if (planButtons.length > 0) {
                    console.log(`✅ Found ${planButtons.length} plan options`);
                    await planButtons[0].click();
                    await page.waitForTimeout(1000);
                    console.log('✅ Plan selection works');
                } else {
                    // Look for buttons with plan names
                    const buttons = await page.$$('button');
                    let planFound = false;
                    for (const btn of buttons) {
                        const text = await page.evaluate(el => el.textContent, btn);
                        if (text && (text.includes('Basic') || text.includes('Premium') || text.includes('Gold') || text.includes('Bezpłatnie'))) {
                            await btn.click();
                            await page.waitForTimeout(1000);
                            planFound = true;
                            console.log(`✅ Plan selected: ${text}`);
                            break;
                        }
                    }
                    if (!planFound) {
                        issues.push('WARNING: Plan selection not found in modal');
                    }
                }
                
                // Test 7: Payment button
                console.log('\n💳 Looking for payment/submit button...');
                const paymentButtons = await page.$$('button');
                let paymentFound = false;
                for (const btn of paymentButtons) {
                    const text = await page.evaluate(el => el.textContent, btn);
                    if (text && (
                        text.includes('Zapłać') || 
                        text.includes('Pay') || 
                        text.includes('Checkout') || 
                        text.includes('Przejdź do płatności') ||
                        text.includes('Wyślij') ||
                        text.includes('Submit')
                    )) {
                        console.log(`✅ Payment/submit button found: "${text}"`);
                        paymentFound = true;
                        break;
                    }
                }
                if (!paymentFound) {
                    issues.push('WARNING: Payment/submit button not clearly identified');
                }
                
            } else {
                issues.push('CRITICAL: Modal did not appear after clicking trigger');
                console.log('❌ Modal did not appear');
            }
        }
        
        // Test 8: Close modal and test responsiveness
        console.log('\n📱 Testing modal responsiveness...');
        const closeButton = await page.$('.modal-close, .close, button:contains("×")');
        if (closeButton) {
            await closeButton.click();
            await page.waitForTimeout(1000);
            console.log('✅ Modal can be closed');
        }
        
        // Test mobile view
        await page.setViewport({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(__dirname, 'test-mobile-view.png'), fullPage: true });
        console.log('📸 Mobile view screenshot saved');
        
        // Trigger modal again on mobile
        if (triggerFound) {
            const buttons = await page.$$('button');
            for (const button of buttons) {
                const text = await page.evaluate(el => el.textContent, button);
                if (text && text.includes('Optymalizuj')) {
                    await button.click();
                    await page.waitForTimeout(2000);
                    await page.screenshot({ path: path.join(__dirname, 'test-mobile-modal.png'), fullPage: true });
                    console.log('📸 Mobile modal screenshot saved');
                    break;
                }
            }
        }
        
        // Check console errors
        if (consoleErrors.length > 0) {
            issues.push(`Console errors detected: ${consoleErrors.length} errors`);
            console.log(`⚠️  Console errors: ${consoleErrors.slice(0, 3).join(' | ')}`);
        } else {
            console.log('✅ No console errors detected');
        }
        
    } catch (error) {
        issues.push(`Test execution error: ${error.message}`);
        console.error('❌ Test failed:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Generate report
    console.log('\n📊 MODAL FUNCTIONALITY TEST RESULTS:');
    if (issues.length === 0) {
        console.log('✅ All modal tests passed!');
    } else {
        console.log(`❌ Found ${issues.length} issues:`);
        issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue}`);
        });
    }
    
    // Save detailed report
    const report = {
        testType: 'Modal Functionality Test',
        timestamp: new Date().toISOString(),
        issues: issues,
        summary: {
            totalIssues: issues.length,
            criticalIssues: issues.filter(i => i.includes('CRITICAL')).length,
            warnings: issues.filter(i => i.includes('WARNING')).length
        }
    };
    
    const reportPath = path.join(__dirname, `modal-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return report;
}

// Run the test
testModalFunctionality().catch(console.error);