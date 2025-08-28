/**
 * CVPerfect ML Optimization API Endpoint
 * Integrates with ML inference server for advanced CV optimization
 */

import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ML Inference Server configuration
const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:8001';
const ML_SERVER_TIMEOUT = parseInt(process.env.ML_SERVER_TIMEOUT) || 5000; // 5s timeout

/**
 * Main ML optimization handler
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST']
    });
  }

  const startTime = Date.now();

  try {
    // Validate request
    const { 
      sessionId,
      cvText, 
      jobDescription = null,
      plan = 'basic',
      language = 'auto',
      template = 'standard' 
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session ID is required' 
      });
    }

    if (!cvText || typeof cvText !== 'string' || cvText.trim().length < 50) {
      return res.status(400).json({ 
        success: false, 
        error: 'CV text is required and must be at least 50 characters' 
      });
    }

    // Get session data from Supabase
    const sessionData = await getSessionData(sessionId);
    if (!sessionData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }

    // Validate plan access
    const userPlan = sessionData.payment_status === 'completed' ? sessionData.plan : 'basic';
    const validatedPlan = validatePlanAccess(userPlan, plan);

    // Prepare ML request
    const mlRequest = {
      cv_text: cvText,
      job_description: jobDescription,
      plan: validatedPlan,
      language: language,
      template: template,
      model_version: 'latest'
    };

    // Call ML inference server
    const mlResult = await callMLInferenceServer(mlRequest);

    // Process ML results
    const processedResult = await processMLResults(mlResult, sessionData);

    // Update session with ML results
    await updateSessionWithMLResults(sessionId, processedResult, mlResult);

    // Log performance metrics
    const responseTime = Date.now() - startTime;
    await logPerformanceMetrics(sessionId, responseTime, mlResult, userPlan);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        optimized_cv: processedResult.optimizedCV,
        ats_score: mlResult.ats_score,
        industry_classification: mlResult.industry_classification,
        recommendations: processedResult.recommendations,
        plan_features: mlResult.plan_features,
        performance: {
          response_time_ms: responseTime,
          ml_inference_time_ms: mlResult.performance_metrics.inference_time_ms,
          cache_hit: mlResult.performance_metrics.cache_hit || false
        }
      },
      metadata: {
        session_id: sessionId,
        plan: validatedPlan,
        timestamp: new Date().toISOString(),
        model_version: mlResult.performance_metrics.model_version
      }
    });

  } catch (error) {
    console.error('ML Optimization Error:', error);
    
    const responseTime = Date.now() - startTime;
    
    // Log error for monitoring
    await logError(req.body.sessionId, error, responseTime);

    // Return appropriate error response
    if (error.name === 'MLServerTimeoutError') {
      return res.status(504).json({
        success: false,
        error: 'ML optimization timed out. Please try again.',
        details: 'The optimization process took longer than expected.',
        fallback: 'basic_optimization_available'
      });
    }

    if (error.name === 'MLServerUnavailableError') {
      return res.status(503).json({
        success: false,
        error: 'ML optimization service temporarily unavailable',
        details: 'Falling back to basic optimization',
        fallback: 'basic_optimization_available'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error during optimization',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get session data from Supabase
 */
async function getSessionData(sessionId) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Supabase session fetch error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Session data retrieval error:', error);
    return null;
  }
}

/**
 * Validate plan access and downgrade if necessary
 */
function validatePlanAccess(userPlan, requestedPlan) {
  const planHierarchy = {
    'basic': 1,
    'gold': 2,
    'premium': 3
  };

  const userLevel = planHierarchy[userPlan] || 1;
  const requestedLevel = planHierarchy[requestedPlan] || 1;

  // If user's plan is lower than requested, downgrade to user's plan
  if (userLevel < requestedLevel) {
    console.log(`Plan downgraded from ${requestedPlan} to ${userPlan} for session`);
    return userPlan;
  }

  return requestedPlan;
}

/**
 * Call ML inference server with timeout and retry logic
 */
async function callMLInferenceServer(mlRequest) {
  const maxRetries = 2;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`ML Server call attempt ${attempt}/${maxRetries}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ML_SERVER_TIMEOUT);

      const response = await fetch(`${ML_SERVER_URL}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      console.log(`ML optimization successful in attempt ${attempt}`);
      return result;

    } catch (error) {
      lastError = error;
      console.error(`ML Server attempt ${attempt} failed:`, error.message);

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

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * Process ML results and apply business logic
 */
async function processMLResults(mlResult, sessionData) {
  try {
    // Apply plan-specific processing
    const plan = sessionData.payment_status === 'completed' ? sessionData.plan : 'basic';
    
    let optimizedCV = mlResult.optimized_cv;
    let recommendations = mlResult.recommendations;

    // Plan-based feature gating
    if (plan === 'basic') {
      // Basic plan: limit recommendations and disable advanced features
      recommendations = recommendations.slice(0, 2);
      
      // For basic plan, use simpler optimization
      if (mlResult.plan_features && !mlResult.plan_features.ml_optimization) {
        optimizedCV = applyBasicOptimization(sessionData.original_cv_text);
      }
    }

    // Add CVPerfect-specific enhancements
    if (plan === 'premium') {
      optimizedCV = await addPremiumEnhancements(optimizedCV, mlResult);
      recommendations = await addPremiumRecommendations(recommendations, mlResult);
    }

    return {
      optimizedCV,
      recommendations,
      plan,
      processingNotes: `Processed with ${plan} plan features`
    };

  } catch (error) {
    console.error('ML result processing error:', error);
    // Fallback to basic processing
    return {
      optimizedCV: mlResult.optimized_cv,
      recommendations: mlResult.recommendations.slice(0, 3),
      plan: 'basic',
      processingNotes: 'Processed with fallback method'
    };
  }
}

/**
 * Apply basic CV optimization for free plan
 */
function applyBasicOptimization(originalCV) {
  // Simple text improvements for basic plan
  let optimized = originalCV;
  
  // Basic formatting improvements
  optimized = optimized.replace(/\s+/g, ' '); // Normalize whitespace
  optimized = optimized.replace(/([.!?])\s*([A-Z])/g, '$1 $2'); // Fix punctuation spacing
  
  // Add basic structure if missing
  if (!optimized.toLowerCase().includes('experience') && !optimized.toLowerCase().includes('doświadczenie')) {
    optimized += '\n\nExperience:\n[Please add your work experience]';
  }
  
  if (!optimized.toLowerCase().includes('skills') && !optimized.toLowerCase().includes('umiejętności')) {
    optimized += '\n\nSkills:\n[Please add your skills]';
  }
  
  return optimized;
}

/**
 * Add premium enhancements
 */
async function addPremiumEnhancements(optimizedCV, mlResult) {
  // Premium features: advanced formatting, industry-specific optimization
  let enhanced = optimizedCV;
  
  // Add industry-specific section if confidence is high
  const industryData = mlResult.industry_classification;
  if (industryData.confidence > 80) {
    enhanced += `\n\n<!-- Industry: ${industryData.primary_industry} (${industryData.confidence}% confidence) -->`;
  }
  
  // Add ATS optimization markers
  if (mlResult.ats_score > 85) {
    enhanced = `<!-- ATS Optimized Score: ${mlResult.ats_score}/100 -->\n\n${enhanced}`;
  }
  
  return enhanced;
}

/**
 * Add premium recommendations
 */
async function addPremiumRecommendations(recommendations, mlResult) {
  const premium = [...recommendations];
  
  // Add industry-specific recommendations
  const industry = mlResult.industry_classification.primary_industry;
  if (industry && mlResult.industry_classification.confidence > 70) {
    premium.push(`Consider adding ${industry}-specific certifications or projects`);
    premium.push(`Highlight ${industry} industry keywords in your experience section`);
  }
  
  // Add ATS-specific recommendations
  if (mlResult.ats_score < 90) {
    premium.push(`Your ATS score is ${mlResult.ats_score}/100 - consider adding more relevant keywords`);
  }
  
  return premium.slice(0, 7); // Max 7 recommendations for premium
}

/**
 * Update session with ML results
 */
async function updateSessionWithMLResults(sessionId, processedResult, mlResult) {
  try {
    const updateData = {
      ml_optimized_cv: processedResult.optimizedCV,
      ats_score: mlResult.ats_score,
      industry_classification: mlResult.industry_classification.primary_industry,
      industry_confidence: mlResult.industry_classification.confidence,
      ml_recommendations: processedResult.recommendations,
      ml_processing_time: mlResult.performance_metrics.inference_time_ms,
      last_ml_optimization: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_sessions')
      .update(updateData)
      .eq('id', sessionId);

    if (error) {
      console.error('Session update error:', error);
    } else {
      console.log(`Session ${sessionId} updated with ML results`);
    }

  } catch (error) {
    console.error('Session update failed:', error);
  }
}

/**
 * Log performance metrics for monitoring
 */
async function logPerformanceMetrics(sessionId, responseTime, mlResult, plan) {
  try {
    const metricsData = {
      session_id: sessionId,
      endpoint: '/api/ml-optimize',
      response_time_ms: responseTime,
      ml_inference_time_ms: mlResult.performance_metrics?.inference_time_ms || 0,
      ats_score: mlResult.ats_score,
      plan: plan,
      cache_hit: mlResult.performance_metrics?.cache_hit || false,
      model_version: mlResult.performance_metrics?.model_version || 'unknown',
      timestamp: new Date().toISOString()
    };

    // Store in performance_metrics table
    const { error } = await supabase
      .from('performance_metrics')
      .insert(metricsData);

    if (error) {
      console.error('Performance metrics logging failed:', error);
    }

  } catch (error) {
    console.error('Performance logging error:', error);
  }
}

/**
 * Log errors for monitoring and debugging
 */
async function logError(sessionId, error, responseTime) {
  try {
    const errorData = {
      session_id: sessionId || 'unknown',
      endpoint: '/api/ml-optimize',
      error_type: error.name || 'UnknownError',
      error_message: error.message,
      response_time_ms: responseTime,
      stack_trace: process.env.NODE_ENV === 'development' ? error.stack : null,
      timestamp: new Date().toISOString()
    };

    console.error('API Error:', errorData);

    // In production, you might want to send to error tracking service
    // await sendToErrorTracking(errorData);

  } catch (logError) {
    console.error('Error logging failed:', logError);
  }
}