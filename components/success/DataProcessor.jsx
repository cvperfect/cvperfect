import React from 'react'
import DOMPurify from 'dompurify'

/**
 * DataProcessor - XSS Protection and Data Validation
 * Extracted from success.js for bundle optimization
 * BUNDLE REDUCTION: Lazy loadable security system
 */

/**
 * XSS Protection Configuration
 */
const XSS_CONFIG = {
  ALLOWED_TAGS: [
    'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 
    'ul', 'ol', 'li', 'span', 'img', 'section', 'article'
  ],
  ALLOWED_ATTR: [
    'class', 'style', 'src', 'alt', 'href', 'title', 'id'
  ],
  KEEP_CONTENT: true,
  FORBID_SCRIPT: true,
  ALLOW_DATA_ATTR: false
}

/**
 * Data Validation Rules
 */
const VALIDATION_RULES = {
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    maxLength: 254,
    required: true
  },
  name: {
    pattern: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-'.]{2,50}$/,
    minLength: 2,
    maxLength: 50,
    required: true
  },
  phone: {
    pattern: /^[+]?[\d\s\-()]{7,20}$/,
    minLength: 7,
    maxLength: 20,
    required: false
  },
  sessionId: {
    pattern: /^[a-zA-Z0-9_-]{8,64}$/,
    minLength: 8,
    maxLength: 64,
    required: true
  },
  cvContent: {
    minLength: 10,
    maxLength: 50000,
    required: true
  }
}

/**
 * HTML Sanitization with XSS Protection
 */
const sanitizeHTML = (htmlContent, customConfig = {}) => {
  if (typeof window === 'undefined' || !htmlContent) {
    return htmlContent || ''
  }

  try {
    const config = { ...XSS_CONFIG, ...customConfig }
    
    const sanitized = DOMPurify.sanitize(htmlContent, config)
    
    // Additional security checks
    if (sanitized.includes('<script>') || sanitized.includes('javascript:')) {
      console.warn('🚨 XSS attempt detected and blocked')
      return '[CONTENT_BLOCKED: Security violation detected]'
    }

    return sanitized
  } catch (error) {
    console.error('XSS sanitization failed:', error)
    return '[ERROR: Content could not be processed safely]'
  }
}

/**
 * CV Content Parser and Sanitizer
 */
const processCV = (rawContent) => {
  if (!rawContent || typeof rawContent !== 'string') {
    return {
      valid: false,
      error: 'Invalid CV content format',
      data: null
    }
  }

  // Length validation
  if (rawContent.length < VALIDATION_RULES.cvContent.minLength) {
    return {
      valid: false,
      error: `CV content too short (minimum ${VALIDATION_RULES.cvContent.minLength} characters)`,
      data: null
    }
  }

  if (rawContent.length > VALIDATION_RULES.cvContent.maxLength) {
    return {
      valid: false,
      error: `CV content too long (maximum ${VALIDATION_RULES.cvContent.maxLength} characters)`,
      data: null
    }
  }

  try {
    // Sanitize HTML content
    const sanitizedContent = sanitizeHTML(rawContent)
    
    // Basic CV data extraction
    const lines = sanitizedContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    const extractedData = {
      name: extractName(lines),
      email: extractEmail(sanitizedContent),
      phone: extractPhone(sanitizedContent),
      rawText: sanitizedContent,
      sections: extractSections(lines),
      wordCount: sanitizedContent.split(/\s+/).length,
      characterCount: sanitizedContent.length
    }

    return {
      valid: true,
      error: null,
      data: extractedData
    }

  } catch (error) {
    return {
      valid: false,
      error: `CV processing failed: ${error.message}`,
      data: null
    }
  }
}

/**
 * Name extraction from CV content
 */
const extractName = (lines) => {
  if (!lines || lines.length === 0) return ''

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i]
    
    // Skip common headers
    if (/^(cv|resume|curriculum|životopis)/i.test(line)) continue
    
    // Look for name pattern (Polish names)
    if (VALIDATION_RULES.name.pattern.test(line)) {
      const words = line.split(/\s+/)
      if (words.length >= 2 && words.length <= 4) {
        return words.slice(0, 3).join(' ')
      }
    }
  }
  
  return ''
}

/**
 * Email extraction from CV content
 */
const extractEmail = (content) => {
  const emailMatch = content.match(VALIDATION_RULES.email.pattern)
  return emailMatch ? emailMatch[0] : ''
}

/**
 * Phone extraction from CV content
 */
const extractPhone = (content) => {
  const phoneMatch = content.match(VALIDATION_RULES.phone.pattern)
  return phoneMatch ? phoneMatch[0].trim() : ''
}

/**
 * Section extraction from CV lines
 */
const extractSections = (lines) => {
  const sections = []
  let currentSection = null
  
  const sectionKeywords = [
    'doświadczenie', 'experience', 'praca', 'work',
    'wykształcenie', 'education', 'edukacja', 'nauka',
    'umiejętności', 'skills', 'kompetencje', 'zdolności',
    'języki', 'languages', 'język', 'language',
    'certyfikaty', 'certificates', 'certifications',
    'projekty', 'projects', 'osiągnięcia', 'achievements'
  ]

  lines.forEach(line => {
    const lowerLine = line.toLowerCase()
    const isSection = sectionKeywords.some(keyword => 
      lowerLine.includes(keyword) && line.length < 50
    )

    if (isSection) {
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        title: line,
        content: []
      }
    } else if (currentSection && line.length > 3) {
      currentSection.content.push(line)
    }
  })

  if (currentSection) {
    sections.push(currentSection)
  }

  return sections
}

/**
 * Data Validator Function
 */
const validateData = (data, fieldName) => {
  if (!data || !fieldName || !VALIDATION_RULES[fieldName]) {
    return {
      valid: false,
      error: 'Invalid validation parameters'
    }
  }

  const rules = VALIDATION_RULES[fieldName]
  const value = String(data).trim()

  // Required field check
  if (rules.required && (!value || value.length === 0)) {
    return {
      valid: false,
      error: `${fieldName} is required`
    }
  }

  // Length validation
  if (rules.minLength && value.length < rules.minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${rules.minLength} characters`
    }
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return {
      valid: false,
      error: `${fieldName} must not exceed ${rules.maxLength} characters`
    }
  }

  // Pattern validation
  if (rules.pattern && value && !rules.pattern.test(value)) {
    return {
      valid: false,
      error: `${fieldName} has invalid format`
    }
  }

  return {
    valid: true,
    error: null
  }
}

/**
 * Session Data Sanitizer
 */
const sanitizeSessionData = (sessionData) => {
  if (!sessionData || typeof sessionData !== 'object') {
    return {
      valid: false,
      error: 'Invalid session data format',
      data: null
    }
  }

  try {
    const sanitizedData = {}

    // Sanitize CV content
    if (sessionData.currentCV) {
      const cvResult = processCV(sessionData.currentCV)
      if (!cvResult.valid) {
        return {
          valid: false,
          error: `CV validation failed: ${cvResult.error}`,
          data: null
        }
      }
      sanitizedData.cvData = cvResult.data
      sanitizedData.currentCV = cvResult.data.rawText
    }

    // Validate email
    if (sessionData.email) {
      const emailValidation = validateData(sessionData.email, 'email')
      if (!emailValidation.valid) {
        return {
          valid: false,
          error: `Email validation failed: ${emailValidation.error}`,
          data: null
        }
      }
      sanitizedData.email = sessionData.email.trim().toLowerCase()
    }

    // Validate session ID
    if (sessionData.sessionId) {
      const sessionValidation = validateData(sessionData.sessionId, 'sessionId')
      if (!sessionValidation.valid) {
        return {
          valid: false,
          error: `Session ID validation failed: ${sessionValidation.error}`,
          data: null
        }
      }
      sanitizedData.sessionId = sessionData.sessionId.trim()
    }

    // Sanitize job posting if present
    if (sessionData.jobPosting) {
      sanitizedData.jobPosting = sanitizeHTML(sessionData.jobPosting)
    }

    // Validate plan
    const validPlans = ['basic', 'gold', 'premium']
    if (sessionData.plan && validPlans.includes(sessionData.plan)) {
      sanitizedData.userPlan = sessionData.plan
    } else {
      sanitizedData.userPlan = 'basic' // Default fallback
    }

    return {
      valid: true,
      error: null,
      data: sanitizedData
    }

  } catch (error) {
    return {
      valid: false,
      error: `Session data sanitization failed: ${error.message}`,
      data: null
    }
  }
}

/**
 * URL Validator
 */
const validateURL = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Invalid URL format' }
  }

  try {
    const urlObj = new URL(url)
    
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'Invalid URL protocol' }
    }

    // Block common suspicious patterns
    const suspiciousPatterns = [
      'javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'
    ]

    if (suspiciousPatterns.some(pattern => url.toLowerCase().includes(pattern))) {
      return { valid: false, error: 'Blocked URL pattern detected' }
    }

    return { valid: true, error: null, url: urlObj.href }
  } catch (_error) {
    return { valid: false, error: 'Malformed URL' }
  }
}

/**
 * File Upload Validator
 */
const validateFileUpload = (file) => {
  if (!file || !file.name || !file.type) {
    return {
      valid: false,
      error: 'Invalid file object'
    }
  }

  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ]

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Only PDF, DOCX, DOC, and TXT files are supported.'
    }
  }

  // File size limit (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 5MB.'
    }
  }

  // File name validation
  const nameValidation = validateData(file.name, 'name')
  if (!nameValidation.valid) {
    return {
      valid: false,
      error: 'Invalid file name'
    }
  }

  return {
    valid: true,
    error: null,
    fileInfo: {
      name: file.name,
      type: file.type,
      size: file.size
    }
  }
}

/**
 * Main DataProcessor Component
 */
const DataProcessor = ({ 
  onDataProcessed,
  _onValidationError,
  enableLogging = false 
}) => {
  
  // Expose DOMPurify globally for testing if enabled
  React.useEffect(() => {
    if (typeof window !== 'undefined' && enableLogging) {
      window.DOMPurify = DOMPurify
      console.log('🛡️ DataProcessor: XSS protection enabled')
    }
  }, [enableLogging])

  // Processing interface
  const processingInterface = {
    sanitizeHTML,
    processCV,
    validateData,
    sanitizeSessionData,
    validateURL,
    validateFileUpload,
    
    // Utility functions
    extractName: (content) => extractName(content.split('\n')),
    extractEmail,
    extractPhone,
    
    // Configuration
    getValidationRules: () => VALIDATION_RULES,
    getXSSConfig: () => XSS_CONFIG
  }

  // Provide processing interface through callback
  React.useEffect(() => {
    if (onDataProcessed) {
      onDataProcessed(processingInterface)
    }
  }, [onDataProcessed])

  // This component provides utilities but doesn't render UI
  return null
}

export default DataProcessor
export {
  XSS_CONFIG,
  VALIDATION_RULES,
  processCV,
  validateData,
  sanitizeSessionData,
  validateURL,
  validateFileUpload
}