/**
 * ERROR RESPONSE HANDLING - CVPerfect
 * Standardized error handling and logging system
 * 
 * Features:
 * - Consistent error response format
 * - Error logging and monitoring
 * - Security-conscious error messages
 * - Error categorization and codes
 * - Request context preservation
 */

const fs = require('fs');
const path = require('path');

class ErrorResponseHandler {
    constructor() {
        this.logDirectory = path.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
        
        this.errorCategories = {
            VALIDATION: { code: 400, type: 'Client Error' },
            AUTHENTICATION: { code: 401, type: 'Authentication Error' },
            AUTHORIZATION: { code: 403, type: 'Authorization Error' },
            NOT_FOUND: { code: 404, type: 'Not Found' },
            RATE_LIMIT: { code: 429, type: 'Rate Limit Exceeded' },
            SERVER_ERROR: { code: 500, type: 'Internal Server Error' },
            SERVICE_UNAVAILABLE: { code: 503, type: 'Service Unavailable' },
            PAYMENT_ERROR: { code: 402, type: 'Payment Required' },
            FILE_ERROR: { code: 413, type: 'File Processing Error' },
            EXTERNAL_API: { code: 502, type: 'External API Error' }
        };

        this.secureMessages = {
            // Don't expose internal details
            DATABASE_ERROR: 'A database error occurred',
            API_KEY_ERROR: 'External service configuration error',
            FILE_SYSTEM_ERROR: 'File processing error',
            UNKNOWN_ERROR: 'An unexpected error occurred'
        };
    }

    ensureLogDirectory() {
        if (!fs.existsSync(this.logDirectory)) {
            fs.mkdirSync(this.logDirectory, { recursive: true });
        }
    }

    // Log error with context
    logError(error, context = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
                code: error.code
            },
            context: {
                method: context.method,
                url: context.url,
                userAgent: context.userAgent,
                ip: context.ip,
                sessionId: context.sessionId,
                userId: context.userId
            },
            severity: this.getErrorSeverity(error)
        };

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('CVPerfect Error:', logEntry);
        }

        // Log to file
        this.writeToLogFile(logEntry);

        return logEntry;
    }

    writeToLogFile(logEntry) {
        const date = new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logDirectory, `error-${date}.log`);
        
        const logLine = JSON.stringify(logEntry) + '\n';
        
        fs.appendFile(logFile, logLine, (err) => {
            if (err) {
                console.error('Failed to write error log:', err);
            }
        });
    }

    getErrorSeverity(error) {
        if (error.code >= 500) return 'critical';
        if (error.code >= 400) return 'warning';
        return 'info';
    }

    // Create standardized error response
    createErrorResponse(category, message, details = null, _internalError = null) {
        const categoryInfo = this.errorCategories[category];
        if (!categoryInfo) {
            throw new Error(`Unknown error category: ${category}`);
        }

        const response = {
            success: false,
            error: {
                category,
                type: categoryInfo.type,
                message: this.sanitizeMessage(message),
                code: categoryInfo.code,
                timestamp: new Date().toISOString()
            }
        };

        // Add details in development mode
        if (process.env.NODE_ENV === 'development' && details) {
            response.error.details = details;
        }

        // Add request ID for tracking
        response.error.requestId = this.generateRequestId();

        return response;
    }

    // Sanitize error messages for security
    sanitizeMessage(message) {
        if (!message) return 'An error occurred';

        // Remove sensitive information patterns
        const sensitivePatterns = [
            /password[s]?[\s]*[:=][\s]*[\w\d]+/gi,
            /key[s]?[\s]*[:=][\s]*[\w\d]+/gi,
            /token[s]?[\s]*[:=][\s]*[\w\d]+/gi,
            /secret[s]?[\s]*[:=][\s]*[\w\d]+/gi,
            /\/[a-z0-9]{20,}/gi, // API keys or tokens in URLs
        ];

        let sanitized = message;
        sensitivePatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '[REDACTED]');
        });

        return sanitized;
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Express middleware for error handling
    middleware() {
        return (error, req, res, _next) => {
            const context = {
                method: req.method,
                url: req.url,
                userAgent: req.get('User-Agent'),
                ip: req.ip || req.connection.remoteAddress,
                sessionId: req.sessionId,
                userId: req.userId
            };

            // Log the error
            const logEntry = this.logError(error, context);

            // Determine error category
            let category = 'SERVER_ERROR';
            let message = this.secureMessages.UNKNOWN_ERROR;

            if (error.name === 'ValidationError') {
                category = 'VALIDATION';
                message = error.message;
            } else if (error.name === 'UnauthorizedError') {
                category = 'AUTHENTICATION';
                message = 'Authentication required';
            } else if (error.name === 'ForbiddenError') {
                category = 'AUTHORIZATION';
                message = 'Access denied';
            } else if (error.name === 'NotFoundError') {
                category = 'NOT_FOUND';
                message = 'Resource not found';
            } else if (error.name === 'PaymentError') {
                category = 'PAYMENT_ERROR';
                message = error.message;
            } else if (error.name === 'FileError') {
                category = 'FILE_ERROR';
                message = error.message;
            } else if (error.name === 'ExternalAPIError') {
                category = 'EXTERNAL_API';
                message = 'External service error';
            }

            const errorResponse = this.createErrorResponse(
                category, 
                message, 
                process.env.NODE_ENV === 'development' ? error.stack : null,
                error
            );

            res.status(this.errorCategories[category].code).json(errorResponse);
        };
    }

    // Quick response helpers for common errors
    validation(message, details = null) {
        return this.createErrorResponse('VALIDATION', message, details);
    }

    authentication(message = 'Authentication required') {
        return this.createErrorResponse('AUTHENTICATION', message);
    }

    authorization(message = 'Access denied') {
        return this.createErrorResponse('AUTHORIZATION', message);
    }

    notFound(resource = 'Resource') {
        return this.createErrorResponse('NOT_FOUND', `${resource} not found`);
    }

    rateLimit(retryAfter = null) {
        const details = retryAfter ? { retryAfter } : null;
        return this.createErrorResponse('RATE_LIMIT', 'Too many requests', details);
    }

    serverError(_message = 'Internal server error') {
        return this.createErrorResponse('SERVER_ERROR', this.secureMessages.UNKNOWN_ERROR);
    }

    paymentError(message) {
        return this.createErrorResponse('PAYMENT_ERROR', message);
    }

    fileError(message) {
        return this.createErrorResponse('FILE_ERROR', message);
    }

    externalAPI(service, message = 'External service error') {
        return this.createErrorResponse('EXTERNAL_API', `${service}: ${message}`);
    }

    // CVPerfect-specific error helpers
    cvParsingError(details) {
        return this.createErrorResponse('FILE_ERROR', 'CV parsing failed', details);
    }

    sessionError(message = 'Session error') {
        return this.createErrorResponse('AUTHENTICATION', message);
    }

    aiProcessingError() {
        return this.createErrorResponse('EXTERNAL_API', 'CV analysis temporarily unavailable');
    }

    stripeError(stripeError) {
        const message = stripeError.type === 'card_error' 
            ? 'Payment card error' 
            : 'Payment processing error';
        
        return this.createErrorResponse('PAYMENT_ERROR', message, {
            stripeCode: stripeError.code,
            declineCode: stripeError.decline_code
        });
    }

    // Get error statistics
    getErrorStats() {
        // This would typically query a database or log analysis system
        return {
            totalErrors: 0,
            errorsByCategory: {},
            recentErrors: [],
            criticalErrors: 0
        };
    }
}

// Singleton instance
const errorHandler = new ErrorResponseHandler();

// Convenience exports for CVPerfect APIs
const CVPerfectErrors = {
    // Error response creators
    validation: (message, details) => errorHandler.validation(message, details),
    authentication: (message) => errorHandler.authentication(message),
    authorization: (message) => errorHandler.authorization(message),
    notFound: (resource) => errorHandler.notFound(resource),
    rateLimit: (retryAfter) => errorHandler.rateLimit(retryAfter),
    serverError: (message) => errorHandler.serverError(message),
    paymentError: (message) => errorHandler.paymentError(message),
    fileError: (message) => errorHandler.fileError(message),
    externalAPI: (service, message) => errorHandler.externalAPI(service, message),

    // CVPerfect-specific errors
    cvParsing: (details) => errorHandler.cvParsingError(details),
    session: (message) => errorHandler.sessionError(message),
    aiProcessing: () => errorHandler.aiProcessingError(),
    stripe: (stripeError) => errorHandler.stripeError(stripeError),

    // Middleware
    middleware: () => errorHandler.middleware(),

    // Logging
    logError: (error, context) => errorHandler.logError(error, context),

    // Statistics
    getStats: () => errorHandler.getErrorStats()
};

module.exports = {
    ErrorResponseHandler,
    CVPerfectErrors,
    errorHandler
};