/**
 * CORS MIDDLEWARE - CVPerfect
 * Cross-origin request protection and configuration
 * 
 * Features:
 * - Production/development CORS policies
 * - Stripe webhook CORS handling
 * - Pre-flight request handling
 * - Origin whitelist management
 * - Secure cookie settings
 */

class CORSMiddleware {
    constructor() {
        this.allowedOrigins = this.getAllowedOrigins();
        this.allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
        this.allowedHeaders = [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'X-Session-ID',
            'Accept',
            'Origin'
        ];
    }

    getAllowedOrigins() {
        const origins = [];

        // Production origins
        if (process.env.NEXT_PUBLIC_BASE_URL) {
            origins.push(process.env.NEXT_PUBLIC_BASE_URL);
        }

        // Development origins
        if (process.env.NODE_ENV === 'development') {
            origins.push('http://localhost:3000');
            origins.push('http://localhost:3001');
            origins.push('http://127.0.0.1:3000');
            origins.push('http://127.0.0.1:3001');
        }

        // Stripe domains (for webhook validation)
        origins.push('https://api.stripe.com');
        origins.push('https://checkout.stripe.com');

        // Claude Code domains (for development)
        origins.push('http://localhost:8080');
        origins.push('https://claude.ai');

        return origins;
    }

    // Check if origin is allowed
    isOriginAllowed(origin) {
        if (!origin) {
            return true; // Allow same-origin requests
        }

        return this.allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin === '*') return true;
            if (allowedOrigin === origin) return true;
            
            // Allow subdomains in development
            if (process.env.NODE_ENV === 'development' && 
                allowedOrigin.includes('localhost')) {
                return origin.includes('localhost');
            }

            return false;
        });
    }

    // Main CORS middleware
    cors() {
        return (req, res, next) => {
            const origin = req.headers.origin;

            // Set CORS headers
            if (this.isOriginAllowed(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin || '*');
            }

            res.setHeader('Access-Control-Allow-Methods', this.allowedMethods.join(', '));
            res.setHeader('Access-Control-Allow-Headers', this.allowedHeaders.join(', '));
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.status(204).end();
                return;
            }

            next();
        };
    }

    // Strict CORS for payment endpoints
    strictCORS() {
        return (req, res, next) => {
            const origin = req.headers.origin;

            // Only allow specific origins for payment endpoints
            const paymentOrigins = [
                process.env.NEXT_PUBLIC_BASE_URL,
                'http://localhost:3000',
                'http://localhost:3001',
                'https://api.stripe.com'
            ].filter(Boolean);

            if (origin && !paymentOrigins.includes(origin)) {
                return res.status(403).json({
                    error: 'CORS policy violation',
                    code: 'ORIGIN_NOT_ALLOWED',
                    allowedOrigins: paymentOrigins
                });
            }

            res.setHeader('Access-Control-Allow-Origin', origin || paymentOrigins[0]);
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.setHeader('Access-Control-Allow-Credentials', 'true');

            if (req.method === 'OPTIONS') {
                res.status(204).end();
                return;
            }

            next();
        };
    }

    // CORS for Stripe webhooks (very restrictive)
    stripeWebhookCORS() {
        return (req, res, next) => {
            const stripeOrigins = [
                'https://api.stripe.com',
                'https://hooks.stripe.com'
            ];

            const origin = req.headers.origin;
            const userAgent = req.headers['user-agent'] || '';

            // Stripe webhooks don't always send Origin header
            if (origin && !stripeOrigins.includes(origin)) {
                console.warn('Suspicious webhook origin:', origin);
            }

            // Validate Stripe user agent
            if (!userAgent.includes('Stripe')) {
                console.warn('Non-Stripe user agent for webhook:', userAgent);
            }

            // Set minimal CORS for webhooks
            res.setHeader('Access-Control-Allow-Origin', 'https://api.stripe.com');
            res.setHeader('Access-Control-Allow-Methods', 'POST');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');

            next();
        };
    }

    // Development-friendly CORS (permissive)
    developmentCORS() {
        return (req, res, next) => {
            if (process.env.NODE_ENV !== 'development') {
                return next();
            }

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', this.allowedMethods.join(', '));
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.setHeader('Access-Control-Allow-Credentials', 'true');

            if (req.method === 'OPTIONS') {
                res.status(204).end();
                return;
            }

            next();
        };
    }

    // API-specific CORS configurations
    apiCORS(apiType = 'general') {
        switch (apiType) {
            case 'payment':
                return this.strictCORS();
            
            case 'webhook':
                return this.stripeWebhookCORS();
            
            case 'analysis':
                // For CV analysis endpoints - allow authenticated origins
                return (req, res, next) => {
                    const origin = req.headers.origin;
                    
                    if (origin && this.isOriginAllowed(origin)) {
                        res.setHeader('Access-Control-Allow-Origin', origin);
                    }
                    
                    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 
                        'Content-Type, Authorization, X-Session-ID');
                    res.setHeader('Access-Control-Allow-Credentials', 'true');

                    if (req.method === 'OPTIONS') {
                        res.status(204).end();
                        return;
                    }

                    next();
                };

            case 'public':
                // For public endpoints like contact
                return this.cors();

            default:
                return this.cors();
        }
    }

    // Get CORS configuration summary
    getConfig() {
        return {
            allowedOrigins: this.allowedOrigins,
            allowedMethods: this.allowedMethods,
            allowedHeaders: this.allowedHeaders,
            environment: process.env.NODE_ENV,
            productionURL: process.env.NEXT_PUBLIC_BASE_URL
        };
    }
}

// Singleton instance
const corsMiddleware = new CORSMiddleware();

// Convenience exports for CVPerfect APIs
const CVPerfectCORS = {
    // General CORS for most endpoints
    general: () => corsMiddleware.cors(),

    // Strict CORS for payment endpoints
    payment: () => corsMiddleware.apiCORS('payment'),

    // Webhook-specific CORS
    webhook: () => corsMiddleware.apiCORS('webhook'),

    // Analysis endpoint CORS
    analysis: () => corsMiddleware.apiCORS('analysis'),

    // Public endpoint CORS
    public: () => corsMiddleware.apiCORS('public'),

    // Development CORS (permissive)
    development: () => corsMiddleware.developmentCORS(),

    // Get current CORS configuration
    getConfig: () => corsMiddleware.getConfig(),

    // Check if origin is allowed
    isOriginAllowed: (origin) => corsMiddleware.isOriginAllowed(origin)
};

module.exports = {
    CORSMiddleware,
    CVPerfectCORS,
    corsMiddleware
};