// CVPerfect Data Management System
// Centralized data operations for sessions, CV files, cache management

const fs = require('fs').promises
const path = require('path')

class CVPerfectDataManager {
  constructor() {
    this.baseDir = process.cwd()
    this.sessionsDir = path.join(this.baseDir, '.sessions')
    this.dataDir = path.join(this.baseDir, 'data')
    this.cacheDir = path.join(this.baseDir, '.next/cache')
    this.backupDir = path.join(this.baseDir, '.claude/backups')
  }

  // CATEGORY: sessions
  async getSessionsInfo() {
    try {
      const files = await fs.readdir(this.sessionsDir)
      const sessionFiles = files.filter(f => f.endsWith('.json') && f.startsWith('sess_'))
      
      const sessions = []
      let totalSize = 0

      for (const filename of sessionFiles) {
        try {
          const filePath = path.join(this.sessionsDir, filename)
          const stats = await fs.stat(filePath)
          const content = JSON.parse(await fs.readFile(filePath, 'utf8'))
          
          sessions.push({
            filename,
            sessionId: content.sessionId || filename.replace('.json', ''),
            plan: content.plan || 'demo',
            created: stats.birthtime,
            modified: stats.mtime,
            size: stats.size,
            hasCvData: !!content.cvData,
            hasPhoto: !!(content.cvData && content.cvData.includes('data:image')),
            isPaid: ['basic', 'gold', 'premium'].includes(content.plan)
          })
          
          totalSize += stats.size
        } catch (error) {
          console.warn(`Error reading session ${filename}:`, error.message)
        }
      }

      return {
        totalFiles: sessions.length,
        totalSize,
        sessions: sessions.sort((a, b) => b.modified - a.modified),
        breakdown: {
          paid: sessions.filter(s => s.isPaid).length,
          demo: sessions.filter(s => !s.isPaid).length,
          withPhotos: sessions.filter(s => s.hasPhoto).length,
          today: sessions.filter(s => this.isToday(s.modified)).length
        }
      }
    } catch (error) {
      throw new Error(`Failed to analyze sessions: ${error.message}`)
    }
  }

  // CATEGORY: cv
  async getCvFilesInfo() {
    try {
      const cvData = { totalFiles: 0, totalSize: 0, files: [], breakdown: {} }
      
      // Check data directory
      try {
        const dataFiles = await fs.readdir(this.dataDir)
        for (const filename of dataFiles) {
          if (filename.match(/\.(pdf|docx|html|txt)$/i)) {
            const filePath = path.join(this.dataDir, filename)
            const stats = await fs.stat(filePath)
            
            cvData.files.push({
              filename,
              type: path.extname(filename).toLowerCase(),
              size: stats.size,
              created: stats.birthtime,
              modified: stats.mtime
            })
            
            cvData.totalSize += stats.size
          }
        }
      } catch (error) {
        console.warn('No data directory found or empty')
      }

      cvData.totalFiles = cvData.files.length
      cvData.breakdown = {
        pdf: cvData.files.filter(f => f.type === '.pdf').length,
        docx: cvData.files.filter(f => f.type === '.docx').length,
        html: cvData.files.filter(f => f.type === '.html').length,
        today: cvData.files.filter(f => this.isToday(f.modified)).length
      }

      return cvData
    } catch (error) {
      throw new Error(`Failed to analyze CV files: ${error.message}`)
    }
  }

  // CATEGORY: cache
  async getCacheInfo() {
    try {
      const cacheData = { totalFiles: 0, totalSize: 0, files: [], breakdown: {} }
      
      // Check Next.js cache
      try {
        await this.scanCacheDir(this.cacheDir, cacheData)
      } catch (error) {
        console.warn('No cache directory found')
      }

      cacheData.breakdown = {
        expired: cacheData.files.filter(f => this.isExpired(f.modified, 24)).length,
        fresh: cacheData.files.filter(f => !this.isExpired(f.modified, 24)).length,
        today: cacheData.files.filter(f => this.isToday(f.modified)).length
      }

      return cacheData
    } catch (error) {
      throw new Error(`Failed to analyze cache: ${error.message}`)
    }
  }

  async scanCacheDir(dir, cacheData) {
    const files = await fs.readdir(dir)
    
    for (const filename of files) {
      const filePath = path.join(dir, filename)
      const stats = await fs.stat(filePath)
      
      if (stats.isDirectory()) {
        await this.scanCacheDir(filePath, cacheData)
      } else {
        cacheData.files.push({
          filename,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        })
        
        cacheData.totalFiles++
        cacheData.totalSize += stats.size
      }
    }
  }

  // CLEANUP OPERATIONS
  async cleanupSessions(maxAgeHours = 168, options = {}) { // Default 7 days
    const { dryRun = false, backup = false } = options
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000)
    
    if (backup && !dryRun) {
      await this.createBackup('sessions')
    }

    const sessionsInfo = await this.getSessionsInfo()
    const expiredSessions = sessionsInfo.sessions.filter(s => s.modified.getTime() < cutoffTime)
    
    const results = {
      totalFound: sessionsInfo.totalFiles,
      expired: expiredSessions.length,
      deleted: 0,
      errors: []
    }

    if (!dryRun) {
      for (const session of expiredSessions) {
        try {
          await fs.unlink(path.join(this.sessionsDir, session.filename))
          results.deleted++
        } catch (error) {
          results.errors.push(`Failed to delete ${session.filename}: ${error.message}`)
        }
      }
    }

    return { ...results, expiredSessions, dryRun }
  }

  async cleanupCache(maxAgeHours = 24, options = {}) {
    const { dryRun = false } = options
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000)
    
    const cacheInfo = await this.getCacheInfo()
    const expiredFiles = cacheInfo.files.filter(f => f.modified.getTime() < cutoffTime)
    
    const results = {
      totalFound: cacheInfo.totalFiles,
      expired: expiredFiles.length,
      deleted: 0,
      errors: []
    }

    if (!dryRun) {
      for (const file of expiredFiles) {
        try {
          await fs.unlink(file.path)
          results.deleted++
        } catch (error) {
          results.errors.push(`Failed to delete ${file.filename}: ${error.message}`)
        }
      }
    }

    return { ...results, expiredFiles, dryRun }
  }

  async cleanupCvFiles(maxAgeHours = 720, options = {}) { // Default 30 days
    const { dryRun = false, backup = false } = options
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000)
    
    if (backup && !dryRun) {
      await this.createBackup('cv')
    }

    const cvInfo = await this.getCvFilesInfo()
    const expiredFiles = cvInfo.files.filter(f => f.modified.getTime() < cutoffTime)
    
    const results = {
      totalFound: cvInfo.totalFiles,
      expired: expiredFiles.length,
      deleted: 0,
      errors: []
    }

    if (!dryRun) {
      for (const file of expiredFiles) {
        try {
          await fs.unlink(path.join(this.dataDir, file.filename))
          results.deleted++
        } catch (error) {
          results.errors.push(`Failed to delete ${file.filename}: ${error.message}`)
        }
      }
    }

    return { ...results, expiredFiles, dryRun }
  }

  // STATISTICS
  async getStorageStats() {
    const [sessions, cv, cache] = await Promise.all([
      this.getSessionsInfo(),
      this.getCvFilesInfo(), 
      this.getCacheInfo()
    ])

    const totalSize = sessions.totalSize + cv.totalSize + cache.totalSize
    const totalFiles = sessions.totalFiles + cv.totalFiles + cache.totalFiles

    return {
      total: {
        size: totalSize,
        files: totalFiles,
        formattedSize: this.formatBytes(totalSize)
      },
      categories: {
        sessions: {
          size: sessions.totalSize,
          files: sessions.totalFiles,
          percentage: Math.round((sessions.totalSize / totalSize) * 100),
          formattedSize: this.formatBytes(sessions.totalSize)
        },
        cv: {
          size: cv.totalSize,
          files: cv.totalFiles,
          percentage: Math.round((cv.totalSize / totalSize) * 100),
          formattedSize: this.formatBytes(cv.totalSize)
        },
        cache: {
          size: cache.totalSize,
          files: cache.totalFiles,
          percentage: Math.round((cache.totalSize / totalSize) * 100),
          formattedSize: this.formatBytes(cache.totalSize)
        }
      },
      breakdown: {
        paidSessions: sessions.breakdown.paid,
        demoSessions: sessions.breakdown.demo,
        cvWithPhotos: cv.files.filter(f => f.filename.includes('photo')).length,
        todayFiles: sessions.breakdown.today + cv.breakdown.today + cache.breakdown.today
      }
    }
  }

  // BACKUP OPERATIONS
  async createBackup(category) {
    const timestamp = new Date().toISOString().split('T')[0]
    const backupPath = path.join(this.backupDir, `${category}-backup-${timestamp}`)
    
    await fs.mkdir(backupPath, { recursive: true })
    
    let sourceDir
    switch (category) {
      case 'sessions': sourceDir = this.sessionsDir; break
      case 'cv': sourceDir = this.dataDir; break
      default: throw new Error(`Unknown backup category: ${category}`)
    }

    const files = await fs.readdir(sourceDir)
    for (const filename of files) {
      if (filename.endsWith('.json') || filename.match(/\.(pdf|docx|html)$/i)) {
        await fs.copyFile(
          path.join(sourceDir, filename),
          path.join(backupPath, filename)
        )
      }
    }

    return backupPath
  }

  // UTILITY METHODS
  isToday(date) {
    const today = new Date()
    const checkDate = new Date(date)
    return today.toDateString() === checkDate.toDateString()
  }

  isExpired(date, maxAgeHours) {
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000)
    return new Date(date).getTime() < cutoff
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // COMMAND INTERFACE METHODS
  async executeDataCommand(command, category, options = {}) {
    switch (command) {
      case 'show':
        return await this.showData(category, options)
      case 'cleanup':
        return await this.cleanupData(category, options)
      case 'stats':
        return await this.getStorageStats()
      default:
        throw new Error(`Unknown data command: ${command}`)
    }
  }

  async showData(category = 'all', options = {}) {
    switch (category) {
      case 'sessions': return await this.getSessionsInfo()
      case 'cv': return await this.getCvFilesInfo()
      case 'cache': return await this.getCacheInfo()
      case 'all':
        const [sessions, cv, cache] = await Promise.all([
          this.getSessionsInfo(),
          this.getCvFilesInfo(),
          this.getCacheInfo()
        ])
        return { sessions, cv, cache }
      default:
        throw new Error(`Unknown data category: ${category}`)
    }
  }

  async cleanupData(category, options = {}) {
    const { days = 7 } = options
    const maxAgeHours = days * 24

    switch (category) {
      case 'sessions':
        return await this.cleanupSessions(maxAgeHours, options)
      case 'cv':
        return await this.cleanupCvFiles(maxAgeHours, options)
      case 'cache':
        return await this.cleanupCache(maxAgeHours, options)
      case 'all':
        const results = await Promise.all([
          this.cleanupSessions(maxAgeHours, options),
          this.cleanupCvFiles(maxAgeHours, options),
          this.cleanupCache(maxAgeHours, options)
        ])
        return {
          sessions: results[0],
          cv: results[1],
          cache: results[2],
          totalDeleted: results.reduce((sum, r) => sum + r.deleted, 0)
        }
      default:
        throw new Error(`Unknown cleanup category: ${category}`)
    }
  }
}

module.exports = { CVPerfectDataManager }