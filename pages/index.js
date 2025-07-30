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
      reader.onload = (e) => setCurrentCV(e.target.result)
      reader.readAsText(file)
    }
  }

  const optimizeCV = async () => {
    if (!jobPosting.trim() || !currentCV.trim()) {
      alert('Proszę wypełnić oba pola')
      return
    }
    setIsOptimizing(true)
    setShowDemo(false)
    setShowPaywall(false)

    try {
      const response = await fetch('/api/optimize-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobPosting, currentCV }),
      })
      const data = await response.json()
      
      if (data.success) {
        setOptimizedCV(data.optimizedCV)
        setOptimizedCoverLetter(data.coverLetter)
        setShowDemo(true)
      } else {
        alert('Błąd: ' + data.error)
      }
    } catch (error) {
      alert('Błąd połączenia')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handlePayment = async (priceType) => {
    const stripe = await stripePromise
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceType, cv: optimizedCV, coverLetter: optimizedCoverLetter }),
    })
    const session = await response.json()
    const result = await stripe.redirectToCheckout({ sessionId: session.id })
    if (result.error) alert(result.error.message)
  }

  return (
    <>
      <Head>
        <title>CvPerfect - AI CV Optimizer</title>
      
      </Head>

      <div style={{
        margin: 0,
        fontFamily: 'Inter, sans-serif',
        background: 'linear-gradient(135deg, #1e293b, #334155, #475569, #64748b)',
        minHeight: '100vh',
        color: 'white'
      }}>
        
        {/* Hero Section */}
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50px',
              padding: '8px 20px',
              marginBottom: '32px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#10b981',
                borderRadius: '50%',
                marginRight: '8px',
                animation: 'pulse 2s infinite'
              }}></div>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                ✨ Teraz z zaawansowaną analizą AI
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '56px',
              fontWeight: '800',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.1'
            }}>
              Stwórz <span style={{ color: '#60a5fa' }}>idealne CV</span><br />
              w mniej niż minutę
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              margin: '0 auto 48px auto',
              lineHeight: '1.6'
            }}>
              Nasza sztuczna inteligencja analizuje oferty pracy i automatycznie optymalizuje Twoje CV, 
              zwiększając szanse na rozmowę o <span style={{ color: '#60a5fa', fontWeight: '600' }}>300%</span>
            </p>

            {/* Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '48px',
              marginBottom: '64px',
              flexWrap: 'wrap'
            }}>
              {[
                { number: "50K+", label: "Zoptymalizowanych CV", icon: "📄" },
                { number: "92%", label: "Więcej rozmów", icon: "📈" },
                { number: "4.9/5", label: "Ocena użytkowników", icon: "⭐" }
              ].map((stat, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: '4px'
                  }}>{stat.number}</div>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Main Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '48px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            marginBottom: '48px',
            color: '#1f2937',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                fontWeight: 'bold',
                fontSize: '20px',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
              }}>1</div>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 4px 0', color: '#1f2937' }}>
                  📝 Wklej ogłoszenie o pracę
                </h2>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
                  AI przeanalizuje wymagania i dopasuje Twoje CV
                </p>
              </div>
            </div>
            
            <textarea
              value={jobPosting}
              onChange={(e) => setJobPosting(e.target.value)}
              placeholder="Wklej tutaj treść ogłoszenia o pracę do której chcesz aplikować..."
              style={{
                width: '100%',
                height: '140px',
                padding: '20px',
                borderRadius: '16px',
                border: '2px solid #e5e7eb',
                fontSize: '16px',
                resize: 'none',
                marginBottom: '48px',
                boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '1.5',
                background: '#f9fafb',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6'
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                e.target.style.boxShadow = 'none'
              }}
            />

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                fontWeight: 'bold',
                fontSize: '20px',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
              }}>2</div>
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 4px 0', color: '#1f2937' }}>
                  📄 Dodaj swoje CV
                </h2>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
                  Wybierz najwygodniejszy sposób dodania CV
                </p>
              </div>
            </div>

            {/* Radio buttons - NAPRAWIONE KOLORY */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
              <div
                onClick={() => setUploadMethod('text')}
                style={{
                  flex: 1,
                  padding: '24px',
                  borderRadius: '16px',
                  border: uploadMethod === 'text' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  background: uploadMethod === 'text' ? 'rgba(59, 130, 246, 0.05)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: uploadMethod === 'text' ? '0 8px 25px rgba(59, 130, 246, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                <input
                  type="radio"
                  checked={uploadMethod === 'text'}
                  onChange={() => setUploadMethod('text')}
                  style={{ marginRight: '16px', transform: 'scale(1.2)' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '18px', marginBottom: '4px' }}>
                    ✏️ Wklej jako tekst
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>Szybkie i proste rozwiązanie</div>
                </div>
              </div>

              <div
                onClick={() => setUploadMethod('file')}
                style={{
                  flex: 1,
                  padding: '24px',
                  borderRadius: '16px',
                  border: uploadMethod === 'file' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  background: uploadMethod === 'file' ? 'rgba(59, 130, 246, 0.05)' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: uploadMethod === 'file' ? '0 8px 25px rgba(59, 130, 246, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}
              >
                <input
                  type="radio"
                  checked={uploadMethod === 'file'}
                  onChange={() => setUploadMethod('file')}
                  style={{ marginRight: '16px', transform: 'scale(1.2)' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '18px', marginBottom: '4px' }}>
                    📎 Upload pliku
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>PDF, DOCX, DOC, TXT</div>
                </div>
              </div>
            </div>

            {uploadMethod === 'text' ? (
              <textarea
                value={currentCV}
                onChange={(e) => setCurrentCV(e.target.value)}
                placeholder="Wklej tutaj treść swojego obecnego CV..."
                style={{
                  width: '100%',
                  height: '220px',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  resize: 'none',
                  marginBottom: '40px',
                  boxSizing: 'border-box',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '1.5',
                  background: '#f9fafb',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
            ) : (
              <div style={{ marginBottom: '40px' }}>
                <div style={{
                  border: '2px dashed #3b82f6',
                  borderRadius: '16px',
                  padding: '48px',
                  textAlign: 'center',
                  background: 'rgba(59, 130, 246, 0.02)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                    <div style={{ color: '#3b82f6', fontWeight: '600', fontSize: '18px', marginBottom: '8px' }}>
                      Kliknij aby wybrać plik
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                      lub przeciągnij i upuść tutaj
                    </div>
                  </label>
                </div>
              </div>
            )}
            
            <button
              onClick={optimizeCV}
              disabled={isOptimizing}
              style={{
                width: '100%',
                background: isOptimizing 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                border: 'none',
                padding: '20px 40px',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: isOptimizing ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isOptimizing 
                  ? 'none' 
                  : '0 8px 25px rgba(59, 130, 246, 0.3)',
                transform: isOptimizing ? 'none' : 'translateY(-2px)'
              }}
              onMouseEnter={(e) => {
                if (!isOptimizing) {
                  e.target.style.transform = 'translateY(-4px)'
                  e.target.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isOptimizing) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)'
                }
              }}
            >
              {isOptimizing ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    marginRight: '12px',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Optymalizuję CV...
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ marginRight: '8px', fontSize: '20px' }}>🚀</span>
                  Optymalizuj CV pod ofertę
                </div>
              )}
            </button>
          </div>

          {/* Results */}
          {showDemo && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              padding: '48px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              marginBottom: '48px',
              color: '#1f2937',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '32px', 
                  fontWeight: '800',
                  margin: '0 0 16px 0',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  🎉 Twoje CV zostało zoptymalizowane!
                </h3>
                <p style={{ fontSize: '18px', color: '#6b7280', margin: 0 }}>
                  Sprawdź jak AI poprawiło Twoje CV pod konkretną ofertę pracy
                </p>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', 
                padding: '32px', 
                borderRadius: '20px', 
                marginBottom: '32px',
                border: '1px solid #bae6fd'
              }}>
                <h4 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  marginBottom: '16px',
                  color: '#0c4a6e',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '8px' }}>📄</span>
                  Podgląd zoptymalizowanego CV (30%)
                </h4>
                <div style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <p style={{ margin: 0, lineHeight: '1.6', color: '#374151' }}>
                    {optimizedCV.substring(0, 300)}...
                  </p>
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                    <span style={{ color: '#3b82f6', fontWeight: '500' }}>
                      🔒 Pozostała część dostępna po zakupie
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setShowPaywall(true)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '18px 36px',
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(-2px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px)'
                    e.target.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <span style={{ marginRight: '8px' }}>🔓</span>
                  Pobierz pełne CV i list motywacyjny
                </button>
              </div>
            </div>
          )}

          {/* Pricing */}
          {showPaywall && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              padding: '48px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              color: '#1f2937',
              marginBottom: '48px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{ 
                  fontSize: '36px', 
                  fontWeight: '800',
                  margin: '0 0 16px 0',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  💎 Wybierz idealny plan dla siebie
                </h2>
                <p style={{ fontSize: '18px', color: '#6b7280', margin: 0 }}>
                  Wszystkie plany obejmują pełne CV, list motywacyjny i pobieranie PDF
                </p>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '32px',
                maxWidth: '900px',
                margin: '0 auto'
              }}>
                
                {/* Basic */}
                <div style={{
                  border: '2px solid #3b82f6',
                  borderRadius: '20px',
                  padding: '32px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.02))',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚡</div>
                  <h3 style={{ color: '#3b82f6', fontSize: '24px', marginBottom: '8px', fontWeight: '700' }}>
                    Basic
                  </h3>
                  <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: '#1f2937' }}>
                    9,99 zł
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                    jednorazowo
                  </div>
                  <ul style={{ 
                    textAlign: 'left', 
                    marginBottom: '32px', 
                    listStyle: 'none', 
                    padding: 0,
                    fontSize: '16px'
                  }}>
                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                      1 optymalizowane CV
                    </li>
                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                      List motywacyjny
                    </li>
                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                      Pobieranie PDF
                    </li>
                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                      Podstawowa analiza
                    </li>
                  </ul>
                  <button 
                    onClick={() => handlePayment('basic')} 
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      padding: '16px 32px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: '16px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Rozpocznij Basic
                  </button>
                </div>

                {/* Pro */}
                <div style={{
                  border: '2px solid #10b981',
                  borderRadius: '20px',
                  padding: '32px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.02))',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚀</div>
                  <h3 style={{ color: '#10b981', fontSize: '24px', marginBottom: '8px', fontWeight: '700' }}>
                    Pro
                  </h3>
                  <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: '#1f2937' }}>
                    49 zł
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                    miesięcznie
                  </div>
                  <ul style={{ 
                    textAlign: 'left', 
                    marginBottom: '32px', 
                    listStyle: 'none', 
                    padding: 0,
                    fontSize: '16px'
                  }}>
                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                      10 CV miesięcznie
                    </li>
                    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                     

<span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                     Analiza słów kluczowych
                   </li>
                   <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                     <span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                     Wszystkie funkcje Basic
                   </li>
                   <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                     <span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                     Priorytetowe wsparcie
                   </li>
                 </ul>
                 <button 
                   onClick={() => handlePayment('pro')} 
                   style={{
                     background: 'linear-gradient(135deg, #10b981, #059669)',
                     color: 'white',
                     border: 'none',
                     padding: '16px 32px',
                     borderRadius: '12px',
                     fontWeight: '600',
                     cursor: 'pointer',
                     width: '100%',
                     fontSize: '16px',
                     transition: 'all 0.3s ease'
                   }}
                 >
                   Rozpocznij Pro
                 </button>
               </div>

               {/* Premium */}
               <div style={{
                 border: '2px solid #8b5cf6',
                 borderRadius: '20px',
                 padding: '32px',
                 textAlign: 'center',
                 position: 'relative',
                 background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(139, 92, 246, 0.02))',
                 transition: 'all 0.3s ease'
               }}>
                 <div style={{
                   position: 'absolute',
                   top: '-16px',
                   left: '50%',
                   transform: 'translateX(-50%)',
                   background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                   color: 'white',
                   padding: '8px 24px',
                   borderRadius: '25px',
                   fontSize: '12px',
                   fontWeight: 'bold',
                   boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                 }}>
                   NAJLEPSZA OFERTA ⭐
                 </div>
                 <div style={{ fontSize: '40px', marginBottom: '16px', marginTop: '16px' }}>💎</div>
                 <h3 style={{ color: '#8b5cf6', fontSize: '24px', marginBottom: '8px', fontWeight: '700' }}>
                   Premium
                 </h3>
                 <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px', color: '#1f2937' }}>
                   79 zł
                 </div>
                 <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                   miesięcznie
                 </div>
                 <ul style={{ 
                   textAlign: 'left', 
                   marginBottom: '32px', 
                   listStyle: 'none', 
                   padding: 0,
                   fontSize: '16px'
                 }}>
                   <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                     <span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                     25 CV miesięcznie
                   </li>
                   <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                     <span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                     Zaawansowana analiza AI
                   </li>
                   <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                     <span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                     Match score % dopasowania
                   </li>
                   <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                     <span style={{ color: '#10b981', marginRight: '8px', fontWeight: 'bold' }}>✓</span>
                     Dedykowane wsparcie VIP
                   </li>
                 </ul>
                 <button 
                   onClick={() => handlePayment('premium')} 
                   style={{
                     background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                     color: 'white',
                     border: 'none',
                     padding: '16px 32px',
                     borderRadius: '12px',
                     fontWeight: '600',
                     cursor: 'pointer',
                     width: '100%',
                     fontSize: '16px',
                     transition: 'all 0.3s ease',
                     boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                   }}
                 >
                   Wybierz Premium ⭐
                 </button>
               </div>
             </div>
           </div>
         )}
       </div>

       {/* Testimonials Section */}
       <div style={{ 
         background: 'rgba(255, 255, 255, 0.05)', 
         backdropFilter: 'blur(10px)',
         margin: '64px 0',
         padding: '64px 20px'
       }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
           <h2 style={{
             fontSize: '36px',
             fontWeight: '800',
             marginBottom: '48px',
             color: 'white'
           }}>
             🌟 Co mówią nasi użytkownicy
           </h2>
           
           <div style={{
             display: 'grid',
             gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
             gap: '32px'
           }}>
             {[
               {
                 name: "Michał K.",
                 role: "Software Developer",
                 text: "Dzięki CvPerfect dostałem pracę w Google! AI idealnie dopasował moje umiejętności do wymagań.",
                 rating: 5,
                 avatar: "👨‍💻"
               },
               {
                 name: "Anna W.",
                 role: "Marketing Manager",
                 text: "W 2 tygodnie otrzymałam 8 zaproszeń na rozmowy. To naprawdę działa!",
                 rating: 5,
                 avatar: "👩‍💼"
               },
               {
                 name: "Piotr L.",
                 role: "Data Scientist",
                 text: "Najlepsze 79zł jakie wydałem na rozwój kariery. Premium plan to strzał w dziesiątkę.",
                 rating: 5,
                 avatar: "👨‍🔬"
               }
             ].map((testimonial, index) => (
               <div key={index} style={{
                 background: 'rgba(255, 255, 255, 0.9)',
                 padding: '32px',
                 borderRadius: '20px',
                 color: '#1f2937',
                 boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                 border: '1px solid rgba(255, 255, 255, 0.2)'
               }}>
                 <div style={{ display: 'flex', marginBottom: '16px' }}>
                   {[...Array(testimonial.rating)].map((_, i) => (
                     <span key={i} style={{ color: '#fbbf24', fontSize: '20px' }}>⭐</span>
                   ))}
                 </div>
                 <p style={{
                   fontSize: '16px',
                   lineHeight: '1.6',
                   marginBottom: '24px',
                   fontStyle: 'italic',
                   color: '#374151'
                 }}>
                   "{testimonial.text}"
                 </p>
                 <div style={{ display: 'flex', alignItems: 'center' }}>
                   <div style={{
                     width: '48px',
                     height: '48px',
                     borderRadius: '50%',
                     background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     marginRight: '16px',
                     fontSize: '20px'
                   }}>
                     {testimonial.avatar}
                   </div>
                   <div>
                     <div style={{ fontWeight: '600', color: '#1f2937' }}>{testimonial.name}</div>
                     <div style={{ fontSize: '14px', color: '#6b7280' }}>{testimonial.role}</div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>

       {/* Features Section */}
       <div style={{ padding: '64px 20px' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
           <h2 style={{
             fontSize: '36px',
             fontWeight: '800',
             textAlign: 'center',
             marginBottom: '48px',
             color: 'white'
           }}>
             ⚡ Dlaczego CvPerfect?
           </h2>
           
           <div style={{
             display: 'grid',
             gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
             gap: '32px'
           }}>
             {[
               {
                 icon: "🎯",
                 title: "Dopasowane do oferty",
                 description: "AI analizuje każde ogłoszenie i automatycznie dostosowuje Twoje CV pod konkretne wymagania pracodawcy"
               },
               {
                 icon: "⚡",
                 title: "Błyskawiczne rezultaty",
                 description: "Pełna optymalizacja CV w mniej niż minutę. Żadnych godzin spędzonych na formatowaniu"
               },
               {
                 icon: "📈",
                 title: "Gwarancja rezultatów",
                 description: "Nasi użytkownicy otrzymują średnio 3x więcej zaproszeń na rozmowy kwalifikacyjne"
               }
             ].map((feature, index) => (
               <div key={index} style={{
                 textAlign: 'center',
                 padding: '32px',
                 background: 'rgba(255, 255, 255, 0.05)',
                 borderRadius: '20px',
                 border: '1px solid rgba(255, 255, 255, 0.1)',
                 backdropFilter: 'blur(10px)'
               }}>
                 <div style={{
                   width: '80px',
                   height: '80px',
                   background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                   borderRadius: '20px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   margin: '0 auto 24px auto',
                   fontSize: '32px',
                   boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                 }}>
                   {feature.icon}
                 </div>
                 <h3 style={{
                   fontSize: '24px',
                   fontWeight: '700',
                   marginBottom: '16px',
                   color: 'white'
                 }}>
                   {feature.title}
                 </h3>
                 <p style={{
                   fontSize: '16px',
                   lineHeight: '1.6',
                   color: 'rgba(255, 255, 255, 0.8)'
                 }}>
                   {feature.description}
                 </p>
               </div>
             ))}
           </div>
         </div>
       </div>

       {/* Footer */}
       <footer style={{
         borderTop: '1px solid rgba(255, 255, 255, 0.1)',
         padding: '32px 20px',
         background: 'rgba(0, 0, 0, 0.2)'
       }}>
         <div style={{
           maxWidth: '1200px',
           margin: '0 auto',
           display: 'flex',
           justifyContent: 'space-between',
           alignItems: 'center',
           flexWrap: 'wrap',
           gap: '20px'
         }}>
           <div style={{ display: 'flex', alignItems: 'center' }}>
             <div style={{
               width: '32px',
               height: '32px',
               background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
               borderRadius: '8px',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               marginRight: '12px',
               color: 'white',
               fontWeight: 'bold',
               fontSize: '14px'
             }}>
               CV
             </div>
             <span style={{ color: 'white', fontWeight: '600', fontSize: '18px' }}>Perfect</span>
             <span style={{ color: 'rgba(255, 255, 255, 0.5)', marginLeft: '16px', fontSize: '14px' }}>
               © 2025 Wszystkie prawa zastrzeżone
             </span>
           </div>
           
           <div style={{ display: 'flex', gap: '32px', color: 'rgba(255, 255, 255, 0.7)' }}>
  <a href="/regulamin" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Regulamin</a>
  <a href="/prywatnosc" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Prywatność</a>
  <a href="/kontakt" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Kontakt</a>
</div>
         </div>
       </footer>
     </div>

     <style jsx>{`
       @keyframes spin {
         0% { transform: rotate(0deg); }
         100% { transform: rotate(360deg); }
       }
       @keyframes pulse {
         0%, 100% { opacity: 1; }
         50% { opacity: 0.5; }
       }
     `}</style>
   </>
 )
}