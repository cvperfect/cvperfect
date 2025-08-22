// Test template switching functionality
const puppeteer = require('puppeteer');
const fs = require('fs');

async function testTemplateSwitching() {
  console.log('🚀 Testing Template Switching Functionality...\n');
  
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

    // First, let's test the demo endpoint to get some optimized content
    console.log('🤖 Testing demo AI optimization...');
    
    const testCV = `Konrad Jakóbczak
konrad11811@wp.pl
570 625 098

Doświadczenie zawodowe:
- Kurier w UPS Zamość (04.2024 – 11.2024) - Dostarczanie przesyłek
- Pracownik sprzedaży w Biedronka - Obsługa klientów
- Praktyki zawodowe w firmie IT - Wsparcie techniczne`;

    // Call the demo API to get optimized content
    const response = await fetch('http://localhost:3001/api/demo-optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvText: testCV,
        language: 'pl'
      })
    });

    const aiResult = await response.json();
    console.log(`📊 AI Result: ${aiResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (aiResult.success) {
      console.log(`📄 Generated content length: ${aiResult.optimizedCV.length} characters`);
    }

    // Take initial screenshot
    await page.screenshot({ path: 'screenshot-initial-template.png', fullPage: true });
    console.log('📸 Initial screenshot saved');

    // Test if template selection buttons are visible
    console.log('🎨 Checking template selection buttons...');
    const templateButtons = await page.$$('.template-card');
    console.log(`Found ${templateButtons.length} template buttons`);
    
    if (templateButtons.length > 0) {
      // Test clicking on different templates
      const templates = ['simple', 'modern', 'executive'];
      
      for (const templateName of templates) {
        console.log(`\n🔄 Testing template: ${templateName}`);
        
        // Try to find and click the template button
        try {
          const templateButton = await page.$(`[data-template="${templateName}"]`) || 
                                await page.$(`[class*="${templateName}"]`) ||
                                await page.$$('.template-card')[templates.indexOf(templateName)];
          
          if (templateButton) {
            await templateButton.click();
            await new Promise(r => setTimeout(r, 2000)); // Wait for template to change
            
            // Check if CV content changed
            const cvContent = await page.$eval('.cv-preview-content', el => el.innerHTML.length);
            console.log(`✅ Template ${templateName} clicked, content length: ${cvContent}`);
            
            // Take screenshot of each template
            await page.screenshot({ 
              path: `screenshot-template-${templateName}.png`, 
              fullPage: true 
            });
            console.log(`📸 Screenshot saved for ${templateName} template`);
          } else {
            console.log(`❌ Template button for ${templateName} not found`);
          }
        } catch (error) {
          console.log(`❌ Error testing template ${templateName}:`, error.message);
        }
      }
    } else {
      console.log('❌ No template buttons found - template selection not working');
    }

    // Test if CV content is properly formatted
    console.log('\n📝 Testing CV content formatting...');
    const cvContentEl = await page.$('.cv-preview-content');
    if (cvContentEl) {
      const hasFormatting = await page.evaluate(() => {
        const content = document.querySelector('.cv-preview-content');
        return {
          hasContent: content && content.innerText.length > 100,
          hasHTML: content && content.innerHTML.includes('<'),
          hasMarkdown: content && content.innerText.includes('**'),
          hasProperFormat: content && (
            content.innerHTML.includes('<h3') || 
            content.innerHTML.includes('<strong') ||
            content.innerHTML.includes('<li>')
          )
        };
      });
      
      console.log('📊 CV Content Analysis:');
      console.log(`  Has content: ${hasFormatting.hasContent ? '✅' : '❌'}`);
      console.log(`  Has HTML formatting: ${hasFormatting.hasHTML ? '✅' : '❌'}`);
      console.log(`  Has markdown (bad): ${hasFormatting.hasMarkdown ? '❌' : '✅'}`);
      console.log(`  Has proper formatting: ${hasFormatting.hasProperFormat ? '✅' : '❌'}`);
    }

    // Test AI optimization button if available
    console.log('\n🤖 Testing AI optimization button...');
    const aiButton = await page.$('button[class*="violet-600"]');
    if (aiButton) {
      const isDisabled = await page.evaluate(btn => btn.disabled, aiButton);
      console.log(`AI button found, disabled: ${isDisabled}`);
      
      if (!isDisabled) {
        console.log('🔄 Clicking AI optimization...');
        await aiButton.click();
        await new Promise(r => setTimeout(r, 5000)); // Wait for AI processing
        
        // Check if content changed
        const newContentLength = await page.$eval('.cv-preview-content', 
          el => el.innerText.length);
        console.log(`📈 Content length after AI: ${newContentLength} characters`);
        
        await page.screenshot({ 
          path: 'screenshot-after-ai-optimization.png', 
          fullPage: true 
        });
        console.log('📸 Post-AI optimization screenshot saved');
      }
    } else {
      console.log('❌ AI optimization button not found');
    }

    console.log('\n✅ Template switching test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testTemplateSwitching().catch(console.error);