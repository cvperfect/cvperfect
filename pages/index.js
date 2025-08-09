import { useState, useEffect } from 'react'
import CVAnalysisDashboard from '../components/CVAnalysisDashboard'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const { locale } = router
  // GŁÓWNE STATE VARIABLES - NA SAMEJ GÓRZE
  const [currentLanguage, setCurrentLanguage] = useState(locale || 'pl')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [jobPosting, setJobPosting] = useState('')
  const [currentCV, setCurrentCV] = useState('')
  const [uploadMethod, setUploadMethod] = useState('upload')
  const [userEmail, setUserEmail] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedResult, setOptimizedResult] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [typingIndex, setTypingIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)
  const [currentStep, setCurrentStep] = useState(1)
  const [tooltips, setTooltips] = useState([])
  const [toasts, setToasts] = useState([])
  const [notifications, setNotifications] = useState([])
  

// Translations system
  const translations = {
    pl: {
      nav: {
        howItWorks: 'Jak to działa',
        reviews: 'Opinie',
        pricing: 'Cennik',
        optimizeNow: '🎯 Zoptymalizuj CV teraz ⚡'
      },
      hero: {
        badge: '🏆 #1 AI Platforma CV w Polsce',
        title: 'Zwiększ swoje szanse o',
        subtitle: 'Pierwsza sztuczna inteligencja w Polsce, która optymalizuje Twoje CV pod konkretne oferty pracy.',
        stats: {
          moreInterviews: 'więcej rozmów',
          atsSuccess: 'ATS success',
          optimization: 'optymalizacja'
        },
        cta: '🔍 Sprawdź swoje CV',
        guarantee: '✅ Bez rejestracji'
      }
    },
    en: {
      nav: {
        howItWorks: 'How it works',
        reviews: 'Reviews',
        pricing: 'Pricing',
        optimizeNow: '🎯 Optimize CV now ⚡'
      },
      hero: {
        badge: '🏆 #1 AI CV Platform in Poland',
        title: 'Increase your chances by',
        subtitle: 'The first AI in Poland that optimizes your CV for specific job offers.',
        stats: {
          moreInterviews: 'more interviews',
          atsSuccess: 'ATS success',
          optimization: 'optimization'
        },
        cta: '🔍 Check your CV',
        guarantee: '✅ No registration'
      }
    }
  }

  const t = translations[currentLanguage]
  // Stats counter animation
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.stat-value');
          
          counters.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const isDecimal = target % 1 !== 0;
            const duration = 2000;
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;
            
            const updateCounter = () => {
              current += increment;
              if (current < target) {
                counter.textContent = isDecimal 
                  ? current.toFixed(1)
                  : Math.floor(current).toLocaleString('pl-PL');
                requestAnimationFrame(updateCounter);
              } else {
                counter.textContent = isDecimal 
                  ? target.toFixed(1)
                  : Math.floor(target).toLocaleString('pl-PL');
              }
            };
            
            updateCounter();
          });
          
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.5
    });

    const statsSection = document.querySelector('.stats-counter-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

// Auto increment stats
  useEffect(() => {
    const incrementStats = () => {
      const cvCounter = document.querySelector('[data-target="15234"]');
      const jobCounter = document.querySelector('[data-target="7846"]');
      
      if (cvCounter && cvCounter.textContent && !isNaN(parseInt(cvCounter.textContent.replace(/\s/g, '')))) {
        const currentCV = parseInt(cvCounter.textContent.replace(/\s/g, ''));
        if (!isNaN(currentCV)) {
          const newCV = currentCV + Math.floor(Math.random() * 2) + 1;
          cvCounter.setAttribute('data-target', newCV.toString());
          cvCounter.textContent = newCV.toLocaleString('pl-PL');
        }
      }
      
      if (jobCounter && jobCounter.textContent && !isNaN(parseInt(jobCounter.textContent.replace(/\s/g, '')))) {
        const currentJob = parseInt(jobCounter.textContent.replace(/\s/g, ''));
        if (!isNaN(currentJob)) {
          const newJob = currentJob + Math.floor(Math.random() * 2);
          jobCounter.setAttribute('data-target', newJob.toString());
          jobCounter.textContent = newJob.toLocaleString('pl-PL');
        }
      }
    };

   // Increment every 3-5 minutes for realistic growth
const interval = setInterval(incrementStats, (180 + Math.random() * 120) * 1000);
    return () => clearInterval(interval);
  }, []);



// Scroll indicator logic
useEffect(() => {
  const handleScroll = () => {
    // Update scroll progress
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollProgress = (window.scrollY / scrollHeight) * 100
    const progressBar = document.querySelector('.scroll-progress')
    if (progressBar) {
      progressBar.style.height = `${scrollProgress}%`
    }
    
    // Update active section
    const sections = document.querySelectorAll('div[id]')
    const scrollDots = document.querySelectorAll('.scroll-dot')
    
    let currentSection = ''
   sections.forEach(section => {
  const rect = section.getBoundingClientRect()
  if (rect.top <= window.innerHeight / 3 && rect.bottom >= window.innerHeight / 3) {
    currentSection = section.id
  }
})
    
    scrollDots.forEach(dot => {
      if (dot.getAttribute('data-section') === currentSection) {
        dot.classList.add('active')
      } else {
        dot.classList.remove('active')
      }
    })
  }
  
  window.addEventListener('scroll', handleScroll)
  handleScroll() // Initial call
  
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

// Particles background - OPTIMIZED
useEffect(() => {
  if (typeof window === 'undefined') return;
  
  // PERFORMANCE CHECK - Disable on weak devices
if (typeof window === 'undefined' || 
    window.innerWidth < 768 || 
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) || 
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return;
  }
  
  class Particle {
    constructor(canvas, ctx) {
      this.canvas = canvas
      this.ctx = ctx
      this.x = Math.random() * canvas.width
      this.y = Math.random() * canvas.height
      this.size = Math.random() * 2 + 0.5
      this.speedX = Math.random() * 0.5 - 0.25
      this.speedY = Math.random() * 0.5 - 0.25
      this.opacity = Math.random() * 0.5 + 0.2
      this.color = Math.random() > 0.5 ? '#7850ff' : '#ff5080'
    }
    
    update() {
      this.x += this.speedX
      this.y += this.speedY
      
      if (this.x > this.canvas.width) this.x = 0
      else if (this.x < 0) this.x = this.canvas.width
      
      if (this.y > this.canvas.height) this.y = 0
      else if (this.y < 0) this.y = this.canvas.height
    }
    
    draw() {
      this.ctx.fillStyle = this.color
      this.ctx.globalAlpha = this.opacity
      this.ctx.beginPath()
      this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const particlesContainer = document.getElementById('particles')
  
  if (!particlesContainer) return
  
  particlesContainer.appendChild(canvas)
  
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  
// Create particles - ADAPTIVE COUNT
const getParticleCount = () => {
  if (window.innerWidth < 1200) return 15;
  if (navigator.hardwareConcurrency < 8) return 25;
  return 40;
};
const particleCount = getParticleCount();
const particles = [];

for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle(canvas, ctx));
}
  
  // Connect particles
  const connectParticles = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 150) {
          ctx.strokeStyle = particles[i].color
          ctx.globalAlpha = (150 - distance) / 150 * 0.2
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }
  }
  
  // Animation loop
  let animationId
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
   if (particles && particles.length > 0) {
  particles.forEach(particle => {
    particle.update()
    particle.draw()
  })
}
    
    connectParticles()
    
    animationId = requestAnimationFrame(animate)
  }
  
  animate()
  
  // Mouse interaction
  const handleMouseMove = (e) => {
    const mouseX = e.clientX
    const mouseY = e.clientY
    
    particles.forEach(particle => {
      const dx = mouseX - particle.x
      const dy = mouseY - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 100) {
        const force = (100 - distance) / 100
        particle.x -= (dx / distance) * force * 2
        particle.y -= (dy / distance) * force * 2
      }
    })
  }
  
  window.addEventListener('mousemove', handleMouseMove)
  
  return () => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resizeCanvas)
    window.removeEventListener('mousemove', handleMouseMove)
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas)
    }
  }
}, [])

// Timeline animation on scroll
useEffect(() => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  }
  
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const steps = entry.target.querySelectorAll('.timeline-step')
        const line = entry.target.querySelector('.timeline-line')
        
        if (line) {
          line.classList.add('animate')
        }
        
        steps.forEach((step, index) => {
          setTimeout(() => {
            step.classList.add('visible')
          }, index * 300)
        })
        
        timelineObserver.unobserve(entry.target)
      }
    })
  }, observerOptions)
  
  const timelineSection = document.querySelector('.timeline-wrapper')
  if (timelineSection) {
if (timelineSection) {
  timelineObserver.observe(timelineSection)
}

return () => {
  if (timelineSection) {
    timelineObserver.unobserve(timelineSection)
  }
}
  }
  
 }, []);

// Magnetic buttons effect
useEffect(() => {
  const buttons = document.querySelectorAll('.hero-button, .nav-cta, .testimonials-button, .timeline-button, .faq-button, .upload-btn.primary, .plan-button')
  const buttonHandlers = new Map()
  
  buttons.forEach(button => {
    let boundingRect = button.getBoundingClientRect()
    
    const handleMouseMove = (e) => {
      const mousePosX = e.clientX - boundingRect.left
      const mousePosY = e.clientY - boundingRect.top
      const centerX = boundingRect.width / 2
      const centerY = boundingRect.height / 2
      
      const percentX = (mousePosX - centerX) / centerX
      const percentY = (mousePosY - centerY) / centerY
      
      const maxMove = 10
      const moveX = percentX * maxMove
      const moveY = percentY * maxMove
      
      button.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.02)`
    }
    
    const handleMouseEnter = () => {
      boundingRect = button.getBoundingClientRect()
      button.style.transition = 'transform 0.2s ease'
    }
    
    const handleMouseLeave = () => {
      button.style.transform = 'translate(0, 0) scale(1)'
      button.style.transition = 'transform 0.5s ease'
    }
    
    const handleClick = function(e) {
  // Prevent multiple ripples
  const existingRipple = this.querySelector('.ripple')
  if (existingRipple) existingRipple.remove()
  
  const ripple = document.createElement('span')
  ripple.classList.add('ripple')
      
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      ripple.style.width = ripple.style.height = size + 'px'
      ripple.style.left = x + 'px'
      ripple.style.top = y + 'px'
      
      this.appendChild(ripple)
      
      setTimeout(() => ripple.remove(), 600)
    }
    
    // Store handlers for cleanup
    buttonHandlers.set(button, {
      mousemove: handleMouseMove,
      mouseenter: handleMouseEnter,
      mouseleave: handleMouseLeave,
      click: handleClick
    })
    
    button.addEventListener('mousemove', handleMouseMove)
    button.addEventListener('mouseenter', handleMouseEnter)
    button.addEventListener('mouseleave', handleMouseLeave)
    button.addEventListener('click', handleClick)
  })

  return () => {
    buttons.forEach(button => {
      const handlers = buttonHandlers.get(button)
      if (handlers) {
        button.removeEventListener('mousemove', handlers.mousemove)
        button.removeEventListener('mouseenter', handlers.mouseenter)
        button.removeEventListener('mouseleave', handlers.mouseleave)
        button.removeEventListener('click', handlers.click)
      }
    })
    buttonHandlers.clear()
  }
}, [])



  

// Debug function
const openUploadModal = () => {
  console.log('Opening upload modal...');
  setShowUploadModal(true);
}
  
  // Typing animation states


const typingPhrases = [
  'optymalizacją CV', 
  'analizą słów kluczowych',
  'zwiększeniem szans na pracę',
  'profesjonalnym CV',
  'personalizacją treści',
  'analizą ATS',
  'zwiększeniem widoczności',
  'sztuczną inteligencją'
];

// Typing animation effect
useEffect(() => {
  const handleType = () => {
    const current = loopNum % typingPhrases.length;
    const fullText = typingPhrases[current];

    setTypingText(isDeleting ? fullText.substring(0, typingIndex - 1) : fullText.substring(0, typingIndex + 1));

    setTypingSpeed(isDeleting ? 30 : 100);

    if (!isDeleting && typingIndex === fullText.length) {
      setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && typingIndex === 0) {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
    }

    setTypingIndex(isDeleting ? typingIndex - 1 : typingIndex + 1);
  };

  const timer = setTimeout(handleType, typingSpeed);
  return () => clearTimeout(timer);
}, [typingText, typingIndex, isDeleting, loopNum, typingSpeed, typingPhrases]);



// Show toast notification
const showToast = (message, type = 'info') => {
 const id = `toast-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const newToast = { id, message, type }
  setToasts(prev => [...prev, newToast])
  
  setTimeout(() => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, 4000)
}

// Cleanup toasts on component unmount
useEffect(() => {
  return () => {
    setToasts([])
  }
}, [])

// Update progress
const updateProgress = (step) => {
  setCurrentStep(step)
  const progressBar = document.querySelector('.progress-bar')
  const steps = document.querySelectorAll('.progress-step')
  
  if (progressBar) {
    progressBar.style.width = `${(step / 4) * 100}%`
    progressBar.style.transition = 'width 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
  
 
  
  // Premium success animation
  if (step === 4) {
    createConfetti();
    showToast('🎉 Gratulacje! Twoje CV jest gotowe!', 'success');
  }  
  steps.forEach((stepEl, index) => {
    if (index < step) {
      stepEl.classList.add('active')
    } else {
      stepEl.classList.remove('active')
    }
  })
}

  // NOWA FUNKCJA - DARMOWA ANALIZA
 const handleFreeAnalysis = () => {
  if (isOptimizing) return; // Prevent multiple calls
  
  const cvTextarea = document.querySelector('.cv-textarea');
  const cvText = cvTextarea?.value || '';
  
  if (!cvText || cvText.trim().length < 50) {
    showToast('⚠️ Najpierw wklej treść swojego CV!', 'warning')
    if (cvTextarea) {
      cvTextarea.focus();
      cvTextarea.style.borderColor = '#ef4444';
      setTimeout(() => cvTextarea.style.borderColor = '', 2000);
    }
    return;
  }

  
  // Premium loading animation
  setIsOptimizing(true);
  const loadingMessages = [
    '🔍 Analizuję strukturę CV...',
    '🤖 GPT-4 sprawdza zgodność z ATS...',
    '⚡ Optymalizuję słowa kluczowe...',
    '📊 Obliczam compatibility score...'
  ];
  
  let messageIndex = 0;
  const messageInterval = setInterval(() => {
    if (messageIndex < loadingMessages.length) {
      showToast(loadingMessages[messageIndex], 'info');
      messageIndex++;
    }
  }, 800);
  
  updateProgress(2)
  
  setTimeout(() => {
    clearInterval(messageInterval);
    setIsOptimizing(false);
  }, 3000);
  
  // Simulate analysis
  const fakeResult = {
    score: Math.floor(Math.random() * 40) + 45,
    problems: Math.floor(Math.random() * 8) + 5
  };
  
  setAnalysisResult(fakeResult);
  setShowUploadModal(false);
// Ustaw CSS custom property dla score circle
setTimeout(() => {
  const scoreCircle = document.querySelector('.score-circle');
  if (scoreCircle) {
    scoreCircle.style.setProperty('--score', fakeResult.score);
    scoreCircle.style.background = `conic-gradient(
      from 0deg,
      #00ff88 0%,
      #00cc70 ${fakeResult.score}%,
      rgba(255, 255, 255, 0.1) ${fakeResult.score}%
    )`;
  }
}, 100);
  
  // Show success and update progress
  setTimeout(() => {
    showToast('✅ Analiza zakończona!', 'success')
    updateProgress(3)
    setShowPaywall(true);
  }, 1500);
};

  // UPROSZCZONA FUNKCJA optimizeCV
const optimizeCV = () => {
  const cvTextarea = document.querySelector('.cv-textarea');
  const cvText = cvTextarea?.value || '';
  
  if (!cvText || cvText.trim().length < 50) {
    showToast('⚠️ Najpierw wklej treść swojego CV!', 'warning');
    setShowUploadModal(true);
    return;
  }
  
  handleFreeAnalysis();
}
const createConfetti = () => {
  const confettiCount = 50;
  const confettiColors = ['#7850ff', '#ff5080', '#50b4ff', '#00ff88', '#ffd700'];
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    confetti.style.animationDelay = Math.random() * 3 + 's';
    confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 5000);
  }
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
    // Pokaz szablony po wybraniu planu Gold lub Premium
    if (plan === 'gold' || plan === 'premium-monthly') {
      setShowTemplateModal(true);
    }

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

  // Mobile menu functions
  const toggleMobileMenu = () => {
    const nav = document.getElementById('mobileNav');
    const btn = document.getElementById('mobileMenuBtn');
    
    if (nav && btn) {
      nav.classList.toggle('show');
      btn.classList.toggle('active');
    }
  };

  const closeMobileMenu = () => {
    const nav = document.getElementById('mobileNav');
    const btn = document.getElementById('mobileMenuBtn');
    
    if (nav && btn) {
      nav.classList.remove('show');
      btn.classList.remove('active');
    }
  };

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

	
{/* Toast Notifications */}
<div className="toast-container" id="toastContainer">
  {toasts.map(toast => (
    <div key={toast.id} className={`toast ${toast.type}`}>
      {toast.message}
    </div>
  ))}
</div>

{/* Smart Tooltips */}
<div className="tooltip-container" id="tooltipContainer"></div>
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
  {/* Particles Background */}
  <div className="particles-container" id="particles"></div>   
  
  {/* Progress Bar */}
  <div className="progress-bar-container">
    <div className="progress-bar"></div>
    <div className="progress-steps">
      <div className="progress-step active" data-step="1">
        <span className="step-dot"></span>
        <span className="step-label">Start</span>
      </div>
      <div className="progress-step" data-step="2">
        <span className="step-dot"></span>
        <span className="step-label">Analiza</span>
      </div>
      <div className="progress-step" data-step="3">
        <span className="step-dot"></span>
        <span className="step-label">Płatność</span>
      </div>
      <div className="progress-step" data-step="4">
        <span className="step-dot"></span>
        <span className="step-label">Gotowe!</span>
      </div>
    </div>
  </div>
  
  {/* Scroll Indicator */}
<div className="scroll-indicator">
  <div className="scroll-progress"></div>
  <div className="scroll-sections">
    <a href="#hero" className="scroll-dot active" data-section="hero">
      <span className="dot-tooltip">Start</span>
    </a>
    <a href="#stats" className="scroll-dot" data-section="stats">
      <span className="dot-tooltip">Statystyki</span>
    </a>
    <a href="#capabilities" className="scroll-dot" data-section="capabilities">
      <span className="dot-tooltip">Możliwości</span>
    </a>
    <a href="#timeline" className="scroll-dot" data-section="timeline">
      <span className="dot-tooltip">Jak to działa</span>
    </a>
    <a href="#testimonials" className="scroll-dot" data-section="testimonials">
      <span className="dot-tooltip">Opinie</span>
    </a>
    <a href="#faq" className="scroll-dot" data-section="faq">
      <span className="dot-tooltip">FAQ</span>
    </a>
  </div>
</div>

    
    {/* Navigation */}
        <nav className="navigation">
          <div className="nav-content">
            <div className="logo">
              <span className="logo-badge">AI</span>
              <span className="logo-text">CvPerfect</span>
            </div>
<div className="nav-links" id="mobileNav">
  <div className="language-switcher">
    <button 
      className={`lang-btn ${currentLanguage === 'pl' ? 'active' : ''}`}
      onClick={() => {
        setCurrentLanguage('pl');
        closeMobileMenu();
      }}
      title="Polski"
    >
      🇵🇱 PL
    </button>
    <button 
      className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
      onClick={() => {
        setCurrentLanguage('en');
        closeMobileMenu();
      }}
      title="English"
    >
      🇬🇧 EN
    </button>
  </div>
  <a href="#timeline" className="nav-link" onClick={closeMobileMenu}>
    {currentLanguage === 'pl' ? 'Jak to działa' : 'How it works'}
  </a>
  <a href="#testimonials" className="nav-link" onClick={closeMobileMenu}>
    {currentLanguage === 'pl' ? 'Opinie' : 'Reviews'}
  </a>
  <a href="#pricing" className="nav-link" onClick={closeMobileMenu}>
    {currentLanguage === 'pl' ? 'Cennik' : 'Pricing'}
  </a>
  <button className="nav-cta" onClick={() => {
    console.log('Nav button clicked');
    setShowUploadModal(true);
  }}>
    {currentLanguage === 'pl' ? '🎯 Zoptymalizuj CV teraz ⚡' : '🎯 Optimize CV now ⚡'}
  </button>
</div>
<div className="mobile-menu-btn" onClick={toggleMobileMenu} id="mobileMenuBtn">
  <span></span>
  <span></span>
  <span></span>
</div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="hero-section" id="hero">
          <div className="hero-content">
            <div className="hero-badge">
              🏆 #1 AI Platforma CV w Polsce
            </div>
<h1 className="hero-title">
  Zwiększ swoje szanse o <span className="highlight">410%</span>
  <br />
  z AI-powered
  <div className="typing-safe-zone">
    <span className="typing-text">{typingText}</span>
    <span className="typing-cursor">|</span>
  </div>
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
              <button className="hero-button primary" onClick={openUploadModal}>
  🔍 Sprawdź swoje CV
</button>
              <div className="hero-guarantee">
  <span>✅ Bez rejestracji </span>
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
<div className="capabilities-section" id="capabilities">
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

{/* Stats Counter Section */}
<div className="stats-counter-section" id="stats">
  <div className="stats-container">
    <div className="stats-header">
      <div className="stats-badge">📊 Live Statistics</div>
      <h2>CvPerfect w liczbach</h2>
      <p>Dołącz do tysięcy zadowolonych użytkowników</p>
    </div>
    
    <div className="stats-grid">
      <div className="stat-box">
        <div className="stat-icon">📄</div>
        <div className="stat-value" data-target="15234">0</div>
        <div className="stat-label">CV zoptymalizowanych</div>
        <div className="stat-growth">+3 dziś</div>
      </div>
      
      <div className="stat-box">
        <div className="stat-icon">🎯</div>
        <div className="stat-value" data-target="98">0</div>
        <div className="stat-suffix">%</div>
        <div className="stat-label">Skuteczność ATS</div>
        <div className="stat-growth">Top 1 w PL</div>
      </div>
      
      <div className="stat-box">
        <div className="stat-icon">⚡</div>
        <div className="stat-value" data-target="3.2">0</div>
        <div className="stat-suffix">s</div>
        <div className="stat-label">Czas analizy</div>
        <div className="stat-growth">Błyskawicznie</div>
      </div>
      
      <div className="stat-box">
        <div className="stat-icon">💼</div>
        <div className="stat-value" data-target="7846">0</div>
        <div className="stat-label">Nowych miejsc pracy</div>
        <div className="stat-growth">+12 dziś</div>
      </div>
    </div>
  </div>
</div>



{/* How It Works Timeline - PREMIUM VERSION */}
<div className="timeline-section" id="timeline">
  <div className="timeline-container">
    <div className="timeline-header">
      <div className="timeline-badge premium-badge">
        <span className="badge-icon">⚡</span>
        <span className="badge-text">Proces 30 sekund</span>
      </div>
      <h2>Jak zoptymalizować CV w <span className="gradient-text">30 sekund?</span></h2>
      <p>Przewodnik krok po kroku - zobacz jak łatwo to zrobić</p>
    </div>
    
    <div className="timeline-wrapper premium">
      {/* Animated Progress Line */}
      <div className="timeline-progress-track">
        <div className="timeline-progress-line"></div>
        <div className="timeline-progress-glow"></div>
      </div>
      
      {/* Step 1 - Upload */}
      <div className="timeline-step premium-step" data-step="1">
        <div className="step-card">
          <div className="step-icon-wrapper">
            <div className="step-icon-bg"></div>
            <div className="step-icon">📄</div>
            <div className="step-icon-pulse"></div>
          </div>
          <div className="step-content">
            <div className="step-label">KROK 1</div>
            <h3>Wklej lub załaduj CV</h3>
            <p>Skopiuj treść CV lub przeciągnij plik PDF/DOC</p>
            <div className="step-details">
              <span className="detail-item">✅ PDF, DOC, DOCX</span>
              <span className="detail-item">✅ Lub wklej tekst</span>
              <span className="detail-item">✅ Max 5MB</span>
            </div>
            <div className="step-time">
              <span className="time-icon">⏱️</span>
              <span>5 sekund</span>
            </div>
          </div>
          <div className="step-visual">
            <div className="upload-animation">
              <div className="file-icon">📎</div>
              <div className="upload-progress"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Step 2 - AI Analysis */}
      <div className="timeline-step premium-step" data-step="2">
        <div className="step-card">
          <div className="step-icon-wrapper">
            <div className="step-icon-bg"></div>
            <div className="step-icon">🤖</div>
            <div className="step-icon-pulse"></div>
          </div>
          <div className="step-content">
            <div className="step-label">KROK 2</div>
            <h3>AI analizuje i optymalizuje</h3>
            <p>GPT-4 skanuje CV pod kątem ATS i słów kluczowych</p>
            <div className="step-details">
              <span className="detail-item">🔍 Analiza ATS</span>
              <span className="detail-item">🎯 Słowa kluczowe</span>
              <span className="detail-item">📊 Score obliczenie</span>
            </div>
            <div className="step-time">
              <span className="time-icon">⏱️</span>
              <span>15 sekund</span>
            </div>
          </div>
          <div className="step-visual">
            <div className="ai-scanning">
              <div className="scan-line"></div>
              <div className="scan-particles"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Step 3 - Payment */}
      <div className="timeline-step premium-step" data-step="3">
        <div className="step-card">
          <div className="step-icon-wrapper">
            <div className="step-icon-bg"></div>
            <div className="step-icon">💳</div>
            <div className="step-icon-pulse"></div>
          </div>
          <div className="step-content">
            <div className="step-label">KROK 3</div>
            <h3>Szybka płatność</h3>
            <p>Bezpieczna transakcja przez Stripe</p>
            <div className="step-details">
              <span className="detail-item">🔒 SSL Secure</span>
              <span className="detail-item">💰 Tylko 9.99 zł</span>
              <span className="detail-item">⚡ Instant</span>
            </div>
            <div className="step-time">
              <span className="time-icon">⏱️</span>
              <span>5 sekund</span>
            </div>
          </div>
          <div className="step-visual">
            <div className="payment-animation">
              <div className="card-icon">💳</div>
              <div className="checkmark">✓</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Step 4 - Download */}
      <div className="timeline-step premium-step" data-step="4">
        <div className="step-card success-card">
          <div className="step-icon-wrapper">
            <div className="step-icon-bg"></div>
            <div className="step-icon">🎉</div>
            <div className="step-icon-pulse"></div>
          </div>
          <div className="step-content">
            <div className="step-label">FINAŁ</div>
            <h3>Pobierz zoptymalizowane CV!</h3>
            <p>Twoje CV jest gotowe z 95% ATS score</p>
            <div className="step-details">
              <span className="detail-item">📈 95% ATS</span>
              <span className="detail-item">✨ PDF & DOCX</span>
              <span className="detail-item">🚀 Gotowe!</span>
            </div>
            <div className="step-time">
              <span className="time-icon">⏱️</span>
              <span>5 sekund</span>
            </div>
          </div>
          <div className="step-visual">
            <div className="success-animation">
              <div className="confetti-burst"></div>
              <div className="download-icon">⬇️</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Interactive Demo Button */}
    <div className="timeline-cta premium-cta">
      <button className="timeline-button premium-button" onClick={openUploadModal}>
        <span className="button-text">Rozpocznij teraz</span>
        <span className="button-icon">🚀</span>
        <div className="button-glow"></div>
      </button>
      <div className="cta-stats">
        <div className="stat-item">
          <span className="stat-icon">⚡</span>
          <span className="stat-text">30 sekund</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">💎</span>
          <span className="stat-text">9.99 zł</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🎯</span>
          <span className="stat-text">95% ATS</span>
        </div>
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
  <div key={`testimonial-${testimonial.name}-${index}`} className="testimonial-card">
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
  <span key={`star-${i}`} className="star">⭐</span>
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
            <button className="testimonials-button" onClick={openUploadModal}>
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

{/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
            <div className="modal-content template-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowTemplateModal(false)}>×</button>
              
              <div className="template-header">
                <h2>Wybierz szablon CV</h2>
                <p>Dostępne szablony w Twoim planie</p>
              </div>

              <div className="templates-grid">
                {/* Szablony dla planu Gold (49 zł) */}
                <div className="template-card" onClick={() => setSelectedTemplate('modern')}>
                  <div className="template-preview">
                    <div className="template-icon">📄</div>
                    <h3>Modern</h3>
                    <p>Nowoczesny design z kolorowymi akcentami</p>
                  </div>
                  <div className="template-badge">Gold</div>
                </div>

                <div className="template-card" onClick={() => setSelectedTemplate('classic')}>
                  <div className="template-preview">
                    <div className="template-icon">📋</div>
                    <h3>Classic</h3>
                    <p>Klasyczny, profesjonalny układ</p>
                  </div>
                  <div className="template-badge">Gold</div>
                </div>

                <div className="template-card" onClick={() => setSelectedTemplate('creative')}>
                  <div className="template-preview">
                    <div className="template-icon">🎨</div>
                    <h3>Creative</h3>
                    <p>Kreatywny design dla branż artystycznych</p>
                  </div>
                  <div className="template-badge">Gold</div>
                </div>

                {/* Dodatkowe szablony dla Premium (79 zł) */}
                <div className="template-card premium" onClick={() => setSelectedTemplate('executive')}>
                  <div className="template-preview">
                    <div className="template-icon">💼</div>
                    <h3>Executive</h3>
                    <p>Dla kadry zarządzającej</p>
                  </div>
                  <div className="template-badge premium">Premium</div>
                </div>

                <div className="template-card premium" onClick={() => setSelectedTemplate('tech')}>
                  <div className="template-preview">
                    <div className="template-icon">💻</div>
                    <h3>Tech Pro</h3>
                    <p>Dla branży IT</p>
                  </div>
                  <div className="template-badge premium">Premium</div>
                </div>

                <div className="template-card premium" onClick={() => setSelectedTemplate('minimal')}>
                  <div className="template-preview">
                    <div className="template-icon">⚡</div>
                    <h3>Minimal</h3>
                    <p>Minimalistyczny design</p>
                  </div>
                  <div className="template-badge premium">Premium</div>
                </div>

                <div className="template-card premium" onClick={() => setSelectedTemplate('infographic')}>
                  <div className="template-preview">
                    <div className="template-icon">📊</div>
                    <h3>Infographic</h3>
                    <p>Z wykresami umiejętności</p>
                  </div>
                  <div className="template-badge premium">Premium</div>
                </div>

                <div className="template-card premium" onClick={() => setSelectedTemplate('elegant')}>
                  <div className="template-preview">
                    <div className="template-icon">✨</div>
                    <h3>Elegant</h3>
                    <p>Elegancki i wyrafinowany</p>
                  </div>
                  <div className="template-badge premium">Premium</div>
                </div>
              </div>

              <div className="template-cta">
                <button 
                  className="template-button" 
                  onClick={() => {
                    if (selectedTemplate) {
                      showToast(`✅ Wybrano szablon: ${selectedTemplate}`, 'success');
                      setShowTemplateModal(false);
                    }
                  }}
                  disabled={!selectedTemplate}
                >
                  Zastosuj wybrany szablon
                </button>
              </div>
            </div>
          </div>
        )}


        {/* FAQ Section */}
        <div className="faq-section" id="faq">
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
              <button className="faq-button" onClick={openUploadModal}>
  Wypróbuj za darmo ⚡
</button>
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
        /* Language Switcher */
        .language-switcher {
          display: flex;
          gap: 8px;
          margin-right: 20px;
        }

        .lang-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .lang-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .lang-btn.active {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          border-color: transparent;
        }

        /* Template Modal Styles */
        .template-modal {
          max-width: 1200px;
          padding: 0;
        }

        .template-header {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          padding: 48px;
          text-align: center;
          border-radius: 32px 32px 0 0;
        }

        .template-header h2 {
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 12px;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          padding: 48px;
        }

        .template-card {
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          text-align: center;
        }

        .template-card:hover {
          transform: translateY(-5px);
          border-color: #00ff88;
          background: rgba(0, 255, 136, 0.05);
        }

        .template-card.premium {
          border-color: rgba(139, 92, 246, 0.3);
        }

        .template-card.premium:hover {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
        }

        .template-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .template-preview h3 {
          color: white;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .template-preview p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .template-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
        }

        .template-badge.premium {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .template-cta {
          padding: 32px 48px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .template-button {
          background: linear-gradient(135deg, #00ff88, #00cc70);
          color: #000;
          border: none;
          padding: 18px 48px;
          border-radius: 100px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .template-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .template-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        }

        /* Global Styles */
       body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 100vh;
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



/* Particles Background */
.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.6;
}

.particles-container canvas {
  width: 100%;
  height: 100%;
}

/* Ensure content is above particles */
.container > *:not(.particles-container) {
  position: relative;
  z-index: 1;
}

/* Performance optimization for mobile */
@media (max-width: 768px) {
  .particles-container {
    opacity: 0.3;
  }
}

/* Disable particles on very small devices for performance */
@media (max-width: 480px) {
  .particles-container {
    display: none;
  }
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
  
/* Enhanced Floating Notifications */
.floating-notifications {
  position: fixed;
  top: 120px;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
  max-width: 350px;
}

.floating-notification {
  background: linear-gradient(135deg, 
    rgba(20, 20, 20, 0.95), 
    rgba(40, 40, 40, 0.95)
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: white;
  padding: 18px 22px;
  border-radius: 20px;
  margin-bottom: 12px;
  box-shadow: 
    0 15px 50px rgba(0, 255, 136, 0.15),
    0 5px 20px rgba(0, 0, 0, 0.3);
  transform: translateX(400px);
  opacity: 0;
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  border-left: 4px solid #00ff88;
}

.floating-notification.show {
  transform: translateX(0);
  opacity: 1;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.notification-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #00ff88, #00cc70);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  color: #000;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
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
  color: #00ff88;
}

.notification-icon {
  font-size: 24px;
  filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.5));
}

/* Hide on mobile for performance */
@media (max-width: 768px) {
  .floating-notifications {
    display: none;
  }
}      

  /* Navigation */
.navigation {
  background: rgba(8, 8, 8, 0.95);
  backdrop-filter: blur(30px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 10000;
  transition: all 0.3s ease;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
  border-radius: 0;
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

.navigation::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

@keyframes borderFlow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.navigation:hover {
  background: rgba(10, 10, 10, 0.98);
  box-shadow: 0 12px 50px rgba(0, 0, 0, 0.4);
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

.language-switcher {
  display: flex;
  gap: 8px;
  margin-right: 20px;
  padding-right: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
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
  display: flex;
  align-items: center;
  gap: 6px;
}

.lang-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

.lang-btn.active {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .language-switcher {
    margin-right: 0;
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 20px;
    margin-bottom: 20px;
    width: 100%;
    justify-content: center;
  }
  
  .nav-links.show .language-switcher {
    display: flex;
  }
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

       
        /* Hero Section */
.hero-section {
  background: transparent;
  color: white;
  padding: 140px 40px 80px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.hero-subtitle-animated {
  font-size: 72px;
  font-weight: 900;
  line-height: 1.1;
  color: white;
  min-height: 1.2em; /* rezerwuje miejsce na tekst */
  height: 90px;       /* stała wysokość, dopasuj do swojego fontu */
  display: flex;
  align-items: center;
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


/* Typing Animation */
.typing-container {
  display: inline-block;
  min-width: 350px;
  text-align: left;
  position: relative;
}

.typing-text {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
}

.typing-cursor {
  display: inline-block;
  background: linear-gradient(135deg, #7850ff, #ff5080);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 300;
  font-size: 1.1em;
  animation: cursorBlink 1s ease infinite;
}

@keyframes cursorBlink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

/* Mobile fix for typing */
@media (max-width: 768px) {
  .typing-container {
    min-width: 250px;
    display: block;
    margin-top: 10px;
  }
  
  .hero-title {
    line-height: 1.3;
  }
}

@media (max-width: 480px) {
  .typing-container {
    min-width: 200px;
  }
  
  .typing-text {
    font-size: 0.9em;
  }
}

.hero-subtitle {
  font-size: 20px;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 40px;
  margin-top: 100px; /* DUŻY ODSTĘP OD ANIMACJI */
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
  padding: 32px 24px;
  border-radius: 24px;
  backdrop-filter: blur(15px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(120, 80, 255, 0.8), 
    rgba(255, 80, 150, 0.8),
    transparent
  );
  animation: shimmer 4s ease infinite;
}

.stat-item::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(120, 80, 255, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: all 0.6s ease;
  transform: rotate(0deg);
}

@keyframes shimmer {
  0% { transform: translateX(-200%); }
  100% { transform: translateX(200%); }
}

.stat-item:hover {
  transform: translateY(-8px) scale(1.05);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(120, 80, 255, 0.3);
  box-shadow: 
    0 20px 60px rgba(120, 80, 255, 0.25),
    0 0 40px rgba(120, 80, 255, 0.15);
}

.stat-item:hover::after {
  opacity: 1;
  transform: rotate(180deg);
}

.stat-item:hover .stat-number {
  transform: scale(1.1);
  text-shadow: 0 0 30px rgba(120, 80, 255, 0.6);
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
  transition: all 0.3s ease;
}

.stat-text {
  font-size: 16px;
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.hero-cta {
  text-align: left;
  animation: fadeInUp 0.6s ease 0.4s both;
}

.hero-button {
  display: inline-block;
  background: linear-gradient(135deg, #00ff88, #00cc70);
  color: #000;
  padding: 22px 50px;
  border-radius: 100px;
  font-size: 19px;
  font-weight: 900;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 10px 40px rgba(0, 255, 136, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  letter-spacing: -0.5px;
  text-transform: none;
}

.hero-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition: width 0.8s ease, height 0.8s ease;
}

.hero-button::after {
  content: '🚀';
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  transition: all 0.3s ease;
}

.hero-button:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 
    0 20px 60px rgba(0, 255, 136, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  background: linear-gradient(135deg, #00ff99, #00dd77);
}

.hero-button:hover::before {
  width: 400px;
  height: 400px;
}

.hero-button:hover::after {
  transform: translateY(-50%) scale(1.2) rotate(15deg);
}

.hero-button:active {
  transform: translateY(-2px) scale(1.01);
}


.hero-guarantee {
  text-align: center;
  margin-top: 16px;
}

.hero-guarantee span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

       /* Hero Visual - ENHANCED */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.cv-preview {
  display: flex;
  align-items: center;
  gap: 50px;
  perspective: 1200px;
  animation: fadeInUp 0.8s ease 0.5s both;
  transform-style: preserve-3d;
}

.cv-before, .cv-after {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  width: 300px;
  color: white;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;
}

.cv-before:hover, .cv-after:hover {
  transform: rotateY(-8deg) rotateX(4deg) translateZ(40px);
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.4);
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
  background: conic-gradient(
    from 0deg,
    #00ff88 0deg,
    #00cc70 342deg,
    rgba(255, 255, 255, 0.1) 342deg
  );
  animation: scoreReveal 3s ease forwards, scorePulse 2s ease infinite 3s;
  position: relative;
  overflow: hidden;
}

.cv-score.good::before {
  display: none; /* ta nakładka zasłaniała napis */
}

.cv-score.good::after {
  content: '';
  position: absolute;
  inset: -5px;
  background: inherit;
  border-radius: 50%;
  filter: blur(15px);
  opacity: 0.3;
  z-index: -1;
}

@keyframes scoreReveal {
  0% {
    background: conic-gradient(
      from 0deg,
      #00ff88 0deg,
      #00ff88 0deg,
      rgba(255, 255, 255, 0.1) 0deg
    );
    transform: scale(0.8);
  }
  100% {
    background: conic-gradient(
      from 0deg,
      #00ff88 0deg,
      #00cc70 342deg,
      rgba(255, 255, 255, 0.1) 342deg
    );
    transform: scale(1);
  }
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


/* Stats Counter Section */
.stats-counter-section {
  padding: 120px 40px;
  position: relative;
  overflow: hidden;
}

.stats-counter-section::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(80, 180, 255, 0.1) 0%, transparent 50%);
  animation: statsFloat 20s ease infinite;
}

@keyframes statsFloat {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.stats-header {
  text-align: center;
  margin-bottom: 80px;
}

.stats-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(80, 180, 255, 0.2), rgba(50, 150, 255, 0.2));
  border: 1px solid rgba(80, 180, 255, 0.3);
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 700;
  color: #50b4ff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.stats-header h2 {
  font-size: 48px;
  font-weight: 900;
  color: white;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.stats-header p {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 40px 24px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.stat-box::before {
  content: '';
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: radial-gradient(circle, rgba(80, 180, 255, 0.1) 0%, transparent 40%);
  transition: all 0.6s ease;
  opacity: 0;
}

.stat-box:hover {
  transform: translateY(-10px) scale(1.02);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(80, 180, 255, 0.3);
  box-shadow: 0 20px 50px rgba(80, 180, 255, 0.2);
}

.stat-box:hover::before {
  opacity: 1;
  top: -50%;
  left: -50%;
}

.stat-icon {
  font-size: 48px;
  margin-bottom: 24px;
  display: block;
  filter: drop-shadow(0 5px 15px rgba(80, 180, 255, 0.3));
  animation: iconPulse 3s ease infinite;
}

.stat-box:nth-child(2) .stat-icon { animation-delay: 0.5s; }
.stat-box:nth-child(3) .stat-icon { animation-delay: 1s; }
.stat-box:nth-child(4) .stat-icon { animation-delay: 1.5s; }

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.stat-value {
  font-size: 56px;
  font-weight: 900;
  color: white;
  line-height: 1;
  display: inline-block;
  letter-spacing: -2px;
  background: linear-gradient(135deg, #50b4ff, #7850ff, #ff5080);
  background-size: 200% 200%;
  animation: statGradient 4s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
  position: relative;
}

.stat-value::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 2px;
  background: inherit;
  opacity: 0.5;
  filter: blur(2px);
}

@keyframes statGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.stat-box:hover .stat-value {
  transform: scale(1.1);
  text-shadow: 0 0 30px rgba(80, 180, 255, 0.6);
}

.stat-suffix {
  font-size: 32px;
  font-weight: 900;
  color: #50b4ff;
  display: inline-block;
  margin-left: 4px;
}

.stat-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 16px;
  font-weight: 600;
}

.stat-growth {
  font-size: 14px;
  color: #00ff88;
  margin-top: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Desktop testimonials - slower animations */
@media (min-width: 1024px) {
.testimonial-card {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s ease forwards;
}

  .testimonial-card:hover {
    transform: translateY(-6px) scale(1.03);
    box-shadow: 0 10px 30px rgba(0, 255, 136, 0.1);
  }

  .testimonial-card::before,
  .testimonial-card::after,
  .testimonial-card:hover .testimonial-avatar {
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
}



/* DIAMOND LEVEL TESTIMONIALS */
.testimonial-card {
  transform-style: preserve-3d;
  backface-visibility: hidden;
}



/* PREMIUM GLOW EFFECTS */
.testimonials-section {
  position: relative;
}

.testimonials-section::after {
  content: '';
  position: absolute;
  top: 20%;
  left: 10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(120, 80, 255, 0.1) 0%, transparent 70%);
  animation: premiumFloat 15s ease infinite;
  pointer-events: none;
}

@keyframes premiumFloat {
  0%, 100% { 
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.3;
  }
  33% { 
    transform: translate(200px, -100px) rotate(120deg);
    opacity: 0.6;
  }
  66% { 
    transform: translate(-100px, 200px) rotate(240deg);
    opacity: 0.4;
  }
}

/* DISABLE ON MOBILE FOR PERFORMANCE */
@media (max-width: 768px) {
  
  
  .testimonials-section::after {
    display: none;
  }
  
  .testimonial-card:hover {
    transform: translateY(-5px) scale(1.01);
  }
}

/* Mobile responsiveness for stats */
@media (max-width: 968px) {

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  
  .stat-value {
    font-size: 42px;
  }
  
  .stat-suffix {
    font-size: 24px;
  }
}

@media (max-width: 568px) {
  .stats-counter-section {
    padding: 80px 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .stat-box {
    padding: 32px 20px;
  }
  
  .stats-header h2 {
    font-size: 32px;
  }
  
  .stats-header p {
    font-size: 16px;
  }
  
  .stat-value {
    font-size: 48px;
  }
}


/* Premium Timeline Styles */
.timeline-wrapper.premium {
  position: relative;
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 100%;
  overflow-x: hidden;
}

.timeline-progress-track {
  position: absolute;
  left: 50px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  z-index: 10;             /* było 0 → ma być nad .timeline-step (2) */
  pointer-events: none;    /* żeby linia nie łapała hoverów/klików */
}


.timeline-progress-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0%;
  background: linear-gradient(180deg, #00ff88, #00cc70, #00aa5c);
  border-radius: 2px;
  animation: progressGrow 3s ease forwards;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
}

@keyframes progressGrow {
  to { height: 100%; }
}

.timeline-progress-glow {
  position: absolute;
  top: 0;
  left: -10px;
  right: -10px;
  height: 50px;
  background: radial-gradient(circle, rgba(0, 255, 136, 0.4) 0%, transparent 70%);
  animation: glowMove 3s ease infinite;
}

@keyframes glowMove {
  0%, 100% { top: 0; }
  50% { top: calc(100% - 50px); }
}

.premium-step {
  opacity: 0;
  animation: stepReveal 0.8s ease forwards;
}

.premium-step[data-step="1"] { animation-delay: 0.2s; }
.premium-step[data-step="2"] { animation-delay: 0.6s; }
.premium-step[data-step="3"] { animation-delay: 1s; }
.premium-step[data-step="4"] { animation-delay: 1.4s; }

@keyframes stepReveal {
  from {
    opacity: 0;
    transform: translateX(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.step-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 48px;
  display: flex;
  align-items: center;
  gap: 40px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  max-width: 100%;
}

.step-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00ff88, #00cc70);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s ease;
}

.step-card:hover::before {
  transform: scaleX(1);
}

.step-card:hover {
  transform: translateY(-10px) scale(1.02);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 255, 136, 0.3);
  box-shadow: 
    0 30px 80px rgba(0, 255, 136, 0.2),
    0 0 60px rgba(0, 255, 136, 0.1);
}

.step-icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
}

.step-icon-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 112, 0.2));
  border-radius: 50%;
  animation: iconRotate 20s linear infinite;
}

@keyframes iconRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.step-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  z-index: 2;
  filter: drop-shadow(0 10px 20px rgba(0, 255, 136, 0.3));
  animation: iconBounce 3s ease infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.step-icon-pulse {
  position: absolute;
  inset: -20px;
  border: 2px solid rgba(0, 255, 136, 0.3);
  border-radius: 50%;
  animation: pulse 2s ease infinite;
}

.step-label {
  font-size: 12px;
  font-weight: 800;
  color: #00ff88;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.step-content h3 {
  font-size: 28px;
  font-weight: 900;
  color: white;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.step-content p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
  line-height: 1.6;
}

.step-details {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.detail-item {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.2);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: rgba(0, 255, 136, 0.2);
  transform: translateY(-2px);
}

.step-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #00ff88;
  font-weight: 700;
}

.step-visual {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Upload Animation */
.upload-animation {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon {
  font-size: 48px;
  animation: fileFloat 3s ease infinite;
}

@keyframes fileFloat {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.upload-progress {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.upload-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 60%;
  background: linear-gradient(90deg, #00ff88, #00cc70);
  animation: uploadProgress 2s ease infinite;
}

@keyframes uploadProgress {
  0% { width: 0%; }
  100% { width: 100%; }
}

/* AI Scanning Animation */
.ai-scanning {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00ff88, transparent);
  animation: scanMove 2s ease infinite;
}

@keyframes scanMove {
  0% { top: 0; }
  100% { top: 100%; }
}

.scan-particles {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #00ff88 1px, transparent 1px);
  background-size: 20px 20px;
  animation: particleFloat 20s linear infinite;
}

@keyframes particleFloat {
  from { transform: rotate(0deg) scale(1); }
  to { transform: rotate(360deg) scale(1.1); }
}

/* Payment Animation */
.payment-animation {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon {
  font-size: 48px;
  animation: cardFlip 3s ease infinite;
}

@keyframes cardFlip {
  0%, 100% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
}

.checkmark {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 30px;
  height: 30px;
  background: #00ff88;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-weight: bold;
  animation: checkPop 2s ease infinite;
}

@keyframes checkPop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* Success Animation */
.success-animation {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confetti-burst {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
  animation: burst 3s ease infinite;
}

@keyframes burst {
  0%, 100% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.5); opacity: 1; }
}

.download-icon {
  font-size: 48px;
  animation: downloadBounce 2s ease infinite;
}

@keyframes downloadBounce {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-10px); }
  75% { transform: translateY(10px); }
}

.success-card {
  border: 2px solid rgba(0, 255, 136, 0.4);
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.05), rgba(0, 204, 112, 0.05));
}

/* Premium CTA */
.timeline-cta.premium-cta {
  text-align: center;
  margin-top: 80px;
}

.timeline-button.premium-button {
  background: linear-gradient(135deg, #00ff88, #00cc70);
  color: #000;
  border: none;
  padding: 24px 60px;
  border-radius: 100px;
  font-size: 20px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 50px rgba(0, 255, 136, 0.4);
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.button-glow {
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #00ff88, #00cc70);
  border-radius: 100px;
  filter: blur(15px);
  opacity: 0.5;
  z-index: -1;
  animation: glowPulse 2s ease infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.premium-button:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 20px 60px rgba(0, 255, 136, 0.5);
}

.button-icon {
  font-size: 24px;
  animation: rocketLaunch 2s ease infinite;
}

@keyframes rocketLaunch {
  0%, 100% { transform: translateY(0) rotate(-45deg); }
  50% { transform: translateY(-5px) rotate(-45deg); }
}

.cta-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 32px;
}

.cta-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.cta-stats .stat-icon {
  font-size: 20px;
  filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.5));
}

/* Mobile Responsive */
@media (max-width: 968px) {
  .step-card {
    grid-template-columns: 1fr;
    padding: 32px;
    text-align: center;
  }
  
  .step-icon-wrapper {
    margin: 0 auto;
  }
  
  .step-visual {
    display: none;
  }
  
  .timeline-progress-track {
    left: 20px;
  }
  
  .step-details {
    justify-content: center;
  }
  
  .cta-stats {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .premium-step {
    animation: none;
    opacity: 1;
  }
  
  .step-icon {
    animation: none;
  }
  
  .timeline-progress-line {
    animation: none;
    height: 100%;
  }
  
  .timeline-wrapper.premium {
    gap: 24px;
    padding: 40px 0;
  }
  
  .step-card {
    padding: 24px;
  }
  
  .step-content h3 {
    font-size: 22px;
  }
  
  .timeline-button.premium-button {
    padding: 18px 40px;
    font-size: 16px;
  }
}

/* Gradient text helper */
.gradient-text {
  background: linear-gradient(135deg, #00ff88, #00cc70);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
}

.premium-badge {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 112, 0.2));
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  animation: badgeGlow 2s ease infinite;
}

@keyframes badgeGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
  50% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.5); }
}}

@media (max-width: 768px) {
  @keyframes iconFloat {
    0%, 100% { 
      transform: none;
    }
  }
}

.timeline-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.timeline-header {
  text-align: center;
  margin-bottom: 80px;
}

.timeline-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(255, 80, 150, 0.2), rgba(255, 50, 120, 0.2));
  border: 1px solid rgba(255, 80, 150, 0.3);
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 700;
  color: #ff5080;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.timeline-header h2 {
  font-size: 48px;
  font-weight: 900;
  color: white;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.timeline-header p {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
}

.timeline-wrapper {
  position: relative;
}

.timeline-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-50%);
  z-index: 10; /* większe niż .timeline-step (2) */
  pointer-events: none; /* nie blokuje kliknięć */
}




.timeline-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #7850ff, #ff5080, #50b4ff);
  transition: width 2s ease;
  border-radius: 2px;
  box-shadow: 0 0 20px rgba(120, 80, 255, 0.5);
}



.timeline-line.animate::after {
  width: 100%;
}

.timeline-step {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 48px;
  margin-bottom: 60px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  cursor: pointer;
  overflow: hidden; /* zmienione z hidden na visible */
}

.timeline-step::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 80, 150, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: all 0.8s ease;
  transform: rotate(0deg);
}

.timeline-step::after {
  content: attr(data-step);
  position: absolute;
  top: 8px; /* było -15px, podnosimy do wnętrza */
  left: 8px; /* było 30px, odsuwamy bliżej krawędzi */
  background: linear-gradient(135deg, #ff5080, #7850ff);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 16px;
  box-shadow: 0 8px 25px rgba(255, 80, 150, 0.4);
  transition: all 0.3s ease;
}


.timeline-step.visible {
  opacity: 1;
  transform: translateY(0);
}

.timeline-wrapper .timeline-step:nth-child(even) {
  margin-top: 0 !important;
}

.timeline-step:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 80, 150, 0.3);
  box-shadow: 0 30px 70px rgba(255, 80, 150, 0.2);
}

.timeline-step:hover::before {
  opacity: 1;
  transform: rotate(180deg);
}

.timeline-step:hover::after {
  transform: scale(1.2) rotate(10deg);
  box-shadow: 0 12px 35px rgba(255, 80, 150, 0.5);
}
.step-icon {
  font-size: 56px;
  margin-bottom: 24px;
  display: block;
  filter: drop-shadow(0 10px 20px rgba(120, 80, 255, 0.3));
  animation: iconFloat 6s ease infinite;
}

.timeline-step[data-step="2"] .step-icon { animation-delay: 1s; }
.timeline-step[data-step="3"] .step-icon { animation-delay: 2s; }
.timeline-step[data-step="4"] .step-icon { animation-delay: 3s; }

@media (max-width: 768px) {
  .step-icon {
    animation: none;
  }
}
.testimonial-card:nth-child(1) { animation-delay: 0.1s; }
.testimonial-card:nth-child(2) { animation-delay: 0.2s; }
.testimonial-card:nth-child(3) { animation-delay: 0.3s; }
.testimonial-card:nth-child(4) { animation-delay: 0.4s; }
.testimonial-card:nth-child(5) { animation-delay: 0.5s; }
.testimonial-card:nth-child(6) { animation-delay: 0.6s; }
.testimonial-card:nth-child(7) { animation-delay: 0.7s; }
.testimonial-card:nth-child(8) { animation-delay: 0.8s; }
.testimonial-card:nth-child(9) { animation-delay: 0.9s; }
.testimonial-card:nth-child(10) { animation-delay: 1.0s; }
.testimonial-card:nth-child(11) { animation-delay: 1.1s; }
.testimonial-card:nth-child(12) { animation-delay: 1.2s; }
.testimonial-card:nth-child(13) { animation-delay: 1.3s; }
.testimonial-card:nth-child(14) { animation-delay: 1.4s; }
.testimonial-card:nth-child(15) { animation-delay: 1.5s; }


.step-content h3 {
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin-bottom: 12px;
}

.step-content p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.step-number {
  position: absolute;
  top: -20px;
  right: 30px;
  background: linear-gradient(135deg, #7850ff, #ff5080);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 18px;
  box-shadow: 0 5px 20px rgba(120, 80, 255, 0.4);
}

.timeline-cta {
  text-align: center;
  margin-top: 80px;
}

.timeline-button {
  background: linear-gradient(135deg, #00ff88, #00cc70);
  color: #000;
  border: none;
  padding: 20px 48px;
  border-radius: 100px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
  position: relative;
  overflow: hidden;
}

.timeline-button::before {
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

.timeline-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 255, 136, 0.4);
}

.timeline-button:hover::before {
  width: 400px;
  height: 400px;
}

.timeline-note {
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

/* Mobile Timeline */
@media (max-width: 768px) {
  .timeline-section {
    padding: 80px 20px;
  }
  
  .timeline-header h2 {
    font-size: 36px;
  }
  
  .timeline-wrapper {
    padding: 20px 0;
  }
  
  .timeline-line {
    display: none;
  }
  
  .timeline-step {
    margin-bottom: 20px;
    padding: 30px 20px;
  }
  
  .timeline-step:nth-child(even) {
    margin-top: 0;
  }
  
  .step-icon {
    font-size: 40px;
  }
  
  .step-content h3 {
    font-size: 20px;
  }
  
  .step-number {
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
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
/* Testimonials Section */
.testimonials-section {
  background: transparent;
  padding: 120px 40px;
  position: relative;
  overflow: hidden;
}

.testimonials-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.testimonials-header {
  text-align: center;
  margin-bottom: 80px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.testimonials-header .section-title {
  color: white;
  font-size: 48px;
  font-weight: 900;
  margin-bottom: 24px;
  letter-spacing: -1px;
  line-height: 1.2;
}

.testimonials-header .section-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  line-height: 1.6;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Jednolita animacja dla wszystkich testimonials */
.testimonial-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 40px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transform-origin: center;
  will-change: transform, box-shadow;
  /* BEZ ANIMACJI - tylko hover */
}

.testimonial-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(180deg, rgba(120, 80, 255, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

/* Efekt hover dla wszystkich kart */
.testimonial-card:hover {
  transform: translateY(-10px) scale(1.02);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.06), 
    rgba(120, 80, 255, 0.02),
    rgba(255, 80, 150, 0.02)
  );
  border-color: rgba(120, 80, 255, 0.4);
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.2),
    0 15px 40px rgba(120, 80, 255, 0.15),
    0 0 40px rgba(120, 80, 255, 0.1);
  backdrop-filter: blur(30px) saturate(150%);
}

.testimonial-card:hover::before {
  opacity: 1;
}

.testimonial-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.testimonial-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #7850ff, #ff5080);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(120, 80, 255, 0.3);
  transition: all 0.3s ease;
}

.testimonial-card:hover .testimonial-avatar {
  transform: scale(1.1) rotate(5deg);
}

.testimonial-info {
  flex: 1;
}

.testimonial-name {
  font-weight: 800;
  color: white;
  margin-bottom: 4px;
  font-size: 18px;
}

.testimonial-position {
  color: #7850ff;
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
}

.testimonial-company {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.testimonial-verified {
  flex-shrink: 0;
}

.verified-badge {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 112, 0.2));
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
}

.testimonial-rating {
  margin-bottom: 20px;
  display: flex;
  gap: 4px;
}

.star {
  font-size: 20px;
  margin-right: 2px;
  filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.3));
  animation: starTwinkle 2s ease infinite;
}

.star:nth-child(2) { animation-delay: 0.2s; }
.star:nth-child(3) { animation-delay: 0.4s; }
.star:nth-child(4) { animation-delay: 0.6s; }
.star:nth-child(5) { animation-delay: 0.8s; }

@keyframes starTwinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(0.95); }
}

.testimonial-text {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  margin-bottom: 24px;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
}

.testimonial-impact {
  text-align: center;
}

.impact-badge {
  background: linear-gradient(135deg, #00ff88, #00cc70);
  color: #000;
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 800;
  display: inline-block;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  transition: all 0.3s ease;
}

.testimonial-card:hover .impact-badge {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
}

.testimonials-cta {
  text-align: center;
  margin-top: 80px;
}

.testimonials-cta h3 {
  font-size: 36px;
  font-weight: 900;
  color: white;
  margin-bottom: 32px;
  letter-spacing: -0.5px;
}

.testimonials-button {
  background: linear-gradient(135deg, #00ff88, #00cc70);
  color: #000;
  border: none;
  padding: 20px 48px;
  border-radius: 100px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
  position: relative;
  overflow: hidden;
}

.testimonials-button::before {
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

.testimonials-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 255, 136, 0.4);
}

.testimonials-button:hover::before {
  width: 400px;
  height: 400px;
}
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(10px);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  0% { 
    opacity: 0; 
    transform: translateY(50px) scale(0.95);
    filter: blur(10px);
  }
  50% {
    opacity: 0.8;
    transform: translateY(20px) scale(0.98);
    filter: blur(5px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1);
    filter: blur(0px);
  }
}

.modal-content {
  background: rgba(15, 15, 15, 0.98);
  backdrop-filter: blur(50px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 40px;
  max-width: 900px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 
    0 50px 150px rgba(0, 0, 0, 0.6),
    0 0 100px rgba(120, 80, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: modalSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 40px;
  padding: 2px;
  background: linear-gradient(135deg, 
    rgba(120, 80, 255, 0.3) 0%, 
    rgba(255, 80, 150, 0.3) 50%, 
    rgba(80, 180, 255, 0.3) 100%
  );
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: subtract;
  pointer-events: none;
}
.modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 40px;
  padding: 2px;
  background: linear-gradient(135deg, 
    rgba(120, 80, 255, 0.3) 0%, 
    rgba(255, 80, 150, 0.3) 50%, 
    rgba(80, 180, 255, 0.3) 100%
  );
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: subtract;
  pointer-events: none;
}
/* Custom Scrollbar for Modals */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  border-radius: 4px;
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
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.upload-header {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  color: white;
  padding: 48px 48px 40px;
  text-align: center;
  border-radius: 32px 32px 0 0;
  position: relative;
  overflow: hidden;
}

.upload-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: headerRotate 20s linear infinite;
}

@keyframes headerRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.upload-header h2 {
  font-size: 40px;
  font-weight: 900;
  color: white;
  margin-bottom: 16px;
  letter-spacing: -1px;
  position: relative;
  z-index: 1;
}

.upload-header p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  line-height: 1.5;
  position: relative;
  z-index: 1;
}

.upload-area {
  padding: 40px;
}

.upload-zone h3 {
  color: white !important;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 12px;
  opacity: 1 !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.upload-zone p {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 16px;
  margin-bottom: 24px;
  opacity: 1 !important;
  font-weight: 500;
}

/* Fix dla przerywanej linii w upload-zone */
.upload-zone {
  text-align: center;
  background: rgba(255, 255, 255, 0.04);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  padding: 30px 40px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  width: 100%;
}
.upload-zone::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(120, 80, 255, 0.1) 0%, transparent 40%);
  opacity: 0;
  transition: all 0.6s ease;
  transform: rotate(0deg);
}

.upload-hint {
  margin: 20px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  transition: all 0.3s ease;
}

.upload-zone:hover .upload-hint {
  color: rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
}

.upload-zone::after {
  display: none;
}

.upload-zone:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(120, 80, 255, 0.5);
  transform: scale(1.01);
  box-shadow: 0 20px 60px rgba(120, 80, 255, 0.15);
}
.upload-zone:hover::before {
  opacity: 1;
  transform: rotate(180deg);
}

.upload-zone:hover::after {
  opacity: 1;
  bottom: 25px;
}

.upload-zone:hover .upload-icon {
  transform: scale(1.1) rotate(5deg);
  filter: drop-shadow(0 15px 40px rgba(120, 80, 255, 0.4));
}


.upload-icon {
  font-size: 64px;
  margin-bottom: 24px;
  transition: all 0.4s ease;
  filter: drop-shadow(0 10px 20px rgba(120, 80, 255, 0.2));
}


.upload-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}

.upload-btn {
  padding: 14px 28px;
  border-radius: 100px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upload-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.upload-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.upload-btn.primary {
  background: linear-gradient(135deg, #00ff88, #00cc70);
  color: #000;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
}

.upload-btn.primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 255, 136, 0.4);
}

.upload-features {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.feature-check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}


/* Enhanced Textarea Styles */
.cv-textarea {
  width: 100%;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 16px;
  line-height: 1.6;
  resize: vertical;
  margin-bottom: 24px;
  font-family: 'Inter', sans-serif;
  color: white !important;
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(15px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  min-height: 160px;
  max-height: 200px;
}
.cv-textarea:focus {
  outline: none;
  border-color: rgba(120, 80, 255, 0.6);
  background: rgba(255, 255, 255, 0.06) !important;
  box-shadow: 
    0 0 0 4px rgba(120, 80, 255, 0.15),
    0 10px 40px rgba(120, 80, 255, 0.1);
  transform: scale(1.01);
}

.cv-textarea:hover {
  border-color: rgba(120, 80, 255, 0.3);
  background: rgba(255, 255, 255, 0.05) !important;
}

.cv-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5) !important;
  font-weight: 400;
}

.job-textarea {
  color: #000000 !important;
  background: white !important;
  border: 2px solid #d1d5db !important;
  font-weight: 500;
  padding: 24px;
  border-radius: 20px;
  line-height: 1.7;
  transition: all 0.4s ease;
}

.job-textarea:focus {
  color: #000000 !important;
  background: white !important;
  border-color: #667eea !important;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
  transform: scale(1.01);
}

.job-textarea::placeholder {
  color: #6b7280 !important;
  font-weight: 400;
}

       /* Paywall Modal */
.paywall-modal {
  padding: 0;
  max-width: 1100px;
  width: 98%;
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Modal Header Premium */
.modal-header {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  color: white;
  padding: 48px 48px 40px;
  border-radius: 32px 32px 0 0;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: headerPulse 4s ease infinite;
}

@keyframes headerPulse {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
}

.header-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.badge-icon {
  font-size: 18px;
  animation: rocketFloat 2s ease infinite;
}

@keyframes rocketFloat {
  0%, 100% { transform: translateY(0) rotate(-45deg); }
  50% { transform: translateY(-5px) rotate(-45deg); }
}

.modal-header h2 {
  font-size: 40px;
  font-weight: 900;
  margin-bottom: 12px;
  line-height: 1.2;
  color: white !important;
  letter-spacing: -1px;
}

.modal-header p {
  font-size: 18px;
  opacity: 0.9;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9) !important;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 28px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1) rotate(90deg);
}

/* Score Preview Premium */
.score-preview {
  background: linear-gradient(135deg, rgba(120, 80, 255, 0.1), rgba(255, 80, 150, 0.1));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 48px;
}

.score-container {
  display: flex;
  align-items: center;
  gap: 48px;
  justify-content: center;
}

.score-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #00ff88 0%,
    #00cc70 67%,
    rgba(255, 255, 255, 0.1) 67%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 255, 136, 0.3);
  animation: scoreRotate 20s linear infinite;

}
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 255, 136, 0.3);
  animation: scoreRotate 20s linear infinite;
}

@keyframes scoreRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.score-circle::before {
  content: '';
  position: absolute;
  width: 110px;
  height: 110px;
  background: #1a1a1a;
  border-radius: 50%;
  z-index: 1;
}

.score-value {
  font-size: 36px;
  font-weight: 900;
  color: #00ff88;
  z-index: 2;
  position: relative;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

.score-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 700;
  z-index: 2;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-info {
  text-align: left;
  color: white;
}

.score-info h4 {
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-info p {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  font-size: 16px;
}

/* Modal Content Inner */
.modal-content-inner {
  padding: 48px;
  color: white;
}

.optimization-section,
.email-section,
.pricing-section {
  margin-bottom: 48px;
}

.default-option {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.option-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.option-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.option-info {
  flex: 1;
}

.option-info h4 {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.option-info p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0;
}

.selected-badge {
  background: linear-gradient(135deg, #00ff88, #00cc70);
  color: #000;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
}

.job-upgrade-section {
  margin-top: 24px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.trust-section {
  margin-top: 40px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.trust-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  text-align: center;
}

.trust-stats .stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trust-stats .stat-number {
  font-size: 28px;
  font-weight: 900;
  color: #00ff88;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.trust-stats .stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.upgrade-header h4 {
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.upgrade-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin: 0 0 16px 0;
}

.upgrade-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.note-icon {
  font-size: 16px;
}

.modal-content-inner h3 {
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
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

/* Pricing Grid Premium */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  align-items: stretch;
}

.feature-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 400px; /* Minimalna wysokość */
}

.plan-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
}

.plan-card:hover {
  transform: translateY(-10px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
}

.plan-card.basic {
  border-color: rgba(156, 163, 175, 0.3);
}

.plan-card.gold {
  border: 2px solid rgba(245, 158, 11, 0.6);
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.08), 
    rgba(217, 119, 6, 0.06)
  );
  transform: scale(1.08);
  box-shadow: 
    0 30px 80px rgba(245, 158, 11, 0.25),
    0 0 60px rgba(245, 158, 11, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.plan-card.gold::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(245, 158, 11, 0.3), 
    transparent
  );
  animation: goldShine 3s ease infinite;
}

@keyframes goldShine {
  0% { left: -100%; }
  100% { left: 100%; }
}
  transform: scale(1.08);
  box-shadow: 
    0 30px 80px rgba(245, 158, 11, 0.25),
    0 0 60px rgba(245, 158, 11, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.plan-card.gold::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(245, 158, 11, 0.3), 
    transparent
  );
  animation: goldShine 3s ease infinite;
}

@keyframes goldShine {
  0% { left: -100%; }
  100% { left: 100%; }
}
.plan-card.premium {
  border: 2px solid rgba(139, 92, 246, 0.5);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.05));
  transform: scale(1.05);
  box-shadow: 0 20px 60px rgba(139, 92, 246, 0.2);
}

.plan-badge {
  position: absolute;
  top: -16px;
  left: 32px;
  padding: 8px 20px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.basic .plan-badge {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
}

.gold .plan-badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.premium .plan-badge {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.popularity-badge,
.premium-badge {
  position: absolute;
  top: -16px;
  right: 32px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: badgePulse 2s ease infinite;
}

.premium-badge {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.plan-header {
  margin: 28px 0 32px 0;
  text-align: center;
}

.plan-header h4 {
  font-size: 24px;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.old-price {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: line-through;
}

.current-price {
  font-size: 40px;
  font-weight: 900;
  color: white;
  letter-spacing: -1px;
}

.gold .current-price {
  color: #f59e0b;
  text-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
}

.premium .current-price {
  color: #8b5cf6;
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
}

.period {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
}

.discount {
  background: #ef4444;
  color: white;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 800;
}

.plan-features {
  margin-bottom: 32px;
  flex-grow: 1;
}

.feature {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.feature:hover {
  color: white;
  transform: translateX(5px);
}

.plan-button {
  width: 100%;
  padding: 20px;
  border: none;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.plan-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.8s ease, height 0.8s ease;
}

.plan-button::after {
  content: '⚡';
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  transition: all 0.3s ease;
}

.plan-button:hover::before {
  width: 500px;
  height: 500px;
}

.plan-button:hover::after {
  transform: translateY(-50%) scale(1.3) rotate(15deg);
}

.basic-btn {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
}

.basic-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 40px rgba(107, 114, 128, 0.4);
  background: linear-gradient(135deg, #a1a8b0, #737a83);
}

.gold-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 12px 40px rgba(245, 158, 11, 0.3);
}

.gold-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 50px rgba(245, 158, 11, 0.5);
  background: linear-gradient(135deg, #f6a509, #db7706);
}

.premium-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 12px 40px rgba(139, 92, 246, 0.3);
}

.premium-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 50px rgba(139, 92, 246, 0.5);
  background: linear-gradient(135deg, #8f5ff7, #7d3bee);
}
.plan-button:hover::before {
  width: 400px;
  height: 400px;
}

.basic-btn {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
}

.basic-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(107, 114, 128, 0.4);
}

.gold-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 8px 30px rgba(245, 158, 11, 0.3);
}

.gold-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(245, 158, 11, 0.4);
}

.premium-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.3);
}

.premium-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(139, 92, 246, 0.4);
}

/* Capabilities Section */
.capabilities-section {
  background: transparent;
  padding: 120px 0;
  position: relative;
  overflow: hidden;
}

.capabilities-section::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 400px;
  background: radial-gradient(ellipse at center, rgba(120, 80, 255, 0.1) 0%, transparent 70%);
  transform: translateY(-50%);
  pointer-events: none;
}

.capabilities-container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.capabilities-header {
  text-align: center;
  margin-bottom: 60px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(120, 80, 255, 0.2), rgba(255, 80, 150, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  color: white;
  padding: 12px 24px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 32px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.badge-icon {
  font-size: 18px;
  filter: drop-shadow(0 0 10px rgba(120, 80, 255, 0.5));
}

.capabilities-header h3 {
  font-size: 48px;
  font-weight: 900;
  color: white;
  margin-bottom: 20px;
  line-height: 1.2;
  letter-spacing: -1px;
}

.capabilities-header p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto;
}

.capabilities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 40px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.capability-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 48px;
  text-align: center;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transform-origin: center;
}

.capability-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(120, 80, 255, 0.12) 0%, transparent 50%);
  transform: rotate(0deg);
  transition: all 0.8s ease;
  opacity: 0;
}

.capability-card::after {
  content: '🤖';
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  opacity: 0;
  transform: scale(0) rotate(-180deg);
  transition: all 0.4s ease;
}

.capability-card:hover {
  transform: translateY(-15px) scale(1.05);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(120, 80, 255, 0.3);
  box-shadow: 
    0 40px 80px rgba(120, 80, 255, 0.2),
    0 0 60px rgba(120, 80, 255, 0.1);
}

.capability-card:hover::before {
  transform: rotate(180deg);
  opacity: 1;
}

.capability-card:hover::after {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}
.cap-icon {
  font-size: 56px;
  margin-bottom: 24px;
  display: block;
  transition: all 0.4s ease;
  filter: drop-shadow(0 5px 15px rgba(255, 255, 255, 0.1));
}

.capability-card:hover .cap-icon {
  transform: scale(1.2) rotate(10deg);
  filter: drop-shadow(0 10px 30px rgba(120, 80, 255, 0.3));
}

.capability-card h4 {
  font-size: 20px;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
  line-height: 1.3;
  letter-spacing: -0.5px;
}

.capability-card p {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 20px;
  flex-grow: 1;
}

.cap-result {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  color: white;
  padding: 12px 24px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 700;
  display: inline-block;
  margin-top: auto;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3);
}

.capability-card:hover .cap-result {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(120, 80, 255, 0.4);
}


.capability-card:hover .cap-icon {
  transform: scale(1.3) rotate(15deg);
  filter: drop-shadow(0 15px 40px rgba(120, 80, 255, 0.4));
}

.capability-card:hover .cap-result {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(120, 80, 255, 0.4);
}

.capabilities-note {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: center;
  justify-content: center;
  transition: all 0.3s ease;
  max-width: 900px;
  margin: 0 auto;
}

.capabilities-note:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(120, 80, 255, 0.2);
}

.note-icon {
  font-size: 28px;
  flex-shrink: 0;
  animation: robotFloat 3s ease infinite;
}

@keyframes robotFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(-5deg); }
  75% { transform: translateY(5px) rotate(5deg); }
}

.capabilities-note span:last-child {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  line-height: 1.5;
}
/* FAQ Section */
.faq-section {
  background: transparent;
  padding: 120px 40px;
  position: relative;
}

.faq-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.faq-container {
  max-width: 1200px;
  margin: 0 auto;
}

.faq-header {
  text-align: center;
  margin-bottom: 80px;
}

.faq-header .section-title {
  font-size: 48px;
  font-weight: 900;
  color: white;
  margin-bottom: 24px;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.faq-header .section-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
  margin-bottom: 80px;
}

.faq-item {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
  padding: 40px;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transform-origin: center;
}

.faq-item::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(120, 80, 255, 0.12) 0%, transparent 50%);
  transition: all 0.8s ease;
  opacity: 0;
  transform: rotate(0deg);
}

.faq-item::after {
  content: '💡';
  position: absolute;
  top: 25px;
  right: 25px;
  font-size: 20px;
  opacity: 0;
  transform: scale(0) rotate(-90deg);
  transition: all 0.4s ease;
}

.faq-item:hover {
  transform: translateY(-12px) scale(1.03);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(120, 80, 255, 0.4);
  box-shadow: 
    0 30px 70px rgba(120, 80, 255, 0.2),
    0 0 50px rgba(120, 80, 255, 0.1);
}

.faq-item:hover::before {
  opacity: 1;
  transform: rotate(180deg);
}

.faq-item:hover::after {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.faq-item:hover .faq-icon {
  transform: scale(1.3) rotate(20deg);
  filter: drop-shadow(0 10px 25px rgba(120, 80, 255, 0.5));
}
.faq-question {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.faq-icon {
  font-size: 32px;
  flex-shrink: 0;
  margin-top: 4px;
  transition: all 0.4s ease;
  filter: drop-shadow(0 5px 15px rgba(255, 255, 255, 0.2));
}

.faq-item:hover .faq-icon {
  transform: scale(1.2) rotate(15deg);
  filter: drop-shadow(0 10px 25px rgba(120, 80, 255, 0.4));
}

.faq-question h3 {
  color: white;
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  line-height: 1.4;
  letter-spacing: -0.5px;
}

.faq-answer {
  margin-left: 52px;
}

.faq-answer p {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  margin: 0;
  font-size: 16px;
}

.faq-cta {
  text-align: center;
  background: linear-gradient(135deg, rgba(120, 80, 255, 0.1), rgba(255, 80, 150, 0.1));
  backdrop-filter: blur(20px);
  padding: 64px 48px;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.faq-cta::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 50%);
  animation: ctaRotate 15s linear infinite;
}

@keyframes ctaRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.faq-cta h3 {
  color: white;
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
  letter-spacing: -0.5px;
}

.faq-button {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  color: white;
  border: none;
  padding: 18px 40px;
  border-radius: 100px;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(120, 80, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.faq-button::before {
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

.faq-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 40px rgba(120, 80, 255, 0.4);
}

.faq-button:hover::before {
  width: 400px;
  height: 400px;
}
        /* Footer */
.footer {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: white;
  padding: 120px 40px 40px;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(120, 80, 255, 0.8) 25%, 
    rgba(255, 80, 150, 0.8) 50%,
    rgba(80, 180, 255, 0.8) 75%,
    transparent 100%
  );
  animation: footerFlow 6s ease infinite;
}

@keyframes footerFlow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.footer::after {
  content: '';
  position: absolute;
  top: 20%;
  left: 10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(120, 80, 255, 0.08) 0%, transparent 60%);
  animation: footerFloat 20s ease infinite;
}

@keyframes footerFloat {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(100px, -50px) rotate(90deg); }
  50% { transform: translate(200px, 100px) rotate(180deg); }
  75% { transform: translate(-50px, 150px) rotate(270deg); }
}
.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 64px;
  margin-bottom: 64px;
  position: relative;
  z-index: 1;
}

.footer-section h4 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 24px;
  color: white;
  letter-spacing: -0.5px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.footer-logo .logo-text {
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(135deg, #7850ff, #ff5080, #50b4ff);
  background-size: 200% 200%;
  animation: gradientMove 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.footer-logo .logo-badge {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  color: white;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3);
}

.footer-description {
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
  margin-bottom: 32px;
  font-size: 16px;
  max-width: 400px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 16px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 16px;
  position: relative;
  display: inline-block;
}

.footer-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #7850ff, #ff5080);
  transition: width 0.3s ease;
}

.footer-links a:hover {
  color: white;
  transform: translateX(5px);
}

.footer-links a:hover::after {
  width: 100%;
}

.footer-bottom {
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
  margin: 0;
}

.footer-badges {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  transition: all 0.3s ease;
}

.badge:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

        /* Mobile Responsive */
       @media (max-width: 768px) {
  /* PERFORMANCE FIRST - Disable heavy animations */
  .particles-container {
    display: none !important;
  }
  
  * {
    animation-duration: 0.6s !important;
    transition-duration: 0.4s !important;
  }
  
  .container {
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    padding: 0;
    margin: 0;
  }

  /* Simplified hero for mobile */
  .hero-section {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 80px 20px 60px;
    max-width: 100%;
    overflow-x: hidden;
  }

  .hero-title {
    font-size: 32px !important;
    line-height: 1.2;
    text-align: center;
  }

  .cv-preview {
    flex-direction: column;
    gap: 20px;
    transform: scale(0.9);
  }

  .cv-before, .cv-after {
    width: 280px;
    padding: 24px;
    transform: none !important;
  }

/* Mobile typography */
  h1 { font-size: 32px !important; }
  h2 { font-size: 28px !important; }
  h3 { font-size: 20px !important; }
  p { font-size: 16px; }
  
  /* Mobile spacing */
  section { padding: 60px 20px !important; }
  
  /* Mobile cards */
  .feature-card,
  .testimonial-card,
  .faq-item,
  .capability-card {
    padding: 24px !important;
    margin-bottom: 16px;
  }
  
  /* Mobile buttons */
  button {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

.scroll-indicator {
    right: 15px;
    padding: 15px 6px;
  }
  
  .scroll-dot {
    width: 10px;
    height: 10px;
  }
  
  .dot-tooltip {
    display: none;
  }
  
  .scroll-sections {
    gap: 20px;
  }
  
  /* Fix horizontal scroll */
  * {
    max-width: 100vw !important;
  }
  
  .modal-content {
    border-radius: 20px;
    margin: 10px;
    width: calc(100% - 20px);
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


.nav-cta {
  padding: 12px 20px;
  font-size: 14px;
}

.logo-text {
  font-size: 22px;
}

/* Mobile menu button */
@media (max-width: 768px) {
  .navigation {
    width: calc(100% - 20px);
    top: 10px;
  }
  
  .nav-content {
    padding: 16px 20px;
    position: relative;
  }
  
  .nav-links {
    position: fixed;
    top: 80px;
    left: 20px;
    right: 20px;
    background: rgba(8, 8, 8, 0.95);
    backdrop-filter: blur(30px);
    border-radius: 20px;
    padding: 30px 20px;
    flex-direction: column;
    gap: 25px;
    transform: translateY(-200%);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 1000;
  }
  
  .nav-links.show {
    display: flex !important;
    transform: translateY(0);
    opacity: 1;
  }
  
  .nav-link {
    padding: 15px 0;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 18px;
  }
  
  .nav-link:last-of-type {
    border-bottom: none;
  }
  
  .nav-cta {
    margin-top: 20px;
    padding: 15px 25px;
    font-size: 16px;
    width: 100%;
    text-align: center;
  }

  .logo-text {
    font-size: 20px;
  }
  
  .mobile-menu-btn {
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    padding: 8px;
    z-index: 1001;
    position: relative;
  }
  
  .mobile-menu-btn span {
    width: 25px;
    height: 3px;
    background: white;
    border-radius: 2px;
    transition: all 0.3s ease;
  }
  
  .mobile-menu-btn.active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }
  
  .mobile-menu-btn.active span:nth-child(2) {
    opacity: 0;
  }
  
  .mobile-menu-btn.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }
}

.mobile-menu-btn {
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex !important;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    padding: 8px;
    z-index: 1001;
    position: relative;
  }
}

@media (max-width: 768px) {
  .navigation {
    width: 100%;
    top: 0;
    left: 0;
    right: 0;
    border-radius: 0;
  }
  
  .nav-content {
    padding: 16px 20px;
    position: relative;
  }
  
  .nav-links {
    position: fixed;
    top: 80px;
    left: 20px;
    right: 20px;
    background: rgba(8, 8, 8, 0.95);
    backdrop-filter: blur(30px);
    border-radius: 20px;
    padding: 30px 20px;
    flex-direction: column;
    gap: 25px;
    transform: translateY(-200%);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 1000;
    display: none;
  }
  
  .nav-links.show {
    display: flex !important;
    transform: translateY(0);
    opacity: 1;
  }
  
  .nav-link {
    padding: 15px 0;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 18px;
  }
  
  .nav-link:last-of-type {
    border-bottom: none;
  }
  
  .nav-cta {
    margin-top: 20px;
    padding: 15px 25px;
    font-size: 16px;
    width: 100%;
    text-align: center;
  }

  .logo-text {
    font-size: 20px;
  }
  
  .mobile-menu-btn {
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    padding: 8px;
    z-index: 1001;
    position: relative;
  }
  
  .mobile-menu-btn span {
    width: 25px;
    height: 3px;
    background: white;
    border-radius: 2px;
    transition: all 0.3s ease;
  }
  
  .mobile-menu-btn.active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }
  
  .mobile-menu-btn.active span:nth-child(2) {
    opacity: 0;
  }
  
  .mobile-menu-btn.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }
}          .features-section,
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
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
  align-items: stretch; /* Równa wysokość kart */
}

@media (max-width: 1200px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 0 20px;
  }
}

.feature-card {
  background: rgba(255, 255, 255, 0.02); !important;
  backdrop-filter: blur(25px); !important;
  border: 1px solid rgba(255, 255, 255, 0.08); !important
  border-radius: 32px;
  padding: 48px;
  text-align: center;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  color: white; !important
  transform-origin: center;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(120, 80, 255, 0.15) 0%, transparent 50%);
  opacity: 0;
  transition: all 0.8s ease;
  transform: rotate(0deg);
}

.feature-card::after {
  content: '✨';
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  opacity: 0;
  transform: scale(0) rotate(-180deg);
  transition: all 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-20px) scale(1.05) rotateX(5deg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(120, 80, 255, 0.05));
  border-color: rgba(120, 80, 255, 0.4);
  box-shadow: 
    0 50px 100px rgba(0, 0, 0, 0.4),
    0 0 80px rgba(120, 80, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(30px) saturate(200%);
}

.feature-card:hover::before {
  opacity: 1;
  transform: rotate(180deg);
}

.feature-card:hover::after {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.feature-card:hover .feature-icon {
  transform: scale(1.2) rotate(10deg);
  filter: drop-shadow(0 15px 30px rgba(120, 80, 255, 0.4));
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

/* Premium Animations */
@keyframes gradientShift {
  0%, 100% { transform: rotate(0deg) scale(1); }
  33% { transform: rotate(120deg) scale(1.1); }
  66% { transform: rotate(240deg) scale(0.9); }
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading States */
.loading-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Glow Effects */
.glow-text {
  text-shadow: 0 0 20px rgba(120, 80, 255, 0.5),
               0 0 40px rgba(120, 80, 255, 0.3),
               0 0 60px rgba(120, 80, 255, 0.1);
}

.glow-box {
  box-shadow: 0 0 20px rgba(120, 80, 255, 0.5),
              0 0 40px rgba(120, 80, 255, 0.3),
              0 0 60px rgba(120, 80, 255, 0.1);
}

/* Responsive Adjustments for Premium Design */
@media (max-width: 768px) {
  .hero-section {
    padding: 120px 20px 60px;
    gap: 40px;
  }
  
  .hero-title {
    font-size: 38px;
    letter-spacing: -1px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .hero-badge {
    font-size: 13px;
    padding: 8px 16px;
  }
  
  .hero-stats {
    gap: 16px;
  }
  
  .stat-item {
    padding: 20px 12px;
  }
  
  .stat-number {
    font-size: 36px;
  }
  
  .stat-text {
    font-size: 14px;
  }
  
  .hero-button {
    padding: 18px 36px;
    font-size: 16px;
  }
  
  .cv-preview {
    transform: scale(0.8);
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .hero-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .cv-preview {
    transform: scale(0.7);
  }
}
  
  .section-title {
    font-size: 36px;
  }
  
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
  
  .faq-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  
  .capabilities-grid {
    grid-template-columns: 1fr;
  }
}

.testimonials-cta {
  text-align: center;
  margin-top: 80px;
}

.testimonials-button {
  background: linear-gradient(135deg, #00ff88, #00cc70);
  color: #000;
  border: none;
  padding: 20px 48px;
  border-radius: 100px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
}

.testimonials-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 255, 136, 0.4);
}

/* Focus States */
input:focus,
textarea:focus,
button:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(120, 80, 255, 0.2);
}

/* Selection */
::selection {
  background: rgba(120, 80, 255, 0.3);
  color: white;
}

::-moz-selection {
  background: rgba(120, 80, 255, 0.3);
  color: white;
}

/* Magnetic Buttons Enhancement */
.hero-button,
.nav-cta,
.testimonials-button,
.timeline-button,
.faq-button,
.upload-btn.primary,
.plan-button {
  position: relative;
  overflow: hidden;
  z-index: 1;
  will-change: transform;
}

/* Progress Bar */
.progress-bar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  z-index: 9999;
  backdrop-filter: blur(10px);
  pointer-events: none;
}
.progress-bar {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #7850ff, #ff5080, #50b4ff);
  transition: width 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 0 10px rgba(120, 80, 255, 0.5);
}

.progress-steps {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 100px;
  z-index: 10002;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  padding: 12px 24px;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.progress-step.active {
  opacity: 1;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.progress-step.active .step-dot {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  box-shadow: 0 0 10px rgba(120, 80, 255, 0.5);
}

.step-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.progress-step.active .step-label {
  color: white;
}

/* Toast Notifications */
.toast-container {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toast {
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  animation: toastSlideIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

@keyframes toastSlideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast.success {
  border-color: rgba(0, 255, 136, 0.3);
  background: rgba(0, 255, 136, 0.1);
}

.toast.warning {
  border-color: rgba(255, 193, 7, 0.3);
  background: rgba(255, 193, 7, 0.1);
}

.toast.info {
  border-color: rgba(80, 180, 255, 0.3);
  background: rgba(80, 180, 255, 0.1);
}

/* Smart Tooltips */
.smart-tooltip {
  position: fixed;
  background: linear-gradient(135deg, #7850ff, #ff5080);
  color: white;
  padding: 12px 20px;
  border-radius: 100px;
  font-size: 14px;
  font-weight: 600;
  z-index: 10000;
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 10px 30px rgba(120, 80, 255, 0.4);
  pointer-events: none;
}

.smart-tooltip.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.tooltip-arrow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #ff5080;
}

.tooltip-content {
  white-space: nowrap;
}

/* Pulse Effect */
.pulse-effect {
  position: relative;
}

.pulse-effect::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  background: inherit;
  opacity: 0.5;
  animation: pulse-ring 2s ease infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .progress-steps {
    gap: 50px;
    padding: 8px 16px;
    font-size: 10px;
  }
  
  .step-dot {
    width: 10px;
    height: 10px;
  }
  
  .toast-container {
    bottom: 20px;
    right: 20px;
    left: 20px;
  }
  
  .toast {
    min-width: auto;
    width: 100%;
  }
  
  .smart-tooltip {
    max-width: 200px;
    white-space: normal;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .progress-steps {
    gap: 30px;
  }
  
  .step-label {
    display: none;
  }
}


/* Scroll Indicator */
/* Enhanced Scroll Indicator */
.scroll-indicator {
  position: fixed;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  padding: 20px 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.scroll-progress {
  position: absolute;
  left: 50%;
  top: 20px;
  width: 3px;
  height: 0%;
  background: linear-gradient(180deg, #7850ff, #ff5080, #50b4ff);
  transform: translateX(-50%);
  transition: height 0.1s ease;
  border-radius: 2px;
  box-shadow: 0 0 15px rgba(120, 80, 255, 0.6);
}

.scroll-sections {
  display: flex;
  flex-direction: column;
  gap: 25px;
  position: relative;
  align-items: center;
}

.scroll-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  display: block;
}

.scroll-dot::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: rgba(120, 80, 255, 0.1);
  opacity: 0;
  transition: all 0.3s ease;
}

.scroll-dot:hover,
.scroll-dot.active {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  border-color: transparent;
  transform: scale(1.4);
  box-shadow: 0 0 25px rgba(120, 80, 255, 0.6);
}

.scroll-dot:hover::before,
.scroll-dot.active::before {
  opacity: 1;
  transform: scale(1.5);
}

.dot-tooltip {
  position: absolute;
  right: 35px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(40, 40, 40, 0.95));
  backdrop-filter: blur(20px);
  color: white;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.scroll-dot:hover .dot-tooltip {
  opacity: 1;
  right: 40px;
  transform: translateY(-50%) scale(1.05);
}

/* Ripple Effect */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: scale(0);
  animation: ripple-animation 0.6s ease-out;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Confetti */
.confetti {
  position: fixed;
  width: 10px;
  height: 10px;
  top: -10px;
  z-index: 9999;
  animation: confetti-fall linear;
}

@keyframes confetti-fall {
  to {
    transform: translateY(100vh) rotate(360deg);
  }
}

/* Enhanced button hover states */
.hero-button:hover,
.testimonials-button:hover,
.timeline-button:hover {
  box-shadow: 
    0 15px 35px rgba(0, 255, 136, 0.4),
    inset 0 0 15px rgba(255, 255, 255, 0.1);
}

.nav-cta:hover,
.faq-button:hover {
  box-shadow: 
    0 15px 35px rgba(120, 80, 255, 0.4),
    inset 0 0 15px rgba(255, 255, 255, 0.1);
}

/* Cursor proximity glow */
@media (hover: hover) {
  .hero-button::after,
  .nav-cta::after,
  .testimonials-button::after,
  .timeline-button::after,
  .faq-button::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  .hero-button:hover::after,
  .nav-cta:hover::after,
  .testimonials-button:hover::after,
  .timeline-button:hover::after,
  .faq-button:hover::after {
    opacity: 1;
  }
}

/* Wyłącz ciągłe animacje na mobile */
@media (max-width: 768px) {
  .testimonial-card {
    animation: none;
    opacity: 1;
    transform: none;
  }
}


/* Premium Reveal Animations */
.reveal-element {
  opacity: 0;
  transform: translateY(50px) scale(0.95);
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.reveal-element.reveal-animate {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.reveal-child {
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.reveal-child.reveal-animate {
  opacity: 1;
  transform: translateX(0);
}

.glow-on-hover {
  position: relative;
  overflow: hidden;
}

.glow-on-hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.4), 
    transparent
  );
  transition: left 0.8s ease;
}

.glow-on-hover:hover::before {
  left: 100%;
}

/* Fix for broken layout */
@media (max-width: 1200px) {
  .step-card {
    flex-direction: column;
    text-align: center;
    padding: 32px;
  }
  
  .step-visual {
    display: none;
  }
}

/* Fix navigation z-index */
.navigation {
  z-index: 99999 !important;
}

/* Fix button hover states */
.hero-button,
.testimonials-button,
.timeline-button,
.faq-button,
.nav-cta {
  cursor: pointer !important;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Ensure modals are above navigation */
.modal-overlay {
  z-index: 100000 !important;
}

.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.8) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 999999 !important;
  backdrop-filter: blur(10px) !important;
}

.typing-safe-zone {
  min-height: 3em; /* zarezerwuj miejsce na tekst */
  line-height: 1.4;
  display: block;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  text-align: left; /* lub center jeśli chcesz wyśrodkować */
}

.typing-text {
  display: inline;
  word-break: break-word;
}

.typing-cursor {
  display: inline;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1 }
  50% { opacity: 0 }
}

/* === FIX HERO STATS & CV SCORE === */
.hero-stats {
  display: flex;
  gap: 20px;
}

.hero-stats .stat-item {
  min-width: 100px; /* zwiększa szerokość kwadracików */
  padding: 10px 15px;
  text-align: center;
  box-sizing: border-box;
}

.hero-stats .stat-number {
  font-size: 1.6rem;
  white-space: nowrap; /* zapobiega łamaniu tekstu */
}

.cv-score {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  width: 80px;  /* upewnij się, że jest kształt koła */
  height: 80px;
  border-radius: 50%;
  margin: 0 auto;
}

/* === FIX CV PREVIEW LINES OFFSET === */
.cv-before .cv-score {
  margin-bottom: 14px; /* kółko 32% ATS – opuść linie */
}

.cv-after .cv-score {
  margin-bottom: 18px; /* kółko 95% ATS – trochę większy odstęp */
}

/* delikatna poduszka nad liniami (opcjonalnie) */
.cv-preview .cv-content {
  padding-top: 4px;
}


/* === FIX TIMELINE BADGE POSITION === */
.timeline-badge {
  position: relative;
  top: -4px;
}

/* === SHIFT STEP CARDS SAFELY === */
.timeline-steps-container {
  padding-left: 60px; /* odsuwa wszystkie karty od zielonej linii */
  padding-right: 60px; /* symetria po prawej */
  box-sizing: border-box;
}

/* upewnij się, że .timeline-steps-container jest rodzicem .timeline-step w HTML */

/* === FIX PURPLE NUMBER CIRCLE SAFELY === */
.step-icon-wrapper {
  overflow: visible;
}

.step-icon-bg {
  transform: translateX(8px) translateY(4px);
}

.timeline-step .step-card {
  overflow: visible; /* pozwala kółkom wychodzić poza kartę */
}

.timeline-step .step-icon-wrapper {
  overflow: visible; /* pozwala kółkom wychodzić poza wrapper */
}

/* Odsłonięcie fioletowych kółek bez zmiany hover hitboxa */
.timeline-step .step-card,
.timeline-step .step-card > div,
.timeline-step .step-icon-wrapper {
  overflow: visible !important;
}



	`}</style>
    </>
  )
}