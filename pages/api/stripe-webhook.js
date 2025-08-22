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

      // IDEMPOTENCY CHECK - sprawdź czy już przetworzyliśmy tę sesję
      const { data: existingUser } = await supabase
        .from('users')
        .select('stripe_session_id')
        .eq('stripe_session_id', session.id)
        .single()

      if (existingUser) {
        console.log('⚠️ Session already processed, skipping:', session.id)
        return res.status(200).json({ received: true, message: 'Already processed' })
      }

      // Pobierz email (Stripe może go przechowywać w różnych miejscach)
      const email = session.customer_email || session.customer_details?.email
      
      if (!email) {
        console.error('❌ Brak emaila w sesji!')
        return res.status(400).json({ error: 'Brak emaila' })
      }

      // Określ plan na podstawie kwoty i typu płatności
      const amountPLN = session.amount_total / 100
      let plan = 'basic'
      let usageLimit = 1
      let planType = 'one_time'
      let expiresAt = null

      // Sprawdź czy to subskrypcja czy płatność jednorazowa
      if (session.mode === 'subscription' && session.subscription) {
        // SUBSKRYPCJE MIESIĘCZNE
        if (amountPLN === 49) {
          plan = 'gold'
          usageLimit = 10 // resetuje się co miesiąc
          planType = 'subscription'
        } else if (amountPLN === 79) {
          plan = 'premium'
          usageLimit = 25 // resetuje się co miesiąc
          planType = 'subscription'
        }
      } else {
        // PŁATNOŚCI JEDNORAZOWE
        if (amountPLN === 19.99 || (amountPLN >= 19 && amountPLN < 49)) {
          plan = 'basic'
          usageLimit = 1
          planType = 'one_time'
          expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 rok
        }
      }

      // Sprawdź czy to subskrypcja
      if (session.mode === 'subscription' && session.subscription) {
        // Pobierz szczegóły subskrypcji
        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        
        // Ustaw datę wygaśnięcia na podstawie okresu rozliczeniowego
        expiresAt = new Date(subscription.current_period_end * 1000).toISOString()
        planType = 'subscription'
        
        console.log('📅 Subskrypcja aktywna do:', expiresAt)
      }

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
          stripe_subscription_id: session.subscription || null,
          expires_at: expiresAt,
          last_payment_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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

    // Obsługa odnowienia subskrypcji
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object
      
      // Pomiń pierwszą fakturę (to jest utworzenie subskrypcji)
      if (invoice.billing_reason === 'subscription_create') {
        return res.status(200).json({ received: true })
      }

      console.log('🔄 Subskrypcja odnowiona:', {
        customerId: invoice.customer,
        subscriptionId: invoice.subscription
      })

      // Pobierz email klienta
      const customer = await stripe.customers.retrieve(invoice.customer)
      const email = customer.email

      if (email) {
        // Znajdź użytkownika i przedłuż subskrypcję
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        
        const { error } = await supabase
          .from('users')
          .update({
            expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
            last_payment_at: new Date().toISOString(),
            usage_count: 0 // Reset miesięcznego limitu
          })
          .eq('email', email.toLowerCase())

        if (!error) {
          console.log('✅ Subskrypcja przedłużona dla:', email)
        }
      }
    }

    // Obsługa anulowania subskrypcji
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const customer = await stripe.customers.retrieve(subscription.customer)
      const email = customer.email

      if (email) {
        console.log('❌ Subskrypcja anulowana:', email)
        
        // Ustaw plan na free po wygaśnięciu
        const { error } = await supabase
          .from('users')
          .update({
            plan_type: 'cancelled',
            // Pozwól dokończyć opłacony okres
            expires_at: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('email', email.toLowerCase())
      }
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