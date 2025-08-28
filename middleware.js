import { NextResponse } from 'next/server'

// Edge middleware for global performance optimization
export function middleware(request) {
  const { pathname, search } = request.nextUrl
  const response = NextResponse.next()
  
  // Get client location and connection info
  const country = request.geo?.country || 'US'
  const region = request.geo?.region || 'default'
  const city = request.geo?.city || 'unknown'
  const latitude = request.geo?.latitude || 0
  const longitude = request.geo?.longitude || 0
  
  // Add geographic headers for all responses
  response.headers.set('X-Client-Country', country)
  response.headers.set('X-Client-Region', region)
  response.headers.set('X-Client-City', city)
  response.headers.set('X-Timestamp', new Date().toISOString())
  
  // A/B testing at the edge
  const abTestVariant = getABTestVariant(request)
  response.headers.set('X-AB-Test-Variant', abTestVariant)
  
  // Regional CDN optimization
  if (pathname.startsWith('/static/') || /\.(js|css|ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)$/.test(pathname)) {
    // Aggressive caching for static assets
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('X-CDN-Region', getOptimalCDNRegion(country))
    return response
  }
  
  // API route optimizations
  if (pathname.startsWith('/api/')) {
    // Regional API routing
    const apiRegion = getOptimalAPIRegion(country, latitude, longitude)
    response.headers.set('X-API-Region', apiRegion)
    
    // Performance monitoring headers
    response.headers.set('X-Edge-Start-Time', Date.now().toString())
    
    // Rate limiting by region
    const rateLimitKey = `${country}-${request.ip}`
    response.headers.set('X-Rate-Limit-Key', rateLimitKey)
    
    // Security headers for API routes
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    
    return response
  }
  
  // Page-level optimizations
  if (pathname === '/' || pathname === '/success') {
    // Critical resource preloading hints
    const preloadHints = getCriticalResources(pathname, country)
    response.headers.set('X-Preload-Hints', JSON.stringify(preloadHints))
    
    // Regional template optimization
    const templateRegion = country === 'PL' ? 'eu-central-1' : 'us-east-1'
    response.headers.set('X-Template-Region', templateRegion)
    
    // Language optimization
    const acceptLanguage = request.headers.get('accept-language') || ''
    const preferredLang = acceptLanguage.includes('pl') ? 'pl' : 'en'
    response.headers.set('X-Preferred-Language', preferredLang)
  }
  
  // Bot detection and optimization
  const userAgent = request.headers.get('user-agent') || ''
  const isBot = /bot|crawler|spider|crawling/i.test(userAgent)
  
  if (isBot) {
    // Optimized responses for search engines
    response.headers.set('X-Robot-Optimized', 'true')
    response.headers.set('Cache-Control', 'public, max-age=3600')
  } else {
    // User-specific optimizations
    response.headers.set('X-User-Optimized', 'true')
    
    // Performance monitoring for real users
    response.headers.set('X-Performance-Monitor', 'enabled')
  }
  
  // Security enhancements
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return response
}

// A/B testing logic
function getABTestVariant(request) {
  const userId = request.cookies.get('session_id')?.value || request.ip || 'anonymous'
  
  // Simple hash-based A/B testing
  const hash = simpleHash(userId)
  const variants = ['control', 'variant_a', 'variant_b']
  
  return variants[hash % variants.length]
}

// Regional CDN optimization
function getOptimalCDNRegion(country) {
  const cdnRegions = {
    'US': 'us-east-1',
    'CA': 'us-east-1',
    'GB': 'eu-west-1',
    'DE': 'eu-central-1',
    'FR': 'eu-west-3',
    'PL': 'eu-central-1',
    'JP': 'ap-northeast-1',
    'AU': 'ap-southeast-2',
    'BR': 'sa-east-1',
    'IN': 'ap-south-1'
  }
  
  return cdnRegions[country] || 'us-east-1'
}

// Regional API routing
function getOptimalAPIRegion(country, latitude, longitude) {
  // Primary region mapping
  const primaryRegions = {
    'US': 'us-east-1',
    'CA': 'us-east-1',
    'MX': 'us-east-1',
    'GB': 'eu-west-2',
    'IE': 'eu-west-1',
    'DE': 'eu-central-1',
    'FR': 'eu-west-3',
    'PL': 'eu-central-1',
    'IT': 'eu-south-1',
    'ES': 'eu-west-1',
    'NL': 'eu-west-1',
    'SE': 'eu-north-1',
    'JP': 'ap-northeast-1',
    'KR': 'ap-northeast-2',
    'AU': 'ap-southeast-2',
    'NZ': 'ap-southeast-2',
    'SG': 'ap-southeast-1',
    'IN': 'ap-south-1',
    'BR': 'sa-east-1',
    'ZA': 'af-south-1'
  }
  
  if (primaryRegions[country]) {
    return primaryRegions[country]
  }
  
  // Fallback to geographic proximity
  if (latitude > 60) return 'eu-north-1' // Arctic
  if (latitude > 45 && longitude > -10 && longitude < 40) return 'eu-central-1' // Central Europe
  if (latitude > 35 && longitude > -10 && longitude < 40) return 'eu-south-1' // Southern Europe  
  if (latitude > 25 && longitude < -60) return 'us-east-1' // North America
  if (latitude < 25 && latitude > -25 && longitude < -30) return 'sa-east-1' // South America
  if (longitude > 100) return 'ap-southeast-1' // Southeast Asia
  if (longitude > 70) return 'ap-south-1' // South Asia
  if (latitude < -25) return 'ap-southeast-2' // Oceania
  
  return 'us-east-1' // Default
}

// Critical resource hints based on page and region
function getCriticalResources(pathname, country) {
  const baseResources = {
    fonts: ['/fonts/inter-var.woff2'],
    styles: ['/styles/globals.css'],
    scripts: []
  }
  
  if (pathname === '/') {
    baseResources.scripts.push('/js/cv-upload.js')
    baseResources.scripts.push('/js/file-processor.js')
  }
  
  if (pathname === '/success') {
    baseResources.scripts.push('/js/template-renderer.js')
    baseResources.scripts.push('/js/export-tools.js')
  }
  
  // Regional optimizations
  if (country === 'PL') {
    baseResources.styles.push('/styles/polish-locale.css')
  }
  
  return baseResources
}

// Simple hash function for A/B testing
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}