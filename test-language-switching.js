const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testLanguageSwitching() {
  console.log('🌍 TEST PRZEŁĄCZANIA JĘZYKÓW');
  console.log('============================');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3015', { waitUntil: 'networkidle2' });
    
    // Screenshot początku (polski)
    await page.screenshot({ 
      path: 'test-screenshots/lang-01-polish.png',
      fullPage: true 
    });
    
    console.log('📄 Test początkowego języka (polski)...');
    
    // Sprawdź czy strona jest w języku polskim
    const polishTexts = await page.evaluate(() => {
      const texts = [];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text.length > 5) { // Tylko dłuższe teksty
          texts.push(text);
        }
      }
      return texts.slice(0, 20); // Pierwsze 20 tekstów
    });
    
    const hasPolishContent = polishTexts.some(text => 
      text.includes('Zwiększ') || 
      text.includes('szanse') || 
      text.includes('optymalizuj') ||
      text.includes('Wypróbuj za darmo')
    );
    
    console.log(`✅ Zawartość w języku polskim: ${hasPolishContent ? 'ZNALEZIONA' : 'BRAK'}`);
    if (hasPolishContent) {
      console.log('   Przykłady: ', polishTexts.slice(0, 3));
    }
    
    console.log('📄 Test przełączenia na angielski...');
    
    // Znajdź przycisk przełączania języka
    const langSwitchers = [
      'button[data-lang="en"]',
      '.language-switch',
      'button:contains("EN")',
      'button:contains("🇬🇧")'
    ];
    
    let languageButton = null;
    for (const selector of langSwitchers) {
      try {
        languageButton = await page.$(selector);
        if (languageButton) {
          console.log(`🔍 Znaleziono przycisk języka: ${selector}`);
          break;
        }
      } catch (e) {
        // Próbuj następny selektor
      }
    }
    
    // Jeśli nie znalazł standardowych selektorów, szukaj po tekście
    if (!languageButton) {
      languageButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => 
          btn.textContent.includes('EN') || 
          btn.textContent.includes('🇬🇧') ||
          btn.textContent.includes('English')
        );
      });
    }
    
    if (languageButton && languageButton.asElement) {
      console.log('🔄 Klikam przycisk zmiany języka...');
      await languageButton.asElement().click();
      
      // Czekaj na zmianę języka
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Screenshot po zmianie na angielski
      await page.screenshot({ 
        path: 'test-screenshots/lang-02-english.png',
        fullPage: true 
      });
      
      // Sprawdź czy zawartość zmieniła się na angielską
      const englishTexts = await page.evaluate(() => {
        const texts = [];
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
        
        let node;
        while (node = walker.nextNode()) {
          const text = node.textContent.trim();
          if (text.length > 5) {
            texts.push(text);
          }
        }
        return texts.slice(0, 20);
      });
      
      const hasEnglishContent = englishTexts.some(text => 
        text.includes('Boost') || 
        text.includes('chances') || 
        text.includes('Optimize') ||
        text.includes('Try for free') ||
        text.includes('CV now')
      );
      
      console.log(`✅ Zawartość w języku angielskim: ${hasEnglishContent ? 'ZNALEZIONA' : 'BRAK'}`);
      if (hasEnglishContent) {
        console.log('   Przykłady: ', englishTexts.slice(0, 3));
      }
      
      // Test przełączenia z powrotem na polski
      console.log('📄 Test przełączenia z powrotem na polski...');
      
      const polishButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(btn => 
          btn.textContent.includes('PL') || 
          btn.textContent.includes('🇵🇱') ||
          btn.textContent.includes('Polski')
        );
      });
      
      if (polishButton && polishButton.asElement) {
        await polishButton.asElement().click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await page.screenshot({ 
          path: 'test-screenshots/lang-03-back-to-polish.png',
          fullPage: true 
        });
        
        console.log('✅ Przełączono z powrotem na polski');
      }
      
      // Test czy modal również zmienia język
      console.log('📄 Test zmiany języka w modalu...');
      
      const ctaButton = await page.$('[data-testid="main-cta"]');
      if (ctaButton) {
        await ctaButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Screenshot modalu w aktualnym języku
        await page.screenshot({ 
          path: 'test-screenshots/lang-04-modal-language.png',
          fullPage: true 
        });
        
        console.log('✅ Modal przetestowany');
        
        // Zamknij modal
        await page.keyboard.press('Escape');
      }
      
    } else {
      console.log('❌ Nie znaleziono przycisku przełączania języka');
    }
    
    // Test różnych sekcji strony po przełączeniu języka
    console.log('📄 Test kompletności tłumaczenia...');
    
    const sectionsToCheck = [
      'header',
      'main', 
      'footer',
      '.hero-section',
      '.features-section',
      '.testimonials-section',
      '.faq-section'
    ];
    
    for (const selector of sectionsToCheck) {
      const section = await page.$(selector);
      if (section) {
        const sectionText = await page.evaluate(el => el.textContent, section);
        const hasText = sectionText.trim().length > 0;
        console.log(`   ${selector}: ${hasText ? '✅ ZAWIERA TEKST' : '❌ PUSTY'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas testów języka:', error.message);
    await page.screenshot({ 
      path: 'test-screenshots/lang-error.png',
      fullPage: true 
    });
  }
  
  await browser.close();
  
  console.log('\\n🏁 PODSUMOWANIE TESTÓW JĘZYKA:');
  console.log('==============================');
  console.log('✅ Testy przełączania języka zakończone');
  console.log('📸 Screenshoty zapisane w test-screenshots/');
}

// Utwórz folder na screenshoty
const screenshotDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

testLanguageSwitching().catch(console.error);