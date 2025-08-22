const fetch = require('node-fetch');

async function testFullCVWithPhoto() {
  console.log('🧪 Testowanie pełnego CV ze zdjęciem i strukturą HTML...\n');
  
  // Symulacja prawdziwego CV w HTML ze zdjęciem
  const fullHTMLCV = `
<!DOCTYPE html>
<html>
<head>
  <style>
    .cv-container { max-width: 800px; margin: auto; font-family: Arial; }
    .header { display: flex; align-items: center; gap: 20px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .photo { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; }
    .personal-info h1 { margin: 0; color: #333; }
    .contact { color: #666; margin-top: 10px; }
    .section { margin-top: 30px; }
    .section h2 { color: #2c5aa0; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .job { margin-bottom: 15px; }
    .job-title { font-weight: bold; }
    .company { color: #666; }
  </style>
</head>
<body>
  <div class="cv-container">
    <div class="header">
      <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCACAAIADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP//Z" alt="Zdjęcie profilowe" class="photo">
      <div class="personal-info">
        <h1>Konrad Jakóbczak</h1>
        <div class="contact">
          📧 konrad11811@wp.pl | 📱 570 625 098 | 📍 Warszawa
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2>Doświadczenie zawodowe</h2>
      
      <div class="job">
        <div class="job-title">Kurier</div>
        <div class="company">DPD Polska | 2022-2023</div>
        <ul>
          <li>Dostarczanie przesyłek i paczek do klientów</li>
          <li>Obsługa terminala kurierskiego</li>
          <li>Kontakt z klientami</li>
        </ul>
      </div>
      
      <div class="job">
        <div class="job-title">Dostawca</div>
        <div class="company">Glovo | 2021-2022</div>
        <ul>
          <li>Dostawa zakupów do klientów</li>
          <li>Obsługa aplikacji mobilnej</li>
        </ul>
      </div>
      
      <div class="job">
        <div class="job-title">Sprzedawca</div>
        <div class="company">Play | 2020-2021</div>
        <ul>
          <li>Sprzedaż produktów telekomunikacyjnych Play</li>
          <li>Obsługa klienta</li>
        </ul>
      </div>
    </div>
    
    <div class="section">
      <h2>Wykształcenie</h2>
      <p>Wyższe - Zarządzanie, Uniwersytet Warszawski (2018-2021)</p>
    </div>
    
    <div class="section">
      <h2>Umiejętności</h2>
      <ul>
        <li>Obsługa klienta</li>
        <li>Prawo jazdy kat. B</li>
        <li>Komunikatywność</li>
        <li>Zarządzanie czasem</li>
      </ul>
    </div>
  </div>
</body>
</html>`;

  try {
    console.log('📋 ORYGINALNE CV (HTML ze zdjęciem):');
    console.log('Długość:', fullHTMLCV.length, 'znaków');
    console.log('Ma tag <img>:', fullHTMLCV.includes('<img'));
    console.log('Ma style CSS:', fullHTMLCV.includes('<style>'));
    console.log('Ma strukturę HTML:', fullHTMLCV.includes('class='));
    
    // Wyślij do API
    console.log('\n📡 Wysyłanie do API /analyze...');
    
    const response = await fetch('http://localhost:3004/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: fullHTMLCV,
        email: 'konrad11811@wp.pl',
        paid: true,
        plan: 'premium',
        sessionId: 'sess_test_konrad_html'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Odpowiedź AI otrzymana\n');
      
      console.log('📊 STATYSTYKI:');
      console.log('Długość oryginalnego CV:', fullHTMLCV.length, 'znaków');
      console.log('Długość zoptymalizowanego CV:', result.optimizedCV.length, 'znaków');
      console.log('Zmiana:', result.optimizedCV.length > fullHTMLCV.length ? '+' : '', 
                  result.optimizedCV.length - fullHTMLCV.length, 'znaków\n');
      
      // Sprawdź czy struktura została zachowana
      const checks = {
        'Zachowane imię - Konrad Jakóbczak': result.optimizedCV.includes('Konrad Jakóbczak'),
        'Zachowany email': result.optimizedCV.includes('konrad11811@wp.pl'),
        'Zachowany telefon': result.optimizedCV.includes('570 625 098'),
        'Zachowane zdjęcie <img>': result.optimizedCV.includes('<img'),
        'Zachowane style CSS': result.optimizedCV.includes('style') || result.optimizedCV.includes('class'),
        'Zachowana struktura HTML': result.optimizedCV.includes('<div') && result.optimizedCV.includes('<h'),
        'DPD w doświadczeniu': result.optimizedCV.includes('DPD'),
        'Glovo w doświadczeniu': result.optimizedCV.includes('Glovo'),
        'Play w doświadczeniu': result.optimizedCV.includes('Play'),
      };
      
      console.log('🔍 WERYFIKACJA ZACHOWANIA STRUKTURY:');
      let allGood = true;
      for (const [check, passed] of Object.entries(checks)) {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
        if (!passed) allGood = false;
      }
      
      console.log(`\n${allGood ? '🎉' : '⚠️'} WYNIK: ${allGood ? 'STRUKTURA I ZDJĘCIE ZACHOWANE!' : 'PROBLEMY ZE STRUKTURĄ'}`);
      
      if (!result.optimizedCV.includes('<img')) {
        console.log('\n❌ KRYTYCZNY PROBLEM: Zdjęcie zostało usunięte!');
      }
      
      if (!result.optimizedCV.includes('class') && !result.optimizedCV.includes('style')) {
        console.log('❌ KRYTYCZNY PROBLEM: Style CSS zostały usunięte!');
      }
      
      // Zapisz do pliku do analizy
      const fs = require('fs');
      fs.writeFileSync('optimized-cv-output.html', result.optimizedCV);
      console.log('\n📁 Zoptymalizowane CV zapisane do: optimized-cv-output.html');
      
    } else {
      console.error('❌ Błąd API:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Błąd połączenia:', error.message);
  }
}

testFullCVWithPhoto();