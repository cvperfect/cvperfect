// CVPerfect Code Analyzer Engine
// Analyzes code quality, complexity, security, and performance

const fs = require('fs').promises
const path = require('path')

class CodeAnalyzer {
  constructor() {
    this.securityPatterns = [
      { pattern: /eval\(/, severity: 'high', message: 'Use of eval() is dangerous' },
      { pattern: /dangerouslySetInnerHTML/, severity: 'medium', message: 'Potential XSS vulnerability' },
      { pattern: /document\.write/, severity: 'high', message: 'document.write can be exploited' },
      { pattern: /localStorage\.setItem\([^,]*,\s*[^)]*password[^)]*\)/gi, severity: 'high', message: 'Storing passwords in localStorage' },
      { pattern: /console\.log/, severity: 'low', message: 'Remove console.log in production' }
    ]
    
    this.performancePatterns = [
      { pattern: /document\.getElementById.*loop|for.*document\.getElementById/gi, severity: 'medium', message: 'DOM queries in loops are inefficient' },
      { pattern: /useState.*\[\].*map/gi, severity: 'low', message: 'Consider useMemo for expensive computations' },
      { pattern: /useEffect.*\[\]/g, severity: 'low', message: 'Empty dependency array - verify if needed' }
    ]
    
    this.bestPracticePatterns = [
      { pattern: /var\s+/g, severity: 'low', message: 'Use let/const instead of var' },
      { pattern: /==(?!=)/g, severity: 'low', message: 'Use === instead of ==' },
      { pattern: /function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g, severity: 'info', message: 'Consider arrow functions for consistency' }
    ]
  }

  async analyze(componentPath, options = {}) {
    try {
      console.log('💻 Starting code analysis:', componentPath, options)

      // Read the file
      const code = await this.readCodeFile(componentPath)
      
      if (!code || code.trim().length < 10) {
        throw new Error('Could not read code file or file is too small')
      }

      // Perform comprehensive analysis
      const analysis = {
        metadata: {
          filePath: componentPath,
          fileSize: await this.getFileSize(componentPath),
          linesOfCode: code.split('\n').length,
          codeSize: code.length,
          analyzedAt: new Date().toISOString()
        },
        complexity: await this.calculateComplexity(code),
        securityIssues: await this.findSecurityIssues(code),
        performanceIssues: await this.findPerformanceIssues(code),
        bestPractices: await this.checkBestPractices(code),
        codeMetrics: await this.calculateMetrics(code),
        recommendations: [],
        scores: {}
      }

      // Calculate scores
      analysis.scores = {
        security: this.calculateSecurityScore(analysis.securityIssues),
        performance: this.calculatePerformanceScore(analysis.performanceIssues),
        maintainability: this.calculateMaintainabilityScore(analysis.complexity, analysis.codeMetrics),
        bestPractices: this.calculateBestPracticesScore(analysis.bestPractices)
      }

      // Generate recommendations
      analysis.recommendations = await this.generateCodeRecommendations(analysis)

      // Overall score
      analysis.overallScore = Math.round(
        (analysis.scores.security + analysis.scores.performance + 
         analysis.scores.maintainability + analysis.scores.bestPractices) / 4
      )

      console.log('✅ Code analysis completed:', {
        overallScore: analysis.overallScore,
        securityScore: analysis.scores.security,
        performanceScore: analysis.scores.performance,
        issues: analysis.securityIssues.length + analysis.performanceIssues.length
      })

      return analysis

    } catch (error) {
      console.error('❌ Code analysis failed:', error)
      throw new Error(`Code analysis failed: ${error.message}`)
    }
  }

  // Read code file
  async readCodeFile(filePath) {
    try {
      // Handle both absolute and relative paths
      const fullPath = path.isAbsolute(filePath) ? 
        filePath : 
        path.join(process.cwd(), filePath)
      
      return await fs.readFile(fullPath, 'utf8')
    } catch (error) {
      throw new Error(`Could not read file: ${error.message}`)
    }
  }

  // Calculate cyclomatic complexity
  async calculateComplexity(code) {
    let complexity = 1 // Base complexity
    
    // Count decision points
    const decisionPatterns = [
      /if\s*\(/g,           // if statements
      /else\s+if\s*\(/g,    // else if statements  
      /while\s*\(/g,        // while loops
      /for\s*\(/g,          // for loops
      /case\s+/g,           // switch cases
      /catch\s*\(/g,        // try/catch blocks
      /&&|\|\|/g,           // logical operators
      /\?[^:]*:/g,          // ternary operators
    ]

    decisionPatterns.forEach(pattern => {
      const matches = code.match(pattern)
      if (matches) {
        complexity += matches.length
      }
    })

    // Function complexity
    const functions = code.match(/function\s+\w+|=>\s*{|\w+\s*:\s*function/g) || []
    const avgComplexityPerFunction = functions.length > 0 ? complexity / functions.length : complexity

    return {
      overall: complexity,
      functions: functions.length,
      averagePerFunction: Math.round(avgComplexityPerFunction * 100) / 100,
      rating: this.getComplexityRating(complexity)
    }
  }

  // Get complexity rating
  getComplexityRating(complexity) {
    if (complexity <= 5) return 'low'
    if (complexity <= 10) return 'moderate'  
    if (complexity <= 20) return 'high'
    return 'very_high'
  }

  // Find security issues
  async findSecurityIssues(code) {
    const issues = []
    
    this.securityPatterns.forEach(({ pattern, severity, message }) => {
      const matches = [...code.matchAll(pattern)]
      matches.forEach(match => {
        issues.push({
          type: 'security',
          severity,
          message,
          line: this.getLineNumber(code, match.index),
          code: match[0],
          position: match.index
        })
      })
    })

    return issues
  }

  // Find performance issues
  async findPerformanceIssues(code) {
    const issues = []
    
    this.performancePatterns.forEach(({ pattern, severity, message }) => {
      const matches = [...code.matchAll(pattern)]
      matches.forEach(match => {
        issues.push({
          type: 'performance',
          severity,
          message,
          line: this.getLineNumber(code, match.index),
          code: match[0],
          position: match.index
        })
      })
    })

    return issues
  }

  // Check best practices
  async checkBestPractices(code) {
    const issues = []
    
    this.bestPracticePatterns.forEach(({ pattern, severity, message }) => {
      const matches = [...code.matchAll(pattern)]
      matches.forEach(match => {
        issues.push({
          type: 'best_practice',
          severity,
          message,
          line: this.getLineNumber(code, match.index),
          code: match[0],
          position: match.index
        })
      })
    })

    return issues
  }

  // Calculate code metrics
  async calculateMetrics(code) {
    const lines = code.split('\n')
    const nonEmptyLines = lines.filter(line => line.trim().length > 0)
    const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('/*'))
    
    return {
      totalLines: lines.length,
      codeLines: nonEmptyLines.length,
      commentLines: commentLines.length,
      commentRatio: commentLines.length / nonEmptyLines.length,
      averageLineLength: nonEmptyLines.reduce((sum, line) => sum + line.length, 0) / nonEmptyLines.length,
      longestLine: Math.max(...lines.map(line => line.length)),
      functions: (code.match(/function\s+\w+|=>\s*{|\w+\s*:\s*function/g) || []).length,
      classes: (code.match(/class\s+\w+/g) || []).length,
      imports: (code.match(/import\s+.*from|require\s*\(/g) || []).length
    }
  }

  // Calculate security score
  calculateSecurityScore(issues) {
    let score = 100
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high': score -= 20; break
        case 'medium': score -= 10; break
        case 'low': score -= 5; break
      }
    })
    
    return Math.max(0, score)
  }

  // Calculate performance score
  calculatePerformanceScore(issues) {
    let score = 100
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high': score -= 15; break
        case 'medium': score -= 10; break
        case 'low': score -= 5; break
      }
    })
    
    return Math.max(0, score)
  }

  // Calculate maintainability score
  calculateMaintainabilityScore(complexity, metrics) {
    let score = 100
    
    // Complexity penalty
    if (complexity.overall > 20) score -= 30
    else if (complexity.overall > 10) score -= 15
    else if (complexity.overall > 5) score -= 5
    
    // Comment ratio bonus/penalty
    if (metrics.commentRatio < 0.1) score -= 10
    else if (metrics.commentRatio > 0.3) score += 5
    
    // Function size penalty
    if (metrics.codeLines / metrics.functions > 50) score -= 10
    
    return Math.max(0, Math.min(100, score))
  }

  // Calculate best practices score
  calculateBestPracticesScore(issues) {
    let score = 100
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'medium': score -= 10; break
        case 'low': score -= 3; break
        case 'info': score -= 1; break
      }
    })
    
    return Math.max(0, score)
  }

  // Generate code recommendations
  async generateCodeRecommendations(analysis) {
    const recommendations = []
    
    // Security recommendations
    if (analysis.scores.security < 80) {
      recommendations.push('🛡️ Address security vulnerabilities, especially high-severity issues')
    }
    
    // Performance recommendations  
    if (analysis.scores.performance < 80) {
      recommendations.push('⚡ Optimize performance bottlenecks, particularly DOM operations')
    }
    
    // Complexity recommendations
    if (analysis.complexity.overall > 15) {
      recommendations.push('🔧 Consider breaking down complex functions (complexity: ' + analysis.complexity.overall + ')')
    }
    
    // Comment recommendations
    if (analysis.codeMetrics.commentRatio < 0.1) {
      recommendations.push('📝 Add more comments to improve code documentation')
    }
    
    // Best practices
    if (analysis.scores.bestPractices < 90) {
      recommendations.push('✨ Follow modern JavaScript best practices (use const/let, ===, arrow functions)')
    }
    
    // File size recommendations
    if (analysis.codeMetrics.codeLines > 300) {
      recommendations.push('📦 Consider splitting large file into smaller, focused modules')
    }

    return recommendations
  }

  // Get line number from character position
  getLineNumber(code, position) {
    const beforePosition = code.substring(0, position)
    return beforePosition.split('\n').length
  }

  // Get file size
  async getFileSize(filePath) {
    try {
      const fullPath = path.isAbsolute(filePath) ? 
        filePath : 
        path.join(process.cwd(), filePath)
      
      const stats = await fs.stat(fullPath)
      return {
        bytes: stats.size,
        formatted: this.formatBytes(stats.size)
      }
    } catch (error) {
      return { bytes: 0, formatted: 'Unknown' }
    }
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
}

module.exports = CodeAnalyzer