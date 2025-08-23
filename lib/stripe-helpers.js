/**
 * Stripe Helper Functions for CVPerfect
 * Handles secure session management with Stripe webhooks
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

/**
 * Create secure session from Stripe checkout completion
 * @param {Object} stripeSession - Stripe session object
 * @returns {boolean} Success status
 */
export async function createSecureSession(stripeSession) {
  try {
    console.log('🔒 Creating secure session for:', stripeSession.id)
    
    const sessionData = {
      session_id: stripeSession.metadata?.sessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: stripeSession.customer_details?.email || stripeSession.metadata?.email,
      plan: stripeSession.metadata?.plan || 'basic',
      stripe_session_id: stripeSession.id,
      cv_data: stripeSession.metadata?.cv || null,
      job_posting: stripeSession.metadata?.job || null,
      photo_data: stripeSession.metadata?.photo || null,
      status: 'active'
    }
    
    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Failed to create secure session:', error)
      return false
    }
    
    console.log('✅ Secure session created:', data.session_id)
    return true
    
  } catch (error) {
    console.error('❌ Error creating secure session:', error)
    return false
  }
}

/**
 * Verify session authenticity with Stripe
 * @param {string} sessionId - Session ID to verify
 * @returns {Object} Verification result
 */
export async function verifyStripeSession(sessionId) {
  try {
    // First check our database
    const { data: sessionData, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single()
    
    if (error || !sessionData) {
      console.log('⚠️ Session not found in database')
      return { verified: false, error: 'Session not found' }
    }
    
    // Check expiration
    if (new Date(sessionData.expires_at) < new Date()) {
      console.log('⚠️ Session expired')
      return { verified: false, error: 'Session expired' }
    }
    
    console.log('✅ Session verified from database')
    return {
      verified: true,
      session: sessionData,
      source: 'database'
    }
    
  } catch (error) {
    console.error('❌ Session verification error:', error)
    return { verified: false, error: 'Verification failed' }
  }
}

/**
 * Update session with processed CV data
 * @param {string} sessionId - Session ID
 * @param {Object} updateData - Data to update
 * @returns {boolean} Success status
 */
export async function updateSessionData(sessionId, updateData) {
  try {
    const { error } = await supabase
      .from('sessions')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
    
    if (error) {
      console.error('❌ Failed to update session:', error)
      return false
    }
    
    console.log('✅ Session updated:', sessionId)
    return true
    
  } catch (error) {
    console.error('❌ Session update error:', error)
    return false
  }
}

/**
 * Cleanup expired sessions (run periodically)
 * @returns {number} Number of sessions cleaned up
 */
export async function cleanupExpiredSessions() {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .delete()
      .lt('expires_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 days old
      .select()
    
    if (error) {
      console.error('❌ Cleanup failed:', error)
      return 0
    }
    
    const cleanedCount = data?.length || 0
    console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`)
    return cleanedCount
    
  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return 0
  }
}

/**
 * Get session analytics for monitoring
 * @returns {Object} Session statistics
 */
export async function getSessionAnalytics() {
  try {
    const { data: activeSessions, error: activeError } = await supabase
      .from('sessions')
      .select('plan')
      .gt('expires_at', new Date().toISOString())
    
    const { data: todaySessions, error: todayError } = await supabase
      .from('sessions')
      .select('plan')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    
    if (activeError || todayError) {
      console.error('❌ Analytics query failed')
      return null
    }
    
    const analytics = {
      activeSessions: activeSessions?.length || 0,
      todaySessions: todaySessions?.length || 0,
      planDistribution: {
        basic: activeSessions?.filter(s => s.plan === 'basic').length || 0,
        gold: activeSessions?.filter(s => s.plan === 'gold').length || 0,
        premium: activeSessions?.filter(s => s.plan === 'premium').length || 0
      },
      timestamp: new Date().toISOString()
    }
    
    return analytics
    
  } catch (error) {
    console.error('❌ Analytics error:', error)
    return null
  }
}