const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testSuccessPageFunctionality() {
  console.log('🚀 Testing Success Page Functionality and Template Rendering...');
  console.log('='.repeat(70));
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: false,
    slowMo: 1000,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    findings: [],
    templateTests: [],
    functionalityTests: [],
    screenshots: []
  };

  try {
    // First, create a test session with complete CV data
    const sessionId = 'test-session-' + Date.now();
    const comprehensiveCV = `CURRICULUM VITAE

Jan Kowalski
Email: jan.kowalski@example.com
Telefon: +48 123 456 789
Adres: ul. Przykładowa 123, 00-000 Warszawa

[ZDJĘCIE PROFILOWE]

PROFIL ZAWODOWY
Doświadczony Senior Full-Stack Developer z 6+ letnim doświadczeniem w tworzeniu skalowalnych aplikacji webowych i mobilnych. Specjalista w React, Node.js, Python. Lider zespołów, mentor deweloperów.

DOŚWIADCZENIE ZAWODOWE

Senior Full-Stack Developer | TechCorp Poland
03/2020 - obecnie (4 lata)
• Rozwój platformy e-commerce (100,000+ użytkowników/miesiąc)
• Implementacja mikrousług Node.js (+40% wydajności)
• Liderowanie zespołu 8 deweloperów (projekty 2.5M PLN)
• Wdrożenie CI/CD (-60% czasu deploymentu)
• Mentoring 12 junior deweloperów (8 awansów)

Mid-Level Developer | StartupXYZ
08/2018 - 02/2020
• Rozwój PWA w React.js (50,000+ użytkowników)
• API Python/Django (1M+ requestów/dzień)
• Systemy płatności Stripe/PayU (99.9% uptime)
• Architektura mikroserwisowa Docker/K8s

WYKSZTAŁCENIE
Magister Informatyki - Politechnika Warszawska (2017)
Inżynier Informatyki - Uniwersytet Gdański (2015)

UMIEJĘTNOŚCI
Frontend: JavaScript, React.js, Vue.js, TypeScript
Backend: Node.js, Python, Django, PHP
Bazy: PostgreSQL, MongoDB, Redis
DevOps: Docker, AWS, Kubernetes, CI/CD

JĘZYKI
Angielski - C1, Niemiecki - B2

CERTYFIKATY
AWS Developer (2022), ScrumMaster (2021), Google Cloud (2021)`;

    console.log('🔄 Step 1: Creating test session with comprehensive CV data...');
    
    // Create session via API
    const sessionData = {
      sessionId: sessionId,
      cvData: comprehensiveCV,
      jobPosting: 'Senior Full-Stack Developer requiring React, Node.js, AWS experience',
      email: 'test@cvperfect.pl', 
      plan: 'premium',
      template: 'tech',
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
    };
    
    const fetch = require('node-fetch');
    const saveResponse = await fetch('http://localhost:3006/api/save-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
    
    if (!saveResponse.ok) {
      throw new Error('Failed to create test session');
    }
    
    console.log('✅ Test session created successfully');
    
    // Step 2: Navigate to success page with session ID
    console.log('🔄 Step 2: Navigating to success page...');
    const successUrl = `http://localhost:3006/success?session_id=${sessionId}&payment_status=paid`;
    await page.goto(successUrl, { waitUntil: 'networkidle2' });
    
    await page.screenshot({ 
      path: 'screenshot-success-page-load.png', 
      fullPage: true 
    });
    results.screenshots.push('screenshot-success-page-load.png');
    
    // Step 3: Wait for CV data to load and be processed
    console.log('🔄 Step 3: Waiting for CV data to load...');
    
    // Wait for loading to complete
    await page.waitForTimeout(5000);
    
    // Check if CV data is visible
    const cvDataLoaded = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasName: bodyText.includes('Jan Kowalski'),
        hasExperience: bodyText.includes('Senior Full-Stack Developer'),
        hasEducation: bodyText.includes('Politechnika'),
        hasSkills: bodyText.includes('React'),
        contentLength: bodyText.length,
        visibleSections: {
          experience: !!document.querySelector('.experience, [data-section="experience"]'),
          education: !!document.querySelector('.education, [data-section="education"]'),
          skills: !!document.querySelector('.skills, [data-section="skills"]'),
          contact: !!document.querySelector('.contact, [data-section="contact"]')
        }
      };
    });
    
    results.findings.push({
      step: 'CV Data Loading',
      result: cvDataLoaded
    });
    
    console.log(`   Name visible: ${cvDataLoaded.hasName ? 'YES' : 'NO'}`);
    console.log(`   Experience visible: ${cvDataLoaded.hasExperience ? 'YES' : 'NO'}`);
    console.log(`   Education visible: ${cvDataLoaded.hasEducation ? 'YES' : 'NO'}`);
    console.log(`   Skills visible: ${cvDataLoaded.hasSkills ? 'YES' : 'NO'}`);
    console.log(`   Content length: ${cvDataLoaded.contentLength} chars`);
    
    results.tests.push({
      name: 'CV Data Loading',
      status: cvDataLoaded.hasName && cvDataLoaded.hasExperience ? 'PASSED' : 'FAILED',
      details: cvDataLoaded
    });
    
    // Step 4: Test Template Switching
    console.log('🔄 Step 4: Testing template switching functionality...');
    
    const templateButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, .template, .template-option'));
      return buttons.map(btn => ({
        text: btn.innerText?.trim().substring(0, 50),
        classes: btn.className,
        visible: btn.offsetParent !== null,
        hasTemplateIndicator: btn.innerText?.includes('Template') || 
                             btn.className?.includes('template') ||
                             btn.innerText?.includes('Tech') ||
                             btn.innerText?.includes('Luxury') ||
                             btn.innerText?.includes('Minimal')
      })).filter(btn => btn.text && btn.hasTemplateIndicator);
    });
    
    console.log(`   Found ${templateButtons.length} template-related buttons`);
    
    if (templateButtons.length > 0) {
      // Try to click different templates
      for (let i = 0; i < Math.min(3, templateButtons.length); i++) {
        try {
          const templateButton = templateButtons[i];
          console.log(`   Testing template: ${templateButton.text}`);
          
          // Click template button
          await page.evaluate((index) => {
            const buttons = Array.from(document.querySelectorAll('button, .template, .template-option'));
            const templateBtns = buttons.filter(btn => 
              btn.innerText?.includes('Template') || 
              btn.className?.includes('template') ||
              btn.innerText?.includes('Tech') ||
              btn.innerText?.includes('Luxury') ||
              btn.innerText?.includes('Minimal')
            );
            if (templateBtns[index]) {
              templateBtns[index].click();
            }
          }, i);
          
          await page.waitForTimeout(2000);
          
          // Take screenshot of template
          await page.screenshot({ 
            path: `screenshot-template-${i + 1}.png`, 
            fullPage: true 
          });
          results.screenshots.push(`screenshot-template-${i + 1}.png`);
          
          results.templateTests.push({
            template: templateButton.text,
            status: 'TESTED',
            screenshot: `screenshot-template-${i + 1}.png`
          });
          
        } catch (templateError) {
          results.templateTests.push({
            template: templateButtons[i].text,
            status: 'ERROR',
            error: templateError.message
          });
        }
      }
    }
    
    // Step 5: Test Core Functions
    console.log('🔄 Step 5: Testing core functionality (AI optimization, export, email)...');
    
    const coreFeatures = {
      aiOptimization: false,
      pdfExport: false,
      docxExport: false,
      emailFunction: false,
      photoSupport: false
    };
    
    // Check for AI optimization button
    const aiButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => 
        btn.innerText?.includes('Optymalizuj') ||
        btn.innerText?.includes('Optimize') ||
        btn.innerText?.includes('AI')
      );
    });
    
    if (aiButton) {
      coreFeatures.aiOptimization = true;
      console.log('   ✅ AI optimization button found');
      
      // Test AI optimization
      try {
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const aiBtn = buttons.find(btn => 
            btn.innerText?.includes('Optymalizuj') ||
            btn.innerText?.includes('Optimize') ||
            btn.innerText?.includes('AI')
          );
          if (aiBtn) aiBtn.click();
        });
        
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'screenshot-ai-optimization-test.png', 
          fullPage: true 
        });
        results.screenshots.push('screenshot-ai-optimization-test.png');
        
        results.functionalityTests.push({
          feature: 'AI Optimization',
          status: 'TESTED',
          screenshot: 'screenshot-ai-optimization-test.png'
        });
      } catch (aiError) {
        results.functionalityTests.push({
          feature: 'AI Optimization', 
          status: 'ERROR',
          error: aiError.message
        });
      }
    } else {
      console.log('   ⚠️  AI optimization button not found');
    }
    
    // Check for export buttons
    const exportButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return {
        pdf: buttons.find(btn => 
          btn.innerText?.includes('PDF') ||
          btn.innerText?.includes('Export PDF')
        ),
        docx: buttons.find(btn => 
          btn.innerText?.includes('DOCX') ||
          btn.innerText?.includes('Word')
        ),
        email: buttons.find(btn => 
          btn.innerText?.includes('Email') ||
          btn.innerText?.includes('Wyślij') ||
          btn.innerText?.includes('Send')
        )
      };
    });
    
    if (exportButtons.pdf) {
      coreFeatures.pdfExport = true;
      console.log('   ✅ PDF export button found');
    }
    
    if (exportButtons.docx) {
      coreFeatures.docxExport = true;
      console.log('   ✅ DOCX export button found');
    }
    
    if (exportButtons.email) {
      coreFeatures.emailFunction = true;
      console.log('   ✅ Email function button found');
    }
    
    // Check for photo support
    const photoSupport = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const photoInputs = document.querySelectorAll('input[accept*="image"], [data-photo]');
      const photoPlaceholders = document.querySelectorAll('.photo, .profile-photo, [data-profile-photo]');
      
      return {
        images: images.length,
        photoInputs: photoInputs.length,
        photoPlaceholders: photoPlaceholders.length,
        hasProfilePhoto: Array.from(images).some(img => 
          img.src.includes('data:image') || 
          img.alt?.includes('photo') || 
          img.alt?.includes('profile')
        )
      };
    });
    
    coreFeatures.photoSupport = photoSupport.hasProfilePhoto || photoSupport.photoInputs > 0;
    console.log(`   Photo support: ${coreFeatures.photoSupport ? 'YES' : 'NO'}`);
    console.log(`   Images found: ${photoSupport.images}`);
    console.log(`   Photo inputs: ${photoSupport.photoInputs}`);
    
    results.functionalityTests.push({
      feature: 'Core Features Check',
      status: 'COMPLETED',
      features: coreFeatures
    });
    
    // Step 6: Test responsive design
    console.log('🔄 Step 6: Testing responsive design...');
    
    const viewports = [
      { name: 'Desktop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `screenshot-responsive-${viewport.name.toLowerCase()}.png`, 
        fullPage: true 
      });
      results.screenshots.push(`screenshot-responsive-${viewport.name.toLowerCase()}.png`);
      
      console.log(`   ✅ ${viewport.name} screenshot captured`);
    }
    
    // Reset to desktop view
    await page.setViewport({ width: 1366, height: 768 });
    
    // Step 7: Performance and loading check
    console.log('🔄 Step 7: Performance and loading analysis...');
    
    const performance = await page.evaluate(() => {
      return {
        loadTime: window.performance.timing.loadEventEnd - window.performance.timing.navigationStart,
        domContentLoaded: window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart,
        resources: window.performance.getEntriesByType('resource').length,
        errors: window.console?.error?.length || 0
      };
    });
    
    results.findings.push({
      step: 'Performance Analysis',
      result: performance
    });
    
    console.log(`   Load time: ${performance.loadTime}ms`);
    console.log(`   DOM ready: ${performance.domContentLoaded}ms`);
    console.log(`   Resources loaded: ${performance.resources}`);
    
    // Final screenshot
    await page.screenshot({ 
      path: 'screenshot-success-test-complete.png', 
      fullPage: true 
    });
    results.screenshots.push('screenshot-success-test-complete.png');
    
  } catch (error) {
    console.error('❌ Test Error:', error);
    results.findings.push({
      step: 'Test Error',
      error: error.message,
      stack: error.stack
    });
    
    await page.screenshot({ 
      path: 'screenshot-success-test-error.png', 
      fullPage: true 
    });
    results.screenshots.push('screenshot-success-test-error.png');
  }
  
  await browser.close();
  
  // Save comprehensive results
  const resultsPath = 'success-page-test-results.json';
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('\n📊 SUCCESS PAGE FUNCTIONALITY TEST RESULTS:');
  console.log('='.repeat(70));
  
  console.log('\n📋 Core Tests:');
  results.tests.forEach(test => {
    const status = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.status}`);
  });
  
  console.log('\n🎨 Template Tests:');
  results.templateTests.forEach(test => {
    const status = test.status === 'TESTED' ? '✅' : test.status === 'ERROR' ? '❌' : '⚠️';
    console.log(`${status} ${test.template}: ${test.status}`);
  });
  
  console.log('\n⚙️ Functionality Tests:');
  results.functionalityTests.forEach(test => {
    const status = test.status === 'COMPLETED' ? '✅' : test.status === 'TESTED' ? '✅' : '❌';
    console.log(`${status} ${test.feature}: ${test.status}`);
    if (test.features) {
      Object.entries(test.features).forEach(([feature, enabled]) => {
        console.log(`     ${enabled ? '✅' : '❌'} ${feature}: ${enabled ? 'Available' : 'Not found'}`);
      });
    }
  });
  
  console.log(`\n📄 Full results: ${resultsPath}`);
  console.log(`📸 Screenshots: ${results.screenshots.join(', ')}`);
  
  return results;
}

testSuccessPageFunctionality().catch(console.error);