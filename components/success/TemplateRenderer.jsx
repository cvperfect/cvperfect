import { useMemo } from 'react'
import DOMPurify from 'dompurify'

/**
 * TemplateRenderer - CV Templates with Plan-Based Access
 * Extracted from success.js for bundle optimization
 * BUNDLE REDUCTION: Lazy loadable template system
 */

/**
 * Plan-based template access control
 */
const PLAN_ACCESS = {
  basic: ['simple', 'modern'],
  gold: ['simple', 'modern', 'professional', 'creative'], 
  premium: ['simple', 'modern', 'professional', 'creative', 'executive', 'minimalist', 'bold']
}

/**
 * Template configurations
 */
const TEMPLATES = {
  simple: {
    name: 'Prosty',
    description: 'Klasyczny, czytelny szablon',
    className: 'bg-white text-gray-900 font-sans',
    headerClass: 'border-b border-gray-300 pb-4 mb-6',
    sectionClass: 'mb-6',
    titleClass: 'text-xl font-bold text-gray-900 mb-2'
  },
  modern: {
    name: 'Nowoczesny', 
    description: 'Elegancki design z akcentami kolorystycznymi',
    className: 'bg-gradient-to-br from-gray-50 to-white text-gray-800',
    headerClass: 'border-l-4 border-blue-500 pl-6 pb-4 mb-6',
    sectionClass: 'mb-8',
    titleClass: 'text-lg font-semibold text-blue-700 mb-3'
  },
  professional: {
    name: 'Profesjonalny',
    description: 'Biznesowy styl dla korporacji', 
    className: 'bg-white text-gray-900 border border-gray-200',
    headerClass: 'bg-gray-100 p-6 mb-6',
    sectionClass: 'px-6 mb-6',
    titleClass: 'text-lg font-bold text-gray-900 uppercase tracking-wide mb-4'
  },
  creative: {
    name: 'Kreatywny',
    description: 'Dynamiczny szablon dla branż kreatywnych',
    className: 'bg-gradient-to-r from-purple-50 to-pink-50 text-gray-800',
    headerClass: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg mb-6',
    sectionClass: 'px-6 mb-6',
    titleClass: 'text-lg font-bold text-purple-700 mb-3'
  },
  executive: {
    name: 'Executive',
    description: 'Premium szablon dla kadry zarządzającej',
    className: 'bg-gray-900 text-white border border-gold-400',
    headerClass: 'border-b border-gold-400 pb-6 mb-8',
    sectionClass: 'mb-8',
    titleClass: 'text-xl font-bold text-gold-400 mb-4'
  },
  minimalist: {
    name: 'Minimalistyczny',
    description: 'Czysty, oszczędny design',
    className: 'bg-white text-black font-light',
    headerClass: 'border-b border-black pb-2 mb-8',
    sectionClass: 'mb-8',
    titleClass: 'text-sm font-normal uppercase tracking-widest mb-4'
  },
  bold: {
    name: 'Odważny',
    description: 'Wyrazisty szablon z mocnymi akcentami',
    className: 'bg-black text-white',
    headerClass: 'bg-red-600 text-white p-8 mb-8',
    sectionClass: 'px-8 mb-8',
    titleClass: 'text-2xl font-black text-red-500 mb-4'
  }
}

/**
 * CV Content Sanitization
 */
const sanitizeContent = (content) => {
  if (typeof window === 'undefined' || !content) return content || ''
  
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'span', 'img', 'section'],
    ALLOWED_ATTR: ['class', 'style', 'src', 'alt', 'href', 'title', 'id'],
    KEEP_CONTENT: true,
    FORBID_SCRIPT: true
  })
}

/**
 * Template Selector Component
 */
const TemplateSelector = ({ 
  selectedTemplate, 
  userPlan = 'basic', 
  onTemplateChange,
  isVisible = false,
  onClose 
}) => {
  const availableTemplates = PLAN_ACCESS[userPlan] || PLAN_ACCESS.basic
  
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-4xl max-h-[80vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Wybierz Szablon CV</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Object.entries(TEMPLATES).map(([templateKey, template]) => {
            const isAvailable = availableTemplates.includes(templateKey)
            const isSelected = selectedTemplate === templateKey
            
            return (
              <div
                key={templateKey}
                className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-50' 
                    : isAvailable 
                    ? 'border-gray-200 hover:border-purple-300' 
                    : 'border-gray-100 opacity-50'
                }`}
                onClick={() => isAvailable && onTemplateChange(templateKey)}
              >
                {!isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔒</div>
                      <div className="text-sm font-semibold text-gray-600">
                        {userPlan === 'basic' ? 'GOLD+' : 'PREMIUM'}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-4xl">📄</div>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
                
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                    ✓
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Plan {userPlan.toUpperCase()}: {availableTemplates.length} z {Object.keys(TEMPLATES).length} szablonów dostępnych
          </p>
          
          {userPlan === 'basic' && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                💎 <strong>Upgrade do GOLD</strong> - odblokuj 4 dodatkowe szablony profesjonalne
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * CV Section Renderer
 */
const CVSection = ({ title, content, template, className = "" }) => {
  const config = TEMPLATES[template] || TEMPLATES.simple
  
  if (!content || (Array.isArray(content) && content.length === 0)) {
    return null
  }

  return (
    <div className={`${config.sectionClass} ${className}`}>
      <h2 className={config.titleClass}>{title}</h2>
      <div className="text-sm leading-relaxed">
        {Array.isArray(content) ? (
          <ul className="list-disc list-inside space-y-1">
            {content.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: sanitizeContent(item) }} />
            ))}
          </ul>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: sanitizeContent(content) }} />
        )}
      </div>
    </div>
  )
}

/**
 * Main TemplateRenderer Component
 */
const TemplateRenderer = ({ 
  cvData, 
  selectedTemplate = 'simple', 
  userPlan = 'basic',
  onTemplateChange,
  showTemplateSelector = false,
  onTemplateModalClose 
}) => {
  
  // Memoized template configuration
  const templateConfig = useMemo(() => {
    return TEMPLATES[selectedTemplate] || TEMPLATES.simple
  }, [selectedTemplate])
  
  // Memoized available templates for user plan
  const availableTemplates = useMemo(() => {
    return PLAN_ACCESS[userPlan] || PLAN_ACCESS.basic
  }, [userPlan])
  
  // Ensure selected template is available for user plan
  const activeTemplate = useMemo(() => {
    if (availableTemplates.includes(selectedTemplate)) {
      return selectedTemplate
    }
    return availableTemplates[0] || 'simple'
  }, [selectedTemplate, availableTemplates])

  if (!cvData) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold text-white mb-2">Brak danych CV</h3>
          <p className="text-white/70">Wczytaj dane CV aby wyświetlić podgląd</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Template Selector Modal */}
      <TemplateSelector
        selectedTemplate={activeTemplate}
        userPlan={userPlan}
        onTemplateChange={onTemplateChange}
        isVisible={showTemplateSelector}
        onClose={onTemplateModalClose}
      />
      
      {/* CV Render */}
      <div className="max-w-sm mx-auto p-2 sm:max-w-lg sm:p-3 md:max-w-xl md:p-4 lg:max-w-2xl lg:p-6 xl:max-w-4xl xl:p-8">
        <div className={`${templateConfig.className} rounded-xl shadow-2xl min-h-[600px] p-4 sm:p-6 md:p-8 lg:min-h-[800px]`}>
          
          {/* Header Section */}
          <header className={templateConfig.headerClass}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6">
              {cvData.profilePicture && (
                <img
                  src={cvData.profilePicture}
                  alt="Zdjęcie profilowe"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              )}
              
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                  {cvData.name || 'Imię Nazwisko'}
                </h1>
                
                <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm opacity-80">
                  {cvData.email && (
                    <div className="flex items-center gap-2">
                      📧 {cvData.email}
                    </div>
                  )}
                  {cvData.phone && (
                    <div className="flex items-center gap-2">
                      📱 {cvData.phone}
                    </div>
                  )}
                  {cvData.location && (
                    <div className="flex items-center gap-2">
                      📍 {cvData.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Summary Section */}
          {cvData.summary && (
            <CVSection 
              title="Profil Zawodowy"
              content={cvData.summary}
              template={activeTemplate}
            />
          )}

          {/* Experience Section */}
          {cvData.experience && cvData.experience.length > 0 && (
            <CVSection 
              title="Doświadczenie Zawodowe"
              content={cvData.experience}
              template={activeTemplate}
            />
          )}

          {/* Education Section */}
          {cvData.education && cvData.education.length > 0 && (
            <CVSection 
              title="Wykształcenie"
              content={cvData.education}
              template={activeTemplate}
            />
          )}

          {/* Skills Section */}
          {cvData.skills && cvData.skills.length > 0 && (
            <CVSection 
              title="Umiejętności"
              content={cvData.skills}
              template={activeTemplate}
            />
          )}

          {/* Languages Section */}
          {cvData.languages && cvData.languages.length > 0 && (
            <CVSection 
              title="Języki"
              content={cvData.languages}
              template={activeTemplate}
            />
          )}

          {/* Additional Sections */}
          {cvData.certifications && cvData.certifications.length > 0 && (
            <CVSection 
              title="Certyfikaty"
              content={cvData.certifications}
              template={activeTemplate}
            />
          )}

          {cvData.projects && cvData.projects.length > 0 && (
            <CVSection 
              title="Projekty"
              content={cvData.projects}
              template={activeTemplate}
            />
          )}
          
        </div>
        
        {/* Template Info Footer */}
        <div className="mt-4 text-center text-sm text-white/60">
          <p>
            Szablon: <strong>{templateConfig.name}</strong> | 
            Plan: <strong>{userPlan.toUpperCase()}</strong> |
            {availableTemplates.length}/{Object.keys(TEMPLATES).length} szablonów dostępnych
          </p>
        </div>
      </div>
    </>
  )
}

export default TemplateRenderer
export { TEMPLATES, PLAN_ACCESS, TemplateSelector }