import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email, subject, message, isPremium } = req.body

  // Konfiguracja Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})
  const emailSubject = isPremium 
    ? `🟡 PREMIUM URGENT: ${subject}` 
    : `Kontakt CvPerfect: ${subject}`

  try {
    await transporter.sendMail({
      from: email,
      to: 'pomoccvperfect@gmail.com',
      subject: emailSubject,
      html: `
        <h3>Nowa wiadomość z CvPerfect</h3>
        <p><strong>Od:</strong> ${name} (${email})</p>
        <p><strong>Kategoria:</strong> ${subject}</p>
        <p><strong>Premium:</strong> ${isPremium ? 'TAK 🟡' : 'Nie'}</p>
        <hr>
        <p><strong>Wiadomość:</strong></p>
        <p>${message}</p>
      `
    })

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    res.status(500).json({ error: 'Błąd wysyłania' })
  }
}