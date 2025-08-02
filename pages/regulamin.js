import Head from 'next/head'
import Link from 'next/link'

export default function Regulamin() {
  return (
    <>
      <Head>
        <title>Regulamin - CvPerfect.pl</title>
        <meta name="description" content="Regulamin serwisu CvPerfect.pl - warunki korzystania z usług optymalizacji CV" />
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
            <h1 className="legal-title">Regulamin</h1>
            <p className="legal-subtitle">
              Regulamin korzystania z serwisu CvPerfect.pl
              <br />
              <span className="legal-date">Ostatnia aktualizacja: 2 sierpnia 2025</span>
            </p>

            <div className="legal-sections">
              <section className="legal-section">
                <h2 className="section-title">§ 1. Postanowienia ogólne</h2>
                <div className="section-content">
                  <p><strong>1.1.</strong> Niniejszy Regulamin określa zasady świadczenia usług drogą elektroniczną przez serwis internetowy dostępny pod adresem CvPerfect.pl (dalej: „Serwis") oraz zasady zawierania i wykonywania umów o świadczenie usług.</p>
                  <p><strong>1.2.</strong> Usługodawcą jest CvPerfect sp. z o.o. z siedzibą w Polsce (dalej: „Usługodawca").</p>
                  <p><strong>1.3.</strong> Serwis świadczy usługi optymalizacji dokumentów CV przy użyciu zaawansowanych technologii sztucznej inteligencji.</p>
                  <p><strong>1.4.</strong> Korzystanie z Serwisu oznacza zapoznanie się z niniejszym Regulaminem i jego akceptację w pełnym zakresie.</p>
                  <p><strong>1.5.</strong> Regulamin jest dostępny na stronie internetowej Serwisu w sposób umożliwiający zapoznanie się z jego treścią, pozyskanie, odtwarzanie i utrwalanie jego treści poprzez wydrukowanie lub zapisanie na trwałym nośniku.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">§ 2. Definicje</h2>
                <div className="section-content">
                  <p><strong>2.1. Użytkownik</strong> - osoba fizyczna posiadająca pełną zdolność do czynności prawnych, osoba prawna albo jednostka organizacyjna nieposiadająca osobowości prawnej, której ustawa przyznaje zdolność prawną, korzystająca z usług świadczonych przez Serwis.</p>
                  <p><strong>2.2. Klient</strong> - Użytkownik, który zawarł z Usługodawcą umowę o świadczenie płatnych usług.</p>
                  <p><strong>2.3. Usługa</strong> - usługa optymalizacji CV przy użyciu sztucznej inteligencji, świadczona elektronicznie przez Serwis.</p>
                  <p><strong>2.4. Plan/Pakiet</strong> - określony zakres usług (Basic, Gold, Premium) wraz z liczbą dostępnych optymalizacji i dodatkowymi funkcjonalnościami.</p>
                  <p><strong>2.5. CV</strong> - dokument zawierający informacje o kwalifikacjach, doświadczeniu zawodowym i wykształceniu Użytkownika.</p>
                  <p><strong>2.6. ATS</strong> - Applicant Tracking System, system informatyczny służący do zarządzania procesem rekrutacji.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">§ 3. Warunki korzystania z Serwisu</h2>
                <div className="section-content">
                  <p><strong>3.1.</strong> Korzystanie z Serwisu wymaga spełnienia łącznie następujących warunków technicznych:</p>
                  <ul>
                    <li>Posiadanie urządzenia końcowego z dostępem do sieci Internet</li>
                    <li>Posiadanie aktywnego konta poczty elektronicznej</li>
                    <li>Włączenie obsługi JavaScript w przeglądarce internetowej</li>
                    <li>Akceptacja plików cookies</li>
                  </ul>
                  <p><strong>3.2.</strong> Użytkownik zobowiązuje się do:</p>
                  <ul>
                    <li>Korzystania z Serwisu zgodnie z prawem, niniejszym Regulaminem oraz dobrymi obyczajami</li>
                    <li>Niepodejmowania działań mogących zakłócić funkcjonowanie Serwisu</li>
                    <li>Nieudostępniania osobom trzecim danych dostępowych do swojego konta</li>
                    <li>Niezwłocznego poinformowania Usługodawcy o wszelkich przypadkach naruszenia bezpieczeństwa</li>
                  </ul>
                  <p><strong>3.3.</strong> Zabronione jest wprowadzanie do Serwisu treści:</p>
                  <ul>
                    <li>Naruszających dobra osobiste, prawa autorskie lub inne prawa osób trzecich</li>
                    <li>Zawierających dane osobowe osób trzecich bez ich wyraźnej zgody</li>
                    <li>Obraźliwych, wulgarnych, rasistowskich lub w inny sposób naruszających godność ludzką</li>
                    <li>Niezgodnych z prawem, dobrymi obyczajami lub społecznie szkodliwych</li>
                    <li>Zawierających wirusy lub inne szkodliwe oprogramowanie</li>
                  </ul>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">§ 4. Usługi i cennik</h2>
                <div className="section-content">
                  <p><strong>4.1.</strong> Serwis oferuje następujące pakiety usług:</p>
                  <ul>
                    <li><strong>Plan Basic:</strong> Jednorazowa płatność 9,99 zł za 1 optymalizację CV z wykorzystaniem technologii GPT-3.5</li>
                    <li><strong>Plan Gold:</strong> Abonament miesięczny 49,00 zł za 10 optymalizacji CV miesięcznie z technologią GPT-4 i priorytetową obsługą</li>
                    <li><strong>Plan Premium:</strong> Abonament miesięczny 79,00 zł za 25 optymalizacji CV miesięcznie z najnowszą technologią GPT-4 i dedykowanym wsparciem</li>
                  </ul>
                  <p><strong>4.2.</strong> Wszystkie ceny są cenami końcowymi i zawierają podatek VAT.</p>
                  <p><strong>4.3.</strong> Płatności są przetwarzane przez renomowanego dostawcę usług płatniczych Stripe, Inc.</p>
                  <p><strong>4.4.</strong> Limity optymalizacji w planach abonamentowych odnawiają się automatycznie co miesiąc kalendarzowy.</p>
                  <p><strong>4.5.</strong> Niewykorzystane optymalizacje z danego miesiąca przepadają i nie przechodzą na kolejny okres rozliczeniowy.</p>
                  <p><strong>4.6.</strong> Usługodawca zastrzega sobie prawo do zmiany cennika z 30-dniowym wyprzedzeniem.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">§ 5. Zawarcie umowy i wykonanie usługi</h2>
                <div className="section-content">
                  <p><strong>5.1.</strong> Umowa zostaje zawarta w momencie dokonania płatności przez Klienta i otrzymania potwierdzenia od systemu płatniczego.</p>
                  <p><strong>5.2.</strong> Usługa optymalizacji CV jest świadczona w czasie rzeczywistym, zazwyczaj w ciągu 30-90 sekund od zlecenia.</p>
                  <p><strong>5.3.</strong> Wynik optymalizacji jest dostarczany na adres e-mail podany przez Klienta podczas składania zlecenia.</p>
                  <p><strong>5.4.</strong> Usługodawca dokłada wszelkich starań w celu zapewnienia wysokiej jakości usług, jednak nie gwarantuje uzyskania przez Klienta konkretnej pracy ani pozytywnych wyników procesu rekrutacyjnego.</p>
                  <p><strong>5.5.</strong> W przypadku problemów technicznych Usługodawca zobowiązuje się do bezzwłocznego przywrócenia pełnej funkcjonalności Serwisu.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">§ 6. Abonament i rezygnacja</h2>
                <div className="section-content">
                  <p><strong>6.1.</strong> Abonament (plany Gold i Premium) jest automatycznie odnawiany co miesiąc, chyba że Klient dokona jego anulowania.</p>
                  <p><strong>6.2.</strong> Klient może anulować abonament w każdym momencie bez ponoszenia dodatkowych kosztów.</p>
                  <p><strong>6.3.</strong> Anulowanie abonamentu nie powoduje utraty dostępu do usług do końca okresu, za który została wniesiona opłata.</p>
                  <p><strong>6.4.</strong> Zwrot środków za niewykorzystany okres abonamentu następuje wyłącznie w przypadkach przewidzianych prawem.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">§ 7. Ochrona danych osobowych</h2>
                <div className="section-content">
                  <p><strong>7.1.</strong> Administratorem danych osobowych jest CvPerfect sp. z o.o.</p>
                  <p><strong>7.2.</strong> Szczegółowe informacje o przetwarzaniu danych osobowych znajdują się w Polityce Prywatności stanowiącej integralną część niniejszego Regulaminu.</p>
                  <p><strong>7.3.</strong> Treść CV przekazana do optymalizacji nie jest przechowywana w systemach Usługodawcy po zakończeniu procesu optymalizacji.</p>
                  <p><strong>7.4.</strong> Dane płatności są przetwarzane wyłącznie przez Stripe, Inc. zgodnie z najwyższymi standardami bezpieczeństwa PCI DSS.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">§ 8. Odpowiedzialność</h2>
                <div className="section-content">
                  <p><strong>8.1.</strong> Usługodawca ponosi odpowiedzialność za niewykonanie lub nienależyte wykonanie usługi na zasadach ogólnych przewidzianych w Kodeksie cywilnym.</p>
                  <p><strong>8.2.</strong> Usługodawca nie ponosi odpowiedzialności za skutki wykorzystania zoptymalizowanego CV przez Klienta, w tym za wyniki procesów rekrutacyjnych.</p>
                  <p><strong>8.3.</strong> Odpowiedzialność odszkodowawcza Usługodawcy wobec Klienta ograniczona jest do wysokości dwukrotności kwoty zapłaconej przez Klienta za usługę w ostatnim miesiącu.</p>
                  <p><strong>8.4.</strong> Usługodawca nie odpowiada za przerwy w świadczeniu usług spowodowane siłą wyższą, działaniami osób trzecich lub przyczynami leżącymi po stronie Klienta.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">§ 9. Reklamacje</h2>
                <div className="section-content">
                  <p><strong>9.1.</strong> Klient ma prawo złożyć reklamację dotyczącą świadczonej usługi.</p>
                  <p><strong>9.2.</strong> Reklamacje należy składać na adres e-mail: pomoccvperfect@gmail.com lub pisemnie na adres siedziby Usługodawcy.</p>
                  <p><strong>9.3.</strong> Reklamacja powinna zawierać:</p>
                  <ul>
                    <li>Imię i nazwisko lub nazwę Klienta</li>
                    <li>Adres e-mail użyty przy składaniu zamówienia</li>
                    <li>Dokładny opis problemu będącego przedmiotem reklamacji</li>
                    <li>Oczekiwany sposób rozpatrzenia reklamacji</li>
                  </ul>
                  <p><strong>9.4.</strong> Usługodawca rozpatruje reklamacje w terminie do 14 dni roboczych od dnia jej otrzymania.</p>
                  <p><strong>9.5.</strong> Odpowiedź na reklamację zostanie przesłana na adres e-mail Klienta lub w inny sposób wskazany w reklamacji.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">§ 10. Prawo odstąpienia od umowy</h2>
                <div className="section-content">
                  <p><strong>10.1.</strong> Zgodnie z art. 38 pkt 13 ustawy o prawach konsumenta, prawo odstąpienia od umowy nie przysługuje w przypadku umów o świadczenie usług, jeżeli wykonanie świadczenia rozpoczęło się za wyraźną zgodą konsumenta przed upływem terminu do odstąpienia od umowy.</p>
                  <p><strong>10.2.</strong> Składając zlecenie optymalizacji CV, Klient wyraża zgodę na natychmiastowe rozpoczęcie świadczenia usługi.</p>
                  <p><strong>10.3.</strong> W przypadku planów abonamentowych, Klient może odstąpić od umowy w terminie 14 dni od zawarcia umowy, pod warunkiem niewykorzystania żadnej optymalizacji.</p>
                </div>
              </section>

              <section className="legal-section">
                <h2 className="section-title">§ 11. Postanowienia końcowe</h2>
                <div className="section-content">
                  <p><strong>11.1.</strong> Usługodawca zastrzega sobie prawo do wprowadzania zmian w Regulaminie z ważnych przyczyn, takich jak:</p>
                  <ul>
                    <li>Zmiana przepisów prawa</li>
                    <li>Wprowadzenie nowych funkcjonalności Serwisu</li>
                    <li>Względy bezpieczeństwa</li>
                    <li>Zmiany w zakresie świadczonych usług</li>
                  </ul>
                  <p><strong>11.2.</strong> O zmianach w Regulaminie Klienci zostaną poinformowani z co najmniej 7-dniowym wyprzedzeniem poprzez publikację informacji na stronie internetowej oraz przesłanie powiadomienia na adres e-mail.</p>
                  <p><strong>11.3.</strong> W przypadku braku akceptacji zmian w Regulaminie, Klient ma prawo do rozwiązania umowy ze skutkiem natychmiastowym.</p>
                  <p><strong>11.4.</strong> We wszystkich sprawach nieuregulowanych niniejszym Regulaminem mają zastosowanie przepisy prawa polskiego, w szczególności Kodeksu cywilnego i ustawy o świadczeniu usług drogą elektroniczną.</p>
                  <p><strong>11.5.</strong> Wszelkie spory związane z usługami świadczonymi przez Serwis będą rozstrzygane przez sąd powszechny właściwy dla siedziby Usługodawcy.</p>
                  <p><strong>11.6.</strong> Klienci będący konsumentami mogą skorzystać z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń. Szczegółowe informacje dostępne są na stronie internetowej http://ec.europa.eu/odr/.</p>
                </div>
              </section>
            </div>

            <div className="legal-footer">
              <div className="contact-info">
                <h3>Kontakt w sprawie Regulaminu</h3>
                <p>📧 pomoccvperfect@gmail.com@gmail.com</p>
                <p>🌐 www.cvperfect.pl</p>
                <p>📍 CvPerfect , Polska</p>
                <div className="legal-note">
                  <p><small>Niniejszy Regulamin wchodzi w życie z dniem 2 sierpnia 2025 roku i zastępuje wszystkie wcześniejsze wersje regulaminów serwisu CvPerfect.pl</small></p>
                </div>
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
          line-height: 1.6;
        }

        .legal-header {
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
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .logo-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
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
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .legal-content {
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%);
          backdrop-filter: blur(20px);
          margin-top: -20px;
          border-radius: 30px 30px 0 0;
          min-height: calc(100vh - 100px);
          position: relative;
          z-index: 2;
        }

        .legal-wrapper {
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 20px;
        }

        .legal-title {
          font-size: 52px;
          font-weight: 800;
          color: #1f2937;
          text-align: center;
          margin-bottom: 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
        }

        .legal-subtitle {
          text-align: center;
          font-size: 20px;
          color: #6b7280;
          margin-bottom: 50px;
          line-height: 1.6;
        }

        .legal-date {
          font-size: 16px;
          color: #9ca3af;
          font-weight: 600;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .legal-sections {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .legal-section {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          overflow: hidden;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .legal-section:hover {
          box-shadow: 0 15px 45px rgba(102, 126, 234, 0.1);
          transform: translateY(-3px);
          border-color: rgba(102, 126, 234, 0.2);
        }

        .section-title {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 24px 30px;
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #10b981, #059669);
        }

        .section-content {
          padding: 30px;
          background: rgba(255, 255, 255, 0.6);
        }

        .section-content p {
          margin-bottom: 16px;
          line-height: 1.8;
          color: #374151;
          font-size: 15px;
        }

        .section-content p strong {
          color: #1f2937;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-content ul {
          margin: 20px 0;
          padding-left: 25px;
        }

        .section-content li {
          margin-bottom: 10px;
          line-height: 1.7;
          color: #4b5563;
          position: relative;
        }

        .section-content li::marker {
          color: #667eea;
          font-weight: bold;
        }

        .legal-footer {
          margin-top: 60px;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          text-align: center;
          color: white;
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
        }

        .contact-info h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .contact-info p {
          font-size: 16px;
          margin-bottom: 12px;
          opacity: 0.9;
        }

        .legal-note {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .legal-note p {
          opacity: 0.8;
          font-style: italic;
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
            padding: 10px 20px;
          }

          .legal-wrapper {
            padding: 40px 15px;
          }

          .section-title {
            font-size: 18px;
            padding: 20px 20px;
          }

          .section-content {
            padding: 25px 20px;
          }

          .legal-footer {
            padding: 30px 20px;
          }

          .legal-subtitle {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  )
}