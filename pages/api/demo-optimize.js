// Demo CV optimization endpoint for testing and long CV processing
import Groq from 'groq-sdk'
import { processWithChunkedTimeout, TIMEOUTS } from '../../lib/timeout-utils'
import { handleCORSPreflight } from '../../lib/cors'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

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
    // Handle multiple possible field names for CV text with input sanitization
    const bodyData = req.body || {}
    const rawCvText = bodyData.cvText || bodyData.cv || bodyData.text || bodyData.content
    const rawJobText = bodyData.jobText || bodyData.job || bodyData.jobDescription || ''
    const rawLanguage = bodyData.language || bodyData.lang || 'pl'
    
    // Input sanitization
    const cvText = typeof rawCvText === 'string' ? rawCvText.trim() : rawCvText
    const jobText = typeof rawJobText === 'string' ? rawJobText.trim() : rawJobText
    const language = typeof rawLanguage === 'string' ? rawLanguage.trim().toLowerCase() : rawLanguage
    const photo = bodyData.photo || bodyData.image || null
    const preservePhotos = bodyData.preservePhotos !== undefined ? bodyData.preservePhotos : true

    // Enhanced validation with better error messaging
    if (!cvText || (typeof cvText === 'string' && cvText.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Treść CV jest wymagana / CV content is required',
        errorPL: 'Nie podano treści CV. Wymagany tekst CV do optymalizacji.',
        errorEN: 'No CV content provided. CV text is required for optimization.',
        debug: `Available fields: ${Object.keys(bodyData).join(', ')}`,
        received: {
          hasBody: !!req.body,
          bodyKeys: Object.keys(bodyData),
          cvTextValue: cvText ? `${cvText.substring(0, 50)}...` : null
        }
      })
    }

    // Extract and preserve photo information
    let photoData = photo || null
    let hasEmbeddedPhoto = false
    
    // Check if CV already contains photo/image tags
    if (cvText.includes('<img') || cvText.includes('data:image') || cvText.includes('base64')) {
      hasEmbeddedPhoto = true
      console.log('📸 Photo detected in CV content')
    }
    
    if (photoData) {
      console.log('📸 Photo data provided for preservation')
    }

    console.log('🔍 Demo CV optimization:', {
      cvLength: cvText.length,
      hasJob: !!jobText,
      language: language,
      hasPhoto: !!photoData || hasEmbeddedPhoto
    })

    // Handle very long CVs by chunking if necessary
    const MAX_CHUNK_SIZE = 50000 // characters
    let processedCV = cvText

    if (cvText.length > MAX_CHUNK_SIZE) {
      console.log('📄 Long CV detected, implementing chunking strategy')
      
      // Split CV into logical sections for processing
      const sections = cvText.split(/\n\n+/) // Split on paragraph breaks
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
      
      // TIMEOUT: Process chunks with unified timeout system
      const chunkProcessor = async (chunk, index) => {
        console.log(`🤖 Processing chunk ${index + 1}/${chunks.length} (${chunk.length} chars)`)
        return await optimizeChunk(chunk, jobText, language, index === 0, photoData, preservePhotos)
      }
      
      const optimizedChunks = await processWithChunkedTimeout(chunks, chunkProcessor, {
        chunkTimeout: TIMEOUTS.CHUNK_PROCESSING,
        delayBetweenChunks: 500, // Consistent with analyze.js
        failFast: false // Continue on individual chunk failures
      })
      
      processedCV = optimizedChunks.join('\n\n')
    } else {
      // Standard processing for normal-sized CVs
      processedCV = await optimizeChunk(cvText, jobText, language, true, photoData, preservePhotos)
    }

    // Post-processing: Ensure photo preservation
    if (preservePhotos && photoData && !processedCV.includes('<img') && !processedCV.includes('data:image')) {
      console.log('📸 Injecting photo into optimized CV...')
      
      const photoHTML = `
        <div class="profile-photo-container" style="text-align: center; margin: 20px 0;">
          <img src="${photoData}" alt="Profile Photo" class="profile-photo" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #3498db; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
        </div>
      `
      
      if (processedCV.includes('<body>')) {
        processedCV = processedCV.replace('<body>', '<body>' + photoHTML)
      } else if (processedCV.includes('<h1')) {
        processedCV = processedCV.replace('<h1', photoHTML + '<h1')
      } else {
        processedCV = photoHTML + processedCV
      }
      
      console.log('✅ Photo successfully injected into optimized CV')
    }

    // Validate the result
    if (!processedCV || processedCV.length < 100) {
      throw new Error('Optimization resulted in unexpectedly short output')
    }

    // Validate photo preservation
    const photoPreserved = preservePhotos && (processedCV.includes('<img') || processedCV.includes('data:image'))
    if (preservePhotos && (hasEmbeddedPhoto || photoData) && !photoPreserved) {
      console.log('⚠️ WARNING: Photo may have been lost during optimization')
    }

    console.log('✅ Demo optimization completed:', {
      originalLength: cvText.length,
      optimizedLength: processedCV.length,
      improvement: processedCV.length > cvText.length ? 'Enhanced' : 'Refined',
      photoPreserved: photoPreserved
    })

    return res.status(200).json({
      success: true,
      optimizedCV: processedCV,
      photoPreserved: photoPreserved,
      stats: {
        originalLength: cvText.length,
        optimizedLength: processedCV.length,
        processedAt: new Date().toISOString(),
        hasPhoto: hasEmbeddedPhoto || !!photoData,
        photoPreserved: photoPreserved
      }
    })

  } catch (error) {
    console.error('❌ Demo optimization error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'AI optimization temporarily unavailable. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

async function optimizeChunk(cvText, jobText, language, isFirstChunk, photoData = null, preservePhotos = true) {
  const systemPrompt = language === 'pl' ? 
    `Jesteś ekspertem od optymalizacji CV i rekrutacji. Twoim zadaniem jest PROFESJONALNA OPTYMALIZACJA CV pod kątem systemów ATS i najlepszych firm rekrutacyjnych.

GŁÓWNY CEL: Maksymalizacja ATS Score (85-95%) poprzez strategiczne wykorzystanie słów kluczowych i struktury CV.

📸 KRYTYCZNE: ZACHOWANIE ZDJĘĆ I OBRAZÓW
- JEŚLI CV zawiera tagi <img>, ZACHOWAJ JE W 100%
- JEŚLI CV zawiera data:image/base64, ZACHOWAJ DOKŁADNIE
- NIGDY nie usuwaj, nie zmieniaj ani nie modyfikuj tagów <img>
- ZACHOWAJ wszystkie atrybuty obrazów (src, alt, class, style)
- Zdjęcia profilowe są KLUCZOWE dla ATS i rekruterów

KRYTYCZNE ZASADY ATS:
1. ZACHOWAJ oryginalną strukturę CV ale popraw formatowanie
2. Dodaj BRANŻOWE słowa kluczowe w kontekście doświadczenia 
3. KWANTYFIKUJ osiągnięcia (liczby, %, wartości, okresy)
4. Użyj SILNYCH czasowników akcji (zarządzałem, wdrożyłem, zwiększyłem, optymalizowałem)
5. Dopasuj terminologię do oferty pracy (jeśli podana)

STRATEGIA OPTYMALIZACJI:
- Rozszerz opisy stanowisk o konkretne osiągnięcia i metryki
- Dodaj słowa kluczowe branżowe naturalnie w kontekście
- Uzupełnij umiejętności o poszukiwane technologie/kompetencje
- Dodaj osiągnięcia biznesowe (wzrost sprzedaży, optymalizacja procesów, oszczędności)
- Uwzględnij soft skills w opisach doświadczeń

PRZYKŁAD TRANSFORMACJI ATS:
ORYGINAŁ:
Kurier w UPS - Dostarczanie paczek

ZOPTYMALIZOWANY POD ATS:
Kurier/Specjalista Logistyczny w UPS
• Zarządzałem dostarczaniem 50-80 przesyłek dziennie na terenie Zamościa z 95% terminowością
• Optymalizowałem trasy dostaw, co przyczyniło się do 15% redukcji czasu dostawy  
• Współpracowałem z zespołem 5 kurierów, wdrażając system komunikacji zwiększający efektywność o 20%
• Obsługiwałem system CRM do śledzenia przesyłek i kontaktu z klientami
• Rozwiązywałem problemy logistyczne, osiągając 98% satysfakcji klientów

FORMAT ODPOWIEDZI:
Zwróć TYLKO zoptymalizowane CV używając **pogrubień** dla nagłówków i • dla punktów wypunktowań.` :
    `You are a professional CV optimization and recruitment expert. Your task is to PROFESSIONALLY OPTIMIZE this CV for ATS systems and top recruitment companies.

PRIMARY GOAL: Maximize ATS Score (85-95%) through strategic keyword usage and CV structure optimization.

CRITICAL ATS RULES:
1. PRESERVE original CV structure but improve formatting
2. Add INDUSTRY-SPECIFIC keywords within experience context
3. QUANTIFY achievements (numbers, percentages, values, timeframes)
4. Use STRONG action verbs (managed, implemented, increased, optimized, led)
5. Adapt terminology to job posting requirements (if provided)

OPTIMIZATION STRATEGY:
- Expand role descriptions with concrete achievements and metrics
- Naturally integrate industry keywords within context
- Supplement skills with in-demand technologies/competencies
- Add business achievements (sales growth, process optimization, cost savings)
- Include soft skills within experience descriptions

ATS TRANSFORMATION EXAMPLE:
ORIGINAL:
Delivery driver at UPS - Delivering packages

ATS-OPTIMIZED:
Logistics Specialist/Delivery Driver at UPS
• Managed delivery of 50-80 packages daily across city territory with 95% on-time performance
• Optimized delivery routes, contributing to 15% reduction in delivery time
• Collaborated with 5-member courier team, implementing communication system that increased efficiency by 20%
• Operated CRM system for package tracking and customer communication
• Resolved logistics challenges, achieving 98% customer satisfaction rating

RESPONSE FORMAT:
Return ONLY the optimized CV using **bold** for headers and • for bullet points.`

  const userPrompt = language === 'pl' ? 
    `${jobText ? `OFERTA PRACY:\n${jobText}\n\n` : ''}CV DO OPTYMALIZACJI:\n${cvText}` :
    `${jobText ? `JOB POSTING:\n${jobText}\n\n` : ''}CV TO OPTIMIZE:\n${cvText}`

  try {
    const completion = await groq.chat.completions.create({
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
      temperature: 0.4, // Balanced for creativity and facts
      max_tokens: 64000, // Maximum tokens for 10k+ character output
      top_p: 1,
      stream: false
    })

    const optimizedText = completion.choices[0]?.message?.content

    if (!optimizedText) {
      throw new Error('No content returned from AI')
    }

    return optimizedText.trim()

  } catch (groqError) {
    console.error('❌ Groq API error:', groqError)
    
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

    console.log('⚠️ Using fallback optimization')
    return fallbackOptimized
  }
}