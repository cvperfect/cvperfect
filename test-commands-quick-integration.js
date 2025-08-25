#!/usr/bin/env node
/**
 * Quick Integration Test for New Commands System
 * Fast smoke tests to verify basic functionality
 */

const { CVPerfectCommandHandler } = require('./lib/command-handler')
const fs = require('fs')
const path = require('path')

async function quickIntegrationTest() {
  console.log('🚀 Quick Integration Test - New Commands System')
  console.log('='.repeat(50))
  
  const handler = new CVPerfectCommandHandler()
  let passed = 0
  let failed = 0
  
  // Test 1: Command Handler Creation
  console.log('🧪 Test 1: Command Handler Creation')
  try {
    if (handler && typeof handler.executeCommand === 'function') {
      console.log('  ✅ Command handler created successfully')
      passed++
    } else {
      throw new Error('Invalid command handler')
    }
  } catch (error) {
    console.log('  ❌ Failed:', error.message)
    failed++
  }
  
  // Test 2: Analyze Command Execution
  console.log('🧪 Test 2: Analyze Command - Security Analysis')
  try {
    const result = await handler.executeCommand('analyze', ['security'], {})
    if (result && result.success && result.data) {
      console.log('  ✅ Security analysis completed')
      console.log(`     Vulnerabilities: ${result.data.vulnerabilities ? 'detected' : 'none'}`)
      passed++
    } else {
      throw new Error('Security analysis failed')
    }
  } catch (error) {
    console.log('  ❌ Failed:', error.message)
    failed++
  }
  
  // Test 3: CLI Tool Command
  console.log('🧪 Test 3: CLI Tool Command - List Tools')
  try {
    const result = await handler.executeCommand('cli-tool', ['list'], {})
    if (result && result.success) {
      console.log('  ✅ CLI tools listing successful')
      passed++
    } else {
      throw new Error('CLI tools listing failed')
    }
  } catch (error) {
    console.log('  ❌ Failed:', error.message)
    failed++
  }
  
  // Test 4: Docs Command
  console.log('🧪 Test 4: Docs Command - React Documentation')
  try {
    const result = await handler.executeCommand('docs', ['react'], { query: 'hooks' })
    if (result && result.success && result.data) {
      console.log('  ✅ Documentation retrieval successful')
      console.log(`     Title: ${result.data.title || 'N/A'}`)
      passed++
    } else {
      throw new Error('Documentation retrieval failed')
    }
  } catch (error) {
    console.log('  ❌ Failed:', error.message)
    failed++
  }
  
  // Test 5: Sequential Thinking Configuration
  console.log('🧪 Test 5: Sequential Thinking Status')
  try {
    const configPath = path.join(__dirname, '.claude', 'session-config.json')
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      if (config.sequential_thinking && config.sequential_thinking.enabled) {
        console.log('  ✅ Sequential thinking enabled and configured')
        passed++
      } else {
        throw new Error('Sequential thinking not properly enabled')
      }
    } else {
      throw new Error('Sequential thinking config not found')
    }
  } catch (error) {
    console.log('  ❌ Failed:', error.message)
    failed++
  }
  
  // Test 6: Files and Structure
  console.log('🧪 Test 6: Required Files Present')
  try {
    const requiredFiles = [
      'lib/command-handler.js',
      'lib/cv-analyzer.js', 
      'lib/code-analyzer.js',
      'pages/api/analyze-command.js',
      'pages/api/cli-tool-command.js',
      'pages/api/docs-command.js',
      'cli-tools/cv-analyzer.js',
      'cli-tools/data-export.js',
      'cli-tools/perf-audit.js',
      'auto-session-init.js'
    ]
    
    let missingFiles = []
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(__dirname, file))) {
        missingFiles.push(file)
      }
    }
    
    if (missingFiles.length === 0) {
      console.log('  ✅ All required files present')
      passed++
    } else {
      throw new Error(`Missing files: ${missingFiles.join(', ')}`)
    }
  } catch (error) {
    console.log('  ❌ Failed:', error.message)
    failed++
  }
  
  // Results
  console.log('\n📊 Quick Integration Test Results')
  console.log('='.repeat(40))
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All quick integration tests passed!')
    console.log('🚀 New commands system is ready for use!')
    return true
  } else {
    console.log('\n⚠️ Some integration issues detected')
    return false
  }
}

// Run if called directly
if (require.main === module) {
  quickIntegrationTest()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('💥 Integration test failed:', error)
      process.exit(1)
    })
}

module.exports = quickIntegrationTest