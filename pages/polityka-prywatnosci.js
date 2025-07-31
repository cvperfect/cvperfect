import Head from 'next/head'
import Link from 'next/link'

export default function PolitykaPrywatnosci() {
  return (
    <>
      <Head>
        <title>Polityka Prywatności - CvPerfect.pl</title>
        <meta name="description" content="Polityka prywatności CvPerfect.pl - jak przetwarzamy i chronimy Twoje dane osobowe" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="legal-container">
        <div className="legal-header">
          <div className="header-content">
            <Link href="/" className="logo-link">
              <div className="logo">
                <span className="logo-text">CvPerfect</span>
                <span className="logo-badge">AI</span>
              </div>
            </Link>
            <Link href="/" className="back-link">
              ← Powrót na stronę główną
            </Link>
          </div>
        </div>

        <div className="legal-content">
          <div className="legal-wrapper">
            <h1 className="legal-title">Polityka Prywatności</h1>
            <p className="legal-subtitle">
              Informacja o przetwarzaniu danych osobowych w serwisie CvPerfect.pl
              <br />
              <span className="legal-date">Ostatnia aktualizacja: 31 stycznia 2025</span>
            </p>

            <div className="legal-sections">
              <section className="legal-section">
                <h2 className="section-title">1. Administrator danych osobowych</h2>
                <div className="section-content">
                  <p><strong>Administratorem</strong> Twoich danych osobowych jest CvPerfect.pl z siedzibą w Polsce.</p>
                  <p><strong>Kontakt:</strong> cvperfectai@gmail.com</p>
                  <p>W sprawach dotyczących ochrony danych osobowych możesz skontaktować się z nami pod powyższym adresem email.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">2. Jakie dane zbieramy</h2>
                <div className="section-content">
                  <p><strong>2.1. Dane kontaktowe:</strong></p>
                  <ul>
                    <li>Adres email (wymagany do wysłania wyników optymalizacji)</li>
                  </ul>
                  
                  <p><strong>2.2. Dane techniczne:</strong></p>
                  <ul>
                    <li>Adres IP</li>
                    <li>Informacje o przeglądarce i urządzeniu</li>
                    <li>Dane o korzystaniu z serwisu</li>
                  </ul>

                  <p><strong>2.3. Dane płatności:</strong></p>
                  <ul>
                    <li>Informacje o transakcjach (przetwarzane przez Stripe)</li>
                    <li>Historia zakupów</li>
                  </ul>

                  <p><strong>2.4. Treść CV:</strong></p>
                  <ul>
                    <li>Tekst CV przesłany do optymalizacji</li>
                    <li>Treść ogłoszenia o pracę</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">3. Podstawy prawne przetwarzania</h2>
                <div className="section-content">
                  <p><strong>3.1. Wykonanie umowy</strong> (art. 6 ust. 1 lit. b RODO):</p>
                  <ul>
                    <li>Świadczenie usług optymalizacji CV</li>
                    <li>Obsługa płatności</li>
                    <li>Komunikacja związana z usługą</li>
                  </ul>

                  <p><strong>3.2. Prawnie uzasadniony interes</strong> (art. 6 ust. 1 lit. f RODO):</p>
                  <ul>
                    <li>Analiza ruchu na stronie</li>
                    <li>Zapewnienie bezpieczeństwa serwisu</li>
                    <li>Doskonalenie usług</li>
                  </ul>

                  <p><strong>3.3. Zgoda</strong> (art. 6 ust. 1 lit. a RODO):</p>
                  <ul>
                    <li>Marketing bezpośredni (jeśli wyrazisz zgodę)</li>
                    <li>Pliki cookies analityczne</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">4. Cele przetwarzania danych</h2>
                <div className="section-content">
                  <p><strong>4.1.</strong> Świadczenie usług optymalizacji CV przy użyciu sztucznej inteligencji</p>
                  <p><strong>4.2.</strong> Wysyłanie wyników optymalizacji na podany adres email</p>
                  <p><strong>4.3.</strong> Obsługa płatności i rozliczenia</p>
                  <p><strong>4.4.</strong> Zapewnienie bezpieczeństwa i stabilności serwisu</p>
                  <p><strong>4.5.</strong> Analiza jakości usług i ich doskonalenie</p>
                  <p><strong>4.6.</strong> Obsługa reklamacji i zapytań</p>
                  <p><strong>4.7.</strong> Wypełnienie obowiązków prawnych (np. podatkowych)</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">5. Okres przechowywania danych</h2>
                <div className="section-content">
                  <p><strong>5.1. Treść CV:</strong> Usuwana natychmiast po zakończeniu optymalizacji (maksymalnie po 24 godzinach)</p>
                  <p><strong>5.2. Adres email:</strong> Do momentu usunięcia konta lub cofnięcia zgody</p>
                  <p><strong>5.3. Dane płatności:</strong> 5 lat od ostatniej transakcji (obowiązek prawny)</p>
                  <p><strong>5.4. Dane techniczne:</strong> 12 miesięcy od ostatniej aktywności</p>
                  <p><strong>5.5. Logi systemowe:</strong> 30 dni (bezpieczeństwo serwisu)</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">6. Odbiorcy danych</h2>
                <div className="section-content">
                  <p><strong>6.1. Stripe Inc.</strong> - procesor płatności (przetwarzanie transakcji)</p>
                  <p><strong>6.2. Groq AI</strong> - dostawca usług AI (optymalizacja CV)</p>
                  <p><strong>6.3. Vercel Inc.</strong> - hosting serwisu</p>
                  <p><strong>6.4. Supabase Inc.</strong> - baza danych</p>
                  <p><strong>6.5. Dostawcy usług email</strong> - wysyłka wyników optymalizacji</p>
                  <p>Wszyscy odbiorcy są związani umowami zapewniającymi odpowiedni poziom ochrony danych.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">7. Twoje prawa</h2>
                <div className="section-content">
                  <p><strong>7.1. Prawo dostępu</strong> - możesz uzyskać informację o przetwarzanych danych</p>
                  <p><strong>7.2. Prawo sprostowania</strong> - możesz poprawić nieprawidłowe dane</p>
                  <p><strong>7.3. Prawo do usunięcia</strong> - możesz żądać usunięcia swoich danych</p>
                  <p><strong>7.4. Prawo do ograniczenia</strong> - możesz ograniczyć przetwarzanie</p>
                  <p><strong>7.5. Prawo do przenoszenia</strong> - możesz otrzymać swoje dane w ustrukturyzowanym formacie</p>
                  <p><strong>7.6. Prawo sprzeciwu</strong> - możesz sprzeciwić się przetwarzaniu</p>
                  <p><strong>7.7. Prawo cofnięcia zgody</strong> - w każdym momencie bez wpływu na zgodność z prawem</p>
                  
                  <p><strong>Kontakt:</strong> cvperfectai@gmail.com</p>
                  <p><strong>Prawo skargi:</strong> Możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">8. Bezpieczeństwo danych</h2>
                <div className="section-content">
                  <p><strong>8.1.</strong> Stosujemy szyfrowanie SSL/TLS dla wszystkich połączeń</p>
                  <p><strong>8.2.</strong> Regularnie aktualizujemy systemy bezpieczeństwa</p>
                  <p><strong>8.3.</strong> Ograniczamy dostęp do danych tylko do niezbędnego personelu</p>
                  <p><strong>8.4.</strong> Wykonujemy regularne kopie zapasowe</p>
                  <p><strong>8.5.</strong> Monitorujemy nietypową aktywność</p>
                  <p><strong>8.6.</strong> Treść CV jest usuwana natychmiast po optymalizacji</p>
                </div>
              </section>
            </div>

            <div className="legal-footer">
              <div className="contact-info">
                <h3>Masz pytania o ochronę danych?</h3>
                <p>📧 cvperfectai@gmail.com</p>
                <p>🌐 www.cvperfect.pl</p>
                <p>🛡️ Chronimy Twoje dane zgodnie z RODO</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .legal-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', sans-serif;
        }

        .legal-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 20px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-link {
          text-decoration: none;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-text {
          font-size: 28px;
          font-weight: 800;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .logo-badge {
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .back-link {
          color: white;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.1);
          padding: 10px 20px;
          border-radius: 12px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .back-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .legal-content {
          background: white;
          margin-top: -20px;
          border-radius: 30px 30px 0 0;
          min-height: calc(100vh - 100px);
          position: relative;
          z-index: 2;
        }

        .legal-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .legal-title {
          font-size: 48px;
          font-weight: 800;
          color: #1f2937;
          text-align: center;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .legal-subtitle {
          text-align: center;
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 50px;
          line-height: 1.6;
        }

        .legal-date {
          font-size: 16px;
          color: #9ca3af;
          font-weight: 500;
        }

        .legal-sections {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .legal-section {
          background: #f9fafb;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .legal-section:hover {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .section-title {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 20px 30px;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .section-content {
          padding: 30px;
        }

        .section-content p {
          margin-bottom: 15px;
          line-height: 1.7;
          color: #374151;
        }

        .section-content p strong {
          color: #1f2937;
          font-weight: 600;
        }

        .section-content ul {
          margin: 15px 0;
          padding-left: 25px;
        }

        .section-content li {
          margin-bottom: 8px;
          line-height: 1.6;
          color: #4b5563;
        }

        .legal-footer {
          margin-top: 60px;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          text-align: center;
          color: white;
        }

        .contact-info h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .contact-info p {
          font-size: 16px;
          margin-bottom: 10px;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .legal-title {
            font-size: 36px;
          }

          .header-content {
            flex-direction: column;
            gap: 15px;
          }

          .back-link {
            font-size: 14px;
            padding: 8px 16px;
          }

          .legal-wrapper {
            padding: 40px 15px;
          }

          .section-title {
            font-size: 20px;
            padding: 15px 20px;
          }

          .section-content {
            padding: 20px;
          }

          .legal-footer {
            padding: 30px 20px;
          }
        }
      `}</style>
    </>
  )
}