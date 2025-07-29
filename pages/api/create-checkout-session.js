import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { priceType, cv, coverLetter } = req.body

  try {
    let priceData

    if (priceType === 'onetime') {
      priceData = {
        currency: 'pln',
        product_data: {
          name: 'CvPerfect - Jednorazowy dostęp',
          description: 'Pełny dostęp do wygenerowanego CV i listu motywacyjnego z możliwością pobrania PDF',
        },
        unit_amount: 999, // 9.99 PLN
      }
    } else if (priceType === 'subscription') {
      priceData = {
        currency: 'pln',
        product_data: {
          name: 'CvPerfect - Subskrypcja miesięczna',
          description: '10 CV miesięcznie z pełnym dostępem i pobieraniem PDF',
        },
        unit_amount: 4900, // 49 PLN
        recurring: {
          interval: 'month',
        },
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'p24'],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: priceType === 'subscription' ? 'subscription' : 'payment',
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