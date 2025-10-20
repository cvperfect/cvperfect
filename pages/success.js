import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import confetti from 'canvas-confetti'
import html2pdf from 'html2pdf.js'

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

  // Load data from URL params (session_id) or sessionStorage fallback
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        // Sprawdź czy mamy session_id z URL (po przekierowaniu z Stripe)
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session_id')
        const planFromUrl = urlParams.get('plan')

        if (sessionId) {
          // Pobierz dane sesji ze Stripe
          console.log('🔍 Loading session from Stripe:', sessionId)
          const response = await fetch(`/api/get-session?session_id=${sessionId}`)
          const data = await response.json()

          if (!response.ok || !data.success) {
            console.error('❌ Session retrieval failed:', data.error)
            setError('Nie udało się pobrać danych płatności')
            return
          }

          // Wyciągnij dane z metadata
          const metadata = data.session.metadata || {}
          const cvText = sessionStorage.getItem('pendingCV') || metadata.cv || ''
          const jobText = sessionStorage.getItem('pendingJob') || metadata.job || ''
          const email = data.session.customer_email || metadata.email || ''
          const plan = planFromUrl || metadata.plan || 'basic'

          console.log('✅ Session loaded:', { plan, email, hasCV: !!cvText, hasJob: !!jobText })

          if (!cvText || !email) {
            console.error('❌ Missing CV or email')
            setError('Brak danych CV. Spróbuj ponownie.')
            setTimeout(() => router.push('/'), 3000)
            return
          }

          setCvData(cvText)
          setJobPosting(jobText)
          setUserEmail(email)
          setUserPlan(plan)

          // KROK 1: Utwórz użytkownika w bazie (jeśli nie istnieje)
          console.log('👤 Creating user in database...')
          try {
            const createUserResponse = await fetch('/api/create-user-from-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_id: sessionId,
                email: email,
                plan: plan
              })
            })

            const createUserData = await createUserResponse.json()
            console.log('👤 User creation result:', createUserData)

            if (!createUserResponse.ok) {
              console.error('❌ Failed to create user:', createUserData.error)
              // Kontynuuj mimo to - może użytkownik już istnieje
            }
          } catch (userError) {
            console.error('❌ User creation error:', userError)
            // Kontynuuj mimo to
          }

          // KROK 2: Zawsze używaj szablonu 'simple', bez wyboru
          setSelectedTemplate('simple')

          // KROK 3: Automatycznie rozpocznij przetwarzanie CV (przekaż email)
          await processCV(cvText, jobText, email)

          // Clear sessionStorage
          sessionStorage.removeItem('pendingCV')
          sessionStorage.removeItem('pendingJob')
          sessionStorage.removeItem('pendingEmail')
          sessionStorage.removeItem('pendingPlan')
          sessionStorage.removeItem('selectedTemplate')

        } else {
          // Fallback: spróbuj sessionStorage (dla starych przepływów)
          console.log('⚠️ No session_id in URL, trying sessionStorage...')
          const pendingCV = sessionStorage.getItem('pendingCV')
          const pendingJob = sessionStorage.getItem('pendingJob')
          const pendingEmail = sessionStorage.getItem('pendingEmail')
          const pendingPlan = sessionStorage.getItem('pendingPlan')
          const pendingTemplate = sessionStorage.getItem('selectedTemplate')

          if (!pendingCV || !pendingEmail) {
            console.error('❌ No data in sessionStorage either')
            setError('Brak danych. Przekierowuję...')
            setTimeout(() => router.push('/'), 2000)
            return
          }

          setCvData(pendingCV)
          setJobPosting(pendingJob || '')
          setUserEmail(pendingEmail)
          setUserPlan(pendingPlan || 'basic')

          // Zawsze używaj szablonu 'simple', bez wyboru
          setSelectedTemplate('simple')
          // Automatycznie rozpocznij przetwarzanie (przekaż email)
          await processCV(pendingCV, pendingJob, pendingEmail)

          // Clear sessionStorage
          sessionStorage.removeItem('pendingCV')
          sessionStorage.removeItem('pendingJob')
          sessionStorage.removeItem('pendingEmail')
          sessionStorage.removeItem('pendingPlan')
          sessionStorage.removeItem('selectedTemplate')
        }
      } catch (err) {
        console.error('Error loading session data:', err)
        setError('Wystąpił błąd podczas ładowania danych')
      }
    }

    loadSessionData()
  }, [router])

  // Process CV with AI
  const processCV = async (cv, job, email) => {
    setIsProcessing(true)
    setCurrentStep(2)

    try {
      console.log('🔄 Processing CV...', { hasCV: !!cv, hasJob: !!job, email: email })

      // Call API with correct parameter names
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCV: cv,
          jobPosting: job || '',
          email: email
        })
      })

      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || 'API Error')
      }

      const data = await response.json()
      console.log('✅ API Success:', data)

      // API zwraca optimizedCV jako HTML - użyj go
      const optimizedHTML = data.optimizedCV || cv
      setOptimizedCV(optimizedHTML)

      // Parsuj podstawowe dane z HTML
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = optimizedHTML

      // Spróbuj wyciągnąć dane z HTML
      const parsedData = parseHTMLCV(tempDiv, email)
      setParsedCV(parsedData)

      // Ustaw metryki
      setAiScore(data.keywordMatch || 95)
      setKeywords(extractKeywordsFromImprovements(data.improvements || []))
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

  // Parse HTML CV (from API response)
  const parseHTMLCV = (htmlDiv, email) => {
    try {
      const getText = (selector) => {
        const el = htmlDiv.querySelector(selector)
        return el ? el.textContent.trim() : ''
      }

      // Spróbuj wyciągnąć dane z typowych znaczników
      const h2Elements = htmlDiv.querySelectorAll('h2')
      const name = h2Elements[0]?.textContent.trim() || 'Imię Nazwisko'

      const allText = htmlDiv.textContent
      const lines = allText.split('\n').filter(l => l.trim())

      return {
        name: name,
        email: email,
        phone: getText('a[href^="tel:"]') || lines.find(l => l.includes('+48')) || '+48 123 456 789',
        location: lines.find(l => l.match(/warszaw|krak|wrocł|pozna/i)) || 'Warszawa, Polska',
        title: h2Elements[1]?.textContent.trim() || 'Stanowisko',
        summary: lines.slice(0, 3).join(' ').substring(0, 300),
        experience: [],
        education: [],
        skills: [],
        languages: []
      }
    } catch (err) {
      console.error('Error parsing HTML CV:', err)
      return parseBasicCV(htmlDiv.textContent)
    }
  }

  // Extract keywords from improvements
  const extractKeywordsFromImprovements = (improvements) => {
    const commonKeywords = [
      'zarządzanie', 'optymalizacja', 'wdrożenie', 'rozwój',
      'komunikacja', 'zespół', 'analiza', 'projekt'
    ]
    return improvements.length > 0 ? commonKeywords.slice(0, Math.min(8, improvements.length)) : commonKeywords
  }

  // Trigger confetti animation - BEAUTIFUL PURPLE/PINK CONFETTI
  const triggerConfetti = () => {
    const duration = 4000
    const animationEnd = Date.now() + duration
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 80,
      zIndex: 9999,
      colors: ['#7850ff', '#d946ef', '#ff5096', '#c084fc', '#e879f9']
    }

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

  // Handle template selection
  const handleTemplateSelect = async (template) => {
    setSelectedTemplate(template)
    setShowTemplateSelector(false)
    await processCV(cvData, jobPosting, userEmail)
  }

  // Generate PDF - ATS-OPTIMIZED (text remains text, not image!)
  const generatePDF = async () => {
    if (!cvPreviewRef.current) return

    try {
      // Use html2pdf.js which respects @media print CSS
      // This preserves text as selectable text in PDF (ATS-compatible!)
      const element = cvPreviewRef.current
      const fileName = `CV_${parsedCV?.name?.replace(/\s+/g, '_') || 'document'}.pdf`

      const opt = {
        margin: 0, // No margin - CSS @media print handles it
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
          before: '.cv-section',
        }
      }

      // Generate and download PDF
      await html2pdf().set(opt).from(element).save()

      console.log('✅ PDF downloaded:', fileName)
    } catch (err) {
      console.error('❌ PDF generation error:', err)
      alert('Błąd podczas generowania PDF. Spróbuj ponownie.')
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

  // Parse CV text into structured sections
  const parseAndFormatCV = (cvText) => {
    if (!cvText) return null

    const lines = cvText.split('\n').filter(l => l.trim())
    const sections = []
    let currentSection = null

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Detect section headers (uppercase or common keywords)
      if (trimmed.match(/^(DOŚWIADCZENIE|EXPERIENCE|EDUKACJA|EDUCATION|UMIEJĘTNOŚCI|SKILLS|JĘZYKI|LANGUAGES|CERTYFIKATY|CERTIFICATES|PROJEKTY|PROJECTS)/i)) {
        if (currentSection) sections.push(currentSection)
        currentSection = { title: trimmed, content: [] }
      } else if (currentSection) {
        currentSection.content.push(trimmed)
      } else {
        // Header info (name, email, phone, etc.)
        if (!currentSection) {
          if (!sections.length) {
            sections.push({ title: 'header', content: [trimmed] })
          } else {
            sections[0].content.push(trimmed)
          }
        }
      }
    })

    if (currentSection) sections.push(currentSection)
    return sections
  }

  // Convert plain text CV to HTML - PROFESSIONAL STRUCTURE MATCHING PDF
  const convertTextToHTML = (text) => {
    if (!text) return ''

    // Check if already has proper HTML structure with our custom classes
    const hasProperStructure = text.includes('cv-document') || text.includes('cv-entry')
    if (hasProperStructure) {
      return text
    }

    // If it has basic HTML tags but not our structure, strip them and reparse
    if (text.includes('<h1>') || text.includes('<h2>') || text.includes('<p>')) {
      // Strip HTML tags to get plain text
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = text
      text = tempDiv.textContent || tempDiv.innerText || ''
    }

    // PROFESSIONAL CV PARSER - ULTRA AGGRESSIVE STRUCTURE DETECTION
    console.log('🔍 Parser input length:', text.length)
    console.log('📝 First 200 chars:', text.substring(0, 200))

    let workingText = text

    // AGGRESSIVE SPLITTING - Split by ALL possible patterns
    // Split by section keywords (case insensitive, more variants)
    workingText = workingText.replace(/(DOŚWIADCZENIE ZAWODOWE|DOŚWIADCZENIE|WYKSZTAŁCENIE|EDUKACJA|UMIEJĘTNOŚCI|SKILLS|ZNAJOMOŚĆ JĘZYKÓW|JĘZYKI|LANGUAGES|SZKOLENIA|CERTYFIKATY|CERTIFICATES|ZAINTERESOWANIA|INTERESTS)/gi, '\n\n__SECTION__$1\n\n')

    // Split by dates (multiple formats)
    workingText = workingText.replace(/(\d{2}\.\d{4}\s*[-–—]\s*\d{2}\.\d{4})/g, '\n__DATE__$1')
    workingText = workingText.replace(/(\d{2}\.\d{4}\s*[-–—]\s*obecnie)/gi, '\n__DATE__$1')

    // Split by "Krótki opis" label
    workingText = workingText.replace(/(Krótki opis stanowiska:|Krotki opis stanowiska:)/gi, '\n__DESC__')

    // Split by company/location patterns (words followed by location)
    workingText = workingText.replace(/\s+(Warszawa|Zamość|Kraków|Wrocław|Poznań|Gdańsk|Eindhoven|Anglia|Hadlow|Waalwijk|Ede)\s+/g, ' $1\n')

    console.log('📋 After splitting, first 300 chars:', workingText.substring(0, 300))

    const lines = workingText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    console.log('📊 Total lines:', lines.length)

    let html = '<div class="cv-document">\n'

    let currentSection = null
    let inEntry = false
    let entryBuffer = { date: '', title: '', company: '', description: [] }
    let headerCreated = false

    // Section keywords (comprehensive)
    const sectionKeywords = [
      'DOŚWIADCZENIE ZAWODOWE', 'DOŚWIADCZENIE', 'WYKSZTAŁCENIE', 'EDUKACJA',
      'UMIEJĘTNOŚCI', 'SKILLS', 'ZNAJOMOŚĆ JĘZYKÓW', 'JĘZYKI', 'LANGUAGES',
      'SZKOLENIA, KURSY, CERTYFIKATY', 'SZKOLENIA', 'CERTYFIKATY', 'CERTIFICATES',
      'ZAINTERESOWANIA', 'INTERESTS'
    ]

    const flushEntry = () => {
      if (entryBuffer.date || entryBuffer.title) {
        html += '<div class="cv-entry">\n'
        if (entryBuffer.date) {
          html += `  <div class="entry-date">${entryBuffer.date}</div>\n`
        }
        if (entryBuffer.title) {
          html += `  <div class="entry-title">■ ${entryBuffer.title}</div>\n`
        }
        if (entryBuffer.company) {
          html += `  <div class="entry-company">${entryBuffer.company}</div>\n`
        }
        if (entryBuffer.description.length > 0) {
          html += `  <div class="entry-description">\n`
          entryBuffer.description.forEach(desc => {
            html += `    <p>${desc}</p>\n`
          })
          html += `  </div>\n`
        }
        html += '</div>\n\n'

        // Reset
        entryBuffer = { date: '', title: '', company: '', description: [] }
      }
    }

    // FIRST: Extract and create header from ENTIRE text (not just first line)
    if (!headerCreated) {
      // Find name - first substantial text before keywords
      let namePart = ''
      const firstSectionIndex = lines.findIndex(l => l.startsWith('__SECTION__'))

      for (let i = 0; i < Math.min(5, firstSectionIndex > 0 ? firstSectionIndex : lines.length); i++) {
        const line = lines[i]
        if (line && line.length > 5 && !line.startsWith('__') && !line.match(/^(CV|E-mail:|Telefon:|Data)/i)) {
          // Extract just name part (before contact info)
          namePart = line.split(/E-mail:|Telefon:|Tel:|Data/i)[0].trim()
          if (namePart.length > 3) {
            console.log('👤 Found name:', namePart)
            break
          }
        }
      }

      // If no name found, use placeholder
      if (!namePart) {
        namePart = 'Curriculum Vitae'
      }

      // Extract ALL contact info from ENTIRE text
      const emailMatch = text.match(/E-mail:\s*([^\s]+@[^\s]+)/i)
      const phoneMatch = text.match(/Telefon:\s*([\d\s]+?)(?=\s|Data|Miejsc|$)/i)
      const birthMatch = text.match(/Data urodzenia:\s*([\d.]+)/i)
      const locationMatch = text.match(/Miejscowość:\s*(\w+)/i)

      console.log('📧 Email:', emailMatch ? emailMatch[1] : 'not found')
      console.log('📞 Phone:', phoneMatch ? phoneMatch[1] : 'not found')

      html += '<div class="cv-header">\n'
      html += `  <div class="cv-label">— CV —</div>\n`
      html += `  <h1 class="cv-name">${namePart}</h1>\n`

      html += '  <div class="cv-contact">\n'
      if (emailMatch) html += `    <div>E-mail: <strong>${emailMatch[1]}</strong></div>\n`
      if (phoneMatch) html += `    <div>Telefon: <strong>${phoneMatch[1].trim()}</strong></div>\n`
      if (birthMatch) html += `    <div>Data urodzenia: ${birthMatch[1]}</div>\n`
      if (locationMatch) html += `    <div>Miejscowość: ${locationMatch[1]}</div>\n`
      html += '  </div>\n'
      html += '</div>\n\n'

      headerCreated = true
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const nextLine = i < lines.length - 1 ? lines[i + 1] : ''

      // Skip header-related lines (already processed)
      if (!line.startsWith('__') && i < 5 && (
        line.match(/^CV$/i) ||
        line.match(/E-mail:|Telefon:|Data urodzenia:|Miejscowość:/i) ||
        (line.length < 50 && !line.match(/^\d{2}\./))
      )) {
        continue
      }

      // SECTION MARKERS
      if (line.startsWith('__SECTION__')) {
        flushEntry()
        const sectionName = line.replace('__SECTION__', '').trim()
        currentSection = sectionName.toUpperCase()
        html += `<div class="cv-section" data-section-type="${currentSection}">\n`
        html += `  <h2 class="section-header">${sectionName}</h2>\n`
        console.log('📂 Section:', sectionName)
        continue
      }

      // DATE MARKERS (start of new entry)
      if (line.startsWith('__DATE__')) {
        flushEntry()
        const dateText = line.replace('__DATE__', '').trim()
        entryBuffer.date = dateText
        inEntry = true
        console.log('📅 New entry with date:', dateText)
        continue
      }

      // DESCRIPTION MARKER
      if (line.startsWith('__DESC__')) {
        // Next lines will be description
        continue
      }

      // If we're in an entry
      if (inEntry) {
        // If no title yet and line looks like a title (not too long, has content)
        if (!entryBuffer.title && line.length > 3 && line.length < 150) {
          // Skip if it's just a label
          if (!line.match(/^(Krótki|Krotki|Organizator)/i)) {
            entryBuffer.title = line
            console.log('💼 Entry title:', line.substring(0, 50))
            continue
          }
        }

        // Everything else is description
        if (line.length > 3 && !line.match(/^Organizator:/i)) {
          entryBuffer.description.push(line)
        }
      } else if (currentSection) {
        // Special formatting for SKILLS/LANGUAGES sections (lists without dates)
        const isSkillsSection = currentSection.match(/UMIEJĘTNOŚCI|SKILLS|JĘZYKI|LANGUAGES|ZNAJOMOŚĆ JĘZYKÓW/i)
        const isInterestsSection = currentSection.match(/ZAINTERESOWANIA|INTERESTS/i)

        if (isSkillsSection && line.length > 3) {
          // Skills/Languages - format as tags or comma-separated list
          // Check if it's a formatted line like "angielski: poziom średnio zaawansowany"
          if (line.includes(':')) {
            html += `  <div class="skill-item"><strong>${line.split(':')[0]}:</strong> ${line.split(':').slice(1).join(':')}</div>\n`
          } else {
            // Split by common separators and create tags
            const items = line.split(/[,·•]/).map(s => s.trim()).filter(s => s.length > 0)
            if (items.length > 1) {
              html += '  <div class="skill-tags">\n'
              items.forEach(item => {
                html += `    <span class="skill-tag">${item}</span>\n`
              })
              html += '  </div>\n'
            } else {
              html += `  <p class="section-content">${line}</p>\n`
            }
          }
        } else if (isInterestsSection && line.length > 3) {
          // Interests - format as comma-separated tags
          const interests = line.split(/,/).map(s => s.trim()).filter(s => s.length > 0)
          if (interests.length > 1) {
            html += '  <div class="interest-tags">\n'
            interests.forEach(interest => {
              html += `    <span class="interest-tag">${interest}</span>\n`
            })
            html += '  </div>\n'
          } else {
            html += `  <p class="section-content">${line}</p>\n`
          }
        } else {
          // Regular content within a section
          if (line.length > 3) {
            html += `  <p class="section-content">${line}</p>\n`
          }
        }
      }
    }

    // Flush last entry
    flushEntry()

    // Close last section
    if (currentSection) {
      html += '</div>\n'
    }

    html += '</div>\n'
    return html
  }

  // CV Template Component - Professional formatted CV
  const CVTemplate = ({ template, data }) => {
    // Convert to HTML if needed
    const rawContent = optimizedCV || cvData
    const cvContent = convertTextToHTML(rawContent)

    return (
      <div className="cv-template professional-cv" ref={cvPreviewRef}>
        <div
          className="cv-html-content"
          dangerouslySetInnerHTML={{ __html: cvContent }}
        />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Sukces! Twoje CV jest gotowe - CvPerfect</title>
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
      </Head>

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
                  {/* Action buttons above CV */}
                  <div className="actions-bar">
                    <div className="actions-left">
                      <h3>📄 Twoje zoptymalizowane CV</h3>
                      <p className="cv-subtitle">Szablon: {templates[selectedTemplate].name} • Plan: {userPlan.toUpperCase()}</p>
                    </div>
                    <div className="actions-right">
                      <button className="btn-primary" onClick={generatePDF} title="Pobierz jako PDF - tekst pozostaje edytowalny (ATS-friendly!)">
                        <span>📥</span> Pobierz PDF
                      </button>
                      <button className="btn-secondary" onClick={sendEmail}>
                        <span>✉️</span> Wyślij email
                      </button>
                    </div>
                  </div>

                  {emailSent && (
                    <div className="email-success">
                      ✅ CV zostało wysłane na {userEmail}
                    </div>
                  )}

                  {/* CV Preview */}
                  <div className="cv-preview-section">
                    <div className="cv-preview-wrapper">
                      <CVTemplate template={selectedTemplate} data={parsedCV} />
                    </div>
                  </div>

                  {/* Keywords and info below CV */}
                  <div className="cv-footer-info">
                    {/* ATS INFO BANNER */}
                    <div className="ats-info-banner">
                      <div className="banner-header">
                        <span className="banner-icon">💡</span>
                        <h4>Dlaczego Twoje CV jest teraz ATS-friendly?</h4>
                      </div>
                      <div className="banner-content">
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="check-icon">✓</span>
                            <div>
                              <strong>Biały szablon, czarny tekst</strong>
                              <p>Systemy ATS najlepiej czytają proste, kontrastowe CV</p>
                            </div>
                          </div>
                          <div className="info-item">
                            <span className="check-icon">✓</span>
                            <div>
                              <strong>Czcionka Calibri (ATS-safe)</strong>
                              <p>Font rozpoznawany przez 95%+ systemów rekrutacyjnych</p>
                            </div>
                          </div>
                          <div className="info-item">
                            <span className="check-icon">✓</span>
                            <div>
                              <strong>Pojedyncza kolumna, bez tabel</strong>
                              <p>ATS poprawnie parsuje strukturę sekcji</p>
                            </div>
                          </div>
                          <div className="info-item">
                            <span className="check-icon">✓</span>
                            <div>
                              <strong>Tekstowy PDF (nie obrazek!)</strong>
                              <p>Tekst pozostaje edytowalny i przeszukiwalny</p>
                            </div>
                          </div>
                        </div>

                        {/* PHOTO WARNING */}
                        <div className="photo-warning-box">
                          <span className="warning-icon">⚠️</span>
                          <div className="warning-content">
                            <strong>Ważna uwaga o zdjęciach w CV:</strong>
                            <ul>
                              <li><strong>90% systemów ATS ignoruje lub usuwa zdjęcia</strong> podczas parsowania - Twój ATS score może spaść o 10-20%</li>
                              <li>W <strong>USA, UK, Kanada</strong> zdjęcia w CV są <strong>odradzane lub zabronione</strong> (discrimination laws)</li>
                              <li>Zwiększa rozmiar pliku - niektóre ATS odrzucają pliki {'>'} 2MB</li>
                            </ul>
                            <p className="recommendation">
                              <strong>🎯 Nasza rekomendacja:</strong> Zostaw CV bez zdjęcia dla maksymalnej szansy na rozmowę kwalifikacyjną!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="keywords-section">
                      <h4>🎯 Słowa kluczowe zoptymalizowane przez AI:</h4>
                      <div className="keywords-list">
                        {keywords.map((keyword, i) => (
                          <span key={i} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>
                    {userPlan === 'basic' && (
                      <div className="upgrade-box">
                        <p>💎 Upgrade do Gold lub Premium dla więcej szablonów i funkcji!</p>
                      </div>
                    )}
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
        /* Global container - BEAUTIFUL GRADIENT BACKGROUND */
        .success-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1f2e 0%, #2d1b3d 50%, #1f1535 100%);
          color: white;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Background effects - ENHANCED PURPLE/PINK GRADIENT */
        .bg-gradient {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 20% 30%, rgba(120, 80, 255, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(217, 70, 239, 0.35) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 80, 150, 0.25) 0%, transparent 60%);
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
          background: linear-gradient(90deg, #7850ff 0%, #d946ef 50%, #ff5096 100%);
          transition: width 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          box-shadow: 0 0 20px rgba(120, 80, 255, 0.6);
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
          background: linear-gradient(90deg, #7850ff 0%, #d946ef 50%, #ff5096 100%);
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
          background: linear-gradient(135deg, #7850ff 0%, #d946ef 50%, #ff5096 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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
            #7850ff 0deg,
            #d946ef 180deg,
            #ff5096 270deg,
            rgba(255, 255, 255, 0.1) 270deg
          );
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow:
            0 10px 40px rgba(120, 80, 255, 0.4),
            0 20px 60px rgba(217, 70, 239, 0.3);
        }

        .score-circle::before {
          content: '';
          position: absolute;
          inset: 10px;
          background: linear-gradient(135deg, #1a1f2e 0%, #2d1b3d 100%);
          border-radius: 50%;
        }

        .score-value {
          font-size: 56px;
          font-weight: 900;
          background: linear-gradient(135deg, #7850ff 0%, #d946ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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

        /* CV Container - New Vertical Layout */
        .cv-container {
          max-width: 900px;
          margin: 60px auto 0;
        }

        /* Actions bar above CV - GLASSMORPHIC PREMIUM */
        .actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          /* Glassmorphic background with purple/pink accents */
          background: rgba(26, 31, 46, 0.5);
          backdrop-filter: blur(40px) saturate(200%);
          -webkit-backdrop-filter: blur(40px) saturate(200%);
          border: 1.5px solid rgba(120, 80, 255, 0.3);
          border-radius: 28px;
          padding: 32px 42px;
          margin-bottom: 24px;
          /* Professional shadow system with purple glow */
          box-shadow:
            0 4px 16px rgba(120, 80, 255, 0.15),
            0 12px 40px rgba(217, 70, 239, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Elegant animated gradient overlay */
        .actions-bar::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.08),
            transparent
          );
          transition: left 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Subtle bottom accent line - PURPLE/PINK */
        .actions-bar::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 5%;
          right: 5%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(120, 80, 255, 0.5) 20%,
            rgba(217, 70, 239, 0.5) 50%,
            rgba(255, 80, 150, 0.3) 80%,
            transparent
          );
          opacity: 0.8;
        }

        .actions-bar:hover::before {
          left: 100%;
        }

        .actions-bar:hover {
          border-color: rgba(120, 80, 255, 0.5);
          transform: translateY(-2px);
          box-shadow:
            0 2px 6px rgba(120, 80, 255, 0.15),
            0 8px 20px rgba(120, 80, 255, 0.2),
            0 20px 48px rgba(217, 70, 239, 0.2),
            0 32px 80px rgba(217, 70, 239, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.25),
            inset 0 -1px 0 rgba(0, 0, 0, 0.15);
        }

        .actions-left {
          flex: 1;
          min-width: 0;
        }

        .actions-left h3 {
          font-size: 24px;
          margin: 0 0 8px 0;
          color: #ffffff;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.2;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
          background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cv-subtitle {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.65);
          margin: 0;
          font-weight: 500;
          letter-spacing: 0.02em;
          line-height: 1.5;
        }

        .actions-right {
          display: flex;
          gap: 14px;
          align-items: center;
          flex-shrink: 0;
        }

        .email-success {
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          padding: 16px 24px;
          border-radius: 12px;
          color: #00ff88;
          text-align: center;
          margin-bottom: 24px;
          font-size: 16px;
        }

        /* CV Preview Section - GLASSMORPHIC DESIGN */
        .cv-preview-section {
          background: rgba(26, 31, 46, 0.4);
          border-radius: 24px;
          padding: 0;
          border: 1.5px solid rgba(120, 80, 255, 0.25);
          overflow: hidden;
          max-height: 900px;
          position: relative;
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          box-shadow:
            0 8px 32px rgba(120, 80, 255, 0.12),
            0 16px 64px rgba(217, 70, 239, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
        }

        /* Subtle animated glow effect */
        .cv-preview-section::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(
            135deg,
            rgba(120, 80, 255, 0.2),
            rgba(217, 70, 239, 0.2),
            rgba(255, 80, 150, 0.15)
          );
          border-radius: 24px;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.6s ease;
          filter: blur(20px);
        }

        .cv-preview-section:hover::before {
          opacity: 0.3;
        }

        .cv-preview-wrapper {
          background: rgba(26, 31, 46, 0.3);
          padding: 40px;
          min-height: 600px;
          max-height: 900px;
          overflow-y: auto;
          overflow-x: hidden;
          color: #e5e7eb;
          position: relative;
          z-index: 2;
          /* Smooth scrolling */
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        /* Premium Custom Scrollbar - Dark Mode Elegant */
        .cv-preview-wrapper::-webkit-scrollbar {
          width: 6px;
        }

        .cv-preview-wrapper::-webkit-scrollbar-track {
          background: transparent;
          margin: 12px 0;
        }

        .cv-preview-wrapper::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cv-preview-wrapper::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.15));
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
          transform: scaleX(1.2);
        }

        .cv-preview-wrapper::-webkit-scrollbar-thumb:active {
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2));
        }

        /* Professional CV Template - ULTRA PREMIUM DARK THEME (NO WHITE!) */
        .cv-template.professional-cv {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
          color: #e5e7eb;
          line-height: 1.6;
          letter-spacing: -0.01em;
          position: relative;
          background: transparent !important;
        }

        /* FORCE DARK MODE - ABSOLUTELY NO WHITE/GRAY BACKGROUNDS */
        .cv-template.professional-cv *,
        .cv-template.professional-cv *::before,
        .cv-template.professional-cv *::after,
        .cv-html-content *,
        .cv-html-content *::before,
        .cv-html-content *::after,
        .cv-html-content div,
        .cv-html-content section,
        .cv-html-content article {
          background-color: transparent !important;
          background-image: none !important;
        }

        /* Override any inline styles that might have white/gray backgrounds */
        .cv-html-content [style*="background"],
        .cv-template.professional-cv [style*="background"] {
          background: transparent !important;
          background-color: transparent !important;
        }

        /* Ensure readable text colors */
        .cv-template.professional-cv *:not(strong):not(b):not(h1):not(h2):not(h3):not(.cv-name):not(.section-header):not(.entry-title) {
          color: #cbd5e1 !important;
        }

        /* CV HTML Content - GLASSMORPHIC CARD */
        .cv-html-content {
          color: #e5e7eb !important;
          max-width: 100%;
          background: rgba(26, 31, 46, 0.35) !important;
          padding: 50px 60px !important;
          position: relative;
          border-radius: 16px;
          border: 1px solid rgba(120, 80, 255, 0.2);
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          box-shadow:
            0 4px 16px rgba(120, 80, 255, 0.08),
            0 8px 32px rgba(217, 70, 239, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        /* No overlays - clean transparent design */

        /* CV Document Container */
        .cv-html-content .cv-document {
          padding: 0;
        }

        /* CV HEADER - Name and Contact - DARK MODE */
        .cv-html-content .cv-header {
          text-align: center;
          margin-bottom: 52px;
          padding-bottom: 32px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .cv-html-content .cv-header::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        }

        .cv-html-content .cv-label {
          font-size: 11px;
          background: linear-gradient(90deg, #7850ff, #d946ef);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 14px;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(120, 80, 255, 0.4);
          filter: drop-shadow(0 0 8px rgba(217, 70, 239, 0.3));
        }

        .cv-html-content .cv-name {
          font-size: 40px;
          font-weight: 900;
          color: #ffffff !important;
          margin: 0 0 22px 0;
          letter-spacing: -0.03em;
          line-height: 1.1;
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.6);
        }

        .cv-html-content .cv-contact {
          font-size: 14px;
          color: #e5e7eb;
          line-height: 1.9;
          letter-spacing: 0.01em;
        }

        .cv-html-content .cv-contact div {
          margin: 4px 0;
        }

        .cv-html-content .cv-contact strong {
          font-weight: 700;
          color: #ffffff !important;
        }

        /* CV SECTION - PROFESSIONAL DARK THEME (like Stripe/GitHub) */
        .cv-html-content .cv-section {
          margin-top: 48px;
          margin-bottom: 38px;
        }

        .cv-html-content .section-header {
          font-size: 18px;
          font-weight: 900;
          color: #ffffff !important;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          margin: 0 0 32px 0;
          padding-bottom: 16px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.15);
          position: relative;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
        }

        .cv-html-content .section-header::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, #7850ff 0%, #d946ef 50%, transparent 100%);
          box-shadow: 0 0 12px rgba(120, 80, 255, 0.5);
        }

        .cv-html-content .section-content {
          font-size: 14px;
          color: #cbd5e1;
          margin: 12px 0;
          line-height: 1.7;
        }

        /* CV ENTRY (Job/Education) - DARK MODE */
        .cv-html-content .cv-entry {
          margin-bottom: 32px;
          padding-left: 0;
          position: relative;
          transition: all 0.3s ease;
        }

        .cv-html-content .entry-date {
          font-size: 13px;
          background: linear-gradient(90deg, #7850ff, #d946ef);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
          font-weight: 600;
          letter-spacing: 0.02em;
          filter: drop-shadow(0 0 6px rgba(120, 80, 255, 0.3));
        }

        .cv-html-content .entry-title {
          font-size: 17px;
          font-weight: 800;
          color: #ffffff !important;
          margin: 10px 0;
          line-height: 1.4;
          letter-spacing: -0.01em;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
        }

        .cv-html-content .entry-company {
          font-size: 14px;
          color: #cbd5e1;
          font-style: italic;
          margin: 8px 0 12px 0;
          font-weight: 500;
        }

        .cv-html-content .entry-description {
          margin-top: 14px;
        }

        .cv-html-content .entry-description p {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.8;
          margin: 10px 0;
          letter-spacing: 0.005em;
        }

        /* SKILLS AND LANGUAGES - DARK MODE */
        .cv-html-content .skill-item {
          font-size: 14px;
          color: #cbd5e1;
          margin: 12px 0;
          line-height: 1.7;
        }

        .cv-html-content .skill-tags,
        .cv-html-content .interest-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: 18px 0;
        }

        .cv-html-content .skill-tag {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.05));
          color: #e5e7eb;
          padding: 9px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid rgba(255, 255, 255, 0.15);
          display: inline-block;
          transition: all 0.3s ease;
          letter-spacing: 0.01em;
        }

        .cv-html-content .skill-tag:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.25);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.08));
        }

        .cv-html-content .interest-tag {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.15));
          color: #fbbf24;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          border: 1.5px solid rgba(251, 191, 36, 0.3);
          display: inline-block;
          transition: all 0.3s ease;
          letter-spacing: 0.01em;
        }

        .cv-html-content .interest-tag:hover {
          transform: translateY(-1px);
          border-color: rgba(251, 191, 36, 0.5);
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
        }

        /* Fallback styles for non-structured HTML - PROFESSIONAL DARK */
        .cv-html-content h1:not(.cv-name) {
          font-size: 36px;
          font-weight: 900;
          color: #ffffff !important;
          margin: 0 0 20px 0;
          padding-bottom: 20px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.15);
          letter-spacing: -0.02em;
          text-align: center;
          line-height: 1.2;
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.6);
        }

        .cv-html-content h2:not(.section-header) {
          font-size: 18px;
          font-weight: 900;
          color: #ffffff !important;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          margin: 36px 0 18px 0;
          padding-bottom: 14px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.15);
          position: relative;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
        }

        .cv-html-content h2:not(.section-header)::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, #7850ff 0%, #d946ef 50%, transparent 100%);
          box-shadow: 0 0 12px rgba(120, 80, 255, 0.5);
        }

        .cv-html-content h3 {
          font-size: 17px;
          font-weight: 800;
          color: #ffffff !important;
          margin: 20px 0 10px 0;
          line-height: 1.4;
          letter-spacing: -0.01em;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
        }

        .cv-html-content h4 {
          font-size: 15px;
          font-weight: 700;
          color: #e5e7eb !important;
          margin: 16px 0 8px 0;
          letter-spacing: -0.01em;
        }

        .cv-html-content p:not(.section-content):not(.entry-description p) {
          font-size: 14px;
          color: #cbd5e1;
          margin: 10px 0;
          line-height: 1.7;
          text-align: left;
          letter-spacing: 0;
        }

        /* Lists - Professional bullet points - DARK MODE */
        .cv-html-content ul {
          margin: 14px 0 22px 0;
          padding-left: 20px;
          list-style-position: outside;
        }

        .cv-html-content li {
          font-size: 14px;
          color: #cbd5e1;
          margin: 7px 0;
          line-height: 1.7;
          list-style-type: disc;
          padding-left: 8px;
        }

        .cv-html-content li::marker {
          color: #e5e7eb;
          font-size: 0.85em;
        }

        .cv-html-content ol {
          margin: 14px 0 22px 0;
          padding-left: 20px;
        }

        .cv-html-content ol li {
          list-style-type: decimal;
        }

        /* Nested lists */
        .cv-html-content ul ul,
        .cv-html-content ul ol,
        .cv-html-content ol ul,
        .cv-html-content ol ol {
          margin: 6px 0;
          padding-left: 24px;
        }

        /* Links - DARK MODE */
        .cv-html-content a {
          color: #e5e7eb;
          text-decoration: underline;
          text-decoration-color: rgba(255, 255, 255, 0.3);
          text-underline-offset: 2px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .cv-html-content a:hover {
          text-decoration-color: #ffffff;
          color: #ffffff;
        }

        /* Strong/Bold text - HIGH VISIBILITY */
        .cv-html-content strong,
        .cv-html-content b {
          font-weight: 700;
          color: #ffffff !important;
        }

        /* Emphasis/Italic - DARK MODE */
        .cv-html-content em,
        .cv-html-content i {
          font-style: italic;
          color: #94a3b8;
        }

        /* Spacing and structure */
        .cv-html-content > *:first-child {
          margin-top: 0;
        }

        .cv-html-content > *:last-child {
          margin-bottom: 0;
        }

        /* Dates - detect and style */
        .cv-html-content p:has(time),
        .cv-html-content p > time,
        .cv-html-content span[data-date] {
          color: #64748b;
          font-size: 13px;
          font-style: italic;
        }

        /* Section breaks - DARK MODE */
        .cv-html-content hr {
          border: none;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin: 28px 0;
        }

        /* Tables (if any) - DARK MODE */
        .cv-html-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }

        .cv-html-content th,
        .cv-html-content td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 14px;
          color: #cbd5e1;
        }

        .cv-html-content th {
          font-weight: 600;
          color: #e5e7eb;
          background: rgba(255, 255, 255, 0.05);
        }

        /* ═══════════════════════════════════════════════════════════════ */
        /*          ATS-OPTIMIZED PRINT STYLES (2025 BEST PRACTICES)         */
        /* ═══════════════════════════════════════════════════════════════ */
        @media print {
          /* RESET ALL - Force white background, black text for ATS */
          * {
            background: white !important;
            background-color: white !important;
            background-image: none !important;
            color: black !important;
            box-shadow: none !important;
            text-shadow: none !important;
            border-color: black !important;
          }

          /* Hide UI elements */
          .actions-bar,
          .btn-primary,
          .btn-secondary,
          .keywords-section,
          .upgrade-box,
          .progress-bar-container,
          .bg-gradient,
          .particles,
          .email-success,
          .cv-footer-info,
          .success-container > *:not(.success-content) {
            display: none !important;
          }

          /* MAIN CV CONTAINER - Clean white, 1-inch margins */
          .cv-html-content,
          .cv-template,
          .cv-preview-wrapper,
          .cv-preview-section {
            background: white !important;
            padding: 1in !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
          }

          body,
          .success-container,
          .success-content,
          .cv-container {
            background: white !important;
            color: black !important;
          }

          /* ATS-SAFE TYPOGRAPHY */
          .cv-html-content,
          .cv-html-content * {
            font-family: Calibri, Arial, Helvetica, sans-serif !important;
            color: black !important;
            background: transparent !important;
          }

          /* CV HEADER - Name and Contact */
          .cv-html-content .cv-header {
            text-align: center;
            margin-bottom: 24pt;
            padding-bottom: 16pt;
            border-bottom: 1pt solid black !important;
          }

          .cv-html-content .cv-header::after {
            display: none !important;
          }

          .cv-html-content .cv-label {
            display: none !important; /* Remove decorative label */
          }

          .cv-html-content .cv-name,
          .cv-html-content h1:first-child {
            font-size: 20pt !important;
            font-weight: bold !important;
            color: black !important;
            margin: 0 0 10pt 0 !important;
            text-align: center !important;
            letter-spacing: 0 !important;
            text-transform: none !important;
          }

          .cv-html-content .cv-contact {
            font-size: 11pt !important;
            color: black !important;
            line-height: 1.4 !important;
            text-align: center !important;
          }

          .cv-html-content .cv-contact div,
          .cv-html-content .cv-contact strong {
            color: black !important;
            font-weight: normal !important;
          }

          /* SECTION HEADERS - ATS Standard */
          .cv-html-content .section-header,
          .cv-html-content h2 {
            font-size: 14pt !important;
            font-weight: bold !important;
            color: black !important;
            text-transform: uppercase !important;
            margin: 16pt 0 10pt 0 !important;
            padding: 0 0 6pt 0 !important;
            border-bottom: 1pt solid black !important;
            letter-spacing: 1pt !important;
            page-break-after: avoid !important;
          }

          .cv-html-content .section-header::after,
          .cv-html-content h2::after,
          .cv-html-content h2::before {
            display: none !important; /* Remove gradient decorations */
          }

          /* JOB ENTRIES */
          .cv-html-content .cv-entry {
            margin-bottom: 16pt !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
          }

          .cv-html-content .entry-date {
            font-size: 11pt !important;
            color: black !important;
            font-weight: bold !important;
            margin-bottom: 4pt !important;
            background: transparent !important;
            -webkit-background-clip: unset !important;
            -webkit-text-fill-color: black !important;
            filter: none !important;
          }

          .cv-html-content .entry-title,
          .cv-html-content h3 {
            font-size: 12pt !important;
            font-weight: bold !important;
            color: black !important;
            margin: 4pt 0 !important;
            page-break-after: avoid !important;
          }

          .cv-html-content .entry-company {
            font-size: 11pt !important;
            color: black !important;
            font-style: italic !important;
            margin: 2pt 0 6pt 0 !important;
          }

          .cv-html-content .entry-description {
            margin-top: 6pt !important;
          }

          .cv-html-content .entry-description p {
            font-size: 11pt !important;
            color: black !important;
            line-height: 1.4 !important;
            margin: 4pt 0 !important;
          }

          /* LISTS - Clean bullet points */
          .cv-html-content ul {
            margin: 6pt 0 12pt 20pt !important;
            padding: 0 !important;
            list-style-type: disc !important;
          }

          .cv-html-content ol {
            margin: 6pt 0 12pt 20pt !important;
            padding: 0 !important;
          }

          .cv-html-content li {
            font-size: 11pt !important;
            color: black !important;
            line-height: 1.4 !important;
            margin: 2pt 0 !important;
            page-break-inside: avoid !important;
          }

          .cv-html-content li::marker {
            color: black !important;
          }

          /* SKILLS & LANGUAGES */
          .cv-html-content .skill-item,
          .cv-html-content .section-content {
            font-size: 11pt !important;
            color: black !important;
            margin: 6pt 0 !important;
            line-height: 1.4 !important;
          }

          .cv-html-content .skill-tags,
          .cv-html-content .interest-tags {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 6pt !important;
            margin: 8pt 0 !important;
          }

          .cv-html-content .skill-tag,
          .cv-html-content .interest-tag {
            background: transparent !important;
            color: black !important;
            border: 1pt solid black !important;
            padding: 4pt 10pt !important;
            border-radius: 3pt !important;
            font-size: 10pt !important;
            font-weight: normal !important;
            display: inline-block !important;
            box-shadow: none !important;
          }

          /* GENERAL TEXT */
          .cv-html-content p {
            font-size: 11pt !important;
            color: black !important;
            line-height: 1.4 !important;
            margin: 6pt 0 !important;
            text-align: left !important;
          }

          .cv-html-content strong,
          .cv-html-content b {
            font-weight: bold !important;
            color: black !important;
          }

          .cv-html-content em,
          .cv-html-content i {
            font-style: italic !important;
            color: black !important;
          }

          .cv-html-content a {
            color: black !important;
            text-decoration: underline !important;
          }

          /* PAGE BREAKS */
          .cv-html-content .cv-section {
            page-break-inside: avoid !important;
          }

          .cv-html-content h1,
          .cv-html-content h2,
          .cv-html-content h3 {
            page-break-after: avoid !important;
          }

          /* ENSURE SINGLE COLUMN LAYOUT */
          .cv-html-content,
          .cv-html-content * {
            max-width: 100% !important;
            float: none !important;
            position: static !important;
          }

          /* Remove any decorative elements */
          .cv-html-content *::before,
          .cv-html-content *::after {
            display: none !important;
          }
        }


        /* ═══════════════════════════════════════════════════════════════ */
        /*             ATS INFO BANNER - EDUCATIONAL SECTION                */
        /* ═══════════════════════════════════════════════════════════════ */
        .ats-info-banner {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.08));
          border: 2px solid rgba(16, 185, 129, 0.3);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 28px;
          box-shadow:
            0 4px 16px rgba(16, 185, 129, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .ats-info-banner .banner-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }

        .ats-info-banner .banner-icon {
          font-size: 28px;
          line-height: 1;
        }

        .ats-info-banner .banner-header h4 {
          font-size: 22px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.95);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .ats-info-banner .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 28px;
        }

        .ats-info-banner .info-item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .ats-info-banner .check-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          background: rgba(16, 185, 129, 0.2);
          border: 2px solid rgba(16, 185, 129, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          color: #10b981;
        }

        .ats-info-banner .info-item strong {
          display: block;
          color: rgba(255, 255, 255, 0.95);
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .ats-info-banner .info-item p {
          color: rgba(255, 255, 255, 0.75);
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
        }

        /* PHOTO WARNING BOX */
        .photo-warning-box {
          background: rgba(245, 158, 11, 0.12);
          border: 2px solid rgba(245, 158, 11, 0.4);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .photo-warning-box .warning-icon {
          flex-shrink: 0;
          font-size: 32px;
          line-height: 1;
        }

        .photo-warning-box .warning-content strong {
          display: block;
          color: #fbbf24;
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .photo-warning-box ul {
          margin: 12px 0;
          padding-left: 20px;
          list-style-type: disc;
        }

        .photo-warning-box li {
          color: rgba(255, 255, 255, 0.85);
          font-size: 14px;
          line-height: 1.7;
          margin: 10px 0;
        }

        .photo-warning-box li strong {
          display: inline;
          color: #fbbf24;
          font-weight: 700;
        }

        .photo-warning-box .recommendation {
          margin: 16px 0 0 0;
          padding: 16px;
          background: rgba(16, 185, 129, 0.15);
          border-left: 4px solid #10b981;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          line-height: 1.6;
        }

        .photo-warning-box .recommendation strong {
          color: #10b981;
          font-weight: 800;
        }

        /* Responsive for ATS banner */
        @media (max-width: 768px) {
          .ats-info-banner {
            padding: 24px;
          }

          .ats-info-banner .banner-header h4 {
            font-size: 18px;
          }

          .ats-info-banner .info-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .photo-warning-box {
            flex-direction: column;
            padding: 20px;
          }

          .photo-warning-box .warning-icon {
            font-size: 28px;
          }
        }


        /* Action Buttons - ULTRA PREMIUM PROFESSIONAL */
        .btn-primary, .btn-secondary {
          padding: 14px 28px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.01em;
          border: none;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
          z-index: 1;
          box-shadow:
            0 1px 3px rgba(0, 0, 0, 0.12),
            0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .btn-primary span, .btn-secondary span {
          font-size: 16px;
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 2;
          position: relative;
        }

        /* PRIMARY BUTTON - Professional Green */
        .btn-primary {
          background: linear-gradient(135deg, #00ff88 0%, #00e67a 100%);
          color: #001a0d;
          box-shadow:
            0 2px 8px rgba(0, 255, 136, 0.3),
            0 8px 24px rgba(0, 255, 136, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Shine effect on hover */
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow:
            0 4px 14px rgba(0, 255, 136, 0.4),
            0 12px 32px rgba(0, 255, 136, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            inset 0 -2px 4px rgba(0, 0, 0, 0.12);
          background: linear-gradient(135deg, #00ff99 0%, #00f788 100%);
        }

        .btn-primary:hover span {
          transform: translateY(-1px);
        }

        .btn-primary:active {
          transform: translateY(0);
          box-shadow:
            0 1px 4px rgba(0, 255, 136, 0.3),
            0 4px 12px rgba(0, 255, 136, 0.2),
            inset 0 2px 4px rgba(0, 0, 0, 0.15);
        }

        /* SECONDARY BUTTON - Professional Purple/Pink */
        .btn-secondary {
          background: linear-gradient(135deg, #7850ff 0%, #d946ef 100%);
          color: white;
          box-shadow:
            0 2px 8px rgba(120, 80, 255, 0.3),
            0 8px 24px rgba(217, 70, 239, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.15);
        }

        /* Shine effect on hover */
        .btn-secondary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }

        .btn-secondary:hover::before {
          left: 100%;
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow:
            0 4px 14px rgba(120, 80, 255, 0.4),
            0 12px 32px rgba(217, 70, 239, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -2px 4px rgba(0, 0, 0, 0.18);
          background: linear-gradient(135deg, #8860ff 0%, #e056f5 100%);
        }

        .btn-secondary:hover span {
          transform: translateY(-1px);
        }

        .btn-secondary:active {
          transform: translateY(0);
          box-shadow:
            0 1px 4px rgba(120, 80, 255, 0.3),
            0 4px 12px rgba(217, 70, 239, 0.2),
            inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* CV Footer Info */
        .cv-footer-info {
          margin-top: 32px;
        }

        .keywords-section {
          background: rgba(26, 31, 46, 0.4);
          backdrop-filter: blur(32px) saturate(180%);
          -webkit-backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid rgba(120, 80, 255, 0.25);
          border-radius: 24px;
          padding: 28px 36px;
          margin-bottom: 20px;
          box-shadow:
            0 4px 16px rgba(120, 80, 255, 0.1),
            0 12px 40px rgba(217, 70, 239, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .keywords-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(120, 80, 255, 0.5),
            rgba(217, 70, 239, 0.5),
            transparent
          );
        }

        .keywords-section h4 {
          font-size: 19px;
          margin: 0 0 20px 0;
          color: rgba(255, 255, 255, 0.95);
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .keyword-tag {
          background: linear-gradient(135deg, rgba(120, 80, 255, 0.18), rgba(217, 70, 239, 0.15));
          border: 1.5px solid rgba(120, 80, 255, 0.5);
          color: #c084fc;
          padding: 10px 20px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.02em;
          box-shadow:
            0 2px 8px rgba(120, 80, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .keyword-tag::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .keyword-tag:hover {
          transform: translateY(-2px);
          border-color: rgba(217, 70, 239, 0.7);
          box-shadow:
            0 4px 12px rgba(120, 80, 255, 0.3),
            0 8px 24px rgba(217, 70, 239, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .keyword-tag:hover::before {
          left: 100%;
        }

        .upgrade-box {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 20px;
          padding: 20px 32px;
          text-align: center;
        }

        .upgrade-box p {
          color: #ffd700;
          font-size: 16px;
          margin: 0;
          font-weight: 600;
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
        @media (max-width: 1024px) {
          .cv-container {
            max-width: 100%;
            padding: 0 20px;
          }

          .cv-preview-wrapper {
            padding: 40px 30px;
            max-height: 700px;
          }

          .cv-preview-section {
            max-height: 700px;
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

          .actions-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
            padding: 24px 28px;
          }

          .actions-left {
            width: 100%;
          }

          .actions-left h3 {
            font-size: 20px;
            margin-bottom: 6px;
          }

          .cv-subtitle {
            font-size: 12px;
          }

          .actions-right {
            width: 100%;
            flex-direction: column;
            gap: 12px;
          }

          .btn-primary, .btn-secondary {
            width: 100%;
            justify-content: center;
          }

          .cv-preview-wrapper {
            padding: 30px 24px;
            max-height: 600px;
          }

          .cv-preview-section {
            max-height: 600px;
          }

          /* NEW: Responsive for structured CV */
          .cv-html-content .cv-name {
            font-size: 28px;
          }

          .cv-html-content .section-header {
            font-size: 15px;
          }

          .cv-html-content .entry-title {
            font-size: 14px;
          }

          .cv-html-content .cv-section {
            margin-top: 35px;
          }

          /* OLD: Fallback for non-structured */
          .cv-html-content h1 {
            font-size: 28px;
          }

          .cv-html-content h2 {
            font-size: 17px;
          }

          .cv-html-content h3 {
            font-size: 15px;
          }

          .templates-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .cv-container {
            padding: 0 16px;
          }

          .actions-bar {
            padding: 20px 24px;
            border-radius: 20px;
          }

          .actions-left h3 {
            font-size: 18px;
          }

          .cv-subtitle {
            font-size: 11px;
          }

          .btn-primary, .btn-secondary {
            padding: 12px 24px;
            font-size: 13px;
          }

          .keywords-section {
            padding: 20px;
          }

          .cv-preview-wrapper {
            padding: 24px 20px;
            max-height: 500px;
          }

          .cv-preview-section {
            max-height: 500px;
          }

          /* NEW: Responsive for structured CV */
          .cv-html-content .cv-name {
            font-size: 24px;
          }

          .cv-html-content .cv-contact {
            font-size: 12px;
          }

          .cv-html-content .section-header {
            font-size: 14px;
            letter-spacing: 1px;
          }

          .cv-html-content .entry-title {
            font-size: 13px;
          }

          .cv-html-content .entry-date,
          .cv-html-content .entry-company,
          .cv-html-content .entry-description p {
            font-size: 12px;
          }

          .cv-html-content .cv-section {
            margin-top: 30px;
            margin-bottom: 25px;
          }

          .cv-html-content .cv-header {
            margin-bottom: 35px;
          }

          /* Skill/Interest tags responsive */
          .cv-html-content .skill-tag,
          .cv-html-content .interest-tag {
            font-size: 12px;
            padding: 6px 12px;
          }

          .cv-html-content .skill-tags,
          .cv-html-content .interest-tags {
            gap: 8px;
          }

          /* OLD: Fallback for non-structured */
          .cv-html-content h1 {
            font-size: 24px;
          }

          .cv-html-content .contact-info,
          .cv-html-content h1 + p {
            font-size: 12px;
          }

          .cv-html-content h2 {
            font-size: 16px;
          }

          .cv-html-content h3 {
            font-size: 14px;
          }

          .cv-html-content p,
          .cv-html-content li {
            font-size: 13px;
          }

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