import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { plan, email, priceId } = req.method === 'POST' ? req.body : req.query
  let finalPriceId
  let mode = 'payment'

  try {
    if (priceId) {
      finalPriceId = priceId
      mode = 'payment'
    } else {
      switch (plan) {
        case 'premium':
          finalPriceId = 'price_1RtEUF4FWb3xY5tD1URz9MEn'
          mode = 'payment'
          break
        case 'gold':
          finalPriceId = 'price_1Rof7b4FWb3xY5tDQ76590pw'
          mode = 'subscription'
          break
        case 'premium-monthly':
          finalPriceId = 'price_1RqWk34FWb3xY5tD5W2ge1g0'
          mode = 'subscription'
          break
        default:
          finalPriceId = 'price_1RofCI4FWb3xY5tDYONIW3Ix'
          mode = 'payment'
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: mode === 'payment' ? ['card', 'blik'] : ['card'],
      line_items: [{
        price: finalPriceId,
        quantity: 1,
      }],
      mode: mode,
      customer_email: email,
      metadata: {
        plan: plan || 'direct',
        email: email,
        timestamp: Date.now().toString(),
        userId: 'user_' + Math.random().toString(36).substr(2, 9)
      },
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan || 'direct'}`,
cancel_url: `http://localhost:3000/`,
    })

    console.log('SUCCESS - Plan:', plan, 'Email:', email, 'Session:', session.id)

    if (req.method === 'GET') {
      res.redirect(303, session.url)
    } else {
      res.status(200).json({ id: session.id, url: session.url })
    }
  } catch (error) {
    console.error('STRIPE ERROR:', error.message)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}