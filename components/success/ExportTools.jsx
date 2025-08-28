import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

/**
 * ExportTools - PDF/DOCX/Email Export with Plan Restrictions
 * Extracted from success.js for bundle optimization
 * BUNDLE REDUCTION: Lazy loadable export system
 */

/**
 * Plan-based export access control
 */
const EXPORT_ACCESS = {
  basic: ['pdf'],
  gold: ['pdf', 'docx', 'email'],
  premium: ['pdf', 'docx', 'email', 'png', 'html']
}

/**
 * Export format configurations
 */
const EXPORT_FORMATS = {
  pdf: {
    name: 'PDF',
    icon: '📄',
    description: 'Format uniwersalny, gotowy do druku',
    extension: '.pdf',
    color: 'from-red-500 to-red-600'
  },
  docx: {
    name: 'DOCX',
    icon: '📝',
    description: 'Edytowalny dokument Word',
    extension: '.docx',
    color: 'from-blue-500 to-blue-600'
  },
  email: {
    name: 'Email',
    icon: '📧',
    description: 'Wyślij CV bezpośrednio mailem',
    extension: '',
    color: 'from-green-500 to-green-600'
  },
  png: {
    name: 'PNG',
    icon: '🖼️',
    description: 'Obraz wysokiej jakości',
    extension: '.png',
    color: 'from-purple-500 to-purple-600'
  },
  html: {
    name: 'HTML',
    icon: '🌐',
    description: 'Strona internetowa',
    extension: '.html',
    color: 'from-orange-500 to-orange-600'
  }
}

/**
 * Email Modal Component
 */
const EmailModal = ({ 
  isVisible, 
  onClose, 
  onSendEmail, 
  isLoading = false 
}) => {
  const [emailData, setEmailData] = useState({
    to: '',
    subject: 'Moje CV - ',
    message: 'Szanowni Państwo,\n\nW załączniku przesyłam swoje CV do Państwa rozpatrzenia.\n\nZ poważaniem,'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!emailData.to.includes('@')) {
      alert('Podaj prawidłowy adres email')
      return
    }
    onSendEmail(emailData)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full m-4"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Wyślij CV Email</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres odbiorcy
            </label>
            <input
              type="email"
              value={emailData.to}
              onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="recruiter@firma.pl"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temat
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Aplikacja na stanowisko..."
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wiadomość
            </label>
            <textarea
              value={emailData.message}
              onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-32 resize-none"
              placeholder="Wpisz wiadomość..."
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Wysyłanie...' : 'Wyślij'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/**
 * Export Progress Indicator
 */
const ExportProgress = ({ 
  isVisible, 
  format, 
  progress = 0 
}) => {
  if (!isVisible) return null

  const formatConfig = EXPORT_FORMATS[format] || EXPORT_FORMATS.pdf

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full m-4 text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${formatConfig.color} flex items-center justify-center text-2xl text-white`}>
          {formatConfig.icon}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Eksportowanie {formatConfig.name}
        </h3>
        
        <p className="text-gray-600 mb-4">
          Generowanie pliku...
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`bg-gradient-to-r ${formatConfig.color} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-sm text-gray-500">
          {progress}% ukończone
        </div>
      </div>
    </div>
  )
}

/**
 * CV to DOCX conversion
 */
const convertToDocx = async (cvData) => {
  try {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header
          new Paragraph({
            children: [
              new TextRun({
                text: cvData.name || 'Imię Nazwisko',
                bold: true,
                size: 32,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Contact Info
          new Paragraph({
            children: [
              new TextRun({
                text: [cvData.email, cvData.phone, cvData.location].filter(Boolean).join(' | '),
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Summary
          ...(cvData.summary ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Profil Zawodowy',
                  bold: true,
                  size: 28,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: cvData.summary,
                  size: 24,
                }),
              ],
              spacing: { after: 400 },
            }),
          ] : []),

          // Experience
          ...(cvData.experience && cvData.experience.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Doświadczenie Zawodowe',
                  bold: true,
                  size: 28,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            ...cvData.experience.map(exp => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${exp}`,
                    size: 24,
                  }),
                ],
                spacing: { after: 100 },
              })
            ),
          ] : []),

          // Education
          ...(cvData.education && cvData.education.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Wykształcenie',
                  bold: true,
                  size: 28,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            ...cvData.education.map(edu => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${edu}`,
                    size: 24,
                  }),
                ],
                spacing: { after: 100 },
              })
            ),
          ] : []),

          // Skills
          ...(cvData.skills && cvData.skills.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Umiejętności',
                  bold: true,
                  size: 28,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: cvData.skills.join(' • '),
                  size: 24,
                }),
              ],
              spacing: { after: 400 },
            }),
          ] : []),
        ],
      }],
    })

    return await Packer.toBlob(doc)
  } catch (error) {
    console.error('DOCX conversion failed:', error)
    throw error
  }
}

/**
 * CV to PDF conversion
 */
const convertToPdf = async (cvPreviewRef, cvData) => {
  try {
    if (!cvPreviewRef?.current) {
      throw new Error('CV preview element not found')
    }

    const canvas = await html2canvas(cvPreviewRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: cvPreviewRef.current.scrollWidth,
      height: cvPreviewRef.current.scrollHeight,
    })

    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    const pdf = new jsPDF('p', 'mm', 'a4')
    let position = 0

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    return pdf
  } catch (error) {
    console.error('PDF conversion failed:', error)
    throw error
  }
}

/**
 * Main ExportTools Component
 */
const ExportTools = ({ 
  cvData, 
  cvPreviewRef,
  userPlan = 'basic',
  isExporting = false,
  onExportStart,
  onExportComplete,
  onExportError 
}) => {
  const [exportProgress, setExportProgress] = useState(0)
  const [currentExportFormat, setCurrentExportFormat] = useState(null)
  const [emailModalVisible, setEmailModalVisible] = useState(false)
  const [isEmailSending, setIsEmailSending] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const availableFormats = EXPORT_ACCESS[userPlan] || EXPORT_ACCESS.basic

  /**
   * Generic export handler with progress simulation
   */
  const handleExport = async (format, exportFn) => {
    if (!cvData) {
      alert('Brak danych CV do eksportu')
      return
    }

    try {
      setCurrentExportFormat(format)
      setExportProgress(0)
      onExportStart?.(format)

      // Progress simulation
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          const newProgress = prev + Math.random() * 15 + 5
          return newProgress > 90 ? 90 : newProgress
        })
      }, 200)

      await exportFn()

      clearInterval(progressInterval)
      setExportProgress(100)

      // Complete animation
      setTimeout(() => {
        setCurrentExportFormat(null)
        setExportProgress(0)
        onExportComplete?.(format)
      }, 1000)

    } catch (error) {
      console.error(`Export ${format} failed:`, error)
      setCurrentExportFormat(null)
      setExportProgress(0)
      onExportError?.(format, error)
      alert(`Błąd eksportu ${format.toUpperCase()}: ${error.message}`)
    }
  }

  /**
   * PDF Export Handler
   */
  const handlePdfExport = () => {
    handleExport('pdf', async () => {
      const pdf = await convertToPdf(cvPreviewRef, cvData)
      const fileName = `CV_${cvData.name?.replace(/\s+/g, '_') || 'CVPerfect'}.pdf`
      pdf.save(fileName)
    })
  }

  /**
   * DOCX Export Handler
   */
  const handleDocxExport = () => {
    if (isDownloading) return // Prevent duplicate downloads
    
    setIsDownloading(true)
    handleExport('docx', async () => {
      const docxBlob = await convertToDocx(cvData)
      const fileName = `CV_${cvData.name?.replace(/\s+/g, '_') || 'CVPerfect'}.docx`
      saveAs(docxBlob, fileName)
    }).finally(() => {
      setTimeout(() => setIsDownloading(false), 1000) // Reset after 1 second
    })
  }

  /**
   * PNG Export Handler
   */
  const handlePngExport = () => {
    handleExport('png', async () => {
      if (!cvPreviewRef?.current) {
        throw new Error('CV preview not found')
      }

      const canvas = await html2canvas(cvPreviewRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })

      canvas.toBlob((blob) => {
        const fileName = `CV_${cvData.name?.replace(/\s+/g, '_') || 'CVPerfect'}.png`
        saveAs(blob, fileName)
      }, 'image/png')
    })
  }

  /**
   * HTML Export Handler
   */
  const handleHtmlExport = () => {
    handleExport('html', async () => {
      const htmlContent = cvPreviewRef?.current?.innerHTML || cvData.optimizedCV || 'Brak treści CV'
      
      const fullHtml = `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CV - ${cvData.name || 'CVPerfect'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        ${htmlContent}
    </div>
</body>
</html>`

      const blob = new Blob([fullHtml], { type: 'text/html' })
      const fileName = `CV_${cvData.name?.replace(/\s+/g, '_') || 'CVPerfect'}.html`
      saveAs(blob, fileName)
    })
  }

  /**
   * Email Handler
   */
  const handleEmailSend = async (emailData) => {
    setIsEmailSending(true)
    
    try {
      // First generate PDF for attachment
      const pdf = await convertToPdf(cvPreviewRef, cvData)
      const pdfBlob = pdf.output('blob')

      // Create FormData for email with attachment
      const formData = new FormData()
      formData.append('to', emailData.to)
      formData.append('subject', emailData.subject)
      formData.append('message', emailData.message)
      formData.append('attachment', pdfBlob, `CV_${cvData.name?.replace(/\s+/g, '_') || 'CVPerfect'}.pdf`)

      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Email failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Email sending failed')
      }

      alert('✅ Email wysłany pomyślnie!')
      setEmailModalVisible(false)

    } catch (error) {
      console.error('Email sending failed:', error)
      alert(`❌ Błąd wysyłania email: ${error.message}`)
    } finally {
      setIsEmailSending(false)
    }
  }

  /**
   * Export button renderer
   */
  const renderExportButton = (format) => {
    const config = EXPORT_FORMATS[format]
    const isAvailable = availableFormats.includes(format)
    const isCurrentlyExporting = isExporting || currentExportFormat === format

    const buttonHandlers = {
      pdf: handlePdfExport,
      docx: handleDocxExport,
      png: handlePngExport,
      html: handleHtmlExport,
      email: () => setEmailModalVisible(true)
    }

    return (
      <motion.button
        key={format}
        whileHover={isAvailable ? { scale: 1.05 } : {}}
        whileTap={isAvailable ? { scale: 0.95 } : {}}
        onClick={() => isAvailable && !isCurrentlyExporting && buttonHandlers[format]?.()}
        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
          isAvailable
            ? `bg-gradient-to-r ${config.color} text-white border-transparent hover:shadow-xl cursor-pointer`
            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
        } ${isCurrentlyExporting ? 'opacity-75' : ''}`}
        disabled={!isAvailable || isCurrentlyExporting}
      >
        {!isAvailable && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {userPlan === 'basic' ? 'GOLD+' : 'PREMIUM'}
          </div>
        )}
        
        <div className="text-center">
          <div className="text-4xl mb-3">{config.icon}</div>
          <h3 className="font-bold text-lg mb-1">{config.name}</h3>
          <p className={`text-sm ${isAvailable ? 'text-white/80' : 'text-gray-500'}`}>
            {config.description}
          </p>
          
          {isCurrentlyExporting && (
            <div className="mt-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
            </div>
          )}
        </div>
      </motion.button>
    )
  }

  return (
    <>
      {/* Export Progress */}
      <ExportProgress
        isVisible={currentExportFormat !== null}
        format={currentExportFormat}
        progress={exportProgress}
      />

      {/* Email Modal */}
      <AnimatePresence>
        {emailModalVisible && (
          <EmailModal
            isVisible={emailModalVisible}
            onClose={() => setEmailModalVisible(false)}
            onSendEmail={handleEmailSend}
            isLoading={isEmailSending}
          />
        )}
      </AnimatePresence>

      {/* Export Tools UI */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Eksportuj CV</h2>
          <div className="text-sm text-white/60">
            Plan {userPlan.toUpperCase()}: {availableFormats.length} formatów
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.keys(EXPORT_FORMATS).map(renderExportButton)}
        </div>

        {userPlan === 'basic' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl border border-yellow-400/30">
            <p className="text-sm text-yellow-100 text-center">
              💎 <strong>Upgrade do GOLD</strong> - odblokuj eksport DOCX, Email i więcej formatów
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default ExportTools
export { EXPORT_FORMATS, EXPORT_ACCESS }