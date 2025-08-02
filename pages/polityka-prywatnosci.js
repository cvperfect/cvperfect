import Head from 'next/head'
import Link from 'next/link'

export default function PolitykaPrywatnosci() {
  return (
    <>
      <Head>
        <title>Polityka Prywatności - CvPerfect | Ochrona danych osobowych</title>
        <meta name="description" content="Polityka prywatności CvPerfect - dowiedz się jak chronimy i przetwarzamy Twoje dane osobowe zgodnie z RODO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="privacy-container">
        {/* Header */}
        <div className="privacy-header">
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
        <div className="privacy-content">
          <div className="privacy-wrapper">
            <h1 className="privacy-title">Polityka Prywatności</h1>
            <p className="privacy-subtitle">
              Dowiedz się jak chronimy i przetwarzamy Twoje dane osobowe
              <br />
              <span className="update-date">Ostatnia aktualizacja: 2 lutego 2025</span>
            </p>

            {/* Trust Badge */}
            <div className="trust-section">
              <div className="trust-badge">
                <span className="shield-icon">🛡️</span>
                <div className="trust-content">
                  <h3>100% zgodność z RODO</h3>
                  <p>Twoje dane są w bezpiecznych rękach</p>
                </div>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="quick-summary">
              <h2 className="summary-title">📋 Krótko o najważniejszym</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-icon">🔒</span>
                  <div>
                    <strong>Bezpieczeństwo</strong>
                    <p>Treść CV usuwana po optymalizacji</p>
                  </div>
                </div>
                <div className="summary-item">
                  <span className="summary-icon">📧</span>
                  <div>
                    <strong>Email</strong>
                    <p>Tylko do wysłania wyników</p>
                  </div>
                </div>
                <div className="summary-item">
                  <span className="summary-icon">🚫</span>
                  <div>
                    <strong>Bez spamu</strong>
                    <p>Nie sprzedajemy danych</p>
                  </div>
                </div>
                <div className="summary-item">
                  <span className="summary-icon">⚡</span>
                  <div>
                    <strong>Szybkie usunięcie</strong>
                    <p>Na żądanie w 24h</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="privacy-sections">
              {/* Section 1 */}
              <section className="privacy-section">
                <div className="section-header">
                  <span className="section-number">01</span>
                  <h2 className="section-title">Administrator danych</h2>
                </div>
                <div className="section-content">
                  <div className="admin-info">
                    <div className="admin-card">
                      <div className="admin-icon">🏢</div>
                      <div className="admin-details">
                        <h4>CvPerfect</h4>
                        <p>Administrator danych osobowych</p>
                        <p>📍 Polska</p>
                        <p>📧 pomoccvperfect@gmail.com</p>
                      </div>
                    </div>
                  </div>
                  <p>Jesteśmy administratorem Twoich danych osobowych w rozumieniu RODO. W sprawach dotyczących ochrony danych skontaktuj się z nami pod podanym adresem email.</p>
                </div>
              </section>

              {/* Section 2 */}
              <section className="privacy-section">
                <div className="section-header">
                  <span className="section-number">02</span>
                  <h2 className="section-title">Jakie dane zbieramy</h2>
                </div>
                <div className="section-content">
                  <div className="data-types">
                    <div className="data-category">
                      <h4>📧 Dane kontaktowe</h4>
                      <ul>
                        <li>Adres email (do wysłania wyników optymalizacji)</li>
                        <li>Imię i nazwisko (opcjonalnie, w formularzu kontaktowym)</li>
                      </ul>
                    </div>

                    <div className="data-category">
                      <h4>📄 Treść CV</h4>
                      <ul>
                        <li>Tekst CV przesłany do optymalizacji</li>
                        <li>Opis oferty pracy (opcjonalnie)</li>
                        <li><strong>⚠️ Uwaga:</strong> Dane CV są usuwane natychmiast po optymalizacji</li>
                      </ul>
                    </div>

                    <div className="data-category">
                      <h4>💳 Dane płatności</h4>
                      <ul>
                        <li>Informacje o transakcjach (przetwarzane przez Stripe)</li>
                        <li>Historia zakupów</li>
                        <li>Status subskrypcji</li>
                      </ul>
                    </div>

                    <div className="data-category">
                      <h4>🔧 Dane techniczne</h4>
                      <ul>
                        <li>Adres IP</li>
                        <li>Przeglądarka i urządzenie</li>
                        <li>Czas korzystania z serwisu</li>
                        <li>Logi systemowe (30 dni)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="privacy-section">
                <div className="section-header">
                  <span className="section-number">03</span>
                  <h2 className="section-title">Po co przetwarzamy dane</h2>
                </div>
                <div className="section-content">
                  <div className="purposes-grid">
                    <div className="purpose-item">
                      <span className="purpose-icon">🎯</span>
                      <div>
                        <h4>Świadczenie usług</h4>
                        <p>Optymalizacja CV przy użyciu AI</p>
                        <span className="legal-basis">Podstawa: wykonanie umowy</span>
                      </div>
                    </div>
                    <div className="purpose-item">
                      <span className="purpose-icon">📨</span>
                      <div>
                        <h4>Wysyłka wyników</h4>
                        <p>Dostarczenie zoptymalizowanego CV</p>
                        <span className="legal-basis">Podstawa: wykonanie umowy</span>
                      </div>
                    </div>
                    <div className="purpose-item">
                      <span className="purpose-icon">💰</span>
                      <div>
                        <h4>Rozliczenia</h4>
                        <p>Obsługa płatności i fakturowanie</p>
                        <span className="legal-basis">Podstawa: obowiązek prawny</span>
                      </div>
                    </div>
                    <div className="purpose-item">
                      <span className="purpose-icon">🛡️</span>
                      <div>
                        <h4>Bezpieczeństwo</h4>
                        <p>Ochrona przed nadużyciami</p>
                        <span className="legal-basis">Podstawa: uzasadniony interes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section className="privacy-section">
                <div className="section-header">
                  <span className="section-number">04</span>
                  <h2 className="section-title">Jak długo przechowujemy dane</h2>
                </div>
                <div className="section-content">
                  <div className="retention-timeline">
                    <div className="timeline-item instant">
                      <div className="timeline-badge">⚡ Natychmiast</div>
                      <div className="timeline-content">
                        <h4>Treść CV</h4>
                        <p>Usuwana zaraz po optymalizacji (max. 24h)</p>
                      </div>
                    </div>
                    <div className="timeline-item short">
                      <div className="timeline-badge">📅 30 dni</div>
                      <div className="timeline-content">
                        <h4>Logi systemowe</h4>
                        <p>Automatyczne usuwanie po miesiącu</p>
                      </div>
                    </div>
                    <div className="timeline-item medium">
                      <div className="timeline-badge">🗓️ 12 miesięcy</div>
                      <div className="timeline-content">
                        <h4>Dane techniczne</h4>
                        <p>Do celów analitycznych i bezpieczeństwa</p>
                      </div>
                    </div>
                    <div className="timeline-item long">
                      <div className="timeline-badge">📋 5 lat</div>
                      <div className="timeline-content">
                        <h4>Dane płatności</h4>
                        <p>Wymagane przepisami podatkowymi</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section className="privacy-section">
                <div className="section-header">
                  <span className="section-number">05</span>
                  <h2 className="section-title">Komu udostępniamy dane</h2>
                </div>
                <div className="section-content">
                  <div className="partners-grid">
                    <div className="partner-item">
                      <div className="partner-logo">💳</div>
                      <div className="partner-info">
                        <h4>Stripe Inc.</h4>
                        <p>Procesor płatności</p>
                        <span className="partner-purpose">Obsługa transakcji</span>
                      </div>
                    </div>
                    <div className="partner-item">
                      <div className="partner-logo">🤖</div>
                      <div className="partner-info">
                        <h4>Groq AI</h4>
                        <p>Dostawca usług AI</p>
                        <span className="partner-purpose">Optymalizacja CV</span>
                      </div>
                    </div>
                    <div className="partner-item">
                      <div className="partner-logo">☁️</div>
                      <div className="partner-info">
                        <h4>Vercel Inc.</h4>
                        <p>Hosting aplikacji</p>
                        <span className="partner-purpose">Infrastruktura</span>
                      </div>
                    </div>
                    <div className="partner-item">
                      <div className="partner-logo">🗄️</div>
                      <div className="partner-info">
                        <h4>Supabase Inc.</h4>
                        <p>Baza danych</p>
                        <span className="partner-purpose">Przechowywanie danych</span>
                      </div>
                    </div>
                  </div>
                  <div className="partners-note">
                    <p><strong>Ważne:</strong> Wszyscy partnerzy są zobowiązani umownie do ochrony Twoich danych zgodnie z RODO. Nie sprzedajemy ani nie udostępniamy danych do celów marketingowych.</p>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section className="privacy-section">
                <div className="section-header">
                  <span className="section-number">06</span>
                  <h2 className="section-title">Twoje prawa</h2>
                </div>
                <div className="section-content">
                  <div className="rights-grid">
                    <div className="right-item">
                      <span className="right-icon">👁️</span>
                      <div>
                        <h4>Prawo dostępu</h4>
                        <p>Dowiedz się jakie dane o Tobie mamy</p>
                      </div>
                    </div>
                    <div className="right-item">
                      <span className="right-icon">✏️</span>
                      <div>
                        <h4>Prawo sprostowania</h4>
                        <p>Popraw nieprawidłowe informacje</p>
                      </div>
                    </div>
                    <div className="right-item">
                      <span className="right-icon">🗑️</span>
                      <div>
                        <h4>Prawo do usunięcia</h4>
                        <p>Usuniemy Twoje dane w ciągu 24h</p>
                      </div>
                    </div>
                    <div className="right-item">
                      <span className="right-icon">⏸️</span>
                      <div>
                        <h4>Prawo do ograniczenia</h4>
                        <p>Zawieś przetwarzanie swoich danych</p>
                      </div>
                    </div>
                    <div className="right-item">
                      <span className="right-icon">📦</span>
                      <div>
                        <h4>Prawo do przenoszenia</h4>
                        <p>Pobierz swoje dane w formacie JSON</p>
                      </div>
                    </div>
                    <div className="right-item">
                      <span className="right-icon">🚫</span>
                      <div>
                        <h4>Prawo sprzeciwu</h4>
                        <p>Sprzeciwuj się przetwarzaniu</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-rights">
                    <h4>Jak skorzystać z praw?</h4>
                    <p>Napisz do nas na <strong>pomoccvperfect@gmail.com</strong> - odpowiemy w ciągu 30 dni (zazwyczaj dużo szybciej).</p>
                    <p>Masz także prawo wniesienia skargi do <strong>Prezesa Urzędu Ochrony Danych Osobowych</strong>.</p>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section className="privacy-section">
                <div className="section-header">
                  <span className="section-number">07</span>
                  <h2 className="section-title">Bezpieczeństwo danych</h2>
                </div>
                <div className="section-content">
                  <div className="security-measures">
                    <div className="security-item">
                      <span className="security-icon">🔐</span>
                      <div>
                        <h4>Szyfrowanie SSL/TLS</h4>
                        <p>Wszystkie połączenia są szyfrowane</p>
                      </div>
                    </div>
                    <div className="security-item">
                      <span className="security-icon">⚡</span>
                      <div>
                        <h4>Szybkie usuwanie CV</h4>
                        <p>Treść CV jest usuwana zaraz po optymalizacji</p>
                      </div>
                    </div>
                    <div className="security-item">
                      <span className="security-icon">👥</span>
                      <div>
                        <h4>Ograniczony dostęp</h4>
                        <p>Tylko autoryzowany personel ma dostęp do danych</p>
                      </div>
                    </div>
                    <div className="security-item">
                      <span className="security-icon">🔄</span>
                      <div>
                        <h4>Regularne kopie zapasowe</h4>
                        <p>Zapewniamy ciągłość działania serwisu</p>
                      </div>
                    </div>
                    <div className="security-item">
                      <span className="security-icon">🔍</span>
                      <div>
                        <h4>Monitoring bezpieczeństwa</h4>
                        <p>Śledzimy nietypową aktywność 24/7</p>
                      </div>
                    </div>
                    <div className="security-item">
                      <span className="security-icon">🛡️</span>
                      <div>
                        <h4>Aktualizacje systemu</h4>
                        <p>Regularnie aktualizujemy zabezpieczenia</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 8 */}
              <section className="privacy-section">
                <div className="section-header">
                  <span className="section-number">08</span>
                  <h2 className="section-title">Pliki cookies</h2>
                </div>
                <div className="section-content">
                  <div className="cookies-info">
                    <div className="cookie-type">
                      <h4>🍪 Niezbędne cookies</h4>
                      <p>Pozwalają na podstawowe funkcjonowanie serwisu (sesje, bezpieczeństwo). Nie wymagają zgody.</p>
                    </div>
                    <div className="cookie-type">
                      <h4>📊 Analityczne cookies</h4>
                      <p>Pomagają nam zrozumieć jak korzystasz z serwisu. Możesz je wyłączyć w ustawieniach przeglądarki.</p>
                    </div>
                    <div className="cookie-type">
                      <h4>💳 Cookies płatności</h4>
                      <p>Używane przez Stripe do bezpiecznej obsługi płatności.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer CTA */}
            <div className="privacy-footer">
              <div className="footer-content">
                <h3>🤝 Masz pytania o prywatność?</h3>
                <p>Jesteśmy transparentni w kwestii ochrony danych. Skontaktuj się z nami!</p>
                <div className="footer-contact">
                  <a href="mailto:pomoccvperfect@gmail.com" className="contact-button">
                    📧 pomoccvperfect@gmail.com
                  </a>
                </div>
                <div className="footer-links">
                  <Link href="/regulamin" className="footer-link">Regulamin</Link>
                  <Link href="/rodo" className="footer-link">RODO</Link>
                  <Link href="/kontakt" className="footer-link">Kontakt</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .privacy-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', sans-serif;
        }

        .privacy-header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
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
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .back-link {
          color: white;
          text-decoration: none;
          background: rgba(255, 255, 255, 0.15);
          padding: 12px 24px;
          border-radius: 12px;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-weight: 500;
        }

        .back-link:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
        }

        .privacy-content {
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%);
          backdrop-filter: blur(20px);
          margin-top: -20px;
          border-radius: 30px 30px 0 0;
          min-height: calc(100vh - 100px);
          position: relative;
          z-index: 2;
        }

        .privacy-wrapper {
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .privacy-title {
          font-size: 52px;
          font-weight: 800;
          color: #1f2937;
          text-align: center;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .privacy-subtitle {
          text-align: center;
          font-size: 20px;
          color: #6b7280;
          margin-bottom: 50px;
          line-height: 1.6;
        }

        .update-date {
          font-size: 16px;
          color: #059669;
          font-weight: 600;
          background: linear-gradient(135deg, #10b981, #059669);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .trust-section {
          margin-bottom: 50px;
          display: flex;
          justify-content: center;
        }

        .trust-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 20px 30px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        }

        .shield-icon {
          font-size: 32px;
        }

        .trust-content h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
        }

        .trust-content p {
          margin: 0;
          opacity: 0.9;
          font-size: 14px;
        }

        .quick-summary {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 50px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .summary-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 30px;
          text-align: center;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .summary-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .summary-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .summary-item strong {
          display: block;
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .summary-item p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .privacy-sections {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .privacy-section {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .privacy-section:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .section-header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 30px 40px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .section-number {
          background: rgba(255, 255, 255, 0.2);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          flex-shrink: 0;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .section-content {
          padding: 40px;
        }

        .admin-info {
          margin-bottom: 20px;
        }

        .admin-card {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          border: 2px solid rgba(102, 126, 234, 0.1);
        }

        .admin-icon {
          font-size: 32px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .admin-details h4 {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .admin-details p {
          margin: 4px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .data-types {
          display: grid;
          gap: 24px;
        }

        .data-category {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          border-left: 4px solid #667eea;
        }

        .data-category h4 {
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .data-category ul {
          margin: 0;
          padding-left: 20px;
        }

        .data-category li {
          color: #4b5563;
          margin-bottom: 6px;
          line-height: 1.5;
        }

        .purposes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .purpose-item {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .purpose-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
        }

        .purpose-icon {
          font-size: 24px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .purpose-item h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .purpose-item p {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 8px 0;
        }

        .legal-basis {
          font-size: 12px;
          color: #059669;
          font-weight: 500;
          background: #dcfce7;
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
        }

        .retention-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          position: relative;
        }

        .timeline-item.instant {
          border-left: 4px solid #10b981;
        }

        .timeline-item.short {
          border-left: 4px solid #f59e0b;
        }

        .timeline-item.medium {
          border-left: 4px solid #667eea;
        }

        .timeline-item.long {
          border-left: 4px solid #dc2626;
        }

        .timeline-badge {
          background: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          border: 2px solid #e5e7eb;
          min-width: 120px;
          text-align: center;
        }

        .timeline-content h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .timeline-content p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .partner-item {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .partner-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
        }

        .partner-logo {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .partner-info h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }

        .partner-info p {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 8px 0;
        }

        .partner-purpose {
          font-size: 12px;
          color: #059669;
          background: #dcfce7;
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
        }

        .partners-note {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 16px;
        }

        .partners-note p {
          margin: 0;
          color: #92400e;
          font-size: 14px;
        }

        .rights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .right-item {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .right-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
        }

        .right-icon {
          font-size: 24px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .right-item h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .right-item p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .contact-rights {
          background: #dcfce7;
          border: 1px solid #10b981;
          border-radius: 12px;
          padding: 20px;
        }

        .contact-rights h4 {
          color: #065f46;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .contact-rights p {
          color: #047857;
          font-size: 14px;
          margin: 8px 0;
        }

        .security-measures {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .security-item {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .security-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
        }

        .security-icon {
          font-size: 24px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .security-item h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .security-item p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .cookies-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .cookie-type {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          border-left: 4px solid #667eea;
        }

        .cookie-type h4 {
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .cookie-type p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
        }

        .privacy-footer {
          margin-top: 60px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          color: white;
        }

        .footer-content h3 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .footer-content p {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 30px;
        }

        .footer-contact {
          margin-bottom: 30px;
        }

        .contact-button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: inline-block;
        }

        .contact-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .footer-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .footer-link:hover {
          color: white;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .privacy-title {
            font-size: 36px;
          }

          .privacy-wrapper {
            padding: 40px 15px;
          }

          .header-content {
            flex-direction: column;
            gap: 15px;
          }

          .section-header {
            padding: 20px;
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .section-content {
            padding: 20px;
          }

          .quick-summary {
            padding: 20px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .purposes-grid,
          .partners-grid,
          .rights-grid,
          .security-measures {
            grid-template-columns: 1fr;
          }

          .retention-timeline {
            gap: 16px;
          }

          .timeline-item {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .admin-card {
            flex-direction: column;
            text-align: center;
          }

          .privacy-footer {
            padding: 30px 20px;
          }

          .footer-content h3 {
            font-size: 24px;
          }

          .footer-content p {
            font-size: 16px;
          }

          .footer-links {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </>
  )
}