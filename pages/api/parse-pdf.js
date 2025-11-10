import pdf from 'pdf-parse'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { fileData } = req.body

    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' })
    }

    // fileData jest w formacie base64
    const buffer = Buffer.from(fileData.split(',')[1], 'base64')

    console.log('📄 Parsing PDF, size:', buffer.length, 'bytes')

    // Parsuj PDF
    const data = await pdf(buffer)

    console.log('✅ PDF parsed, pages:', data.numpages, 'text length:', data.text.length)

    return res.status(200).json({
      success: true,
      text: data.text,
      pages: data.numpages,
      metadata: {
        info: data.info,
        textLength: data.text.length
      }
    })

  } catch (error) {
    console.error('❌ PDF parsing error:', error)
    return res.status(500).json({
      error: 'Failed to parse PDF',
      details: error.message
    })
  }
}
