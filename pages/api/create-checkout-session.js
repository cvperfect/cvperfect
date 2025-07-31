import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { plan, email } = req.body

  try {
    let priceId
    let mode = 'payment'
    
    // Dopasowanie planów cenowych
    switch (plan) {
      case 'basic':
        priceId = 'price_1RofCI4FWb3xY5tDYONIW3Ix' // Basic: 9,99 zł jednorazowo
        mode = 'payment'
        break
      case 'pro':
        priceId = 'price_1Rof7b4FWb3xY5tDQ76590pw' // Pro: 49 zł / mies
        mode = 'subscription'
        break
      case 'premium':
        priceId = 'price_1RqWk34FWb3xY5tD5W2ge1g0' // Premium: 79 zł / mies
        mode = 'subscription'
        break
      default:
        return res.status(400).json({ error: 'Invalid plan type' })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: mode === 'payment' ? ['card', 'blik'] : ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      customer_email: email,
      metadata: {
        plan: plan,
        email: email,
        timestamp: Date.now().toString(),
        userId: 'user_' + Math.random().toString(36).substr(2, 9)
      },
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${req.headers.origin}/`,
    })

    console.log('=== STRIPE SESSION DEBUG ===')
    console.log('Plan:', plan)
    console.log('Email:', email)
    console.log('Session ID:', session.id)
    console.log('Session URL:', session.url)

    res.status(200).json({ 
      id: session.id,
      url: session.url
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}