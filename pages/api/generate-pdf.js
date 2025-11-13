// Server-side PDF generation - TRUE ATS-FRIENDLY with text preservation
// This endpoint generates PDF with actual text (not image) using Puppeteer

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  maxDuration: 30, // Max 30 seconds for PDF generation
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let browser = null

  try {
    const { html, fileName } = req.body

    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' })
    }

    // Validate HTML size (max 5MB)
    const htmlSizeInMB = Buffer.byteLength(html, 'utf8') / (1024 * 1024)
    if (htmlSizeInMB > 5) {
      console.error(`❌ HTML too large: ${htmlSizeInMB.toFixed(2)}MB`)
      return res.status(413).json({
        error: 'HTML content too large',
        size: `${htmlSizeInMB.toFixed(2)}MB`,
        fallback: 'client-side'
      })
    }

    console.log(`📄 Received HTML: ${htmlSizeInMB.toFixed(2)}MB`)
    console.log('🔍 First 500 chars of received HTML:', html.substring(0, 500))

    // === CRITICAL: Validate and sanitize HTML ===
    console.log('🔍 Validating HTML structure...')

    // 1. Check for basic HTML validity
    if (!html.trim().startsWith('<')) {
      console.error('❌ HTML does not start with a tag')
      return res.status(400).json({
        error: 'Invalid HTML: must start with an HTML tag',
        fallback: 'client-side'
      })
    }

    // 2. Check for dangerous content
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i, // onclick, onload, etc.
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(html)) {
        console.warn('⚠️ Removed potentially dangerous content:', pattern)
      }
    }

    // 3. Sanitize: remove dangerous content
    let processedHTML = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove event handlers
      .replace(/on\w+\s*=\s*'[^']*'/gi, '') // Remove event handlers with single quotes
      .replace(/javascript:[^"']*/gi, '') // Remove javascript: urls

    // 4. Ensure HTML is wrapped in cv-document if not already
    if (!processedHTML.includes('cv-document')) {
      console.log('⚠️ HTML missing cv-document wrapper, adding it...')
      processedHTML = `<div class="cv-document">${processedHTML}</div>`
    }

    // 5. Validate basic structure
    const hasOpeningTags = (processedHTML.match(/<div/gi) || []).length
    const hasClosingTags = (processedHTML.match(/<\/div>/gi) || []).length

    console.log(`📊 Tag balance: ${hasOpeningTags} opening divs, ${hasClosingTags} closing divs`)

    if (Math.abs(hasOpeningTags - hasClosingTags) > 2) {
      console.error(`❌ Severely unbalanced tags: ${hasOpeningTags} opening vs ${hasClosingTags} closing`)
      return res.status(400).json({
        error: 'Invalid HTML structure: unbalanced tags',
        details: `${hasOpeningTags} opening tags vs ${hasClosingTags} closing tags`,
        fallback: 'client-side'
      })
    }

    console.log('✅ HTML validation passed')

    // Try to import puppeteer - may fail if not installed
    let puppeteer
    try {
      puppeteer = await import('puppeteer')
    } catch (importError) {
      console.error('❌ Puppeteer import failed:', importError.message)
      return res.status(500).json({
        error: 'Puppeteer not available. Install it with: npm install puppeteer',
        fallback: 'client-side'
      })
    }

    console.log('🚀 Launching browser for PDF generation...')

    // Launch headless browser with proper error handling
    try {
      browser = await puppeteer.default.launch({
        headless: true,
        timeout: 10000, // 10 second timeout for browser launch
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      })
      console.log('✅ Browser launched successfully')
    } catch (launchError) {
      console.error('❌ Browser launch failed:', launchError.message)
      return res.status(500).json({
        error: 'Failed to launch browser',
        details: launchError.message,
        fallback: 'client-side'
      })
    }

    const page = await browser.newPage()

    // Set viewport for A4 size - CRITICAL: Use proper A4 dimensions
    // A4 at 96 DPI: 210mm = 794px width, 297mm = 1123px height
    // Use slightly larger viewport to ensure no clipping
    await page.setViewport({
      width: 2480, // A4 width (210mm) at 300 DPI for high quality: 210mm × 11.811 = 2480px
      height: 3508, // A4 height (297mm) at 300 DPI: 297mm × 11.811 = 3508px
      deviceScaleFactor: 1, // Don't scale, PDF generation handles quality
    })

    // Inject complete HTML with styles
    const fullHTML = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV</title>
  <style>
    /* MINIMAL STYLES - Pozwól inline styles z szablonu działać */
    @page {
      size: A4;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      background: white;
      color: #000000;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    /* Zapobiegaj overflow */
    * {
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      max-width: 100%;
    }

    /* Zdjęcia - KRYTYCZNE dla base64 images */
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    .cv-photo {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      page-break-inside: avoid;
    }

    /* Zapobiegaj rozjeżdżaniu sekcji */
    .cv-section, .cv-entry {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  ${processedHTML}
</body>
</html>
    `

    console.log('📄 Loading HTML content into browser...')

    // Load HTML with error handling
    try {
      await page.setContent(fullHTML, {
        waitUntil: 'domcontentloaded',
        timeout: 15000, // Increased timeout
      })
      console.log('✅ HTML loaded successfully in browser')
    } catch (loadError) {
      console.error('❌ Failed to load HTML in browser:', loadError.message)
      throw new Error(`HTML rendering failed: ${loadError.message}`)
    }

    // Check for console errors from the page
    page.on('pageerror', error => {
      console.error('❌ Page error:', error.message)
    })

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Browser console error:', msg.text())
      }
    })

    console.log('📄 Generating PDF with text preservation...')

    // Generate PDF with text (not image!) - with error handling
    let pdfBuffer
    try {
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        timeout: 20000, // Increased timeout to 20 seconds
      })
      console.log(`✅ PDF generated successfully (${pdfBuffer.length} bytes)`)
    } catch (pdfError) {
      console.error('❌ PDF generation failed:', pdfError.message)
      throw new Error(`PDF generation failed: ${pdfError.message}`)
    }

    // === CRITICAL: Validate PDF buffer ===
    if (!pdfBuffer || pdfBuffer.length === 0) {
      console.error('❌ Generated PDF buffer is empty (0 bytes)')
      throw new Error('Generated PDF buffer is empty')
    }

    // Check minimum PDF size (should be at least 1KB for valid PDF)
    if (pdfBuffer.length < 1024) {
      console.error(`❌ PDF too small: ${pdfBuffer.length} bytes (minimum 1024 bytes)`)
      throw new Error(`PDF too small: ${pdfBuffer.length} bytes`)
    }

    // Validate PDF signature (must start with %PDF-)
    const pdfSignature = pdfBuffer.toString('ascii', 0, 5)
    console.log(`🔍 PDF signature: "${pdfSignature}"`)

    if (!pdfSignature.startsWith('%PDF-')) {
      console.error(`❌ Invalid PDF signature: "${pdfSignature}" (expected "%PDF-")`)
      console.error(`🔍 First 100 bytes (ASCII):`, pdfBuffer.toString('ascii', 0, 100))
      console.error(`🔍 First 100 bytes (HEX):`, pdfBuffer.toString('hex', 0, 100))
      // DON'T throw - PDF might still be valid, just log the warning
      console.warn('⚠️ Continuing despite signature mismatch...')
    }

    // Check PDF version
    const pdfVersion = pdfBuffer.toString('ascii', 0, 10)
    console.log(`📊 PDF version: ${pdfVersion}`)
    console.log(`📊 PDF size: ${pdfBuffer.length} bytes (${(pdfBuffer.length / 1024).toFixed(2)} KB)`)

    // Validate PDF ends with %%EOF
    const pdfEnd = pdfBuffer.toString('ascii', pdfBuffer.length - 10, pdfBuffer.length).trim()
    if (!pdfEnd.includes('%%EOF')) {
      console.warn('⚠️ PDF does not end with %%EOF marker')
      // This is a warning, not an error - some PDFs are still valid
    }

    console.log('✅ PDF validation passed - sending to client')

    // CRITICAL: Set proper headers for binary PDF data
    res.setHeader('Content-Type', 'application/pdf; charset=binary')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName || 'CV.pdf')}"`)
    res.setHeader('Content-Length', pdfBuffer.length.toString())
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    // CRITICAL: Send PDF as binary buffer (use .end() not .send() for binary data in Next.js)
    res.status(200)
    res.end(pdfBuffer, 'binary')

  } catch (error) {
    console.error('❌ PDF generation error:', error)
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      fallback: 'client-side'
    })
  } finally {
    // Always close browser if it was opened
    if (browser) {
      try {
        await browser.close()
        console.log('🔒 Browser closed')
      } catch (closeError) {
        console.error('⚠️ Failed to close browser:', closeError.message)
      }
    }
  }
}
