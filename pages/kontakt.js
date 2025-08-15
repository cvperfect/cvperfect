import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Kontakt() {
  const router = useRouter()
  const { locale } = router
  const [currentLanguage, setCurrentLanguage] = useState('pl')
  
  useEffect(() => {
    if (locale) setCurrentLanguage(locale)
  }, [locale])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'technical',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const translations = {
    pl: {
      title: 'Kontakt - CvPerfect | Pomoc i wsparcie techniczne',
      pageTitle: 'Kontakt',
      subtitle: 'Potrzebujesz pomocy? Jesteśmy tutaj dla Ciebie!',
      responseTime: 'Odpowiemy najszybciej jak to możliwe',
      backLink: '← Powrót na stronę główną',
      contactTitle: 'Skontaktuj się z nami',
      email: 'Email',
      quickResponse: 'Szybka odpowiedź',
      timezone: 'Strefa czasowa',
      poland: 'Polska (CET/CEST)',
      hours: 'Pon-Pt: 9:00-17:00',
      helpTitle: 'W czym możemy pomóc?',
      support: 'Wsparcie techniczne',
      supportDesc: 'Problemy z optymalizacją, błędy systemu',
      billing: 'Płatności i faktury',
      billingDesc: 'Problemy z płatnościami, anulowanie subskrypcji',
      business: 'Współpraca B2B',
      businessDesc: 'Oferty dla firm, rekruterów, partnerstwa',
      feedback: 'Sugestie i feedback',
      feedbackDesc: 'Pomysły na nowe funkcje, usprawnienia',
      formTitle: 'Napisz do nas',
      formName: 'Imię i nazwisko',
      formEmail: 'Adres email',
      formCategory: 'Kategoria zapytania',
      formMessage: 'Wiadomość',
      formPlaceholder: 'Opisz swój problem lub pytanie. Im więcej szczegółów, tym szybciej będziemy mogli pomóc...',
      send: 'Wyślij wiadomość',
      success: 'Wiadomość wysłana!',
      successDesc: 'Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe.',
      faqTitle: '⚡ Najczęstsze problemy',
      faq1Title: 'CV się nie optymalizuje',
      faq1Desc: 'Sprawdź połączenie internetowe i odśwież stronę. Upewnij się, że CV ma co najmniej 50 słów.',
      faq2Title: 'Problemy z płatnością',
      faq2Desc: 'Sprawdź status transakcji w banku. Płatności przetwarzane są przez Stripe - bezpiecznie i natychmiastowo.',
      faq3Title: 'Nie otrzymałem zoptymalizowanego CV',
      faq3Desc: 'Sprawdź folder spam w emailu. CV wysyłamy w ciągu 2-3 minut od optymalizacji.',
      faq4Title: 'Jak anulować subskrypcję?',
      faq4Desc: 'Napisz do nas na pomoccvperfect@gmail.com - anulujemy natychmiast, bez dodatkowych pytań.',
      other: 'Inne'
    },
    en: {
      title: 'Contact - CvPerfect | Help and technical support',
      pageTitle: 'Contact',
      subtitle: 'Need help? We are here for you!',
      responseTime: 'We will respond as soon as possible',
      backLink: '← Back to homepage',
      contactTitle: 'Contact us',
      email: 'Email',
      quickResponse: 'Quick response',
      timezone: 'Time zone',
      poland: 'Poland (CET/CEST)',
      hours: 'Mon-Fri: 9:00-17:00',
      helpTitle: 'How can we help?',
      support: 'Technical support',
      supportDesc: 'Optimization issues, system errors',
      billing: 'Payments and invoices',
      billingDesc: 'Payment issues, subscription cancellation',
      business: 'B2B cooperation',
      businessDesc: 'Company offers, recruiters, partnerships',
      feedback: 'Suggestions and feedback',
      feedbackDesc: 'Ideas for new features, improvements',
      formTitle: 'Write to us',
      formName: 'Full name',
      formEmail: 'Email address',
      formCategory: 'Query category',
      formMessage: 'Message',
      formPlaceholder: 'Describe your problem or question. The more details, the faster we can help...',
      send: 'Send message',
      success: 'Message sent!',
      successDesc: 'Thank you for contacting us. We will respond as soon as possible.',
      faqTitle: '⚡ Most common issues',
      faq1Title: 'CV is not optimizing',
      faq1Desc: 'Check your internet connection and refresh the page. Make sure your CV has at least 50 words.',
      faq2Title: 'Payment problems',
      faq2Desc: 'Check transaction status in your bank. Payments are processed by Stripe - securely and instantly.',
      faq3Title: 'I did not receive optimized CV',
      faq3Desc: 'Check your spam folder. We send CV within 2-3 minutes after optimization.',
      faq4Title: 'How to cancel subscription?',
      faq4Desc: 'Write to us at pomoccvperfect@gmail.com - we cancel immediately, no questions asked.',
      other: 'Other'
    }
  }

  const t = translations[currentLanguage]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    
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
        <title>{t.title}</title>
        <meta name="description" content={t.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">

{/* Animated emojis background */}
<div className="floating-emojis">
  <span className="emoji" style={{top: '10%', left: '5%', animationDelay: '0s'}}>📄</span>
  <span className="emoji" style={{top: '20%', right: '10%', animationDelay: '1s'}}>✨</span>
  <span className="emoji" style={{top: '30%', left: '15%', animationDelay: '2s'}}>🚀</span>
  <span className="emoji" style={{top: '40%', right: '20%', animationDelay: '3s'}}>💼</span>
  <span className="emoji" style={{top: '50%', left: '8%', animationDelay: '4s'}}>📊</span>
  <span className="emoji" style={{top: '60%', right: '5%', animationDelay: '5s'}}>🎯</span>
  <span className="emoji" style={{top: '70%', left: '20%', animationDelay: '6s'}}>💡</span>
  <span className="emoji" style={{top: '80%', right: '15%', animationDelay: '7s'}}>⭐</span>
</div>

        {/* Background podobny do regulamin.js */}
        <div className="particles-container" id="particles"></div>
{/* Animated Background */}
<div className="background-gradient">
  <div className="gradient-orb orb-1"></div>
  <div className="gradient-orb orb-2"></div>
  <div className="gradient-orb orb-3"></div>
</div>
        
        {/* Navigation */}
        <nav className="navigation">
          <div className="nav-content">
            <div className="logo" onClick={() => router.push('/')}>
              <span className="logo-badge">AI</span>
              <span className="logo-text">CvPerfect</span>
            </div>
            
            <div className="nav-links">
              <div className="language-switcher">
                <button 
                  className={`lang-btn ${currentLanguage === 'pl' ? 'active' : ''}`}
                  onClick={() => setCurrentLanguage('pl')}
                >
                  🇵🇱 PL
                </button>
                <button 
                  className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
                  onClick={() => setCurrentLanguage('en')}
                >
                  🇬🇧 EN
                </button>
              </div>
              <button className="nav-cta" onClick={() => router.push('/')}>
                {t.backLink}
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="contact-section">
          <div className="contact-header">
            <h1>{t.pageTitle}</h1>
            <p>{t.subtitle}<br/><span className="highlight">{t.responseTime}</span></p>
          </div>

          <div className="contact-grid">
            {/* Contact Information */}
            <div className="info-card">
              <h2>{t.contactTitle}</h2>
              
              <div className="contact-methods">
                <div className="method-card primary">
                  <div className="icon">📧</div>
                  <div className="content">
                    <h3>{t.email}</h3>
                    <a href="mailto:pomoccvperfect@gmail.com" className="email-link">
                      pomoccvperfect@gmail.com
                    </a>
                    <p>{t.quickResponse}</p>
                  </div>
                </div>

                <div className="method-card">
                  <div className="icon">🌍</div>
                  <div className="content">
                    <h3>{t.timezone}</h3>
                    <p>{t.poland}</p>
                    <p>{t.hours}</p>
                  </div>
                </div>
              </div>

              <div className="help-categories">
                <h3>{t.helpTitle}</h3>
                <div className="categories-grid">
                  <div className="category-card">
                    <span>🛠️</span>
                    <div>
                      <strong>{t.support}</strong>
                      <p>{t.supportDesc}</p>
                    </div>
                  </div>
                  <div className="category-card">
                    <span>💳</span>
                    <div>
                      <strong>{t.billing}</strong>
                      <p>{t.billingDesc}</p>
                    </div>
                  </div>
                  <div className="category-card">
                    <span>💼</span>
                    <div>
                      <strong>{t.business}</strong>
                      <p>{t.businessDesc}</p>
                    </div>
                  </div>
                  <div className="category-card">
                    <span>💡</span>
                    <div>
                      <strong>{t.feedback}</strong>
                      <p>{t.feedbackDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="form-card">
              <h2>{t.formTitle}</h2>
              
              {isSubmitted ? (
                <div className="success-message">
                  <div className="success-icon">✅</div>
                  <h3>{t.success}</h3>
                  <p>{t.successDesc}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>{t.formName}</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Jan Kowalski"
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.formEmail}</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="jan@example.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>{t.formCategory}</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="technical">🛠️ {t.support}</option>
                      <option value="billing">💳 {t.billing}</option>
                      <option value="business">💼 {t.business}</option>
                      <option value="feedback">💡 {t.feedback}</option>
                      <option value="other">❓ {t.other}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t.formMessage}</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder={t.formPlaceholder}
                    ></textarea>
                  </div>

                  <button type="submit" className="submit-btn">
                    <span>{t.send}</span>
                    <span>📤</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h3>{t.faqTitle}</h3>
            <div className="faq-grid">
              <div className="faq-card">
                <h4>{t.faq1Title}</h4>
                <p>{t.faq1Desc}</p>
              </div>
              <div className="faq-card">
                <h4>{t.faq2Title}</h4>
                <p>{t.faq2Desc}</p>
              </div>
              <div className="faq-card">
                <h4>{t.faq3Title}</h4>
                <p>{t.faq3Desc}</p>
              </div>
              <div className="faq-card">
                <h4>{t.faq4Title}</h4>
                <p>{t.faq4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
/* Reset to prevent gray rectangle */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:global(*) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:global(html) {
  overflow-x: hidden !important;
  max-width: 100vw !important;
}

:global(body) {
  margin: 0 !important;
  padding: 0 !important;
  overflow-x: hidden !important;
  max-width: 100vw !important;
  background: #0a0a0a !important;
}
        /* Background gradient animation like regulamin.js */
.container {
  min-height: 100vh;
  background: #0a0a0a;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: white;
  position: relative;
  overflow-x: hidden !important;
  overflow-y: auto;
  width: 100vw !important;
  max-width: 100vw !important;
  margin: 0 !important;
  padding: 0 !important;
}
        @keyframes gradientShift {
          0%, 100% { transform: rotate(0deg) scale(1); }
          33% { transform: rotate(120deg) scale(1.1); }
          66% { transform: rotate(240deg) scale(0.9); }
        }

        .container > * {
          position: relative;
          z-index: 1;
        }

        /* Particles container */
        .particles-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          opacity: 0.6;
	  background: transparent;
        }

/* Animated Background */
.background-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: #0a0a0a;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.7;
  animation: gradientShift 15s ease infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #7850ff, #ff5080);
  top: 40%;
  right: -100px;
  animation-delay: 5s;
}

.orb-3 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #50b4ff, #00ff88);
  bottom: -150px;
  left: 30%;
  animation-delay: 10s;
}

@keyframes gradientShift {
  0%, 100% { 
    transform: rotate(0deg) scale(1);
    opacity: 0.6;
  }
  33% { 
    transform: rotate(120deg) scale(1.1);
    opacity: 0.8;
  }
  66% { 
    transform: rotate(240deg) scale(0.9);
    opacity: 0.7;
  }
}

        /* Navigation - same as index.js */
        .navigation {
          background: rgba(8, 8, 8, 0.95);
          backdrop-filter: blur(30px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10000;
          transition: all 0.3s ease;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
        }

        .navigation::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(120, 80, 255, 0.8) 20%, 
            rgba(255, 80, 150, 0.8) 40%,
            rgba(80, 180, 255, 0.8) 60%,
            rgba(0, 255, 136, 0.8) 80%,
            transparent 100%
          );
          animation: borderFlow 4s ease infinite;
        }

        @keyframes borderFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo-text {
          font-size: 26px;
          font-weight: 900;
          background: linear-gradient(135deg, #7850ff, #ff5080, #50b4ff);
          background-size: 200% 200%;
          animation: gradientMove 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

.logo-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  animation: pulse 2s ease infinite;
}

.nav-cta {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 100px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.lang-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3); }
          50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(120, 80, 255, 0.5); }
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .language-switcher {
          display: flex;
          gap: 8px;
        }

        .lang-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          padding: 8px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .lang-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateY(-2px);
        }

        .lang-btn.active {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3);
        }

        .nav-cta {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(120, 80, 255, 0.3);
        }

        .nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(120, 80, 255, 0.5);
        }

        /* Contact Section */
.contact-section {
  padding: 140px 20px 80px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
}
        .contact-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .contact-header h1 {
          font-size: 56px;
          font-weight: 900;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #7850ff, #ff5080, #50b4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -1px;
        }

        .contact-header p {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }

        .highlight {
          color: #00ff88;
          font-weight: 600;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 80px;
        }

        .info-card, .form-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 48px;
          transition: all 0.4s ease;
        }

        .info-card:hover, .form-card:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(120, 80, 255, 0.2);
          transform: translateY(-5px);
          box-shadow: 0 30px 60px rgba(120, 80, 255, 0.1);
        }

        h2 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 32px;
          color: white;
        }

        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }

        .method-card {
          display: flex;
          gap: 20px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .method-card:hover {
          transform: translateX(5px);
          border-color: rgba(120, 80, 255, 0.3);
        }

        .method-card.primary {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 204, 112, 0.1));
          border-color: rgba(0, 255, 136, 0.2);
        }

        .method-card .icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .method-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: white;
        }

        .email-link {
          color: #00ff88;
          text-decoration: none;
          font-size: 18px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .email-link:hover {
          text-decoration: underline;
        }

        .method-card p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin: 4px 0;
        }

        .help-categories h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 24px;
          color: white;
        }

        .categories-grid {
          display: grid;
          gap: 16px;
        }

        .category-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }

.category-card:hover {
  background: rgba(120, 80, 255, 0.1);
  transform: translateX(5px) translateY(-2px);
  border-color: rgba(120, 80, 255, 0.4);
  box-shadow: 0 8px 32px rgba(120, 80, 255, 0.15);
}
        .category-card span {
          font-size: 24px;
          flex-shrink: 0;
        }

        .category-card strong {
          display: block;
          color: white;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .category-card p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin: 0;
        }

        /* Form Styles */
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
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 8px;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 16px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          transition: all 0.3s ease;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: rgba(120, 80, 255, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(120, 80, 255, 0.15);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .submit-btn {
          background: linear-gradient(135deg, #00ff88, #00cc70);
          color: #000;
          border: none;
          padding: 18px 40px;
          border-radius: 100px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 40px rgba(0, 255, 136, 0.3);
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 50px rgba(0, 255, 136, 0.4);
        }

        .success-message {
          text-align: center;
          padding: 60px;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 204, 112, 0.1));
          border-radius: 20px;
          border: 2px solid rgba(0, 255, 136, 0.3);
        }

        .success-icon {
          font-size: 64px;
          margin-bottom: 24px;
        }

        .success-message h3 {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 12px;
          color: #00ff88;
        }

        .success-message p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
        }

        /* FAQ Section */
        .faq-section {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          padding: 48px;
        }

        .faq-section h3 {
          font-size: 32px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
.faq-card {
          background: rgba(255, 255, 255, 0.03);
          padding: 24px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .faq-card:hover {
          transform: translateY(-3px);
          border-color: rgba(120, 80, 255, 0.3);
          background: rgba(255, 255, 255, 0.05);
        }

        .faq-card h4 {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 12px;
        }

        .faq-card p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .contact-section {
            padding: 100px 20px 40px;
          }

          .contact-header h1 {
            font-size: 36px;
          }

          .contact-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .info-card, .form-card {
            padding: 30px 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }

          .nav-content {
            padding: 16px 20px;
          }

          .logo-text {
            font-size: 20px;
          }

          .nav-links {
            gap: 12px;
          }

          .nav-cta {
            padding: 10px 20px;
            font-size: 14px;
          }
        }

        /* Ensure no scrollbar */
        :global(html) {
          overflow-x: hidden !important;
        }

        :global(body) {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
        }

/* Force remove any scrollbars */
:global(html::-webkit-scrollbar) {
  width: 0 !important;
  display: none !important;
}

:global(body::-webkit-scrollbar) {
  width: 0 !important;
  display: none !important;
}

/* Ensure no elements overflow */
:global(.container *) {
  max-width: 100% !important;
}

/* Floating Emojis - Fixed */
.floating-emojis {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.emoji {
  position: absolute;
  font-size: 28px;
  opacity: 0.4;
  animation: float 25s infinite linear;
  filter: blur(0.3px);
  will-change: transform;
}

@keyframes float {
  0% {
    transform: translateY(100vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.4;
  }
  90% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(-100px) translateX(30px) rotate(360deg);
    opacity: 0;
  }
}

/* Different timings for each emoji */
.emoji:nth-child(1) { animation-delay: 0s; }
.emoji:nth-child(2) { animation-delay: 3s; animation-duration: 22s; }
.emoji:nth-child(3) { animation-delay: 6s; animation-duration: 28s; }
.emoji:nth-child(4) { animation-delay: 9s; animation-duration: 24s; }
.emoji:nth-child(5) { animation-delay: 12s; animation-duration: 26s; }
.emoji:nth-child(6) { animation-delay: 15s; animation-duration: 23s; }
.emoji:nth-child(7) { animation-delay: 18s; animation-duration: 27s; }
.emoji:nth-child(8) { animation-delay: 21s; animation-duration: 25s; }
/* Different animation for each emoji */
.emoji:nth-child(even) {
  animation-direction: reverse;
  animation-duration: 25s;
}

.emoji:nth-child(3n) {
  animation-duration: 30s;
  animation-delay: -5s;
}

      `}</style>
    </>
  )
}