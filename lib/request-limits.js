/**
 * REQUEST LIMITING & ABUSE PREVENTION - CVPerfect
 * Advanced rate limiting and DDoS protection
 * 
 * Features:
 * - Multi-tier rate limiting (IP, session, user)
 * - Adaptive rate limiting based on load
 * - DDoS protection and suspicious pattern detection
 * - Resource-specific limits (CV analysis, file uploads)
 * - Whitelist/blacklist management
 */

class RequestLimitManager {
    constructor() {
        this.limits = new Map();
        this.blacklist = new Set();
        this.whitelist = new Set();
        this.suspiciousIPs = new Map();
        this.globalStats = {
            requestsPerMinute: 0,
            peakRPM: 0,
            blockedRequests: 0,
            startTime: Date.now()
        };
        
        // Default rate limits
        this.defaultLimits = {
            ip: { requests: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes per IP
            session: { requests: 50, window: 10 * 60 * 1000 }, // 50 requests per 10 minutes per session
            user: { requests: 200, window: 60 * 60 * 1000 }, // 200 requests per hour per user
            anonymous: { requests: 20, window: 15 * 60 * 1000 } // 20 requests per 15 minutes for anonymous
        };

        // Resource-specific limits
        this.resourceLimits = {
            'cv-analysis': { requests: 5, window: 60 * 60 * 1000 }, // 5 CV analyses per hour
            'file-upload': { requests: 10, window: 15 * 60 * 1000 }, // 10 file uploads per 15 minutes
            'email-send': { requests: 3, window: 10 * 60 * 1000 }, // 3 emails per 10 minutes
            'payment': { requests: 5, window: 30 * 60 * 1000 }, // 5 payment attempts per 30 minutes
            'auth': { requests: 10, window: 5 * 60 * 1000 } // 10 auth attempts per 5 minutes
        };

        this.startCleanupInterval();
    }

    // Get client identifier (IP, session, user)
    getClientIdentifier(req, type = 'ip') {
        switch (type) {
            case 'ip':
                return req.ip || req.connection.remoteAddress || 'unknown';
            case 'session':
                return req.sessionId || req.headers['x-session-id'] || null;
            case 'user':
                return req.userId || null;
            default:
                return null;
        }
    }

    // Check if client should be rate limited
    shouldRateLimit(identifier, limitConfig) {
        if (!identifier) return { limited: false };

        const now = Date.now();
        const windowStart = now - limitConfig.window;

        if (!this.limits.has(identifier)) {
            this.limits.set(identifier, []);
        }

        const requests = this.limits.get(identifier);
        
        // Remove old requests outside the window
        const recentRequests = requests.filter(timestamp => timestamp > windowStart);
        this.limits.set(identifier, recentRequests);

        if (recentRequests.length >= limitConfig.requests) {
            return {
                limited: true,
                count: recentRequests.length,
                limit: limitConfig.requests,
                resetTime: Math.min(...recentRequests) + limitConfig.window
            };
        }

        // Add current request
        recentRequests.push(now);
        this.limits.set(identifier, recentRequests);

        return {
            limited: false,
            count: recentRequests.length,
            limit: limitConfig.requests,
            resetTime: now + limitConfig.window
        };
    }

    // Multi-tier rate limiting middleware
    rateLimit(options = {}) {
        const {
            skipSuccessfulGET = true,
            skipWhitelisted = true,
            customLimits = {},
            resourceType = null
        } = options;

        return (req, res, next) => {
            try {
                // Skip GET requests that completed successfully (for static resources)
                if (skipSuccessfulGET && req.method === 'GET' && res.statusCode === 200) {
                    return next();
                }

                const ip = this.getClientIdentifier(req, 'ip');
                
                // Check blacklist
                if (this.blacklist.has(ip)) {
                    return res.status(403).json({
                        error: 'IP address blocked',
                        code: 'IP_BLACKLISTED'
                    });
                }

                // Check whitelist
                if (skipWhitelisted && this.whitelist.has(ip)) {
                    return next();
                }

                // Apply rate limiting checks in order of specificity
                const checks = [
                    { type: 'ip', identifier: ip, config: customLimits.ip || this.defaultLimits.ip },
                    { type: 'session', identifier: this.getClientIdentifier(req, 'session'), config: customLimits.session || this.defaultLimits.session },
                    { type: 'user', identifier: this.getClientIdentifier(req, 'user'), config: customLimits.user || this.defaultLimits.user }
                ];

                // Add resource-specific limit if specified
                if (resourceType && this.resourceLimits[resourceType]) {
                    checks.push({
                        type: 'resource',
                        identifier: `${resourceType}:${ip}`,
                        config: this.resourceLimits[resourceType]
                    });
                }

                // Check each limit
                for (const check of checks) {
                    if (!check.identifier) continue;

                    const result = this.shouldRateLimit(check.identifier, check.config);
                    
                    if (result.limited) {
                        // Track suspicious behavior
                        this.trackSuspiciousActivity(ip, check.type);
                        
                        // Update global stats
                        this.globalStats.blockedRequests++;

                        return res.status(429).json({
                            error: 'Rate limit exceeded',
                            code: 'RATE_LIMIT_EXCEEDED',
                            type: check.type,
                            limit: result.limit,
                            count: result.count,
                            resetTime: result.resetTime,
                            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
                        });
                    }
                }

                // Track successful request
                this.updateGlobalStats();
                next();

            } catch (error) {
                console.error('Rate limiting error:', error);
                next(); // Continue on rate limiting errors
            }
        };
    }

    // Track suspicious activity patterns
    trackSuspiciousActivity(ip, limitType) {
        if (!this.suspiciousIPs.has(ip)) {
            this.suspiciousIPs.set(ip, {
                violations: 0,
                types: new Set(),
                firstViolation: Date.now(),
                lastViolation: Date.now()
            });
        }

        const activity = this.suspiciousIPs.get(ip);
        activity.violations++;
        activity.types.add(limitType);
        activity.lastViolation = Date.now();

        // Auto-blacklist after multiple violations
        if (activity.violations >= 10) {
            this.addToBlacklist(ip, `Auto-blacklisted: ${activity.violations} violations`);
        }

        this.suspiciousIPs.set(ip, activity);
    }

    // DDoS protection middleware
    ddosProtection() {
        return (req, res, next) => {
            const ip = this.getClientIdentifier(req, 'ip');
            const userAgent = req.get('User-Agent') || '';
            const now = Date.now();

            // Check for suspicious patterns
            const suspiciousPatterns = [
                // Missing or suspicious user agents
                !userAgent || userAgent.length < 10,
                // Too many different endpoints from same IP quickly
                this.isRapidEndpointScanning(ip),
                // Unusual request patterns
                this.hasUnusualRequestPattern(req)
            ];

            if (suspiciousPatterns.filter(Boolean).length >= 2) {
                this.trackSuspiciousActivity(ip, 'ddos-pattern');
                
                return res.status(429).json({
                    error: 'Suspicious request pattern detected',
                    code: 'DDOS_PROTECTION'
                });
            }

            next();
        };
    }

    isRapidEndpointScanning(ip) {
        // Check if IP is accessing many different endpoints rapidly
        const requests = this.limits.get(ip) || [];
        const recentCount = requests.filter(timestamp => 
            Date.now() - timestamp < 60000 // Last minute
        ).length;

        return recentCount > 30; // More than 30 requests per minute
    }

    hasUnusualRequestPattern(req) {
        // Check for patterns typical of automated attacks
        const path = req.path.toLowerCase();
        const suspiciousPatterns = [
            /wp-admin/, /wp-content/, /.php$/, /admin/, /login/, /phpmyadmin/,
            /eval\(/, /base64/, /javascript:/, /<script>/
        ];

        return suspiciousPatterns.some(pattern => pattern.test(path));
    }

    // CVPerfect-specific rate limiting configurations
    getCVPerfectLimits(planType = 'basic') {
        const planLimits = {
            basic: {
                'cv-analysis': { requests: 3, window: 24 * 60 * 60 * 1000 }, // 3 per day
                'file-upload': { requests: 5, window: 60 * 60 * 1000 }, // 5 per hour
                'email-send': { requests: 2, window: 24 * 60 * 60 * 1000 } // 2 per day
            },
            gold: {
                'cv-analysis': { requests: 10, window: 24 * 60 * 60 * 1000 }, // 10 per day
                'file-upload': { requests: 15, window: 60 * 60 * 1000 }, // 15 per hour
                'email-send': { requests: 5, window: 24 * 60 * 60 * 1000 } // 5 per day
            },
            premium: {
                'cv-analysis': { requests: 50, window: 24 * 60 * 60 * 1000 }, // 50 per day
                'file-upload': { requests: 50, window: 60 * 60 * 1000 }, // 50 per hour
                'email-send': { requests: 20, window: 24 * 60 * 60 * 1000 } // 20 per day
            }
        };

        return planLimits[planType] || planLimits.basic;
    }

    // Middleware for specific CVPerfect endpoints
    cvAnalysisLimit(planType = 'basic') {
        const limits = this.getCVPerfectLimits(planType);
        return this.rateLimit({
            resourceType: 'cv-analysis',
            customLimits: {
                resource: limits['cv-analysis']
            }
        });
    }

    fileUploadLimit(planType = 'basic') {
        const limits = this.getCVPerfectLimits(planType);
        return this.rateLimit({
            resourceType: 'file-upload',
            customLimits: {
                resource: limits['file-upload']
            }
        });
    }

    paymentLimit() {
        return this.rateLimit({
            resourceType: 'payment'
        });
    }

    // IP management
    addToWhitelist(ip, reason = '') {
        this.whitelist.add(ip);
        console.log(`IP ${ip} added to whitelist: ${reason}`);
    }

    addToBlacklist(ip, reason = '') {
        this.blacklist.add(ip);
        console.log(`IP ${ip} added to blacklist: ${reason}`);
    }

    removeFromBlacklist(ip) {
        this.blacklist.delete(ip);
        console.log(`IP ${ip} removed from blacklist`);
    }

    // Update global statistics
    updateGlobalStats() {
        const now = Date.now();
        const minuteAgo = now - 60000;
        
        // Count requests in last minute across all limits
        let totalRequests = 0;
        for (const requests of this.limits.values()) {
            totalRequests += requests.filter(timestamp => timestamp > minuteAgo).length;
        }
        
        this.globalStats.requestsPerMinute = totalRequests;
        this.globalStats.peakRPM = Math.max(this.globalStats.peakRPM, totalRequests);
    }

    // Cleanup expired entries
    cleanup() {
        const now = Date.now();
        let cleaned = 0;

        // Clean expired rate limit entries
        for (const [identifier, requests] of this.limits.entries()) {
            const validRequests = requests.filter(timestamp => now - timestamp < 24 * 60 * 60 * 1000);
            if (validRequests.length === 0) {
                this.limits.delete(identifier);
                cleaned++;
            } else {
                this.limits.set(identifier, validRequests);
            }
        }

        // Clean old suspicious activity entries
        for (const [ip, activity] of this.suspiciousIPs.entries()) {
            if (now - activity.lastViolation > 24 * 60 * 60 * 1000) { // 24 hours
                this.suspiciousIPs.delete(ip);
                cleaned++;
            }
        }

        return cleaned;
    }

    startCleanupInterval() {
        // Run cleanup every hour
        setInterval(() => {
            this.cleanup();
        }, 60 * 60 * 1000);
    }

    // Get current statistics
    getStats() {
        return {
            global: this.globalStats,
            activeLimits: this.limits.size,
            blacklistedIPs: this.blacklist.size,
            whitelistedIPs: this.whitelist.size,
            suspiciousIPs: this.suspiciousIPs.size,
            uptime: Date.now() - this.globalStats.startTime
        };
    }
}

// Singleton instance
const requestLimitManager = new RequestLimitManager();

// Convenience exports for CVPerfect APIs
const CVPerfectLimits = {
    // General rate limiting
    rateLimit: (options) => requestLimitManager.rateLimit(options),
    ddosProtection: () => requestLimitManager.ddosProtection(),

    // CVPerfect-specific limits
    cvAnalysis: (planType) => requestLimitManager.cvAnalysisLimit(planType),
    fileUpload: (planType) => requestLimitManager.fileUploadLimit(planType),
    payment: () => requestLimitManager.paymentLimit(),

    // IP management
    whitelist: (ip, reason) => requestLimitManager.addToWhitelist(ip, reason),
    blacklist: (ip, reason) => requestLimitManager.addToBlacklist(ip, reason),
    removeFromBlacklist: (ip) => requestLimitManager.removeFromBlacklist(ip),

    // Statistics and management
    getStats: () => requestLimitManager.getStats(),
    cleanup: () => requestLimitManager.cleanup()
};

module.exports = {
    RequestLimitManager,
    CVPerfectLimits,
    requestLimitManager
};