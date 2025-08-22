// Demo CV optimization endpoint for testing and long CV processing
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

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
    const { cvText, jobText = '', language = 'pl' } = req.body

    // Validation
    if (!cvText) {
      return res.status(400).json({
        success: false,
        error: 'CV text is required'
      })
    }

    console.log('🔍 Demo CV optimization:', {
      cvLength: cvText.length,
      hasJob: !!jobText,
      language: language
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
      
      // Process each chunk and combine results
      const optimizedChunks = []
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        console.log(`🤖 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`)
        
        try {
          const optimizedChunk = await optimizeChunk(chunk, jobText, language, i === 0)
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
      
      processedCV = optimizedChunks.join('\n\n')
    } else {
      // Standard processing for normal-sized CVs
      processedCV = await optimizeChunk(cvText, jobText, language, true)
    }

    // Validate the result
    if (!processedCV || processedCV.length < 100) {
      throw new Error('Optimization resulted in unexpectedly short output')
    }

    console.log('✅ Demo optimization completed:', {
      originalLength: cvText.length,
      optimizedLength: processedCV.length,
      improvement: processedCV.length > cvText.length ? 'Enhanced' : 'Refined'
    })

    return res.status(200).json({
      success: true,
      optimizedCV: processedCV,
      stats: {
        originalLength: cvText.length,
        optimizedLength: processedCV.length,
        processedAt: new Date().toISOString()
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

async function optimizeChunk(cvText, jobText, language, isFirstChunk) {
  const systemPrompt = language === 'pl' ? 
    `Jesteś ekspertem od optymalizacji CV. Twoim zadaniem jest DELIKATNE ULEPSZENIE oryginalnego CV poprzez rozszerzenie opisów stanowisk i dodanie osiągnięć.

KRYTYCZNE ZASADY:
1. ZACHOWAJ DOKŁADNIE oryginalną strukturę CV - nie zmieniaj kolejności sekcji
2. ZACHOWAJ oryginalne nagłówki sekcji (bez emoji, bez separatorów)
3. TYLKO rozszerz opisy stanowisk o szczegóły i osiągnięcia
4. NIE dodawaj nowych sekcji, które nie były w oryginale
5. Jeśli sekcja była w oryginale - rozszerz ją. Jeśli nie było - nie dodawaj

DOZWOLONE ULEPSZENIA:
- Rozszerzenie opisów stanowisk o konkretne osiągnięcia i metryki
- Dodanie słów kluczowych branżowych
- Użycie mocnych czasowników akcji (kierowałem, wdrożyłem, zwiększyłem)
- Dodanie konkretnych liczb (% poprawy, kwoty, iłości)

ZABRONIONE:
- Emoji w nagłówkach (🎯, 💼, 🎓)  
- Linie separujące (═══)
- Zmiana kolejności sekcji
- Dodawanie nowych sekcji
- Zmiana stylu nagłówków

PRZYKŁAD TRANSFORMACJI:
ORYGINAŁ:
Kurier w UPS - Dostarczanie paczek

ULEPSZONY:
Kurier w UPS - Odpowiedzialny za dostarczanie paczek na terenie Zamościa, osiągnąłem 95% terminowość dostaw, współpracowałem z zespołem 5 kurierów, obsługiwałem dziennie 50-80 przesyłek.

FORMAT ODPOWIEDZI:
Zwróć TYLKO zoptymalizowane CV w dokładnie tej samej strukturze co oryginał, używając **pogrubień** dla nagłówków i * dla punktów.` :
    `You are a CV optimization and recruitment expert. Your task is to improve the CV to make it more attractive to employers and ATS systems.

OPTIMIZATION RULES:
1. PRESERVE all true information from the CV
2. DO NOT ADD new experiences, certifications, or skills
3. Improve formatting and structure
4. Use stronger action words
5. Optimize for ATS
6. If job posting provided, adjust keywords accordingly

RESPONSE FORMAT:
Return ONLY the optimized CV without additional comments.`

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