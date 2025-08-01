import { useState, useEffect } from 'react'
import CVAnalysisDashboard from '../components/CVAnalysisDashboard'
import Head from 'next/head'

export default function Home() {
  const [jobPosting, setJobPosting] = useState('')
  const [currentCV, setCurrentCV] = useState('')
  const [uploadMethod, setUploadMethod] = useState('text')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedResult, setOptimizedResult] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0])
  const [liveNotifications, setLiveNotifications] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)

  // Live notifications data
  const notifications = [
    { name: "Anna K.", action: "kupiła Premium", time: "2 min temu", type: "purchase" },
    { name: "Michał W.", action: "zoptymalizował CV", time: "5 min temu", type: "optimize" },
    { name: "Kasia L.", action: "dostała pracę", time: "1 godz temu", type: "success" },
    { name: "Tomek S.", action: "kupiła Pro", time: "15 min temu", type: "purchase" },
    { name: "Ola M.", action: "poleca znajomym", time: "30 min temu", type: "recommend" }
  ]

  // Testimonials data (15 opinii)
  const testimonials = [
  {
    name: "Michał Nowak",
    role: "Software Developer - Allegro",
    text: "Dzięki CvPerfect dostałem 8 rozmów w 2 tygodnie! AI doskonale wyłapało słowa kluczowe.",
    rating: 5,
    image: "👨‍💻"
  },
  {
    name: "Katarzyna Wiśniewska", 
    role: "Marketing Manager - CD Projekt",
    text: "Moje CV przeszło przez ATS w pierwszej próbie. Wzrost odpowiedzi o 400%!",
    rating: 5,
    image: "👩‍💼"
  },
  {
    name: "Tomasz Kowalczyk",
    role: "Data Analyst - PKO Bank",
    text: "Po optymalizacji dostaję tylko oferty które mnie interesują. Jakość > ilość!",
    rating: 5,
    image: "👨‍💼"
  },
  {
    name: "Agnieszka Lis",
    role: "UX Designer - Asseco",
    text: "CvPerfect zmienił moją karierę. W miesiąc znalazłam pracę marzeń w tech!",
    rating: 5,
    image: "👩‍🎨"
  },
  {
    name: "Paweł Zieliński",
    role: "Project Manager - Komputronik",
    text: "AI wychwycił umiejętności które sam pominąłem. Professjonalne podejście!",
    rating: 5,
    image: "👨‍💼"
  },
  {
    name: "Magdalena Nowacka",
    role: "HR Specialist - LPP",
    text: "Jako rekruterka widzę różnicę - CV z CvPerfect wyróżniają się pozytywnie!",
    rating: 5,
    image: "👩‍💼"
  },
  {
    name: "Łukasz Adamski",
    role: "DevOps Engineer - ING Bank",
    text: "Technicznie perfekcyjne CV. Pierwszy raz przeszedłem przez wszystkie etapy!",
    rating: 5,
    image: "👨‍💻"
  },
  {
    name: "Joanna Malinowska",
    role: "Content Manager - Onet",
    text: "Kreatywny sektor też docenia profesjonalizm. Najlepsza inwestycja w karierę!",
    rating: 5,
    image: "👩‍💻"
  },
  {
    name: "Rafał Kowalski",
    role: "Sales Director - Samsung",
    text: "W 3 tygodnie 5 ofert pracy! AI wie czego szukają rekruterzy w sprzedaży.",
    rating: 5,
    image: "👨‍💼"
  },
  {
    name: "Natalia Wójcik",
    role: "Financial Analyst - PKN Orlen",
    text: "Z 0 odpowiedzi do 12 rozmów miesięcznie. Konkretne rezultaty!",
    rating: 5,
    image: "👩‍📊"
  },
  {
    name: "Marcin Lewandowski",
    role: "Frontend Developer - Livechat",
    text: "Moje portfolio zyskało na znaczeniu. CV teraz idealnie prezentuje moje projekty!",
    rating: 5,
    image: "👨‍💻"
  },
  {
    name: "Karolina Mazur",
    role: "Product Manager - Allegro",
    text: "AI zrozumiał moją ścieżkę kariery lepiej niż ja. Awans w 2 miesiące!",
    rating: 5,
    image: "👩‍💼"
  },
  {
    name: "Jakub Nowicki",
    role: "Cybersecurity Specialist - Orange",
    text: "Bezpieczeństwo to moja pasja, a CvPerfect pokazał to idealnie w CV!",
    rating: 5,
    image: "👨‍💻"
  },
  {
    name: "Weronika Kubiak",
    role: "Graphic Designer - Grupa Wirtualna Polska",
    text: "Kreatywność + AI = idealne CV! Moja praca mówi teraz za siebie.",
    rating: 5,
    image: "👩‍🎨"
  },
  {
    name: "Dawid Jankowski",
    role: "Business Analyst - mBank",
    text: "Analityczne myślenie przeniesione na CV. Każda sekcja ma sens biznesowy!",
    rating: 5,
    image: "👨‍📊"
  }
]

  // Stats animation
  useEffect(() => {
    const targetStats = [2847, 4.2, 96]
    const duration = 2000
    const steps = 60
    const increment = targetStats.map(target => target / steps)
    
    let currentStep = 0
    const timer = setInterval(() => {
      if (currentStep < steps) {
        setAnimatedStats(prev => prev.map((stat, index) => 
          Math.min(stat + increment[index], targetStats[index])
        ))
        currentStep++
      } else {
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [])

  // Testimonial rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  // Live notifications animation
  useEffect(() => {
    const showNotification = () => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
      setLiveNotifications(prev => [...prev, { ...randomNotification, id: Date.now() }])
      
      setTimeout(() => {
        setLiveNotifications(prev => prev.slice(1))
      }, 4000)
    }

    const interval = setInterval(showNotification, 6000)
    setTimeout(showNotification, 2000) // Show first notification after 2s
    
    return () => clearInterval(interval)
  }, [])



  const optimizeCV = async () => {
    if (!jobPosting.trim() || !currentCV.trim() || !userEmail.trim()) {
      alert('Proszę wypełnić wszystkie pola (ogłoszenie, CV i email)')
      return
    }
    
    if (!userEmail.includes('@')) {
      alert('Proszę podać prawidłowy adres email')
      return
    }

    setIsOptimizing(true)
    try {
      const response = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobPosting, currentCV, email: userEmail }),
      })
      const data = await response.text()
      if (response.ok) {
        setOptimizedResult(data)
      } else {
  if (data.includes('Musisz wykupić plan')) {
    setShowPricingModal(true)
  } else {
    alert(data)
  }
}
    } catch (error) {
      console.error('Błąd:', error)
      alert('Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type === 'application/pdf' || file.type.includes('word') || file.type === 'text/plain') {
        setUploadedFile(file)
        const reader = new FileReader()
        reader.onload = (e) => setCurrentCV(e.target.result)
        reader.readAsText(file)
      } else {
        alert('Proszę wybrać plik PDF, DOC/DOCX lub TXT')
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.type === 'application/pdf' || file.type.includes('word') || file.type === 'text/plain') {
        setUploadedFile(file)
        const reader = new FileReader()
        reader.onload = (e) => setCurrentCV(e.target.result)
        reader.readAsText(file)
      } else {
        alert('Proszę wybrać plik PDF, DOC/DOCX lub TXT')
      }
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setCurrentCV('')
  }

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index)
  }

const handlePayment = async (plan) => {
  if (!userEmail.trim() || !userEmail.includes('@')) {
    alert('Proszę podać prawidłowy adres email przed płatnością')
    return
  }

  console.log('🚀 Starting payment for plan:', plan)
  console.log('📧 Email:', userEmail)
  
  try {
    console.log('📡 Sending request to /api/create-checkout-session')
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        plan: plan,        // ✅ ZMIENIONE Z priceId NA plan
        email: userEmail
      }),
    })
    
    console.log('📨 Response status:', response.status)
    console.log('📨 Response ok:', response.ok)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      alert(`Błąd API: ${response.status} - ${errorText}`)
      return
    }
    
    const data = await response.json()
    console.log('✅ Response data:', data)
    
    if (data.url) {
      console.log('🔗 Redirecting to:', data.url)
      window.location.href = data.url
    } else {
      throw new Error('Brak URL płatności w odpowiedzi')
    }
  } catch (error) {
    console.error('❌ Payment error:', error)
    alert(`Wystąpił błąd: ${error.message}`)
  }
}
  return (
    <>
      <Head>
        <title>CvPerfect - AI Optymalizacja CV | Zwiększ swoje szanse o 420%</title>
        <meta name="description" content="Profesjonalna optymalizacja CV przez AI. Zwiększ liczbę rozmów rekrutacyjnych o 420%. Zaufało nam już 2847+ osób. Gwarancja satysfakcji!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://js.stripe.com/v3/"></script>
      </Head>

      <div className="main-container">
        {/* Floating Live Notifications - LEFT */}
        <div className="floating-notifications left">
          {liveNotifications.map((notification, index) => (
            <div key={notification.id} className="live-notification" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="notification-content">
                <div className="notification-icon">
                  {notification.type === 'purchase' && '💳'}
                  {notification.type === 'optimize' && '⚡'}
                  {notification.type === 'success' && '🎉'}
                  {notification.type === 'recommend' && '👍'}
                </div>
                <div className="notification-text">
                  <strong>{notification.name}</strong>
                  <br />
                  <span>{notification.action}</span>
                  <div className="notification-time">{notification.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Trust Badges - RIGHT */}
        <div className="floating-trust right">
          <div className="trust-badge">
            <div className="trust-icon">🏆</div>
            <div className="trust-text">
              <strong>Najlepsze AI</strong>
              <span>2025</span>
            </div>
          </div>
          <div className="trust-badge">
            <div className="trust-icon">👥</div>
            <div className="trust-text">
              <strong>2847+</strong>
              <span>zadowolonych</span>
            </div>
          </div>
          <div className="trust-badge">
            <div className="trust-icon">⚡</div>
            <div className="trust-text">
              <strong>30 sekund</strong>
              <span>średni czas</span>
            </div>
          </div>
          <div className="trust-badge">
            <div className="trust-icon">🔒</div>
            <div className="trust-text">
              <strong>100% RODO</strong>
              <span>bezpieczne</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="logo">
              <span className="logo-text">CvPerfect</span>
              <span className="logo-badge">AI</span>
            </div>
            <div className="header-stats">
              <div className="header-stat">
                <span className="stat-number">2847+</span>
                <span className="stat-label">CV zoptymalizowanych</span>
              </div>
              <div className="header-stat">
                <span className="stat-number">96%</span>
                <span className="stat-label">zadowolonych</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating icons */}
        <div className="floating-icons">
          <div className="floating-icon" style={{ top: '15%', left: '8%', animationDelay: '0s' }}>💼</div>
          <div className="floating-icon" style={{ top: '25%', right: '12%', animationDelay: '1s' }}>📄</div>
          <div className="floating-icon" style={{ top: '45%', left: '5%', animationDelay: '2s' }}>🎯</div>
          <div className="floating-icon" style={{ top: '35%', right: '8%', animationDelay: '3s' }}>⚡</div>
          <div className="floating-icon" style={{ top: '65%', left: '10%', animationDelay: '4s' }}>📈</div>
          <div className="floating-icon" style={{ top: '55%', right: '15%', animationDelay: '5s' }}>🚀</div>
        </div>

        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Zwiększ swoje szanse o <span className="highlight">420%</span>
              <br />z AI-powered optymalizacją CV
            </h1>
            <p className="hero-subtitle">
              Profesjonalne dopasowanie CV do każdej oferty pracy w 30 sekund. 
              Przejdź przez ATS i zdobądź wymarzoną pracę! ⚡
            </p>
            
            {/* Trust indicators */}
            <div className="trust-indicators">
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <span>Płatności SSL</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">⚡</span>
                <span>30s optymalizacja</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🎯</span>
                <span>Gwarancja zwrotu</span>
              </div>
            </div>
          </div>

          {/* Animated Stats */}
          <div className="hero-stats">
            <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="stat-icon">📊</div>
              <div className="stat-number">{Math.floor(animatedStats[0])}+</div>
              <div className="stat-label">CV zoptymalizowanych w tym miesiącu</div>
            </div>
            <div className="stat-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="stat-icon">📈</div>
              <div className="stat-number">{animatedStats[1].toFixed(1)}x</div>
              <div className="stat-label">więcej odpowiedzi na CV</div>
            </div>
            <div className="stat-card animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="stat-icon">⭐</div>
              <div className="stat-number">{Math.floor(animatedStats[2])}%</div>
              <div className="stat-label">użytkowników poleca znajomym</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Features Grid */}
          <div className="features-grid">
            {[
              { 
                icon: "🤖", 
                title: "Zaawansowane AI", 
                desc: "GPT-4 analizuje CV i dopasowuje do wymagań",
                gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              },
              { 
                icon: "⚡", 
                title: "Błyskawiczna Szybkość", 
                desc: "Optymalizacja w mniej niż 30 sekund",
                gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              },
              { 
  icon: "ats-score", 
  title: "95% ATS Score", 
  desc: "Gwarancja przejścia przez systemy rekrutacyjne",
  gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
},
              { 
                icon: "📈", 
                title: "420% Więcej Rozmów", 
                desc: "Statystycznie potwierdzona skuteczność",
                gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              },
              { 
                icon: "🇵🇱", 
                title: "Polski Rynek Pracy", 
                desc: "Specjalizujemy się w polskich standardach",
                gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
              },
              { 
                icon: "🔒", 
                title: "100% Bezpieczne", 
                desc: "Twoje dane są chronione SSL i RODO",
                gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="feature-icon-wrapper" style={{ background: feature.gradient }}>
  {feature.icon === "ats-score" ? (
    <div className="ats-score-circle">
      <div className="ats-percentage">95%</div>
      <div className="ats-label">ATS</div>
    </div>
  ) : (
    <span className="feature-icon">{feature.icon}</span>
  )}
</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* How It Works Section */}
          <div className="how-it-works-section">
            <h2 className="section-title animate-slide-up">Jak to działa?</h2>
            <div className="steps-container">
              {[
                { 
                  icon: "📝", 
                  title: "Wklej ogłoszenie", 
                  desc: "Skopiuj ogłoszenie o pracę, która Cię interesuje",
                  color: "#667eea"
                },
                { 
                  icon: "📄", 
                  title: "Dodaj swoje CV", 
                  desc: "Wklej tekst lub prześlij plik PDF/DOC",
                  color: "#f093fb"
                },
                { 
                  icon: "🤖", 
                  title: "AI analizuje", 
                  desc: "Sztuczna inteligencja dopasowuje CV do oferty",
                  color: "#4facfe"
                },
                { 
                  icon: "🎯", 
                  title: "Otrzymaj wyniki", 
                  desc: "Zoptymalizowane CV gotowe do wysłania",
                  color: "#43e97b"
                }
              ].map((step, index) => (
                <div key={index} className="step-card animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="step-number" style={{ backgroundColor: step.color }}>
                    {index + 1}
                  </div>
                  <div className="step-icon" style={{ color: step.color }}>
                    {step.icon}
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                  {index < 3 && <div className="step-arrow">→</div>}
                </div>
              ))}
            </div>
          </div>

          {/* CV Input Section */}
          <div id="cv-form" className="cv-section">
            <h2 className="section-title">Zoptymalizuj swoje CV teraz! 🚀</h2>
            
            {/* Step 1: Job Posting */}
            <div className="input-section">
              <h3 className="input-title">Krok 1: Wklej ogłoszenie o pracę</h3>
              <textarea
                className="textarea-input"
                placeholder="Wklej tutaj pełne ogłoszenie o pracę, na którą aplikujesz..."
                value={jobPosting}
                onChange={(e) => setJobPosting(e.target.value)}
                rows={6}
              />
            </div>

            {/* Step 2: CV Upload */}
            <div className="input-section">
              <h3 className="input-title">Krok 2: Dodaj swoje CV</h3>
              
              {/* Upload Method Selection */}
              <div className="upload-method-selector">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="uploadMethod"
                    value="text"
                    checked={uploadMethod === 'text'}
                    onChange={(e) => setUploadMethod(e.target.value)}
                  />
                  <span className="radio-label">📝 Wklej jako tekst</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="uploadMethod"
                    value="file"
                    checked={uploadMethod === 'file'}
                    onChange={(e) => setUploadMethod(e.target.value)}
                  />
                  <span className="radio-label">📎 Upload pliku</span>
                </label>
              </div>

              {/* Text Input Method */}
              {uploadMethod === 'text' && (
                <textarea
                  className="textarea-input"
                  placeholder="Wklej tutaj treść swojego obecnego CV..."
                  value={currentCV}
                  onChange={(e) => setCurrentCV(e.target.value)}
                  rows={8}
                />
              )}

              {/* File Upload Method */}
              {uploadMethod === 'file' && (
                <div className="file-upload-section">
                  {!uploadedFile ? (
                    <div 
                      className={`file-upload-zone ${isDragOver ? 'drag-over' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-input').click()}
                    >
                      <div className="file-upload-content">
                        <div className="file-upload-icon">📎</div>
                        <div className="file-upload-text">
                          <strong>Kliknij lub przeciągnij plik CV</strong>
                          <p>Obsługujemy PDF, DOC, DOCX, TXT (max 10MB)</p>
                        </div>
                        <div className="file-upload-button">Wybierz plik</div>
                      </div>
                      <input
                        id="file-input"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                  ) : (
                    <div className="file-uploaded">
                      <div className="file-info">
                        <div className="file-icon">✅</div>
                        <div className="file-details">
                          <div className="file-name">{uploadedFile.name}</div>
                          <div className="file-size">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button className="file-remove" onClick={removeFile}>
                          🗑️
                        </button>
                      </div>
                      <div className="file-success">
                        ✅ Plik został pomyślnie wczytany!
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Email */}
            <div className="input-section">
              <h3 className="input-title">Krok 3: Podaj swój email</h3>
              <input
                type="email"
                placeholder="np. jan.kowalski@gmail.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                className="email-input"
              />
              <p className="email-note">
                💡 Na ten adres wyślemy zoptymalizowane CV po zakupie planu
              </p>
            </div>

            {/* Optimize Button */}
            <button
              onClick={optimizeCV}
              disabled={isOptimizing}
              className={`main-button ${isOptimizing ? 'disabled' : ''}`}
            >
              {isOptimizing ? (
                <span className="button-loading">
                  <span className="spinner"></span>
                  Optymalizuję CV...
                </span>
              ) : (
                'Optymalizuj CV pod ofertę'
              )}
            </button>

            {/* Progress Bar */}
            {isOptimizing && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <div className="progress-steps">
                  <div className="progress-step active">🔍 Analizowanie wymagań</div>
                  <div className="progress-step active">🤖 Optymalizacja AI</div>
                  <div className="progress-step">✨ Finalizowanie</div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {optimizedResult && (
              <CVAnalysisDashboard result={optimizedResult} />
            )}
          </div>

          {/* Pricing Plans */}
          <div className="pricing-section">
            <h2 className="section-title">Wybierz swój plan 💎</h2>
            
            <div className="pricing-grid">
              {/* Basic Plan */}
              <div className="pricing-card">
                <div className="pricing-header">
                  <h3 className="plan-name">Basic</h3>
                  <div className="plan-price">
                    <span className="price">9.99 zł</span>
                    <span className="price-period">/jednorazowo</span>
                  </div>
                </div>
                <ul className="plan-features">
                  <li>✅ 1 optymalizacja CV</li>
                  <li>✅ Analiza ATS compatibility</li>
                  <li>✅ Raport z sugestiami</li>
                  <li>✅ Email z wynikami</li>
                </ul>
                <button
                  onClick={() => handlePayment('basic')}
                  className="pricing-button basic"
                >
                  Wybierz Basic
                </button>
              </div>

              {/* Pro Plan */}
              <div className="pricing-card popular">
                <div className="popular-badge">⭐ Najpopularniejszy</div>
                <div className="pricing-header">
                  <h3 className="plan-name">Pro</h3>
                  <div className="plan-price">
                    <span className="price">49 zł</span>
                    <span className="price-period">/miesięcznie</span>
                  </div>
                </div>
                <ul className="plan-features">
                  <li>✅ 10 optymalizacji CV</li>
                  <li>✅ Analiza ATS + scoring</li>
                  <li>✅ Szczegółowe raporty</li>
                  <li>✅ Email z wynikami</li>
                  <li>✅ Wsparcie priorytetowe</li>
                </ul>
                <button
                  onClick={() => handlePayment('pro')}
                  className="pricing-button pro"
                >
                  Wybierz Pro
                </button>
              </div>

              {/* Premium Plan */}
              <div className="pricing-card premium">
                <div className="premium-badge">💎 Najlepsza wartość</div>
                <div className="pricing-header">
                  <h3 className="plan-name">Premium</h3>
                  <div className="plan-price">
                    <span className="price">79 zł</span>
                    <span className="price-period">/miesięcznie</span>
                  </div>
                </div>
                <ul className="plan-features">
                  <li>✅ 25 optymalizacji CV</li>
                  <li>✅ Pełna analiza ATS</li>
                  <li>✅ Zaawansowane raporty</li>
                  <li>✅ Email z wynikami</li>
                  <li>✅ Wsparcie VIP 24/7</li>
                  <li>✅ Konsultacja z ekspertem</li>
                </ul>
                <button
                  onClick={() => handlePayment('premium')}
                  className="pricing-button premium"
                >
                  Wybierz Premium
                </button>
              </div>
            </div>

            <div className="pricing-guarantee">
              <div className="guarantee-content">
                <span className="guarantee-icon">📈</span>
                <div className="guarantee-text">
                  <strong>Gwarancja Skuteczności</strong>
                  <p>96% naszych klientów dostaje więcej rozmów rekrutacyjnych w 30 dni!</p>
                </div>
              </div>
            </div>
          </div>

{/* Comparison Section - Chili Piper Style */}
<div className="battle-section">
  <div className="battle-container">
    <div className="battle-header">
      <h2 className="section-title gradient-text">Dlaczego wybierają CvPerfect? 🚀</h2>
      <p className="battle-subtitle">Pierwsza AI platforma CV w Polsce vs tradycyjne narzędzia</p>
    </div>

    <div className="battle-arena">
      {/* CVPERFECT SIDE */}
      <div className="battle-card winner">
        <div className="battle-crown">👑 ZWYCIĘZCA</div>
        <div className="card-glow"></div>
        
        <div className="battle-logo">
          <div className="logo-circle modern">CV</div>
          <div className="logo-info">
            <h3>CvPerfect</h3>
            <p>AI-Powered Revolution</p>
          </div>
        </div>

        <div className="battle-features">
          <div className="feature-row win">
            <span className="feature-icon">⚡</span>
            <span>30 sekund</span>
            <span className="feature-score">10/10</span>
          </div>
          <div className="feature-row win">
            <span className="feature-icon">🤖</span>
            <span>GPT-4 AI</span>
            <span className="feature-score">10/10</span>
          </div>
          <div className="feature-row win">
            <span className="feature-icon">🎯</span>
            <span>95% ATS</span>
            <span className="feature-score">10/10</span>
          </div>
          <div className="feature-row win">
            <span className="feature-icon">🇵🇱</span>
            <span>Polski standard</span>
            <span className="feature-score">10/10</span>
          </div>
          <div className="feature-row win">
            <span className="feature-icon">💰</span>
            <span>9.99 zł</span>
            <span className="feature-score">10/10</span>
          </div>
        </div>

        <div className="battle-cta">
          <button className="battle-btn winner-btn" onClick={() => setShowPricingModal(true)}>
            Wypróbuj teraz ⚡
          </button>
          <div className="battle-price">
            <span className="old-price">29.99 zł</span>
            <span className="new-price">9.99 zł</span>
          </div>
        </div>
      </div>

      {/* VS DIVIDER */}
      <div className="vs-container">
        <div className="vs-lightning">⚡</div>
        <div className="vs-badge">VS</div>
        <div className="vs-lightning">⚡</div>
      </div>

      {/* COMPETITORS SIDE */}
      <div className="battle-card loser">
        <div className="battle-skull">💀 PRZEGRANI</div>
        
        <div className="battle-logo">
          <div className="logo-circle old">?</div>
          <div className="logo-info">
            <h3>Inne narzędzia</h3>
            <p>Stare podejście</p>
          </div>
        </div>

        <div className="battle-features">
          <div className="feature-row lose">
            <span className="feature-icon">⏰</span>
            <span>5-15 minut</span>
            <span className="feature-score">3/10</span>
          </div>
          <div className="feature-row lose">
            <span className="feature-icon">🤷</span>
            <span>Brak AI</span>
            <span className="feature-score">0/10</span>
          </div>
          <div className="feature-row lose">
            <span className="feature-icon">📊</span>
            <span>60% ATS</span>
            <span className="feature-score">6/10</span>
          </div>
          <div className="feature-row lose">
            <span className="feature-icon">🌍</span>
            <span>Tylko EN</span>
            <span className="feature-score">4/10</span>
          </div>
          <div className="feature-row lose">
            <span className="feature-icon">💸</span>
            <span>$29.95+</span>
            <span className="feature-score">2/10</span>
          </div>
        </div>

        <div className="battle-cta">
          <button className="battle-btn loser-btn" onClick={() => alert('🤔 Pewien? CvPerfect to lepsza opcja! Sprawdź nasze AI w 30 sekund za jedyne 9.99 zł! 🚀')}>
            Stare podejście 😴
          </button>
          <div className="battle-price">
            <span className="competitor-price">$29.95+</span>
          </div>
        </div>
      </div>
    </div>

    {/* BATTLE STATS */}
    <div className="battle-stats">
      <div className="stat-item">
        <div className="stat-icon">🎯</div>
        <div className="stat-number">95%</div>
        <div className="stat-label">ATS Success</div>
      </div>
      <div className="stat-item">
        <div className="stat-icon">⚡</div>
        <div className="stat-number">30s</div>
        <div className="stat-label">Optymalizacja</div>
      </div>
      <div className="stat-item">
        <div className="stat-icon">📈</div>
        <div className="stat-number">420%</div>
        <div className="stat-label">Więcej rozmów</div>
      </div>
      <div className="stat-item">
        <div className="stat-icon">🇵🇱</div>
        <div className="stat-number">#1</div>
        <div className="stat-label">W Polsce</div>
      </div>
    </div>
  </div>
</div>          {/* Testimonials Section */}
          <div className="testimonials-section">
            <h2 className="section-title">Co mówią nasi klienci? ⭐</h2>
            
            <div className="testimonials-container">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <div className="testimonial-stars">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <span key={i} className="star">⭐</span>
                    ))}
                  </div>
                  <p className="testimonial-text">
                    "{testimonials[currentTestimonial].text}"
                  </p>
                  <div className="testimonial-author">
  <div className="testimonial-avatar">{testimonials[currentTestimonial].image}</div>
  <div className="testimonial-info">
    <strong>{testimonials[currentTestimonial].name}</strong>
    <span className="testimonial-role">{testimonials[currentTestimonial].role}</span>
  </div>
</div>
                </div>
              </div>
              
              <div className="testimonial-dots">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`testimonial-dot ${index === currentTestimonial ? 'active' : ''}`}
                    onClick={() => goToTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2 className="section-title">Często zadawane pytania 🤔</h2>
            <div className="faq-container">
              {[
                {
                  question: "Jak długo trwa optymalizacja CV?",
                  answer: "Optymalizacja trwa średnio 30-60 sekund. Nasze AI błyskawicznie analizuje CV i dopasowuje je do wymagań oferty pracy."
                },
                {
                  question: "Czy moje dane są bezpieczne?",
                  answer: "Tak! Używamy szyfrowania SSL, jesteśmy zgodni z RODO. Twoje CV nie jest przechowywane po optymalizacji. Gwarantujemy 100% prywatności."
                },
                {
                  question: "Co to jest ATS compatibility?",
                  answer: "ATS to systemy rekrutacyjne, które skanują CV przed dotarciem do HR. Nasze AI optymalizuje CV tak, żeby przeszło przez te systemy z wysokim scoring."
                },
                {
                  question: "Czy mogę anulować subskrypcję?",
                  answer: "Oczywiście! Możesz anulować w każdym momencie. Plan Basic to jednorazowa płatność, plany Pro/Premium można anulować bez dodatkowych opłat."
                },
                {
                  question: "Jakiej branży dotyczy optymalizacja?",
                  answer: "Obsługujemy wszystkie branże - IT, marketing, sprzedaż, finanse, medycyna, edukacja i wiele innych. AI dostosowuje się do specyfiki każdej dziedziny."
                },
                {
                  question: "Ile CV mogę optymalizować miesięcznie?",
                  answer: "W planie Basic - 1 CV jednorazowo, Pro - 10 CV miesięcznie, Premium - 25 CV miesięcznie. Limity odnowiają się co miesiąc automatycznie."
                },
                {
                  question: "Czy otrzymam CV w różnych formatach?",
                  answer: "Tak! Otrzymasz zoptymalizowane CV jako tekst gotowy do wklejenia oraz szczegółowy raport z analizą i sugestiami poprawek na Twój email."
                }
              ].map((faq, index) => (
                <div key={index} className="faq-item">
                  <div className="faq-question">
                    <span className="faq-icon">❓</span>
                    {faq.question}
                  </div>
                  <div className="faq-answer">
                    <span className="faq-answer-icon">💡</span>
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

{/* Pricing Modal */}
{showPricingModal && (
  <div className="pricing-modal-overlay" onClick={() => setShowPricingModal(false)}>
    <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2 className="modal-title">Wybierz swój plan 💎</h2>
        <button className="modal-close" onClick={() => setShowPricingModal(false)}>✕</button>
      </div>
      
      <div className="modal-pricing-grid">
        {/* Basic Plan */}
        <div className="modal-pricing-card">
          <div className="modal-plan-header">
            <h3 className="modal-plan-name">Basic</h3>
            <div className="modal-plan-price">
              <span className="modal-price">9.99 zł</span>
              <span className="modal-price-period">/jednorazowo</span>
            </div>
          </div>
          <ul className="modal-plan-features">
            <li>✅ 1 optymalizacja CV</li>
            <li>✅ Analiza ATS compatibility</li>
            <li>✅ Raport z sugestiami</li>
            <li>✅ Email z wynikami</li>
          </ul>
          <button 
            className="modal-pricing-button basic"
            onClick={() => { setShowPricingModal(false); handlePayment('basic') }}
          >
            Wybierz Basic
          </button>
        </div>

        {/* Pro Plan */}
        <div className="modal-pricing-card popular">
          <div className="modal-popular-badge">⭐ Najpopularniejszy</div>
          <div className="modal-plan-header">
            <h3 className="modal-plan-name">Pro</h3>
            <div className="modal-plan-price">
              <span className="modal-price">49 zł</span>
              <span className="modal-price-period">/miesięcznie</span>
            </div>
          </div>
          <ul className="modal-plan-features">
            <li>✅ 10 optymalizacji CV</li>
            <li>✅ Analiza ATS + scoring</li>
            <li>✅ Szczegółowe raporty</li>
            <li>✅ Email z wynikami</li>
            <li>✅ Wsparcie priorytetowe</li>
          </ul>
          <button 
            className="modal-pricing-button pro"
            onClick={() => { setShowPricingModal(false); handlePayment('pro') }}
          >
            Wybierz Pro
          </button>
        </div>

        {/* Premium Plan */}
        <div className="modal-pricing-card premium">
          <div className="modal-premium-badge">🏆 Premium</div>
          <div className="modal-plan-header">
            <h3 className="modal-plan-name">Premium</h3>
            <div className="modal-plan-price">
              <span className="modal-price">79 zł</span>
              <span className="modal-price-period">/miesięcznie</span>
            </div>
          </div>
          <ul className="modal-plan-features">
            <li>✅ 25 optymalizacji CV</li>
            <li>✅ Pełna analiza ATS</li>
            <li>✅ Zaawansowane raporty</li>
            <li>✅ Email z wynikami</li>
            <li>✅ Wsparcie VIP 24/7</li>
            <li>✅ Konsultacje z ekspertem</li>
          </ul>
          <button 
            className="modal-pricing-button premium"
            onClick={() => { setShowPricingModal(false); handlePayment('premium') }}
          >
            Wybierz Premium
          </button>
        </div>
      </div>
    </div>
  </div>
)}
        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-text">CvPerfect</span>
                <span className="logo-badge">AI</span>
              </div>
              <p className="footer-description">
                Profesjonalne narzędzie AI do optymalizacji CV. 
                Zwiększ swoje szanse na rynku pracy! 🚀
              </p>
            </div>
            
            <div className="footer-section">
              <h4 className="footer-title">Kontakt</h4>
              <div className="footer-links">
                <a href="mailto:cvperfectai@gmail.com" className="footer-link">
                  📧 cvperfectai@gmail.com
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h4 className="footer-title">Prawne</h4>
              <div className="footer-links">
                <a href="/regulamin" className="footer-link">Regulamin</a>
                <a href="/polityka-prywatnosci" className="footer-link">Polityka prywatności</a>
                <a href="/rodo" className="footer-link">RODO</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 CvPerfect.pl - Wszystkie prawa zastrzeżone</p>
            <div className="footer-badges">
              <span className="footer-badge">🔒 SSL</span>
              <span className="footer-badge">🛡️ RODO</span>
              <span className="footer-badge">⚡ AI</span>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .main-container {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* Floating Notifications - LEFT */
        .floating-notifications {
          position: fixed;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .live-notification {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: slideInLeft 0.5s ease-out, fadeOut 0.5s ease-in 3.5s;
          max-width: 200px;
        }

        .notification-content {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .notification-icon {
          font-size: 16px;
          margin-top: 2px;
        }

        .notification-text {
          font-size: 12px;
          line-height: 1.3;
        }

        .notification-text strong {
          color: #1f2937;
          display: block;
        }

        .notification-text span {
          color: #6b7280;
        }

        .notification-time {
          color: #9ca3af;
          font-size: 10px;
          margin-top: 2px;
        }

        /* Floating Trust Badges - RIGHT */
        .floating-trust {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .trust-badge {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideInRight 0.5s ease-out;
          animation-fill-mode: both;
          max-width: 160px;
        }

        .trust-badge:nth-child(1) { animation-delay: 0.2s; }
        .trust-badge:nth-child(2) { animation-delay: 0.4s; }
        .trust-badge:nth-child(3) { animation-delay: 0.6s; }
        .trust-badge:nth-child(4) { animation-delay: 0.8s; }

        .trust-icon {
          font-size: 16px;
        }

        .trust-text {
          font-size: 11px;
          line-height: 1.2;
        }

        .trust-text strong {
          color: #1f2937;
          display: block;
        }

        .trust-text span {
          color: #6b7280;
        }

        /* Hide floating elements on mobile */
        @media (max-width: 1200px) {
          .floating-notifications,
          .floating-trust {
            display: none;
          }
        }

        /* Header */
        .header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 15px 0;
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

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-text {
          font-size: 28px;
          font-weight: 800;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .logo-badge {
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .header-stats {
          display: flex;
          gap: 30px;
        }

        .header-stat {
          text-align: center;
          color: white;
        }

        .header-stat .stat-number {
          display: block;
          font-size: 18px;
          font-weight: 700;
        }

        .header-stat .stat-label {
          font-size: 12px;
          opacity: 0.9;
        }

        /* Floating Icons */
        .floating-icons {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-icon {
          position: absolute;
          font-size: 24px;
          opacity: 0.15;
          animation: float 6s ease-in-out infinite;
        }

        /* Hero Section */
        .hero-section {
          padding: 80px 20px;
          text-align: center;
          color: white;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto 60px;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 24px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .highlight {
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 20px;
          line-height: 1.6;
          margin-bottom: 40px;
          opacity: 0.95;
        }

        .trust-indicators {
          display: flex;
          justify-content: center;
          gap: 30px;
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          padding: 12px 20px;
          border-radius: 25px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .trust-icon {
          font-size: 16px;
        }

        /* Hero Stats */
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          max-width: 900px;
          margin: 0 auto;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-icon {
          font-size: 32px;
          margin-bottom: 15px;
          display: block;
        }

        .stat-number {
          font-size: 36px;
          font-weight: 800;
          color: white;
          display: block;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.9;
          line-height: 1.4;
        }

        /* Main Content Area */
        .main-container > div:nth-child(3) {
          background: white;
          position: relative;
          z-index: 2;
          border-radius: 30px 30px 0 0;
          margin-top: -30px;
          padding-top: 60px;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin: 60px 0;
        }

        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #f0f0f0;
          transition: all 0.3s ease;
          animation: slideInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .feature-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .feature-icon {
          font-size: 32px;
        }

        .feature-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 15px;
        }

        .feature-description {
          color: #6b7280;
          line-height: 1.6;
        }

/* ATS Score Circle */
.ats-score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.4);
}

.ats-percentage {
  font-size: 18px;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.ats-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 2px;
}

        /* How It Works Section */
        .how-it-works-section {
          margin: 80px 0;
          padding: 60px 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 30px;
        }

        .section-title {
          font-size: 36px;
          font-weight: 800;
          text-align: center;
          color: #1f2937;
          margin-bottom: 50px;
          animation: slideInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .steps-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
          position: relative;
        }

        .step-card {
          text-align: center;
          position: relative;
          animation: slideInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .step-number {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          color: white;
          font-weight: 700;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
        }

        .step-icon {
          font-size: 48px;
          margin-bottom: 20px;
          display: block;
        }

        .step-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .step-desc {
          color: #6b7280;
          line-height: 1.5;
        }

        .step-arrow {
          position: absolute;
          right: -15px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 24px;
          color: #9ca3af;
        }

        /* CV Section */
        .cv-section {
          background: #f9fafb;
          border-radius: 30px;
          padding: 60px 40px;
          margin: 60px 0;
        }

        .input-section {
          margin-bottom: 40px;
        }

        .input-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .textarea-input {
          width: 100%;
          padding: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          font-size: 16px;
          font-family: 'Inter', sans-serif;
          resize: vertical;
          transition: all 0.3s ease;
          outline: none;
          box-sizing: border-box;
          background-color: #ffffff !important;
          color: #1f2937 !important;
        }

        .textarea-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background-color: #ffffff !important;
          color: #1f2937 !important;
        }

        .textarea-input::placeholder {
          color: #9ca3af !important;
        }

        .textarea-input:focus::placeholder {
          color: #d1d5db !important;
        }

        /* Upload Method Selector */
        .upload-method-selector {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 12px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .radio-option:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .radio-option input[type="radio"] {
          margin: 0;
        }

        .radio-option input[type="radio"]:checked + .radio-label {
          color: #3b82f6;
          font-weight: 600;
        }

        .radio-label {
          font-size: 16px;
          color: #4b5563;
          transition: all 0.3s ease;
        }

        /* Enhanced File Upload */
        .file-upload-section {
          margin-top: 20px;
        }

        .file-upload-zone {
          border: 3px dashed #d1d5db;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fafafa;
          position: relative;
          overflow: hidden;
        }

        .file-upload-zone:hover,
        .file-upload-zone.drag-over {
          border-color: #3b82f6;
          background: #f0f9ff;
          transform: scale(1.02);
        }

        .file-upload-content {
          position: relative;
          z-index: 2;
        }

        .file-upload-icon {
          font-size: 48px;
          margin-bottom: 20px;
          color: #6b7280;
        }

        .file-upload-text {
          margin-bottom: 20px;
        }

        .file-upload-text strong {
          font-size: 18px;
          color: #1f2937;
          display: block;
          margin-bottom: 8px;
        }

        .file-upload-text p {
          color: #6b7280;
          margin: 0;
        }

        .file-upload-button {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          display: inline-block;
          transition: all 0.3s ease;
          border: none;
        }

        .file-upload-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        /* File Uploaded State */
        .file-uploaded {
          background: #f0fdf4;
          border: 2px solid #22c55e;
          border-radius: 16px;
          padding: 20px;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .file-icon {
          font-size: 24px;
        }

        .file-details {
          flex: 1;
        }

        .file-name {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .file-size {
          color: #6b7280;
          font-size: 14px;
        }

        .file-remove {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .file-remove:hover {
          background: #fecaca;
          transform: scale(1.1);
        }

        .file-success {
          color: #16a34a;
          font-weight: 600;
          text-align: center;
          padding: 10px;
          background: rgba(34, 197, 94, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        /* Email Input */
        .email-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          font-size: 16px;
          transition: all 0.3s ease;
          outline: none;
          font-family: 'Inter', sans-serif;
          background-color: #ffffff;
          color: #1f2937;
          box-sizing: border-box;
        }

        .email-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .email-note {
          margin-top: 8px;
          color: #6b7280;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Main Button */
        .main-button {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 20px 40px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          margin-top: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .main-button:hover:not(.disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
        }

        .main-button.disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-loading {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        /* Progress Bar */
        .progress-container {
          margin-top: 30px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          border-radius: 4px;
          animation: progressFill 3s ease-in-out infinite;
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .progress-step {
          color: #9ca3af;
          transition: color 0.3s ease;
        }

        .progress-step.active {
          color: #3b82f6;
          font-weight: 600;
        }

        /* Pricing Section */
        .pricing-section {
          margin: 80px 0;
          text-align: center;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          max-width: 1000px;
          margin: 0 auto 40px;
        }

        .pricing-card {
          background: white;
          border-radius: 24px;
          padding: 40px 30px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 2px solid #f0f0f0;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .pricing-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
        }

        .pricing-card.popular {
          border-color: #3b82f6;
          transform: scale(1.05);
        }

        .pricing-card.premium {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }

        .popular-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .premium-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .pricing-header {
          margin-bottom: 30px;
        }

        .plan-name {
          font-size: 24px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .plan-price {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
        }

        .price {
          font-size: 36px;
          font-weight: 800;
          color: #1f2937;
        }

        .price-period {
          color: #6b7280;
          font-size: 14px;
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 30px 0;
          text-align: left;
        }

        .plan-features li {
          padding: 8px 0;
          color: #4b5563;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pricing-button {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pricing-button.basic {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          color: white;
        }

        .pricing-button.pro {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }

        .pricing-button.premium {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .pricing-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .pricing-guarantee {
          background: #f0fdf4;
          border: 1px solid #22c55e;
          border-radius: 16px;
          padding: 20px;
          margin: 40px auto 0;
          max-width: 600px;
        }

        .guarantee-content {
          display: flex;
          align-items: center;
          gap: 15px;
          text-align: left;
        }

        .guarantee-icon {
          font-size: 32px;
        }

        .guarantee-text strong {
          color: #16a34a;
          display: block;
          margin-bottom: 4px;
        }

        .guarantee-text p {
          color: #4b5563;
          margin: 0;
        }

/* Battle Section - Chili Piper Style */
.battle-section {
  margin: 80px 0;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
}

.battle-container {
  max-width: 1200px;
  margin: 0 auto;
}

.battle-header {
  text-align: center;
  margin-bottom: 60px;
}

.gradient-text {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 42px;
  margin-bottom: 20px;
}

.battle-subtitle {
  color: #64748b;
  font-size: 18px;
  max-width: 600px;
  margin: 0 auto;
}

.battle-arena {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 40px;
  align-items: center;
  margin-bottom: 60px;
}

.battle-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid #e2e8f0;
}

.battle-card.winner {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #22c55e;
  box-shadow: 0 20px 60px rgba(34, 197, 94, 0.2);
  transform: scale(1.02);
}

.battle-card.loser {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #ef4444;
  opacity: 0.85;
  transform: scale(0.98);
}

.card-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 26px;
  z-index: -1;
  opacity: 0.1;
}

.battle-crown {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  z-index: 10;
}

.battle-skull {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  z-index: 10;
}

.battle-logo {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.logo-circle {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  color: white;
}

.logo-circle.modern {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.logo-circle.old {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.logo-info h3 {
  font-size: 24px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 5px;
}

.logo-info p {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.battle-features {
  margin-bottom: 30px;
}

.feature-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.feature-row:last-child {
  border-bottom: none;
}

.feature-row.win {
  color: #16a34a;
}

.feature-row.lose {
  color: #dc2626;
}

.feature-score {
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
}

.feature-row.win .feature-score {
  background: #dcfce7;
  color: #16a34a;
}

.feature-row.lose .feature-score {
  background: #fee2e2;
  color: #dc2626;
}

.vs-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.vs-lightning {
  font-size: 24px;
  animation: lightning 1.5s infinite;
}

@keyframes lightning {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

.vs-badge {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: white;
  box-shadow: 0 15px 40px rgba(245, 158, 11, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.battle-cta {
  text-align: center;
}

.battle-btn {
  width: 100%;
  padding: 16px 32px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.winner-btn {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.winner-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(34, 197, 94, 0.4);
}

.loser-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.loser-btn:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.battle-price {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.old-price {
  text-decoration: line-through;
  color: #9ca3af;
  font-size: 16px;
}

.new-price {
  font-size: 24px;
  font-weight: 800;
  color: #22c55e;
}

.competitor-price {
  font-size: 20px;
  font-weight: 700;
  color: #ef4444;
}

.battle-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 10px;
  display: block;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  display: block;
  margin-bottom: 8px;
}

.stat-label {
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

/* Mobile */
@media (max-width: 768px) {
  .battle-arena {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .vs-container {
    order: -1;
  }
  
  .battle-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 30px 20px;
  }
}        /* Testimonials Section */
        .testimonials-section {
          margin: 80px 0;
          text-align: center;
        }

        .testimonials-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .testimonial-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          padding: 50px 40px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .testimonial-content {
          position: relative;
          z-index: 2;
        }

        .testimonial-stars {
          margin-bottom: 20px;
        }

        .star {
          font-size: 24px;
          margin-right: 4px;
        }

        .testimonial-text {
          font-size: 20px;
          line-height: 1.6;
          margin-bottom: 30px;
          font-style: italic;
        }

        .testimonial-author {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.testimonial-avatar {
  font-size: 48px;
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.testimonial-info {
  text-align: left;
}

.testimonial-author strong {
  display: block;
  font-size: 18px;
  margin-bottom: 5px;
}

.testimonial-role {
  opacity: 0.9;
  font-size: 14px;
}

        .testimonial-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 30px;
        }

        .testimonial-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
          background: #d1d5db;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .testimonial-dot.active {
          background: #3b82f6;
          transform: scale(1.2);
        }

        .testimonial-dot:hover {
          background: #6b7280;
        }

        /* FAQ Section */
        .faq-section {
          margin: 80px 0;
          background: #f9fafb;
          border-radius: 30px;
          padding: 60px 40px;
        }

        .faq-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .faq-item {
          background: white;
          border-radius: 16px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .faq-question {
          padding: 20px 25px;
          font-weight: 600;
          color: #1f2937;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f3f4f6;
        }

        .faq-icon {
          font-size: 18px;
        }

        .faq-answer {
          padding: 20px 25px;
          color: #4b5563;
          line-height: 1.6;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .faq-answer-icon {
          font-size: 16px;
          margin-top: 2px;
        }

        /* Footer */
        .footer {
          background: #1f2937;
          color: white;
          padding: 60px 0 20px;
          margin-top: 80px;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 40px;
          text-align: center;
        }

        .footer-section h4 {
          color: white;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .footer-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .footer-description {
          color: #9ca3af;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .footer-link {
          color: #d1d5db;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: white;
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          margin-top: 40px;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 20px;
          padding-right: 20px;
        }

        .footer-badges {
          display: flex;
          gap: 15px;
        }

        .footer-badge {
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Animations */
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-20px) rotate(10deg); 
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes progressFill {
          0% { width: 0%; }
          50% { width: 75%; }
          100% { width: 100%; }
        }

        .animate-slide-up {
          animation: slideInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        /* Email placeholder styling */
        input[type="email"]::placeholder {
          color: #9ca3af !important;
        }

        input[type="email"]:focus::placeholder {
          color: #d1d5db !important;
        }

        input[type="email"] {
          color: #000000 !important;
          background-color: #ffffff !important;
        }

        input[type="email"]:focus {
          color: #000000 !important;
          background-color: #ffffff !important;
        }

/* Pricing Modal */
.pricing-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pricing-modal {
  background: white;
  border-radius: 24px;
  max-width: 600px;
  margin: 20px;
  padding: 30px;
  position: relative;
}

.modal-header {
  text-align: center;
  margin-bottom: 30px;
}

.modal-title {
  font-size: 28px;
  margin-bottom: 10px;
  color: #1f2937;
}

.modal-subtitle {
  color: #6b7280;
  margin-bottom: 20px;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.modal-pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 900px;
}

.pricing-modal {
  background: white;
  border-radius: 24px;
  max-width: 1000px;
  margin: 20px;
  padding: 40px;
  position: relative;
}

.modal-pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 900px;
}

.modal-pricing-card {
  padding: 30px 25px 25px 25px;
  border: 2px solid #f0f0f0;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  position: relative;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.modal-pricing-card.popular {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 30%, #fde047 70%, #eab308 100%);
  border-color: #eab308;
  box-shadow: 0 10px 30px rgba(234, 179, 8, 0.3);
}
.modal-pricing-card.popular .modal-plan-name,
.modal-pricing-card.popular .modal-price {
  color: #a16207;
  text-shadow: 0 1px 2px rgba(161, 98, 7, 0.2);
}

.modal-pricing-card.premium {
  background: linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 30%, #C7D2FE 70%, #A5B4FC 100%);
  border-color: #8B5CF6;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
  position: relative;
  overflow: visible;
}

.modal-pricing-card.premium::before {
  content: '';
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  animation: shimmer 3s infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.modal-pricing-card.premium .modal-plan-name,
.modal-pricing-card.premium .modal-price {
  background: linear-gradient(135deg, #4c1d95, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-pricing-card .modal-plan-name,
.modal-pricing-card .modal-price {
  color: #475569;
}

.modal-popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  z-index: 1000;
}

.modal-premium-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  z-index: 9999;
}

.modal-plan-header {
  margin-bottom: 20px;
  padding-top: 15px;
}

.modal-plan-name {
  font-size: 22px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 8px;
}

.modal-plan-price {
  margin-bottom: 20px;
}

.modal-price {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  display: block;
}

.modal-price-period {
  color: #6b7280;
  font-size: 13px;
  margin-top: 2px;
}

.modal-plan-features {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;
  flex-grow: 1;
}

.modal-plan-features li {
  padding: 4px 0;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.4;
}

.modal-pricing-button {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.modal-pricing-button.basic {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
}

.modal-pricing-button.pro {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.modal-pricing-button.premium {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 36px;
          }

          .hero-subtitle {
            font-size: 18px;
          }

          .trust-indicators {
            flex-direction: column;
            align-items: center;
          }

          .hero-stats {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .steps-container {
            grid-template-columns: 1fr;
          }

          .step-arrow {
            display: none;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
          }

          .pricing-card.popular {
            transform: none;
          }

          .header-stats {
            display: none;
          }

          .upload-method-selector {
            flex-direction: column;
          }

          .cv-section,
          .faq-section,
          .how-it-works-section {
            padding: 40px 20px;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 28px;
          }

          .section-title {
            font-size: 28px;
          }

          .stat-card {
            padding: 20px;
          }

          .stat-number {
            font-size: 28px;
          }

          .testimonial-card {
            padding: 30px 20px;
          }

          .testimonial-text {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  )
}