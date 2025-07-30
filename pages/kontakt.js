import Head from 'next/head'
import Link from 'next/link'

export default function Kontakt() {
  return (
    <>
      <Head>
        <title>Kontakt - CvPerfect</title>
      </Head>

      <div style={{
        margin: 0,
        fontFamily: 'Inter, sans-serif',
        background: 'linear-gradient(135deg, #1e293b, #334155, #475569, #64748b)',
        minHeight: '100vh',
        color: 'white',
        padding: '40px 20px'
      }}>
        
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <Link href="/" style={{ 
              textDecoration: 'none', 
              color: 'white',
              fontSize: '32px',
              fontWeight: '800'
            }}>
              CV<span style={{ color: '#3b82f6' }}>Perfect</span>
            </Link>
          </div>

          {/* Main Content */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '48px',
            color: '#1f2937'
          }}>
            
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: '800', 
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              📞 Kontakt
            </h1>

            <div style={{ fontSize: '18px', lineHeight: '1.8' }}>
              
              <div style={{
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                padding: '32px',
                borderRadius: '16px',
                marginBottom: '32px',
                textAlign: 'center'
              }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  marginBottom: '16px',
                  color: '#0c4a6e'
                }}>
                  ✉️ Skontaktuj się z nami
                </h2>
                <p style={{ fontSize: '20px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                  cvperfectai@gmail.com
                </p>
                <p style={{ color: '#6b7280', fontSize: '16px' }}>
                  Odpowiadamy w ciągu 24 godzin
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
              }}>
                
                <div style={{
                  background: '#f8fafc',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛠️</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    Wsparcie techniczne
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Problemy z optymalizacją CV lub płatnościami
                  </p>
                </div>

                <div style={{
                  background: '#f8fafc',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>💼</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    Współpraca B2B
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Oferty dla firm i rekruterów
                  </p>
                </div>

                <div style={{
                  background: '#f8fafc',
                  padding: '24px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>💡</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    Sugestie
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Pomysły na nowe funkcje
                  </p>
                </div>
              </div>

              <div style={{
                background: '#fef3c7',
                padding: '24px',
                borderRadius: '12px',
                marginBottom: '32px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>
                  ⚡ Szybka pomoc
                </h3>
                <p style={{ color: '#78350f', marginBottom: '12px' }}>
                  Zanim napiszesz do nas, sprawdź czy Twój problem nie jest opisany w naszych materiałach pomocniczych:
                </p>
                <ul style={{ color: '#78350f', marginLeft: '20px' }}>
                  <li>Problemy z płatnościami - sprawdź status w swoim banku</li>
                  <li>CV nie optymalizuje się - sprawdź połączenie internetowe</li>
                  <li>Nie możesz pobrać PDF - wyczyść cache przeglądarki</li>
                </ul>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link 
                  href="/"
                  style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '16px',
                    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ← Powrót do CvPerfect
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}