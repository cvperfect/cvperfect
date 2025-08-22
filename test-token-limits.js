// Test to find actual token limits for llama-3.1-8b-instant
const testTokenLimits = async () => {
  console.log('🔍 Testing token limits for llama-3.1-8b-instant...\n');
  
  const testCases = [
    { tokens: 8000, description: 'Current setting' },
    { tokens: 12000, description: 'Moderate increase' },
    { tokens: 16000, description: 'High increase' }, 
    { tokens: 20000, description: 'Very high increase' },
    { tokens: 32000, description: 'Maximum attempt' }
  ];
  
  const shortCV = "JOHN DOE\nSoftware Developer\n\nExperience:\n- 5 years coding\n- React specialist\n\nSkills:\n- JavaScript\n- Python";
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing ${testCase.tokens} tokens (${testCase.description})...`);
      
      const response = await fetch('http://localhost:3000/api/demo-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvText: shortCV,
          language: 'pl',
          maxTokens: testCase.tokens // We'll need to modify the endpoint to accept this
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${testCase.tokens} tokens: SUCCESS`);
        console.log(`   Response length: ${data.optimizedCV?.length || 0} characters\n`);
      } else {
        console.log(`❌ ${testCase.tokens} tokens: FAILED - ${data.error}\n`);
        break; // Stop testing higher limits if this fails
      }
      
    } catch (error) {
      console.log(`❌ ${testCase.tokens} tokens: ERROR - ${error.message}\n`);
      break;
    }
  }
};

// Also test different models if available
const testDifferentModels = () => {
  console.log('\n📋 MODEL COMPARISON:\n');
  
  const models = [
    {
      name: 'llama-3.1-8b-instant',
      contextLimit: 'Unknown (testing needed)',
      speed: '⚡⚡⚡ Very Fast',
      cost: '💰 Very Cheap', 
      quality: '🎯 Good',
      pros: ['Fastest response', 'Cheapest', 'Current working model'],
      cons: ['Unknown max context', 'May have token limits']
    },
    {
      name: 'mixtral-8x7b-32768',
      contextLimit: '32,768 tokens',
      speed: '⚡⚡ Fast',
      cost: '💰💰 Moderate',
      quality: '🎯🎯 Very Good', 
      pros: ['32k context window', 'High quality', 'Proven for long content'],
      cons: ['More expensive', 'Slightly slower']
    },
    {
      name: 'llama-3.1-70b-versatile',
      contextLimit: '131,072 tokens', 
      speed: '⚡ Slower',
      cost: '💰💰💰 Expensive',
      quality: '🎯🎯🎯 Excellent',
      pros: ['Huge context window', 'Best quality', 'Handles very long content'],
      cons: ['Most expensive', 'Slowest response', 'May be overkill']
    }
  ];
  
  models.forEach(model => {
    console.log(`🤖 ${model.name}`);
    console.log(`   Context: ${model.contextLimit}`);
    console.log(`   Speed: ${model.speed}`);
    console.log(`   Cost: ${model.cost}`);
    console.log(`   Quality: ${model.quality}`);
    console.log(`   ✅ Pros: ${model.pros.join(', ')}`);
    console.log(`   ❌ Cons: ${model.cons.join(', ')}\n`);
  });
};

console.log('🧪 TOKEN LIMIT ANALYSIS FOR CVPERFECT\n');
console.log('====================================\n');

testDifferentModels();
testTokenLimits();