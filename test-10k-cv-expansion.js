// Comprehensive Test for 10,000+ Character CV Expansion & Success.js Redesign
// Tests the enhanced AI optimization and glassmorphism UI improvements

const puppeteer = require('puppeteer');
const fs = require('fs');

// Test CV Data - Real example for expansion testing
const testCVData = {
  personalInfo: {
    name: 'Konrad Jakóbczak',
    email: 'konrad11811@wp.pl',
    phone: '570 625 098',
    location: 'Zamość, Poland'
  },
  experience: [
    'Kurier w UPS Zamość (04.2024 – 11.2024) - Dostarczanie przesyłek',
    'Pracownik sprzedaży w Biedronka - Obsługa klientów i kasa',
    'Praktyki zawodowe w firmie IT - Wsparcie techniczne'
  ],
  education: [
    'Liceum Ogólnokształcące - profil matematyczny',
    'Kurs programowania - podstawy JavaScript'
  ],
  skills: [
    'Komunikacja z klientami',
    'Obsługa komputera',
    'Podstawy programowania',
    'Język angielski - średnio zaawansowany',
    'Praca w zespole'
  ]
};

async function runComprehensiveTest() {
  console.log('🚀 Starting 10,000+ Character CV Expansion Test...\n');
  
  let browser;
  let testResults = {
    timestamp: new Date().toISOString(),
    tests: {},
    errors: [],
    screenshots: []
  };

  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    console.log('📱 Navigating to success page...');
    await page.goto('http://localhost:3000/success?session_id=demo&plan=premium');
    await page.waitForTimeout(3000);

    // Test 1: Check if glassmorphism redesign is applied
    console.log('🎨 Testing glassmorphism redesign...');
    const glassmorphismElements = await page.$$eval('.premium-section, .cv-header, .action-buttons button', 
      elements => elements.map(el => ({
        hasBackdropFilter: getComputedStyle(el).backdropFilter !== 'none',
        hasGradientBorder: getComputedStyle(el).borderImage !== 'none' || 
                          getComputedStyle(el).background.includes('gradient'),
        hasShadow: getComputedStyle(el).boxShadow !== 'none'
      }))
    );
    
    testResults.tests.glassmorphismUI = {
      passed: glassmorphismElements.some(el => el.hasBackdropFilter || el.hasGradientBorder),
      details: `Found ${glassmorphismElements.filter(el => el.hasBackdropFilter).length} elements with backdrop-filter`
    };
    
    await page.screenshot({
      path: 'screenshot-redesigned-ui.png',
      fullPage: true
    });
    testResults.screenshots.push('screenshot-redesigned-ui.png');

    // Test 2: Check button gradient redesign
    console.log('🎯 Testing button gradient designs...');
    const buttonStyles = await page.$$eval('.action-buttons button', buttons => 
      buttons.map(btn => ({
        hasGradient: getComputedStyle(btn).background.includes('gradient'),
        hasRoundedCorners: parseFloat(getComputedStyle(btn).borderRadius) > 20,
        hasHoverTransform: btn.className.includes('hover:scale') || btn.className.includes('hover:-translate')
      }))
    );
    
    testResults.tests.buttonRedesign = {
      passed: buttonStyles.every(btn => btn.hasGradient && btn.hasRoundedCorners),
      details: `${buttonStyles.filter(btn => btn.hasGradient).length}/${buttonStyles.length} buttons have gradients`
    };

    // Test 3: Load demo CV data and test AI optimization
    console.log('🤖 Testing AI optimization with 10k+ character expansion...');
    
    // Wait for CV data to load
    await page.waitForSelector('.cv-preview-content', { timeout: 10000 });
    
    // Get initial CV length
    const initialContent = await page.evaluate(() => {
      const cvElement = document.querySelector('.cv-preview-content');
      return cvElement ? cvElement.innerText.length : 0;
    });
    
    console.log(`📄 Initial CV content: ${initialContent} characters`);
    
    // Click AI optimization button
    const aiButton = await page.$('button[class*="from-violet-600"]');
    if (aiButton) {
      console.log('🔄 Clicking AI optimization button...');
      await aiButton.click();
      
      // Wait for optimization to complete (with longer timeout for AI)
      await page.waitForTimeout(2000);
      
      // Check for optimization progress/completion
      let optimizationComplete = false;
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes timeout
      
      while (!optimizationComplete && attempts < maxAttempts) {
        const hasSpinner = await page.$('.animate-spin');
        const notificationText = await page.evaluate(() => {
          const notifications = document.querySelectorAll('.fixed.top-4');
          return Array.from(notifications).map(n => n.textContent).join(' ');
        });
        
        console.log(`⏳ Attempt ${attempts + 1}: ${notificationText}`);
        
        if (!hasSpinner && notificationText.includes('zoptymalizowane')) {
          optimizationComplete = true;
        } else if (notificationText.includes('error') || notificationText.includes('błąd')) {
          console.log('❌ Optimization failed:', notificationText);
          break;
        }
        
        await page.waitForTimeout(2000);
        attempts++;
      }
      
      if (optimizationComplete) {
        // Get optimized CV length
        await page.waitForTimeout(3000);
        const optimizedContent = await page.evaluate(() => {
          const cvElement = document.querySelector('.cv-preview-content');
          return cvElement ? cvElement.innerText.length : 0;
        });
        
        console.log(`📈 Optimized CV content: ${optimizedContent} characters`);
        
        const expansionRatio = optimizedContent / initialContent;
        const achieved10k = optimizedContent >= 10000;
        
        testResults.tests.aiOptimization = {
          passed: achieved10k && expansionRatio > 2,
          initialLength: initialContent,
          optimizedLength: optimizedContent,
          expansionRatio: expansionRatio.toFixed(2),
          achieved10kTarget: achieved10k,
          details: achieved10k ? 
            `✅ SUCCESS: Achieved ${optimizedContent} characters (${expansionRatio.toFixed(2)}x expansion)` :
            `❌ FAILED: Only ${optimizedContent} characters (target: 10,000+)`
        };
        
        // Take screenshot of optimized CV
        await page.screenshot({
          path: 'screenshot-10k-optimized-cv.png',
          fullPage: true
        });
        testResults.screenshots.push('screenshot-10k-optimized-cv.png');
        
      } else {
        testResults.tests.aiOptimization = {
          passed: false,
          error: 'Optimization timed out or failed',
          details: 'AI optimization did not complete within 2 minutes'
        };
      }
    } else {
      testResults.tests.aiOptimization = {
        passed: false,
        error: 'AI optimization button not found'
      };
    }

    // Test 4: Test export functionality
    console.log('📄 Testing PDF export...');
    const pdfButton = await page.$('button[class*="from-emerald-500"]');
    if (pdfButton) {
      await pdfButton.click();
      await page.waitForTimeout(3000);
      
      const exportNotification = await page.evaluate(() => {
        const notifications = document.querySelectorAll('.fixed.top-4');
        return Array.from(notifications).map(n => n.textContent).join(' ');
      });
      
      testResults.tests.pdfExport = {
        passed: exportNotification.includes('pobrany') || exportNotification.includes('PDF'),
        details: exportNotification
      };
    }

    // Test 5: Test responsive design
    console.log('📱 Testing responsive design...');
    await page.setViewport({ width: 375, height: 812 }); // Mobile
    await page.waitForTimeout(2000);
    
    const mobileLayout = await page.evaluate(() => {
      const actionButtons = document.querySelector('.action-buttons');
      const gridCols = getComputedStyle(actionButtons).gridTemplateColumns;
      return {
        isSingleColumn: gridCols === 'none' || gridCols.split(' ').length === 1,
        buttonsVisible: document.querySelectorAll('.action-buttons button').length > 0
      };
    });
    
    testResults.tests.responsiveDesign = {
      passed: mobileLayout.isSingleColumn && mobileLayout.buttonsVisible,
      details: `Mobile layout: ${mobileLayout.isSingleColumn ? 'Single column' : 'Multi column'}`
    };
    
    await page.screenshot({
      path: 'screenshot-mobile-responsive.png',
      fullPage: true
    });
    testResults.screenshots.push('screenshot-mobile-responsive.png');

    // Test 6: Check for infinite loops or rendering issues
    console.log('🔄 Checking for rendering stability...');
    const initialRenderCount = await page.evaluate(() => {
      let renderCount = 0;
      const observer = new MutationObserver(() => renderCount++);
      observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
      
      setTimeout(() => observer.disconnect(), 5000);
      return new Promise(resolve => {
        setTimeout(() => resolve(renderCount), 5000);
      });
    });
    
    testResults.tests.renderingStability = {
      passed: await initialRenderCount < 100, // Reasonable number of DOM changes
      mutationCount: await initialRenderCount,
      details: `${await initialRenderCount} DOM mutations in 5 seconds`
    };

  } catch (error) {
    console.error('❌ Test error:', error);
    testResults.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Generate test report
  const passedTests = Object.values(testResults.tests).filter(test => test.passed).length;
  const totalTests = Object.keys(testResults.tests).length;
  
  console.log('\n📋 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  console.log(`🐛 Errors: ${testResults.errors.length}`);
  
  console.log('\n📊 Detailed Results:');
  for (const [testName, result] of Object.entries(testResults.tests)) {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${result.details || result.error || 'No details'}`);
  }
  
  if (testResults.errors.length > 0) {
    console.log('\n🚨 Errors:');
    testResults.errors.forEach(error => {
      console.log(`- ${error.message}`);
    });
  }
  
  console.log(`\n📸 Screenshots saved: ${testResults.screenshots.join(', ')}`);
  
  // Save detailed results
  fs.writeFileSync(
    'cv-10k-expansion-test-results.json', 
    JSON.stringify(testResults, null, 2)
  );
  
  console.log('\n💾 Detailed results saved to: cv-10k-expansion-test-results.json');
  
  // Overall success check
  const criticalTests = ['aiOptimization', 'glassmorphismUI', 'buttonRedesign'];
  const criticalPassed = criticalTests.every(test => testResults.tests[test]?.passed);
  
  if (criticalPassed) {
    console.log('\n🎉 SUCCESS: All critical tests passed!');
    console.log('✅ 10,000+ character CV expansion working');
    console.log('✅ Glassmorphism UI redesign applied');
    console.log('✅ Button gradients implemented');
  } else {
    console.log('\n⚠️  PARTIAL SUCCESS: Some critical tests failed');
  }
}

// Run the test
runComprehensiveTest().catch(console.error);