import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const sig = req.headers['stripe-signature']
    const body = req.body

    // Verify webhook signature (comment out for now, will add later)
    // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    
    // For now, parse the event directly (TEMPORARY - for testing)
    const event = typeof body === 'string' ? JSON.parse(body) : body

    console.log('✅ Webhook event received:', event.type)

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      
      console.log('💳 Payment successful for session:', session.id)
      console.log('📧 Customer email:', session.customer_details?.email)
      console.log('💰 Amount paid:', session.amount_total / 100, 'PLN')

      // Determine plan based on amount
      let plan = 'basic'
      let usageLimit = 1
      let planType = 'one_time'
      let expiresAt = null

      const amountPLN = session.amount_total / 100

      if (amountPLN >= 79) {
        plan = 'premium'
        usageLimit = 25
        planType = 'subscription'
        // Premium expires in 1 month
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      } else if (amountPLN >= 49) {
        plan = 'pro'
        usageLimit = 10
        planType = 'subscription'
        // Pro expires in 1 month
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      // Save user to database
      const { data, error } = await supabase
        .from('users')
        .upsert({
          email: session.customer_details?.email,
          plan: plan,
          plan_price: amountPLN,
          plan_type: planType,
          usage_limit: usageLimit,
          usage_count: 0,
          stripe_session_id: session.id,
          expires_at: expiresAt
        }, {
          onConflict: 'email'
        })

      if (error) {
        console.error('❌ Database error:', error)
        return res.status(500).json({ error: 'Database error' })
      }

      console.log('✅ User saved to database:', {
        email: session.customer_details?.email,
        plan: plan,
        usageLimit: usageLimit
      })
    }

    res.status(200).json({ received: true })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    res.status(400).json({ error: 'Webhook error: ' + error.message })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}