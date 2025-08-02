import Head from 'next/head'
import Link from 'next/link'

export default function RODO() {
  return (
    <>
      <Head>
        <title>RODO - CvPerfect | Twoje prawa w ochronie danych osobowych</title>
        <meta name="description" content="Poznaj swoje prawa RODO w CvPerfect. Dowiedz się jak skorzystać z prawa dostępu, usunięcia, sprostowania i innych uprawnień związanych z ochroną danych." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="rodo-container">
        {/* Header */}
        <div className="rodo-header">
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
        <div className="rodo-content">
          <div className="rodo-wrapper">
            <h1 className="rodo-title">Twoje prawa RODO</h1>
            <p className="rodo-subtitle">
              Przewodnik po prawach w ochronie danych osobowych
              <br />
              <span className="update-date">Ostatnia aktualizacja: 2 lutego 2025</span>
            </p>

            {/* Hero Section */}
            <div className="hero-section">
              <div className="hero-badge">
                <span className="shield-icon">🛡️</span>
                <div className="hero-content">
                  <h2>Jesteś właścicielem swoich danych</h2>
                  <p>RODO daje Ci pełną kontrolę nad tym, jak Twoje dane są wykorzystywane</p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="quick-actions">
              <h3 className="quick-title">⚡ Szybkie działania</h3>
              <div className="actions-grid">
                <a href="mailto:pomoccvperfect@gmail.com?subject=RODO - Żądanie dostępu do danych" className="action-button access">
                  <span className="action-icon">👁️</span>
                  <div className="action-content">
                    <strong>Sprawdź swoje dane</strong>
                    <p>Dowiedz się jakie dane o Tobie mamy</p>
                  </div>
                </a>
                <a href="mailto:pomoccvperfect@gmail.com?subject=RODO - Żądanie usunięcia danych" className="action-button delete">
                  <span className="action-icon">🗑️</span>
                  <div className="action-content">
                    <strong>Usuń swoje dane</strong>
                    <p>Skorzystaj z prawa do zapomnienia</p>
                  </div>
                </a>
                <a href="mailto:pomoccvperfect@gmail.com?subject=RODO - Pobierz moje dane" className="action-button download">
                  <span className="action-icon">📦</span>
                  <div className="action-content">
                    <strong>Pobierz swoje dane</strong>
                    <p>Otrzymaj plik ze swoimi danymi</p>
                  </div>
                </a>
                <a href="mailto:pomoccvperfect@gmail.com?subject=RODO - Ogólne zapytanie" className="action-button help">
                  <span className="action-icon">💬</span>
                  <div className="action-content">
                    <strong>Zadaj pytanie</strong>
                    <p>Porozmawiaj z nami o prywatności</p>
                  </div>
                </a>
              </div>
            </div>

<div className="rodo-sections">
              {/* Section 1 - Twoje prawa */}
              <section className="rodo-section">
                <div className="section-header">
                  <span className="section-number">01</span>
                  <h2 className="section-title">Twoje fundamentalne prawa</h2>
                </div>
                <div className="section-content">
                  <p className="section-intro">RODO przyznaje Ci 6 fundamentalnych praw dotyczących Twoich danych osobowych. Każde z nich możesz wykorzystać w dowolnym momencie.</p>
                  
                  <div className="rights-showcase">
                    <div className="right-card primary">
                      <div className="right-header">
                        <h4><span className="right-icon">👁️</span> Prawo dostępu</h4>
                        <span className="popularity high">Najczęściej używane</span>
                      </div>
                      <p>Dowiedz się jakie dane o Tobie przetwarzamy, w jakim celu i komu je udostępniamy.</p>
                      <div className="right-example">
                        <strong>Przykład:</strong> "Chcę wiedzieć jakie informacje o mnie macie w systemie"
                      </div>
                    </div>

                    <div className="right-card">
                      <div className="right-header">
                        <h4><span className="right-icon">🗑️</span> Prawo do usunięcia</h4>
                        <span className="popularity high">Bardzo popularne</span>
                      </div>
                      <p>Żądaj usunięcia swoich danych osobowych - znane jako "prawo do bycia zapomnianym".</p>
                      <div className="right-example">
                        <strong>Przykład:</strong> "Proszę o usunięcie wszystkich moich danych z systemu"
                      </div>
                    </div>

                    <div className="right-card">
                      <div className="right-header">
                        <h4><span className="right-icon">✏️</span> Prawo sprostowania</h4>
                        <span className="popularity medium">Często używane</span>
                      </div>
                      <p>Popraw nieprawidłowe, nieaktualne lub niepełne dane osobowe.</p>
                      <div className="right-example">
                        <strong>Przykład:</strong> "Mój email się zmienił na nowy@example.com"
                      </div>
                    </div>

                    <div className="right-card">
                      <div className="right-header">
                        <h4><span className="right-icon">📦</span> Prawo do przenoszenia</h4>
                        <span className="popularity medium">Przydatne</span>
                      </div>
                      <p>Otrzymaj swoje dane w ustrukturyzowanym formacie (JSON/CSV) i przenieś je gdzie chcesz.</p>
                      <div className="right-example">
                        <strong>Przykład:</strong> "Proszę o eksport moich danych w formacie JSON"
                      </div>
                    </div>

                    <div className="right-card">
                      <div className="right-header">
                        <h4><span className="right-icon">⏸️</span> Prawo do ograniczenia</h4>
                        <span className="popularity low">Specjalistyczne</span>
                      </div>
                      <p>Zawieś przetwarzanie swoich danych w określonych sytuacjach.</p>
                      <div className="right-example">
                        <strong>Przykład:</strong> "Proszę o ograniczenie przetwarzania podczas sporu"
                      </div>
                    </div>

                    <div className="right-card">
                      <div className="right-header">
                        <h4><span className="right-icon">🚫</span> Prawo sprzeciwu</h4>
                        <span className="popularity low">Specjalistyczne</span>
                      </div>
                      <p>Sprzeciwuj się przetwarzaniu danych na podstawie uzasadnionego interesu.</p>
                      <div className="right-example">
                        <strong>Przykład:</strong> "Nie zgadzam się na wykorzystanie moich danych do analityki"
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 - Jak skorzystać */}
              <section className="rodo-section">
                <div className="section-header">
                  <span className="section-number">02</span>
                  <h2 className="section-title">Jak skorzystać z praw - krok po kroku</h2>
                </div>
                <div className="section-content">
                  <div className="process-timeline">
                    <div className="timeline-step">
                      <div className="step-marker">
                        <span className="step-number">1</span>
                      </div>
                      <div className="step-content">
                        <h4>📧 Napisz do nas</h4>
                        <p>Wyślij email na <strong>pomoccvperfect@gmail.com</strong> z tematem zaczynającym się od "RODO"</p>
                        <div className="step-tip">
                          <strong>Tip:</strong> Użyj szybkich przycisków powyżej - mają gotowe tematy!
                        </div>
                      </div>
                    </div>

                    <div className="timeline-step">
                      <div className="step-marker">
                        <span className="step-number">2</span>
                      </div>
                      <div className="step-content">
                        <h4>📝 Opisz swoją prośbę</h4>
                        <p>Jasno określ:</p>
                        <ul>
                          <li>Które prawo chcesz wykonać</li>
                          <li>Jakie dane Cię dotyczą (email użyty w serwisie)</li>
                          <li>Czy potrzebujesz konkretnego formatu danych</li>
                        </ul>
                      </div>
                    </div>

                    <div className="timeline-step">
                      <div className="step-marker">
                        <span className="step-number">3</span>
                      </div>
                      <div className="step-content">
                        <h4>🔐 Zweryfikujemy Twoją tożsamość</h4>
                        <p>Możemy poprosić o dodatkowe informacje, aby upewnić się, że to rzeczywiście Ty</p>
                        <div className="step-tip">
                          <strong>Dlaczego?</strong> Chronimy Twoje dane przed niepowołanym dostępem
                        </div>
                      </div>
                    </div>

                    <div className="timeline-step">
                      <div className="step-marker">
                        <span className="step-number">4</span>
                      </div>
                      <div className="step-content">
                        <h4>⚡ Otrzymasz odpowiedź</h4>
                        <p>Odpowiadamy w ciągu <strong>30 dni</strong> (często dużo szybciej)</p>
                        <div className="response-times">
                          <div className="response-item">
                            <span className="response-type">Dostęp do danych:</span>
                            <span className="response-time">2-5 dni</span>
                          </div>
                          <div className="response-item">
                            <span className="response-type">Usunięcie danych:</span>
                            <span className="response-time">1-2 dni</span>
                          </div>
                          <div className="response-item">
                            <span className="response-type">Sprostowanie:</span>
                            <span className="response-time">1-3 dni</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 - Skargi */}
              <section className="rodo-section">
                <div className="section-header">
                  <span className="section-number">03</span>
                  <h2 className="section-title">Prawo do skargi</h2>
                </div>
                <div className="section-content">
                  <div className="complaint-info">
                    <div className="complaint-intro">
                      <h4>🏛️ Nie jesteś zadowolony z naszej odpowiedzi?</h4>
                      <p>Masz prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.</p>
                    </div>

                    <div className="uodo-contact">
                      <div className="uodo-card">
                        <div className="uodo-header">
                          <span className="uodo-icon">🇵🇱</span>
                          <h4>Prezes Urzędu Ochrony Danych Osobowych</h4>
                        </div>
                        <div className="contact-details">
                          <div className="contact-item">
                            <span className="contact-label">📍 Adres:</span>
                            <span>ul. Stawki 2, 00-193 Warszawa</span>
                          </div>
                          <div className="contact-item">
                            <span className="contact-label">📞 Telefon:</span>
                            <span>+48 22 531 03 00</span>
                          </div>
                          <div className="contact-item">
                            <span className="contact-label">📧 Email:</span>
                            <span>kancelaria@uodo.gov.pl</span>
                          </div>
                          <div className="contact-item">
                            <span className="contact-label">🌐 Strona:</span>
                            <span>https://uodo.gov.pl</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer CTA */}
            <div className="rodo-footer">
              <div className="footer-content">
                <h3>🤝 Potrzebujesz pomocy z prawami RODO?</h3>
                <p>Nie wahaj się skontaktować! Pomożemy Ci skorzystać z Twoich praw w prosty i szybki sposób.</p>
                <div className="footer-contact">
                  <a href="mailto:pomoccvperfect@gmail.com?subject=RODO - Pytanie o prawa" className="contact-button">
                    📧 pomoccvperfect@gmail.com
                  </a>
                </div>
                <div className="footer-links">
                  <Link href="/polityka-prywatnosci" className="footer-link">Polityka Prywatności</Link>
                  <Link href="/regulamin" className="footer-link">Regulamin</Link>
                  <Link href="/kontakt" className="footer-link">Kontakt</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

<style jsx>{`
        .rodo-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', sans-serif;
        }

        .rodo-header {
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

        .rodo-content {
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%);
          backdrop-filter: blur(20px);
          margin-top: -20px;
          border-radius: 30px 30px 0 0;
          min-height: calc(100vh - 100px);
          position: relative;
          z-index: 2;
        }

        .rodo-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .rodo-title {
          font-size: 52px;
          font-weight: 800;
          color: #1f2937;
          text-align: center;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .rodo-subtitle {
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

        .hero-section {
          margin-bottom: 50px;
          display: flex;
          justify-content: center;
        }

        .hero-badge {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 30px 40px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
          max-width: 600px;
        }

        .shield-icon {
          font-size: 48px;
          flex-shrink: 0;
        }

        .hero-content h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 700;
        }

        .hero-content p {
          margin: 0;
          opacity: 0.9;
          font-size: 16px;
        }

        .quick-actions {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 50px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .quick-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 30px;
          text-align: center;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .action-button {
          background: #f8fafc;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px;
          text-decoration: none;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .action-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }

        .action-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .action-content strong {
          display: block;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .action-content p {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }

        .rodo-sections {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .rodo-section {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .rodo-section:hover {
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

        .section-intro {
          font-size: 18px;
          color: #6b7280;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .rights-showcase {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .right-card {
          background: #f8fafc;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .right-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.15);
          border-color: #667eea;
        }

        .right-card.primary {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        }

        .right-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .right-header h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .right-icon {
          font-size: 20px;
        }

        .popularity {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .popularity.high {
          background: #dcfce7;
          color: #166534;
        }

        .popularity.medium {
          background: #fef3c7;
          color: #92400e;
        }

        .popularity.low {
          background: #fee2e2;
          color: #991b1b;
        }

        .right-card p {
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .right-example {
          background: rgba(255, 255, 255, 0.7);
          border-left: 4px solid #667eea;
          padding: 12px;
          border-radius: 0 8px 8px 0;
          font-size: 14px;
        }

        .process-timeline {
          position: relative;
        }

        .process-timeline::before {
          content: '';
          position: absolute;
          left: 25px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, #667eea, #764ba2);
        }

        .timeline-step {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
          position: relative;
        }

        .step-marker {
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }

        .step-number {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .step-content {
          flex: 1;
          background: #f8fafc;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #e5e7eb;
        }

        .step-content h4 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
        }

        .step-content p {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .step-content ul {
          color: #6b7280;
          margin: 12px 0;
          padding-left: 20px;
        }

        .step-content li {
          margin-bottom: 6px;
        }

        .step-tip {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          color: #92400e;
        }

        .response-times {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 16px;
        }

        .response-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
          font-size: 14px;
        }

        .response-type {
          color: #4b5563;
        }

        .response-time {
          color: #059669;
          font-weight: 600;
        }

        .complaint-info {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .complaint-intro {
          text-align: center;
        }

        .complaint-intro h4 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
        }

        .complaint-intro p {
          color: #6b7280;
          line-height: 1.6;
        }

        .uodo-contact {
          display: flex;
          justify-content: center;
        }

        .uodo-card {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border: 2px solid #667eea;
          border-radius: 20px;
          padding: 30px;
          max-width: 500px;
          width: 100%;
        }

        .uodo-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .uodo-icon {
          font-size: 32px;
        }

        .uodo-header h4 {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .contact-label {
          font-weight: 600;
          color: #4b5563;
          min-width: 70px;
        }

        .contact-item span:last-child {
          color: #1f2937;
        }

        .rodo-footer {
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
          .rodo-title {
            font-size: 36px;
          }

          .rodo-wrapper {
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

          .hero-badge {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }

          .quick-actions {
            padding: 20px;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .action-button {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .rights-showcase {
            grid-template-columns: 1fr;
          }

          .process-timeline::before {
            display: none;
          }

          .timeline-step {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }

          .right-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .uodo-card {
            padding: 20px;
          }

          .contact-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .contact-label {
            min-width: auto;
          }

          .rodo-footer {
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