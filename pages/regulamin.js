import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Regulamin() {
  const router = useRouter()
  const { locale } = router
  const [currentLanguage, setCurrentLanguage] = useState('pl')
  const [activeSection, setActiveSection] = useState(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    if (locale) setCurrentLanguage(locale)
  }, [locale])

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      const currentProgress = (window.scrollY / totalScroll) * 100
      setScrollProgress(currentProgress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

// Translations system
  const translations = {
    pl: {
      nav: {
        backButton: 'Powrót do strony głównej'
      },
      hero: {
        badge: 'Dokumenty prawne',
        title: 'Regulamin',
        subtitle: 'Regulamin korzystania z serwisu CvPerfect.pl',
        lastUpdate: 'Ostatnia aktualizacja: 12 sierpnia 2025',
        version: 'Wersja 2.0'
      },
      sections: [
        { id: 'postanowienia', title: '§ 1. Postanowienia ogólne', icon: '📋' },
        { id: 'definicje', title: '§ 2. Definicje', icon: '📖' },
        { id: 'warunki', title: '§ 3. Warunki korzystania', icon: '⚙️' },
        { id: 'uslugi', title: '§ 4. Usługi i cennik', icon: '💎' },
        { id: 'umowa', title: '§ 5. Zawarcie umowy', icon: '✍️' },
        { id: 'abonament', title: '§ 6. Abonament', icon: '🔄' },
        { id: 'dane', title: '§ 7. Ochrona danych', icon: '🔒' },
        { id: 'odpowiedzialnosc', title: '§ 8. Odpowiedzialność', icon: '⚖️' },
        { id: 'reklamacje', title: '§ 9. Reklamacje', icon: '📮' },
        { id: 'odstapienie', title: '§ 10. Odstąpienie', icon: '↩️' },
        { id: 'postanowienia-koncowe', title: '§ 11. Postanowienia końcowe', icon: '📜' }
      ],
      infoCards: [
        { icon: '🚀', title: 'Szybki start', desc: 'Zapoznaj się z najważniejszymi punktami regulaminu' },
        { icon: '🔒', title: 'Bezpieczeństwo', desc: 'Twoje dane są u nas bezpieczne - RODO & GDPR' },
        { icon: '💬', title: 'Wsparcie 24/7', desc: 'Jesteśmy tu dla Ciebie: pomoc@cvperfect.pl' }
      ],
      content: {
        s1: {
          title: '§ 1. Postanowienia ogólne',
          items: [
            'Niniejszy Regulamin określa zasady świadczenia usług drogą elektroniczną przez serwis internetowy dostępny pod adresem <strong>CvPerfect.pl</strong> (dalej: „Serwis") oraz zasady zawierania i wykonywania umów o świadczenie usług.',
            'Usługodawcą jest <strong>CvPerfect sp. z o.o.</strong> z siedzibą w Polsce (dalej: „Usługodawca").',
            'Serwis świadczy usługi optymalizacji dokumentów CV przy użyciu zaawansowanych technologii <strong>sztucznej inteligencji GPT-4 i GPT-5</strong>.',
            'Korzystanie z Serwisu oznacza zapoznanie się z niniejszym Regulaminem i jego akceptację w pełnym zakresie.',
'Regulamin jest dostępny na stronie internetowej Serwisu w sposób umożliwiający zapoznanie się z jego treścią, pozyskanie, odtwarzanie i utrwalanie.'
          ]
        },
        s2: {
          title: '§ 2. Definicje',
          definitions: [
            { icon: '👤', term: 'Użytkownik', desc: 'Osoba fizyczna posiadająca pełną zdolność do czynności prawnych, osoba prawna albo jednostka organizacyjna korzystająca z usług Serwisu.' },
            { icon: '💼', term: 'Klient', desc: 'Użytkownik, który zawarł z Usługodawcą umowę o świadczenie płatnych usług optymalizacji CV.' },
            { icon: '🎯', term: 'Usługa', desc: 'Optymalizacja CV przy użyciu sztucznej inteligencji, świadczona elektronicznie przez Serwis.' },
            { icon: '💎', term: 'Plan/Pakiet', desc: 'Określony zakres usług (Basic, Gold, Premium) wraz z liczbą optymalizacji i funkcjonalnościami.' },
            { icon: '📄', term: 'CV', desc: 'Dokument zawierający informacje o kwalifikacjach, doświadczeniu zawodowym i wykształceniu.' },
            { icon: '🤖', term: 'ATS', desc: 'Applicant Tracking System - system informatyczny do zarządzania procesem rekrutacji.' }
          ]
        },
        s3: {
          title: '§ 3. Warunki korzystania z Serwisu',
          requirements: {
            title: 'Wymagania techniczne',
            items: ['Urządzenie z dostępem do Internetu', 'Aktywne konto e-mail', 'Włączona obsługa JavaScript', 'Akceptacja plików cookies']
          },
          obligations: {
            title: 'Zobowiązania Użytkownika',
            items: ['Korzystanie zgodne z prawem i Regulaminem', 'Niezakłócanie funkcjonowania Serwisu', 'Ochrona danych dostępowych', 'Informowanie o naruszeniach bezpieczeństwa']
          },
          prohibited: {
            title: 'Zabronione treści',
items: ['Naruszające prawa osób trzecich', 'Dane osobowe bez zgody', 'Treści obraźliwe lub niezgodne z prawem', 'Wirusy i szkodliwe oprogramowanie']
          }
        },
        s4: {
          title: '§ 4. Usługi i cennik',
          plans: {
            basic: {
              name: 'Plan Basic',
              price: '19,99',
              currency: 'PLN',
              period: 'jednorazowo',
              features: ['1 optymalizacja CV', 'Technologia GPT-3.5', '95% skuteczność ATS', 'Eksport PDF/DOCX']
            },
            gold: {
              name: 'Plan Gold',
              price: '49,00',
              currency: 'PLN',
              period: '/miesiąc',
              features: ['10 optymalizacji/mies.', 'Technologia GPT-4', 'Priorytetowa obsługa', 'Dostęp do nowych funkcji']
            },
            premium: {
              name: 'Plan Premium',
              price: '79,00',
              currency: 'PLN',
              period: '/miesiąc',
              features: ['25 optymalizacji/mies.', 'Najnowsze GPT-4 VIP', 'Wsparcie VIP 24/7', 'Beta tester funkcji']
            }
          },
          notes: [
            '💡 Wszystkie ceny zawierają podatek VAT',
            '🔒 Płatności obsługuje Stripe - światowy lider płatności online',
'🔄 Limity odnawiają się automatycznie co miesiąc'
          ]
        },
        s5: {
          title: '§ 5. Zawarcie umowy i wykonanie usługi',
          steps: [
            { icon: '💳', title: 'Zawarcie umowy', desc: 'Umowa zostaje zawarta w momencie dokonania płatności i otrzymania potwierdzenia.' },
            { icon: '⚡', title: 'Realizacja usługi', desc: 'Optymalizacja CV w czasie 30-90 sekund od zlecenia.' },
            { icon: '📧', title: 'Dostarczenie', desc: 'Wynik wysyłany na podany adres e-mail.' }
          ]
        },
        s6: {
          title: '§ 6. Abonament i rezygnacja',
          items: [
            'Abonament (plany Gold i Premium) jest automatycznie odnawiany co miesiąc.',
            'Możesz anulować abonament w każdym momencie bez dodatkowych kosztów.',
            'Po anulowaniu zachowujesz dostęp do końca opłaconego okresu.'
          ]
        },
        s7: {
          title: '§ 7. Ochrona danych osobowych',
          icon: '🔐',
          mainTitle: 'Twoje dane są bezpieczne',
          items: [
            '✅ Zgodność z RODO i GDPR',
            '✅ Szyfrowanie SSL/TLS',
            '✅ Nie przechowujemy treści CV po optymalizacji',
'✅ Płatności przez Stripe (PCI DSS)'
          ]
        },
        s8: {
          title: '§ 8. Odpowiedzialność',
          items: [
            'Ponosimy odpowiedzialność za należyte wykonanie usługi zgodnie z Kodeksem cywilnym.',
            'Nie gwarantujemy uzyskania konkretnej pracy - sukces zależy od wielu czynników.',
            'Odpowiedzialność ograniczona do dwukrotności kwoty zapłaconej za usługę.'
          ]
        },
        s9: {
          title: '§ 9. Reklamacje',
          howToTitle: '📮 Jak złożyć reklamację?',
          emailText: 'Wyślij e-mail na adres:',
          email: 'pomoc@cvperfect.pl',
          whatTitle: 'Co powinna zawierać reklamacja:',
          items: [
            'Twoje dane kontaktowe',
            'Adres e-mail użyty przy zamówieniu',
            'Opis problemu',
            'Oczekiwany sposób rozwiązania'
          ],
          responseTime: '⏱️ Odpowiadamy w ciągu 14 dni roboczych'
        },
        s10: {
          title: '§ 10. Prawo odstąpienia od umowy',
          warningTitle: 'Ważne informacje',
          warningText: 'Zgodnie z art. 38 pkt 13 ustawy o prawach konsumenta, prawo odstąpienia nie przysługuje po rozpoczęciu świadczenia usługi za Twoją zgodą.',
highlight: 'W przypadku planów abonamentowych możesz odstąpić w ciągu 14 dni, jeśli nie wykorzystałeś żadnej optymalizacji.'
        },
        s11: {
          title: '§ 11. Postanowienia końcowe',
          items: [
            'Zastrzegamy prawo do zmian w Regulaminie z ważnych przyczyn (zmiany prawne, nowe funkcje, bezpieczeństwo).',
            'O zmianach informujemy z 7-dniowym wyprzedzeniem przez e-mail i na stronie.',
            'W sprawach nieuregulowanych stosuje się prawo polskie.',
            'Konsumenci mogą korzystać z pozasądowego rozstrzygania sporów: <a href="http://ec.europa.eu/odr/" target="_blank" rel="noopener">ec.europa.eu/odr</a>'
          ]
        },
        footer: {
          title: 'Masz pytania?',
          subtitle: 'Jesteśmy tu dla Ciebie!',
          email: 'E-mail',
          emailValue: 'pomoc@cvperfect.pl',
          website: 'Strona',
          websiteValue: 'www.cvperfect.pl',
          headquarters: 'Siedziba',
          location: 'Warszawa, Polska',
          validFrom: 'Niniejszy Regulamin obowiązuje od',
          date: '12 sierpnia 2025',
          version: 'Wersja 2.0',
          copyright: '© 2025 CvPerfect sp. z o.o.'
        }
      }
    },
    en: {
      nav: {
        backButton: 'Back to homepage'
      },
      hero: {
        badge: 'Legal documents',
        title: 'Terms of Service',
        subtitle: 'Terms of Service for CvPerfect.pl',
        lastUpdate: 'Last updated: August 12, 2025',
        version: 'Version 2.0'
      },
      sections: [
        { id: 'postanowienia', title: '§ 1. General provisions', icon: '📋' },
        { id: 'definicje', title: '§ 2. Definitions', icon: '📖' },
        { id: 'warunki', title: '§ 3. Terms of use', icon: '⚙️' },
        { id: 'uslugi', title: '§ 4. Services and pricing', icon: '💎' },
        { id: 'umowa', title: '§ 5. Contract conclusion', icon: '✍️' },
        { id: 'abonament', title: '§ 6. Subscription', icon: '🔄' },
        { id: 'dane', title: '§ 7. Data protection', icon: '🔒' },
        { id: 'odpowiedzialnosc', title: '§ 8. Liability', icon: '⚖️' },
        { id: 'reklamacje', title: '§ 9. Complaints', icon: '📮' },
        { id: 'odstapienie', title: '§ 10. Withdrawal', icon: '↩️' },
        { id: 'postanowienia-koncowe', title: '§ 11. Final provisions', icon: '📜' }
      ],
      infoCards: [
        { icon: '🚀', title: 'Quick start', desc: 'Learn about the most important points of the terms' },
        { icon: '🔒', title: 'Security', desc: 'Your data is safe with us - GDPR compliant' },
        { icon: '💬', title: '24/7 Support', desc: 'We are here for you: support@cvperfect.pl' }
      ],
      content: {
        s1: {
          title: '§ 1. General provisions',
          items: [
            'These Terms of Service define the rules for providing electronic services through the website available at <strong>CvPerfect.pl</strong> (hereinafter: "Service") and the rules for concluding and performing service agreements.',
            'The service provider is <strong>CvPerfect sp. z o.o.</strong> based in Poland (hereinafter: "Service Provider").',
            'The Service provides CV document optimization services using advanced artificial intelligence technologies <strong>GPT-4 and GPT-5</strong>.',
            'Using the Service means reading these Terms and accepting them in full.',
'The Terms are available on the Service website in a way that allows reading, obtaining, reproducing and storing its content.'
          ]
        },
        s2: {
          title: '§ 2. Definitions',
          definitions: [
            { icon: '👤', term: 'User', desc: 'A natural person with full legal capacity, a legal person or an organizational unit using the services of the Service.' },
            { icon: '💼', term: 'Client', desc: 'A User who has concluded an agreement with the Service Provider for paid CV optimization services.' },
            { icon: '🎯', term: 'Service', desc: 'CV optimization using artificial intelligence, provided electronically by the Service.' },
            { icon: '💎', term: 'Plan/Package', desc: 'A specific scope of services (Basic, Gold, Premium) with the number of optimizations and functionalities.' },
            { icon: '📄', term: 'CV', desc: 'A document containing information about qualifications, professional experience and education.' },
            { icon: '🤖', term: 'ATS', desc: 'Applicant Tracking System - an IT system for managing the recruitment process.' }
          ]
        },
        s3: {
          title: '§ 3. Terms of use of the Service',
          requirements: {
            title: 'Technical requirements',
            items: ['Device with Internet access', 'Active email account', 'JavaScript enabled', 'Cookie acceptance']
          },
          obligations: {
            title: 'User obligations',
            items: ['Use in accordance with law and Terms', 'Not disrupting Service operation', 'Protecting access data', 'Reporting security breaches']
          },
          prohibited: {
            title: 'Prohibited content',
items: ['Violating third party rights', 'Personal data without consent', 'Offensive or illegal content', 'Viruses and malware']
          }
        },
        s4: {
          title: '§ 4. Services and pricing',
          plans: {
            basic: {
              name: 'Basic Plan',
              price: '4.40',
              currency: '€',
              period: 'one-time',
              features: ['1 CV optimization', 'GPT-3.5 technology', '95% ATS success rate', 'PDF/DOCX export']
            },
            gold: {
              name: 'Gold Plan',
              price: '11',
              currency: '€',
              period: '/month',
              features: ['10 optimizations/month', 'GPT-4 technology', 'Priority support', 'Access to new features']
            },
            premium: {
              name: 'Premium Plan',
              price: '18',
              currency: '€',
              period: '/month',
              features: ['25 optimizations/month', 'Latest GPT-4 VIP', 'VIP support 24/7', 'Beta feature tester']
            }
          },
          notes: [
            '💡 All prices include VAT',
            '🔒 Payments processed by Stripe - global payment leader',
'🔄 Limits renew automatically every month'
          ]
        },
        s5: {
          title: '§ 5. Contract conclusion and service execution',
          steps: [
            { icon: '💳', title: 'Contract conclusion', desc: 'Contract is concluded upon payment and confirmation receipt.' },
            { icon: '⚡', title: 'Service execution', desc: 'CV optimization within 30-90 seconds of order.' },
            { icon: '📧', title: 'Delivery', desc: 'Result sent to provided email address.' }
          ]
        },
        s6: {
          title: '§ 6. Subscription and cancellation',
          items: [
            'Subscription (Gold and Premium plans) renews automatically every month.',
            'You can cancel subscription at any time without additional costs.',
            'After cancellation, you retain access until the end of the paid period.'
          ]
        },
        s7: {
          title: '§ 7. Personal data protection',
          icon: '🔐',
          mainTitle: 'Your data is secure',
          items: [
            '✅ GDPR compliant',
            '✅ SSL/TLS encryption',
            '✅ CV content not stored after optimization',
'✅ Payments via Stripe (PCI DSS)'
          ]
        },
        s8: {
          title: '§ 8. Liability',
          items: [
            'We are liable for proper service execution according to Civil Code.',
            'We do not guarantee obtaining specific job - success depends on many factors.',
            'Liability limited to twice the amount paid for the service.'
          ]
        },
        s9: {
          title: '§ 9. Complaints',
          howToTitle: '📮 How to file a complaint?',
          emailText: 'Send an email to:',
          email: 'support@cvperfect.pl',
          whatTitle: 'What should the complaint contain:',
          items: [
            'Your contact details',
            'Email used for order',
            'Problem description',
            'Expected resolution'
          ],
          responseTime: '⏱️ We respond within 14 business days'
        },
        s10: {
          title: '§ 10. Right of withdrawal',
          warningTitle: 'Important information',
          warningText: 'According to Article 38 point 13 of the Consumer Rights Act, the right of withdrawal does not apply after service execution with your consent.',
highlight: 'For subscription plans, you can withdraw within 14 days if you have not used any optimization.'
        },
        s11: {
          title: '§ 11. Final provisions',
          items: [
            'We reserve the right to change the Terms for valid reasons (legal changes, new features, security).',
            'Changes are announced 7 days in advance via email and on the website.',
            'Polish law applies to matters not regulated.',
            'Consumers can use out-of-court dispute resolution: <a href="http://ec.europa.eu/odr/" target="_blank" rel="noopener">ec.europa.eu/odr</a>'
          ]
        },
        footer: {
          title: 'Have questions?',
          subtitle: 'We are here for you!',
          email: 'Email',
          emailValue: 'support@cvperfect.pl',
          website: 'Website',
          websiteValue: 'www.cvperfect.pl',
          headquarters: 'Headquarters',
          location: 'Warsaw, Poland',
          validFrom: 'These Terms are valid from',
          date: 'August 12, 2025',
          version: 'Version 2.0',
          copyright: '© 2025 CvPerfect sp. z o.o.'
        }
      }
    }
  }

  const t = translations[currentLanguage]
  const sections = t.sections

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

return (
    <>
      <Head>
        <title>
          {currentLanguage === 'pl' 
            ? 'Regulamin - CvPerfect | #1 AI Platforma CV w Polsce'
            : 'Terms of Service - CvPerfect | #1 AI CV Platform in Poland'}
        </title>
        <meta 
          name="description" 
          content={currentLanguage === 'pl'
            ? 'Regulamin serwisu CvPerfect.pl - warunki korzystania z najlepszej platformy AI do optymalizacji CV w Polsce'
            : 'Terms of Service for CvPerfect.pl - terms of use for the best AI CV optimization platform in Poland'}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <div className="legal-container">
        {/* Particles Background */}
        <div className="particles-bg"></div>
        
        {/* Scroll Progress */}
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>

        {/* Premium Navigation */}
        <nav className="legal-nav">
          <div className="nav-content">
            <Link href="/" className="logo-wrapper">
              <div className="logo">
                <span className="logo-badge">AI</span>
                <span className="logo-text">CvPerfect</span>
              </div>
            </Link>
            
            <div className="nav-buttons">
              <div className="language-switcher">
                <button 
                  className={`lang-btn ${currentLanguage === 'pl' ? 'active' : ''}`}
                  onClick={() => setCurrentLanguage('pl')}
                  title="Polski"
                >
                  🇵🇱 PL
                </button>
                <button 
                  className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
                  onClick={() => setCurrentLanguage('en')}
                  title="English"
                >
                  🇬🇧 EN
                </button>
              </div>
              
              <Link href="/" className="back-button">
                <span className="back-icon">←</span>
                <span className="back-text">{t.nav.backButton}</span>
                <div className="button-glow"></div>
              </Link>
            </div>
          </div>
        </nav>
        {/* Floating Navigation */}
        <div className="floating-nav">
          <div className="floating-nav-content">
            {sections.map((section, index) => (
              <button
                key={section.id}
                className={`nav-dot ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => scrollToSection(section.id)}
                title={section.title}
              >
                <span className="dot-icon">{section.icon}</span>
                <span className="dot-tooltip">{section.title}</span>
              </button>
            ))}
          </div>
        </div>

{/* Hero Section */}
        <div className="legal-hero">
          <div className="hero-bg-gradient"></div>
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">⚖️</span>
              <span className="badge-text">{t.hero.badge}</span>
            </div>
            <h1 className="hero-title">
              <span className="gradient-text">{t.hero.title}</span>
            </h1>
            <p className="hero-subtitle">
              {t.hero.subtitle}
            </p>
            <div className="hero-meta">
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span className="meta-text">{t.hero.lastUpdate}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">✅</span>
                <span className="meta-text">{t.hero.version}</span>
              </div>
            </div>
          </div>          <div className="hero-decoration">
            <div className="floating-card card-1">§</div>
            <div className="floating-card card-2">⚖️</div>
            <div className="floating-card card-3">📋</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="legal-main">
          <div className="content-wrapper">
            
{/* Quick Info Cards */}
            <div className="info-cards">
              {t.infoCards.map((card, index) => (
                <div key={index} className="info-card">
                  <div className="card-icon">{card.icon}</div>
                  <div className="card-content">
                    <h3>{card.title}</h3>
                    <p>{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Sections */}
            <div className="legal-sections">
              
{/* Section 1 */}
              <section id="postanowienia" className="legal-section">
                <div className="section-header">
                  <span className="section-number">01</span>
                  <h2 className="section-title">{t.content.s1.title}</h2>
                </div>
                <div className="section-content">
                  {t.content.s1.items.map((text, index) => (
                    <div key={index} className="content-item">
                      <span className="item-number">1.{index + 1}</span>
                      <p dangerouslySetInnerHTML={{ __html: text }} />
                    </div>
                  ))}
                </div>
              </section>
{/* Section 2 */}
              <section id="definicje" className="legal-section">
                <div className="section-header">
                  <span className="section-number">02</span>
                  <h2 className="section-title">{t.content.s2.title}</h2>
                </div>
                <div className="section-content">
                  <div className="definition-grid">
                    {t.content.s2.definitions.map((def, index) => (
                      <div key={index} className="definition-card">
                        <div className="def-icon">{def.icon}</div>
                        <h4>{def.term}</h4>
                        <p>{def.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
{/* Section 3 */}
              <section id="warunki" className="legal-section">
                <div className="section-header">
                  <span className="section-number">03</span>
                  <h2 className="section-title">{t.content.s3.title}</h2>
                </div>
                <div className="section-content">
                  <div className="requirements-box">
                    <h3>🔧 {t.content.s3.requirements.title}</h3>
                    <ul className="premium-list">
                      {t.content.s3.requirements.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="requirements-box">
                    <h3>✅ {t.content.s3.obligations.title}</h3>
                    <ul className="premium-list">
                      {t.content.s3.obligations.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="requirements-box warning">
                    <h3>⚠️ {t.content.s3.prohibited.title}</h3>
                    <ul className="premium-list">
                      {t.content.s3.prohibited.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
{/* Section 4 - Pricing */}
              <section id="uslugi" className="legal-section">
                <div className="section-header">
                  <span className="section-number">04</span>
                  <h2 className="section-title">{t.content.s4.title}</h2>
                </div>
                <div className="section-content">
                  <div className="pricing-cards">
                    <div className="price-card basic">
                      <div className="price-badge">BASIC</div>
                      <div className="price-header">
                        <h3>{t.content.s4.plans.basic.name}</h3>
                        <div className="price-amount">
                          <span className="currency">{t.content.s4.plans.basic.currency}</span>
                          <span className="value">{t.content.s4.plans.basic.price}</span>
                          <span className="period">{t.content.s4.plans.basic.period}</span>
                        </div>
                      </div>
                      <ul className="price-features">
                        {t.content.s4.plans.basic.features.map((feature, index) => (
                          <li key={index}>✅ {feature}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="price-card gold">
                      <div className="price-badge">GOLD</div>
                      <div className="price-header">
                        <h3>{t.content.s4.plans.gold.name}</h3>
                        <div className="price-amount">
                          <span className="currency">{t.content.s4.plans.gold.currency}</span>
                          <span className="value">{t.content.s4.plans.gold.price}</span>
                          <span className="period">{t.content.s4.plans.gold.period}</span>
                        </div>
                      </div>
                      <ul className="price-features">
                        {t.content.s4.plans.gold.features.map((feature, index) => (
                          <li key={index}>✅ {feature}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="price-card premium">
                      <div className="price-badge">PREMIUM</div>
                      <div className="price-header">
                        <h3>{t.content.s4.plans.premium.name}</h3>
                        <div className="price-amount">
                          <span className="currency">{t.content.s4.plans.premium.currency}</span>
                          <span className="value">{t.content.s4.plans.premium.price}</span>
                          <span className="period">{t.content.s4.plans.premium.period}</span>
                        </div>
                      </div>
                      <ul className="price-features">
                        {t.content.s4.plans.premium.features.map((feature, index) => (
                          <li key={index}>✅ {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="pricing-notes">
                    {t.content.s4.notes.map((note, index) => (
                      <p key={index}>{note}</p>
                    ))}
                  </div>
                </div>
              </section>
              {/* Remaining sections with similar premium styling... */}
              {/* Section 5-11 follow similar pattern */}
              
{/* Section 5 */}
              <section id="umowa" className="legal-section">
                <div className="section-header">
                  <span className="section-number">05</span>
                  <h2 className="section-title">{t.content.s5.title}</h2>
                </div>
                <div className="section-content">
                  <div className="timeline-box">
                    {t.content.s5.steps.map((step, index) => (
                      <div key={index} className="timeline-step">
                        <div className="step-icon">{step.icon}</div>
                        <div className="step-content">
                          <h4>{step.title}</h4>
                          <p>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section id="abonament" className="legal-section">
                <div className="section-header">
                  <span className="section-number">06</span>
                  <h2 className="section-title">{t.content.s6.title}</h2>
                </div>
                <div className="section-content">
                  {t.content.s6.items.map((text, index) => (
                    <div key={index} className="content-item">
                      <span className="item-number">6.{index + 1}</span>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 7 */}
              <section id="dane" className="legal-section">
                <div className="section-header">
                  <span className="section-number">07</span>
                  <h2 className="section-title">{t.content.s7.title}</h2>
                </div>
                <div className="section-content">
                  <div className="security-box">
                    <div className="security-icon">{t.content.s7.icon}</div>
                    <h3>{t.content.s7.mainTitle}</h3>
                    <ul className="security-list">
                      {t.content.s7.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
{/* Section 8 */}
              <section id="odpowiedzialnosc" className="legal-section">
                <div className="section-header">
                  <span className="section-number">08</span>
                  <h2 className="section-title">{t.content.s8.title}</h2>
                </div>
                <div className="section-content">
                  {t.content.s8.items.map((text, index) => (
                    <div key={index} className="content-item">
                      <span className="item-number">8.{index + 1}</span>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 9 */}
              <section id="reklamacje" className="legal-section">
                <div className="section-header">
                  <span className="section-number">09</span>
                  <h2 className="section-title">{t.content.s9.title}</h2>
                </div>
                <div className="section-content">
                  <div className="contact-card">
                    <h3>{t.content.s9.howToTitle}</h3>
                    <p>{t.content.s9.emailText} <strong>{t.content.s9.email}</strong></p>
                    <div className="reklamacja-info">
                      <h4>{t.content.s9.whatTitle}</h4>
                      <ul>
                        {t.content.s9.items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="response-time">
                      <span className="time-icon">{t.content.s9.responseTime.split(' ')[0]}</span>
                      <span>{t.content.s9.responseTime.substring(3)}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 10 */}
              <section id="odstapienie" className="legal-section">
                <div className="section-header">
                  <span className="section-number">10</span>
                  <h2 className="section-title">{t.content.s10.title}</h2>
                </div>
                <div className="section-content">
                  <div className="warning-box">
                    <div className="warning-icon">⚠️</div>
                    <h3>{t.content.s10.warningTitle}</h3>
                    <p>{t.content.s10.warningText}</p>
                    <p className="highlight">{t.content.s10.highlight}</p>
                  </div>
                </div>
              </section>

{/* Section 11 */}
              <section id="postanowienia-koncowe" className="legal-section">
                <div className="section-header">
                  <span className="section-number">11</span>
                  <h2 className="section-title">{t.content.s11.title}</h2>
                </div>
                <div className="section-content">
                  {t.content.s11.items.map((text, index) => (
                    <div key={index} className="content-item">
                      <span className="item-number">11.{index + 1}</span>
                      <p dangerouslySetInnerHTML={{ __html: text }} />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Contact Footer */}
            <div className="contact-footer">
              <div className="footer-content">
                <h2>{t.content.footer.title}</h2>
                <p>{t.content.footer.subtitle}</p>
                
                <div className="contact-cards">
                  <div className="contact-card-item">
                    <div className="card-icon">📧</div>
                    <h3>{t.content.footer.email}</h3>
                    <p>{t.content.footer.emailValue}</p>
                  </div>
                  <div className="contact-card-item">
                    <div className="card-icon">🌐</div>
                    <h3>{t.content.footer.website}</h3>
                    <p>{t.content.footer.websiteValue}</p>
                  </div>
                  <div className="contact-card-item">
                    <div className="card-icon">📍</div>
                    <h3>{t.content.footer.headquarters}</h3>
                    <p>{t.content.footer.location}</p>
                  </div>
                </div>
                
                <div className="footer-note">
                  <p>{t.content.footer.validFrom} <strong>{t.content.footer.date}</strong></p>
                  <p>{t.content.footer.version} | {t.content.footer.copyright}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Global Reset & Base */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .legal-container {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #0a0a0a;
          color: white;
          position: relative;
          overflow-x: hidden;
        }

        /* Particles Background */
        .particles-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 50%, rgba(120, 80, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 80, 150, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(80, 180, 255, 0.2) 0%, transparent 50%);
          animation: gradientShift 20s ease infinite;
          z-index: 0;
          pointer-events: none;
        }

        @keyframes gradientShift {
          0%, 100% { transform: rotate(0deg) scale(1); }
          33% { transform: rotate(120deg) scale(1.1); }
          66% { transform: rotate(240deg) scale(0.9); }
        }

        /* Scroll Progress */
        .scroll-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #7850ff, #ff5080, #50b4ff);
          z-index: 10001;
          transition: width 0.3s ease;
        }

        /* Premium Navigation */
        .legal-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(8, 8, 8, 0.95);
          backdrop-filter: blur(30px) saturate(200%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10000;
          padding: 20px 0;
        }

.nav-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
        }

        .nav-buttons {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .language-switcher {
          display: flex;
          gap: 8px;
          margin-right: 20px;
          padding-right: 20px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lang-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          padding: 8px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .lang-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          color: white;
          transform: translateY(-2px);
        }

        .lang-btn.active {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3);
        }

        .logo-wrapper {
          text-decoration: none;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo-badge {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3);
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3); }
          50% { transform: scale(1.05); box-shadow: 0 6px 20px rgba(120, 80, 255, 0.5); }
        }

        .logo-text {
          font-size: 26px;
          font-weight: 900;
          background: linear-gradient(135deg, #7850ff, #ff5080, #50b4ff);
          background-size: 200% 200%;
          animation: gradientMove 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          padding: 14px 28px;
          border-radius: 100px;
          text-decoration: none;
          font-weight: 700;
          font-size: 15px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(120, 80, 255, 0.3);
        }

        .back-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(120, 80, 255, 0.5);
        }

        .button-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .back-button:hover .button-glow {
          left: 100%;
        }

        .back-icon {
          font-size: 20px;
        }

        /* Floating Navigation */
        .floating-nav {
          position: fixed;
          right: 40px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 9999;
          background: rgba(20, 20, 20, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          padding: 20px 10px;
        }

        .floating-nav-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .nav-dot {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-dot:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(120, 80, 255, 0.5);
          transform: scale(1.1);
        }

        .nav-dot.active {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          border-color: transparent;
          box-shadow: 0 0 20px rgba(120, 80, 255, 0.5);
        }

        .dot-icon {
          font-size: 18px;
        }

        .dot-tooltip {
          position: absolute;
          right: 60px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(20, 20, 20, 0.95);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-dot:hover .dot-tooltip {
          opacity: 1;
          visibility: visible;
          right: 70px;
        }

        /* Hero Section */
        .legal-hero {
          position: relative;
          padding: 200px 40px 120px;
          text-align: center;
          overflow: hidden;
        }

        .hero-bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center top, rgba(120, 80, 255, 0.2) 0%, transparent 70%);
          z-index: 0;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 10px 20px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 32px;
          animation: fadeInUp 0.6s ease;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .badge-icon {
          font-size: 18px;
        }

        .hero-title {
          font-size: 72px;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 24px;
          animation: fadeInUp 0.6s ease 0.1s both;
        }

        .gradient-text {
          background: linear-gradient(135deg, #7850ff, #ff5080, #50b4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradientMove 4s ease infinite;
        }

        .hero-subtitle {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 40px;
          animation: fadeInUp 0.6s ease 0.2s both;
        }

        .hero-meta {
          display: flex;
          justify-content: center;
          gap: 40px;
          animation: fadeInUp 0.6s ease 0.3s both;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          color: rgba(255, 255, 255, 0.6);
        }

        .meta-icon {
          font-size: 20px;
        }

        /* Floating Cards Animation */
        .hero-decoration {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .floating-card {
          position: absolute;
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .card-1 {
          top: 20%;
          left: 10%;
          animation: float1 20s ease infinite;
        }

        .card-2 {
          top: 30%;
          right: 15%;
          animation: float2 25s ease infinite;
        }

        .card-3 {
          bottom: 20%;
          left: 20%;
          animation: float3 30s ease infinite;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-40px, 30px) rotate(-120deg); }
          66% { transform: translate(30px, -20px) rotate(-240deg); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(20px, 40px) rotate(180deg); }
          66% { transform: translate(-30px, -30px) rotate(360deg); }
        }

        /* Main Content */
        .legal-main {
          position: relative;
          z-index: 2;
          background: rgba(10, 10, 10, 0.95);
          border-radius: 40px 40px 0 0;
          margin-top: -40px;
          padding-top: 60px;
        }

        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px 80px;
        }

        /* Info Cards */
        .info-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 80px;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 32px;
          display: flex;
          gap: 20px;
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(120, 80, 255, 0.3);
          box-shadow: 0 20px 40px rgba(120, 80, 255, 0.1);
        }

        .card-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .card-content h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: white;
        }

        .card-content p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
        }

        /* Legal Sections */
        .legal-sections {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .legal-section {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .legal-section:hover {
          transform: translateY(-5px);
          border-color: rgba(120, 80, 255, 0.2);
          box-shadow: 0 30px 60px rgba(120, 80, 255, 0.1);
        }

        .section-header {
          background: linear-gradient(135deg, rgba(120, 80, 255, 0.1), rgba(255, 80, 150, 0.1));
          padding: 40px;
          display: flex;
          align-items: center;
          gap: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .section-number {
          font-size: 48px;
          font-weight: 900;
          background: linear-gradient(135deg, #7850ff, #ff5080);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: 0.8;
        }

        .section-title {
          font-size: 28px;
          font-weight: 800;
          color: white;
          margin: 0;
        }

        .section-content {
          padding: 40px;
        }

        .content-item {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
        }

        .content-item:last-child {
          margin-bottom: 0;
        }

        .item-number {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #7850ff, #ff5080);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: white;
        }

        .content-item p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.8;
          font-size: 16px;
        }

        .content-item strong {
          color: #00ff88;
          font-weight: 600;
        }

        /* Definition Grid */
        .definition-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .definition-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 28px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .definition-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(120, 80, 255, 0.3);
          box-shadow: 0 15px 30px rgba(120, 80, 255, 0.1);
        }

        .def-icon {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .definition-card h4 {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 12px;
        }

        .definition-card p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
        }

        /* Requirements Box */
        .requirements-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px;
          margin-bottom: 24px;
        }

        .requirements-box.warning {
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .requirements-box h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
          color: white;
        }

        .premium-list {
          list-style: none;
          padding: 0;
        }

        .premium-list li {
          position: relative;
          padding-left: 32px;
          margin-bottom: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 15px;
          line-height: 1.6;
        }

        .premium-list li:before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #00ff88;
          font-weight: 700;
          font-size: 18px;
        }

        .requirements-box.warning .premium-list li:before {
          content: '✗';
          color: #ef4444;
        }

        /* Pricing Cards */
        .pricing-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-bottom: 40px;
        }

        .price-card {
          background: rgba(255, 255, 255, 0.02);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px 32px;
          position: relative;
          transition: all 0.3s ease;
        }

        .price-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        .price-card.gold {
          border-color: rgba(245, 158, 11, 0.5);
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.05));
        }

        .price-card.premium {
          border-color: rgba(139, 92, 246, 0.5);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.05));
        }

        .price-badge {
          position: absolute;
          top: -16px;
          left: 32px;
          background: linear-gradient(135deg, #9ca3af, #6b7280);
          color: white;
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .gold .price-badge {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .premium .price-badge {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .price-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .price-header h3 {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
        }

        .price-amount {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
        }

        .currency {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.5);
        }

        .value {
          font-size: 48px;
          font-weight: 900;
          color: white;
        }

        .period {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.5);
        }

        .price-features {
          list-style: none;
          padding: 0;
        }

        .price-features li {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
          font-size: 15px;
        }

        .price-features li:last-child {
          border-bottom: none;
        }

        .pricing-notes {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
        }

        .pricing-notes p {
          margin-bottom: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 15px;
        }

        .pricing-notes p:last-child {
          margin-bottom: 0;
        }

        /* Timeline Box */
        .timeline-box {
          display: flex;
          gap: 40px;
          justify-content: space-between;
        }

        .timeline-step {
          flex: 1;
          text-align: center;
        }

        .step-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #7850ff, #ff5080);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto 24px;
          box-shadow: 0 10px 30px rgba(120, 80, 255, 0.3);
        }

        .step-content h4 {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 12px;
        }

        .step-content p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          line-height: 1.6;
        }

        /* Security Box */
        .security-box {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.05), rgba(0, 204, 112, 0.05));
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
        }

        .security-icon {
          font-size: 48px;
          margin-bottom: 24px;
        }

        .security-box h3 {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-bottom: 24px;
        }

        .security-list {
          list-style: none;
          padding: 0;
          text-align: left;
          max-width: 400px;
          margin: 0 auto;
        }

        .security-list li {
          padding: 12px 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
        }

        /* Contact Card */
        .contact-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
        }

        .contact-card h3 {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
        }

        .contact-card p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          margin-bottom: 24px;
        }

        .contact-card strong {
          color: #00ff88;
        }

        .reklamacja-info {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .reklamacja-info h4 {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 16px;
        }

        .reklamacja-info ul {
          list-style: none;
          padding: 0;
        }

        .reklamacja-info li {
          padding: 8px 0;
          padding-left: 24px;
          position: relative;
          color: rgba(255, 255, 255, 0.7);
          font-size: 15px;
        }

        .reklamacja-info li:before {
          content: '•';
          position: absolute;
          left: 0;
          color: #7850ff;
          font-size: 20px;
        }

        .response-time {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
        }

        .time-icon {
          font-size: 24px;
        }

        .response-time span:last-child {
          font-size: 16px;
          font-weight: 600;
          color: white;
        }

        /* Warning Box */
        .warning-box {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.05));
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
        }

        .warning-icon {
          font-size: 48px;
          margin-bottom: 24px;
        }

        .warning-box h3 {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-bottom: 20px;
        }

        .warning-box p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 16px;
        }

        .warning-box .highlight {
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin-top: 20px;
          color: #00ff88;
          font-weight: 600;
        }

        /* Contact Footer */
        .contact-footer {
          margin-top: 80px;
          background: linear-gradient(135deg, rgba(120, 80, 255, 0.1), rgba(255, 80, 150, 0.1));
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 32px;
          padding: 60px;
          text-align: center;
        }

        .footer-content h2 {
          font-size: 48px;
          font-weight: 900;
          background: linear-gradient(135deg, #7850ff, #ff5080);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 16px;
        }

        .footer-content > p {
          font-size: 20px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 48px;
        }

        .contact-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-bottom: 48px;
        }

        .contact-card-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s ease;
        }

        .contact-card-item:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(120, 80, 255, 0.3);
        }

        .contact-card-item .card-icon {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .contact-card-item h3 {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .contact-card-item p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
        }

        .footer-note {
          padding-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-note p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin-bottom: 8px;
        }

        .footer-note p:last-child {
          margin-bottom: 0;
        }

        .footer-note strong {
          color: #00ff88;
        }

        /* Links */
        a {
          color: #7850ff;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        a:hover {
          color: #ff5080;
          text-decoration: underline;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .info-cards {
            grid-template-columns: 1fr;
          }

          .definition-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .pricing-cards {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .contact-cards {
            grid-template-columns: 1fr;
          }
        }

@media (max-width: 768px) {
          /* Navigation */
          .nav-content {
            padding: 0 20px;
          }
          
          .nav-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
            margin-top: 12px;
          }
          
          .language-switcher {
            margin-right: 0;
            padding-right: 0;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 12px;
            width: 100%;
            justify-content: center;
          }

          .logo-text {
            font-size: 22px;
          }

          .back-button {
            width: 100%;
            justify-content: center;
            padding: 12px 24px;
            font-size: 14px;
          }

          /* Floating Nav - Hidden on mobile */
          .floating-nav {
            display: none;
          }

          /* Hero */
          .legal-hero {
            padding: 140px 20px 80px;
          }

          .hero-title {
            font-size: 42px;
          }

          .hero-subtitle {
            font-size: 18px;
          }

          .hero-meta {
            flex-direction: column;
            gap: 16px;
          }

          /* Content */
          .content-wrapper {
            padding: 0 20px 60px;
          }

          .section-header {
            padding: 24px;
            flex-direction: column;
            text-align: center;
          }

          .section-number {
            font-size: 36px;
          }

          .section-title {
            font-size: 22px;
          }

          .section-content {
            padding: 24px;
          }

          .definition-grid {
            grid-template-columns: 1fr;
          }

          .timeline-box {
            flex-direction: column;
            gap: 32px;
          }

          .contact-footer {
            padding: 40px 20px;
          }

          .footer-content h2 {
            font-size: 36px;
          }

          /* Hide decorative elements on mobile for performance */
          .hero-decoration {
            display: none;
          }

          .particles-bg {
            opacity: 0.3;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 36px;
          }

          .content-item {
            flex-direction: column;
            gap: 12px;
          }

          .item-number {
            width: 32px;
            height: 32px;
            font-size: 12px;
          }
        }

        /* Accessibility */
        .legal-section:focus-within {
          outline: 2px solid #7850ff;
          outline-offset: 2px;
        }

        button:focus,
        a:focus {
          outline: 2px solid #7850ff;
          outline-offset: 2px;
        }

        /* Print styles */
        @media print {
          .legal-nav,
          .floating-nav,
          .hero-decoration,
          .particles-bg,
          .scroll-progress-bar {
            display: none;
          }

          .legal-container {
            background: white;
            color: black;
          }

          .legal-section {
            page-break-inside: avoid;
            border: 1px solid #ddd;
            margin-bottom: 20px;
          }

          .section-header {
            background: #f5f5f5;
            color: black;
          }

          a {
            color: black;
            text-decoration: underline;
          }
/* Fix for navigation layout */
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .nav-buttons {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .nav-buttons {
            margin-top: 12px;
          }
          
          .back-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  )
}