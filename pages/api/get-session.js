import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
 if (req.method !== 'GET') {
   return res.status(405).json({ message: 'Method not allowed' })
 }
 
 const { session_id } = req.query
 
 if (!session_id) {
   return res.status(400).json({ error: 'Session ID is required' })
 }
 
 try {
   const session = await stripe.checkout.sessions.retrieve(session_id)
   
   if (session.payment_status === 'paid') {
     res.status(200).json({
       success: true,
       session: {
         id: session.id,
         metadata: session.metadata,
         customer_email: session.customer_details?.email,
         amount_total: session.amount_total
       }
     })
   } else {
     res.status(400).json({ 
       success: false,
       error: 'Payment not completed' 
     })
   }
 } catch (error) {
   console.error('Error retrieving session:', error)
   res.status(500).json({ 
     success: false,
     error: 'Failed to retrieve session' 
   })
 }
}