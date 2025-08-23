const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAPIEndpoints() {
  console.log('🚀 TEST API ENDPOINTS');
  console.log('====================');
  
  const baseUrl = 'http://localhost:3015';
  
  console.log('📄 Test 1: /api/demo-optimize');
  try {
    const response = await fetch(`${baseUrl}/api/demo-optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cvText: `Jan Kowalski
Programista JavaScript

DOŚWIADCZENIE:
• Frontend Developer - ABC Tech (2021-2024)
  - Tworzenie aplikacji React.js
  - Współpraca z zespołem backend
  - Implementacja responsive design

• Junior Developer - XYZ Soft (2020-2021)
  - Nauka HTML, CSS, JavaScript
  - Wsparcie przy projektach

UMIEJĘTNOŚCI:
• JavaScript (ES6+), TypeScript
• React.js, Redux, Vue.js
• HTML5, CSS3, SASS
• Git, Webpack, npm

WYKSZTAŁCENIE:
• Informatyka - Politechnika Warszawska (2016-2020)

JĘZYKI:
• Polski (natywny)
• Angielski (B2)`,
        jobText: `Szukamy doświadczonego Frontend Developer do naszego zespołu.

WYMAGANIA:
- Min. 3 lata doświadczenia w JavaScript
- Bardzo dobra znajomość React.js
- Znajomość TypeScript
- Doświadczenie z Git
- Język angielski min. B2

OFERUJEMY:
- Pracę zdalną lub hybrydową
- Konkurencyjne wynagrodzenie
- Prywatną opiekę medyczną
- Budżet szkoleniowy`
      })
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ /api/demo-optimize działa poprawnie');
      console.log(`📊 Zwrócone dane: ${JSON.stringify(result).substring(0, 200)}...`);
      
      // Sprawdź czy odpowiedź zawiera zoptymalizowane CV
      if (result.optimizedCV || result.optimized_cv || result.result) {
        console.log('✅ API zwraca zoptymalizowane CV');
      } else {
        console.log('⚠️ API nie zawiera pola z zoptymalizowanym CV');
        console.log('📋 Dostępne pola:', Object.keys(result));
      }
    } else {
      const error = await response.text();
      console.log(`❌ /api/demo-optimize błąd ${response.status}: ${error}`);
    }
  } catch (error) {
    console.log(`❌ Błąd połączenia z /api/demo-optimize: ${error.message}`);
  }
  
  console.log('\\n📄 Test 2: /api/create-checkout-session');
  try {
    const plans = ['basic', 'gold', 'premium'];
    
    for (const plan of plans) {
      const response = await fetch(`${baseUrl}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: plan,
          email: 'test@example.com',
          hasCV: true,
          hasJob: false
        })
      });
      
      console.log(`Plan ${plan}: Status ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Checkout dla planu ${plan}: OK`);
        
        // Sprawdź czy zwraca session ID
        if (result.sessionId || result.id || result.url) {
          console.log(`   SessionId/URL dostępne: ✅`);
        }
      } else {
        const error = await response.text();
        console.log(`❌ Checkout dla planu ${plan}: ${error.substring(0, 100)}...`);
      }
    }
  } catch (error) {
    console.log(`❌ Błąd testowania checkout: ${error.message}`);
  }
  
  console.log('\\n📄 Test 3: /api/parse-cv');
  try {
    // Stwórz testowy plik CV
    const testCVContent = `Jan Nowak
ul. Testowa 123, 00-001 Warszawa
tel. +48 123 456 789, email: jan.nowak@email.com

DOŚWIADCZENIE ZAWODOWE:
2022-2024 | Senior Frontend Developer | TechCorp Sp. z o.o.
• Rozwój aplikacji webowych w React.js i TypeScript
• Optymalizacja wydajności aplikacji (poprawa o 40%)
• Mentoring junior developers
• Współpraca z zespołami UX/UI

2020-2022 | Frontend Developer | StartupXYZ
• Implementacja interfejsów użytkownika
• Integracja z API REST
• Praca w metodologii Agile/Scrum

WYKSZTAŁCENIE:
2016-2020 | Informatyka, Politechnika Warszawska
Specjalizacja: Inżynieria Oprogramowania

UMIEJĘTNOŚCI TECHNICZNE:
• Języki: JavaScript (ES6+), TypeScript, Python
• Frameworki: React.js, Vue.js, Node.js
• Narzędzia: Git, Webpack, Docker
• Bazy danych: MySQL, MongoDB

JĘZYKI OBCE:
• Angielski - C1
• Niemiecki - A2

CERTYFIKATY:
• AWS Certified Developer Associate (2023)
• React Developer Certification (2022)`;
    
    const testCVPath = path.join(__dirname, 'test-parse-cv.txt');
    fs.writeFileSync(testCVPath, testCVContent, 'utf8');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testCVPath), {
      filename: 'test-cv.txt',
      contentType: 'text/plain'
    });
    
    const response = await fetch(`${baseUrl}/api/parse-cv`, {
      method: 'POST',
      body: formData
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ /api/parse-cv działa poprawnie');
      
      // Sprawdź czy udało się sparsować podstawowe informacje
      const expectedFields = ['name', 'email', 'experience', 'skills', 'education'];
      const foundFields = expectedFields.filter(field => 
        result[field] || result.parsedContent?.[field] || result.data?.[field]
      );
      
      console.log(`📊 Sparsowane pola: ${foundFields.join(', ')}`);
      console.log(`📋 Wszystkie pola w odpowiedzi: ${Object.keys(result).join(', ')}`);
      
      if (foundFields.length >= 3) {
        console.log('✅ Parser CV działa poprawnie - wykryto podstawowe sekcje');
      } else {
        console.log('⚠️ Parser wykrył mało sekcji - może potrzebować poprawek');
      }
      
    } else {
      const error = await response.text();
      console.log(`❌ /api/parse-cv błąd ${response.status}: ${error}`);
    }
    
    // Cleanup
    if (fs.existsSync(testCVPath)) {
      fs.unlinkSync(testCVPath);
    }
    
  } catch (error) {
    console.log(`❌ Błąd testowania parse-cv: ${error.message}`);
  }
  
  console.log('\\n📄 Test 4: /api/contact');
  try {
    const response = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Jan Testowy',
        email: 'jan.testowy@example.com',
        message: 'To jest testowa wiadomość z automatycznego testu API.'
      })
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ /api/contact działa poprawnie');
    } else {
      const error = await response.text();
      console.log(`⚠️ /api/contact status ${response.status}: ${error.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`❌ Błąd testowania contact: ${error.message}`);
  }
  
  console.log('\\n📄 Test 5: Próba nieprawidłowych requestów (security test)');
  try {
    // Test pustych danych
    const emptyResponse = await fetch(`${baseUrl}/api/demo-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log(`Puste dane - status: ${emptyResponse.status} ${emptyResponse.status >= 400 ? '✅' : '⚠️'}`);
    
    // Test bardzo długiego CV (potencjalny DoS)
    const longContent = 'A'.repeat(100000);
    const longResponse = await fetch(`${baseUrl}/api/demo-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvText: longContent,
        jobText: 'test'
      })
    });
    console.log(`Bardzo długie CV - status: ${longResponse.status}`);
    
    // Test nieprawidłowego JSON
    const invalidResponse = await fetch(`${baseUrl}/api/demo-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json{'
    });
    console.log(`Nieprawidłowy JSON - status: ${invalidResponse.status} ${invalidResponse.status >= 400 ? '✅' : '⚠️'}`);
    
  } catch (error) {
    console.log(`Security test error: ${error.message}`);
  }
  
  console.log('\\n🏁 PODSUMOWANIE TESTÓW API:');
  console.log('===========================');
  console.log('✅ Wszystkie testy API zakończone');
  console.log('📋 Sprawdź logi powyżej dla szczegółów każdego endpointu');
}

testAPIEndpoints().catch(console.error);