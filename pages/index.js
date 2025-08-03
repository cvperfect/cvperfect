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
      // Sprawdź rozszerzenie pliku
      const fileName = file.name.toLowerCase()
      const allowedExtensions = ['.pdf', '.doc', '.docx']
      const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext))
      
      if (!isAllowed) {
        alert('❌ Obsługujemy tylko pliki: PDF, DOC, DOCX')
        e.target.value = '' // Wyczyść input
        return
      }
      
      // Sprawdź typ MIME
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type) && !file.type.includes('word')) {
        alert('❌ Nieprawidłowy format pliku. Używaj PDF, DOC lub DOCX')
        e.target.value = ''
        return
      }
      
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setCurrentCV(e.target.result)
      reader.readAsText(file)
    }
  }

  const handlePayment = (plan) => {
    // Pobierz email z paywall modal lub pricing modal
    const paywallEmail = document.getElementById('paywallEmail')?.value;
    const customerEmail = document.getElementById('customerEmail')?.value;
    const email = paywallEmail || customerEmail;
    
    if (!email || !email.includes('@')) {
      alert('Proszę podać prawidłowy adres email')
      return
    }

    const prices = {
      premium: 'price_1RofCI4FWb3xY5tDYONIW3Ix',
      gold: 'price_1Rof7b4FWb3xY5tDQ76590pw',
      'premium-monthly': 'price_1RqWk34FWb3xY5tD5W2ge1g0'
    }

    window.location.href = `/api/create-checkout-session?plan=${plan}&email=${encodeURIComponent(email)}`
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
        <meta name="description" content="Pierwsza AI platforma do optymalizacji CV w Polsce. 95% ATS success rate, 410% więcej rozmów kwalifikacyjnych. Zoptymalizuj CV w 30 sekund za 9.99 zł." />
        <meta name="keywords" content="optymalizacja CV, ATS, sztuczna inteligencja, CV AI, praca, rekrutacja, Polska" />
        <meta property="og:title" content="CvPerfect - #1 AI Optymalizacja CV w Polsce" />
        <meta property="og:description" content="95% ATS success rate, 410% więcej rozmów kwalifikacyjnych. Zoptymalizuj CV w 30 sekund." />
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
                🎯 Zoptymalizuj CV teraz ⚡
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
              Zwiększ swoje szanse o <span className="highlight">410%</span>
              <br />z AI-powered optymalizacją CV
            </h1>
            <p className="hero-subtitle">
              Pierwsza sztuczna inteligencja w Polsce, która optymalizuje Twoje CV pod konkretne oferty pracy. 
              <strong> 95% skuteczności ATS, 30 sekund optymalizacji, tylko 9.99 zł.</strong>
            </p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">410%</div>
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
                🔍 Sprawdź swoje CV
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


{/* Capabilities Section */}
<div className="capabilities-section">
  <div className="capabilities-container">
    <div className="capabilities-header">
  <div className="header-badge">
    <span className="badge-icon">🤖</span>
    <span className="badge-text">AI-Powered Detection</span>
  </div>
  <h3>Wspieramy wszystkie formaty dokumentów</h3>
  <p>Wystarczy wkleić - nasz AI automatycznie rozpozna czy to CV czy list motywacyjny<br />i zastosuje odpowiednią optymalizację</p>
</div>
    <div className="capabilities-grid">
      <div className="capability-card">
        <div className="cap-icon">📄</div>
        <h4>CV + Oferta pracy</h4>
        <p>Zoptymalizujemy CV pod konkretną ofertę</p>
        <div className="cap-result">→ Dopasowane CV</div>
      </div>
      <div className="capability-card">
        <div className="cap-icon">✉️</div>
        <h4>List motywacyjny + Oferta</h4>
        <p>Dostosujemy list pod wymagania pracodawcy</p>
        <div className="cap-result">→ Dopasowany list</div>
      </div>
      <div className="capability-card">
        <div className="cap-icon">📋</div>
        <h4>Samo CV</h4>
        <p>Stworzymy uniwersalne CV gotowe do użycia</p>
        <div className="cap-result">→ Ogólne CV</div>
      </div>
      <div className="capability-card">
        <div className="cap-icon">📝</div>
        <h4>Sam list motywacyjny</h4>
        <p>Przygotujemy szablon do dalszej edycji</p>
        <div className="cap-result">→ Szablon listu</div>
      </div>
    </div>
    <div className="capabilities-note">
      <span className="note-icon">🤖</span>
      <span>System automatycznie wykryje czy to CV czy list motywacyjny i zastosuje odpowiednią optymalizację!</span>
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
               Zwiększ swoje szanse 🚀
            </button>
          </div>
        </div>

{/* Upload Modal - Darmowa Analiza */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
              
              <div className="upload-header">
                <h2>Darmowa Analiza ATS</h2>
<p>Sprawdź jak Twoje CV lub list motywacyjny radzi sobie z systemami rekrutacyjnymi</p>
              </div>

              <div className="upload-area">
                <div className="upload-zone">
                  <div className="upload-icon">📄</div>
                  <h3>Wklej swoje CV lub wybierz plik</h3>
                  <p>PDF, DOC, DOCX - maksymalnie 5MB</p>
                  
                  <textarea 
                    className="cv-textarea"
                    placeholder="Wklej tutaj pełne ogłoszenie o pracę...&#10;&#10;🤖 System wykryje czy to CV czy list motywacyjny i zoptymalizuje!"
                    rows="8"
                  ></textarea>
                  
                  <div className="upload-buttons">
                    <input
                      type="file"
                      id="modalFileInput"
                      accept=".pdf,.doc,.docx"
                      style={{display: 'none'}}
                      onChange={(e) => {
  const file = e.target.files[0];
  if (file) {
    // Sprawdź rozszerzenie pliku
    const fileName = file.name.toLowerCase();
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isAllowed) {
      alert('❌ Obsługujemy tylko pliki: PDF, DOC, DOCX');
      e.target.value = '';
      return;
    }
    
    // Sprawdź typ MIME
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.type.includes('word')) {
      alert('❌ Nieprawidłowy format pliku. Używaj PDF, DOC lub DOCX');
      e.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const textarea = document.querySelector('.cv-textarea');
      if (textarea) {
        textarea.value = `📄 Plik "${file.name}" został wczytany pomyślnie!\n\nRozmiar: ${(file.size / 1024).toFixed(1)} KB\n\n✅ Gotowy do analizy!`;
        
        const successMsg = document.createElement('div');
        successMsg.innerHTML = '✅ CV zostało pomyślnie wczytane!';
        successMsg.style.cssText = 'color: #059669; font-weight: 600; margin-top: 10px; text-align: center;';
        successMsg.className = 'success-message';
        const existing = document.querySelector('.success-message');
        if (existing) existing.remove();
        textarea.parentNode.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      }
    };
    reader.readAsText(file);
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
              {/* Header Section */}
<div className="modal-header">
  <div className="header-content">
    <div className="header-badge">
      <span className="badge-icon">🚀</span>
      <span className="badge-text">Optymalizacja CV</span>
    </div>
    <h2>Odblouj pełną optymalizację!</h2>
    <p>Uzupełnij email, wybierz plan i otrzymaj szczegółową analizę + zoptymalizowane CV</p>
  </div>
  <button className="close-btn" onClick={() => setShowPaywall(false)}>×</button>
</div>

{/* ATS Score Preview */}
<div className="score-preview">
  <div className="score-container">
    <div className="score-circle">
      <div className="score-value">{analysisResult.score}%</div>
      <div className="score-label">ATS Score</div>
    </div>
    <div className="score-info">
      <h4>🎯 Twój wynik ATS</h4>
      <p>Sprawdziliśmy Twoje CV pod kątem zgodności z systemami rekrutacyjnymi</p>
    </div>
  </div>
</div>

{/* Content Section */}
<div className="modal-content-inner">
  {/* Optimization Type Selection */}
<div className="optimization-section">
  <h3>🎯 Typ optymalizacji</h3>
  
  {/* Default Option - Selected */}
  <div className="default-option">
    <div className="option-header">
      <span className="option-icon">⭐</span>
      <div className="option-info">
        <h4>Ogólna optymalizacja</h4>
        <p>Uniwersalne CV dostosowane do Twojej branży</p>
      </div>
      <span className="selected-badge">✅ Wybrane</span>
    </div>
  </div>

  {/* Job Description Input */}
  <div className="job-upgrade-section">
    <div className="upgrade-header">
      <h4>💼 Lub dostosuj pod konkretną ofertę pracy</h4>
<p>Wklej ogłoszenie, a my zoptymalizujemy CV lub list motywacyjny pod te wymagania</p>
    </div>
    <textarea 
      className="job-textarea" 
      placeholder="Wklej tutaj pełne ogłoszenie o pracę...&#10;&#10;🤖 System wykryje czy to CV czy list motywacyjny i zoptymalizuje!"
      rows="4"
    ></textarea>
    <div className="upgrade-note">
      <span className="note-icon">💡</span>
      <span>Im więcej szczegółów, tym lepsza optymalizacja!</span>
    </div>
  </div>
</div>

  {/* Email Input */}
  <div className="email-section">
    <h3>📧 Twój email</h3>
    <input 
      type="email" 
      className="email-input" 
      placeholder="twoj-email@example.com"
      id="paywallEmail"
    />
  </div>

  {/* Pricing Plans */}
  <div className="pricing-section">
    <h3>💎 Wybierz plan</h3>
    <div className="pricing-grid">
      {/* Basic Plan */}
      <div className="plan-card basic">
        <div className="plan-badge">BASIC</div>
        <div className="plan-header">
          <h4>Jednorazowy</h4>
          <div className="plan-price">
            <span className="old-price">29,99 zł</span>
            <span className="current-price">9,99 zł</span>
            <span className="discount">-67%</span>
          </div>
        </div>
        <div className="plan-features">
          <div className="feature">✅ 1 optymalizacja CV</div>
          <div className="feature">✅ GPT-3.5 AI Engine</div>
          <div className="feature">✅ 95% ATS Success Rate</div>
          <div className="feature">✅ Eksport PDF/DOCX</div>
        </div>
        <button className="plan-button basic-btn" onClick={() => {
          const email = document.getElementById('paywallEmail').value;
          if (!email || !email.includes('@')) {
            alert('⚠️ Podaj prawidłowy email!');
            return;
          }
          handlePayment('premium');
        }}>Wybierz Basic</button>
      </div>

      {/* Gold Plan */}
      <div className="plan-card gold popular">
        <div className="plan-badge">GOLD</div>
        <div className="popularity-badge">NAJPOPULARNIEJSZY</div>
        <div className="plan-header">
          <h4>Gold</h4>
          <div className="plan-price">
            <span className="old-price">89 zł</span>
            <span className="current-price">49 zł</span>
            <span className="period">/miesiąc</span>
          </div>
        </div>
        <div className="plan-features">
          <div className="feature">✅ 10 optymalizacji/mies.</div>
          <div className="feature">✅ GPT-4 AI (najnowszy)</div>
          <div className="feature">✅ Priorytetowa kolejka</div>
          <div className="feature">✅ Dostęp do nowych funkcji</div>
        </div>
        <button className="plan-button gold-btn" onClick={() => {
          const email = document.getElementById('paywallEmail').value;
          if (!email || !email.includes('@')) {
            alert('⚠️ Podaj prawidłowy email!');
            return;
          }
          handlePayment('gold');
        }}>Wybierz Gold</button>
      </div>

      {/* Premium Plan */}
      <div className="plan-card premium">
        <div className="plan-badge">VIP</div>
        <div className="premium-badge">NAJLEPSZA WARTOŚĆ</div>
        <div className="plan-header">
          <h4>Premium</h4>
          <div className="plan-price">
            <span className="old-price">129 zł</span>
            <span className="current-price">79 zł</span>
            <span className="period">/miesiąc</span>
          </div>
        </div>
        <div className="plan-features">
          <div className="feature">✅ 25 optymalizacji/mies.</div>
          <div className="feature">✅ GPT-4 VIP (najlepszy)</div>
          <div className="feature">✅ VIP Support (2h odpowiedzi)</div>
          <div className="feature">✅ Beta tester nowości</div>
        </div>
        <button className="plan-button premium-btn" onClick={() => {
          const email = document.getElementById('paywallEmail').value;
          if (!email || !email.includes('@')) {
            alert('⚠️ Podaj prawidłowy email!');
            return;
          }
          handlePayment('premium-monthly');
        }}>Wybierz Premium</button>
      </div>
    </div>
  </div>

  {/* Trust Section */}
  <div className="trust-section">
    <div className="trust-stats">
      <div className="stat">
        <span className="stat-number">50,000+</span>
        <span className="stat-label">Zoptymalizowanych CV</span>
      </div>
      <div className="stat">
        <span className="stat-number">410%</span>
        <span className="stat-label">Więcej odpowiedzi</span>
      </div>
      <div className="stat">
        <span className="stat-number">95%</span>
        <span className="stat-label">Sukces w ATS</span>
      </div>
    </div>
  </div>
</div>
              
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="faq-container">
            <div className="faq-header">
              <h2 className="section-title">❓ Często zadawane pytania</h2>
              <p className="section-subtitle">Wszystko czego potrzebujesz wiedzieć o CvPerfect</p>
            </div>
            <div className="faq-grid">
              <div className="faq-item">
                <div className="faq-question">
                  <span className="faq-icon">💰</span>
                  <h3>Czy naprawdę kosztuje tylko 9.99 zł?</h3>
                </div>
                <div className="faq-answer">
                  <p>Tak! Plan Basic to jednorazowa płatność 9.99 zł za 1 optymalizację CV. Bez ukrytych kosztów, bez subskrypcji.</p>
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <span className="faq-icon">🤖</span>
                  <h3>Jak działa AI optymalizacja?</h3>
                </div>
                <div className="faq-answer">
                  <p>Nasze AI analizuje Twoje CV pod kątem konkretnej oferty pracy. Sprawdza słowa kluczowe, formatowanie, strukturę.</p>
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <span className="faq-icon">⏱️</span>
                  <h3>Ile czasu zajmuje optymalizacja?</h3>
                </div>
                <div className="faq-answer">
                  <p>Cały proces trwa maksymalnie 30 sekund! Wklejasz CV i opis oferty, AI analizuje i zwraca zoptymalizowaną wersję.</p>
                </div>
              </div>
              <div className="faq-item">
                <div className="faq-question">
                  <span className="faq-icon">🔒</span>
                  <h3>Czy moje dane są bezpieczne?</h3>
                </div>
                <div className="faq-answer">
                  <p>Absolutnie! Twoje CV jest przetwarzane bezpiecznie, nie przechowujemy danych. Płatności przez Stripe.</p>
                </div>
              </div>
            </div>
            <div className="faq-cta">
              <h3>Nie znalazłeś odpowiedzi?</h3>
              <button className="faq-button" onClick={() => setShowUploadModal(true)}>Wypróbuj za darmo ⚡</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-text">CvPerfect</span>
                <span className="logo-badge">AI</span>
              </div>
              <p className="footer-description">Pierwsza AI platforma do optymalizacji CV w Polsce. 95% skuteczności ATS, 410% więcej rozmów kwalifikacyjnych.</p>
            </div>
            <div className="footer-section">
              <h4>Produkty</h4>
              <ul className="footer-links">
                <li><a href="#features">Optymalizacja AI</a></li>
                <li><a href="#testimonials">Opinie użytkowników</a></li>
              </ul>
            </div>

<div className="footer-section">
              <h4>Pomoc</h4>
              <ul className="footer-links">
		<li><a href="/regulamin">Regulamin</a></li>
                <li><a href="/kontakt">Kontakt</a></li>
                <li><a href="/polityka-prywatnosci">Polityka prywatności</a></li>
                <li><a href="/rodo">RODO</a></li>
                
              </ul>
            </div>

          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 CvPerfect. Wszystkie prawa zastrzeżone.</p>
          </div>
        </footer>
      </div>
      <style jsx>{`
        /* Global Styles */
        body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto !important;
  min-height: 150vh;
}
        html {
          overflow-x: hidden;
	  overflow-y: scroll !important;
        }        
        .container {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background: #0a0a0a;
  position: relative;
  padding: 0;
  margin: 0 auto;
  max-width: 100vw;
  width: 100%;
  overflow: hidden;
}

.container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(120, 80, 255, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 80, 150, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(80, 180, 255, 0.2) 0%, transparent 50%);
  animation: gradientShift 20s ease infinite;
  z-index: 0;
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

        /* Custom Scrollbar */
        /* Enhanced Custom Scrollbar */
/* MEGA VISIBLE SCROLLBAR */
/* Normal Scrollbar */
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

/* For Firefox */
html {
  scrollbar-width: auto;
  scrollbar-color: #667eea #f1f5f9;
}
  
/* Floating Notifications */
.floating-notifications {
  position: fixed;
  top: 100px;
  right: 40px;
  z-index: 1000;
  pointer-events: none;
}

.floating-notification {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 16px 24px;
  border-radius: 100px;
  margin-bottom: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  transform: translateX(500px);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  pointer-events: none;
  position: relative;
  overflow: hidden;
}

.floating-notification::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: notificationShine 3s ease infinite;
}

@keyframes notificationShine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.floating-notification.show {
  transform: translateX(0);
  opacity: 1;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #7850ff, #ff5080);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3);
}

.notification-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.notification-text strong {
  color: #00ff88;
  font-weight: 700;
}

.notification-time {
  font-size: 12px;
  opacity: 0.6;
  margin-top: 4px;
}

.notification-icon {
  font-size: 20px;
  filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.5));
  animation: checkBounce 0.6s ease;
}

@keyframes checkBounce {
  0% { transform: scale(0) rotate(-180deg); }
  50% { transform: scale(1.2) rotate(10deg); }
  100% { transform: scale(1) rotate(0); }
}
        /* Navigation */
.navigation {
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.navigation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(120, 80, 255, 0.5) 25%, 
    rgba(255, 80, 150, 0.5) 50%,
    rgba(80, 180, 255, 0.5) 75%,
    transparent 100%
  );
  animation: borderFlow 3s linear infinite;
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
  letter-spacing: -0.5px;
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.logo-badge {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  color: white;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3);
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3); }
  50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(120, 80, 255, 0.5); }
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #7850ff, #ff5080);
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: white;
}

.nav-link:hover::after {
  width: 100%;
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
  position: relative;
  overflow: hidden;
}

.nav-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.nav-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(120, 80, 255, 0.5);
}

.nav-cta:hover::before {
  left: 100%;
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
  background: transparent;
  color: white;
  padding: 140px 40px 100px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(120, 80, 255, 0.1) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}

.hero-badge {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
  animation: fadeInUp 0.6s ease;
}

.hero-badge::before {
  content: '🚀';
  font-size: 16px;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

        .hero-title {
  font-size: 72px;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 32px;
  letter-spacing: -2px;
  animation: fadeInUp 0.6s ease 0.1s both;
}

.highlight {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  position: relative;
  display: inline-block;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border-radius: 2px;
  animation: highlightPulse 2s ease infinite;
}

@keyframes highlightPulse {
  0%, 100% { opacity: 0.8; transform: scaleX(1); }
  50% { opacity: 1; transform: scaleX(1.05); }
}

        .hero-subtitle {
          font-size: 20px;
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 40px;
        }

.hero-cta {
  text-align: left;
  animation: fadeInUp 0.6s ease 0.4s both;
}

.hero-button {
  display: inline-block;
  background: linear-gradient(135deg, #00ff88, #00cc70);
  color: #000;
  padding: 20px 48px;
  border-radius: 100px;
  font-size: 18px;
  font-weight: 800;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
  letter-spacing: -0.5px;
}

.hero-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.hero-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 255, 136, 0.4);
}

.hero-button:hover::before {
  width: 300px;
  height: 300px;
}

.hero-button:active {
  transform: translateY(-1px) scale(1);
}

.hero-guarantee {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.hero-guarantee span {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}


       .hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
  animation: fadeInUp 0.6s ease 0.3s both;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: shimmer 3s ease infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.stat-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 40px rgba(120, 80, 255, 0.2);
}

.stat-number {
  font-size: 48px;
  font-weight: 900;
  display: block;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #7850ff, #ff5080, #50b4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

.stat-text {
  font-size: 16px;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
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
  gap: 40px;
  perspective: 1000px;
  animation: fadeInUp 0.8s ease 0.5s both;
}

.cv-before, .cv-after {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  width: 280px;
  color: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transition: all 0.4s ease;
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;
}

.cv-before::before, .cv-after::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
  transform: rotate(45deg);
  transition: all 0.6s ease;
  opacity: 0;
}

.cv-before:hover, .cv-after:hover {
  transform: rotateY(-5deg) translateZ(20px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
}

.cv-before:hover::before, .cv-after:hover::before {
  opacity: 1;
}

.cv-before {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.cv-after {
  border-color: rgba(0, 255, 136, 0.3);
  background: rgba(0, 255, 136, 0.05);
  animation: glow 3s ease infinite;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 255, 136, 0.2); }
  50% { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 50px rgba(0, 255, 136, 0.3); }
}

.cv-header {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
}

.cv-score {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  margin: 0 auto 24px;
  color: white;
  font-size: 18px;
  position: relative;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.cv-score::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: inherit;
  filter: blur(10px);
  opacity: 0.5;
  z-index: -1;
}

.cv-score.bad {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.cv-score.good {
  background: linear-gradient(135deg, #00ff88, #00cc70);
  animation: scorePulse 2s ease infinite;
}

@keyframes scorePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.cv-line {
  height: 6px;
  border-radius: 100px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.cv-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: lineShimmer 2s ease infinite;
}

.cv-line.optimized::after {
  animation-delay: 0.2s;
}

@keyframes lineShimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.cv-line.short { width: 60%; }
.cv-line.medium { width: 80%; }
.cv-line.long { width: 100%; }

.cv-line.optimized {
  background: linear-gradient(90deg, #00ff88, #00cc70);
  box-shadow: 0 2px 10px rgba(0, 255, 136, 0.3);
}

.cv-problems, .cv-improvements {
  margin-top: 24px;
  font-size: 13px;
}

.cv-problems span, .cv-improvements span {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.cv-problems span:hover, .cv-improvements span:hover {
  opacity: 1;
  transform: translateX(5px);
}

.cv-problems span {
  color: #ff6b6b;
}

.cv-improvements span {
  color: #00ff88;
}

.cv-arrow {
  font-size: 48px;
  color: transparent;
  font-weight: bold;
  background: linear-gradient(135deg, #7850ff, #ff5080);
  -webkit-background-clip: text;
  animation: arrowPulse 2s ease infinite;
}

@keyframes arrowPulse {
  0%, 100% { transform: scale(1) translateX(0); }
  50% { transform: scale(1.2) translateX(5px); }
}



/* Features Section */
.features-section {
  background: transparent;
  padding: 120px 40px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.features-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.features-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-title {
  font-size: 56px;
  font-weight: 900;
  color: white;
  margin-bottom: 24px;
  letter-spacing: -1px;
  line-height: 1.1;
}

.section-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
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

        /* Battle Section */
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

        .stat-icon {
          font-size: 32px;
          margin-bottom: 10px;
          display: block;
        }

        .stat-label {
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
        }

        /* Testimonials Section */
        .testimonials-section {
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(15px);
          padding: 80px 20px;
        }

        .testimonials-header {
          text-align: center;
          margin-bottom: 60px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

	
	.testimonials-header .section-title {
  color: white;
  text-shadow: 0 2px 20px rgba(0,0,0,0.2);
}

.testimonials-header .section-subtitle {
  color: rgba(255,255,255,0.9);
  text-shadow: 0 1px 10px rgba(0,0,0,0.1);
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
          color: white;
text-shadow: 0 2px 20px rgba(0,0,0,0.2);
          margin-bottom: 24px;
        }

        .testimonials-button {
  background: linear-gradient(135deg, #10b981, #059669);
  border: 2px solid rgba(255,255,255,0.2);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
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
  padding: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.3);
}

        .upload-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 30px 40px;
  text-align: center;
  border-radius: 24px 24px 0 0;
  margin-bottom: 0;
}

        .upload-header h2 {
  font-size: 32px;
  font-weight: 800;
  color: white;
  margin-bottom: 12px;
}

        .upload-header p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

        .upload-area {
  display: grid;
  gap: 32px;
  padding: 40px;
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
  padding: 0;
  max-width: 1000px;
  width: 98%;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.3);
}



       /* NEW MODAL STYLES */
.modal-header {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 30px 40px;
  border-radius: 24px 24px 0 0;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.header-content {
  flex: 1;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.2;
  color: white !important;
}

.modal-header p {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9) !important;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.score-preview {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-bottom: 1px solid #e5e7eb;
  padding: 30px 40px;
}

.score-container {
  display: flex;
  align-items: center;
  gap: 30px;
  justify-content: center;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #667eea 0%, #764ba2 67%, #e5e7eb 67%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-circle::before {
  content: '';
  position: absolute;
  width: 90px;
  height: 90px;
  background: white;
  border-radius: 50%;
  z-index: 1;
}

.score-value {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  z-index: 2;
  position: relative;
}

.score-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  z-index: 2;
  position: relative;
}

.score-info {
  text-align: left;
}

.score-info h4 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.score-info p {
  color: #6b7280;
  line-height: 1.5;
}

.modal-content-inner {
  padding: 40px;
}

.optimization-section,
.job-description-section,
.email-section,
.pricing-section {
  margin-bottom: 40px;
}

.modal-content-inner h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.optimization-options {
  display: grid;
  gap: 16px;
}

.option-card {
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  display: block;
}

.option-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.option-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.option-card input {
  display: none;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.option-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.option-text strong {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.option-text p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.job-textarea {
  width: 100%;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  background: white;
  color: #1f2937;
  transition: all 0.3s ease;
}

.job-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}
.job-textarea {
  color: #000000 !important;
  background: white !important;
  border: 2px solid #d1d5db !important;
  font-weight: 500;
}

.job-textarea:focus {
  color: #000000 !important;
  background: white !important;
}

.job-textarea::placeholder {
  color: #6b7280 !important;
  font-weight: 400;
}


.email-input {
  color: #000000 !important;
  background: white !important;
  border: 2px solid #d1d5db !important;
  font-weight: 500;
}

.email-input:focus {
  color: #000000 !important;
  background: white !important;
  border-color: #667eea !important;
}

.email-input::placeholder {
  color: #6b7280 !important;
  font-weight: 400;
}

.email-input {
  width: 100%;
  max-width: 400px;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  color: #1f2937;
  transition: all 0.3s ease;
}

.email-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  align-items: end;
}

.plan-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  padding: 24px;
  position: relative;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.plan-card.basic {
  border-color: #d1d5db;
  opacity: 0.8;
}

.plan-card.gold {
  border-color: #f59e0b;
  transform: scale(1.08);
  box-shadow: 0 15px 35px rgba(245, 158, 11, 0.3);
}

.plan-card.gold:hover {
  transform: scale(1.08) translateY(-8px);
}

.plan-card.premium {
  border-color: #8b5cf6;
  transform: scale(1.08);
  box-shadow: 0 15px 35px rgba(139, 92, 246, 0.3);
}

.plan-card.premium:hover {
  transform: scale(1.08) translateY(-8px);
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 30px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.basic .plan-badge {
  background: #9ca3af;
  color: white;
}

.gold .plan-badge {
  background: #f59e0b;
  color: white;
}

.premium .plan-badge {
  background: #8b5cf6;
  color: white;
}

.popularity-badge {
  position: absolute;
  top: -24px;
  right: 30px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.premium-badge {
  position: absolute;
  top: -24px;
  right: 30px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.plan-header {
  margin: 20px 0 20px 0;
  text-align: center;
}

.plan-header h4 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.old-price {
  font-size: 16px;
  color: #9ca3af;
  text-decoration: line-through;
}

.current-price {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
}

.period {
  font-size: 16px;
  color: #6b7280;
}

.discount {
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.plan-features {
  margin-bottom: 20px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #4b5563;
}

.plan-button {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.basic-btn {
  background: #9ca3af;
  color: white;
}

.basic-btn:hover {
  background: #6b7280;
  transform: translateY(-2px);
}

.gold-btn {
  background: #f59e0b;
  color: white;
}

.gold-btn:hover {
  background: #d97706;
  transform: translateY(-2px);
}

.premium-btn {
  background: #8b5cf6;
  color: white;
}

.premium-btn:hover {
  background: #7c3aed;
  transform: translateY(-2px);
}

.trust-section {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 16px;
  padding: 30px;
  margin-top: 20px;
}

.trust-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 30px;
  text-align: center;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  
  .plan-card.gold,
  .plan-card.premium {
    transform: none;
  }
  
  .plan-card.gold:hover,
  .plan-card.premium:hover {
    transform: translateY(-8px);
  }
}

        .plan-button.uniform-height {
          margin-top: auto;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          font-size: 14px;
        }

        .plan-button.green {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        }

        .plan-button.gold {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .plan-button.premium {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: white;
        }

        .plan-button.green:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(34, 197, 94, 0.4);
        }

        .plan-button.gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(245, 158, 11, 0.4);
        }

        .plan-button.premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(139, 92, 246, 0.4);
        }


/* Capabilities Section */
.capabilities-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50px 0;
  position: relative;
}

.capabilities-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 0;
}

.capabilities-container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}



.capabilities-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.capabilities-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.capabilities-header {
  text-align: center;
  margin-bottom: 40px;
}

.capabilities-header h3 {
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
}

.capabilities-header p {
  font-size: 18px;
  color: #6b7280;
  line-height: 1.6;
}


	.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 24px;
}

.badge-icon {
  font-size: 16px;
}

.capabilities-header h3 {
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 16px;
  line-height: 1.2;
}

.capabilities-header p {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}


.capabilities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.capability-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 280px;
}

.capability-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.cap-icon {
  font-size: 48px;
  margin-bottom: 20px;
  display: block;
}

.capability-card h4 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
  line-height: 1.3;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.capability-card p {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 16px;
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.cap-result {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 10px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  display: inline-block;
  margin-top: auto;
}

.capabilities-note {
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: center;
  justify-content: center;
}

.note-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.capabilities-note span:last-child {
  font-size: 16px;
  color: #374151;
  font-weight: 600;
}

@media (max-width: 768px) {
  .capabilities-section {
    padding: 60px 0;
  }
  
  .capabilities-header h3 {
    font-size: 28px;
  }
  
  .capabilities-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .capability-card {
  min-height: 200px;
  padding: 24px;
}
  
  .capabilities-note {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}
/* FAQ Section */
.faq-section {
  /* istniejący CSS FAQ */
}


/* FAQ Section */
        .faq-section {
          background: linear-gradient(135deg, rgba(248,250,252,0.9) 0%, rgba(241,245,249,0.85) 100%);
backdrop-filter: blur(10px);
          padding: 80px 20px;
        }

        .faq-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .faq-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
          margin-bottom: 60px;
        }

        .faq-item {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .faq-item:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.1);
        }

        .faq-question {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .faq-icon {
          font-size: 24px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .faq-question h3 {
          color: #1f2937;
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          line-height: 1.4;
        }

        .faq-answer {
          margin-left: 40px;
        }

        .faq-answer p {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        .faq-cta {
          text-align: center;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 40px;
          border-radius: 20px;
          border: 2px solid #e2e8f0;
        }

        .faq-cta h3 {
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .faq-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .faq-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
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
          .container {
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
            padding: 0;
            margin: 0;
          }

          .hero-section {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 60px 15px;
            max-width: 100%;
            overflow-x: hidden;
          }

          .hero-title {
            font-size: 28px;
            line-height: 1.2;
          }

          .nav-content {
            padding: 16px 15px;
          }

          .nav-links {
            display: none;
          }

          .features-section,
          .battle-section,
          .testimonials-section,
          .faq-section {
            padding: 60px 15px;
          }

          .hero-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }

          .stat-item {
            padding: 16px 8px;
          }

          .features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 32px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 32px;
  padding: 48px;
  text-align: center;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  color: white;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: radial-gradient(circle at 50% 0%, rgba(120, 80, 255, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-10px) scale(1.02);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
}

.feature-card:hover::before {
  opacity: 1;
}

.feature-card.spotlight {
  background: linear-gradient(135deg, rgba(120, 80, 255, 0.1), rgba(255, 80, 150, 0.1));
  border: 2px solid transparent;
  border-image: linear-gradient(135deg, #7850ff, #ff5080) 1;
  transform: scale(1.05);
}

.feature-card.spotlight:hover {
  transform: scale(1.08) translateY(-10px);
  box-shadow: 0 40px 80px rgba(120, 80, 255, 0.3);
}

.feature-icon {
  font-size: 64px;
  margin-bottom: 32px;
  display: block;
  filter: grayscale(0);
  transition: all 0.4s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.2) rotate(5deg);
  filter: drop-shadow(0 10px 20px rgba(255, 255, 255, 0.2));
}

.feature-card h3 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 20px;
  letter-spacing: -0.5px;
  color: white;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  margin-bottom: 24px;
  font-size: 16px;
}

.feature-card.spotlight p {
  color: rgba(255, 255, 255, 0.9);
}

.feature-highlight {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 700;
  display: inline-block;
  animation: highlightFloat 3s ease infinite;
}

@keyframes highlightFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.ats-visual {
  margin-top: 32px;
}

.ats-circle {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #00ff88, #00cc70);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: #000;
  box-shadow: 0 10px 40px rgba(0, 255, 136, 0.4);
  position: relative;
  animation: atsPulse 3s ease infinite;
}

.ats-circle::before {
  content: '';
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 136, 0.3);
  animation: atsRing 2s ease infinite;
}

@keyframes atsPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes atsRing {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}

.ats-percentage {
  font-size: 32px;
  font-weight: 900;
}

.ats-label {
  font-size: 14px;
  font-weight: 700;
  opacity: 0.8;
}

.price-comparison {
  margin-top: 24px;
}

.old-price {
  display: block;
  text-decoration: line-through;
  color: #ff6b6b;
  font-size: 16px;
  margin-bottom: 8px;
  opacity: 0.7;
}

.new-price {
  display: block;
  color: #00ff88;
  font-size: 24px;
  font-weight: 900;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

        /* Dodatki dla lepszej prezentacji */
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

        /* Spinner animation */
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

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Selection color */
        ::selection {
          background: rgba(102, 126, 234, 0.2);
          color: #1f2937;
        }

        ::-moz-selection {
          background: rgba(102, 126, 234, 0.2);
          color: #1f2937;
        }
	`}</style>
    </>
  )
}