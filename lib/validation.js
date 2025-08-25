/**
 * Comprehensive Input Validation System for CVPerfect API
 * Provides consistent validation across all endpoints
 */

import { ErrorTypes } from './error-responses'

/**
 * Email validation regex (stricter than basic)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * Common validation rules
 */
export const ValidationRules = {
  // Email validation
  email: {
    required: true,
    minLength: 5,
    maxLength: 254, // RFC 5321 limit
    pattern: EMAIL_REGEX,
    errorMessage: 'Invalid email format'
  },
  
  // CV text validation
  cvText: {
    required: true,
    minLength: 100,
    maxLength: 50000, // 50KB limit
    errorMessage: 'CV text must be between 100 and 50,000 characters'
  },
  
  // Job posting validation
  jobPosting: {
    required: false,
    maxLength: 10000, // 10KB limit
    errorMessage: 'Job posting must not exceed 10,000 characters'
  },
  
  // Name validation
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-'\.]+$/,
    errorMessage: 'Name must contain only letters, spaces, hyphens, and dots'
  },
  
  // Session ID validation
  sessionId: {
    required: true,
    pattern: /^sess_[a-zA-Z0-9]+$/,
    minLength: 10,
    maxLength: 50,
    errorMessage: 'Invalid session ID format'
  },
  
  // Plan validation
  plan: {
    required: false,
    enum: ['basic', 'gold', 'premium'],
    errorMessage: 'Plan must be basic, gold, or premium'
  },
  
  // Template validation
  template: {
    required: false,
    enum: ['simple', 'modern', 'executive', 'creative', 'tech', 'luxury', 'minimal'],
    errorMessage: 'Invalid template selection'
  },
  
  // Language validation
  language: {
    required: false,
    enum: ['pl', 'en'],
    defaultValue: 'pl',
    errorMessage: 'Language must be pl or en'
  },
  
  // Subject validation (for contact form)
  subject: {
    required: true,
    minLength: 5,
    maxLength: 200,
    errorMessage: 'Subject must be between 5 and 200 characters'
  },
  
  // Message validation (for contact form)
  message: {
    required: true,
    minLength: 10,
    maxLength: 5000,
    errorMessage: 'Message must be between 10 and 5,000 characters'
  },
  
  // Boolean validation
  boolean: {
    type: 'boolean',
    errorMessage: 'Must be true or false'
  }
}

/**
 * Validate a single field against its rules
 * @param {*} value - Value to validate
 * @param {Object} rules - Validation rules
 * @param {string} fieldName - Name of the field
 * @returns {Object} Validation result
 */
export function validateField(value, rules, fieldName) {
  // Check required
  if (rules.required && (value === undefined || value === null || value === '')) {
    return {
      valid: false,
      error: `Field '${fieldName}' is required`,
      code: 'REQUIRED_FIELD'
    }
  }
  
  // If not required and empty, skip other validations
  if (!rules.required && (value === undefined || value === null || value === '')) {
    return { valid: true, value: rules.defaultValue || value }
  }
  
  // Type validation
  if (rules.type && typeof value !== rules.type) {
    return {
      valid: false,
      error: `Field '${fieldName}' must be of type ${rules.type}`,
      code: 'INVALID_TYPE'
    }
  }
  
  // String validations
  if (typeof value === 'string') {
    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return {
        valid: false,
        error: `Field '${fieldName}' must be at least ${rules.minLength} characters`,
        code: 'TOO_SHORT'
      }
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return {
        valid: false,
        error: `Field '${fieldName}' must not exceed ${rules.maxLength} characters`,
        code: 'TOO_LONG'
      }
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return {
        valid: false,
        error: rules.errorMessage || `Field '${fieldName}' format is invalid`,
        code: 'INVALID_FORMAT'
      }
    }
  }
  
  // Enum validation
  if (rules.enum && !rules.enum.includes(value)) {
    return {
      valid: false,
      error: `Field '${fieldName}' must be one of: ${rules.enum.join(', ')}`,
      code: 'INVALID_ENUM'
    }
  }
  
  return { valid: true, value: value }
}

/**
 * Validate multiple fields against a schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} Validation result with all errors
 */
export function validateSchema(data, schema) {
  const errors = []
  const validatedData = {}
  
  // Validate each field in schema
  for (const [fieldName, rules] of Object.entries(schema)) {
    const result = validateField(data[fieldName], rules, fieldName)
    
    if (!result.valid) {
      errors.push({
        field: fieldName,
        error: result.error,
        code: result.code
      })
    } else {
      validatedData[fieldName] = result.value
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    data: validatedData
  }
}

/**
 * Pre-defined validation schemas for common endpoints
 */
export const ValidationSchemas = {
  // CV analysis endpoint
  cvAnalysis: {
    currentCV: ValidationRules.cvText,
    jobPosting: ValidationRules.jobPosting,
    email: ValidationRules.email,
    paid: ValidationRules.boolean,
    plan: ValidationRules.plan
  },
  
  // Contact form
  contact: {
    name: ValidationRules.name,
    email: ValidationRules.email,
    subject: ValidationRules.subject,
    message: ValidationRules.message,
    isPremium: ValidationRules.boolean
  },
  
  // Session data
  sessionData: {
    sessionId: ValidationRules.sessionId,
    cvData: ValidationRules.cvText,
    email: ValidationRules.email,
    plan: ValidationRules.plan,
    template: ValidationRules.template
  },
  
  // Demo optimization
  demoOptimize: {
    currentCV: ValidationRules.cvText,
    jobText: ValidationRules.jobPosting,
    language: ValidationRules.language,
    preservePhotos: ValidationRules.boolean
  }
}

/**
 * Sanitize input data to prevent XSS and injection attacks
 * @param {*} data - Data to sanitize
 * @returns {*} Sanitized data
 */
export function sanitizeInput(data) {
  if (typeof data === 'string') {
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim()
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput)
  }
  
  if (data && typeof data === 'object') {
    const sanitized = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return data
}

/**
 * Middleware function for request validation
 * @param {Object} schema - Validation schema
 * @param {boolean} sanitize - Whether to sanitize input
 * @returns {Function} Express middleware
 */
export function withValidation(schema, sanitize = true) {
  return (req, res, next) => {
    let data = req.body
    
    // Sanitize input if requested
    if (sanitize) {
      data = sanitizeInput(data)
    }
    
    // Validate against schema
    const validation = validateSchema(data, schema)
    
    if (!validation.valid) {
      const firstError = validation.errors[0]
      return sendErrorResponse(res, ErrorTypes.VALIDATION_ERROR(
        firstError.field,
        firstError.error
      ))
    }
    
    // Attach validated data to request
    req.validatedData = validation.data
    return next()
  }
}

/**
 * Quick validation functions for common cases
 */
export const QuickValidation = {
  isEmail: (email) => EMAIL_REGEX.test(email),
  
  isSessionId: (sessionId) => ValidationRules.sessionId.pattern.test(sessionId),
  
  isValidPlan: (plan) => ValidationRules.plan.enum.includes(plan),
  
  isValidTemplate: (template) => ValidationRules.template.enum.includes(template),
  
  sanitizeText: (text) => sanitizeInput(text)
}