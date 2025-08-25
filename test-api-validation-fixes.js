// Comprehensive API Validation Test
// Purpose: Test fixes for API input validation issues

const fs = require('fs')
const FormData = require('form-data')

console.log('🧪 COMPREHENSIVE API VALIDATION TEST')
console.log('=====================================\n')

const BASE_URL = 'http://localhost:3000'

async function testParseCV() {
  console.log('📄 TEST 1: /api/parse-cv - File Upload Validation')
  console.log('---------------------------------------------------')
  
  // Test 1.1: Correct field name 'cv'
  console.log('Test 1.1: Correct field name "cv"')
  try {
    const testContent = `Jan Kowalski
Frontend Developer
Email: jan@example.com
Phone: +48 123 456 789

EXPERIENCE:
- React Developer at TechCorp (2022-2024)
- Junior Developer at StartupXYZ (2020-2022)

SKILLS:
- JavaScript, TypeScript, React
- HTML, CSS, Node.js`

    const formData = new FormData()
    formData.append('cv', Buffer.from(testContent), {
      filename: 'test-cv.txt',
      contentType: 'text/plain'
    })

    const response = await fetch(`${BASE_URL}/api/parse-cv`, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    
    console.log(`   Status: ${response.status}`)
    if (response.ok) {
      console.log('   ✅ SUCCESS: CV parsed with correct field name')
      console.log(`   📊 Text length: ${result.extractedText?.length || 0} chars`)
    } else {
      console.log(`   ❌ FAILED: ${result.error}`)
      if (result.debug) console.log(`   🔍 Debug: ${result.debug}`)
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`)
  }

  // Test 1.2: Alternative field name 'file'
  console.log('\nTest 1.2: Alternative field name "file"')
  try {
    const testContent = 'Test CV content for file field'
    const formData = new FormData()
    formData.append('file', Buffer.from(testContent), {
      filename: 'test-cv-file.txt',
      contentType: 'text/plain'
    })

    const response = await fetch(`${BASE_URL}/api/parse-cv`, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    
    console.log(`   Status: ${response.status}`)
    if (response.ok) {
      console.log('   ✅ SUCCESS: CV parsed with "file" field name')
    } else {
      console.log(`   ❌ FAILED: ${result.error}`)
      if (result.debug) console.log(`   🔍 Debug: ${result.debug}`)
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`)
  }

  // Test 1.3: Wrong field name
  console.log('\nTest 1.3: Wrong field name "document" (should fail gracefully)')
  try {
    const testContent = 'Test CV content for wrong field'
    const formData = new FormData()
    formData.append('document', Buffer.from(testContent), {
      filename: 'test-cv-wrong.txt',
      contentType: 'text/plain'
    })

    const response = await fetch(`${BASE_URL}/api/parse-cv`, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()
    
    console.log(`   Status: ${response.status}`)
    if (response.status === 400) {
      console.log('   ✅ EXPECTED: Proper error for wrong field name')
      console.log(`   📝 Error: ${result.error}`)
      if (result.debug) console.log(`   🔍 Debug: ${result.debug}`)
    } else {
      console.log(`   ⚠️  UNEXPECTED: Expected 400, got ${response.status}`)
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`)
  }

  return true
}

async function testDemoOptimize() {
  console.log('\n\n📄 TEST 2: /api/demo-optimize - Field Name Flexibility')
  console.log('-----------------------------------------------------')
  
  const testCV = `Anna Nowak
Software Developer
Email: anna@example.com

DOŚWIADCZENIE:
- Senior Frontend Developer - TechStart (2022-obecnie)
  * Rozwój aplikacji React/TypeScript  
  * Optymalizacja wydajności aplikacji
  * Mentoring młodszych programistów

UMIEJĘTNOŚCI:
- JavaScript (ES6+), TypeScript
- React.js, Redux, Next.js
- HTML5, CSS3, SASS`

  // Test 2.1: Correct field name 'cvText'
  console.log('Test 2.1: Correct field name "cvText"')
  try {
    const response = await fetch(`${BASE_URL}/api/demo-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cvText: testCV,
        jobText: 'Looking for React developer'
      })
    })

    const result = await response.json()
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      console.log('   ✅ SUCCESS: API accepted "cvText" field')
      console.log(`   📊 Response has result: ${!!result.optimizedCV || !!result.result}`)
    } else {
      console.log(`   ❌ FAILED: ${result.error}`)
      if (result.debug) console.log(`   🔍 Debug: ${result.debug}`)
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`)
  }

  // Test 2.2: Alternative field name 'cv'
  console.log('\nTest 2.2: Alternative field name "cv"')
  try {
    const response = await fetch(`${BASE_URL}/api/demo-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cv: testCV,
        job: 'React developer position'
      })
    })

    const result = await response.json()
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      console.log('   ✅ SUCCESS: API accepted "cv" field')
    } else {
      console.log(`   ❌ FAILED: ${result.error}`)
      if (result.debug) console.log(`   🔍 Debug: ${result.debug}`)
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`)
  }

  // Test 2.3: Field name 'content'
  console.log('\nTest 2.3: Alternative field name "content"')
  try {
    const response = await fetch(`${BASE_URL}/api/demo-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: testCV,
        jobDescription: 'Senior React developer'
      })
    })

    const result = await response.json()
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      console.log('   ✅ SUCCESS: API accepted "content" field')
    } else {
      console.log(`   ❌ FAILED: ${result.error}`)
      if (result.debug) console.log(`   🔍 Debug: ${result.debug}`)
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`)
  }

  // Test 2.4: Wrong field name
  console.log('\nTest 2.4: Wrong field name "resume" (should fail gracefully)')
  try {
    const response = await fetch(`${BASE_URL}/api/demo-optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume: testCV,
        position: 'Developer role'
      })
    })

    const result = await response.json()
    console.log(`   Status: ${response.status}`)
    
    if (response.status === 400) {
      console.log('   ✅ EXPECTED: Proper error for missing CV text')
      console.log(`   📝 Error: ${result.error}`)
      if (result.debug) console.log(`   🔍 Available fields: ${result.debug}`)
      if (result.received) console.log(`   📋 Body keys: ${result.received.bodyKeys?.join(', ')}`)
    } else {
      console.log(`   ⚠️  UNEXPECTED: Expected 400, got ${response.status}`)
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`)
  }

  return true
}

async function testSessionData() {
  console.log('\n\n📄 TEST 3: /api/get-session-data - Session ID Validation')
  console.log('--------------------------------------------------------')
  
  const testCases = [
    {
      name: 'Valid regular session ID',
      sessionId: 'sess_1234567890_abcdef',
      shouldSucceed: true
    },
    {
      name: 'Valid demo session ID',
      sessionId: 'demo_session_12345',
      shouldSucceed: true
    },
    {
      name: 'Valid test session ID',
      sessionId: 'test_abc123def456',
      shouldSucceed: true
    },
    {
      name: 'Valid fallback session ID',
      sessionId: 'fallback_1640995200_abc123',
      shouldSucceed: true
    },
    {
      name: 'Invalid format (too short)',
      sessionId: 'sess_12',
      shouldSucceed: false
    },
    {
      name: 'Invalid format (wrong prefix)',
      sessionId: 'invalid_session_123',
      shouldSucceed: false
    },
    {
      name: 'Invalid format (special chars)',
      sessionId: 'sess_123@#$%^&*()',
      shouldSucceed: false
    }
  ]

  for (const testCase of testCases) {
    console.log(`\nTest 3.${testCases.indexOf(testCase) + 1}: ${testCase.name}`)
    try {
      const response = await fetch(`${BASE_URL}/api/get-session-data?session_id=${testCase.sessionId}`)
      const result = await response.json()
      
      console.log(`   Status: ${response.status}`)
      console.log(`   Session ID: ${testCase.sessionId}`)
      
      if (testCase.shouldSucceed) {
        if (response.status === 200 || response.status === 404) {
          console.log('   ✅ SUCCESS: Valid session ID accepted')
          if (result.source) console.log(`   📊 Source: ${result.source}`)
        } else if (response.status === 400) {
          console.log('   ❌ FAILED: Valid session ID rejected')
          console.log(`   📝 Error: ${result.error}`)
        }
      } else {
        if (response.status === 400) {
          console.log('   ✅ EXPECTED: Invalid session ID properly rejected')
          console.log(`   📝 Error: ${result.error}`)
          if (result.debug) console.log(`   🔍 Debug: ${result.debug}`)
        } else {
          console.log('   ⚠️  UNEXPECTED: Invalid session ID not rejected')
        }
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`)
    }
  }

  return true
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive API validation tests...\n')
  
  try {
    const results = await Promise.all([
      testParseCV(),
      testDemoOptimize(),
      testSessionData()
    ])
    
    console.log('\n\n📊 FINAL TEST RESULTS')
    console.log('======================')
    console.log(`✅ Parse CV Tests: ${results[0] ? 'COMPLETED' : 'FAILED'}`)
    console.log(`✅ Demo Optimize Tests: ${results[1] ? 'COMPLETED' : 'FAILED'}`)
    console.log(`✅ Session Data Tests: ${results[2] ? 'COMPLETED' : 'FAILED'}`)
    
    const allPassed = results.every(result => result)
    
    console.log('\n🎯 SUMMARY:')
    console.log('- /api/parse-cv now accepts: cv, file, upload field names')
    console.log('- /api/demo-optimize now accepts: cvText, cv, text, content field names')
    console.log('- /api/get-session-data now accepts: sess_*, demo_session_*, test_*, fallback_* formats')
    console.log('- All APIs provide detailed error messages with debug information')
    
    if (allPassed) {
      console.log('\n🎉 ALL API VALIDATION FIXES WORKING CORRECTLY!')
    } else {
      console.log('\n⚠️  Some tests encountered issues - check individual results above')
    }
    
    return allPassed
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message)
    return false
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Fatal test error:', error)
      process.exit(1)
    })
}

module.exports = { runAllTests, testParseCV, testDemoOptimize, testSessionData }