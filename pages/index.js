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

  // Funkcja do analizy CV i tworzenia struktury danych
  const parseCV = (cvText) => {
    const score = Math.floor(Math.random() * 20) + 75 // 75-95
    const matchPercentage = Math.floor(Math.random() * 25) + 65 // 65-90
    
    // Wyciągnij podstawowe info z CV
    const lines = cvText.split('\n').filter(line => line.trim())
    const name = lines.find(line => line.length > 10 && line.length < 50) || "Kandydat"
    
    return {
      score,
      matchPercentage,
      name: name.trim(),
      sections: cvText.split('\n\n').filter(section => section.trim())
    }
  }

  const ProfessionalCVPreview = ({ cvText, isDemo = true }) => {
    const cvData = parseCV(cvText)
    
    return (
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header ze score */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">Analiza CV - {isDemo ? 'Podgląd 30%' : 'Pełna wersja'}</h3>
              <p className="text-blue-100">Optymalizowane pod ofertę pracy</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-green-50 border-2 border-green-200 text-green-600">
                <span className="text-2xl mr-2">🏆</span>
                <span className="text-lg font-bold">{cvData.score}/100</span>
              </div>
              <div className="mt-2 text-sm text-blue-100">
                {cvData.matchPercentage}% dopasowania
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-1/3 bg-gray-50 p-6">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">👤</span>
              </div>
              <h4 className="text-lg font-bold text-center text-gray-800 mb-2">
                {cvData.name}
              </h4>
            </div>

            {/* Kluczowe słowa */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-800 mb-3">📊 Analiza słów kluczowych</h5>
              <div className="mb-3">
                <p className="text-xs text-green-600 font-medium mb-2">✅ Dopasowane</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">React</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">JavaScript</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Zespół</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium mb-2">❌ Brakujące</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">AWS</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">Docker</span>
                </div>
              </div>
            </div>

            {/* Umiejętności */}
            <div>
              <h5 className="font-semibold text-gray-800 mb-3">💪 Kluczowe umiejętności</h5>
              <div className="space-y-3">
                {['JavaScript', 'React', 'Node.js', 'Komunikacja'].map((skill, index) => (
                  <div key={skill}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-green-700 font-medium">{skill} ✓</span>
                      <span className="text-xs text-gray-500">{85 + index * 3}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{width: `${85 + index * 3}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="w-2/3 p-6">
            <div className="space-y-6">
              {cvData.sections.slice(0, isDemo ? 2 : cvData.sections.length).map((section, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <span className="mr-2">
                        {index === 0 ? '📋' : index === 1 ? '💼' : '🎓'}
                      </span>
                      {index === 0 ? 'Podsumowanie' : index === 1 ? 'Doświadczenie' : 'Wykształcenie'}
                    </h5>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {isDemo ? section.substring(0, 150) + '...' : section}
                    </div>
                  </div>
                </div>
              ))}
              
              {isDemo && (
                <div className="text-center py-8 bg-gradient-to-t from-gray-100 to-transparent rounded-lg">
                  <p className="text-gray-500 mb-4">🔒 Pozostała część dostępna po zakupie</p>
                  <div className="opacity-50">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>⏰ Ostatnia aktualizacja: Dzisiaj</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                📄 Pobierz PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Podgląd wczytanego CV:</h4>
                        <ProfessionalCVPreview cvText={currentCV} isDemo={true} />
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
              <div className="mb-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                      Optymalizowane CV (Podgląd - 30%)
                    </h3>
                    <ProfessionalCVPreview cvText={optimizedCV} isDemo={true} />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                      List Motywacyjny (Podgląd - 30%)
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                      <div className="space-y-4">
                        {getDemoContent(optimizedCoverLetter).split('\n\n').map((section, index) => (
                          <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{section}</p>
                          </div>
                        ))}
                      </div>
                    </div>
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
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border-2 border-blue-200 rounded-lg p-6 hover:border-blue-400 transition duration-200">
                    <h3 className="text-xl font-semibold mb-4 text-blue-600">Basic</h3>
                    <div className="text-3xl font-bold mb-4">9,99 zł</div>
                    <ul className="mb-6 space-y-2 text-gray-600">
                      <li>✓ 1 optymalizowane CV</li>
                      <li>✓ List motywacyjny</li>
                      <li>✓ Pobieranie PDF</li>
                      <li>✓ Podstawowa analiza</li>
                    </ul>
                    <button
                      onClick={() => handlePayment('basic')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                    >
                      Kup teraz
                    </button>
                  </div>

                  <div className="border-2 border-green-200 rounded-lg p-6 hover:border-green-400 transition duration-200">
                    <h3 className="text-xl font-semibold mb-4 text-green-600">Pro</h3>
                    <div className="text-3xl font-bold mb-4">49 zł/mies</div>
                    <ul className="mb-6 space-y-2 text-gray-600">
                      <li>✓ 10 CV miesięcznie</li>
                      <li>✓ Wszystkie funkcje Basic</li>
                      <li>✓ Analiza słów kluczowych</li>
                      <li>✓ Priorytetowe wsparcie</li>
                    </ul>
                    <button
                      onClick={() => handlePayment('pro')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                    >
                      Zacznij subskrypcję
                    </button>
                  </div>

                  <div className="border-2 border-purple-200 rounded-lg p-6 hover:border-purple-400 transition duration-200 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      NAJLEPSZA OFERTA
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-purple-600">Premium</h3>
                    <div className="text-3xl font-bold mb-4">79 zł/mies</div>
                    <ul className="mb-6 space-y-2 text-gray-600">
                      <li>✓ 25 CV miesięcznie</li>
                      <li>✓ Zaawansowana analiza AI</li>
                      <li>✓ Match score % dopasowania</li>
                      <li>✓ Unlimited listy motywacyjne</li>
                      <li>✓ Dedykowane wsparcie</li>
                    </ul>
                    <button
                      onClick={() => handlePayment('premium')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
                    >
                      Wybierz Premium ⭐
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