// Test if success page loads user's actual CV
const puppeteer = require('puppeteer');

async function testSuccessPageCVLoad() {
  console.log('🔍 Testing if success page loads user\'s actual CV...\n');
  
  // Use one of the existing sessions we know has Konrad's CV
  const testSessionId = 'sess_1755868572113_tmitb3umn';
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Enable console logging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('CV') || text.includes('session') || text.includes('Processing')) {
        console.log('Browser console:', text);
      }
    });
    
    // Go directly to success page with session ID
    const url = `http://localhost:3000/success?session_id=${testSessionId}&plan=basic`;
    console.log('📍 Loading success page:', url);
    
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(5000); // Wait for data to load
    
    // Check what CV is displayed
    const cvContent = await page.evaluate(() => {
      // Look for CV content in various places
      const cvSections = document.querySelectorAll('.cv-content, .optimized-cv, [class*="cv-section"]');
      let content = '';
      
      cvSections.forEach(section => {
        content += section.textContent + '\n';
      });
      
      // Also check for name displayed
      const nameElements = document.querySelectorAll('h1, h2, .name, [class*="name"]');
      let displayedName = '';
      nameElements.forEach(el => {
        const text = el.textContent.trim();
        if (text && !text.includes('CV') && !text.includes('Premium')) {
          displayedName = text;
        }
      });
      
      return {
        content: content.substring(0, 500),
        displayedName: displayedName,
        hasAnnaKowalska: content.includes('Anna Kowalska'),
        hasKonrad: content.includes('Konrad') || content.includes('konrad11811'),
        fullLength: content.length
      };
    });
    
    console.log('\n📊 Results:');
    console.log('- Displayed name:', cvContent.displayedName);
    console.log('- Contains "Anna Kowalska"?', cvContent.hasAnnaKowalska ? '❌ YES (BAD)' : '✅ NO (GOOD)');
    console.log('- Contains "Konrad"?', cvContent.hasKonrad ? '✅ YES (GOOD)' : '❌ NO (BAD)');
    console.log('- Content length:', cvContent.fullLength, 'characters');
    console.log('\n📝 First 500 characters of CV content:');
    console.log(cvContent.content);
    
    // Check API calls
    const apiCalls = await page.evaluate(() => {
      return window.apiCallsLog || [];
    });
    
    if (apiCalls.length > 0) {
      console.log('\n📡 API calls made:');
      apiCalls.forEach(call => console.log('-', call));
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-success-cv-display.png', fullPage: true });
    console.log('\n📸 Screenshot saved: test-success-cv-display.png');
    
    // Check if AI optimization was triggered
    const aiOptimizationTriggered = await page.evaluate(() => {
      return window.aiOptimizationLog || localStorage.getItem('lastAiOptimization') || 'not found';
    });
    
    console.log('\n🤖 AI optimization status:', aiOptimizationTriggered);
    
    // Test result
    if (!cvContent.hasAnnaKowalska && cvContent.hasKonrad) {
      console.log('\n✅ SUCCESS: Page displays Konrad\'s CV, not Anna Kowalska\'s!');
    } else if (cvContent.hasAnnaKowalska) {
      console.log('\n❌ FAILURE: Page still shows Anna Kowalska\'s demo CV!');
    } else {
      console.log('\n⚠️ UNKNOWN: Could not determine which CV is displayed');
    }
    
  } catch (error) {
    console.error('\n❌ Test error:', error);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  } finally {
    console.log('\n⏸️ Browser kept open for inspection. Close manually when done.');
    // await browser.close();
  }
}

// Run test
testSuccessPageCVLoad().catch(console.error);