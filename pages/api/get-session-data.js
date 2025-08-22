// API endpoint to retrieve full CV session data for success page
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Only GET requests are accepted.' 
    })
  }

  try {
    const { session_id } = req.query

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing session_id parameter'
      })
    }

    console.log('🔍 Retrieving session data for:', session_id)

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

      // Return full session data
      return res.status(200).json({
        success: true,
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
      console.log('📝 Session file not found, trying Stripe fallback...')
      
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
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session data'
    })
  }
}