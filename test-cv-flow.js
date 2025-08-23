// Test CV flow - sprawdzenie czy prawdziwe CV użytkownika jest wczytywane
const puppeteer = require('puppeteer');
const fs = require('fs');

const testCvFlow = async () => {
  console.log('🔍 Testing CV flow from upload to success page...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Pokaż przeglądarkę żeby zobaczyć co się dzieje
    slowMo: 500,
    devtools: true 
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // 1. Idź na stronę główną
    console.log('📍 1. Idę na stronę główną...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // 2. Sprawdź czy strona się załadowała
    const title = await page.title();
    console.log('📄 Tytuł strony:', title);
    
    // 3. Stwórz testowe CV (3+ strony)
    const testCV = `
JOHN DOE TESTOWY
john.doe@test.com
+48 123 456 789
Warszawa, Polska

PROFIL ZAWODOWY
================
Doświadczony Senior Software Developer z ponad 8-letnim doświadczeniem w tworzeniu aplikacji web i mobilnych. Specjalizuję się w technologiach JavaScript, React, Node.js oraz architekturze systemów rozproszonych. Pasjonat nowych technologii i metodologii Agile.

DOŚWIADCZENIE ZAWODOWE
======================

Senior Full Stack Developer | TechCorp Sp. z o.o. | 2020-2024
- Rozwój i utrzymanie aplikacji e-commerce obsługującej ponad 100k użytkowników dziennie
- Implementacja mikrousług w Node.js z wykorzystaniem Docker i Kubernetes
- Optymalizacja wydajności aplikacji frontendowych w React/Next.js
- Mentoring zespołu 3 junior developerów
- Współpraca z zespołami UX/UI w procesie projektowania interfejsów
- Implementacja systemów płatności online (Stripe, PayU, Przelewy24)
- Zarządzanie CI/CD pipeline z wykorzystaniem GitHub Actions
- Monitoring aplikacji z wykorzystaniem ELK Stack
Technologie: React, Next.js, Node.js, Express, PostgreSQL, Redis, Docker, AWS

Frontend Developer | StartupTech | 2018-2020
- Tworzenie responsywnych aplikacji Single Page w React i Vue.js
- Integracja z REST API i GraphQL endpoints
- Implementacja state management z wykorzystaniem Redux i Vuex
- Optymalizacja SEO dla aplikacji SPA
- Współpraca z zespołem backend w procesie projektowania API
- Implementacja testów jednostkowych i integracyjnych (Jest, Cypress)
- Code review i mentoring nowych członków zespołu
Technologie: React, Vue.js, TypeScript, SCSS, Webpack, Jest

Junior JavaScript Developer | WebAgency | 2016-2018
- Rozwój stron internetowych w vanilla JavaScript i jQuery
- Integracja z CMS (WordPress, Drupal)
- Tworzenie animacji CSS3 i JavaScript
- Optymalizacja wydajności stron internetowych
- Współpraca z zespołem graficznym przy implementacji projektów
- Nauka podstaw frameworków frontendowych
Technologie: HTML5, CSS3, JavaScript, jQuery, PHP, MySQL

WYKSZTAŁCENIE
=============
Magister Informatyki | Uniwersytet Warszawski | 2014-2016
- Specjalizacja: Inżynieria Oprogramowania
- Praca magisterska: "Optymalizacja wydajności aplikacji webowych"
- Średnia ocen: 4.8/5.0

Licencjat Informatyki | Politechnika Warszawska | 2011-2014
- Specjalizacja: Programowanie i Bazy Danych
- Praca licencjacka: "System zarządzania zadaniami w JavaScript"
- Średnia ocen: 4.6/5.0

UMIEJĘTNOŚCI TECHNICZNE
========================

Języki programowania:
- JavaScript (ES6+) - Expert
- TypeScript - Advanced
- Python - Intermediate
- Java - Intermediate
- PHP - Intermediate
- C++ - Basic

Frontend Technologies:
- React.js - Expert
- Next.js - Advanced
- Vue.js - Advanced
- Angular - Intermediate
- HTML5/CSS3 - Expert
- SCSS/SASS - Advanced
- Tailwind CSS - Advanced

Backend Technologies:
- Node.js - Expert
- Express.js - Expert
- Nest.js - Advanced
- Django - Intermediate
- Spring Boot - Intermediate

Bazy danych:
- PostgreSQL - Advanced
- MongoDB - Advanced
- Redis - Advanced
- MySQL - Intermediate
- Elasticsearch - Intermediate

DevOps & Tools:
- Docker - Advanced
- Kubernetes - Intermediate
- AWS (EC2, S3, RDS, Lambda) - Advanced
- GitHub Actions - Advanced
- Jenkins - Intermediate
- Nginx - Advanced

CERTYFIKATY I KURSY
===================
- AWS Certified Solutions Architect Associate (2023)
- Google Cloud Professional Developer (2022)
- React Advanced Patterns Workshop (2022)
- Kubernetes Administrator Certification (2021)
- Scrum Master Certification (2020)

PROJEKTY OSOBISTE
==================

E-commerce Platform "ShopFast" (2023)
- Full-stack aplikacja e-commerce w Next.js i Node.js
- Implementacja systemu płatności, zarządzania produktami i użytkownikami
- Mikrousługi w Docker, deployment na AWS
- Performance: 95+ Google PageSpeed Score
GitHub: https://github.com/johndoe/shopfast

Task Management App "TaskMaster" (2022)
- Real-time aplikacja do zarządzania zadaniami zespołowymi
- React frontend z Redux Toolkit
- Node.js backend z Socket.io
- PostgreSQL z Prisma ORM
GitHub: https://github.com/johndoe/taskmaster

Weather Analytics Dashboard (2021)
- Dashboard do analizy danych pogodowych
- Vue.js frontend z Chart.js
- Python backend z FastAPI
- Integracja z zewnętrznymi API pogodowymi
GitHub: https://github.com/johndoe/weather-dashboard

JĘZYKI
======
- Polski - ojczysty
- Angielski - C2 (Cambridge Certificate in Advanced English)
- Niemiecki - B1 (Goethe-Zertifikat)

ZAINTERESOWANIA
===============
- Programowanie open source
- Machine Learning i AI
- Fotografia krajobrazowa
- Wspinaczka skałkowa
- Podróże i odkrywanie nowych kultur
- Gra na gitarze
- Gotowanie kuchni azjatyckiej

DODATKOWE INFORMACJE
====================
- Prawo jazdy kategorii B
- Gotowość do podróży służbowych
- Elastyczność w zakresie pracy zdalnej/hybrydowej
- Doświadczenie w pracy z zespołami międzynarodowymi
- Aktywny udział w konferencjach tech (speaker na ReactWarsaw 2023)
- Mentor w programie "Programowanie dla Wszystkich"
- Wolontariusz w organizacji "Code for Good"

REFERENCJE
==========
Dostępne na żądanie wraz z portfolio projektów i przykładami kodu.

---

Ten CV zawiera ponad 1000 słów i 3 pełne strony treści, co pozwoli na dokładne przetestowanie systemu parsowania i optymalizacji AI. Wszystkie dane są fikcyjne i stworzone wyłącznie do celów testowych.
    `.trim();
    
    console.log('📄 Stworzone testowe CV o długości:', testCV.length, 'znaków');
    console.log('📄 Liczba linii:', testCV.split('\n').length);
    
    // 4. Sprawdź czy można znaleźć przycisk upload
    const uploadButtonSelector = 'button:contains("Prześlij CV"), button:contains("Upload"), input[type="file"], .upload-button, .file-upload';
    
    try {
      await page.waitForSelector('input[type="file"]', { timeout: 10000 });
      console.log('✅ Znaleziono input file');
      
      // Utwórz tymczasowy plik CV
      const cvFilePath = './temp-test-cv.txt';
      fs.writeFileSync(cvFilePath, testCV);
      
      // Wgraj plik
      const fileInput = await page.$('input[type="file"]');
      await fileInput.uploadFile(cvFilePath);
      console.log('✅ CV wgrane');
      
      // Usuń tymczasowy plik
      fs.unlinkSync(cvFilePath);
      
    } catch (error) {
      console.log('⚠️ Nie znaleziono standardowego input file, sprawdzam modal...');
      
      // Spróbuj kliknąć przycisk który otwiera modal upload
      const modalTriggers = [
        'button:has-text("Prześlij CV")',
        'button:has-text("Upload")', 
        '.upload-btn',
        '[data-modal="upload"]'
      ];
      
      for (const selector of modalTriggers) {
        try {
          await page.click(selector);
          console.log(`✅ Kliknięto: ${selector}`);
          await page.waitForTimeout(1000);
          
          // Teraz spróbuj znaleźć file input w modalu
          const modalFileInput = await page.$('input[type="file"]');
          if (modalFileInput) {
            const cvFilePath = './temp-test-cv.txt';
            fs.writeFileSync(cvFilePath, testCV);
            await modalFileInput.uploadFile(cvFilePath);
            fs.unlinkSync(cvFilePath);
            console.log('✅ CV wgrane przez modal');
            break;
          }
        } catch (err) {
          console.log(`⚠️ Selector ${selector} nie zadziałał:`, err.message);
        }
      }
    }
    
    // 5. Poczekaj na przetworzenie i idź dalej w procesie
    await page.waitForTimeout(3000);
    
    // 6. Sprawdź sessionStorage po upload
    const sessionData = await page.evaluate(() => {
      return {
        pendingCV: sessionStorage.getItem('pendingCV')?.substring(0, 200) + '...',
        pendingEmail: sessionStorage.getItem('pendingEmail'),
        pendingJob: sessionStorage.getItem('pendingJob'),
        pendingPlan: sessionStorage.getItem('pendingPlan')
      };
    });
    
    console.log('📝 SessionStorage po upload:', sessionData);
    
    // 7. Zrób screenshot
    await page.screenshot({ path: 'test-cv-upload.png', fullPage: true });
    console.log('📸 Screenshot zapisany: test-cv-upload.png');
    
    console.log('✅ Test zakończony - sprawdź screenshot i logi');
    
  } catch (error) {
    console.error('❌ Błąd testu:', error);
    try {
      await page.screenshot({ path: 'test-error.png', fullPage: true });
    } catch (screenshotError) {
      console.error('❌ Nie można zrobić screenshota:', screenshotError);
    }
  } finally {
    await browser.close();
  }
};

testCvFlow().catch(console.error);