import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  
  // Pobierz parametry z POST lub GET
  const { plan, email, priceId, cv, job } = req.method === 'POST' ? req.body : req.query
  
  let finalPriceId
  let mode = 'payment'
  
  try {
    // Określ cenę i tryb płatności
    if (priceId) {
      finalPriceId = priceId
      mode = 'payment'
    } else {
      switch (plan) {
        case 'basic':
          finalPriceId = 'price_1Rwooh4FWb3xY5tDRxqQ4y69' // 19.99 zł jednorazowo
          mode = 'payment'
          break
        case 'premium':
          finalPriceId = 'price_1Rwooh4FWb3xY5tDRxqQ4y69' // 19.99 zł jednorazowo (tymczasowo ta sama cena)
          mode = 'payment'
          break
        case 'gold':
        case 'pro':
          finalPriceId = 'price_1RxuK64FWb3xY5tDOjAPfwRX' // 49 zł miesięcznie (musisz zmienić na właściwy price ID)
          mode = 'subscription'
          break
        case 'premium-monthly':
          finalPriceId = 'price_1RxuKK4FWb3xY5tD28TyEG9e' // 79 zł miesięcznie (musisz zmienić na właściwy price ID)
          mode = 'subscription'
          break
        default:
          finalPriceId = 'price_1Rwooh4FWb3xY5tDRxqQ4y69'
          mode = 'payment'
      }
    }
    
    // Przygotuj metadata z CV i job posting
    const metadata = {
      plan: plan || 'direct',
      email: email || '',
      timestamp: Date.now().toString(),
      userId: 'user_' + Math.random().toString(36).substr(2, 9)
    }
    
    // Dodaj CV do metadata jeśli istnieje (Stripe ma limit 500 znaków per pole)
    if (cv) {
      // Ogranicz do 400 znaków dla bezpieczeństwa
      metadata.cv = cv.substring(0, 400)
    }
    
    // Dodaj job posting do metadata jeśli istnieje
    if (job) {
      // Ogranicz do 200 znaków
      metadata.job = job.substring(0, 200)
    }
    
    console.log('🎯 Creating checkout session:', {
      plan: plan,
      email: email,
      mode: mode,
      hasCV: !!cv,
      hasJob: !!job
    })
    
    // Utwórz sesję Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: mode === 'payment' ? ['card', 'blik'] : ['card'],
      line_items: [{
        price: finalPriceId,
        quantity: 1,
      }],
      mode: mode,
      customer_email: email,
      metadata: metadata,
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan || 'direct'}`,
      cancel_url: `http://localhost:3000/`,
      // Dodaj opis produktu dla lepszego UX
      locale: 'pl', // Polski język w Stripe Checkout
      payment_intent_data: mode === 'payment' ? {
        description: `Optymalizacja CV - Plan ${plan || 'basic'}`,
        metadata: metadata
      } : undefined,
      subscription_data: mode === 'subscription' ? {
        description: `Subskrypcja CV - Plan ${plan}`,
        metadata: metadata
      } : undefined
    })
    
    console.log('✅ SUCCESS - Created session:', {
      sessionId: session.id,
      plan: plan,
      email: email,
      mode: mode
    })
    
    // Zwróć odpowiedź
    if (req.method === 'GET') {
      // Dla GET przekieruj bezpośrednio
      res.redirect(303, session.url)
    } else {
      // Dla POST zwróć JSON
      res.status(200).json({ 
        id: session.id, 
        url: session.url,
        success: true 
      })
    }
    
  } catch (error) {
    console.error('❌ STRIPE ERROR:', error.message)
    console.error('Full error:', error)
    
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message,
      success: false
    })
  }
}