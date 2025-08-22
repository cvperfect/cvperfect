const fetch = require('node-fetch');

async function testAIResponse() {
  console.log('🧪 Testowanie surowej odpowiedzi AI...\n');
  
  // Twoje prawdziwe CV (rozszerzone)
  const testCV = `
Konrad Jakóbczak
konrad11811@wp.pl
570 625 098

DOŚWIADCZENIE ZAWODOWE:

Kurier | DPD Polska | 2022-2023
- Dostarczanie przesyłek i paczek do klientów
- Obsługa terminala kurierskiego
- Kontakt z klientami
- Zarządzanie trasami dostaw

Dostawca | Glovo | 2021-2022  
- Dostawa zakupów i jedzenia
- Obsługa aplikacji mobilnej
- Zarządzanie czasem dostaw
- Kontakt z restauracjami i klientami

Sprzedawca | Play | 2020-2021
- Sprzedaż produktów telekomunikacyjnych
- Obsługa klienta
- Doradztwo w wyborze ofert
- Realizacja planów sprzedażowych

WYKSZTAŁCENIE:

Licencjat | Zarządzanie | Uniwersytet Warszawski | 2018-2021
Technikum | Technik Informatyk | Zespół Szkół nr 1 | 2014-2018

UMIEJĘTNOŚCI:

- Prawo jazdy kat. B
- Obsługa komputera (MS Office)
- Komunikatywność
- Zarządzanie czasem
- Praca w zespole
- Odporność na stres
`;

  try {
    const response = await fetch('http://localhost:3004/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: testCV,
        email: 'test@cvperfect.pl',
        paid: true
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Odpowiedź AI otrzymana');
      console.log('\n📊 STATYSTYKI:');
      console.log('Długość oryginalnego CV:', testCV.length, 'znaków');
      console.log('Długość zoptymalizowanego CV:', result.optimizedCV.length, 'znaków');
      console.log('Zmiana:', result.optimizedCV.length > testCV.length ? '+' : '', 
                  result.optimizedCV.length - testCV.length, 'znaków');
      
      console.log('\n📄 PIERWSZE 1500 ZNAKÓW ZOPTYMALIZOWANEGO CV:');
      console.log('-----------------------------------');
      console.log(result.optimizedCV.substring(0, 1500));
      console.log('-----------------------------------');
      
      // Sprawdź co faktycznie zawiera CV
      const hasName = result.optimizedCV.includes('Konrad');
      const hasEmail = result.optimizedCV.includes('konrad11811');
      const hasPhone = result.optimizedCV.includes('570 625');
      const hasDPD = result.optimizedCV.includes('DPD') || result.optimizedCV.includes('Kurier');
      const hasGlovo = result.optimizedCV.includes('Glovo') || result.optimizedCV.includes('Dostawca');
      const hasPlay = result.optimizedCV.includes('Play') || result.optimizedCV.includes('Sprzedawca');
      
      console.log('\n🔍 WERYFIKACJA ZAWARTOŚCI:');
      console.log(`Imię i nazwisko: ${hasName ? '✅' : '❌'}`);
      console.log(`Email: ${hasEmail ? '✅' : '❌'}`);
      console.log(`Telefon: ${hasPhone ? '✅' : '❌'}`);
      console.log(`Doświadczenie DPD/Kurier: ${hasDPD ? '✅' : '❌'}`);
      console.log(`Doświadczenie Glovo/Dostawca: ${hasGlovo ? '✅' : '❌'}`);
      console.log(`Doświadczenie Play/Sprzedawca: ${hasPlay ? '✅' : '❌'}`);
      
    } else {
      console.error('❌ Błąd:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Błąd połączenia:', error.message);
  }
}

testAIResponse();