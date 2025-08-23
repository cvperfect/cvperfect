// API endpoint to retrieve full CV session data for success page
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
    // Set proper JSON content type first
    res.setHeader('Content-Type', 'application/json')
    
    const { session_id, force_file } = req.query

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing session_id parameter'
      })
    }
    
    // Validate session_id format to prevent file system errors
    if (typeof session_id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(session_id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session_id format'
      })
    }

    const isForceFileMode = force_file === 'true'
    console.log('🔍 Retrieving session data for:', session_id, isForceFileMode ? '(FORCE FILE MODE)' : '')

    // Try to load from file system first
    const fs = require('fs').promises
    const path = require('path')
    
    try {
      const sessionsDir = path.join(process.cwd(), '.sessions')
      const sessionFile = path.join(sessionsDir, `${session_id}.json`)
      
      // Check if session file exists
      await fs.access(sessionFile)
      
      // Read session data
      const sessionData = JSON.parse(await fs.readFile(sessionFile, 'utf8'))
      
      console.log('✅ Session data loaded:', {
        sessionId: sessionData.sessionId,
        email: sessionData.email,
        plan: sessionData.plan,
        cvLength: sessionData.cvData?.length || 0,
        hasJob: !!sessionData.jobPosting,
        hasPhoto: !!sessionData.photo,
        processed: sessionData.processed
      })

      // Return full session data (ENHANCED for FAZA 3)
      return res.status(200).json({
        success: true,
        source: 'filesystem',
        cvData: sessionData.cvData, // Direct access for fallback system
        email: sessionData.email,
        plan: sessionData.plan,
        jobPosting: sessionData.jobPosting || '',
        photo: sessionData.photo || null,
        processed: sessionData.processed,
        session: {
          id: sessionData.sessionId,
          customer_email: sessionData.email,
          metadata: {
            plan: sessionData.plan,
            template: sessionData.template,
            cv: sessionData.cvData, // FULL CV DATA - no truncation
            job: sessionData.jobPosting,
            photo: sessionData.photo, // Photo data preserved
            processed: sessionData.processed,
            timestamp: sessionData.timestamp
          }
        }
      })

    } catch (fileError) {
      console.log('📝 Session file not found...')
      
      // If force_file mode is enabled, don't try Stripe
      if (isForceFileMode) {
        console.log('🚫 Force file mode - skipping Stripe fallback')
        return res.status(404).json({
          success: false,
          source: 'filesystem',
          error: 'Session file not found (force file mode)'
        })
      }
      
      console.log('🔄 Trying Stripe fallback...')
      
      // Fallback to Stripe session lookup
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(session_id)
        
        console.log('📋 Stripe session found:', {
          id: stripeSession.id,
          email: stripeSession.customer_email,
          status: stripeSession.payment_status,
          hasMetadata: !!stripeSession.metadata
        })

        // Return Stripe data (limited)
        return res.status(200).json({
          success: true,
          session: {
            id: stripeSession.id,
            customer_email: stripeSession.customer_email,
            payment_status: stripeSession.payment_status,
            metadata: stripeSession.metadata || {}
          }
        })

      } catch (stripeError) {
        console.error('❌ Stripe session not found:', stripeError.message)
        
        return res.status(404).json({
          success: false,
          error: 'Session not found in both local storage and Stripe'
        })
      }
    }

  } catch (error) {
    console.error('❌ Get session error:', error)
    
    // Ensure we always return JSON, even on errors
    res.setHeader('Content-Type', 'application/json')
    
    // Handle specific error types
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return res.status(500).json({
        success: false,
        error: 'File system permission error'
      })
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Stripe session ID'
      })
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve session data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}