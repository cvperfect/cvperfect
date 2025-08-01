import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // DODANE: Obsługa CORS i OPTIONS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Only POST requests are accepted.' 
    })
  }

  try {
    const { jobPosting, currentCV, email } = req.body

    // Walidacja danych wejściowych
    if (!jobPosting || !currentCV || !email) {
      return res.status(400).json({
        success: false,
        error: 'Brakuje wymaganych pól: ogłoszenie, CV i email są wymagane.'
      })
    }

    console.log('🔍 Checking user limits for:', email)

    // 1. SPRAWDŹ UŻYTKOWNIKA W BAZIE
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ Database error:', userError)
      return res.status(500).json({ 
        success: false, 
        error: 'Błąd bazy danych. Spróbuj ponownie.' 
      })
    }

    // 2. SPRAWDŹ CZY UŻYTKOWNIK MA DOSTĘP
    if (!user) {
      console.log('❌ User not found, requires payment')
      return res.status(403).json({ 
        success: false, 
        error: 'Musisz wykupić plan aby korzystać z optymalizacji CV. Wybierz jeden z planów płatności.' 
      })
    }

    // 3. SPRAWDŹ LIMITY UŻYTKOWANIA
    if (user.usage_count >= user.usage_limit) {
      console.log('❌ Usage limit exceeded:', user.usage_count, '>=', user.usage_limit)
      
      if (user.plan_type === 'one_time') {
        return res.status(403).json({ 
          success: false, 
          error: `Wykorzystałeś swoje użycie planu ${user.plan}. Kup nowy plan aby kontynuować.` 
        })
      } else {
        return res.status(403).json({ 
          success: false, 
          error: `Osiągnąłeś limit ${user.usage_limit} CV w tym miesiącu. Poczekaj do następnego miesiąca lub kup wyższy plan.` 
        })
      }
    }

    // 4. SPRAWDŹ WYGAŚNIĘCIE (dla subskrypcji)
    if (user.expires_at && new Date(user.expires_at) < new Date()) {
      console.log('❌ Subscription expired:', user.expires_at)
      return res.status(403).json({ 
        success: false, 
        error: 'Twoja subskrypcja wygasła. Odnów plan aby kontynuować.' 
      })
    }

    console.log('✅ User authorized:', {
      plan: user.plan,
      usage: `${user.usage_count}/${user.usage_limit}`,
      expires: user.expires_at
    })

    // 5. OPTYMALIZUJ CV PRZEZ GROQ AI
    console.log('🤖 Starting CV optimization...')
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Jesteś ekspertem od CV i listów motywacyjnych. Analizujesz oferty pracy i optymalizujesz CV pod konkretne wymagania.

ZADANIE:
1. Przeanalizuj ogłoszenie o pracę
2. Zoptymalizuj CV pod to ogłoszenie
3. Stwórz spersonalizowany list motywacyjny

ZASADY OPTYMALIZACJI:
- Wyróżnij umiejętności zgodne z wymaganiami
- Dodaj brakujące słowa kluczowe z ogłoszenia
- Popraw struktur i kolejność sekcji
- Usuń nieistotne informacje
- Zachowaj profesjonalny ton

ODPOWIEDŹ W FORMACIE JSON:
{
  "optimizedCV": "zoptymalizowane CV...",
  "coverLetter": "list motywacyjny...",
  "improvements": ["lista poprawek..."],
  "keywordMatch": 85
}`
        },
        {
          role: 'user',
          content: `OGŁOSZENIE O PRACĘ:\n${jobPosting}\n\nAKTUALNE CV:\n${currentCV}\n\nZoptymalizuj moje CV pod to ogłoszenie i napisz list motywacyjny.`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 4000,
    })

    const aiResponse = chatCompletion.choices[0].message.content
    console.log('🤖 AI response received')

    // Parse JSON response
    let parsedResponse
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      // Fallback: create response manually
      parsedResponse = {
        optimizedCV: aiResponse.split('ZOPTYMALIZOWANE CV:')[1]?.split('LIST MOTYWACYJNY:')[0]?.trim() || aiResponse.substring(0, 2000),
        coverLetter: aiResponse.split('LIST MOTYWACYJNY:')[1]?.trim() || 'List motywacyjny będzie dodany wkrótce.',
        improvements: ['CV zostało zoptymalizowane pod ogłoszenie'],
        keywordMatch: 85
      }
    }

    // 6. ZAKTUALIZUJ LICZNIK UŻYĆ
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        usage_count: user.usage_count + 1 
      })
      .eq('email', email)

    if (updateError) {
      console.error('❌ Failed to update usage count:', updateError)
      // Don't fail the request, just log the error
    } else {
      console.log('✅ Usage count updated:', user.usage_count + 1)
    }

    // SUKCES!
    return res.status(200).json({
      success: true,
      optimizedCV: parsedResponse.optimizedCV,
      coverLetter: parsedResponse.coverLetter,
      improvements: parsedResponse.improvements || [],
      keywordMatch: parsedResponse.keywordMatch || 85,
      remainingUses: user.usage_limit - (user.usage_count + 1)
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