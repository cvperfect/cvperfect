#!/usr/bin/env node
/**
 * CVPerfect CV Analyzer CLI Tool
 * Standalone CV analysis tool that can be run from command line
 */

const CVAnalyzer = require('../lib/cv-analyzer')
const fs = require('fs')
const path = require('path')

class CVAnalyzerCLI {
  constructor() {
    this.analyzer = new CVAnalyzer()
    this.args = process.argv.slice(2)
  }

  async run() {
    try {
      if (this.args.length === 0) {
        this.showHelp()
        return
      }

      const cvFile = this.args[0]
      const options = this.parseOptions()

      console.log('🔍 CVPerfect CV Analyzer')
      console.log('========================')
      console.log(`📄 Analyzing: ${cvFile}`)
      
      // Check if file exists
      if (!fs.existsSync(cvFile)) {
        throw new Error(`File not found: ${cvFile}`)
      }

      // Run analysis
      const result = await this.analyzer.analyze(cvFile, options)
      
      // Format and display results
      await this.displayResults(result, options.format)

      process.exit(0)
    } catch (error) {
      console.error('❌ Error:', error.message)
      process.exit(1)
    }
  }

  parseOptions() {
    const options = {
      format: 'text',
      atsCheck: false,
      keywords: [],
      score: true
    }

    for (let i = 1; i < this.args.length; i++) {
      const arg = this.args[i]
      
      if (arg === '--format' && this.args[i + 1]) {
        options.format = this.args[i + 1]
        i++
      } else if (arg === '--ats-check') {
        options.atsCheck = true
      } else if (arg === '--keywords' && this.args[i + 1]) {
        options.keywords = this.args[i + 1].split(',')
        i++
      } else if (arg === '--no-score') {
        options.score = false
      }
    }

    return options
  }

  async displayResults(result, format) {
    switch (format) {
      case 'json':
        console.log(JSON.stringify(result, null, 2))
        break
      
      case 'html':
        await this.generateHtmlReport(result)
        break
        
      default:
        this.displayTextResults(result)
    }
  }

  displayTextResults(result) {
    console.log('\n📊 Analysis Results')
    console.log('===================')
    
    console.log(`\n🎯 Overall Score: ${result.overallScore}/100`)
    console.log(`├── ATS Score: ${result.atsScore}/100`)
    console.log(`├── Quality Score: ${result.qualityScore}/100`)
    console.log(`└── Words: ${result.content.wordCount}`)
    
    console.log('\n🔍 Keywords Found')
    console.log('─────────────────')
    if (result.keywords.custom.length > 0) {
      console.log(`Custom: ${result.keywords.custom.join(', ')}`)
    }
    if (result.keywords.tech.length > 0) {
      console.log(`Tech: ${result.keywords.tech.join(', ')}`)
    }
    console.log(`Total Keywords: ${result.keywords.total}`)
    
    console.log('\n📋 Sections Identified')
    console.log('──────────────────────')
    result.sections.identified.forEach(section => {
      console.log(`✅ ${section}`)
    })
    if (result.sections.missing.length > 0) {
      console.log('\nMissing sections:')
      result.sections.missing.forEach(section => {
        console.log(`❌ ${section}`)
      })
    }
    
    if (result.recommendations.length > 0) {
      console.log('\n💡 Recommendations')
      console.log('──────────────────')
      result.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`)
      })
    }
    
    console.log(`\n📁 Analysis saved as: ${result.analysisId}.json`)
  }

  async generateHtmlReport(result) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>CV Analysis Report - ${result.analysisId}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .score { font-size: 24px; font-weight: bold; color: #2563eb; }
    .section { margin: 20px 0; padding: 15px; border-left: 4px solid #2563eb; background: #f8fafc; }
    .keywords { display: flex; flex-wrap: wrap; gap: 5px; margin: 10px 0; }
    .keyword { background: #2563eb; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .recommendation { padding: 8px; margin: 5px 0; background: #fef3c7; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>📄 CV Analysis Report</h1>
  <div class="score">Overall Score: ${result.overallScore}/100</div>
  
  <div class="section">
    <h2>Score Breakdown</h2>
    <p>ATS Compatibility: ${result.atsScore}/100</p>
    <p>Content Quality: ${result.qualityScore}/100</p>
    <p>Word Count: ${result.content.wordCount}</p>
  </div>
  
  <div class="section">
    <h2>Keywords Found (${result.keywords.total})</h2>
    <div class="keywords">
      ${[...result.keywords.tech, ...result.keywords.business, ...result.keywords.custom]
        .map(kw => `<span class="keyword">${kw}</span>`).join('')}
    </div>
  </div>
  
  <div class="section">
    <h2>Sections</h2>
    <p><strong>Found:</strong> ${result.sections.identified.join(', ')}</p>
    ${result.sections.missing.length > 0 ? 
      `<p><strong>Missing:</strong> ${result.sections.missing.join(', ')}</p>` : ''}
  </div>
  
  <div class="section">
    <h2>Recommendations</h2>
    ${result.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
  </div>
  
  <p><em>Analysis ID: ${result.analysisId}</em></p>
  <p><em>Generated: ${new Date().toLocaleString()}</em></p>
</body>
</html>`

    const fileName = `cv-analysis-${result.analysisId}.html`
    fs.writeFileSync(fileName, html)
    console.log(`\n📊 HTML report generated: ${fileName}`)
  }

  showHelp() {
    console.log(`
🔍 CVPerfect CV Analyzer CLI Tool
=================================

Usage:
  node cv-analyzer.js <cv-file> [options]

Options:
  --format <json|text|html>  Output format (default: text)
  --ats-check               Run ATS compatibility check  
  --keywords <list>         Comma-separated keywords to check
  --no-score               Skip quality scoring

Examples:
  node cv-analyzer.js resume.pdf
  node cv-analyzer.js cv.docx --format json
  node cv-analyzer.js resume.pdf --ats-check --keywords "react,nodejs,python"
  node cv-analyzer.js cv.pdf --format html

Supported file types: PDF, DOCX, TXT
`)
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new CVAnalyzerCLI()
  cli.run()
}

module.exports = CVAnalyzerCLI