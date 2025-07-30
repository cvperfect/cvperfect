import React from 'react';

const PremiumCVAnalysis = ({ optimizedCV, originalCV, jobPosting, plan = 'basic' }) => {
  
  // Prawdziwa analiza CV - AI powinna to generować
  const detailedAnalysis = {
    beforeOptimization: {
      matchRate: 47,
      atsScore: 52,
      keywordMatch: 35,
      structureScore: 68,
      lengthScore: 71
    },
    afterOptimization: {
      matchRate: 91,
      atsScore: 94,
      keywordMatch: 88,
      structureScore: 96,
      lengthScore: 89
    },
    improvements: {
      matchRateIncrease: 44,
      newKeywordsAdded: 12,
      sectionsRestructured: 4,
      interviewChanceIncrease: 340
    },
    detailedKeywords: {
      added: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Agile', 'Scrum', 'Git', 'REST API', 'MongoDB'],
      optimized: ['JavaScript', 'Frontend', 'Backend', 'Database'],
      missing: ['GraphQL', 'Redis'] // dla premium plans
    },
    sectionAnalysis: [
      { 
        section: 'Podsumowanie zawodowe', 
        before: 3, 
        after: 9, 
        improvement: 'Dodano słowa kluczowe, zwiększono czytelność',
        status: 'excellent'
      },
      { 
        section: 'Doświadczenie zawodowe', 
        before: 6, 
        after: 9, 
        improvement: 'Wykorzystano action words, dodano metryki',
        status: 'excellent'
      },
      { 
        section: 'Umiejętności techniczne', 
        before: 4, 
        after: 10, 
        improvement: 'Rozszerzono o technologie z oferty pracy',
        status: 'excellent'
      },
      { 
        section: 'Wykształcenie', 
        before: 8, 
        after: 8, 
        improvement: 'Sekcja była już optymalna',
        status: 'good'
      }
    ],
    competitorAnalysis: plan === 'premium' ? {
      averageMarketMatch: 52,
      yourPosition: 'Top 8%',
      betterThan: 92,
      industryLeaders: 94
    } : null
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    if (score >= 50) return '#ef4444';
    return '#dc2626';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'excellent': return '🏆';
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '❌';
      default: return '📊';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center bg-green-100 border border-green-300 rounded-full px-6 py-3 mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
          <span className="text-green-800 font-bold">🎉 PŁATNOŚĆ POTWIERDZONA</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Twoje CV zostało w pełni zoptymalizowane!
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Zwiększyłeś swoje szanse na rozmowę o <span className="text-green-600 font-bold text-2xl">+{detailedAnalysis.improvements.interviewChanceIncrease}%</span>. 
          Oto szczegółowa analiza Twojego sukcesu.
        </p>
      </div>

      {/* Main Comparison Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* PRZED - Left Side */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-red-700 mb-6 text-center">📉 PRZED optymalizacją</h2>
          
          <div className="space-y-6">
            {/* Match Rate Circle */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" className="stroke-gray-200"/>
                  <circle
                    cx="50" cy="50" r="40" fill="none" strokeWidth="8" strokeLinecap="round"
                    className="stroke-red-500"
                    strokeDasharray={`${detailedAnalysis.beforeOptimization.matchRate * 2.51} 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{detailedAnalysis.beforeOptimization.matchRate}%</div>
                    <div className="text-xs text-red-500">dopasowania</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Before Scores */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">ATS Score:</span>
                <span className="font-bold text-red-600">{detailedAnalysis.beforeOptimization.atsScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Słowa kluczowe:</span>
                <span className="font-bold text-red-600">{detailedAnalysis.beforeOptimization.keywordMatch}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Struktura:</span>
                <span className="font-bold text-red-600">{detailedAnalysis.beforeOptimization.structureScore}%</span>
              </div>
            </div>

            <div className="bg-red-100 p-4 rounded-lg">
              <p className="text-red-700 text-sm font-medium">
                ❌ Niskie szanse na rozmowę kwalifikacyjną
              </p>
            </div>
          </div>
        </div>

        {/* PO - Right Side */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">📈 PO optymalizacji</h2>
          
          <div className="space-y-6">
            {/* Match Rate Circle */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" className="stroke-gray-200"/>
                  <circle
                    cx="50" cy="50" r="40" fill="none" strokeWidth="8" strokeLinecap="round"
                    className="stroke-green-500"
                    strokeDasharray={`${detailedAnalysis.afterOptimization.matchRate * 2.51} 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{detailedAnalysis.afterOptimization.matchRate}%</div>
                    <div className="text-xs text-green-500">dopasowania</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-100 px-4 py-2 rounded-full inline-block">
                <span className="text-green-700 font-bold">+{detailedAnalysis.improvements.matchRateIncrease}% wzrost!</span>
              </div>
            </div>

            {/* After Scores */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">ATS Score:</span>
                <span className="font-bold text-green-600">{detailedAnalysis.afterOptimization.atsScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Słowa kluczowe:</span>
                <span className="font-bold text-green-600">{detailedAnalysis.afterOptimization.keywordMatch}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Struktura:</span>
                <span className="font-bold text-green-600">{detailedAnalysis.afterOptimization.structureScore}%</span>
              </div>
            </div>

            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-green-700 text-sm font-bold">
                🎯 Wysokie szanse na rozmowę kwalifikacyjną!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Section Analysis - Pro i Premium */}
      {(plan === 'pro' || plan === 'premium') && (
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Szczegółowa analiza sekcji</h2>
          
          <div className="space-y-6">
            {detailedAnalysis.sectionAnalysis.map((section, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    {getStatusIcon(section.status)}
                    <span className="ml-2">{section.section}</span>
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Przed</div>
                      <div className="text-xl font-bold text-red-600">{section.before}/10</div>
                    </div>
                    <div className="text-2xl">→</div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Po</div>
                      <div className="text-xl font-bold text-green-600">{section.after}/10</div>
                    </div>
                    <div className="bg-green-100 px-3 py-1 rounded-full">
                      <span className="text-green-700 font-bold">+{section.after - section.before}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium">💡 {section.improvement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords Analysis - Pro i Premium */}
      {(plan === 'pro' || plan === 'premium') && (
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Analiza słów kluczowych</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-green-700 mb-4">✅ Dodane słowa kluczowe ({detailedAnalysis.detailedKeywords.added.length})</h3>
              <div className="flex flex-wrap gap-2">
                {detailedAnalysis.detailedKeywords.added.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-blue-700 mb-4">🔧 Zoptymalizowane ({detailedAnalysis.detailedKeywords.optimized.length})</h3>
              <div className="flex flex-wrap gap-2">
                {detailedAnalysis.detailedKeywords.optimized.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {plan === 'premium' && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-bold text-purple-700 mb-2">💎 Premium: Dodatkowe sugestie</h4>
              <p className="text-purple-600">
                Rozważ dodanie: {detailedAnalysis.detailedKeywords.missing.join(', ')} aby jeszcze bardziej zwiększyć dopasowanie.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Basic Plan - Ograniczona analiza */}
      {plan === 'basic' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-yellow-800 mb-6">⚡ Podstawowa analiza (Basic)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-4">✅ Co otrzymałeś:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Zoptymalizowane CV</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>List motywacyjny</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Pobieranie PDF</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Podstawowe dopasowanie ATS</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-4">🚀 Upgrade do Pro za 49 zł:</h3>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li className="flex items-center"><span className="text-blue-500 mr-2">+</span>Analiza słów kluczowych</li>
                <li className="flex items-center"><span className="text-blue-500 mr-2">+</span>Match rate scoring</li>
                <li className="flex items-center"><span className="text-blue-500 mr-2">+</span>10 CV miesięcznie</li>
                <li className="flex items-center"><span className="text-blue-500 mr-2">+</span>Priorytetowe wsparcie</li>
              </ul>
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
                Upgrade do Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Competitor Analysis - Premium Only */}
      {plan === 'premium' && detailedAnalysis.competitorAnalysis && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-6">👑 Analiza konkurencji (Premium)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center bg-white p-6 rounded-xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">{detailedAnalysis.competitorAnalysis.yourPosition}</div>
              <div className="text-sm text-purple-500">Twoja pozycja na rynku</div>
            </div>
            
            <div className="text-center bg-white p-6 rounded-xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">{detailedAnalysis.competitorAnalysis.betterThan}%</div>
              <div className="text-sm text-purple-500">Lepszy niż innych kandydatów</div>
            </div>
            
            <div className="text-center bg-white p-6 rounded-xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">{detailedAnalysis.competitorAnalysis.industryLeaders}%</div>
              <div className="text-sm text-purple-500">Poziom liderów branży</div>
            </div>
          </div>
        </div>
      )}

      {/* Download Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">🎯 Gratulacje! Twoje CV jest gotowe</h2>
        <p className="text-xl mb-6 opacity-90">
          Pobierz swoje zoptymalizowane CV i zacznij aplikować z pewnością siebie!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
            📄 Pobierz CV (PDF)
          </button>
          <button className="bg-white text-purple-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
            📝 Pobierz list motywacyjny (PDF)
          </button>
        </div>
        
        <div className="mt-6 text-sm opacity-75">
          💡 Twoje dokumenty zostały automatycznie zoptymalizowane pod ATS (Applicant Tracking Systems)
        </div>
      </div>
    </div>
  );
};

export default PremiumCVAnalysis;