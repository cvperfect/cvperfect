const puppeteer = require('puppeteer');

async function testSuccessPageDesign() {
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport for desktop view
        await page.setViewport({ width: 1920, height: 1080 });
        
        console.log('🌐 Navigating to success page...');
        
        // Navigate to the success page with the specified parameters
        const url = 'http://localhost:3001/success?session_id=cs_test_a1pmDdn7ZjROXpD7LWQoWvYEwtPEBLMVFbijPxY48TwgSWpDHODgHIL9Qb&plan=gold';
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        console.log('⏳ Waiting for page to fully load...');
        
        // Wait for key elements to load
        await page.waitForSelector('body', { timeout: 10000 });
        
        // Wait a bit more for any animations or dynamic content
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('📸 Taking full page screenshot...');
        
        // Take a full page screenshot
        await page.screenshot({
            path: 'screenshot-success-design-fixed.png',
            fullPage: true,
            type: 'png'
        });
        
        console.log('✅ Screenshot saved as screenshot-success-design-fixed.png');
        
        // Get some info about the page content
        const pageTitle = await page.title();
        console.log('📄 Page title:', pageTitle);
        
        // Check if CV preview section is visible
        const cvPreviewExists = await page.$('.cv-preview, .cv-container, [class*="cv"], [class*="CV"]');
        console.log('🔍 CV preview section found:', !!cvPreviewExists);
        
        // Check for glassmorphism elements
        const glassmorphismElements = await page.$$eval('*', (elements) => {
            return elements.filter(el => {
                const style = window.getComputedStyle(el);
                return style.backdropFilter && style.backdropFilter.includes('blur');
            }).length;
        });
        console.log('✨ Glassmorphism elements found:', glassmorphismElements);
        
        // Check for gradient buttons
        const gradientButtons = await page.$$eval('button, .button, [class*="btn"]', (buttons) => {
            return buttons.filter(btn => {
                const style = window.getComputedStyle(btn);
                return style.background && (style.background.includes('gradient') || style.background.includes('linear-gradient'));
            }).length;
        });
        console.log('🎨 Gradient buttons found:', gradientButtons);
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        await browser.close();
        console.log('🔚 Browser closed');
    }
}

// Run the test
testSuccessPageDesign().catch(console.error);