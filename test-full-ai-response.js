// Test to see FULL AI response and check what's happening
const testFullAI = async () => {
  const testCV = `KONRAD JAKÓBCZAK
Frontend Developer

DOŚWIADCZENIE:
2019-2024: Senior Frontend Developer w TechCorp
- Tworzenie aplikacji React
- Optymalizacja wydajności

UMIEJĘTNOŚCI:
- JavaScript, TypeScript
- React, Vue.js
- Node.js

WYKSZTAŁCENIE:
2018: Informatyka, Politechnika Warszawska

CERTYFIKATY:
- AWS Certified Developer

PROJEKTY:
- E-commerce platform
- Chat application`;

  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: testCV,
        email: 'test@premium.com',
        paid: true
      })
    });

    const data = await response.json();
    
    console.log('🔍 FULL OPTIMIZED CV:');
    console.log('====================');
    console.log(data.optimizedCV);
    console.log('\n📊 STATISTICS:');
    console.log(`Original: ${testCV.length} chars`);
    console.log(`Optimized: ${data.optimizedCV?.length} chars`);
    
    // Check what sections are present
    const sections = {
      'PROJEKTY': data.optimizedCV?.includes('PROJEKTY') || data.optimizedCV?.includes('Projekty'),
      'CERTYFIKATY': data.optimizedCV?.includes('CERTYFIKATY') || data.optimizedCV?.includes('Certyfikaty'),
      'UMIEJĘTNOŚCI': data.optimizedCV?.includes('UMIEJĘTNOŚCI') || data.optimizedCV?.includes('Umiejętności'),
      'DOŚWIADCZENIE': data.optimizedCV?.includes('DOŚWIADCZENIE') || data.optimizedCV?.includes('Doświadczenie')
    };
    
    console.log('\n📋 SECTIONS FOUND:');
    Object.entries(sections).forEach(([section, found]) => {
      console.log(`${found ? '✅' : '❌'} ${section}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testFullAI();