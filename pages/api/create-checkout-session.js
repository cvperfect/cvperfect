import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  
  // Pobierz parametry z POST lub GET
  const { plan, email, priceId } = req.method === 'POST' ? req.body : req.query

  // NOWY MODEL: Tylko jednorazowa płatność 49 PLN
  const finalPriceId = priceId || 'price_1SWyG04FWb3xY5tDVDanbL4O' // 49 PLN jednorazowo (one-time)
  const mode = 'payment' // Zawsze jednorazowa płatność

  try {

    // Przygotuj metadata (CV i job posting są w sessionStorage klienta)
    const metadata = {
      plan: plan || 'direct',
      email: email || '',
      timestamp: Date.now().toString(),
      userId: 'user_' + Math.random().toString(36).substr(2, 9)
    }

    console.log('🎯 Creating checkout session:', {
      plan: plan || 'direct',
      email: email,
      priceId: finalPriceId,
      mode: 'payment'
    })
    
    // Określ URL bazowy (development vs production)
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_BASE_URL || 'https://cvperfect.com'
      : `http://localhost:${process.env.PORT || 3000}`

    // Utwórz sesję Stripe - jednorazowa płatność
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik'],
      line_items: [{
        price: finalPriceId,
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      metadata: metadata,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan || 'direct'}`,
      cancel_url: `${baseUrl}/`,
      locale: 'pl', // Polski język w Stripe Checkout
      payment_intent_data: {
        description: 'CVPerfect - Optymalizacja CV',
        metadata: metadata
      }
    })
    
    console.log('✅ SUCCESS - Created session:', {
      sessionId: session.id,
      plan: plan || 'direct',
      email: email,
      mode: 'payment'
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