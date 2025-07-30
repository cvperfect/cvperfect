import Head from 'next/head'
import Link from 'next/link'

export default function Prywatnosc() {
  return (
    <>
      <Head>
        <title>Polityka Prywatności - CvPerfect</title>
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
              🔒 Polityka Prywatności
            </h1>

            <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
              
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  1. Administrator danych
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  1.1. Administratorem danych osobowych jest właściciel serwisu CvPerfect.
                </p>
                <p>
                  1.2. Kontakt z administratorem: cvperfectai@gmail.com
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  2. Jakie dane zbieramy
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  2.1. <strong>Dane płatności:</strong> Przetwarzane bezpiecznie przez Stripe (nie przechowujemy danych kart).
                </p>
                <p style={{ marginBottom: '16px' }}>
                  2.2. <strong>Treść CV:</strong> Tekst CV przesłany w celu optymalizacji.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  2.3. <strong>Dane techniczne:</strong> Adres IP, typ przeglądarki (automatycznie).
                </p>
                <p>
                  2.4. <strong>Cookies:</strong> Niezbędne do działania serwisu i analizy ruchu.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  3. Cel przetwarzania danych
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  3.1. <strong>Świadczenie usługi:</strong> Optymalizacja CV przy użyciu AI.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  3.2. <strong>Płatności:</strong> Obsługa transakcji i faktur.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  3.3. <strong>Komunikacja:</strong> Odpowiedzi na zapytania użytkowników.
                </p>
                <p>
                  3.4. <strong>Analityka:</strong> Usprawnianie działania serwisu.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  4. Podstawa prawna
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  4.1. <strong>Wykonanie umowy:</strong> Art. 6 ust. 1 lit. b RODO - świadczenie usługi.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  4.2. <strong>Prawnie uzasadniony interes:</strong> Art. 6 ust. 1 lit. f RODO - analityka.
                </p>
                <p>
                  4.3. <strong>Zgoda:</strong> Art. 6 ust. 1 lit. a RODO - marketing (opcjonalnie).
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  5. Okres przechowywania danych
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  5.1. <strong>Treść CV:</strong> Usuwana automatycznie po 30 dniach.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  5.2. <strong>Dane płatności:</strong> Zgodnie z przepisami podatkowymi (5 lat).
                </p>
                <p>
                  5.3. <strong>Dane techniczne:</strong> 12 miesięcy w celach analitycznych.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  6. Udostępnianie danych
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  6.1. <strong>Stripe:</strong> Procesor płatności (zgodnie z ich polityką prywatności).
                </p>
                <p style={{ marginBottom: '16px' }}>
                  6.2. <strong>Groq AI:</strong> Przetwarzanie CV w celu optymalizacji.
                </p>
                <p>
                  6.3. Nie sprzedajemy ani nie udostępniamy danych osobowych firmom trzecim w celach marketingowych.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  7. Prawa użytkownika
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  7.1. <strong>Dostęp:</strong> Prawo do informacji o przetwarzanych danych.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  7.2. <strong>Sprostowanie:</strong> Prawo do poprawiania nieprawidłowych danych.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  7.3. <strong>Usunięcie:</strong> Prawo do usunięcia danych ("prawo do bycia zapomnianym").
                </p>
                <p style={{ marginBottom: '16px' }}>
                  7.4. <strong>Ograniczenie:</strong> Prawo do ograniczenia przetwarzania.
                </p>
                <p>
                  7.5. <strong>Skarga:</strong> Prawo do złożenia skargi do Prezesa UODO.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  8. Bezpieczeństwo danych
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  8.1. Stosujemy szyfrowanie SSL/TLS dla wszystkich transmisji danych.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  8.2. Regularne kopie zapasowe i monitoring bezpieczeństwa.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  8.3. Dostęp do danych mają tylko upoważnione osoby.
                </p>
                <p>
                  8.4. W przypadku naruszenia ochrony danych poinformujemy użytkowników zgodnie z RODO.
                </p>
              </section>

            </div>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link href="/" style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                ← Powrót do strony głównej
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}