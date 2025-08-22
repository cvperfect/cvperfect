const fetch = require('node-fetch');

async function testKonradCVFlow() {
  console.log('🧪 Testowanie przepływu CV Konrada Jakóbczaka...\n');
  
  // Twoje rzeczywiste CV które wrzuciłeś na platformę
  const konradCV = `
Konrad Jakóbczak
konrad11811@wp.pl
570 625 098

DOŚWIADCZENIE ZAWODOWE:

Kurier - DPD
Dostarczanie przesyłek i paczek do klientów

Dostawca - Glovo  
Dostawa zakupów do klientów

Sprzedawca - Play
Sprzedaż produktów telekomunikacyjnych Play

WYKSZTAŁCENIE:
Wyższe

UMIEJĘTNOŚCI:
Obsługa klienta
Prawo jazdy kat. B
`;

  try {
    console.log('📋 ORYGINALNE CV:');
    console.log('-----------------------------------');
    console.log(konradCV);
    console.log('-----------------------------------');
    console.log('Długość:', konradCV.length, 'znaków\n');
    
    // Krok 1: Wyślij do API
    console.log('📡 Wysyłanie do API /analyze...');
    
    const response = await fetch('http://localhost:3004/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: konradCV,
        email: 'konrad11811@wp.pl',
        paid: true,
        plan: 'premium',
        sessionId: 'sess_test_konrad'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Odpowiedź AI otrzymana\n');
      
      console.log('📊 STATYSTYKI:');
      console.log('Długość oryginalnego CV:', konradCV.length, 'znaków');
      console.log('Długość zoptymalizowanego CV:', result.optimizedCV.length, 'znaków');
      console.log('Zmiana:', result.optimizedCV.length > konradCV.length ? '+' : '', 
                  result.optimizedCV.length - konradCV.length, 'znaków\n');
      
      console.log('📄 ZOPTYMALIZOWANE CV (pierwsze 1000 znaków):');
      console.log('-----------------------------------');
      console.log(result.optimizedCV.substring(0, 1000));
      console.log('-----------------------------------\n');
      
      // Sprawdź zawartość
      const checks = {
        'Imię - Konrad Jakóbczak': result.optimizedCV.includes('Konrad Jakóbczak'),
        'Email - konrad11811@wp.pl': result.optimizedCV.includes('konrad11811@wp.pl'),
        'Telefon - 570 625 098': result.optimizedCV.includes('570 625 098'),
        'Doświadczenie - DPD/Kurier': result.optimizedCV.includes('DPD') || result.optimizedCV.includes('Kurier'),
        'Doświadczenie - Glovo/Dostawca': result.optimizedCV.includes('Glovo') || result.optimizedCV.includes('Dostawca'),
        'Doświadczenie - Play/Sprzedawca': result.optimizedCV.includes('Play') || result.optimizedCV.includes('Sprzedawca'),
        'Wykształcenie - Wyższe': result.optimizedCV.includes('Wyższe') || result.optimizedCV.includes('Higher'),
        'Umiejętności - Obsługa klienta': result.optimizedCV.includes('Obsługa klienta') || result.optimizedCV.includes('obsługa')
      };
      
      console.log('🔍 WERYFIKACJA ZAWARTOŚCI:');
      let allGood = true;
      for (const [check, passed] of Object.entries(checks)) {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
        if (!passed) allGood = false;
      }
      
      console.log(`\n${allGood ? '🎉' : '⚠️'} WYNIK: ${allGood ? 'WSZYSTKIE DANE ZACHOWANE!' : 'BRAKUJE NIEKTÓRYCH DANYCH'}`);
      
      // Sprawdź czy CV nie jest za krótkie
      if (result.optimizedCV.length < konradCV.length * 0.8) {
        console.log('\n⚠️ PROBLEM: CV zostało skrócone o ponad 20%!');
        console.log('To nie powinno się zdarzyć - AI ma rozszerzać, nie skracać.');
      }
      
      // Sprawdź struktura HTML
      const hasProperHTML = result.optimizedCV.includes('<h1>') && 
                           result.optimizedCV.includes('<h2>') &&
                           result.optimizedCV.includes('</h1>') &&
                           result.optimizedCV.includes('</h2>');
      
      console.log(`\n📝 Struktura HTML: ${hasProperHTML ? '✅ Poprawna' : '❌ Brak tagów HTML'}`);
      
    } else {
      console.error('❌ Błąd API:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Błąd połączenia:', error.message);
  }
}

testKonradCVFlow();