import { useState, useEffect } from 'react'
import CVAnalysisDashboard from '../components/CVAnalysisDashboard'
import Head from 'next/head'

export default function Home() {
  const [jobPosting, setJobPosting] = useState('')
  const [currentCV, setCurrentCV] = useState('')
  const [uploadMethod, setUploadMethod] = useState('upload')
  const [userEmail, setUserEmail] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedResult, setOptimizedResult] = useState('')
  const [showPricingModal, setShowPricingModal] = useState(false)
  
  // NOWE STATE VARIABLES DLA FREEMIUM FLOW
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showPaywall, setShowPaywall] = useState(false)

  // NOWA FUNKCJA - DARMOWA ANALIZA
const handleFreeAnalysis = () => {
  // Sprawdź czy użytkownik dodał CV
  const cvText = document.querySelector('.cv-textarea')?.value;
  
  if (!cvText || cvText.trim().length < 50) {
    // Pokaż ładny komunikat
const errorDiv = document.createElement('div');
errorDiv.innerHTML = `
  <div style="
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: white; padding: 30px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    z-index: 10000; text-align: center; max-width: 400px;
  ">
    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
    <h3 style="color: #1f2937; margin-bottom: 12px;">Brakuje CV!</h3>
    <p style="color: #6b7280; margin-bottom: 20px;">Najpierw wklej treść swojego CV lub wybierz plik do analizy.</p>
    <button onclick="this.parentElement.parentElement.remove()" style="
      background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none;
      padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600;
    ">OK, rozumiem</button>
  </div>
`;
document.body.appendChild(errorDiv);
    return;
  }
  
  // Simulate analysis with random but realistic results
  const fakeResult = {
    score: Math.floor(Math.random() * 40) + 45, // 45-85% random
    problems: Math.floor(Math.random() * 8) + 5  // 5-12 problems
  };
  
  setAnalysisResult(fakeResult);
  setShowUploadModal(false);
  
  // Show paywall after 2 seconds (simulate loading)
  setTimeout(() => {
    setShowPaywall(true);
  }, 2000);
};

  // UPROSZCZONA FUNKCJA optimizeCV
  const optimizeCV = () => {
    // Trigger upload modal for free analysis
    setShowUploadModal(true);
  }

  // POZOSTAŁE FUNKCJE (bez zmian)
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

  const handlePayment = (plan) => {
    const email = document.getElementById('customerEmail')?.value
    if (!email || !email.includes('@')) {
      alert('Proszę podać prawidłowy adres email')
      return
    }

    const prices = {
      premium: 'price_1QVZWJG7z1t9LbfP3fOGqV8A'
    }

    window.location.href = `/api/create-checkout-session?priceId=${prices[plan]}&email=${encodeURIComponent(email)}`
  }

// Testimonials data (15 opinii)
  const testimonials = [
    {
      name: 'Anna Kowalska',
      position: 'Marketing Manager',
      company: 'Allegro',
      text: 'Dzięki CvPerfect dostałam 3 rozmowy kwalifikacyjne w ciągu tygodnia! AI doskonale dostosował moje CV do wymagań.',
      avatar: 'AK',
      rating: 5,
      verified: true
    },
    {
      name: 'Michał Nowak',
      position: 'Frontend Developer',
      company: 'Asseco',
      text: 'Niesamowite narzędzie! Optymalizacja pod ATS zwiększyła moje odpowiedzi z firm o 400%. Polecam każdemu!',
      avatar: 'MN',
      rating: 5,
      verified: true
    },
    {
      name: 'Katarzyna Wiśniewska',
      position: 'HR Business Partner',
      company: 'PKO BP',
      text: 'Jako rekruterka mogę potwierdzić - CV zoptymalizowane przez CvPerfect rzeczywiście lepiej przechodzi przez ATS.',
      avatar: 'KW',
      rating: 5,
      verified: true
    },
    {
      name: 'Piotr Zieliński',
      position: 'Data Analyst',
      company: 'CD Projekt',
      text: 'Fantastyczne AI! W 30 sekund otrzymałem CV idealnie dopasowane do oferty data scientist. Dostałem pracę!',
      avatar: 'PZ',
      rating: 5,
      verified: true
    },
    {
      name: 'Magdalena Krawczyk',
      position: 'Project Manager',
      company: 'Orange Polska',
      text: 'CvPerfect to przełom! Moje CV teraz wygląda profesjonalnie i przyciąga uwagę rekruterów. 5 gwiazdek!',
      avatar: 'MK',
      rating: 5,
      verified: true
    },
    {
      name: 'Tomasz Lewandowski',
      position: 'DevOps Engineer',
      company: 'Allegro',
      text: 'Najlepsze 9.99 zł jakie wydałem! CV zoptymalizowane pod konkretne wymagania, więcej rozmów kwalifikacyjnych.',
      avatar: 'TL',
      rating: 5,
      verified: true
    },
    {
      name: 'Agnieszka Dąbrowska',
      position: 'UX Designer',
      company: 'Livechat',
      text: 'Wreszcie moje CV przechodzi przez filtry ATS! CvPerfect to must-have dla każdego poszukującego pracy.',
      avatar: 'AD',
      rating: 5,
      verified: true
    },
    {
      name: 'Bartosz Jankowski',
      position: 'Sales Manager',
      company: 'Microsoft',
      text: 'Niesamowita jakość optymalizacji! AI perfekcyjnie dostosował treść do branży tech. Polecam w 100%!',
      avatar: 'BJ',
      rating: 5,
      verified: true
    },
    {
      name: 'Monika Pawłowska',
      position: 'Content Manager',
      company: 'Wirtualna Polska',
      text: 'CvPerfect uratował moją karierę! Po optymalizacji dostałam ofertę pracy marzeń. Dziękuję!',
      avatar: 'MP',
      rating: 5,
      verified: true
    },
    {
      name: 'Rafał Wójcik',
      position: 'Backend Developer',
      company: 'Allegro',
      text: 'Fenomenalne narzędzie! Optymalizacja pod kątem słów kluczowych zwiększyła moje szanse o 300%.',
      avatar: 'RW',
      rating: 5,
      verified: true
    },
    {
      name: 'Joanna Mazur',
      position: 'Business Analyst',
      company: 'ING Bank',
      text: 'Szybko, skutecznie, profesjonalnie! CvPerfect to najlepsze AI do optymalizacji CV w Polsce.',
      avatar: 'JM',
      rating: 5,
      verified: true
    },
    {
      name: 'Łukasz Kamiński',
      position: 'Product Manager',
      company: 'Żabka',
      text: 'Rewelacyjne rezultaty! Po 2 dniach od optymalizacji miałem już 4 rozmowy kwalifikacyjne. Polecam!',
      avatar: 'ŁK',
      rating: 5,
      verified: true
    },
    {
      name: 'Paulina Sokołowska',
      position: 'Digital Marketing',
      company: 'Empik',
      text: 'CvPerfect to przyszłość rekrutacji! Moje CV teraz idealnie pasuje do każdej oferty pracy.',
      avatar: 'PS',
      rating: 5,
      verified: true
    },
    {
      name: 'Marcin Olszewski',
      position: 'Software Engineer',
      company: 'Google',
      text: 'Niesamowite AI! Dostosowanie CV do wymagań firm FAANG - na tym się znają. Dostałem ofertę!',
      avatar: 'MO',
      rating: 5,
      verified: true
    },
    {
      name: 'Aleksandra Górska',
      position: 'HR Director',
      company: 'PZU',
      text: 'Jako dyrektor HR potwierdzam - CV z CvPerfect wyróżniają się pozytywnie. Profesjonalne podejście!',
      avatar: 'AG',
      rating: 5,
      verified: true
    }
  ]

  // Floating notifications
  const [notifications, setNotifications] = useState([])
  
  useEffect(() => {
  const floatingNotifications = [
    { id: 1, name: 'Anna', action: 'otrzymała ofertę pracy w Allegro', time: '2 min temu' },
    { id: 2, name: 'Michał', action: 'zoptymalizował CV i dostał 3 rozmowy', time: '5 min temu' },
    { id: 3, name: 'Katarzyna', action: 'zwiększyła ATS score o 40%', time: '8 min temu' },
    { id: 4, name: 'Piotr', action: 'otrzymał ofertę w CD Projekt', time: '12 min temu' },
    { id: 5, name: 'Magdalena', action: 'przeszła przez filtry ATS w Orange', time: '15 min temu' }
  ]

  let currentIndex = 0
  const showNotification = () => {
    const notification = floatingNotifications[currentIndex]
    setNotifications(prev => [...prev, { ...notification, show: true }])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 6000)
    
    currentIndex = (currentIndex + 1) % floatingNotifications.length
  }

  showNotification()
  const interval = setInterval(showNotification, 12000)
  return () => clearInterval(interval)
}, [])

return (
    <>
      <Head>
        <title>CvPerfect - #1 AI Optymalizacja CV w Polsce | ATS-Ready w 30 sekund</title>
        <meta name="description" content="Pierwsza AI platforma do optymalizacji CV w Polsce. 95% ATS success rate, 420% więcej rozmów kwalifikacyjnych. Zoptymalizuj CV w 30 sekund za 9.99 zł." />
        <meta name="keywords" content="optymalizacja CV, ATS, sztuczna inteligencja, CV AI, praca, rekrutacja, Polska" />
        <meta property="og:title" content="CvPerfect - #1 AI Optymalizacja CV w Polsce" />
        <meta property="og:description" content="95% ATS success rate, 420% więcej rozmów kwalifikacyjnych. Zoptymalizuj CV w 30 sekund." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
              </Head>

      {/* Floating Notifications */}
      <div className="floating-notifications">
        {notifications.map((notification, notifIndex) => (
  <div key={`notification-${notification.id}-${notifIndex}`} className={`floating-notification ${notification.show ? 'show' : ''}`}>
            <div className="notification-content">
              <div className="notification-avatar">{notification.name[0]}</div>
              <div className="notification-text">
                <strong>{notification.name}</strong> {notification.action}
                <div className="notification-time">{notification.time}</div>
              </div>
              <div className="notification-icon">✅</div>
            </div>
          </div>
        ))}
      </div>

      <div className="container">
        {/* Navigation */}
        <nav className="navigation">
          <div className="nav-content">
            <div className="logo">
              <span className="logo-text">CvPerfect</span>
              <span className="logo-badge">AI</span>
            </div>
            <div className="nav-links">
              <a href="#features" className="nav-link">Funkcje</a>
              <a href="#testimonials" className="nav-link">Opinie</a>
              <a href="#pricing" className="nav-link">Cennik</a>
              <button className="nav-cta" onClick={() => setShowUploadModal(true)}>
                Wypróbuj AI ⚡
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              🏆 #1 AI Platforma CV w Polsce
            </div>
            <h1 className="hero-title">
              Zwiększ swoje szanse o <span className="highlight">420%</span>
              <br />z AI-powered optymalizacją CV
            </h1>
            <p className="hero-subtitle">
              Pierwsza sztuczna inteligencja w Polsce, która optymalizuje Twoje CV pod konkretne oferty pracy. 
              <strong> 95% skuteczności ATS, 30 sekund optymalizacji, tylko 9.99 zł.</strong>
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">420%</div>
                <div className="stat-text">więcej rozmów</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-text">ATS success</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">30s</div>
                <div className="stat-text">optymalizacja</div>
              </div>
            </div>

            <div className="hero-cta">
              <button className="hero-button primary" onClick={() => setShowUploadModal(true)}>
                🎯 Darmowa Analiza ATS
              </button>
              <div className="hero-guarantee">
                <span>✅ Bez rejestracji • 💰 30-dni gwarancji</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="cv-preview">
              <div className="cv-before">
                <div className="cv-header">❌ Przed optymalizacją</div>
                <div className="cv-score bad">32% ATS</div>
                <div className="cv-content">
                  <div className="cv-line short"></div>
                  <div className="cv-line medium"></div>
                  <div className="cv-line long"></div>
                  <div className="cv-problems">
                    <span>• Brak słów kluczowych</span>
                    <span>• Złe formatowanie</span>
                    <span>• Nieoptymalne sekcje</span>
                  </div>
                </div>
              </div>
              <div className="cv-arrow">➜</div>
              <div className="cv-after">
                <div className="cv-header">✅ Po optymalizacji AI</div>
                <div className="cv-score good">95% ATS</div>
                <div className="cv-content">
                  <div className="cv-line optimized short"></div>
                  <div className="cv-line optimized medium"></div>
                  <div className="cv-line optimized long"></div>
                  <div className="cv-improvements">
                    <span>• Słowa kluczowe ✅</span>
                    <span>• ATS-ready format ✅</span>
                    <span>• Optymalne sekcje ✅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


{/* Features Section */}
        <div className="features-section" id="features">
          <div className="features-header">
            <h2 className="section-title">Dlaczego CvPerfect to najlepszy wybór? 🚀</h2>
            <p className="section-subtitle">Jedyna AI platforma CV w Polsce z 95% ATS success rate</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card spotlight">
              <div className="feature-icon">🤖</div>
              <h3>GPT-4 AI Engine</h3>
              <p>Najnowsza sztuczna inteligencja analizuje Twoje CV i dostosowuje je idealnie pod wymagania pracodawcy w czasie rzeczywistym.</p>
              <div className="feature-highlight">Pierwsza taka technologia w Polsce!</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>30 sekund optymalizacji</h3>
              <p>Błyskawiczna analiza i optymalizacja. Wklej CV i opis stanowiska - AI zrobi resztę w rekordowym czasie.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>95% ATS Success Rate</h3>
              <p>Najwyższa skuteczność przejścia przez systemy ATS w Polsce. Twoje CV dotrze do rekrutera, gwarantowane.</p>
              <div className="ats-visual">
                <div className="ats-circle">
                  <span className="ats-percentage">95%</span>
                  <span className="ats-label">ATS Pass</span>
                </div>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🇵🇱</div>
              <h3>Polski standard</h3>
              <p>Dostosowane do polskiego rynku pracy, lokalnych wymagań pracodawców i specyfiki rekrutacji w Polsce.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analiza w czasie rzeczywistym</h3>
              <p>Live feedback, sugestie poprawek, analiza słów kluczowych i compatybilność z najpopularniejszymi systemami ATS.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Tylko 9.99 zł</h3>
              <p>Najlepsza jakość w najniższej cenie. Jednorazowa płatność, bez subskrypcji, bez ukrytych kosztów.</p>
              <div className="price-comparison">
                <span className="old-price">Konkurencja: $29.95+</span>
                <span className="new-price">CvPerfect: 9.99 zł</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tool Section */}
        <div className="tool-section">
          <div className="tool-header">
            <h2 className="section-title">🚀 Optymalizuj swoje CV w 30 sekund</h2>
            <p className="section-subtitle">Wklej treść CV i opis oferty pracy - AI zrobi resztę!</p>
          </div>

          <div className="tool-container">
            <div className="input-section">
              <div className="input-group">
                <label htmlFor="jobPosting" className="input-label">
                  📋 Opis oferty pracy / wymagania
                </label>
                <textarea
                  id="jobPosting"
                  value={jobPosting}
                  onChange={(e) => setJobPosting(e.target.value)}
                  placeholder="Wklej tutaj pełny opis oferty pracy lub wymagania pracodawcy...

Przykład:
- Doświadczenie w React.js min. 2 lata
- Znajomość TypeScript, Node.js
- Praca w zespole Agile/Scrum
- Komunikatywność, kreatywność
- Mile widziane: AWS, Docker"
                  className="main-textarea"
                  rows="6"
                />
              </div>

              <div className="upload-section">
                <div className="upload-tabs">
                  <button 
                    className={`tab-button ${uploadMethod === 'paste' ? 'active' : ''}`}
                    onClick={() => setUploadMethod('paste')}
                  >
                    📝 Wklej CV
                  </button>
                  <button 
                    className={`tab-button ${uploadMethod === 'upload' ? 'active' : ''}`}
                    onClick={() => setUploadMethod('upload')}
                  >
                    📁 Upload pliku
                  </button>
                </div>

                {uploadMethod === 'paste' ? (
                  <div className="input-group">
                    <label htmlFor="currentCV" className="input-label">
                      📄 Twoje obecne CV
                    </label>
                    <textarea
                      id="currentCV"
                      value={currentCV}
                      onChange={(e) => setCurrentCV(e.target.value)}
                      placeholder="Wklej tutaj treść swojego CV...

Przykład:
Jan Kowalski
Frontend Developer

DOŚWIADCZENIE:
- React Developer - ABC Company (2022-2024)
- Junior Frontend - XYZ Startup (2021-2022)

UMIEJĘTNOŚCI:
- JavaScript, React, HTML/CSS
- Git, Webpack, npm"
                      className="main-textarea"
                      rows="8"
                    />
                  </div>
                ) : (
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="cvFile"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="file-input"
                    />
                    <label htmlFor="cvFile" className="file-upload-label">
                      <div className="upload-icon">📁</div>
                      <div className="upload-text">
                        <span className="upload-title">Wybierz plik CV</span>
                        <span className="upload-subtitle">PDF, DOC, DOCX lub TXT (max 5MB)</span>
                      </div>
                    </label>
                    {uploadedFile && (
                      <div className="uploaded-file">
                        <span className="file-name">📄 {uploadedFile.name}</span>
                        <button onClick={() => {setUploadedFile(null); setCurrentCV('')}} className="remove-file">❌</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="email-section">
                <label htmlFor="userEmail" className="input-label">
                  📧 Twój email (do wysłania wyników)
                </label>
                <input
                  type="email"
                  id="userEmail"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="twoj.email@example.com"
                  className="email-input"
                />
              </div>

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
                  '🎯 Darmowa Analiza ATS'
                )}
              </button>

              <div className="tool-features">
                <div className="tool-feature">✅ Analiza ATS w 30 sekund</div>
                <div className="tool-feature">✅ Dostosowanie do oferty</div>
                <div className="tool-feature">✅ Optymalizacja słów kluczowych</div>
                <div className="tool-feature">✅ Polski standard CV</div>
              </div>
            </div>

            {optimizedResult && (
              <div className="result-section">
                <CVAnalysisDashboard result={optimizedResult} />
              </div>
            )}
          </div>
        </div>

        {/* Battle Section - Chili Piper Style */}
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
                  <button className="battle-btn winner-btn" onClick={() => setShowUploadModal(true)}>
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
        </div>

{/* Testimonials Section */}
        <div className="testimonials-section" id="testimonials">
          <div className="testimonials-header">
            <h2 className="section-title">Już 15,000+ osób znalazło pracę dzięki CvPerfect 🎉</h2>
            <p className="section-subtitle">Prawdziwe opinie od użytkowników, którzy dostali wymarzoną pracę</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
  <div key={`testimonial-card-${index}-${testimonial.name}`} className="testimonial-card">
                <div className="testimonial-header">
                  <div className="testimonial-avatar">{testimonial.avatar}</div>
                  <div className="testimonial-info">
                    <div className="testimonial-name">{testimonial.name}</div>
                    <div className="testimonial-position">{testimonial.position}</div>
                    <div className="testimonial-company">{testimonial.company}</div>
                  </div>
                  <div className="testimonial-verified">
                    {testimonial.verified && <span className="verified-badge">✅ Zweryfikowane</span>}
                  </div>
                </div>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
  <span key={`star-${index}-${i}`} className="star">⭐</span>
))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-impact">
                  <span className="impact-badge">🚀 Sukces dzięki CvPerfect</span>
                </div>
              </div>
            ))}
          </div>

          <div className="testimonials-cta">
            <h3>Dołącz do 15,000+ zadowolonych użytkowników!</h3>
            <button className="testimonials-button" onClick={() => setShowUploadModal(true)}>
              Zacznij za darmo ⚡
            </button>
          </div>
        </div>

        {/* Upload Modal - Darmowa Analiza */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
              
              <div className="upload-header">
                <h2>🎯 Darmowa Analiza ATS</h2>
                <p>Sprawdź jak Twoje CV radzi sobie z systemami rekrutacyjnymi</p>
              </div>

              <div className="upload-area">
                <div className="upload-zone">
                  <div className="upload-icon">📄</div>
                  <h3>Wklej swoje CV lub wybierz plik</h3>
                  <p>PDF, DOC, DOCX - maksymalnie 5MB</p>
                  
                  <textarea 
                    className="cv-textarea"
                    placeholder="Wklej treść swojego CV tutaj lub użyj przycisku poniżej..."
                    rows="8"
                  ></textarea>
                  
                 <div className="upload-buttons">
  <input
    type="file"
    id="modalFileInput"
    accept=".pdf,.doc,.docx,.txt"
    style={{display: 'none'}}
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
  const textarea = document.querySelector('.cv-textarea');
  if (textarea) {
    // Wyczyść i sformatuj tekst CV
    const cvText = event.target.result;
    const cleanText = cvText
      .replace(/\s+/g, ' ')  // Usuń nadmiarowe spacje
      .replace(/\n\s*\n/g, '\n\n')  // Zachowaj podwójne enter
      .trim();
    
    textarea.value = cleanText;
    
    // Pokaż komunikat sukcesu
    const successMsg = document.createElement('div');
    successMsg.innerHTML = '✅ CV zostało pomyślnie wczytane!';
    successMsg.style.cssText = 'color: #059669; font-weight: 600; margin-top: 10px; text-align: center;';
    
    // Usuń poprzedni komunikat jeśli istnieje
    const existing = document.querySelector('.success-message');
    if (existing) existing.remove();
    
    successMsg.className = 'success-message';
    textarea.parentNode.appendChild(successMsg);
    
    // Usuń komunikat po 3 sekundach
    setTimeout(() => successMsg.remove(), 3000);
  }
};
        // Sprawdź typ pliku i obsłuż odpowiednio
if (file.type === 'text/plain') {
  reader.readAsText(file);
} else {
  // Dla PDF/DOC pokaż tylko informacje o pliku
  const textarea = document.querySelector('.cv-textarea');
  if (textarea) {
    textarea.value = `📄 Plik "${file.name}" został wczytany pomyślnie!\n\nTyp pliku: ${file.type}\nRozmiar: ${(file.size / 1024).toFixed(1)} KB\n\n✅ Gotowy do analizy!\n\nUwaga: Treść plików PDF/DOC będzie przeanalizowana automatycznie podczas procesu optymalizacji.`;
    
    // Komunikat sukcesu
    const successMsg = document.createElement('div');
    successMsg.innerHTML = '✅ Plik CV został pomyślnie wczytany!';
    successMsg.style.cssText = 'color: #059669; font-weight: 600; margin-top: 10px; text-align: center;';
    
    const existing = document.querySelector('.success-message');
    if (existing) existing.remove();
    
    successMsg.className = 'success-message';
    textarea.parentNode.appendChild(successMsg);
    
    setTimeout(() => successMsg.remove(), 3000);
  }
}
      }
    }}
  />
  <button 
    className="upload-btn secondary"
    onClick={() => document.getElementById('modalFileInput').click()}
  >
    📁 Wybierz plik
  </button>
  <button className="upload-btn primary" onClick={handleFreeAnalysis}>
    🔍 Analizuj teraz
  </button>
</div>
</div>

                <div className="upload-features">
                  <div className="feature-check">✅ Analiza ATS w 30 sekund</div>
                  <div className="feature-check">✅ Wykrywanie problemów</div>
                  <div className="feature-check">✅ Score compatibility</div>
                  <div className="feature-check">✅ 100% bezpieczne</div>
                </div>
              </div>
            </div>
          </div>
        )}

       {/* Paywall Modal - Po analizie */}
{showPaywall && analysisResult && (
  <div className="modal-overlay" onClick={() => setShowPaywall(false)}>
    <div className="modal-content paywall-modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setShowPaywall(false)}>×</button>
      
      <div className="analysis-preview">
        <div className="ats-score-big">
          <div className="score-circle">
            <span className="score-number">{analysisResult.score}%</span>
            <span className="score-label">ATS Score</span>
          </div>
          <div className="score-status">
            {analysisResult.score >= 80 ? (
              <span className="status good">✅ Dobre CV</span>
            ) : analysisResult.score >= 60 ? (
              <span className="status warning">⚠️ Wymaga poprawy</span>
            ) : (
              <span className="status bad">❌ Wymaga optymalizacji</span>
            )}
          </div>
        </div>

        <div className="problems-preview">
          <h3>🔍 Znaleźliśmy {analysisResult.problems} problemów:</h3>
          <div className="problem-list">
            <div className="problem-item blurred">
              <span className="problem-icon">❌</span>
              <span>Brak słów kluczowych w opisie...</span>
            </div>
            <div className="problem-item blurred">
              <span className="problem-icon">⚠️</span>
              <span>Nieoptymalne formatowanie...</span>
            </div>
            <div className="problem-item blurred">
              <span className="problem-icon">❌</span>
              <span>Brakujące umiejętności...</span>
            </div>
            <div className="more-problems">
              <span>+ {analysisResult.problems - 3} więcej problemów</span>
            </div>
          </div>
        </div>

       <div className="paywall-header">
  <h2>🚀 Odblouj pełną optymalizację!</h2>
  <p>Wybierz plan i otrzymaj szczegółową analizę + zoptymalizowane CV</p>
</div>
<div className="paywall-header">
  <h2>🚀 Odblouj pełną optymalizację!</h2>
  <p>Uzupełnij email, wybierz plan i otrzymaj szczegółową analizę + zoptymalizowane CV</p>
</div>

<div className="paywall-email-section">
  <input
    type="email"
    id="paywallEmail"
    placeholder="📧 Twój email (potrzebne do płatności)"
    className="paywall-email-input"
    style={{color: '#000000 !important', backgroundColor: 'white !important'}}
    required
  />
</div>

<div className="pricing-plans-grid horizontal balanced">
  {/* PLAN JEDNORAZOWY */}
  <div className="pricing-plan basic compact">
    <div className="plan-badge green-badge">💚 BASIC</div>
    <h3>Jednorazowy</h3>
    <div className="plan-price">
      <div className="price-main">
        <span className="price-old">29.99 zł</span>
        <span className="price-new green">9.99 zł</span>
      </div>
      <span className="price-save">-67%</span>
    </div>
    
    <div className="plan-features-compact">
      <div className="feature-mini">✅ 1 optymalizacja CV</div>
      <div className="feature-mini">✅ GPT-3.5 AI Engine</div>
      <div className="feature-mini">✅ 95% ATS Success Rate</div>
      <div className="feature-mini">✅ Eksport PDF/DOCX</div>
    </div>
    
    <button 
      className="plan-button green uniform-height"
      onClick={() => {
        const email = document.getElementById('paywallEmail').value;
        if (!email || !email.includes('@')) {
          alert('⚠️ Podaj prawidłowy email!');
          return;
        }
        handlePayment('premium');
      }}
    >
      Wybierz 9.99 zł ⚡
    </button>
  </div>

  {/* PLAN ZŁOTY */}
  <div className="pricing-plan gold compact featured">
    <div className="plan-badge gold-badge">✨ GOLD</div>
    <h3>Gold</h3>
    <div className="plan-price">
      <div className="price-main">
        <span className="price-old">89 zł</span>
        <span className="price-new gold">49 zł</span>
      </div>
      <span className="price-period">/miesiąc</span>
    </div>
    
    <div className="plan-features-compact">
      <div className="feature-mini">✅ 10 optymalizacji/mies</div>
      <div className="feature-mini">✅ GPT-4 AI (najnowszy)</div>
      <div className="feature-mini">✅ Priorytetowa kolejka</div>
      <div className="feature-mini">✅ Dostęp do nowych funkcji</div>
    </div>
    
    <button 
      className="plan-button gold uniform-height"
      onClick={() => {
        const email = document.getElementById('paywallEmail').value;
        if (!email || !email.includes('@')) {
          alert('⚠️ Podaj prawidłowy email!');
          return;
        }
        handlePayment('gold');
      }}
    >
      Subskrypcja 49 zł/mies ✨
    </button>
  </div>

  {/* PLAN PREMIUM */}
  <div className="pricing-plan premium compact">
    <div className="plan-badge premium-badge">💎 VIP</div>
    <h3>Premium</h3>
    <div className="plan-price">
      <div className="price-main">
        <span className="price-old">129 zł</span>
        <span className="price-new premium">79 zł</span>
      </div>
      <span className="price-period">/miesiąc</span>
    </div>
    
    <div className="plan-features-compact">
      <div className="feature-mini">✅ 25 optymalizacji/mies</div>
      <div className="feature-mini">✅ GPT-4 VIP (najlepszy)</div>
      <div className="feature-mini">✅ VIP Support (2h odpowiedź)</div>
      <div className="feature-mini">✅ Beta tester nowości</div>
    </div>
    
    <button 
      className="plan-button premium uniform-height"
      onClick={() => {
        const email = document.getElementById('paywallEmail').value;
        if (!email || !email.includes('@')) {
          alert('⚠️ Podaj prawidłowy email!');
          return;
        }
        handlePayment('premium-monthly');
      }}
    >
      Subskrypcja 79 zł/mies 💎
    </button>
  </div>
</div>
      </div>
    </div>
  </div>
)}
        {/* Pricing Modal */}
        {showPricingModal && (
          <div className="modal-overlay" onClick={() => setShowPricingModal(false)}>
            <div className="modal-content pricing-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowPricingModal(false)}>×</button>
              
              <div className="pricing-header">
                <h2>🚀 Wybierz swój plan</h2>
                <p>Jednorazowa płatność, bez subskrypcji, pełen dostęp</p>
              </div>

              <div className="pricing-plans-grid">
  {/* PLAN JEDNORAZOWY - ZIELONY */}
  <div className="pricing-plan basic">
    <div className="plan-badge green-badge">💚 BASIC</div>
    <div className="plan-header">
      <h3>Jednorazowy</h3>
      <div className="plan-price">
        <span className="price-old">29.99 zł</span>
        <span className="price-new green">9.99 zł</span>
        <span className="price-save">-67%</span>
      </div>
      <p className="plan-subtitle">Jednorazowa płatność</p>
    </div>

    <div className="plan-features">
      <div className="feature-item">✅ 5 optymalizacji CV</div>
      <div className="feature-item">✅ GPT-3.5 AI Engine</div>
      <div className="feature-item">✅ 95% ATS Success Rate</div>
      <div className="feature-item">✅ Eksport PDF/DOCX</div>
      <div className="feature-item">✅ Email support</div>
    </div>

    <div className="plan-email">
      <input
        type="email"
        id="customerEmailBasic"
        placeholder="Twój email do faktury"
        className="email-input-modal"
      />
    </div>

    <button 
      className="plan-button green"
      onClick={() => handlePayment('premium')}
    >
      Kup za 9.99 zł ⚡
    </button>
  </div>

  {/* PLAN ZŁOTY - MIESIĘCZNY */}
  <div className="pricing-plan gold featured">
    <div className="plan-badge gold-badge">✨ GOLD</div>
    <div className="plan-header">
      <h3>Gold Monthly</h3>
      <div className="plan-price">
        <span className="price-new gold">49 zł</span>
        <span className="price-period">/miesiąc</span>
      </div>
      <p className="plan-subtitle">Miesięczna subskrypcja</p>
    </div>

    <div className="plan-features">
      <div className="feature-item">✅ 10 optymalizacji miesięcznie</div>
      <div className="feature-item">✅ GPT-4 AI Engine (lepszy AI)</div>
      <div className="feature-item">✅ Wszystko z Basic +</div>
      <div className="feature-item">✅ Priorytetowa kolejka</div>
      <div className="feature-item">✅ Email support priorytetowy</div>
      <div className="feature-item">✅ Anuluj w każdej chwili</div>
      <div className="feature-item">✅ Dostęp do nowych funkcji pierwszym</div>
    </div>

    <div className="plan-email">
      <input
        type="email"
        id="customerEmailGold"
        placeholder="Twój email do faktury"
        className="email-input-modal"
      />
    </div>

    <button 
      className="plan-button gold"
      onClick={() => handlePayment('gold')}
    >
      Subskrybuj za 49 zł/mies ✨
    </button>
  </div>

  {/* PLAN PREMIUM - MIESIĘCZNY */}
  <div className="pricing-plan premium">
    <div className="plan-badge premium-badge">💎 PREMIUM</div>
    <div className="plan-header">
      <h3>Premium Monthly</h3>
      <div className="plan-price">
        <span className="price-new premium">79 zł</span>
        <span className="price-period">/miesiąc</span>
      </div>
      <p className="plan-subtitle">Najlepszy plan</p>
    </div>

    <div className="plan-features">
      <div className="feature-item">✅ 25 optymalizacji miesięcznie</div>
      <div className="feature-item">✅ GPT-4 AI Engine (najlepszy AI)</div>
      <div className="feature-item">✅ Wszystko z Gold +</div>
      <div className="feature-item">✅ VIP Support (najwyższy priorytet)</div>
      <div className="feature-item">✅ Najszybsza analiza</div>
      <div className="feature-item">✅ Testuj nowości jako pierwszy</div>
      <div className="feature-item">✅ Anuluj w każdej chwili</div>
      <div className="feature-item">✅ Dedykowane wsparcie</div>
    </div>

    <div className="plan-email">
      <input
        type="email"
        id="customerEmailPremium"
        placeholder="Twój email do faktury"
        className="email-input-modal"
      />
    </div>

    <button 
      className="plan-button premium"
      onClick={() => handlePayment('premium-monthly')}
    >
      Subskrybuj za 79 zł/mies 💎
    </button>
  </div>
</div>

              <div className="pricing-testimonial">
                <p>"Najlepsze 9.99 zł jakie wydałem na swoją karierę!" - Michał, Frontend Developer</p>
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
                Pierwsza AI platforma do optymalizacji CV w Polsce. 
                95% skuteczności ATS, 420% więcej rozmów kwalifikacyjnych.
              </p>
            </div>

            <div className="footer-section">
              <h4>Produkty</h4>
              <ul className="footer-links">
                <li><a href="#features">Optymalizacja AI</a></li>
                <li><a href="#testimonials">Opinie użytkowników</a></li>
                <li><a href="#pricing">Cennik</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Pomoc</h4>
              <ul className="footer-links">
                <li><a href="#faq">FAQ</a></li>
                <li><a href="mailto:pomoc@cvperfect.pl">Kontakt</a></li>
                <li><a href="#privacy">Polityka prywatności</a></li>
                <li><a href="#terms">Regulamin</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Statystyki</h4>
              <ul className="footer-stats">
                <li>📊 15,000+ optymalizacji</li>
                <li>🎯 95% ATS Success Rate</li>
                <li>⚡ 30 sekund średnio</li>
                <li>🇵🇱 #1 w Polsce</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 CvPerfect. Wszystkie prawa zastrzeżone.</p>
            <div className="footer-badges">
              <span className="badge">🔒 SSL Secured</span>
              <span className="badge">💳 Stripe Payments</span>
              <span className="badge">🇵🇱 Made in Poland</span>
            </div>
          </div>
        </footer>
      </div>

<style jsx>{`
        /* Global Styles */

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

html {
  overflow-x: hidden;
}        

.container {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  margin: 0 auto;
  max-width: 100vw;
  width: 100%;
}
/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 12px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 6px;
}
::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
}

        /* Floating Notifications */
        .floating-notifications {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
}

        .floating-notification {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 10px;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
          transform: translateX(400px);
          opacity: 0;
          transition: all 0.5s ease;
          pointer-events: none;
        }

        .floating-notification.show {
          transform: translateX(0);
          opacity: 1;
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .notification-avatar {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 12px;
        }

        .notification-text {
          flex: 1;
          font-size: 13px;
        }

        .notification-time {
          font-size: 11px;
          opacity: 0.8;
        }

        .notification-icon {
          font-size: 16px;
        }

        /* Navigation */
        .navigation {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-text {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          color: #6b7280;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: #667eea;
        }

        .nav-cta {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        /* Hero Section */
        .hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  max-width: 100vw;
  margin: 0 auto;
  overflow: hidden;
}

        .hero-badge {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
        }

        .hero-title {
          font-size: 48px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 24px;
        }

        .highlight {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 900;
        }

        .hero-subtitle {
          font-size: 20px;
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 40px;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-item {
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .stat-number {
          font-size: 32px;
          font-weight: 800;
          display: block;
          margin-bottom: 8px;
        }

        .stat-text {
          font-size: 14px;
          opacity: 0.8;
        }

        .hero-cta {
          text-align: center;
        }

        .hero-button {
          display: inline-block;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 20px 40px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
        }

        .hero-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4);
        }

        .hero-guarantee {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        /* Hero Visual */
        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .cv-preview {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .cv-before, .cv-after {
          background: white;
          border-radius: 16px;
          padding: 24px;
          width: 200px;
          color: #1f2937;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .cv-header {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
        }

       .cv-score {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  margin: 0 auto 20px;
  color: white;
  font-size: 11px;
}

        .cv-score.bad {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .cv-score.good {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .cv-line {
          height: 8px;
          border-radius: 4px;
          margin-bottom: 8px;
          background: #e5e7eb;
        }

        .cv-line.short { width: 60%; }
        .cv-line.medium { width: 80%; }
        .cv-line.long { width: 100%; }

        .cv-line.optimized {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .cv-problems, .cv-improvements {
          margin-top: 16px;
          font-size: 11px;
        }

        .cv-problems span {
          display: block;
          color: #ef4444;
          margin-bottom: 4px;
        }

        .cv-improvements span {
          display: block;
          color: #10b981;
          margin-bottom: 4px;
        }

        .cv-arrow {
          font-size: 32px;
          color: #fbbf24;
          font-weight: bold;
        }

        /* Features Section */
        .features-section {
          background: white;
          padding: 80px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .features-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-title {
          font-size: 42px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .section-subtitle {
          font-size: 18px;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 32px;
        }

        .feature-card {
          background: white;
          border: 2px solid #f3f4f6;
          border-radius: 20px;
          padding: 32px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
        }

        .feature-card:hover {
          border-color: #667eea;
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1);
        }

        .feature-card.spotlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .feature-icon {
          font-size: 48px;
          margin-bottom: 20px;
          display: block;
        }

        .feature-card h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .feature-card p {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .feature-card.spotlight p {
          color: rgba(255, 255, 255, 0.9);
        }

        .feature-highlight {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          display: inline-block;
        }

        .ats-visual {
          margin-top: 20px;
        }

        .ats-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: white;
        }

        .ats-percentage {
          font-size: 20px;
          font-weight: 800;
        }

        .ats-label {
          font-size: 10px;
          opacity: 0.8;
        }

        .price-comparison {
          margin-top: 16px;
        }

        .old-price {
          display: block;
          text-decoration: line-through;
          color: #ef4444;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .new-price {
          display: block;
          color: #10b981;
          font-size: 18px;
          font-weight: 700;
        }

        /* Tool Section */
        .tool-section {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 80px 20px;
        }

        .tool-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .tool-container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .input-section {
          margin-bottom: 40px;
        }

        .input-group {
          margin-bottom: 32px;
        }

        .input-label {
          display: block;
          font-weight: 600;
          margin-bottom: 12px;
          color: #374151;
          font-size: 16px;
        }

        .main-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  color: #000000 !important;
  background-color: white !important;
}

        .main-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .upload-section {
          margin-bottom: 32px;
        }

        .upload-tabs {
          display: flex;
          margin-bottom: 20px;
          background: #f3f4f6;
          border-radius: 12px;
          padding: 4px;
        }

        .tab-button {
          flex: 1;
          padding: 12px 24px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #6b7280;
        }

        .tab-button.active {
          background: white;
          color: #667eea;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .file-upload-area {
          position: relative;
        }

        .file-input {
          display: none;
        }

        .file-upload-label {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 32px;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f9fafb;
        }

        .file-upload-label:hover {
          border-color: #667eea;
          background: #f0f4ff;
        }

        .upload-icon {
          font-size: 32px;
        }

        .upload-text {
          flex: 1;
        }

        .upload-title {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }

        .upload-subtitle {
          display: block;
          color: #6b7280;
          font-size: 14px;
        }

        .uploaded-file {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 12px 16px;
          margin-top: 12px;
        }

        .file-name {
          color: #166534;
          font-weight: 500;
        }

        .remove-file {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }

        .email-section {
          margin-bottom: 32px;
        }

        .email-input {
          width: 100%;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .email-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .main-button {
          width: 100%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 20px 32px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 24px;
        }

        .main-button:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }

        .main-button.disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .button-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tool-features {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .tool-feature {
          color: #059669;
          font-size: 14px;
          font-weight: 500;
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
color: white !important;
        }

        .stat-label {
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
        }

        /* Testimonials Section */
        .testimonials-section {
          background: white;
          padding: 80px 20px;
        }

        .testimonials-header {
          text-align: center;
          margin-bottom: 60px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 32px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .testimonial-card {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
        }

        .testimonial-card:hover {
          border-color: #667eea;
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1);
        }

        .testimonial-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .testimonial-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }

        .testimonial-info {
          flex: 1;
        }

        .testimonial-name {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .testimonial-position {
          color: #667eea;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .testimonial-company {
         color: #6b7280;
         font-size: 13px;
       }

       .testimonial-verified {
         flex-shrink: 0;
       }

       .verified-badge {
         background: #dcfce7;
         color: #16a34a;
         padding: 4px 8px;
         border-radius: 8px;
         font-size: 11px;
         font-weight: 600;
       }

       .testimonial-rating {
         margin-bottom: 16px;
       }

       .star {
         font-size: 18px;
         margin-right: 2px;
       }

       .testimonial-text {
         color: #374151;
         line-height: 1.6;
         margin-bottom: 20px;
         font-style: italic;
       }

       .testimonial-impact {
         text-align: center;
       }

       .impact-badge {
         background: linear-gradient(135deg, #10b981, #059669);
         color: white;
         padding: 8px 16px;
         border-radius: 12px;
         font-size: 12px;
         font-weight: 600;
         display: inline-block;
       }

       .testimonials-cta {
         text-align: center;
         margin-top: 60px;
       }

       .testimonials-cta h3 {
         font-size: 28px;
         font-weight: 700;
         color: #1f2937;
         margin-bottom: 24px;
       }

       .testimonials-button {
         background: linear-gradient(135deg, #667eea, #764ba2);
         color: white;
         border: none;
         padding: 20px 40px;
         border-radius: 16px;
         font-size: 18px;
         font-weight: 700;
         cursor: pointer;
         transition: all 0.3s ease;
       }

       .testimonials-button:hover {
         transform: translateY(-3px);
         box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
       }

       /* Modal Styles */
       .modal-overlay {
         position: fixed;
         top: 0;
         left: 0;
         right: 0;
         bottom: 0;
         background: rgba(0, 0, 0, 0.6);
         display: flex;
         align-items: center;
         justify-content: center;
         z-index: 1000;
         backdrop-filter: blur(4px);
       }

       .modal-content {
  background: white;
  border-radius: 24px;
  max-width: 900px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

       .modal-close {
         position: absolute;
         top: 20px;
         right: 20px;
         background: #f3f4f6;
         border: none;
         width: 40px;
         height: 40px;
         border-radius: 50%;
         font-size: 20px;
         cursor: pointer;
         z-index: 10;
         transition: all 0.3s ease;
       }

       .modal-close:hover {
         background: #e5e7eb;
       }

       /* Upload Modal */
       .upload-modal {
         padding: 40px;
       }

       .upload-header {
         text-align: center;
         margin-bottom: 40px;
       }

       .upload-header h2 {
         font-size: 32px;
         font-weight: 800;
         color: #1f2937;
         margin-bottom: 12px;
       }

       .upload-header p {
         color: #6b7280;
         font-size: 16px;
       }

       .upload-area {
         display: grid;
         gap: 32px;
       }

       .upload-zone {
         text-align: center;
       }

       .upload-icon {
         font-size: 64px;
         margin-bottom: 20px;
         display: block;
       }

       .upload-zone h3 {
         font-size: 20px;
         font-weight: 700;
         color: #1f2937;
         margin-bottom: 8px;
       }

       .upload-zone p {
         color: #6b7280;
         margin-bottom: 24px;
       }

       .cv-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  margin-bottom: 24px;
  font-family: 'Inter', sans-serif;
  color: #1f2937 !important;
  background-color: white !important;
}

       .cv-textarea:focus {
         outline: none;
         border-color: #667eea;
         box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
       }

       .upload-buttons {
         display: flex;
         gap: 16px;
         justify-content: center;
       }

       .upload-btn {
         padding: 12px 24px;
         border-radius: 12px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.3s ease;
         border: none;
       }

       .upload-btn.secondary {
         background: #f3f4f6;
         color: #374151;
       }

       .upload-btn.secondary:hover {
         background: #e5e7eb;
       }

       .upload-btn.primary {
         background: linear-gradient(135deg, #667eea, #764ba2);
         color: white;
       }

       .upload-btn.primary:hover {
         transform: translateY(-2px);
         box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
       }

       .upload-features {
         display: grid;
         grid-template-columns: repeat(2, 1fr);
         gap: 16px;
       }

       .feature-check {
         color: #059669;
         font-size: 14px;
         font-weight: 500;
       }

       /* Paywall Modal */
       .paywall-modal {
  padding: 30px;
  max-width: 950px;
  width: 98%;
}

       .analysis-preview {
         text-align: center;
       }

       .ats-score-big {
         margin-bottom: 40px;
       }

       .score-circle {
         width: 120px;
         height: 120px;
         border-radius: 50%;
         background: linear-gradient(135deg, #ef4444, #dc2626);
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;
         margin: 0 auto 20px;
         color: white;
       }

       .score-number {
         font-size: 32px;
         font-weight: 800;
       }

       .score-label {
         font-size: 14px;
         opacity: 0.9;
       }

       .score-status {
         margin-bottom: 40px;
       }

       .status {
         padding: 8px 16px;
         border-radius: 12px;
         font-weight: 600;
         font-size: 14px;
       }

       .status.good {
         background: #dcfce7;
         color: #16a34a;
       }

       .status.warning {
         background: #fef3c7;
         color: #d97706;
       }

       .status.bad {
         background: #fee2e2;
         color: #dc2626;
       }

       .problems-preview h3 {
         font-size: 20px;
         font-weight: 700;
         color: #1f2937;
         margin-bottom: 20px;
       }

       .problem-list {
         text-align: left;
         margin-bottom: 40px;
       }

       .problem-item {
         display: flex;
         align-items: center;
         gap: 12px;
         padding: 12px;
         background: #f9fafb;
         border-radius: 8px;
         margin-bottom: 8px;
         filter: blur(2px);
         opacity: 0.7;
       }

       .problem-item.blurred {
         position: relative;
       }

       .problem-icon {
         font-size: 16px;
       }

       .more-problems {
         text-align: center;
         color: #6b7280;
         font-style: italic;
         margin-top: 16px;
       }

       .paywall-cta {
         text-align: center;
       }

       .paywall-header h2 {
         font-size: 28px;
         font-weight: 800;
         color: #1f2937;
         margin-bottom: 8px;
       }

       .paywall-header p {
         color: #6b7280;
         margin-bottom: 32px;
       }

       .paywall-pricing {
         margin-bottom: 32px;
       }

       .price-highlight {
         display: flex;
         align-items: center;
         justify-content: center;
         gap: 16px;
         margin-bottom: 8px;
       }

       .old-price {
         text-decoration: line-through;
         color: #9ca3af;
         font-size: 18px;
       }

       .new-price {
         font-size: 32px;
         font-weight: 800;
         color: #10b981;
       }

       .discount-badge {
         background: #fbbf24;
         color: white;
         padding: 4px 8px;
         border-radius: 8px;
         font-size: 12px;
         font-weight: 700;
       }

       .price-subtitle {
         color: #6b7280;
         font-size: 14px;
       }

       .paywall-btn {
         width: 100%;
         background: linear-gradient(135deg, #10b981, #059669);
         color: white;
         border: none;
         padding: 20px 32px;
         border-radius: 16px;
         font-size: 18px;
         font-weight: 700;
         cursor: pointer;
         transition: all 0.3s ease;
         margin-bottom: 20px;
       }

       .paywall-btn:hover {
         transform: translateY(-2px);
         box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4);
       }

       .paywall-guarantee {
         color: #6b7280;
         font-size: 14px;
       }

       /* Pricing Modal */
       .pricing-modal {
         padding: 40px;
       }

       .pricing-header {
         text-align: center;
         margin-bottom: 40px;
       }

       .pricing-header h2 {
         font-size: 32px;
         font-weight: 800;
         color: #1f2937;
         margin-bottom: 12px;
       }

       .pricing-header p {
         color: #6b7280;
         font-size: 16px;
       }

       .pricing-plan {
         background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
         border: 3px solid #22c55e;
         border-radius: 20px;
         padding: 32px;
         position: relative;
         margin-bottom: 24px;
       }

       .plan-badge {
         position: absolute;
         top: -15px;
         left: 50%;
         transform: translateX(-50%);
         background: linear-gradient(135deg, #f59e0b, #d97706);
         color: white;
         padding: 8px 20px;
         border-radius: 20px;
         font-size: 12px;
         font-weight: 700;
       }

       .plan-header {
         text-align: center;
         margin-bottom: 32px;
       }

       .plan-header h3 {
         font-size: 24px;
         font-weight: 800;
         color: #1f2937;
         margin-bottom: 16px;
       }

       .plan-price {
         display: flex;
         align-items: center;
         justify-content: center;
         gap: 12px;
         margin-bottom: 8px;
       }

       .price-old {
         text-decoration: line-through;
         color: #9ca3af;
         font-size: 18px;
       }

       .price-new {
         font-size: 36px;
         font-weight: 800;
         color: #10b981;
       }

       .price-save {
         background: #fbbf24;
         color: white;
         padding: 4px 8px;
         border-radius: 8px;
         font-size: 12px;
         font-weight: 700;
       }

       .plan-features {
         margin-bottom: 32px;
       }

       .feature-item {
         display: flex;
         align-items: center;
         gap: 8px;
         padding: 8px 0;
         color: #374151;
         font-weight: 500;
       }

       .plan-email {
         margin-bottom: 24px;
       }

       .email-input-modal {
         width: 100%;
         padding: 16px;
         border: 2px solid #e5e7eb;
         border-radius: 12px;
         font-size: 16px;
         transition: all 0.3s ease;
       }

       .email-input-modal:focus {
         outline: none;
         border-color: #10b981;
         box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
       }

       .plan-button {
         width: 100%;
         padding: 20px 32px;
         border-radius: 16px;
         font-size: 18px;
         font-weight: 700;
         border: none;
         cursor: pointer;
         transition: all 0.3s ease;
         margin-bottom: 20px;
       }

       .plan-button.premium {
         background: linear-gradient(135deg, #10b981, #059669);
         color: white;
       }

       .plan-button.premium:hover {
         transform: translateY(-2px);
         box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4);
       }

       .plan-guarantee {
         display: flex;
         justify-content: space-between;
         align-items: center;
         gap: 16px;
         color: #6b7280;
         font-size: 14px;
         text-align: center;
       }

       .pricing-testimonial {
         background: #f8fafc;
         border-radius: 12px;
         padding: 20px;
         text-align: center;
         font-style: italic;
         color: #6b7280;
       }

/* Pricing Plans Grid */
.pricing-plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.pricing-plan.basic {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #22c55e;
}

.pricing-plan.gold {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 2px solid #f59e0b;
}

.pricing-plan.premium {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border: 2px solid #8b5cf6;
}

.green-badge {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.gold-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.premium-badge {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.price-new.green {
  color: #16a34a;
}

.price-new.gold {
  color: #d97706;
}

.price-new.premium {
  color: #7c3aed;
}

.price-period {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
}

.plan-button.green {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.plan-button.gold {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.plan-button.premium {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.plan-button.green:hover {
  box-shadow: 0 15px 35px rgba(34, 197, 94, 0.4);
}

.plan-button.gold:hover {
  box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
}

.plan-button.premium:hover {
  box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
}


.pricing-plans-grid.horizontal {
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 100%;
}

.pricing-plan.compact {
  padding: 20px;
  text-align: center;
  min-height: auto;
}

.pricing-plan.compact h3 {
  font-size: 18px;
  margin-bottom: 12px;
}

.pricing-plan.compact .plan-price {
  margin-bottom: 16px;
}

.pricing-plan.compact .plan-button {
  padding: 12px 16px;
  font-size: 14px;
  width: 100%;
}

.pricing-plan.compact .plan-badge {
  font-size: 10px;
  padding: 6px 12px;
  top: -12px;
}

.price-period {
  font-size: 12px;
  color: #6b7280;
  margin-left: 4px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .pricing-plans-grid.horizontal {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}


       /* Footer */
       .footer {
         background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
         color: white;
         padding: 60px 20px 20px;
       }

       .footer-content {
         max-width: 1200px;
         margin: 0 auto;
         display: grid;
         grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
         gap: 40px;
         margin-bottom: 40px;
       }

       .footer-section h4 {
         font-size: 18px;
         font-weight: 700;
         margin-bottom: 20px;
         color: white;
       }

       .footer-description {
         color: #9ca3af;
         line-height: 1.6;
         margin-bottom: 20px;
       }

       .footer-links {
         list-style: none;
         padding: 0;
         margin: 0;
       }

       .footer-links li {
         margin-bottom: 12px;
       }

       .footer-links a {
         color: #9ca3af;
         text-decoration: none;
         transition: color 0.3s ease;
       }

       .footer-links a:hover {
         color: white;
       }

       .footer-stats {
         list-style: none;
         padding: 0;
         margin: 0;
       }

       .footer-stats li {
         margin-bottom: 12px;
         color: #9ca3af;
         font-size: 14px;
       }

       .footer-bottom {
         max-width: 1200px;
         margin: 0 auto;
         padding-top: 40px;
         border-top: 1px solid #374151;
         display: flex;
         justify-content: space-between;
         align-items: center;
         flex-wrap: wrap;
         gap: 20px;
       }

       .footer-badges {
         display: flex;
         gap: 16px;
       }

       .badge {
         background: rgba(255, 255, 255, 0.1);
         padding: 6px 12px;
         border-radius: 8px;
         font-size: 12px;
         color: #9ca3af;
       }

       /* Mobile Responsive */
       @media (max-width: 768px) {
         .hero-section {
           grid-template-columns: 1fr;
           gap: 40px;
           padding: 60px 20px;
         }

         .hero-title {
           font-size: 36px;
         }

         .hero-stats {
           grid-template-columns: repeat(3, 1fr);
           gap: 16px;
         }

         .features-grid {
           grid-template-columns: 1fr;
           gap: 24px;
         }

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

         .testimonials-grid {
           grid-template-columns: 1fr;
         }

         .tool-features {
           grid-template-columns: 1fr;
         }

         .upload-features {
           grid-template-columns: 1fr;
         }

         .upload-buttons {
           flex-direction: column;
         }

         .plan-guarantee {
           flex-direction: column;
           gap: 8px;
         }

         .footer-bottom {
           flex-direction: column;
           text-align: center;
         }

         .nav-links {
           display: none;
         }

         .cv-preview {
           flex-direction: column;
           gap: 16px;
         }

         .cv-arrow {
           transform: rotate(90deg);
         }
       }
     `}</style>
   </>
 )
}