const puppeteer = require('puppeteer');

async function testSuccessPageStability() {
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        // Set viewport for consistent testing
        await page.setViewport({ width: 1920, height: 1080 });
        
        console.log('🔍 FINAL STABILITY TEST - Success Page');
        console.log('=====================================');
        
        // Navigate to success page with test session
        const testUrl = 'http://localhost:3003/success?session_id=cs_test_a1QxhoclyLRRSH2v9nbZOlblzW4ptUJELPrY6iJEbxiL2yKhX5j4RYsVBZ&plan=gold';
        console.log('📍 Testing URL:', testUrl);
        
        // Track network requests
        const networkRequests = [];
        page.on('request', request => {
            if (request.url().includes('/api/') || request.url().includes('localhost:3003')) {
                networkRequests.push({
                    url: request.url(),
                    method: request.method(),
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Track console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // Navigate to page
        const startTime = Date.now();
        await page.goto(testUrl, { 
            waitUntil: 'networkidle0',
            timeout: 10000 
        });
        
        const loadTime = Date.now() - startTime;
        console.log(`✅ Page loaded in ${loadTime}ms`);
        
        // Wait 2 seconds for initial stabilization
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('⏳ Initial 2-second stabilization complete');
        
        // Take initial screenshot
        await page.screenshot({ 
            path: 'screenshot-success-final-stable.png',
            fullPage: false
        });
        console.log('📸 Screenshot captured: screenshot-success-final-stable.png');
        
        // Monitor for 15 seconds to check stability
        console.log('🕐 Starting 15-second stability monitoring...');
        const monitoringStart = Date.now();
        let refreshCount = 0;
        let lastUrl = page.url();
        
        // Monitor for navigation changes (refreshes)
        page.on('framenavigated', (frame) => {
            if (frame === page.mainFrame()) {
                refreshCount++;
                console.log(`🔄 Page refresh detected #${refreshCount} at ${new Date().toISOString()}`);
            }
        });
        
        // Check page every 3 seconds for 15 seconds total
        for (let i = 0; i < 5; i++) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const currentTime = Date.now();
            const elapsedSeconds = Math.round((currentTime - monitoringStart) / 1000);
            
            // Check if page is still responsive
            const title = await page.title().catch(() => 'Unable to get title');
            console.log(`📊 ${elapsedSeconds}s: Page responsive, title: "${title}"`);
            
            // Check current network activity
            const recentRequests = networkRequests.filter(req => 
                new Date(req.timestamp) > new Date(currentTime - 3000)
            );
            
            if (recentRequests.length > 0) {
                console.log(`🌐 Network activity (last 3s): ${recentRequests.length} requests`);
                recentRequests.forEach(req => {
                    console.log(`   - ${req.method} ${req.url}`);
                });
            } else {
                console.log(`🌐 Network activity (last 3s): No requests`);
            }
        }
        
        console.log('✅ 15-second monitoring complete');
        
        // Final analysis
        console.log('\n📋 STABILITY TEST RESULTS');
        console.log('==========================');
        console.log(`🔄 Total page refreshes: ${refreshCount}`);
        console.log(`🌐 Total network requests: ${networkRequests.length}`);
        console.log(`❌ Console errors: ${consoleErrors.length}`);
        
        if (refreshCount === 0) {
            console.log('✅ SUCCESS: No page refreshes detected - page is stable!');
        } else {
            console.log('❌ ISSUE: Page refreshing detected - needs investigation');
        }
        
        if (consoleErrors.length > 0) {
            console.log('\n🚨 Console Errors:');
            consoleErrors.forEach(error => console.log(`   - ${error}`));
        }
        
        if (networkRequests.length > 0) {
            console.log('\n🌐 Network Activity Summary:');
            const apiCalls = networkRequests.filter(req => req.url.includes('/api/'));
            const pageCalls = networkRequests.filter(req => !req.url.includes('/api/'));
            console.log(`   - API calls: ${apiCalls.length}`);
            console.log(`   - Page/resource calls: ${pageCalls.length}`);
            
            if (apiCalls.length > 2) {
                console.log('⚠️  WARNING: High API call frequency detected');
                apiCalls.forEach(call => {
                    console.log(`     ${call.timestamp} - ${call.method} ${call.url}`);
                });
            }
        }
        
        // Check final page state
        const finalTitle = await page.title();
        const finalUrl = page.url();
        console.log(`\n📄 Final page state:`);
        console.log(`   Title: "${finalTitle}"`);
        console.log(`   URL: ${finalUrl}`);
        
        // Verify key elements are present
        const hasMainContent = await page.$('.success-container, .main-container, h1, h2') !== null;
        const hasTemplates = await page.$('.template-card, .template-container') !== null;
        
        console.log(`   Main content present: ${hasMainContent}`);
        console.log(`   Templates present: ${hasTemplates}`);
        
        if (refreshCount === 0 && consoleErrors.length === 0 && hasMainContent) {
            console.log('\n🎉 FINAL VERDICT: Success page is STABLE and fully functional!');
            return true;
        } else {
            console.log('\n⚠️  FINAL VERDICT: Issues detected that need attention');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// Run the test
testSuccessPageStability()
    .then(success => {
        if (success) {
            console.log('\n✅ SUCCESS PAGE STABILITY TEST PASSED');
            process.exit(0);
        } else {
            console.log('\n❌ SUCCESS PAGE STABILITY TEST FAILED');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Fatal test error:', error);
        process.exit(1);
    });