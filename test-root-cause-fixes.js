// Test script for root cause fixes: Modal Overlay + Session Fallback
// Tests both critical issues that were repeatedly "fixed" but not actually working

const puppeteer = require('puppeteer');

console.log('🧪 TESTING ROOT CAUSE FIXES');
console.log('============================');

async function testModalOverlayFix() {
  console.log('\n1. TESTING: Modal Overlay Language Switcher Fix');
  console.log('-----------------------------------------------');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to main page
    console.log('📱 Navigating to main page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Check initial language
    const initialLanguage = await page.evaluate(() => {
      const plBtn = document.querySelector('.lang-btn.active');
      return plBtn ? plBtn.textContent.trim() : 'unknown';
    });
    console.log(`   Initial language: ${initialLanguage}`);
    
    // Open modal by clicking "Optymalizuj teraz"
    console.log('🔘 Opening modal (Optymalizuj teraz)...');
    await page.click('button[onclick*="handleOptimizeNow"], .cta-button, .btn-primary');
    await page.waitForTimeout(1000); // Wait for modal animation
    
    // Check if modal is open
    const modalVisible = await page.evaluate(() => {
      return document.querySelector('.modal-overlay') !== null;
    });
    console.log(`   Modal visible: ${modalVisible ? '✅' : '❌'}`);
    
    if (modalVisible) {
      // Try to click language switcher while modal is open
      console.log('🔄 Testing language switcher while modal is open...');
      
      try {
        // Try clicking EN button
        await page.click('.lang-btn:not(.active)');
        await page.waitForTimeout(500);
        
        // Check if language changed
        const newLanguage = await page.evaluate(() => {
          const activeBtn = document.querySelector('.lang-btn.active');
          return activeBtn ? activeBtn.textContent.trim() : 'unknown';
        });
        
        if (newLanguage !== initialLanguage) {
          console.log(`   ✅ SUCCESS: Language switched from ${initialLanguage} to ${newLanguage} while modal was open!`);
          return true;
        } else {
          console.log(`   ❌ FAILED: Language did not change (still ${newLanguage})`);
          return false;
        }
        
      } catch (error) {
        console.log(`   ❌ FAILED: Could not click language switcher: ${error.message}`);
        return false;
      }
      
    } else {
      console.log('   ❌ Could not test - modal did not open');
      return false;
    }
    
  } finally {
    await browser.close();
  }
}

async function testSessionFallbackFix() {
  console.log('\n2. TESTING: Success Page Session Fallback Fix');
  console.log('----------------------------------------------');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null 
  });
  
  try {
    const page = await browser.newPage();
    
    // First, simulate saving a session ID to sessionStorage
    console.log('💾 Setting up sessionStorage with test session...');
    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('currentSessionId', 'test_session_fallback_12345');
      console.log('Set test session ID in sessionStorage');
    });
    
    // Navigate directly to success page WITHOUT session_id in URL
    console.log('📱 Navigating to success page without URL session_id...');
    await page.goto('http://localhost:3000/success', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    // Wait for page to load and process fallback
    await page.waitForTimeout(3000);
    
    // Check if fallback worked
    const pageContent = await page.evaluate(() => {
      return {
        hasErrorMessage: document.body.textContent.includes('Nie znaleziono sesji'),
        hasLoadingState: document.body.textContent.includes('Ładowanie'),
        hasSuccessContent: document.body.textContent.includes('CV') || document.body.textContent.includes('Template'),
        url: window.location.href
      };
    });
    
    console.log('   Page analysis:');
    console.log(`     URL: ${pageContent.url}`);
    console.log(`     Has error message: ${pageContent.hasErrorMessage ? '❌' : '✅'}`);
    console.log(`     Has loading state: ${pageContent.hasLoadingState ? '⏳' : '✅'}`);
    console.log(`     Has success content: ${pageContent.hasSuccessContent ? '✅' : '❌'}`);
    
    // Check console logs for our fix
    const logs = await page.evaluate(() => {
      return window.__cvperfect_test_logs || [];
    });
    
    // Check if URL was updated with session ID
    const urlHasSessionId = pageContent.url.includes('session_id=');
    console.log(`     URL updated with session_id: ${urlHasSessionId ? '✅' : '❌'}`);
    
    if (!pageContent.hasErrorMessage && urlHasSessionId) {
      console.log('   ✅ SUCCESS: Session fallback mechanism working!');
      return true;
    } else {
      console.log('   ❌ FAILED: Session fallback did not work properly');
      return false;
    }
    
  } finally {
    await browser.close();
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive root cause fix testing...\n');
  
  try {
    const modalTest = await testModalOverlayFix();
    const sessionTest = await testSessionFallbackFix();
    
    console.log('\n📊 FINAL RESULTS');
    console.log('=================');
    console.log(`Modal Language Switcher Fix: ${modalTest ? '✅ WORKING' : '❌ BROKEN'}`);
    console.log(`Success Page Session Fallback: ${sessionTest ? '✅ WORKING' : '❌ BROKEN'}`);
    
    const allPassed = modalTest && sessionTest;
    
    if (allPassed) {
      console.log('\n🎉 ALL ROOT CAUSE FIXES WORKING CORRECTLY!');
      console.log('Both critical issues have been resolved:');
      console.log('1. ✅ Language switcher works when modal is open');
      console.log('2. ✅ Success page works without URL session_id parameter');
    } else {
      console.log('\n⚠️  Some fixes still not working properly');
      console.log('❌ The fixes need more work - not truly resolved yet');
    }
    
    return allPassed;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    return false;
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal test error:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, testModalOverlayFix, testSessionFallbackFix };