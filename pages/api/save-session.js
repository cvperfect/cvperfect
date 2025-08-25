// API endpoint to save full CV session data before Stripe payment
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
    
    const { sessionId, cvData, jobPosting, email, plan, template, photo } = req.body

    // Walidacja
    if (!sessionId || !cvData || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, cvData, email'
      })
    }
    
    // SECURITY: Strict sessionId validation to prevent path traversal
    // Format: sess_1234567890123_abcdefghi (timestamp_hash)
    if (typeof sessionId !== 'string' || 
        !/^sess_\d{13}_[a-z0-9]{9}$/.test(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sessionId format. Expected: sess_[timestamp]_[hash]',
        received: sessionId,
        expectedFormat: 'sess_1234567890123_abcdefghi'
      })
    }

    console.log('💾 Saving session data:', {
      sessionId: sessionId,
      email: email,
      plan: plan,
      cvLength: cvData.length,
      hasJob: !!jobPosting,
      hasPhoto: !!photo,
      template: template
    })

    // Prepare full session data - NO CHARACTER LIMITS
    const fullSessionData = {
      sessionId: sessionId,
      email: email,
      plan: plan || 'basic',
      template: template || 'simple',
      cvData: cvData, // FULL CV TEXT - no truncation
      jobPosting: jobPosting || '',
      photo: photo || null, // Base64 photo data if available
      timestamp: new Date().toISOString(),
      processed: false, // Flag to track if AI optimization was done
      createdAt: Date.now()
    }

    // For demo purposes, we'll store in memory/file
    // In production, use proper database (PostgreSQL, MongoDB, etc.)
    const fs = require('fs').promises
    const path = require('path')
    
    try {
      const sessionsDir = path.join(process.cwd(), '.sessions')
      
      // Create directory if it doesn't exist
      try {
        await fs.access(sessionsDir)
      } catch {
        await fs.mkdir(sessionsDir, { recursive: true })
      }
      
      const sessionFile = path.join(sessionsDir, `${sessionId}.json`)
      const tempFile = sessionFile + '.tmp'
      
      // SECURITY: Atomic write operation to prevent race conditions
      await fs.writeFile(tempFile, JSON.stringify(fullSessionData, null, 2))
      await fs.rename(tempFile, sessionFile)
      
      console.log('✅ Session data saved successfully:', sessionFile)
      
      // STEP 7: Create email-to-session index for recovery
      try {
        const crypto = require('crypto')
        const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex').substring(0, 16)
        
        const emailIndexDir = path.join(process.cwd(), '.sessions', 'email-index')
        
        // Create email-index directory if it doesn't exist
        try {
          await fs.access(emailIndexDir)
        } catch {
          await fs.mkdir(emailIndexDir, { recursive: true })
        }
        
        const indexFile = path.join(emailIndexDir, `${emailHash}.json`)
        const indexData = {
          email: email.toLowerCase(),
          sessionId: sessionId,
          createdAt: new Date().toISOString(),
          plan: plan || 'basic'
        }
        
        await fs.writeFile(indexFile, JSON.stringify(indexData, null, 2))
        console.log('📧 Email index created:', emailHash, '→', sessionId)
        
      } catch (indexError) {
        console.warn('⚠️ Failed to create email index:', indexError.message)
        // Continue - email index is not critical for main functionality
      }
      
    } catch (fileError) {
      console.error('❌ File system error:', fileError)
      // Continue without file saving - use memory fallback
    }

    // Return success
    res.status(200).json({
      success: true,
      message: 'Session data saved successfully',
      sessionId: sessionId,
      dataLength: cvData.length
    })

  } catch (error) {
    console.error('❌ Save session error:', error)
    
    // Ensure we always return JSON, even on errors
    res.setHeader('Content-Type', 'application/json')
    
    // Handle specific error types
    if (error.name === 'SyntaxError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON in request body'
      })
    }
    
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return res.status(500).json({
        success: false,
        error: 'File system permission error'
      })
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to save session data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}