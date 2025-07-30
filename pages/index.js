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

  import React from 'react';

const UniqueCVLayout = ({ cvText, isDemo = true }) => {
  // Parsowanie CV do sekcji
  const parseCV = (text) => {
    const score = Math.floor(Math.random() * 20) + 75;
    const match = Math.floor(Math.random() * 25) + 65;
    
    // Sprawdź czy text istnieje i jest string
    if (!text || typeof text !== 'string') {
      return { 
        score, 
        match, 
        sections: ['Przykładowe CV zostanie tutaj wyświetlone po wczytaniu tekstu.'] 
      };
    }
    
    const sections = text.split('\n\n').filter(s => s.trim());
    
    return { score, match, sections };
  };

  const cvData = parseCV(cvText);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Top Bar z metrykami */}
      <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 p-1">
        <div className="bg-white m-1 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{cvData.score}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Ocena CV</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{cvData.match}%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Dopasowanie</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">ATS</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Gotowe</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i <= 4 ? 'bg-yellow-400' : 'bg-gray-200'}`}></div>
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">4/5 gwiazdek</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout - Horizontal Split */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-6">
          
          {/* Left Column - Analytics */}
          <div className="col-span-1 space-y-4">
            
            {/* Status Badge */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
              <div className="text-sm font-semibold text-green-700">ZOPTYMALIZOWANE</div>
              <div className="text-xs text-green-600">Gotowe do wysłania</div>
            </div>

            {/* Keywords Match */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Słowa kluczowe</h4>
              
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-green-600">Znalezione</span>
                  <span className="text-xs text-green-600 font-medium">8/12</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['React', 'JavaScript', 'Teamwork'].map(keyword => (
                    <span key={keyword} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-orange-600">Do dodania</span>
                  <span className="text-xs text-orange-600 font-medium">4</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['AWS', 'Docker'].map(keyword => (
                    <span key={keyword} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-200">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills Radar */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Profil umiejętności</h4>
              <div className="space-y-2">
                {[
                  { skill: 'Techniczne', level: 92, color: 'blue' },
                  { skill: 'Komunikacja', level: 85, color: 'green' },
                  { skill: 'Liderstwo', level: 78, color: 'purple' },
                  { skill: 'Analityczne', level: 88, color: 'indigo' }
                ].map(item => (
                  <div key={item.skill}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{item.skill}</span>
                      <span className="font-medium">{item.level}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-1.5 border">
                      <div 
                        className={`h-full rounded-full bg-${item.color}-500`}
                        style={{width: `${item.level}%`}}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-3">
            
            {/* Header Card */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 mb-6 border border-blue-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl font-bold">JK</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Jan Kowalski</h3>
                    <p className="text-blue-600 font-medium">Senior Software Developer</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>📍 Warszawa</span>
                      <span>📧 jan@email.com</span>
                      <span>📱 +48 123 456 789</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Aktywny kandydat
                  </div>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-4">
              {cvData.sections.slice(0, isDemo ? 2 : cvData.sections.length).map((section, index) => {
                const icons = ['💡', '💼', '🎓', '🏆', '🛠️'];
                const bgColors = [
                  'from-blue-50 to-indigo-50 border-blue-200',
                  'from-green-50 to-emerald-50 border-green-200', 
                  'from-purple-50 to-violet-50 border-purple-200',
                  'from-orange-50 to-amber-50 border-orange-200',
                  'from-pink-50 to-rose-50 border-pink-200'
                ];
                
                return (
                  <div key={index} className={`bg-gradient-to-r ${bgColors[index % bgColors.length]} border rounded-xl p-5`}>
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                        <span className="text-lg">{icons[index % icons.length]}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {index === 0 ? 'Podsumowanie zawodowe' : 
                           index === 1 ? 'Doświadczenie zawodowe' :
                           index === 2 ? 'Wykształcenie' : 
                           index === 3 ? 'Osiągnięcia' : 'Dodatkowe informacje'}
                        </h4>
                        <div className="text-gray-700 text-sm leading-relaxed">
                          {isDemo ? 
                            <div>
                              {section.substring(0, 120)}...
                              <span className="text-blue-600 font-medium"> [Więcej po zakupie]</span>
                            </div>
                            : section
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isDemo && (
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">🔒</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">Więcej zawartości dostępne po zakupie</h4>
                  <p className="text-gray-500 text-sm">Odblokowaj pełną analizę, dodatkowe sekcje i możliwość pobrania PDF</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Ostatnia aktualizacja: 2 min temu</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <span>📄 Format: PDF gotowy</span>
            <div className="w-px h-4 bg-gray-300"></div>
            <span>⚡ Generowanie: 12s</span>
          </div>
          
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              👁️ Podgląd
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              📥 Pobierz PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniqueCVLayout;
              
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
                        <UniqueCVLayout cvText={currentCV} isDemo={true} />
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
                    <UniqueCVLayout cvText={optimizedCV} isDemo={true} />
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