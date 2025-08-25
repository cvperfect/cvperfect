// STEP 13: Session cleanup service for maintenance and optimization
import { handleCORSPreflight } from '../../lib/cors'

export default async function handler(req, res) {
  // Secure CORS handling
  const shouldContinue = handleCORSPreflight(req, res)
  if (!shouldContinue) {
    return // CORS preflight handled
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Only POST requests are accepted.' 
    })
  }

  try {
    // Set proper JSON content type
    res.setHeader('Content-Type', 'application/json')
    
    const { maxAgeHours = 48, dryRun = false } = req.body
    
    console.log('🧹 Starting session cleanup:', {
      maxAgeHours,
      dryRun,
      timestamp: new Date().toISOString()
    })

    const fs = require('fs').promises
    const path = require('path')
    
    const sessionsDir = path.join(process.cwd(), '.sessions')
    const emailIndexDir = path.join(sessionsDir, 'email-index')
    
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000)
    const results = {
      sessionsFound: 0,
      sessionsExpired: 0,
      emailIndexesFound: 0,
      emailIndexesOrphaned: 0,
      sessionsDeleted: 0,
      indexesDeleted: 0,
      errors: [],
      dryRun: dryRun
    }

    // STEP 13A: Clean up expired session files
    try {
      const sessionFiles = await fs.readdir(sessionsDir)
      
      for (const filename of sessionFiles) {
        if (!filename.endsWith('.json') || filename === 'email-index') continue
        
        const filePath = path.join(sessionsDir, filename)
        const stats = await fs.stat(filePath)
        results.sessionsFound++
        
        if (stats.mtime.getTime() < cutoffTime) {
          results.sessionsExpired++
          
          if (!dryRun) {
            await fs.unlink(filePath)
            results.sessionsDeleted++
            console.log('🗑️ Deleted expired session:', filename)
          } else {
            console.log('🔍 [DRY RUN] Would delete:', filename, 'Age:', Math.round((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60)), 'hours')
          }
        }
      }
    } catch (sessionError) {
      const error = `Session cleanup failed: ${sessionError.message}`
      results.errors.push(error)
      console.error('❌', error)
    }

    // STEP 13B: Clean up orphaned email indexes
    try {
      const indexExists = await fs.access(emailIndexDir).then(() => true).catch(() => false)
      
      if (indexExists) {
        const indexFiles = await fs.readdir(emailIndexDir)
        
        for (const filename of indexFiles) {
          if (!filename.endsWith('.json')) continue
          
          const indexPath = path.join(emailIndexDir, filename)
          results.emailIndexesFound++
          
          try {
            const indexData = JSON.parse(await fs.readFile(indexPath, 'utf8'))
            const sessionFile = path.join(sessionsDir, `${indexData.sessionId}.json`)
            
            // Check if corresponding session still exists
            const sessionExists = await fs.access(sessionFile).then(() => true).catch(() => false)
            
            if (!sessionExists) {
              results.emailIndexesOrphaned++
              
              if (!dryRun) {
                await fs.unlink(indexPath)
                results.indexesDeleted++
                console.log('🧹 Deleted orphaned email index:', filename, '→', indexData.sessionId)
              } else {
                console.log('🔍 [DRY RUN] Would delete orphaned index:', filename, '→', indexData.sessionId)
              }
            }
          } catch (parseError) {
            // Index file is corrupted, remove it
            results.emailIndexesOrphaned++
            
            if (!dryRun) {
              await fs.unlink(indexPath)
              results.indexesDeleted++
              console.log('🗑️ Deleted corrupted email index:', filename)
            } else {
              console.log('🔍 [DRY RUN] Would delete corrupted index:', filename)
            }
          }
        }
      }
    } catch (indexError) {
      const error = `Email index cleanup failed: ${indexError.message}`
      results.errors.push(error)
      console.error('❌', error)
    }

    // STEP 13C: Generate cleanup report
    const report = {
      timestamp: new Date().toISOString(),
      cutoffTime: new Date(cutoffTime).toISOString(),
      maxAgeHours,
      ...results
    }

    console.log('✅ Session cleanup completed:', report)

    return res.status(200).json({
      success: true,
      message: dryRun ? 'Dry run completed - no files were deleted' : 'Session cleanup completed successfully',
      report
    })

  } catch (error) {
    console.error('❌ Session cleanup error:', error)
    
    // Ensure we always return JSON
    res.setHeader('Content-Type', 'application/json')
    
    return res.status(500).json({
      success: false,
      error: 'Session cleanup failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}