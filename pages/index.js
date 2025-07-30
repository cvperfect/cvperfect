import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import Head from 'next/head'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

export default function Home() {
  const [jobPosting, setJobPosting] = useState('')
  const [currentCV, setCurrentCV] = useState('')
  const [uploadMethod, setUploadMethod] = useState('text')
  const [optimizedCV, setOptimizedCV] = useState('')
  const [optimizedCoverLetter, setOptimizedCoverLetter] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCurrentCV(e.target.result)
      }
      reader.readAsText(file)
    }
  }

  const optimizeCV = async () => {
    if (!jobPosting.trim() || !currentCV.trim()) {
      alert('Proszę wypełnić oba pola: ogłoszenie i CV')
      return
    }

    setIsOptimizing(true)
    setShowDemo(false)
    setShowPaywall(false)

    try {
      const response = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobPosting, currentCV }),
      })

      const data = await response.json()
      
      if (data.success) {
        setOptimizedCV(data.optimizedCV)
        setOptimizedCoverLetter(data.coverLetter)
        setShowDemo(true)
      } else {
        alert('Błąd podczas optymalizacji CV: ' + data.error)
      }
    } catch (error) {
      alert('Błąd podczas optymalizacji CV')
    } finally {
      setIsOptimizing(false)
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
        cv: optimizedCV,
        coverLetter: optimizedCoverLetter 
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
        <title>CvPerfect - Optymalizuj CV pod konkretną ofertę pracy</title>
        <meta name="description" content="Automatycznie optymalizuj swoje CV pod konkretną ofertę pracy za pomocą AI" />
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
              Optymalizuj swoje CV pod konkretną ofertę pracy za pomocą sztucznej inteligencji
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Krok 1: Wklej ogłoszenie o pracę
              </h2>
              
              <textarea
                value={jobPosting}
                onChange={(e) => setJobPosting(e.target.value)}
                placeholder="Wklej tutaj treść ogłoszenia o pracę do której chcesz aplikować..."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
              />

              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Krok 2: Dodaj swoje obecne CV
              </h2>

              <div className="mb-4">
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="text"
                      checked={uploadMethod === 'text'}
                      onChange={(e) => setUploadMethod(e.target.value)}
                      className="mr-2"
                    />
                    <span>Wklej jako tekst</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="file"
                      checked={uploadMethod === 'file'}
                      onChange={(e) => setUploadMethod(e.target.value)}
                      className="mr-2"
                    />
                    <span>Upload plik (PDF/DOCX)</span>
                  </label>
                </div>

                {uploadMethod === 'text' ? (
                  <textarea
                    value={currentCV}
                    onChange={(e) => setCurrentCV(e.target.value)}
                    placeholder="Wklej tutaj treść swojego obecnego CV..."
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileUpload}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Obsługujemy pliki: PDF, DOCX, DOC, TXT
                    </p>
                    {currentCV && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Podgląd wczytanego CV:</h4>
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                          {currentCV.slice(0, 500)}...
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <button
                onClick={optimizeCV}
                disabled={isOptimizing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                {isOptimizing ? 'Optymalizuję CV...' : 'Optymalizuj CV pod ofertę'}
              </button>
            </div>

            {showDemo && (
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    Optymalizowane CV (Podgląd - 30%)
                  </h3>
                  <div className="relative">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
  <div className="space-y-4">
    {getDemoContent(optimizedCV).split('\n\n').map((section, index) => (
      <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{section}</p>
      </div>
    ))}
  </div>
</div>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    List Motywacyjny (Podgląd - 30%)
                  </h3>
                  <div className="relative">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
  <div className="space-y-4">
    {getDemoContent(optimizedCoverLetter).split('\n\n').map((section, index) => (
      <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{section}</p>
      </div>
    ))}
  </div>
</div>
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
                  Pobierz pełne CV i list motywacyjny
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
                      <li>✓ Pełne optymalizowane CV</li>
                      <li>✓ List motywacyjny</li>
                      <li>✓ Pobieranie PDF</li>
                      <li>✓ Jedna optymalizacja</li>
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
                      <li>✓ 10 optymalizacji miesięcznie</li>
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
                <p className="text-gray-600">AI analizuje ogłoszenie i optymalizuje Twoje CV pod konkretne wymagania</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold mb-2">Szybko i łatwo</h3>
                <p className="text-gray-600">Optymalizacja CV w mniej niż minutę na podstawie Twojego doświadczenia</p>
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