import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Footer from '../components/Footer'

export default function Kontakt() {
  const router = useRouter()
  const { locale } = router
  const [currentLanguage, setCurrentLanguage] = useState('pl')
  const [activeTab, setActiveTab] = useState('form')
  const [isScrolled, setIsScrolled] = useState(false)
  const canvasRef = useRef(null)
  const mousePosition = useRef({ x: 0, y: 0 })
  
  useEffect(() => {
    if (locale) setCurrentLanguage(locale)
  }, [locale])

  // 3D Particles Animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    const particles = []
    const particleCount = 100
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.z = Math.random() * 1000
        this.size = Math.random() * 2
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.speedZ = Math.random() * 1
        this.opacity = Math.random() * 0.5 + 0.2
      }
      
      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.z -= this.speedZ
        
        // Mouse interaction
        const dx = this.x - mousePosition.current.x
        const dy = this.y - mousePosition.current.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          const force = (100 - distance) / 100
          this.x += dx * force * 0.05
          this.y += dy * force * 0.05
        }
        
        // Reset particle if it goes off screen
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
        if (this.z <= 0) {
          this.z = 1000
          this.x = Math.random() * canvas.width
          this.y = Math.random() * canvas.height
        }
      }
      
      draw() {
        const scale = (1000 - this.z) / 1000
        const size = this.size * scale * 2
        
        ctx.save()
        ctx.globalAlpha = this.opacity * scale
        
        // Gradient effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size)
        gradient.addColorStop(0, 'rgba(120, 80, 255, 1)')
        gradient.addColorStop(0.5, 'rgba(255, 80, 150, 0.5)')
        gradient.addColorStop(1, 'rgba(80, 180, 255, 0)')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }
    
    // Animation loop
    let animationId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 150) {
            ctx.save()
            ctx.globalAlpha = (1 - distance / 150) * 0.1
            ctx.strokeStyle = 'rgba(120, 80, 255, 0.5)'
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
            ctx.restore()
          }
        })
        
        particle.update()
        particle.draw()
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    // Handle mouse move
    const handleMouseMove = (e) => {
      mousePosition.current = { x: e.clientX, y: e.clientY }
    }
    
    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'technical',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const translations = {
    pl: {
      title: 'Kontakt - CvPerfect | Centrum Wsparcia Premium',
      pageTitle: 'Centrum Kontaktu',
      subtitle: 'Jesteśmy tutaj, aby pomóc Ci osiągnąć sukces',
      instantSupport: 'Natychmiastowe wsparcie',
      expertTeam: 'Zespół ekspertów',
      availability: '24/7 Dostępność',
      backLink: '← Powrót',
      
      // Tabs
      tabForm: 'Formularz kontaktowy',
      tabSupport: 'Centrum wsparcia',
      tabBusiness: 'Współpraca B2B',
      
      // Form section
      formTitle: 'Skontaktuj się z nami',
      formSubtitle: 'Wypełnij formularz, a odpowiemy w ciągu 24h',
      formName: 'Imię i nazwisko',
      formEmail: 'Email służbowy',
      formCompany: 'Firma (opcjonalnie)',
      formCategory: 'Kategoria',
      formMessage: 'Twoja wiadomość',
      formPlaceholder: 'Opisz szczegółowo, w czym możemy Ci pomóc...',
      send: 'Wyślij wiadomość',
      sending: 'Wysyłanie...',
      
      // Categories
      technical: '🛠️ Wsparcie techniczne',
      billing: '💳 Płatności i faktury',
      business: '💼 Współpraca biznesowa',
      feature: '✨ Nowe funkcje',
      other: '📋 Inne',
      
      // Support Center
      supportTitle: 'Centrum Wsparcia 24/7',
      supportSubtitle: 'Rozwiązania najczęstszych problemów',
      
      faq1: 'Jak działa optymalizacja AI?',
      faq1Desc: 'Nasza sztuczna inteligencja analizuje Twoje CV pod kątem ATS, słów kluczowych i struktury, dostosowując je do wymogów rekruterów.',
      
      faq2: 'Czy moje dane są bezpieczne?',
      faq2Desc: 'Tak! Stosujemy szyfrowanie SSL i nie przechowujemy Twoich danych dłużej niż 24h. Zgodność z RODO.',
      
      faq3: 'Jak szybko otrzymam wynik?',
      faq3Desc: 'Optymalizacja trwa 2-3 minuty. Otrzymasz powiadomienie email z gotowym CV.',
      
      faq4: 'Mogę anulować subskrypcję?',
      faq4Desc: 'Oczywiście! Anulowanie jest natychmiastowe, bez ukrytych kosztów.',
      
      // Business section
      businessTitle: 'Rozwiązania dla Biznesu',
      businessSubtitle: 'Skrojone na miarę pakiety dla firm',
      
      package1: 'Startup',
      package1Desc: 'Do 10 pracowników',
      package1Feature1: '✓ Nielimitowane optymalizacje',
      package1Feature2: '✓ Panel administracyjny',
      package1Feature3: '✓ Wsparcie email',
      
package2: 'Custom',
package2Desc: 'Rozwiązania na miarę',
package2Feature1: '✓ Wszystko ze Startup',
package2Feature2: '✓ Pełna personalizacja',
package2Feature3: '✓ Integracja API',
      
      contactBusiness: 'Zapytaj o ofertę',
      
      // Success message
      success: 'Wiadomość wysłana!',
      successDesc: 'Dziękujemy za kontakt. Nasz zespół odpowie najszybciej jak to możliwe.',
      
      // Contact info
      quickContact: 'Szybki kontakt',
      emailLabel: 'Email',
      emailValue: 'pomoc@cvperfect.pl',
      responseTime: 'Czas odpowiedzi',
      responseValue: '< 24 godziny',
      availability: 'Dostępność',
      availabilityValue: 'Pon-Pt 9:00-17:00'
    },
    en: {
      title: 'Contact - CvPerfect | Premium Support Center',
      pageTitle: 'Contact Center',
      subtitle: 'We are here to help you succeed',
      instantSupport: 'Instant support',
      expertTeam: 'Expert team',
      availability: '24/7 Availability',
      backLink: '← Back',
      
      // Tabs
      tabForm: 'Contact form',
      tabSupport: 'Support center',
      tabBusiness: 'B2B Partnership',
      
      // Form section
      formTitle: 'Get in touch',
      formSubtitle: 'Fill the form and we\'ll respond within 24h',
      formName: 'Full name',
      formEmail: 'Business email',
      formCompany: 'Company (optional)',
      formCategory: 'Category',
      formMessage: 'Your message',
      formPlaceholder: 'Describe in detail how we can help you...',
      send: 'Send message',
      sending: 'Sending...',
      
      // Categories
      technical: '🛠️ Technical support',
      billing: '💳 Payments and invoices',
      business: '💼 Business cooperation',
      feature: '✨ New features',
      other: '📋 Other',
      
      // Support Center
      supportTitle: '24/7 Support Center',
      supportSubtitle: 'Solutions to common problems',
      
      faq1: 'How does AI optimization work?',
      faq1Desc: 'Our AI analyzes your CV for ATS compatibility, keywords, and structure, adapting it to recruiter requirements.',
      
      faq2: 'Is my data secure?',
      faq2Desc: 'Yes! We use SSL encryption and don\'t store your data for more than 24h. GDPR compliant.',
      
      faq3: 'How fast will I get results?',
      faq3Desc: 'Optimization takes 2-3 minutes. You\'ll receive an email notification with your ready CV.',
      
      faq4: 'Can I cancel subscription?',
      faq4Desc: 'Of course! Cancellation is immediate, no hidden costs.',
      
      // Business section
      businessTitle: 'Business Solutions',
      businessSubtitle: 'Tailored packages for companies',
      
      package1: 'Startup',
      package1Desc: 'Up to 10 employees',
      package1Feature1: '✓ Unlimited optimizations',
      package1Feature2: '✓ Admin panel',
      package1Feature3: '✓ Email support',
      
package2: 'Custom',
package2Desc: 'Tailored solutions',
package2Feature1: '✓ Everything from Startup',
package2Feature2: '✓ Full personalization',
package2Feature3: '✓ API integration',
      
      contactBusiness: 'Request offer',
      
      // Success message
      success: 'Message sent!',
      successDesc: 'Thank you for contacting us. Our team will respond as soon as possible.',
      
      // Contact info
      quickContact: 'Quick contact',
      emailLabel: 'Email',
      emailValue: 'support@cvperfect.pl',
      responseTime: 'Response time',
      responseValue: '< 24 hours',
      availability: 'Availability',
      availabilityValue: 'Mon-Fri 9:00-17:00'
    }
  }

  const t = translations[currentLanguage]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call with animation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', company: '', subject: 'technical', message: '' })
    }, 5000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

const handlePackageSelect = (packageType) => {
  setActiveTab('form')
  setFormData({
    ...formData,
    subject: 'business',
    message: `Jestem zainteresowany pakietem ${packageType}. Proszę o kontakt w sprawie szczegółów i wyceny.`
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
        {/* 3D Particles Canvas */}
        <canvas ref={canvasRef} className="particles-canvas" />
        
        {/* Animated Background Gradients */}
        <div className="background-effects">
          <div className="gradient-sphere sphere-1"></div>
          <div className="gradient-sphere sphere-2"></div>
          <div className="gradient-sphere sphere-3"></div>
          <div className="glow-line line-1"></div>
          <div className="glow-line line-2"></div>
        </div>
        
        {/* Navigation */}
        <nav className={`navigation ${isScrolled ? 'scrolled' : ''}`}>
          <div className="nav-content">
            <div className="logo" onClick={() => router.push('/')}>
              <div className="logo-icon">
                <span className="logo-badge">AI</span>
              </div>
              <span className="logo-text">CvPerfect</span>
            </div>
            
            <div className="nav-links">
              <div className="language-switcher">
                <button 
                  className={`lang-btn ${currentLanguage === 'pl' ? 'active' : ''}`}
                  onClick={() => setCurrentLanguage('pl')}
                >
                  <span className="flag">🇵🇱</span> PL
                </button>
                <button 
                  className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
                  onClick={() => setCurrentLanguage('en')}
                >
                  <span className="flag">🇬🇧</span> EN
                </button>
              </div>
              <button className="nav-cta" onClick={() => router.push('/')}>
                <span>{t.backLink}</span>
                <svg className="cta-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 10L12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              <span>{t.availability}</span>
            </div>
            <h1 className="hero-title">
              <span className="title-gradient">{t.pageTitle}</span>
            </h1>
            <p className="hero-subtitle">{t.subtitle}</p>
            
            <div className="hero-features">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <span>{t.instantSupport}</span>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <span>{t.expertTeam}</span>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌍</div>
                <span>{t.availability}</span>
              </div>
            </div>
          </div>
          
          <div className="scroll-indicator">
            <div className="scroll-dot"></div>
          </div>
        </section>

        {/* Main Content with Tabs */}
        <section className="main-content">
          <div className="tabs-container">
            <div className="tabs-header">
              <button 
                className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
                onClick={() => setActiveTab('form')}
              >
                <span className="tab-icon">✉️</span>
                <span>{t.tabForm}</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`}
                onClick={() => setActiveTab('support')}
              >
                <span className="tab-icon">🛡️</span>
                <span>{t.tabSupport}</span>
              </button>
              <button 
                className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
                onClick={() => setActiveTab('business')}
              >
                <span className="tab-icon">🚀</span>
                <span>{t.tabBusiness}</span>
              </button>
            </div>

            <div className="tabs-content">
              {/* Contact Form Tab */}
              {activeTab === 'form' && (
                <div className="tab-panel form-panel">
                  <div className="panel-grid">
                    <div className="form-section">
                      <h2 className="section-title">{t.formTitle}</h2>
                      <p className="section-subtitle">{t.formSubtitle}</p>
                      
                      {isSubmitted ? (
                        <div className="success-container">
                          <div className="success-animation">
                            <div className="checkmark-circle">
                              <svg className="checkmark" viewBox="0 0 52 52">
                                <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
                                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                              </svg>
                            </div>
                          </div>
                          <h3>{t.success}</h3>
                          <p>{t.successDesc}</p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="contact-form">
                          <div className="form-grid">
                            <div className="form-field">
                              <label>{t.formName}</label>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="form-input"
                              />
                              <div className="field-focus"></div>
                            </div>
                            
                            <div className="form-field">
                              <label>{t.formEmail}</label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="form-input"
                              />
                              <div className="field-focus"></div>
                            </div>
                          </div>

                          <div className="form-field">
                            <label>{t.formCompany}</label>
                            <input
                              type="text"
                              name="company"
                              value={formData.company}
                              onChange={handleChange}
                              className="form-input"
                            />
                            <div className="field-focus"></div>
                          </div>

                          <div className="form-field">
                            <label>{t.formCategory}</label>
                            <select
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              required
                              className="form-select"
                            >
                              <option value="technical">{t.technical}</option>
                              <option value="billing">{t.billing}</option>
                              <option value="business">{t.business}</option>
                              <option value="feature">{t.feature}</option>
                              <option value="other">{t.other}</option>
                            </select>
                            <div className="field-focus"></div>
                          </div>

                          <div className="form-field">
                            <label>{t.formMessage}</label>
                            <textarea
                              name="message"
                              value={formData.message}
                              onChange={handleChange}
                              required
                              rows="5"
                              placeholder={t.formPlaceholder}
                              className="form-textarea"
                            ></textarea>
                            <div className="field-focus"></div>
                          </div>

                          <button 
                            type="submit" 
                            className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                            disabled={isSubmitting}
                          >
                            <span className="btn-text">
                              {isSubmitting ? t.sending : t.send}
                            </span>
                            <span className="btn-icon">
                              {isSubmitting ? '⏳' : '🚀'}
                            </span>
                          </button>
                        </form>
                      )}
                    </div>
                    
                    <div className="info-section">
                      <div className="info-card premium-card">
                        <h3>{t.quickContact}</h3>
                        <div className="info-items">
                          <div className="info-item">
                            <span className="info-label">{t.emailLabel}</span>
                            <a href="mailto:pomoc@cvperfect.pl" className="info-value email-link">
                              {t.emailValue}
                            </a>
                          </div>
                          <div className="info-item">
                            <span className="info-label">{t.responseTime}</span>
                            <span className="info-value">{t.responseValue}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">{t.availability}</span>
                            <span className="info-value">{t.availabilityValue}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="decorative-card">
                        <div className="card-glow"></div>
                        <div className="card-content">
                          <div className="floating-icons">
                            <span className="float-icon">💬</span>
                            <span className="float-icon">📧</span>
                            <span className="float-icon">🎯</span>
                            <span className="float-icon">✨</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Support Center Tab */}
              {activeTab === 'support' && (
                <div className="tab-panel support-panel">
                  <div className="support-header">
                    <h2 className="section-title">{t.supportTitle}</h2>
                    <p className="section-subtitle">{t.supportSubtitle}</p>
                  </div>
                  
                  <div className="faq-grid">
                    <div className="faq-card">
                      <div className="faq-icon">🤖</div>
                      <h3>{t.faq1}</h3>
                      <p>{t.faq1Desc}</p>
                      <div className="card-shine"></div>
                    </div>
                    
                    <div className="faq-card">
                      <div className="faq-icon">🔒</div>
                      <h3>{t.faq2}</h3>
                      <p>{t.faq2Desc}</p>
                      <div className="card-shine"></div>
                    </div>
                    
                    <div className="faq-card">
                      <div className="faq-icon">⚡</div>
                      <h3>{t.faq3}</h3>
                      <p>{t.faq3Desc}</p>
                      <div className="card-shine"></div>
                    </div>
                    
                    <div className="faq-card">
                      <div className="faq-icon">❌</div>
                      <h3>{t.faq4}</h3>
                      <p>{t.faq4Desc}</p>
                      <div className="card-shine"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Tab */}
              {activeTab === 'business' && (
                <div className="tab-panel business-panel">
                  <div className="business-header">
                    <h2 className="section-title">{t.businessTitle}</h2>
                    <p className="section-subtitle">{t.businessSubtitle}</p>
                  </div>
                  
                  <div className="packages-grid">
                    <div className="package-card">
                      <div className="package-header">
                        <h3>{t.package1}</h3>
                        <p>{t.package1Desc}</p>
                      </div>
                      <div className="package-features">
                        <div className="feature">{t.package1Feature1}</div>
                        <div className="feature">{t.package1Feature2}</div>
                        <div className="feature">{t.package1Feature3}</div>
                      </div>
<button 
  className="package-btn primary"
  onClick={() => handlePackageSelect('Startup')}
>
  {t.contactBusiness}
</button>
                    </div>
                    
                    <div className="package-card featured">
                      <div className="featured-badge">POPULAR</div>
                      <div className="package-header">
                        <h3>{t.package2}</h3>
                        <p>{t.package2Desc}</p>
                      </div>
                      <div className="package-features">
                        <div className="feature">{t.package2Feature1}</div>
                        <div className="feature">{t.package2Feature2}</div>
                        <div className="feature">{t.package2Feature3}</div>
                      </div>
<button 
  className="package-btn primary"
  onClick={() => handlePackageSelect('Custom')}
>
  {t.contactBusiness}
</button>
                    </div>
                    
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
	</div>
        <Footer currentLanguage={currentLanguage} />




      <style jsx>{`
        /* Global Reset */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :global(html), :global(body) {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background: #0a0a0a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Container */
.container {
  min-height: 100vh;
  background: #0a0a0a;
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  max-width: 100vw;
}
        /* 3D Particles Canvas */
        .particles-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        /* Background Effects */
        .background-effects {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
        }

        .gradient-sphere {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: floatSphere 20s ease-in-out infinite;
        }

        .sphere-1 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #7850ff, #ff5080);
          top: -200px;
          right: -200px;
          animation-delay: 0s;
        }

        .sphere-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #50b4ff, #00ff88);
          bottom: -100px;
          left: -100px;
          animation-delay: 7s;
        }

        .sphere-3 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #ff5080, #ffd700);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 14s;
        }

        .glow-line {
          position: absolute;
          height: 1px;
          width: 100%;
          background: linear-gradient(90deg, transparent, rgba(120, 80, 255, 0.5), transparent);
          animation: glowMove 8s linear infinite;
        }

        .line-1 {
          top: 30%;
          animation-delay: 0s;
        }

        .line-2 {
          top: 70%;
          animation-delay: 4s;
        }

        @keyframes floatSphere {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes glowMove {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        /* Navigation */
        .navigation {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .navigation.scrolled {
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(30px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
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

        .logo-icon {
          position: relative;
        }

        .logo-badge {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          padding: 8px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          box-shadow: 0 4px 20px rgba(120, 80, 255, 0.4);
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(120, 80, 255, 0.4);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 30px rgba(120, 80, 255, 0.6);
          }
        }

        .logo-text {
          font-size: 26px;
          font-weight: 900;
          background: linear-gradient(135deg, #fff, #999);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .language-switcher {
          display: flex;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 100px;
        }

        .lang-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          padding: 10px 16px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lang-btn:hover {
          color: white;
        }

        .lang-btn.active {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3);
        }

        .flag {
          font-size: 18px;
        }

        .nav-cta {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 20px rgba(120, 80, 255, 0.3);
        }

        .nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(120, 80, 255, 0.5);
        }

        .cta-arrow {
          transition: transform 0.3s ease;
        }

        .nav-cta:hover .cta-arrow {
          transform: rotate(180deg);
        }

        /* Hero Section */
        .hero-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 120px 40px 80px;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          text-align: center;
          max-width: 900px;
          animation: fadeInUp 1s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          padding: 8px 20px;
          border-radius: 100px;
          margin-bottom: 24px;
          animation: fadeIn 1s ease 0.2s both;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: #00ff88;
          border-radius: 50%;
          animation: blink 2s ease infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .hero-title {
          font-size: clamp(48px, 8vw, 80px);
          font-weight: 900;
          margin-bottom: 24px;
          line-height: 1.1;
          animation: fadeInUp 1s ease 0.3s both;
        }

        .title-gradient {
          background: linear-gradient(135deg, #7850ff, #ff5080, #50b4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradientMove 4s ease infinite;
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .hero-subtitle {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 48px;
          animation: fadeInUp 1s ease 0.4s both;
        }

        .hero-features {
          display: flex;
          gap: 24px;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeInUp 1s ease 0.5s both;
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px 24px;
          border-radius: 100px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-3px);
          border-color: rgba(120, 80, 255, 0.3);
        }

        .feature-icon {
          font-size: 24px;
        }

        .scroll-indicator {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          animation: bounce 2s ease infinite;
        }

        .scroll-dot {
          width: 30px;
          height: 50px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          position: relative;
        }

        .scroll-dot::after {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 10px;
          background: white;
          border-radius: 2px;
          animation: scrollDot 2s ease infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(10px);
          }
        }

        @keyframes scrollDot {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateX(-50%) translateY(10px);
            opacity: 0.3;
          }
        }

        /* Main Content */
.main-content {
  position: relative;
  z-index: 2;
  padding: 80px 20px;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}
        /* Tabs */
        .tabs-container {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          overflow: hidden;
        }

        .tabs-header {
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          padding: 8px;
          gap: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          padding: 16px 24px;
          border-radius: 24px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          box-shadow: 0 4px 20px rgba(120, 80, 255, 0.3);
        }

        .tab-icon {
          font-size: 20px;
        }

.tabs-content {
  padding: 48px 24px;
  max-width: 100%;
  margin: 0 auto;
}

        .tab-panel {
          animation: fadeIn 0.5s ease;
        }

        /* Form Panel */
        .panel-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 48px;
        }

        .section-title {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #fff, #999);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-subtitle {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 32px;
        }

        /* Form Styles */
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-field {
          position: relative;
        }

        .form-field label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
        }

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 16px;
  background: rgba(120, 80, 255, 0.08);
  border: 2px solid rgba(120, 80, 255, 0.15);
  border-radius: 16px;
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
  font-family: inherit;
  backdrop-filter: blur(10px);
}

/* Style dla selecta */
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 50px;
  cursor: pointer;
}

/* Style dla opcji w dropdown */
.form-select option {
  background: rgba(10, 10, 10, 0.95);
  color: white;
  padding: 12px;
  border: none;
}

.form-select option:hover,
.form-select option:focus {
  background: rgba(120, 80, 255, 0.3);
  color: white;
}

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(120, 80, 255, 0.5);
        }

        .field-focus {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #7850ff, transparent);
          transition: transform 0.3s ease;
          border-radius: 2px;
        }

        .form-input:focus ~ .field-focus,
        .form-select:focus ~ .field-focus,
        .form-textarea:focus ~ .field-focus {
          transform: translateX(-50%) scaleX(1);
        }

        .form-textarea {
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
          gap: 12px;
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }

        .submit-btn:hover::before {
          width: 300px;
          height: 300px;
        }

        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(0, 255, 136, 0.4);
        }

        .submit-btn.submitting {
          background: linear-gradient(135deg, #999, #666);
          cursor: not-allowed;
        }

        .btn-text,
        .btn-icon {
          position: relative;
          z-index: 1;
        }

        /* Success Container */
        .success-container {
          text-align: center;
          padding: 60px;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 204, 112, 0.05));
          border-radius: 24px;
          border: 2px solid rgba(0, 255, 136, 0.3);
        }

        .success-animation {
          margin-bottom: 24px;
        }

        .checkmark-circle {
          width: 80px;
          height: 80px;
          margin: 0 auto;
        }

        .checkmark {
          width: 80px;
          height: 80px;
        }

        .checkmark-circle-bg {
          stroke: #00ff88;
          stroke-width: 2;
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          animation: strokeCircle 0.6s ease forwards;
        }

        .checkmark-check {
          stroke: #00ff88;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: strokeCheck 0.3s 0.5s ease forwards;
        }

        @keyframes strokeCircle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes strokeCheck {
          to {
            stroke-dashoffset: 0;
          }
        }

        .success-container h3 {
          font-size: 28px;
          color: #00ff88;
          margin-bottom: 12px;
        }

        .success-container p {
          color: rgba(255, 255, 255, 0.8);
        }

        /* Info Section */
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 32px;
          transition: all 0.3s ease;
        }

        .premium-card {
          background: linear-gradient(135deg, rgba(120, 80, 255, 0.1), rgba(255, 80, 150, 0.05));
          border-color: rgba(120, 80, 255, 0.2);
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(120, 80, 255, 0.1);
        }

        .info-card h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .info-items {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .info-value {
          font-size: 16px;
          color: white;
          font-weight: 600;
        }

        .email-link {
          color: #00ff88;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .email-link:hover {
          text-decoration: underline;
        }

        .decorative-card {
          background: linear-gradient(135deg, rgba(80, 180, 255, 0.1), rgba(0, 255, 136, 0.05));
          border: 1px solid rgba(80, 180, 255, 0.2);
          border-radius: 24px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          min-height: 200px;
        }

        .card-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(120, 80, 255, 0.3), transparent);
          animation: glowPulse 4s ease infinite;
        }

        @keyframes glowPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.3;
          }
        }

        .floating-icons {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 100%;
        }

        .float-icon {
          font-size: 32px;
          animation: floatIcon 3s ease infinite;
          animation-delay: calc(var(--i) * 0.5s);
        }

        .float-icon:nth-child(1) { --i: 0; }
        .float-icon:nth-child(2) { --i: 1; }
        .float-icon:nth-child(3) { --i: 2; }
        .float-icon:nth-child(4) { --i: 3; }

        @keyframes floatIcon {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* Support Panel */
        .support-panel {
          text-align: center;
        }

        .support-header {
          margin-bottom: 48px;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .faq-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 32px;
          text-align: left;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-card:hover {
          transform: translateY(-5px) scale(1.02);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(120, 80, 255, 0.3);
        }

        .faq-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }

        .faq-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 12px;
          color: white;
        }

        .faq-card p {
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
        }

        .card-shine {
          position: absolute;
          top: -100%;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 70%
          );
          transition: all 0.6s ease;
        }

        .faq-card:hover .card-shine {
          top: 100%;
          left: 100%;
        }

        /* Business Panel */
        .business-panel {
          text-align: center;
        }

        .business-header {
          margin-bottom: 48px;
        }

.packages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  max-width: 800px;
  margin: 0 auto;
}
        .package-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px 32px;
          position: relative;
          transition: all 0.3s ease;
        }

        .package-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(120, 80, 255, 0.2);
        }

        .package-card.featured {
          background: linear-gradient(135deg, rgba(120, 80, 255, 0.1), rgba(255, 80, 150, 0.05));
          border-color: rgba(120, 80, 255, 0.3);
          transform: scale(1.05);
        }

        .featured-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          padding: 6px 20px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .package-header h3 {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .package-header p {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 32px;
        }

        .package-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .feature {
          text-align: left;
          color: rgba(255, 255, 255, 0.8);
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .package-card:hover .feature {
          background: rgba(255, 255, 255, 0.05);
        }

        .package-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 16px 32px;
          border-radius: 100px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .package-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .package-btn.primary {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          border: none;
          box-shadow: 0 10px 30px rgba(120, 80, 255, 0.3);
        }

        .package-btn.primary:hover {
          box-shadow: 0 15px 40px rgba(120, 80, 255, 0.5);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .panel-grid {
            grid-template-columns: 1fr;
          }
          
          .packages-grid {
            grid-template-columns: 1fr;
          }
          
          .package-card.featured {
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .nav-content {
            padding: 16px 20px;
          }

          .hero-section {
            padding: 100px 20px 60px;
          }

          .hero-title {
            font-size: 40px;
          }

          .hero-features {
            flex-direction: column;
            align-items: center;
          }

          .main-content {
            padding: 40px 20px;
          }

          .tabs-header {
            flex-direction: column;
          }

          .tab-btn {
            width: 100%;
          }

          .tabs-content {
            padding: 24px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }

          .gradient-sphere {
            filter: blur(60px);
          }

          .sphere-1 {
            width: 300px;
            height: 300px;
          }

          .sphere-2 {
            width: 200px;
            height: 200px;
          }

          .sphere-3 {
            width: 250px;
            height: 250px;
          }
        }

        /* Animations on Scroll */
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Scroll Animations */
        .form-section {
          animation: slideInLeft 0.8s ease;
        }

        .info-section {
          animation: slideInRight 0.8s ease;
        }

        .faq-card {
          animation: scaleIn 0.6s ease;
          animation-fill-mode: both;
        }

        .faq-card:nth-child(1) { animation-delay: 0.1s; }
        .faq-card:nth-child(2) { animation-delay: 0.2s; }
        .faq-card:nth-child(3) { animation-delay: 0.3s; }
        .faq-card:nth-child(4) { animation-delay: 0.4s; }

        .package-card {
          animation: scaleIn 0.6s ease;
          animation-fill-mode: both;
        }

        .package-card:nth-child(1) { animation-delay: 0.1s; }
        .package-card:nth-child(2) { animation-delay: 0.2s; }
        .package-card:nth-child(3) { animation-delay: 0.3s; }

        /* Custom Scrollbar */
        :global(::-webkit-scrollbar) {
          width: 10px;
        }

        :global(::-webkit-scrollbar-track) {
          background: rgba(255, 255, 255, 0.05);
        }

        :global(::-webkit-scrollbar-thumb) {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          border-radius: 10px;
        }

        :global(::-webkit-scrollbar-thumb:hover) {
          background: linear-gradient(135deg, #9060ff, #ff6090);
        }

        /* Loading Animation */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #7850ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Glow Effects */
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(120, 80, 255, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(120, 80, 255, 0.8);
          }
        }

        /* Accessibility */
        .form-input:focus-visible,
        .form-select:focus-visible,
        .form-textarea:focus-visible,
        .tab-btn:focus-visible,
        .submit-btn:focus-visible,
        .package-btn:focus-visible {
          outline: 2px solid #7850ff;
          outline-offset: 2px;
        }

        /* Print Styles */
        @media print {
          .navigation,
          .particles-canvas,
          .background-effects,
          .scroll-indicator {
            display: none;
          }

          .container {
            background: white;
            color: black;
          }
        }

        /* Performance Optimizations */
        .hero-section,
        .main-content {
          will-change: transform;
        }

        .gradient-sphere,
        .glow-line,
        .float-icon {
          will-change: transform, opacity;
        }

        /* Additional Premium Effects */
        .premium-hover {
          position: relative;
          overflow: hidden;
        }

        .premium-hover::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, rgba(120, 80, 255, 0.3), transparent);
          transition: width 0.6s ease, height 0.6s ease;
          transform: translate(-50%, -50%);
        }

        .premium-hover:hover::before {
          width: 100%;
          height: 100%;
        }

        /* Neon Text Effect */
        .neon-text {
          text-shadow: 
            0 0 10px rgba(120, 80, 255, 0.8),
            0 0 20px rgba(120, 80, 255, 0.6),
            0 0 30px rgba(120, 80, 255, 0.4),
            0 0 40px rgba(120, 80, 255, 0.2);
        }

        /* Glass Effect Enhancement */
        .glass-enhanced {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.05)
          );
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 
            inset 0 0 20px rgba(255, 255, 255, 0.05),
            0 20px 40px rgba(0, 0, 0, 0.3);
        }

        /* Micro-interactions */
        .micro-interaction {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .micro-interaction:active {
          transform: scale(0.95);
        }

        /* Advanced Gradients */
        .advanced-gradient {
          background: linear-gradient(
            135deg,
            #7850ff 0%,
            #ff5080 25%,
            #50b4ff 50%,
            #00ff88 75%,
            #ffd700 100%
          );
          background-size: 400% 400%;
          animation: advancedGradient 15s ease infinite;
        }

        @keyframes advancedGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Parallax Effect */
        .parallax-element {
          transform: translateZ(0);
          will-change: transform;
        }

        /* Typography Enhancement */
        .enhanced-text {
          font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* Final Polish */
        .container {
          position: relative;
        }

        .container::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(120, 80, 255, 0.5),
            rgba(255, 80, 150, 0.5),
            rgba(80, 180, 255, 0.5),
            transparent
          );
          animation: borderFlow 4s linear infinite;
          z-index: 9999;
        }

        @keyframes borderFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Easter Egg - Premium Shine on Logo Hover */
        .logo:hover .logo-badge {
          background: linear-gradient(
            45deg,
            #7850ff,
            #ff5080,
            #50b4ff,
            #00ff88,
            #ffd700
          );
          background-size: 200% 200%;
          animation: rainbowShine 2s linear infinite;
        }

        @keyframes rainbowShine {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        /* Ensure no horizontal scroll */
        :global(html),
        :global(body) {
          max-width: 100vw !important;
          overflow-x: hidden !important;
        }

        /* Smooth scroll behavior */
        :global(html) {
          scroll-behavior: smooth;
        }

/* Better centering */
.tabs-container {
  max-width: 1000px;
  margin: 0 auto;
}

@media (max-width: 1200px) {
  .main-content {
    max-width: 90%;
  }


      `}</style>
    </>
  )
}