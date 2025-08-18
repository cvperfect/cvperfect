import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Footer from '../components/Footer'
import PremiumCVAnalysis from '../components/PremiumCVAnalysis'

// Prosty komponent Navbar - możesz go później zastąpić swoim
const SimpleNavbar = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                CvPerfect
              </span>
            </a>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-blue-500 transition-colors">
              Strona główna
            </a>
            <a href="/dashboard" className="text-gray-700 hover:text-blue-500 transition-colors">
              Moje CV
            </a>
            <a href="/contact" className="text-gray-700 hover:text-blue-500 transition-colors">
              Kontakt
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function Success() {
  const router = useRouter()
  const { session_id } = router.query
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session_id) {
      console.log('🔍 Fetching session:', session_id)
      
      fetch(`/api/get-session?session_id=${session_id}`)
        .then(res => res.json())
        .then(data => {
          console.log('API Response:', data)
          
          if (data.success && data.session) {
            console.log('✅ Session data set successfully')
            setSessionData(data.session)
          } else {
            console.log('❌ API returned no success')
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Error fetching session:', err)
          setLoading(false)
        })
    } else {
      console.log('❌ No session_id in URL')
      setLoading(false)
    }
  }, [session_id])

  // Określ plan na podstawie ceny
  const getPlanFromPrice = (amount) => {
    if (amount === 1999) return 'basic'      // 19.99 zł
    if (amount === 4900) return 'pro'        // 49 zł
    if (amount === 7900) return 'premium'    // 79 zł
    return 'basic'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Head>
          <title>Ładowanie... - CvPerfect</title>
        </Head>
        <SimpleNavbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Ładowanie Twojego zoptymalizowanego CV...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Head>
          <title>Błąd - CvPerfect</title>
        </Head>
        <SimpleNavbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Coś poszło nie tak</h1>
            <p className="text-gray-600 mb-6">Nie udało się pobrać danych Twojej sesji płatności.</p>
            <p className="text-sm text-gray-500 mb-6">Session ID: {session_id || 'Brak'}</p>
            <button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Powrót do strony głównej
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const plan = getPlanFromPrice(sessionData.amount_total)
  console.log('🎯 Final plan:', plan, 'Amount:', sessionData.amount_total)

  // Plan label helper
  const getPlanLabel = () => {
    switch(plan) {
      case 'premium': return { label: 'Premium', color: 'purple', icon: '💎', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' };
      case 'pro': return { label: 'Pro', color: 'blue', icon: '🚀', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' };
      default: return { label: 'Basic', color: 'gray', icon: '⚡', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
    }
  };

  const planInfo = getPlanLabel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Head>
        <title>Sukces! Twoje CV zostało zoptymalizowane - CvPerfect</title>
        <meta name="description" content="Gratulacje! Twoje CV zostało profesjonalnie zoptymalizowane przez AI. Pobierz swoje dokumenty i zwiększ szanse na wymarzoną pracę." />
      </Head>
      
      <SimpleNavbar />
      
      {/* Enhanced Success Header with Plan Info */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-6">
              <div className="inline-flex items-center bg-green-100 border border-green-300 rounded-full px-6 py-3">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-green-800 font-bold">🎉 PŁATNOŚĆ POTWIERDZONA</span>
              </div>
              
              <div className={`inline-flex items-center ${planInfo.bg} border ${planInfo.border} rounded-full px-4 py-2`}>
                <span className={`${planInfo.text} font-medium`}>
                  {planInfo.icon} Plan: {planInfo.label}
                </span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Twoje CV zostało w pełni zoptymalizowane!
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gratulacje! Zwiększyłeś swoje szanse na rozmowę kwalifikacyjną.
              Poniżej znajdziesz szczegółową analizę i możliwość pobrania dokumentów.
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PremiumCVAnalysis
          optimizedCV={sessionData.metadata?.cv || ""}
          originalCV={sessionData.metadata?.originalCV || ""}
          jobPosting={sessionData.metadata?.jobPosting || ""}
          plan={plan}
        />
        
        {/* Additional Trust Badges */}
        <div className="mt-12 py-8 border-t border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">Zaufało nam już ponad 10,000+ osób</h3>
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Bezpieczne płatności Stripe
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Gwarancja satysfakcji
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Wsparcie 24/7
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}