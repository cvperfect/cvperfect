import { useState, useEffect } from 'react'
import CVAnalysisDashboard from '../components/CVAnalysisDashboard'
import Head from 'next/head'

export default function Home() {
  const [jobPosting, setJobPosting] = useState('')
  const [currentCV, setCurrentCV] = useState('')
  const [uploadMethod, setUploadMethod] = useState('text')
  const [optimizedCV, setOptimizedCV] = useState('')
  const [optimizedCoverLetter, setOptimizedCoverLetter] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check mobile on client side only
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setCurrentCV(e.target.result)
      reader.readAsText(file)
    }
  }

  const optimizeCV = async () => {
    if (!jobPosting.trim() || !currentCV.trim()) {
      alert('Proszę wypełnić oba pola')
      return
    }
    setIsOptimizing(true)
    setShowDemo(false)
    setShowPaywall(false)

    try {
      const response = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobPosting, currentCV }),
      })
      const data = await response.json()
      
      if (data.success) {
        setOptimizedCV(data.optimizedCV)
        setOptimizedCoverLetter(data.coverLetter)
        setShowDemo(true)
        console.log('ShowDemo set to true')
      } else {
        alert('Błąd: ' + data.error)
      }
    } catch (error) {
      alert('Błąd połączenia')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handlePayment = async (priceType) => {
  console.log('Button clicked:', priceType)
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        priceType, 
        cv: optimizedCV, 
        coverLetter: optimizedCoverLetter,
        originalCV: currentCV,
        jobPosting: jobPosting
      }),
    })
    
    const session = await response.json()
    console.log('Full session response:', session)
    console.log('Session ID:', session.id)
    console.log('Session URL:', session.url)
    console.log('Session error:', session.error)
    
    // BEZPOŚREDNI REDIRECT - użyj URL od Stripe
    if (session.url) {
      console.log('Using Stripe URL:', session.url)
      window.location.href = session.url
    } else if (session.id) {
      console.log('Fallback URL:', `https://checkout.stripe.com/pay/${session.id}`)
      window.location.href = `https://checkout.stripe.com/pay/${session.id}`
    } else {
      console.error('No session ID or URL, full response:', session)
      throw new Error('No session ID received')
    }
    
  } catch (error) {
    console.log('Payment error:', error)
    alert('Błąd płatności. Sprawdź połączenie i spróbuj ponownie.')
  }
}

  return (
    <>
      <Head>
        <title>CvPerfect - AI CV Optimizer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="main-container">
        
        {/* Hero Section */}
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Badge */}
            <div className="hero-badge">
              <div className="status-dot"></div>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                ✨ Teraz z zaawansowaną analizą AI
              </span>
            </div>

            {/* Title - RESPONSIVE */}
            <h1 className="hero-title">
              Stwórz <span style={{ color: '#60a5fa' }}>idealne CV</span><br />
              w mniej niż minutę
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle">
              Nasza sztuczna inteligencja analizuje oferty pracy i automatycznie optymalizuje Twoje CV, 
              zwiększając szanse na rozmowę o <span style={{ color: '#60a5fa', fontWeight: '600' }}>300%</span>
            </p>

            {/* Stats - RESPONSIVE */}
            <div className="stats-grid">
              {[
                { number: "50K+", label: "Zoptymalizowanych CV", icon: "📄" },
                { number: "92%", label: "Więcej rozmów", icon: "📈" },
                { number: "4.9/5", label: "Ocena użytkowników", icon: "⭐" }
              ].map((stat, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Main Card */}
          <div className="main-card">
            
            {/* Step 1 */}
            <div className="step-container">
              <div className="step-number step-1">1</div>
              <div>
                <h2 className="step-title">
                  📝 Wklej ogłoszenie o pracę
                </h2>
                <p className="step-description">
                  AI przeanalizuje wymagania i dopasuje Twoje CV
                </p>
              </div>
            </div>
            
            <textarea
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
              placeholder="Wklej tutaj treść ogłoszenia o pracę..."
              className="textarea-input"
              style={{ height: '140px', marginBottom: '48px' }}
            />

            {/* Step 2 */}
            <div className="step-container">
              <div className="step-number step-2">2</div>
              <div>
                <h2 className="step-title">
                  📄 Dodaj swoje CV
                </h2>
                <p className="step-description">
                  Wybierz najwygodniejszy sposób dodania CV
                </p>
              </div>
            </div>

            {/* Radio buttons - RESPONSIVE */}
            <div className="radio-container">
              <div
                onClick={() => setUploadMethod('text')}
                className={`radio-option ${uploadMethod === 'text' ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  checked={uploadMethod === 'text'}
                  onChange={() => setUploadMethod('text')}
                  style={{ marginRight: '16px', transform: 'scale(1.2)' }}
                />
                <div>
                  <div className="radio-title">
                    ✏️ Wklej jako tekst
                  </div>
                  <div className="radio-description">Szybkie i proste rozwiązanie</div>
                </div>
              </div>

              <div
                onClick={() => setUploadMethod('file')}
                className={`radio-option ${uploadMethod === 'file' ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  checked={uploadMethod === 'file'}
                  onChange={() => setUploadMethod('file')}
                  style={{ marginRight: '16px', transform: 'scale(1.2)' }}
                />
                <div>
                  <div className="radio-title">
                    📎 Upload pliku
                  </div>
                  <div className="radio-description">PDF, DOCX, DOC, TXT</div>
                </div>
              </div>
            </div>

            {uploadMethod === 'text' ? (
              <textarea
                value={currentCV}
                onChange={(e) => setCurrentCV(e.target.value)}
                placeholder="Wklej tutaj treść swojego obecnego CV..."
                className="textarea-input"
                style={{ height: '220px', marginBottom: '40px' }}
              />
            ) : (
              <div style={{ marginBottom: '40px' }}>
                <div className="file-upload-zone">
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                    <div style={{ color: '#3b82f6', fontWeight: '600', fontSize: '18px', marginBottom: '8px' }}>
                      Kliknij aby wybrać plik
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                      lub przeciągnij i upuść tutaj
                    </div>
                  </label>
                </div>
              </div>
            )}
            
            <button
              onClick={optimizeCV}
              disabled={isOptimizing}
              className={`main-button ${isOptimizing ? 'disabled' : ''}`}
            >
              {isOptimizing ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="spinner"></div>
                  Optymalizuję CV...
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ marginRight: '8px', fontSize: '20px' }}>🚀</span>
                  Optymalizuj CV pod ofertę
                </div>
              )}
            </button>
          </div>

          {/* Results - NOWY DASHBOARD */}
          {showDemo && (
            <CVAnalysisDashboard 
              optimizedCV={optimizedCV}
              onPayment={handlePayment}
            />
          )}

        </div>

        {/* Testimonials Section */}
        <div className="testimonials-section">
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h2 className="section-title">
              🌟 Co mówią nasi użytkownicy
            </h2>
            
            <div className="testimonials-grid">
              {[
                {
                  name: "Michał K.",
                  role: "Software Developer",
                  text: "Dzięki CvPerfect dostałem pracę w Google! AI idealnie dopasował moje umiejętności do wymagań.",
                  rating: 5,
                  avatar: "👨‍💻"
                },
                {
                  name: "Anna W.",
                  role: "Marketing Manager",
                  text: "W 2 tygodnie otrzymałam 8 zaproszeń na rozmowy. To naprawdę działa!",
                  rating: 5,
                  avatar: "👩‍💼"
                },
                {
                  name: "Piotr L.",
                  role: "Data Scientist",
                  text: "Najlepsze 79zł jakie wydałem na rozwój kariery. Premium plan to strzał w dziesiątkę.",
                  rating: 5,
                  avatar: "👨‍🔬"
                }
              ].map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div style={{ display: 'flex', marginBottom: '16px' }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} style={{ color: '#fbbf24', fontSize: '20px' }}>⭐</span>
                    ))}
                  </div>
                  <p className="testimonial-text">
                    "{testimonial.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="testimonial-avatar">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937' }}>{testimonial.name}</div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div style={{ padding: '64px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="section-title">
              ⚡ Dlaczego CvPerfect?
            </h2>
            
            <div className="features-grid">
              {[
                {
                  icon: "🎯",
                  title: "Dopasowane do oferty",
                  description: "AI analizuje każde ogłoszenie i automatycznie dostosowuje Twoje CV pod konkretne wymagania pracodawcy"
                },
                {
                  icon: "⚡",
                  title: "Błyskawiczne rezultaty",
                  description: "Pełna optymalizacja CV w mniej niż minutę. Żadnych godzin spędzonych na formatowaniu"
                },
                {
                  icon: "📈",
                  title: "Gwarancja rezultatów",
                  description: "Nasi użytkownicy otrzymują średnio 3x więcej zaproszeń na rozmowy kwalifikacyjne"
                }
              ].map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <h3 className="feature-title">
                    {feature.title}
                  </h3>
                  <p className="feature-description">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="footer-logo">
                CV
              </div>
              <span style={{ color: 'white', fontWeight: '600', fontSize: '18px' }}>Perfect</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)', marginLeft: '16px', fontSize: '14px' }}>
                © 2025 Wszystkie prawa zastrzeżone
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '32px', color: 'rgba(255, 255, 255, 0.7)' }}>
              <a href="/regulamin" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Regulamin</a>
              <a href="/prywatnosc" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Prywatność</a>
              <a href="/kontakt" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Kontakt</a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .main-container {
          margin: 0;
          font-family: 'Inter, sans-serif';
          background: linear-gradient(135deg, #1e293b, #334155, #475569, #64748b);
          min-height: 100vh;
          color: white;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          padding: 8px 20px;
          margin-bottom: 32px;
          backdrop-filter: blur(10px);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
        }

        .hero-title {
          font-size: 56px;
          font-weight: 800;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
        }

        .hero-subtitle {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.8);
          max-width: 600px;
          margin: 0 auto 48px auto;
          line-height: 1.6;
          padding: 0 16px;
        }

        .stats-grid {
          display: flex;
          justify-content: center;
          gap: 48px;
          margin-bottom: 64px;
          flex-wrap: wrap;
        }

        .stat-number {
          font-size: 28px;
          font-weight: 800;
          color: white;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .main-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          margin-bottom: 48px;
          color: #1f2937;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .step-container {
          display: flex;
          align-items: center;
          margin-bottom: 32px;
        }

        .step-number {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20px;
          font-weight: bold;
          font-size: 20px;
        }

        .step-1 {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }

        .step-2 {
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .step-title {
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1f2937;
        }

        .step-description {
          margin: 0;
          color: #6b7280;
          font-size: 16px;
        }

        .textarea-input {
          width: 100%;
          padding: 20px;
          border-radius: 16px;
          border: 2px solid #e5e7eb;
          font-size: 16px;
          resize: none;
          box-sizing: border-box;
          font-family: 'Inter, sans-serif';
          line-height: 1.5;
          background: #ffffff !important;
          color: #1f2937 !important;
          transition: all 0.3s ease;
        }

        .textarea-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          outline: none;
          background: #ffffff !important;
          color: #1f2937 !important;
        }

        .textarea-input::placeholder {
          color: #9ca3af !important;
        }

        .textarea-input:focus::placeholder {
          color: #d1d5db !important;
        }

        .radio-container {
          display: flex;
          gap: 20px;
          margin-bottom: 32px;
        }

        .radio-option {
          flex: 1;
          padding: 24px;
          border-radius: 16px;
          border: 2px solid #e5e7eb;
          background: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .radio-option.active {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
        }

        .radio-title {
          font-weight: 600;
          color: #1f2937;
          font-size: 18px;
          margin-bottom: 4px;
        }

        .radio-description {
          font-size: 14px;
          color: #6b7280;
        }

        .file-upload-zone {
          border: 2px dashed #3b82f6;
          border-radius: 16px;
          padding: 48px;
          text-align: center;
          background: rgba(59, 130, 246, 0.02);
          transition: all 0.3s ease;
        }

        .main-button {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          padding: 20px 40px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
        }

        .main-button.disabled {
          background: linear-gradient(135deg, #9ca3af, #6b7280);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          margin-right: 12px;
          animation: spin 1s linear infinite;
        }

        .testimonials-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          margin: 64px 0;
          padding: 64px 20px;
        }

        .section-title {
          font-size: 36px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 48px;
          color: white;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 32px;
        }

        .testimonial-card {
          background: rgba(255, 255, 255, 0.9);
          padding: 32px;
          border-radius: 20px;
          color: #1f2937;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .testimonial-text {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 24px;
          font-style: italic;
          color: #374151;
        }

        .testimonial-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 20px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
        }

        .feature-card {
          text-align: center;
          padding: 32px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
          font-size: 32px;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
        }

        .feature-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
          color: white;
        }

        .feature-description {
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
        }

        .footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 32px 20px;
          background: rgba(0, 0, 0, 0.2);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .footer-logo {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .stats-grid {
            gap: 24px;
          }

          .stat-number {
            font-size: 20px;
          }

          .main-card {
            padding: 24px;
          }

          .step-container {
            flex-direction: column;
            text-align: center;
          }

          .step-number {
            margin-right: 0;
            margin-bottom: 16px;
          }

          .radio-container {
            flex-direction: column;
          }

          .file-upload-zone {
            padding: 32px;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}