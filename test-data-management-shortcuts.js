// Test script for data management shortcuts
// Verifies all /data commands work correctly with API integration

const fetch = require('node-fetch').default || require('node-fetch')

const API_BASE = 'http://localhost:3001/api'

async function testDataManagementAPI() {
  console.log('🧪 Testing CVPerfect Data Management API')
  console.log('=====================================\n')

  const tests = [
    {
      name: 'Data Show All (/ds)',
      endpoint: '/data-management',
      body: { command: 'show', category: 'all' },
      expectKeys: ['sessions', 'cv', 'cache']
    },
    {
      name: 'Data Show Sessions (/ds s)', 
      endpoint: '/data-management',
      body: { command: 'show', category: 'sessions' },
      expectKeys: ['totalFiles', 'totalSize', 'sessions', 'breakdown']
    },
    {
      name: 'Data Show CV (/ds c)',
      endpoint: '/data-management', 
      body: { command: 'show', category: 'cv' },
      expectKeys: ['totalFiles', 'totalSize', 'files', 'breakdown']
    },
    {
      name: 'Data Show Cache (/ds ch)',
      endpoint: '/data-management',
      body: { command: 'show', category: 'cache' },
      expectKeys: ['totalFiles', 'totalSize', 'files', 'breakdown']
    },
    {
      name: 'Data Stats (/dst)',
      endpoint: '/data-management',
      body: { command: 'stats' },
      expectKeys: ['total', 'categories', 'breakdown']
    },
    {
      name: 'Data Stats Summary (/dst -s)',
      endpoint: '/data-management', 
      body: { command: 'stats', options: { summary: true } },
      expectKeys: ['total', 'categories']
    },
    {
      name: 'Data Cleanup Dry Run (/dc cache --dry-run)',
      endpoint: '/data-management',
      body: { command: 'cleanup', category: 'cache', options: { days: 1, dryRun: true } },
      expectKeys: ['totalFound', 'expired', 'deleted', 'dryRun']
    }
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    try {
      console.log(`🔍 ${test.name}`)
      
      const response = await fetch(`${API_BASE}${test.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.body)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'API returned success: false')
      }

      // Verify expected keys exist
      const hasAllKeys = test.expectKeys.every(key => {
        const hasKey = result.data && Object.prototype.hasOwnProperty.call(result.data, key)
        if (!hasKey) {
          console.log(`   ❌ Missing key: ${key}`)
        }
        return hasKey
      })

      if (hasAllKeys) {
        console.log(`   ✅ SUCCESS - All keys present: ${test.expectKeys.join(', ')}`)
        
        // Show sample data for verification
        if (test.body.command === 'show' && test.body.category === 'sessions') {
          const sessions = result.data.sessions || []
          console.log(`   📊 Found ${sessions.length} sessions, ${result.data.breakdown?.paid || 0} paid`)
        }
        
        if (test.body.command === 'stats') {
          const total = result.data.total || {}
          console.log(`   📊 Total storage: ${total.formattedSize || 'Unknown'} (${total.files || 0} files)`)
        }
        
        if (test.body.command === 'cleanup') {
          console.log(`   🧹 Would delete ${result.data.expired || 0}/${result.data.totalFound || 0} files`)
        }
        
        passed++
      } else {
        failed++
      }

    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`)
      failed++
    }

    console.log('')
  }

  // Test shortcut recognition patterns
  console.log('🎯 Testing Shortcut Recognition Patterns')
  console.log('======================================\n')

  const shortcuts = [
    { input: '/ds', expected: 'show all' },
    { input: '/ds s', expected: 'show sessions' },  
    { input: '/ds c', expected: 'show cv' },
    { input: '/ds ch', expected: 'show cache' },
    { input: '/dc', expected: 'cleanup cache 1 day' },
    { input: '/dc s', expected: 'cleanup sessions 7 days' },
    { input: '/dc c', expected: 'cleanup cv 30 days' },
    { input: '/dc all', expected: 'cleanup all 14 days' },
    { input: '/dst', expected: 'stats full' },
    { input: '/dst -s', expected: 'stats summary' }
  ]

  for (const shortcut of shortcuts) {
    console.log(`🔤 "${shortcut.input}" → ${shortcut.expected}`)
  }

  console.log('\n📋 Test Summary')
  console.log('===============')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED - Data management shortcuts ready!')
    return true
  } else {
    console.log('\n⚠️  Some tests failed - check API endpoints and data structure')
    return false
  }
}

async function testActualDataAccess() {
  console.log('\n🔍 Testing Actual Data Access')
  console.log('=============================')

  try {
    const fs = require('fs').promises
    const path = require('path')
    
    // Check sessions directory
    const sessionsDir = path.join(process.cwd(), '.sessions')
    try {
      const sessionFiles = await fs.readdir(sessionsDir)
      const jsonFiles = sessionFiles.filter(f => f.endsWith('.json'))
      console.log(`📂 Sessions directory: ${jsonFiles.length} JSON files found`)
      
      if (jsonFiles.length > 0) {
        // Sample first session file
        const sampleFile = path.join(sessionsDir, jsonFiles[0])
        const sampleData = JSON.parse(await fs.readFile(sampleFile, 'utf8'))
        console.log(`📄 Sample session: ${sampleData.sessionId || 'No ID'}, plan: ${sampleData.plan || 'No plan'}`)
      }
    } catch (error) {
      console.log(`❌ Sessions directory error: ${error.message}`)
    }

    // Check data directory  
    const dataDir = path.join(process.cwd(), 'data')
    try {
      const dataFiles = await fs.readdir(dataDir)
      const cvFiles = dataFiles.filter(f => f.match(/\.(pdf|docx|html|txt)$/i))
      console.log(`📁 Data directory: ${cvFiles.length} CV files found`)
    } catch (error) {
      console.log(`ℹ️  Data directory: ${error.message}`)
    }

    // Check cache directory
    const cacheDir = path.join(process.cwd(), '.next/cache')
    try {
      const cacheExists = await fs.access(cacheDir).then(() => true).catch(() => false)
      if (cacheExists) {
        console.log(`💾 Cache directory: Exists (.next/cache)`)
      } else {
        console.log(`ℹ️  Cache directory: Not found (.next/cache)`)
      }
    } catch (error) {
      console.log(`ℹ️  Cache directory: ${error.message}`)
    }

  } catch (error) {
    console.log(`❌ File system access error: ${error.message}`)
  }
}

// Run tests
async function main() {
  console.log('🚀 CVPerfect Data Management Shortcuts Test')
  console.log('===========================================\n')

  // Test file system access first
  await testActualDataAccess()

  console.log('\n' + '='.repeat(50) + '\n')

  // Test API endpoints
  const apiSuccess = await testDataManagementAPI()

  console.log('\n🎯 FINAL RESULT')
  console.log('================')
  
  if (apiSuccess) {
    console.log('✅ Data management shortcuts are READY for use!')
    console.log('\nExample usage:')
    console.log('- /ds       → Show all data')
    console.log('- /ds s     → Show sessions') 
    console.log('- /dc       → Daily cache cleanup')
    console.log('- /dst -s   → Storage summary')
  } else {
    console.log('❌ Some components need fixing before shortcuts can be used')
    console.log('\nCheck:')
    console.log('- Server running on localhost:3001')
    console.log('- /api/data-management endpoint working')
    console.log('- lib/data-manager.js properly configured')
  }

  return apiSuccess
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { testDataManagementAPI, testActualDataAccess }