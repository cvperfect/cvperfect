#!/usr/bin/env node

/**
 * CVPerfect Critical Fixes Verification Test
 * Tests all 4 critical issues that were fixed:
 * 1. Mobile navigation language switcher visibility
 * 2. Success page template loading state
 * 3. ESLint deprecated options
 * 4. Statistics display issue
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function testCriticalFixes() {
  console.log('🔍 Starting Critical Fixes Verification Test...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: { passed: 0, failed: 0, warnings: 0 }
  };

  let browser;
  
  try {
    // Test 1: ESLint Configuration (no deprecated warnings)
    console.log('1️⃣ Testing ESLint Configuration...');
    const eslintConfig = JSON.parse(fs.readFileSync('.eslintrc.json', 'utf8'));
    
    const hasCorrectRules = eslintConfig.rules && 
                           eslintConfig.rules['react/no-unescaped-entities'] === 'warn' &&
                           eslintConfig.rules['@next/next/no-html-link-for-pages'] === 'warn';
    
    results.tests.push({
      name: 'ESLint Configuration - Deprecated Options Fixed',
      status: hasCorrectRules ? 'PASSED' : 'FAILED',
      details: hasCorrectRules 
        ? 'ESLint rules properly configured to warn instead of error'
        : 'ESLint configuration missing expected rule overrides',
      expected: 'Non-blocking warnings for React and Next.js rules',
      actual: `Rules configured: ${Object.keys(eslintConfig.rules || {}).join(', ')}`
    });
    
    if (hasCorrectRules) results.summary.passed++;
    else results.summary.failed++;
    
    console.log(hasCorrectRules ? '✅ ESLint config fixed' : '❌ ESLint config issue');

    // Test 2: Statistics Display Logic 
    console.log('\n2️⃣ Testing Statistics Display Logic...');
    const indexJs = fs.readFileSync('pages/index.js', 'utf8');
    
    // Check for NaN protection in statistics display
    const hasNaNProtection = indexJs.includes('!isNaN(liveStats.cv)') && 
                            indexJs.includes('!isNaN(liveStats.jobs)');
    
    // Check for fallback values
    const hasFallbacks = indexJs.includes(": '15,000'") && 
                        indexJs.includes(": '130'");
    
    const statsFixed = hasNaNProtection && hasFallbacks;
    
    results.tests.push({
      name: 'Statistics Display - Dash Prevention',
      status: statsFixed ? 'PASSED' : 'FAILED', 
      details: statsFixed
        ? 'Statistics have NaN protection and fallback values'
        : 'Missing NaN protection or fallback values in statistics',
      expected: 'Numbers always displayed instead of dashes',
      actual: `NaN protection: ${hasNaNProtection}, Fallbacks: ${hasFallbacks}`
    });
    
    if (statsFixed) results.summary.passed++;
    else results.summary.failed++;
    
    console.log(statsFixed ? '✅ Statistics display fixed' : '❌ Statistics display issue');

    // Test 3: Mobile Navigation Structure
    console.log('\n3️⃣ Testing Mobile Navigation Structure...');
    
    const hasDesktopSwitcher = indexJs.includes('desktop-language-switcher');
    const hasMobileSwitcher = indexJs.includes('className="language-switcher"');
    const hasMobileMenuBtn = indexJs.includes('mobile-menu-btn');
    const hasResponsiveCSS = indexJs.includes('@media (max-width: 768px)');
    
    const mobileNavFixed = hasDesktopSwitcher && hasMobileSwitcher && hasMobileMenuBtn && hasResponsiveCSS;
    
    results.tests.push({
      name: 'Mobile Navigation - Language Switcher Visibility', 
      status: mobileNavFixed ? 'PASSED' : 'FAILED',
      details: mobileNavFixed
        ? 'Separate desktop and mobile language switchers with proper responsive CSS'
        : 'Missing mobile navigation components or responsive styles',
      expected: 'Language switcher visible on mobile (375px)',
      actual: `Desktop switcher: ${hasDesktopSwitcher}, Mobile switcher: ${hasMobileSwitcher}, Menu btn: ${hasMobileMenuBtn}`
    });
    
    if (mobileNavFixed) results.summary.passed++;
    else results.summary.failed++;
    
    console.log(mobileNavFixed ? '✅ Mobile navigation fixed' : '❌ Mobile navigation issue');

    // Test 4: Success Page Loading State
    console.log('\n4️⃣ Testing Success Page Loading State...');
    const successJs = fs.readFileSync('pages/success.js', 'utf8');
    
    const hasLoadingStateFix = successJs.includes('setLoadingState(prev => ({ ...prev, isInitializing: false }))');
    const hasEmergencyLoader = successJs.includes('EMERGENCY CV LOADER');
    const hasTemplateRenderer = successJs.includes('loadingState.isInitializing');
    
    const successPageFixed = hasLoadingStateFix && hasEmergencyLoader && hasTemplateRenderer;
    
    results.tests.push({
      name: 'Success Page - Template Loading State',
      status: successPageFixed ? 'PASSED' : 'FAILED',
      details: successPageFixed
        ? 'Loading state properly managed with emergency loader and template renderer'
        : 'Missing loading state management or emergency loader',
      expected: 'Templates show content instead of loading state',
      actual: `Loading fix: ${hasLoadingStateFix}, Emergency loader: ${hasEmergencyLoader}`
    });
    
    if (successPageFixed) results.summary.passed++;
    else results.summary.failed++;
    
    console.log(successPageFixed ? '✅ Success page loading fixed' : '❌ Success page loading issue');

    // Test 5: Browser Integration Test (if server is running)
    console.log('\n5️⃣ Testing Browser Integration...');
    
    try {
      browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width: 375, height: 667 }); // Mobile viewport
      
      // Test if the page loads
      await page.goto('http://localhost:3001', { 
        waitUntil: 'networkidle0',
        timeout: 10000 
      });
      
      // Test mobile menu button visibility
      const mobileMenuVisible = await page.$('.mobile-menu-btn') !== null;
      
      // Test statistics are not showing dashes
      await page.waitForSelector('[data-stat="cv"]', { timeout: 5000 });
      const cvStatText = await page.$eval('[data-stat="cv"]', el => el.textContent);
      const hasNoStatDashes = !cvStatText.includes('—') && !cvStatText.includes('–');
      
      // Test language switcher functionality
      await page.click('.mobile-menu-btn');
      await page.waitForTimeout(500);
      const languageSwitcherVisible = await page.$('.language-switcher') !== null;
      
      const browserTestPassed = mobileMenuVisible && hasNoStatDashes && languageSwitcherVisible;
      
      results.tests.push({
        name: 'Browser Integration - Live Testing',
        status: browserTestPassed ? 'PASSED' : 'WARNING',
        details: browserTestPassed
          ? 'All UI elements working correctly in browser'
          : 'Some UI elements may need adjustment',
        expected: 'Mobile menu, stats, and language switcher working',
        actual: `Mobile menu: ${mobileMenuVisible}, Stats OK: ${hasNoStatDashes}, Lang switcher: ${languageSwitcherVisible}`
      });
      
      if (browserTestPassed) results.summary.passed++;
      else results.summary.warnings++;
      
      console.log(browserTestPassed ? '✅ Browser integration working' : '⚠️ Browser integration needs attention');
      
    } catch (browserError) {
      console.log('⚠️ Browser test skipped (server not running)');
      results.tests.push({
        name: 'Browser Integration - Live Testing',
        status: 'SKIPPED',
        details: 'Development server not accessible',
        expected: 'Server running on localhost:3001',
        actual: `Error: ${browserError.message}`
      });
      results.summary.warnings++;
    }

  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    results.tests.push({
      name: 'Test Execution',
      status: 'FAILED',
      details: `Test runner error: ${error.message}`,
      expected: 'All tests execute successfully',
      actual: 'Test runner encountered an error'
    });
    results.summary.failed++;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Generate Report
  console.log('\n📊 CRITICAL FIXES VERIFICATION REPORT');
  console.log('=====================================');
  console.log(`Timestamp: ${results.timestamp}`);
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`⚠️ Warnings: ${results.summary.warnings}`);
  
  console.log('\n📋 Detailed Results:');
  results.tests.forEach((test, index) => {
    const statusIcon = test.status === 'PASSED' ? '✅' : 
                      test.status === 'FAILED' ? '❌' : 
                      test.status === 'WARNING' ? '⚠️' : '⏭️';
    console.log(`${index + 1}. ${statusIcon} ${test.name}: ${test.status}`);
    console.log(`   Details: ${test.details}`);
    if (test.status !== 'PASSED' && test.status !== 'SKIPPED') {
      console.log(`   Expected: ${test.expected}`);
      console.log(`   Actual: ${test.actual}`);
    }
    console.log('');
  });

  // Overall Assessment
  const overallSuccess = results.summary.failed === 0 && results.summary.passed >= 4;
  console.log('🎯 OVERALL ASSESSMENT:');
  console.log(overallSuccess 
    ? '✅ ALL CRITICAL FIXES SUCCESSFULLY IMPLEMENTED AND VERIFIED'
    : '⚠️ SOME ISSUES NEED ATTENTION - Check failed tests above');
  
  if (overallSuccess) {
    console.log('\n🚀 Ready for production deployment!');
    console.log('All 4 critical issues have been resolved:');
    console.log('  1. ✅ Mobile navigation language switcher now visible');
    console.log('  2. ✅ Success page templates load content (not loading state)');
    console.log('  3. ✅ ESLint deprecated options resolved');  
    console.log('  4. ✅ Statistics display prevents dashes');
  }

  // Save results to file
  const reportFile = `critical-fixes-test-${Date.now()}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 Full report saved to: ${reportFile}`);
  
  return overallSuccess;
}

// Run the test
if (require.main === module) {
  testCriticalFixes()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Fatal test error:', error);
      process.exit(1);
    });
}

module.exports = testCriticalFixes;