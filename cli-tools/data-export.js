#!/usr/bin/env node
/**
 * CVPerfect Data Export CLI Tool
 * Export CVPerfect data in various formats
 */

const { CVPerfectDataManager } = require('../lib/data-manager')
const fs = require('fs')
const path = require('path')

class DataExportCLI {
  constructor() {
    this.dataManager = new CVPerfectDataManager()
    this.args = process.argv.slice(2)
  }

  async run() {
    try {
      if (this.args.length === 0) {
        this.showHelp()
        return
      }

      const dataType = this.args[0]
      const options = this.parseOptions()

      console.log('📊 CVPerfect Data Export')
      console.log('========================')
      console.log(`📈 Exporting: ${dataType}`)
      
      // Get data based on type
      const data = await this.getData(dataType, options)
      
      // Export in specified format
      const outputFile = await this.exportData(data, dataType, options)
      
      console.log(`✅ Export completed: ${outputFile}`)
      console.log(`📁 Data exported successfully`)

      process.exit(0)
    } catch (error) {
      console.error('❌ Export failed:', error.message)
      process.exit(1)
    }
  }

  parseOptions() {
    const options = {
      format: 'json',
      dateRange: '30d',
      output: null
    }

    for (let i = 1; i < this.args.length; i++) {
      const arg = this.args[i]
      
      if (arg === '--format' && this.args[i + 1]) {
        options.format = this.args[i + 1]
        i++
      } else if (arg === '--date-range' && this.args[i + 1]) {
        options.dateRange = this.args[i + 1]
        i++
      } else if (arg === '--output' && this.args[i + 1]) {
        options.output = this.args[i + 1]
        i++
      }
    }

    return options
  }

  async getData(dataType, options) {
    console.log(`🔍 Gathering ${dataType} data...`)
    
    switch (dataType) {
      case 'cv':
        return await this.dataManager.getCvFilesInfo()
        
      case 'sessions':
        const sessionData = await this.dataManager.getSessionsInfo()
        return this.filterByDateRange(sessionData, options.dateRange)
        
      case 'analytics':
        return await this.generateAnalytics()
        
      case 'stats':
        return await this.dataManager.getStorageStats()
        
      case 'all':
        return {
          cv: await this.dataManager.getCvFilesInfo(),
          sessions: await this.dataManager.getSessionsInfo(),
          stats: await this.dataManager.getStorageStats()
        }
        
      default:
        throw new Error(`Unknown data type: ${dataType}. Use: cv, sessions, analytics, stats, all`)
    }
  }

  filterByDateRange(data, dateRange) {
    if (!dateRange || dateRange === 'all') return data

    const days = parseInt(dateRange.replace('d', ''))
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000)
    
    if (data.sessions) {
      data.sessions = data.sessions.filter(session => 
        new Date(session.modified).getTime() > cutoff
      )
      data.totalFiles = data.sessions.length
    }
    
    return data
  }

  async generateAnalytics() {
    const sessions = await this.dataManager.getSessionsInfo()
    const stats = await this.dataManager.getStorageStats()
    
    // Calculate analytics
    const planBreakdown = {
      basic: sessions.sessions.filter(s => s.plan === 'basic').length,
      gold: sessions.sessions.filter(s => s.plan === 'gold').length,
      premium: sessions.sessions.filter(s => s.plan === 'premium').length,
      demo: sessions.sessions.filter(s => !s.isPaid).length
    }
    
    const revenueEstimate = {
      basic: planBreakdown.basic * 19.99,
      gold: planBreakdown.gold * 49,
      premium: planBreakdown.premium * 79,
      total: (planBreakdown.basic * 19.99) + (planBreakdown.gold * 49) + (planBreakdown.premium * 79)
    }
    
    const conversionRate = sessions.breakdown.paid / sessions.totalFiles * 100

    return {
      summary: {
        totalSessions: sessions.totalFiles,
        paidSessions: sessions.breakdown.paid,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalRevenue: Math.round(revenueEstimate.total * 100) / 100
      },
      planBreakdown,
      revenueEstimate,
      storage: {
        totalSize: stats.total.formattedSize,
        categories: stats.categories
      },
      generatedAt: new Date().toISOString()
    }
  }

  async exportData(data, dataType, options) {
    const timestamp = new Date().toISOString().split('T')[0]
    const defaultFileName = `cvperfect-${dataType}-${timestamp}`
    const fileName = options.output || `${defaultFileName}.${options.format}`

    switch (options.format) {
      case 'json':
        return this.exportAsJSON(data, fileName)
        
      case 'csv':
        return this.exportAsCSV(data, fileName)
        
      case 'xlsx':
        return this.exportAsXLSX(data, fileName)
        
      default:
        throw new Error(`Unsupported format: ${options.format}. Use: json, csv, xlsx`)
    }
  }

  exportAsJSON(data, fileName) {
    const content = JSON.stringify(data, null, 2)
    fs.writeFileSync(fileName, content)
    
    console.log(`📄 JSON exported: ${fs.statSync(fileName).size} bytes`)
    return fileName
  }

  exportAsCSV(data, fileName) {
    let csv = ''
    
    if (data.sessions) {
      // Export sessions as CSV
      csv = 'Session ID,Plan,Created,Modified,Size,Has CV Data,Has Photo,Is Paid\n'
      data.sessions.forEach(session => {
        csv += `${session.sessionId},${session.plan},${session.created},${session.modified},${session.size},${session.hasCvData},${session.hasPhoto},${session.isPaid}\n`
      })
    } else if (data.summary) {
      // Export analytics as CSV
      csv = 'Metric,Value\n'
      csv += `Total Sessions,${data.summary.totalSessions}\n`
      csv += `Paid Sessions,${data.summary.paidSessions}\n`
      csv += `Conversion Rate,${data.summary.conversionRate}%\n`
      csv += `Total Revenue,${data.summary.totalRevenue} PLN\n`
    } else {
      // Generic data export
      csv = 'Key,Value\n'
      this.flattenObject(data).forEach(([key, value]) => {
        csv += `${key},"${value}"\n`
      })
    }
    
    fs.writeFileSync(fileName, csv)
    console.log(`📊 CSV exported: ${csv.split('\n').length - 1} rows`)
    return fileName
  }

  exportAsXLSX(data, fileName) {
    // Simple XLSX-like format (actually CSV with .xlsx extension)
    console.log('⚠️  XLSX export using CSV format (install xlsx package for true XLSX)')
    return this.exportAsCSV(data, fileName.replace('.xlsx', '.csv'))
  }

  flattenObject(obj, prefix = '') {
    const result = []
    
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result.push(...this.flattenObject(value, newKey))
      } else {
        result.push([newKey, Array.isArray(value) ? value.join(';') : String(value)])
      }
    })
    
    return result
  }

  showHelp() {
    console.log(`
📊 CVPerfect Data Export CLI Tool
=================================

Usage:
  node data-export.js <data-type> [options]

Data Types:
  cv          Export CV files information
  sessions    Export session data
  analytics   Export analytics summary  
  stats       Export storage statistics
  all         Export all data types

Options:
  --format <json|csv|xlsx>   Export format (default: json)
  --date-range <days>        Filter by date range (default: 30d)
  --output <filename>        Output filename (default: auto-generated)

Examples:
  node data-export.js sessions --format csv
  node data-export.js analytics --output analytics.json
  node data-export.js cv --date-range 7d --format xlsx
  node data-export.js all --format json

Output:
  Files are saved in the current directory with timestamp
`)
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new DataExportCLI()
  cli.run()
}

module.exports = DataExportCLI