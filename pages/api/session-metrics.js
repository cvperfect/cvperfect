// STEP 14: Session metrics and dashboard endpoint
import { handleCORSPreflight } from '../../lib/cors'

export default async function handler(req, res) {
  // Secure CORS handling
  const shouldContinue = handleCORSPreflight(req, res)
  if (!shouldContinue) {
    return // CORS preflight handled
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Only GET requests are accepted.' 
    })
  }

  try {
    // Set proper JSON content type
    res.setHeader('Content-Type', 'application/json')
    
    const fs = require('fs').promises
    const path = require('path')
    
    const sessionsDir = path.join(process.cwd(), '.sessions')
    const emailIndexDir = path.join(sessionsDir, 'email-index')
    
    const metrics = {
      timestamp: new Date().toISOString(),
      sessions: {
        total: 0,
        active: 0, // Less than 48 hours old
        expired: 0,
        byAge: {
          last1Hour: 0,
          last6Hours: 0,
          last24Hours: 0,
          last48Hours: 0,
          older: 0
        },
        byPlan: {
          basic: 0,
          gold: 0,
          premium: 0,
          unknown: 0
        }
      },
      emailIndexes: {
        total: 0,
        orphaned: 0,
        valid: 0
      },
      systemHealth: {
        diskUsage: 0,
        avgSessionSize: 0,
        lastCleanup: null
      }
    }

    const now = Date.now()
    const timeWindows = {
      hour1: now - (1 * 60 * 60 * 1000),
      hour6: now - (6 * 60 * 60 * 1000),
      hour24: now - (24 * 60 * 60 * 1000),
      hour48: now - (48 * 60 * 60 * 1000)
    }

    // STEP 14A: Analyze session files
    try {
      const sessionFiles = await fs.readdir(sessionsDir)
      let totalSize = 0
      
      for (const filename of sessionFiles) {
        if (!filename.endsWith('.json') || filename === 'email-index') continue
        
        const filePath = path.join(sessionsDir, filename)
        const stats = await fs.stat(filePath)
        const fileAge = stats.mtime.getTime()
        
        metrics.sessions.total++
        totalSize += stats.size
        
        // Age categorization
        if (fileAge > timeWindows.hour1) {
          metrics.sessions.byAge.last1Hour++
        } else if (fileAge > timeWindows.hour6) {
          metrics.sessions.byAge.last6Hours++
        } else if (fileAge > timeWindows.hour24) {
          metrics.sessions.byAge.last24Hours++
        } else if (fileAge > timeWindows.hour48) {
          metrics.sessions.byAge.last48Hours++
          metrics.sessions.active++
        } else {
          metrics.sessions.byAge.older++
          metrics.sessions.expired++
        }
        
        // Plan analysis (requires reading file content)
        try {
          const content = JSON.parse(await fs.readFile(filePath, 'utf8'))
          const plan = content.plan || 'unknown'
          if (metrics.sessions.byPlan[plan] !== undefined) {
            metrics.sessions.byPlan[plan]++
          } else {
            metrics.sessions.byPlan.unknown++
          }
        } catch (parseError) {
          metrics.sessions.byPlan.unknown++
        }
      }
      
      metrics.systemHealth.avgSessionSize = Math.round(totalSize / Math.max(metrics.sessions.total, 1))
      metrics.systemHealth.diskUsage = totalSize
      
    } catch (sessionError) {
      console.error('❌ Session metrics analysis failed:', sessionError)
    }

    // STEP 14B: Analyze email indexes
    try {
      const indexExists = await fs.access(emailIndexDir).then(() => true).catch(() => false)
      
      if (indexExists) {
        const indexFiles = await fs.readdir(emailIndexDir)
        
        for (const filename of indexFiles) {
          if (!filename.endsWith('.json')) continue
          
          const indexPath = path.join(emailIndexDir, filename)
          metrics.emailIndexes.total++
          
          try {
            const indexData = JSON.parse(await fs.readFile(indexPath, 'utf8'))
            const sessionFile = path.join(sessionsDir, `${indexData.sessionId}.json`)
            
            const sessionExists = await fs.access(sessionFile).then(() => true).catch(() => false)
            
            if (sessionExists) {
              metrics.emailIndexes.valid++
            } else {
              metrics.emailIndexes.orphaned++
            }
          } catch (parseError) {
            metrics.emailIndexes.orphaned++
          }
        }
      }
    } catch (indexError) {
      console.error('❌ Email index metrics analysis failed:', indexError)
    }

    // STEP 14C: Add health indicators
    const healthScore = {
      sessions: metrics.sessions.active / Math.max(metrics.sessions.total, 1),
      indexes: metrics.emailIndexes.valid / Math.max(metrics.emailIndexes.total, 1),
      overall: 0
    }
    
    healthScore.overall = (healthScore.sessions + healthScore.indexes) / 2
    
    const response = {
      success: true,
      metrics,
      healthScore: {
        ...healthScore,
        status: healthScore.overall > 0.8 ? 'healthy' : (healthScore.overall > 0.5 ? 'warning' : 'critical')
      },
      recommendations: []
    }

    // Add recommendations based on metrics
    if (metrics.sessions.expired > metrics.sessions.active) {
      response.recommendations.push('Consider running session cleanup - many expired sessions found')
    }
    
    if (metrics.emailIndexes.orphaned > 5) {
      response.recommendations.push('Orphaned email indexes detected - cleanup recommended')
    }
    
    if (metrics.systemHealth.diskUsage > 10 * 1024 * 1024) { // 10MB
      response.recommendations.push('High disk usage detected - consider cleanup or archival')
    }

    console.log('📊 Session metrics generated:', {
      totalSessions: metrics.sessions.total,
      activeSessions: metrics.sessions.active,
      healthStatus: response.healthScore.status
    })

    return res.status(200).json(response)

  } catch (error) {
    console.error('❌ Session metrics error:', error)
    
    // Ensure we always return JSON
    res.setHeader('Content-Type', 'application/json')
    
    return res.status(500).json({
      success: false,
      error: 'Session metrics generation failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}