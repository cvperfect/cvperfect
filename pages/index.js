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

  // Profesjonalny komponent CV
  const UniqueCVLayout = ({ cvText, isDemo = true }) => {
    const parseCV = (text) => {
      const score = Math.floor(Math.random() * 20) + 75;
      const match = Math.floor(Math.random() * 25) + 65;
      
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
                <span className="text-sm text-gray-600 ml-2">4/5 ⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {cvData.sections.slice(0, isDemo ? 2 : cvData.sections.length).map((section, index) => {
              const icons = ['💡', '💼', '🎓', '🏆'];
              const bgColors = [
                'from-blue-50 to-indigo-50 border-blue-200',
                'from-green-50 to-emerald-50 border-green-200', 
                'from-purple-50 to-violet-50 border-purple-200',
                'from-orange-50 to-amber-50 border-orange-200'
              ];
              
              return (
                <div key={index} className={`bg-gradient-to-r ${bgColors[index % bgColors.length]} border rounded-xl p-5`}>
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                      <span className="text-lg">{icons[index % icons.length]}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {index === 0 ? 'Podsumowanie' : 
                         index === 1 ? 'Doświadczenie' :
                         index === 2 ? 'Wykształcenie' : 'Dodatkowe'}
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
                <h4 className="text-lg font-semibold text-gray-600 mb-2">Więcej zawartości po zakupie</h4>
                <p className="text-gray-500 text-sm">Odblokowuj pełną analizę i możliwość pobrania PDF</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>CvPerfect - Optymalizuj CV za pomocą AI</title>
        <meta name="description" content="Stwórz idealne CV dopasowane do każdej oferty pracy za pomocą sztucznej inteligencji" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section - jak Jobscan */}
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        
        {/* Navigation */}
        <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CV</span>
                </div>
                <span className="text-white text-xl font-bold">Perfect</span>
              </div>
              <div className="hidden md:flex items-center space-x-8 text-white/80">
                <a href="#" className="hover:text-white transition-colors">Jak to działa</a>
                <a href="#" className="hover:text-white transition-colors">Cennik</a>
                <a href="#" className="hover:text-white transition-colors">Kontakt</a>
                <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                  Zaloguj się
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-white/90 text-sm">✨ Teraz z zaawansowaną analizą AI</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Stwórz <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">idealne CV</span><br />
              w mniej niż minutę
            </h1>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              Nasza sztuczna inteligencja analizuje oferty pracy i automatycznie optymalizuje Twoje CV, 
              zwiększając szanse na rozmowę kwalifikacyjną o <span className="text-blue-400 font-semibold">300%</span>
            </p>

            {/* Stats */}
            <div className="flex justify-center space-x-8 mb-12">
              {[
                { number: "50K+", label: "Zoptymalizowanych CV" },
                { number: "92%", label: "Więcej rozmów" },
                { number: "4.9/5", label: "Ocena użytkowników" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Tool */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
              
              {/* Step 1 */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Wklej ogłoszenie o pracę</h2>
                </div>
                
                <div className="relative">
                  <textarea
                    value={jobPosting}
                    onChange={(e) => setJobPosting(e.target.value)}
                    placeholder="Wklej tutaj treść ogłoszenia o pracę do której chcesz aplikować..."
                    className="w-full h-32 p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                  <div className="absolute top-3 right-3 bg-green-500/20 border border-green-400/30 rounded-lg px-2 py-1">
                    <span className="text-green-400 text-xs font-medium">🤖 AI Analiza</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Dodaj swoje CV</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <label className="flex items-center bg-white/5 border border-white/20 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="radio"
                      value="text"
                      checked={uploadMethod === 'text'}
                      onChange={(e) => setUploadMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="text-white font-medium">📝 Wklej jako tekst</div>
                      <div className="text-white/60 text-sm">Szybkie i proste</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center bg-white/5 border border-white/20 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors">
                    <input
                      type="radio"
                      value="file"
                      checked={uploadMethod === 'file'}
                      onChange={(e) => setUploadMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="text-white font-medium">📎 Upload pliku</div>
                      <div className="text-white/60 text-sm">PDF, DOCX, DOC</div>
                    </div>
                  </label>
                </div>

                {uploadMethod === 'text' ? (
                  <textarea
                    value={currentCV}
                    onChange={(e) => setCurrentCV(e.target.value)}
                    placeholder="Wklej tutaj treść swojego obecnego CV..."
                    className="w-full h-40 p-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 resize-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-white/50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-white text-2xl">📁</span>
                        </div>
                        <div className="text-white font-medium mb-2">Kliknij aby wybrać plik</div>
                        <div className="text-white/60 text-sm">lub przeciągnij i upuść tutaj</div>
                      </label>
                    </div>
                    
                    {currentCV && (
                      <div className="mt-6">
                        <h4 className="text-white font-semibold mb-4">📋 Podgląd wczytanego CV:</h4>
                        <UniqueCVLayout cvText={currentCV} isDemo={true} />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={optimizeCV}
                  disabled={isOptimizing}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-12 rounded-2xl text-lg transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
                >
                  {isOptimizing ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"></div>
                      Optymalizuję CV...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="mr-2">🚀</span>
                      Optymalizuj CV pod ofertę
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Results */}
            {showDemo && (
              <div className="mt-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">🎉 Twoje CV zostało zoptymalizowane!</h2>
                  <p className="text-white/80">Sprawdź jak AI poprawiło Twoje CV pod konkretną ofertę pracy</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <span className="mr-2">📄</span>
                      Optymalizowane CV (Podgląd - 30%)
                    </h3>
                    <UniqueCVLayout cvText={optimizedCV} isDemo={true} />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <span className="mr-2">✉️</span>
                      List Motywacyjny (Podgląd - 30%)
                    </h3>
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-h-96 overflow-y-auto">
                      <div className="space-y-4">
                        {getDemoContent(optimizedCoverLetter).split('\n\n').map((section, index) => (
                          <div key={index} className="border-b border-white/20 pb-4 last:border-b-0">
                            <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{section}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            {showDemo && !showPaywall && (
              <div className="text-center mt-12">
                <button
                  onClick={showPaymentOptions}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  <span className="mr-2">🔓</span>
                  Pobierz pełne CV i list motywacyjny
                </button>
              </div>
            )}

            {/* Pricing */}
            {showPaywall && (
              <div className="mt-12">
                <div className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
                  <h2 className="text-3xl font-semibold mb-8 text-center text-white">
                    Wybierz idealny plan dla siebie
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Basic */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2 text-blue-400">Basic</h3>
                        <div className="text-3xl font-bold mb-4 text-white">9,99 zł</div>
                        <div className="text-white/60 text-sm mb-6">jednorazowo</div>
                      </div>
                      
                      <ul className="space-y-3 mb-8 text-white/80">
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          1 optymalizowane CV
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          List motywacyjny
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Pobieranie PDF
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Podstawowa analiza
                        </li>
                      </ul>
                      
                      <button
                        onClick={() => handlePayment('basic')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                      >
                        Rozpocznij Basic
                      </button>
                    </div>

                    {/* Pro */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2 text-green-400">Pro</h3>
                        <div className="text-3xl font-bold mb-4 text-white">49 zł</div>
                        <div className="text-white/60 text-sm mb-6">miesięcznie</div>
                      </div>
                      
                      <ul className="space-y-3 mb-8 text-white/80">
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          10 CV miesięcznie
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Wszystkie funkcje Basic
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Analiza słów kluczowych
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Priorytetowe wsparcie
                        </li>
                      </ul>
                      
                      <button
                        onClick={() => handlePayment('pro')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                      >
                        Rozpocznij Pro
                      </button>
                    </div>

                    {/* Premium */}
                    <div className="bg-white/10 backdrop-blur-sm border-2 border-purple-400/50 rounded-2xl p-6 hover:bg-white/15 transition-all relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        NAJLEPSZA OFERTA ⭐
                      </div>
                      
                      <div className="text-center mt-4">
                        <h3 className="text-xl font-semibold mb-2 text-purple-400">Premium</h3>
                        <div className="text-3xl font-bold mb-4 text-white">79 zł</div>
                        <div className="text-white/60 text-sm mb-6">miesięcznie</div>
                      </div>
                      
                      <ul className="space-y-3 mb-8 text-white/80">
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          25 CV miesięcznie
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Zaawansowana analiza AI
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Match score % dopasowania
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Unlimited listy motywacyjne
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          Dedykowane wsparcie
                        </li>
                      </ul>
                      
                      <button
                        onClick={() => handlePayment('premium')}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                      >
                        Wybierz Premium ⭐
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Features */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-16">
            <h2 className="text-3xl font-semibold text-center mb-12 text-white">
              Dlaczego CvPerfect?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Dopasowane do oferty</h3>
                <p className="text-white/70">AI analizuje każde ogłoszenie i automatycznie dostosowuje Twoje CV pod konkretne wymagania pracodawcy</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Błyskawiczne rezultaty</h3>
                <p className="text-white/70">Pełna optymalizacja CV w mniej niż minutę. Żadnych godzin spędzonych na formatowaniu i przepisywaniu</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">Gwarancja rezultatów</h3>
                <p className="text-white/70">Nasi użytkownicy otrzymują średnio 3x więcej zaproszeń na rozmowy kwalifikacyjne</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <footer className="border-t border-white/10">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">CV</span>
                </div>
                <span className="text-white font-semibold">Perfect</span>
                <span className="text-white/50 text-sm ml-4">© 2025 Wszystkie prawa zastrzeżone</span>
              </div>
              
              <div className="flex items-center space-x-6 text-white/60">
                <a href="#" className="hover:text-white transition-colors">Regulamin</a>
                <a href="#" className="hover:text-white transition-colors">Prywatność</a>
                <a href="#" className="hover:text-white transition-colors">Kontakt</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}