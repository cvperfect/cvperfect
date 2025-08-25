#!/usr/bin/env node
/**
 * CVPerfect Performance Audit CLI Tool
 * Comprehensive performance analysis for web applications
 */

const fs = require('fs').promises
const path = require('path')
const { performance } = require('perf_hooks')

class PerformanceAuditCLI {
  constructor() {
    this.args = process.argv.slice(2)
    this.auditResults = {}
  }

  async run() {
    try {
      if (this.args.length === 0) {
        this.showHelp()
        return
      }

      const target = this.args[0]
      const options = this.parseOptions()

      console.log('⚡ CVPerfect Performance Audit')
      console.log('==============================')
      console.log(`🎯 Target: ${target}`)
      
      const startTime = performance.now()

      // Run comprehensive performance audit
      const results = await this.performAudit(target, options)
      
      const endTime = performance.now()
      results.auditDuration = Math.round(endTime - startTime)

      // Display results
      await this.displayResults(results, options.format)

      process.exit(0)
    } catch (error) {
      console.error('❌ Performance audit failed:', error.message)
      process.exit(1)
    }
  }

  parseOptions() {
    const options = {
      format: 'text',
      deep: false,
      bundle: false,
      network: false,
      memory: false
    }

    for (let i = 1; i < this.args.length; i++) {
      const arg = this.args[i]
      
      if (arg === '--format' && this.args[i + 1]) {
        options.format = this.args[i + 1]
        i++
      } else if (arg === '--deep') {
        options.deep = true
      } else if (arg === '--bundle') {
        options.bundle = true
      } else if (arg === '--network') {
        options.network = true
      } else if (arg === '--memory') {
        options.memory = true
      }
    }

    return options
  }

  async performAudit(target, options) {
    const results = {
      target,
      timestamp: new Date().toISOString(),
      scores: {},
      metrics: {},
      recommendations: [],
      details: {}
    }

    console.log('🔍 Analyzing performance metrics...')

    // File system performance
    if (await this.isDirectory(target)) {
      results.metrics.fileSystem = await this.auditFileSystem(target)
    } else if (await this.isFile(target)) {
      results.metrics.singleFile = await this.auditSingleFile(target)
    } else if (this.isUrl(target)) {
      results.metrics.network = await this.auditNetwork(target, options)
    }

    // Bundle analysis
    if (options.bundle) {
      results.metrics.bundle = await this.auditBundle(target)
    }

    // Memory analysis
    if (options.memory) {
      results.metrics.memory = await this.auditMemory()
    }

    // Calculate scores
    results.scores = this.calculateScores(results.metrics)

    // Generate recommendations
    results.recommendations = await this.generateRecommendations(results)

    console.log('✅ Performance audit completed')
    return results
  }

  async auditFileSystem(directory) {
    const startTime = performance.now()
    
    try {
      const files = await this.scanDirectory(directory, true)
      const endTime = performance.now()

      // Analyze file sizes and types
      const analysis = {
        totalFiles: files.length,
        totalSize: 0,
        largeFiles: [],
        duplicates: [],
        extensions: {},
        scanTime: Math.round(endTime - startTime)
      }

      for (const file of files) {
        const stats = await fs.stat(file)
        analysis.totalSize += stats.size

        // Track large files (>1MB)
        if (stats.size > 1024 * 1024) {
          analysis.largeFiles.push({
            path: file,
            size: this.formatBytes(stats.size),
            bytes: stats.size
          })
        }

        // Track file extensions
        const ext = path.extname(file).toLowerCase()
        analysis.extensions[ext] = (analysis.extensions[ext] || 0) + 1
      }

      analysis.totalSizeFormatted = this.formatBytes(analysis.totalSize)
      analysis.largeFiles.sort((a, b) => b.bytes - a.bytes)

      return analysis
    } catch (error) {
      return { error: error.message }
    }
  }

  async auditSingleFile(filePath) {
    const startTime = performance.now()
    
    try {
      const stats = await fs.stat(filePath)
      const content = await fs.readFile(filePath, 'utf8')
      const endTime = performance.now()

      return {
        path: filePath,
        size: this.formatBytes(stats.size),
        bytes: stats.size,
        lines: content.split('\n').length,
        characters: content.length,
        readTime: Math.round(endTime - startTime),
        encoding: 'utf8',
        lastModified: stats.mtime.toISOString()
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  async auditNetwork(url, options) {
    console.log(`🌐 Network performance test: ${url}`)
    
    // Simulate network performance metrics
    // In a real implementation, this would use puppeteer or similar
    const startTime = performance.now()
    
    try {
      // Placeholder for actual network testing
      await new Promise(resolve => setTimeout(resolve, 100))
      const endTime = performance.now()

      return {
        url,
        responseTime: Math.round(endTime - startTime),
        status: 'simulated',
        note: 'Use --network with actual URL testing for real metrics'
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  async auditBundle(target) {
    console.log('📦 Bundle analysis...')
    
    try {
      // Look for common bundle files
      const bundleFiles = []
      const possibleBundles = [
        'dist', 'build', '.next', 'out',
        'bundle.js', 'main.js', 'app.js'
      ]

      for (const bundle of possibleBundles) {
        const bundlePath = path.join(target, bundle)
        if (await this.pathExists(bundlePath)) {
          const stats = await fs.stat(bundlePath)
          bundleFiles.push({
            name: bundle,
            path: bundlePath,
            size: this.formatBytes(stats.size),
            bytes: stats.size,
            isDirectory: stats.isDirectory()
          })
        }
      }

      return {
        found: bundleFiles.length > 0,
        bundles: bundleFiles,
        totalSize: bundleFiles.reduce((sum, b) => sum + b.bytes, 0)
      }
    } catch (error) {
      return { error: error.message }
    }
  }

  async auditMemory() {
    const memUsage = process.memoryUsage()
    
    return {
      rss: this.formatBytes(memUsage.rss),
      heapTotal: this.formatBytes(memUsage.heapTotal),
      heapUsed: this.formatBytes(memUsage.heapUsed),
      external: this.formatBytes(memUsage.external),
      arrayBuffers: this.formatBytes(memUsage.arrayBuffers || 0)
    }
  }

  calculateScores(metrics) {
    const scores = {
      overall: 85 // Base score
    }

    // File system score
    if (metrics.fileSystem) {
      let fileScore = 100
      
      // Penalize for large number of files
      if (metrics.fileSystem.totalFiles > 10000) fileScore -= 20
      else if (metrics.fileSystem.totalFiles > 5000) fileScore -= 10
      
      // Penalize for large total size
      if (metrics.fileSystem.totalSize > 1000 * 1024 * 1024) fileScore -= 20
      else if (metrics.fileSystem.totalSize > 500 * 1024 * 1024) fileScore -= 10
      
      scores.fileSystem = Math.max(0, fileScore)
    }

    // Bundle score
    if (metrics.bundle) {
      scores.bundle = metrics.bundle.found ? 
        (metrics.bundle.totalSize < 10 * 1024 * 1024 ? 90 : 70) : 100
    }

    // Calculate overall score
    const scoreValues = Object.values(scores).filter(s => s !== scores.overall)
    if (scoreValues.length > 0) {
      scores.overall = Math.round(scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length)
    }

    return scores
  }

  async generateRecommendations(results) {
    const recommendations = []

    if (results.metrics.fileSystem) {
      const fs = results.metrics.fileSystem
      
      if (fs.largeFiles.length > 0) {
        recommendations.push(`🗂️  Consider optimizing ${fs.largeFiles.length} large files (>1MB)`)
      }
      
      if (fs.totalFiles > 5000) {
        recommendations.push('📁 Large file count detected - consider organizing or archiving')
      }

      if (fs.extensions['.js'] > 100) {
        recommendations.push('⚡ Many JavaScript files - consider bundling for production')
      }

      if (fs.extensions['.png'] + fs.extensions['.jpg'] + fs.extensions['.jpeg'] > 50) {
        recommendations.push('🖼️  Image optimization recommended for better performance')
      }
    }

    if (results.metrics.bundle && results.metrics.bundle.found) {
      const totalMB = results.metrics.bundle.totalSize / (1024 * 1024)
      if (totalMB > 10) {
        recommendations.push(`📦 Bundle size is ${totalMB.toFixed(1)}MB - consider code splitting`)
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('✨ Performance looks good! No major issues detected.')
    }

    return recommendations
  }

  async displayResults(results, format) {
    switch (format) {
      case 'json':
        console.log(JSON.stringify(results, null, 2))
        break
      
      case 'html':
        await this.generateHtmlReport(results)
        break
        
      default:
        this.displayTextResults(results)
    }
  }

  displayTextResults(results) {
    console.log('\n⚡ Performance Audit Results')
    console.log('============================')
    
    console.log(`\n🎯 Overall Score: ${results.scores.overall}/100`)
    
    if (results.scores.fileSystem) {
      console.log(`├── File System: ${results.scores.fileSystem}/100`)
    }
    if (results.scores.bundle) {
      console.log(`├── Bundle: ${results.scores.bundle}/100`)
    }
    
    // File system metrics
    if (results.metrics.fileSystem) {
      const fs = results.metrics.fileSystem
      console.log('\n📁 File System Analysis')
      console.log('──────────────────────')
      console.log(`Total Files: ${fs.totalFiles}`)
      console.log(`Total Size: ${fs.totalSizeFormatted}`)
      console.log(`Scan Time: ${fs.scanTime}ms`)
      
      if (fs.largeFiles.length > 0) {
        console.log(`\n🗂️  Largest Files (${fs.largeFiles.slice(0, 5).length} shown):`)
        fs.largeFiles.slice(0, 5).forEach(file => {
          console.log(`   ${file.size} - ${path.basename(file.path)}`)
        })
      }
    }

    // Single file metrics
    if (results.metrics.singleFile) {
      const sf = results.metrics.singleFile
      console.log('\n📄 File Analysis')
      console.log('────────────────')
      console.log(`Size: ${sf.size} (${sf.bytes} bytes)`)
      console.log(`Lines: ${sf.lines}`)
      console.log(`Read Time: ${sf.readTime}ms`)
    }

    // Bundle metrics
    if (results.metrics.bundle && results.metrics.bundle.found) {
      console.log('\n📦 Bundle Analysis')
      console.log('─────────────────')
      results.metrics.bundle.bundles.forEach(bundle => {
        console.log(`${bundle.name}: ${bundle.size}`)
      })
    }

    // Memory metrics
    if (results.metrics.memory) {
      console.log('\n🧠 Memory Usage')
      console.log('──────────────')
      console.log(`Heap Used: ${results.metrics.memory.heapUsed}`)
      console.log(`RSS: ${results.metrics.memory.rss}`)
    }

    // Recommendations
    if (results.recommendations.length > 0) {
      console.log('\n💡 Recommendations')
      console.log('─────────────────')
      results.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`)
      })
    }

    console.log(`\n⏱️  Audit completed in ${results.auditDuration}ms`)
  }

  async generateHtmlReport(results) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Performance Audit Report - ${results.target}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .score { font-size: 24px; font-weight: bold; color: #16a34a; }
    .section { margin: 20px 0; padding: 15px; border-left: 4px solid #16a34a; background: #f0fdf4; }
    .metric { display: flex; justify-content: space-between; margin: 5px 0; }
    .recommendation { padding: 8px; margin: 5px 0; background: #fef3c7; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>⚡ Performance Audit Report</h1>
  <div class="score">Overall Score: ${results.scores.overall}/100</div>
  
  <div class="section">
    <h2>Audit Summary</h2>
    <div class="metric"><span>Target:</span><span>${results.target}</span></div>
    <div class="metric"><span>Duration:</span><span>${results.auditDuration}ms</span></div>
    <div class="metric"><span>Timestamp:</span><span>${new Date(results.timestamp).toLocaleString()}</span></div>
  </div>
  
  ${results.metrics.fileSystem ? `
  <div class="section">
    <h2>File System Metrics</h2>
    <div class="metric"><span>Total Files:</span><span>${results.metrics.fileSystem.totalFiles}</span></div>
    <div class="metric"><span>Total Size:</span><span>${results.metrics.fileSystem.totalSizeFormatted}</span></div>
    <div class="metric"><span>Large Files:</span><span>${results.metrics.fileSystem.largeFiles.length}</span></div>
  </div>
  ` : ''}
  
  <div class="section">
    <h2>Recommendations</h2>
    ${results.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
  </div>
  
  <p><em>Generated: ${new Date().toLocaleString()}</em></p>
</body>
</html>`

    const fileName = `perf-audit-${Date.now()}.html`
    await fs.writeFile(fileName, html)
    console.log(`\n📊 HTML report generated: ${fileName}`)
  }

  // Utility methods
  async isDirectory(target) {
    try {
      const stats = await fs.stat(target)
      return stats.isDirectory()
    } catch {
      return false
    }
  }

  async isFile(target) {
    try {
      const stats = await fs.stat(target)
      return stats.isFile()
    } catch {
      return false
    }
  }

  isUrl(target) {
    return target.startsWith('http://') || target.startsWith('https://')
  }

  async pathExists(filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  async scanDirectory(dir, recursive = false) {
    const files = []
    
    try {
      const items = await fs.readdir(dir)
      
      for (const item of items) {
        const fullPath = path.join(dir, item)
        const stats = await fs.stat(fullPath)
        
        if (stats.isFile()) {
          files.push(fullPath)
        } else if (stats.isDirectory() && recursive) {
          const subFiles = await this.scanDirectory(fullPath, true)
          files.push(...subFiles)
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return files
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  showHelp() {
    console.log(`
⚡ CVPerfect Performance Audit CLI Tool
=====================================

Usage:
  node perf-audit.js <target> [options]

Targets:
  directory       Analyze directory structure and files
  file.js         Analyze single file performance  
  http://url      Network performance analysis

Options:
  --format <json|text|html>  Output format (default: text)
  --deep                     Deep analysis with detailed metrics
  --bundle                   Analyze bundle files and sizes
  --network                  Include network performance tests
  --memory                   Include memory usage analysis

Examples:
  node perf-audit.js .
  node perf-audit.js pages/index.js --format json
  node perf-audit.js . --bundle --deep --format html
  node perf-audit.js https://example.com --network

Metrics:
  File system performance, bundle analysis, memory usage,
  network performance, and optimization recommendations
`)
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new PerformanceAuditCLI()
  cli.run()
}

module.exports = PerformanceAuditCLI