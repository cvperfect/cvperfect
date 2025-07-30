import Head from 'next/head'
import Link from 'next/link'

export default function Regulamin() {
  return (
    <>
      <Head>
        <title>Regulamin - CvPerfect</title>
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
              📋 Regulamin Usługi
            </h1>

            <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
              
              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  1. Postanowienia ogólne
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  1.1. Niniejszy Regulamin określa zasady korzystania z usługi CvPerfect dostępnej pod adresem cvperfect-rho.vercel.app.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  1.2. Usługodawcą jest właściciel serwisu CvPerfect.
                </p>
                <p>
                  1.3. Korzystanie z usługi oznacza akceptację postanowień niniejszego Regulaminu.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  2. Opis usługi
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  2.1. CvPerfect to narzędzie AI do optymalizacji CV pod konkretne oferty pracy.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  2.2. Usługa obejmuje generowanie zoptymalizowanego CV i listu motywacyjnego.
                </p>
                <p>
                  2.3. Dostępne są plany: Basic (9,99 zł), Pro (49 zł/mies), Premium (79 zł/mies).
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  3. Płatności i subskrypcje
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  3.1. Płatności są obsługiwane przez Stripe z zachowaniem najwyższych standardów bezpieczeństwa.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  3.2. Subskrypcje są odnawiane automatycznie co miesiąc.
                </p>
                <p>
                  3.3. Użytkownik może anulować subskrypcję w każdym momencie.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  4. Prawa i obowiązki użytkownika
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  4.1. Użytkownik zobowiązuje się do podawania prawdziwych informacji w CV.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  4.2. Zabrania się wykorzystywania usługi w celach niezgodnych z prawem.
                </p>
                <p>
                  4.3. Wygenerowane CV pozostaje własnością użytkownika.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  5. Odpowiedzialność
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  5.1. Usługodawca nie gwarantuje uzyskania pracy po skorzystaniu z usługi.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  5.2. Usługodawca dołoży wszelkich starań w celu zapewnienia ciągłości działania usługi.
                </p>
                <p>
                  5.3. Odpowiedzialność usługodawcy jest ograniczona do wysokości zapłaconej kwoty.
                </p>
              </section>

              <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  6. Prawo odstąpienia
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  6.1. Dla usług jednorazowych: 14 dni na odstąpienie od umowy.
                </p>
                <p>
                  6.2. Zwrot środków na to samo konto, z którego dokonano płatności.
                </p>
              </section>

              <section>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1e40af' }}>
                  7. Postanowienia końcowe
                </h2>
                <p style={{ marginBottom: '16px' }}>
                  7.1. Regulamin może być zmieniany z 7-dniowym wyprzedzeniem.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  7.2. W sprawach nieuregulowanych zastosowanie ma prawo polskie.
                </p>
                <p>
                  7.3. Kontakt: cvperfectai@gmail.com
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