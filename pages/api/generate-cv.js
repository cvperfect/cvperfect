export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { jobPosting } = req.body

  if (!jobPosting) {
    return res.status(400).json({ error: 'Job posting is required' })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Jesteś ekspertem od optymalizacji CV. Pomóż poprawić CV pod konkretną ofertę pracy.'
          },
          {
            role: 'user',
            content: `Oferta pracy: ${jobPosting}\n\nWygeneruj profesjonalne CV dopasowane do tej oferty.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    console.log('Groq response:', data) // Debug log

    if (!response.ok) {
      throw new Error(`Groq API error: ${data.error?.message || 'Unknown error'}`)
    }

    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response format from Groq')
    }

    const cv = data.choices[0].message.content

    res.status(200).json({
      success: true,
      cv,
      coverLetter: "List motywacyjny będzie wkrótce..." // Tymczasowo
    })

  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: error.message })
  }
}