import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
 if (req.method !== 'GET') {
   return res.status(405).json({ message: 'Method not allowed' })
 }
 
 const { session_id } = req.query
 
 if (!session_id) {
   return res.status(400).json({ error: 'Session ID is required' })
 }
 
 // 🧠 INTELLIGENT SESSION TYPE DETECTION (same as get-session-data.js)
 const isRegularSession = /^sess_[a-zA-Z0-9_]+$/.test(session_id)
 const isFallbackSession = /^fallback_[0-9]+_[a-zA-Z0-9]+$/.test(session_id)
 const isDemoSession = /^demo_session_[a-zA-Z0-9_]+$/.test(session_id)
 const isTestSession = /^test_[a-zA-Z0-9_]+$/.test(session_id)
 const isStripeSession = /^cs_[a-zA-Z0-9_]+$/.test(session_id)
 
 const sessionType = isRegularSession ? 'regular' : 
                    isFallbackSession ? 'fallback' :
                    isDemoSession ? 'demo' : 
                    isTestSession ? 'test' : 
                    isStripeSession ? 'stripe' : 'unknown'
 
 const isLocalSession = isRegularSession || isFallbackSession || isDemoSession || isTestSession
 
 console.log('🔍 get-session.js - Session type:', sessionType, 'for ID:', session_id)
 
 // 🎯 SKIP STRIPE FOR LOCAL SESSIONS
 if (isLocalSession) {
   console.log('⚠️ Local session detected in get-session.js - this endpoint is for Stripe sessions only')
   return res.status(400).json({ 
     success: false,
     error: 'This endpoint is for Stripe sessions only. Use /api/get-session-data for local sessions.',
     sessionType: sessionType,
     recommendedEndpoint: '/api/get-session-data'
   })
 }
 
 // Only proceed for Stripe sessions
 if (!isStripeSession) {
   return res.status(400).json({ 
     success: false,
     error: 'Invalid session format for this endpoint. Expected Stripe session (cs_*)',
     sessionType: sessionType
   })
 }
 
 try {
   console.log('🔄 Retrieving Stripe session:', session_id)
   const session = await stripe.checkout.sessions.retrieve(session_id)
   
   if (session.payment_status === 'paid') {
     // Try to load full CV data from saved session
     let fullCvData = null
     const fullSessionId = session.metadata?.fullSessionId
     
     if (fullSessionId) {
       const fs = require('fs').promises
       const path = require('path')
       
       try {
         const sessionsDir = path.join(process.cwd(), '.sessions')
         const sessionFile = path.join(sessionsDir, `${fullSessionId}.json`)
         
         // Check if file exists and read it
         await fs.access(sessionFile)
         const sessionData = await fs.readFile(sessionFile, 'utf8')
         fullCvData = JSON.parse(sessionData)
         
         console.log('✅ Full CV data retrieved for session:', fullSessionId)
       } catch (fileError) {
         console.log('⚠️ Could not load full CV data:', fileError.message)
       }
     }
     
     return res.status(200).json({
       success: true,
       session: {
         id: session.id,
         metadata: session.metadata,
         customer_email: session.customer_details?.email,
         amount_total: session.amount_total,
         // Include full CV data if available
         fullCvData: fullCvData
       }
     })
   } else {
     return res.status(400).json({ 
       success: false,
       error: 'Payment not completed' 
     })
   }
 } catch (error) {
   console.error('Error retrieving session:', error.message)
   
   // Enhanced error handling with proper status codes
   if (error.type === 'StripeInvalidRequestError') {
     if (error.code === 'resource_missing') {
       return res.status(404).json({ 
         success: false,
         error: 'Stripe session not found',
         sessionId: session_id,
         sessionType: sessionType
       })
     } else {
       return res.status(400).json({ 
         success: false,
         error: 'Invalid Stripe session request',
         details: error.message
       })
     }
   }
   
   // Network or other errors
   return res.status(500).json({ 
     success: false,
     error: 'Failed to retrieve Stripe session',
     sessionType: sessionType,
     details: process.env.NODE_ENV === 'development' ? error.message : undefined
   })
 }
}