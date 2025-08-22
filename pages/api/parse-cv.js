import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import os from 'os'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import { PDFDocument } from 'pdf-lib'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Use OS temp directory (works on Windows, Mac, Linux)
    const uploadDir = os.tmpdir()
    
    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
    })

    const [fields, files] = await form.parse(req)
    const file = files.cv?.[0]

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = file.filepath
    const fileName = file.originalFilename || 'unknown'
    const mimeType = file.mimetype

    let extractedText = ''
    let extractedPhoto = null // For photo extraction

    console.log('📄 Parsing file:', fileName, 'Type:', mimeType)
    console.log('📁 File path:', filePath)
    console.log('📁 Upload dir:', uploadDir)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ 
        error: 'Plik nie został poprawnie przesłany. Spróbuj ponownie.' 
      })
    }

    try {
      if (mimeType === 'application/pdf') {
        // Parse PDF
        const pdfBuffer = fs.readFileSync(filePath)
        const pdfData = await pdfParse(pdfBuffer)
        extractedText = pdfData.text
        console.log('✅ PDF parsed successfully')
        
        // Try to extract photos from PDF
        try {
          const pdfDoc = await PDFDocument.load(pdfBuffer)
          const pages = pdfDoc.getPages()
          
          for (let i = 0; i < pages.length; i++) {
            const page = pages[i]
            const { node } = page
            
            // Check for embedded images
            if (node.Resources && node.Resources.XObject) {
              const xObjectDict = node.Resources.XObject
              const xObjectKeys = Object.keys(xObjectDict)
              
              for (const key of xObjectKeys) {
                const xObject = xObjectDict[key]
                if (xObject && xObject.Subtype && xObject.Subtype.name === 'Image') {
                  try {
                    // Found an image - extract as base64
                    const imageBytes = xObject.contents
                    if (imageBytes && imageBytes.length > 1000) { // Only larger images (likely photos)
                      extractedPhoto = `data:image/jpeg;base64,${Buffer.from(imageBytes).toString('base64')}`
                      console.log('📸 Photo extracted from PDF:', imageBytes.length, 'bytes')
                      break // Take first suitable image
                    }
                  } catch (imageError) {
                    console.log('⚠️ Could not extract image:', imageError.message)
                  }
                }
              }
              if (extractedPhoto) break // Stop if we found a photo
            }
          }
        } catch (photoError) {
          console.log('⚠️ Photo extraction failed:', photoError.message)
        }
        
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword' ||
        fileName.toLowerCase().endsWith('.docx') ||
        fileName.toLowerCase().endsWith('.doc')
      ) {
        // Parse DOCX/DOC
        const docBuffer = fs.readFileSync(filePath)
        const result = await mammoth.extractRawText({ buffer: docBuffer })
        extractedText = result.value
        console.log('✅ DOCX/DOC parsed successfully')
        
        // Try to extract images from DOCX
        try {
          const htmlResult = await mammoth.convertToHtml({ 
            buffer: docBuffer,
            convertImage: mammoth.images.imgElement(function(image) {
              return image.read("base64").then(function(imageBuffer) {
                const base64 = imageBuffer.toString('base64')
                if (!extractedPhoto && base64.length > 1000) { // Only take first large image
                  extractedPhoto = `data:${image.contentType || 'image/jpeg'};base64,${base64}`
                  console.log('📸 Photo extracted from DOCX:', base64.length, 'chars')
                }
                return {
                  src: `data:${image.contentType || 'image/jpeg'};base64,${base64}`
                }
              })
            })
          })
        } catch (photoError) {
          console.log('⚠️ DOCX photo extraction failed:', photoError.message)
        }
        
      } else {
        // Try to read as plain text
        extractedText = fs.readFileSync(filePath, 'utf8')
        console.log('✅ Plain text file read')
      }

      // Clean up temporary file
      fs.unlinkSync(filePath)

      // Clean and validate extracted text
      extractedText = extractedText.trim()
      
      if (!extractedText || extractedText.length < 50) {
        return res.status(400).json({ 
          error: 'Nie udało się odczytać zawartości pliku lub plik jest zbyt krótki.' 
        })
      }

      // Basic validation - check if it looks like a CV
      const hasPersonalInfo = /\b(?:email|telefon|phone|@|\+\d{2}|\d{3}[-\s]?\d{3}[-\s]?\d{3})/i.test(extractedText)
      
      if (!hasPersonalInfo) {
        console.log('⚠️ File might not be a CV - no contact info detected')
      }

      return res.status(200).json({
        success: true,
        extractedText: extractedText,
        extractedPhoto: extractedPhoto, // Include photo if found
        fileName: fileName,
        fileSize: file.size,
        wordCount: extractedText.split(/\s+/).length,
        hasPhoto: !!extractedPhoto,
        metadata: {
          hasPersonalInfo,
          length: extractedText.length,
          type: mimeType,
          photoExtracted: !!extractedPhoto
        }
      })

    } catch (parseError) {
      console.error('❌ Parse error:', parseError)
      
      // Cleanup on error
      try {
        fs.unlinkSync(filePath)
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError)
      }

      return res.status(500).json({ 
        error: 'Nie udało się odczytać pliku. Upewnij się, że plik nie jest uszkodzony.',
        details: parseError.message
      })
    }

  } catch (error) {
    console.error('❌ API Error:', error)
    return res.status(500).json({ 
      error: 'Wystąpił błąd podczas przetwarzania pliku.' 
    })
  }
}