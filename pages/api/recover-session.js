// STEP 8: Email-based session recovery API endpoint
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
    // Set proper JSON content type first
    res.setHeader('Content-Type', 'application/json')
    
    const { email } = req.body

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email is required and must be a valid string'
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
    }

    console.log('🔍 Recovery attempt for email:', email.toLowerCase())

    // STEP 8: Look up session by email hash
    const crypto = require('crypto')
    const fs = require('fs').promises
    const path = require('path')
    
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').substring(0, 16)
    const emailIndexDir = path.join(process.cwd(), '.sessions', 'email-index')
    const indexFile = path.join(emailIndexDir, `${emailHash}.json`)

    try {
      // Check if email index exists
      const indexData = await fs.readFile(indexFile, 'utf8')
      const parsedIndex = JSON.parse(indexData)
      
      // Validate session still exists
      const sessionFile = path.join(process.cwd(), '.sessions', `${parsedIndex.sessionId}.json`)
      
      try {
        await fs.access(sessionFile)
        
        // Log successful recovery attempt
        console.log('✅ Session recovery successful:', {
          emailHash: emailHash,
          sessionId: parsedIndex.sessionId,
          plan: parsedIndex.plan,
          createdAt: parsedIndex.createdAt
        })

        return res.status(200).json({
          success: true,
          sessionId: parsedIndex.sessionId,
          plan: parsedIndex.plan,
          createdAt: parsedIndex.createdAt,
          message: 'Sesja została pomyślnie odzyskana'
        })

      } catch (sessionError) {
        // Session file no longer exists - clean up index
        try {
          await fs.unlink(indexFile)
          console.log('🧹 Cleaned up orphaned email index:', emailHash)
        } catch (cleanupError) {
          console.warn('⚠️ Failed to cleanup orphaned index:', cleanupError.message)
        }

        console.log('❌ Session file missing for email:', emailHash)
        return res.status(404).json({
          success: false,
          error: 'session_expired',
          message: 'Sesja wygasła lub została usunięta. Prześlij CV ponownie.'
        })
      }

    } catch (indexError) {
      // No index file found for this email
      console.log('❌ No session found for email:', emailHash)
      
      // Log recovery attempt for monitoring
      console.log('📊 Recovery attempt failed:', {
        emailHash: emailHash,
        error: 'no_session_found',
        timestamp: new Date().toISOString()
      })

      return res.status(404).json({
        success: false,
        error: 'no_session_found', 
        message: 'Nie znaleziono sesji dla podanego adresu email. Sprawdź adres lub prześlij CV ponownie.'
      })
    }

  } catch (error) {
    console.error('❌ Recovery error:', error)
    
    // Ensure we always return JSON
    res.setHeader('Content-Type', 'application/json')
    
    return res.status(500).json({
      success: false,
      error: 'recovery_failed',
      message: 'Wystąpił błąd podczas odzyskiwania sesji. Spróbuj ponownie.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}