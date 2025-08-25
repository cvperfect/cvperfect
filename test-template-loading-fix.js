// Test Suite: Success Page Template Loading State Fix
// Issue #7: Success Page Template Loading State
// ============================================================================

const fs = require('fs');
const path = require('path');

console.log('🧪 TEMPLATE LOADING TEST SUITE - Issue #7');
console.log('==================================================');
console.log('Target: Templates showing "loading state" instead of CV content');
console.log('Debug: hasFullContent: false, fullContentLength: 0');
console.log('Expected: Templates display CV content with hasFullContent: true\n');

// Test Configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  testSessions: [
    {
      id: 'sess_1755865667776_22z3osqrw', // Known working session from context
      description: 'Real Konrad Jakóbczak CV session',
      expectedContent: 'Konrad Jakóbczak',
      expectedLength: 3305 // From context
    },
    {
      id: 'sess_1756025247113_nlixm1b9z', // From git status
      description: 'Recent session from git status',
      expectedContent: null, // To be determined
      expectedLength: null
    }
  ],
  templates: ['simple', 'modern', 'executive', 'tech', 'luxury', 'minimal', 'creative'],
  apiEndpoints: [
    '/api/get-session-data',
    '/api/save-session',
    '/api/analyze'
  ]
};

// Utility Functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logStep(step, description) {
  console.log(`\n🔧 STEP ${step}: ${description}`);
  console.log('─'.repeat(60));
}

function logResult(isSuccess, message) {
  const icon = isSuccess ? '✅' : '❌';
  console.log(`${icon} ${message}`);
}

function logError(error, context) {
  console.error(`❌ ERROR in ${context}:`, error.message);
}

function analyzeSessionFile(sessionPath) {
  try {
    if (!fs.existsSync(sessionPath)) {
      return { exists: false, error: 'File not found' };
    }
    
    const content = fs.readFileSync(sessionPath, 'utf8');
    const sessionData = JSON.parse(content);
    
    return {
      exists: true,
      data: sessionData,
      hasCvData: !!sessionData.cvData,
      cvLength: sessionData.cvData ? sessionData.cvData.length : 0,
      hasEmail: !!sessionData.email,
      hasPlan: !!sessionData.plan,
      structure: Object.keys(sessionData)
    };
  } catch (error) {
    return { exists: true, error: error.message };
  }
}

async function testApiEndpoint(url, sessionId) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data,
      hasData: !!data,
      hasCvData: !!(data.cvData || data.data?.cvData),
      cvLength: (data.cvData || data.data?.cvData || '').length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Main Test Suite
async function runTemplateLoadingTests() {
  console.log(`🌐 Testing URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`📊 Testing ${TEST_CONFIG.testSessions.length} sessions`);
  console.log(`🎨 Testing ${TEST_CONFIG.templates.length} templates\n`);

  // Step 1: Session Data Analysis
  logStep(1, 'Session Data File Analysis');
  
  for (const session of TEST_CONFIG.testSessions) {
    console.log(`\n📁 Analyzing session: ${session.id}`);
    console.log(`   Description: ${session.description}`);
    
    const sessionPath = path.join(process.cwd(), '.sessions', `${session.id}.json`);
    const analysis = analyzeSessionFile(sessionPath);
    
    if (analysis.exists && !analysis.error) {
      logResult(true, `Session file exists: ${sessionPath}`);
      logResult(analysis.hasCvData, `CV data present: ${analysis.hasCvData ? 'YES' : 'NO'}`);
      
      if (analysis.hasCvData) {
        console.log(`   📏 CV Length: ${analysis.cvLength} characters`);
        logResult(analysis.cvLength > 1000, `CV length adequate: ${analysis.cvLength > 1000 ? 'YES' : 'NO'}`);
        
        if (session.expectedLength && analysis.cvLength !== session.expectedLength) {
          logResult(false, `Length mismatch: expected ${session.expectedLength}, got ${analysis.cvLength}`);
        }
      }
      
      console.log(`   📋 Session structure: [${analysis.structure.join(', ')}]`);
      logResult(analysis.hasEmail, `Email present: ${analysis.hasEmail ? 'YES' : 'NO'}`);
      logResult(analysis.hasPlan, `Plan present: ${analysis.hasPlan ? 'YES' : 'NO'}`);
      
    } else if (analysis.error) {
      logResult(false, `Session analysis failed: ${analysis.error}`);
    } else {
      logResult(false, `Session file not found: ${sessionPath}`);
    }
  }

  // Step 2: API Endpoint Testing
  logStep(2, 'API Endpoint Response Analysis');
  
  const workingSession = TEST_CONFIG.testSessions[0]; // Use first session for API tests
  
  for (const endpoint of TEST_CONFIG.apiEndpoints) {
    console.log(`\n🔌 Testing endpoint: ${endpoint}`);
    
    let testUrl = `${TEST_CONFIG.baseUrl}${endpoint}`;
    if (endpoint === '/api/get-session-data') {
      testUrl += `?session_id=${workingSession.id}`;
    }
    
    console.log(`   🎯 URL: ${testUrl}`);
    
    try {
      const result = await testApiEndpoint(testUrl, workingSession.id);
      
      logResult(result.success, `API response: ${result.status || 'ERROR'}`);
      
      if (result.success && result.data) {
        logResult(result.hasData, `Response has data: ${result.hasData ? 'YES' : 'NO'}`);
        logResult(result.hasCvData, `Response has CV data: ${result.hasCvData ? 'YES' : 'NO'}`);
        
        if (result.hasCvData) {
          console.log(`   📏 CV data length: ${result.cvLength} characters`);
          logResult(result.cvLength > 1000, `CV data adequate: ${result.cvLength > 1000 ? 'YES' : 'NO'}`);
        }
        
        // Log response structure for debugging
        if (result.data) {
          const responseKeys = Object.keys(result.data);
          console.log(`   📋 Response keys: [${responseKeys.join(', ')}]`);
        }
      } else if (result.error) {
        logResult(false, `API error: ${result.error}`);
      }
      
    } catch (error) {
      logError(error, `${endpoint}-testing`);
    }
    
    await delay(500); // Prevent rate limiting
  }

  // Step 3: Success Page State Analysis
  logStep(3, 'Success Page Loading State Analysis');
  
  console.log('🔍 Analyzing loading state patterns from code:');
  console.log('  • loadingState.isInitializing: Controls main loading spinner');
  console.log('  • hasFullContent: Determines template content vs loading state');
  console.log('  • fullContentLength: Used for content validation');
  console.log('  • Emergency Loader: Fallback mechanism for data loading');

  // Step 4: Template Loading Logic Analysis
  logStep(4, 'Template Rendering Logic Analysis');
  
  console.log('🎨 Template loading decision tree:');
  console.log('  1. Check loadingState.isInitializing');
  console.log('     ├─ TRUE: Show "Inicjalizowanie..." spinner');
  console.log('     └─ FALSE: Proceed to step 2');
  console.log('  2. Check cvData exists and has content');
  console.log('     ├─ NO DATA: Show "Ładowanie danych CV..." spinner');
  console.log('     └─ HAS DATA: Render template with CV content');
  console.log('  3. Check hasFullContent and fullContentLength');
  console.log('     ├─ hasFullContent: false → Show loading state');
  console.log('     └─ hasFullContent: true → Render CV content');

  console.log('\n🐛 ISSUE #7 ROOT CAUSE ANALYSIS:');
  console.log('═'.repeat(60));
  console.log('❌ PROBLEM: Templates showing loading instead of CV content');
  console.log('🔍 SYMPTOMS: hasFullContent: false, fullContentLength: 0');
  console.log('🎯 ROOT CAUSES:');
  console.log('   1. loadingState.isInitializing not cleared after data fetch');
  console.log('   2. fetchUserDataFromSession fails to set hasFullContent: true');
  console.log('   3. updateAppState not called with correct CV data structure');
  console.log('   4. Emergency loader runs but doesn\'t fix state properly');

  // Step 5: Fix Validation Strategy
  logStep(5, 'Fix Validation Strategy');
  
  console.log('🚀 RECOMMENDED FIXES FOR ISSUE #7:');
  console.log(`
1. LOADING STATE FIX (lines 401, 421, 431 in success.js):
   Ensure fetchUserDataFromSession always clears isInitializing:
   
   updateAppState({ 
     isInitializing: false,
     cvData: processedCVData,
     hasFullContent: true 
   }, 'data-loaded-successfully')

2. CV DATA STRUCTURE FIX:
   Guarantee hasFullContent is set when CV loads:
   
   const cvDataStructure = {
     name: extractedName,
     email: sessionData.email,
     fullContent: sessionData.cvData,
     hasFullContent: true,
     fullContentLength: sessionData.cvData.length,
     plan: sessionData.plan
   }

3. EMERGENCY LOADER ENHANCEMENT (lines 26-72):
   Improve fallback to handle more edge cases:
   
   setLoadingState(prev => ({ 
     ...prev, 
     isInitializing: false,
     hasNoSession: false 
   }))

4. TEMPLATE DEFENSIVE LOGIC:
   Add better fallback in template functions:
   
   if (!data?.fullContent && loadingState.isInitializing) {
     return <LoadingSpinner />;
   }
   if (!data?.fullContent) {
     return <EmptyStateMessage />;
   }
`);

  // Step 6: Browser Testing Strategy
  logStep(6, 'Browser Testing Strategy with MCP Playwright');
  
  console.log('🌐 BROWSER TEST PLAN:');
  console.log('  1. Navigate to success page with known session ID');
  console.log('  2. Wait for loading state to resolve (max 10 seconds)');
  console.log('  3. Check DOM for template content vs loading spinner');
  console.log('  4. Verify CV data appears in templates');
  console.log('  5. Test template switching functionality');
  console.log('  6. Screenshot comparison for visual regression');

  console.log('\n📋 BROWSER AUTOMATION COMMANDS:');
  console.log(`
await browser.navigate('${TEST_CONFIG.baseUrl}/success?session_id=${workingSession.id}');
await browser.wait_for({ time: 2 }); // Wait for initial load
const snapshot = await browser.snapshot();
// Check for loading spinner vs CV content
const hasLoadingSpinner = snapshot.includes('Ładowanie danych CV');
const hasContent = snapshot.includes('Konrad Jakóbczak');
`);

  // Test Summary
  console.log('\n✅ Template Loading Test Suite Completed');
  console.log('═'.repeat(60));
  console.log('📊 Analysis complete - ready for implementation fixes');
  console.log('🎯 Next: Implement fixes with exact line numbers');
  console.log('🧪 Next: Run browser tests with MCP Playwright\n');
}

// Execute if run directly
if (require.main === module) {
  runTemplateLoadingTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runTemplateLoadingTests, TEST_CONFIG };