// Plik: components/CVAnalysisDashboard.js
// Ten komponent jest używany na stronie głównej

import { useState } from 'react';

const CVAnalysisDashboard = ({ optimizedCV, onPayment }) => {
  console.log('CVAnalysisDashboard props:', { optimizedCV: !!optimizedCV, onPayment: !!onPayment });
  
  const [currentView, setCurrentView] = useState('preview');

  // Przykładowe dane z analizy CV
  const analysisData = {
    matchRate: 73,
    improvements: [
      { category: 'Słowa kluczowe', score: 65, issues: 3, status: 'warning' },
      { category: 'Formatowanie', score: 89, issues: 1, status: 'good' },
      { category: 'Długość sekcji', score: 45, issues: 4, status: 'critical' },
      { category: 'Umiejętności', score: 72, issues: 2, status: 'warning' },
      { category: 'Doświadczenie', score: 91, issues: 0, status: 'excellent' }
    ],
    keywordAnalysis: {
      found: ['JavaScript', 'React', 'Node.js', 'Git'],
      missing: ['TypeScript', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      total: 15
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    if (score >= 50) return '#ef4444';
    return '#dc2626';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return '#10b981';
      case 'good': return '#22c55e';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-green-50 border border-green-200 rounded-full px-4 py-2 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-green-700 text-sm font-medium">✨ Analiza CV zakończona</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎉 Twoje CV zostało przeanalizowane!
        </h1>
        <p className="text-lg text-gray-600">
          Sprawdź jak AI poprawiło dopasowanie do oferty
        </p>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Match Rate */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Współczynnik dopasowania
            </h2>
            
            {/* Circular Progress */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="40"
                  fill="none" strokeWidth="8"
                  className="stroke-gray-200"
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none" strokeWidth="8"
                  strokeLinecap="round"
                  className="stroke-blue-500"
                  strokeDasharray={`${analysisData.matchRate * 2.51} 251`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{analysisData.matchRate}%</div>
                  <div className="text-sm text-gray-600">dopasowania</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Twoje CV: {analysisData.matchRate}%</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                <span className="text-gray-500">Średnia rynkowa: 45%</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-700">Po optymalizacji: 94%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Analysis */}
        <div className="lg:col-span-2">
          
          {/* Category Scores */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Analiza szczegółowa</h3>
            
            <div className="space-y-4">
              {analysisData.improvements.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center flex-1">
                    <div className="w-12 h-12 rounded-lg bg-white border-2 flex items-center justify-center mr-4">
                      <div className={`w-6 h-6 rounded-full`} 
                           style={{ backgroundColor: getStatusColor(item.status) }}></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{item.category}</div>
                      <div className="text-sm text-gray-600">
                        {item.issues > 0 ? `${item.issues} problemów do naprawy` : 'Wszystko w porządku'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.score}%`,
                          backgroundColor: getScoreColor(item.score)
                        }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-900 w-12 text-right">{item.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keyword Analysis Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🔍 Analiza słów kluczowych</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-3">✅ Znalezione ({analysisData.keywordAnalysis.found.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisData.keywordAnalysis.found.map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-700 mb-3">❌ Brakujące ({analysisData.keywordAnalysis.missing.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisData.keywordAnalysis.missing.slice(0, 3).map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                  <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer">
                    +{analysisData.keywordAnalysis.missing.length - 3} więcej
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-200">
              <div className="flex items-center justify-center text-purple-700 font-medium">
                🔒 Pełna analiza słów kluczowych dostępna po zakupie
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - 3 PLANY */}
      <div className="mt-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            💎 Wybierz swój plan sukcesu
          </h2>
          <p className="text-xl text-gray-600">
            Wszystkie plany zawierają pełne CV + list motywacyjny + pobieranie PDF
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* BASIC */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center relative h-full flex flex-col">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Basic</h3>
            <div className="text-3xl font-bold text-gray-700 mb-2">19,99 zł</div>
            <div className="text-sm text-gray-500 mb-6">jednorazowo</div>
            
            <ul className="text-left space-y-3 mb-6 text-sm flex-grow">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-900 font-medium">1 optymalizowane CV</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-900 font-medium">List motywacyjny</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-900 font-medium">Pobieranie PDF</span>
              </li>
              <li className="flex items-center">
                <span className="text-gray-400 mr-2">✗</span>
                <span className="text-gray-500">Analiza słów kluczowych</span>
              </li>
            </ul>
            
            <button 
              onClick={() => {
                console.log('Button Basic clicked, onPayment:', !!onPayment);
                onPayment && onPayment('basic');
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-auto"
            >
              Wybierz Basic
            </button>
          </div>

          {/* PRO - Polecany */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-blue-400 rounded-xl p-6 text-center relative h-full flex flex-col transform lg:scale-110 shadow-2xl z-10">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                🔥 NAJCZĘŚCIEJ WYBIERANY
              </span>
            </div>
            
            <div className="text-4xl mb-4 mt-4">🚀</div>
            <h3 className="text-2xl font-bold text-blue-700 mb-2">Pro</h3>
            <div className="text-4xl font-bold text-blue-700 mb-2">49 zł</div>
            <div className="text-sm text-blue-600 mb-6">miesięcznie</div>
            
            <ul className="text-left space-y-3 mb-6 flex-grow">
              <li className="flex items-center">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                <span className="text-gray-900 font-bold">10 CV miesięcznie</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                <span className="text-gray-900 font-bold">Analiza słów kluczowych</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                <span className="text-gray-900 font-bold">Match rate scoring</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                <span className="text-gray-900 font-bold">Priorytetowe wsparcie</span>
              </li>
            </ul>
            
            <button 
              onClick={() => {
                console.log('Button Pro clicked, onPayment:', !!onPayment);
                onPayment && onPayment('pro');
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mt-auto"
            >
              🚀 Rozpocznij Pro
            </button>
          </div>

          {/* PREMIUM */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-400 rounded-xl p-6 text-center relative h-full flex flex-col shadow-xl">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                ⭐ NAJLEPSZA WARTOŚĆ
              </span>
            </div>
            
            <div className="text-4xl mb-4 mt-4">💎</div>
            <h3 className="text-2xl font-bold text-purple-700 mb-2">Premium</h3>
            <div className="text-4xl font-bold text-purple-700 mb-2">79 zł</div>
            <div className="text-sm text-purple-600 mb-6">miesięcznie</div>
            
            <ul className="text-left space-y-3 mb-6 flex-grow">
              <li className="flex items-center">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                <span className="text-gray-900 font-bold">25 CV miesięcznie</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                <span className="text-gray-900 font-bold">Zaawansowana analiza AI</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                <span className="text-gray-900 font-bold">ATS compatibility score</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2 font-bold">✓</span>
                <span className="text-gray-900 font-bold">VIP wsparcie 24/7</span>
              </li>
            </ul>
            
            <button 
              onClick={() => {
                console.log('Button Premium clicked, onPayment:', !!onPayment);
                onPayment && onPayment('premium');
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mt-auto"
            >
              💎 Wybierz Premium
            </button>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-8 text-center">
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <span>⚡ Natychmiastowy dostęp</span>
            <span>🔒 Bezpieczne płatności Stripe</span>
            <span>🎯 +300% więcej rozmów</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVAnalysisDashboard;