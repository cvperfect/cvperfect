// CVPerfect Data Management API
// Provides unified interface for /data commands integration with Claude Code

import { CVPerfectDataManager } from '../../lib/data-manager'
import { handleCORSPreflight } from '../../lib/cors'

const dataManager = new CVPerfectDataManager()

export default async function handler(req, res) {
  // Handle CORS preflight
  const shouldContinue = handleCORSPreflight(req, res)
  if (!shouldContinue) return

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    })
  }

  try {
    res.setHeader('Content-Type', 'application/json')
    
    const { command, category, options = {} } = req.body

    // Validate command
    const validCommands = ['show', 'cleanup', 'stats']
    if (!validCommands.includes(command)) {
      return res.status(400).json({
        success: false,
        error: `Invalid command. Use: ${validCommands.join(', ')}`,
        availableCommands: validCommands
      })
    }

    console.log(`📊 Data management request:`, { command, category, options })

    let result

    switch (command) {
      case 'show':
        result = await dataManager.showData(category, options)
        result = formatShowOutput(result, category)
        break

      case 'cleanup':
        result = await dataManager.cleanupData(category, options)
        result = formatCleanupOutput(result, category, options)
        break

      case 'stats':
        result = await dataManager.getStorageStats()
        result = formatStatsOutput(result, options)
        break
    }

    return res.status(200).json({
      success: true,
      command,
      category,
      timestamp: new Date().toISOString(),
      data: result
    })

  } catch (error) {
    console.error('❌ Data management error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Data management operation failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// FORMAT OUTPUT FOR CLAUDE CODE DISPLAY

function formatShowOutput(data, category) {
  if (category === 'all') {
    return {
      summary: `📊 CVPerfect Data Summary\n========================\n\n` +
               `📂 SESSIONS (${data.sessions.totalFiles} files, ${formatBytes(data.sessions.totalSize)})\n` +
               `├── Recent (24h): ${data.sessions.breakdown.today} sessions\n` +
               `├── Paid plans: ${data.sessions.breakdown.paid} sessions\n` +
               `├── Demo/test: ${data.sessions.breakdown.demo} sessions\n` +
               `└── With photos: ${data.sessions.breakdown.withPhotos} sessions\n\n` +
               `📄 CV FILES (${data.cv.totalFiles} files, ${formatBytes(data.cv.totalSize)})\n` +
               `├── PDF files: ${data.cv.breakdown.pdf} files\n` +
               `├── DOCX files: ${data.cv.breakdown.docx} files\n` +
               `├── HTML outputs: ${data.cv.breakdown.html} files\n` +
               `└── Today's files: ${data.cv.breakdown.today} files\n\n` +
               `💾 CACHE (${data.cache.totalFiles} files, ${formatBytes(data.cache.totalSize)})\n` +
               `├── Fresh cache: ${data.cache.breakdown.fresh} files\n` +
               `├── Expired (>24h): ${data.cache.breakdown.expired} files\n` +
               `└── Today's cache: ${data.cache.breakdown.today} files`,
      details: data
    }
  }

  // Single category output
  const categoryData = data
  switch (category) {
    case 'sessions':
      return {
        summary: `📂 SESSIONS (${categoryData.totalFiles} files, ${formatBytes(categoryData.totalSize)})\n` +
                 `├── Paid sessions: ${categoryData.breakdown.paid}\n` +
                 `├── Demo sessions: ${categoryData.breakdown.demo}\n` +
                 `├── With photos: ${categoryData.breakdown.withPhotos}\n` +
                 `└── Today: ${categoryData.breakdown.today}`,
        recentSessions: categoryData.sessions.slice(0, 5).map(s => ({
          id: s.sessionId.substring(0, 12) + '...',
          plan: s.plan,
          age: getTimeAgo(s.modified),
          hasPhoto: s.hasPhoto ? '📸' : '📄'
        })),
        details: categoryData
      }

    case 'cv':
      return {
        summary: `📄 CV FILES (${categoryData.totalFiles} files, ${formatBytes(categoryData.totalSize)})\n` +
                 `├── PDF: ${categoryData.breakdown.pdf} files\n` +
                 `├── DOCX: ${categoryData.breakdown.docx} files\n` +
                 `├── HTML: ${categoryData.breakdown.html} files\n` +
                 `└── Today: ${categoryData.breakdown.today} files`,
        recentFiles: categoryData.files.slice(0, 5).map(f => ({
          name: f.filename,
          type: f.type,
          size: formatBytes(f.size),
          age: getTimeAgo(f.modified)
        })),
        details: categoryData
      }

    case 'cache':
      return {
        summary: `💾 CACHE (${categoryData.totalFiles} files, ${formatBytes(categoryData.totalSize)})\n` +
                 `├── Fresh: ${categoryData.breakdown.fresh} files\n` +
                 `├── Expired: ${categoryData.breakdown.expired} files\n` +
                 `└── Today: ${categoryData.breakdown.today} files`,
        details: categoryData
      }
  }
}

function formatCleanupOutput(data, category, options) {
  const { dryRun = false, days = 7 } = options

  if (category === 'all') {
    return {
      summary: `🧹 Data Cleanup Report ${dryRun ? '(DRY RUN)' : ''}\n` +
               `======================\n\n` +
               `📂 SESSIONS: ${data.sessions.deleted}/${data.sessions.expired} deleted\n` +
               `📄 CV FILES: ${data.cv.deleted}/${data.cv.expired} deleted\n` +
               `💾 CACHE: ${data.cache.deleted}/${data.cache.expired} deleted\n\n` +
               `✅ Total deleted: ${data.totalDeleted} files`,
      details: data
    }
  }

  return {
    summary: `🧹 ${category.toUpperCase()} Cleanup ${dryRun ? '(DRY RUN)' : ''}\n` +
             `├── Found: ${data.totalFound} files\n` +
             `├── Expired (>${days} days): ${data.expired} files\n` +
             `├── ${dryRun ? 'Would delete' : 'Deleted'}: ${data.deleted} files\n` +
             `└── Errors: ${data.errors.length}`,
    details: data
  }
}

function formatStatsOutput(data, options) {
  const { summary = false, trends = false } = options

  if (summary) {
    return {
      summary: `💾 STORAGE: ${data.total.formattedSize} (${data.total.files} files)\n` +
               `├── Sessions: ${data.categories.sessions.formattedSize} (${data.categories.sessions.percentage}%)\n` +
               `├── CV files: ${data.categories.cv.formattedSize} (${data.categories.cv.percentage}%)\n` +
               `└── Cache: ${data.categories.cache.formattedSize} (${data.categories.cache.percentage}%)`,
      details: data
    }
  }

  return {
    summary: `📈 CVPerfect Storage Statistics\n` +
             `================================\n\n` +
             `💾 TOTAL STORAGE: ${data.total.formattedSize}\n` +
             `├── Sessions: ${data.categories.sessions.formattedSize} (${data.categories.sessions.percentage}%) - ${data.categories.sessions.files} files\n` +
             `├── CV files: ${data.categories.cv.formattedSize} (${data.categories.cv.percentage}%) - ${data.categories.cv.files} files\n` +
             `└── Cache: ${data.categories.cache.formattedSize} (${data.categories.cache.percentage}%) - ${data.categories.cache.files} files\n\n` +
             `📊 BREAKDOWN\n` +
             `├── Paid sessions: ${data.breakdown.paidSessions}\n` +
             `├── Demo sessions: ${data.breakdown.demoSessions}\n` +
             `├── CV with photos: ${data.breakdown.cvWithPhotos}\n` +
             `└── Today's files: ${data.breakdown.todayFiles}`,
    details: data
  }
}

// UTILITY FUNCTIONS

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getTimeAgo(date) {
  const now = new Date()
  const diffMs = now - new Date(date)
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays === 0) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays/7)}w ago`
  return `${Math.floor(diffDays/30)}mo ago`
}