// Test with realistic long CV to confirm no truncation
const testLongCV = async () => {
  const longCV = `KONRAD JAKÓBCZAK
Frontend Developer | React Specialist | Team Leader

📞 +48 123 456 789
📧 konrad.jakobczak@example.com
🌐 linkedin.com/in/konradjakobczak
🏠 Warszawa, Polska

PODSUMOWANIE ZAWODOWE:
Doświadczony Frontend Developer z 5-letnim doświadczeniem w tworzeniu skalowalnych aplikacji webowych. Specjalista React z umiejętnościami team lead. Pasjonat nowych technologii i clean code.

DOŚWIADCZENIE ZAWODOWE:

Senior Frontend Developer | TechCorp Sp. z o.o. | 2019-2024
• Tworzenie aplikacji React dla klientów enterprise (15+ projektów)
• Optymalizacja wydajności aplikacji - redukcja czasu ładowania o 40%
• Mentoring zespołu 5 junior developerów
• Wdrażanie CI/CD pipeline dla frontendowych projektów
• Współpraca z UX/UI designerami w procesie design thinking
• Code review i zapewnianie jakości kodu
• Migracja legacy aplikacji z jQuery do React

Frontend Developer | StartupXYZ | 2017-2019
• Rozwój MVP produktu fintech od podstaw
• Integracja z REST API i GraphQL
• Implementacja responsywnego designu
• Testowanie jednostkowe i e2e (Jest, Cypress)
• Współpraca w zespole Agile/Scrum
• Utrzymanie 95% pokrycia testami

Junior Web Developer | WebAgency | 2016-2017
• Tworzenie stron internetowych dla małych firm
• Rozwój umiejętności HTML, CSS, JavaScript
• Nauka pracy z klientem i zarządzanie projektami
• Optymalizacja SEO i performance

WYKSZTAŁCENIE:

Magister Informatyki | Politechnika Warszawska | 2014-2018
Specjalizacja: Inżynieria Oprogramowania
Praca dyplomowa: "Optymalizacja aplikacji React w środowisku produkcyjnym"
Średnia ocen: 4.8/5.0

Licencjat Informatyki | Politechnika Warszawska | 2010-2014
Specjalizacja: Systemy Informatyczne
Średnia ocen: 4.5/5.0

UMIEJĘTNOŚCI TECHNICZNE:

Frontend:
• JavaScript (ES6+), TypeScript - ekspert
• React, Redux, React Query - ekspert  
• Vue.js, Vuex - zaawansowany
• HTML5, CSS3, SASS/SCSS - ekspert
• Webpack, Vite, Parcel - zaawansowany
• Responsive Web Design - ekspert

Backend:
• Node.js, Express.js - średniozaawansowany
• GraphQL, REST API - zaawansowany
• Bazy danych: MongoDB, PostgreSQL - podstawowy

DevOps & Tools:
• Git, GitHub, GitLab - ekspert
• Docker, Docker Compose - podstawowy  
• AWS (S3, CloudFront, EC2) - podstawowy
• CI/CD (GitHub Actions, GitLab CI) - średniozaawansowany

Testing:
• Jest, React Testing Library - zaawansowany
• Cypress, Playwright - średniozaawansowany
• Storybook - średniozaawansowany

CERTYFIKATY I KURSY:

• AWS Certified Developer Associate (2023)
• React Professional Certificate - Meta (2022)
• Advanced JavaScript Concepts - Udemy (2021)
• GraphQL with React Course (2020)
• Agile/Scrum Master Certification (2019)

JĘZYKI:

• Polski - język ojczysty
• Angielski - C1 (certyfikat Cambridge)
• Niemiecki - A2 (podstawowy)

KLUCZOWE PROJEKTY:

1. E-commerce Platform (2023-2024)
Rola: Tech Lead
Stack: React, TypeScript, Redux Toolkit, Node.js
• Platforma sprzedażowa obsługująca 50,000+ użytkowników
• Implementacja real-time inventory management
• Integracja z systemami płatności (Stripe, PayU)
• Optymalizacja wydajności - 99.9% uptime

2. Banking Dashboard (2022-2023)  
Rola: Senior Frontend Developer
Stack: React, TypeScript, GraphQL, Material-UI
• Dashboard dla klientów banku z real-time danymi
• Implementacja zaawansowanych wykresów (D3.js)
• Bezpieczeństwo - implementacja 2FA
• Dostępność WCAG 2.1 AA

3. SaaS Analytics Tool (2021-2022)
Rola: Frontend Developer
Stack: Vue.js, Vuex, Chart.js, Express.js
• Narzędzie analityczne dla marketingowców
• Real-time data visualization
• Export danych do PDF/Excel
• Integracja z Google Analytics API

4. COVID-19 Tracker (2020) - Projekt Open Source
Rola: Maintainer
Stack: React, TypeScript, REST API
• Aplikacja śledząca statystyki COVID-19
• 10,000+ daily active users
• Współpraca z 15+ developerami worldwide
• GitHub: 500+ stars

DODATKOWE UMIEJĘTNOŚCI:

• Zarządzanie zespołem (5+ osób)
• Mentoring i szkolenie junior developerów  
• Code review i zapewnianie jakości kodu
• Agile/Scrum methodology
• Client communication w języku angielskim
• Technical writing i dokumentacja
• Performance optimization
• SEO basics

ZAINTERESOWANIA:

• Open Source contributing (GitHub: 50+ contributions)
• Tech blogging (Medium: 25+ artykułów)
• Konferencje IT (4Developers, React Warsaw)
• Fotografia (hobby)
• Bieganie (maraton PZU 2023)

REFERENCJE:

Dostępne na życzenie wraz z portfolio projektów.`;

  try {
    console.log(`📝 Testing with LONG CV: ${longCV.length} characters`);
    
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: longCV,
        email: 'test@premium.com',
        paid: true,
        jobPosting: 'Senior React Developer - Leading tech company seeks experienced frontend developer with React, TypeScript, team leadership skills, and experience with large-scale applications.'
      })
    });

    const data = await response.json();
    
    console.log('\n📊 LONG CV TEST RESULTS:');
    console.log('========================');
    console.log(`✅ Success: ${data.success}`);
    console.log(`📝 Original CV: ${longCV.length} chars`);
    console.log(`🤖 Optimized CV: ${data.optimizedCV?.length || 0} chars`);
    console.log(`📈 Length ratio: ${data.optimizedCV ? (data.optimizedCV.length / longCV.length * 100).toFixed(1) : 0}%`);
    
    // Check key sections
    const keyContent = [
      'REFERENCJE',
      'ZAINTERESOWANIA', 
      'PROJEKTY',
      'CERTYFIKATY',
      'UMIEJĘTNOŚCI'
    ];
    
    console.log('\n🔍 KEY SECTIONS CHECK:');
    keyContent.forEach(section => {
      const found = data.optimizedCV?.includes(section) || 
                   data.optimizedCV?.toLowerCase().includes(section.toLowerCase());
      console.log(`${found ? '✅' : '❌'} ${section}`);
    });
    
    // Check if it ends properly
    const lastChars = data.optimizedCV?.slice(-100) || '';
    console.log('\n🏁 ENDING CHECK:');
    console.log(`Last 100 chars: "${lastChars}"`);
    
    const endsWell = lastChars.includes('</') || lastChars.includes('Ref') || lastChars.includes('portfolio');
    console.log(`${endsWell ? '✅' : '❌'} CV ends properly`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testLongCV();