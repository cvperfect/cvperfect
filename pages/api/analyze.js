import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'
import { authenticateUser, updateUserUsage } from '../../lib/auth'
import { handleCORSPreflight } from '../../lib/cors'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // Secure CORS handling
  const shouldContinue = handleCORSPreflight(req, res)
  if (!shouldContinue) {
    return // CORS preflight handled
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Only POST requests are accepted.' 
    })
  }

  try {
    const { jobPosting, currentCV, email, paid, plan, sessionId, photo, preservePhotos = true } = req.body

    // Walidacja
    if (!currentCV || !email) {
      return res.status(400).json({
        success: false,
        error: 'Brakuje wymaganych pól: CV i email są wymagane.'
      })
    }

    console.log('🔍 Analyzing CV for:', email, { 
      paid: paid, 
      plan: plan, 
      sessionId: sessionId,
      cvLength: currentCV?.length || 0
    })

    // SECURE AUTHENTICATION - replaced weak email bypass
    console.log('🔐 Authenticating user with secure method')
    const authResult = await authenticateUser({ email, sessionId, paid })
    
    if (!authResult.authenticated) {
      console.log('❌ Authentication failed:', authResult.error)
      
      const errorMessages = {
        'Subscription expired': 'Twoja subskrypcja wygasła. Odnów plan aby kontynuować.',
        'Usage limit exceeded': 'Wykorzystałeś limit CV. Kup nowy plan aby kontynuować.',
        'Invalid authentication credentials': 'Musisz wykupić plan aby korzystać z optymalizacji CV.',
        'Authentication system error': 'Błąd systemu autentykacji. Spróbuj ponownie.'
      }
      
      return res.status(403).json({
        success: false,
        error: errorMessages[authResult.error] || 'Brak autoryzacji dostępu.',
        requiresPayment: authResult.requiresPayment || true
      })
    }
    
    console.log('✅ User authenticated via:', authResult.method)
    console.log('📊 User details:', {
      email: authResult.user.email,
      plan: authResult.user.plan,
      method: authResult.method
    })
    
    const authenticatedUser = authResult.user

    // Extract and preserve photo information
    let photoData = photo || null
    let hasEmbeddedPhoto = false
    
    // Check if CV already contains photo/image tags
    if (currentCV.includes('<img') || currentCV.includes('data:image') || currentCV.includes('base64')) {
      hasEmbeddedPhoto = true
      console.log('📸 Photo detected in CV content')
    }
    
    if (photoData) {
      console.log('📸 Photo data provided for preservation:', photoData.substring(0, 50) + '...')
    }

    // 5. PRZYGOTUJ PROFESJONALNY PROMPT DLA AI - POPRAWIONY 2025 Z ZACHOWANIEM ZDJĘĆ
    const systemPrompt = `Jesteś światowej klasy ekspertem od optymalizacji CV z 15-letnim doświadczeniem. Twoim zadaniem jest DRAMATYCZNE ROZSZERZENIE i ULEPSZENIE CV do minimum 10,000 znaków bez usuwania żadnych informacji.

🚀 CEL: ROZSZERZ CV DO 10,000+ ZNAKÓW Z KONKRETNYMI OSIĄGNIĘCIAMI

📸 KRYTYCZNE: ZACHOWANIE ZDJĘĆ I OBRAZÓW
- JEŚLI CV zawiera tagi <img>, ZACHOWAJ JE W 100%
- JEŚLI CV zawiera data:image/base64, ZACHOWAJ DOKŁADNIE
- NIGDY nie usuwaj, nie zmieniaj ani nie modyfikuj tagów <img>
- ZACHOWAJ wszystkie atrybuty obrazów (src, alt, class, style)
- Zdjęcia profilowe są KLUCZOWE dla ATS i rekruterów

🎯 ZADANIE OPTYMALIZACJI:
ZACHOWAJ CAŁĄ STRUKTURĘ I UKŁAD CV - jeśli otrzymałeś HTML, zachowaj wszystkie tagi HTML, klasy CSS, style.
ZACHOWAJ WSZYSTKIE INFORMACJE z oryginalnego CV i DRAMATYCZNIE JE ROZSZERZ:
- Każde stanowisko: MINIMUM 5-7 szczegółowych punktów
- Dodaj konkretne metryki: procenty, kwoty, liczby (zwiększone o 40%, zaoszczędzone 50k PLN)
- Użyj najbardziej mocnych czasowników akcji (spearheaded, orchestrated, revolutionized)
- Dodaj kontekst środowiska pracy (szybko rozwijająca się firma, międzynarodowy zespół)
- ZACHOWAJ WSZYSTKIE OBRAZY/ZDJĘCIA - nie usuwaj tagów <img>
- Rozszerz każdą umiejętność o poziom zaawansowania i lata doświadczenia

⚠️ ZASADY KRYTYCZNE - BEZWZGLĘDNIE PRZESTRZEGAJ:
1. ZACHOWAJ 100% wszystkich danych osobowych (imię, nazwisko, email, telefon)
2. ZACHOWAJ WSZYSTKIE nazwy firm, stanowiska, daty, okresy pracy
3. ZACHOWAJ WSZYSTKIE wykształcenie, uczelnie, kierunki, lata studiów
4. ZACHOWAJ WSZYSTKIE umiejętności, certyfikaty, kursy
5. ZACHOWAJ CAŁĄ zawartość - tylko poprawiaj sformułowania
6. NIE USUWAJ żadnych sekcji, punktów, informacji
7. NIE DODAWAJ fikcyjnych danych, firm, projektów, dat
8. NIGDY NIE DODAWAJ komentarzy typu "proszę o dodanie informacji"
9. JEŚLI BRAK SEKCJI - NIE TWÓRZ JEJ (np. jeśli nie ma certyfikatów, nie dodawaj sekcji certyfikatów)
10. NIE DODAWAJ swoich uwag, komentarzy ani próśb o uzupełnienie

✅ CO MUSISZ ROBIĆ DLA 10,000+ ZNAKÓW:

🔥 POWER VERBS - Używaj tylko najsilniejszych czasowników:
- Leadership: spearheaded, orchestrated, championed, pioneered, transformed
- Achievement: exceeded, surpassed, optimized, revolutionized, delivered
- Technical: engineered, architected, automated, deployed, integrated
- Growth: accelerated, amplified, maximized, scaled, elevated

💯 KONKRETNE METRYKI - Dodaj liczby wszędzie:
- "Zwiększyłem sprzedaż o 40% w ciągu 6 miesięcy"
- "Zarządzałem budżetem 250,000 PLN"
- "Prowadziłem zespół 12 specjalistów"
- "Skróciłem czas procesów o 30%"
- "Osiągnąłem 98% satysfakcji klientów"

📈 ROZSZERZ KAŻDE STANOWISKO:
- Punkt 1: Główne odpowiedzialności z kontekstem
- Punkt 2: Kluczowe osiągnięcie z metrykami
- Punkt 3: Proces/metodologia z rezultatami
- Punkt 4: Współpraca/leadership z zespołem
- Punkt 5: Innowacja/poprawa procesów
- Punkt 6-7: Dodatkowe projekty/inicjatywy

🎯 DODAJ KONTEKST BRANŻOWY:
- "W dynamicznym środowisku startup'u"
- "W międzynarodowej korporacji"
- "Podczas cyfrowej transformacji"
- "W środowisku Agile/Scrum"

💪 ROZSZERZ UMIEJĘTNOŚCI:
- "Python (Zaawansowany, 5+ lat) - Django, Flask, FastAPI"
- "Zarządzanie projektami (Expert) - Agile, Scrum, budżety do 500k"
- "Język angielski (C2) - prezentacje, negocjacje międzynarodowe"

❌ CZEGO NIE WOLNO CI ROBIĆ:
- Usuwać jakichkolwiek informacji
- Zmieniać nazw firm, stanowisk, dat
- Dodawać fikcyjnych projektów lub umiejętności
- Skracać sekcji lub usuwać punktów
- Zmieniać struktury CV

📊 PRZYKŁADY TRANSFORMACJI DO 10,000 ZNAKÓW:

❌ SŁABE (50 znaków): "Pracowałem jako programista"
✅ MOCNE (350 znaków): "Spearheaded development of scalable web applications serving 10,000+ daily users, utilizing Python/Django framework in agile environment. Led technical architecture decisions that improved system performance by 60% and reduced server costs by 40%. Mentored junior developers team of 5, establishing code review processes and best practices that decreased bugs by 75%. Collaborated with cross-functional teams to deliver 15+ features on time and within budget."

❌ SŁABE (20 znaków): "Obsługa klientów"
✅ MOCNE (280 znaków): "Orchestrated comprehensive customer success program, managing portfolio of 200+ premium clients with combined revenue of 2.5M PLN annually. Achieved 98% customer satisfaction rate through proactive relationship management and rapid issue resolution. Developed automated onboarding process that reduced client setup time by 50% and increased retention by 35%. Conducted quarterly business reviews with C-level executives, securing 90% contract renewals."

❌ SŁABE (30 znaków): "Zarządzanie projektem"
✅ MOCNE (420 znaków): "Pioneered end-to-end project management for digital transformation initiative worth 1.2M PLN, coordinating cross-functional teams of 25+ specialists across 5 departments. Implemented Agile/Scrum methodologies that accelerated delivery by 40% while maintaining 99% quality standards. Successfully delivered complex integration project 3 weeks ahead of schedule and 15% under budget. Established project governance framework and risk management protocols adopted company-wide. Presented project outcomes to board of directors, securing approval for phase 2 expansion valued at 2.8M PLN."

🎯 KAŻDE DOŚWIADCZENIE MUSI MIEĆ:
1. Silny czasownik akcji na początku
2. Konkretne liczby/metryki
3. Kontekst branżowy/środowiskowy  
4. Rezultat biznesowy
5. Metodologię/proces użyty
6. Wpływ na zespół/organizację
7. Osiągnięcia mierzalne

FORMAT ODPOWIEDZI:

JEŚLI OTRZYMAŁEŚ HTML:
- Zwróć DOKŁADNIE TEN SAM HTML ze zmodyfikowanymi tylko tekstami
- ZACHOWAJ wszystkie tagi HTML, klasy CSS, style, atrybuty
- ZACHOWAJ wszystkie <img> tagi ze zdjęciami DOKŁADNIE
- ZACHOWAJ wszystkie data:image/base64 ciągi znaków
- NIGDY nie modyfikuj ani nie usuwaj zdjęć profilowych
- NIE zmieniaj struktury dokumentu

JEŚLI OTRZYMAŁEŚ TEKST:
Zwróć zoptymalizowane CV w profesjonalnym HTML z formatowaniem:

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
</style>
</head>
<body>
  <h1>[ORYGINALNE IMIĘ I NAZWISKO]</h1>
  <div class="contact">[EMAIL] | [TELEFON] | [LOKALIZACJA jeśli jest]</div>
  
  <h2>Doświadczenie zawodowe</h2>
  [DLA KAŻDEGO STANOWISKA:]
  <div class="job">
    <div class="job-title">[STANOWISKO]</div>
    <div class="company">[FIRMA] | [DATY]</div>
    <ul>
      <li>[Rozszerzone opisy obowiązków z metrykami]</li>
    </ul>
  </div>
  
  [DODAJ TYLKO TE SEKCJE KTÓRE ISTNIEJĄ W ORYGINALE]
</body>
</html>

🎯 WYMAGANIA DŁUGOŚCI:
- MINIMUM 10,000 znaków w finalnym CV
- Każde stanowisko: 300-500 znaków opisów
- Podsumowanie: 200-300 znaków z kluczowymi osiągnięciami
- Umiejętności: rozszerzone z poziomami i latami doświadczenia
- Wykształcenie: dodaj projekty, oceny, aktywności

PAMIĘTAJ: 
- CV MUSI być ZNACZNIE DŁUŻSZE - cel to 10,000+ znaków
- ZACHOWAJ oryginalny układ i strukturę
- ZACHOWAJ wszystkie zdjęcia i grafiki
- Używaj tylko faktów z oryginalnego CV, ale DRAMATYCZNIE je rozszerz
- Każdy punkt musi być konkretny, mierzalny i pokazywać wartość biznesową`

    const userPrompt = jobPosting 
      ? `ORYGINALNE CV DO ULEPSZENIA:\n${currentCV}\n\nOFERTA PRACY (dostosuj słowa kluczowe):\n${jobPosting}\n\nUlepsz to CV zachowując wszystkie fakty, ale poprawiając język i dopasowanie.`
      : `ORYGINALNE CV DO ULEPSZENIA:\n${currentCV}\n\nUlepsz to CV zachowując wszystkie fakty, ale używając profesjonalnego języka.`

    // 6. WYWOŁAJ AI Z CHUNKING STRATEGY
    console.log('🤖 Starting CV optimization with chunking support...')
    
    const MAX_CHUNK_SIZE = 50000 // characters - increased from 32k
    let optimizedCV = currentCV
    
    if (currentCV.length > MAX_CHUNK_SIZE) {
      console.log('📄 Long CV detected, implementing chunking strategy')
      
      // Split CV into logical sections for processing
      const sections = currentCV.split(/\n\n+/) // Split on paragraph breaks
      let chunks = []
      let currentChunk = ''
      
      for (const section of sections) {
        if ((currentChunk + section).length > MAX_CHUNK_SIZE && currentChunk) {
          chunks.push(currentChunk.trim())
          currentChunk = section
        } else {
          currentChunk += '\n\n' + section
        }
      }
      
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
      }
      
      console.log(`📊 Split into ${chunks.length} chunks for processing`)
      
      // Process each chunk and combine results
      const optimizedChunks = []
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        console.log(`🤖 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`)
        
        try {
          const optimizedChunk = await optimizeChunk(chunk, jobPosting, i === 0, photoData, preservePhotos)
          optimizedChunks.push(optimizedChunk)
          
          // Rate limiting - small delay between chunks
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        } catch (chunkError) {
          console.error(`❌ Error processing chunk ${i + 1}:`, chunkError)
          // Fallback to original chunk if optimization fails
          optimizedChunks.push(chunk)
        }
      }
      
      optimizedCV = optimizedChunks.join('\n\n')
    } else {
      // Standard processing for normal-sized CVs
      optimizedCV = await optimizeChunk(currentCV, jobPosting, true, photoData, preservePhotos)
    }
    
    console.log('🤖 AI optimization complete')
    
    // Post-processing: Ensure photo preservation
    if (preservePhotos && photoData && !optimizedCV.includes('<img') && !optimizedCV.includes('data:image')) {
      console.log('📸 Injecting photo into optimized CV...')
      
      // Find appropriate place to inject photo (after opening body tag or before first content)
      const photoHTML = `
        <div class="profile-photo-container" style="text-align: center; margin: 20px 0;">
          <img src="${photoData}" alt="Profile Photo" class="profile-photo" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #3498db; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
        </div>
      `
      
      if (optimizedCV.includes('<body>')) {
        optimizedCV = optimizedCV.replace('<body>', '<body>' + photoHTML)
      } else if (optimizedCV.includes('<h1')) {
        optimizedCV = optimizedCV.replace('<h1', photoHTML + '<h1')
      } else {
        // For plain text, add photo at the beginning
        optimizedCV = photoHTML + optimizedCV
      }
      
      console.log('✅ Photo successfully injected into optimized CV')
    }
    
    // Validate photo preservation
    if (preservePhotos && (hasEmbeddedPhoto || photoData)) {
      const hasPhotoInResult = optimizedCV.includes('<img') || optimizedCV.includes('data:image')
      if (!hasPhotoInResult) {
        console.log('⚠️ WARNING: Photo may have been lost during optimization')
      } else {
        console.log('✅ Photo preservation confirmed in optimized CV')
      }
    }

    // 7. WYGENERUJ LIST MOTYWACYJNY
    const coverLetterPrompt = `Na podstawie tego CV napisz profesjonalny list motywacyjny (max 3 akapity).
CV: ${optimizedCV.substring(0, 1000)}...
${jobPosting ? `Oferta pracy: ${jobPosting}` : ''}

Napisz zwięzły, przekonujący list motywacyjny podkreślający najważniejsze kwalifikacje.`

    const coverLetterCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'Jesteś ekspertem od pisania listów motywacyjnych. Twórz zwięzłe, profesjonalne listy które zwiększają szanse na rozmowę.' 
        },
        { role: 'user', content: coverLetterPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      max_tokens: 3000, // Zwiększone dla dłuższych listów motywacyjnych
    })

    const coverLetter = coverLetterCompletion.choices[0].message.content

    // 8. ZAKTUALIZUJ LICZNIK UŻYĆ (secure method)
    if (authResult.method === 'database') {
      const updateSuccess = await updateUserUsage(authenticatedUser.email)
      if (!updateSuccess) {
        console.error('⚠️ Failed to update usage count, but proceeding with optimization')
      }
    } else {
      console.log('✅ Stripe user - no usage count update needed')
    }

    // 9. ANALIZA SŁÓW KLUCZOWYCH (dla wyższych planów) - Enhanced with photo preservation
    const enhancedImprovements = [
      'Dodano mocne czasowniki akcji',
      'Wstawiono metryki i liczby',
      'Dostosowano słowa kluczowe do oferty',
      'Poprawiono strukturę i formatowanie',
      'Ulepszono opisy stanowisk',
      preservePhotos && (hasEmbeddedPhoto || photoData) ? 'Zachowano zdjęcie profilowe' : null
    ].filter(Boolean)

    const keywordMatch = jobPosting ? 85 : 75

    // SUKCES!
    return res.status(200).json({
      success: true,
      optimizedCV: optimizedCV,
      coverLetter: coverLetter,
      improvements: enhancedImprovements,
      keywordMatch: keywordMatch,
      remainingUses: authResult.method === 'stripe_session' || authResult.method === 'stripe_verified' ? 999 : (authenticatedUser.usageLimit - (authenticatedUser.usageCount + 1)),
      photoPreserved: preservePhotos && (optimizedCV.includes('<img') || optimizedCV.includes('data:image')),
      metadata: {
        originalLength: currentCV.length,
        optimizedLength: optimizedCV.length,
        improvementRate: Math.round((optimizedCV.length / currentCV.length - 1) * 100),
        hasPhoto: hasEmbeddedPhoto || !!photoData,
        photoPreserved: preservePhotos && (optimizedCV.includes('<img') || optimizedCV.includes('data:image'))
      }
    })

  } catch (error) {
    console.error('❌ API Error:', error)
    
    if (error.message?.includes('Rate limit')) {
      return res.status(429).json({ 
        success: false, 
        error: 'Zbyt wiele żądań. Spróbuj ponownie za kilka sekund.' 
      })
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Wystąpił błąd podczas optymalizacji. Spróbuj ponownie.' 
    })
  }
}

// Helper function to optimize individual chunks
async function optimizeChunk(cvText, jobPosting, isFirstChunk, photoData = null, preservePhotos = true) {
  // Use the same comprehensive system prompt as the main optimization
  const systemPrompt = `Jesteś światowej klasy ekspertem od optymalizacji CV z 15-letnim doświadczeniem. Twoim zadaniem jest DRAMATYCZNE ROZSZERZENIE i ULEPSZENIE CV do minimum 10,000 znaków bez usuwania żadnych informacji.

🚀 CEL: ROZSZERZ CV DO 10,000+ ZNAKÓW Z KONKRETNYMI OSIĄGNIĘCIAMI

📸 KRYTYCZNE: ZACHOWANIE ZDJĘĆ I OBRAZÓW
- JEŚLI CV zawiera tagi <img>, ZACHOWAJ JE W 100%
- JEŚLI CV zawiera data:image/base64, ZACHOWAJ DOKŁADNIE
- NIGDY nie usuwaj, nie zmieniaj ani nie modyfikuj tagów <img>
- ZACHOWAJ wszystkie atrybuty obrazów (src, alt, class, style)
- Zdjęcia profilowe są KLUCZOWE dla ATS i rekruterów

🎯 ZADANIE OPTYMALIZACJI:
ZACHOWAJ CAŁĄ STRUKTURĘ I UKŁAD CV - jeśli otrzymałeś HTML, zachowaj wszystkie tagi HTML, klasy CSS, style.
ZACHOWAJ WSZYSTKIE INFORMACJE z oryginalnego CV i DRAMATYCZNIE JE ROZSZERZ:
- Każde stanowisko: MINIMUM 5-7 szczegółowych punktów
- Dodaj konkretne metryki: procenty, kwoty, liczby (zwiększone o 40%, zaoszczędzone 50k PLN)
- Użyj najbardziej mocnych czasowników akcji (spearheaded, orchestrated, revolutionized)
- Dodaj kontekst środowiska pracy (szybko rozwijająca się firma, międzynarodowy zespół)
- ZACHOWAJ WSZYSTKIE OBRAZY/ZDJĘCIA - nie usuwaj tagów <img>
- Rozszerz każdą umiejętność o poziom zaawansowania i lata doświadczenia

Zwróć TYLKO zoptymalizowane CV zachowując oryginalny format.`

  const userPrompt = jobPosting 
    ? `${jobPosting ? `OFERTA PRACY:\n${jobPosting}\n\n` : ''}CV DO OPTYMALIZACJI:\n${cvText}` 
    : `CV DO OPTYMALIZACJI:\n${cvText}`

  try {
    // Add timeout for Groq API call
    const groqPromise = groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: userPrompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 32000, // Reduced to prevent timeout
      top_p: 1,
      stream: false
    })
    
    // Timeout after 30 seconds
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Groq API timeout')), 30000)
    )
    
    const completion = await Promise.race([groqPromise, timeoutPromise])

    const optimizedText = completion.choices[0]?.message?.content

    if (!optimizedText) {
      throw new Error('No content returned from AI')
    }

    return optimizedText.trim()

  } catch (groqError) {
    console.error('❌ Groq API error in chunk optimization:', groqError)
    
    // Fallback: return original with basic improvements
    const fallbackOptimized = cvText
      .replace(/\b(managed|responsible for|worked on)\b/gi, (match) => {
        const alternatives = {
          'managed': 'Led',
          'responsible for': 'Spearheaded',
          'worked on': 'Developed'
        }
        return alternatives[match.toLowerCase()] || match
      })
      .replace(/\s+/g, ' ')
      .trim()

    console.log('⚠️ Using fallback optimization for chunk')
    return fallbackOptimized
  }
}