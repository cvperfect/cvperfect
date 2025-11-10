import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { session_id, email, plan } = req.body

    if (!session_id || !email || !plan) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    console.log('🔍 Verifying session and creating user:', { session_id, email, plan })

    // Weryfikuj sesję Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' })
    }

    // Określ limity na podstawie planu
    let usageLimit = 1
    let expiresAt = null

    if (plan === 'basic' || plan === 'premium') {
      usageLimit = 1
      expiresAt = null
    } else if (plan === 'gold' || plan === 'pro') {
      usageLimit = 10
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    } else if (plan === 'premium-monthly') {
      usageLimit = 9999
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    // Sprawdź czy użytkownik już istnieje
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      console.log('✅ User already exists')
      return res.status(200).json({
        success: true,
        user: existingUser,
        message: 'User already exists'
      })
    }

    // Stwórz nowego użytkownika
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email,
        plan: plan,
        usage_count: 0,
        usage_limit: usageLimit,
        expires_at: expiresAt,
        stripe_session_id: session_id,
        last_payment_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error creating user:', insertError)
      return res.status(500).json({ error: 'Failed to create user', details: insertError.message })
    }

    console.log('✅ User created successfully:', newUser)

    return res.status(200).json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('❌ Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
