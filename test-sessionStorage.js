// Prosty test sessionStorage fallback
const testSessionStorageFallback = async () => {
  console.log('🧪 Testing sessionStorage fallback...');
  
  // Symuluj dane CV w sessionStorage (jak robi index.js)
  const testCV = `
MARCIN NOWAK TESTOWY
marcin.nowak@test.com
+48 987 654 321
Gdańsk, Polska

PROFIL ZAWODOWY
===============
Senior Backend Developer z 6-letnim doświadczeniem w budowaniu skalowalnych systemów.
Specjalizuję się w Node.js, Python, mikrousługach i architekturze cloud-native.

DOŚWIADCZENIE ZAWODOWE
======================

Senior Backend Developer | CloudTech Solutions | 2021-2024
- Projektowanie i implementacja mikrousług w Node.js/Express
- Zarządzanie bazami danych PostgreSQL i MongoDB
- Implementacja systemów cache (Redis, Memcached)
- DevOps - Docker, Kubernetes, CI/CD pipelines
- Mentoring junior developerów i code review
- Optymalizacja wydajności API - redukcja response time o 60%
Technologie: Node.js, Express, PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS

Backend Developer | StartupHub | 2019-2021  
- Rozwój REST API w Python/Django dla aplikacji fintech
- Integracja z zewnętrznymi API płatniczymi (Stripe, PayPal)
- Implementacja systemów autoryzacji OAuth 2.0 i JWT
- Monitoring i alerting z wykorzystaniem ELK Stack
- Automatyzacja testów jednostkowych i integracyjnych
Technologie: Python, Django, PostgreSQL, Celery, Redis, Docker

Junior Developer | WebDev Agency | 2018-2019
- Tworzenie aplikacji webowych w PHP/Laravel
- Praca z bazami danych MySQL
- Współpraca z zespołem frontend przy projektowaniu API
- Nauka podstaw DevOps i deploymentu
Technologie: PHP, Laravel, MySQL, Git, Linux

WYKSZTAŁCENIE
=============
Magister Informatyki | Politechnika Gdańska | 2016-2018
- Specjalizacja: Systemy Rozproszone
- Praca magisterska: "Optymalizacja wydajności systemów mikrousługowych"

Licencjat Informatyki | Uniwersytet Gdański | 2013-2016  
- Specjalizacja: Inżynieria Oprogramowania
- Średnia ocen: 4.7/5.0

UMIEJĘTNOŚCI
============
Backend: Node.js, Express.js, Python, Django, FastAPI, PHP, Laravel
Bazy danych: PostgreSQL, MongoDB, Redis, MySQL, Elasticsearch  
Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins, GitHub Actions
Inne: Git, Linux, Nginx, RabbitMQ, GraphQL, REST API

CERTYFIKATY
===========
- AWS Certified Solutions Architect (2023)
- Kubernetes Administrator (CKAD) (2022)
- MongoDB Professional Developer (2021)

JĘZYKI
======
- Polski - ojczysty
- Angielski - C1 (TOEIC 920/990)
- Niemiecki - A2

Ten CV ma ponad 3 strony i będzie doskonały do testowania systemu.
  `.trim();

  console.log('📄 Testowe CV długość:', testCV.length, 'znaków');
  console.log('📄 Liczba linii:', testCV.split('\n').length);
  
  // Zapisz do sessionStorage (jak robi index.js)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('pendingCV', testCV);
    sessionStorage.setItem('pendingJob', 'Backend Developer - praca zdalna');
    sessionStorage.setItem('pendingEmail', 'marcin.nowak@test.com');
    sessionStorage.setItem('pendingPlan', 'premium');
    
    console.log('✅ Dane zapisane w sessionStorage');
    
    // Sprawdź czy dane są dostępne
    const storedCV = sessionStorage.getItem('pendingCV');
    console.log('📦 Sprawdzenie sessionStorage:', {
      cvLength: storedCV?.length || 0,
      hasJob: !!sessionStorage.getItem('pendingJob'),
      hasEmail: !!sessionStorage.getItem('pendingEmail'),
      hasPlan: !!sessionStorage.getItem('pendingPlan')
    });
    
    console.log('✅ Test sessionStorage zakończony');
    console.log('💡 Teraz przejdź do success.js z fake session_id aby zobaczyć fallback');
    console.log('🔗 URL: http://localhost:3000/success?session_id=test_session_123');
    
  } else {
    console.log('❌ window/sessionStorage nie dostępne w Node.js');
    console.log('💡 Uruchom ten kod w przeglądarce (DevTools Console)');
  }
};

// Jeśli w przeglądarce, uruchom od razu
if (typeof window !== 'undefined') {
  testSessionStorageFallback();
} else {
  console.log('💡 Aby przetestować sessionStorage fallback:');
  console.log('1. Otwórz http://localhost:3000 w przeglądarce');
  console.log('2. Otwórz DevTools (F12)');
  console.log('3. Wklej i uruchom ten kod w Console');
  console.log('4. Przejdź na http://localhost:3000/success?session_id=test_123');
}

module.exports = { testSessionStorageFallback };