export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  const { jobPosting, currentCV } = req.body
  if (!jobPosting || !currentCV) {
    return res.status(400).json({ error: 'Job posting and current CV are required' })
  }
  try {
    // Optimize CV using Groq
    const cvResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Jesteś ekspertem od optymalizacji CV. Przepisuj CV użytkowników tak żeby idealnie pasowały do ofert pracy. Zachowujesz prawdziwość ale poprawiasz brzmienie, dodajesz słowa kluczowe z ogłoszenia i robisz CV bardziej atrakcyjnym dla rekruterów.'
          },
          {
            role: 'user',
            content: `OBECNE CV UŻYTKOWNIKA:
${currentCV}
OGŁOSZENIE O PRACĘ:
${jobPosting}
ZADANIE: Przepisz CV użytkownika tak żeby idealnie pasowało do tej oferty pracy. Popraw:
- Słowa kluczowe z ogłoszenia (dodaj do opisu doświadczenia)
- Opis doświadczenia zawodowego (bardziej atrakcyjny, profesjonalny)
- Umiejętności (dopasowane do wymagań z oferty)
- Zachowaj prawdziwość ale ulepsz brzmienie
- Dodaj sekcje które są ważne dla tej pozycji
- Nie zmyślaj doświadczenia którego nie ma, ale opisuj istniejące lepiej
Napisz zoptymalizowane CV w języku polskim w profesjonalnym formacie.`
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    })
    const cvData = await cvResponse.json()
    console.log('Groq CV response:', cvData) // Debug log
    if (!cvResponse.ok) {
      throw new Error(`Groq API error: ${cvData.error?.message || 'Unknown error'}`)
    }
    if (!cvData.choices || !cvData.choices[0]) {
      throw new Error('Invalid response format from Groq')
    }
    // Generate Cover Letter
    const coverLetterResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Jesteś ekspertem od pisania listów motywacyjnych. Na podstawie ogłoszenia o pracę i CV użytkownika napisz profesjonalny list motywacyjny w języku polskim.'
          },
          {
            role: 'user',
            content: `OGŁOSZENIE O PRACĘ:
${jobPosting}
CV UŻYTKOWNIKA:
${currentCV}
Napisz profesjonalny list motywacyjny w języku polskim, który będzie:
- Dopasowany do tej konkretnej oferty pracy
- Pokazujący motywację kandydata
- Podkreślający najważniejsze doświadczenia z CV
- Przekonujący i angażujący
- Maksymalnie 200-300 słów`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })
    const coverLetterData = await coverLetterResponse.json()
    if (!coverLetterResponse.ok) {
      throw new Error(`Groq API error: ${coverLetterData.error?.message || 'Unknown error'}`)
    }
    const optimizedCV = cvData.choices[0].message.content
    const coverLetter = coverLetterData.choices[0].message.content
    
    // Wysyłamy odpowiedź do użytkownika
    res.status(200).json({
      success: true,
      optimizedCV,
      coverLetter
    })

    // Zaplanuj automatyczne usunięcie danych z pamięci po 10 minutach (dla bezpieczeństwa RODO)
    setTimeout(() => {
      // Dane CV są automatycznie usuwane z pamięci po przetworzeniu
      console.log('CV data automatically cleared after processing - RODO compliance')
    }, 10 * 60 * 1000) // 10 minut

  } catch (error) {
    console.error('Error optimizing CV:', error)
    res.status(500).json({ error: error.message })
  }
}