/**
 * Request Size Limiting Middleware for CVPerfect API
 * Prevents oversized requests that could cause memory issues
 */

import { ErrorTypes, sendErrorResponse } from './error-responses'

/**
 * Size limits for different types of requests (in bytes)
 */
export const SIZE_LIMITS = {
  CV_TEXT: 50 * 1024,        // 50KB for CV text content
  JOB_POSTING: 10 * 1024,    // 10KB for job postings
  EMAIL_CONTENT: 5 * 1024,   // 5KB for email messages
  JSON_PAYLOAD: 1024 * 1024, // 1MB for general JSON payloads
  FILE_UPLOAD: 5 * 1024 * 1024, // 5MB for file uploads (handled by formidable)
  TOTAL_REQUEST: 10 * 1024 * 1024 // 10MB total request limit
}

/**
 * Validate request body size
 * @param {Object} req - Request object
 * @param {number} limit - Size limit in bytes
 * @returns {boolean} Whether request is within limit
 */
export function validateRequestSize(req, limit) {
  const contentLength = parseInt(req.headers['content-length'] || '0')
  return contentLength <= limit
}

/**
 * Validate specific field sizes in request body
 * @param {Object} body - Request body
 * @param {Object} fieldLimits - Object with field names and their size limits
 * @returns {Object} Validation result
 */
export function validateFieldSizes(body, fieldLimits) {
  for (const [field, limit] of Object.entries(fieldLimits)) {
    if (body[field]) {
      const size = Buffer.byteLength(JSON.stringify(body[field]), 'utf8')
      if (size > limit) {
        return {
          valid: false,
          field,
          size,
          limit,
          error: `Field '${field}' exceeds size limit: ${size} bytes > ${limit} bytes`
        }
      }
    }
  }
  return { valid: true }
}

/**
 * Middleware to enforce request size limits
 * @param {number} totalLimit - Total request size limit
 * @param {Object} fieldLimits - Per-field size limits
 * @returns {Function} Express middleware
 */
export function withSizeLimits(totalLimit = SIZE_LIMITS.TOTAL_REQUEST, fieldLimits = {}) {
  return async (req, res, next) => {
    // Check total request size
    if (!validateRequestSize(req, totalLimit)) {
      const contentLength = parseInt(req.headers['content-length'] || '0')
      return sendErrorResponse(res, ErrorTypes.FILE_TOO_LARGE(
        `${Math.round(totalLimit / 1024 / 1024)}MB`
      ))
    }

    // If we have a parsed body, check field sizes
    if (req.body && Object.keys(fieldLimits).length > 0) {
      const validation = validateFieldSizes(req.body, fieldLimits)
      if (!validation.valid) {
        return sendErrorResponse(res, ErrorTypes.VALIDATION_ERROR(
          validation.field,
          `Size ${validation.size} bytes exceeds limit ${validation.limit} bytes`
        ))
      }
    }

    return next()
  }
}

/**
 * Pre-configured middleware for common API endpoints
 */
export const SizeLimitMiddleware = {
  // For CV analysis endpoints
  cvAnalysis: withSizeLimits(SIZE_LIMITS.TOTAL_REQUEST, {
    currentCV: SIZE_LIMITS.CV_TEXT,
    jobPosting: SIZE_LIMITS.JOB_POSTING
  }),
  
  // For contact form
  contact: withSizeLimits(SIZE_LIMITS.JSON_PAYLOAD, {
    message: SIZE_LIMITS.EMAIL_CONTENT,
    subject: 1024 // 1KB for subject
  }),
  
  // For session data
  session: withSizeLimits(SIZE_LIMITS.TOTAL_REQUEST, {
    cvData: SIZE_LIMITS.CV_TEXT
  }),
  
  // For file uploads (handled by formidable, but we can still check headers)
  fileUpload: withSizeLimits(SIZE_LIMITS.FILE_UPLOAD, {}),
  
  // General API endpoints
  general: withSizeLimits(SIZE_LIMITS.JSON_PAYLOAD, {})
}

/**
 * Check if uploaded file size is within limits
 * @param {Object} file - File object from formidable
 * @param {number} limit - Size limit in bytes
 * @returns {boolean} Whether file is within limit
 */
export function validateFileSize(file, limit = SIZE_LIMITS.FILE_UPLOAD) {
  return file && file.size <= limit
}

/**
 * Format bytes to human readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}