import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import Head from 'next/head'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Home() {
  const [jobPosting, setJobPosting] = useState('')
  const [generatedCV, setGeneratedCV] = useState('')
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  const generateCV = async () => {
    if (!jobPosting.trim()) {
      alert('Proszę wkleić ogłoszenie o pracę')
      return
    }

    setIsGenerating(true)
    setShowDemo(false)
    setShowPaywall(false)

    try {
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobPosting }),
      })

      const data = await response.json()
      
      if (data.success) {
        setGeneratedCV(data.cv)
        setGeneratedCoverLetter(data.coverLetter)
        setShowDemo(true)
      } else {
        alert('Błąd podczas generowania CV: ' + data.error)
      }
    } catch (error) {
      alert('Błąd podczas generowania CV')
    } finally {
      setIsGenerating(false)
    }
  }

  const showPaymentOptions = () => {
    setShowPaywall(true)
  }

  const handlePayment = async (priceType) => {
    const stripe = await stripePromise
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        priceType,
        cv: generatedCV,
        coverLetter: generatedCoverLetter 
      }),
    })

    const session = await response.json()

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    })

    if (result.error) {
      alert(result.error.message)
    }
  }

  const getDemoContent = (content) => {
    const lines = content.split('\n')
    const demoLines = Math.ceil(lines.length * 0.3)
    return lines.slice(0, demoLines).join('\n') + '\n\n[... Pozostała część dostępna po zakupie ...]'
  }

  return (
    <>
      <Head>
        <title>CvPerfect - Generuj idealne CV dopasowane do oferty pracy</title>
        <meta name="description" content="Automatycznie generuj profesjonalne CV i list motywacyjny dopasowane do konkretnego ogłoszenia o pracę za pomocą AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              CV<span className="text-blue-600">Perfect</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Generuj idealne CV i list motywacyjny dopasowane do konkretnej oferty pracy za pomocą sztucznej inteligencji
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Wklej ogłoszenie o pracę
              </h2>
              
              <textarea
                value={jobPosting}
                onChange={(e) => setJobPosting(e.target.value)}
                placeholder="Wklej tutaj treść ogłoszenia o pracę..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <button
                onClick={generateCV}
                disabled={isGenerating}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                {isGenerating ? 'Generuję...' : 'Generuj CV i List Motywacyjny'}
              </button>
            </div>

            {showDemo && (
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    Twoje CV (Podgląd - 30%)
                  </h3>
                  <div className="relative">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
                      {getDemoContent(generatedCV)}
                    </pre>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    List Motywacyjny (Podgląd - 30%)
                  </h3>
                  <div className="relative">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
                      {getDemoContent(generatedCoverLetter)}
                    </pre>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                  </div>
                </div>
              </div>
            )}

            {showDemo && !showPaywall && (
              <div className="text-center mb-8">
                <button
                  onClick={showPaymentOptions}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-200"
                >
                  Zobacz pełne CV i pobierz PDF
                </button>
              </div>
            )}

            {showPaywall && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                  Wybierz opcję płatności
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition duration-200">
                    <h3 className="text-xl font-semibold mb-4 text-blue-600">
                      Jednorazowy zakup
                    </h3>
                    <div className="text-3xl font-bold mb-4">9,99 zł</div>
                    <ul className="mb-6 space-y-2 text-gray-600">
                      <li>✓ Pełne CV i list motywacyjny</li>
                      <li>✓ Pobieranie PDF</li>
                      <li>✓ Bez limitu czasu</li>
                      <li>✓ Jedna oferta pracy</li>
                    </ul>
                    <button
                      onClick={() => handlePayment('onetime')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                    >
                      Kup teraz
                    </button>
                  </div>

                  <div className="border-2 border-green-200 rounded-lg p-6 hover:border-green-400 transition duration-200 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      POPULARNE
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-green-600">
                      Subskrypcja miesięczna
                    </h3>
                    <div className="text-3xl font-bold mb-4">49 zł/mies</div>
                    <ul className="mb-6 space-y-2 text-gray-600">
                      <li>✓ 10 CV miesięcznie</li>
                      <li>✓ Wszystkie funkcje</li>
                      <li>✓ Pobieranie PDF</li>
                      <li>✓ Anuluj w każdym momencie</li>
                    </ul>
                    <button
                      onClick={() => handlePayment('subscription')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                    >
                      Zacznij subskrypcję
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-800">
              Dlaczego CvPerfect?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold mb-2">Dopasowane do oferty</h3>
                <p className="text-gray-600">AI analizuje ogłoszenie i tworzy CV idealnie dopasowane do wymagań</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold mb-2">Szybko i łatwo</h3>
                <p className="text-gray-600">Generowanie profesjonalnego CV w mniej niż minutę</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="font-semibold mb-2">Gotowy PDF</h3>
                <p className="text-gray-600">Pobierz profesjonalnie sformatowany dokument gotowy do wysłania</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}