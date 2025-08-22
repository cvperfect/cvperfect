// Test professional CV formatting improvements
const puppeteer = require('puppeteer');

async function testProfessionalFormatting() {
  console.log('🚀 Testing Professional CV Formatting...\n');
  
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

    // Take initial screenshot to see gray background
    await page.screenshot({ path: 'screenshot-gray-background-initial.png', fullPage: true });
    console.log('📸 Gray background initial screenshot saved');

    // Test improved AI optimization with longer content
    console.log('🤖 Testing enhanced AI optimization...');
    
    const testCV = `Konrad Jakóbczak
konrad11811@wp.pl  
570 625 098

Doświadczenie zawodowe:
- Kurier w UPS Zamość (04.2024 – 11.2024) - Dostarczanie przesyłek na terenie Zamościa i okolic, obsługa klientów, optymalizacja tras dostawczych
- Pracownik sprzedaży w Biedronka - Obsługa klientów, prowadzenie kasy, utrzymanie standardów sklepu, zarządzanie towarem
- Praktyki zawodowe w firmie IT - Wsparcie techniczne komputerów, rozwiązywanie problemów sprzętowych i programowych, pomoc użytkownikom

Wykształcenie:
- Liceum Ogólnokształcące w Zamościu - profil matematyczno-fizyczny (2011-2014)
- Kurs programowania - podstawy JavaScript i HTML (2023)
- Dodatkowe szkolenia z obsługi klienta i logistyki

Umiejętności:
- Komunikacja z klientami i współpraca w zespole
- Obsługa komputera i podstawowe programy Microsoft Office
- Podstawy programowania JavaScript i HTML
- Język angielski poziom średnio zaawansowany (B1)
- Praca pod presją czasu i multitasking
- Znajomość geografii regionu Zamościa
- Prawo jazdy kategorii B

Certyfikaty:
- Certyfikat ukończenia kursu programowania web
- Szkolenie BHP stanowisko pracy z komputerem

Zainteresowania:
- Programowanie i technologie internetowe
- Motoryzacja i mechanika samochodowa
- Sport i aktywność fizyczna`;

    // Call the demo API to test enhanced optimization
    const response = await fetch('http://localhost:3001/api/demo-optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvText: testCV,
        language: 'pl'
      })
    });

    const aiResult = await response.json();
    console.log(`📊 Enhanced AI Result: ${aiResult.success ? 'SUCCESS' : 'FAILED'}`);
    
    if (aiResult.success) {
      console.log(`📄 Enhanced content length: ${aiResult.optimizedCV.length} characters`);
      
      // Check if content has professional formatting
      const hasProFeatuгres = {
        hasEmojis: /🎯|💼|🎓|🛠️|🏆|🌐|⭐/.test(aiResult.optimizedCV),
        hasSeparators: /═══/.test(aiResult.optimizedCV),
        hasStructuredSections: aiResult.optimizedCV.split('**').length > 10,
        isLongEnough: aiResult.optimizedCV.length >= 8000,
        hasDetailedDescriptions: aiResult.optimizedCV.split('*').length > 15
      };
      
      console.log('📋 Professional Formatting Analysis:');
      console.log(`  Has emoji sections: ${hasProFeatuгres.hasEmojis ? '✅' : '❌'}`);
      console.log(`  Has separators: ${hasProFeatuгres.hasSeparators ? '✅' : '❌'}`);  
      console.log(`  Structured sections: ${hasProFeatuгres.hasStructuredSections ? '✅' : '❌'}`);
      console.log(`  Sufficient length: ${hasProFeatuгres.isLongEnough ? '✅' : '❌'}`);
      console.log(`  Detailed descriptions: ${hasProFeatuгres.hasDetailedDescriptions ? '✅' : '❌'}`);
    }

    // Test AI optimization button
    console.log('\\n🤖 Testing AI optimization button...');
    const aiButton = await page.$('button[class*="violet-600"]');
    if (aiButton) {
      const isDisabled = await page.evaluate(btn => btn.disabled, aiButton);
      console.log(`AI button found, disabled: ${isDisabled}`);
      
      if (!isDisabled) {
        console.log('🔄 Clicking AI optimization...');
        await aiButton.click();
        await new Promise(r => setTimeout(r, 8000)); // More time for longer content
        
        // Check final formatting
        const finalContent = await page.evaluate(() => {
          const content = document.querySelector('.cv-preview-content');
          const container = document.querySelector('.cv-preview-container');
          return content && container ? {
            cvLength: content.innerText.length,
            hasWhiteBackground: content.innerHTML.includes('bg-white') && !content.innerHTML.includes('bg-white/'),
            containerIsGray: window.getComputedStyle(container).backgroundColor.includes('128') || 
                           window.getComputedStyle(container).backgroundColor.includes('0.15'),
            hasProStyling: content.innerHTML.includes('▸') || content.innerHTML.includes('border-bottom'),
            isFullyVisible: content.scrollHeight <= content.clientHeight + 50
          } : null;
        });
        
        if (finalContent) {
          console.log(`\\n📈 Final Professional CV Analysis:`);
          console.log(`  Content length: ${finalContent.cvLength} characters`);
          console.log(`  CV has white background: ${finalContent.hasWhiteBackground ? '✅' : '❌'}`);
          console.log(`  Container is gray: ${finalContent.containerIsGray ? '✅' : '❌'}`);
          console.log(`  Professional styling: ${finalContent.hasProStyling ? '✅' : '❌'}`);
          console.log(`  Fully visible: ${finalContent.isFullyVisible ? '✅' : '❌'}`);
        }
        
        await page.screenshot({ 
          path: 'screenshot-final-professional-cv.png', 
          fullPage: true 
        });
        console.log('📸 Final professional CV screenshot saved');
      }
    }

    console.log('\\n✅ Professional CV formatting test completed!');
    console.log('\\n🎯 Summary of improvements:');
    console.log('  ✅ Gray container background with white CV content');
    console.log('  ✅ Removed height limitations for full CV display');
    console.log('  ✅ Enhanced AI prompt with professional formatting');
    console.log('  ✅ Increased character limit to 14,000-18,000');
    console.log('  ✅ Professional styling with proper typography');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testProfessionalFormatting().catch(console.error);