const puppeteer = require('puppeteer');
const fs = require('fs');

async function testSuccessPageStability() {
    const browser = await puppeteer.launch({
        headless: false, // Show browser for visual debugging
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 720 }
    });

    const page = await browser.newPage();
    
    try {
        console.log('🚀 Testing Success Page Stability...');
        
        // Navigate to success page with test session
        const testUrl = 'http://localhost:3002/success?session_id=cs_test_a1pmDdn7ZjROXpD7LWQoWvYEwtPEBLMVFbijPxY48TwgSWpDHODgHIL9Qb&plan=gold';
        console.log('📍 Navigating to:', testUrl);
        
        await page.goto(testUrl, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        // Wait for initial page load
        console.log('⏳ Waiting for page to stabilize...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check for any console errors
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push(`${msg.type()}: ${msg.text()}`);
        });

        // Monitor for page refreshes/navigation events
        let refreshCount = 0;
        page.on('framenavigated', () => {
            refreshCount++;
            console.log(`🔄 Page refresh/navigation detected (#${refreshCount})`);
        });

        // Wait and observe for 10 seconds to check stability
        console.log('👀 Monitoring page stability for 10 seconds...');
        const startTime = Date.now();
        let isStable = true;
        
        // Monitor for constant re-renders by checking DOM changes
        const initialContent = await page.content();
        
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const currentContent = await page.content();
            
            // Check if content is dramatically different (indicating refresh)
            if (Math.abs(currentContent.length - initialContent.length) > 1000) {
                console.log(`⚠️ Significant content change detected at ${i + 1}s`);
                isStable = false;
            }
            
            console.log(`✓ Second ${i + 1}/10 - Page appears stable`);
        }

        // Check if CV content is displayed
        console.log('📄 Checking if CV content is displayed...');
        const cvContentExists = await page.$('.cv-template, .cv-content, [class*="cv"], [class*="template"]') !== null;
        console.log('CV Content Present:', cvContentExists);

        // Check if buttons are stable and not flickering
        console.log('🔘 Checking button stability...');
        const buttons = await page.$$('button');
        console.log(`Found ${buttons.length} buttons`);

        // Take screenshot
        console.log('📸 Taking stability screenshot...');
        await page.screenshot({ 
            path: 'screenshot-success-stable-fixed.png',
            fullPage: true 
        });

        // Generate stability report
        const report = {
            timestamp: new Date().toISOString(),
            url: testUrl,
            testDuration: '10 seconds',
            pageRefreshCount: refreshCount,
            isPageStable: isStable && refreshCount === 0,
            cvContentDisplayed: cvContentExists,
            buttonCount: buttons.length,
            consoleMessages: consoleMessages,
            stability: {
                noConstantRefreshing: refreshCount === 0,
                cvContentVisible: cvContentExists,
                buttonsFound: buttons.length > 0,
                overallStable: isStable && refreshCount === 0
            }
        };

        console.log('\n📊 STABILITY TEST RESULTS:');
        console.log('================================');
        console.log(`✅ No constant refreshing: ${report.stability.noConstantRefreshing}`);
        console.log(`✅ CV content displayed: ${report.stability.cvContentVisible}`);
        console.log(`✅ Buttons found: ${report.stability.buttonsFound} (${buttons.length} total)`);
        console.log(`✅ Overall stability: ${report.stability.overallStable}`);
        console.log(`📈 Refresh count: ${refreshCount}`);
        console.log('================================');

        // Save detailed report
        fs.writeFileSync('success-page-stability-test.json', JSON.stringify(report, null, 2));
        console.log('📄 Detailed report saved to success-page-stability-test.json');

        return report;

    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: 'screenshot-success-error.png' });
        return { error: error.message, stable: false };
    } finally {
        await browser.close();
    }
}

// Run the test
testSuccessPageStability()
    .then(result => {
        if (result.stability && result.stability.overallStable) {
            console.log('🎉 SUCCESS: Page is stable!');
            process.exit(0);
        } else {
            console.log('⚠️ WARNING: Page stability issues detected');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('💥 Test execution failed:', error);
        process.exit(1);
    });