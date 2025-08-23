const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runComprehensiveTests() {
  console.log('🚀 Rozpoczynam kompleksowe testy CvPerfect...');
  
  const browser = await puppeteer.launch({
    headless: false, // Pokaż przeglądarkę żeby zobaczyć co się dzieje
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📄 Test 1: Podstawowe ładowanie strony...');
    
    // Monitoruj błędy JavaScript
    const jsErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        jsErrors.push(msg.text());
        console.log('❌ Błąd JS:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
      console.log('❌ Błąd strony:', error.message);
    });
    
    // Załaduj stronę
    console.log('⏳ Ładuję stronę localhost:3015...');
    await page.goto('http://localhost:3015', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Zrób screenshot strony głównej
    await page.screenshot({ 
      path: 'test-screenshots/01-homepage.png',
      fullPage: true 
    });
    console.log('📸 Screenshot strony głównej: test-screenshots/01-homepage.png');
    
    // Test 1: Sprawdź strukturę HTML
    console.log('🔍 Test struktury HTML...');
    const hasHeader = await page.$('header[role="banner"]');
    const hasMain = await page.$('main[role="main"]');
    const hasFooter = await page.$('footer');
    
    console.log('✅ Header:', hasHeader ? 'ZNALEZIONY' : '❌ BRAK');
    console.log('✅ Main:', hasMain ? 'ZNALEZIONY' : '❌ BRAK');
    console.log('✅ Footer:', hasFooter ? 'ZNALEZIONY' : '❌ BRAK');
    
    // Test 2: Sprawdź działanie przycisku CTA
    console.log('🔍 Test głównego przycisku CTA...');
    await page.waitForSelector('.cta-button', { timeout: 10000 });
    const ctaButton = await page.$('.cta-button');
    if (ctaButton) {
      console.log('✅ Przycisk CTA znaleziony');
      await ctaButton.click();
      await page.waitForTimeout(2000);
      
      // Sprawdź czy modal się otworzył
      const modal = await page.$('.modal-overlay:not(.hidden)');
      console.log('✅ Modal po kliknięciu CTA:', modal ? 'OTWARTY' : '❌ NIE OTWARŁ SIĘ');
      
      if (modal) {
        await page.screenshot({ 
          path: 'test-screenshots/02-modal-opened.png',
          fullPage: true 
        });
        console.log('📸 Screenshot otwartego modalu: test-screenshots/02-modal-opened.png');
        
        // Test 3: Sprawdź pole upload plików
        console.log('🔍 Test pola upload plików...');
        const fileInput = await page.$('input[type="file"]');
        const dropZone = await page.$('.file-upload-zone');
        
        console.log('✅ Input plików:', fileInput ? 'ZNALEZIONY' : '❌ BRAK');
        console.log('✅ Strefa drop:', dropZone ? 'ZNALEZIONA' : '❌ BRAK');
        
        // Test 4: Sprawdź formularz w modalu
        const nameInput = await page.$('input[name="name"], input[placeholder*="imię"], input[placeholder*="Imię"]');
        const emailInput = await page.$('input[type="email"], input[placeholder*="email"]');
        
        console.log('✅ Pole imię:', nameInput ? 'ZNALEZIONE' : '❌ BRAK');
        console.log('✅ Pole email:', emailInput ? 'ZNALEZIONE' : '❌ BRAK');
        
        // Wypełnij formularz testowo
        if (nameInput && emailInput) {
          await nameInput.type('Jan Testowy');
          await emailInput.type('test@example.com');
          
          await page.screenshot({ 
            path: 'test-screenshots/03-form-filled.png',
            fullPage: true 
          });
          console.log('📸 Screenshot wypełnionego formularza: test-screenshots/03-form-filled.png');
        }
      }
    }
    
    // Test 5: Test responsywności
    console.log('📱 Test responsywności...');
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `test-screenshots/04-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      });
      console.log(`📸 Screenshot ${viewport.name}: test-screenshots/04-${viewport.name.toLowerCase()}.png`);
    }
    
    // Test 6: Test przełączania języków
    console.log('🌍 Test przełączania języków...');
    await page.setViewport({ width: 1920, height: 1080 }); // Wróć do desktop
    
    const langButton = await page.$('.language-switch, button[data-lang]');
    if (langButton) {
      await langButton.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'test-screenshots/05-language-switched.png',
        fullPage: true 
      });
      console.log('📸 Screenshot po przełączeniu języka: test-screenshots/05-language-switched.png');
    }
    
    // Test 7: Sprawdź wydajność (czas ładowania)
    console.log('⚡ Test wydajności...');
    const metrics = await page.metrics();
    console.log('📊 Metryki wydajności:');
    console.log(`   - JSEventListeners: ${metrics.JSEventListeners}`);
    console.log(`   - Nodes: ${metrics.Nodes}`);
    console.log(`   - JSHeapUsedSize: ${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`);
    
    // Podsumowanie błędów JavaScript
    console.log('📋 Podsumowanie błędów JavaScript:');
    if (jsErrors.length === 0) {
      console.log('✅ Brak błędów JavaScript!');
    } else {
      console.log(`❌ Znaleziono ${jsErrors.length} błędów:`);
      jsErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('✅ Test 1 (Struktura i podstawowe funkcje) ZAKOŃCZONY');
    
  } catch (error) {
    console.error('❌ Błąd podczas testów:', error.message);
    await page.screenshot({ 
      path: 'test-screenshots/error.png',
      fullPage: true 
    });
  }
  
  await browser.close();
  return true;
}

async function testAPIEndpoints() {
  console.log('🔍 Test 2: Testowanie API endpoints...');
  
  const fetch = require('node-fetch');
  const FormData = require('form-data');
  
  try {
    // Test /api/demo-optimize
    console.log('🚀 Test /api/demo-optimize...');
    const demoResponse = await fetch('http://localhost:3015/api/demo-optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cvContent: 'Jan Kowalski, programista JavaScript z 3 lata doświadczenia',
        jobDescription: 'Szukamy doświadczonego programisty React'
      })
    });
    
    if (demoResponse.ok) {
      const demoResult = await demoResponse.json();
      console.log('✅ /api/demo-optimize działa poprawnie');
      console.log(`   Response status: ${demoResponse.status}`);
    } else {
      console.log(`❌ /api/demo-optimize błąd: ${demoResponse.status}`);
    }
    
    // Test /api/create-checkout-session
    console.log('🚀 Test /api/create-checkout-session...');
    const checkoutResponse = await fetch('http://localhost:3015/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planType: 'gold',
        email: 'test@example.com'
      })
    });
    
    console.log(`   /api/create-checkout-session status: ${checkoutResponse.status}`);
    if (checkoutResponse.status === 200) {
      console.log('✅ Stripe checkout endpoint działa');
    } else {
      console.log('❌ Problem ze Stripe endpoint');
    }
    
    console.log('✅ Test 2 (API Endpoints) ZAKOŃCZONY');
    
  } catch (error) {
    console.error('❌ Błąd testowania API:', error.message);
  }
}

async function runAllTests() {
  // Utwórz folder na screenshoty
  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }
  
  console.log('🎯 KOMPLEKSOWE TESTY CVPERFECT - START');
  console.log('=====================================');
  
  await runComprehensiveTests();
  await testAPIEndpoints();
  
  console.log('=====================================');
  console.log('🏁 WSZYSTKIE TESTY ZAKOŃCZONE');
  console.log('');
  console.log('📸 Screenshoty zapisane w folderze: test-screenshots/');
  console.log('📋 Sprawdź logi powyżej dla szczegółowego raportu');
}

runAllTests().catch(console.error);