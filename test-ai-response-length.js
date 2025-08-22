// Test AI response length to diagnose truncation issue
const testAI = async () => {
  const testCV = `KONRAD JAKÓBCZAK
Frontend Developer z 5-letnim doświadczeniem

DOŚWIADCZENIE ZAWODOWE:
2019-2024: Senior Frontend Developer w TechCorp
- Tworzenie aplikacji React dla klientów enterprise
- Optymalizacja wydajności aplikacji webowych
- Współpraca z zespołem 8 deweloperów
- Mentoring junior deweloperów
- Wdrażanie najlepszych praktyk kodowania

2017-2019: Junior Developer w StartupXYZ  
- Rozwój interfejsów użytkownika
- Integracja z REST API
- Testowanie aplikacji
- Uczestnictwo w code review

UMIEJĘTNOŚCI TECHNICZNE:
- JavaScript, TypeScript, ES6+
- React, Vue.js, Angular
- Node.js, Express.js
- MongoDB, PostgreSQL, Redis
- Git, Docker, AWS
- Jest, Cypress, Testing Library

WYKSZTAŁCENIE:
2018: Magister Informatyki, Politechnika Warszawska
Specjalizacja: Inżynieria Oprogramowania

CERTYFIKATY:
- AWS Certified Developer Associate
- React Professional Certificate

JĘZYKI:
- Polski (natywny)  
- Angielski (C1)

PROJEKTY:
- E-commerce platform (React, Node.js)
- Real-time chat application (Socket.io)
- Data visualization dashboard (D3.js)`;

  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: testCV,
        email: 'test@premium.com',
        paid: true,
        jobPosting: 'Senior React Developer - Leading tech company seeks experienced frontend developer with React, TypeScript, and team leadership skills.'
      })
    });

    const data = await response.json();
    
    console.log('📊 AI RESPONSE ANALYSIS:');
    console.log('======================');
    console.log(`✅ Success: ${data.success}`);
    console.log(`📝 Original CV length: ${testCV.length} characters`);
    console.log(`🤖 Optimized CV length: ${data.optimizedCV?.length || 0} characters`);
    console.log(`📈 Length ratio: ${data.optimizedCV ? (data.optimizedCV.length / testCV.length * 100).toFixed(1) : 0}%`);
    console.log(`📄 Cover letter length: ${data.coverLetter?.length || 0} characters`);
    
    console.log('\n🔍 FIRST 200 CHARS OF OPTIMIZED CV:');
    console.log(data.optimizedCV?.substring(0, 200) + '...');
    
    console.log('\n🔍 LAST 200 CHARS OF OPTIMIZED CV:');
    const optCV = data.optimizedCV || '';
    console.log('...' + optCV.substring(Math.max(0, optCV.length - 200)));
    
    // Check if CV is truncated (common signs)
    const isTruncated = optCV && (
      !optCV.includes('PROJEKTY') ||
      !optCV.includes('CERTYFIKATY') ||
      optCV.length < testCV.length * 0.8
    );
    
    console.log(`\n❓ TRUNCATION DETECTED: ${isTruncated ? '🔴 YES - CV appears cut off' : '✅ NO - CV seems complete'}`);
    
    if (data.error) {
      console.log(`❌ ERROR: ${data.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAI();