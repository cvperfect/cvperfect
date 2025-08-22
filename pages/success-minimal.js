import React, { useState, useEffect } from 'react'

export default function SuccessMinimal() {
  const [cvData, setCvData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('SuccessMinimal: Component mounted')
    
    // Simple demo data without heavy processing
    setCvData({
      name: 'Anna Kowalska',
      email: 'anna.kowalska@email.com', 
      phone: '+48 123 456 789',
      personalInfo: {
        name: 'Anna Kowalska',
        email: 'anna.kowalska@email.com',
        phone: '+48 123 456 789'
      }
    })
    
    setLoading(false)
    console.log('SuccessMinimal: Data set')
  }, [])

  if (loading) {
    return (
      <div style={{padding: '50px', textAlign: 'center'}}>
        <h1>Loading...</h1>
      </div>
    )
  }

  return (
    <div style={{padding: '50px', maxWidth: '800px', margin: '0 auto'}}>
      <h1>CV Success Page - Minimal Test</h1>
      
      <div style={{border: '1px solid #ccc', padding: '20px', marginTop: '20px'}}>
        <h2>CV Preview</h2>
        <div className="cv-preview-content">
          <h3>{cvData?.name}</h3>
          <p>Email: {cvData?.email}</p>
          <p>Phone: {cvData?.phone}</p>
          <p>This is a minimal test of the success page.</p>
        </div>
      </div>

      <div style={{marginTop: '20px'}}>
        <button 
          style={{
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Test Button 1
        </button>
        <button 
          style={{
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white', 
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Test Button 2
        </button>
      </div>
    </div>
  )
}