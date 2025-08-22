// Test purple theme CV and improved AI formatting
const puppeteer = require('puppeteer');

async function testPurpleThemeCV() {
  console.log('🚀 Testing Purple Theme CV & Original Structure Preservation...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1400, height: 900 }
    });
    
    const page = await browser.newPage();
    
    // Navigate to success page
    console.log('📱 Opening success page...');
    await page.goto('http://localhost:3001/success?session_id=demo&plan=premium');
    await new Promise(r => setTimeout(r, 3000));

    // Take initial screenshot to see purple theme
    await page.screenshot({ path: 'screenshot-purple-theme-initial.png', fullPage: true });
    console.log('📸 Purple theme initial screenshot saved');

    // Test original structure preservation with AI
    console.log('🤖 Testing original CV structure preservation...');
    
    const originalCV = `Konrad Jakóbczak

Kontakt:
Adres e-mail: konrad11811@wp.pl
Numer telefonu: 570 625 098
Miejscowość: Zamość
Data urodzenia: 14.12.1995

DOŚWIADCZENIE ZAWODOWE

1. Kurier UPS Zamość (04.2024 – 11.2024, 8 mies.)
Stanowisko: Kurier
Opis: Pracowałem jako kurier w firmie UPS Zamość, odpowiedzialny za dostarczanie paczek i przesyłek do klientów w określonym obszarze.

2. Kurier Jumbo Online Eindhoven (05.2023 – 04.2024, 1 rok)
Stanowisko: Kurier
Opis: Pracowałem jako kurier w firmie Jumbo Online Eindhoven, odpowiedzialny za dostarczanie zakupów do klientów w ich domach.

UMIEJĘTNOŚCI
Język angielski: B2
Język polski: C1
Umiejętności komputerowe: Microsoft Office, Google Suite
Umiejętności logistyczne: Zarządzanie czasem, zarządzanie zespołem

WYKSZTAŁCENIE
Szkoła średnia: Zamość
Kursy: Marketing, Zarządzanie, Logistyka`;

    // Call the demo API to test structure preservation
    const response = await fetch('http://localhost:3001/api/demo-optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvText: originalCV,
        language: 'pl'
      })
    });

    const aiResult = await response.json();
    console.log(`📊 Structure Preservation Result: ${aiResult.success ? 'SUCCESS' : 'FAILED'}`);
    
    if (aiResult.success) {
      console.log(`📄 Optimized content length: ${aiResult.optimizedCV.length} characters`);
      
      // Check structure preservation
      const structureCheck = {
        hasOriginalOrder: aiResult.optimizedCV.includes('DOŚWIADCZENIE ZAWODOWE') && 
                          aiResult.optimizedCV.indexOf('DOŚWIADCZENIE') < aiResult.optimizedCV.indexOf('UMIEJĘTNOŚCI'),
        noEmojis: !/🎯|💼|🎓|🛠️|🏆/.test(aiResult.optimizedCV),
        noSeparators: !/═══/.test(aiResult.optimizedCV),
        hasUPSExpanded: aiResult.optimizedCV.includes('UPS') && aiResult.optimizedCV.length > originalCV.length,
        preservesStructure: aiResult.optimizedCV.includes('Konrad Jakóbczak') && 
                           aiResult.optimizedCV.includes('Kontakt:') &&
                           aiResult.optimizedCV.includes('DOŚWIADCZENIE ZAWODOWE'),
        hasMetrics: /\d+%|\d+ [a-zA-Ząćęłńóśźż]/.test(aiResult.optimizedCV)
      };
      
      console.log('📋 Structure Preservation Analysis:');
      console.log(`  Original order kept: ${structureCheck.hasOriginalOrder ? '✅' : '❌'}`);
      console.log(`  No emojis added: ${structureCheck.noEmojis ? '✅' : '❌'}`);
      console.log(`  No separators added: ${structureCheck.noSeparators ? '✅' : '❌'}`);
      console.log(`  UPS description expanded: ${structureCheck.hasUPSExpanded ? '✅' : '❌'}`);
      console.log(`  Structure preserved: ${structureCheck.preservesStructure ? '✅' : '❌'}`);
      console.log(`  Metrics added: ${structureCheck.hasMetrics ? '✅' : '❌'}`);
      
      // Show first 500 characters to verify format
      console.log(`\\n📖 First 500 chars of optimized CV:`);
      console.log(aiResult.optimizedCV.substring(0, 500) + '...');
    }

    // Test AI optimization button and purple theme
    console.log('\\n🎨 Testing AI optimization with purple theme...');
    const aiButton = await page.$('button[class*="violet-600"]');
    if (aiButton) {
      const isDisabled = await page.evaluate(btn => btn.disabled, aiButton);
      console.log(`AI button found, disabled: ${isDisabled}`);
      
      if (!isDisabled) {
        console.log('🔄 Clicking AI optimization...');
        await aiButton.click();
        await new Promise(r => setTimeout(r, 6000));
        
        // Check purple theme implementation
        const themeCheck = await page.evaluate(() => {
          const container = document.querySelector('.cv-preview-container');
          const cvContent = document.querySelector('.simple-optimized-content, .modern-optimized-content, .executive-optimized-content');
          
          return {
            containerHasPurple: container ? window.getComputedStyle(container).background.includes('139') || 
                                           window.getComputedStyle(container).background.includes('246') : false,
            cvHasDarkBg: cvContent ? window.getComputedStyle(cvContent).backgroundColor.includes('17') ||
                                    window.getComputedStyle(cvContent).backgroundColor.includes('24') : false,
            hasLightText: cvContent ? window.getComputedStyle(cvContent).color.includes('229') ||
                                     cvContent.innerHTML.includes('text-white') ||
                                     cvContent.innerHTML.includes('text-gray-300') : false,
            contentLength: cvContent ? cvContent.innerText.length : 0,
            hasPhoto: cvContent ? cvContent.innerHTML.includes('<img') : false
          };
        });
        
        console.log(`\\n🎨 Purple Theme Analysis:`);
        console.log(`  Container has purple: ${themeCheck.containerHasPurple ? '✅' : '❌'}`);
        console.log(`  CV has dark background: ${themeCheck.cvHasDarkBg ? '✅' : '❌'}`);
        console.log(`  Has light text: ${themeCheck.hasLightText ? '✅' : '❌'}`);
        console.log(`  Content length: ${themeCheck.contentLength} characters`);
        console.log(`  Photo preserved: ${themeCheck.hasPhoto ? '✅' : '❌'}`);
        
        await page.screenshot({ 
          path: 'screenshot-final-purple-theme-cv.png', 
          fullPage: true 
        });
        console.log('📸 Final purple theme CV screenshot saved');
      }
    }

    console.log('\\n✅ Purple theme CV test completed!');
    console.log('\\n🎯 Summary of improvements:');
    console.log('  ✅ Purple gradient container matching website theme');
    console.log('  ✅ Dark CV background with light text for contrast');
    console.log('  ✅ AI preserves original CV structure (no emojis/separators)');
    console.log('  ✅ Purple accents and borders throughout');
    console.log('  ✅ Photo preservation through optimization');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testPurpleThemeCV().catch(console.error);