import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { priceType, cv, coverLetter } = req.body

  try {
    let priceId
    let mode = 'payment'

    // Dopasowanie planów cenowych
    switch (priceType) {
      case 'basic':
      case 'onetime':
        priceId = 'price_1RofCI4FWb3xY5tDYONIW3Ix' // Basic: 9,99 zł jednorazowo
        mode = 'payment'
        break
      case 'pro':
      case 'subscription':
        priceId = 'price_1Rof7b4FWb3xY5tDQ76590pw' // Pro: 49 zł / mies
        mode = 'subscription'
        break
      case 'premium':
        priceId = 'price_1RqWk34FWb3xY5tD5W2ge1g0' // Premium: 79 zł / mies
        mode = 'subscription'
        break
      default:
        return res.status(400).json({ error: 'Invalid price type' })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'p24'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`,
      metadata: {
        cv: Buffer.from(cv).toString('base64'),
        coverLetter: Buffer.from(coverLetter).toString('base64'),
        priceType: priceType
      }
    })

    res.status(200).json({ id: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
