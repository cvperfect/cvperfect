// Direct test of AI 10k expansion via demo endpoint
const fs = require('fs');

// Test CV data
const testCV = `Konrad Jakóbczak
konrad11811@wp.pl
570 625 098

Doświadczenie zawodowe:
- Kurier w UPS Zamość (04.2024 – 11.2024) - Dostarczanie przesyłek w terminie
- Pracownik sprzedaży w Biedronka - Obsługa klientów i obsługa kasy
- Praktyki zawodowe w firmie IT - Wsparcie techniczne komputerów

Wykształcenie:
- Liceum Ogólnokształcące w Zamościu - profil matematyczno-fizyczny
- Kurs programowania - podstawy JavaScript i HTML

Umiejętności:
- Komunikacja z klientami
- Obsługa komputera i podstawowe programy
- Podstawy programowania JavaScript
- Język angielski poziom średnio zaawansowany
- Praca w zespole i pod presją czasu`;

async function testAI10kExpansion() {
  console.log('🚀 Testing AI 10,000+ Character Expansion...\n');
  
  console.log('📊 Input CV stats:');
  console.log(`- Length: ${testCV.length} characters`);
  console.log(`- Lines: ${testCV.split('\n').length}`);
  console.log(`- Words: ${testCV.split(/\s+/).length}`);
  
  try {
    console.log('\n🤖 Sending to AI analyze endpoint...');
    
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentCV: testCV,
        jobPosting: '',
        email: 'test@example.com'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.optimizedCV) {
      const optimizedCV = result.optimizedCV;
      const originalLength = testCV.length;
      const optimizedLength = optimizedCV.length;
      const expansionRatio = optimizedLength / originalLength;
      
      console.log('\n📈 OPTIMIZATION RESULTS:');
      console.log('='.repeat(50));
      console.log(`✅ Success: ${result.success}`);
      console.log(`📄 Original length: ${originalLength} characters`);
      console.log(`🚀 Optimized length: ${optimizedLength} characters`);
      console.log(`📊 Expansion ratio: ${expansionRatio.toFixed(2)}x`);
      console.log(`🎯 10k+ target: ${optimizedLength >= 10000 ? '✅ ACHIEVED' : '❌ NOT REACHED'} (${optimizedLength >= 10000 ? 'SUCCESS' : `Need ${10000 - optimizedLength} more chars`})`);
      
      // Save optimized CV to file
      fs.writeFileSync('test-optimized-cv-10k.html', optimizedCV);
      console.log(`💾 Optimized CV saved to: test-optimized-cv-10k.html`);
      
      // Analyze content quality
      const hasHTML = optimizedCV.includes('<html>') || optimizedCV.includes('<!DOCTYPE');
      const hasCSS = optimizedCV.includes('<style>') || optimizedCV.includes('font-family');
      const hasContactInfo = optimizedCV.includes('konrad11811@wp.pl') && optimizedCV.includes('570 625 098');
      const hasExpandedContent = optimizedCV.split('\n').length > testCV.split('\n').length * 2;
      
      console.log('\n🔍 CONTENT QUALITY ANALYSIS:');
      console.log(`${hasHTML ? '✅' : '❌'} HTML structure present`);
      console.log(`${hasCSS ? '✅' : '❌'} CSS styling included`);
      console.log(`${hasContactInfo ? '✅' : '❌'} Contact info preserved`);
      console.log(`${hasExpandedContent ? '✅' : '❌'} Content significantly expanded`);
      
      // Check for power verbs and metrics (indicators of quality expansion)
      const powerVerbs = ['spearheaded', 'orchestrated', 'optimized', 'exceeded', 'achieved', 'delivered', 'managed', 'led', 'developed'];
      const hasMetrics = /\d+%|\d+\s*(PLN|zł|euro|miesiąc|rok|lat|osoby|klientów)/.test(optimizedCV);
      const hasPowerVerbs = powerVerbs.some(verb => optimizedCV.toLowerCase().includes(verb.toLowerCase()));
      
      console.log(`${hasPowerVerbs ? '✅' : '❌'} Power verbs used`);
      console.log(`${hasMetrics ? '✅' : '❌'} Metrics/numbers included`);
      
      if (optimizedLength >= 10000 && hasHTML && hasContactInfo && hasExpandedContent) {
        console.log('\n🎉 FULL SUCCESS: All criteria met!');
        console.log('✅ 10,000+ characters achieved');
        console.log('✅ Professional HTML formatting');
        console.log('✅ Original data preserved');
        console.log('✅ Content significantly expanded');
      } else {
        console.log('\n⚠️ PARTIAL SUCCESS: Some criteria not met');
      }
      
      // Preview first 500 chars
      console.log('\n📖 OPTIMIZED CV PREVIEW (first 500 chars):');
      console.log('-'.repeat(50));
      console.log(optimizedCV.substring(0, 500) + (optimizedCV.length > 500 ? '...' : ''));
      console.log('-'.repeat(50));
      
    } else {
      console.log('❌ AI optimization failed:', result.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAI10kExpansion().catch(console.error);