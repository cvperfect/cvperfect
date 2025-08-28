import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * AIOptimizer - CV Enhancement and Session Management
 * Extracted from success.js for bundle optimization
 * BUNDLE REDUCTION: Lazy loadable AI system
 */

/**
 * Plan Configuration for AI Features
 */
const PLAN_CONFIG = {
  basic: {
    aiAnalysis: false,
    pythonCLI: false,
    maxOptimizations: 1,
    features: ['basic_formatting']
  },
  gold: {
    aiAnalysis: true,
    pythonCLI: true,
    maxOptimizations: 3,
    features: ['basic_formatting', 'ats_optimization', 'keyword_enhancement']
  },
  premium: {
    aiAnalysis: true,
    pythonCLI: true,
    maxOptimizations: 10,
    features: ['basic_formatting', 'ats_optimization', 'keyword_enhancement', 'advanced_styling', 'industry_targeting']
  }
}

/**
 * Session Recovery System
 */
const SessionRecovery = ({ sessionId, onSessionRecovered, onError }) => {
  const [isRecovering, setIsRecovering] = useState(false)

  const recoverSession = useCallback(async () => {
    if (!sessionId) return
    
    setIsRecovering(true)
    try {
      const response = await fetch('/api/get-session-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        const data = await response.json()
        onSessionRecovered(data)
      } else {
        throw new Error('Session recovery failed')
      }
    } catch (error) {
      console.error('Session recovery error:', error)
      onError('Nie udało się odzyskać sesji')
    } finally {
      setIsRecovering(false)
    }
  }, [sessionId, onSessionRecovered, onError])

  useEffect(() => {
    if (sessionId) {
      recoverSession()
    }
  }, [sessionId, recoverSession])

  if (!sessionId) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="text-yellow-600">
          {isRecovering ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
          ) : (
            '🔄'
          )}
        </div>
        <div>
          <p className="font-medium text-yellow-800">
            {isRecovering ? 'Odzyskuję sesję...' : 'Sesja odzyskana'}
          </p>
          <p className="text-sm text-yellow-600">
            {isRecovering ? 'Przywracam Twoje dane' : 'Twoje dane zostały przywrócone'}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * AI Optimization Progress Component
 */
const OptimizationProgress = ({ isOptimizing, progress, currentStep }) => {
  if (!isOptimizing) return null

  const steps = [
    'Analizuję CV...',
    'Optymalizuję treść...',
    'Dodaję słowa kluczowe...',
    'Finalizuję zmiany...'
  ]

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-lg font-bold text-blue-800 mb-2">Optymalizacja AI</h3>
        <p className="text-blue-600 mb-4">{currentStep || steps[Math.floor(progress / 25)] || 'Przetwarzam...'}</p>
        
        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-sm text-blue-500">{Math.round(progress)}% ukończone</p>
      </div>
    </div>
  )
}

/**
 * Python CLI Integration System - Plain async function
 */
const optimizeWithPython = async ({ 
  sessionData, 
  userPlan, 
  onOptimizationComplete, 
  onOptimizationStart,
  onProgress,
  onError 
}) => {
  if (!PLAN_CONFIG[userPlan]?.pythonCLI) {
    onError('Python CLI nie jest dostępne w Twoim planie')
    return
  }

  onOptimizationStart?.()

  try {
    // Phase 1: Prepare data
    onProgress?.('Przygotowuję dane dla Python CLI...')
    
    const response = await fetch('/api/analyze-python', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: sessionData?.cvData?.rawText || '',
        email: sessionData?.email || sessionData?.userEmail || 'user@example.com',
        jobPosting: sessionData?.jobPosting || '',
        sessionId: sessionData?.sessionId,
        plan: userPlan,
        sessionData,
        optimization_type: 'comprehensive'
      })
    })

    // Phase 2: Process with Python
    onProgress?.('Przetwarzam z Python CLI...')

    if (!response.ok) {
      throw new Error(`Python CLI error: ${response.status}`)
    }

    const result = await response.json()
    
    // Phase 3: Validate results
    onProgress?.('Waliduję wyniki...')

    if (result.success && result.optimizedCV) {
      onProgress?.('Optymalizacja ukończona!')
      
      setTimeout(() => {
        onOptimizationComplete(result.optimizedCV, result.metrics)
      }, 500)
    } else {
      throw new Error(result.error || 'Python CLI optimization failed')
    }

  } catch (error) {
    console.error('Python CLI optimization error:', error)
    onError(`Błąd optymalizacji Python: ${error.message}`)
    throw error
  }
}

/**
 * Groq API Fallback System - Plain async function
 */
const optimizeWithGroq = async ({ 
  sessionData, 
  userPlan, 
  onOptimizationComplete, 
  onOptimizationStart,
  onProgress,
  onError 
}) => {
  onOptimizationStart?.()

  try {
    // Phase 1: Prepare data
    onProgress?.('Łączę z AI...')
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionData,
        userPlan,
        optimization_level: PLAN_CONFIG[userPlan]?.features || ['basic_formatting']
      })
    })

    // Phase 2: AI Processing
    onProgress?.('AI analizuje CV...')

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const result = await response.json()
    
    // Phase 3: Finalize
    onProgress?.('Finalizuję optymalizację...')

    if (result.success && result.optimizedContent) {
      onProgress?.('Optymalizacja AI ukończona!')
      
      setTimeout(() => {
        onOptimizationComplete(result.optimizedContent, result.atsMetrics)
      }, 500)
    } else {
      throw new Error(result.error || 'AI optimization failed')
    }

  } catch (error) {
    console.error('Groq API optimization error:', error)
    onError(`Błąd optymalizacji AI: ${error.message}`)
    throw error
  }
}

/**
 * CV Parsing and Enhancement System
 */
const CVParser = ({ onCVParsed, onError }) => {
  const parseCV = useCallback(async (cvData) => {
    if (!cvData?.rawText) {
      onError('Brak danych CV do parsowania')
      return null
    }

    try {
      const lines = cvData.rawText.split('\n').filter(line => line.trim().length > 0)
      
      const parsedData = {
        name: extractName(lines),
        email: extractEmail(cvData.rawText),
        phone: extractPhone(cvData.rawText),
        sections: extractSections(lines),
        wordCount: cvData.rawText.split(/\s+/).length,
        characterCount: cvData.rawText.length,
        originalData: cvData
      }

      onCVParsed(parsedData)
      return parsedData

    } catch (error) {
      console.error('CV parsing error:', error)
      onError('Błąd parsowania CV')
      return null
    }
  }, [onCVParsed, onError])

  return { parseCV }
}

// Helper functions for CV parsing
const extractName = (lines) => {
  const namePatterns = [
    /^[A-ZŁŚĆĘĄŹŻ][a-ząćęłńóśźż]+ [A-ZŁŚĆĘĄŹŻ][a-ząćęłńóśźż]+/,
    /^[A-Z][a-z]+ [A-Z][a-z]+/
  ]
  
  for (const line of lines.slice(0, 5)) {
    for (const pattern of namePatterns) {
      if (pattern.test(line.trim())) {
        return line.trim()
      }
    }
  }
  return ''
}

const extractEmail = (content) => {
  const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return emailMatch ? emailMatch[0] : ''
}

const extractPhone = (content) => {
  const phoneMatch = content.match(/[+]?[\d\s\-()]{7,20}/)
  return phoneMatch ? phoneMatch[0].trim() : ''
}

const extractSections = (lines) => {
  const sectionKeywords = [
    'doświadczenie', 'experience', 'praca', 'work',
    'wykształcenie', 'education', 'edukacja',
    'umiejętności', 'skills', 'kompetencje'
  ]
  
  const sections = []
  let currentSection = null
  
  lines.forEach(line => {
    const isSection = sectionKeywords.some(keyword => 
      line.toLowerCase().includes(keyword) && line.length < 50
    )
    
    if (isSection) {
      if (currentSection) sections.push(currentSection)
      currentSection = { title: line, content: [] }
    } else if (currentSection && line.length > 3) {
      currentSection.content.push(line)
    }
  })
  
  if (currentSection) sections.push(currentSection)
  return sections
}

/**
 * Main AIOptimizer Component
 */
const AIOptimizer = ({
  cvData,
  userPlan = 'basic',
  sessionId,
  isOptimizing,
  setLoadingState,
  _optimizeWithAI,
  onSessionRecovered,
  onOptimizationComplete,
  onError,
  t = (key) => key
}) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [optimizationCount, setOptimizationCount] = useState(0)
  const [isOptimizingPython, setIsOptimizingPython] = useState(false)
  const [isOptimizingGroq, setIsOptimizingGroq] = useState(false)

  // Python CLI optimizer wrapper
  const pythonOptimizer = useMemo(() => ({
    optimizeWithPython: async (sessionData) => {
      setIsOptimizingPython(true)
      setProgress(0)
      try {
        await optimizeWithPython({
          sessionData,
          userPlan,
          onOptimizationComplete,
          onOptimizationStart: () => {
            setLoadingState(prev => ({ ...prev, isOptimizing: true }))
            setProgress(25)
          },
          onProgress: (step) => {
            setCurrentStep(step)
            setProgress(prev => Math.min(prev + 25, 100))
          },
          onError
        })
      } finally {
        setIsOptimizingPython(false)
        setProgress(0)
      }
    },
    isOptimizing: isOptimizingPython
  }), [cvData, userPlan, sessionId, onOptimizationComplete, onError, isOptimizingPython])

  // Groq API optimizer wrapper
  const groqOptimizer = useMemo(() => ({
    optimizeWithGroq: async (sessionData) => {
      setIsOptimizingGroq(true)
      setProgress(0)
      try {
        await optimizeWithGroq({
          sessionData,
          userPlan,
          onOptimizationComplete,
          onOptimizationStart: () => {
            setLoadingState(prev => ({ ...prev, isOptimizing: true }))
            setProgress(20)
          },
          onProgress: (step) => {
            setCurrentStep(step)
            setProgress(prev => Math.min(prev + 20, 100))
          },
          onError
        })
      } finally {
        setIsOptimizingGroq(false)
        setProgress(0)
      }
    },
    isOptimizing: isOptimizingGroq
  }), [cvData, userPlan, sessionId, onOptimizationComplete, onError, isOptimizingGroq])

  // CV Parser hook
  const cvParser = CVParser({
    onCVParsed: (parsedData) => console.log('CV parsed:', parsedData),
    onError
  })

  // Main optimization function
  const handleOptimization = useCallback(async () => {
    const maxOptimizations = PLAN_CONFIG[userPlan]?.maxOptimizations || 1
    
    if (optimizationCount >= maxOptimizations) {
      onError(`Osiągnięto limit optymalizacji (${maxOptimizations}) dla planu ${userPlan}`)
      return
    }

    const sessionData = {
      cvData,
      userPlan,
      sessionId
    }

    // Try Python CLI first for Gold/Premium, fallback to Groq
    if (PLAN_CONFIG[userPlan]?.pythonCLI) {
      try {
        await pythonOptimizer.optimizeWithPython(sessionData)
      } catch (error) {
        console.warn('Python CLI failed, falling back to Groq API:', error)
        await groqOptimizer.optimizeWithGroq(sessionData)
      }
    } else {
      await groqOptimizer.optimizeWithGroq(sessionData)
    }

    setOptimizationCount(prev => prev + 1)
  }, [cvData, userPlan, sessionId, optimizationCount, pythonOptimizer, groqOptimizer, onError])

  const isCurrentlyOptimizing = isOptimizing || pythonOptimizer.isOptimizing || groqOptimizer.isOptimizing
  const currentProgress = pythonOptimizer.progress || groqOptimizer.progress || progress

  const planConfig = PLAN_CONFIG[userPlan] || PLAN_CONFIG.basic

  if (!cvData) return null

  return (
    <div className="space-y-6">
      {/* Session Recovery */}
      {sessionId && (
        <SessionRecovery
          sessionId={sessionId}
          onSessionRecovered={onSessionRecovered}
          onError={onError}
        />
      )}

      {/* Optimization Progress */}
      <OptimizationProgress
        isOptimizing={isCurrentlyOptimizing}
        progress={currentProgress}
        currentStep={currentStep}
      />

      {/* AI Optimization Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🤖 Optymalizacja AI
          </h2>
          <p className="text-gray-600">
            Plan: <span className="font-semibold text-purple-600">{userPlan.toUpperCase()}</span>
            {planConfig.pythonCLI && <span className="ml-2 text-green-600">+ Python CLI</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="font-bold text-lg text-purple-600">{optimizationCount}</div>
            <div className="text-sm text-gray-600">Użyte optymalizacje</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="font-bold text-lg text-green-600">{planConfig.maxOptimizations - optimizationCount}</div>
            <div className="text-sm text-gray-600">Pozostałe</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="font-bold text-lg text-blue-600">{planConfig.features.length}</div>
            <div className="text-sm text-gray-600">Dostępne funkcje</div>
          </div>
        </div>

        <button
          onClick={handleOptimization}
          disabled={isCurrentlyOptimizing || optimizationCount >= planConfig.maxOptimizations}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isCurrentlyOptimizing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Optymalizuję...
            </div>
          ) : (
            `🚀 Optymalizuj CV (${optimizationCount}/${planConfig.maxOptimizations})`
          )}
        </button>

        {planConfig.features && planConfig.features.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-semibold mb-2">Dostępne funkcje:</p>
            <ul className="list-disc list-inside space-y-1">
              {planConfig.features.map((feature, index) => (
                <li key={feature || index}>{typeof t === 'function' ? t(feature) : feature}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default AIOptimizer
export {
  PLAN_CONFIG,
  SessionRecovery,
  OptimizationProgress,
  CVParser
}