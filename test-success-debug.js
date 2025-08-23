// Test success.js page functionality
const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 Starting success.js debug test...');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Add console logging
    page.on('console', msg => {
      if (msg.text().includes('EMERGENCY') || msg.text().includes('ERROR') || msg.text().includes('fetchUserDataFromSession')) {
        console.log('Browser console:', msg.text());
      }
    });
    
    // Test with known session ID
    const testUrl = 'http://localhost:3000/success?session_id=sess_1755865667776_22z3osqrw';
    console.log('📍 Navigating to:', testUrl);
    
    await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for data to load
    
    // Check page state
    const pageAnalysis = await page.evaluate(() => {
      const result = {
        title: document.title,
        hasEmergencyLoader: false,
        cvDataPresent: false,
        templateSelected: null,
        errors: [],
        warnings: [],
        sessionId: null,
        cvContent: null,
        userName: null
      };
      
      // Check for emergency loader traces
      const emergencyLogs = Array.from(document.querySelectorAll('*')).filter(el => 
        el.innerText && el.innerText.includes('EMERGENCY')
      );
      result.hasEmergencyLoader = emergencyLogs.length > 0;
      
      // Check for CV preview
      const cvPreview = document.querySelector('.cv-preview, [class*="cv"], [class*="template"]');
      result.cvDataPresent = !!cvPreview;
      
      // Get selected template
      const templateElement = document.querySelector('[data-template], .template-selected');
      if (templateElement) {
        result.templateSelected = templateElement.getAttribute('data-template') || 'unknown';
      }
      
      // Check for errors
      const errorElements = document.querySelectorAll('.error, [class*="error"]');
      result.errors = Array.from(errorElements).map(el => el.innerText).slice(0, 5);
      
      // Check for warnings
      const warningElements = document.querySelectorAll('.warning, [class*="warning"]');
      result.warnings = Array.from(warningElements).map(el => el.innerText).slice(0, 5);
      
      // Get session ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      result.sessionId = urlParams.get('session_id');
      
      // Check for CV content
      const cvContentElement = document.querySelector('.cv-content, [class*="cv-text"]');
      if (cvContentElement) {
        result.cvContent = cvContentElement.innerText.substring(0, 200);
      }
      
      // Check for user name
      const nameElement = document.querySelector('h1, h2, .name, [class*="name"]');
      if (nameElement && nameElement.innerText.includes('Konrad')) {
        result.userName = nameElement.innerText;
      }
      
      return result;
    });
    
    console.log('\n📊 Page Analysis Results:');
    console.log('================================');
    console.log('✓ Page Title:', pageAnalysis.title);
    console.log('✓ Session ID:', pageAnalysis.sessionId);
    console.log('✓ Emergency Loader:', pageAnalysis.hasEmergencyLoader ? '⚠️ ACTIVE' : '✅ Not needed');
    console.log('✓ CV Data Present:', pageAnalysis.cvDataPresent ? '✅ YES' : '❌ NO');
    console.log('✓ Template Selected:', pageAnalysis.templateSelected || '❌ None');
    console.log('✓ User Name Found:', pageAnalysis.userName || '❌ Not found');
    
    if (pageAnalysis.errors.length > 0) {
      console.log('\n❌ Errors Found:');
      pageAnalysis.errors.forEach(err => console.log('  -', err));
    }
    
    if (pageAnalysis.warnings.length > 0) {
      console.log('\n⚠️ Warnings Found:');
      pageAnalysis.warnings.forEach(warn => console.log('  -', warn));
    }
    
    if (pageAnalysis.cvContent) {
      console.log('\n📄 CV Content Preview:');
      console.log(pageAnalysis.cvContent);
    }
    
    // Test API endpoint directly
    console.log('\n🔍 Testing API endpoint directly...');
    const apiResponse = await page.evaluate(async (sessionId) => {
      try {
        const response = await fetch(`/api/get-session-data?session_id=${sessionId}`);
        const data = await response.json();
        return {
          success: data.success,
          hasCV: !!data.cvData,
          cvLength: data.cvData ? data.cvData.length : 0,
          email: data.email,
          plan: data.plan
        };
      } catch (error) {
        return { error: error.message };
      }
    }, pageAnalysis.sessionId);
    
    console.log('API Response:', apiResponse);
    
    // Take screenshot for visual debugging
    await page.screenshot({ path: 'debug-success-page.png', fullPage: true });
    console.log('\n📸 Screenshot saved as debug-success-page.png');
    
    // Final verdict
    console.log('\n🎯 FINAL VERDICT:');
    if (pageAnalysis.cvDataPresent && !pageAnalysis.errors.length) {
      console.log('✅ SUCCESS.JS IS WORKING PROPERLY');
    } else {
      console.log('❌ ISSUES DETECTED IN SUCCESS.JS');
      console.log('Recommendations:');
      if (!pageAnalysis.cvDataPresent) {
        console.log('  - CV data is not loading properly');
        console.log('  - Check fetchUserDataFromSession function');
        console.log('  - Verify API endpoint /api/get-session-data');
      }
      if (pageAnalysis.hasEmergencyLoader) {
        console.log('  - Emergency loader is active (indicates main loader failure)');
      }
      if (pageAnalysis.errors.length > 0) {
        console.log('  - Fix the errors listed above');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
    console.log('\n✅ Test completed');
  }
})();