// Test the enhanced demo-optimize endpoint for 10k+ character expansion
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

async function testDemo10kExpansion() {
  console.log('🚀 Testing Demo Endpoint 10,000+ Character Expansion...\n');
  
  console.log('📊 Input CV stats:');
  console.log(`- Length: ${testCV.length} characters`);
  console.log(`- Lines: ${testCV.split('\n').length}`);
  console.log(`- Words: ${testCV.split(/\s+/).length}`);
  console.log(`- Sentences: ${testCV.split(/[.!?]+/).length}`);
  
  try {
    console.log('\n🤖 Sending to demo-optimize endpoint...');
    
    const response = await fetch('http://localhost:3000/api/demo-optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cvText: testCV,
        jobText: '',
        language: 'pl'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.optimizedCV) {
      const optimizedCV = result.optimizedCV;
      const stats = result.stats;
      const expansionRatio = stats.optimizedLength / stats.originalLength;
      
      console.log('\n📈 OPTIMIZATION RESULTS:');
      console.log('='.repeat(60));
      console.log(`✅ Success: ${result.success}`);
      console.log(`📄 Original length: ${stats.originalLength.toLocaleString()} characters`);
      console.log(`🚀 Optimized length: ${stats.optimizedLength.toLocaleString()} characters`);
      console.log(`📊 Expansion ratio: ${expansionRatio.toFixed(2)}x`);
      console.log(`🎯 10k+ target: ${stats.optimizedLength >= 10000 ? '✅ ACHIEVED' : '❌ NOT REACHED'}`);
      
      if (stats.optimizedLength >= 10000) {
        console.log(`🎉 SUCCESS! Exceeded target by ${(stats.optimizedLength - 10000).toLocaleString()} characters`);
      } else {
        console.log(`⚠️ Need ${(10000 - stats.optimizedLength).toLocaleString()} more characters to reach 10k target`);
      }
      
      // Save optimized CV to file
      const fileName = `demo-optimized-cv-${stats.optimizedLength}chars.html`;
      fs.writeFileSync(fileName, optimizedCV);
      console.log(`💾 Optimized CV saved to: ${fileName}`);
      
      // Analyze content quality
      const hasHTML = optimizedCV.includes('<html>') || optimizedCV.includes('<!DOCTYPE');
      const hasCSS = optimizedCV.includes('<style>') || optimizedCV.includes('font-family');
      const hasContactInfo = optimizedCV.includes('konrad11811@wp.pl') && optimizedCV.includes('570 625 098');
      const originalLines = testCV.split('\n').filter(line => line.trim()).length;
      const optimizedLines = optimizedCV.split('\n').filter(line => line.trim()).length;
      const hasExpandedContent = optimizedLines > originalLines * 3;
      
      console.log('\n🔍 CONTENT QUALITY ANALYSIS:');
      console.log(`${hasHTML ? '✅' : '❌'} HTML structure present`);
      console.log(`${hasCSS ? '✅' : '❌'} CSS styling included`);
      console.log(`${hasContactInfo ? '✅' : '❌'} Contact info preserved`);
      console.log(`${hasExpandedContent ? '✅' : '❌'} Content significantly expanded (${originalLines} → ${optimizedLines} lines)`);
      
      // Check for power verbs and metrics (indicators of quality expansion)
      const powerVerbs = [
        'spearheaded', 'orchestrated', 'pioneered', 'revolutionized', 
        'optimized', 'exceeded', 'delivered', 'achieved', 'transformed',
        'automated', 'engineered', 'accelerated', 'maximized'
      ];
      const hasMetrics = /\d+%|\d+\s*(PLN|zł|euro|miesiąc|rok|lat|os[oó]b|klientów|procent)/.test(optimizedCV);
      const foundPowerVerbs = powerVerbs.filter(verb => optimizedCV.toLowerCase().includes(verb.toLowerCase()));
      const hasPowerVerbs = foundPowerVerbs.length > 0;
      
      console.log(`${hasPowerVerbs ? '✅' : '❌'} Power verbs used (found: ${foundPowerVerbs.slice(0,3).join(', ')}${foundPowerVerbs.length > 3 ? '...' : ''})`);
      console.log(`${hasMetrics ? '✅' : '❌'} Metrics/numbers included`);
      
      // Check word density and structure
      const words = optimizedCV.split(/\s+/).length;
      const sentences = optimizedCV.split(/[.!?]+/).filter(s => s.trim().length > 5).length;
      const avgWordsPerSentence = (words / sentences).toFixed(1);
      
      console.log('\n📝 STRUCTURE ANALYSIS:');
      console.log(`📖 Total words: ${words.toLocaleString()}`);
      console.log(`💬 Sentences: ${sentences}`);
      console.log(`📏 Avg words/sentence: ${avgWordsPerSentence}`);
      
      // Overall assessment
      const criteria = [
        stats.optimizedLength >= 10000,
        hasHTML,
        hasContactInfo,
        hasExpandedContent,
        hasPowerVerbs,
        hasMetrics,
        expansionRatio >= 15 // Should be at least 15x expansion
      ];
      
      const passedCriteria = criteria.filter(Boolean).length;
      const totalCriteria = criteria.length;
      
      console.log('\n🏆 OVERALL ASSESSMENT:');
      console.log(`📊 Score: ${passedCriteria}/${totalCriteria} criteria met`);
      
      if (passedCriteria >= 6) {
        console.log('🎉 EXCELLENT: Professional-quality 10k+ CV achieved!');
      } else if (passedCriteria >= 4) {
        console.log('✅ GOOD: Solid expansion with room for improvement');
      } else {
        console.log('⚠️ NEEDS WORK: Expansion insufficient for professional standards');
      }
      
      // Preview first 800 chars
      console.log('\n📖 OPTIMIZED CV PREVIEW (first 800 chars):');
      console.log('─'.repeat(60));
      console.log(optimizedCV.substring(0, 800));
      if (optimizedCV.length > 800) {
        console.log('\n[... additional ' + (optimizedCV.length - 800).toLocaleString() + ' characters ...]');
      }
      console.log('─'.repeat(60));
      
      return {
        success: true,
        length: stats.optimizedLength,
        expansion: expansionRatio,
        achievedTarget: stats.optimizedLength >= 10000
      };
      
    } else {
      console.log('❌ Demo optimization failed:', result.error || 'Unknown error');
      return { success: false, error: result.error };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

testDemo10kExpansion()
  .then(result => {
    console.log('\n🏁 FINAL RESULT:', result.success ? 
      `SUCCESS - ${result.length} chars (${result.achievedTarget ? 'TARGET ACHIEVED' : 'BELOW TARGET'})` : 
      `FAILED - ${result.error}`);
  })
  .catch(console.error);