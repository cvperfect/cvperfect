const fetch = require('node-fetch');

async function testFinalCVFix() {
  console.log('🧪 Testowanie ostatecznej poprawki CV...\n');
  
  // Twoje prawdziwe CV
  const konradRealCV = `
Konrad Jakóbczak
konrad11811@wp.pl
570 625 098

DOŚWIADCZENIE ZAWODOWE:

Kurier - UPS Zamość
04.2024 – 11.2024 (8 mies.)
Dostarczanie przesyłek do klientów

Kurier - Jumbo Online Eindhoven
05.2023 – 04.2024 (1 rok)
Dostawa zakupów do domów klientów autem dostawczym

Konsultant ds. Sprzedaży - Play Zam
09.2022 – 04.2023 (8 mies.)
Sprzedaż produktów Play

WYKSZTAŁCENIE:
Wyższe

UMIEJĘTNOŚCI:
- Prawo jazdy kat. B
- Obsługa klienta
- Komunikatywność
`;

  try {
    console.log('📋 ORYGINALNE CV KONRADA:');
    console.log('-----------------------------------');
    console.log(konradRealCV);
    console.log('-----------------------------------');
    console.log('Długość:', konradRealCV.length, 'znaków\n');
    
    // Wyślij do API
    console.log('📡 Wysyłanie do API /analyze...');
    
    const response = await fetch('http://localhost:3004/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: konradRealCV,
        email: 'konrad11811@wp.pl',
        paid: true,
        plan: 'premium'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Odpowiedź AI otrzymana\n');
      
      console.log('📊 STATYSTYKI:');
      console.log('Długość oryginalnego CV:', konradRealCV.length, 'znaków');
      console.log('Długość zoptymalizowanego CV:', result.optimizedCV.length, 'znaków');
      console.log('Zmiana:', result.optimizedCV.length > konradRealCV.length ? '+' : '', 
                  result.optimizedCV.length - konradRealCV.length, 'znaków\n');
      
      // Sprawdź problematyczne frazy
      const badPhrases = [
        'proszę o dodanie informacji',
        'brak informacji',
        'Proszę o dodanie',
        'aby mogłem ulepszyć',
        'Zachowując wszystkie informacje',
        '(brak informacji'
      ];
      
      console.log('🔍 SPRAWDZENIE NIEPOŻĄDANYCH FRAZ:');
      let hasBadPhrases = false;
      for (const phrase of badPhrases) {
        const found = result.optimizedCV.toLowerCase().includes(phrase.toLowerCase());
        if (found) {
          console.log(`❌ Znaleziono: "${phrase}"`);
          hasBadPhrases = true;
        }
      }
      
      if (!hasBadPhrases) {
        console.log('✅ Brak niepożądanych komentarzy AI');
      }
      
      // Sprawdź zachowanie danych
      const checks = {
        'Imię - Konrad Jakóbczak': result.optimizedCV.includes('Konrad Jakóbczak'),
        'Email - konrad11811@wp.pl': result.optimizedCV.includes('konrad11811@wp.pl'),
        'Telefon - 570 625 098': result.optimizedCV.includes('570 625 098'),
        'UPS Zamość': result.optimizedCV.includes('UPS'),
        'Jumbo Online': result.optimizedCV.includes('Jumbo'),
        'Play': result.optimizedCV.includes('Play'),
        'Formatowanie HTML': result.optimizedCV.includes('<h') || result.optimizedCV.includes('<div'),
        'Style CSS': result.optimizedCV.includes('style')
      };
      
      console.log('\n🔍 WERYFIKACJA ZAWARTOŚCI:');
      let allGood = true;
      for (const [check, passed] of Object.entries(checks)) {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
        if (!passed) allGood = false;
      }
      
      // Wyświetl pierwsze 800 znaków
      console.log('\n📄 ZOPTYMALIZOWANE CV (pierwsze 800 znaków):');
      console.log('-----------------------------------');
      const cleanedCV = result.optimizedCV
        .replace(/^.*?<!DOCTYPE/i, '<!DOCTYPE')
        .replace(/^.*?<html/i, '<html')
        .replace(/^.*?<body/i, '<body')
        .replace(/^.*?<h1/i, '<h1');
      console.log(cleanedCV.substring(0, 800));
      console.log('-----------------------------------');
      
      console.log(`\n${allGood && !hasBadPhrases ? '🎉' : '⚠️'} WYNIK: ${allGood && !hasBadPhrases ? 'CV POPRAWNIE ZOPTYMALIZOWANE!' : 'NADAL SĄ PROBLEMY'}`);
      
      if (hasBadPhrases) {
        console.log('\n❌ KRYTYCZNY PROBLEM: AI nadal dodaje niepotrzebne komentarze!');
      }
      
      // Zapisz do pliku
      const fs = require('fs');
      fs.writeFileSync('final-optimized-cv.html', result.optimizedCV);
      console.log('\n📁 Zapisano do: final-optimized-cv.html');
      
    } else {
      console.error('❌ Błąd API:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Błąd połączenia:', error.message);
  }
}

testFinalCVFix();