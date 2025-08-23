/**
 * Mock Services for CVPerfect Development
 * Provides fake responses for external APIs during development
 */

// Mock Groq AI Response
export function mockGroqOptimization(cvText, jobPosting = '') {
  // Simulate AI optimization without actual API call
  const mockOptimizedCV = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: auto; padding: 20px; }
    h1 { color: #2c3e50; margin-bottom: 10px; }
    .contact { color: #7f8c8d; margin-bottom: 20px; }
    h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-top: 25px; }
    .job { margin-bottom: 20px; }
    .job-title { font-weight: bold; font-size: 16px; }
    .company { color: #7f8c8d; margin-bottom: 5px; }
    ul { margin-top: 5px; }
    li { margin-bottom: 3px; }
    .profile-photo { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 20px auto; display: block; }
  </style>
</head>
<body>
  <h1>John Doe - Senior Developer [OPTIMIZED BY MOCK AI]</h1>
  <div class="contact">john.doe@email.com | +48 123 456 789 | Warsaw, Poland</div>
  
  <h2>Professional Experience</h2>
  <div class="job">
    <div class="job-title">Senior Software Developer</div>
    <div class="company">TechCorp | 2020-2023</div>
    <ul>
      <li>Spearheaded development of scalable web applications serving 10,000+ daily users</li>
      <li>Led cross-functional team of 8 developers, implementing Agile methodologies that increased delivery speed by 40%</li>
      <li>Architected microservices infrastructure reducing system downtime by 95%</li>
      <li>Optimized database queries improving application performance by 60%</li>
      <li>Mentored 5 junior developers, establishing code review processes that decreased bugs by 75%</li>
    </ul>
  </div>
  
  <h2>Technical Skills</h2>
  <ul>
    <li>JavaScript (Expert, 8+ years) - React, Node.js, TypeScript</li>
    <li>Python (Advanced, 5+ years) - Django, Flask, FastAPI</li>
    <li>Cloud Platforms (AWS, 4+ years) - EC2, Lambda, RDS</li>
    <li>DevOps (Docker, Kubernetes, 3+ years)</li>
  </ul>
  
  <h2>Education</h2>
  <div>Computer Science Degree - Warsaw University of Technology (2016-2020)</div>
  
  <p><em>Original CV: ${cvText.length} characters → Optimized: ${mockOptimizedCV.length} characters</em></p>
  ${jobPosting ? '<p><em>Optimized for job posting keywords</em></p>' : ''}
</body>
</html>
  `.trim();

  return {
    success: true,
    optimizedCV: mockOptimizedCV,
    coverLetter: generateMockCoverLetter(jobPosting),
    improvements: [
      'Dodano mocne czasowniki akcji',
      'Wstawiono metryki i liczby', 
      'Poprawiono strukturę i formatowanie',
      'Ulepszono opisy stanowisk',
      'MOCK: Symulowane ulepszenia AI'
    ],
    keywordMatch: jobPosting ? 85 : 75,
    remainingUses: 999,
    photoPreserved: true,
    metadata: {
      originalLength: cvText.length,
      optimizedLength: mockOptimizedCV.length,
      improvementRate: Math.round((mockOptimizedCV.length / cvText.length - 1) * 100),
      hasPhoto: cvText.includes('<img') || cvText.includes('data:image'),
      photoPreserved: true,
      mockMode: true
    }
  };
}

// Mock Cover Letter
function generateMockCoverLetter(jobPosting) {
  return `Szanowni Państwo,

Z wielkim zainteresowaniem aplikuję na stanowisko ${jobPosting ? 'wskazane w Państwa ofercie' : 'Senior Developer'}. Moje 8-letnie doświadczenie w rozwoju aplikacji webowych, w tym zarządzanie zespołami i wdrażanie innowacyjnych rozwiązań technologicznych, idealnie odpowiada wymaganiom tej pozycji.

W poprzedniej roli w TechCorp odpowiadałem za architekturę systemów obsługujących ponad 10,000 użytkowników dziennie, co zaowocowało 40% zwiększeniem efektywności zespołu i 95% redukcją przestojów systemu. Moja pasja do mentoringu i rozwoju junior developerów skutkowała 75% spadkiem błędów w kodzie dzięki wprowadzonym procesom code review.

Jestem przekonany, że moje umiejętności techniczne połączone z doświadczeniem w zarządzaniu projektami wniosą znaczną wartość do Państwa zespołu.

Z poważaniem,
John Doe

[MOCK COVER LETTER - Generated for development testing]`;
}

// Mock Stripe Response
export function mockStripeCheckout(plan, email) {
  const sessionId = `cs_test_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    sessionId: sessionId,
    url: `http://localhost:3000/success?session_id=sess_mock_${Date.now()}`,
    mockMode: true,
    plan: plan,
    email: email
  };
}

// Mock Supabase User
export function mockSupabaseUser(email) {
  return {
    data: {
      email: email,
      plan: 'premium',
      usage_count: 0,
      usage_limit: 999,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      created_at: new Date().toISOString(),
      mockMode: true
    },
    error: null
  };
}

// Mock Authentication Result
export function mockAuthentication(email, sessionId, paid) {
  if (email && email.includes('mock')) {
    return {
      authenticated: true,
      method: 'mock_development',
      user: {
        email: email,
        plan: 'premium',
        usageCount: 0,
        usageLimit: 999,
        mockMode: true
      }
    };
  }
  
  if (sessionId && sessionId.includes('mock')) {
    return {
      authenticated: true,
      method: 'mock_session',
      user: {
        email: email || 'mock@example.com',
        plan: 'premium',
        sessionId: sessionId,
        mockMode: true
      }
    };
  }
  
  return {
    authenticated: false,
    error: 'Mock authentication failed',
    requiresPayment: true
  };
}

// Check if we're in mock mode
export function isMockMode() {
  // If MOCK_MODE is explicitly set, respect that setting
  if (process.env.MOCK_MODE === 'false') {
    return false;
  }
  
  return process.env.MOCK_MODE === 'true' || 
         process.env.GROQ_API_KEY?.includes('mock');
}

// Mock session data
export function mockSessionData(sessionId) {
  return {
    success: true,
    session: {
      sessionId: sessionId,
      email: 'mock@example.com',
      plan: 'premium',
      cvData: 'Mock CV content for testing purposes\n\nJohn Doe\nSenior Developer\n\nExperience:\n- Developer at TechCorp (2020-2023)\n- Junior Developer at StartupCo (2018-2020)\n\nSkills:\n- JavaScript, Python, React, Node.js',
      jobPosting: 'Mock job posting content',
      photo: null,
      template: 'simple',
      processed: false,
      mockMode: true,
      metadata: {
        plan: 'premium',
        email: 'mock@example.com',
        cv: 'Mock CV content...',
        job: 'Mock job posting...',
        photo: null
      }
    }
  };
}

// Development helpers
export function logMockUsage(service, data) {
  if (isMockMode()) {
    console.log(`🧪 MOCK ${service.toUpperCase()}:`, data);
  }
}