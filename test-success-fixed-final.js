const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  console.log('🧪 Testowanie final fix - migotanie + AI optimization...');
  
  try {
    // Navigate to success page with test session
    const testUrl = 'http://localhost:3004/success?session_id=cs_test_a1QxhoclyLRRSH2v9nbZOlblzW4ptUJEbxiL2yKhX5j4RYsVBZ&plan=premium';
    
    console.log('🔗 Ładowanie strony:', testUrl);
    await page.goto(testUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    await page.screenshot({ path: 'screenshot-success-final-fix.png', fullPage: true });
    
    // Monitor page for stability (no constant reloads/flickers)
    console.log('👁️ Monitorowanie stabilności strony przez 10 sekund...');
    
    let requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });
    
    let jsErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
      }
    });
    
    // Wait and count
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 10000));
    const endTime = Date.now();
    
    const testDuration = (endTime - startTime) / 1000;
    
    // Check CV content is displayed
    const cvContentDisplayed = await page.evaluate(() => {
      const cvPreview = document.querySelector('[data-testid="cv-preview"], .cv-preview, .bg-white');
      return cvPreview && cvPreview.textContent.length > 100;
    });
    
    // Count template cards
    const templateCardsFound = await page.evaluate(() => {
      return document.querySelectorAll('[data-testid*="template"], .template-card, .bg-gradient-to-br').length;
    });
    
    // Check API calls frequency (should be minimal for stable page)
    const apiCalls = requests.filter(req => req.url.includes('/api/'));
    const apiCallsPerSecond = apiCalls.length / testDuration;
    
    const testResult = {
      timestamp: new Date().toISOString(),
      testDuration: testDuration,
      apiCallsTotal: apiCalls.length,
      apiCallsPerSecond: apiCallsPerSecond,
      cvContentDisplayed: cvContentDisplayed,
      templateCardsFound: templateCardsFound,
      jsErrors: jsErrors.length,
      stability: apiCallsPerSecond < 1 ? 'STABLE' : 'UNSTABLE',
      requests: apiCalls.slice(0, 10) // First 10 requests only
    };
    
    fs.writeFileSync('success-page-final-stability-test.json', JSON.stringify(testResult, null, 2));
    
    console.log('📊 WYNIKI TESTU:');
    console.log(`⏱️ Czas testu: ${testDuration}s`);
    console.log(`📡 Wywołania API: ${apiCalls.length} (${apiCallsPerSecond.toFixed(2)}/s)`);
    console.log(`📄 CV wyświetlone: ${cvContentDisplayed ? '✅' : '❌'}`);
    console.log(`🎨 Szablony znalezione: ${templateCardsFound}`);
    console.log(`❌ Błędy JS: ${jsErrors.length}`);
    console.log(`🔧 Status: ${testResult.stability}`);
    
    if (testResult.stability === 'STABLE' && cvContentDisplayed && templateCardsFound > 0) {
      console.log('\n✅ SUKCES: Strona jest stabilna i funkcjonalna!');
    } else {
      console.log('\n❌ PROBLEM: Strona nadal ma problemy');
      if (testResult.stability === 'UNSTABLE') {
        console.log('- Za dużo wywołań API (migotanie)');
      }
      if (!cvContentDisplayed) {
        console.log('- CV nie jest wyświetlane');
      }
      if (templateCardsFound === 0) {
        console.log('- Brak szablonów');
      }
    }

  } catch (error) {
    console.error('❌ Błąd testu:', error.message);
  }
  
  await browser.close();
  console.log('🏁 Test zakończony');
})();