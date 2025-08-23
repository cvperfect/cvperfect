/**
 * Secure CORS Configuration for CVPerfect
 * Replaces wildcard CORS with specific allowed origins
 */

/**
 * Get allowed origins based on environment
 * @returns {string[]} Array of allowed origins
 */
export function getAllowedOrigins() {
  if (process.env.NODE_ENV === 'development') {
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'https://cvperfect.pl',
      'https://www.cvperfect.pl'
    ]
  }
  
  return [
    'https://cvperfect.pl',
    'https://www.cvperfect.pl'
  ]
}

/**
 * Set secure CORS headers for API endpoints
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {boolean} Whether origin is allowed
 */
export function setSecureCORS(req, res) {
  const allowedOrigins = getAllowedOrigins()
  const origin = req.headers.origin
  
  // Check if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  } else if (process.env.NODE_ENV === 'development' && !origin) {
    // Allow same-origin requests in development - detect current port
    const currentPort = req.headers.host?.split(':')[1] || '3000'
    res.setHeader('Access-Control-Allow-Origin', `http://localhost:${currentPort}`)
  } else {
    // Log suspicious requests
    console.log('🚫 CORS blocked origin:', origin || 'unknown')
    res.setHeader('Access-Control-Allow-Origin', 'null')
  }
  
  // Set other CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Max-Age', '86400') // 24 hours preflight cache
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return allowedOrigins.includes(origin) || (!origin && process.env.NODE_ENV === 'development')
}

/**
 * Handle CORS preflight requests
 * @param {Object} req - Request object  
 * @param {Object} res - Response object
 * @returns {boolean} Whether to continue processing
 */
export function handleCORSPreflight(req, res) {
  if (req.method === 'OPTIONS') {
    const isAllowed = setSecureCORS(req, res)
    
    if (isAllowed) {
      res.status(200).end()
    } else {
      res.status(403).json({ 
        success: false, 
        error: 'CORS policy violation' 
      })
    }
    
    return false // Stop processing
  }
  
  // Set CORS for non-preflight requests
  setSecureCORS(req, res)
  return true // Continue processing
}

/**
 * Middleware function for API routes
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with CORS
 */
export function withSecureCORS(handler) {
  return async (req, res) => {
    // Handle CORS
    const shouldContinue = handleCORSPreflight(req, res)
    
    if (!shouldContinue) {
      return // CORS preflight handled
    }
    
    // Continue with original handler
    return handler(req, res)
  }
}

/**
 * Check if request origin is allowed (for logging/monitoring)
 * @param {Object} req - Request object
 * @returns {Object} Origin check result
 */
export function checkOrigin(req) {
  const allowedOrigins = getAllowedOrigins()
  const origin = req.headers.origin
  
  return {
    origin: origin,
    allowed: allowedOrigins.includes(origin),
    isLocal: origin?.includes('localhost') || origin?.includes('127.0.0.1'),
    isDevelopment: process.env.NODE_ENV === 'development'
  }
}