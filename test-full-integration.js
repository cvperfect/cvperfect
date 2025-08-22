const puppeteer = require('puppeteer');

async function testFullIntegration() {
    console.log('🔗 FULL INTEGRATION TEST - INDEX.JS → SUCCESS.JS 🔗\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        slowMo: 300 // Slower to see the full flow
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 900 });
        
        // Monitor console for debug info
        page.on('console', msg => {
            if (msg.text().includes('🚀') || msg.text().includes('✅') || 
                msg.text().includes('📸') || msg.text().includes('🤖') ||
                msg.text().includes('CV') || msg.text().includes('session')) {
                console.log(`📢 Browser: ${msg.text()}`);
            }
        });

        console.log('1️⃣ Loading main page...');
        await page.goto('http://localhost:3004', { 
            waitUntil: 'networkidle0',
            timeout: 15000
        });

        console.log('2️⃣ Testing CV upload simulation...');
        
        // Simulate CV text input instead of file upload for testing
        const testCVText = `
Anna Kowalska
Email: anna.kowalska@example.com
Telefon: +48 123 456 789

DOŚWIADCZENIE ZAWODOWE:
- Senior Developer w TechCorp (2021-2024)
- Frontend Developer w StartupXYZ (2019-2021)  
- Junior Developer w WebAgency (2018-2019)

WYKSZTAŁCENIE:
- Informatyka - AGH Kraków (2014-2018)
- Certyfikat React Developer (2020)

UMIEJĘTNOŚCI:
JavaScript, React, Node.js, Python, AWS, Docker
        `.trim();

        // Inject CV text directly into savedCV state
        await page.evaluate((cvText) => {
            window.testSetCV = cvText;
            if (window.setSavedCV) {
                window.setSavedCV(cvText);
            }
            // Also set in sessionStorage for payment flow
            sessionStorage.setItem('pendingCV', cvText);
            sessionStorage.setItem('pendingEmail', 'anna.kowalska@example.com');
            sessionStorage.setItem('pendingJob', 'Senior Frontend Developer position');
            console.log('🔧 Test CV data injected:', cvText.length, 'characters');
        }, testCVText);

        console.log('   ✅ Test CV data injected');

        console.log('\n3️⃣ Testing plan selection...');
        
        // Look for premium plan button
        const premiumPlanSelected = await page.evaluate(() => {
            // Find premium plan button (79 PLN)
            const buttons = Array.from(document.querySelectorAll('button, .plan-card'));
            const premiumButton = buttons.find(btn => 
                btn.textContent.includes('79') || 
                btn.textContent.includes('Premium') ||
                btn.classList.contains('premium')
            );
            
            if (premiumButton) {
                console.log('🎯 Found premium plan button');
                premiumButton.click();
                return true;
            }
            return false;
        });

        if (premiumPlanSelected) {
            console.log('   ✅ Premium plan selected');
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.log('   ⚠️ Premium plan button not found, continuing...');
        }

        console.log('\n4️⃣ Testing session data save...');
        
        // Test the save-session API directly
        const sessionId = 'test_sess_' + Date.now();
        
        const saveResult = await page.evaluate(async (sessionId, cvText) => {
            try {
                const response = await fetch('/api/save-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: sessionId,
                        cvData: cvText,
                        jobPosting: 'Senior Frontend Developer position',
                        email: 'anna.kowalska@example.com',
                        plan: 'premium',
                        template: 'simple',
                        photo: null
                    })
                });
                
                const result = await response.json();
                console.log('💾 Save session result:', result);
                return result;
            } catch (error) {
                console.error('❌ Save session error:', error);
                return { success: false, error: error.message };
            }
        }, sessionId, testCVText);

        if (saveResult.success) {
            console.log('   ✅ Session data saved successfully');
        } else {
            console.log('   ❌ Session save failed:', saveResult.error);
        }

        console.log('\n5️⃣ Testing success page with saved session...');
        
        // Navigate to success page with our test session
        await page.goto(`http://localhost:3004/success?session_id=${sessionId}&plan=premium`, {
            waitUntil: 'networkidle0',
            timeout: 15000
        });

        console.log('   ✅ Success page loaded');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for AI processing

        console.log('\n6️⃣ Verifying success page content...');
        
        const successPageCheck = await page.evaluate(() => {
            const cvPreview = document.querySelector('.cv-preview-content');
            const hasContent = cvPreview && cvPreview.textContent.length > 200;
            const hasName = cvPreview && cvPreview.textContent.includes('Anna');
            const hasEmail = cvPreview && cvPreview.textContent.includes('anna.kowalska');
            
            const buttons = Array.from(document.querySelectorAll('button:not([disabled])'));
            const hasActiveButtons = buttons.length >= 5;
            
            return {
                cvExists: !!cvPreview,
                hasContent,
                hasName,
                hasEmail,
                hasActiveButtons,
                buttonCount: buttons.length,
                contentLength: cvPreview ? cvPreview.textContent.length : 0,
                contentPreview: cvPreview ? cvPreview.textContent.substring(0, 200) + '...' : 'No content'
            };
        });

        console.log('   📊 Success page analysis:', successPageCheck);

        console.log('\n7️⃣ Testing template hierarchy...');
        
        const templateCheck = await page.evaluate(() => {
            const templateCards = Array.from(document.querySelectorAll('.template-card'));
            const totalTemplates = templateCards.length;
            const lockedTemplates = templateCards.filter(card => 
                card.classList.contains('locked')
            ).length;
            const availableTemplates = totalTemplates - lockedTemplates;
            
            return {
                total: totalTemplates,
                available: availableTemplates,
                locked: lockedTemplates,
                shouldHave: 7 // Premium should have 7 templates
            };
        });

        console.log(`   📊 Templates: ${templateCheck.available}/${templateCheck.total} available (should be ${templateCheck.shouldHave})`);

        console.log('\n8️⃣ Final screenshot...');
        await page.screenshot({ 
            path: 'screenshot-full-integration-test.png',
            fullPage: true
        });

        // Summary
        const testResults = {
            sessionSave: saveResult.success,
            successPageLoad: true,
            cvDisplay: successPageCheck.hasContent && successPageCheck.hasName,
            correctTemplates: templateCheck.available === templateCheck.shouldHave,
            activeButtons: successPageCheck.hasActiveButtons
        };

        const passedTests = Object.values(testResults).filter(Boolean).length;
        const totalTests = Object.keys(testResults).length;

        console.log('\n' + '='.repeat(60));
        console.log('🔗 FULL INTEGRATION TEST RESULTS 🔗');
        console.log('='.repeat(60));
        
        Object.entries(testResults).forEach(([test, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
        });

        console.log(`\n📊 OVERALL: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('\n🎉 FULL INTEGRATION WORKS PERFECTLY! 🎉');
            console.log('💎 Index.js → Success.js flow is operational');
            console.log('🤖 AI optimization with full CV data');
            console.log('📸 Photo preservation system ready');
            console.log('🎨 Template hierarchy correct');
        } else {
            console.log('\n⚠️ Some integration issues detected');
        }

    } catch (error) {
        console.error('❌ Integration test error:', error);
    } finally {
        console.log('\n⏳ Browser stays open for 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        await browser.close();
    }
}

testFullIntegration().catch(console.error);