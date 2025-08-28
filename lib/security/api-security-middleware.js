/**
 * CVPerfect API Security Middleware
 * Comprehensive security layer for production APIs
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Supabase client for security logging
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Security Headers Middleware
 */
export function securityHeaders(req, res, next) {
  // Remove server signature
  res.removeHeader('X-Powered-By');
  
  // Set comprehensive security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP for production
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", 
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
    "frame-src https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspDirectives);
  
  // HSTS for HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
}

/**
 * Enhanced CORS Configuration
 */
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://cvperfect.pl',
      'https://www.cvperfect.pl',
      'https://app.cvperfect.pl',
      process.env.NEXT_PUBLIC_BASE_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log unauthorized CORS attempt
    console.warn(`🚨 Unauthorized CORS attempt from: ${origin}`);
    logSecurityEvent('CORS_VIOLATION', null, { origin });
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-API-Key',
    'X-Session-ID'
  ]
};

/**
 * Advanced Rate Limiting
 */
export const rateLimitConfigs = {
  // General API endpoints
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', null, {
        endpoint: req.url,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
  }),

  // ML optimization endpoints (more restrictive)
  mlOptimization: rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // 10 ML requests per window
    message: {
      success: false,
      error: 'ML optimization rate limit exceeded',
      code: 'ML_RATE_LIMIT_EXCEEDED'
    },
    keyGenerator: (req) => {
      // Rate limit by session ID or IP
      return req.headers['x-session-id'] || req.ip;
    }
  }),

  // Admin endpoints (very restrictive)
  admin: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 admin requests per window
    message: {
      success: false,
      error: 'Admin rate limit exceeded',
      code: 'ADMIN_RATE_LIMIT_EXCEEDED'
    }
  }),

  // Authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 auth attempts per window
    message: {
      success: false,
      error: 'Authentication rate limit exceeded',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    skipSuccessfulRequests: true // Don't count successful auths
  })
};

/**
 * Input Validation and Sanitization
 */
export function validateAndSanitize(validationSchema) {
  return (req, res, next) => {
    try {
      // Validate request body
      if (validationSchema.body) {
        const bodyValidation = validationSchema.body.validate(req.body);
        if (bodyValidation.error) {
          return res.status(400).json({
            success: false,
            error: 'Validation error',
            code: 'VALIDATION_FAILED',
            details: bodyValidation.error.details
          });
        }
        req.body = bodyValidation.value;
      }

      // Validate query parameters
      if (validationSchema.query) {
        const queryValidation = validationSchema.query.validate(req.query);
        if (queryValidation.error) {
          return res.status(400).json({
            success: false,
            error: 'Query validation error', 
            code: 'QUERY_VALIDATION_FAILED',
            details: queryValidation.error.details
          });
        }
        req.query = queryValidation.value;
      }

      next();

    } catch (error) {
      logSecurityEvent('VALIDATION_ERROR', null, {
        endpoint: req.url,
        error: error.message,
        body: req.body
      });

      res.status(500).json({
        success: false,
        error: 'Validation processing error',
        code: 'VALIDATION_PROCESSING_ERROR'
      });
    }
  };
}

/**
 * API Key Validation Middleware
 */
export function validateApiKey(requiredKeyType = 'general') {
  return async (req, res, next) => {
    try {
      const apiKey = req.headers['x-api-key'];
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'API key required',
          code: 'MISSING_API_KEY'
        });
      }

      // Validate API key format
      if (!isValidApiKeyFormat(apiKey)) {
        logSecurityEvent('INVALID_API_KEY_FORMAT', null, {
          apiKey: apiKey.substring(0, 10) + '...',
          endpoint: req.url
        });

        return res.status(401).json({
          success: false,
          error: 'Invalid API key format',
          code: 'INVALID_API_KEY_FORMAT'
        });
      }

      // Check API key in database
      const keyValidation = await validateApiKeyInDatabase(apiKey, requiredKeyType);
      
      if (!keyValidation.valid) {
        logSecurityEvent('INVALID_API_KEY', null, {
          apiKey: apiKey.substring(0, 10) + '...',
          endpoint: req.url,
          reason: keyValidation.reason
        });

        return res.status(401).json({
          success: false,
          error: 'Invalid or expired API key',
          code: 'INVALID_API_KEY'
        });
      }

      // Add API key info to request
      req.apiKey = keyValidation.keyInfo;
      
      next();

    } catch (error) {
      logSecurityEvent('API_KEY_VALIDATION_ERROR', null, {
        endpoint: req.url,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'API key validation failed',
        code: 'API_KEY_VALIDATION_ERROR'
      });
    }
  };
}

/**
 * Request ID Generation for Tracking
 */
export function generateRequestId(req, res, next) {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
}

/**
 * Security Event Logging
 */
export async function logSecurityEvent(eventType, userId = null, metadata = {}) {
  try {
    const securityLog = {
      event_type: eventType,
      user_id: userId,
      metadata: metadata,
      timestamp: new Date().toISOString(),
      severity: getEventSeverity(eventType)
    };

    // Store in security_logs table
    const { error } = await supabase
      .from('security_logs')
      .insert(securityLog);

    if (error) {
      console.error('Failed to log security event:', error);
    }

    // High severity events should trigger immediate alerts
    if (securityLog.severity === 'HIGH' || securityLog.severity === 'CRITICAL') {
      await triggerSecurityAlert(securityLog);
    }

  } catch (error) {
    console.error('Security logging error:', error);
  }
}

/**
 * Request Response Logging
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();
  
  // Log request
  const requestLog = {
    id: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  };

  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    const responseLog = {
      ...requestLog,
      statusCode: res.statusCode,
      responseTime,
      contentLength: res.getHeader('content-length')
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
    }

    // Store detailed logs for suspicious activity
    if (res.statusCode >= 400) {
      logSecurityEvent('HTTP_ERROR', req.user?.id, responseLog);
    }

    originalEnd.apply(res, args);
  };

  next();
}

/**
 * Webhook Signature Validation
 */
export function validateWebhookSignature(secret) {
  return (req, res, next) => {
    try {
      const signature = req.headers['stripe-signature'] || req.headers['webhook-signature'];
      
      if (!signature) {
        return res.status(400).json({
          success: false,
          error: 'Missing webhook signature',
          code: 'MISSING_WEBHOOK_SIGNATURE'
        });
      }

      const payload = JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

      if (!isValid) {
        logSecurityEvent('INVALID_WEBHOOK_SIGNATURE', null, {
          endpoint: req.url,
          providedSignature: signature.substring(0, 10) + '...'
        });

        return res.status(400).json({
          success: false,
          error: 'Invalid webhook signature',
          code: 'INVALID_WEBHOOK_SIGNATURE'
        });
      }

      next();

    } catch (error) {
      logSecurityEvent('WEBHOOK_VALIDATION_ERROR', null, {
        endpoint: req.url,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Webhook validation failed',
        code: 'WEBHOOK_VALIDATION_ERROR'
      });
    }
  };
}

// Helper functions

function isValidApiKeyFormat(apiKey) {
  // API key format: cvp_[env]_[32_char_hex]
  const apiKeyRegex = /^cvp_(dev|prod|test)_[a-f0-9]{32}$/;
  return apiKeyRegex.test(apiKey);
}

async function validateApiKeyInDatabase(apiKey, keyType) {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', crypto.createHash('sha256').update(apiKey).digest('hex'))
      .eq('key_type', keyType)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { valid: false, reason: 'key_not_found' };
    }

    // Check expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, reason: 'key_expired' };
    }

    // Update last used
    await supabase
      .from('api_keys')
      .update({ 
        last_used_at: new Date().toISOString(),
        usage_count: data.usage_count + 1
      })
      .eq('id', data.id);

    return { 
      valid: true, 
      keyInfo: {
        id: data.id,
        name: data.name,
        permissions: data.permissions,
        rateLimit: data.rate_limit
      }
    };

  } catch (error) {
    return { valid: false, reason: 'validation_error' };
  }
}

function getEventSeverity(eventType) {
  const severityMap = {
    'CORS_VIOLATION': 'MEDIUM',
    'RATE_LIMIT_EXCEEDED': 'LOW',
    'ML_RATE_LIMIT_EXCEEDED': 'MEDIUM',
    'ADMIN_RATE_LIMIT_EXCEEDED': 'HIGH',
    'AUTH_RATE_LIMIT_EXCEEDED': 'HIGH',
    'INVALID_API_KEY': 'HIGH',
    'INVALID_WEBHOOK_SIGNATURE': 'HIGH',
    'VALIDATION_ERROR': 'LOW',
    'HTTP_ERROR': 'LOW'
  };

  return severityMap[eventType] || 'LOW';
}

async function triggerSecurityAlert(securityLog) {
  // In production, this would send alerts to Slack, email, etc.
  console.error(`🚨 SECURITY ALERT [${securityLog.severity}]: ${securityLog.event_type}`, securityLog);
  
  // Could integrate with services like:
  // - Slack webhook
  // - Email notifications  
  // - PagerDuty alerts
  // - Discord webhooks
}

export default {
  securityHeaders,
  corsOptions,
  rateLimitConfigs,
  validateAndSanitize,
  validateApiKey,
  generateRequestId,
  logSecurityEvent,
  requestLogger,
  validateWebhookSignature
};