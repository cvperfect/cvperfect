// pages/api/stripe-webhook.js
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { buffer } from 'micro'

// WAŻNE: Wyłącz body parser!
export const config = {
  api: {
    bodyParser: false, // KRYTYCZNE dla bezpieczeństwa!
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Pobierz surowe body
  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  if (!sig) {
    console.error('❌ Brak podpisu Stripe!')
    return res.status(400).json({ error: 'Brak podpisu' })
  }

  let event

  try {
    // KRYTYCZNA WERYFIKACJA - sprawdza czy to naprawdę Stripe wysłał request
    event = stripe.webhooks.constructEvent(
      buf.toString(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET // Musisz mieć to w .env.local!
    )
    
    console.log('✅ Webhook zweryfikowany:', event.type)
    
  } catch (err) {
    console.error('❌ Błąd weryfikacji webhook:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  try {
    // Obsługa płatności zakończonej sukcesem
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      
      console.log('💳 Płatność udana:', {
        sessionId: session.id,
        email: session.customer_email || session.customer_details?.email,
        amount: session.amount_total / 100,
        mode: session.mode
      })

      // Pobierz email (Stripe może go przechowywać w różnych miejscach)
      const email = session.customer_email || session.customer_details?.email

      if (!email) {
        console.error('❌ Brak emaila w sesji!')
        return res.status(400).json({ error: 'Brak emaila' })
      }

      // NOWY MODEL: 49 PLN = 1 użycie, jednorazowa płatność
      const amountPLN = session.amount_total / 100
      const plan = 'single_use'
      const usageLimit = 1
      const planType = 'one_time'
      const expiresAt = null // Brak wygaśnięcia dla jednorazowej płatności

      console.log('💳 Jednorazowa płatność 49 PLN - 1 użycie')

      // Zapisz lub zaktualizuj użytkownika w bazie
      const { data, error } = await supabase
        .from('users')
        .upsert({
          email: email.toLowerCase(), // Normalizuj email
          plan: plan,
          plan_price: amountPLN,
          plan_type: planType,
          usage_limit: usageLimit,
          usage_count: 0, // Reset użycia przy nowej płatności
          stripe_session_id: session.id,
          stripe_customer_id: session.customer, // Zapisz ID klienta Stripe
          expires_at: expiresAt,
          last_payment_at: new Date().toISOString()
        }, {
          onConflict: 'email',
          ignoreDuplicates: false // Zawsze aktualizuj przy konflikcie
        })

      if (error) {
        console.error('❌ Błąd bazy danych:', error)
        // NIE zwracaj błędu 500 - Stripe będzie próbował ponownie!
        // Zamiast tego zaloguj błąd i zwróć sukces
        return res.status(200).json({ 
          received: true, 
          warning: 'Database error but payment processed' 
        })
      }

      console.log('✅ Użytkownik zapisany/zaktualizowany:', {
        email: email,
        plan: plan,
        usageLimit: usageLimit,
        expiresAt: expiresAt
      })

      // TODO: Wyślij email potwierdzający (opcjonalne)
      // await sendConfirmationEmail(email, plan, amountPLN)
    }

    // Zawsze zwróć 200 dla Stripe
    res.status(200).json({ received: true })

  } catch (error) {
    console.error('❌ Błąd przetwarzania webhook:', error)
    // Zwróć 200 żeby Stripe nie próbował ponownie
    res.status(200).json({ 
      received: true, 
      error: 'Processing error but acknowledged' 
    })
  }
}