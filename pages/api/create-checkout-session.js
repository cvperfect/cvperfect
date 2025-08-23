import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  
  // Pobierz parametry z POST lub GET  
  const { plan, email, priceId, cv, job, photo, fullSessionId } = req.method === 'POST' ? req.body : req.query
  
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
          // SUBSKRYPCJA 79 PLN/miesiąc
          finalPriceId = process.env.STRIPE_PRICE_PREMIUM_79 || 'price_1RxuKK4FWb3xY5tD28TyEG9e' // 79 zł/miesiąc
          mode = 'subscription'
          break
        case 'gold':
        case 'pro':
          // SUBSKRYPCJA 49 PLN/miesiąc
          finalPriceId = process.env.STRIPE_PRICE_GOLD_49 || 'price_1RxuK64FWb3xY5tDOjAPfwRX' // 49 zł/miesiąc
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
    
    // WALIDACJA: Sprawdź czy price ID nie jest placeholder
    if (finalPriceId.includes('PLACEHOLDER')) {
      console.error('❌ BŁĄD KONFIGURACJI: Brak właściwego price ID dla planu:', plan)
      return res.status(500).json({ 
        error: 'Błąd konfiguracji płatności. Skontaktuj się z pomocą techniczną.',
        success: false 
      })
    }
    
    // WALIDACJA: Sprawdź zgodność planu z typem płatności
    const expectedModes = {
      'basic': 'payment',    // 19.99 PLN jednorazowo
      'gold': 'subscription', // 49 PLN/miesiąc
      'premium': 'subscription' // 79 PLN/miesiąc
    }
    
    if (expectedModes[plan] && expectedModes[plan] !== mode) {
      console.error('❌ BŁĘDNY TYP PŁATNOŚCI: Plan', plan, 'oczekuje', expectedModes[plan], 'ale ustawiono', mode)
      return res.status(500).json({ 
        error: 'Błąd konfiguracji typu płatności.',
        success: false 
      })
    }
    
    // Przygotuj metadata z CV i job posting
    const metadata = {
      plan: plan || 'direct',
      email: email || '',
      timestamp: Date.now().toString(),
      userId: 'user_' + Math.random().toString(36).substr(2, 9),
      fullSessionId: fullSessionId || null // Our session ID for full data retrieval
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
    
    // Dodaj photo marker do metadata jeśli istnieje (nie zapisujemy całego base64 w Stripe)
    if (photo) {
      // Tylko flaga że photo istnieje - pełne dane są w sessionStorage/database
      metadata.hasPhoto = 'true'
      metadata.photoSize = photo.length.toString()
    }
    
    // Determine base URL with proper fallback priority
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    process.env.BASE_URL || 
                    req.headers.origin || 
                    (req.headers.host ? `https://${req.headers.host}` : null) ||
                    'http://localhost:3000'
    
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan || 'direct'}`
    const cancelUrl = `${baseUrl}/`
    
    console.log('🎯 Creating checkout session:', {
      plan: plan,
      email: email,
      mode: mode,
      hasCV: !!cv,
      hasJob: !!job,
      baseUrl: baseUrl,
      successUrl: successUrl
    })
    
    // Validate URLs
    if (!baseUrl.startsWith('http')) {
      console.error('❌ Invalid base URL:', baseUrl)
      return res.status(500).json({ 
        error: 'Invalid configuration - base URL missing',
        success: false 
      })
    }
    
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
      success_url: successUrl,
      cancel_url: cancelUrl,
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