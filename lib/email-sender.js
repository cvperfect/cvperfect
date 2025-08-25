// STEP 12: Email sender for post-payment confirmations
import nodemailer from 'nodemailer'
import { getPaymentConfirmationTemplate } from './email-templates.js'

// Create reusable transporter
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured')
    return null
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  })
}

export const sendPaymentConfirmationEmail = async (email, plan, amount, sessionId) => {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.log('📧 Email sending skipped - credentials not configured')
    return { success: false, reason: 'no_credentials' }
  }

  try {
    const template = getPaymentConfirmationTemplate(email, plan, amount, sessionId)
    
    const mailOptions = {
      from: {
        name: 'CVPerfect.pl',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html
    }

    console.log('📧 Sending payment confirmation email to:', email)
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Payment confirmation email sent:', {
      messageId: info.messageId,
      email: email,
      plan: plan,
      sessionId: sessionId
    })

    return { 
      success: true, 
      messageId: info.messageId,
      email: email
    }

  } catch (error) {
    console.error('❌ Failed to send payment confirmation email:', error.message)
    
    return { 
      success: false, 
      error: error.message,
      email: email
    }
  }
}