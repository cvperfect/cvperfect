// Simple Test for 10,000+ Character CV Expansion
const puppeteer = require('puppeteer');

async function testCVOptimization() {
  console.log('🚀 Testing CV Optimization...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1400, height: 900 }
    });
    
    const page = await browser.newPage();
    
    // Navigate to success page
    console.log('📱 Opening success page...');
    await page.goto('http://localhost:3000/success?session_id=demo&plan=premium');
    await page.waitForLoadState?.('networkidle') || await page.waitForTimeout?.(3000) || await new Promise(r => setTimeout(r, 3000));

    // Check glassmorphism styling
    console.log('🎨 Checking glassmorphism styling...');
    const hasGlassmorphism = await page.evaluate(() => {
      const elements = document.querySelectorAll('.premium-section, .cv-header, .action-buttons button');
      return Array.from(elements).some(el => {
        const styles = getComputedStyle(el);
        return styles.backdropFilter.includes('blur') || 
               styles.background.includes('gradient') ||
               styles.boxShadow !== 'none';
      });
    });
    console.log(hasGlassmorphism ? '✅ Glassmorphism styling detected' : '❌ No glassmorphism found');

    // Check button gradients
    const hasGradientButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('.action-buttons button');
      return Array.from(buttons).some(btn => 
        getComputedStyle(btn).background.includes('gradient')
      );
    });
    console.log(hasGradientButtons ? '✅ Gradient buttons detected' : '❌ No gradient buttons found');

    // Take screenshot
    await page.screenshot({ path: 'test-success-redesign-simple.png', fullPage: true });
    console.log('📸 Screenshot saved: test-success-redesign-simple.png');

    // Test AI optimization if available
    const aiButton = await page.$('button[class*="violet-600"]');
    if (aiButton) {
      console.log('🤖 Testing AI optimization...');
      
      // Get initial content length
      const initialLength = await page.evaluate(() => {
        const cv = document.querySelector('.cv-preview-content');
        return cv ? cv.innerText.length : 0;
      });
      console.log(`📄 Initial CV length: ${initialLength} characters`);
      
      // Click optimization (if not disabled)
      const isDisabled = await page.evaluate(btn => btn.disabled, aiButton);
      if (!isDisabled) {
        await aiButton.click();
        console.log('🔄 AI optimization started...');
        
        // Wait for completion or timeout
        let completed = false;
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 2000));
          
          const notification = await page.evaluate(() => {
            const notifs = document.querySelectorAll('[class*="fixed"][class*="top-4"]');
            return Array.from(notifs).map(n => n.textContent).join(' ');
          });
          
          if (notification.includes('zoptymalizowane') || notification.includes('SUCCESS')) {
            completed = true;
            console.log('✅ Optimization completed!');
            
            const finalLength = await page.evaluate(() => {
              const cv = document.querySelector('.cv-preview-content');
              return cv ? cv.innerText.length : 0;
            });
            
            console.log(`📈 Final CV length: ${finalLength} characters`);
            console.log(`🎯 Expansion: ${(finalLength/initialLength).toFixed(2)}x`);
            console.log(`🎯 10k+ target: ${finalLength >= 10000 ? '✅ ACHIEVED' : '❌ NOT REACHED'}`);
            break;
          } else if (notification.includes('error') || notification.includes('błąd')) {
            console.log('❌ Optimization failed:', notification);
            break;
          }
          
          console.log(`⏳ Waiting... (${i+1}/30) - ${notification}`);
        }
        
        if (!completed) {
          console.log('⏰ Optimization timed out');
        }
      } else {
        console.log('⚠️ AI button is disabled (check plan requirements)');
      }
    } else {
      console.log('❌ AI optimization button not found');
    }

    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testCVOptimization().catch(console.error);