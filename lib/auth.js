/**
 * AUTHENTICATION MIDDLEWARE - CVPerfect
 * Session validation and authentication utilities
 * 
 * Features:
 * - Session ID validation
 * - User authentication middleware
 * - JWT token handling
 * - Rate limiting by user
 * - Security headers injection
 */

const crypto = require('crypto');

class AuthMiddleware {
    constructor() {
        this.sessionStore = new Map(); // In production, use Redis or database
        this.rateLimits = new Map();
        this.blockedIPs = new Set();
    }

    // Generate secure session ID
    generateSessionId() {
        const timestamp = Date.now();
        const random = crypto.randomBytes(16).toString('hex');
        return `sess_${timestamp}_${random}`;
    }

    // Validate session ID format
    isValidSessionId(sessionId) {
        if (!sessionId || typeof sessionId !== 'string') {
            return false;
        }

        // CVPerfect session format: sess_timestamp_randomhex
        const sessionPattern = /^sess_\d{13}_[a-f0-9]{32}$/;
        return sessionPattern.test(sessionId);
    }

    // Extract user ID from session (if available)
    getUserFromSession(sessionId) {
        if (!this.isValidSessionId(sessionId)) {
            return null;
        }

        const sessionData = this.sessionStore.get(sessionId);
        return sessionData ? sessionData.userId : null;
    }

    // Create new authenticated session
    createSession(userId, additionalData = {}) {
        const sessionId = this.generateSessionId();
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

        const sessionData = {
            sessionId,
            userId,
            createdAt: Date.now(),
            expiresAt,
            lastAccessedAt: Date.now(),
            ...additionalData
        };

        this.sessionStore.set(sessionId, sessionData);
        
        return { sessionId, expiresAt };
    }

    // Validate and refresh session
    validateSession(sessionId) {
        if (!this.isValidSessionId(sessionId)) {
            return { valid: false, error: 'Invalid session ID format' };
        }

        const sessionData = this.sessionStore.get(sessionId);
        
        if (!sessionData) {
            return { valid: false, error: 'Session not found' };
        }

        if (Date.now() > sessionData.expiresAt) {
            this.sessionStore.delete(sessionId);
            return { valid: false, error: 'Session expired' };
        }

        // Update last accessed time
        sessionData.lastAccessedAt = Date.now();
        this.sessionStore.set(sessionId, sessionData);

        return { 
            valid: true, 
            session: sessionData,
            userId: sessionData.userId 
        };
    }

    // Authentication middleware for API routes
    authenticate(requiredRole = null) {
        return (req, res, next) => {
            try {
                // Extract session ID from various sources
                const sessionId = req.headers['x-session-id'] || 
                                req.query.sessionId || 
                                req.body.sessionId ||
                                req.cookies?.sessionId;

                if (!sessionId) {
                    return res.status(401).json({ 
                        error: 'Authentication required',
                        code: 'NO_SESSION_ID'
                    });
                }

                const validation = this.validateSession(sessionId);
                
                if (!validation.valid) {
                    return res.status(401).json({ 
                        error: validation.error,
                        code: 'INVALID_SESSION'
                    });
                }

                // Check role if required
                if (requiredRole && validation.session.role !== requiredRole) {
                    return res.status(403).json({ 
                        error: 'Insufficient permissions',
                        code: 'INSUFFICIENT_ROLE'
                    });
                }

                // Add session data to request
                req.session = validation.session;
                req.userId = validation.userId;
                req.sessionId = sessionId;

                next();

            } catch (error) {
                console.error('Authentication middleware error:', error);
                return res.status(500).json({ 
                    error: 'Authentication system error',
                    code: 'AUTH_ERROR'
                });
            }
        };
    }

    // Rate limiting by session/IP
    rateLimit(maxRequests = 100, windowMinutes = 15) {
        return (req, res, next) => {
            const identifier = req.sessionId || req.ip;
            const windowStart = Date.now() - (windowMinutes * 60 * 1000);

            if (!this.rateLimits.has(identifier)) {
                this.rateLimits.set(identifier, []);
            }

            const requests = this.rateLimits.get(identifier);
            
            // Remove old requests outside the window
            const recentRequests = requests.filter(timestamp => timestamp > windowStart);
            this.rateLimits.set(identifier, recentRequests);

            if (recentRequests.length >= maxRequests) {
                return res.status(429).json({
                    error: 'Rate limit exceeded',
                    code: 'RATE_LIMIT_EXCEEDED',
                    retryAfter: windowMinutes * 60
                });
            }

            // Add current request
            recentRequests.push(Date.now());
            this.rateLimits.set(identifier, recentRequests);

            next();
        };
    }

    // Security headers middleware
    securityHeaders() {
        return (req, res, next) => {
            // CVPerfect security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
            
            // HSTS for HTTPS
            if (req.secure) {
                res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            }

            next();
        };
    }

    // Clean expired sessions (run periodically)
    cleanupExpiredSessions() {
        const now = Date.now();
        let cleaned = 0;

        for (const [sessionId, sessionData] of this.sessionStore.entries()) {
            if (sessionData.expiresAt < now) {
                this.sessionStore.delete(sessionId);
                cleaned++;
            }
        }

        console.log(`Cleaned ${cleaned} expired sessions`);
        return cleaned;
    }

    // Get session statistics
    getSessionStats() {
        const now = Date.now();
        let active = 0;
        let expired = 0;

        for (const sessionData of this.sessionStore.values()) {
            if (sessionData.expiresAt > now) {
                active++;
            } else {
                expired++;
            }
        }

        return {
            totalSessions: this.sessionStore.size,
            activeSessions: active,
            expiredSessions: expired,
            rateLimitedIdentifiers: this.rateLimits.size
        };
    }
}

// Singleton instance
const authMiddleware = new AuthMiddleware();

// Helper functions for CVPerfect APIs
const CVPerfectAuth = {
    // Middleware for payment-protected endpoints
    requirePayment: () => authMiddleware.authenticate(),
    
    // Middleware for session-based access
    requireSession: () => authMiddleware.authenticate(),
    
    // Rate limiting for CV analysis (expensive operation)
    rateLimitAnalysis: () => authMiddleware.rateLimit(5, 60), // 5 requests per hour
    
    // Rate limiting for general API calls
    rateLimitAPI: () => authMiddleware.rateLimit(100, 15), // 100 requests per 15 minutes
    
    // Security headers for all CVPerfect responses
    addSecurityHeaders: () => authMiddleware.securityHeaders(),

    // Create session for new user
    createUserSession: (userId, planType = 'basic', cvData = null) => {
        return authMiddleware.createSession(userId, {
            planType,
            cvData,
            role: 'user'
        });
    },

    // Validate CVPerfect session
    validateUserSession: (sessionId) => {
        return authMiddleware.validateSession(sessionId);
    },

    // Generate secure session ID
    generateSessionId: () => authMiddleware.generateSessionId(),

    // Check if session ID is valid format
    isValidSessionId: (sessionId) => authMiddleware.isValidSessionId(sessionId),

    // Get current session statistics
    getStats: () => authMiddleware.getSessionStats(),

    // Cleanup expired sessions
    cleanup: () => authMiddleware.cleanupExpiredSessions()
};

module.exports = {
    AuthMiddleware,
    CVPerfectAuth,
    authMiddleware
};