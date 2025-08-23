// Complete flow test - CV upload → Payment → Success page verification
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test CV with 3+ pages of content
const testCV = `KONRAD TESTOWY CZUPACKI
konrad.test@gmail.com
+48 600 700 800
Warszawa, Polska

PROFIL ZAWODOWY
================
Doświadczony Full Stack Developer z 10-letnim doświadczeniem w tworzeniu zaawansowanych aplikacji webowych. 
Specjalizuję się w technologiach React, Node.js, Python oraz architekturze mikrousługowej.
Pasjonat nowych technologii i metodologii DevOps.

DOŚWIADCZENIE ZAWODOWE
======================

Lead Full Stack Developer | TechGiant Sp. z o.o. | 2020-2024
- Prowadzenie zespołu 8 developerów w projekcie platformy e-commerce (500k+ użytkowników)
- Implementacja architektury mikrousługowej z użyciem Kubernetes i Docker
- Optymalizacja wydajności aplikacji React/Next.js (wzrost performance o 40%)
- Wdrożenie systemu CI/CD z użyciem Jenkins i GitHub Actions
- Mentoring junior i mid developerów
- Współpraca z działem biznesowym w planowaniu roadmapy produktu
Technologie: React, Next.js, Node.js, Python, PostgreSQL, Redis, Kubernetes, AWS

Senior Software Engineer | StartupHub | 2017-2020  
- Rozwój platformy SaaS dla branży fintech
- Implementacja systemów płatności (Stripe, PayPal, przelewy24)
- Projektowanie i rozwój REST API oraz GraphQL
- Implementacja systemu autoryzacji OAuth2
- Optymalizacja zapytań bazodanowych (redukcja czasu odpowiedzi o 60%)
Technologie: Vue.js, Node.js, MongoDB, Docker, GCP

Full Stack Developer | WebSolutions | 2014-2017
- Tworzenie aplikacji webowych dla klientów korporacyjnych
- Integracja z zewnętrznymi API (SAP, Salesforce)
- Rozwój systemów CMS na bazie WordPress i Drupal
- Implementacja responsywnych interfejsów użytkownika
Technologie: JavaScript, PHP, MySQL, jQuery, Bootstrap

WYKSZTAŁCENIE
=============
Magister Informatyki | Politechnika Warszawska | 2012-2014
- Specjalizacja: Systemy Rozproszone
- Praca magisterska: "Optymalizacja algorytmów rozproszonego przetwarzania danych"
- Średnia ocen: 4.9/5.0

Inżynier Informatyki | Uniwersytet Warszawski | 2009-2012
- Specjalizacja: Inżynieria Oprogramowania  
- Praca inżynierska: "System zarządzania projektami w metodologii Scrum"
- Średnia ocen: 4.7/5.0

UMIEJĘTNOŚCI TECHNICZNE
========================

Języki programowania:
- JavaScript/TypeScript - Expert (10 lat)
- Python - Advanced (6 lat)
- Java - Advanced (5 lat)  
- Go - Intermediate (3 lata)
- Rust - Intermediate (2 lata)
- C++ - Basic (1 rok)

Frontend:
- React.js - Expert (7 lat)
- Next.js - Expert (5 lat)
- Vue.js - Advanced (4 lata)
- Angular - Intermediate (3 lata)
- Svelte - Intermediate (2 lata)

Backend:
- Node.js - Expert (8 lat)
- Express.js - Expert (8 lat)
- Django - Advanced (5 lat)
- FastAPI - Advanced (4 lata)
- Spring Boot - Intermediate (3 lata)

Bazy danych:
- PostgreSQL - Expert (8 lat)
- MongoDB - Advanced (6 lat)
- Redis - Advanced (5 lat)
- Elasticsearch - Intermediate (4 lata)
- Cassandra - Basic (2 lata)

DevOps & Cloud:
- Docker - Expert (6 lat)
- Kubernetes - Advanced (4 lata)
- AWS - Advanced (5 lat)
- GCP - Intermediate (3 lata)
- Azure - Basic (2 lata)
- CI/CD (Jenkins, GitHub Actions) - Advanced

CERTYFIKATY
===========
- AWS Certified Solutions Architect Professional (2023)
- Kubernetes Certified Administrator (2022)
- Google Cloud Professional Cloud Architect (2022)
- Microsoft Azure Fundamentals (2021)
- Scrum Master Certification (2020)
- React Advanced Certification (2019)

PROJEKTY OPEN SOURCE
====================

ReactFormBuilder (2023)
- Biblioteka do dynamicznego generowania formularzy w React
- 2000+ gwiazdek na GitHub
- Używana przez 50+ firm
GitHub: github.com/konradtest/react-form-builder

PythonMicroservices (2022)
- Framework do budowy mikrousług w Python
- Integracja z Kubernetes i Docker
- Automatyczna dokumentacja API
GitHub: github.com/konradtest/python-microservices

NodeTaskQueue (2021)
- System kolejkowania zadań dla Node.js
- Wsparcie dla Redis i RabbitMQ
- Monitoring i dashboard
GitHub: github.com/konradtest/node-task-queue

JĘZYKI
======
- Polski - ojczysty
- Angielski - C2 (fluent)
- Niemiecki - B2 (intermediate)
- Hiszpański - A2 (basic)

ZAINTERESOWANIA
===============
- Kontrybutor open source (top 5% na GitHub)
- Prelegent na konferencjach tech (JSConf, PyConf)
- Mentor w programie Google Summer of Code
- Fotografia analogowa
- Bieganie maratonów
- Szachy (ranking 1800 ELO)

DODATKOWE OSIĄGNIĘCIA
=====================
- Speaker na ReactConf 2023 - "Optimizing React Performance at Scale"
- Autor artykułów technicznych na Medium (10k+ obserwujących)
- Zwycięzca hackathonu HackWarsaw 2022
- Mentor w TechLeaders Academy
- Organizator Warsaw JavaScript Meetup

REFERENCJE
==========
Dostępne na żądanie. Portfolio projektów: konradtest.dev

---
Ten CV zawiera ponad 1000 słów i wypełnia 3+ strony A4.
`;

async function testCompleteFlow() {
  console.log('🚀 Starting complete flow test...');
  console.log('📝 CV length:', testCV.length, 'characters');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    args: ['--window-size=1920,1080']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Step 1: Go to main page
    console.log('\n📍 Step 1: Loading main page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(2000);
    
    // Step 2: Click "Sprawdź swoje CV" button
    console.log('\n📍 Step 2: Opening CV modal...');
    try {
      // Try different selectors for the main CTA button
      const ctaSelectors = [
        'button:has-text("Sprawdź swoje CV")',
        'button.cta-button',
        '.hero-cta button',
        'button[class*="primary"]'
      ];
      
      let clicked = false;
      for (const selector of ctaSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            await button.click();
            clicked = true;
            console.log('✅ Clicked button with selector:', selector);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!clicked) {
        // Fallback: click by text content
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const targetButton = buttons.find(btn => 
            btn.textContent.includes('Sprawdź') || 
            btn.textContent.includes('CV')
          );
          if (targetButton) targetButton.click();
        });
      }
      
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('⚠️ Could not find CTA button, trying alternative approach...');
      // Alternative: directly show the modal
      await page.evaluate(() => {
        if (window.setShowCvModal) {
          window.setShowCvModal(true);
        }
      });
    }
    
    // Step 3: Upload CV
    console.log('\n📍 Step 3: Uploading CV...');
    
    // First check if modal is open
    const modalVisible = await page.evaluate(() => {
      const modal = document.querySelector('.modal-overlay, .cv-modal, [class*="modal"]');
      return modal && window.getComputedStyle(modal).display !== 'none';
    });
    
    console.log('Modal visible:', modalVisible);
    
    // Create temp file with test CV
    const cvFilePath = path.join(__dirname, 'temp-test-cv.txt');
    fs.writeFileSync(cvFilePath, testCV);
    
    // Find file input
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(cvFilePath);
      console.log('✅ CV file uploaded');
      await page.waitForTimeout(2000);
      
      // Check if CV was processed
      const cvProcessed = await page.evaluate(() => {
        return sessionStorage.getItem('pendingCV') || 
               localStorage.getItem('cvContent') ||
               (window.cvContent && window.cvContent.length > 0);
      });
      
      if (cvProcessed) {
        console.log('✅ CV processed, length:', cvProcessed.length);
      } else {
        console.log('⚠️ CV may not have been processed');
      }
    } else {
      console.log('❌ Could not find file input');
    }
    
    // Step 4: Fill email
    console.log('\n📍 Step 4: Filling email...');
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await emailInput.type('konrad.test@example.com');
      console.log('✅ Email filled');
    }
    
    // Step 5: Select plan and go to payment
    console.log('\n📍 Step 5: Selecting basic plan...');
    
    // Try to find and click basic plan button
    const planSelectors = [
      'button:has-text("Wybierz Basic")',
      'button:has-text("19.99")',
      '[data-plan="basic"]',
      '.plan-card:first-of-type button'
    ];
    
    for (const selector of planSelectors) {
      try {
        const planButton = await page.$(selector);
        if (planButton) {
          await planButton.click();
          console.log('✅ Clicked plan button');
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    await page.waitForTimeout(3000);
    
    // Check if redirected to Stripe
    const currentUrl = page.url();
    if (currentUrl.includes('stripe.com') || currentUrl.includes('checkout')) {
      console.log('✅ Redirected to Stripe checkout:', currentUrl);
      
      // Take screenshot of Stripe page
      await page.screenshot({ 
        path: 'test-stripe-checkout.png', 
        fullPage: true 
      });
      
      console.log('\n📸 Screenshot saved: test-stripe-checkout.png');
      console.log('\n⚠️ Manual payment required in Stripe checkout');
      console.log('Please complete the payment manually and check the success page');
      
    } else {
      console.log('❌ Not redirected to Stripe. Current URL:', currentUrl);
      
      // Check for errors in console
      const errors = await page.evaluate(() => {
        const logs = [];
        if (window.console && window.console.logs) {
          logs.push(...window.console.logs);
        }
        return logs;
      });
      
      if (errors.length > 0) {
        console.log('Console errors:', errors);
      }
      
      // Take screenshot of current state
      await page.screenshot({ 
        path: 'test-payment-error.png', 
        fullPage: true 
      });
      console.log('📸 Error screenshot saved: test-payment-error.png');
    }
    
    // Step 6: Check sessionStorage
    console.log('\n📍 Step 6: Checking data persistence...');
    const sessionData = await page.evaluate(() => {
      return {
        pendingCV: sessionStorage.getItem('pendingCV')?.substring(0, 100) + '...',
        pendingEmail: sessionStorage.getItem('pendingEmail'),
        pendingPlan: sessionStorage.getItem('pendingPlan'),
        fullSessionId: sessionStorage.getItem('fullSessionId')
      };
    });
    
    console.log('📝 SessionStorage data:', sessionData);
    
    // Clean up temp file
    fs.unlinkSync(cvFilePath);
    
    console.log('\n✅ Test completed. Please check screenshots and complete payment manually.');
    
  } catch (error) {
    console.error('❌ Test error:', error);
    
    // Take error screenshot
    try {
      await page.screenshot({ 
        path: 'test-error-state.png', 
        fullPage: true 
      });
      console.log('📸 Error screenshot saved: test-error-state.png');
    } catch (e) {
      console.log('Could not take screenshot');
    }
  } finally {
    // Keep browser open for manual inspection
    console.log('\n⏸️ Browser kept open for manual inspection. Close manually when done.');
    // await browser.close();
  }
}

// Run the test
testCompleteFlow().catch(console.error);