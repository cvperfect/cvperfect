export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Proxy request do Stripe bez zewnętrznych analytics
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    
    const { sessionId } = req.body
    
    if (sessionId) {
      // Redirect do checkout
      res.status(200).json({ 
        success: true, 
        url: `https://checkout.stripe.com/pay/${sessionId}` 
      })
    } else {
      res.status(400).json({ error: 'No session ID' })
    }
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
}