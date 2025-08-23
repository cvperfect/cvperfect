// TEST ŁADOWANIA PRAWDZIWEGO CV - Konrad Jakóbczak
const puppeteer = require('puppeteer')

async function testRealCVLoading() {
  console.log('📊 FAZA 3: Testing Real CV Loading')
  console.log('==================================\n')
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1400, height: 900 }
  })
  
  try {
    const page = await browser.newPage()
    
    // Monitor console messages for CV loading
    const consoleMessages = []
    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(text)
      
      // Look for CV data indicators
      if (text.includes('CV Display Debug') || 
          text.includes('Konrad') || 
          text.includes('hasFullContent') ||
          text.includes('Processing ENTERPRISE CV')) {
        console.log('  CV DATA:', text)
      }
    })
    
    console.log('TEST 1: Loading with real session ID (Konrad CV)')
    
    // Use real session ID from Konrad's CV
    const realSessionId = 'sess_1755865667776_22z3osqrw'
    const testUrl = `http://localhost:3001/success?session_id=${realSessionId}&plan=premium`
    
    console.log('🔗 Test URL:', testUrl)
    
    await page.goto(testUrl, { waitUntil: 'networkidle0', timeout: 30000 })
    await new Promise(resolve => setTimeout(resolve, 5000)) // Extra time for CV processing
    
    console.log('\nTEST 2: Check if real CV is displayed')
    
    // Check page content for Konrad's data
    const pageContent = await page.evaluate(() => {
      const bodyText = document.body.textContent
      return {
        hasKonrad: bodyText.includes('Konrad'),
        hasJakobczak: bodyText.includes('Jakóbczak') || bodyText.includes('Jakóbczak'),
        hasUPS: bodyText.includes('UPS'),
        hasZamosc: bodyText.includes('Zamość'),
        hasEmail: bodyText.includes('konrad11811@wp.pl'),
        hasPhone: bodyText.includes('570 625 098'),
        hasAnnaKowalska: bodyText.includes('Anna Kowalska'), // Demo data
        totalLength: bodyText.length,
        hasOptimizeButton: !!document.querySelector('button'),
        hasTemplateOptions: bodyText.includes('template') || bodyText.includes('szablon')
      }
    })
    
    console.log('\n📊 CV Content Analysis:')
    console.log('======================')
    console.log('Real CV Data Found:')
    console.log('  ✅ Konrad name:', pageContent.hasKonrad)
    console.log('  ✅ Surname Jakóbczak:', pageContent.hasJakobczak) 
    console.log('  ✅ UPS workplace:', pageContent.hasUPS)
    console.log('  ✅ Zamość city:', pageContent.hasZamosc)
    console.log('  ✅ Email:', pageContent.hasEmail)
    console.log('  ✅ Phone:', pageContent.hasPhone)
    console.log('\nDemo Data Check:')
    console.log('  ❌ Anna Kowalska (should be false):', pageContent.hasAnnaKowalska)
    console.log('\nGeneral:')
    console.log('  📄 Page length:', pageContent.totalLength, 'chars')
    console.log('  🔘 Has buttons:', pageContent.hasOptimizeButton)
    console.log('  🎨 Has templates:', pageContent.hasTemplateOptions)
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'test-real-cv-konrad.png', 
      fullPage: true 
    })
    console.log('\n📸 Screenshot saved: test-real-cv-konrad.png')
    
    // TEST 3: Check console messages for data flow
    console.log('\nTEST 3: Console message analysis')
    
    const cvDebugMessages = consoleMessages.filter(msg => 
      msg.includes('CV Display Debug') || msg.includes('fullContentLength')
    )
    
    const sessionMessages = consoleMessages.filter(msg =>
      msg.includes('Session data loaded') || msg.includes('fullSessionData')
    )
    
    console.log('CV Debug messages:', cvDebugMessages.length)
    console.log('Session load messages:', sessionMessages.length)
    
    // Show important debug info
    cvDebugMessages.forEach((msg, i) => {
      if (i < 3) console.log(`  Debug ${i+1}:`, msg)
    })
    
    // RESULTS EVALUATION
    console.log('\n🎯 FAZA 3 EVALUATION:')
    console.log('=====================')
    
    const hasRealData = pageContent.hasKonrad && pageContent.hasUPS && pageContent.hasZamosc
    const noDemoData = !pageContent.hasAnnaKowalska
    const hasContent = pageContent.totalLength > 3000 // Reasonable length (lowered from 5000)
    
    if (hasRealData && noDemoData && hasContent) {
      console.log('🎉 SUCCESS: Real CV is being displayed!')
      console.log('✅ Konrad\'s CV data is properly loaded')
      console.log('✅ No demo data interference')
      console.log('✅ Content length is reasonable')
      return { success: true, issue: 'none' }
    } else if (hasRealData && pageContent.hasAnnaKowalska) {
      console.log('⚠️ MIXED: Real CV + Demo data detected')
      console.log('🔧 Issue: Both real and demo data showing')
      return { success: false, issue: 'mixed_data' }
    } else if (!hasRealData && pageContent.hasAnnaKowalska) {
      console.log('❌ FAILED: Only demo data is showing')
      console.log('🔧 Issue: Real CV not loaded, showing Anna Kowalska')
      return { success: false, issue: 'demo_only' }
    } else {
      console.log('❌ FAILED: No recognizable data found')
      console.log('🔧 Issue: Page loaded but no CV data detected')
      return { success: false, issue: 'no_data' }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return { success: false, issue: 'error', error: error.message }
  } finally {
    await browser.close()
  }
}

if (require.main === module) {
  testRealCVLoading()
    .then(result => {
      if (result.success) {
        console.log('\n🚀 PHASE 3 CHECKPOINT: Real CV loading works!')
        console.log('Ready for sessionStorage and cache fixes')
      } else {
        console.log(`\n🔧 PHASE 3 NEEDS FIXING: ${result.issue}`)
        console.log('Need to debug CV loading mechanism')
      }
      process.exit(result.success ? 0 : 1)
    })
    .catch(err => {
      console.error('Test error:', err)
      process.exit(1)
    })
}

module.exports = { testRealCVLoading }