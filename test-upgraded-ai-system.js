// Test upgraded AI system with 2025 CV optimization techniques
const testUpgradedAI = async () => {
  console.log('🧪 TESTING UPGRADED AI SYSTEM - CV OPTIMIZATION 2025\n');
  
  // Test Case 1: CV with photo (should preserve it)
  const cvWithPhoto = `<img src="photo.jpg" style="width:100px;height:120px;float:right;">
ANNA KOWALSKA
Marketing Specialist

Dane kontaktowe:
Tel: +48 123 456 789
Email: anna@example.com

Doświadczenie:
2020-2024: Marketing Specialist w LocalCorp
- Zarządzanie kampaniami marketingowymi
- Obsługa mediów społecznościowych
- Współpraca z klientami

Umiejętności:
- Adobe Creative Suite
- Social Media Marketing
- Google Analytics`;

  // Test Case 2: Basic CV needing ATS optimization
  const basicCV = `TOMASZ NOWAK
Programista

Kontakt: tomasz@example.com, 555-123-456

Praca:
2019-2024: Developer w TechFirm
Robiłem aplikacje webowe i zajmowałem się bazami danych

Umiejętności: 
JavaScript, React, PHP, MySQL

Wykształcenie:
2018: Informatyka, Politechnika`;

  // Test Case 3: CV with job posting for keyword matching
  const seniorCV = `MARCIN WIŚNIEWSKI
Senior Developer

Kontakt: marcin.wisniewski@email.com

Doświadczenie zawodowe:
2018-2024: Senior Software Engineer w GlobalTech
Odpowiedzialny za rozwój aplikacji enterprise w React i Node.js
Zarządzałem zespołem 3 programistów junior

Technologie:
React, Node.js, TypeScript, PostgreSQL, AWS

Wykształcenie:
2017: Inżynieria Oprogramowania, AGH`;

  const jobPosting = `Senior React Developer
Poszukujemy doświadczonego Senior React Developer z minimum 5-letnim doświadczeniem. 
Wymagane: React, TypeScript, Node.js, team leadership, Agile/Scrum.
Preferowane: AWS, PostgreSQL, CI/CD, mentoring experience.`;

  const testCases = [
    {
      name: 'CV with Photo (Preservation Test)',
      cv: cvWithPhoto,
      jobPosting: null,
      expectedChecks: ['img src', 'photo.jpg', 'style=', 'Marketing']
    },
    {
      name: 'Basic CV (ATS Optimization)',
      cv: basicCV,
      jobPosting: null,
      expectedChecks: ['Profil Zawodowy', 'Doświadczenie Zawodowe', 'Frontend Developer', 'aplikacji webowych']
    },
    {
      name: 'Senior CV (Keyword Matching)',
      cv: seniorCV,
      jobPosting: jobPosting,
      expectedChecks: ['Senior React Developer', 'team leadership', 'mentoring', 'Agile']
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n🧪 TEST ${i + 1}: ${testCase.name}`);
    console.log('=' + '='.repeat(testCase.name.length + 10));
    
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCV: testCase.cv,
          jobPosting: testCase.jobPosting,
          email: 'test@premium.com',
          paid: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ API Response: SUCCESS');
        console.log(`📝 Original length: ${testCase.cv.length} chars`);
        console.log(`🤖 Optimized length: ${data.optimizedCV?.length || 0} chars`);
        console.log(`📈 Growth: ${data.optimizedCV ? ((data.optimizedCV.length / testCase.cv.length - 1) * 100).toFixed(1) : 0}%`);
        
        // Check expected content
        console.log('\n🔍 CONTENT CHECKS:');
        testCase.expectedChecks.forEach(check => {
          const found = data.optimizedCV?.includes(check);
          console.log(`${found ? '✅' : '❌'} Contains: "${check}"`);
        });
        
        // Show first 300 characters
        console.log('\n📄 PREVIEW (first 300 chars):');
        console.log(data.optimizedCV?.substring(0, 300) + '...');
        
        // Check for ATS-friendly structure
        const hasStandardSections = [
          'Profil Zawodowy',
          'Doświadczenie Zawodowe', 
          'Umiejętności',
          'Wykształcenie'
        ].some(section => data.optimizedCV?.includes(section));
        
        console.log(`\n📊 ATS Structure: ${hasStandardSections ? '✅ Standard sections found' : '❌ Missing standard sections'}`);
        
      } else {
        console.log('❌ API Response: FAILED');
        console.log(`Error: ${data.error}`);
      }
      
    } catch (error) {
      console.log('❌ Test failed with error:', error.message);
    }
    
    console.log('\n' + '-'.repeat(60));
  }
  
  console.log('\n🎯 SUMMARY: Upgraded AI System Test Complete');
  console.log('Key improvements tested:');
  console.log('• Photo preservation');
  console.log('• ATS-friendly structure'); 
  console.log('• Keyword optimization');
  console.log('• Results-oriented content');
  console.log('• Professional terminology');
};

testUpgradedAI();