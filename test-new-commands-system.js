#!/usr/bin/env node
/**
 * CVPerfect New Commands System Test Suite
 * Tests all newly implemented /analyze, /cli-tool, /docs commands
 */

const fs = require('fs').promises
const path = require('path')

class NewCommandsTestSuite {
  constructor() {
    this.baseUrl = 'http://localhost:3001'
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    }
  }

  async runAllTests() {
    console.log('🧪 CVPerfect New Commands System Test Suite')
    console.log('============================================')
    console.log(`🎯 Testing against: ${this.baseUrl}`)
    console.log(`⏰ Started: ${new Date().toLocaleTimeString()}`)
    
    try {
      // Test categories
      await this.testAnalyzeCommands()
      await this.testCliToolCommands()
      await this.testDocsCommands()
      await this.testCommandHandler()
      await this.testSequentialThinking()
      await this.testIntegration()
      
      // Generate report
      this.generateReport()
      return this.results
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message)
      throw error
    }
  }

  async testAnalyzeCommands() {
    console.log('\n📊 Testing /analyze Commands')
    console.log('─'.repeat(30))
    
    const tests = [
      {
        name: 'CV Analysis API',
        test: () => this.testApiEndpoint('/api/analyze-command', {
          type: 'cv',
          target: 'test-resume.pdf',
          options: { format: 'json' }
        })
      },
      {
        name: 'Code Analysis API',
        test: () => this.testApiEndpoint('/api/analyze-command', {
          type: 'code', 
          target: 'pages/index.js',
          options: {}
        })
      },
      {
        name: 'Performance Analysis',
        test: () => this.testApiEndpoint('/api/analyze-command', {
          type: 'performance',
          target: 'http://localhost:3001',
          options: {}
        })
      },
      {
        name: 'Security Analysis',
        test: () => this.testApiEndpoint('/api/analyze-command', {
          type: 'security',
          options: {}
        })
      },
      {
        name: 'Business Analysis',
        test: () => this.testApiEndpoint('/api/analyze-command', {
          type: 'business',
          options: {}
        })
      }
    ]

    for (const testCase of tests) {
      await this.runTest(testCase.name, testCase.test)
    }
  }

  async testCliToolCommands() {
    console.log('\n🔧 Testing /cli-tool Commands')
    console.log('─'.repeat(30))
    
    const tests = [
      {
        name: 'CV Analyzer Tool',
        test: () => this.testApiEndpoint('/api/cli-tool-command', {
          tool: 'cv-analyzer',
          args: ['test-file.pdf'],
          options: { format: 'json' }
        })
      },
      {
        name: 'Data Export Tool',
        test: () => this.testApiEndpoint('/api/cli-tool-command', {
          tool: 'data-export',
          args: ['sessions'],
          options: { format: 'json' }
        })
      },
      {
        name: 'Performance Audit Tool',
        test: () => this.testApiEndpoint('/api/cli-tool-command', {
          tool: 'perf-audit',
          args: ['.'],
          options: { bundle: true }
        })
      },
      {
        name: 'CLI Tools List',
        test: () => this.testApiEndpoint('/api/cli-tool-command', {
          tool: 'list',
          args: [],
          options: {}
        })
      },
      {
        name: 'CLI Tool Info',
        test: () => this.testApiEndpoint('/api/cli-tool-command', {
          tool: 'info',
          args: ['cv-analyzer'],
          options: {}
        })
      }
    ]

    for (const testCase of tests) {
      await this.runTest(testCase.name, testCase.test)
    }
  }

  async testDocsCommands() {
    console.log('\n📚 Testing /docs Commands')
    console.log('─'.repeat(30))
    
    const tests = [
      {
        name: 'Documentation Search',
        test: () => this.testApiEndpoint('/api/docs-command', {
          action: 'search',
          query: 'react',
          options: {}
        })
      },
      {
        name: 'Read Documentation',
        test: () => this.testApiEndpoint('/api/docs-command', {
          action: 'read',
          path: 'CLAUDE.md',
          options: { preview: true }
        })
      },
      {
        name: 'Generate Documentation',
        test: () => this.testApiEndpoint('/api/docs-command', {
          action: 'generate',
          query: 'test-component',
          options: { type: 'component' }
        })
      },
      {
        name: 'List Documentation',
        test: () => this.testApiEndpoint('/api/docs-command', {
          action: 'list',
          query: '',
          options: {}
        })
      },
      {
        name: 'Next.js Documentation',
        test: () => this.testApiEndpoint('/api/docs-command', {
          action: 'next',
          query: 'api-routes',
          options: {}
        })
      },
      {
        name: 'React Documentation', 
        test: () => this.testApiEndpoint('/api/docs-command', {
          action: 'react',
          query: 'hooks',
          options: {}
        })
      },
      {
        name: 'Best Practices',
        test: () => this.testApiEndpoint('/api/docs-command', {
          action: 'best-practices',
          query: 'cvperfect',
          options: {}
        })
      }
    ]

    for (const testCase of tests) {
      await this.runTest(testCase.name, testCase.test)
    }
  }

  async testCommandHandler() {
    console.log('\n⚙️ Testing Command Handler System')
    console.log('─'.repeat(30))
    
    const tests = [
      {
        name: 'Command Handler Module',
        test: async () => {
          const { CVPerfectCommandHandler } = require('./lib/command-handler')
          const handler = new CVPerfectCommandHandler()
          
          // Test command execution
          const result = await handler.executeCommand('analyze', ['security'], {})
          
          if (!result || !result.success) {
            throw new Error('Command handler failed to execute')
          }
          
          return result
        }
      },
      {
        name: 'CV Analyzer Integration',
        test: async () => {
          const CVAnalyzer = require('./lib/cv-analyzer')
          const analyzer = new CVAnalyzer()
          
          // Test with dummy CV text
          const dummyCvPath = path.join(__dirname, 'test-dummy-cv.txt')
          await fs.writeFile(dummyCvPath, 'John Doe\nSoftware Developer\nExperience: 5 years\nSkills: JavaScript, React, Node.js\nEducation: Computer Science degree')
          
          const result = await analyzer.analyze(dummyCvPath, {})
          
          // Cleanup
          await fs.unlink(dummyCvPath).catch(() => {})
          
          if (!result || typeof result.atsScore !== 'number') {
            throw new Error('CV analyzer failed to produce valid results')
          }
          
          return result
        }
      },
      {
        name: 'Code Analyzer Integration',
        test: async () => {
          const CodeAnalyzer = require('./lib/code-analyzer')
          const analyzer = new CodeAnalyzer()
          
          // Test with dummy code file
          const dummyCodePath = path.join(__dirname, 'test-dummy-code.js')
          await fs.writeFile(dummyCodePath, 'function test() {\n  console.log("test");\n  return true;\n}')
          
          const result = await analyzer.analyze(dummyCodePath, {})
          
          // Cleanup
          await fs.unlink(dummyCodePath).catch(() => {})
          
          if (!result || typeof result.overallScore !== 'number') {
            throw new Error('Code analyzer failed to produce valid results')
          }
          
          return result
        }
      }
    ]

    for (const testCase of tests) {
      await this.runTest(testCase.name, testCase.test)
    }
  }

  async testSequentialThinking() {
    console.log('\n🧠 Testing Sequential Thinking System')
    console.log('─'.repeat(30))
    
    const tests = [
      {
        name: 'Sequential Config File',
        test: async () => {
          const configPath = path.join(__dirname, '.claude', 'session-config.json')
          
          try {
            const config = JSON.parse(await fs.readFile(configPath, 'utf8'))
            
            if (!config.sequential_thinking || !config.sequential_thinking.enabled) {
              throw new Error('Sequential thinking not enabled in config')
            }
            
            return config
          } catch (error) {
            throw new Error(`Sequential config file error: ${error.message}`)
          }
        }
      },
      {
        name: 'Sequential Command File',
        test: async () => {
          const commandPath = path.join(__dirname, '.claude', 'commands', 'sequential-auto-enable.md')
          
          try {
            const content = await fs.readFile(commandPath, 'utf8')
            
            if (!content.includes('Sequential Thinking') || !content.includes('multi-step')) {
              throw new Error('Sequential command file content invalid')
            }
            
            return { content: content.length, valid: true }
          } catch (error) {
            throw new Error(`Sequential command file error: ${error.message}`)
          }
        }
      },
      {
        name: 'Auto Session Init',
        test: async () => {
          const AutoSessionInit = require('./auto-session-init')
          const init = new AutoSessionInit()
          
          const status = init.getSessionStatus()
          
          if (!status || !status.sequential_thinking_status) {
            throw new Error('Sequential thinking not initialized in session status')
          }
          
          return status
        }
      }
    ]

    for (const testCase of tests) {
      await this.runTest(testCase.name, testCase.test)
    }
  }

  async testIntegration() {
    console.log('\n🔗 Testing Full Integration')
    console.log('─'.repeat(30))
    
    const tests = [
      {
        name: 'All API Endpoints Available',
        test: async () => {
          const endpoints = [
            '/api/analyze-command',
            '/api/cli-tool-command', 
            '/api/docs-command'
          ]
          
          const results = {}
          
          for (const endpoint of endpoints) {
            try {
              const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test: true })
              })
              
              results[endpoint] = {
                status: response.status,
                available: response.status !== 404
              }
            } catch (error) {
              results[endpoint] = {
                status: 'error',
                error: error.message,
                available: false
              }
            }
          }
          
          const allAvailable = Object.values(results).every(r => r.available)
          if (!allAvailable) {
            throw new Error('Some API endpoints not available: ' + JSON.stringify(results))
          }
          
          return results
        }
      },
      {
        name: 'CLI Tools Files Present',
        test: async () => {
          const tools = [
            'cli-tools/cv-analyzer.js',
            'cli-tools/data-export.js',
            'cli-tools/perf-audit.js'
          ]
          
          const results = {}
          
          for (const tool of tools) {
            try {
              await fs.access(path.join(__dirname, tool))
              results[tool] = true
            } catch (error) {
              results[tool] = false
            }
          }
          
          const allPresent = Object.values(results).every(r => r)
          if (!allPresent) {
            throw new Error('Some CLI tools missing: ' + JSON.stringify(results))
          }
          
          return results
        }
      }
    ]

    for (const testCase of tests) {
      await this.runTest(testCase.name, testCase.test)
    }
  }

  async testApiEndpoint(endpoint, payload) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`API returned error: ${data.error || data.message || 'Unknown error'}`)
    }
    
    return data
  }

  async runTest(name, testFunction) {
    this.results.total++
    const startTime = Date.now()
    
    try {
      console.log(`🧪 ${name}...`)
      const result = await testFunction()
      const duration = Date.now() - startTime
      
      this.results.passed++
      this.results.tests.push({
        name,
        status: 'passed',
        duration: `${duration}ms`,
        result: typeof result === 'object' ? '[object]' : result
      })
      
      console.log(`  ✅ Passed (${duration}ms)`)
      
    } catch (error) {
      const duration = Date.now() - startTime
      
      this.results.failed++
      this.results.tests.push({
        name,
        status: 'failed',
        duration: `${duration}ms`,
        error: error.message
      })
      
      console.log(`  ❌ Failed (${duration}ms): ${error.message}`)
    }
  }

  generateReport() {
    console.log('\n📊 Test Results Summary')
    console.log('='.repeat(50))
    console.log(`📈 Total Tests: ${this.results.total}`)
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`❌ Failed: ${this.results.failed}`)
    
    const successRate = Math.round((this.results.passed / this.results.total) * 100)
    console.log(`📊 Success Rate: ${successRate}%`)
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:')
      this.results.tests
        .filter(t => t.status === 'failed')
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.error}`)
        })
    }
    
    console.log(`\n⏰ Completed: ${new Date().toLocaleTimeString()}`)
    console.log('🎯 All new commands system components tested!')
  }

  async saveReport() {
    const reportPath = path.join(__dirname, `test-report-new-commands-${Date.now()}.json`)
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2))
    console.log(`📄 Detailed report saved: ${reportPath}`)
  }
}

// Run tests if called directly
if (require.main === module) {
  const suite = new NewCommandsTestSuite()
  
  suite.runAllTests()
    .then(async (results) => {
      await suite.saveReport()
      
      if (results.failed > 0) {
        console.log('\n⚠️ Some tests failed - check the issues above')
        process.exit(1)
      } else {
        console.log('\n🎉 All tests passed successfully!')
        process.exit(0)
      }
    })
    .catch(error => {
      console.error('💥 Test suite crashed:', error)
      process.exit(1)
    })
}

module.exports = NewCommandsTestSuite