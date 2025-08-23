const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testCompleteUserFlow() {
  console.log('🚀 SZCZEGÓŁOWY TEST COMPLETE USER FLOW');
  console.log('=====================================');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Monitor JS errors
  const jsErrors = [];
  const consoleMessages = [];
  
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    if (msg.type() === 'error') {
      jsErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    jsErrors.push(error.message);
  });
  
  try {
    console.log('📄 Krok 1: Ładowanie strony głównej...');
    await page.goto('http://localhost:3015', { waitUntil: 'networkidle2' });
    
    await page.screenshot({ 
      path: 'test-screenshots/flow-01-homepage.png',
      fullPage: true 
    });
    console.log('✅ Strona główna załadowana');
    
    console.log('📄 Krok 2: Test struktury HTML...');
    const header = await page.$('header[role="banner"]');
    const main = await page.$('main[role="main"]');
    const footer = await page.$('footer');
    
    console.log(`✅ Header: ${header ? 'OK' : 'BŁĄD'}`);
    console.log(`✅ Main: ${main ? 'OK' : 'BŁĄD'}`);
    console.log(`✅ Footer: ${footer ? 'OK' : 'BŁĄD'}`);
    
    console.log('📄 Krok 3: Kliknięcie głównego CTA...');
    // Próbuj różne selektory CTA
    let ctaClicked = false;
    const ctaSelectors = [
      '[data-testid="main-cta"]',
      '.nav-cta',
      '.hero-button.primary',
      '.testimonials-button',
      '.faq-button'
    ];
    
    for (const selector of ctaSelectors) {
      const button = await page.$(selector);
      if (button) {
        console.log(`🎯 Znaleziono przycisk: ${selector}`);
        
        // Sprawdź czy przycisk jest widoczny
        const isVisible = await button.isIntersectingViewport();
        if (!isVisible) {
          await button.scrollIntoView();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        await button.click();
        console.log('✅ Kliknięto przycisk CTA');
        ctaClicked = true;
        break;
      }
    }
    
    if (!ctaClicked) {
      console.log('❌ Nie znaleziono działającego przycisku CTA');
      await browser.close();
      return false;
    }
    
    console.log('📄 Krok 4: Sprawdzanie otwartego modalu...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Czas na animację
    
    // Sprawdź czy modal się otworzył
    const modalSelectors = [
      '.modal-overlay:not(.hidden)',
      '.modal-overlay.show',
      '[role="dialog"]',
      '.modal-content'
    ];
    
    let modal = null;
    for (const selector of modalSelectors) {
      modal = await page.$(selector);
      if (modal) {
        console.log(`✅ Modal otwarty: ${selector}`);
        break;
      }
    }
    
    if (!modal) {
      console.log('❌ Modal nie został otwarty');
      await page.screenshot({ path: 'test-screenshots/flow-error-no-modal.png' });
      await browser.close();
      return false;
    }
    
    await page.screenshot({ 
      path: 'test-screenshots/flow-02-modal-opened.png',
      fullPage: true 
    });
    
    console.log('📄 Krok 5: Test elementów formularza...');
    
    // Sprawdź czy formularz ma wszystkie wymagane pola
    const nameInput = await page.$('input[placeholder*="imię"], input[placeholder*="Imię"], input[name="name"]');
    const emailInput = await page.$('input[type="email"], input[placeholder*="email"]');
    const fileInput = await page.$('input[type="file"]');
    const dropZone = await page.$('.file-upload-zone');
    
    console.log(`✅ Pole imię: ${nameInput ? 'ZNALEZIONE' : '❌ BRAK'}`);
    console.log(`✅ Pole email: ${emailInput ? 'ZNALEZIONE' : '❌ BRAK'}`);
    console.log(`✅ Input plików: ${fileInput ? 'ZNALEZIONY' : '❌ BRAK'}`);
    console.log(`✅ Strefa drop: ${dropZone ? 'ZNALEZIONA' : '❌ BRAK'}`);
    
    // Wypełnij formularz jeśli pola istnieją
    if (nameInput && emailInput) {
      console.log('📄 Krok 6: Wypełnianie formularza...');
      await nameInput.click();
      await nameInput.type('Jan Testowy', { delay: 100 });
      
      await emailInput.click();
      await emailInput.type('jan.testowy@example.com', { delay: 100 });
      
      // Dodaj opis pracy opcjonalnie
      const jobInput = await page.$('textarea[placeholder*="opis"], textarea[placeholder*="ogłoszenie"], textarea');
      if (jobInput) {
        await jobInput.click();
        await jobInput.type('Szukamy doświadczonego programisty JavaScript z znajomością React', { delay: 50 });
        console.log('✅ Wypełniono opis pracy');
      }
      
      await page.screenshot({ 
        path: 'test-screenshots/flow-03-form-filled.png',
        fullPage: true 
      });
      console.log('✅ Formularz wypełniony');
      
      console.log('📄 Krok 7: Test przesyłania pliku...');
      
      // Stwórz testowy plik CV (prosty tekst)
      const testCVContent = `Jan Testowy
Programista JavaScript

DOŚWIADCZENIE:
- 3 lata jako Frontend Developer
- Praca z React, Vue.js
- Znajomość TypeScript

UMIEJĘTNOŚCI:
- JavaScript (ES6+)
- React, Redux
- HTML5, CSS3
- Git, npm/yarn

WYKSZTAŁCENIE:
- Informatyka, Politechnika Warszawska

JĘZYKI:
- Polski (natywny)
- Angielski (B2)`;
      
      const testCVPath = path.join(__dirname, 'test-cv.txt');
      fs.writeFileSync(testCVPath, testCVContent, 'utf8');
      
      if (fileInput) {
        await fileInput.uploadFile(testCVPath);
        console.log('✅ Plik CV został przesłany');
        
        // Zaczekaj na przetworzenie
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await page.screenshot({ 
          path: 'test-screenshots/flow-04-file-uploaded.png',
          fullPage: true 
        });
      }
      
      // Sprawdź czy jest przycisk do przejścia dalej/optymalizacji
      console.log('📄 Krok 8: Szukanie przycisku "Dalej/Optymalizuj"...');
      const nextButtons = await page.$$('button');
      let nextButtonFound = false;
      
      for (const button of nextButtons) {
        const text = await page.evaluate(el => el.textContent.trim(), button);
        if (text.includes('Dalej') || text.includes('Optymalizuj') || text.includes('Next') || text.includes('Kontynuuj')) {
          console.log(`✅ Znaleziono przycisk: "${text}"`);
          
          // Sprawdź czy przycisk nie jest zablokowany
          const isDisabled = await page.evaluate(el => el.disabled, button);
          if (!isDisabled) {
            await button.click();
            nextButtonFound = true;
            console.log('✅ Kliknięto przycisk dalej');
            break;
          } else {
            console.log(`⚠️ Przycisk "${text}" jest zablokowany`);
          }
        }
      }
      
      if (nextButtonFound) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ 
          path: 'test-screenshots/flow-05-next-step.png',
          fullPage: true 
        });
      }
      
      // Sprawdź czy została wyświetlona strona płatności lub kolejny krok
      const currentUrl = page.url();
      console.log(`📍 Aktualny URL: ${currentUrl}`);
      
      if (currentUrl.includes('checkout') || currentUrl.includes('stripe')) {
        console.log('✅ Przekierowanie do płatności - SUKCES!');
      } else {
        console.log('ℹ️ Pozostano w modalu lub przeszło do następnego kroku');
      }
      
      // Cleanup
      if (fs.existsSync(testCVPath)) {
        fs.unlinkSync(testCVPath);
      }
    }
    
    console.log('📄 Krok 9: Test responsywności...');
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.screenshot({ 
        path: `test-screenshots/flow-responsive-${viewport.name.toLowerCase()}.png`,
        fullPage: false 
      });
      console.log(`✅ Screenshot ${viewport.name} wykonany`);
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas testu:', error.message);
    await page.screenshot({ 
      path: 'test-screenshots/flow-error.png',
      fullPage: true 
    });
  }
  
  console.log('📋 PODSUMOWANIE:');
  console.log(`📊 Błędy JavaScript: ${jsErrors.length}`);
  if (jsErrors.length > 0) {
    jsErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  console.log(`📊 Wszystkie wiadomości konsoli: ${consoleMessages.length}`);
  
  await browser.close();
  return true;
}

// Utwórz folder na screenshoty
const screenshotDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

testCompleteUserFlow().catch(console.error);