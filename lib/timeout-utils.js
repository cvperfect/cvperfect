/**
 * Unified Timeout Management System for CVPerfect API
 * Provides consistent timeout handling across all endpoints
 */

/**
 * Standard timeout values (in milliseconds)
 */
export const TIMEOUTS = {
  GROQ_API: 30000,           // 30 seconds for AI API calls
  STRIPE_API: 15000,         // 15 seconds for payment processing
  DATABASE: 10000,           // 10 seconds for database operations
  FILE_PROCESSING: 60000,    // 60 seconds for PDF/DOCX processing
  EMAIL_SENDING: 20000,      // 20 seconds for email delivery
  CHUNK_PROCESSING: 2000,    // 2 seconds per chunk (for AI processing)
  DEFAULT: 15000             // Default timeout for general operations
}

/**
 * Create a timeout promise that rejects after specified time
 * @param {number} ms - Timeout in milliseconds
 * @param {string} operation - Description of operation for error message
 * @returns {Promise} Promise that rejects with timeout error
 */
export function createTimeoutPromise(ms, operation = 'operation') {
  return new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`${operation} timeout after ${ms}ms`))
    }, ms)
    
    // Return cleanup function
    return () => clearTimeout(timeoutId)
  })
}

/**
 * Execute operation with timeout using Promise.race
 * @param {Promise} operation - Operation to execute
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} operationName - Name for error reporting
 * @returns {Promise} Operation result or timeout error
 */
export async function withTimeout(operation, timeout, operationName = 'operation') {
  const timeoutPromise = createTimeoutPromise(timeout, operationName)
  
  try {
    return await Promise.race([operation, timeoutPromise])
  } catch (error) {
    // Cleanup timeout if operation completes (won't affect rejection case)
    if (timeoutPromise.cleanup) {
      timeoutPromise.cleanup()
    }
    throw error
  }
}

/**
 * Create AbortController with automatic timeout
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Object} Controller and timeout ID for cleanup
 */
export function createAbortController(timeout = TIMEOUTS.DEFAULT) {
  const controller = new AbortController()
  
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)
  
  return {
    controller,
    timeoutId,
    cleanup: () => clearTimeout(timeoutId)
  }
}

/**
 * Calculate dynamic timeout based on content size and operation type
 * @param {string} content - Content to process
 * @param {string} operation - Type of operation ('ai', 'file', 'email', etc.)
 * @returns {number} Calculated timeout in milliseconds
 */
export function calculateDynamicTimeout(content, operation = 'default') {
  const contentSize = content?.length || 0
  
  // Base timeouts by operation type
  const baseTimeouts = {
    ai: TIMEOUTS.GROQ_API,
    file: TIMEOUTS.FILE_PROCESSING, 
    email: TIMEOUTS.EMAIL_SENDING,
    stripe: TIMEOUTS.STRIPE_API,
    database: TIMEOUTS.DATABASE,
    default: TIMEOUTS.DEFAULT
  }
  
  const baseTimeout = baseTimeouts[operation] || TIMEOUTS.DEFAULT
  
  // Add extra time for large content (1ms per character over 1000)
  const extraTime = Math.max(0, contentSize - 1000)
  
  // Cap at 5 minutes for any operation
  return Math.min(baseTimeout + extraTime, 300000)
}

/**
 * Chunked processing with per-chunk timeout and total timeout
 * @param {Array} chunks - Array of chunks to process
 * @param {Function} processor - Function to process each chunk
 * @param {Object} options - Options for timeout handling
 * @returns {Promise} Array of results
 */
export async function processWithChunkedTimeout(chunks, processor, options = {}) {
  const {
    chunkTimeout = TIMEOUTS.CHUNK_PROCESSING,
    totalTimeout = chunks.length * chunkTimeout + 5000, // 5s buffer
    delayBetweenChunks = 500 // Reduced from 1000ms
  } = options
  
  const startTime = Date.now()
  const results = []
  
  for (let i = 0; i < chunks.length; i++) {
    // Check if we're approaching total timeout
    const elapsed = Date.now() - startTime
    if (elapsed >= totalTimeout - chunkTimeout) {
      throw new Error(`Chunked processing timeout: exceeded ${totalTimeout}ms total time`)
    }
    
    // Process chunk with individual timeout
    try {
      const result = await withTimeout(
        processor(chunks[i], i),
        chunkTimeout,
        `chunk ${i + 1}/${chunks.length}`
      )
      results.push(result)
    } catch (error) {
      console.error(`❌ Chunk ${i + 1} failed:`, error.message)
      
      // Option to continue or fail fast
      if (options.failFast !== false) {
        throw error
      }
      
      results.push({ error: error.message, chunk: i })
    }
    
    // Delay between chunks (except last one)
    if (i < chunks.length - 1 && delayBetweenChunks > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenChunks))
    }
  }
  
  return results
}

/**
 * Retry operation with exponential backoff and timeout
 * @param {Function} operation - Operation to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Operation result
 */
export async function retryWithTimeout(operation, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    timeout = TIMEOUTS.DEFAULT,
    operationName = 'operation'
  } = options
  
  let lastError
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await withTimeout(operation(), timeout, operationName)
    } catch (error) {
      lastError = error
      console.warn(`⚠️ ${operationName} attempt ${attempt + 1}/${maxRetries} failed:`, error.message)
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
        const jitter = Math.random() * 0.1 * delay
        
        console.log(`🔄 Retrying ${operationName} in ${Math.round(delay + jitter)}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay + jitter))
      }
    }
  }
  
  throw lastError
}