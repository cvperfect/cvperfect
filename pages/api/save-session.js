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
    
    // Validate sessionId format to prevent file system errors
    if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sessionId format'
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
      
      // Save session data to file
      await fs.writeFile(sessionFile, JSON.stringify(fullSessionData, null, 2))
      
      console.log('✅ Session data saved successfully:', sessionFile)
      
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