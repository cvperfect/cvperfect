const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testPerformanceAndUX() {
  console.log('🚀 TEST WYDAJNOŚCI I UX');
  console.log('======================');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Monitor wszystkich wiadomości konsoli i błędów
  const jsErrors = [];
  const warnings = [];
  const networkFailures = [];
  const performanceMetrics = {};
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      jsErrors.push(text);
      console.log('❌ JS Error:', text);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
      console.log('⚠️ Warning:', text);
    }
  });
  
  page.on('pageerror', error => {
    jsErrors.push(error.message);
    console.log('❌ Page Error:', error.message);
  });
  
  page.on('requestfailed', request => {
    networkFailures.push(`${request.method()} ${request.url()} - ${request.failure().errorText}`);
    console.log(`❌ Network failure: ${request.url()}`);
  });
  
  try {
    console.log('📊 Test 1: Wydajność ładowania strony...');
    
    // Zmierz czas ładowania
    const startTime = Date.now();
    
    await page.goto('http://localhost:3015', { waitUntil: 'networkidle2' });
    
    const loadTime = Date.now() - startTime;
    performanceMetrics.pageLoadTime = loadTime;
    
    console.log(`⏱️ Czas ładowania strony: ${loadTime}ms`);
    
    // Sprawdź metryki wydajności
    const metrics = await page.metrics();
    performanceMetrics.jsHeapUsed = Math.round(metrics.JSHeapUsedSize / 1024 / 1024);
    performanceMetrics.jsHeapTotal = Math.round(metrics.JSHeapTotalSize / 1024 / 1024);
    performanceMetrics.domNodes = metrics.Nodes;
    performanceMetrics.jsEventListeners = metrics.JSEventListeners;
    
    console.log('📊 Metryki wydajności:');
    console.log(`   - Heap używany: ${performanceMetrics.jsHeapUsed}MB`);
    console.log(`   - Heap całkowity: ${performanceMetrics.jsHeapTotal}MB`);
    console.log(`   - Węzły DOM: ${performanceMetrics.domNodes}`);
    console.log(`   - Event listenery: ${performanceMetrics.jsEventListeners}`);
    
    // Test Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              resolve({
                lcp: entry.startTime,
                name: entry.name
              });
            }
          }
        }).observe({type: 'largest-contentful-paint', buffered: true});
        
        // Fallback po 3 sekundach
        setTimeout(() => resolve({lcp: null}), 3000);
      });
    });
    
    if (vitals.lcp) {
      performanceMetrics.largestContentfulPaint = Math.round(vitals.lcp);
      console.log(`📊 Largest Contentful Paint: ${performanceMetrics.largestContentfulPaint}ms`);
    }
    
    await page.screenshot({ 
      path: 'test-screenshots/performance-01-loaded.png',
      fullPage: true 
    });
    
    console.log('📊 Test 2: Responsywność i animacje...');
    
    // Test animacji podczas zmiany rozmiaru
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      const resizeStart = Date.now();
      
      await page.setViewport(viewport);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const resizeTime = Date.now() - resizeStart;
      console.log(`📱 ${viewport.name} (${viewport.width}x${viewport.height}): ${resizeTime}ms`);
      
      // Sprawdź czy wszystkie elementy są widoczne
      const elementsVisible = await page.evaluate(() => {
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        const footer = document.querySelector('footer');
        
        return {
          header: header ? header.offsetHeight > 0 : false,
          main: main ? main.offsetHeight > 0 : false,
          footer: footer ? footer.offsetHeight > 0 : false
        };
      });
      
      console.log(`   ✅ Elementy widoczne - Header: ${elementsVisible.header}, Main: ${elementsVisible.main}, Footer: ${elementsVisible.footer}`);
    }
    
    // Wróć do rozmiaru desktop
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📊 Test 3: Test animacji i interakcji...');
    
    // Test hover efektów na przyciskach
    const buttons = await page.$$('button, .nav-cta, .hero-button');
    console.log(`🔍 Znaleziono ${buttons.length} interaktywnych elementów`);
    
    if (buttons.length > 0) {
      const button = buttons[0];
      
      // Sprawdź stan przed hover
      const beforeHover = await page.evaluate(el => {
        const style = getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          transform: style.transform,
          opacity: style.opacity
        };
      }, button);
      
      // Hover
      await button.hover();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Sprawdź stan po hover
      const afterHover = await page.evaluate(el => {
        const style = getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          transform: style.transform,
          opacity: style.opacity
        };
      }, button);
      
      const hasHoverEffect = 
        beforeHover.backgroundColor !== afterHover.backgroundColor ||
        beforeHover.transform !== afterHover.transform ||
        beforeHover.opacity !== afterHover.opacity;
      
      console.log(`✅ Efekty hover: ${hasHoverEffect ? 'DZIAŁAJĄ' : 'BRAK'}`);
    }
    
    console.log('📊 Test 4: Test funkcjonalności modalu...');
    
    // Otwórz modal
    const ctaButton = await page.$('[data-testid=\"main-cta\"]');
    if (ctaButton) {
      const modalOpenStart = Date.now();
      
      await ctaButton.click();
      
      // Czekaj aż modal się pojawi
      try {
        await page.waitForSelector('.modal-overlay:not(.hidden)', { timeout: 3000 });
        const modalOpenTime = Date.now() - modalOpenStart;
        performanceMetrics.modalOpenTime = modalOpenTime;
        
        console.log(`⏱️ Czas otwierania modalu: ${modalOpenTime}ms`);
        
        // Test animacji zamykania modalu
        const closeButton = await page.$('.modal-close, .modal-overlay, [data-dismiss=\"modal\"]');
        if (closeButton) {
          const modalCloseStart = Date.now();
          
          // Kliknij w overlay żeby zamknąć modal
          await page.click('.modal-overlay');
          
          // Sprawdź czy modal zniknął
          try {
            await page.waitForSelector('.modal-overlay:not(.hidden)', { 
              hidden: true, 
              timeout: 3000 
            });
            
            const modalCloseTime = Date.now() - modalCloseStart;
            performanceMetrics.modalCloseTime = modalCloseTime;
            
            console.log(`⏱️ Czas zamykania modalu: ${modalCloseTime}ms`);
          } catch (e) {
            console.log('⚠️ Modal nie zamknął się lub animacja trwa dłużej niż 3s');
          }
        }
        
        await page.screenshot({ 
          path: 'test-screenshots/performance-02-modal-test.png',
          fullPage: true 
        });
        
      } catch (e) {
        console.log('❌ Modal nie otworzył się w czasie 3s');
      }
    }
    
    console.log('📊 Test 5: Test scrollowania i lazy loading...');
    
    // Test smooth scrolling
    const scrollStart = Date.now();
    
    // Scroll do footer
    await page.evaluate(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scrollTime = Date.now() - scrollStart;
    performanceMetrics.scrollTime = scrollTime;
    
    console.log(`⏱️ Czas scroll do footer: ${scrollTime}ms`);
    
    // Sprawdź czy są błędy po scrollowaniu
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Scroll z powrotem na górę
    await page.evaluate(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📊 Test 6: Stress test - multiple interactions...');
    
    // Otwórz i zamknij modal kilka razy szybko
    for (let i = 0; i < 5; i++) {
      const btn = await page.$('[data-testid=\"main-cta\"]');
      if (btn) {
        await btn.click();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Spróbuj zamknąć przez ESC
        await page.keyboard.press('Escape');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log('✅ Stress test zakończony');
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-screenshots/performance-03-final.png',
      fullPage: true 
    });
    
  } catch (error) {
    console.error('❌ Błąd podczas testów wydajności:', error.message);
    await page.screenshot({ 
      path: 'test-screenshots/performance-error.png',
      fullPage: true 
    });
  }
  
  await browser.close();
  
  // Podsumowanie
  console.log('\\n🏁 PODSUMOWANIE WYDAJNOŚCI I UX:');
  console.log('=================================');
  
  console.log('📊 Metryki wydajności:');
  Object.entries(performanceMetrics).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}${key.includes('Time') ? 'ms' : key.includes('Heap') ? 'MB' : ''}`);
  });
  
  console.log(`\\n❌ Błędy JavaScript: ${jsErrors.length}`);
  if (jsErrors.length > 0) {
    jsErrors.forEach((error, i) => {
      console.log(`   ${i+1}. ${error}`);
    });
  }
  
  console.log(`\\n⚠️ Ostrzeżenia: ${warnings.length}`);
  if (warnings.length > 0) {
    warnings.forEach((warning, i) => {
      console.log(`   ${i+1}. ${warning}`);
    });
  }
  
  console.log(`\\n🌐 Błędy sieci: ${networkFailures.length}`);
  if (networkFailures.length > 0) {
    networkFailures.forEach((failure, i) => {
      console.log(`   ${i+1}. ${failure}`);
    });
  }
  
  // Ocena wydajności
  const performanceScore = calculatePerformanceScore(performanceMetrics, jsErrors, networkFailures);
  console.log(`\\n🎯 OGÓLNA OCENA WYDAJNOŚCI: ${performanceScore}/100`);
  
  return {
    performanceMetrics,
    jsErrors,
    warnings,
    networkFailures,
    score: performanceScore
  };
}

function calculatePerformanceScore(metrics, errors, networkFailures) {
  let score = 100;
  
  // Odejmij za błędy JavaScript
  score -= errors.length * 10;
  
  // Odejmij za błędy sieci
  score -= networkFailures.length * 5;
  
  // Odejmij za wolne ładowanie
  if (metrics.pageLoadTime > 3000) {
    score -= 10;
  } else if (metrics.pageLoadTime > 2000) {
    score -= 5;
  }
  
  // Odejmij za wysokie użycie pamięci
  if (metrics.jsHeapUsed > 50) {
    score -= 10;
  } else if (metrics.jsHeapUsed > 30) {
    score -= 5;
  }
  
  // Odejmij za wolne modaly
  if (metrics.modalOpenTime > 1000) {
    score -= 5;
  }
  
  return Math.max(0, score);
}

// Utwórz folder na screenshoty
const screenshotDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir);
}

testPerformanceAndUX().catch(console.error);