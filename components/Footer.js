import { useRouter } from 'next/router'

const Footer = ({ currentLanguage }) => {
  const router = useRouter()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <span className="logo-text">CvPerfect</span>
            <span className="logo-badge">AI</span>
          </div>
          <p className="footer-description">
            {currentLanguage==='pl'
              ? 'Pierwsza AI platforma do optymalizacji CV w Polsce. 95% skuteczności ATS, 410% więcej rozmów kwalifikacyjnych.'
              : 'The first AI platform in Poland for CV optimization. 95% ATS success rate, 410% more interviews.'}
          </p>
        </div>
        
        <div className="footer-section">
          <h4>{currentLanguage==='pl' ? 'Pomoc' : 'Help'}</h4>
          <ul className="footer-links">
            <li><a href="/regulamin">{currentLanguage==='pl' ? 'Regulamin' : 'Terms & Conditions'}</a></li>
            <li><a href="/kontakt">{currentLanguage==='pl' ? 'Kontakt' : 'Contact'}</a></li>
            <li><a href="/polityka-prywatnosci">{currentLanguage==='pl' ? 'Polityka prywatności' : 'Privacy Policy'}</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>
          {currentLanguage==='pl'
            ? '© 2025 CvPerfect. Wszystkie prawa zastrzeżone.'
            : '© 2025 CvPerfect. All rights reserved.'}
        </p>
      </div>

      <style jsx>{`
/* Footer */
        .footer {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: white;
          padding: 80px 40px 40px;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 60px;
          margin-bottom: 40px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .footer-logo .logo-text {
          font-size: 28px;
          font-weight: 900;
          background: linear-gradient(135deg, #7850ff, #ff5080, #50b4ff);
          background-size: 200% 200%;
          animation: gradientMove 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }

        .footer-logo .logo-badge {
          background: linear-gradient(135deg, #7850ff, #ff5080);
          color: white;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(120, 80, 255, 0.3);
        }

        .footer-description {
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.7;
          margin-bottom: 32px;
          font-size: 16px;
          max-width: 400px;
        }

        .footer-section h4 {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 24px;
          color: white;
          letter-spacing: -0.5px;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 16px;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: all 0.3s ease;
          font-size: 16px;
          position: relative;
          display: inline-block;
        }

        .footer-links a:hover {
          color: white;
          transform: translateX(5px);
        }

        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 48px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .footer-bottom p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 15px;
          margin: 0;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @media (max-width: 768px) {
          .footer {
            padding: 60px 20px 30px;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .footer-description {
            max-width: 100%;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer