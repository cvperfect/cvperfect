import { useState, useEffect, useCallback } from 'react'

/**
 * StateManager - Core State Management and Session Logic
 * Extracted from success.js for bundle optimization
 * BUNDLE REDUCTION: Lazy loadable state system
 */

/**
 * Initial State Definitions
 */
const INITIAL_CORE_DATA = {
  cvData: null,
  userPlan: 'premium'
}

const INITIAL_UI_STATE = {
  selectedTemplate: 'simple',
  modals: {
    email: false,
    template: false,
    export: false,
    recovery: false
  }
}

const INITIAL_LOADING_STATE = {
  isInitializing: true,
  isOptimizing: false,
  isExporting: false,
  hasNoSession: false
}

const INITIAL_RECOVERY_STATE = {
  email: '',
  isRecovering: false
}

const INITIAL_METRICS_STATE = {
  atsScore: 45,
  optimizedScore: 95
}

/**
 * Session Storage Management
 */
const SESSION_STORAGE_KEYS = {
  CV_DATA: 'cvperfect_cv_data',
  USER_PLAN: 'cvperfect_user_plan',
  SELECTED_TEMPLATE: 'cvperfect_template',
  ATS_METRICS: 'cvperfect_metrics'
}

/**
 * State Cache Management
 */
const stateCache = new Map()

const cacheState = (key, value) => {
  stateCache.set(key, {
    value,
    timestamp: Date.now()
  })
}

const getCachedState = (key, maxAge = 300000) => { // 5 min cache
  const cached = stateCache.get(key)
  if (!cached) return null
  
  if (Date.now() - cached.timestamp > maxAge) {
    stateCache.delete(key)
    return null
  }
  
  return cached.value
}

/**
 * Session Storage Helpers
 */
const saveToSessionStorage = (key, data) => {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, JSON.stringify(data))
      cacheState(key, data)
    }
  } catch (error) {
    console.warn(`Failed to save to sessionStorage: ${key}`, error)
  }
}

const loadFromSessionStorage = (key, defaultValue = null) => {
  try {
    if (typeof window === 'undefined') return defaultValue
    
    // Check cache first
    const cached = getCachedState(key)
    if (cached !== null) return cached
    
    const stored = sessionStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      cacheState(key, parsed)
      return parsed
    }
  } catch (error) {
    console.warn(`Failed to load from sessionStorage: ${key}`, error)
  }
  return defaultValue
}

/**
 * URL Query Parameter Handler
 */
const getUrlParams = () => {
  if (typeof window === 'undefined') return {}
  
  const params = new URLSearchParams(window.location.search)
  return {
    session_id: params.get('session_id'),
    plan: params.get('plan'),
    template: params.get('template'),
    recovery: params.get('recovery') === 'true'
  }
}

/**
 * Session Data Validator
 */
const validateSessionData = (data) => {
  if (!data || typeof data !== 'object') {
    return { valid: false, reason: 'Invalid data format' }
  }

  const required = ['cvData', 'userPlan']
  const missing = required.filter(field => !data[field])
  
  if (missing.length > 0) {
    return { valid: false, reason: `Missing required fields: ${missing.join(', ')}` }
  }

  // Validate CV data structure
  if (!data.cvData.name && !data.cvData.rawText) {
    return { valid: false, reason: 'CV data incomplete' }
  }

  // Validate user plan
  const validPlans = ['basic', 'gold', 'premium']
  if (!validPlans.includes(data.userPlan)) {
    return { valid: false, reason: 'Invalid user plan' }
  }

  return { valid: true }
}

/**
 * Main StateManager Component
 */
const StateManager = ({ 
  onStateChange,
  onSessionRestore,
  onSessionError,
  initialSessionId = null 
}) => {
  // Core States
  const [coreData, setCoreData] = useState(() => ({
    ...INITIAL_CORE_DATA,
    ...loadFromSessionStorage(SESSION_STORAGE_KEYS.CV_DATA, {})
  }))

  const [uiState, setUiState] = useState(() => ({
    ...INITIAL_UI_STATE,
    selectedTemplate: loadFromSessionStorage(SESSION_STORAGE_KEYS.SELECTED_TEMPLATE, 'simple')
  }))

  const [loadingState, setLoadingState] = useState(INITIAL_LOADING_STATE)
  const [recoveryState, setRecoveryState] = useState(INITIAL_RECOVERY_STATE)
  const [metricsState, setMetricsState] = useState(() => ({
    ...INITIAL_METRICS_STATE,
    ...loadFromSessionStorage(SESSION_STORAGE_KEYS.ATS_METRICS, {})
  }))

  // Session Management
  const [sessionId, setSessionId] = useState(initialSessionId)
  const [lastSaved, setLastSaved] = useState(null)

  /**
   * Auto-save effect for persistent state
   */
  useEffect(() => {
    if (coreData.cvData) {
      saveToSessionStorage(SESSION_STORAGE_KEYS.CV_DATA, coreData)
      setLastSaved(new Date().toISOString())
    }
  }, [coreData])

  useEffect(() => {
    saveToSessionStorage(SESSION_STORAGE_KEYS.SELECTED_TEMPLATE, uiState.selectedTemplate)
  }, [uiState.selectedTemplate])

  useEffect(() => {
    if (metricsState.atsScore !== 45) { // Only save if changed from default
      saveToSessionStorage(SESSION_STORAGE_KEYS.ATS_METRICS, metricsState)
    }
  }, [metricsState])

  /**
   * Initialize from URL parameters
   */
  useEffect(() => {
    const urlParams = getUrlParams()
    
    if (urlParams.session_id && !sessionId) {
      setSessionId(urlParams.session_id)
      initializeFromSession(urlParams.session_id)
    }

    if (urlParams.plan && ['basic', 'gold', 'premium'].includes(urlParams.plan)) {
      updateCoreData({ userPlan: urlParams.plan })
    }

    if (urlParams.template) {
      updateUiState({ selectedTemplate: urlParams.template })
    }

    if (urlParams.recovery) {
      setRecoveryState(prev => ({ ...prev, isRecovering: true }))
    }
  }, [])

  /**
   * Session initialization from API
   */
  const initializeFromSession = useCallback(async (sessionId) => {
    if (!sessionId) return

    setLoadingState(prev => ({ ...prev, isInitializing: true }))

    try {
      const response = await fetch('/api/get-session-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      })

      if (!response.ok) {
        throw new Error(`Session fetch failed: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Session data invalid')
      }

      // Validate session data
      const validation = validateSessionData(data)
      if (!validation.valid) {
        throw new Error(`Session validation failed: ${validation.reason}`)
      }

      // Restore session state
      setCoreData({
        cvData: data.cvData,
        userPlan: data.userPlan || 'premium'
      })

      setMetricsState({
        atsScore: data.atsScore || 45,
        optimizedScore: data.optimizedScore || 95
      })

      setLoadingState(prev => ({ 
        ...prev, 
        isInitializing: false,
        hasNoSession: false 
      }))

      onSessionRestore?.(data)
      console.log('✅ Session restored successfully:', sessionId)

    } catch (error) {
      console.error('❌ Session initialization failed:', error)
      setLoadingState(prev => ({ 
        ...prev, 
        isInitializing: false,
        hasNoSession: true 
      }))
      onSessionError?.(error)
    }
  }, [onSessionRestore, onSessionError])

  /**
   * State update helpers with validation
   */
  const updateCoreData = useCallback((updates) => {
    setCoreData(prev => {
      const newData = { ...prev, ...updates }
      onStateChange?.('coreData', newData)
      return newData
    })
  }, [onStateChange])

  const updateUiState = useCallback((updates) => {
    setUiState(prev => {
      const newState = { ...prev, ...updates }
      onStateChange?.('uiState', newState)
      return newState
    })
  }, [onStateChange])

  const updateLoadingState = useCallback((updates) => {
    setLoadingState(prev => {
      const newState = { ...prev, ...updates }
      onStateChange?.('loadingState', newState)
      return newState
    })
  }, [onStateChange])

  const updateMetricsState = useCallback((updates) => {
    setMetricsState(prev => {
      const newState = { ...prev, ...updates }
      onStateChange?.('metricsState', newState)
      return newState
    })
  }, [onStateChange])

  /**
   * Modal management
   */
  const openModal = useCallback((modalName) => {
    setUiState(prev => ({
      ...prev,
      modals: { ...prev.modals, [modalName]: true }
    }))
  }, [])

  const closeModal = useCallback((modalName) => {
    setUiState(prev => ({
      ...prev,
      modals: { ...prev.modals, [modalName]: false }
    }))
  }, [])

  const closeAllModals = useCallback(() => {
    setUiState(prev => ({
      ...prev,
      modals: Object.keys(prev.modals).reduce((acc, key) => {
        acc[key] = false
        return acc
      }, {})
    }))
  }, [])

  /**
   * Session recovery
   */
  const startRecovery = useCallback((email) => {
    setRecoveryState({ email, isRecovering: true })
    
    // Simulate recovery process
    setTimeout(() => {
      setRecoveryState({ email: '', isRecovering: false })
      // Mock successful recovery
      updateCoreData({
        cvData: {
          name: 'Odzyskany użytkownik',
          email: email,
          rawText: 'Odzyskane dane CV...'
        }
      })
    }, 3000)
  }, [updateCoreData])

  /**
   * Clear all data
   */
  const clearAllData = useCallback(() => {
    setCoreData(INITIAL_CORE_DATA)
    setUiState(INITIAL_UI_STATE)
    setLoadingState(INITIAL_LOADING_STATE)
    setMetricsState(INITIAL_METRICS_STATE)
    setRecoveryState(INITIAL_RECOVERY_STATE)
    setSessionId(null)
    setLastSaved(null)

    // Clear session storage
    Object.values(SESSION_STORAGE_KEYS).forEach(key => {
      try {
        sessionStorage.removeItem(key)
      } catch (e) {
        console.warn('Failed to clear sessionStorage:', e)
      }
    })

    // Clear cache
    stateCache.clear()

    onStateChange?.('cleared', {})
  }, [onStateChange])

  /**
   * Export state for debugging
   */
  const exportState = useCallback(() => {
    return {
      coreData,
      uiState,
      loadingState,
      metricsState,
      recoveryState,
      sessionId,
      lastSaved,
      timestamp: new Date().toISOString()
    }
  }, [coreData, uiState, loadingState, metricsState, recoveryState, sessionId, lastSaved])

  // State management interface
  const stateInterface = {
    // Current state
    coreData,
    uiState,
    loadingState,
    metricsState,
    recoveryState,
    sessionId,
    lastSaved,

    // Update methods
    updateCoreData,
    updateUiState,
    updateLoadingState,
    updateMetricsState,
    setRecoveryState,

    // Modal management
    openModal,
    closeModal,
    closeAllModals,

    // Session management
    initializeFromSession,
    startRecovery,
    clearAllData,
    exportState
  }

  // Provide state through context or callbacks
  useEffect(() => {
    onStateChange?.('stateInterface', stateInterface)
  }, [stateInterface])

  // This component manages state but doesn't render UI
  return null
}

/**
 * State Hook for components
 */
export const useStateManager = (stateInterface) => {
  return stateInterface || {
    coreData: INITIAL_CORE_DATA,
    uiState: INITIAL_UI_STATE,
    loadingState: INITIAL_LOADING_STATE,
    metricsState: INITIAL_METRICS_STATE,
    recoveryState: INITIAL_RECOVERY_STATE,
    updateCoreData: () => {},
    updateUiState: () => {},
    updateLoadingState: () => {},
    updateMetricsState: () => {},
    openModal: () => {},
    closeModal: () => {},
    closeAllModals: () => {},
    clearAllData: () => {},
    exportState: () => ({})
  }
}

export default StateManager
export { 
  INITIAL_CORE_DATA, 
  INITIAL_UI_STATE, 
  INITIAL_LOADING_STATE,
  INITIAL_METRICS_STATE,
  SESSION_STORAGE_KEYS,
  validateSessionData
}