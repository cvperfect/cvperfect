import Head from 'next/head'
import Link from 'next/link'

export default function RODO() {
  return (
    <>
      <Head>
        <title>RODO - CvPerfect.pl</title>
        <meta name="description" content="Informacje o RODO w CvPerfect.pl - Twoje prawa i ochrona danych osobowych" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div className="legal-container">
        {/* Header */}
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

        {/* Main Content */}
        <div className="legal-content">
          <div className="legal-wrapper">
            <h1 className="legal-title">RODO</h1>
            <p className="legal-subtitle">
              Informacje o ochronie danych osobowych zgodnie z RODO
              <br />
              <span className="legal-date">Ostatnia aktualizacja: 31 stycznia 2025</span>
            </p>

            <div className="legal-sections">
              <section className="legal-section">
                <h2 className="section-title">🛡️ Twoje prawa zgodnie z RODO</h2>
                <div className="section-content">
                  <p>Zgodnie z Rozporządzeniem o Ochronie Danych Osobowych (RODO) przysługują Ci następujące prawa:</p>
                  
                  <div className="rights-grid">
                    <div className="right-item">
                      <div className="right-icon">📖</div>
                      <h4>Prawo dostępu</h4>
                      <p>Możesz uzyskać informację o tym, jakie dane o Tobie przetwarzamy i w jakim celu.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">✏️</div>
                      <h4>Prawo sprostowania</h4>
                      <p>Możesz poprawić nieprawidłowe lub nieaktualne dane osobowe.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🗑️</div>
                      <h4>Prawo do usunięcia</h4>
                      <p>Możesz żądać usunięcia swoich danych osobowych ("prawo do bycia zapomnianym").</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">⏸️</div>
                      <h4>Prawo do ograniczenia</h4>
                      <p>Możesz ograniczyć przetwarzanie swoich danych w określonych sytuacjach.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">📦</div>
                      <h4>Prawo do przenoszenia</h4>
                      <p>Możesz otrzymać swoje dane w ustrukturyzowanym, powszechnie używanym formacie.</p>
                    </div>
                    
                    <div className="right-item">
                      <div className="right-icon">🚫</div>
                      <h4>Prawo sprzeciwu</h4>
                      <p>Możesz sprzeciwić się przetwarzaniu danych w określonych sytuacjach.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">📋 Jak skorzystać ze swoich praw</h2>
                <div className="section-content">
                  <div className="steps-container">
                    <div className="step-item">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <h4>Wyślij zapytanie</h4>
                        <p>Napisz do nas na adres: <strong>cvperfectai@gmail.com</strong></p>
                      </div>
                    </div>
                    
                    <div className="step-item">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <h4>Podaj niezbędne informacje</h4>
                        <p>Określ jakie prawo chcesz wykonać i podaj dane umożliwiające Twoją identyfikację</p>
                      </div>
                    </div>
                    
                    <div className="step-item">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <h4>Otrzymaj odpowiedź</h4>
                        <p>Odpowiemy w terminie do <strong>30 dni</strong> od otrzymania zapytania</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">🔒 Jak chronimy Twoje dane</h2>
                <div className="section-content">
                  <div className="security-features">
                    <div className="security-item">
                      <div className="security-icon">🔐</div>
                      <h4>Szyfrowanie SSL/TLS</h4>
                      <p>Wszystkie dane są przesyłane w bezpiecznych, szyfrowanych połączeniach</p>
                    </div>
                    
                    <div className="security-item">
                      <div className="security-icon">🗂️</div>
                      <h4>Minimalizacja danych</h4>
                      <p>Zbieramy tylko te dane, które są niezbędne do świadczenia usługi</p>
                    </div>
                    
                    <div className="security-item">
                      <div className="security-icon">⏰</div>
                      <h4>Automatyczne usuwanie</h4>
                      <p>CV jest usuwane natychmiast po zakończeniu optymalizacji</p>
                    </div>
                    
                    <div className="security-item">
                      <div className="security-icon">👥</div>
                      <h4>Ograniczony dostęp</h4>
                      <p>Dostęp do danych mają tylko upoważnione osoby</p>
                    </div>
                    
                    <div className="security-item">
                      <div className="security-icon">📊</div>
                      <h4>Monitoring bezpieczeństwa</h4>
                      <p>Stale monitorujemy systemy pod kątem zagrożeń</p>
                    </div>
                    
                    <div className="security-item">
                      <div className="security-icon">🔄</div>
                      <h4>Regularne aktualizacje</h4>
                      <p>Utrzymujemy systemy w najnowszych, bezpiecznych wersjach</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">⚖️ Podstawy prawne przetwarzania</h2>
                <div className="section-content">
                  <div className="legal-basis-item">
                    <h4>🤝 Wykonanie umowy (art. 6 ust. 1 lit. b RODO)</h4>
                    <p>Przetwarzamy dane w celu świadczenia usługi optymalizacji CV, obsługi płatności i komunikacji związanej z usługą.</p>
                  </div>
                  
                  <div className="legal-basis-item">
                    <h4>⚖️ Prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO)</h4>
                    <p>Analizujemy ruch na stronie, zapewniamy bezpieczeństwo serwisu i doskonalimy nasze usługi.</p>
                  </div>
                  
                  <div className="legal-basis-item">
                    <h4>✅ Zgoda (art. 6 ust. 1 lit. a RODO)</h4>
                    <p>Marketing bezpośredni i pliki cookies analityczne wymagają Twojej zgody, którą możesz cofnąć w każdym momencie.</p>
                  </div>
                  
                  <div className="legal-basis-item">
                    <h4>📜 Obowiązek prawny (art. 6 ust. 1 lit. c RODO)</h4>
                    <p>Przechowujemy dane płatności przez 5 lat ze względu na obowiązki podatkowe.</p>
                  </div>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">📞 Kontakt z Inspektorem Ochrony Danych</h2>
                <div className="section-content">
                  <p>W sprawach dotyczących ochrony danych osobowych możesz się skontaktować:</p>
                  
                  <div className="contact-methods">
                    <div className="contact-method">
                      <div className="contact-icon">📧</div>
                      <div className="contact-details">
                        <h4>Email</h4>
                        <p>cvperfectai@gmail.com</p>
                        <span>Temat: RODO - [Twoje zapytanie]</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="response-time">
                    <h4>⏱️ Czas odpowiedzi</h4>
                    <p>Odpowiadamy na zapytania RODO w terminie do <strong>30 dni</strong> od ich otrzymania. W skomplikowanych przypadkach możemy przedłużyć ten termin o kolejne 60 dni, informując Cię o przyczynie opóźnienia.</p>
                  </div>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">🏛️ Prawo do skargi</h2>
                <div className="section-content">
                  <p>Jeśli uważasz, że przetwarzanie Twoich danych osobowych narusza przepisy RODO, masz prawo złożyć skargę do organu nadzorczego.</p>
                  
                  <div className="complaint-info">
                    <div className="complaint-details">
                      <h4>🇵🇱 Prezes Urzędu Ochrony Danych Osobowych</h4>
                      <p><strong>Adres:</strong> ul. Stawki 2, 00-193 Warszawa</p>
                      <p><strong>Telefon:</strong> +48 22 531 03 00</p>
                      <p><strong>Email:</strong> kancelaria@uodo.gov.pl</p>
                      <p><strong>Strona:</strong> https://uodo.gov.pl</p>
                    </div>
                  </div>
                  
                  <p>Złożenie skargi do organu nadzorczego nie ogranicza Twoich praw do dochodzenia roszczeń na drodze sądowej.</p>
                </div>
              </section>

            </div>

            <div className="legal-footer">
              <div className="contact-info">
                <h3>🛡️ Twoje dane są bezpieczne</h3>
                <p>Przestrzegamy wszystkich przepisów RODO</p>
                <p>📧 cvperfectai@gmail.com</p>
                <p>🌐 www.cvperfect.pl</p>
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

        /* Rights Grid */
        .rights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin-top: 30px;
        }

        .right-item {
          background: white;
          padding: 25px;
          border-radius: 15px;
          border: 1px solid #e5e7eb;
          text-align: center;
          transition: all 0.3s ease;
        }

        .right-item:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-3px);
        }

        .right-icon {
          font-size: 32px;
          margin-bottom: 15px;
        }

        .right-item h4 {
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 10px;
          font-size: 18px;
        }

        .right-item p {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Steps Container */
        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 25px;
          margin-top: 30px;
        }

        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          background: white;
          padding: 25px;
          border-radius: 15px;
          border: 1px solid #e5e7eb;
        }

        .step-number {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }

        .step-content h4 {
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 18px;
        }

        .step-content p {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        /* Security Features */
        .security-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          margin-top: 30px;
        }

        .security-item {
          background: white;
          padding: 25px;
          border-radius: 15px;
          border: 1px solid #e5e7eb;
          text-align: center;
          transition: all 0.3s ease;
        }

        .security-item:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-3px);
        }

        .security-icon {
          font-size: 32px;
          margin-bottom: 15px;
        }

        .security-item h4 {
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 10px;
          font-size: 16px;
        }

        .security-item p {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Legal Basis */
        .legal-basis-item {
          background: white;
          padding: 25px;
          border-radius: 15px;
          border: 1px solid #e5e7eb;
          margin-bottom: 20px;
        }

        .legal-basis-item h4 {
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 12px;
          font-size: 18px;
        }

        .legal-basis-item p {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        /* Contact Methods */
        .contact-methods {
          margin: 30px 0;
        }

        .contact-method {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          background: white;
          padding: 25px;
          border-radius: 15px;
          border: 1px solid #e5e7eb;
        }

        .contact-icon {
          font-size: 32px;
          color: #667eea;
        }

        .contact-details h4 {
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 18px;
        }

        .contact-details p {
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .contact-details span {
          color: #6b7280;
          font-size: 14px;
        }

        /* Response Time */
        .response-time {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 15px;
          padding: 25px;
          margin: 30px 0;
        }

        .response-time h4 {
          color: #0369a1;
          font-weight: 600;
          margin-bottom: 12px;
          font-size: 18px;
        }

        .response-time p {
          color: #0c4a6e;
          line-height: 1.6;
          margin: 0;
        }

        /* Complaint Info */
        .complaint-info {
          margin: 30px 0;
        }

        .complaint-details {
          background: white;
          padding: 25px;
          border-radius: 15px;
          border: 1px solid #e5e7eb;
        }

        .complaint-details h4 {
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 15px;
          font-size: 18px;
        }

        .complaint-details p {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 8px;
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

          .rights-grid,
          .security-features {
            grid-template-columns: 1fr;
          }

          .step-item,
          .contact-method {
            flex-direction: column;
            text-align: center;
          }

          .legal-footer {
            padding: 30px 20px;
          }
        }
      `}</style>
    </>
  )
}