import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function PolitykaPrywatnosci() {
  const router = useRouter()
  const { locale } = router
  const [currentLanguage, setCurrentLanguage] = useState('pl')
  const [activeSection, setActiveSection] = useState('intro')
  const [scrollProgress, setScrollProgress] = useState(0)
  const [expandedSections, setExpandedSections] = useState({})
  const [quizActive, setQuizActive] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [dataFlowActive, setDataFlowActive] = useState(false)
  const canvasRef = useRef(null)  
  useEffect(() => {
    if (locale) setCurrentLanguage(locale)
  }, [locale])

  // Scroll Progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Data Flow Animation
  useEffect(() => {
    if (!dataFlowActive) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    
    const particles = []
    const nodes = [
      { x: canvas.width * 0.1, y: canvas.height * 0.5, label: 'User', color: '#7850ff' },
      { x: canvas.width * 0.3, y: canvas.height * 0.3, label: 'CvPerfect', color: '#ff5080' },
      { x: canvas.width * 0.5, y: canvas.height * 0.5, label: 'AI Engine', color: '#50b4ff' },
      { x: canvas.width * 0.7, y: canvas.height * 0.7, label: 'Database', color: '#00ff88' },
      { x: canvas.width * 0.9, y: canvas.height * 0.5, label: 'Result', color: '#ffd700' }
    ]
    
    class DataParticle {
      constructor(startNode, endNode) {
        this.start = startNode
        this.end = endNode
        this.progress = 0
        this.speed = 0.01 + Math.random() * 0.02
        this.size = 3 + Math.random() * 3
        this.trail = []
      }
      
      update() {
        this.progress += this.speed
        if (this.progress >= 1) {
          this.progress = 0
          this.trail = []
        }
        
        const x = this.start.x + (this.end.x - this.start.x) * this.progress
        const y = this.start.y + (this.end.y - this.start.y) * this.progress
        
        this.trail.push({ x, y, opacity: 1 })
        if (this.trail.length > 10) {
          this.trail.shift()
        }
        
        this.trail.forEach((point, index) => {
          point.opacity = (index + 1) / this.trail.length * 0.5
        })
      }
      
      draw() {
        // Draw trail
        this.trail.forEach((point, index) => {
          ctx.save()
          ctx.globalAlpha = point.opacity
          ctx.fillStyle = this.start.color
          ctx.beginPath()
          ctx.arc(point.x, point.y, this.size * (index / this.trail.length), 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })
        
        // Draw main particle
        const x = this.start.x + (this.end.x - this.start.x) * this.progress
        const y = this.start.y + (this.end.y - this.start.y) * this.progress
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.size * 2)
        gradient.addColorStop(0, this.start.color)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    
    // Create data flow paths
    const flows = [
      [nodes[0], nodes[1]],
      [nodes[1], nodes[2]],
      [nodes[2], nodes[3]],
      [nodes[3], nodes[4]],
      [nodes[1], nodes[3]],
      [nodes[2], nodes[4]]
    ]
    
    flows.forEach(([start, end]) => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          particles.push(new DataParticle(start, end))
        }, i * 500)
      }
    })
    
    let animationId
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw connections
      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach(otherNode => {
          ctx.save()
          ctx.strokeStyle = 'rgba(120, 80, 255, 0.1)'
          ctx.lineWidth = 1
          ctx.setLineDash([5, 10])
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(otherNode.x, otherNode.y)
          ctx.stroke()
          ctx.restore()
        })
      })
      
      // Draw nodes
      nodes.forEach(node => {
        // Glow effect
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 30)
        glow.addColorStop(0, node.color + '40')
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(node.x, node.y, 30, 0, Math.PI * 2)
        ctx.fill()
        
        // Node circle
        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.arc(node.x, node.y, 10, 0, Math.PI * 2)
        ctx.fill()
        
        // Label
        ctx.fillStyle = 'white'
        ctx.font = '12px Inter'
        ctx.textAlign = 'center'
        ctx.fillText(node.label, node.x, node.y - 20)
      })
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [dataFlowActive])

  const translations = {
    pl: {
      title: 'Polityka Prywatności - CvPerfect | Ochrona Twoich Danych',
      pageTitle: 'Polityka Prywatności',
      subtitle: 'Transparentność i bezpieczeństwo Twoich danych',
      lastUpdate: 'Ostatnia aktualizacja: 15 sierpnia 2025',
      backLink: '← Powrót',
      
      // Quick Info
      quickInfo: 'Szybkie info',
      dataRemoval: 'Dane CV usuwane po 24h',
      gdprCompliant: '100% zgodność z RODO',
      noSpam: 'Zero spamu',
      encryption: 'Pełne szyfrowanie',
      
      // Quiz
      quizTitle: 'Quiz RODO',
      quizSubtitle: 'Sprawdź swoją wiedzę o prywatności',
      startQuiz: 'Rozpocznij quiz',
      nextQuestion: 'Następne pytanie',
      finishQuiz: 'Zakończ quiz',
      yourScore: 'Twój wynik',
      tryAgain: 'Spróbuj ponownie',
      
      quizQuestions: [
        {
          question: 'Jak długo przechowujemy treść Twojego CV?',
          answers: ['7 dni', '24 godziny', '30 dni', 'Na zawsze'],
          correct: 1
        },
        {
          question: 'Czy sprzedajemy Twoje dane firmom trzecim?',
          answers: ['Tak, wszystkim', 'Tylko partnerom', 'Nigdy', 'Czasami'],
          correct: 2
        },
        {
          question: 'W jakim czasie możesz zażądać usunięcia danych?',
          answers: ['W każdej chwili', 'Po 30 dniach', 'Po roku', 'Nie można'],
          correct: 0
        }
      ],
      
      // Data Flow
      dataFlowTitle: 'Przepływ danych',
      dataFlowSubtitle: 'Zobacz jak bezpiecznie przetwarzamy Twoje dane',
      showDataFlow: 'Pokaż animację',
      hideDataFlow: 'Ukryj animację',
      
      // Sections
      sections: [
        {
          id: 'admin',
          icon: '🏢',
          title: 'Administrator danych',
          content: {
            intro: 'CvPerfect jest administratorem Twoich danych osobowych.',
            details: [
              'Siedziba: Polska',
              'Email: pomoc@cvperfect.pl',
              
            ]
          }
        },
        {
          id: 'data',
          icon: '📊',
          title: 'Zakres danych',
          content: {
            intro: 'Przetwarzamy tylko niezbędne dane:',
            categories: [
              { name: 'Dane kontaktowe', items: ['Email', 'Imię (opcjonalnie)'] },
              { name: 'Treść CV', items: ['Tekst CV', 'Usuwane po 24h'] },
              { name: 'Dane techniczne', items: ['IP', 'Przeglądarka', 'Logi (30 dni)'] },
              { name: 'Płatności', items: ['Historia transakcji', 'Status subskrypcji'] }
            ]
          }
        },
        {
          id: 'purpose',
          icon: '🎯',
          title: 'Cele przetwarzania',
          content: {
            intro: 'Twoje dane przetwarzamy w celu:',
            purposes: [
              { title: 'Optymalizacja CV', basis: 'Wykonanie umowy' },
              { title: 'Wysyłka rezultatów', basis: 'Wykonanie umowy' },
              { title: 'Obsługa płatności', basis: 'Obowiązek prawny' },
              { title: 'Bezpieczeństwo', basis: 'Uzasadniony interes' }
            ]
          }
        },
        {
          id: 'retention',
          icon: '⏰',
          title: 'Okres przechowywania',
          content: {
            intro: 'Przechowujemy dane tylko tak długo jak to konieczne:',
            periods: [
              { data: 'Treść CV', time: '24 godziny', color: '#00ff88' },
              { data: 'Logi systemowe', time: '30 dni', color: '#ffd700' },
              { data: 'Dane techniczne', time: '12 miesięcy', color: '#50b4ff' },
              { data: 'Dane płatności', time: '5 lat', color: '#ff5080' }
            ]
          }
        },
        {
          id: 'sharing',
          icon: '🤝',
          title: 'Udostępnianie danych',
          content: {
            intro: 'Współpracujemy tylko z zaufanymi partnerami:',
            partners: [
              { name: 'Stripe', purpose: 'Płatności', icon: '💳' },
              { name: 'Groq AI', purpose: 'Przetwarzanie AI', icon: '🤖' },
              { name: 'Vercel', purpose: 'Hosting', icon: '☁️' },
              { name: 'Supabase', purpose: 'Baza danych', icon: '🗄️' }
            ]
          }
        },
        {
          id: 'rights',
          icon: '⚖️',
          title: 'Twoje prawa',
          content: {
            intro: 'Masz pełną kontrolę nad swoimi danymi:',
            rights: [
              { name: 'Dostęp do danych', desc: 'Sprawdź jakie dane posiadamy' },
              { name: 'Sprostowanie', desc: 'Popraw błędne informacje' },
              { name: 'Usunięcie', desc: 'Usuń swoje dane w 24h' },
              { name: 'Ograniczenie', desc: 'Ogranicz przetwarzanie' },
              { name: 'Przenoszenie', desc: 'Pobierz dane w formacie JSON' },
              { name: 'Sprzeciw', desc: 'Sprzeciw się przetwarzaniu' }
            ]
          }
        },
        {
          id: 'security',
          icon: '🔐',
          title: 'Bezpieczeństwo',
          content: {
            intro: 'Stosujemy najwyższe standardy bezpieczeństwa:',
            measures: [
              'Szyfrowanie SSL/TLS',
              'Automatyczne usuwanie CV',
              'Monitoring 24/7',
              'Regularne audyty',
              'Backup danych',
              'Ograniczony dostęp'
            ]
          }
        },
        {
          id: 'cookies',
          icon: '🍪',
          title: 'Pliki cookies',
          content: {
            intro: 'Używamy tylko niezbędnych cookies:',
            types: [
              { name: 'Funkcjonalne', desc: 'Podstawowe działanie serwisu' },
              { name: 'Analityczne', desc: 'Poprawa jakości usług' },
              { name: 'Bezpieczeństwa', desc: 'Ochrona przed atakami' }
            ]
          }
        }
      ],
      
      // Footer
      contact: 'Kontakt',
      contactText: 'Masz pytania o prywatność?',
      contactEmail: 'pomoc@cvperfect.pl',
      trustBadge: 'Zaufało nam już ponad 50,000 użytkowników'
    },
    en: {
      title: 'Privacy Policy - CvPerfect | Your Data Protection',
      pageTitle: 'Privacy Policy',
      subtitle: 'Transparency and security of your data',
      lastUpdate: 'Last updated: August 15, 2025',
      backLink: '← Back',
      
      // Quick Info
      quickInfo: 'Quick info',
      dataRemoval: 'CV data deleted after 24h',
      gdprCompliant: '100% GDPR compliant',
      noSpam: 'Zero spam',
      encryption: 'Full encryption',
      
      // Quiz
      quizTitle: 'GDPR Quiz',
      quizSubtitle: 'Test your privacy knowledge',
      startQuiz: 'Start quiz',
      nextQuestion: 'Next question',
      finishQuiz: 'Finish quiz',
      yourScore: 'Your score',
      tryAgain: 'Try again',
      
      quizQuestions: [
        {
          question: 'How long do we store your CV content?',
          answers: ['7 days', '24 hours', '30 days', 'Forever'],
          correct: 1
        },
        {
          question: 'Do we sell your data to third parties?',
          answers: ['Yes, to everyone', 'Only to partners', 'Never', 'Sometimes'],
          correct: 2
        },
        {
          question: 'When can you request data deletion?',
          answers: ['Anytime', 'After 30 days', 'After a year', 'Never'],
          correct: 0
        }
      ],
      
      // Data Flow
      dataFlowTitle: 'Data flow',
      dataFlowSubtitle: 'See how we securely process your data',
      showDataFlow: 'Show animation',
      hideDataFlow: 'Hide animation',
      
      // Sections
      sections: [
        {
          id: 'admin',
          icon: '🏢',
          title: 'Data controller',
          content: {
            intro: 'CvPerfect is the controller of your personal data.',
            details: [
              'Headquarters: Poland',
              'Email: support@cvperfect.pl',
              'Data Protection Officer: dpo@cvperfect.pl'
            ]
          }
        },
        {
          id: 'data',
          icon: '📊',
          title: 'Data scope',
          content: {
            intro: 'We process only necessary data:',
            categories: [
              { name: 'Contact data', items: ['Email', 'Name (optional)'] },
              { name: 'CV content', items: ['CV text', 'Deleted after 24h'] },
              { name: 'Technical data', items: ['IP', 'Browser', 'Logs (30 days)'] },
              { name: 'Payments', items: ['Transaction history', 'Subscription status'] }
            ]
          }
        },
        {
          id: 'purpose',
          icon: '🎯',
          title: 'Processing purposes',
          content: {
            intro: 'We process your data for:',
            purposes: [
              { title: 'CV optimization', basis: 'Contract execution' },
              { title: 'Results delivery', basis: 'Contract execution' },
              { title: 'Payment processing', basis: 'Legal obligation' },
              { title: 'Security', basis: 'Legitimate interest' }
            ]
          }
        },
        {
          id: 'retention',
          icon: '⏰',
          title: 'Retention period',
          content: {
            intro: 'We keep data only as long as necessary:',
            periods: [
              { data: 'CV content', time: '24 hours', color: '#00ff88' },
              { data: 'System logs', time: '30 days', color: '#ffd700' },
              { data: 'Technical data', time: '12 months', color: '#50b4ff' },
              { data: 'Payment data', time: '5 years', color: '#ff5080' }
            ]
          }
        },
        {
          id: 'sharing',
          icon: '🤝',
          title: 'Data sharing',
          content: {
            intro: 'We work only with trusted partners:',
            partners: [
              { name: 'Stripe', purpose: 'Payments', icon: '💳' },
              { name: 'Groq AI', purpose: 'AI processing', icon: '🤖' },
              { name: 'Vercel', purpose: 'Hosting', icon: '☁️' },
              { name: 'Supabase', purpose: 'Database', icon: '🗄️' }
            ]
          }
        },
        {
          id: 'rights',
          icon: '⚖️',
          title: 'Your rights',
          content: {
            intro: 'You have full control over your data:',
            rights: [
              { name: 'Data access', desc: 'Check what data we have' },
              { name: 'Rectification', desc: 'Correct wrong information' },
              { name: 'Deletion', desc: 'Delete your data in 24h' },
              { name: 'Restriction', desc: 'Limit processing' },
              { name: 'Portability', desc: 'Download data in JSON' },
              { name: 'Objection', desc: 'Object to processing' }
            ]
          }
        },
        {
          id: 'security',
          icon: '🔐',
          title: 'Security',
          content: {
            intro: 'We use highest security standards:',
            measures: [
              'SSL/TLS encryption',
              'Automatic CV deletion',
              '24/7 monitoring',
              'Regular audits',
              'Data backup',
              'Limited access'
            ]
          }
        },
        {
          id: 'cookies',
          icon: '🍪',
          title: 'Cookies',
          content: {
            intro: 'We use only necessary cookies:',
            types: [
              { name: 'Functional', desc: 'Basic site operation' },
              { name: 'Analytics', desc: 'Service improvement' },
              { name: 'Security', desc: 'Attack protection' }
            ]
          }
        }
      ],
      
      // Footer
      contact: 'Contact',
      contactText: 'Have privacy questions?',
      contactEmail: 'support@cvperfect.pl',
      trustBadge: 'Trusted by over 50,000 users'
    }
  }

  const t = translations[currentLanguage]

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

const handleQuizAnswer = (answerIndex) => {
  const question = t.quizQuestions[currentQuestion]
  
  if (currentQuestion < t.quizQuestions.length - 1) {
    if (answerIndex === question.correct) {
      setQuizScore(prev => prev + 1)
    }
    setCurrentQuestion(currentQuestion + 1)
  } else {
    // Last question
    if (answerIndex === question.correct) {
      setQuizScore(prev => prev + 1)
    }
    // Quiz finished - show result
    setCurrentQuestion(t.quizQuestions.length) // Set to length to show result
  }
}
  

const resetQuiz = () => {
  setQuizScore(0)
  setCurrentQuestion(0)
  setQuizActive(true)
}

  return (
    <>
      <Head>
        <title>{t.title}</title>
        <meta name="description" content={t.subtitle} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="privacy-container">
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${scrollProgress}%` }}></div>
        </div>

        {/* Animated Background */}
        <div className="animated-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="floating-particles"></div>
        </div>

        {/* Navigation */}
        <nav className="navigation">
          <div className="nav-content">
            <div className="logo" onClick={() => router.push('/')}>
              <span className="logo-badge">AI</span>
              <span className="logo-text">CvPerfect</span>
            </div>
            
            <div className="nav-actions">
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
              <button className="back-btn" onClick={() => router.push('/')}>
                {t.backLink}
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-gradient">{t.pageTitle}</span>
            </h1>
            <p className="hero-subtitle">{t.subtitle}</p>
            <p className="last-update">{t.lastUpdate}</p>
            
            {/* Quick Info Cards */}
            <div className="quick-info-grid">
              <div className="info-card">
                <div className="info-icon">⚡</div>
                <span>{t.dataRemoval}</span>
              </div>
              <div className="info-card">
                <div className="info-icon">🛡️</div>
                <span>{t.gdprCompliant}</span>
              </div>
              <div className="info-card">
                <div className="info-icon">🚫</div>
                <span>{t.noSpam}</span>
              </div>
              <div className="info-card">
                <div className="info-icon">🔐</div>
                <span>{t.encryption}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Features */}
        <section className="interactive-section">
          <div className="features-grid">
            {/* GDPR Quiz */}
            <div className="feature-card quiz-card">
              <div className="card-header">
                <h3>🎯 {t.quizTitle}</h3>
                <p>{t.quizSubtitle}</p>
              </div>
              
              {!quizActive ? (
                <div className="quiz-start">
                  <button className="quiz-btn" onClick={() => setQuizActive(true)}>
                    {t.startQuiz}
                  </button>
                  {quizScore > 0 && (
                    <div className="previous-score">
                      {t.yourScore}: {quizScore}/{t.quizQuestions.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="quiz-content">
                  {currentQuestion < t.quizQuestions.length ? (
                    <>
                      <div className="question-progress">
                        {currentQuestion + 1}/{t.quizQuestions.length}
                      </div>
                      <h4>{t.quizQuestions[currentQuestion].question}</h4>
                      <div className="answers-grid">
                        {t.quizQuestions[currentQuestion].answers.map((answer, index) => (
                          <button
                            key={index}
                            className="answer-btn"
                            onClick={() => handleQuizAnswer(index)}
                          >
                            {answer}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="quiz-result">
                      <div className="score-display">
                        <span className="score-number">{quizScore}</span>
                        <span className="score-total">/{t.quizQuestions.length}</span>
                      </div>
                      <button className="quiz-btn" onClick={resetQuiz}>
                        {t.tryAgain}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Data Flow Visualization */}
            <div className="feature-card flow-card">
              <div className="card-header">
                <h3>🔄 {t.dataFlowTitle}</h3>
                <p>{t.dataFlowSubtitle}</p>
              </div>
              
<button 
  className="flow-btn"
  onClick={() => setDataFlowActive(!dataFlowActive)}
  type="button"
  style={{ position: 'relative', zIndex: 10 }}
>
  {dataFlowActive ? t.hideDataFlow : t.showDataFlow}
</button>
              
              {dataFlowActive && (
                <canvas 
                  ref={canvasRef}
                  className="data-flow-canvas"
                  width="400"
                  height="300"
                />
              )}
            </div>
          </div>
        </section>

        {/* Main Content - Accordion Sections */}
        <section className="content-section">
          <div className="sections-container">
            {t.sections.map((section, index) => (
              <div 
                key={section.id}
                className={`accordion-item ${expandedSections[section.id] ? 'expanded' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  className="accordion-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="header-left">
                    <span className="section-icon">{section.icon}</span>
                    <h3>{section.title}</h3>
                  </div>
                  <div className="expand-icon">
                    {expandedSections[section.id] ? '−' : '+'}
                  </div>
                </button>
                
                <div className={`accordion-content ${expandedSections[section.id] ? 'show' : ''}`}>
                  <div className="content-inner">
                    <p className="content-intro">{section.content.intro}</p>
                    
                    {/* Different content layouts based on section */}
                    {section.id === 'admin' && (
                      <div className="admin-details">
                        {section.content.details.map((detail, i) => (
                          <div key={i} className="detail-item">
                            <span className="detail-icon">→</span>
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.id === 'data' && (
                      <div className="data-categories">
                        {section.content.categories.map((category, i) => (
                          <div key={i} className="category-box">
                            <h4>{category.name}</h4>
                            <ul>
                              {category.items.map((item, j) => (
                                <li key={j}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.id === 'purpose' && (
                      <div className="purposes-grid">
                        {section.content.purposes.map((purpose, i) => (
                          <div key={i} className="purpose-card">
                            <h4>{purpose.title}</h4>
                            <span className="legal-basis">{purpose.basis}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.id === 'retention' && (
                      <div className="retention-timeline">
                        {section.content.periods.map((period, i) => (
                          <div key={i} className="timeline-item">
                            <div 
                              className="timeline-dot"
                              style={{ backgroundColor: period.color }}
                            ></div>
                            <div className="timeline-content">
                              <h4>{period.data}</h4>
                              <span style={{ color: period.color }}>{period.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.id === 'sharing' && (
                      <div className="partners-grid">
                        {section.content.partners.map((partner, i) => (
                          <div key={i} className="partner-card">
                            <div className="partner-icon">{partner.icon}</div>
                            <h4>{partner.name}</h4>
                            <p>{partner.purpose}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.id === 'rights' && (
                      <div className="rights-grid">
                        {section.content.rights.map((right, i) => (
                          <div key={i} className="right-card">
                            <h4>{right.name}</h4>
                            <p>{right.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.id === 'security' && (
                      <div className="security-measures">
                        {section.content.measures.map((measure, i) => (
                          <div key={i} className="measure-item">
                            <span className="measure-icon">✓</span>
                            <span>{measure}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.id === 'cookies' && (
                      <div className="cookies-types">
                        {section.content.types.map((type, i) => (
                          <div key={i} className="cookie-type">
                            <h4>🍪 {type.name}</h4>
                            <p>{type.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}

</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="privacy-footer">
          <div className="footer-content">
            <div className="trust-badge">
              <span className="badge-icon">🛡️</span>
              <span>{t.trustBadge}</span>
            </div>
            
            <div className="contact-section">
              <h3>{t.contactText}</h3>
              <a href={`mailto:${t.contactEmail}`} className="contact-link">
                {t.contactEmail}
              </a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        /* Global Styles */
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
        .privacy-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a0f2e 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        /* Progress Bar */
        .progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          z-index: 10000;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #7850ff, #ff5080, #50b4ff);
          transition: width 0.3s ease;
          box-shadow: 0 0 10px rgba(120, 80, 255, 0.5);
        }

        /* Animated Background */
        .animated-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.4;
          animation: floatOrb 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #7850ff, #9060ff);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #ff5080, #ff70a0);
          bottom: -150px;
          right: -150px;
          animation-delay: 7s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, #50b4ff, #70c4ff);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 14s;
        }

        @keyframes floatOrb {
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

        .floating-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(120, 80, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 80, 150, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(80, 180, 255, 0.1) 0%, transparent 50%);
          animation: particlesFloat 30s linear infinite;
        }

        @keyframes particlesFloat {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
          }
        }

        /* Navigation */
        .navigation {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 20px 40px;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .logo-badge {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          padding: 8px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
          box-shadow: 0 4px 20px rgba(120, 80, 255, 0.4);
        }

        .logo-text {
          font-size: 24px;
          font-weight: 900;
          background: linear-gradient(135deg, #fff, #999);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
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
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .lang-btn:hover {
          color: white;
        }

        .lang-btn.active {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3);
        }

        .back-btn {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(120, 80, 255, 0.3);
        }

        .back-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(120, 80, 255, 0.5);
        }

        /* Hero Section */
        .hero-section {
          padding: 140px 40px 60px;
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .hero-content {
          max-width: 1000px;
          margin: 0 auto;
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

        .hero-title {
          font-size: clamp(48px, 6vw, 72px);
          font-weight: 900;
          margin-bottom: 20px;
          line-height: 1.1;
        }

        .title-gradient {
          background: linear-gradient(135deg, #7850ff, #ff5080, #50b4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradientMove 4s ease infinite;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .hero-subtitle {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 10px;
        }

        .last-update {
          font-size: 14px;
          color: #00ff88;
          margin-bottom: 40px;
        }

        .quick-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          animation: slideIn 0.6s ease;
          animation-fill-mode: both;
        }

        .info-card:nth-child(1) { animation-delay: 0.1s; }
        .info-card:nth-child(2) { animation-delay: 0.2s; }
        .info-card:nth-child(3) { animation-delay: 0.3s; }
        .info-card:nth-child(4) { animation-delay: 0.4s; }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .info-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(120, 80, 255, 0.3);
          box-shadow: 0 10px 30px rgba(120, 80, 255, 0.2);
        }

        .info-icon {
          font-size: 24px;
          animation: iconPulse 2s ease infinite;
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        /* Interactive Section */
        .interactive-section {
          padding: 60px 40px;
          position: relative;
          z-index: 2;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 30px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(120, 80, 255, 0.3);
          box-shadow: 0 20px 40px rgba(120, 80, 255, 0.15);
        }

        .card-header {
          margin-bottom: 24px;
        }

        .card-header h3 {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .card-header p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        /* Quiz Styles */
        .quiz-btn, .flow-btn {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .quiz-btn:hover, .flow-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(120, 80, 255, 0.3);
        }

.quiz-content {
  animation: fadeIn 0.5s ease;
  position: relative;
  z-index: 5;
}

.answers-grid {
  display: grid;
  gap: 12px;
  position: relative;
  z-index: 10;
}

        .question-progress {
          text-align: center;
          color: #00ff88;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .quiz-content h4 {
          margin-bottom: 20px;
          font-size: 18px;
        }

        .answers-grid {
          display: grid;
          gap: 12px;
        }

.answer-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 12px;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
}

.answer-btn:hover {
  background: rgba(120, 80, 255, 0.2);
  border-color: rgba(120, 80, 255, 0.5);
  transform: translateX(5px);
}

.answer-btn:active {
  transform: translateX(3px) scale(0.98);
}

        .quiz-result {
          text-align: center;
          animation: scaleIn 0.5s ease;
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

        .score-display {
          margin: 20px 0;
        }

        .score-number {
          font-size: 48px;
          font-weight: 900;
          color: #00ff88;
        }

        .score-total {
          font-size: 24px;
          color: rgba(255, 255, 255, 0.6);
        }

        .previous-score {
          margin-top: 12px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        /* Data Flow Canvas */
        .data-flow-canvas {
          width: 100%;
          height: 300px;
          margin-top: 20px;
          border-radius: 16px;
          background: rgba(0, 0, 0, 0.3);
        }

        /* Content Section */
        .content-section {
          padding: 60px 40px;
          position: relative;
          z-index: 2;
        }

        .sections-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .accordion-item {
          margin-bottom: 16px;
          animation: slideInLeft 0.6s ease;
          animation-fill-mode: both;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .accordion-header {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 24px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          font-size: 16px;
        }

        .accordion-item.expanded .accordion-header {
          background: linear-gradient(135deg, rgba(120, 80, 255, 0.2), rgba(255, 80, 150, 0.1));
          border-color: rgba(120, 80, 255, 0.3);
          border-radius: 20px 20px 0 0;
        }

        .accordion-header:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateX(5px);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .section-icon {
          font-size: 28px;
          animation: iconFloat 3s ease infinite;
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .header-left h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }

        .expand-icon {
          font-size: 24px;
          font-weight: 300;
          transition: transform 0.3s ease;
        }

        .accordion-item.expanded .expand-icon {
          transform: rotate(45deg);
        }

        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s ease, opacity 0.3s ease;
          opacity: 0;
        }

        .accordion-content.show {
          max-height: 1000px;
          opacity: 1;
        }

        .content-inner {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: none;
          border-radius: 0 0 20px 20px;
          padding: 30px;
        }

        .content-intro {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 24px;
          font-size: 16px;
          line-height: 1.6;
        }

        /* Section-specific styles */
        .admin-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .detail-icon {
          color: #7850ff;
          font-weight: bold;
        }

        .data-categories {
          display: grid;
          gap: 20px;
        }

        .category-box {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          border-left: 3px solid #7850ff;
        }

        .category-box h4 {
          color: white;
          margin-bottom: 12px;
          font-size: 16px;
        }

        .category-box ul {
          list-style: none;
          padding: 0;
        }

        .category-box li {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
        }

        .category-box li:before {
          content: '•';
          position: absolute;
          left: 0;
          color: #50b4ff;
        }

        .purposes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .purpose-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .purpose-card:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.08);
        }

        .purpose-card h4 {
          color: white;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .legal-basis {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          display: inline-block;
        }

        .retention-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .timeline-item:hover {
          transform: translateX(10px);
          background: rgba(255, 255, 255, 0.05);
        }

        .timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 20px currentColor;
        }

        .timeline-content h4 {
          color: white;
          margin-bottom: 4px;
          font-size: 16px;
        }

        .timeline-content span {
          font-weight: 600;
          font-size: 14px;
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
        }

        .partner-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .partner-card:hover {
          transform: translateY(-5px) scale(1.05);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(120, 80, 255, 0.2);
        }

        .partner-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .partner-card h4 {
          color: white;
          margin-bottom: 4px;
          font-size: 16px;
        }

        .partner-card p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
        }

        .rights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .right-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .right-card:hover {
          transform: translateY(-3px);
          border-color: rgba(120, 80, 255, 0.3);
          background: rgba(120, 80, 255, 0.1);
        }

        .right-card h4 {
          color: white;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .right-card p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .security-measures {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .measure-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .measure-item:hover {
          background: rgba(0, 255, 136, 0.1);
          transform: translateX(5px);
        }

        .measure-icon {
          color: #00ff88;
          font-weight: bold;
        }

        .cookie-type h4 {
          color: white;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .cookie-type p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        /* Footer */
        .privacy-footer {
          padding: 80px 40px 40px;
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .footer-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 112, 0.1));
          border: 1px solid rgba(0, 255, 136, 0.3);
          padding: 12px 24px;
          border-radius: 100px;
          margin-bottom: 32px;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(0, 255, 136, 0.2);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 30px rgba(0, 255, 136, 0.3);
          }
        }

        .badge-icon {
          font-size: 24px;
        }

        .contact-section h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
          color: white;
        }

        .contact-link {
          display: inline-block;
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 100px;
          font-weight: 700;
          transition: all 0.3s ease;
          margin-top: 12px;
        }

        .contact-link:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(120, 80, 255, 0.4);
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .navigation {
            padding: 16px 20px;
          }

          .nav-content {
            flex-direction: column;
            gap: 16px;
          }

          .hero-section {
            padding: 120px 20px 40px;
          }

          .hero-title {
            font-size: 36px;
          }

          .quick-info-grid {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .interactive-section {
            padding: 40px 20px;
          }

          .content-section {
            padding: 40px 20px;
          }

          .accordion-header {
            padding: 20px;
          }

          .section-icon {
            font-size: 24px;
          }

          .header-left h3 {
            font-size: 18px;
          }

          .content-inner {
            padding: 20px;
          }

          .purposes-grid,
          .partners-grid,
          .rights-grid,
          .security-measures {
            grid-template-columns: 1fr;
          }

          .privacy-footer {
            padding: 60px 20px 30px;
          }
        }

        /* Accessibility */
        .accordion-header:focus-visible,
        .quiz-btn:focus-visible,
        .flow-btn:focus-visible,
        .answer-btn:focus-visible,
        .lang-btn:focus-visible,
        .back-btn:focus-visible,
        .contact-link:focus-visible {
          outline: 2px solid #7850ff;
          outline-offset: 2px;
        }

        /* Print Styles */
        @media print {
          .navigation,
          .progress-bar,
          .animated-background,
          .interactive-section {
            display: none;
          }

          .privacy-container {
            background: white;
            color: black;
          }

          .accordion-content {
            max-height: none !important;
            opacity: 1 !important;
          }
        }

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

        /* Performance optimizations */
        .gradient-orb,
        .floating-particles,
        .section-icon {
          will-change: transform;
        }

        .accordion-content {
          will-change: max-height, opacity;
        }

        /* Premium glassmorphism effects */
        .feature-card,
        .accordion-header,
        .info-card {
          position: relative;
          overflow: hidden;
        }

        .feature-card::before,
        .accordion-header::before,
        .info-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.03),
            transparent
          );
          transform: rotate(45deg);
          transition: all 0.5s ease;
          opacity: 0;
        }

        .feature-card:hover::before,
        .accordion-header:hover::before,
        .info-card:hover::before {
          animation: shimmer 0.5s ease;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
            opacity: 0;
          }
        }

        /* Micro-interactions */
        .answer-btn:active,
        .quiz-btn:active,
        .flow-btn:active {
          transform: scale(0.95);
        }

        .logo:active {
          transform: scale(0.95);
        }

        /* Easter egg - rainbow animation on logo hover */
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
          animation: rainbowMove 2s linear infinite;
        }

        @keyframes rainbowMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        /* Final touches */
        ::selection {
          background: rgba(120, 80, 255, 0.3);
          color: white;
        }

        /* Ensure smooth scrolling */
        :global(html) {
          scroll-behavior: smooth;
        }

        /* No horizontal scroll */
        :global(html),
        :global(body) {
          max-width: 100vw !important;
          overflow-x: hidden !important;

}
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cookie-type {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px;
          border-left: 3px solid #ffd700;
        }

        .cookieimport { useState, useEffect, useRef } from 'react'

        }
      `}</style>
    </>
  )
}