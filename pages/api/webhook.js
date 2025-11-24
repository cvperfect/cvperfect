import Stripe from 'stripe'
import { buffer } from 'micro'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  try {
    const event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      console.log('💰 Payment successful:', session.id)
      console.log('📧 Customer email:', session.customer_details?.email)
      console.log('📦 Metadata:', session.metadata)

      // Pobierz dane z session
      const email = session.customer_details?.email || session.metadata?.email
      const plan = session.metadata?.plan || 'basic'

      if (!email) {
        console.error('❌ No email found in session')
        return res.json({ received: true, error: 'No email' })
      }

      // NOWY MODEL: 49 PLN = 1 użycie, jednorazowa płatność
      const usageLimit = 1
      const expiresAt = null // Brak wygaśnięcia

      console.log('💳 Jednorazowa płatność - 1 użycie')

      // Zapisz lub zaktualizuj użytkownika w Supabase
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (existingUser) {
        // Użytkownik istnieje - dodaj do limitu lub przedłuż
        console.log('👤 Existing user, updating...')
        const { error: updateError } = await supabase
          .from('users')
          .update({
            plan: plan,
            usage_limit: existingUser.usage_limit + usageLimit,
            expires_at: expiresAt,
            stripe_session_id: session.id,
            last_payment_at: new Date().toISOString()
          })
          .eq('email', email)

        if (updateError) {
          console.error('❌ Error updating user:', updateError)
        } else {
          console.log('✅ User updated successfully')
        }
      } else {
        // Nowy użytkownik - stwórz wpis
        console.log('👤 New user, creating...')
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            email: email,
            plan: plan,
            usage_count: 0,
            usage_limit: usageLimit,
            expires_at: expiresAt,
            stripe_session_id: session.id,
            last_payment_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('❌ Error creating user:', insertError)
        } else {
          console.log('✅ User created successfully')
        }
      }
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(400).send(`Webhook Error: ${error.message}`)
  }
}