import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import jsPDF from 'jspdf'

export default function Success() {
  const router = useRouter()
  const { session_id } = router.query
  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session_id) {
      fetchSession()
    }
  }, [session_id])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/get-session?session_id=${session_id}`)
      const data = await response.json()
      setSessionData(data)
    } catch (error) {
      console.error('Error fetching session:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    if (!sessionData) return

    const cv = Buffer.from(sessionData.metadata.cv, 'base64').toString('utf-8')
    const coverLetter = Buffer.from(sessionData.metadata.coverLetter, 'base64').toString('utf-8')

    const doc = new jsPDF()
    
    // Add CV
    doc.setFontSize(20)
    doc.text('Curriculum Vitae', 20, 20)
    
    doc.setFontSize(12)
    const cvLines = doc.splitTextToSize(cv, 170)
    doc.text(cvLines, 20, 40)
    
    // Add new page for cover letter
    doc.addPage()
    doc.setFontSize(20)
    doc.text('List Motywacyjny', 20, 20)
    
    doc.setFontSize(12)
    const clLines = doc.splitTextToSize(coverLetter, 170)
    doc.text(clLines, 20, 40)
    
    doc.save('cv-perfect.pdf')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dziękujemy za zakup - CvPerfect</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Dziękujemy za zakup!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Twoja płatność została pomyślnie przetworzona. Możesz teraz pobrać swoje CV i list motywacyjny w formacie PDF.
            </p>

            <button
              onClick={downloadPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-200 mb-8"
            >
              📄 Pobierz PDF
            </button>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Co dalej?</h2>
              <ul className="text-left space-y-2 text-gray-600">
                <li>✓ Sprawdź pobrane dokumenty</li>
                <li>✓ Dostosuj je do swoich potrzeb</li>
                <li>✓ Wyślij aplikację do wymarzonej pracy</li>
                <li>✓ Powodzenia w poszukiwaniach!</li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                ← Wróć do strony głównej
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}