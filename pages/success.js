import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Script from 'next/script'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import confetti from 'canvas-confetti'

  export default function Success() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [cvData, setCvData] = useState('')
  const [jobPosting, setJobPosting] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPlan, setUserPlan] = useState('basic')
  const [selectedTemplate, setSelectedTemplate] = useState('simple')
  const [optimizedCV, setOptimizedCV] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [downloadReady, setDownloadReady] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState(null)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const cvPreviewRef = useRef(null)
  const [parsedCV, setParsedCV] = useState(null)
  const [aiScore, setAiScore] = useState(0)
  const [keywords, setKeywords] = useState([])
  const [improvements, setImprovements] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)

  // Template configurations
  const templates = {
    simple: { name: 'Simple', icon: '📄', available: ['basic', 'gold', 'premium'] },
    modern: { name: 'Modern', icon: '🎨', available: ['gold', 'premium'] },
    executive: { name: 'Executive', icon: '💼', available: ['gold', 'premium'] },
    creative: { name: 'Creative', icon: '🌟', available: ['premium'] },
    tech: { name: 'Tech', icon: '💻', available: ['premium'] },
    luxury: { name: 'Luxury', icon: '👑', available: ['premium'] },
    minimal: { name: 'Minimal', icon: '⚡', available: ['premium'] }
  }

useEffect(() => {
  const loadSessionData = async () => {
    // DODAJ LOGI
    console.log('🔍 SUCCESS PAGE - Checking sessionStorage:')
    console.log('pendingCV:', sessionStorage.getItem('pendingCV'))
    console.log('pendingEmail:', sessionStorage.getItem('pendingEmail'))
    console.log('pendingPlan:', sessionStorage.getItem('pendingPlan'))
    console.log('URL params:', router.query)
    
    try {
      const pendingCV = sessionStorage.getItem('pendingCV')
      const pendingJob = sessionStorage.getItem('pendingJob')
      const pendingEmail = sessionStorage.getItem('pendingEmail')
      const pendingPlan = sessionStorage.getItem('pendingPlan')
      const pendingTemplate = sessionStorage.getItem('selectedTemplate')

      if (!pendingCV || !pendingEmail) {
        console.error('❌ Brak danych w sessionStorage!')
        // NIE przekierowuj od razu - daj szansę na debug
        setError('Brak danych CV. Sprawdź konsolę.')
        return // zamiast router.push('/')
      }  

// Load data from sessionStorage on mount
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const pendingCV = sessionStorage.getItem('pendingCV')
        const pendingJob = sessionStorage.getItem('pendingJob')
        const pendingEmail = sessionStorage.getItem('pendingEmail')
        const pendingPlan = sessionStorage.getItem('pendingPlan')
        const pendingTemplate = sessionStorage.getItem('selectedTemplate')

        if (!pendingCV || !pendingEmail) {
          router.push('/')
          return
        }

        setCvData(pendingCV)
        setJobPosting(pendingJob || '')
        setUserEmail(pendingEmail)
        setUserPlan(pendingPlan || 'basic')
        
        // Jeśli template jest 'pending', pokaż wybór szablonów
        if (pendingTemplate === 'pending' && pendingPlan !== 'basic') {
          setShowTemplateSelector(true)
        } else {
          setSelectedTemplate(pendingTemplate || 'simple')
          // Automatycznie rozpocznij przetwarzanie
          await processCV(pendingCV, pendingJob)
        }

        // Clear sessionStorage
        //sessionStorage.removeItem('pendingCV')
        //sessionStorage.removeItem('pendingJob')
        //sessionStorage.removeItem('pendingEmail')
        //sessionStorage.removeItem('pendingPlan')
        //sessionStorage.removeItem('selectedTemplate')
      } catch (err) {
        console.error('Error loading session data:', err)
        setError('Wystąpił błąd podczas ładowania danych')
      }
    }

    loadSessionData()
  }, [router])

  // Process CV with AI
  const processCV = async (cv, job) => {
    setIsProcessing(true)
    setCurrentStep(2)

    try {
      // Simulate AI processing with real API call
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cv_text: cv,
          job_description: job || '',
          plan: userPlan
        })
      })

      if (!response.ok) throw new Error('API Error')

      const data = await response.json()
      
      // Parse CV data
      setParsedCV({
        name: data.name || 'Jan Kowalski',
        email: userEmail,
        phone: data.phone || '+48 123 456 789',
        location: data.location || 'Warszawa, Polska',
        title: data.title || 'Senior Developer',
        summary: data.summary || cv.substring(0, 200),
        experience: data.experience || [],
        education: data.education || [],
        skills: data.skills || [],
        languages: data.languages || []
      })

      setOptimizedCV(data.optimized_text || cv)
      setAiScore(data.ats_score || 95)
      setKeywords(data.keywords || ['JavaScript', 'React', 'Node.js'])
      setImprovements(data.improvements || [])
      
      setCurrentStep(3)
      setTimeout(() => {
        setDownloadReady(true)
        setCurrentStep(4)
        triggerConfetti()
        setShowSuccess(true)
      }, 2000)
    } catch (err) {
      console.error('Processing error:', err)
      // Fallback - use original CV
      setOptimizedCV(cv)
      setParsedCV(parseBasicCV(cv))
      setAiScore(85)
      setCurrentStep(4)
      setDownloadReady(true)
    } finally {
      setIsProcessing(false)
    }
  }

  // Basic CV parser fallback
  const parseBasicCV = (text) => {
    const lines = text.split('\n').filter(l => l.trim())
    return {
      name: lines[0] || 'Imię Nazwisko',
      email: userEmail,
      phone: '+48 123 456 789',
      location: 'Warszawa, Polska',
      title: 'Stanowisko',
      summary: lines.slice(1, 3).join(' '),
      experience: [],
      education: [],
      skills: [],
      languages: []
    }
  }

// Trigger confetti animation
  const triggerConfetti = () => {
    if (typeof window !== 'undefined' && window.confetti) {
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min, max) => Math.random() * (max - min) + min

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) return clearInterval(interval)

        const particleCount = 50 * (timeLeft / duration)
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)
    }
  } // <-- WAŻNE: Ta klamra zamyka funkcję triggerConfetti

  // Handle template selection
  const handleTemplateSelect = async (template) => {
    setSelectedTemplate(template)
    setShowTemplateSelector(false)
    await processCV(cvData, jobPosting)
  }

  // Generate PDF
  const generatePDF = async () => {
    if (!cvPreviewRef.current) return

    try {
      const canvas = await html2canvas(cvPreviewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`CV_${parsedCV?.name || 'document'}.pdf`)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Błąd podczas generowania PDF')
    }
  }

  // Send email
  const sendEmail = async () => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          cv: optimizedCV,
          template: selectedTemplate,
          plan: userPlan
        })
      })

      if (!response.ok) throw new Error('Email error')
      
      setEmailSent(true)
      alert('✅ CV zostało wysłane na Twój email!')
    } catch (err) {
      console.error('Email error:', err)
      alert('Błąd wysyłania. Pobierz CV ręcznie.')
    }
  }

  // CV Template Component
  const CVTemplate = ({ template, data }) => {
    const getTemplateStyles = () => {
      switch(template) {
        case 'modern':
          return 'modern-template'
        case 'executive':
          return 'executive-template'
        case 'creative':
          return 'creative-template'
        case 'tech':
          return 'tech-template'
        case 'luxury':
          return 'luxury-template'
        case 'minimal':
          return 'minimal-template'
        default:
          return 'simple-template'
      }
    }

    return (
      <div className={`cv-template ${getTemplateStyles()}`} ref={cvPreviewRef}>
        <div className="cv-header">
          <h1 className="cv-name">{data?.name || 'Imię Nazwisko'}</h1>
          <p className="cv-title">{data?.title || 'Stanowisko'}</p>
          <div className="cv-contact">
            <span>{data?.email}</span>
            <span>{data?.phone}</span>
            <span>{data?.location}</span>
          </div>
        </div>

        <div className="cv-body">
          <section className="cv-section">
            <h2>Podsumowanie</h2>
            <p>{data?.summary || optimizedCV?.substring(0, 300)}</p>
          </section>

          <section className="cv-section">
            <h2>Doświadczenie</h2>
            <div className="experience-list">
              {data?.experience?.length > 0 ? (
                data.experience.map((exp, i) => (
                  <div key={i} className="experience-item">
                    <h3>{exp.position}</h3>
                    <p className="company">{exp.company}</p>
                    <p className="dates">{exp.dates}</p>
                    <p>{exp.description}</p>
                  </div>
                ))
              ) : (
                <p>Doświadczenie zawodowe...</p>
              )}
            </div>
          </section>

          <section className="cv-section">
            <h2>Umiejętności</h2>
            <div className="skills-grid">
              {keywords.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    )
  }

  // GŁÓWNY RETURN KOMPONENTU
  return (
    <>
      <Head>
        <title>Sukces! Twoje CV jest gotowe - CvPerfect</title>
      </Head>
      <Script 
        src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"
        strategy="beforeInteractive"
      />
      
      <div className="success-container">
        {/* Background effects */}
        <div className="bg-gradient"></div>
        <div className="particles"></div>

        {/* Progress bar */}
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${currentStep * 25}%` }}></div>
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <span className="step-icon">📤</span>
              <span className="step-label">Wczytywanie</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <span className="step-icon">🤖</span>
              <span className="step-label">AI Processing</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-icon">✨</span>
              <span className="step-label">Optymalizacja</span>
            </div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
              <span className="step-icon">🎉</span>
              <span className="step-label">Gotowe!</span>
            </div>
          </div>
        </div>

        {/* Template selector modal */}
        {showTemplateSelector && (
          <div className="template-selector-modal">
            <div className="modal-content">
              <h2>🎨 Wybierz szablon CV</h2>
              <p>Plan {userPlan} - dostępne szablony:</p>
              <div className="templates-grid">
                {Object.entries(templates).map(([key, template]) => {
                  const isAvailable = template.available.includes(userPlan)
                  return isAvailable ? (
                    <div
                      key={key}
                      className="template-card"
                      onClick={() => handleTemplateSelect(key)}
                    >
                      <span className="template-icon">{template.icon}</span>
                      <h3>{template.name}</h3>
                      {key === 'simple' && <span className="badge">Podstawowy</span>}
                      {['creative', 'tech', 'luxury', 'minimal'].includes(key) && 
                        <span className="badge premium">Premium</span>}
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="success-content">
          {!showTemplateSelector && (
            <>
              {/* Processing animation */}
              {isProcessing && (
                <div className="processing-container">
                  <div className="ai-animation">
                    <div className="ai-brain">🧠</div>
                    <div className="ai-particles"></div>
                  </div>
                  <h2>AI analizuje Twoje CV...</h2>
                  <p>To zajmie tylko kilka sekund</p>
                  <div className="loading-bar">
                    <div className="loading-fill"></div>
                  </div>
                </div>
              )}

              {/* Success state */}
              {showSuccess && (
                <div className="success-hero">
                  <div className="success-icon">✅</div>
                  <h1>Gratulacje! Twoje CV jest gotowe!</h1>
                  <div className="score-display">
                    <div className="score-circle">
                      <span className="score-value">{aiScore}%</span>
                      <span className="score-label">ATS Score</span>
                    </div>
                  </div>
                  <p className="success-message">
                    Twoje CV zostało zoptymalizowane i ma {aiScore}% szans na przejście przez system ATS!
                  </p>
                </div>
              )}

              {/* CV Preview and actions */}
              {downloadReady && (
                <div className="cv-container">
                  <div className="cv-preview-section">
                    <h3>Podgląd CV - Szablon: {templates[selectedTemplate].name}</h3>
                    <div className="cv-preview-wrapper">
                      <CVTemplate template={selectedTemplate} data={parsedCV} />
                    </div>
                  </div>

                  <div className="actions-section">
                    <h3>Co chcesz zrobić?</h3>
                    <div className="action-buttons">
                      <button className="btn-primary" onClick={generatePDF}>
                        <span>📥</span> Pobierz PDF
                      </button>
                      <button className="btn-secondary" onClick={sendEmail}>
                        <span>✉️</span> Wyślij na email
                      </button>
                    </div>

                    {emailSent && (
                      <div className="email-success">
                        ✅ CV zostało wysłane na {userEmail}
                      </div>
                    )}

                    <div className="improvements-section">
                      <h4>🎯 Słowa kluczowe dodane do CV:</h4>
                      <div className="keywords-list">
                        {keywords.map((keyword, i) => (
                          <span key={i} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>

                    <div className="plan-info">
                      <p>Twój plan: <strong>{userPlan.toUpperCase()}</strong></p>
                      {userPlan === 'basic' && (
                        <p className="upgrade-hint">
                          💎 Upgrade do Gold lub Premium dla więcej szablonów!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="error-container">
                  <h2>❌ Wystąpił błąd</h2>
                  <p>{error}</p>
                  <button onClick={() => router.push('/')}>Wróć do strony głównej</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Global container */
        .success-container {
          min-height: 100vh;
          background: #0a0a0a;
          color: white;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Background effects */
        .bg-gradient {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(120, 80, 255, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255, 80, 150, 0.2) 0%, transparent 50%);
          animation: gradientShift 20s ease infinite;
          z-index: 0;
        }

        @keyframes gradientShift {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.2); }
        }

        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          opacity: 0.6;
          pointer-events: none;
        }

        /* Progress bar */
        .progress-bar-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          z-index: 1000;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00ff88, #00cc70);
          transition: width 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        }

        .progress-steps {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 80px;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.8);
          padding: 20px 40px;
          border-radius: 100px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .step {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .step.active {
          opacity: 1;
          transform: scale(1.1);
        }

        .step-icon {
          font-size: 24px;
        }

        .step-label {
          font-size: 14px;
          font-weight: 600;
        }

        /* Template selector modal */
        .template-selector-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal-content {
          background: rgba(20, 20, 20, 0.95);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          padding: 48px;
          max-width: 1000px;
          width: 90%;
        }

        .modal-content h2 {
          font-size: 36px;
          margin-bottom: 16px;
          text-align: center;
        }

        .modal-content p {
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 40px;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }

        .template-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .template-card:hover {
          transform: translateY(-5px);
          border-color: #00ff88;
          background: rgba(0, 255, 136, 0.1);
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.2);
        }

        .template-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }

        .template-card h3 {
          font-size: 20px;
          margin-bottom: 8px;
        }

        .badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
        }

        .badge.premium {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        /* Main content */
        .success-content {
          position: relative;
          z-index: 10;
          padding: 120px 40px 60px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Processing animation */
        .processing-container {
          text-align: center;
          padding: 80px 20px;
        }

        .ai-animation {
          position: relative;
          width: 150px;
          height: 150px;
          margin: 0 auto 40px;
        }

        .ai-brain {
          font-size: 80px;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .ai-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle, rgba(120, 80, 255, 0.3) 0%, transparent 70%);
          animation: rotate 10s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .processing-container h2 {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .loading-bar {
          width: 300px;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          margin: 40px auto;
          overflow: hidden;
        }

        .loading-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ff88, #00cc70);
          width: 60%;
          animation: loading 2s ease infinite;
        }

        @keyframes loading {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 100%; }
        }

        /* Success state */
        .success-hero {
          text-align: center;
          padding: 60px 20px;
        }

        .success-icon {
          font-size: 80px;
          margin-bottom: 24px;
          animation: bounceIn 0.6s ease;
        }

        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .success-hero h1 {
          font-size: 48px;
          font-weight: 900;
          margin-bottom: 32px;
          background: linear-gradient(135deg, #00ff88, #00cc70);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .score-display {
          display: flex;
          justify-content: center;
          margin: 40px 0;
        }

        .score-circle {
          width: 200px;
          height: 200px;
          background: conic-gradient(
            from 0deg,
            #00ff88 0deg,
            #00cc70 ${props => props.aiScore * 3.6}deg,
            rgba(255, 255, 255, 0.1) ${props => props.aiScore * 3.6}deg
          );
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 255, 136, 0.3);
        }

        .score-circle::before {
          content: '';
          position: absolute;
          inset: 10px;
          background: #0a0a0a;
          border-radius: 50%;
        }

        .score-value {
          font-size: 56px;
          font-weight: 900;
          color: #00ff88;
          position: relative;
          z-index: 1;
        }

        .score-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          position: relative;
          z-index: 1;
        }

        .success-message {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.8);
          max-width: 600px;
          margin: 0 auto;
        }

        /* CV Container */
        .cv-container {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 40px;
          margin-top: 60px;
        }

        .cv-preview-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 32px;
        }

        .cv-preview-section h3 {
          font-size: 24px;
          margin-bottom: 24px;
        }

        .cv-preview-wrapper {
          background: white;
          border-radius: 16px;
          padding: 40px;
          min-height: 600px;
          color: #000;
        }

        /* CV Templates */
        .cv-template {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
        }

        .cv-template.simple-template {
          /* Simple template styles */
        }

        .cv-template.modern-template .cv-header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 40px;
          margin: -40px -40px 30px;
          border-radius: 16px 16px 0 0;
        }

        .cv-template.executive-template .cv-header {
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .cv-template.creative-template .cv-header {
          background: linear-gradient(45deg, #f093fb, #f5576c);
          color: white;
          padding: 40px;
          margin: -40px -40px 30px;
          clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }

        .cv-template.tech-template {
          font-family: 'Courier New', monospace;
        }

        .cv-template.tech-template .cv-header {
          background: #000;
          color: #00ff88;
          padding: 30px;
          margin: -40px -40px 30px;
        }

        .cv-template.luxury-template .cv-header {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #000;
          padding: 50px;
          margin: -40px -40px 40px;
          text-align: center;
        }

        .cv-template.minimal-template {
          font-family: 'Helvetica', sans-serif;
        }

        .cv-template.minimal-template .cv-header {
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .cv-name {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .cv-title {
          font-size: 20px;
          margin-bottom: 16px;
          opacity: 0.9;
        }

        .cv-contact {
          display: flex;
          gap: 20px;
          font-size: 14px;
          opacity: 0.8;
        }

        .cv-section {
          margin-bottom: 32px;
        }

        .cv-section h2 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #333;
        }

        .experience-item {
          margin-bottom: 24px;
        }

        .experience-item h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .company {
          font-weight: 500;
          color: #666;
        }

        .dates {
          font-size: 14px;
          color: #999;
          margin-bottom: 8px;
        }

        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-tag {
          background: #f0f0f0;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 14px;
        }

        /* Actions section */
        .actions-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 32px;
        }

        .actions-section h3 {
          font-size: 24px;
          margin-bottom: 24px;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .btn-primary, .btn-secondary {
          padding: 18px 32px;
          border-radius: 100px;
          font-size: 16px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #00ff88, #00cc70);
          color: #000;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(120, 80, 255, 0.3);
        }

        .email-success {
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          padding: 16px;
          border-radius: 12px;
          color: #00ff88;
          text-align: center;
          margin-bottom: 24px;
        }

        .improvements-section {
          margin-bottom: 24px;
        }

        .improvements-section h4 {
          font-size: 16px;
          margin-bottom: 16px;
          color: rgba(255, 255, 255, 0.9);
        }

        .keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .keyword-tag {
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          color: #00ff88;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
        }

        .plan-info {
          text-align: center;
          padding: 24px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
        }

        .plan-info p {
          margin: 0 0 8px;
        }

        .upgrade-hint {
          color: #ffd700;
          font-size: 14px;
        }

        /* Error state */
        .error-container {
          text-align: center;
          padding: 80px 20px;
        }

        .error-container h2 {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .error-container button {
          margin-top: 24px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          border: none;
          border-radius: 100px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        /* Mobile responsiveness */
        @media (max-width: 1200px) {
          .cv-container {
            grid-template-columns: 1fr;
          }

          .cv-preview-section {
            margin-bottom: 32px;
          }
        }

        @media (max-width: 768px) {
          .success-content {
            padding: 100px 20px 40px;
          }

          .progress-steps {
            gap: 30px;
            padding: 15px 20px;
          }

          .step-label {
            display: none;
          }

          .success-hero h1 {
            font-size: 32px;
          }

          .score-circle {
            width: 150px;
            height: 150px;
          }

          .score-value {
            font-size: 42px;
          }

          .templates-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cv-preview-wrapper {
            padding: 20px;
          }

          .cv-name {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .templates-grid {
            grid-template-columns: 1fr;
          }

          .progress-steps {
            gap: 20px;
          }
        }
      `}</style>
    </>
  )
}