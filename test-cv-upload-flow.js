const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testCVUploadFlow() {
  console.log('🚀 Testing CV Upload Flow...');
  
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
    dataFlow: [],
    screenshots: []
  };

  try {
    // Step 1: Navigate to application
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:3006', { waitUntil: 'networkidle2' });
    
    await page.screenshot({ 
      path: 'screenshot-homepage.png', 
      fullPage: true 
    });
    results.screenshots.push('screenshot-homepage.png');
    
    // Step 2: Click the main "Optymalizuj CV" button
    console.log('🔄 Looking for main CV optimization button...');
    
    // Wait for and click the main CTA button
    await page.waitForSelector('button', { timeout: 5000 });
    
    // Find the "Optymalizuj CV" button
    const ctaButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'));
      return buttons.find(btn => 
        btn.innerText.includes('Optymalizuj CV') || 
        btn.innerText.includes('Rozpocznij') ||
        btn.innerText.includes('Start')
      );
    });
    
    if (!ctaButton) {
      // Try to find any prominent button
      await page.click('button');
      console.log('✅ Clicked main button');
    } else {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], a'));
        const targetBtn = buttons.find(btn => 
          btn.innerText.includes('Optymalizuj CV') || 
          btn.innerText.includes('Rozpocznij') ||
          btn.innerText.includes('Start')
        );
        if (targetBtn) targetBtn.click();
      });
      console.log('✅ Clicked "Optymalizuj CV" button');
    }
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'screenshot-after-cta-click.png', 
      fullPage: true 
    });
    results.screenshots.push('screenshot-after-cta-click.png');
    
    // Step 3: Look for CV upload interface
    console.log('🔄 Looking for CV upload interface...');
    
    // Check for various upload interface patterns
    const uploadInterface = await page.evaluate(() => {
      const patterns = [
        'input[type="file"]',
        '[data-upload]',
        '.upload',
        '.file-upload',
        '.drag-drop',
        '[accept*="pdf"]',
        '[accept*="docx"]',
        '.cv-upload',
        '.upload-area'
      ];
      
      for (const pattern of patterns) {
        const element = document.querySelector(pattern);
        if (element) {
          return {
            found: true,
            pattern: pattern,
            visible: element.offsetParent !== null,
            html: element.outerHTML.substring(0, 200)
          };
        }
      }
      
      // Also check for text indicating file upload
      const bodyText = document.body.innerText;
      const hasUploadText = bodyText.includes('prześlij') || 
                           bodyText.includes('upload') || 
                           bodyText.includes('wybierz plik') ||
                           bodyText.includes('przeciągnij');
      
      return {
        found: hasUploadText,
        pattern: 'text-based',
        bodyText: bodyText.substring(0, 500),
        hasUploadText
      };
    });
    
    results.findings.push({
      step: 'Upload Interface Detection',
      result: uploadInterface
    });
    
    // Step 4: Examine modal or form structure
    console.log('🔄 Examining page structure for forms...');
    
    const pageStructure = await page.evaluate(() => {
      return {
        forms: document.querySelectorAll('form').length,
        fileInputs: document.querySelectorAll('input[type="file"]').length,
        modals: document.querySelectorAll('.modal, [role="dialog"], .overlay').length,
        buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
          text: btn.innerText.trim().substring(0, 50),
          visible: btn.offsetParent !== null,
          classes: btn.className
        })).filter(btn => btn.text),
        textAreas: document.querySelectorAll('textarea').length,
        dragDropZones: document.querySelectorAll('[ondrop], [ondragover], .drag-zone, .drop-zone').length
      };
    });
    
    results.findings.push({
      step: 'Page Structure Analysis',
      result: pageStructure
    });
    
    // Step 5: Try to trigger file upload if interface is found
    if (uploadInterface.found && uploadInterface.pattern !== 'text-based') {
      console.log('🔄 Testing file upload functionality...');
      
      try {
        // Create sample CV file
        const sampleCV = `Jan Kowalski
Email: jan.kowalski@test.com  
Telefon: +48 123 456 789
Adres: ul. Testowa 123, 00-000 Warszawa

DOŚWIADCZENIE ZAWODOWE

Senior Developer - Tech Company Sp. z o.o.
01/2020 - obecnie
- Rozwój aplikacji webowych w React.js i Node.js
- Zarządzanie zespołem 5 deweloperów
- Wdrożenie systemu CI/CD zwiększającego efektywność o 40%
- Mentoring młodszych programistów
- Współpraca z klientami nad projektami o wartości 1,000,000 PLN

Junior Developer - StartupXYZ
06/2018 - 12/2019  
- Programowanie w JavaScript, Python i PHP
- Tworzenie responsywnych interfejsów użytkownika
- Optymalizacja baz danych MySQL i PostgreSQL
- Praca w metodologii Agile/Scrum

WYKSZTAŁCENIE

Magister Informatyki
Uniwersytet Warszawski
2016-2018
Specjalizacja: Inżynieria Oprogramowania

Licencjat Informatyki
Politechnika Warszawska  
2013-2016
Specjalizacja: Systemy Informatyczne

UMIEJĘTNOŚCI TECHNICZNE
- Frontend: JavaScript, React.js, Vue.js, HTML5, CSS3, SASS, TypeScript
- Backend: Node.js, Python, Django, Flask, PHP, Laravel
- Bazy danych: MySQL, PostgreSQL, MongoDB, Redis
- Narzędzia: Git, Docker, Kubernetes, AWS, Jenkins, Nginx
- Metodyki: Agile, Scrum, TDD, CI/CD

JĘZYKI OBCE
- Angielski - poziom C1 (certyfikat Cambridge)
- Niemiecki - poziom B1
- Hiszpański - poziom A2

CERTYFIKATY I KURSY
- AWS Certified Developer Associate (2021)
- Certified Scrum Master (2020) 
- Google Analytics Certified (2019)
- Docker Certified Associate (2021)

PROJEKTY OSOBISTE
- E-commerce Platform - Full-stack aplikacja w React/Node.js obsługująca 1000+ użytkowników
- Task Management App - Progressive Web App z offline mode
- Open Source Contributions - Contributor w 5+ projektach GitHub

ZAINTERESOWANIA
- Fotografia cyfrowa i obróbka zdjęć
- Podróże i poznawanie nowych kultur
- Programowanie open source
- Sporty górskie i wspinaczka`;

        const tempPath = path.join(__dirname, 'temp-test-cv.txt');
        fs.writeFileSync(tempPath, sampleCV);
        
        // Try to upload file
        const fileInput = await page.$(uploadInterface.pattern);
        if (fileInput) {
          await fileInput.uploadFile(tempPath);
          console.log('✅ File uploaded successfully');
          
          await page.waitForTimeout(3000);
          
          await page.screenshot({ 
            path: 'screenshot-after-file-upload.png', 
            fullPage: true 
          });
          results.screenshots.push('screenshot-after-file-upload.png');
          
          // Check if file content was processed
          const fileProcessingResult = await page.evaluate(() => {
            const body = document.body.innerText;
            return {
              hasContent: body.includes('Jan Kowalski'),
              hasExperience: body.includes('Senior Developer'),
              hasEducation: body.includes('Uniwersytet'),
              contentLength: body.length,
              visibleText: body.substring(0, 1000)
            };
          });
          
          results.findings.push({
            step: 'File Processing Results',
            result: fileProcessingResult
          });
        }
        
        // Clean up temp file
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (uploadError) {
        results.findings.push({
          step: 'File Upload Error',
          error: uploadError.message
        });
      }
    }
    
    // Step 6: Test API endpoints directly
    console.log('🔄 Testing API endpoints...');
    
    const apiResults = [];
    
    // Test parse-cv endpoint
    try {
      const testCV = `Test CV Content
Name: Jan Testowy
Email: test@example.com
Experience: 5 years in software development
Skills: JavaScript, React, Node.js, Python, SQL
Education: Computer Science degree
Languages: English (fluent), German (intermediate)`;

      const formData = new FormData();
      const blob = new Blob([testCV], { type: 'text/plain' });
      formData.append('cv', blob, 'test.txt');
      
      const parseResponse = await page.evaluate(async (testContent) => {
        try {
          const formData = new FormData();
          const blob = new Blob([testContent], { type: 'text/plain' });
          formData.append('cv', blob, 'test.txt');
          
          const response = await fetch('/api/parse-cv', {
            method: 'POST',
            body: formData
          });
          
          const data = await response.json();
          return {
            status: response.status,
            success: data.success,
            extractedTextLength: data.extractedText?.length || 0,
            fullResponse: data
          };
        } catch (err) {
          return { error: err.message };
        }
      }, testCV);
      
      apiResults.push({
        endpoint: '/api/parse-cv',
        result: parseResponse
      });
      
      console.log('✅ Parse CV API test:', parseResponse.success ? 'SUCCESS' : 'FAILED');
    } catch (apiError) {
      apiResults.push({
        endpoint: '/api/parse-cv',
        error: apiError.message
      });
    }
    
    // Test session save endpoint
    try {
      const sessionData = {
        sessionId: 'test-session-' + Date.now(),
        cvData: 'Full CV content for testing data integrity and preservation during the complete flow...',
        email: 'test@example.com',
        plan: 'premium',
        template: 'modern',
        photo: null
      };
      
      const sessionResponse = await page.evaluate(async (data) => {
        try {
          const response = await fetch('/api/save-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          const result = await response.json();
          return {
            status: response.status,
            success: result.success,
            dataLength: result.dataLength,
            response: result
          };
        } catch (err) {
          return { error: err.message };
        }
      }, sessionData);
      
      apiResults.push({
        endpoint: '/api/save-session',
        result: sessionResponse
      });
      
      console.log('✅ Save Session API test:', sessionResponse.success ? 'SUCCESS' : 'FAILED');
      
      // Test session retrieval
      if (sessionResponse.success) {
        const retrieveResponse = await page.evaluate(async (sessionId) => {
          try {
            const response = await fetch(`/api/get-session-data?session_id=${sessionId}`);
            const result = await response.json();
            return {
              status: response.status,
              success: result.success,
              retrievedDataLength: result.session?.metadata?.cv?.length || 0,
              response: result
            };
          } catch (err) {
            return { error: err.message };
          }
        }, sessionData.sessionId);
        
        apiResults.push({
          endpoint: '/api/get-session-data',
          result: retrieveResponse
        });
        
        console.log('✅ Get Session API test:', retrieveResponse.success ? 'SUCCESS' : 'FAILED');
        
        // Check data integrity
        const originalLength = sessionData.cvData.length;
        const retrievedLength = retrieveResponse.retrievedDataLength;
        
        results.dataFlow.push({
          test: 'Session Data Integrity',
          originalLength: originalLength,
          retrievedLength: retrievedLength,
          dataPreserved: originalLength === retrievedLength,
          integrity: originalLength === retrievedLength ? 'PERFECT' : 'COMPROMISED'
        });
      }
    } catch (sessionError) {
      apiResults.push({
        endpoint: '/api/save-session',
        error: sessionError.message
      });
    }
    
    results.findings.push({
      step: 'API Endpoints Testing',
      result: apiResults
    });
    
    // Final screenshot
    await page.screenshot({ 
      path: 'screenshot-test-complete.png', 
      fullPage: true 
    });
    results.screenshots.push('screenshot-test-complete.png');
    
  } catch (error) {
    console.error('❌ Test Error:', error);
    results.findings.push({
      step: 'Test Error',
      error: error.message,
      stack: error.stack
    });
  }
  
  await browser.close();
  
  // Save comprehensive results
  const resultsPath = 'cv-upload-flow-results.json';
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('\n📊 CV Upload Flow Test Results:');
  console.log('='.repeat(60));
  
  results.findings.forEach((finding, index) => {
    console.log(`\n${index + 1}. ${finding.step}`);
    if (finding.result) {
      console.log('   Result:', JSON.stringify(finding.result, null, 2).substring(0, 300));
    }
    if (finding.error) {
      console.log('   ❌ Error:', finding.error);
    }
  });
  
  if (results.dataFlow.length > 0) {
    console.log('\n🔄 Data Flow Analysis:');
    results.dataFlow.forEach(flow => {
      console.log(`   ${flow.test}: ${flow.integrity}`);
      console.log(`   Data: ${flow.originalLength} → ${flow.retrievedLength} chars`);
    });
  }
  
  console.log(`\n📄 Full results: ${resultsPath}`);
  console.log(`📸 Screenshots: ${results.screenshots.join(', ')}`);
  
  return results;
}

testCVUploadFlow().catch(console.error);