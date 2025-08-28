// Performance Dashboard Page - Admin/Developer view with Authentication
import Head from 'next/head'
import PerformanceDashboard from '../components/PerformanceDashboard'

export default function Performance() {
  return (
    <>
      <Head>
        <title>Performance Dashboard - CVPerfect</title>
        <meta name="description" content="CVPerfect Performance Monitoring Dashboard" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <PerformanceDashboard />
    </>
  )
}

export async function getServerSideProps(context) {
  const { req, query } = context
  const adminKey = process.env.PERFORMANCE_DASHBOARD_KEY

  if (!adminKey) {
    console.error('PERFORMANCE_DASHBOARD_KEY not configured')
    return {
      notFound: true
    }
  }

  // Check authentication via URL parameter or header
  const keyFromQuery = query.key
  const keyFromHeader = req.headers['x-admin-key']
  
  const providedKey = keyFromQuery || keyFromHeader
  
  if (!providedKey || providedKey !== adminKey) {
    console.warn('Unauthorized access attempt to performance dashboard', {
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      providedKey: providedKey ? '[PROVIDED]' : '[NONE]'
    })
    
    return {
      notFound: true // Return 404 instead of 403 for security
    }
  }

  // Authentication successful
  return {
    props: {}
  }
}
