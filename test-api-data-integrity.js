const fs = require('fs');
const path = require('path');

// Test script to verify API data integrity and CV processing flow
async function testAPIDataIntegrity() {
  console.log('🔍 Testing API Data Integrity and CV Processing Flow...');
  console.log('=' .repeat(60));
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    criticalFindings: [],
    dataFlow: {
      parsing: null,
      sessionStorage: null,
      sessionRetrieval: null,
      aiProcessing: null
    }
  };

  const baseURL = 'http://localhost:3006';
  
  // Sample CV with comprehensive content including potential photo indicators
  const comprehensiveCV = `CURRICULUM VITAE

Jan Kowalski
Email: jan.kowalski@example.com
Telefon: +48 123 456 789
Adres: ul. Przykładowa 123, 00-000 Warszawa
LinkedIn: linkedin.com/in/jankowalski
GitHub: github.com/jankowalski

[ZDJĘCIE PROFILOWE - IMG_001.jpg]

PROFIL ZAWODOWY
Doświadczony Senior Full-Stack Developer z ponad 6-letnim doświadczeniem w tworzeniu skalowalnych aplikacji webowych. Specjalista w zakresie technologii React, Node.js i Python. Lider zespołów programistycznych, mentor młodszych deweloperów. Pasjonat clean code i najlepszych praktyk w programowaniu.

DOŚWIADCZENIE ZAWODOWE

Senior Full-Stack Developer | TechCorp Poland Sp. z o.o.
Warszawa | 03/2020 - obecnie (4 lata)
• Rozwój i utrzymanie platformy e-commerce obsługującej 100,000+ użytkowników miesięcznie
• Implementacja mikrousług w Node.js zwiększająca wydajność systemu o 40%
• Liderowanie zespołu 8 deweloperów w projektach o wartości 2,5 mln PLN
• Wdrożenie systemu CI/CD redukującego czas deploymentu o 60%
• Optymalizacja bazy danych PostgreSQL poprawiająca czasy odpowiedzi o 35%
• Mentoring 12 junior developerów, z czego 8 otrzymało awanse
• Współpraca z Product Ownerami w metodologii Agile/Scrum

Mid-Level Developer | StartupXYZ
Kraków | 08/2018 - 02/2020 (1.5 roku)
• Rozwój Progressive Web App w React.js obsługującej 50,000+ aktywnych użytkowników
• Budowanie REST API w Python/Django z obsługą 1M+ requestów dziennie
• Implementacja systemu płatności (Stripe, PayU) z 99.9% uptime
• Współtworzenie architektury mikroserwisowej w Docker/Kubernetes
• Redukcja kosztów infrastruktury AWS o 30% poprzez optymalizację zasobów

Junior Developer | WebDev Agency
Gdańsk | 06/2017 - 07/2018 (1 rok)
• Tworzenie responsywnych stron internetowych w HTML5/CSS3/JavaScript
• Rozwój aplikacji CMS w PHP/Laravel dla 20+ klientów
• Integracja systemów CRM i analityki (Google Analytics, Salesforce)
• Wsparcie techniczne i szkolenia dla klientów

WYKSZTAŁCENIE

Magister Inżynier - Informatyka i Systemy Informacyjne
Politechnika Warszawska | 2015-2017
Praca magisterska: "Optymalizacja wydajności aplikacji webowych przy użyciu machine learning"
Średnia ocen: 4.8/5.0

Inżynier - Informatyka
Uniwersytet Gdański | 2012-2015  
Praca inżynierska: "System zarządzania projektami w technologii MEAN Stack"
Średnia ocen: 4.6/5.0

UMIEJĘTNOŚCI TECHNICZNE

Frontend Development:
• JavaScript (ES6+), TypeScript - poziom ekspert
• React.js, Redux, Next.js - poziom ekspert
• Vue.js, Angular - poziom zaawansowany
• HTML5, CSS3, SASS, Styled Components - poziom ekspert
• Responsive Web Design, PWA - poziom ekspert

Backend Development:
• Node.js, Express.js - poziom ekspert  
• Python, Django, Flask - poziom zaawansowany
• PHP, Laravel - poziom średnio-zaawansowany
• REST API, GraphQL - poziom ekspert
• Microservices Architecture - poziom zaawansowany

Bazy Danych:
• PostgreSQL, MySQL - poziom zaawansowany
• MongoDB, Redis - poziom zaawansowany
• Elasticsearch - poziom podstawowy
• Database Optimization, Query Tuning - poziom zaawansowany

DevOps i Narzędzia:
• Docker, Kubernetes - poziom zaawansowany
• AWS (EC2, S3, Lambda, RDS) - poziom zaawansowany
• CI/CD (Jenkins, GitHub Actions) - poziom zaawansowany
• Nginx, Apache - poziom średnio-zaawansowany
• Git, Jira, Confluence - poziom ekspert

JĘZYKI OBCE
• Angielski - poziom C1 (Cambridge Certificate, 2019)
• Niemiecki - poziom B2 (Goethe Institute, 2018)
• Hiszpański - poziom A2 (podstawowy)

CERTYFIKATY I SZKOLENIA
• AWS Certified Developer Associate (2022)
• Certified ScrumMaster (CSM) - Scrum Alliance (2021)
• Google Cloud Professional Developer (2021)
• Docker Certified Associate (2020)
• React Developer Certificate - Meta (2020)
• Advanced JavaScript Certificate - Udemy (2019)

PROJEKTY OSOBISTE I OPEN SOURCE

E-Commerce Platform "ShopMaster" (2022)
• Full-stack aplikacja w React/Node.js z mikrousługami
• 10,000+ zarejestrowanych użytkowników, 500+ transakcji miesięcznie
• Integracja z Stripe, PayPal, systemem magazynowym
• Wykorzystane technologie: React, Node.js, PostgreSQL, Redis, Docker

Task Management System "TaskFlow" (2021)  
• Progressive Web App z offline-first approach
• Real-time collaboration poprzez WebSocket
• 2,000+ aktywnych użytkowników
• Technologie: Vue.js, Socket.io, MongoDB, PWA

Open Source Contributions:
• Contributor w React Router (15+ merged PR)
• Maintainer biblioteki "easy-forms-validation" (500+ stars GitHub)
• Częsty contributor w projektach Node.js ecosystem

OSIĄGNIĘCIA I NAGRODY
• Employee of the Year 2022 - TechCorp Poland
• Hackathon Warsaw Winner 2021 - kategoria "Best Technical Solution"
• Speaker na konferencji DevMeeting 2021 - "Microservices Best Practices"
• Mentor roku 2020 w programie "IT Career Boost"

ZAINTERESOWANIA
• Fotografia cyfrowa (specjalizacja: fotografia krajobrazowa)
• Podróże (odwiedzone 25 krajów, dokumentacja fotograficzna)  
• Sporty górskie (wspinaczka, trekking, narciarstwo)
• Programowanie w wolnym czasie (contributing do open source)
• Gotowanie (specjalizacja: kuchnia azjatycka)
• Czytanie literatury technicznej i sci-fi`;

  console.log('📊 Sample CV Stats:');
  console.log(`   Length: ${comprehensiveCV.length} characters`);
  console.log(`   Word count: ${comprehensiveCV.split(/\s+/).length} words`);
  console.log(`   Has photo reference: ${comprehensiveCV.includes('[ZDJĘCIE') ? 'YES' : 'NO'}`);
  console.log('');

  // TEST 1: CV Parsing API
  console.log('🔄 TEST 1: CV Parsing API (/api/parse-cv)');
  try {
    const FormData = require('form-data');
    const fetch = require('node-fetch');
    
    const form = new FormData();
    form.append('cv', comprehensiveCV, {
      filename: 'test-cv.txt',
      contentType: 'text/plain'
    });

    const parseResponse = await fetch(`${baseURL}/api/parse-cv`, {
      method: 'POST',
      body: form
    });

    const parseResult = await parseResponse.json();
    
    results.dataFlow.parsing = {
      status: parseResponse.status,
      success: parseResult.success,
      originalLength: comprehensiveCV.length,
      extractedLength: parseResult.extractedText?.length || 0,
      photoDetected: parseResult.hasPhoto,
      wordCount: parseResult.wordCount,
      metadata: parseResult.metadata
    };
    
    const dataLossPercentage = parseResult.extractedText ? 
      ((comprehensiveCV.length - parseResult.extractedText.length) / comprehensiveCV.length * 100).toFixed(2) : 100;
    
    console.log(`   ✅ Status: ${parseResponse.status}`);
    console.log(`   ✅ Success: ${parseResult.success}`);
    console.log(`   📏 Original length: ${comprehensiveCV.length} chars`);
    console.log(`   📏 Extracted length: ${parseResult.extractedText?.length || 0} chars`);
    console.log(`   📉 Data loss: ${dataLossPercentage}%`);
    console.log(`   📷 Photo detected: ${parseResult.hasPhoto ? 'YES' : 'NO'}`);
    console.log(`   📝 Word count: ${parseResult.wordCount}`);
    
    if (dataLossPercentage > 0) {
      results.criticalFindings.push({
        severity: 'HIGH',
        issue: 'CV Parsing Data Loss',
        details: `${dataLossPercentage}% of CV content lost during parsing`,
        impact: 'AI will receive incomplete CV data for optimization'
      });
    }
    
    results.tests.push({
      name: 'CV Parsing API',
      status: parseResult.success ? 'PASSED' : 'FAILED',
      dataIntegrity: dataLossPercentage < 1 ? 'PERFECT' : 'COMPROMISED'
    });
    
  } catch (parseError) {
    console.log(`   ❌ ERROR: ${parseError.message}`);
    results.tests.push({
      name: 'CV Parsing API',
      status: 'ERROR',
      error: parseError.message
    });
  }

  console.log('');

  // TEST 2: Session Storage API
  console.log('🔄 TEST 2: Session Storage API (/api/save-session)');
  const sessionId = 'test-session-' + Date.now();
  const sessionData = {
    sessionId: sessionId,
    cvData: comprehensiveCV,
    jobPosting: 'Senior Full-Stack Developer position requiring React, Node.js, and AWS experience',
    email: 'test@cvperfect.pl',
    plan: 'premium',
    template: 'tech',
    photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/test-photo-data...'
  };

  try {
    const fetch = require('node-fetch');
    
    const saveResponse = await fetch(`${baseURL}/api/save-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });

    const saveResult = await saveResponse.json();
    
    results.dataFlow.sessionStorage = {
      status: saveResponse.status,
      success: saveResult.success,
      sessionId: saveResult.sessionId,
      dataLength: saveResult.dataLength,
      originalLength: comprehensiveCV.length
    };
    
    console.log(`   ✅ Status: ${saveResponse.status}`);
    console.log(`   ✅ Success: ${saveResult.success}`);
    console.log(`   📏 Stored data length: ${saveResult.dataLength} chars`);
    console.log(`   📏 Original length: ${comprehensiveCV.length} chars`);
    console.log(`   🆔 Session ID: ${saveResult.sessionId}`);
    
    if (saveResult.dataLength !== comprehensiveCV.length) {
      results.criticalFindings.push({
        severity: 'CRITICAL',
        issue: 'Session Storage Data Truncation',
        details: `Expected ${comprehensiveCV.length} chars, stored ${saveResult.dataLength} chars`,
        impact: 'Complete CV data not preserved for AI processing'
      });
    }
    
    results.tests.push({
      name: 'Session Storage API',
      status: saveResult.success ? 'PASSED' : 'FAILED',
      dataIntegrity: saveResult.dataLength === comprehensiveCV.length ? 'PERFECT' : 'COMPROMISED'
    });
    
  } catch (saveError) {
    console.log(`   ❌ ERROR: ${saveError.message}`);
    results.tests.push({
      name: 'Session Storage API',
      status: 'ERROR',
      error: saveError.message
    });
  }

  console.log('');

  // TEST 3: Session Retrieval API
  console.log('🔄 TEST 3: Session Retrieval API (/api/get-session-data)');
  try {
    const fetch = require('node-fetch');
    
    const getResponse = await fetch(`${baseURL}/api/get-session-data?session_id=${sessionId}`);
    const getResult = await getResponse.json();
    
    const retrievedCVLength = getResult.session?.metadata?.cv?.length || 0;
    const photoPreserved = !!getResult.session?.metadata?.photo;
    
    results.dataFlow.sessionRetrieval = {
      status: getResponse.status,
      success: getResult.success,
      retrievedLength: retrievedCVLength,
      originalLength: comprehensiveCV.length,
      photoPreserved: photoPreserved,
      fullSession: getResult.session
    };
    
    const retrievalDataLoss = ((comprehensiveCV.length - retrievedCVLength) / comprehensiveCV.length * 100).toFixed(2);
    
    console.log(`   ✅ Status: ${getResponse.status}`);
    console.log(`   ✅ Success: ${getResult.success}`);
    console.log(`   📏 Retrieved CV length: ${retrievedCVLength} chars`);
    console.log(`   📏 Original length: ${comprehensiveCV.length} chars`);
    console.log(`   📉 Retrieval data loss: ${retrievalDataLoss}%`);
    console.log(`   📷 Photo preserved: ${photoPreserved ? 'YES' : 'NO'}`);
    console.log(`   📧 Email: ${getResult.session?.customer_email || 'NOT FOUND'}`);
    console.log(`   📋 Plan: ${getResult.session?.metadata?.plan || 'NOT FOUND'}`);
    
    if (retrievalDataLoss > 0) {
      results.criticalFindings.push({
        severity: 'CRITICAL',
        issue: 'Session Retrieval Data Loss',
        details: `${retrievalDataLoss}% of CV data lost during retrieval`,
        impact: 'Success page will not have complete CV data for AI processing'
      });
    }
    
    if (!photoPreserved && sessionData.photo) {
      results.criticalFindings.push({
        severity: 'HIGH',
        issue: 'Photo Data Loss',
        details: 'Photo data not preserved through session storage/retrieval',
        impact: 'User photos will be lost in final CV templates'
      });
    }
    
    results.tests.push({
      name: 'Session Retrieval API',
      status: getResult.success ? 'PASSED' : 'FAILED',
      dataIntegrity: retrievalDataLoss < 1 ? 'PERFECT' : 'COMPROMISED'
    });
    
  } catch (getError) {
    console.log(`   ❌ ERROR: ${getError.message}`);
    results.tests.push({
      name: 'Session Retrieval API',
      status: 'ERROR',
      error: getError.message
    });
  }

  console.log('');

  // TEST 4: AI Analysis API (Demo endpoint)
  console.log('🔄 TEST 4: AI Analysis API (/api/analyze)');
  try {
    const fetch = require('node-fetch');
    
    const analyzeData = {
      currentCV: comprehensiveCV,
      jobPosting: 'Senior Full-Stack Developer position requiring React, Node.js, and AWS experience. Must have 5+ years experience.',
      email: 'premium@cvperfect.pl', // Use premium email to bypass limits
      paid: true,
      plan: 'premium',
      sessionId: sessionId
    };
    
    const analyzeResponse = await fetch(`${baseURL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyzeData)
    });

    const analyzeResult = await analyzeResponse.json();
    
    results.dataFlow.aiProcessing = {
      status: analyzeResponse.status,
      success: analyzeResult.success,
      originalCVLength: comprehensiveCV.length,
      optimizedCVLength: analyzeResult.optimizedCV?.length || 0,
      hasCoverLetter: !!analyzeResult.coverLetter,
      improvements: analyzeResult.improvements || [],
      keywordMatch: analyzeResult.keywordMatch,
      metadata: analyzeResult.metadata
    };
    
    console.log(`   ✅ Status: ${analyzeResponse.status}`);
    console.log(`   ✅ Success: ${analyzeResult.success}`);
    
    if (analyzeResult.success) {
      console.log(`   📏 Original CV: ${comprehensiveCV.length} chars`);
      console.log(`   📏 Optimized CV: ${analyzeResult.optimizedCV?.length || 0} chars`);
      console.log(`   📝 Cover letter: ${analyzeResult.coverLetter ? 'GENERATED' : 'NOT GENERATED'}`);
      console.log(`   🎯 Keyword match: ${analyzeResult.keywordMatch || 'N/A'}%`);
      console.log(`   🔧 Improvements: ${(analyzeResult.improvements || []).length} items`);
      
      // Check if AI received full CV content
      const aiReceivedFullCV = analyzeResult.metadata?.originalLength === comprehensiveCV.length;
      console.log(`   📊 AI received full CV: ${aiReceivedFullCV ? 'YES' : 'NO'}`);
      
      if (!aiReceivedFullCV) {
        results.criticalFindings.push({
          severity: 'CRITICAL',
          issue: 'AI Processing Incomplete Data',
          details: `AI received ${analyzeResult.metadata?.originalLength || 0} chars instead of ${comprehensiveCV.length} chars`,
          impact: 'AI optimization will be based on incomplete CV data, reducing quality'
        });
      }
      
    } else {
      console.log(`   ❌ Error: ${analyzeResult.error}`);
    }
    
    results.tests.push({
      name: 'AI Analysis API',
      status: analyzeResult.success ? 'PASSED' : 'FAILED',
      receivedFullCV: analyzeResult.metadata?.originalLength === comprehensiveCV.length
    });
    
  } catch (analyzeError) {
    console.log(`   ❌ ERROR: ${analyzeError.message}`);
    results.tests.push({
      name: 'AI Analysis API',
      status: 'ERROR',
      error: analyzeError.message
    });
  }

  // Save detailed results
  const resultsPath = 'api-data-integrity-results.json';
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('\n📊 CRITICAL FINDINGS SUMMARY:');
  console.log('='.repeat(60));
  
  if (results.criticalFindings.length === 0) {
    console.log('✅ No critical data integrity issues found!');
  } else {
    results.criticalFindings.forEach((finding, index) => {
      console.log(`\n${index + 1}. [${finding.severity}] ${finding.issue}`);
      console.log(`   Details: ${finding.details}`);
      console.log(`   Impact: ${finding.impact}`);
    });
  }
  
  console.log('\n📈 DATA FLOW INTEGRITY:');
  console.log('='.repeat(60));
  console.log('CV Parsing:', results.dataFlow.parsing?.extractedLength || 0, 'of', comprehensiveCV.length, 'chars preserved');
  console.log('Session Storage:', results.dataFlow.sessionStorage?.dataLength || 0, 'of', comprehensiveCV.length, 'chars stored');  
  console.log('Session Retrieval:', results.dataFlow.sessionRetrieval?.retrievedLength || 0, 'of', comprehensiveCV.length, 'chars retrieved');
  console.log('AI Processing:', results.dataFlow.aiProcessing?.originalCVLength || 0, 'of', comprehensiveCV.length, 'chars processed');
  
  console.log('\n📋 TEST RESULTS:');
  console.log('='.repeat(60));
  results.tests.forEach(test => {
    const status = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⚠️';
    console.log(`${status} ${test.name}: ${test.status}`);
    if (test.dataIntegrity) {
      console.log(`   Data Integrity: ${test.dataIntegrity}`);
    }
  });
  
  console.log(`\n💾 Full results saved to: ${resultsPath}`);
  
  return results;
}

// Install required dependencies if not present
async function ensureDependencies() {
  try {
    require('node-fetch');
    require('form-data');
  } catch (err) {
    console.log('Installing required dependencies...');
    const { exec } = require('child_process');
    await new Promise((resolve, reject) => {
      exec('npm install node-fetch form-data', (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

// Run the test
ensureDependencies()
  .then(() => testAPIDataIntegrity())
  .catch(console.error);