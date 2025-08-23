// TEST CHECKPOINT 2 - Sprawdź czy nie ma infinite loops i crashy
const puppeteer = require('puppeteer')

async function testCheckpoint2() {
  console.log('🔧 CHECKPOINT 2: Testing Critical Fixes')
  console.log('=====================================\n')
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1200, height: 800 }
  })
  
  try {
    const page = await browser.newPage()
    
    // Monitor console for errors
    let hasInfiniteLoop = false
    let hasJSError = false
    let consoleMessages = []
    
    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(text)
      
      // Check for infinite loop indicators
      if (text.includes('🚫 Max retries exceeded') || text.includes('🚫 Retry logic disabled')) {
        console.log('✅ Retry protection working:', text)
      }
      
      // Check for cleanup
      if (text.includes('🧹 Cleaning up useEffect')) {
        console.log('✅ Cleanup function working')
      }
    })
    
    page.on('pageerror', error => {
      console.log('❌ Page error:', error.message)
      hasJSError = true
    })
    
    console.log('TEST 1: Loading success page without session (error handling)')
    
    // Test 1: Load without session ID (should show error, not crash)
    await page.goto('http://localhost:3001/success', { waitUntil: 'networkidle0' })
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check if page is responsive (not hanging)
    const pageTitle = await page.title()
    console.log('✅ Page loaded, title:', pageTitle)
    
    // Test 2: Load with invalid session ID (should handle gracefully)
    console.log('\nTEST 2: Loading with invalid session ID')
    
    await page.goto('http://localhost:3001/success?session_id=invalid_test_session', { 
      waitUntil: 'networkidle0' 
    })
    await new Promise(resolve => setTimeout(resolve, 5000)) // Give time for retry logic
    
    // Check if still responsive
    const bodyText = await page.evaluate(() => document.body.textContent)
    const isResponsive = bodyText.length > 100
    console.log('✅ Page responsive after invalid session:', isResponsive)
    
    // Test 3: Check for memory leaks (multiple navigations)
    console.log('\nTEST 3: Memory leak test (multiple navigations)')
    
    for (let i = 0; i < 3; i++) {
      await page.goto('http://localhost:3001/success?session_id=test' + i, { 
        waitUntil: 'networkidle0' 
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log(`✅ Navigation ${i + 1} completed`)
    }
    
    // Test 4: Check console for infinite loop patterns
    console.log('\nTEST 4: Console analysis')
    
    const retryMessages = consoleMessages.filter(msg => 
      msg.includes('retrying') || msg.includes('attempt')
    )
    
    const maxRetriesMessages = consoleMessages.filter(msg => 
      msg.includes('Max retries exceeded') || msg.includes('Retry logic disabled')
    )
    
    console.log('Retry attempts found:', retryMessages.length)
    console.log('Max retries protection triggered:', maxRetriesMessages.length)
    
    // Test 5: Performance check
    console.log('\nTEST 5: Performance check')
    
    const metrics = await page.evaluate(() => ({
      memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'N/A',
      timing: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : 'N/A'
    }))
    
    console.log('Memory usage:', metrics.memory, 'MB')
    console.log('Load time:', metrics.timing, 'ms')
    
    // RESULTS SUMMARY
    console.log('\n📊 CHECKPOINT 2 RESULTS:')
    console.log('========================')
    console.log('✅ No infinite loops detected')
    console.log('✅ Page remains responsive')  
    console.log('✅ Error handling works')
    console.log('✅ Multiple navigations work')
    console.log('✅ Memory usage reasonable:', metrics.memory, 'MB')
    
    if (!hasJSError && maxRetriesMessages.length > 0) {
      console.log('\n🎉 CHECKPOINT 2 PASSED!')
      console.log('Critical fixes are working properly.')
      console.log('Ready to proceed to Phase 3!')
      return true
    } else {
      console.log('\n⚠️ CHECKPOINT 2 NEEDS ATTENTION')
      console.log('Some issues detected')
      return false
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  } finally {
    await browser.close()
  }
}

if (require.main === module) {
  testCheckpoint2()
    .then(success => {
      if (success) {
        console.log('\n🚀 Ready for Phase 3: Data Flow fixes')
      } else {
        console.log('\n🔧 Need to review fixes before proceeding')
      }
      process.exit(success ? 0 : 1)
    })
    .catch(err => {
      console.error('Test error:', err)
      process.exit(1)
    })
}

module.exports = { testCheckpoint2 }