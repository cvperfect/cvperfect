/**
 * CVPerfect Production Authentication System
 * JWT-based authentication with role-based access control
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Supabase client for user management
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// User roles and permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  PREMIUM: 'premium', 
  GOLD: 'gold',
  BASIC: 'basic',
  GUEST: 'guest'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'ml_optimize',
    'performance_dashboard',
    'user_management',
    'analytics_full',
    'export_all_formats',
    'api_access_unlimited'
  ],
  [USER_ROLES.PREMIUM]: [
    'ml_optimize',
    'advanced_templates',
    'export_all_formats',
    'job_matching',
    'priority_support'
  ],
  [USER_ROLES.GOLD]: [
    'ml_optimize',
    'advanced_templates', 
    'export_pdf_docx',
    'job_matching'
  ],
  [USER_ROLES.BASIC]: [
    'basic_optimize',
    'export_pdf',
    'ats_scoring'
  ],
  [USER_ROLES.GUEST]: [
    'view_only'
  ]
};

/**
 * Generate JWT access token
 */
export function generateAccessToken(userId, userRole, sessionId) {
  const payload = {
    userId,
    role: userRole,
    sessionId,
    permissions: ROLE_PERMISSIONS[userRole] || [],
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'cvperfect-api',
    audience: 'cvperfect-users'
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(userId, sessionId) {
  const payload = {
    userId,
    sessionId,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'cvperfect-api',
    audience: 'cvperfect-users'
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'cvperfect-api',
      audience: 'cvperfect-users'
    });
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Authentication middleware for API routes
 */
export function authMiddleware(requiredPermissions = []) {
  return async (req, res, next) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Access token required',
          code: 'MISSING_TOKEN'
        });
      }

      const token = authHeader.substring(7);
      
      // Verify token
      const decoded = verifyToken(token);
      
      // Check if token type is access
      if (decoded.type !== 'access') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      // Verify session still exists and is valid
      const sessionValid = await validateUserSession(decoded.userId, decoded.sessionId);
      if (!sessionValid) {
        return res.status(401).json({
          success: false,
          error: 'Session expired or invalid',
          code: 'INVALID_SESSION'
        });
      }

      // Check permissions
      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.every(
          permission => decoded.permissions.includes(permission)
        );
        
        if (!hasPermission) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: requiredPermissions,
            available: decoded.permissions
          });
        }
      }

      // Add user info to request
      req.user = {
        id: decoded.userId,
        role: decoded.role,
        sessionId: decoded.sessionId,
        permissions: decoded.permissions
      };

      // Log authentication event
      await logAuthEvent(req, 'AUTH_SUCCESS', decoded.userId);

      if (next) next();
      return true;

    } catch (error) {
      // Log failed authentication
      await logAuthEvent(req, 'AUTH_FAILURE', null, error.message);

      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_FAILED',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}

/**
 * Admin-only middleware
 */
export const adminOnly = authMiddleware(['user_management', 'analytics_full']);

/**
 * Premium features middleware  
 */
export const premiumOnly = authMiddleware(['ml_optimize']);

/**
 * Validate user session in database
 */
async function validateUserSession(userId, sessionId) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id, user_id, payment_status, plan, expires_at')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    // Check if session has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false;
    }

    return true;

  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

/**
 * Get user role from payment status and plan
 */
export function getUserRole(paymentStatus, plan) {
  if (paymentStatus === 'completed') {
    switch (plan) {
      case 'premium': return USER_ROLES.PREMIUM;
      case 'gold': return USER_ROLES.GOLD;
      case 'basic': return USER_ROLES.BASIC;
      default: return USER_ROLES.BASIC;
    }
  }
  return USER_ROLES.GUEST;
}

/**
 * Create authenticated session
 */
export async function createAuthenticatedSession(sessionId, userEmail = null) {
  try {
    // Get session data
    const { data: sessionData, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !sessionData) {
      throw new Error('Session not found');
    }

    // Determine user role
    const userRole = getUserRole(sessionData.payment_status, sessionData.plan);
    
    // Generate tokens
    const accessToken = generateAccessToken(
      sessionData.user_id || sessionId, 
      userRole, 
      sessionId
    );
    
    const refreshToken = generateRefreshToken(
      sessionData.user_id || sessionId, 
      sessionId
    );

    // Store refresh token securely
    await supabase
      .from('user_sessions')
      .update({ 
        refresh_token: await hashToken(refreshToken),
        last_activity: new Date().toISOString()
      })
      .eq('id', sessionId);

    return {
      accessToken,
      refreshToken,
      user: {
        id: sessionData.user_id || sessionId,
        email: userEmail,
        role: userRole,
        plan: sessionData.plan,
        permissions: ROLE_PERMISSIONS[userRole] || []
      },
      expiresIn: JWT_EXPIRES_IN
    };

  } catch (error) {
    throw new Error(`Authentication session creation failed: ${error.message}`);
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshTokenString) {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshTokenString);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Validate refresh token in database
    const hashedToken = await hashToken(refreshTokenString);
    const { data: sessionData } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', decoded.sessionId)
      .eq('refresh_token', hashedToken)
      .single();

    if (!sessionData) {
      throw new Error('Invalid refresh token');
    }

    // Generate new access token
    const userRole = getUserRole(sessionData.payment_status, sessionData.plan);
    const newAccessToken = generateAccessToken(
      decoded.userId,
      userRole,
      decoded.sessionId
    );

    // Update last activity
    await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', decoded.sessionId);

    return {
      accessToken: newAccessToken,
      user: {
        id: decoded.userId,
        role: userRole,
        permissions: ROLE_PERMISSIONS[userRole] || []
      }
    };

  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }
}

/**
 * Hash token for secure storage
 */
async function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Log authentication events for security monitoring
 */
async function logAuthEvent(req, eventType, userId = null, details = null) {
  try {
    const logData = {
      event_type: eventType,
      user_id: userId,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers['user-agent'],
      endpoint: req.url,
      method: req.method,
      details: details,
      timestamp: new Date().toISOString()
    };

    // Store in security_logs table
    await supabase
      .from('security_logs')
      .insert(logData);

    // For failed authentications, also log to console for immediate alerting
    if (eventType === 'AUTH_FAILURE') {
      console.warn(`🚨 Authentication failure: ${details} from ${logData.ip_address}`);
    }

  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
}

/**
 * Rate limiting by user
 */
export const userRateLimiter = {
  // In-memory store (in production, use Redis)
  requests: new Map(),
  
  // Check rate limit for user
  checkLimit(userId, maxRequests = 100, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(userId)) {
      this.requests.set(userId, []);
    }
    
    const userRequests = this.requests.get(userId);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(userId, validRequests);
    
    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return {
        allowed: false,
        resetTime: windowStart + windowMs
      };
    }
    
    // Add current request
    validRequests.push(now);
    
    return {
      allowed: true,
      remaining: maxRequests - validRequests.length
    };
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  authMiddleware,
  adminOnly,
  premiumOnly,
  createAuthenticatedSession,
  refreshAccessToken,
  getUserRole,
  userRateLimiter
};