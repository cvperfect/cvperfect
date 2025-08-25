#!/usr/bin/env node

/**
 * CVPerfect Payment Flow Step 3 Debug Test
 * 
 * PROBLEM: Modal gets stuck at "Zapisywanie danych..." (3/5)
 * 
 * This script tests the payment flow to pinpoint the exact failure.
 */

const puppeteer = require('puppeteer');

async function testPaymentFlow() {
  console.log('🔍 Testing CVPerfect Payment Flow - Step 3 Debug');
  console.log('=================================================\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 500 // Slow down actions
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log('🖥️  CONSOLE:', msg.text());
    });
    
    // Enable network monitoring
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`🌐 API ${response.status()}: ${response.url()}`);
      }
    });
    
    console.log('1️⃣ Navigating to localhost:3002...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
    
    console.log('2️⃣ Looking for plan selection buttons...');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if Basic plan button exists
    const basicButton = await page.$('[data-testid="plan-basic"]');
    if (!basicButton) {
      console.log('❌ Basic plan button not found - checking page structure...');
      
      // Try alternative selectors
      const planButtons = await page.$$('.select-plan-button');
      console.log(`   Found ${planButtons.length} plan buttons`);
      
      if (planButtons.length > 0) {
        console.log('3️⃣ Clicking first plan button...');
        await planButtons[0].click();
      } else {
        console.log('❌ No plan buttons found. Checking page content...');
        const pageContent = await page.content();
        console.log('   Page title:', await page.title());
        return;
      }
    } else {
      console.log('3️⃣ Clicking Basic plan button...');
      await basicButton.click();
    }
    
    console.log('4️⃣ Waiting for modal and progress indicator...');
    await page.waitForTimeout(1000);
    
    // Check for progress modal
    const progressModal = await page.$('.payment-progress-overlay');
    if (progressModal) {
      console.log('✅ Progress modal appeared');
      
      // Monitor progress steps
      let stepCounter = 0;
      const maxWait = 30000; // 30 seconds
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWait) {
        const progressText = await page.$eval('.payment-progress-text h4', el => el.textContent).catch(() => null);
        const progressStep = await page.$eval('.payment-progress-text p', el => el.textContent).catch(() => null);
        
        if (progressText && progressStep) {
          console.log(`📊 Progress: ${progressText} | ${progressStep}`);
          
          // Check if we're at step 3
          if (progressStep.includes('3 z 5')) {
            console.log('🎯 FOUND STUCK POINT: Step 3/5 detected');
            
            // Wait a bit more to see if it proceeds
            await page.waitForTimeout(5000);
            
            const newProgressStep = await page.$eval('.payment-progress-text p', el => el.textContent).catch(() => null);
            if (newProgressStep && newProgressStep.includes('3 z 5')) {
              console.log('❌ CONFIRMED: Stuck at step 3/5 for over 5 seconds');
              
              // Check network activity
              console.log('🌐 Checking network activity in browser dev tools...');
              
              // Check if there are JavaScript errors
              const errors = await page.evaluate(() => {
                return window.__test_errors || [];
              });
              
              if (errors.length > 0) {
                console.log('❌ JavaScript errors found:', errors);
              }
              
              break;
            }
          }
          
          // Check for successful redirect
          if (page.url().includes('stripe.com')) {
            console.log('✅ SUCCESS: Redirected to Stripe!');
            break;
          }
        }
        
        await page.waitForTimeout(1000);
        stepCounter++;
      }
      
      if (Date.now() - startTime >= maxWait) {
        console.log('⏰ TIMEOUT: Payment flow took too long');
      }
      
    } else {
      console.log('❌ Progress modal did not appear');
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  } finally {
    // Keep browser open for manual inspection
    console.log('🔍 Browser kept open for manual inspection');
    console.log('   Check Console, Network, and Application tabs for details');
    console.log('   Press Ctrl+C when done');
    
    // Wait indefinitely until user closes
    await new Promise(() => {});
  }
}

// Run the test
testPaymentFlow().catch(console.error);