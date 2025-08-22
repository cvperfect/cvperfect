const fetch = require('node-fetch');

async function testSessionData() {
  console.log('🧪 Testowanie danych sesji...\n');
  
  const sessionId = 'cs_test_a1QxhoclyLRRSH2v9nbZOlblzW4ptUJEbxiL2yKhX5j4RYsVBZ';
  
  try {
    // Fetch session data
    console.log('📡 Pobieranie danych sesji...');
    const response = await fetch(`http://localhost:3004/api/get-session-data?session_id=${sessionId}`);
    const data = await response.json();
    
    if (data.success && data.session.metadata) {
      const metadata = data.session.metadata;
      
      console.log('✅ Dane sesji znalezione\n');
      
      console.log('📊 METADANE SESJI:');
      console.log('Plan:', metadata.plan || 'brak');
      console.log('Email:', data.session.customer_email || 'brak');
      console.log('Długość CV:', metadata.cv?.length || 0, 'znaków');
      console.log('Ma zdjęcie:', !!metadata.photo);
      console.log('Ma ofertę pracy:', !!metadata.job);
      console.log('Szablon:', metadata.template || 'brak');
      console.log('Przetworzony:', metadata.processed || false);
      
      if (metadata.cv) {
        console.log('\n📄 ZAWARTOŚĆ CV (pierwsze 500 znaków):');
        console.log('-----------------------------------');
        console.log(metadata.cv.substring(0, 500));
        console.log('-----------------------------------');
        
        // Check if CV contains HTML
        const hasHTML = metadata.cv.includes('<') && metadata.cv.includes('>');
        const hasImg = metadata.cv.includes('<img');
        const hasDiv = metadata.cv.includes('<div');
        const hasH1 = metadata.cv.includes('<h1');
        
        console.log('\n🔍 ANALIZA STRUKTURY CV:');
        console.log(`Zawiera HTML: ${hasHTML ? '✅' : '❌'}`);
        console.log(`Zawiera tagi <img>: ${hasImg ? '✅' : '❌'}`);
        console.log(`Zawiera tagi <div>: ${hasDiv ? '✅' : '❌'}`);
        console.log(`Zawiera tagi <h1>: ${hasH1 ? '✅' : '❌'}`);
        
        if (!hasHTML) {
          console.log('\n⚠️ PROBLEM: CV jest zapisane jako czysty tekst, nie HTML!');
          console.log('To powoduje utratę formatowania, zdjęć i układu.');
        }
      }
      
      if (metadata.photo) {
        console.log('\n📸 DANE ZDJĘCIA:');
        console.log('Typ:', typeof metadata.photo);
        console.log('Długość:', metadata.photo.length, 'znaków');
        console.log('Pierwsze 100 znaków:', metadata.photo.substring(0, 100));
      }
      
    } else {
      console.log('❌ Brak danych sesji');
    }
    
  } catch (error) {
    console.error('❌ Błąd:', error.message);
  }
}

testSessionData();