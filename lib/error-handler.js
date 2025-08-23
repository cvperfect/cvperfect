/**
 * Global error handler for API routes
 * Ensures all API endpoints always return JSON responses
 */

/**
 * Wrap API handler with error handling to ensure JSON responses
 * @param {Function} handler - Original API handler function
 * @returns {Function} Wrapped handler with error handling
 */
export function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      // Set JSON content type by default
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json')
      }
      
      await handler(req, res)
    } catch (error) {
      console.error('🚨 Unhandled API error:', error)
      
      // Ensure JSON response even on catastrophic errors
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'application/json')
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        })
      }
    }
  }
}

/**
 * Standard error response format
 * @param {Object} res - Response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 */
export function sendErrorResponse(res, statusCode, message, details = {}) {
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json')
    res.status(statusCode).json({
      success: false,
      error: message,
      ...details
    })
  }
}

/**
 * Standard success response format
 * @param {Object} res - Response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Success data
 */
export function sendSuccessResponse(res, statusCode = 200, data = {}) {
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json')
    res.status(statusCode).json({
      success: true,
      ...data
    })
  }
}

/**
 * Validate request method
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string|string[]} allowedMethods - Allowed HTTP methods
 * @returns {boolean} Whether method is allowed
 */
export function validateMethod(req, res, allowedMethods) {
  const methods = Array.isArray(allowedMethods) ? allowedMethods : [allowedMethods]
  
  if (!methods.includes(req.method)) {
    sendErrorResponse(res, 405, `Method not allowed. Only ${methods.join(', ')} requests are accepted.`)
    return false
  }
  
  return true
}

/**
 * Validate required fields in request body
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string[]} requiredFields - Required field names
 * @returns {boolean} Whether all required fields are present
 */
export function validateRequiredFields(req, res, requiredFields) {
  const missing = requiredFields.filter(field => !req.body[field])
  
  if (missing.length > 0) {
    sendErrorResponse(res, 400, `Missing required fields: ${missing.join(', ')}`)
    return false
  }
  
  return true
}