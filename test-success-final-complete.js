// Complete End-to-End Test for Success.js - Real CV Processing
const puppeteer = require('puppeteer')

async function testCompleteSuccessFlow() {
  console.log('🚀 COMPLETE SUCCESS.JS TEST - Real CV Processing Flow')
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1440, height: 900 },
    args: ['--disable-web-security', '--allow-running-insecure-content']
  })
  
  try {
    const page = await browser.newPage()
    
    // Enable console logging from the page
    page.on('console', msg => {
      if (msg.type() === 'log' && (
        msg.text().includes('🔍') || 
        msg.text().includes('✅') || 
        msg.text().includes('❌') ||
        msg.text().includes('📊') ||
        msg.text().includes('🚀')
      )) {
        console.log('  PAGE:', msg.text())
      }
    })
    
    console.log('\n=== TEST 1: Przeniesienie ze stroną success z prawdziwym session ID ===')
    
    // Find a real session ID from .sessions folder
    const fs = require('fs')
    const path = require('path')
    const sessionsDir = path.join(process.cwd(), '.sessions')
    
    let realSessionId = null
    try {
      const sessionFiles = fs.readdirSync(sessionsDir)
      const cvSessions = sessionFiles.filter(f => f.startsWith('sess_') && f.endsWith('.json'))
      
      if (cvSessions.length > 0) {
        // Use the most recent session
        const latestSession = cvSessions.sort().pop()
        realSessionId = latestSession.replace('.json', '')
        console.log('📁 Found real session:', realSessionId)
        
        // Read session content to verify
        const sessionPath = path.join(sessionsDir, latestSession)
        const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'))
        console.log('📋 Session contains:', {
          email: sessionData.email,
          plan: sessionData.plan,
          cvLength: sessionData.cvData?.length || 0,
          hasPhoto: !!sessionData.photo
        })
      }
    } catch (err) {
      console.log('⚠️ Could not find real session, will create mock URL')
    }
    
    // Create test URL with real or mock session
    const sessionId = realSessionId || 'cs_test_mock_session_for_testing'
    const testUrl = `http://localhost:3000/success?session_id=${sessionId}&plan=premium&template=simple`
    
    console.log('🔗 Test URL:', testUrl)
    
    // Navigate to success page
    await page.goto(testUrl, { waitUntil: 'networkidle0', timeout: 30000 })
    await page.waitForTimeout(2000)
    
    // Take initial screenshot
    await page.screenshot({ path: 'screenshot-success-complete-test-initial.png', fullPage: true })
    console.log('📸 Screenshot: screenshot-success-complete-test-initial.png')
    
    console.log('\n=== TEST 2: Sprawdzenie czy loading CV ===')
    
    // Wait for CV to load
    await page.waitForTimeout(5000)
    
    // Check if real CV is displayed (not Anna Kowalska)
    const cvContent = await page.evaluate(() => {
      const body = document.body.textContent
      return {
        hasAnnaKowalska: body.includes('Anna Kowalska'),
        hasKonrad: body.includes('Konrad'),
        hasRealContent: body.includes('UPS') || body.includes('Kurier') || body.includes('Zamość'),
        totalLength: body.length,
        hasOptimizing: body.includes('Optymalizuj') || body.includes('Loading'),
        hasTemplates: !!document.querySelector('[class*="template"]'),
        hasExportButtons: !!document.querySelector('button')
      }
    })
    
    console.log('📊 CV Content Analysis:', cvContent)
    
    if (cvContent.hasAnnaKowalska && !cvContent.hasKonrad) {
      console.log('❌ PROBLEM: Pokazuje demo CV (Anna Kowalska) zamiast prawdziwego!')
    } else if (cvContent.hasRealContent) {
      console.log('✅ SUCCESS: Prawdziwe CV jest wyświetlane!')
    } else {
      console.log('⚠️ Unclear: Neither demo nor real CV clearly detected')
    }
    
    console.log('\n=== TEST 3: Sprawdzenie funkcji eksportu ===')
    
    // Wait a bit more for any AI processing
    await page.waitForTimeout(3000)
    
    // Take screenshot of current state
    await page.screenshot({ path: 'screenshot-success-complete-test-loaded.png', fullPage: true })
    console.log('📸 Screenshot after loading: screenshot-success-complete-test-loaded.png')
    
    // Look for export buttons
    const exportButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.map(btn => ({
        text: btn.textContent.trim(),
        disabled: btn.disabled,
        visible: btn.offsetParent !== null,
        classes: btn.className
      })).filter(btn => btn.text.length > 0)
    })
    
    console.log('🔧 Available buttons:', exportButtons.slice(0, 10))
    
    // Find PDF export button
    const pdfButton = exportButtons.find(btn => 
      btn.text.includes('PDF') || 
      btn.text.includes('📄') ||
      btn.classes.includes('pdf')
    )
    
    if (pdfButton) {
      console.log('✅ PDF export button found:', pdfButton.text)
      if (!pdfButton.disabled) {
        console.log('✅ PDF button is clickable')
      } else {
        console.log('❌ PDF button is disabled')
      }
    } else {
      console.log('❌ PDF export button not found')
    }
    
    // Find DOCX export button
    const docxButton = exportButtons.find(btn => 
      btn.text.includes('DOCX') || 
      btn.text.includes('📝') ||
      btn.classes.includes('docx')
    )
    
    if (docxButton) {
      console.log('✅ DOCX export button found:', docxButton.text)
    } else {
      console.log('❌ DOCX export button not found')
    }
    
    // Find email button
    const emailButton = exportButtons.find(btn => 
      btn.text.includes('Email') || 
      btn.text.includes('📧') ||
      btn.text.includes('mail')
    )
    
    if (emailButton) {
      console.log('✅ Email button found:', emailButton.text)
    } else {
      console.log('❌ Email button not found')
    }
    
    console.log('\n=== TEST 4: Template switching ===')
    
    // Look for template buttons
    const templateButtons = await page.$$('button')
    let templatesFound = 0
    
    for (const button of templateButtons) {
      const text = await button.evaluate(el => el.textContent.trim().toLowerCase())
      if (text.includes('template') || text.includes('szablon') || 
          text.includes('simple') || text.includes('modern') || 
          text.includes('executive') || text.includes('tech')) {
        templatesFound++
      }
    }
    
    console.log(`🎨 Template buttons found: ${templatesFound}`)
    
    console.log('\n=== TEST 5: AI Optimization Status ===')
    
    // Check for AI optimization indicators
    const aiStatus = await page.evaluate(() => {
      const body = document.body.textContent
      return {
        isOptimizing: body.includes('optimiz') && body.includes('progress'),
        isCompleted: body.includes('optymalizac') && body.includes('zakończ'),
        hasAIContent: body.includes('AI') || body.includes('artificial'),
        hasScore: body.includes('%') || body.includes('score'),
        hasFullContent: body.length > 5000
      }
    })
    
    console.log('🤖 AI Status:', aiStatus)
    
    console.log('\n=== FINAL RESULTS SUMMARY ===')
    
    const results = {
      sessionLoading: realSessionId ? '✅ Real session used' : '⚠️ Mock session used',
      cvDisplay: cvContent.hasRealContent ? '✅ Real CV displayed' : (cvContent.hasAnnaKowalska ? '❌ Demo CV shown' : '⚠️ Unknown CV state'),
      exportFunctions: {
        pdf: pdfButton ? '✅ Available' : '❌ Missing',
        docx: docxButton ? '✅ Available' : '❌ Missing', 
        email: emailButton ? '✅ Available' : '❌ Missing'
      },
      templates: templatesFound > 0 ? `✅ ${templatesFound} found` : '❌ None found',
      aiOptimization: aiStatus.hasFullContent ? '✅ Processing' : '⚠️ Limited',
      overallStatus: (cvContent.hasRealContent && pdfButton && docxButton && emailButton) ? '✅ SUCCESS' : '⚠️ NEEDS WORK'
    }
    
    console.log('\n📊 DETAILED RESULTS:')
    Object.entries(results).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`)
    })
    
    // Take final screenshot
    await page.screenshot({ path: 'screenshot-success-complete-test-final.png', fullPage: true })
    console.log('\n📸 Final screenshot: screenshot-success-complete-test-final.png')
    
    console.log('\n🎯 RECOMMENDED NEXT STEPS:')
    if (cvContent.hasAnnaKowalska && !cvContent.hasRealContent) {
      console.log('1. ❗ CRITICAL: Fix session data loading in success.js')
      console.log('2. Verify fetchUserDataFromSession function')
      console.log('3. Check session ID parsing from URL')
    }
    
    if (!pdfButton || !docxButton) {
      console.log('4. Fix export button rendering')
    }
    
    if (templatesFound === 0) {
      console.log('5. Fix template switching functionality')
    }
    
    console.log('\n🏁 Test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    await page.screenshot({ path: 'screenshot-success-test-error.png', fullPage: true })
  } finally {
    await browser.close()
  }
}

testCompleteSuccessFlow().catch(console.error)