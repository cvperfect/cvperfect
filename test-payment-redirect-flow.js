// CRITICAL PAYMENT REDIRECT FLOW TEST
// Tests complete payment flow from checkout to success page
// Purpose: Diagnose redirect issues after payment completion

const http = require('http')
const https = require('https')
const url = require('url')

const BASE_URL = 'http://localhost:3001'

// Test utilities
function makeRequest(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(requestUrl)
    const client = parsedUrl.protocol === 'https:' ? https : http
    
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CVPerfect-Test-Bot/1.0',
        ...options.headers
      }
    }

    const req = client.request(reqOptions, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          location: res.headers.location
        })
      })
    })

    req.on('error', reject)
    
    if (options.body) {
      req.write(JSON.stringify(options.body))
    }
    
    req.end()
  })
}

// Test functions
async function testCreateCheckoutSession() {
  console.log('🧪 Testing create-checkout-session API...')
  
  const testData = {
    plan: 'basic',
    email: 'test@example.com',
    cv: 'Test CV content for payment flow verification',
    job: 'Test job description',
    fullSessionId: `test_session_${Date.now()}`
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/create-checkout-session`, {
      method: 'POST',
      body: testData
    })
    
    console.log('✅ Checkout session API status:', response.statusCode)
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body)
      console.log('✅ Checkout session created:', {
        sessionId: data.id,
        hasUrl: !!data.url,
        success: data.success
      })
      
      // Verify success URL format
      if (data.url) {
        const checkoutUrl = new URL(data.url)
        console.log('✅ Stripe checkout URL domain:', checkoutUrl.hostname)
        
        // Extract session ID from the checkout URL (it should contain it)
        const sessionId = data.id
        
        // Test the expected success URL format
        const expectedSuccessUrl = `${BASE_URL}/success?session_id=${sessionId}&plan=basic`
        console.log('✅ Expected success URL:', expectedSuccessUrl)
        
        return { sessionId, checkoutUrl: data.url }
      }
    } else {
      console.error('❌ Checkout session failed:', response.body)
      return null
    }
  } catch (error) {
    console.error('❌ Checkout session error:', error.message)
    return null
  }
}

async function testSuccessPageAccess() {
  console.log('🧪 Testing success page accessibility...')
  
  // Test with a mock session ID
  const mockSessionId = 'cs_test_' + Date.now()
  const successUrl = `${BASE_URL}/success?session_id=${mockSessionId}&plan=basic`
  
  try {
    const response = await makeRequest(successUrl)
    
    console.log('✅ Success page status:', response.statusCode)
    
    if (response.statusCode === 200) {
      console.log('✅ Success page is accessible')
      
      // Check if page contains expected elements
      const pageContent = response.body
      const containsSessionId = pageContent.includes(mockSessionId)
      const containsReactApp = pageContent.includes('__NEXT_DATA__')
      
      console.log('✅ Success page analysis:', {
        containsSessionId,
        containsReactApp,
        contentLength: pageContent.length
      })
      
      return true
    } else if (response.statusCode === 302 || response.statusCode === 301) {
      console.log('🔄 Success page redirects to:', response.location)
      return false
    } else {
      console.error('❌ Success page error:', response.statusCode)
      return false
    }
  } catch (error) {
    console.error('❌ Success page access error:', error.message)
    return false
  }
}

async function testSessionDataAPI() {
  console.log('🧪 Testing session data APIs...')
  
  const testSessionId = 'cs_test_' + Date.now()
  
  try {
    // Test get-session-data API
    const sessionDataResponse = await makeRequest(
      `${BASE_URL}/api/get-session-data?session_id=${testSessionId}`
    )
    
    console.log('✅ get-session-data API status:', sessionDataResponse.statusCode)
    
    if (sessionDataResponse.statusCode === 200) {
      const data = JSON.parse(sessionDataResponse.body)
      console.log('✅ Session data API response:', {
        success: data.success,
        hasData: !!data.cvData,
        error: data.error
      })
    } else {
      console.log('⚠️ Session data API returned:', sessionDataResponse.statusCode)
    }
    
    // Test get-session API (Stripe session retrieval)
    const stripeSessionResponse = await makeRequest(
      `${BASE_URL}/api/get-session?session_id=${testSessionId}`
    )
    
    console.log('✅ get-session API status:', stripeSessionResponse.statusCode)
    
    return {
      sessionDataWorking: sessionDataResponse.statusCode === 200,
      stripeSessionWorking: stripeSessionResponse.statusCode === 200
    }
    
  } catch (error) {
    console.error('❌ Session API test error:', error.message)
    return { sessionDataWorking: false, stripeSessionWorking: false }
  }
}

async function testRedirectFlow() {
  console.log('🧪 Testing complete redirect flow simulation...')
  
  // Step 1: Create checkout session
  const checkoutResult = await testCreateCheckoutSession()
  if (!checkoutResult) {
    console.error('❌ Cannot test redirect flow - checkout creation failed')
    return false
  }
  
  // Step 2: Simulate successful payment (would normally be handled by Stripe)
  console.log('🔄 Simulating payment completion...')
  
  // Step 3: Test redirect to success page with the session ID
  const { sessionId } = checkoutResult
  const successUrl = `${BASE_URL}/success?session_id=${sessionId}&plan=basic`
  
  console.log('🔄 Testing redirect to success page:', successUrl)
  
  try {
    const response = await makeRequest(successUrl)
    
    if (response.statusCode === 200) {
      console.log('✅ SUCCESS: Redirect flow works correctly')
      return true
    } else if (response.statusCode === 302) {
      console.log('🔄 SUCCESS: Page redirects correctly to:', response.location)
      return true
    } else {
      console.error('❌ FAILED: Redirect flow broken, status:', response.statusCode)
      return false
    }
  } catch (error) {
    console.error('❌ FAILED: Redirect flow error:', error.message)
    return false
  }
}

async function diagnoseRedirectIssue() {
  console.log('🔍 DIAGNOSING PAYMENT REDIRECT ISSUE')
  console.log('=====================================')
  
  const results = {
    serverRunning: false,
    checkoutSessionAPI: false,
    successPageAccess: false,
    sessionAPIs: { sessionDataWorking: false, stripeSessionWorking: false },
    redirectFlowWorking: false
  }
  
  // Test 1: Server accessibility
  console.log('\n1. Testing server accessibility...')
  try {
    const response = await makeRequest(BASE_URL)
    results.serverRunning = response.statusCode === 200
    console.log('✅ Server status:', response.statusCode)
  } catch (error) {
    console.error('❌ Server not accessible:', error.message)
    return results
  }
  
  // Test 2: Checkout session creation
  console.log('\n2. Testing checkout session creation...')
  const checkoutTest = await testCreateCheckoutSession()
  results.checkoutSessionAPI = !!checkoutTest
  
  // Test 3: Success page accessibility  
  console.log('\n3. Testing success page accessibility...')
  results.successPageAccess = await testSuccessPageAccess()
  
  // Test 4: Session data APIs
  console.log('\n4. Testing session data APIs...')
  results.sessionAPIs = await testSessionDataAPI()
  
  // Test 5: Complete redirect flow
  console.log('\n5. Testing complete redirect flow...')
  results.redirectFlowWorking = await testRedirectFlow()
  
  // Summary
  console.log('\n🔍 DIAGNOSIS SUMMARY')
  console.log('===================')
  console.log('Server Running:', results.serverRunning ? '✅' : '❌')
  console.log('Checkout Session API:', results.checkoutSessionAPI ? '✅' : '❌')
  console.log('Success Page Access:', results.successPageAccess ? '✅' : '❌')
  console.log('Session Data API:', results.sessionAPIs.sessionDataWorking ? '✅' : '❌')
  console.log('Stripe Session API:', results.sessionAPIs.stripeSessionWorking ? '✅' : '❌')
  console.log('Complete Redirect Flow:', results.redirectFlowWorking ? '✅' : '❌')
  
  // Identify issues
  console.log('\n🚨 IDENTIFIED ISSUES')
  console.log('===================')
  
  if (!results.serverRunning) {
    console.log('❌ CRITICAL: Server not accessible at', BASE_URL)
  }
  
  if (!results.checkoutSessionAPI) {
    console.log('❌ CRITICAL: Checkout session API not working')
    console.log('   → Check: Stripe environment variables')
    console.log('   → Check: /api/create-checkout-session.js')
  }
  
  if (!results.successPageAccess) {
    console.log('❌ CRITICAL: Success page not accessible')
    console.log('   → Check: /pages/success.js rendering')
    console.log('   → Check: React component errors')
  }
  
  if (!results.sessionAPIs.sessionDataWorking) {
    console.log('❌ CRITICAL: Session data API not working')
    console.log('   → Check: /api/get-session-data.js')
    console.log('   → Check: Session storage/database')
  }
  
  if (!results.redirectFlowWorking) {
    console.log('❌ CRITICAL: Payment redirect flow broken')
    console.log('   → This is the main issue reported by user')
    console.log('   → Check: Success URL configuration in Stripe')
    console.log('   → Check: Session ID parameter handling')
  }
  
  return results
}

// Run diagnosis
if (require.main === module) {
  diagnoseRedirectIssue()
    .then(() => {
      console.log('\n✅ Diagnosis complete')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Diagnosis failed:', error.message)
      process.exit(1)
    })
}

module.exports = { diagnoseRedirectIssue, testRedirectFlow, testCreateCheckoutSession }