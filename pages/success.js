import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import PremiumCVAnalysis from '../components/PremiumCVAnalysis'

export default function Success() {
  const router = useRouter()
  const { session_id } = router.query
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session_id) {
      // Pobierz dane sesji z Stripe
      fetch(`/api/get-session?session_id=${session_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSessionData(data.session)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Error fetching session:', err)
          setLoading(false)
        })
    }
  }, [session_id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Ładowanie Twojego zoptymalizowanego CV...</p>
        </div>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Coś poszło nie tak</h1>
          <p className="text-gray-600 mb-6">Nie udało się pobrać danych Twojej sesji płatności.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Powrót do strony głównej
          </button>
        </div>
      </div>
    )
  }

  // Określ plan na podstawie ceny
  const getPlanFromPrice = (amount) => {
    if (amount === 999) return 'basic'      // 9.99 zł
    if (amount === 4900) return 'pro'       // 49 zł
    if (amount === 7900) return 'premium'   // 79 zł
    return 'basic'
  }

  const plan = getPlanFromPrice(sessionData.amount_total)

  return (
    <>
      <Head>
        <title>Sukces! Twoje CV zostało zoptymalizowane - CvPerfect</title>
      </Head>

      <PremiumCVAnalysis 
        optimizedCV={sessionData.metadata?.cv || "Przykład zoptymalizowanego CV..."}
        originalCV={sessionData.metadata?.originalCV || ""}
        jobPosting={sessionData.metadata?.jobPosting || ""}
        plan={plan}
      />
    </>
  )
}