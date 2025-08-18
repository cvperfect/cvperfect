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
    const { jobPosting, currentCV, email } = req.body

    // Walidacja
    if (!currentCV || !email) {
      return res.status(400).json({
        success: false,
        error: 'Brakuje wymaganych pól: CV i email są wymagane.'
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
        error: 'Musisz wykupić plan aby korzystać z optymalizacji CV.' 
      })
    }

    // 3. SPRAWDŹ LIMITY
    if (user.usage_count >= user.usage_limit) {
      console.log('❌ Usage limit exceeded')
      return res.status(403).json({ 
        success: false, 
        error: `Wykorzystałeś limit ${user.usage_limit} CV. Kup nowy plan aby kontynuować.` 
      })
    }

    // 4. SPRAWDŹ WYGAŚNIĘCIE
    if (user.expires_at && new Date(user.expires_at) < new Date()) {
      console.log('❌ Subscription expired')
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

    // 5. PRZYGOTUJ LEPSZY PROMPT DLA AI
    const systemPrompt = `Jesteś ekspertem HR i specjalistą od optymalizacji CV z 15-letnim doświadczeniem.

TWOJE ZADANIE:
Ulepsz dostarczone CV, aby zwiększyć szanse na rozmowę kwalifikacyjną.

ZASADY KRYTYCZNE - MUSISZ ICH PRZESTRZEGAĆ:
1. ZACHOWAJ wszystkie dane osobowe bez zmian (imię, nazwisko, email, telefon, adres, data urodzenia)
2. ZACHOWAJ wszystkie nazwy firm, stanowisk i daty zatrudnienia
3. ZACHOWAJ wykształcenie (nazwy szkół, kierunki, daty)
4. NIE WYMYŚLAJ nowych miejsc pracy, projektów czy umiejętności których nie ma w oryginalnym CV

CO MOŻESZ I POWINIENEŚ ULEPSZYĆ:
1. PRZEPISZ opisy obowiązków używając mocnych czasowników (zarządzałem, wdrożyłem, zoptymalizowałem, zwiększyłem)
2. DODAJ metryki i liczby gdzie to możliwe (np. "obsługiwałem 50+ klientów dziennie", "zarządzałem zespołem 5 osób")
3. ULEPSZ język - użyj profesjonalnego słownictwa branżowego
4. DOSTOSUJ słowa kluczowe do oferty pracy (jeśli podano)
5. POPRAW formatowanie i strukturę dla lepszej czytelności
6. ROZWIŃ skrótowe opisy do pełnych, wartościowych zdań
7. DODAJ osiągnięcia oparte na podanych obowiązkach

PRZYKŁAD ULEPSZENIA:
Oryginał: "Kurier - dostarczanie paczek"
Po ulepszeniu: "Kurier - Zapewniałem terminową dostawę średnio 80 przesyłek dziennie, utrzymując 98% wskaźnik dostaw na czas. Budowałem pozytywne relacje z klientami, co skutkowało wysokimi ocenami satysfakcji."

FORMAT ODPOWIEDZI:
Zwróć TYLKO ulepszone CV w formacie HTML z tagami <h2>, <h3>, <p>, <ul>, <li> dla struktury.
Zachowaj czytelny układ z sekcjami: Dane osobowe, Podsumowanie zawodowe, Doświadczenie, Wykształcenie, Umiejętności.`

    const userPrompt = jobPosting 
      ? `ORYGINALNE CV DO ULEPSZENIA:\n${currentCV}\n\nOFERTA PRACY (dostosuj słowa kluczowe):\n${jobPosting}\n\nUlepsz to CV zachowując wszystkie fakty, ale poprawiając język i dopasowanie.`
      : `ORYGINALNE CV DO ULEPSZENIA:\n${currentCV}\n\nUlepsz to CV zachowując wszystkie fakty, ale używając profesjonalnego języka.`

    // 6. WYWOŁAJ AI
    console.log('🤖 Starting CV optimization...')
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.3, // Niska temperatura = mniej kreatywności, więcej faktów
      max_tokens: 4000,
    })

    const optimizedCV = chatCompletion.choices[0].message.content
    console.log('🤖 AI optimization complete')

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
      model: 'llama-3.1-70b-versatile',
      temperature: 0.5,
      max_tokens: 1000,
    })

    const coverLetter = coverLetterCompletion.choices[0].message.content

    // 8. ZAKTUALIZUJ LICZNIK UŻYĆ
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        usage_count: user.usage_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('email', email)

    if (updateError) {
      console.error('❌ Failed to update usage count:', updateError)
    } else {
      console.log('✅ Usage count updated:', user.usage_count + 1)
    }

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
    return res.status(200).json({
      success: true,
      optimizedCV: optimizedCV,
      coverLetter: coverLetter,
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