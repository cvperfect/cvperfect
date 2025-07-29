export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { jobPosting } = req.body

  if (!jobPosting) {
    return res.status(400).json({ error: 'Job posting is required' })
  }

  try {
    // Generate CV using Groq
    const cvResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Jesteś ekspertem od tworzenia CV. Na podstawie ogłoszenia o pracę stwórz profesjonalne CV w języku polskim, które będzie idealnie dopasowane do wymagań. CV powinno być w formacie tekstowym, czytelne i profesjonalne. Użyj realistycznych danych personalnych (imię, nazwisko, adres w Polsce, telefon, email). Dostosuj doświadczenie, umiejętności i wykształcenie do wymagań z ogłoszenia.`
          },
          {
            role: 'user',
            content: `Ogłoszenie o pracę:\n\n${jobPosting}\n\nUtwórz dla tego ogłoszenia profesjonalne CV.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    const cvData = await cvResponse.json()

    // Generate Cover Letter using Groq
    const coverLetterResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Jesteś ekspertem od pisania listów motywacyjnych. Na podstawie ogłoszenia o pracę napisz profesjonalny list motywacyjny w języku polskim, który będzie przekonujący i dopasowany do oferty. List powinien być formalny, ale angażujący, pokazujący motywację i dopasowanie kandydata do stanowiska.`
          },
          {
            role: 'user',
            content: `Ogłoszenie o pracę:\n\n${jobPosting}\n\nNapisz dla tego ogłoszenia profesjonalny list motywacyjny.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    const coverLetterData = await coverLetterResponse.json()

    const cv = cvData.choices[0].message.content
    const coverLetter = coverLetterData.choices[0].message.content

    res.status(200).json({
      success: true,
      cv,
      coverLetter
    })

  } catch (error) {
    console.error('Error generating CV:', error)
    res.status(500).json({ error: 'Failed to generate CV' })
  }
}