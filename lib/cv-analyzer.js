// CVPerfect CV Analyzer Engine
// Advanced CV analysis with ATS scoring, keyword analysis, and quality assessment

const fs = require('fs').promises
const path = require('path')
const mammoth = require('mammoth')
const pdfParse = require('pdf-parse')

class CVAnalyzer {
  constructor() {
    this.atsKeywords = {
      tech: ['javascript', 'react', 'node.js', 'python', 'java', 'sql', 'git', 'api', 'frontend', 'backend'],
      business: ['management', 'leadership', 'strategy', 'analysis', 'project', 'team', 'communication'],
      skills: ['problem solving', 'analytical', 'creative', 'organized', 'detail-oriented', 'collaborative'],
      education: ['degree', 'university', 'certification', 'course', 'training', 'education']
    }
    
    this.qualityMetrics = {
      length: { min: 300, max: 2000, optimal: 800 },
      sections: ['experience', 'education', 'skills', 'contact'],
      formatting: ['bullet points', 'consistent dates', 'clear headings']
    }
  }

  async analyze(filePath, options = {}) {
    try {
      console.log('📄 Starting CV analysis:', filePath, options)

      // Extract text from CV file
      const extractedText = await this.extractText(filePath)
      
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Could not extract sufficient text from CV file')
      }

      // Perform comprehensive analysis
      const analysis = {
        metadata: {
          filePath,
          fileSize: await this.getFileSize(filePath),
          textLength: extractedText.length,
          analyzedAt: new Date().toISOString()
        },
        content: {
          text: extractedText.substring(0, 2000), // First 2000 chars for preview
          wordCount: extractedText.split(/\s+/).length
        },
        atsScore: await this.calculateAtsScore(extractedText, options),
        qualityScore: await this.calculateQualityScore(extractedText),
        keywords: await this.analyzeKeywords(extractedText, options.keywords),
        sections: await this.identifySections(extractedText),
        recommendations: await this.generateRecommendations(extractedText),
        formatting: await this.analyzeFormatting(extractedText)
      }

      // Calculate overall score
      analysis.overallScore = Math.round(
        (analysis.atsScore + analysis.qualityScore) / 2
      )

      console.log('✅ CV analysis completed:', {
        overallScore: analysis.overallScore,
        atsScore: analysis.atsScore,
        qualityScore: analysis.qualityScore
      })

      return analysis

    } catch (error) {
      console.error('❌ CV analysis failed:', error)
      throw new Error(`CV analysis failed: ${error.message}`)
    }
  }

  // Extract text from PDF or DOCX files
  async extractText(filePath) {
    const extension = path.extname(filePath).toLowerCase()
    
    try {
      // Handle different file types
      if (extension === '.pdf') {
        const pdfBuffer = await fs.readFile(filePath)
        const pdfData = await pdfParse(pdfBuffer)
        return pdfData.text
      } 
      else if (extension === '.docx') {
        const docxBuffer = await fs.readFile(filePath)
        const docxResult = await mammoth.extractRawText({ buffer: docxBuffer })
        return docxResult.value
      }
      else if (extension === '.txt') {
        return await fs.readFile(filePath, 'utf8')
      }
      else {
        // Try to read as text file
        return await fs.readFile(filePath, 'utf8')
      }
    } catch (error) {
      throw new Error(`Could not extract text from ${extension} file: ${error.message}`)
    }
  }

  // Calculate ATS (Applicant Tracking System) compatibility score
  async calculateAtsScore(text, options) {
    const normalizedText = text.toLowerCase()
    let score = 50 // Base score
    
    // Keyword matching
    const targetKeywords = options.keywords || this.atsKeywords.tech
    const foundKeywords = targetKeywords.filter(keyword => 
      normalizedText.includes(keyword.toLowerCase())
    )
    
    // Keyword score (0-30 points)
    const keywordScore = Math.min(30, (foundKeywords.length / targetKeywords.length) * 30)
    score += keywordScore

    // Section presence (0-20 points)
    const requiredSections = ['experience', 'education', 'skills']
    const foundSections = requiredSections.filter(section =>
      normalizedText.includes(section) || 
      normalizedText.includes(section.replace('experience', 'work'))
    )
    score += (foundSections.length / requiredSections.length) * 20

    // Contact information (0-10 points)
    const hasEmail = /@/.test(text)
    const hasPhone = /\+?[\d\s\-\(\)]{10,}/.test(text)
    if (hasEmail) score += 5
    if (hasPhone) score += 5

    // Format compatibility (0-10 points)
    const hasConsistentDates = /\d{4}/.test(text) // Year format
    const hasBulletPoints = /[•·\-\*]/.test(text)
    if (hasConsistentDates) score += 5
    if (hasBulletPoints) score += 5

    return Math.min(100, Math.round(score))
  }

  // Calculate overall quality score
  async calculateQualityScore(text) {
    let score = 50 // Base score
    
    // Length appropriateness (0-20 points)
    const wordCount = text.split(/\s+/).length
    if (wordCount >= this.qualityMetrics.length.min && wordCount <= this.qualityMetrics.length.max) {
      score += 20
    } else if (wordCount >= this.qualityMetrics.length.optimal * 0.8 && 
               wordCount <= this.qualityMetrics.length.optimal * 1.2) {
      score += 15
    } else {
      score += 5
    }

    // Content richness (0-15 points)
    const hasQuantifiableResults = /\d+%|\d+\$|\d+k|\d+ years/.test(text)
    const hasActionVerbs = /\b(developed|managed|created|improved|increased|led|built)\b/gi.test(text)
    
    if (hasQuantifiableResults) score += 8
    if (hasActionVerbs) score += 7

    // Professional language (0-15 points)
    const professionalWords = ['professional', 'experienced', 'skilled', 'expertise', 'accomplished']
    const foundProfessionalWords = professionalWords.filter(word => 
      text.toLowerCase().includes(word)
    )
    score += Math.min(15, foundProfessionalWords.length * 3)

    return Math.min(100, Math.round(score))
  }

  // Analyze keywords in CV
  async analyzeKeywords(text, customKeywords = []) {
    const normalizedText = text.toLowerCase()
    const result = {
      custom: [],
      tech: [],
      business: [],
      skills: []
    }

    // Check custom keywords
    if (customKeywords.length > 0) {
      result.custom = customKeywords.filter(keyword =>
        normalizedText.includes(keyword.toLowerCase())
      )
    }

    // Check predefined keyword categories
    Object.entries(this.atsKeywords).forEach(([category, keywords]) => {
      if (result[category] !== undefined) {
        result[category] = keywords.filter(keyword =>
          normalizedText.includes(keyword.toLowerCase())
        )
      }
    })

    result.total = Object.values(result).flat().length
    result.keywordsFound = result.total

    return result
  }

  // Identify CV sections
  async identifySections(text) {
    const sections = {
      contact: this.hasSection(text, ['contact', 'email', '@', 'phone']),
      summary: this.hasSection(text, ['summary', 'profile', 'objective']),
      experience: this.hasSection(text, ['experience', 'work', 'employment', 'career']),
      education: this.hasSection(text, ['education', 'degree', 'university', 'college']),
      skills: this.hasSection(text, ['skills', 'abilities', 'competencies', 'expertise']),
      certifications: this.hasSection(text, ['certification', 'certificate', 'license'])
    }

    sections.identified = Object.entries(sections).filter(([key, value]) => 
      key !== 'identified' && value
    ).map(([key]) => key)

    sections.missing = Object.entries(sections).filter(([key, value]) => 
      key !== 'identified' && key !== 'missing' && !value
    ).map(([key]) => key)

    return sections
  }

  // Check if section exists in text
  hasSection(text, keywords) {
    const normalizedText = text.toLowerCase()
    return keywords.some(keyword => normalizedText.includes(keyword))
  }

  // Generate improvement recommendations
  async generateRecommendations(text) {
    const recommendations = []
    const wordCount = text.split(/\s+/).length

    // Length recommendations
    if (wordCount < this.qualityMetrics.length.min) {
      recommendations.push('Add more details about your experience and achievements')
    } else if (wordCount > this.qualityMetrics.length.max) {
      recommendations.push('Consider condensing content - CV is quite long')
    }

    // Content recommendations
    if (!/\d+%|\d+\$|\d+k|\d+ years/.test(text)) {
      recommendations.push('Add quantifiable achievements (percentages, numbers, metrics)')
    }

    if (!/\b(developed|managed|created|improved|increased|led|built)\b/gi.test(text)) {
      recommendations.push('Use more action verbs to describe your accomplishments')
    }

    // Keyword recommendations
    const techKeywordsFound = this.atsKeywords.tech.filter(keyword =>
      text.toLowerCase().includes(keyword)
    ).length
    
    if (techKeywordsFound < 3) {
      recommendations.push('Include more relevant technical keywords for better ATS compatibility')
    }

    // Contact information
    if (!/@/.test(text)) {
      recommendations.push('Ensure your email address is clearly visible')
    }

    if (!/\+?[\d\s\-\(\)]{10,}/.test(text)) {
      recommendations.push('Add your phone number for better contact options')
    }

    return recommendations
  }

  // Analyze formatting quality
  async analyzeFormatting(text) {
    return {
      hasConsistentDates: /\d{4}/.test(text),
      hasBulletPoints: /[•·\-\*]/.test(text),
      hasProperCapitalization: /[A-Z]/.test(text),
      hasStructuredLayout: text.includes('\n'),
      formatting: {
        dateConsistency: /\d{4}/.test(text) ? 'good' : 'needs_improvement',
        bulletPoints: /[•·\-\*]/.test(text) ? 'present' : 'missing',
        structure: text.split('\n').length > 10 ? 'well_structured' : 'basic'
      }
    }
  }

  // Get file size
  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath)
      return {
        bytes: stats.size,
        formatted: this.formatBytes(stats.size)
      }
    } catch (error) {
      return { bytes: 0, formatted: 'Unknown' }
    }
  }

  // Format bytes to human readable
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }
}

module.exports = CVAnalyzer