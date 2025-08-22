const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  console.log('🧪 Testowanie pełnego CV na stronie success...\n');
  
  try {
    // Navigate to success page
    const testUrl = 'http://localhost:3004/success?session_id=cs_test_a1QxhoclyLRRSH2v9nbZOlblzW4ptUJEbxiL2yKhX5j4RYsVBZ&plan=premium';
    
    console.log('🔗 Ładowanie strony success...');
    await page.goto(testUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Capture console logs
    page.on('console', msg => {
      if (msg.text().includes('prepareCVForOptimization') || 
          msg.text().includes('Storing full optimized') ||
          msg.text().includes('AI optimization')) {
        console.log('📋 PAGE LOG:', msg.text());
      }
    });
    
    // Look for AI optimize button and click it
    console.log('🤖 Szukanie przycisku "Optymalizuj z AI"...');
    
    const optimizeButton = await page.evaluate(() => {
      // Look for various possible button selectors
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], .btn'));
      return buttons.find(btn => 
        btn.textContent.includes('Optymalizuj') || 
        btn.textContent.includes('AI') ||
        btn.innerHTML.includes('🤖')
      );
    });
    
    if (optimizeButton) {
      console.log('✅ Przycisk AI znaleziony, klikam...');
      
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], .btn'));
        const btn = buttons.find(btn => 
          btn.textContent.includes('Optymalizuj') || 
          btn.textContent.includes('AI') ||
          btn.innerHTML.includes('🤖')
        );
        if (btn) btn.click();
      });
      
      // Wait for AI optimization to complete
      console.log('⏳ Czekam na optymalizację AI...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Take screenshot after optimization
      await page.screenshot({ path: 'screenshot-success-cv-optimized.png', fullPage: true });
      
      // Check CV content
      const cvContent = await page.evaluate(() => {
        const cvPreview = document.querySelector('[data-testid="cv-preview"], .cv-preview, .bg-white');
        return cvPreview ? cvPreview.textContent : '';
      });
      
      console.log('\n📊 ANALIZA CV PO OPTYMALIZACJI:');
      console.log('Długość CV:', cvContent.length, 'znaków');
      
      // Check for specific content
      const hasKonrad = cvContent.includes('Konrad Jakóbczak');
      const hasEmail = cvContent.includes('konrad11811');
      const hasPhone = cvContent.includes('570 625');
      const hasDPD = cvContent.includes('DPD') || cvContent.includes('Kurier');
      const hasGlovo = cvContent.includes('Glovo') || cvContent.includes('Dostawca');
      const hasPlay = cvContent.includes('Play') || cvContent.includes('Sprzedawca');
      const hasEducation = cvContent.includes('Uniwersytet') || cvContent.includes('Licencjat');
      
      console.log('\n🔍 WERYFIKACJA ZAWARTOŚCI CV:');
      console.log(`✅ Imię i nazwisko (Konrad Jakóbczak): ${hasKonrad ? '✅' : '❌'}`);
      console.log(`✅ Email: ${hasEmail ? '✅' : '❌'}`);
      console.log(`✅ Telefon: ${hasPhone ? '✅' : '❌'}`);
      console.log(`✅ Doświadczenie DPD/Kurier: ${hasDPD ? '✅' : '❌'}`);
      console.log(`✅ Doświadczenie Glovo/Dostawca: ${hasGlovo ? '✅' : '❌'}`);
      console.log(`✅ Doświadczenie Play/Sprzedawca: ${hasPlay ? '✅' : '❌'}`);
      console.log(`✅ Wykształcenie: ${hasEducation ? '✅' : '❌'}`);
      
      const allChecksPass = hasKonrad && hasEmail && hasPhone && hasDPD && hasGlovo && hasPlay && hasEducation;
      
      console.log(`\n${allChecksPass ? '🎉' : '❌'} WYNIK KOŃCOWY: ${allChecksPass ? 'WSZYSTKIE DANE ZACHOWANE!' : 'PROBLEMY Z DANYMI'}`);
      
      if (cvContent.length < 300) {
        console.log('⚠️ UWAGA: CV wydaje się zbyt krótkie (< 300 znaków)');
        console.log('Zawartość CV:', cvContent.substring(0, 200));
      }
      
    } else {
      console.log('❌ Nie znaleziono przycisku optymalizacji AI');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'screenshot-success-no-ai-button.png', fullPage: true });
      
      // Show current CV content anyway
      const cvContent = await page.evaluate(() => {
        const cvPreview = document.querySelector('[data-testid="cv-preview"], .cv-preview, .bg-white');
        return cvPreview ? cvPreview.textContent : 'Brak CV';
      });
      
      console.log('📄 Obecna zawartość CV (pierwsze 300 znaków):');
      console.log(cvContent.substring(0, 300));
    }

  } catch (error) {
    console.error('❌ Błąd testu:', error.message);
    await page.screenshot({ path: 'screenshot-success-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('\n🏁 Test zakończony');
})();