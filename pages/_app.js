import '../styles/globals.css'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'

// Dynamic import with SSR disabled to prevent hydration mismatch
const PerformanceMonitor = dynamic(
  () => import('../components/PerformanceMonitor.jsx'),
  { 
    ssr: false, // Critical: Disable SSR for this component
    loading: () => null
  }
)

// Error boundary for hydration issues
const HydrationErrorBoundary = ({ children }) => {
  const [hasHydrationError, setHasHydrationError] = useState(false)
  
  useEffect(() => {
    const handleError = (error) => {
      if (error.message?.includes('Hydration') || error.message?.includes('hydr')) {
        setHasHydrationError(true)
        console.warn('Hydration error caught and handled:', error)
      }
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])
  
  if (hasHydrationError) {
    return <div>Loading application...</div>
  }
  
  return children
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [userId, setUserId] = useState(null)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true)
    
    // Initialize performance monitoring on app start
    if (typeof window !== 'undefined') {
      // Track app initialization time
      window.__CVP_APP_START = Date.now()
      
      // Get or generate user ID for performance tracking
      let storedUserId = localStorage.getItem('cvperfect_user_id')
      if (!storedUserId) {
        storedUserId = 'user_' + Math.random().toString(36).substr(2, 9)
        localStorage.setItem('cvperfect_user_id', storedUserId)
      }
      setUserId(storedUserId)
      
      // Track route changes for performance monitoring
      const handleRouteChange = (url) => {
        window.__CVP_ROUTE_CHANGE = Date.now()
      }
      
      router.events.on('routeChangeStart', handleRouteChange)
      
      return () => {
        router.events.off('routeChangeStart', handleRouteChange)
      }
    }
  }, [router])

  // Get current page name for performance tracking
  const getCurrentPage = () => {
    const path = router.pathname
    if (path === '/') return 'home'
    if (path === '/success') return 'success'
    if (path === '/performance') return 'performance_dashboard'
    return path.replace('/', '') || 'unknown'
  }

  // Determine if production monitoring should be enabled
  const isProductionMode = process.env.NODE_ENV === 'production' || 
                          process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true'

  return (
    <HydrationErrorBoundary>
      {/* Only render PerformanceMonitor on client side to prevent hydration mismatch */}
      {isClient && (
        <PerformanceMonitor 
          userId={userId}
          page={getCurrentPage()}
          enableBundleTracking={true}
          enableProductionMode={isProductionMode}
        />
      )}
      <Component {...pageProps} />
    </HydrationErrorBoundary>
  )
}