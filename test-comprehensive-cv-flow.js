const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function comprehensiveCVFlowTest() {
  console.log('🚀 Starting Comprehensive CV Flow Test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,  // Show browser for debugging
    devtools: false,
    slowMo: 500,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    errors: [],
    screenshots: []
  };

  try {
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:3006', { waitUntil: 'networkidle2' });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'screenshot-cv-flow-start.png', 
      fullPage: true 
    });
    results.screenshots.push('screenshot-cv-flow-start.png');
    
    // TEST 1: CV Upload Process
    console.log('🔄 TEST 1: CV Upload Process');
    
    // Look for CV upload area
    await page.waitForSelector('[data-testid="cv-upload"], .upload-area, input[type="file"]', { timeout: 10000 });
    
    // Create a sample CV file for upload
    const sampleCVContent = `Jan Kowalski
Email: jan.kowalski@test.com
Telefon: +48 123 456 789

DOŚWIADCZENIE ZAWODOWE
Senior Developer - ABC Tech
2020-obecnie
- Rozwój aplikacji webowych w React.js
- Zarządzanie zespołem 8 deweloperów
- Wdrożenie systemów o wartości 500,000 PLN

Junior Developer - XYZ Software  
2018-2019
- Programowanie w JavaScript i Python
- Tworzenie interfejsów użytkownika

WYKSZTAŁCENIE
Magister Informatyki - Uniwersytet Warszawski (2018)
Licencjat Informatyki - Politechnika Warszawska (2016)

UMIEJĘTNOŚCI
JavaScript, React.js, Node.js, Python, Django
HTML5, CSS3, MySQL, PostgreSQL, Git, Docker, AWS

JĘZYKI
Angielski - B2, Niemiecki - A2

CERTYFIKATY
AWS Certified Developer (2021)
Scrum Master Certification (2020)`;

    // Write sample CV to temporary file
    const tempCVPath = path.join(__dirname, 'temp-cv-test.txt');
    fs.writeFileSync(tempCVPath, sampleCVContent);
    
    // Upload CV file
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(tempCVPath);
      console.log('✅ CV file uploaded successfully');
      
      // Wait for file processing
      await page.waitForTimeout(3000);
      
      results.tests.push({
        name: 'CV File Upload',
        status: 'PASSED',
        details: 'File uploaded and processed'
      });
    } else {
      throw new Error('File upload input not found');
    }
    
    // Take screenshot after upload
    await page.screenshot({ 
      path: 'screenshot-cv-after-upload.png', 
      fullPage: true 
    });
    results.screenshots.push('screenshot-cv-after-upload.png');
    
    // TEST 2: Data Integrity Check
    console.log('🔄 TEST 2: Data Integrity Check');
    
    // Check if CV content is displayed correctly
    const cvContentVisible = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('Jan Kowalski') && body.includes('Senior Developer') && body.length > 100;
    });
    
    if (cvContentVisible) {
      console.log('✅ CV content is visible and seems complete');
      results.tests.push({
        name: 'CV Content Visibility',
        status: 'PASSED',
        details: 'CV content displayed correctly'
      });
    } else {
      console.log('❌ CV content not visible or incomplete');
      results.tests.push({
        name: 'CV Content Visibility',
        status: 'FAILED',
        details: 'CV content not displayed properly'
      });
    }
    
    // TEST 3: Check for Photo Upload Support
    console.log('🔄 TEST 3: Photo Upload Support Check');
    
    const hasPhotoSupport = await page.evaluate(() => {
      const photoInputs = document.querySelectorAll('input[accept*="image"], [data-photo], .photo-upload');
      return photoInputs.length > 0;
    });
    
    results.tests.push({
      name: 'Photo Upload Support',
      status: hasPhotoSupport ? 'PASSED' : 'FAILED',
      details: hasPhotoSupport ? 'Photo upload controls found' : 'No photo upload controls detected'
    });
    
    // TEST 4: Form Progression
    console.log('🔄 TEST 4: Form Progression Test');
    
    // Look for next step buttons or form progression
    const nextButtons = await page.$$eval('button', buttons => 
      buttons.filter(btn => 
        btn.innerText.toLowerCase().includes('dalej') ||
        btn.innerText.toLowerCase().includes('next') ||
        btn.innerText.toLowerCase().includes('kontynuuj') ||
        btn.innerText.toLowerCase().includes('przejdź')
      )
    );
    
    if (nextButtons.length > 0) {
      console.log('✅ Form progression buttons found');
      
      // Try to click the next button
      try {
        await page.click('button:has-text("Dalej"), button:has-text("Kontynuuj"), button:has-text("Next")');
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
          path: 'screenshot-cv-form-progression.png', 
          fullPage: true 
        });
        results.screenshots.push('screenshot-cv-form-progression.png');
        
        results.tests.push({
          name: 'Form Progression',
          status: 'PASSED',
          details: 'Successfully progressed to next step'
        });
      } catch (err) {
        results.tests.push({
          name: 'Form Progression',
          status: 'FAILED',
          details: `Failed to progress: ${err.message}`
        });
      }
    } else {
      results.tests.push({
        name: 'Form Progression',
        status: 'FAILED',
        details: 'No progression buttons found'
      });
    }
    
    // TEST 5: API Endpoint Testing
    console.log('🔄 TEST 5: API Endpoint Response Testing');
    
    // Test parse-cv endpoint directly
    const apiTests = [];
    
    try {
      const response = await fetch('http://localhost:3006/api/parse-cv', {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          const blob = new Blob([sampleCVContent], { type: 'text/plain' });
          formData.append('cv', blob, 'test-cv.txt');
          return formData;
        })()
      });
      
      if (response.ok) {
        const data = await response.json();
        apiTests.push({
          endpoint: '/api/parse-cv',
          status: 'PASSED',
          details: `Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`
        });
        
        // Check if full text was extracted
        if (data.extractedText && data.extractedText.length > 500) {
          console.log('✅ Full CV text extracted:', data.extractedText.length, 'characters');
        } else {
          console.log('⚠️ CV text extraction seems incomplete:', data.extractedText?.length || 0, 'characters');
        }
      } else {
        apiTests.push({
          endpoint: '/api/parse-cv',
          status: 'FAILED',
          details: `HTTP ${response.status}: ${await response.text()}`
        });
      }
    } catch (apiError) {
      apiTests.push({
        endpoint: '/api/parse-cv',
        status: 'ERROR',
        details: apiError.message
      });
    }
    
    results.tests.push({
      name: 'API Endpoints Testing',
      status: apiTests.every(test => test.status === 'PASSED') ? 'PASSED' : 'MIXED',
      details: apiTests
    });
    
    // TEST 6: Session Data Storage
    console.log('🔄 TEST 6: Session Data Storage Test');
    
    try {
      const sessionTestData = {
        sessionId: 'test-session-' + Date.now(),
        cvData: sampleCVContent,
        email: 'test@cvperfect.pl',
        plan: 'premium',
        template: 'modern',
        photo: null
      };
      
      const saveResponse = await fetch('http://localhost:3006/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionTestData)
      });
      
      if (saveResponse.ok) {
        const saveResult = await saveResponse.json();
        console.log('✅ Session save successful:', saveResult);
        
        // Try to retrieve the saved session
        const getResponse = await fetch(`http://localhost:3006/api/get-session-data?session_id=${sessionTestData.sessionId}`);
        
        if (getResponse.ok) {
          const getResult = await getResponse.json();
          console.log('✅ Session retrieval successful');
          
          // Check if full CV data was preserved
          const retrievedCVLength = getResult.session?.metadata?.cv?.length || 0;
          const originalCVLength = sampleCVContent.length;
          
          if (retrievedCVLength === originalCVLength) {
            console.log('✅ Full CV data preserved in session storage');
            results.tests.push({
              name: 'Session Data Integrity',
              status: 'PASSED',
              details: `Full CV data preserved (${retrievedCVLength}/${originalCVLength} chars)`
            });
          } else {
            console.log('⚠️ CV data truncation detected');
            results.tests.push({
              name: 'Session Data Integrity',
              status: 'FAILED',
              details: `CV data truncated (${retrievedCVLength}/${originalCVLength} chars)`
            });
          }
        } else {
          results.tests.push({
            name: 'Session Data Retrieval',
            status: 'FAILED',
            details: 'Failed to retrieve saved session'
          });
        }
      } else {
        results.tests.push({
          name: 'Session Data Storage',
          status: 'FAILED',
          details: 'Failed to save session data'
        });
      }
    } catch (sessionError) {
      results.tests.push({
        name: 'Session Data Storage',
        status: 'ERROR',
        details: sessionError.message
      });
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'screenshot-cv-flow-final.png', 
      fullPage: true 
    });
    results.screenshots.push('screenshot-cv-flow-final.png');
    
    // Clean up temporary file
    if (fs.existsSync(tempCVPath)) {
      fs.unlinkSync(tempCVPath);
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error);
    results.errors.push(error.message);
    
    await page.screenshot({ 
      path: 'screenshot-cv-flow-error.png', 
      fullPage: true 
    });
    results.screenshots.push('screenshot-cv-flow-error.png');
  }
  
  await browser.close();
  
  // Save results to file
  const resultsPath = 'cv-flow-test-results.json';
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('📊 Test Results Summary:');
  console.log('='.repeat(50));
  results.tests.forEach(test => {
    console.log(`${test.status === 'PASSED' ? '✅' : '❌'} ${test.name}: ${test.status}`);
    if (test.details && typeof test.details === 'string') {
      console.log(`   ${test.details}`);
    }
  });
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  console.log(`\n📄 Results saved to: ${resultsPath}`);
  console.log(`📸 Screenshots: ${results.screenshots.join(', ')}`);
  
  return results;
}

// Run the test
comprehensiveCVFlowTest().catch(console.error);