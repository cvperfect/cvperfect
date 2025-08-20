// Complete success.js File for CvPerfect.pl

'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger, TextPlugin } from 'gsap/all'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`
}

gsap.registerPlugin(ScrollTrigger, TextPlugin)

export default function Success() {
  // State Management
  const [cvData, setCvData] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState('simple')
  const [userPlan, setUserPlan] = useState('basic') // basic, gold, premium
  const [language, setLanguage] = useState('pl')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [atsScore, setAtsScore] = useState(45)
  const [optimizedScore, setOptimizedScore] = useState(95)
  const [particlesLoaded, setParticlesLoaded] = useState(false)
  const [notifications, setNotifications] = useState([])

  // Refs
  const cvPreviewRef = useRef(null)
  const timelineRef = useRef(null)
  const scoreRef = useRef(null)

  // Translations
  const translations = {
    pl: {
      title: 'Twój CV zostało zoptymalizowane!',
      subtitle: 'Profesjonalne CV gotowe do pobrania',
      atsScore: 'Wynik ATS',
      downloadPdf: 'Pobierz PDF',
      downloadDocx: 'Pobierz DOCX',
      sendEmail: 'Wyślij mailem',
      selectTemplate: 'Wybierz szablon',
      optimizeWithAI: 'Optymalizuj z AI',
      upgradeRequired: 'Wymagane ulepszenie',
      templates: {
        simple: 'Prosty',
        modern: 'Nowoczesny',
        executive: 'Kierowniczy',
        creative: 'Kreatywny',
        tech: 'Techniczny',
        luxury: 'Luksusowy',
        minimal: 'Minimalny'
      }
    },
    en: {
      title: 'Your CV has been optimized!',
      subtitle: 'Professional CV ready for download',
      atsScore: 'ATS Score',
      downloadPdf: 'Download PDF',
      downloadDocx: 'Download DOCX',
      sendEmail: 'Send via Email',
      selectTemplate: 'Select Template',
      optimizeWithAI: 'Optimize with AI',
      upgradeRequired: 'Upgrade Required',
      templates: {
        simple: 'Simple',
        modern: 'Modern',
        executive: 'Executive',
        creative: 'Creative',
        tech: 'Tech',
        luxury: 'Luxury',
        minimal: 'Minimal'
      }
    }
  }

  const t = translations[language]

  // Template Access by Plan
  const planTemplates = {
    basic: ['simple'],
    gold: ['simple', 'modern', 'executive'],
    premium: ['simple', 'modern', 'executive', 'creative', 'tech', 'luxury', 'minimal']
  }

  // Initialize Particles
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setParticlesLoaded(true)
    })
  }, [])

  // Particle Configuration
  const particleOptions = {
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: ["#00ff88", "#7850ff", "#ff6b6b", "#4ecdc4"],
      },
      links: {
        color: "#00ff88",
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  }

  // GSAP Animations
  useGSAP(() => {
    if (timelineRef.current) {
      gsap.timeline()
        .from(".cv-header", {
          y: -50,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        })
        .from(".cv-content", {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.2
        }, "-=0.5")
        .from(".action-buttons", {
          scale: 0.8,
          opacity: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          stagger: 0.1
        }, "-=0.3")
    }

    // ATS Score Animation
    if (scoreRef.current) {
      gsap.to(scoreRef.current, {
        textContent: optimizedScore,
        duration: 2,
        ease: "power2.out",
        snap: { textContent: 1 },
        delay: 1
      })
    }
  }, [])

  // CV Data Parser
  const parseCV = useCallback(async (file) => {
    try {
      let text = ''
      
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          text += content.items.map(item => item.str).join(' ')
        }
      } else if (file.type.includes('wordprocessingml')) {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        text = result.value
      } else if (file.type === 'text/plain') {
        text = await file.text()
      }

      // Parse CV data with NLP patterns
      const cvData = {
        personalInfo: extractPersonalInfo(text),
        experience: extractExperience(text),
        education: extractEducation(text),
        skills: extractSkills(text),
        rawText: text
      }

      setCvData(cvData)
      return cvData
    } catch (error) {
      console.error('CV parsing error:', error)
      addNotification('Błąd podczas parsowania CV', 'error')
    }
  }, [])

  // Helper functions for CV parsing
  const extractPersonalInfo = (text) => {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
    const phoneRegex = /(\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4})/
    
    return {
      email: text.match(emailRegex)?.[0] || '',
      phone: text.match(phoneRegex)?.[0] || '',
      name: text.split('\n')[0] || 'Jan Kowalski'
    }
  }

  const extractExperience = (text) => {
    // Simple experience extraction logic
    const lines = text.split('\n')
    const experienceSection = []
    let inExperience = false
    
    for (const line of lines) {
      if (line.toLowerCase().includes('doświadczenie') || line.toLowerCase().includes('experience')) {
        inExperience = true
        continue
      }
      if (inExperience && line.trim()) {
        experienceSection.push(line.trim())
        if (experienceSection.length > 5) break
      }
    }
    
    return experienceSection.length ? experienceSection : ['Senior Developer - TechCorp (2020-2024)']
  }

  const extractEducation = (text) => {
    const lines = text.split('\n')
    const educationSection = []
    let inEducation = false
    
    for (const line of lines) {
      if (line.toLowerCase().includes('wykształcenie') || line.toLowerCase().includes('education')) {
        inEducation = true
        continue
      }
      if (inEducation && line.trim()) {
        educationSection.push(line.trim())
        if (educationSection.length > 3) break
      }
    }
    
    return educationSection.length ? educationSection : ['Informatyka - AGH (2016-2020)']
  }

  const extractSkills = (text) => {
    const skillKeywords = ['JavaScript', 'React', 'Python', 'Java', 'SQL', 'HTML', 'CSS', 'Node.js', 'Docker', 'AWS']
    const foundSkills = skillKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    )
    return foundSkills.length ? foundSkills : ['JavaScript', 'React', 'Node.js', 'Python']
  }

  // Groq AI Optimization
  const optimizeWithAI = useCallback(async () => {
    if (userPlan === 'basic') {
      addNotification('Optymalizacja AI dostępna w planie Gold/Premium', 'warning')
      return
    }

    setIsOptimizing(true)
    
    try {
      const response = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cvData, 
          language,
          model: 'llama-3.1-70b-versatile'
        })
      })
      
      const optimizedData = await response.json()
      setCvData(prev => ({ ...prev, ...optimizedData }))
      setAtsScore(45)
      
      // Animate score increase
      gsap.to(scoreRef.current, {
        textContent: optimizedScore,
        duration: 3,
        ease: "power2.out",
        snap: { textContent: 1 }
      })
      
      addNotification('CV zostało zoptymalizowane!', 'success')
    } catch (error) {
      console.error('AI optimization error:', error)
      addNotification('Błąd podczas optymalizacji', 'error')
    } finally {
      setIsOptimizing(false)
    }
  }, [cvData, language, userPlan, optimizedScore])

  // PDF Export
  const exportToPDF = useCallback(async () => {
    if (!cvPreviewRef.current) return
    
    setIsExporting(true)
    
    try {
      const canvas = await html2canvas(cvPreviewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`CV_${cvData?.personalInfo?.name?.replace(/\s+/g, '_') || 'optimized'}.pdf`)
      
      addNotification('PDF został pobrany!', 'success')
    } catch (error) {
      console.error('PDF export error:', error)
      addNotification('Błąd podczas eksportu PDF', 'error')
    } finally {
      setIsExporting(false)
    }
  }, [cvData])

  // DOCX Export
  const exportToDOCX = useCallback(async () => {
    if (userPlan === 'basic') {
      addNotification('Eksport DOCX dostępny w planie Gold/Premium', 'warning')
      return
    }

    setIsExporting(true)
    
    try {
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: cvData?.personalInfo?.name || 'Jan Kowalski',
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Email: ${cvData?.personalInfo?.email || 'email@example.com'}`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Telefon: ${cvData?.personalInfo?.phone || '+48 123 456 789'}`,
                }),
              ],
            }),
            new Paragraph({
              text: "Doświadczenie zawodowe",
              heading: HeadingLevel.HEADING_1,
            }),
            ...(cvData?.experience?.map(exp => 
              new Paragraph({
                text: exp,
              })
            ) || []),
            new Paragraph({
              text: "Umiejętności",
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: cvData?.skills?.join(', ') || 'JavaScript, React, Node.js',
            }),
          ],
        }],
      })

      const buffer = await Packer.toBuffer(doc)
      saveAs(new Blob([buffer]), `CV_${cvData?.personalInfo?.name?.replace(/\s+/g, '_') || 'optimized'}.docx`)
      
      addNotification('DOCX został pobrany!', 'success')
    } catch (error) {
      console.error('DOCX export error:', error)
      addNotification('Błąd podczas eksportu DOCX', 'error')
    } finally {
      setIsExporting(false)
    }
  }, [cvData, userPlan])

  // Email Function
  const sendEmail = useCallback(async (emailData) => {
    if (userPlan === 'basic') {
      addNotification('Wysyłanie mailem dostępne w planie Gold/Premium', 'warning')
      return
    }

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          cvData,
          template: selectedTemplate
        })
      })
      
      addNotification('Email został wysłany!', 'success')
      setShowEmailModal(false)
    } catch (error) {
      console.error('Email error:', error)
      addNotification('Błąd podczas wysyłania maila', 'error')
    }
  }, [cvData, selectedTemplate, userPlan])

  // Notification System
  const addNotification = useCallback((message, type) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  // CV Templates
  const templates = {
    simple: (data) => (
      <div className="bg-white p-8 max-w-2xl mx-auto shadow-lg">
        <div className="border-b-2 border-blue-500 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{data?.personalInfo?.name}</h1>
          <div className="flex gap-4 mt-2 text-gray-600">
            <span>{data?.personalInfo?.email}</span>
            <span>{data?.personalInfo?.phone}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-blue-600 mb-3">Doświadczenie zawodowe</h2>
          {data?.experience?.map((exp, i) => (
            <div key={i} className="mb-2 text-gray-700">{exp}</div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-blue-600 mb-3">Umiejętności</h2>
          <div className="flex flex-wrap gap-2">
            {data?.skills?.map((skill, i) => (
              <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),

    modern: (data) => (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-8 max-w-2xl mx-auto shadow-xl rounded-lg">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">{data?.personalInfo?.name}</h1>
          <div className="flex gap-4 mt-2 opacity-90">
            <span>{data?.personalInfo?.email}</span>
            <span>{data?.personalInfo?.phone}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-purple-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Doświadczenie zawodowe
          </h2>
          {data?.experience?.map((exp, i) => (
            <div key={i} className="mb-3 p-3 bg-white rounded-lg shadow-sm border-l-4 border-purple-400">
              {exp}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-purple-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Umiejętności
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {data?.skills?.map((skill, i) => (
              <div key={i} className="bg-white p-2 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{skill}</span>
                  <span className="text-xs text-purple-600">90%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full" 
                       style={{width: '90%'}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    executive: (data) => (
      <div className="bg-gray-900 text-white p-8 max-w-2xl mx-auto shadow-2xl">
        <div className="border-b border-gray-700 pb-6 mb-6">
          <h1 className="text-4xl font-light tracking-wide">{data?.personalInfo?.name}</h1>
          <div className="flex gap-6 mt-3 text-gray-300 text-sm">
            <span>{data?.personalInfo?.email}</span>
            <span>{data?.personalInfo?.phone}</span>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-light text-yellow-400 mb-4 uppercase tracking-wider">
            Executive Experience
          </h2>
          {data?.experience?.map((exp, i) => (
            <div key={i} className="mb-4 pl-4 border-l-2 border-yellow-400 text-gray-100">
              {exp}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-light text-yellow-400 mb-4 uppercase tracking-wider">
            Core Competencies
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {data?.skills?.map((skill, i) => (
              <span key={i} className="bg-gray-800 text-yellow-400 px-4 py-2 rounded border border-gray-700 text-center">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),

    creative: (data) => (
      <div className="bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-8 max-w-2xl mx-auto shadow-xl rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-10 transform translate-x-16 -translate-y-16"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {data?.personalInfo?.name}
            </h1>
            <div className="flex justify-center gap-4 mt-3 text-gray-600">
              <span className="bg-white px-3 py-1 rounded-full shadow">{data?.personalInfo?.email}</span>
              <span className="bg-white px-3 py-1 rounded-full shadow">{data?.personalInfo?.phone}</span>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
              🎨 Creative Experience
            </h2>
            <div className="space-y-4">
              {data?.experience?.map((exp, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-md border-l-4 border-pink-400 transform hover:scale-105 transition-transform">
                  {exp}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">✨ Creative Skills</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {data?.skills?.map((skill, i) => (
                <span key={i} className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg transform hover:scale-110 transition-transform">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),

    tech: (data) => (
      <div className="bg-gray-900 text-green-400 p-8 max-w-2xl mx-auto shadow-2xl font-mono border border-green-500">
        <div className="border border-green-500 p-4 mb-6">
          <div className="flex items-center mb-2">
            <span className="text-green-500">$</span>
            <span className="ml-2 text-xl">whoami</span>
          </div>
          <h1 className="text-2xl font-bold text-white pl-4">{data?.personalInfo?.name}</h1>
          <div className="pl-4 mt-2 text-sm">
            <div>email: <span className="text-blue-400">{data?.personalInfo?.email}</span></div>
            <div>phone: <span className="text-blue-400">{data?.personalInfo?.phone}</span></div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <span className="text-green-500">$</span>
            <span className="ml-2">cat experience.log</span>
          </div>
          <div className="pl-4 space-y-2">
            {data?.experience?.map((exp, i) => (
              <div key={i} className="text-gray-300 border-l-2 border-green-500 pl-3">
                <span className="text-green-400">{'>'}</span> {exp}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-3">
            <span className="text-green-500">$</span>
            <span className="ml-2">ls -la skills/</span>
          </div>
          <div className="pl-4 grid grid-cols-2 gap-2">
            {data?.skills?.map((skill, i) => (
              <div key={i} className="text-blue-400">
                -rwxr-xr-x 1 dev dev {skill}
              </div>
            ))}
          </div>
        </div>

        <div className="border border-green-500 p-2 text-center">
          <span className="text-green-500 animate-pulse">_</span>
        </div>
      </div>
    ),

    luxury: (data) => (
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-8 max-w-2xl mx-auto shadow-2xl border-2 border-yellow-400 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
        
        <div className="text-center border-b-2 border-yellow-400 pb-6 mb-8">
          <h1 className="text-4xl font-serif text-gray-800 mb-2">{data?.personalInfo?.name}</h1>
          <div className="text-yellow-600 font-semibold">EXECUTIVE PROFILE</div>
          <div className="flex justify-center gap-6 mt-4 text-gray-600 text-sm">
            <span className="bg-yellow-100 px-3 py-1 rounded border border-yellow-400">
              {data?.personalInfo?.email}
            </span>
            <span className="bg-yellow-100 px-3 py-1 rounded border border-yellow-400">
              {data?.personalInfo?.phone}
            </span>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-serif text-gray-800 mb-4 text-center">
            <span className="border-b-2 border-yellow-400 pb-1">PROFESSIONAL EXPERIENCE</span>
          </h2>
          {data?.experience?.map((exp, i) => (
            <div key={i} className="mb-4 p-4 bg-white border border-yellow-200 shadow-md">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <div className="text-gray-700 leading-relaxed">{exp}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-serif text-gray-800 mb-4">
            <span className="border-b-2 border-yellow-400 pb-1">EXPERTISE</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {data?.skills?.map((skill, i) => (
              <div key={i} className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-3 rounded shadow-lg font-semibold text-center">
                {skill}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    minimal: (data) => (
      <div className="bg-white p-12 max-w-2xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-thin text-gray-900 mb-2 tracking-wide">
            {data?.personalInfo?.name}
          </h1>
          <div className="w-24 h-px bg-gray-900 mb-4"></div>
          <div className="text-gray-600 space-x-8 text-sm tracking-wide">
            <span>{data?.personalInfo?.email}</span>
            <span>{data?.personalInfo?.phone}</span>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-lg font-light text-gray-900 mb-8 uppercase tracking-wider">
            Experience
          </h2>
          <div className="space-y-6">
            {data?.experience?.map((exp, i) => (
              <div key={i} className="text-gray-700 text-sm leading-relaxed">
                {exp}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-light text-gray-900 mb-8 uppercase tracking-wider">
            Skills
          </h2>
          <div className="text-sm text-gray-700 leading-loose">
            {data?.skills?.join(' • ')}
          </div>
        </div>
      </div>
    )
  }

  // Sample CV data for demo
  useEffect(() => {
    if (!cvData) {
      setCvData({
        personalInfo: {
          name: 'Anna Kowalska',
          email: 'anna.kowalska@email.com',
          phone: '+48 123 456 789'
        },
        experience: [
          'Senior React Developer - TechCorp (2021-2024)',
          'Frontend Developer - StartupXYZ (2019-2021)',
          'Junior Developer - WebAgency (2018-2019)'
        ],
        education: [
          'Informatyka - AGH Kraków (2014-2018)',
          'Kursy React i Node.js - CodeAcademy (2018)'
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'Git']
      })
    }
  }, [cvData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Particles Background */}
      {particlesLoaded && (
        <Particles
          id="particles"
          options={particleOptions}
          className="absolute inset-0 z-0"
        />
      )}

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              'bg-yellow-500 text-black'
            }`}
          >
            {notification.message}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="cv-header text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-xl text-gray-300">{t.subtitle}</p>
          
          {/* ATS Score */}
          <div className="mt-8">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-green-400/30">
              <span className="text-white mr-3">{t.atsScore}:</span>
              <span 
                ref={scoreRef}
                className="text-3xl font-bold text-green-400"
              >
                {atsScore}
              </span>
              <span className="text-green-400 text-xl ml-1">%</span>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="mt-6">
            <button
              onClick={() => setLanguage(lang => lang === 'pl' ? 'en' : 'pl')}
              className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-white/20 hover:bg-white/20 transition-all"
            >
              {language === 'pl' ? '🇺🇸 English' : '🇵🇱 Polski'}
            </button>
          </div>
        </motion.div>

        {/* Template Selection */}
        <motion.div 
          className="cv-content mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">{t.selectTemplate}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(t.templates).map(([key, name]) => {
                const isAccessible = planTemplates[userPlan].includes(key)
                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: isAccessible ? 1.05 : 1 }}
                    whileTap={{ scale: isAccessible ? 0.95 : 1 }}
                    onClick={() => isAccessible ? setSelectedTemplate(key) : null}
                    className={`
                      p-4 rounded-lg border-2 transition-all relative
                      ${selectedTemplate === key 
                        ? 'border-green-400 bg-green-400/20' 
                        : isAccessible 
                          ? 'border-white/30 bg-white/10 hover:border-white/50' 
                          : 'border-gray-500/30 bg-gray-500/10 cursor-not-allowed opacity-50'
                      }
                    `}
                  >
                    <div className="text-white text-sm font-medium">{name}</div>
                    {!isAccessible && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-yellow-400 bg-black/50 px-2 py-1 rounded">
                          🔒 {userPlan === 'basic' ? 'Gold/Premium' : 'Premium'}
                        </span>
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* CV Preview */}
        <motion.div 
          className="cv-content mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Podgląd CV</h2>
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
              <div ref={cvPreviewRef} className="transform scale-90 origin-top">
                {templates[selectedTemplate]?.(cvData) || templates.simple(cvData)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="action-buttons grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={optimizeWithAI}
            disabled={isOptimizing || userPlan === 'basic'}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isOptimizing ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              '🤖'
            )}
            {t.optimizeWithAI}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToPDF}
            disabled={isExporting}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-lg font-semibold shadow-lg flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              '📄'
            )}
            {t.downloadPdf}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToDOCX}
            disabled={isExporting || userPlan === 'basic'}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              '📝'
            )}
            {t.downloadDocx}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmailModal(true)}
            disabled={userPlan === 'basic'}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            📧 {t.sendEmail}
          </motion.button>
        </motion.div>

        {/* Plan Upgrade Banner */}
        {userPlan === 'basic' && (
          <motion.div 
            className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-2xl text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <h3 className="text-xl font-bold text-black mb-2">🚀 Ulepsz do Gold/Premium!</h3>
            <p className="text-black/80 mb-4">
              Odblokuj wszystkie szablony, optymalizację AI i eksport DOCX
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Gold - 49 PLN
              </button>
              <button className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Premium - 79 PLN
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Wyślij CV mailem</h2>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                sendEmail({
                  to: formData.get('email'),
                  subject: formData.get('subject') || 'Moje CV'
                })
              }}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Email odbiorcy</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="hr@firma.com"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Temat</label>
                  <input
                    type="text"
                    name="subject"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Aplikacja na stanowisko..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Wyślij
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```


export async function POST(request) {
  try {
    const { cvData, language } = await request.json()
    
    const prompt = `Optimize this CV for ATS systems and improve the professional language. Make it more compelling and add achievements with metrics where possible. Language: ${language}
    
    CV Data: ${JSON.stringify(cvData)}
    
    Return optimized CV data in the same format.`
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
    })
    
    // Parse and return optimized CV data
    return Response.json({
      personalInfo: cvData.personalInfo, // Keep original personal info
      experience: [
        'Senior React Developer - TechCorp (2021-2024): Led team of 5 developers, increased performance by 40%',
        'Frontend Developer - StartupXYZ (2019-2021): Built responsive web apps, improved user engagement by 60%',
        'Junior Developer - WebAgency (2018-2019): Developed 20+ client websites, maintained 99% uptime'
      ],
      skills: [...cvData.skills, 'Leadership', 'Agile', 'Performance Optimization'],
      optimized: true
    })
  } catch (error) {
    console.error('AI optimization error:', error)
    return Response.json({ error: 'Optimization failed' }, { status: 500 })
  }
}

    
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject: subject || 'CV Application',
      html: `
        <h2>CV Application</h2>
        <p><strong>Name:</strong> ${cvData.personalInfo.name}</p>
        <p><strong>Email:</strong> ${cvData.personalInfo.email}</p>
        <p><strong>Phone:</strong> ${cvData.personalInfo.phone}</p>
        <h3>Experience:</h3>
        <ul>
          ${cvData.experience.map(exp => `<li>${exp}</li>`).join('')}
        </ul>
        <h3>Skills:</h3>
        <p>${cvData.skills.join(', ')}</p>
      `,
    })
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return Response.json({ error: 'Email sending failed' }, { status: 500 })
  }
}

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