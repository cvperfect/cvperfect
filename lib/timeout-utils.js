/**
 * TIMEOUT & RATE LIMITING UTILITIES - CVPerfect
 * Request timeout management and performance optimization
 * 
 * Features:
 * - API request timeout handling
 * - Retry logic with exponential backoff
 * - Connection pool management
 * - Resource cleanup
 * - Performance monitoring
 */

class TimeoutManager {
    constructor() {
        this.defaultTimeout = 30000; // 30 seconds
        this.maxRetries = 3;
        this.baseDelay = 1000; // 1 second
        this.maxDelay = 30000; // 30 seconds
        this.activeRequests = new Map();
        this.connectionPools = new Map();
    }

    // Create timeout promise
    createTimeout(milliseconds, errorMessage = 'Operation timed out') {
        return new Promise((_, reject) => {
            const timeoutId = setTimeout(() => {
                const error = new Error(errorMessage);
                error.name = 'TimeoutError';
                error.code = 408;
                reject(error);
            }, milliseconds);

            // Store timeout for cleanup
            return timeoutId;
        });
    }

    // Race promise with timeout
    withTimeout(promise, timeout = this.defaultTimeout, errorMessage = 'Request timed out') {
        const timeoutPromise = this.createTimeout(timeout, errorMessage);
        
        return Promise.race([
            promise,
            timeoutPromise
        ]);
    }

    // Retry with exponential backoff
    async withRetry(operation, options = {}) {
        const {
            maxRetries = this.maxRetries,
            baseDelay = this.baseDelay,
            maxDelay = this.maxDelay,
            timeout = this.defaultTimeout,
            retryCondition = (error) => error.code >= 500 || error.name === 'TimeoutError'
        } = options;

        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.withTimeout(operation(), timeout);
                return result;
            } catch (error) {
                lastError = error;
                
                // Don't retry if condition not met or max retries reached
                if (!retryCondition(error) || attempt === maxRetries) {
                    throw error;
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
                const jitter = Math.random() * 0.1 * delay; // Add jitter
                
                await this.sleep(delay + jitter);
            }
        }

        throw lastError;
    }

    // Sleep utility
    sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    // Timeout middleware for Express
    middleware(timeout = this.defaultTimeout) {
        return (req, res, next) => {
            const requestId = this.generateRequestId();
            req.requestId = requestId;

            // Set request timeout
            req.setTimeout(timeout, () => {
                const error = new Error('Request timeout');
                error.name = 'TimeoutError';
                error.code = 408;
                error.timeout = timeout;
                
                if (!res.headersSent) {
                    res.status(408).json({
                        success: false,
                        error: {
                            type: 'Request Timeout',
                            message: 'Request took too long to process',
                            code: 408,
                            timeout: timeout,
                            requestId
                        }
                    });
                }
            });

            // Track active request
            this.activeRequests.set(requestId, {
                startTime: Date.now(),
                method: req.method,
                url: req.url,
                timeout
            });

            // Clean up on response finish
            res.on('finish', () => {
                this.activeRequests.delete(requestId);
            });

            next();
        };
    }

    // API-specific timeout configurations
    getAPITimeout(apiType) {
        const timeouts = {
            // Quick operations
            'session': 5000,
            'validation': 5000,
            'file-upload': 30000,
            
            // Medium operations  
            'cv-parsing': 15000,
            'email-send': 10000,
            'database': 10000,
            
            // Long operations
            'cv-analysis': 60000, // AI processing can be slow
            'pdf-generation': 30000,
            'docx-generation': 20000,
            
            // External APIs
            'stripe': 30000,
            'groq-api': 45000, // AI API can be slow
            'email-service': 15000
        };

        return timeouts[apiType] || this.defaultTimeout;
    }

    // Timeout configurations for different CVPerfect endpoints
    cvPerfectTimeouts() {
        return {
            '/api/parse-cv': this.getAPITimeout('cv-parsing'),
            '/api/analyze': this.getAPITimeout('cv-analysis'),
            '/api/create-checkout-session': this.getAPITimeout('stripe'),
            '/api/stripe-webhook': this.getAPITimeout('stripe'),
            '/api/contact': this.getAPITimeout('email-send'),
            '/api/save-session': this.getAPITimeout('session'),
            '/api/get-session-data': this.getAPITimeout('session'),
            '/api/export-pdf': this.getAPITimeout('pdf-generation'),
            '/api/export-docx': this.getAPITimeout('docx-generation')
        };
    }

    // Create timeout middleware for specific endpoint
    endpointTimeout(endpoint) {
        const timeouts = this.cvPerfectTimeouts();
        const timeout = timeouts[endpoint] || this.defaultTimeout;
        return this.middleware(timeout);
    }

    // External API request with timeout and retry
    async externalAPIRequest(apiName, requestFunction, options = {}) {
        const timeout = this.getAPITimeout(apiName);
        const retryOptions = {
            timeout,
            maxRetries: options.retries || 2,
            retryCondition: (error) => {
                // Retry on network errors and 5xx errors
                return error.name === 'TimeoutError' || 
                       error.code >= 500 || 
                       error.code === 'ECONNRESET' ||
                       error.code === 'ENOTFOUND';
            }
        };

        try {
            return await this.withRetry(requestFunction, retryOptions);
        } catch (error) {
            // Add context for external API errors
            error.apiName = apiName;
            error.timeout = timeout;
            throw error;
        }
    }

    // Groq API specific wrapper
    async groqAPIRequest(requestFunction, options = {}) {
        return this.externalAPIRequest('groq-api', requestFunction, {
            retries: 3, // AI APIs can be flaky
            ...options
        });
    }

    // Stripe API specific wrapper  
    async stripeAPIRequest(requestFunction, options = {}) {
        return this.externalAPIRequest('stripe', requestFunction, {
            retries: 2, // Stripe is usually reliable
            ...options
        });
    }

    // Email service wrapper
    async emailServiceRequest(requestFunction, options = {}) {
        return this.externalAPIRequest('email-service', requestFunction, {
            retries: 3, // Email can fail
            ...options
        });
    }

    // Connection pool cleanup
    cleanupConnections() {
        const now = Date.now();
        let cleaned = 0;

        // Clean up expired active requests
        for (const [requestId, request] of this.activeRequests.entries()) {
            if (now - request.startTime > request.timeout) {
                this.activeRequests.delete(requestId);
                cleaned++;
            }
        }

        return cleaned;
    }

    // Get performance statistics
    getPerformanceStats() {
        const now = Date.now();
        const activeRequests = Array.from(this.activeRequests.values());
        
        const stats = {
            activeRequests: activeRequests.length,
            averageRequestTime: 0,
            longestRunningRequest: 0,
            requestsByEndpoint: {},
            timeouts: {
                total: 0,
                byEndpoint: {}
            }
        };

        // Calculate average request time
        if (activeRequests.length > 0) {
            const totalTime = activeRequests.reduce((sum, req) => {
                return sum + (now - req.startTime);
            }, 0);
            
            stats.averageRequestTime = Math.round(totalTime / activeRequests.length);
            stats.longestRunningRequest = Math.max(...activeRequests.map(req => now - req.startTime));
        }

        // Group by endpoint
        for (const request of activeRequests) {
            const endpoint = request.url;
            stats.requestsByEndpoint[endpoint] = (stats.requestsByEndpoint[endpoint] || 0) + 1;
        }

        return stats;
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Singleton instance
const timeoutManager = new TimeoutManager();

// Convenience exports for CVPerfect APIs
const CVPerfectTimeouts = {
    // Basic timeout utilities
    withTimeout: (promise, timeout, message) => timeoutManager.withTimeout(promise, timeout, message),
    withRetry: (operation, options) => timeoutManager.withRetry(operation, options),
    sleep: (ms) => timeoutManager.sleep(ms),

    // Middleware
    middleware: (timeout) => timeoutManager.middleware(timeout),
    endpointTimeout: (endpoint) => timeoutManager.endpointTimeout(endpoint),

    // External API wrappers
    groqAPI: (requestFunction, options) => timeoutManager.groqAPIRequest(requestFunction, options),
    stripeAPI: (requestFunction, options) => timeoutManager.stripeAPIRequest(requestFunction, options),
    emailService: (requestFunction, options) => timeoutManager.emailServiceRequest(requestFunction, options),

    // Utility functions
    getAPITimeout: (apiType) => timeoutManager.getAPITimeout(apiType),
    cleanup: () => timeoutManager.cleanupConnections(),
    getStats: () => timeoutManager.getPerformanceStats(),

    // CVPerfect-specific configurations
    timeouts: () => timeoutManager.cvPerfectTimeouts()
};

module.exports = {
    TimeoutManager,
    CVPerfectTimeouts,
    timeoutManager
};