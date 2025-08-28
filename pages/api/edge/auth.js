// Edge function for authentication optimization
export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  const { method, url, headers } = request
  const { searchParams } = new URL(url)
  
  // Get client location for regional optimization
  const country = request.geo?.country || 'US'
  const region = request.geo?.region || 'default'
  const city = request.geo?.city || 'unknown'
  
  // Edge authentication logic
  if (method === 'POST') {
    try {
      const body = await request.json()
      const { sessionId, planType, userId } = body
      
      // Regional database optimization
      const dbRegion = getOptimalDbRegion(country)
      
      // Fast edge validation
      const validationResult = await validateSessionAtEdge(sessionId, dbRegion)
      
      if (!validationResult.valid) {
        return new Response(JSON.stringify({ 
          error: 'Invalid session',
          region: region,
          country: country 
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'X-Edge-Region': region,
            'X-Edge-Country': country,
            'Cache-Control': 'no-store'
          }
        })
      }
      
      // Return authentication success with regional info
      return new Response(JSON.stringify({
        success: true,
        sessionId,
        planType: validationResult.planType,
        region: region,
        country: country,
        dbRegion: dbRegion,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Edge-Region': region,
          'X-Edge-Country': country,
          'X-DB-Region': dbRegion,
          'Cache-Control': 'private, max-age=300'
        }
      })
      
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Authentication failed',
        region: region,
        message: error.message 
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Edge-Region': region
        }
      })
    }
  }
  
  return new Response('Method not allowed', { status: 405 })
}

// Optimize database region selection
function getOptimalDbRegion(country) {
  const regionMap = {
    'US': 'us-east-1',
    'CA': 'us-east-1', 
    'GB': 'eu-west-1',
    'DE': 'eu-west-1',
    'FR': 'eu-west-1',
    'PL': 'eu-west-1',
    'JP': 'ap-northeast-1',
    'AU': 'ap-southeast-2',
    'BR': 'sa-east-1'
  }
  
  return regionMap[country] || 'us-east-1'
}

// Fast session validation at edge
async function validateSessionAtEdge(sessionId, dbRegion) {
  // This would connect to regional Supabase instance
  // For demo purposes, returning mock validation
  
  if (!sessionId || sessionId.length < 10) {
    return { valid: false }
  }
  
  // Mock validation - in production would query regional DB
  return {
    valid: true,
    planType: 'premium',
    userId: 'user_' + sessionId.substring(0, 8)
  }
}