// Edge function for CV processing optimization
export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  const { method, url, headers } = request
  const { searchParams } = new URL(url)
  
  // Get client location for regional optimization
  const country = request.geo?.country || 'US'
  const region = request.geo?.region || 'default'
  const latitude = request.geo?.latitude || 0
  const longitude = request.geo?.longitude || 0
  
  if (method === 'POST') {
    try {
      const body = await request.json()
      const { cvData, planType, sessionId, processingType } = body
      
      // Regional ML inference optimization
      const mlRegion = getOptimalMLRegion(country, latitude, longitude)
      const processingStartTime = Date.now()
      
      // Edge-optimized CV processing
      const processedResult = await processCV({
        cvData,
        planType,
        sessionId,
        processingType,
        mlRegion,
        country,
        region
      })
      
      const processingTime = Date.now() - processingStartTime
      
      // Log performance metrics
      await logEdgeMetrics({
        metric_name: 'EDGE_CV_PROCESSING',
        processing_time: processingTime,
        region: region,
        country: country,
        ml_region: mlRegion,
        plan_type: planType,
        session_id: sessionId
      })
      
      return new Response(JSON.stringify({
        success: true,
        data: processedResult,
        performance: {
          processing_time: processingTime,
          edge_region: region,
          ml_region: mlRegion,
          country: country
        },
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Edge-Region': region,
          'X-ML-Region': mlRegion,
          'X-Processing-Time': processingTime.toString(),
          'Cache-Control': 'private, no-cache'
        }
      })
      
    } catch (error) {
      console.error('Edge CV processing error:', error)
      
      return new Response(JSON.stringify({ 
        error: 'CV processing failed',
        region: region,
        message: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Edge-Region': region,
          'X-Error': 'CV_PROCESSING_FAILED'
        }
      })
    }
  }
  
  return new Response('Method not allowed', { status: 405 })
}

// Optimize ML inference region selection
function getOptimalMLRegion(country, latitude, longitude) {
  const mlRegions = {
    'US': 'us-west-2',
    'CA': 'us-west-2', 
    'GB': 'eu-west-2',
    'DE': 'eu-central-1',
    'FR': 'eu-west-3',
    'PL': 'eu-central-1',
    'JP': 'ap-northeast-1',
    'AU': 'ap-southeast-2',
    'BR': 'sa-east-1',
    'IN': 'ap-south-1',
    'SG': 'ap-southeast-1'
  }
  
  // If country-specific region exists, use it
  if (mlRegions[country]) {
    return mlRegions[country]
  }
  
  // Otherwise, use geographic proximity
  if (latitude > 45) return 'eu-north-1' // Nordic
  if (latitude < -30) return 'ap-southeast-2' // Southern hemisphere
  if (longitude < -60) return 'us-west-2' // Americas
  if (longitude > 100) return 'ap-northeast-1' // Asia
  
  return 'eu-west-1' // Default Europe
}

// Edge-optimized CV processing
async function processCV({ cvData, planType, sessionId, processingType, mlRegion, country, region }) {
  // Lightweight processing for basic plans
  if (planType === 'basic') {
    return {
      processed_text: cvData?.text || '',
      improvements: ['Basic formatting improvements'],
      ats_score: 75,
      processing_type: 'edge_basic',
      region: region
    }
  }
  
  // Advanced processing for premium plans
  if (planType === 'premium' || planType === 'gold') {
    // This would call regional ML inference API
    const mlResult = await callMLInference({
      text: cvData?.text || '',
      region: mlRegion,
      plan: planType
    })
    
    return {
      processed_text: mlResult.optimized_text,
      improvements: mlResult.improvements,
      ats_score: mlResult.ats_score,
      keywords: mlResult.keywords,
      processing_type: 'edge_premium',
      region: region,
      ml_region: mlRegion
    }
  }
  
  return {
    processed_text: cvData?.text || '',
    improvements: [],
    ats_score: 0,
    processing_type: 'edge_fallback',
    region: region
  }
}

// Mock ML inference call - in production would call regional ML API
async function callMLInference({ text, region, plan }) {
  // Simulate processing delay based on region
  const delay = region.includes('eu') ? 150 : 250
  await new Promise(resolve => setTimeout(resolve, delay))
  
  return {
    optimized_text: text + ' [OPTIMIZED BY EDGE ML]',
    improvements: [
      'Enhanced professional language',
      'Improved keyword density',
      'Better formatting structure'
    ],
    ats_score: plan === 'premium' ? 92 : 85,
    keywords: ['leadership', 'innovation', 'results-driven']
  }
}

// Log performance metrics to edge analytics
async function logEdgeMetrics(metrics) {
  try {
    // In production, this would send to analytics service
    console.log('Edge Metrics:', metrics)
  } catch (error) {
    console.error('Failed to log edge metrics:', error)
  }
}