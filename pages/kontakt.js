import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

export default function Kontakt() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'technical',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

 const checkIfPremiumUser = async (email) => {
  // Tutaj sprawdzisz w bazie Stripe czy ma aktywną subskrypcję
  try {
    const response = await fetch(`/api/check-premium?email=${email}`)
    const data = await response.json()
    return data.isPremium
  } catch {
    return false
  }
}

const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Sprawdź czy to użytkownik Premium (po email)
  const isPremium = await checkIfPremiumUser(formData.email)
  
  // Przygotuj dane z oznaczeniem Premium
  const emailData = {
    ...formData,
    isPremium,
    subject: isPremium 
      ? `🟡 PREMIUM URGENT: ${formData.subject}` 
      : `Kontakt: ${formData.subject}`,
    priority: isPremium ? 'high' : 'normal'
  }
  
  // Wyślij email (będziesz musiał stworzyć endpoint /api/contact)
  await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
  })
  
  setIsSubmitted(true)
  
  // Reset form after 3 seconds
  setTimeout(() => {
    setIsSubmitted(false)
    setFormData({ name: '', email: '', subject: 'technical', message: '' })
  }, 3000)
}

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <Head>
        <title>Kontakt - CvPerfect | Pomoc i wsparcie techniczne</title>
        <meta name="description" content="Skontaktuj się z zespołem CvPerfect. Wsparcie techniczne, współpraca biznesowa i odpowiedzi na pytania dotyczące optymalizacji CV." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="contact-container">
        {/* Header */}
        <div className="contact-header">
          <div className="header-content">
            <Link href="/" className="logo-link">
              <div className="logo">
                <span className="logo-text">CvPerfect</span>
                <span className="logo-badge">AI</span>
              </div>
            </Link>
            <Link href="/" className="back-link">
              ← Powrót na stronę główną
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="contact-content">
          <div className="contact-wrapper">
            <h1 className="contact-title">Kontakt</h1>
            <p className="contact-subtitle">
              Potrzebujesz pomocy? Jesteśmy tutaj dla Ciebie!
              <br />
              <span className="response-time">Odpowiemy najszybciej jak to możliwe</span>
            </p>

            <div className="contact-grid">
              {/* Contact Information */}
              <div className="contact-info">
                <h2 className="info-title">Skontaktuj się z nami</h2>
                
                <div className="contact-methods">
                  <div className="contact-method primary">
                    <div className="method-icon">📧</div>
                    <div className="method-content">
                      <h3>Email</h3>
                      <a href="mailto:pomoccvperfect@gmail.com" className="contact-email">
                        pomoccvperfect@gmail.com
                      </a>
                      <p>"Szybka odpowiedź"</p>
                    </div>
                  </div>

                

                  <div className="contact-method">
                    <div className="method-icon">🌍</div>
                    <div className="method-content">
                      <h3>Strefa czasowa</h3>
                      <p>Polska (CET/CEST)</p>
                      <p>Pon-Pt: 9:00-17:00</p>
                    </div>
                  </div>
                </div>

                <div className="help-categories">
                  <h3>W czym możemy pomóc?</h3>
                  <div className="categories-grid">
                    <div className="category-item">
                      <span className="category-icon">🛠️</span>
                      <div>
                        <strong>Wsparcie techniczne</strong>
                        <p>Problemy z optymalizacją, błędy systemu</p>
                      </div>
                    </div>
                    <div className="category-item">
                      <span className="category-icon">💳</span>
                      <div>
                        <strong>Płatności i faktury</strong>
                        <p>Problemy z płatnościami, anulowanie subskrypcji</p>
                      </div>
                    </div>
                    <div className="category-item">
                      <span className="category-icon">💼</span>
                      <div>
                        <strong>Współpraca B2B</strong>
                        <p>Oferty dla firm, rekruterów, partnerstwa</p>
                      </div>
                    </div>
                    <div className="category-item">
                      <span className="category-icon">💡</span>
                      <div>
                        <strong>Sugestie i feedback</strong>
                        <p>Pomysły na nowe funkcje, usprawnienia</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="contact-form-section">
                <h2 className="form-title">Napisz do nas</h2>
                
                {isSubmitted ? (
                  <div className="success-message">
                    <div className="success-icon">✅</div>
                    <h3>Wiadomość wysłana!</h3>
                    <p>Dziękujemy za kontakt. "Odpowiemy najszybciej jak to możliwe".</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">Imię i nazwisko</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Jan Kowalski"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Adres email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="jan@example.com"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">Kategoria zapytania</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="technical">🛠️ Wsparcie techniczne</option>
                        <option value="billing">💳 Płatności i faktury</option>
                        <option value="business">💼 Współpraca B2B</option>
                        <option value="feedback">💡 Sugestie i feedback</option>
                        <option value="other">❓ Inne</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Wiadomość</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="6"
                        placeholder="Opisz swój problem lub pytanie. Im więcej szczegółów, tym szybciej będziemy mogli pomóc..."
                      ></textarea>
                    </div>

                    <button type="submit" className="submit-button">
                      <span>Wyślij wiadomość</span>
                      <span className="send-icon">📤</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* FAQ Quick Help */}
            <div className="quick-help">
              <h3 className="quick-help-title">⚡ Najczęstsze problemy</h3>
              <div className="faq-grid">
                <div className="faq-item">
                  <h4>CV się nie optymalizuje</h4>
                  <p>Sprawdź połączenie internetowe i odśwież stronę. Upewnij się, że CV ma co najmniej 50 słów.</p>
                </div>
                <div className="faq-item">
                  <h4>Problemy z płatnością</h4>
                  <p>Sprawdź status transakcji w banku. Płatności przetwarzane są przez Stripe - bezpiecznie i natychmiastowo.</p>
                </div>
                <div className="faq-item">
                  <h4>Nie otrzymałem zoptymalizowanego CV</h4>
                  <p>Sprawdź folder spam w emailu. CV wysyłamy w ciągu 2-3 minut od optymalizacji.</p>
                </div>
                <div className="faq-item">
                  <h4>Jak anulować subskrypcję?</h4>
                  <p>Napisz do nas na pomoccvperfect@gmail.com - anulujemy natychmiast, bez dodatkowych pytań.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .contact-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', sans-serif;
        }

        .contact-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 20px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-link {
          text-decoration: none;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-text {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .back-link {
          color: white;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.15);
          padding: 12px 24px;
          border-radius: 12px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-weight: 500;
        }

        .back-link:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        .contact-content {
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%);
          backdrop-filter: blur(20px);
          margin-top: -20px;
          border-radius: 30px 30px 0 0;
          min-height: calc(100vh - 100px);
          position: relative;
          z-index: 2;
        }

        .contact-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .contact-title {
          font-size: 52px;
          font-weight: 800;
          color: #1f2937;
          text-align: center;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .contact-subtitle {
          text-align: center;
          font-size: 20px;
          color: #6b7280;
          margin-bottom: 50px;
          line-height: 1.6;
        }

        .response-time {
          font-size: 16px;
          color: #059669;
          font-weight: 600;
          background: linear-gradient(135deg, #10b981, #059669);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-bottom: 80px;
        }

        .contact-info {
  background: rgba(248, 250, 252, 0.7);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .info-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 40px;
        }

        .contact-method {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .contact-method:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .contact-method.primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .method-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .method-content h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .contact-email {
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 18px;
        }

        .contact-method:not(.primary) .contact-email {
          color: #667eea;
        }

        .method-content p {
          margin: 4px 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .help-categories h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 20px;
        }

        .categories-grid {
          display: grid;
          gap: 16px;
        }

        .category-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .category-item:hover {
  background: rgba(255, 255, 255, 0.9) !important;
  transform: translateY(-3px) translateX(4px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15) !important;
  border: 2px solid rgba(102, 126, 234, 0.3) !important;
  transition: all 0.3s ease !important;
  cursor: pointer;
}

        .category-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .category-item strong {
          color: #1f2937;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }

        .category-item p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .contact-form-section {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .form-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
          color: #1f2937 !important;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          background: white;
        }

	
	.form-group input,
.form-group select,
.form-group textarea {
  color: #000000 !important;
  background: white !important;
  border: 2px solid #d1d5db !important;
  font-weight: 500;
  line-height: 1.6;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  color: #000000 !important;
  background: white !important;
  border-color: #667eea !important;
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea::placeholder {
  color: #9ca3af !important;
  font-weight: 400;
}

.form-group input {
  color: #000000 !important;
  background: white !important;
}

.form-group select {
  color: #000000 !important;
  background: white !important;
}

        .form-group textarea {
          resize: vertical;
          font-family: 'Inter', sans-serif;
        }

        .submit-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 18px 32px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }

        .success-message {
          text-align: center;
          padding: 40px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 16px;
        }

        .success-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .success-message h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .quick-help {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .quick-help-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 30px;
          text-align: center;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .faq-item {
          background: rgba(255, 255, 255, 0.8);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .faq-item h4 {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .faq-item p {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .contact-title {
            font-size: 36px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .contact-wrapper {
            padding: 40px 15px;
          }

          .contact-info,
          .contact-form-section {
            padding: 30px 20px;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }

          .header-content {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </>
  )
}