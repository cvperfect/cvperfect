import { useState, useEffect } from 'react'
import CVAnalysisDashboard from '../components/CVAnalysisDashboard'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import Footer from '../components/Footer'

// === Stripe Configuration ===
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// === Live stats (deterministyczne, bez backendu) ===
const LAUNCH_DATE = '2025-08-11'; // dzisiejsza data -> brak historycznych skoków
const BASE_STATS = { cv: 14980, interviews: 4120, jobs: 120 };
const DAILY = { cv: [120, 480], interviews: [40, 160], jobs: [6, 18] };

function hashStr(s){ let h = 2166136261>>>0; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
const seeded01 = s => (hashStr(s)%10000)/10000;
const daysBetweenISO = (aISO,bISO) => Math.max(0,Math.floor((new Date(aISO+'T00:00:00Z')-new Date(bISO+'T00:00:00Z'))/-86400000));

function computeLiveStats(now=new Date()){
  const todayISO = now.toISOString().slice(0,10);
  const dayIndex = daysBetweenISO(LAUNCH_DATE, todayISO);
  let {cv,interviews,jobs} = BASE_STATS;
  for(let i=0;i<dayIndex;i++){
    cv += DAILY.cv[0] + Math.floor(seeded01('cv-'+i)*(DAILY.cv[1]-DAILY.cv[0]+1));
    interviews += DAILY.interviews[0] + Math.floor(seeded01('in-'+i)*(DAILY.interviews[1]-DAILY.interviews[0]+1));
    jobs += DAILY.jobs[0] + Math.floor(seeded01('job-'+i)*(DAILY.jobs[1]-DAILY.jobs[0]+1));
  }
  const prog = (now.getUTCHours()*60 + now.getUTCMinutes())/(24*60);
  cv += Math.floor((DAILY.cv[0] + Math.floor(seeded01('cv-'+dayIndex)*(DAILY.cv[1]-DAILY.cv[0]+1))) * Math.max(0,Math.min(1,prog)));
  interviews += Math.floor((DAILY.interviews[0] + Math.floor(seeded01('in-'+dayIndex)*(DAILY.interviews[1]-DAILY.interviews[0]+1))) * Math.max(0,Math.min(1,prog)));
  jobs += Math.floor((DAILY.jobs[0] + Math.floor(seeded01('job-'+dayIndex)*(DAILY.jobs[1]-DAILY.jobs[0]+1))) * Math.max(0,Math.min(1,prog)));
  return { cv, interviews, jobs, ats: 95 };
}



export default function Home() {
  const router = useRouter()
const { locale } = router
const [currentLanguage, setCurrentLanguage] = useState('pl')

useEffect(() => {
  if (locale) setCurrentLanguage(locale)
}, [locale])

// Validate Stripe configuration on component mount
useEffect(() => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.error('⚠️ STRIPE_PUBLISHABLE_KEY is missing from environment variables');
  } else {
    console.log('✅ Stripe configuration loaded successfully');
  }
  
  // Validate Stripe.js loaded
  if (typeof window !== 'undefined') {
    const checkStripe = () => {
      if (window.Stripe) {
        console.log('✅ Stripe.js loaded successfully');
      } else {
        console.warn('⚠️ Stripe.js not loaded yet, will retry...');
        setTimeout(checkStripe, 1000);
      }
    };
    checkStripe();
  }
}, [])
  const [jobPosting, setJobPosting] = useState('')
  const [currentCV, setCurrentCV] = useState('')
  const [uploadMethod, setUploadMethod] = useState('upload')
  const [userEmail, setUserEmail] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedResult, setOptimizedResult] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null) 
  const [typingText, setTypingText] = useState('')
  const [typingIndex, setTypingIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)
  const [currentStep, setCurrentStep] = useState(1)
  const [tooltips, setTooltips] = useState([])
  const [toasts, setToasts] = useState([])
  const [notifications, setNotifications] = useState([])  
const [showMainModal, setShowMainModal] = useState(false);
const [modalStep, setModalStep] = useState(1);
const [formData, setFormData] = useState({
  email: '',
  cvFile: null,
  cvFileName: '',
  jobText: '',
  acceptTerms: false
});
const [dragActive, setDragActive] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);

const [savedCV, setSavedCV] = useState('');
const [showTemplateModal, setShowTemplateModal] = useState(false);

const [errors, setErrors] = useState({});
const [selectedPlan, setSelectedPlan] = useState('basic');
const [sessionId, setSessionId] = useState(null);

// Handle plan selection and payment
const handlePlanSelect = async (plan) => {
  console.log('💳 [DEBUG] Plan selected:', plan);
  console.log('📊 [DEBUG] Current data state:', {
    hasFile: !!formData.cvFile,
    hasSavedCV: !!savedCV,
    hasCurrentCV: !!currentCV,
    email: formData.email || userEmail,
    cvLength: savedCV ? savedCV.length : (currentCV ? currentCV.length : 0)
  });
  
  setSelectedPlan(plan);
  
  // Check if we have CV data
  if (!formData.cvFile && !savedCV && !currentCV) {
    console.log('❌ [DEBUG] No CV data found - showing alert');
    showToast('Najpierw wgraj swoje CV!', 'error');
    setShowMainModal(true);
    return;
  }

  // Generate session ID
  const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  setSessionId(newSessionId);
  
  // Save CV data to sessionStorage
  const cvContent = savedCV || currentCV || '';
  sessionStorage.setItem('pendingCV', cvContent);
  sessionStorage.setItem('pendingEmail', formData.email || userEmail);
  sessionStorage.setItem('pendingJob', jobPosting);
  sessionStorage.setItem('pendingPlan', plan);
  
  // Handle template selection logic
  if (plan === 'basic') {
    // Basic plan uses simple template by default - proceed directly to payment
    sessionStorage.setItem('selectedTemplate', 'simple');
    
    // Save to backend and proceed to payment
    try {
      console.log('💾 [DEBUG] Saving session to backend...', {
        sessionId: newSessionId,
        cvLength: cvContent.length,
        email: formData.email || userEmail,
        plan: plan
      });
      
      const saveResponse = await fetch('/api/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSessionId,
          cvData: cvContent,
          email: formData.email || userEmail,
          jobPosting: jobPosting,
          plan: plan,
          template: 'simple',
          photo: null
        })
      });
      
      if (!saveResponse.ok) {
        console.error('❌ [DEBUG] Failed to save session, status:', saveResponse.status);
        showToast('Błąd podczas zapisywania sesji', 'error');
      } else {
        console.log('✅ [DEBUG] Session saved successfully');
      }
      
      // Create Stripe checkout session
      console.log('💳 [DEBUG] Creating Stripe checkout session...', {
        plan: plan,
        email: formData.email || userEmail,
        cvLength: cvContent.length
      });
      
      const checkoutResponse = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan,
          email: formData.email || userEmail,
          cv: cvContent,
          job: jobPosting,
          photo: null,
          fullSessionId: newSessionId,
          metadata: {
            sessionId: newSessionId,
            fullSessionId: newSessionId,
            email: formData.email || userEmail,
            cvLength: cvContent.length,
            plan: plan
          },
          successUrl: `${window.location.origin}/success?session_id=${newSessionId}`,
          cancelUrl: window.location.origin
        })
      });
      
      if (checkoutResponse.ok) {
        const { sessionId: stripeSessionId, url } = await checkoutResponse.json();
        console.log('🎯 [DEBUG] Stripe checkout response received:', { stripeSessionId, hasUrl: !!url });
        
        // Redirect to Stripe checkout
        if (url) {
          console.log('🚀 [DEBUG] Redirecting to Stripe checkout URL');
          window.location.href = url;
        } else {
          console.log('🔄 [DEBUG] Using fallback Stripe redirect');
          // Fallback for older Stripe integration
          const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
          await stripe.redirectToCheckout({ sessionId: stripeSessionId });
        }
      } else {
        console.error('❌ [DEBUG] Checkout response not OK, status:', checkoutResponse.status);
        const errorText = await checkoutResponse.text();
        console.error('❌ [DEBUG] Checkout error details:', errorText);
        throw new Error(`Failed to create checkout session: ${checkoutResponse.status}`);
      }
      
    } catch (error) {
      console.error('💥 [DEBUG] Payment error caught:', error);
      showToast(`Wystąpił błąd podczas przetwarzania płatności: ${error.message}`, 'error');
    }
  } else {
    // Gold/Premium plans - check if template already selected
    const selectedTemplate = sessionStorage.getItem('selectedTemplate');
    console.log('🎯 [PLAN DEBUG] Gold/Premium plan selected:', plan);
    console.log('🎯 [PLAN DEBUG] Checking for existing template selection:', selectedTemplate);
    
    if (selectedTemplate) {
      // Template already selected - proceed to payment directly
      console.log('🎯 [PLAN DEBUG] Template already selected, proceeding to payment with:', selectedTemplate);
      
      // Save to backend and proceed to payment
      try {
        console.log('💾 [DEBUG] Saving session to backend for Gold/Premium...', {
          sessionId: newSessionId,
          cvLength: cvContent.length,
          email: formData.email || userEmail,
          plan: plan,
          template: selectedTemplate
        });
        
        const saveResponse = await fetch('/api/save-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: newSessionId,
            cvData: cvContent,
            email: formData.email || userEmail,
            jobPosting: jobPosting,
            plan: plan,
            template: selectedTemplate,
            photo: null
          })
        });
        
        if (!saveResponse.ok) {
          console.error('❌ [DEBUG] Failed to save session for Gold/Premium, status:', saveResponse.status);
          showToast('Błąd podczas zapisywania sesji', 'error');
          return;
        } else {
          console.log('✅ [DEBUG] Session saved successfully for Gold/Premium');
        }
        
        // Create Stripe checkout session
        console.log('💳 [DEBUG] Creating Stripe checkout session for Gold/Premium...', {
          plan: plan,
          email: formData.email || userEmail,
          priceId: getPriceId(plan)
        });
        
        const checkoutResponse = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: plan,
            priceId: getPriceId(plan),
            email: formData.email || userEmail,
            sessionId: newSessionId,
            successUrl: `${window.location.origin}/success?session_id=${newSessionId}`,
            cancelUrl: window.location.origin
          })
        });
        
        if (checkoutResponse.ok) {
          const { sessionId: stripeSessionId, url } = await checkoutResponse.json();
          console.log('🎯 [DEBUG] Stripe checkout response for Gold/Premium:', { stripeSessionId, hasUrl: !!url });
          
          // Redirect to Stripe checkout
          if (url) {
            console.log('🚀 [DEBUG] Redirecting to Stripe checkout URL for Gold/Premium');
            window.location.href = url;
          } else {
            console.log('🔄 [DEBUG] Using fallback Stripe redirect for Gold/Premium');
            // Fallback for older Stripe integration
            const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
            await stripe.redirectToCheckout({ sessionId: stripeSessionId });
          }
        } else {
          console.error('❌ [DEBUG] Gold/Premium checkout response not OK, status:', checkoutResponse.status);
          const errorText = await checkoutResponse.text();
          console.error('❌ [DEBUG] Gold/Premium checkout error details:', errorText);
          throw new Error(`Failed to create checkout session: ${checkoutResponse.status}`);
        }
        
      } catch (error) {
        console.error('💥 [DEBUG] Gold/Premium payment error caught:', error);
        showToast(`Wystąpił błąd podczas przetwarzania płatności: ${error.message}`, 'error');
      }
      
    } else {
      // No template selected - show template selection modal
      console.log('🎯 [PLAN DEBUG] No template selected, showing template modal');
      setShowMainModal(false);
      setShowTemplateModal(true);
      console.log('🎯 [PLAN DEBUG] Template modal should now be visible');
    }
  }
};

// Helper function to get Stripe price ID
const getPriceId = (plan) => {
  // Używaj prawdziwych Stripe price IDs z API
  const priceIds = {
    basic: 'price_1Rwooh4FWb3xY5tDRxqQ4y69', // 19.99 zł jednorazowo
    gold: 'price_1RxuK64FWb3xY5tDOjAPfwRX', // 49 zł/miesiąc subskrypcja
    premium: 'price_1RxuKK4FWb3xY5tD28TyEG9e' // 79 zł/miesiąc subskrypcja
  };
  return priceIds[plan] || priceIds.basic;
};

// Handle CV file upload
const handleFileUpload = (file) => {
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    setSavedCV(content);
    setCurrentCV(content);
    
    // Save to sessionStorage immediately
    sessionStorage.setItem('pendingCV', content);
    sessionStorage.setItem('pendingEmail', formData.email || userEmail);
    
    setFormData(prev => ({
      ...prev,
      cvFile: file,
      cvFileName: file.name
    }));
  };
  reader.readAsText(file);
};

// Modal state control
useEffect(() => {
  if (showMainModal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}, [showMainModal]);



const [liveStats, setLiveStats] = useState(null);

useEffect(() => {
  if (typeof window === 'undefined') return;
  setLiveStats(computeLiveStats(new Date()));
}, []);

function animateNumber(el, end, lang, duration=900){
  if (!el || !Number.isFinite(end)) return;       // ← eliminuje NaN
  const t0=performance.now(), start=0;
  const step=(t)=>{
    const p=Math.min(1,(t-t0)/duration);
    const val=Math.floor(start + (end-start)*p);
    el.textContent = val.toLocaleString(lang==='pl' ? 'pl-PL' : 'en-US');
    if(p<1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

useEffect(() => {
  if (!liveStats) return;
  const lang = currentLanguage || 'pl';
  const cv = document.querySelector('[data-stat="cv"]');
  const ats = document.querySelector('[data-stat="ats"]');
  const jobs = document.querySelector('[data-stat="jobs"]');

  animateNumber(cv,   liveStats.cv,   lang);
  animateNumber(jobs, liveStats.jobs, lang);
  if (ats) ats.textContent = `${liveStats.ats}%`; // ATS bez animacji (stabilny)
}, [liveStats, currentLanguage]);

// (opcjonalnie) odśwież co 5 min
useEffect(() => {
  const i=setInterval(()=>setLiveStats(computeLiveStats(new Date())), 5*60*1000);
  return ()=>clearInterval(i);
}, []);
  

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
  


// Scroll indicator logic (deterministyczny porządek + offset pod fixed header)
useEffect(() => {
  const IDS = ['hero','capabilities','stats','timeline','testimonials','faq'];
  const sections = IDS
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const dots = IDS
    .map(id => document.querySelector(`.scroll-dot[data-section="${id}"]`))
    .filter(Boolean);

  // Zaktualizuj na swoją realną wysokość paska nawigacji i kropek
const NAV_H = 60;   // px – wysokość headera
const DOTS_H = 44;  // px – wysokość topowego paska kropek
const MARGIN_TOP = 20; // px – dodatkowy odstęp od górnej krawędzi
const OFFSET = NAV_H + DOTS_H + MARGIN_TOP; // uwzględniamy odstęp

const mark = (idx) => {
  dots.forEach((d,i) => {
    if (!d) return;
    const isActive = i === idx;
    const isPassed = i < idx;

    // klasy zostawiamy, ale ustawiamy też inline-style (niezależnie od CSS)
    d.classList.toggle('active', isActive);
    d.classList.toggle('passed', isPassed || isActive);

if (isActive) {
  d.style.background = 'radial-gradient(circle, #9e33d6 0%, #1a001f 100%)'; // jaśniejszy fiolet -> ciemny
  d.style.boxShadow = '0 0 0 2px rgba(158,51,214,0.5)';
} else if (isPassed) {
  d.style.background = 'radial-gradient(circle, #7a28a6 0%, #140018 100%)'; // jaśniejszy od poprzedniego
  d.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.15) inset';
} else {
  d.style.background = 'radial-gradient(circle, #5c1f7a 0%, #0a000c 100%)'; // bazowy jaśniejszy
  d.style.boxShadow = '0 0 0 1px rgba(255,255,255,0.15) inset';
}
  });
};

  const onScroll = () => {
    const targetY = window.scrollY + OFFSET; // „cel” = linia tuż pod headerem+kropkami
    let bestIdx = 0;
    let bestDist = Infinity;

    sections.forEach((el, i) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const dist = Math.abs(top - targetY);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    });

    mark(bestIdx);
  };

  // klik w kropkę – przewijamy z kompensacją OFFSET (żeby nagłówki nie chowały się pod navem)
  dots.forEach((d, i) => {
    if (!d || !sections[i]) return;
    d.addEventListener('click', (e) => {
      e.preventDefault();
      const top = sections[i].getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    }, { passive: false });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    // szybki cleanup: zdejmujemy nasze listenery click przez klonowanie węzła
    dots.forEach(d => d && d.replaceWith(d.cloneNode(true)));
  };
}, []);

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
  timelineObserver.observe(timelineSection)
}

return () => {
  if (timelineSection) {
    timelineObserver.unobserve(timelineSection)
  }
}
}, []);

// Magnetic buttons effect - DISABLED FOR DEBUGGING
useEffect(() => {
  // TEMPORARILY DISABLED TO FIX MODAL ISSUE
  return;
  
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
  // DON'T prevent default - let the original onClick work!
  // e.preventDefault(); // REMOVED
  // e.stopPropagation(); // REMOVED
  
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
    button.addEventListener('click', handleClick, { capture: false })
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


	useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId && !window.location.pathname.includes('/success')) {
    const pendingCV = sessionStorage.getItem('pendingCV');
    const pendingJob = sessionStorage.getItem('pendingJob');
    const pendingEmail = sessionStorage.getItem('pendingEmail');
    const pendingPlan = sessionStorage.getItem('pendingPlan');
    const selectedTemplate = sessionStorage.getItem('selectedTemplate');
    
    if (pendingCV && pendingEmail) {
      console.log('🔄 Powrót z płatności, przekierowuję na stronę sukcesu...');
      
      sessionStorage.removeItem('pendingCV');
      sessionStorage.removeItem('pendingJob');
      sessionStorage.removeItem('pendingEmail');
      sessionStorage.removeItem('pendingPlan');
      sessionStorage.removeItem('selectedTemplate');
      
      window.location.href = `/success?session_id=${sessionId}&template=${selectedTemplate || 'default'}`;
    }
  }
}, []);

  
const createConfetti = () => {
  // Prosta implementacja confetti
  console.log('🎉 Confetti!');
};
  
  // Typing animation states

const [typingMinCh, setTypingMinCh] = useState(0);

const typingPhrases =currentLanguage === 'pl'


  ? [
  'optymalizacji CV',
  'analizie słów kluczowych',
  'personalizacji treści',
  'analizie ATS',
  'konkretnym rezultatom',
  'czystemu formatowaniu',
  'zwiększeniu widoczności',
  'sztucznej inteligencji'
    ]
  : [
  'CV optimization',
  'keyword analysis',
  'tailored content',
  'ATS analysis',
  'concrete results',
  'clean formatting',
  'higher visibility',
  'AI assistance'
    ];



useEffect(() => {
  // rezerwacja szerokości pod najdłuższą frazę (bez skakania layoutu)
  const longest = Math.max(...typingPhrases.map(s => s.length));
  setTypingMinCh(longest + 2); // +2 znaki luzu
}, [typingPhrases]);

// Cleanup toasts on component unmount
useEffect(() => {
  return () => {
    setToasts([])
  }
}, [])

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


// Obsługa powrotu ze Stripe i automatyczna optymalizacja
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (sessionId && !window.location.pathname.includes('/success')) {
    // Pobierz zapisane dane
    const pendingCV = sessionStorage.getItem('pendingCV');
    const pendingJob = sessionStorage.getItem('pendingJob');
    const pendingEmail = sessionStorage.getItem('pendingEmail');
    const pendingPlan = sessionStorage.getItem('pendingPlan');
    
    if (pendingCV && pendingEmail) {
      console.log('🔄 Powrót z płatności, przekierowuję na stronę sukcesu...');
      
      // Wyczyść dane tymczasowe
      sessionStorage.removeItem('pendingCV');
      sessionStorage.removeItem('pendingJob');
      sessionStorage.removeItem('pendingEmail');
      sessionStorage.removeItem('pendingPlan');
      
      // Przekieruj na stronę sukcesu z danymi
      window.location.href = `/success?session_id=${sessionId}`;
    }
  }
}, []);

// Funkcja do parsowania plików CV
const parseFileContent = async (file) => {
  try {
    console.log('📄 Parsing file:', file.name);
    
    const formData = new FormData();
    formData.append('cv', file);

    const response = await fetch('/api/parse-cv', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      setSavedCV(result.extractedText);
      
      // Save photo if extracted from CV
      if (result.extractedPhoto) {
        sessionStorage.setItem('pendingPhoto', result.extractedPhoto);
        console.log('📸 Photo extracted and saved');
      }
      
      console.log('✅ File parsed successfully:', {
        textLength: result.extractedText.length,
        hasPhoto: result.hasPhoto,
        wordCount: result.wordCount
      });
      
      // Pokaż sukces użytkownikowi
      setToasts(prev => [...prev, {
        id: Date.now(),
        message: currentLanguage === 'pl' 
          ? `✅ Plik ${result.fileName} został odczytany` 
          : `✅ File ${result.fileName} parsed successfully`,
        type: 'success'
      }]);
      
    } else {
      console.error('❌ Parsing failed:', result.error);
      alert(currentLanguage === 'pl' 
        ? `❌ ${result.error}` 
        : `❌ Error: ${result.error}`
      );
      
      // Reset file input
      setFormData(prev => ({
        ...prev,
        cvFile: null,
        cvFileName: ''
      }));
      setSavedCV('');
    }
  } catch (error) {
    console.error('❌ Parse error:', error);
    alert(currentLanguage === 'pl' 
      ? '❌ Wystąpił błąd podczas odczytywania pliku' 
      : '❌ Error reading file'
    );
  }
};

const handleFileInputChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Sprawdź rozmiar
  if (file.size > 5 * 1024 * 1024) {
    alert(currentLanguage === 'pl' ? '❌ Plik jest za duży (max 5MB)' : '❌ File too large (max 5MB)');
    return;
  }
  
  // Sprawdź format
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type) && !file.type.includes('word')) {
    alert(currentLanguage === 'pl' ? '❌ Nieprawidłowy format pliku' : '❌ Invalid file format');
    return;
  }
  
  // Symuluj upload progress
  setUploadProgress(0);
  const interval = setInterval(() => {
    setUploadProgress(prev => {
      if (prev >= 100) {
        clearInterval(interval);
        return 100;
      }
      return prev + 20;
    });
  }, 200);
  
  // Zapisz plik
  setFormData(prev => ({
    ...prev,
    cvFile: file,
    cvFileName: file.name
  }));
  
  // Parsuj zawartość pliku przez API
  parseFileContent(file);
};

const handleDrag = (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === "dragenter" || e.type === "dragover") {
    setDragActive(true);
  } else if (e.type === "dragleave") {
    setDragActive(false);
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
  
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    const file = e.dataTransfer.files[0];
    
    // Użyj tej samej logiki co handleFileInputChange
    if (file.size > 5 * 1024 * 1024) {
      alert(currentLanguage === 'pl' ? '❌ Plik jest za duży (max 5MB)' : '❌ File too large (max 5MB)');
      return;
    }
    
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.type.includes('word')) {
      alert(currentLanguage === 'pl' ? '❌ Nieprawidłowy format pliku' : '❌ Invalid file format');
      return;
    }
    
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
    
    setFormData(prev => ({
      ...prev,
      cvFile: file,
      cvFileName: file.name
    }));
    
    // Parsuj zawartość pliku przez API
    parseFileContent(file);
  }
};

const removeFile = () => {
  setFormData(prev => ({
    ...prev,
    cvFile: null,
    cvFileName: ''
  }));
  setUploadProgress(0);
  setSavedCV('');
};



const handleOptimizeNow = () => {
  setShowMainModal(true);
  setModalStep(1);
  setFormData({
    email: '',
    cvFile: null,
    cvFileName: '',
    cvText: '',
    jobText: '',
    acceptTerms: false
  });
  setErrors({});
  setSavedCV(''); // Wyczyść zapisane CV
  setUploadProgress(0); // Zresetuj progress
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  setShowMainModal(false);
  setModalStep(1);
  document.body.style.overflow = 'auto';
};

const validateStep1 = () => {
  console.log('🔍 [DEBUG] validateStep1 called, current form state:', {
    email: formData.email,
    hasFile: !!formData.cvFile,
    hasSavedCV: !!savedCV,
    acceptTerms: formData.acceptTerms
  });
  
  const newErrors = {};
  
  if (!formData.email || !formData.email.includes('@')) {
    newErrors.email = currentLanguage === 'pl' ? 'Podaj prawidłowy email' : 'Enter valid email';
    console.log('❌ [DEBUG] Email validation failed:', formData.email);
  }
  
  if (!formData.cvFile && !savedCV) {
    newErrors.cvFile = currentLanguage === 'pl' ? 'Musisz załadować plik CV lub wkleić tekst' : 'You must upload CV file or paste text';
    console.log('❌ [DEBUG] CV validation failed - no file or saved CV');
  }
  
  if (!formData.acceptTerms) {
    newErrors.acceptTerms = currentLanguage === 'pl' ? 'Musisz zaakceptować regulamin' : 'You must accept terms';
    console.log('❌ [DEBUG] Terms acceptance validation failed');
  }
  
  console.log('📋 [DEBUG] Validation errors found:', Object.keys(newErrors));
  
  setErrors(newErrors);
  const isValid = Object.keys(newErrors).length === 0;
  console.log('✅ [DEBUG] Overall validation result:', isValid);
  
  return isValid;
};

const handleNextStep = () => {
  console.log('🚀 [DEBUG] handleNextStep called, current step:', modalStep);
  
  if (modalStep === 1) {
    const isValid = validateStep1();
    console.log('✅ [DEBUG] Step 1 validation result:', isValid);
    
    if (isValid) {
      console.log('📝 [DEBUG] Form data:', {
        email: formData.email,
        cvLength: formData.cvFile ? formData.cvFile.name : (savedCV ? savedCV.length : 'no CV'),
        jobPosting: jobPosting ? jobPosting.substring(0, 50) + '...' : 'none'
      });
      
      setModalStep(2);
      console.log('➡️ [DEBUG] Moving to step 2 (plan selection)');
    } else {
      console.log('❌ [DEBUG] Step 1 validation failed, staying on current step');
    }
  } else {
    console.log('⚠️ [DEBUG] Not on step 1, current step:', modalStep);
  }
};

const handlePrevStep = () => {
  if (modalStep > 1) {
    setModalStep(modalStep - 1);
  }
};

const handleInputChange = (field, value) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
};

// Show toast notification
const showToast = (message, type = 'info') => {
  const id = `toast-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const newToast = { id, message, type }
  setToasts(prev => [...prev, newToast])
  
  setTimeout(() => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, 4000)
};

// Update progress
const updateProgress = (step) => {
  setCurrentStep(step)
  const progressBar = document.querySelector('.progress-bar')
  const steps = document.querySelectorAll('.progress-step')
  
  if (progressBar) {
    progressBar.style.width = `${(step / 4) * 100}%`
    progressBar.style.transition = 'width 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
  
  steps.forEach((stepEl, index) => {
    if (index < step) {
      stepEl.classList.add('active')
    } else {
      stepEl.classList.remove('active')
    }
  })


// Show toast notification
const showToast = (message, type = 'info') => {
 const id = `toast-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const newToast = { id, message, type }
  setToasts(prev => [...prev, newToast])
  
  setTimeout(() => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, 4000)
}



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
showToast(
  currentLanguage === 'pl'
    ? '🎉 Gratulacje! Twoje CV jest gotowe!'
    : '🎉 Congrats! Your CV is ready!',
  'success'
);
  }  
  steps.forEach((stepEl, index) => {
    if (index < step) {
      stepEl.classList.add('active')
    } else {
      stepEl.classList.remove('active')
    }
  })
}



  const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));
  if (!isAllowed) {
    alert(currentLanguage==='pl' ? '❌ Obsługujemy tylko pliki: PDF, DOC, DOCX' : '❌ We only support: PDF, DOC, DOCX');
    e.target.value = '';
    return;
  }

  // Sprawdź typ MIME
  const allowedTypes = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(file.type) && !file.type.includes('word')) {
    alert(currentLanguage==='pl' ? '❌ Nieprawidłowy format pliku. Używaj PDF, DOC lub DOCX' : '❌ Invalid file format. Use PDF, DOC or DOCX');
    e.target.value = '';
    return;
  }

  // ✅ Nie czytamy binarki jako tekst
  setUploadedFile(file);
  setCurrentCV('');

  // Delikatny feedback (żeby user widział, że jest OK)
  const textarea = document.querySelector('.cv-textarea');
  if (textarea) {
    textarea.value = currentLanguage==='pl'
      ? `📄 Załadowano: "${file.name}" (${(file.size/1024).toFixed(1)} KB).\n✅ Gotowe do analizy.`
      : `📄 Loaded: "${file.name}" (${(file.size/1024).toFixed(1)} KB).\n✅ Ready for analysis.`;
  }
};



// Template selection handler
const handleTemplateSelect = async (template) => {
  console.log('🎨 [TEMPLATE DEBUG] Template selection started');
  console.log('🎨 [TEMPLATE DEBUG] Clicked template:', template);
  
  const plan = sessionStorage.getItem('pendingPlan');
  console.log('🎨 [TEMPLATE DEBUG] Retrieved plan from sessionStorage:', plan);
  
  if (!plan) {
    console.error('❌ [TEMPLATE DEBUG] No plan found in sessionStorage!');
    showToast('Błąd: Nie znaleziono wybranego planu', 'error');
    return;
  }
  
  // Close template modal
  console.log('🎨 [TEMPLATE DEBUG] Closing template modal');
  setShowTemplateModal(false);
  
  // Save selected template
  console.log('🎨 [TEMPLATE DEBUG] Saving template to sessionStorage:', template);
  sessionStorage.setItem('selectedTemplate', template);
  
  // Use unified payment flow
  console.log('🎨 [TEMPLATE DEBUG] Calling handlePlanSelect with plan:', plan);
  try {
    await handlePlanSelect(plan);
    console.log('🎨 [TEMPLATE DEBUG] handlePlanSelect completed successfully');
  } catch (error) {
    console.error('❌ [TEMPLATE DEBUG] Error in handlePlanSelect:', error);
    showToast('Wystąpił błąd podczas przejścia do płatności', 'error');
  }
};


// Testimonials data (12) — w PL pokazujemy 5 PL + 7 EN; w EN wszystkie EN
const testimonialsBase = [
  // 5 polskich (PL tekst)
  {
    name: 'Anna Kowalska', position: 'Marketing Manager', company: 'Allegro',
    avatar: 'AK', rating: 5, verified: true,
    textPL: 'Dzięki CvPerfect dostałam 3 rozmowy kwalifikacyjne w ciągu tygodnia! AI świetnie dopasował moje CV.',
    textEN: 'Thanks to CvPerfect I got 3 interviews in a week! The AI tailored my CV perfectly.'
  },
  {
    name: 'Michał Nowak', position: 'Frontend Developer', company: 'Asseco',
    avatar: 'MN', rating: 5, verified: true,
    textPL: 'Optymalizacja pod ATS zwiększyła odzew o 400%. Polecam!',
    textEN: 'ATS optimization boosted responses by 400%. Highly recommend!'
  },
  {
    name: 'Katarzyna Wiśniewska', position: 'HR Business Partner', company: 'PKO BP',
    avatar: 'KW', rating: 5, verified: true,
    textPL: 'Jako rekruterka widzę, że CV od CvPerfect lepiej przechodzi przez ATS.',
    textEN: 'As a recruiter, I see CvPerfect CVs pass ATS much better.'
  },
  {
    name: 'Piotr Zieliński', position: 'Data Analyst', company: 'CD Projekt',
    avatar: 'PZ', rating: 5, verified: true,
    textPL: 'W 30 sekund dostałem CV dopasowane do oferty – dostałem pracę!',
    textEN: 'In 30 seconds I got a tailored CV – I landed the job!'
  },
  {
    name: 'Magdalena Krawczyk', position: 'Project Manager', company: 'Orange Polska',
    avatar: 'MK', rating: 5, verified: true,
    textPL: 'Profesjonalne, szybkie i skuteczne. 5 gwiazdek!',
    textEN: 'Professional, fast and effective. 5 stars!'
  },

  // 7 angielskich (zagraniczne nazwiska, EN tekst)
  {
    name: 'Olivia Smith', position: 'Product Designer', company: 'Spotify',
    avatar: 'OS', rating: 5, verified: true,
    textPL: 'CvPerfect dopasował moje CV do roli — zaproszenia pojawiły się w kilka dni.',
    textEN: 'CvPerfect matched my CV to the role — interviews came within days.'
  },
  {
    name: 'Liam Johnson', position: 'Software Engineer', company: 'Amazon',
    avatar: 'LJ', rating: 5, verified: true,
    textPL: 'Wynik ATS skoczył do 95% — rekruterzy zaczęli odpowiadać.',
    textEN: 'My ATS score jumped to 95% — recruiters started replying.'
  },
  {
    name: 'Sophia Martinez', position: 'Data Analyst', company: 'Siemens',
    avatar: 'SM', rating: 5, verified: true,
    textPL: 'Celne, konkretne wskazówki — CV wreszcie jest czytelne.',
    textEN: 'Clear, targeted suggestions — my CV finally reads well.'
  },
  {
    name: 'Noah Müller', position: 'Backend Developer', company: 'SAP',
    avatar: 'NM', rating: 5, verified: true,
    textPL: 'Moje CV w końcu przechodzi filtry ATS. Super narzędzie.',
    textEN: 'My CV finally passes ATS filters. Great tool.'
  },
  {
    name: 'Emma Williams', position: 'Marketing Lead', company: 'HSBC',
    avatar: 'EW', rating: 5, verified: true,
    textPL: 'Szybko, profesjonalnie, skutecznie — idealnie.',
    textEN: 'Fast, professional, effective — perfect.'
  },
  {
    name: 'Ethan Brown', position: 'DevOps Engineer', company: 'Microsoft',
    avatar: 'EB', rating: 5, verified: true,
    textPL: 'Świetne dopasowanie słów kluczowych i struktury.',
    textEN: 'Great keyword matching and structure.'
  },
  {
    name: 'Chloé Dubois', position: 'UX Researcher', company: "L'Oréal",
    avatar: 'CD', rating: 5, verified: true,
    textPL: 'Dostosowane CV dało więcej odpowiedzi od firm.',
    textEN: 'Tailored CV got me more callbacks.'
  }
];

// W PL: 5 pierwszych po polsku, kolejne 7 po angielsku; w EN: wszystkie po angielsku
const testimonials = testimonialsBase.slice(0, 12).map((t, idx) => ({
  ...t,
  text: currentLanguage === 'pl' ? (idx < 5 ? t.textPL : t.textEN) : t.textEN
}));

  // Floating notifications
  
  
  useEffect(() => {
const floatingNotifications = currentLanguage === 'pl'
  ? [
      { id: 1, name: 'Anna',    action: 'otrzymała ofertę pracy w Allegro',        time: '2 min temu' },
      { id: 2, name: 'Michał',  action: 'zoptymalizował CV i dostał 3 rozmowy',    time: '5 min temu' },
      { id: 3, name: 'Katarzyna', action: 'zwiększyła ATS score o 40%',            time: '8 min temu' },
      { id: 4, name: 'Piotr',   action: 'otrzymał ofertę w CD Projekt',            time: '12 min temu' },
      { id: 5, name: 'Magdalena', action: 'przeszła przez filtry ATS w Orange',    time: '15 min temu' }
    ]
  : [
      { id: 1, name: 'Anna',    action: 'received a job offer at Allegro',         time: '2 min ago' },
      { id: 2, name: 'Michael', action: 'optimized his CV and got 3 interviews',   time: '5 min ago' },
      { id: 3, name: 'Kate',    action: 'increased ATS score by 40%',              time: '8 min ago' },
      { id: 4, name: 'Peter',   action: 'received an offer at CD Projekt',         time: '12 min ago' },
      { id: 5, name: 'Maggie',  action: 'passed ATS filters at Orange',            time: '15 min ago' }
    ];

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
  <title>
    {currentLanguage === 'pl'
      ? 'CvPerfect - #1 AI Optymalizacja CV w Polsce | ATS-Ready w 30 sekund'
      : 'CvPerfect - #1 AI CV Platform in Poland | ATS-Ready in 30 seconds'}
  </title>

  <meta
    name="description"
    content={
      currentLanguage === 'pl'
        ? 'Pierwsza AI platforma do optymalizacji CV w Polsce. 95% ATS success rate, 410% więcej rozmów kwalifikacyjnych. Zoptymalizuj CV w 30 sekund za 19,99 zł.'
        : 'The first AI platform in Poland for CV optimization. 95% ATS success rate, 410% more interviews. Optimize your CV in 30 seconds for ≈ €4.40.'
    }
  />

  <meta
    name="keywords"
    content={
      currentLanguage === 'pl'
        ? 'optymalizacja CV, ATS, sztuczna inteligencja, CV AI, praca, rekrutacja, Polska'
        : 'CV optimization, ATS, artificial intelligence, CV AI, jobs, recruitment, Poland'
    }
  />

  <meta
    property="og:title"
    content={
      currentLanguage === 'pl'
        ? 'CvPerfect - #1 AI Optymalizacja CV w Polsce'
        : 'CvPerfect - #1 AI CV Platform in Poland'
    }
  />
  <meta
    property="og:description"
    content={
      currentLanguage === 'pl'
        ? '95% ATS success rate, 410% więcej rozmów kwalifikacyjnych. Zoptymalizuj CV w 30 sekund.'
        : '95% ATS success rate, 410% more interviews. Optimize your CV in 30 seconds.'
    }
  />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/favicon.ico" />
</Head>

<Script
  src="https://js.stripe.com/v3/"
  strategy="beforeInteractive"
  onLoad={() => console.log('✅ Stripe.js loaded via next/script')}
/>

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
      <div className="floating-notifications" style={{ top: '176px' }}>
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
  <header role="banner">
    {/* Navigation and header content will be added here if needed */}
  </header>
  
  <main role="main" className="container" style={{ paddingTop: '76px' }}>
    {/* Particles Background */}
    <div className="particles-container" id="particles"></div>  
  
{/* Scroll Indicator (fixed, cały czas widoczny) */}
<div
  className="scroll-indicator"
  style={{
    position: 'fixed',
    top: '16px',        // przerwa od górnej krawędzi
    left: 0,
    right: 0,
    zIndex: 900,        // poniżej nav jeżeli nav ma 1000
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none'
  }}
  aria-label={currentLanguage === 'pl' ? 'Nawigacja sekcji' : 'Section navigation'}
>
  <div className="scroll-progress" aria-hidden="true"></div>
  <div
    className="scroll-sections"
    role="tablist"
    style={{
      display: 'flex',
      gap: '10px',
      padding: '8px 14px',
      borderRadius: '9999px',
      background: 'rgba(12,14,22,0.75)',
      boxShadow: '0 4px 18px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)',
      backdropFilter: 'saturate(1.1) blur(6px)',
      pointerEvents: 'auto'
    }}
  >
    {[
      { id: 'hero', pl: 'Start', en: 'Start' },
      { id: 'capabilities', pl: 'Możliwości', en: 'Capabilities' },      
      { id: 'stats', pl: 'Statystyki', en: 'Stats' },
      { id: 'timeline', pl: 'Jak to działa', en: 'How it works' },
      { id: 'testimonials', pl: 'Opinie', en: 'Reviews' },
      { id: 'faq', pl: 'FAQ', en: 'FAQ' },
    ].map((s, idx) => (
      <button
        key={s.id}
        type="button"
        className={`scroll-dot${idx===0 ? ' active' : ''}`}
        data-section={s.id}
        aria-label={`${idx+1}/6 ${currentLanguage==='pl' ? s.pl : s.en}`}
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById(s.id);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
style={{
  width: '24px', // większa kropka
  height: '24px',
  borderRadius: '9999px',
  border: 'none',
  background: 'radial-gradient(circle, #3b005e 0%, #000000 100%)',
  opacity: 1,
  cursor: 'pointer',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.15) inset'
}}
      />
    ))}
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
<button className="nav-cta" onClick={handleOptimizeNow} data-testid="main-cta">
    {currentLanguage === 'pl' ? '🎯 Zoptymalizuj CV teraz ⚡' : '🎯 Optimize CV now ⚡'}
  </button>

</div>
</div>
<div className="mobile-menu-btn" onClick={toggleMobileMenu} id="mobileMenuBtn">
  <span></span>
  <span></span>
  <span></span>

          </div>
        </nav>

        {/* Hero Section */}
        <div className="hero-section" id="hero">
          <div className="hero-content">
           <div className="hero-badge">
  {currentLanguage==='pl'
    ? '🏆 #1 w Polsce • AI do CV'
    : '🏆 #1 in Poland • AI for CVs'}
</div>

<p className="hero-subtitle">
  {currentLanguage==='pl'
    ? <>Zaufany w Polsce i całej Europie. <strong>95% skuteczności ATS</strong> i do <strong>410% więcej rozmów</strong>. Już od <strong>19,99 zł</strong> <span className="muted">(≈ €4.40)</span>.</>
    : <>Trusted across Europe. <strong>95% ATS pass rate</strong> and up to <strong>410% more interviews</strong>. From <strong>≈ €4.40</strong>.</>}
</p>
<h1 className="hero-title">
  {currentLanguage === 'pl' ? 'Zwiększ swoje szanse dzięki AI CV ' : 'Boost your chances with AI CV '}
  <br />
  <span className="typing-block">
    <span className="typing-safe-zone">
      <span className="typing-text">{typingText}</span>
      <span className="typing-cursor">|</span>
    </span>
  </span>
</h1>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">410%</div>
                <div className="stat-text">{currentLanguage === 'pl' ? 'więcej rozmów' : 'more interviews'}</div>

              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-text">ATS success</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">30s</div>
                <div className="stat-text">{currentLanguage === 'pl' ? 'optymalizacja' : 'optimization'}</div>

              </div>
            </div>

            <div className="hero-cta">
             
<button className="hero-button primary" onClick={handleOptimizeNow}>
  {currentLanguage === 'pl' ? '🔍 Sprawdź swoje CV' : '🔍 Check your CV'}
</button>

<div className="hero-guarantee">
  <span>{currentLanguage === 'pl' ? '✅ Bez rejestracji' : '✅ No registration'}</span>
</div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="cv-preview">
              <div className="cv-before">
                <div className="cv-header">{currentLanguage==='pl' ? '❌ Przed optymalizacją' : '❌ Before optimization'}
</div>
                <div className="cv-score bad">32% ATS</div>
                <div className="cv-content">
                  <div className="cv-line short"></div>
                  <div className="cv-line medium"></div>
                  <div className="cv-line long"></div>
                  <div className="cv-problems">
                    <span>{currentLanguage==='pl' ? '• Brak słów kluczowych' : '• Missing keywords'}
</span>
                    <span>{currentLanguage==='pl' ? '• Złe formatowanie' : '• Poor formatting'}
</span>
                    <span>{currentLanguage==='pl' ? '• Nieoptymalne sekcje' : '• Suboptimal sections'}
</span>
                  </div>
                </div>
              </div>
              <div className="cv-arrow">➜</div>
              <div className="cv-after">
                <div className="cv-header">{currentLanguage==='pl' ? '✅ Po optymalizacji AI' : '✅ After AI optimization'}
</div>
                <div className="cv-score good">95% ATS</div>
                <div className="cv-content">
                  <div className="cv-line optimized short"></div>
                  <div className="cv-line optimized medium"></div>
                  <div className="cv-line optimized long"></div>
                  <div className="cv-improvements">
                    <span>{currentLanguage==='pl' ? '• Słowa kluczowe ✅' : '• Keywords ✅'}
</span>
                    <span>{currentLanguage==='pl' ? '• Format zgodny z ATS ✅' : '• ATS-ready format ✅'}
</span>
                    <span>{currentLanguage==='pl' ? '• Optymalne sekcje ✅' : '• Optimized sections ✅'}
</span>
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
    <span className="badge-text">{currentLanguage==='pl' ? 'Wykrywanie wspierane przez AI' : 'AI-Powered Detection'}</span>
  </div>
<h3>{currentLanguage==='pl' ? 'Wspieramy wszystkie formaty dokumentów' : 'We support all document formats'}</h3>
<p>
  {currentLanguage==='pl'
    ? <>Wystarczy wkleić – nasz AI automatycznie rozpozna czy to CV czy list motywacyjny<br />i zastosuje odpowiednią optymalizację</>
    : <>Just paste – our AI detects whether it’s a CV or a cover letter<br />and applies the right optimization</>}
</p>
</div>
    <div className="capabilities-grid">
      <div className="capability-card">
        <div className="cap-icon">📄</div>
<h4>{currentLanguage==='pl' ? 'CV + Oferta pracy' : 'CV + Job posting'}</h4>
<p>{currentLanguage==='pl' ? 'Zoptymalizujemy CV pod konkretną ofertę' : 'We tailor your CV to the job'}</p>
<div className="cap-result">{currentLanguage==='pl' ? '→ Dopasowane CV' : '→ Tailored CV'}</div>

      </div>
      <div className="capability-card">
        <div className="cap-icon">✉️</div>
<h4>{currentLanguage==='pl' ? 'List motywacyjny + Oferta' : 'Cover letter + Job posting'}</h4>
<p>{currentLanguage==='pl' ? 'Dostosujemy list pod wymagania pracodawcy' : 'We adapt your cover letter to the employer'}</p>
<div className="cap-result">{currentLanguage==='pl' ? '→ Dopasowany list' : '→ Tailored letter'}</div>
      </div>
      <div className="capability-card">
        <div className="cap-icon">📋</div>
<h4>{currentLanguage==='pl' ? 'Samo CV' : 'CV only'}</h4>
<p>{currentLanguage==='pl' ? 'Stworzymy uniwersalne CV gotowe do użycia' : 'We create a universal, ready‑to‑use CV'}</p>
<div className="cap-result">{currentLanguage==='pl' ? '→ Ogólne CV' : '→ General CV'}</div>
      </div>
      <div className="capability-card">
        <div className="cap-icon">📝</div>
<h4>{currentLanguage==='pl' ? 'Sam list motywacyjny' : 'Cover letter only'}</h4>
<p>{currentLanguage==='pl' ? 'Przygotujemy szablon do dalszej edycji' : 'We provide an editable template'}</p>
<div className="cap-result">{currentLanguage==='pl' ? '→ Szablon listu' : '→ Letter template'}</div>
      </div>
    </div>
    <div className="capabilities-note">
      <span className="note-icon">🤖</span>
<span>
  {currentLanguage==='pl'
    ? 'System automatycznie wykryje czy to CV czy list motywacyjny i zastosuje odpowiednią optymalizację!'
    : 'The system automatically detects whether it’s a CV or a cover letter and applies the right optimization!'}
</span>
    </div>
  </div>
</div>

{/* Stats Counter Section */}
<div className="stats-counter-section" id="stats">
  <div className="stats-container">
    <div className="stats-header">
      <div className="stats-badge">{currentLanguage==='pl' ? '📊 Statystyki na żywo' : '📊 Live statistics'}</div>
      <h2>{currentLanguage==='pl' ? 'CvPerfect w liczbach' : 'CvPerfect in numbers'}
</h2>
      <p>{currentLanguage==='pl' ? 'Dołącz do tysięcy zadowolonych użytkowników' : 'Join thousands of happy users'}
</p>
    </div>
    
    <div className="stats-grid">
      <div className="stat-box">
        <div className="stat-icon">📄</div>
        <div className="stat-value"><span data-stat="cv" suppressHydrationWarning>—</span></div>

        <div className="stat-label">{currentLanguage==='pl' ? 'CV zoptymalizowanych' : 'CV optimized'}</div>
        <div className="stat-growth">+3 {currentLanguage==='pl' ? 'dziś' : 'today'}</div>
      </div>
      
      <div className="stat-box">
        <div className="stat-icon">🎯</div>
<div className="stat-value"><span data-stat="ats" suppressHydrationWarning>95%</span></div>

        <div className="stat-label">{currentLanguage==='pl' ? 'Skuteczność ATS' : 'ATS success rate'}</div>
        <div className="stat-growth">{currentLanguage==='pl' ? 'Top 1 w PL' : 'Top 1 in PL'}</div>
      </div>
      
      <div className="stat-box">
<div className="stat-icon">⚡</div>
<div className="stat-value">3.2</div>
<div className="stat-suffix">s</div>
        <div className="stat-label">{currentLanguage==='pl' ? 'Czas analizy' : 'Analysis time'}</div>
        <div className="stat-growth">{currentLanguage==='pl' ? 'Błyskawicznie' : 'Lightning fast'}</div>
      </div>
      
      <div className="stat-box">
        <div className="stat-icon">💼</div>
        <div className="stat-value"><span data-stat="jobs" suppressHydrationWarning>—</span></div>

        <div className="stat-label">{currentLanguage==='pl' ? 'Nowych miejsc pracy' : 'New jobs'}</div>
        <div className="stat-growth">+12 {currentLanguage==='pl' ? 'dziś' : 'today'}</div>
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
        <span className="badge-text">{currentLanguage==='pl' ? 'Proces 30 sekund' : '30-second process'}
</span>
      </div>
      <h2>{currentLanguage==='pl' ? 'Jak zoptymalizować CV w ' : 'How to optimize your CV in '}<span className="gradient-text">30 {currentLanguage==='pl' ? 'sekund' : 'seconds'}</span>?
</h2>
      <p>{currentLanguage==='pl' ? 'Przewodnik krok po kroku – zobacz jak łatwo to zrobić' : 'Step-by-step guide – see how easy it is'}
</p>
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
            <div className="step-label">{currentLanguage==='pl' ? 'KROK 1' : 'STEP 1'}</div>
            <h3>{currentLanguage==='pl' ? 'Wklej lub załaduj CV' : 'Paste or upload your CV'}</h3>
            <p>{currentLanguage==='pl' ? 'Skopiuj treść CV lub przeciągnij plik PDF/DOC' : 'Paste CV text or drag & drop PDF/DOC'}</p>
            <div className="step-details">
              <span className="detail-item">✅ PDF, DOC, DOCX</span>
              <span className="detail-item">{currentLanguage==='pl' ? '✅ Lub wklej tekst' : '✅ Or paste text'}</span>
              <span className="detail-item">✅ Max 5MB</span>
            </div>
            <div className="step-time">
              <span className="time-icon">⏱️</span>
              <span>{currentLanguage==='pl' ? '5 sekund' : '5 seconds'}</span>
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
            <div className="step-label">{currentLanguage==='pl' ? 'KROK 2' : 'STEP 2'}</div>
            <h3>{currentLanguage==='pl' ? 'AI analizuje i optymalizuje' : 'AI analyzes and optimizes'}</h3>
            <p>{currentLanguage==='pl' ? 'GPT-5 skanuje CV pod kątem ATS i słów kluczowych' : 'GPT-5 scans your CV for ATS and keywords'}</p>
            <div className="step-details">
              <span className="detail-item">{currentLanguage==='pl' ? '🔍 Analiza ATS' : '🔍 ATS analysis'}</span>
              <span className="detail-item">{currentLanguage==='pl' ? '🎯 Słowa kluczowe' : '🎯 Keywords'}</span>
              <span className="detail-item">{currentLanguage==='pl' ? '📊 Obliczanie wyniku' : '📊 Score calculation'}</span>
            </div>
            <div className="step-time">
              <span className="time-icon">⏱️</span>
              <span>{currentLanguage==='pl' ? '15 sekund' : '15 seconds'}</span>
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
            <div className="step-label">{currentLanguage==='pl' ? 'KROK 3' : 'STEP 3'}</div>
            <h3>{currentLanguage==='pl' ? 'Szybka płatność' : 'Quick payment'}</h3>
            <p>{currentLanguage==='pl' ? 'Bezpieczna transakcja przez Stripe' : 'Secure payment via Stripe'}</p>
            <div className="step-details">
              <span className="detail-item">🔒 SSL Secure</span>
              <span className="detail-item">
  {currentLanguage === 'pl' ? '💰 Tylko 19,99 zł' : '💰 Only ≈ €4.40'}
</span>

              <span className="detail-item">⚡ Instant</span>
            </div>
<div className="time">
  <span className="time-icon">⏱️</span>
  <span>{currentLanguage==='pl' ? '5 sekund' : '5 seconds'}</span>
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
            <div className="step-label">{currentLanguage==='pl' ? 'FINAŁ' : 'FINAL'}</div>
            <h3>{currentLanguage==='pl' ? 'Pobierz zoptymalizowane CV!' : 'Download your optimized CV!'}</h3>
            <p>
  {currentLanguage==='pl'
    ? 'Twoje CV jest gotowe z wynikiem ATS 95%'
    : 'Your CV is ready with a 95% ATS score'}
</p>


            <div className="step-details">
              <span className="detail-item">📈 95% ATS</span>
              <span className="detail-item">✨ PDF & DOCX</span>
              <span className="detail-item">{currentLanguage==='pl' ? '🚀 Gotowe!' : '🚀 Done!'}</span>
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
      <button className="timeline-button premium-button" onClick={handleOptimizeNow}>
        <span className="button-text">{currentLanguage === 'pl' ? 'Rozpocznij teraz' : 'Start now'}</span>
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
          <span className="stat-text">{currentLanguage === 'pl' ? '19,99 zł' : '≈ €4.40'}</span>
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
<h2 className="section-title">
  {currentLanguage==='pl' ? 'Już 15,000+ osób znalazło pracę dzięki CvPerfect 🎉' : '15,000+ people found a job with CvPerfect 🎉'}
</h2>
<p className="section-subtitle">
  {currentLanguage==='pl' ? 'Prawdziwe opinie od użytkowników, którzy dostali wymarzoną pracę' : 'Real reviews from users who got their dream job'}
</p>
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
                    {testimonial.verified && <span className="verified-badge">
  {currentLanguage==='pl' ? '✅ Zweryfikowane' : '✅ Verified'}
</span>
}
                  </div>
                </div>
                <div className="testimonial-rating">
                 {[...Array(testimonial.rating)].map((_, i) => (
  <span key={`star-${i}`} className="star">⭐</span>
))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-impact">
                  <span className="impact-badge">
  {currentLanguage==='pl' ? '🚀 Sukces dzięki CvPerfect' : '🚀 Success with CvPerfect'}
</span>

                </div>
              </div>
            ))}
          </div>

          <div className="testimonials-cta">
<h3>{currentLanguage==='pl' ? 'Dołącz do 15,000+ zadowolonych użytkowników!' : 'Join 15,000+ happy users!'}</h3>
<button className="testimonials-button" onClick={handleOptimizeNow}>
  {currentLanguage==='pl' ? 'Zwiększ swoje szanse 🚀' : 'Boost your chances 🚀'}
</button>
          </div>
        </div>


{/* NOWY MODAL - 2 KROKI */}
{showMainModal && (
  <div className="modal-overlay" onClick={closeModal} style={{zIndex: 999999}}>
    <div className="modal-content optimize-modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={closeModal}>×</button>
      
      <div className="modal-header">
        <h2>
          {modalStep === 1 
            ? (currentLanguage === 'pl' ? '📝 Wprowadź dane' : '📝 Enter your data')
            : (currentLanguage === 'pl' ? '💳 Wybierz plan' : '💳 Choose plan')
          }
        </h2>
        <p>
          {modalStep === 1 
            ? (currentLanguage === 'pl' ? 'Krok 1 z 2' : 'Step 1 of 2')
            : (currentLanguage === 'pl' ? 'Krok 2 z 2' : 'Step 2 of 2')
          }
        </p>
        
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{
                width: modalStep === 1 ? '50%' : '100%',
                transition: 'width 0.3s ease'
              }}
            ></div>
          </div>
          <div className="progress-steps">
            <div className={`progress-step ${modalStep >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <label>{currentLanguage === 'pl' ? 'Dane' : 'Data'}</label>
            </div>
            <div className={`progress-step ${modalStep >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <label>{currentLanguage === 'pl' ? 'Plan' : 'Plan'}</label>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-body">
        {modalStep === 1 ? (
          <div className="step-form">
            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="customerEmail" className="form-label">
                {currentLanguage === 'pl' ? 'Email *' : 'Email *'}
              </label>
              <input
                type="email"
                id="customerEmail"
                className={`email-input ${errors.email ? 'error' : ''}`}
                placeholder={currentLanguage === 'pl' ? 'twoj@email.pl' : 'your@email.com'}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

{/* CV FILE UPLOAD */}
<div className="form-group">
  <label className="form-label">
    {currentLanguage === 'pl' ? 'Twoje CV *' : 'Your CV *'}
  </label>
  
  {!formData.cvFile ? (
    <div 
      className={`file-upload-zone ${dragActive ? 'drag-active' : ''} ${errors.cvFile ? 'error' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('cv-file-input').click()}
    >
      <input
        id="cv-file-input"
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />


      
      <div className="upload-icon">📁</div>
      <div className="upload-text">
        <div className="upload-primary">
          {currentLanguage === 'pl' 
            ? 'Przeciągnij plik CV tutaj' 
            : 'Drag CV file here'}
        </div>
        <div className="upload-secondary">
          {currentLanguage === 'pl' 
            ? 'lub kliknij aby wybrać plik' 
            : 'or click to select file'}
        </div>
      </div>
      <div className="upload-formats">
        {currentLanguage === 'pl' 
          ? 'Obsługiwane formaty: PDF, DOC, DOCX (max 5MB)' 
          : 'Supported formats: PDF, DOC, DOCX (max 5MB)'}
      </div>
    </div>
  ) : (
    <div className="file-uploaded">
      <div className="file-info">
        <div className="file-icon">
          {formData.cvFileName.endsWith('.pdf') ? '📄' : '📝'}
        </div>
        <div className="file-details">
          <div className="file-name">{formData.cvFileName}</div>
          <div className="file-status">
            {uploadProgress < 100 ? (
              <div className="upload-progress-container">
                <div className="upload-progress-bar">
                  <div 
                    className="upload-progress-fill" 
                    style={{width: `${uploadProgress}%`}}
                  ></div>
                </div>
                <span>{uploadProgress}%</span>
              </div>
            ) : (
              <span className="upload-success">
                ✅ {currentLanguage === 'pl' ? 'Załadowano' : 'Uploaded'}
              </span>
            )}
          </div>
        </div>
        <button 
          type="button" 
          className="remove-file-btn"
          onClick={removeFile}
          title={currentLanguage === 'pl' ? 'Usuń plik' : 'Remove file'}
        >
          ❌
        </button>
      </div>
    </div>
  )}
  
  {errors.cvFile && <div className="error-message">{errors.cvFile}</div>}
</div>

{/* CV Content Input */}
<div className="form-group">
  <label className="form-label">
    {currentLanguage === 'pl' ? 'Wklej treść CV' : 'Paste CV content'}
  </label>
  <textarea
    className="cv-textarea"
    placeholder={currentLanguage === 'pl' 
      ? 'Wklej tutaj treść swojego CV...' 
      : 'Paste your CV content here...'}
    value={formData.cvText || ''}
    onChange={(e) => {
      handleInputChange('cvText', e.target.value);
      setSavedCV(e.target.value);
    }}
    rows={6}
  />
</div>

            {/* JOB POSTING (opcjonalne) */}
            <div className="form-group">
              <label htmlFor="jobPosting" className="form-label">
                {currentLanguage === 'pl' ? 'Oferta pracy (opcjonalne)' : 'Job posting (optional)'}
              </label>
              <textarea
                id="jobPosting"
                className="job-textarea"
                placeholder={currentLanguage === 'pl' 
                  ? 'Wklej ogłoszenie o pracę (opcjonalne)...' 
                  : 'Paste job posting (optional)...'}
                value={formData.jobText}
                onChange={(e) => handleInputChange('jobText', e.target.value)}
                rows={4}
              />
            </div>

            {/* CHECKBOX REGULAMIN */}
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                />
                <label htmlFor="acceptTerms">
                  {currentLanguage === 'pl' 
                    ? 'Akceptuję regulamin i politykę prywatności *' 
                    : 'I accept terms and privacy policy *'}
                </label>
              </div>
              {errors.acceptTerms && <div className="error-message">{errors.acceptTerms}</div>}
            </div>

            <button className="next-button" onClick={handleNextStep}>
              {currentLanguage === 'pl' ? 'Przejdź do płatności →' : 'Go to payment →'}
            </button>
          </div>
        ) : (
          <div className="step-pricing">
            <button className="back-button" onClick={handlePrevStep}>
              ← {currentLanguage === 'pl' ? 'Wróć' : 'Back'}
            </button>
            
            <div className="pricing-grid-compact">
              {/* BASIC */}
              <div className="plan-card-compact">
                <div className="plan-name">Basic</div>
                <div className="plan-price">19,99 zł</div>
                <ul className="plan-features-compact">
                  <li>✅ 1 optymalizacja CV</li>
                  <li>✅ 1 szablon</li>
                  <li>✅ Format PDF</li>
                  <li>✅ Jednorazowa płatność</li>
                </ul>
                <button 
                  className="select-plan-button" 
                  onClick={() => handlePlanSelect('basic')}
                  data-plan="basic"
                  data-price="19.99"
                  data-testid="plan-basic"
                >
                  Wybierz Basic
                </button>
              </div>

              {/* GOLD */}
              <div className="plan-card-compact gold">
                <div className="popular-badge">POPULARNY</div>
                <div className="plan-name">Gold</div>
                <div className="plan-price">49 zł/mies</div>
                <ul className="plan-features-compact">
                  <li>✅ 10 optymalizacji/miesiąc</li>
                  <li>✅ 3 szablony</li>
                  <li>✅ List motywacyjny</li>
                  <li>✅ PDF + DOCX</li>
                </ul>
                <button 
                  className="select-plan-button gold" 
                  onClick={() => handlePlanSelect('gold')}
                  data-plan="gold"
                  data-price="49"
                  data-testid="plan-gold"
                >
                  Wybierz Gold
                </button>
              </div>

              {/* PREMIUM */}
              <div className="plan-card-compact premium">
                <div className="plan-name">Premium</div>
                <div className="plan-price">79 zł/mies</div>
                <ul className="plan-features-compact">
                  <li>✅ 25 optymalizacji/miesiąc</li>
                  <li>✅ 7 szablonów</li>
                  <li>✅ LinkedIn profil</li>
                  <li>✅ Anuluj w każdej chwili</li>
                </ul>
                <button 
                  className="select-plan-button premium" 
                  onClick={() => handlePlanSelect('premium')}
                  data-plan="premium"
                  data-price="79"
                  data-testid="plan-premium"
                >
                  Wybierz Premium
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* Template Selection Modal */}
{showTemplateModal && (
  <div className="modal-overlay" onClick={() => setShowTemplateModal(false)} style={{zIndex: 999999}}>
    <div className="modal-content template-modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setShowTemplateModal(false)}>×</button>
      
      <div className="template-header">
        <h2>{currentLanguage === 'pl' ? '🎨 Wybierz szablon' : '🎨 Choose template'}</h2>
        <p>{currentLanguage === 'pl' ? 'Wybierz profesjonalny szablon dla swojego CV' : 'Choose a professional template for your CV'}</p>
      </div>

      <div className="modal-body">
        <div className="templates-grid">
          {/* Simple Template - Always available */}
          <div className="template-card" onClick={() => handleTemplateSelect('simple')}>
            <div className="template-icon">📄</div>
            <h3>{currentLanguage === 'pl' ? 'Klasyczny' : 'Classic'}</h3>
            <p>{currentLanguage === 'pl' ? 'Prosty i elegancki' : 'Simple and elegant'}</p>
          </div>

          {/* Modern Template */}
          <div className="template-card" onClick={() => handleTemplateSelect('modern')}>
            <div className="template-icon">💼</div>
            <h3>{currentLanguage === 'pl' ? 'Nowoczesny' : 'Modern'}</h3>
            <p>{currentLanguage === 'pl' ? 'Współczesny design' : 'Contemporary design'}</p>
          </div>

          {/* Executive Template */}
          <div className="template-card" onClick={() => handleTemplateSelect('executive')}>
            <div className="template-icon">👔</div>
            <h3>{currentLanguage === 'pl' ? 'Kierowniczy' : 'Executive'}</h3>
            <p>{currentLanguage === 'pl' ? 'Dla menedżerów' : 'For managers'}</p>
          </div>

          {/* Creative Template */}
          <div className="template-card" onClick={() => handleTemplateSelect('creative')}>
            <div className="template-icon">🎨</div>
            <h3>{currentLanguage === 'pl' ? 'Kreatywny' : 'Creative'}</h3>
            <p>{currentLanguage === 'pl' ? 'Dla branż kreatywnych' : 'For creative industries'}</p>
          </div>

          {/* Premium Templates (only for premium plan) */}
          {sessionStorage.getItem('pendingPlan') === 'premium' && (
            <>
              <div className="template-card premium" onClick={() => handleTemplateSelect('tech')}>
                <div className="template-badge">PREMIUM</div>
                <div className="template-icon">💻</div>
                <h3>{currentLanguage === 'pl' ? 'Tech' : 'Tech'}</h3>
                <p>{currentLanguage === 'pl' ? 'Dla IT i technologii' : 'For IT and tech'}</p>
              </div>

              <div className="template-card premium" onClick={() => handleTemplateSelect('luxury')}>
                <div className="template-badge">PREMIUM</div>
                <div className="template-icon">💎</div>
                <h3>{currentLanguage === 'pl' ? 'Luksusowy' : 'Luxury'}</h3>
                <p>{currentLanguage === 'pl' ? 'Ekskluzywny design' : 'Exclusive design'}</p>
              </div>

              <div className="template-card premium" onClick={() => handleTemplateSelect('minimal')}>
                <div className="template-badge">PREMIUM</div>
                <div className="template-icon">⚪</div>
                <h3>{currentLanguage === 'pl' ? 'Minimalistyczny' : 'Minimal'}</h3>
                <p>{currentLanguage === 'pl' ? 'Czysty i prosty' : 'Clean and simple'}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
)}

        {/* FAQ Section */}
        <div className="faq-section" id="faq">
          <div className="faq-container">
            <div className="faq-header">
<h2 className="section-title">❓ {currentLanguage==='pl' ? 'Często zadawane pytania' : 'Frequently Asked Questions'}</h2>
<p className="section-subtitle">
  {currentLanguage==='pl'
    ? 'Masz pytania? Sprawdź odpowiedzi na najczęstsze wątpliwości'
    : 'Got questions? Check answers to the most common ones'}
</p>
            </div>
            <div className="faq-grid">
              <div className="faq-item">
                <div className="faq-question">
                  <span className="faq-icon">💰</span>
                  <h3>
  {currentLanguage === 'pl' 
  ? 'Czy naprawdę kosztuje tylko 19,99 zł?' 
  : 'Does it really cost only ≈ €4.40?'}
</h3>
                </div>
                <div className="faq-answer">
                 <p>
  {currentLanguage === 'pl' 
    ? 'Tak! Plan Basic to jednorazowa płatność 19,99 zł za 1 optymalizację CV. Bez ukrytych kosztów, bez subskrypcji.' 
    : 'Yes! The Basic plan is a one‑time payment of ≈ €4.40 for 1 CV optimization. No hidden fees, no subscription.'}
</p>
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
<button className="faq-button" onClick={handleOptimizeNow}>
  Wypróbuj za darmo ⚡
</button>
            </div>
          </div>
        </div>
        <Footer currentLanguage={currentLanguage} />
      </main>




      <style jsx>{`


/* === FILE UPLOAD STYLES === */
.file-upload-zone {
  border: 2px dashed rgba(120, 80, 255, 0.3);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(120, 80, 255, 0.02);
  position: relative;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.file-upload-zone:hover {
  border-color: rgba(120, 80, 255, 0.6);
  background: rgba(120, 80, 255, 0.05);
  transform: translateY(-2px);
}

.file-upload-zone.drag-active {
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.05);
  transform: scale(1.02);
}

.file-upload-zone.error {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.05);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.upload-text {
  margin-bottom: 12px;
}

.upload-primary {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.upload-secondary {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.upload-formats {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
}

/* Uploaded file display */
.file-uploaded {
  border: 2px solid rgba(0, 255, 136, 0.3);
  border-radius: 16px;
  padding: 20px;
  background: rgba(0, 255, 136, 0.05);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.file-status {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.upload-progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.upload-progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.upload-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff88, #00cc70);
  transition: width 0.3s ease;
}

.upload-success {
  color: #00ff88;
  font-weight: 600;
}

.remove-file-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.remove-file-btn:hover {
  opacity: 1;
  background: rgba(255, 107, 107, 0.1);
  transform: scale(1.1);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .file-upload-zone {
    padding: 30px 15px;
    min-height: 140px;
  }
  
  .upload-icon {
    font-size: 36px;
  }
  
  .upload-primary {
    font-size: 16px;
  }
  
  .file-info {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .remove-file-btn {
    align-self: center;
  }
}

/* === HERO STATS (stabilnie / jednolicie) === */
.hero-stats{ 
  display:flex; gap:24px; flex-wrap:wrap; 
  margin-top: 12px;
}
.hero-stats .stat-item{ 
  flex:1 1 200px; min-width: 200px; 
  text-align:center; 
  padding:14px 18px; 
}
.stat-number{ white-space: nowrap; }

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

/* CV preview – wyrównaj plakietki ze score */
.cv-score{
  display:inline-block;
  min-width:6ch;           /* równe dla '32% ATS' i '95% ATS' */
  text-align:center;
  white-space:nowrap;
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

.container > *:not(.scroll-indicator) {
  position: relative;
  z-index: 1;
}




/* For Firefox */
html {
  scrollbar-width: auto;
  scrollbar-color: #667eea #f1f5f9;
}
  
/* Enhanced Floating Notifications */
.floating-notifications{
  position: fixed;
  top: 96px;               /* NAD top-barem */
  right: 20px;
  z-index: 2147483646;    /* wyżej niż navbar i wskaźniki */
  pointer-events: none;
  max-width: 380px;
}
.floating-notification{ pointer-events: auto; }

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
  
  .lang-btn {
    padding: 12px 20px !important;
    min-height: 44px !important;
    min-width: 60px !important;
    font-size: 15px !important;
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
.hero-section{
  background: transparent;
  color: white;
  padding: 64px 40px 40px;
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
  margin-top: 12px;
}

.hero-subtitle strong{
  background: linear-gradient(135deg, #667eea, #764ba2); /* blue-violet */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
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
  justify-content: center;
  gap: 20px;
  perspective: 1200px;
  animation: fadeInUp 0.8s ease 0.5s both;
  transform-style: preserve-3d;
  max-width: 100%;
  overflow: visible;
  flex-wrap: wrap;
}

.cv-before, .cv-after {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 24px;
  width: 280px;
  max-width: calc(50vw - 30px);
  color: white;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;
  flex-shrink: 1;
}

.cv-before:hover, .cv-after:hover {
  transform: rotateY(-8deg) rotateX(4deg) translateZ(40px);
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.4);
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

.timeline-progress-track  {
  position: absolute;
  left: 0px;
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

.step-icon{
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  z-index: 2;
  filter: drop-shadow(0 10px 20px rgba(0, 255, 136, 0.3));
  --icon-shift-x: 0px;           /* ← to robi optyczny “krok w prawo” */
  animation: iconBounce 3s ease infinite;
}


@keyframes iconBounce {
  0%, 100% { transform: translateX(var(--icon-shift-x, 3px)) translateY(0); }
  50%      { transform: translateX(var(--icon-shift-x, 3px)) translateY(-10px); }
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
  
@media (max-width: 768px) {
  .step-icon {
    animation: none;
    position: relative;
    left: 3px; /* lekkie dosunięcie w prawo na mobile */
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

.timeline-step[data-step="2"] .step-icon { animation-delay: 1s; }
.timeline-step[data-step="3"] .step-icon { animation-delay: 2s; }
.timeline-step[data-step="4"] .step-icon { animation-delay: 3s; }

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

/* NOWY KOD */
.default-option {
  background: linear-gradient(135deg,
    rgba(0, 255, 136, 0.05),
    rgba(120, 80, 255, 0.03)
  );
  border: 2px solid rgba(0, 255, 136, 0.2);
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.default-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(0, 255, 136, 0.8), 
    transparent
  );
  animation: optionScan 3s ease infinite;
}

@keyframes optionScan {
  0% { left: -100%; }
  100% { left: 100%; }
}
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
  color: white !important;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
}
.option-info p {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
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
  background: transparent;
  border: 1px solid rgba(80, 180, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
  color: white !important;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}



/* FEATURES */
.plan-features {
  flex-grow: 1;
  margin-bottom: 32px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 0;
  transition: all 0.3s ease;
}

.feature:hover {
  color: rgba(255, 255, 255, 0.95);
  transform: translateX(4px);
}

/* BUTTONS */
.plan-button {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.plan-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140%;
  height: 140%;
  background: radial-gradient(circle, 
    rgba(255, 255, 255, 0.3) 0%, 
    transparent 70%
  );
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.6s ease;
}

.plan-button:hover::before {
  transform: translate(-50%, -50%) scale(1);
}

.basic-btn {
  background: linear-gradient(135deg, 
    rgba(156, 163, 175, 0.9),
    rgba(107, 114, 128, 0.9)
  );
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.basic-btn:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 12px 24px rgba(107, 114, 128, 0.4),
    0 20px 40px rgba(0, 0, 0, 0.2);
}

.gold-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 24px rgba(245, 158, 11, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.gold-btn:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 16px 32px rgba(245, 158, 11, 0.5),
    0 24px 48px rgba(217, 119, 6, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.premium-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 24px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.premium-btn:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 16px 32px rgba(139, 92, 246, 0.5),
    0 24px 48px rgba(124, 58, 237, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Price Display Premium Style */
.current-price {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 1;
  display: inline-block;
  background: linear-gradient(135deg, #fff, rgba(255,255,255,0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 10px rgba(255,255,255,0.2));
}

.gold .current-price {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 15px rgba(245, 158, 11, 0.5));
}

.premium .current-price {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 15px rgba(139, 92, 246, 0.5));
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
    padding: 60px 20px 40px;
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
  background: rgba(255, 255, 255, 0.02) !important;
  backdrop-filter: blur(25px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 32px;
  padding: 48px;
  text-align: center;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  color: white !important;
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
    padding: 80px 20px 48px;
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

@media (max-width: 1024px) {
  .cv-preview {
    gap: 15px;
    max-width: 90vw;
    overflow: hidden;
  }
  
  .cv-before, .cv-after {
    max-width: calc(45vw - 20px);
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .cv-preview {
    flex-direction: column;
    gap: 20px;
    max-width: 100%;
  }
  
  .cv-before, .cv-after {
    width: 100%;
    max-width: 350px;
    margin: 0 auto;
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
    transform: scale(0.9);
  }
  
  .cv-before, .cv-after {
    padding: 16px;
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

/* Wyłącz wszelkie stare pseudo-ikonki na hero button */
.hero-button::after { content: none !important; }


/* Magnetic Buttons Enhancement */
.hero-button,
.nav-cta,
.testimonials-button,
.timeline-button,
.faq-button,
.upload-btn.secondary{
  background: linear-gradient(135deg, #7850ff, #ff5080);
  color: #fff;
  border: 0;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 24px; border-radius: 100px;
  font-weight: 800; letter-spacing: .2px;
  box-shadow: 0 12px 32px rgba(120, 80, 255, 0.3), inset 0 1px 0 rgba(255,255,255,.28);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.upload-btn.secondary:hover{
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 16px 44px rgba(155,92,255,.38);
  filter: saturate(1.08);
}


.plan-button {
  position: relative;
  overflow: hidden;
  z-index: 1;
  will-change: transform;
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
  color: white;
  font-weight: 600;
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
  border-color: rgba(0, 255, 136, 0.5);
  background: rgba(0, 255, 136, 0.15);
  color: #fff;
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
  
  /* Minimum font sizes for accessibility */
  span, small, .badge, .label {
    font-size: 14px !important;
    min-height: auto;
  }
  
  /* Touch targets minimum size */
  button, a, [role="button"], input[type="checkbox"] {
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
  }
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


/* === TOP GAP KILLER (wklej na sam koniec) === */
html, body { margin:0 !important; padding:0 !important; }

.navigation { position: fixed; top:0; left:0; right:0; z-index:2147483600; }

.hero-section{
  position: relative;
  padding-top: 64px !important;   /* stała kompensacja pod nav/top-bar */
}

/* blokuje kolaps marginesów pierwszego dziecka */
.hero-section::before{
  content:'';
  display:block;
  height:1px;
}

/* zeruje „przeciekające” marginesy pierwszego elementu w hero */
.hero-section > *:first-child{ margin-top:0 !important; }

/* jeśli gdzieś zostało – nadpisz brutalnie */
.hero-subtitle{ margin-top: 12px !important; }


}

/* Kompensacja dla linków przewijających do #sekcji */
#hero, #stats, #capabilities, #timeline, #testimonials, #faq {
  scroll-margin-top: 112px; /* 60(nav) + 44(dots) + ~8 bufora */
}




/* Live stats – nielamane liczby */
.stat-value{ white-space: nowrap; }

/* Live stats – nielamane liczby */
.stat-value{ white-space: nowrap; 
}


/* === Upload Modal – e-mail field (pro look) === */
.email-field{
  margin-top: 14px;
  padding-top: 16px;
  background: transparent;
  border: 0;
  border-radius: 0;
  display: grid;
  gap: 10px;
  position: relative;
}
.email-field::before{
  content:'';
  position:absolute; top:0; left:0; right:0; height:1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent);
}
.email-label{
  font-size: 13px;
  font-weight: 800;
  letter-spacing: .2px;
  color: rgba(255,255,255,.92);
}
.email-input{
  width: 100%;
  padding: 16px 20px;
  border-radius: 16px;
  border: 2px solid rgba(120, 80, 255, 0.2);
  background: rgba(120, 80, 255, 0.05);
  color: #fff;
  font-weight: 600;
  outline: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.email-input:focus{
  border-color: rgba(120,80,255,.55);
  box-shadow: 0 0 0 4px rgba(120,80,255,.18);
}
.email-hint{
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255,255,255,.82);  /* ⚠ było „ledwo widoczne” — teraz jest czytelne */
}

/* Jeżeli „prostokąty” w modalu się rozjeżdżały — dociśnijmy max szerokość pól tylko w modalu */
.upload-modal .email-input,
#uploadModal .email-input{
  max-width: 100%;
}

/* FORCE purple/blue for dots (override whatever is left) */
.scroll-dot::before{
  background: #b9c0ff !important;
  box-shadow: 0 0 0 2px rgba(255,255,255,.12), 0 8px 18px rgba(120,80,255,.28) !important;
}
.scroll-dot.active::before{
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  box-shadow: 0 0 0 6px rgba(118,75,162,.20), 0 12px 30px rgba(118,75,162,.45) !important;
  transform: scale(1.15) !important;
}
.scroll-dot.passed::after{
  background: linear-gradient(90deg,#667eea,#764ba2) !important;
}

/* === HERO Typing (final) – wklej w <style jsx> zamiast starych typing-* === */
.typing-block{
  display:block;
  /* rezerwuje wysokość na DWIE linie dużego H1 bez skakania layoutu */
  min-height: 3.2em; 
}
.typing-safe-zone{
  /* kluczowe: inline -> caret idzie razem z tekstem do 2. linii */
  display:inline; 
}
.typing-text{ 
  display:inline; 
  word-break: break-word; 
}
.typing-cursor{
  display:inline; 
  animation: blink 1s step-end infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }


.timeline-step[data-step="3"] .time {
  color: #00ff88; /* zielony jak w innych krokach */
}

@media (max-width: 600px) {
  .upload-modal, .paywall-modal {
    width: 95vw;
    padding: 20px;
    border-radius: 12px;
  }
}

.cv-textarea.flash {
  animation: flashBg 0.6s ease;
}
@keyframes flashBg {
  0% { background-color: #b2f2bb; }
  100% { background-color: transparent; }
}

/* Fix dla scrollowania modali */
.modal-content {
  max-height: 90vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

.modal-content::-webkit-scrollbar {
  width: 10px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(80, 140, 255, 0.05);
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #7850ff, #5080ff);
  border-radius: 10px;
  border: 2px solid rgba(0, 0, 0, 0.2);
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #8960ff, #60a0ff);
}


// 5. DODAJ style CSS dla demo szablonów w style jsx:
.template-demo {
  width: 100%;
  height: 150px;
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.demo-header {
  width: 60%;
  height: 20px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  margin-bottom: 10px;
}

.demo-header.classic {
  background: #2c3e50;
  width: 100%;
}

.demo-header.minimal {
  background: #000;
  height: 2px;
  margin-bottom: 20px;
}

.demo-header.executive {
  background: linear-gradient(90deg, #f7971e, #ffd200);
}

.demo-header.creative {
  background: linear-gradient(45deg, #667eea, #f093fb, #f5576c);
  border-radius: 20px;
}

.demo-header.tech {
  background: #00d2ff;
}

.demo-header.elegant {
  background: linear-gradient(90deg, #232526, #414345);
  height: 25px;
}

.demo-line {
  width: 80%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 2px;
  margin-bottom: 8px;
}

.demo-line.short {
  width: 50%;
}

.demo-line.thin {
  height: 4px;
}

.demo-line.gold {
  background: linear-gradient(90deg, #f7971e, #ffd200);
  opacity: 0.3;
}

.demo-line.colorful {
  background: linear-gradient(90deg, #667eea, #f093fb);
}

.demo-line.tech {
  background: #00d2ff;
  opacity: 0.3;
}

.demo-line.elegant {
  background: #000;
  height: 1px;
  width: 100%;
}

.demo-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f093fb, #f5576c);
  margin: 10px 0;
}

.demo-chart {
  width: 100%;
  height: 40px;
  background: linear-gradient(90deg, #00d2ff 30%, #3a7bd5 60%, #00d2ff 90%);
  opacity: 0.2;
  border-radius: 4px;
  margin: 15px 0;
}

.demo-decoration {
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #000, transparent);
  margin-top: 20px;
}

.template-card.premium {
  border-color: rgba(139, 92, 246, 0.3);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.05));
}

.template-card.premium.vip {
  border-color: rgba(255, 215, 0, 0.3);
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05), rgba(255, 193, 7, 0.05));
}

.template-badge.premium {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.template-badge.premium.vip {
  background: linear-gradient(135deg, #ffd700, #ffc107);
  color: #000;
}


/* ========== MODAL STYLES ========== */
/* Podstawowe style modalu */
.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.8);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 999999999 !important;
  animation: modalFadeIn 0.3s ease;
  overflow-y: auto !important;
  padding: 40px 20px;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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
    0 0 100px rgba(120, 80, 255, 0.1);
  animation: modalSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes modalSlideIn {
  0% { 
    opacity: 0; 
    transform: translateY(50px) scale(0.95);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
}

.modal-close {
  position: absolute !important;
  top: 24px !important;
  right: 24px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  font-size: 24px !important;
  cursor: pointer;
  color: white !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1) rotate(90deg);
}

/* ========== OPTIMIZE MODAL ========== */
.optimize-modal {
  max-width: 1000px;
  padding: 0;
}

.optimize-modal .modal-header {
  background: linear-gradient(135deg, #7850ff, #ff5080);
  color: white;
  padding: 40px;
  text-align: center;
  border-radius: 32px 32px 0 0;
}

.optimize-modal .modal-header h2 {
  font-size: 36px;
  font-weight: 900;
  margin-bottom: 8px;
}

.optimize-modal .modal-header p {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 24px;
}

/* Progress Bar Styles */
.progress-container {
  margin-top: 20px;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  height: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  background: linear-gradient(90deg, #00ff88, #50b4ff);
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.progress-step span {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.3s ease;
}

.progress-step.active span {
  background: linear-gradient(135deg, #00ff88, #50b4ff);
  color: #000;
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
}

.progress-step label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.optimize-modal .modal-body {
  padding: 40px;
  background: rgba(15, 15, 15, 0.98);
  border-radius: 0 0 32px 32px;
}

/* ========== FORM STYLES ========== */
.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.email-input,
.cv-textarea,
.job-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid rgba(120, 80, 255, 0.2);
  border-radius: 12px;
  background: rgba(120, 80, 255, 0.05);
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
}

.email-input:focus,
.cv-textarea:focus,
.job-textarea:focus {
  outline: none;
  border-color: rgba(120, 80, 255, 0.5);
  background: rgba(120, 80, 255, 0.08);
  box-shadow: 0 0 0 4px rgba(120, 80, 255, 0.15);
}

.cv-textarea,
.job-textarea {
  min-height: 150px;
  resize: vertical;
  font-family: inherit;
}

.upload-alternative {
  margin-top: 10px;
}

.upload-label {
  display: inline-block;
  padding: 10px 20px;
  background: rgba(120, 80, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-size: 14px;
}

.upload-label:hover {
  background: rgba(120, 80, 255, 0.3);
  transform: translateY(-2px);
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.checkbox-group label {
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.next-button,
.back-button {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-button {
  background: linear-gradient(135deg, #00ff88, #00cc70);
  color: #000;
  margin-top: 20px;
}

.next-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  margin-bottom: 20px;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* ========== PRICING GRID ========== */
.pricing-grid-compact {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
}

.plan-card-compact {
  background: rgba(255, 255, 255, 0.02);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.plan-card-compact:hover {
  transform: translateY(-5px);
  border-color: rgba(120, 80, 255, 0.3);
  box-shadow: 0 10px 30px rgba(120, 80, 255, 0.2);
}

.plan-card-compact.gold {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.05);
}

.plan-card-compact.premium {
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.05);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.plan-name {
  font-size: 20px;
  font-weight: 800;
  color: white;
  margin-bottom: 10px;
}

.plan-price {
  font-size: 36px;
  font-weight: 900;
  color: white;
  margin-bottom: 20px;
}

.plan-features-compact {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  text-align: left;
}

.plan-features-compact li {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 8px;
}

.select-plan-button {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.select-plan-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.select-plan-button.gold {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.select-plan-button.premium {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .pricing-grid-compact {
    grid-template-columns: 1fr;
  }
  
  .optimize-modal {
    width: 95%;
    margin: 20px;
  }
}

/* === NOWY MODAL STYLES === */
.error-message {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 5px;
}

.email-input.error,
.cv-textarea.error {
  border-color: #ff6b6b !important;
  background: rgba(255, 107, 107, 0.1) !important;
}

.step-form {
  max-width: 100%;
}

.pricing-grid-compact {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.plan-card-compact {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.plan-card-compact:hover {
  transform: translateY(-5px);
  border-color: rgba(120, 80, 255, 0.4);
  box-shadow: 0 10px 30px rgba(120, 80, 255, 0.2);
}

.plan-card-compact.gold {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.05);
}

.plan-card-compact.premium {
  border-color: rgba(139, 92, 246, 0.4);
  background: rgba(139, 92, 246, 0.05);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.plan-name {
  font-size: 20px;
  font-weight: 800;
  color: white;
  margin-bottom: 10px;
}

.plan-price {
  font-size: 32px;
  font-weight: 900;
  color: white;
  margin-bottom: 20px;
}

.plan-features-compact {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  text-align: left;
}

.plan-features-compact li {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin-bottom: 8px;
}

.select-plan-button {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.select-plan-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.select-plan-button.gold {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.select-plan-button.premium {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

@media (max-width: 768px) {
  .pricing-grid-compact {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
.text-divider {
  text-align: center;
  margin: 30px 0;
  position: relative;
}

.text-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.text-divider span {
  background: rgba(15, 15, 15, 0.98);
  padding: 0 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 600;
  position: relative;
}

/* Template Modal Styles */
.template-modal .modal-body {
  padding: 40px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.template-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.template-card:hover {
  transform: translateY(-5px);
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
}

.template-card.premium {
  border-color: rgba(139, 92, 246, 0.3);
  background: rgba(139, 92, 246, 0.05);
}

.template-card .template-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.template-card h3 {
  color: white;
  font-size: 20px;
  margin-bottom: 10px;
}

.template-card p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.template-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
}

	`}</style>
    </>
  )
}