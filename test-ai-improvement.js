const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  console.log('🧪 Testowanie poprawki AI optymalizacji CV...');
  
  try {
    // Test CV content - Twoje prawdziwe CV
    const testCV = `
Konrad Jakóbczak
konrad1181@wp.pl | 570 625 008

DOŚWIADCZENIE ZAWODOWE

Senior Data Analyst | ABC Analytics | 2021-2024
• Przeprowadziłem analizę danych dla 15+ projektów biznesowych
• Wdrożyłem automatyzację raportowania która zmniejszyła czas o 60%
• Zarządzałem zespołem 3 analityków danych
• Optymalizowałem bazy danych SQL zwiększając wydajność o 40%

Data Analyst | XYZ Corp | 2019-2021  
• Tworzyłem dashboardy w Power BI dla managementu
• Analizowałem trendy sprzedażowe i rynkowe
• Przygotowywałem raporty miesięczne dla zarządu

WYKSZTAŁCENIE

Magister Informatyki | Uniwersytet Warszawski | 2017-2019
Licencjat Matematyki | Politechnika Warszawska | 2014-2017

UMIEJĘTNOŚCI TECHNICZNE

• Python (pandas, NumPy, scikit-learn)
• SQL (PostgreSQL, MySQL, Oracle)
• Power BI, Tableau, Excel
• Machine Learning, Deep Learning
• Git, Docker, AWS

CERTYFIKATY I KURSY

• Microsoft Azure Data Scientist Associate (2023)
• Google Analytics Certified (2022)
• Kurs Machine Learning - Coursera (2021)
`;

    // Test API call
    console.log('📡 Wywołuję API /analyze z poprawionym promptem...');
    
    const response = await fetch('http://localhost:3004/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentCV: testCV,
        email: 'test@cvperfect.pl',
        paid: true,
        plan: 'premium'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ AI optymalizacja zakończona pomyślnie');
      
      // Analizuj wynik
      const original = testCV;
      const optimized = result.optimizedCV;
      
      console.log('\n📊 ANALIZA WYNIKÓW:');
      console.log(`Długość oryginału: ${original.length} znaków`);
      console.log(`Długość po optymalizacji: ${optimized.length} znaków`);
      console.log(`Zmiana: ${optimized.length > original.length ? '+' : ''}${optimized.length - original.length} znaków`);
      
      // Sprawdź kluczowe informacje
      const checks = {
        'Imię i nazwisko': optimized.includes('Konrad'),
        'Email': optimized.includes('konrad1181@wp.pl'),
        'Telefon': optimized.includes('570 625 008'),
        'Nazwa firmy ABC': optimized.includes('ABC Analytics'),
        'Nazwa firmy XYZ': optimized.includes('XYZ Corp'),
        'Uniwersytet Warszawski': optimized.includes('Uniwersytet Warszawski'),
        'Politechnika Warszawska': optimized.includes('Politechnika Warszawska'),
        'Python': optimized.includes('Python'),
        'SQL': optimized.includes('SQL'),
        'Certyfikat Azure': optimized.includes('Azure'),
        'Daty pracy 2021-2024': optimized.includes('2021') && optimized.includes('2024'),
        'Szczegóły doświadczenia': optimized.length > original.length * 0.8
      };
      
      console.log('\n🔍 SPRAWDZENIE ZACHOWANIA DANYCH:');
      let allGood = true;
      for (const [check, passed] of Object.entries(checks)) {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
        if (!passed) allGood = false;
      }
      
      // Zapisz wynik do pliku
      const testResult = {
        timestamp: new Date().toISOString(),
        success: result.success,
        originalLength: original.length,
        optimizedLength: optimized.length,
        lengthChange: optimized.length - original.length,
        dataPreservation: checks,
        allChecksPass: allGood,
        optimizedCV: optimized
      };
      
      fs.writeFileSync('ai-improvement-test-results.json', JSON.stringify(testResult, null, 2));
      
      console.log(`\n${allGood ? '✅' : '❌'} WYNIK TESTU: ${allGood ? 'WSZYSTKIE DANE ZACHOWANE' : 'DANE ZOSTAŁY USUNIĘTE'}`);
      console.log('📄 Szczegóły zapisane w: ai-improvement-test-results.json');
      
      if (!allGood) {
        console.log('\n⚠️ WYKRYTE PROBLEMY - wymagana dalsza optymalizacja promptu AI');
      }
      
    } else {
      console.error('❌ Błąd API:', result.error);
    }

  } catch (error) {
    console.error('❌ Błąd testu:', error.message);
  }
  
  await browser.close();
  console.log('🏁 Test zakończony');
})();