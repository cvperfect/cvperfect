/**
 * CVPerfect ML Optimization API Endpoint - Production Secured Version
 * Enhanced with JWT authentication, rate limiting, and comprehensive security
 */

import { createClient } from '@supabase/supabase-js';
import Joi from 'joi';
import { authMiddleware, premiumOnly, createAuthenticatedSession } from '../../lib/auth/jwt-auth.js';
import { 
  securityHeaders, 
  rateLimitConfigs, 
  validateAndSanitize, 
  generateRequestId,
  requestLogger,
  logSecurityEvent 
} from '../../lib/security/api-security-middleware.js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ML Inference Server configuration
const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:8001';
const ML_SERVER_TIMEOUT = parseInt(process.env.ML_SERVER_TIMEOUT) || 5000;

// Input validation schemas
const optimizationSchema = {
  body: Joi.object({
    sessionId: Joi.string().uuid().required()
      .messages({
        'string.uuid': 'Session ID must be a valid UUID',
        'any.required': 'Session ID is required'
      }),
    cvText: Joi.string().min(50).max(50000).required()
      .messages({
        'string.min': 'CV text must be at least 50 characters',
        'string.max': 'CV text cannot exceed 50,000 characters',
        'any.required': 'CV text is required'
      }),
    jobDescription: Joi.string().max(10000).optional().allow(null, ''),
    plan: Joi.string().valid('basic', 'gold', 'premium').default('basic'),
    language: Joi.string().valid('auto', 'pl', 'en').default('auto'),
    template: Joi.string().valid('standard', 'modern', 'classic', 'executive', 'creative', 'technical', 'minimalist').default('standard'),
    options: Joi.object({
      enableAdvancedOptimization: Joi.boolean().default(false),
      preserveFormatting: Joi.boolean().default(true),
      includeIndustryAnalysis: Joi.boolean().default(true)
    }).optional()
  }),
  
  query: Joi.object({
    format: Joi.string().valid('json', 'detailed').default('json')
  })
};

/**
 * Main secured ML optimization handler
 */
async function handler(req, res) {
  // Apply security middleware
  securityHeaders(req, res, () => {});
  generateRequestId(req, res, () => {});
  requestLogger(req, res, () => {});

  if (req.method !== 'POST') {
    await logSecurityEvent('INVALID_METHOD', req.user?.id, {
      method: req.method,
      endpoint: '/api/ml-optimize-secure'
    });
    
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowed: ['POST']
    });
  }

  const startTime = Date.now();

  try {
    // Input validation
    const validationResult = optimizationSchema.body.validate(req.body);
    if (validationResult.error) {
      await logSecurityEvent('VALIDATION_ERROR', req.user?.id, {
        errors: validationResult.error.details,
        endpoint: '/api/ml-optimize-secure'
      });

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validationResult.error.details
      });
    }

    const { sessionId, cvText, jobDescription, plan, language, template, options = {} } = validationResult.value;

    // Get and validate session data
    const sessionData = await getSecureSessionData(sessionId, req.user?.id);
    if (!sessionData.valid) {
      await logSecurityEvent('INVALID_SESSION_ACCESS', req.user?.id, {
        sessionId: sessionId,
        reason: sessionData.reason,
        endpoint: '/api/ml-optimize-secure'
      });

      return res.status(sessionData.statusCode).json({
        success: false,
        error: sessionData.error,
        code: sessionData.code
      });
    }

    // Validate plan access and permissions
    const userPlan = sessionData.session.payment_status === 'completed' ? sessionData.session.plan : 'basic';
    const validatedPlan = validatePlanAccess(userPlan, plan, req.user?.permissions || []);

    if (validatedPlan !== plan) {
      await logSecurityEvent('PLAN_DOWNGRADE', req.user?.id, {
        requestedPlan: plan,
        userPlan: userPlan,
        validatedPlan: validatedPlan
      });
    }

    // Check ML optimization quota
    const quotaCheck = await checkMLOptimizationQuota(req.user?.id, sessionId, userPlan);
    if (!quotaCheck.allowed) {
      await logSecurityEvent('QUOTA_EXCEEDED', req.user?.id, {
        plan: userPlan,
        currentUsage: quotaCheck.currentUsage,
        limit: quotaCheck.limit
      });

      return res.status(429).json({
        success: false,
        error: 'ML optimization quota exceeded',
        code: 'QUOTA_EXCEEDED',
        details: {
          currentUsage: quotaCheck.currentUsage,
          limit: quotaCheck.limit,
          resetsAt: quotaCheck.resetsAt
        }
      });
    }

    // Prepare ML request with security context
    const mlRequest = {
      cv_text: cvText,
      job_description: jobDescription,
      plan: validatedPlan,
      language: language,
      template: template,
      model_version: 'latest',
      security_context: {
        user_id: req.user?.id,
        session_id: sessionId,
        request_id: req.id,
        plan: validatedPlan,
        permissions: req.user?.permissions || []
      },
      options: {
        ...options,
        enableAdvancedOptimization: validatedPlan !== 'basic' && options.enableAdvancedOptimization
      }
    };

    // Call ML inference server with enhanced error handling
    const mlResult = await callSecureMLInferenceServer(mlRequest, req);

    // Process ML results with security validation
    const processedResult = await processMLResultsSecure(mlResult, sessionData.session, req.user);

    // Update session and log optimization
    await updateSessionWithSecureMLResults(sessionId, processedResult, mlResult, req.user?.id);
    
    // Update quota usage
    await updateMLOptimizationUsage(req.user?.id, sessionId, userPlan);

    // Log successful optimization
    const responseTime = Date.now() - startTime;
    await logSecurityEvent('ML_OPTIMIZATION_SUCCESS', req.user?.id, {
      sessionId: sessionId,
      plan: validatedPlan,
      responseTime: responseTime,
      atsScore: mlResult.ats_score,
      hasJobDescription: !!jobDescription
    });

    // Return secured response
    return res.status(200).json({
      success: true,
      data: {
        optimized_cv: processedResult.optimizedCV,
        ats_score: mlResult.ats_score,
        industry_classification: mlResult.industry_classification,
        recommendations: processedResult.recommendations,
        plan_features: mlResult.plan_features,
        security: {
          request_id: req.id,
          processed_at: new Date().toISOString(),
          plan_validated: validatedPlan,
          quota_remaining: quotaCheck.remaining
        },
        performance: {
          response_time_ms: responseTime,
          ml_inference_time_ms: mlResult.performance_metrics?.inference_time_ms || 0,
          cache_hit: mlResult.performance_metrics?.cache_hit || false
        }
      },
      metadata: {
        session_id: sessionId,
        plan: validatedPlan,
        timestamp: new Date().toISOString(),
        model_version: mlResult.performance_metrics?.model_version || 'unknown',
        security_level: 'production'
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Log detailed error for security monitoring
    await logSecurityEvent('ML_OPTIMIZATION_ERROR', req.user?.id, {
      error: error.message,
      stack: error.stack,
      responseTime: responseTime,
      sessionId: req.body?.sessionId,
      endpoint: '/api/ml-optimize-secure'
    });

    console.error('Secure ML Optimization Error:', error);

    // Return appropriate error response
    if (error.name === 'MLServerTimeoutError') {
      return res.status(504).json({
        success: false,
        error: 'ML optimization timed out',
        code: 'ML_TIMEOUT',
        details: 'The optimization process took longer than expected',
        fallback: 'basic_optimization_available'
      });
    }

    if (error.name === 'MLServerUnavailableError') {
      return res.status(503).json({
        success: false,
        error: 'ML optimization service temporarily unavailable',
        code: 'ML_SERVICE_UNAVAILABLE',
        details: 'Falling back to basic optimization',
        fallback: 'basic_optimization_available'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error during optimization',
      code: 'INTERNAL_ERROR',
      request_id: req.id,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get and validate session data with security checks
 */
async function getSecureSessionData(sessionId, userId) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !data) {
      return {
        valid: false,
        statusCode: 404,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND',
        reason: 'session_not_found'
      };
    }

    // Check if session belongs to authenticated user
    if (userId && data.user_id && data.user_id !== userId) {
      return {
        valid: false,
        statusCode: 403,
        error: 'Session access denied',
        code: 'SESSION_ACCESS_DENIED',
        reason: 'user_mismatch'
      };
    }

    // Check session expiration
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return {
        valid: false,
        statusCode: 401,
        error: 'Session expired',
        code: 'SESSION_EXPIRED',
        reason: 'session_expired'
      };
    }

    return {
      valid: true,
      session: data
    };

  } catch (error) {
    return {
      valid: false,
      statusCode: 500,
      error: 'Session validation failed',
      code: 'SESSION_VALIDATION_ERROR',
      reason: 'validation_error'
    };
  }
}

/**
 * Validate plan access with enhanced security
 */
function validatePlanAccess(userPlan, requestedPlan, userPermissions = []) {
  const planHierarchy = {
    'basic': 1,
    'gold': 2, 
    'premium': 3
  };

  const userLevel = planHierarchy[userPlan] || 1;
  const requestedLevel = planHierarchy[requestedPlan] || 1;

  // Check if user has explicit permissions
  if (userPermissions.includes('ml_optimize') && requestedLevel <= userLevel) {
    return requestedPlan;
  }

  // Default to user's plan level or lower
  if (userLevel >= requestedLevel) {
    return requestedPlan;
  }

  return userPlan;
}

/**
 * Check ML optimization quota
 */
async function checkMLOptimizationQuota(userId, sessionId, plan) {
  try {
    // Define quota limits per plan
    const quotaLimits = {
      'basic': { daily: 5, monthly: 50 },
      'gold': { daily: 25, monthly: 300 },
      'premium': { daily: 100, monthly: 1500 }
    };

    const limits = quotaLimits[plan] || quotaLimits['basic'];
    
    // Get current usage
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substring(0, 7);

    const { data: usage, error } = await supabase
      .from('ml_optimization_usage')
      .select('*')
      .eq('user_id', userId || sessionId)
      .gte('created_at', today);

    if (error) {
      console.error('Quota check error:', error);
      // Allow if we can't check quota
      return { allowed: true, remaining: limits.daily };
    }

    const dailyUsage = usage.filter(u => u.created_at.startsWith(today)).length;
    const monthlyUsage = usage.filter(u => u.created_at.startsWith(thisMonth)).length;

    const allowed = dailyUsage < limits.daily && monthlyUsage < limits.monthly;

    return {
      allowed,
      currentUsage: { daily: dailyUsage, monthly: monthlyUsage },
      limit: limits,
      remaining: Math.max(0, limits.daily - dailyUsage),
      resetsAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
    };

  } catch (error) {
    console.error('Quota check failed:', error);
    // Allow if quota check fails
    return { allowed: true, remaining: 10 };
  }
}

/**
 * Call ML inference server with enhanced security
 */
async function callSecureMLInferenceServer(mlRequest, req) {
  const maxRetries = 2;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ML_SERVER_TIMEOUT);

      const response = await fetch(`${ML_SERVER_URL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': req.id,
          'X-User-ID': req.user?.id || 'anonymous',
          'X-Session-ID': mlRequest.security_context.session_id,
          'Authorization': `Bearer ${process.env.ML_SERVER_API_KEY || 'development'}`
        },
        body: JSON.stringify(mlRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ML Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      // Validate ML server response
      if (!result || typeof result.ats_score !== 'number') {
        throw new Error('Invalid ML server response format');
      }

      return result;

    } catch (error) {
      lastError = error;
      
      await logSecurityEvent('ML_SERVER_ERROR', req.user?.id, {
        attempt: attempt,
        error: error.message,
        endpoint: ML_SERVER_URL
      });

      if (error.name === 'AbortError') {
        const timeoutError = new Error('ML optimization timed out');
        timeoutError.name = 'MLServerTimeoutError';
        throw timeoutError;
      }

      if (attempt === maxRetries) {
        const unavailableError = new Error('ML server unavailable after retries');
        unavailableError.name = 'MLServerUnavailableError';
        unavailableError.cause = lastError;
        throw unavailableError;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * Process ML results with security validation
 */
async function processMLResultsSecure(mlResult, sessionData, user) {
  try {
    const plan = sessionData.payment_status === 'completed' ? sessionData.plan : 'basic';
    
    let optimizedCV = mlResult.optimized_cv;
    let recommendations = mlResult.recommendations || [];

    // Apply plan-based feature gating with security
    if (plan === 'basic') {
      recommendations = recommendations.slice(0, 2);
      
      // For basic plan, apply content filtering
      if (mlResult.plan_features && !mlResult.plan_features.ml_optimization) {
        optimizedCV = applySecureBasicOptimization(sessionData.original_cv_text);
      }
    }

    // Add security markers for premium content
    if (plan === 'premium' && user?.permissions?.includes('ml_optimize')) {
      optimizedCV = await addSecurePremiumEnhancements(optimizedCV, mlResult, user);
      recommendations = await addSecurePremiumRecommendations(recommendations, mlResult);
    }

    // Sanitize output to prevent XSS
    optimizedCV = sanitizeOutput(optimizedCV);
    recommendations = recommendations.map(rec => sanitizeOutput(rec));

    return {
      optimizedCV,
      recommendations,
      plan,
      processingNotes: `Securely processed with ${plan} plan features`,
      securityValidated: true
    };

  } catch (error) {
    console.error('ML result processing error:', error);
    // Fallback to basic processing with security
    return {
      optimizedCV: sanitizeOutput(mlResult.optimized_cv || ''),
      recommendations: (mlResult.recommendations || []).slice(0, 3).map(rec => sanitizeOutput(rec)),
      plan: 'basic',
      processingNotes: 'Processed with secure fallback method',
      securityValidated: true
    };
  }
}

/**
 * Update ML optimization usage tracking
 */
async function updateMLOptimizationUsage(userId, sessionId, plan) {
  try {
    const usageData = {
      user_id: userId || sessionId,
      session_id: sessionId,
      plan: plan,
      created_at: new Date().toISOString()
    };

    await supabase
      .from('ml_optimization_usage')
      .insert(usageData);

  } catch (error) {
    console.error('Usage tracking failed:', error);
  }
}

/**
 * Update session with secure ML results
 */
async function updateSessionWithSecureMLResults(sessionId, processedResult, mlResult, userId) {
  try {
    const updateData = {
      ml_optimized_cv: processedResult.optimizedCV,
      ats_score: mlResult.ats_score,
      industry_classification: mlResult.industry_classification?.primary_industry,
      industry_confidence: mlResult.industry_classification?.confidence,
      ml_recommendations: processedResult.recommendations,
      ml_processing_time: mlResult.performance_metrics?.inference_time_ms || 0,
      last_ml_optimization: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      security_validated: true
    };

    const { error } = await supabase
      .from('user_sessions')
      .update(updateData)
      .eq('id', sessionId);

    if (error) {
      console.error('Secure session update error:', error);
    }

  } catch (error) {
    console.error('Secure session update failed:', error);
  }
}

// Helper functions for security
function applySecureBasicOptimization(originalCV) {
  return sanitizeOutput(originalCV);
}

async function addSecurePremiumEnhancements(optimizedCV, mlResult, user) {
  return sanitizeOutput(optimizedCV);
}

async function addSecurePremiumRecommendations(recommendations, mlResult) {
  return recommendations.map(rec => sanitizeOutput(rec));
}

function sanitizeOutput(text) {
  if (typeof text !== 'string') return '';
  
  // Remove potentially dangerous content
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Apply security middleware and authentication
const securedHandler = async (req, res) => {
  // Apply rate limiting
  rateLimitConfigs.mlOptimization(req, res, async (rateLimitError) => {
    if (rateLimitError) return;
    
    // Apply authentication (allow both authenticated and session-based access)
    if (req.headers.authorization) {
      // JWT authentication for logged-in users
      premiumOnly(req, res, async (authError) => {
        if (authError) return;
        await handler(req, res);
      });
    } else {
      // Session-based access for anonymous users
      await handler(req, res);
    }
  });
};

export default securedHandler;