/**
 * Standardized Error Response System for CVPerfect API
 * Provides consistent error formatting across all endpoints
 */

/**
 * Standard error response structure
 * @param {string} message - User-friendly error message
 * @param {string} code - Error code for debugging
 * @param {number} status - HTTP status code
 * @param {Object} details - Additional error details (development only)
 * @returns {Object} Standardized error response
 */
export function createErrorResponse(message, code, status = 500, details = null) {
  const response = {
    success: false,
    error: message,
    code: code,
    timestamp: new Date().toISOString()
  }

  // Only include details in development mode
  if (process.env.NODE_ENV === 'development' && details) {
    response.details = details
  }

  return { response, status }
}

/**
 * Common error types with standardized messages
 */
export const ErrorTypes = {
  METHOD_NOT_ALLOWED: (method) => createErrorResponse(
    `Method ${method} not allowed`,
    'METHOD_NOT_ALLOWED',
    405
  ),
  
  MISSING_PARAMETERS: (params) => createErrorResponse(
    `Missing required parameters: ${params.join(', ')}`,
    'MISSING_PARAMETERS',
    400
  ),
  
  INVALID_FORMAT: (field) => createErrorResponse(
    `Invalid format for field: ${field}`,
    'INVALID_FORMAT',
    400
  ),
  
  FILE_TOO_LARGE: (maxSize) => createErrorResponse(
    `File size exceeds maximum limit of ${maxSize}`,
    'FILE_TOO_LARGE',
    413
  ),
  
  UNAUTHORIZED: () => createErrorResponse(
    'Unauthorized access',
    'UNAUTHORIZED',
    401
  ),
  
  RATE_LIMITED: (retryAfter) => createErrorResponse(
    `Rate limit exceeded. Try again in ${retryAfter} seconds`,
    'RATE_LIMITED',
    429
  ),
  
  DATABASE_ERROR: () => createErrorResponse(
    'Database operation failed',
    'DATABASE_ERROR',
    500
  ),
  
  EXTERNAL_SERVICE_ERROR: (service) => createErrorResponse(
    `External service unavailable: ${service}`,
    'EXTERNAL_SERVICE_ERROR',
    502
  ),
  
  VALIDATION_ERROR: (field, reason) => createErrorResponse(
    `Validation failed for ${field}: ${reason}`,
    'VALIDATION_ERROR',
    400
  ),
  
  SESSION_NOT_FOUND: () => createErrorResponse(
    'Session not found or expired',
    'SESSION_NOT_FOUND',
    404
  ),
  
  CORS_VIOLATION: () => createErrorResponse(
    'CORS policy violation',
    'CORS_VIOLATION',
    403
  )
}

/**
 * Helper function to send standardized error response
 * @param {Object} res - Next.js response object
 * @param {Object} errorResponse - Error response from createErrorResponse or ErrorTypes
 */
export function sendErrorResponse(res, errorResponse) {
  const { response, status } = errorResponse
  res.setHeader('Content-Type', 'application/json')
  return res.status(status).json(response)
}

/**
 * Wrapper for API handlers with automatic error standardization
 * @param {Function} handler - Original API handler
 * @returns {Function} Wrapped handler with error standardization
 */
export function withStandardizedErrors(handler) {
  return async (req, res) => {
    try {
      return await handler(req, res)
    } catch (error) {
      console.error('❌ Unhandled API error:', error)
      
      // Standardize unexpected errors
      const errorResponse = createErrorResponse(
        'Internal server error',
        'INTERNAL_ERROR',
        500,
        error.message
      )
      
      return sendErrorResponse(res, errorResponse)
    }
  }
}