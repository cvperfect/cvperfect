// Environment Variables Validation Utility
// Ensures all critical environment variables are present and valid

const REQUIRED_ENV_VARS = {
  // AI Services
  GROQ_API_KEY: {
    required: true,
    description: 'Groq API key for AI processing',
    validator: (value) => value && value.startsWith('gsk_') && value.length > 50
  },
  
  // Stripe Payment Processing
  STRIPE_SECRET_KEY: {
    required: true,
    description: 'Stripe secret key for payment processing',
    validator: (value) => value && value.startsWith('sk_') && value.length > 50
  },
  
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    required: true,
    description: 'Stripe publishable key for frontend',
    validator: (value) => value && value.startsWith('pk_') && value.length > 50
  },
  
  STRIPE_WEBHOOK_SECRET: {
    required: true,
    description: 'Stripe webhook secret for payment verification',
    validator: (value) => value && value.startsWith('whsec_') && value.length > 20
  },
  
  // Supabase Database
  NEXT_PUBLIC_SUPABASE_URL: {
    required: true,
    description: 'Supabase project URL',
    validator: (value) => value && value.startsWith('https://') && value.includes('.supabase.co')
  },
  
  SUPABASE_SERVICE_ROLE_KEY: {
    required: true,
    description: 'Supabase service role key for backend operations',
    validator: (value) => value && value.startsWith('eyJ') && value.length > 100
  },
  
  // Email Service
  GMAIL_USER: {
    required: true,
    description: 'Gmail username for email notifications',
    validator: (value) => value && value.includes('@') && value.endsWith('@gmail.com')
  },
  
  GMAIL_PASS: {
    required: true,
    description: 'Gmail app password for email notifications',
    validator: (value) => value && value.length >= 16 // App passwords are 16 chars
  },
  
  // Optional but recommended
  NEXTAUTH_SECRET: {
    required: false,
    description: 'NextAuth.js secret for session encryption',
    validator: (value) => !value || value.length >= 32
  },
  
  BASE_URL: {
    required: false,
    description: 'Base URL for the application',
    validator: (value) => !value || value.startsWith('http')
  }
}

/**
 * Validates all environment variables
 * @returns {Object} Validation results
 */
function validateEnvironmentVariables() {
  const results = {
    success: true,
    errors: [],
    warnings: [],
    missing: [],
    invalid: [],
    summary: {
      total: Object.keys(REQUIRED_ENV_VARS).length,
      present: 0,
      valid: 0,
      missing: 0,
      invalid: 0
    }
  }

  for (const [envVar, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[envVar]
    
    if (!value) {
      if (config.required) {
        results.errors.push(`Missing required environment variable: ${envVar}`)
        results.missing.push({
          name: envVar,
          description: config.description,
          required: config.required
        })
        results.summary.missing++
        results.success = false
      } else {
        results.warnings.push(`Optional environment variable not set: ${envVar}`)
      }
      continue
    }
    
    results.summary.present++
    
    // Validate the value if validator is provided
    if (config.validator && !config.validator(value)) {
      results.errors.push(`Invalid format for environment variable: ${envVar}`)
      results.invalid.push({
        name: envVar,
        description: config.description,
        currentValue: value.substring(0, 10) + '...'
      })
      results.summary.invalid++
      results.success = false
    } else {
      results.summary.valid++
    }
  }

  return results
}

/**
 * Validates environment variables and throws error if critical ones are missing
 * @param {Array} criticalVars - Array of critical variable names to check
 */
function ensureEnvironmentVariables(criticalVars = []) {
  const validation = validateEnvironmentVariables()
  
  if (!validation.success) {
    const missingCritical = validation.missing.filter(v => 
      criticalVars.length === 0 || criticalVars.includes(v.name)
    )
    
    if (missingCritical.length > 0) {
      throw new Error(
        `Missing critical environment variables: ${missingCritical.map(v => v.name).join(', ')}\n` +
        `Please check your .env.local file and ensure all required variables are set.`
      )
    }
  }
  
  return validation
}

/**
 * Get masked environment variable for logging (safe display)
 * @param {string} envVar - Environment variable name
 * @returns {string} Masked value for safe logging
 */
function getMaskedEnvVar(envVar) {
  const value = process.env[envVar]
  if (!value) return 'NOT_SET'
  
  // Show first few characters for identification
  if (value.length <= 10) return value.substring(0, 3) + '...'
  return value.substring(0, 8) + '...' + value.substring(value.length - 4)
}

/**
 * Test API connections using environment variables
 * @returns {Object} Connection test results
 */
async function testAPIConnections() {
  const results = {
    groq: { success: false, error: null },
    supabase: { success: false, error: null },
    stripe: { success: false, error: null }
  }
  
  // Test Groq
  try {
    if (process.env.GROQ_API_KEY) {
      const Groq = require('groq-sdk')
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
      results.groq.success = true
    } else {
      results.groq.error = 'GROQ_API_KEY not set'
    }
  } catch (error) {
    results.groq.error = error.message
  }
  
  // Test Supabase
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      results.supabase.success = true
    } else {
      results.supabase.error = 'Supabase environment variables not set'
    }
  } catch (error) {
    results.supabase.error = error.message
  }
  
  // Test Stripe
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const Stripe = require('stripe')
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      results.stripe.success = true
    } else {
      results.stripe.error = 'STRIPE_SECRET_KEY not set'
    }
  } catch (error) {
    results.stripe.error = error.message
  }
  
  return results
}

/**
 * Generate environment setup recommendations
 * @param {Object} validation - Validation results from validateEnvironmentVariables
 * @returns {Array} Array of setup recommendations
 */
function generateSetupRecommendations(validation) {
  const recommendations = []
  
  if (validation.missing.length > 0) {
    recommendations.push('Create/update .env.local file with missing variables:')
    validation.missing.forEach(v => {
      recommendations.push(`  ${v.name}=your_${v.name.toLowerCase()}_here  # ${v.description}`)
    })
  }
  
  if (validation.invalid.length > 0) {
    recommendations.push('Fix invalid environment variable formats:')
    validation.invalid.forEach(v => {
      recommendations.push(`  ${v.name} - ${v.description}`)
    })
  }
  
  if (validation.success) {
    recommendations.push('✅ All environment variables are properly configured!')
  }
  
  return recommendations
}

module.exports = {
  REQUIRED_ENV_VARS,
  validateEnvironmentVariables,
  ensureEnvironmentVariables,
  getMaskedEnvVar,
  testAPIConnections,
  generateSetupRecommendations
}