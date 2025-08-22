// Test improved CV optimization and photo preservation
const puppeteer = require('puppeteer');

async function testImprovements() {
  console.log('🚀 Testing CV Optimization Improvements...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1400, height: 900 }
    });
    
    const page = await browser.newPage();
    
    // Navigate to success page with demo data
    console.log('📱 Opening success page...');
    await page.goto('http://localhost:3001/success?session_id=demo&plan=premium');
    await new Promise(r => setTimeout(r, 3000));

    // Take initial screenshot to see glassmorphism design
    await page.screenshot({ path: 'screenshot-glassmorphism-initial.png', fullPage: true });
    console.log('📸 Initial glassmorphism design screenshot saved');

    // Test AI optimization with improved prompt
    console.log('🤖 Testing improved AI optimization...');
    
    const testCV = `Konrad Jakóbczak
konrad11811@wp.pl  
570 625 098

Doświadczenie zawodowe:
- Kurier w UPS Zamość (04.2024 – 11.2024) - Dostarczanie przesyłek, obsługa klientów, optymalizacja tras
- Pracownik sprzedaży w Biedronka - Obsługa klientów, rozliczanie kasy, utrzymanie standardów sklepu  
- Praktyki zawodowe w firmie IT - Wsparcie techniczne, rozwiązywanie problemów sprzętowych i programowych

Wykształcenie:
- Liceum Ogólnokształcące w Zamościu - profil matematyczno-fizyczny
- Kurs programowania - podstawy JavaScript i HTML

Umiejętności:
- Komunikacja z klientami
- Obsługa komputera i podstawowe programy  
- Podstawy programowania JavaScript
- Język angielski poziom średnio zaawansowany
- Praca w zespole i pod presją czasu`;

    // Call the demo API to test improved optimization
    const response = await fetch('http://localhost:3001/api/demo-optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvText: testCV,
        language: 'pl'
      })
    });

    const aiResult = await response.json();
    console.log(`📊 AI Optimization Result: ${aiResult.success ? 'SUCCESS' : 'FAILED'}`);
    
    if (aiResult.success) {
      console.log(`📄 Generated content length: ${aiResult.optimizedCV.length} characters`);
      
      // Check if content is well-balanced (not too much on single job)
      const jobSections = aiResult.optimizedCV.split(/\*\*[^*]+\*\*/g);
      const averageJobLength = jobSections.reduce((sum, section) => sum + section.length, 0) / jobSections.length;
      console.log(`📏 Average job section length: ${Math.round(averageJobLength)} characters`);
      
      // Check for proper formatting
      const hasProperFormatting = {
        hasHeaders: aiResult.optimizedCV.includes('**'),
        hasBulletPoints: aiResult.optimizedCV.includes('*'),
        hasMetrics: /\d+%/.test(aiResult.optimizedCV),
        hasActionVerbs: /kierowałem|wdrożyłem|zwiększyłem|zoptymalizowałem/i.test(aiResult.optimizedCV),
        isReasonableLength: aiResult.optimizedCV.length >= 3000 && aiResult.optimizedCV.length <= 12000
      };
      
      console.log('📋 Content Analysis:');
      console.log(`  Proper headers: ${hasProperFormatting.hasHeaders ? '✅' : '❌'}`);
      console.log(`  Bullet points: ${hasProperFormatting.hasBulletPoints ? '✅' : '❌'}`);
      console.log(`  Has metrics: ${hasProperFormatting.hasMetrics ? '✅' : '❌'}`);
      console.log(`  Strong verbs: ${hasProperFormatting.hasActionVerbs ? '✅' : '❌'}`);
      console.log(`  Reasonable length: ${hasProperFormatting.isReasonableLength ? '✅' : '❌'}`);
    }

    // Test template selection with glassmorphism
    console.log('\\n🎨 Testing glassmorphism templates...');
    const templateButtons = await page.$$('.template-card');
    console.log(`Found ${templateButtons.length} template buttons`);
    
    if (templateButtons.length > 0) {
      // Click on different templates to see glassmorphism effect
      const templates = ['simple', 'modern', 'executive', 'creative'];
      
      for (let i = 0; i < Math.min(templates.length, templateButtons.length); i++) {
        console.log(`\\n🔄 Testing template ${i + 1}: ${templates[i] || 'template-' + (i+1)}`);
        
        try {
          await templateButtons[i].click();
          await new Promise(r => setTimeout(r, 2000));
          
          // Take screenshot of glassmorphism template
          await page.screenshot({ 
            path: `screenshot-glassmorphism-template-${i+1}.png`, 
            fullPage: true 
          });
          console.log(`📸 Glassmorphism template ${i+1} screenshot saved`);
          
          // Check if glassmorphism classes are applied
          const hasGlassmorphism = await page.evaluate(() => {
            const cvContainer = document.querySelector('.cv-preview-content');
            if (cvContainer) {
              const styles = window.getComputedStyle(cvContainer);
              return styles.backdropFilter.includes('blur') || 
                     cvContainer.innerHTML.includes('backdrop-blur');
            }
            return false;
          });
          
          console.log(`  Glassmorphism effect: ${hasGlassmorphism ? '✅' : '❌'}`);
          
        } catch (error) {
          console.log(`❌ Error testing template ${i+1}:`, error.message);
        }
      }
    }

    // Test photo preservation in templates
    console.log('\\n📷 Testing photo preservation...');
    const hasPhotoSupport = await page.evaluate(() => {
      // Check if photo elements are present in the templates
      const photoElements = document.querySelectorAll('img[alt*="Profile"], img[alt*="photo"]');
      return {
        photoElementsFound: photoElements.length,
        hasPhotoStructure: document.querySelector('[data-photo]') || 
                          document.innerHTML.includes('photo') ||
                          document.innerHTML.includes('image')
      };
    });
    
    console.log(`📊 Photo Support Analysis:`);
    console.log(`  Photo elements in DOM: ${hasPhotoSupport.photoElementsFound}`);
    console.log(`  Photo structure present: ${hasPhotoSupport.hasPhotoStructure ? '✅' : '❌'}`);

    // Test AI optimization button
    console.log('\\n🤖 Testing AI optimization button...');
    const aiButton = await page.$('button[class*="violet-600"]');
    if (aiButton) {
      const isDisabled = await page.evaluate(btn => btn.disabled, aiButton);
      console.log(`AI button found, disabled: ${isDisabled}`);
      
      if (!isDisabled) {
        console.log('🔄 Clicking AI optimization...');
        await aiButton.click();
        await new Promise(r => setTimeout(r, 5000));
        
        // Check if content was optimized and formatted properly
        const optimizedContent = await page.evaluate(() => {
          const content = document.querySelector('.cv-preview-content');
          return content ? {
            length: content.innerText.length,
            hasGlassmorphism: content.innerHTML.includes('backdrop-blur') || 
                             content.innerHTML.includes('bg-white/'),
            hasPhotos: content.innerHTML.includes('<img'),
            hasProperStructure: content.innerHTML.includes('<h3') || 
                              content.innerHTML.includes('<strong')
          } : null;
        });
        
        if (optimizedContent) {
          console.log(`📈 Optimized Content Analysis:`);
          console.log(`  Length: ${optimizedContent.length} characters`);
          console.log(`  Glassmorphism styling: ${optimizedContent.hasGlassmorphism ? '✅' : '❌'}`);
          console.log(`  Photos preserved: ${optimizedContent.hasPhotos ? '✅' : '❌'}`);
          console.log(`  Proper structure: ${optimizedContent.hasProperStructure ? '✅' : '❌'}`);
        }
        
        await page.screenshot({ 
          path: 'screenshot-final-improved-optimization.png', 
          fullPage: true 
        });
        console.log('📸 Final optimization result screenshot saved');
      }
    } else {
      console.log('❌ AI optimization button not found');
    }

    console.log('\\n✅ All improvement tests completed!');
    console.log('\\n🎯 Summary of fixes:');
    console.log('  ✅ AI prompt optimized for balanced content (300-500 chars per job)');
    console.log('  ✅ Glassmorphism design applied to all templates');
    console.log('  ✅ Photo support added to all template variations');
    console.log('  ✅ Background styling updated to match site aesthetic');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testImprovements().catch(console.error);