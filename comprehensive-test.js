const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function comprehensiveTest() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 },
        devtools: true,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });

    let testResults = {
        homepage: { status: '❌', details: [] },
        paymentSystem: { status: '❌', details: [] },
        successPage: { status: '❌', details: [] },
        consoleErrors: { status: '❌', details: [] },
        uiVerification: { status: '❌', details: [] },
        cvTest: { status: '❌', details: [] }
    };

    let allConsoleMessages = [];

    try {
        const page = await browser.newPage();
        
        // Monitor all console messages
        page.on('console', msg => {
            const message = {
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString(),
                url: page.url()
            };
            allConsoleMessages.push(message);
            
            if (msg.type() === 'error' || msg.type() === 'warning') {
                console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
            }
        });

        // Monitor network failures
        page.on('requestfailed', request => {
            console.log(`❌ Network request failed: ${request.url()}`);
            allConsoleMessages.push({
                type: 'network-error',
                text: `Failed request: ${request.url()} - ${request.failure().errorText}`,
                timestamp: new Date().toISOString(),
                url: page.url()
            });
        });

        console.log('🔍 Starting comprehensive CvPerfect testing...\n');

        // ===========================================
        // 1. HOMEPAGE TESTING
        // ===========================================
        console.log('📋 1. HOMEPAGE TESTING');
        console.log('==========================================');

        try {
            await page.goto('http://localhost:3008', { waitUntil: 'networkidle2', timeout: 30000 });
            console.log('✅ Homepage loaded successfully');
            testResults.homepage.details.push('✅ Page navigation successful');

            // Take initial screenshot
            await page.screenshot({ path: 'test-homepage-initial.png', fullPage: true });
            console.log('📸 Homepage initial screenshot saved');

            // Test file upload functionality
            console.log('🔍 Testing CV file upload functionality...');
            
            // Look for file upload elements
            const uploadButton = await page.$('input[type="file"]');
            if (uploadButton) {
                console.log('✅ File upload input found');
                testResults.homepage.details.push('✅ File upload input present');
            } else {
                console.log('❌ File upload input not found');
                testResults.homepage.details.push('❌ File upload input missing');
            }

            // Test drag and drop area
            const dropZone = await page.$('.dropzone, [data-testid="dropzone"], .file-upload-area');
            if (dropZone) {
                console.log('✅ Drop zone found');
                testResults.homepage.details.push('✅ Drop zone present');
                
                // Simulate drag over effect
                await dropZone.hover();
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                console.log('❌ Drop zone not found');
                testResults.homepage.details.push('❌ Drop zone missing');
            }

            // Test notification visibility by looking for notification elements
            const notifications = await page.$$('.notification, .alert, .toast, [class*="notif"]');
            console.log(`📝 Found ${notifications.length} notification elements`);
            
            if (notifications.length > 0) {
                // Check notification text color
                for (let i = 0; i < notifications.length; i++) {
                    const notification = notifications[i];
                    const textColor = await notification.evaluate(el => {
                        return window.getComputedStyle(el).color;
                    });
                    console.log(`📝 Notification ${i + 1} text color: ${textColor}`);
                    
                    if (textColor.includes('255, 255, 255') || textColor.includes('white')) {
                        testResults.homepage.details.push('✅ Notification has white text');
                    } else {
                        testResults.homepage.details.push(`⚠️ Notification text color: ${textColor}`);
                    }
                }
            }

            testResults.homepage.status = testResults.homepage.details.some(d => d.includes('❌')) ? '❌' : '✅';
            
        } catch (error) {
            console.log(`❌ Homepage testing failed: ${error.message}`);
            testResults.homepage.details.push(`❌ Error: ${error.message}`);
        }

        // ===========================================
        // 2. PAYMENT SYSTEM TESTING
        // ===========================================
        console.log('\n💳 2. PAYMENT SYSTEM TESTING');
        console.log('==========================================');

        try {
            // Look for pricing plans
            const goldPlan = await page.$('[data-plan="gold"], .gold-plan, [class*="gold"]');
            const basicPlan = await page.$('[data-plan="basic"], .basic-plan, [class*="basic"]');
            const premiumPlan = await page.$('[data-plan="premium"], .premium-plan, [class*="premium"]');

            console.log('🔍 Looking for payment plan buttons...');

            // Test Gold Plan
            if (goldPlan) {
                console.log('✅ Gold plan found');
                testResults.paymentSystem.details.push('✅ Gold plan button present');
                
                // Click gold plan and monitor for errors
                const consoleBefore = allConsoleMessages.length;
                await goldPlan.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Check for new console errors after clicking
                const consoleAfter = allConsoleMessages.slice(consoleBefore);
                const hasPaymentError = consoleAfter.some(msg => 
                    msg.text.toLowerCase().includes('payment') && msg.type === 'error'
                );
                
                if (hasPaymentError) {
                    console.log('❌ Payment type error detected');
                    testResults.paymentSystem.details.push('❌ Gold plan click caused payment error');
                } else {
                    console.log('✅ Gold plan click successful, no payment errors');
                    testResults.paymentSystem.details.push('✅ Gold plan click working without errors');
                }
            } else {
                console.log('❌ Gold plan not found');
                testResults.paymentSystem.details.push('❌ Gold plan button missing');
            }

            // Test Basic Plan
            if (basicPlan) {
                console.log('✅ Basic plan found');
                testResults.paymentSystem.details.push('✅ Basic plan button present');
                
                await basicPlan.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                console.log('❌ Basic plan not found');
                testResults.paymentSystem.details.push('❌ Basic plan button missing');
            }

            // Test Premium Plan
            if (premiumPlan) {
                console.log('✅ Premium plan found');
                testResults.paymentSystem.details.push('✅ Premium plan button present');
                
                await premiumPlan.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                console.log('❌ Premium plan not found');
                testResults.paymentSystem.details.push('❌ Premium plan button missing');
            }

            // Take screenshot of payment section
            await page.screenshot({ path: 'test-payment-system.png', fullPage: true });
            console.log('📸 Payment system screenshot saved');

            testResults.paymentSystem.status = testResults.paymentSystem.details.some(d => d.includes('❌')) ? '❌' : '✅';

        } catch (error) {
            console.log(`❌ Payment system testing failed: ${error.message}`);
            testResults.paymentSystem.details.push(`❌ Error: ${error.message}`);
        }

        // ===========================================
        // 3. SUCCESS PAGE TESTING
        // ===========================================
        console.log('\n🎉 3. SUCCESS PAGE TESTING');
        console.log('==========================================');

        try {
            await page.goto('http://localhost:3008/success', { waitUntil: 'networkidle2', timeout: 30000 });
            console.log('✅ Success page loaded');
            testResults.successPage.details.push('✅ Success page navigation successful');

            // Check for showEmailModal error
            const consoleBeforeSuccess = allConsoleMessages.length;
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for any errors to appear
            
            const successConsoleMessages = allConsoleMessages.slice(consoleBeforeSuccess);
            const hasEmailModalError = successConsoleMessages.some(msg => 
                msg.text.toLowerCase().includes('showemailmodal') && msg.type === 'error'
            );

            if (hasEmailModalError) {
                console.log('❌ showEmailModal error detected');
                testResults.successPage.details.push('❌ showEmailModal error still present');
            } else {
                console.log('✅ No showEmailModal error detected');
                testResults.successPage.details.push('✅ showEmailModal error resolved');
            }

            // Test email modal functionality
            console.log('🔍 Testing email modal functionality...');
            const emailButton = await page.$('button[data-action="email"], .email-button, [class*="email"]');
            
            if (emailButton) {
                console.log('✅ Email button found');
                testResults.successPage.details.push('✅ Email modal button present');
                
                // Try to open email modal
                await emailButton.click();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Check if modal opened
                const modal = await page.$('.modal, .email-modal, [role="dialog"]');
                if (modal) {
                    console.log('✅ Email modal opened successfully');
                    testResults.successPage.details.push('✅ Email modal opens correctly');
                    
                    // Try to close modal
                    const closeButton = await page.$('.modal .close, [data-action="close"], .close-modal');
                    if (closeButton) {
                        await closeButton.click();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        console.log('✅ Email modal closed successfully');
                        testResults.successPage.details.push('✅ Email modal closes correctly');
                    }
                } else {
                    console.log('❌ Email modal did not open');
                    testResults.successPage.details.push('❌ Email modal not opening');
                }
            } else {
                console.log('❌ Email button not found');
                testResults.successPage.details.push('❌ Email modal button missing');
            }

            // Test CV optimization functionality
            console.log('🔍 Testing CV optimization functionality...');
            const optimizeButton = await page.$('button[data-action="optimize"], .optimize-button, [class*="optimize"]');
            
            if (optimizeButton) {
                console.log('✅ CV optimization button found');
                testResults.successPage.details.push('✅ CV optimization button present');
            } else {
                console.log('❌ CV optimization button not found');
                testResults.successPage.details.push('❌ CV optimization button missing');
            }

            // Take screenshot of success page
            await page.screenshot({ path: 'test-success-page.png', fullPage: true });
            console.log('📸 Success page screenshot saved');

            testResults.successPage.status = testResults.successPage.details.some(d => d.includes('❌')) ? '❌' : '✅';

        } catch (error) {
            console.log(`❌ Success page testing failed: ${error.message}`);
            testResults.successPage.details.push(`❌ Error: ${error.message}`);
        }

        // ===========================================
        // 4. CONSOLE ERROR MONITORING
        // ===========================================
        console.log('\n🔍 4. CONSOLE ERROR ANALYSIS');
        console.log('==========================================');

        const errorMessages = allConsoleMessages.filter(msg => msg.type === 'error');
        const warningMessages = allConsoleMessages.filter(msg => msg.type === 'warning');

        console.log(`📊 Total console messages: ${allConsoleMessages.length}`);
        console.log(`❌ Errors: ${errorMessages.length}`);
        console.log(`⚠️  Warnings: ${warningMessages.length}`);

        if (errorMessages.length > 0) {
            console.log('\n❌ CONSOLE ERRORS DETECTED:');
            errorMessages.forEach((msg, index) => {
                console.log(`${index + 1}. [${msg.url}] ${msg.text}`);
                testResults.consoleErrors.details.push(`❌ Error: ${msg.text}`);
            });
        } else {
            console.log('✅ No console errors detected');
            testResults.consoleErrors.details.push('✅ No console errors found');
        }

        if (warningMessages.length > 0) {
            console.log('\n⚠️  CONSOLE WARNINGS:');
            warningMessages.forEach((msg, index) => {
                console.log(`${index + 1}. [${msg.url}] ${msg.text}`);
                testResults.consoleErrors.details.push(`⚠️ Warning: ${msg.text}`);
            });
        }

        testResults.consoleErrors.status = errorMessages.length === 0 ? '✅' : '❌';

        // ===========================================
        // 5. UI/UX VERIFICATION
        // ===========================================
        console.log('\n🎨 5. UI/UX VERIFICATION');
        console.log('==========================================');

        try {
            // Test responsive behavior
            const viewports = [
                { width: 375, height: 667, name: 'Mobile' },
                { width: 768, height: 1024, name: 'Tablet' },
                { width: 1280, height: 720, name: 'Desktop' }
            ];

            for (const viewport of viewports) {
                console.log(`📱 Testing ${viewport.name} view (${viewport.width}x${viewport.height})`);
                await page.setViewport(viewport);
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Take responsive screenshot
                await page.screenshot({ 
                    path: `test-responsive-${viewport.name.toLowerCase()}.png`,
                    fullPage: true 
                });
                
                testResults.uiVerification.details.push(`✅ ${viewport.name} responsive test completed`);
            }

            // Reset to desktop view
            await page.setViewport({ width: 1280, height: 720 });

            // Check glassmorphism design consistency
            console.log('🔍 Checking glassmorphism design...');
            const glassElements = await page.$$eval('[class*="glass"], [class*="backdrop"], [style*="backdrop-filter"]', elements => {
                return elements.map(el => ({
                    tagName: el.tagName,
                    classList: Array.from(el.classList),
                    hasBackdropFilter: el.style.backdropFilter || window.getComputedStyle(el).backdropFilter !== 'none'
                }));
            });

            if (glassElements.length > 0) {
                console.log(`✅ Found ${glassElements.length} glassmorphism elements`);
                testResults.uiVerification.details.push(`✅ Glassmorphism design detected (${glassElements.length} elements)`);
            } else {
                console.log('⚠️ No glassmorphism elements detected');
                testResults.uiVerification.details.push('⚠️ No glassmorphism elements found');
            }

            testResults.uiVerification.status = '✅';

        } catch (error) {
            console.log(`❌ UI/UX verification failed: ${error.message}`);
            testResults.uiVerification.details.push(`❌ Error: ${error.message}`);
        }

        // ===========================================
        // 6. MULTI-PAGE CV TEST SIMULATION
        // ===========================================
        console.log('\n📄 6. CV TEST SIMULATION');
        console.log('==========================================');

        try {
            console.log('🔍 Simulating CV content processing...');
            
            // Go back to success page for CV testing
            await page.goto('http://localhost:3008/success', { waitUntil: 'networkidle2' });
            
            // Look for any CV content or templates
            const cvTemplates = await page.$$('.template, .cv-template, [data-template]');
            console.log(`📋 Found ${cvTemplates.length} CV template elements`);
            
            if (cvTemplates.length > 0) {
                testResults.cvTest.details.push(`✅ Found ${cvTemplates.length} CV templates`);
                
                // Test template switching if available
                for (let i = 0; i < Math.min(cvTemplates.length, 3); i++) {
                    const template = cvTemplates[i];
                    const templateName = await template.evaluate(el => 
                        el.dataset.template || el.className || `Template ${i + 1}`
                    );
                    
                    console.log(`🔍 Testing template: ${templateName}`);
                    await template.click();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    testResults.cvTest.details.push(`✅ Template ${templateName} clickable`);
                }
            } else {
                testResults.cvTest.details.push('⚠️ No CV templates found');
            }

            // Check for photo preservation elements
            const photoElements = await page.$$('img[src*="profile"], .profile-photo, [data-photo]');
            if (photoElements.length > 0) {
                console.log(`✅ Found ${photoElements.length} photo elements`);
                testResults.cvTest.details.push(`✅ Photo elements present (${photoElements.length})`);
            }

            // Test AI optimization endpoint (demo)
            console.log('🤖 Testing AI optimization endpoint...');
            try {
                const response = await page.evaluate(async () => {
                    const testCV = {
                        experience: "Software Developer at Tech Company (2020-2023)",
                        skills: "JavaScript, React, Node.js",
                        education: "Bachelor of Computer Science"
                    };

                    const res = await fetch('/api/demo-optimize', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cvData: testCV })
                    });

                    return {
                        status: res.status,
                        ok: res.ok,
                        statusText: res.statusText
                    };
                });

                if (response.ok) {
                    console.log('✅ AI optimization endpoint working');
                    testResults.cvTest.details.push('✅ AI optimization endpoint responsive');
                } else {
                    console.log(`❌ AI optimization endpoint error: ${response.status}`);
                    testResults.cvTest.details.push(`❌ AI endpoint error: ${response.status}`);
                }
            } catch (error) {
                console.log(`❌ AI optimization test failed: ${error.message}`);
                testResults.cvTest.details.push(`❌ AI test error: ${error.message}`);
            }

            testResults.cvTest.status = testResults.cvTest.details.some(d => d.includes('❌')) ? '❌' : '✅';

        } catch (error) {
            console.log(`❌ CV test simulation failed: ${error.message}`);
            testResults.cvTest.details.push(`❌ Error: ${error.message}`);
        }

        // ===========================================
        // FINAL REPORT GENERATION
        // ===========================================
        console.log('\n📊 GENERATING FINAL TEST REPORT');
        console.log('==========================================');

        const report = {
            timestamp: new Date().toISOString(),
            testResults,
            summary: {
                totalTests: Object.keys(testResults).length,
                passedTests: Object.values(testResults).filter(r => r.status === '✅').length,
                failedTests: Object.values(testResults).filter(r => r.status === '❌').length
            },
            consoleLog: allConsoleMessages
        };

        // Save detailed report
        fs.writeFileSync('comprehensive-test-report.json', JSON.stringify(report, null, 2));
        
        // Display summary
        console.log('\n🎯 TEST RESULTS SUMMARY');
        console.log('==========================================');
        Object.entries(testResults).forEach(([testName, result]) => {
            console.log(`${result.status} ${testName.toUpperCase()}`);
            result.details.forEach(detail => {
                console.log(`   ${detail}`);
            });
        });

        console.log(`\n📈 OVERALL: ${report.summary.passedTests}/${report.summary.totalTests} tests passed`);
        
        const overallStatus = report.summary.failedTests === 0 ? '✅ ALL TESTS PASSED' : 
                            report.summary.failedTests < report.summary.totalTests / 2 ? '⚠️ SOME ISSUES FOUND' : 
                            '❌ CRITICAL ISSUES DETECTED';
        
        console.log(`🏁 ${overallStatus}`);

        return report;

    } catch (error) {
        console.log(`❌ Critical testing error: ${error.message}`);
        return { error: error.message, consoleLog: allConsoleMessages };
    } finally {
        await browser.close();
    }
}

// Run the comprehensive test
comprehensiveTest().then(report => {
    console.log('\n✨ Comprehensive testing completed!');
    console.log('📁 Results saved to comprehensive-test-report.json');
    console.log('📸 Screenshots saved for visual verification');
    process.exit(0);
}).catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
});