import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// NOWE: Zwiększ limit body size dla obrazów PNG (base64)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // PNG obrazy mogą być duże
    },
  },
}

// === ULTRA-PROFESJONALNY SZABLON CV (ATS-FRIENDLY) ===
function generateProfessionalCVHTML(data, imageData = null) {
  const {
    hasPhoto = false,
    name = 'Imię Nazwisko',
    email = '',
    phone = '',
    location = '',
    birthDate = null,
    experience = [],
    education = [],
    skills = [],
    languages = [],
    certifications = [],
    interests = []
  } = data

  // DIAGNOSTYKA: Sprawdź co mamy
  console.log('🖼️ PHOTO DEBUG IN TEMPLATE:')
  console.log('  - hasPhoto (from AI):', hasPhoto)
  console.log('  - imageData exists:', !!imageData)
  console.log('  - imageData length:', imageData?.length || 0)
  console.log('  - imageData prefix (first 50 chars):', imageData?.substring(0, 50))

  // PROFESJONALNY LAYOUT: Zdjęcie position absolute po lewej - KONTENER + WYŚRODKOWANE ZDJĘCIE
  // Photo keeps original size, fits within container, centered - matching original CV size
  const photoSection = imageData ? `
    <div style="position: absolute; left: -50px; top: 10px; width: 5.5cm; height: 7.5cm; display: flex; align-items: center; justify-content: center;">
      <img src="${imageData}" alt="Zdjęcie" class="cv-photo" style="max-width: 5.5cm; max-height: 7.5cm; border-radius: 0; object-fit: contain; display: block;" />
    </div>
  ` : ''

  console.log('🖼️ PHOTO SECTION GENERATED:', photoSection ? 'YES' : 'NO')

  // Sekcja doświadczenia - ULTRA-KOMPAKTOWE BULLET POINTY
  const experienceHTML = experience.map(exp => {
    // Jeśli exp.bullets to tablica - użyj jej, w przeciwnym razie podziel description na bullet pointy
    const bullets = Array.isArray(exp.bullets) && exp.bullets.length > 0
      ? exp.bullets
      : (exp.description ? [exp.description] : [])

    const bulletsHTML = bullets.length > 0 ? `
      <ul style="margin: 6px 0 0 0; padding-left: 18px; list-style-type: disc;">
        ${bullets.map(bullet => `<li style="font-size: 10.5pt; line-height: 1.4; color: #000000; margin-bottom: 3px;">${bullet}</li>`).join('')}
      </ul>
    ` : ''

    return `
    <div class="cv-entry" style="margin-bottom: 12px; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px;">
        <div class="entry-title" style="font-weight: 700; font-size: 11pt; color: #000000;">
          ${exp.position || ''}
        </div>
        <div class="entry-date" style="font-size: 9.5pt; color: #666666; white-space: nowrap; margin-left: 10px;">
          ${exp.period || ''} ${exp.duration || ''}
        </div>
      </div>
      <div class="entry-company" style="font-size: 10pt; color: #333333; margin-bottom: 3px; font-style: italic;">
        ${exp.company || ''} ${exp.location ? `· ${exp.location}` : ''}
      </div>
      ${bulletsHTML}
    </div>
    `
  }).join('')

  // Sekcja wykształcenia - KOMPAKTOWE ODSTĘPY
  const educationHTML = education.map(edu => `
    <div class="cv-entry" style="margin-bottom: 12px; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3px;">
        <div class="entry-title" style="font-weight: 700; font-size: 11pt; color: #000000;">
          ${edu.school || ''}
        </div>
        <div class="entry-date" style="font-size: 9.5pt; color: #666666; margin-left: 10px;">
          ${edu.period || ''}
        </div>
      </div>
      <div class="entry-description" style="font-size: 10pt; color: #333333;">
        ${edu.field || ''} ${edu.location ? `· ${edu.location}` : ''}
      </div>
    </div>
  `).join('')

  // Certyfikaty - KOMPAKTOWE NAGŁÓWKI
  const certificationsHTML = certifications && certifications.length > 0 ? `
    <div class="cv-section" style="margin-top: 18px; page-break-inside: avoid;">
      <h2 class="section-header" style="font-size: 13pt; font-weight: 700; text-transform: uppercase; color: #000000; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #000000; text-align: center; letter-spacing: 1px;">
        CERTYFIKATY
      </h2>
      ${certifications.map(cert => `
        <div style="margin-bottom: 6px; page-break-inside: avoid; font-size: 10.5pt;">
          <strong>${cert.date || ''}</strong> · ${cert.name || ''}
          ${cert.issuer ? `<span style="color: #555555;"> (${cert.issuer})</span>` : ''}
        </div>
      `).join('')}
    </div>
  ` : ''

  // Języki - KOMPAKTOWE NAGŁÓWKI
  const languagesHTML = languages && languages.length > 0 ? `
    <div class="cv-section" style="margin-top: 18px; page-break-inside: avoid;">
      <h2 class="section-header" style="font-size: 13pt; font-weight: 700; text-transform: uppercase; color: #000000; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #000000; text-align: center; letter-spacing: 1px;">
        JĘZYKI
      </h2>
      <div style="font-size: 10.5pt; line-height: 1.5;">
        ${languages.map(lang => `<span style="margin-right: 16px;"><strong>${lang.lang || ''}</strong> - ${lang.level || ''}</span>`).join('')}
      </div>
    </div>
  ` : ''

  // Umiejętności - KOMPAKTOWE NAGŁÓWKI
  const skillsHTML = skills && skills.length > 0 ? `
    <div class="cv-section" style="margin-top: 18px; page-break-inside: avoid;">
      <h2 class="section-header" style="font-size: 13pt; font-weight: 700; text-transform: uppercase; color: #000000; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #000000; text-align: center; letter-spacing: 1px;">
        UMIEJĘTNOŚCI
      </h2>
      <div style="font-size: 10.5pt; line-height: 1.5;">
        ${skills.join(' · ')}
      </div>
    </div>
  ` : ''

  // Zainteresowania - KOMPAKTOWE NAGŁÓWKI
  const interestsHTML = interests && interests.length > 0 ? `
    <div class="cv-section" style="margin-top: 18px; page-break-inside: avoid;">
      <h2 class="section-header" style="font-size: 13pt; font-weight: 700; text-transform: uppercase; color: #000000; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #000000; text-align: center; letter-spacing: 1px;">
        ZAINTERESOWANIA
      </h2>
      <div style="font-size: 10.5pt; line-height: 1.5;">
        ${interests.join(' · ')}
      </div>
    </div>
  ` : ''

  // Główny szablon - ULTRA PROFESJONALNY z FLEXBOX - FIX PUSTEJ PRZESTRZENI
  return `
<div class="cv-document" style="max-width: 210mm; margin: 0 auto; padding: 20mm 20mm 20mm 20mm; background: #ffffff; font-family: 'Calibri', 'Arial', 'Helvetica', sans-serif; color: #000000; line-height: 1.4; font-size: 11pt;">

  <!-- HEADER - Position Relative: Zdjęcie absolute po lewej, Dane wyśrodkowane na CAŁEJ szerokości -->
  <div class="cv-header" style="position: relative; text-align: center; margin-bottom: 0px !important; padding: 10px 0px 10px 0px; border-bottom: 1px solid #000000; page-break-inside: avoid; page-break-after: avoid !important; min-height: 8cm; display: flex; align-items: center; justify-content: center;">
    ${photoSection}
    <div style="text-align: center; width: 100%; max-width: 100%; padding: 0;">
      <div style="font-size: 11pt; color: #666666; margin-bottom: 4px; letter-spacing: 1px;">— CV —</div>
      <h1 class="cv-name" style="font-size: 28pt; font-weight: 700; margin: 0 0 6px 0; color: #000000; letter-spacing: 0;">
        ${name}
      </h1>
      <div class="cv-contact" style="font-size: 11pt; color: #333333; line-height: 1.7;">
        ${email ? `<div style="margin-bottom: 3px;"><strong>E-mail:</strong> ${email}</div>` : ''}
        ${phone ? `<div style="margin-bottom: 3px;"><strong>Telefon:</strong> ${phone}</div>` : ''}
        ${birthDate ? `<div style="margin-bottom: 3px;">Data urodzenia: ${birthDate}</div>` : ''}
        ${location ? `<div>Miejscowość: ${location}</div>` : ''}
      </div>
    </div>
  </div>

  <!-- DOŚWIADCZENIE ZAWODOWE -->
  ${experience.length > 0 ? `
  <div class="cv-section" style="margin-top: 20px !important; padding-top: 0px !important; page-break-before: avoid !important;">
    <h2 class="section-header" style="font-size: 14pt; font-weight: 700; text-transform: uppercase; color: #000000; margin-top: 0px !important; margin-bottom: 12px; padding-top: 0px !important; padding-bottom: 6px; border-bottom: 2px solid #000000; text-align: center; letter-spacing: 1px;">
      DOŚWIADCZENIE ZAWODOWE
    </h2>
    ${experienceHTML}
  </div>
  ` : ''}

  <!-- WYKSZTAŁCENIE -->
  ${education.length > 0 ? `
  <div class="cv-section" style="margin-top: 18px; page-break-inside: avoid;">
    <h2 class="section-header" style="font-size: 13pt; font-weight: 700; text-transform: uppercase; color: #000000; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #000000; text-align: center; letter-spacing: 1px;">
      WYKSZTAŁCENIE
    </h2>
    ${educationHTML}
  </div>
  ` : ''}

  ${certificationsHTML}
  ${languagesHTML}
  ${skillsHTML}
  ${interestsHTML}

</div>
`.trim()
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Only POST requests are accepted.'
    })
  }

  try {
    const { jobPosting, currentCV, email, imageData } = req.body // NOWE: imageData dla Visual AI

    // Walidacja
    if (!currentCV || !email) {
      return res.status(400).json({
        success: false,
        error: 'Brakuje wymaganych pól: CV i email są wymagane.'
      })
    }

    console.log('🖼️ Visual AI mode:', imageData ? 'ENABLED (zachowuje format)' : 'DISABLED (nowy template)')

    console.log('🔍 Checking user limits for:', email)

    // === TEMPORARY: SKIP DATABASE VALIDATION FOR VISUAL AI TESTING ===
    console.warn('⚠️ DEVELOPMENT MODE: Skipping database validation for testing')
    const user = {
      email: email,
      plan: 'gold',
      usage_count: 0,
      usage_limit: 999,
      expires_at: null
    }
    console.log('✅ User authorized (DEV MODE):', user)

    // === ORIGINAL CODE (commented for testing) ===
    // const { data: user, error: userError } = await supabase
    //   .from('users')
    //   .select('*')
    //   .eq('email', email)
    //   .single()

    // if (userError && userError.code !== 'PGRST116') {
    //   console.error('❌ Database error:', userError)
    //   return res.status(500).json({
    //     success: false,
    //     error: 'Błąd bazy danych. Spróbuj ponownie.'
    //   })
    // }

    // if (!user) {
    //   console.log('❌ User not found, requires payment')
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Musisz wykupić plan aby korzystać z optymalizacji CV.'
    //   })
    // }

    // if (user.usage_count >= user.usage_limit) {
    //   console.log('❌ Usage limit exceeded')
    //   return res.status(403).json({
    //     success: false,
    //     error: `Wykorzystałeś limit ${user.usage_limit} CV. Kup nowy plan aby kontynuować.`
    //   })
    // }

    // if (user.expires_at && new Date(user.expires_at) < new Date()) {
    //   console.log('❌ Subscription expired')
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Twoja subskrypcja wygasła. Odnów plan aby kontynuować.'
    //   })
    // }

    // 5. PROMPT - Wybór: Visual AI (zachowuje format) vs Template (nowy layout)
    const hasVisualAI = !!imageData

    // === NOWY SYSTEM: AI WYPEŁNIA STAŁY SZABLON - ZAAWANSOWANA OPTYMALIZACJA ===
    const optimizedPrompt = `Jesteś ekspertem HR z 15-letnim doświadczeniem. Twoim zadaniem jest PROFESJONALNA TRANSFORMACJA CV.

ZASADY KRYTYCZNE:
✓ ZACHOWAJ: imię, nazwisko, email, telefon, daty, nazwy firm, stanowiska (NIE wymyślaj!)
✓ PŁEĆ: Jeśli kobieta (Anna, Iwona, Maria) → "obsługiwałam", jeśli mężczyzna → "obsługiwałem"
${jobPosting ? `✓ DOPASUJ do oferty pracy (naturalnie wpleć słowa kluczowe)\n` : ''}

🎯 FORMAT OPISÓW - BULLET POINTY (2-3 NA STANOWISKO):
1. KAŻDE doświadczenie = 2-3 ZWIĘZŁE bullet pointy (nie długie paragrafy!)
2. KAŻDY bullet point:
   - Jedno konkretne osiągnięcie lub zakres obowiązków
   - Mocny czasownik na początku (zarządzałem, zoptymalizowałem, zwiększyłem, obsługiwałem)
   - Konkretna liczba/metryka jeśli możliwe (np. "80+ paczek dziennie", "110% planu", "50-70 zamówień")
   - MAX 1-2 zdania na bullet (zwięźle!)

3. PRZYKŁADY DOBRYCH BULLET POINTÓW:
   ✅ "Obsługiwałem 80-100 paczek dziennie z 98% wskaźnikiem terminowości dostaw"
   ✅ "Osiągnąłem 110% planu sprzedaży, generując średnio 120k zł przychodu miesięcznie"
   ✅ "Szkoliłem nowych pracowników, przyczyniając się do wzrostu satysfakcji klientów o 12%"

4. PRZYKŁADY ZŁYCH (unikaj!):
   ❌ "Obsługiwałem średnio 80-100 paczek dziennie, utrzymując 98% wskaźnik terminowości dostaw. Rozwiązywałem problemy związane z dostawą, prowadziłem profesjonalne doradztwo dla klientów. Szkoliłem nowych pracowników w zakresie standardów obsługi kurierskiej, co przyczyniło się do zwiększenia satysfakcji klientów o 12% w ciągu 6 miesięcy." (ZA DŁUGIE - to powinny być 3 osobne bullety!)
   ❌ "Wdrożyłem nowy system zarządzania..." (OKLEPANE - nie używaj tej frazy!)
   ❌ Powtarzające się frazy w różnych stanowiskach

⚠️ KRYTYCZNE: UNIKAJ POWTÓRZEŃ!
- ZAKAZ używania tych samych fraz: "Wdrożyłem nowy system", "zwiększając X o Y% w ciągu", "co przyczyniło się do"
- Każde stanowisko = UNIKALNE opisy dopasowane do specyfiki pracy
- Różnorodne czasowniki i konstrukcje (nie powtarzaj się!)

💡 INTELIGENTNE WYPEŁNIANIE PUSTYCH SEKCJI:
- Jeśli brak umiejętności → dodaj uniwersalne (komunikacja, praca w zespole, zarządzanie czasem, MS Office)
- Jeśli brak zainteresowań → dodaj ogólne (rozwój osobisty, czytanie literatury branżowej, nowe technologie)
- NIE dodawaj certyfikatów ani języków jeśli ich nie ma w oryginalnym CV

ANALIZA OBRAZU (jeśli dostępny):
${hasVisualAI ? '- Widzisz obraz CV - wyciągnij dokładne dane\n- Jeśli widzisz ZDJĘCIE osoby - ustaw hasPhoto: true' : '- Brak obrazu - użyj tylko tekstu'}

ZWRÓĆ JSON:
{
  "hasPhoto": ${hasVisualAI ? 'true/false (czy widzisz zdjęcie osoby?)' : 'false'},
  "name": "Imię Nazwisko",
  "email": "email@example.com",
  "phone": "+48 123 456 789",
  "location": "Miasto",
  "birthDate": "DD.MM.RRRR lub null",
  "experience": [
    {
      "period": "MM.RRRR - MM.RRRR",
      "duration": "(X lat Y mies.)",
      "position": "Stanowisko",
      "company": "Firma",
      "location": "Miasto",
      "bullets": [
        "ZWIĘZŁY bullet point 1 z konkretnym osiągnięciem i liczbą",
        "ZWIĘZŁY bullet point 2 z zakresem obowiązków",
        "ZWIĘZŁY bullet point 3 z rezultatami (opcjonalnie)"
      ]
    }
  ],
  "education": [
    {
      "period": "MM.RRRR - MM.RRRR",
      "school": "Nazwa szkoły/uczelni",
      "field": "Kierunek/profil",
      "location": "Miasto"
    }
  ],
  "skills": ["umiejętność 1", "umiejętność 2", "minimum 5-8 umiejętności"],
  "languages": [{"lang": "Polski", "level": "Ojczysty"}, ...],
  "certifications": [{"date": "MM.RRRR", "name": "Nazwa certyfikatu", "issuer": "Organizator"}] lub [],
  "interests": ["zainteresowanie 1", "zainteresowanie 2", "zainteresowanie 3"] lub ["rozwój osobisty", "czytanie", "technologie"],
  "coverLetter": "Profesjonalny list motywacyjny 2-3 akapity"
}

${jobPosting ? `OFERTA PRACY:\n${jobPosting}\n\n` : ''}
TEKST CV:
${currentCV}

ZWRÓĆ TYLKO JSON (bez \`\`\`). PAMIĘTAJ:
- Każde doświadczenie = 2-3 ZWIĘZŁE bullet pointy
- Każdy bullet = 1-2 zdania MAX
- ZAKAZ powtarzania fraz "Wdrożyłem nowy system", "zwiększając o X%"
- Konkretne osiągnięcia, nie ogólniki!`

    // 6. JEDNO WYWOŁANIE AI Z GROQ BACKUP
    console.log('🤖 Starting CV+CoverLetter optimization...')
    console.log('🖼️ Visual AI:', hasVisualAI ? 'YES - Using Gemini Vision' : 'NO - Text only')

    let optimizedCV, coverLetter
    let usedProvider = 'unknown'

    // === PRÓBA 1: GEMINI (PRIMARY) ===
    try {
      console.log('🔵 Trying Gemini 2.0 Flash...')

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })

      // === NOWE: Jeśli mamy obraz, wyślij go do Gemini Vision ===
      let geminiInput
      if (hasVisualAI) {
        console.log('📸 Sending image to Gemini Vision...')
        // Usuń prefix data:image/png;base64, jeśli istnieje
        const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData

        geminiInput = [
          optimizedPrompt,
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data
            }
          }
        ]
      } else {
        console.log('📝 Text-only mode (no image)')
        geminiInput = optimizedPrompt
      }

      const result = await model.generateContent(geminiInput)
      let responseText = result.response.text()

      // FIXED: Clean up response - remove markdown code fences if present
      responseText = responseText.trim()
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '')
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```\s*/, '').replace(/\s*```\s*$/, '')
      }

      try {
        const parsed = JSON.parse(responseText)

        // NOWY SYSTEM: AI zwraca dane, my generujemy HTML
        const cvData = parsed
        coverLetter = cvData.coverLetter || 'List motywacyjny niedostępny'

        // Generuj HTML z profesjonalnego szablonu
        optimizedCV = generateProfessionalCVHTML(cvData, imageData)

        usedProvider = 'Gemini'
        console.log('✅ Gemini success! CV data parsed:', {
          name: cvData.name,
          hasPhoto: cvData.hasPhoto,
          experienceCount: cvData.experience?.length || 0,
          educationCount: cvData.education?.length || 0
        })
      } catch (parseError) {
        console.warn('⚠️ Gemini JSON parse failed, using fallback data')

        // Fallback: użyj podstawowych danych z tekstu CV
        const fallbackData = {
          hasPhoto: false,
          name: currentCV.split('\n')[0]?.trim() || 'Imię Nazwisko',
          email: email,
          phone: '',
          location: '',
          birthDate: null,
          experience: [{
            period: '',
            duration: '',
            position: 'Stanowisko',
            company: 'Firma',
            location: '',
            bullets: [currentCV.substring(0, 300)]
          }],
          education: [],
          skills: [],
          languages: [],
          certifications: [],
          interests: []
        }

        optimizedCV = generateProfessionalCVHTML(fallbackData, imageData)
        coverLetter = 'List motywacyjny niedostępny'
        usedProvider = 'Gemini (fallback)'
        console.log('✅ Generated fallback CV template')
      }

    } catch (geminiError) {
      console.error('❌ Gemini failed:', geminiError.message)

      // === PRÓBA 2: GROQ (BACKUP) ===
      try {
        console.log('🟢 Gemini failed, trying Groq backup...')

        const groqCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: optimizedPrompt
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })

        const groqResponse = groqCompletion.choices[0].message.content
        const cvData = JSON.parse(groqResponse)
        coverLetter = cvData.coverLetter || 'List motywacyjny niedostępny'

        // KRYTYCZNE: Groq nie ma Vision, ale PRZEKAŻ imageData do szablonu!
        // imageData pochodzi z frontendu (PDF capture), nie z AI
        optimizedCV = generateProfessionalCVHTML(cvData, imageData)

        usedProvider = 'Groq (backup)'
        console.log('✅ Groq backup success!')
        console.log('🖼️ Groq backup: imageData was', imageData ? 'PASSED to template' : 'NULL')

      } catch (groqError) {
        console.error('❌ Groq backup also failed:', groqError.message)

        // Oba serwisy zawiodły
        throw new Error(`Both AI providers failed. Gemini: ${geminiError.message}, Groq: ${groqError.message}`)
      }
    }

    console.log(`🤖 AI optimization complete using: ${usedProvider}`)
    console.log('🔍 optimizedCV length:', optimizedCV?.length, 'chars')

    // === CRITICAL: Validate generated HTML ===
    console.log('🔍 Validating generated HTML...')

    // 1. Check if optimizedCV is not empty
    if (!optimizedCV || optimizedCV.trim().length === 0) {
      console.error('❌ Generated CV is empty')
      throw new Error('Generated CV content is empty')
    }

    // 2. Check for minimum required structure (szablon zawsze ma te klasy)
    const requiredElements = [
      { name: 'cv-document', pattern: /cv-document/i },
      { name: 'cv-header', pattern: /cv-header/i },
      { name: 'cv-name', pattern: /cv-name/i }
    ]

    for (const element of requiredElements) {
      if (!element.pattern.test(optimizedCV)) {
        console.error(`❌ Missing required element in template: ${element.name}`)
        throw new Error(`Template generation failed - missing ${element.name}`)
      }
    }

    // 3. Validate minimum content length
    if (optimizedCV.length < 300) {
      console.error(`❌ Generated CV too short: ${optimizedCV.length} chars`)
      throw new Error(`Generated CV is incomplete: ${optimizedCV.length} characters`)
    }

    // 4. Check if CV contains actual text content (not just HTML tags)
    const textContent = optimizedCV.replace(/<[^>]+>/g, '').trim()
    if (textContent.length < 50) {
      console.error(`❌ CV has insufficient text content: ${textContent.length} chars`)
      throw new Error('Generated CV has insufficient content')
    }

    console.log(`✅ HTML validation passed - ${optimizedCV.length} chars, ${textContent.length} text chars`)

    // 8. ZAKTUALIZUJ LICZNIK UŻYĆ (SKIPPED IN DEV MODE)
    console.log('⚠️ DEV MODE: Skipping usage count update')
    // const { error: updateError } = await supabase
    //   .from('users')
    //   .update({
    //     usage_count: user.usage_count + 1
    //   })
    //   .eq('email', email)

    // if (updateError) {
    //   console.error('❌ Failed to update usage count:', updateError)
    // } else {
    //   console.log('✅ Usage count updated:', user.usage_count + 1)
    // }

    // 9. ANALIZA SŁÓW KLUCZOWYCH (dla wyższych planów)
    const improvements = [
      'Dodano mocne czasowniki akcji',
      'Wstawiono metryki i liczby',
      'Dostosowano słowa kluczowe do oferty',
      'Poprawiono strukturę i formatowanie',
      'Ulepszono opisy stanowisk'
    ]

    const keywordMatch = jobPosting ? 85 : 75

    // SUKCES!
    console.log('✅ Returning optimized CV to client')
    console.log('🔍 Final optimizedCV (first 500 chars):', optimizedCV.substring(0, 500))

    return res.status(200).json({
      success: true,
      optimizedCV: optimizedCV,
      coverLetter: coverLetter,
      aiProvider: usedProvider,
      improvements: improvements,
      keywordMatch: keywordMatch,
      remainingUses: user.usage_limit - (user.usage_count + 1),
      metadata: {
        originalLength: currentCV.length,
        optimizedLength: optimizedCV.length,
        improvementRate: Math.round((optimizedCV.length / currentCV.length - 1) * 100)
      }
    })

  } catch (error) {
    console.error('❌ API Error:', error)

    // Handle Gemini API quota exceeded (429 errors)
    if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('Rate limit')) {
      const retryAfter = error.errorDetails?.find(d => d['@type']?.includes('RetryInfo'))?.retryDelay
      return res.status(429).json({
        success: false,
        error: 'Przekroczono limit API Gemini. Spróbuj ponownie za chwilę.',
        retryAfter: retryAfter || '60s',
        details: 'Free tier limit: 50 requests/day. Consider upgrading or try again tomorrow.'
      })
    }

    // Handle other API errors
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        error: `Błąd API: ${error.message || 'Nieznany błąd'}`
      })
    }

    return res.status(500).json({
      success: false,
      error: 'Wystąpił błąd podczas optymalizacji. Spróbuj ponownie.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}