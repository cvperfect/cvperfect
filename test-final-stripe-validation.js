// Final Stripe Payment Validation - Quick screenshot and endpoint check
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function finalStripeValidation() {
    console.log('🎯 Final Stripe Payment Flow Validation...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1400, height: 1000 }
    });
    
    const page = await browser.newPage();
    
    try {
        // Navigate to homepage
        console.log('📱 Loading homepage...');
        await page.goto('http://localhost:3007', { waitUntil: 'networkidle2' });
        
        // Take comprehensive screenshot
        await page.screenshot({ 
            path: 'screenshot-final-stripe-validation.png', 
            fullPage: true 
        });
        console.log('📸 Final validation screenshot saved');
        
        // Test one quick API call to confirm system is working
        const response = await fetch('http://localhost:3007/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                plan: 'basic',
                email: 'final.test@example.com',
                cv: 'Test CV content for final validation',
                job: 'Test job posting'
            })
        });
        
        const result = await response.json();
        
        console.log('✅ Final API Test Result:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${result.success}`);
        console.log(`   Stripe URL: ${result.url ? 'Generated' : 'Not generated'}`);
        
        // Quick element check
        const elements = await page.evaluate(() => {
            return {
                totalButtons: document.querySelectorAll('button').length,
                premiumButtons: document.querySelectorAll('button[class*="premium"], button[class*="payment"]').length,
                hasFileInput: document.querySelector('input[type="file"]') !== null,
                pageTitle: document.title
            };
        });
        
        console.log('📊 Page Elements:');
        console.log(`   Total buttons: ${elements.totalButtons}`);
        console.log(`   Premium buttons: ${elements.premiumButtons}`);
        console.log(`   File input: ${elements.hasFileInput ? 'Present' : 'Missing'}`);
        console.log(`   Page title: ${elements.pageTitle}`);
        
        // Save validation results
        const validationResults = {
            timestamp: new Date().toISOString(),
            homepage: {
                accessible: true,
                title: elements.pageTitle,
                buttons: elements.totalButtons,
                premiumButtons: elements.premiumButtons,
                fileUpload: elements.hasFileInput
            },
            api: {
                endpoint: '/api/create-checkout-session',
                status: response.status,
                working: response.ok,
                stripeUrlGenerated: !!result.url
            },
            validation: 'COMPLETE',
            status: response.ok ? 'PAYMENT_SYSTEM_OPERATIONAL' : 'NEEDS_ATTENTION'
        };
        
        await fs.writeFile('final-stripe-validation.json', JSON.stringify(validationResults, null, 2));
        
        console.log('\n🎯 FINAL VALIDATION SUMMARY:');
        console.log('================================');
        console.log(`✅ Homepage: ${validationResults.homepage.accessible ? 'ACCESSIBLE' : 'ISSUE'}`);
        console.log(`✅ Payment API: ${validationResults.api.working ? 'WORKING' : 'FAILING'}`);
        console.log(`✅ Stripe Integration: ${validationResults.api.stripeUrlGenerated ? 'OPERATIONAL' : 'ISSUE'}`);
        console.log(`🏆 Overall Status: ${validationResults.status}`);
        console.log('================================');
        
    } catch (error) {
        console.error('❌ Validation error:', error.message);
    } finally {
        await browser.close();
    }
}

// Run validation
finalStripeValidation()
    .then(() => {
        console.log('\n✅ Final Stripe validation completed!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Validation failed:', error);
        process.exit(1);
    });