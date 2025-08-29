// Początek części 1

// components/LiveResumeEditor.jsx
// ==========================================
// Live CV Preview with Multiple Templates
// Renders A4-formatted CV based on selected template
// ==========================================

import React, { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * LiveResumeEditor - Real-time CV preview component
 * @param {string} template - Selected template ID
 * @param {object} data - CV data object
 * @param {boolean} watermark - Show watermark for non-premium users
 */

// Helper function to ensure data is properly structured
const ensureSafeData = (data) => ({
  header: data?.header || {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    photo: { url: null, cropped: false, position: { x: 0, y: 0 } }
  },
  summary: data?.summary || '',
  experience: data?.experience || [],
  education: data?.education || [],
  skills: data?.skills || [],
  links: data?.links || []
});

const LiveResumeEditor = memo(({ template, data, watermark }) => {
  const safeData = ensureSafeData(data);
  
  // Select template renderer based on template ID
  const TemplateRenderer = useMemo(() => {
    switch (template) {
      case 'simple': return SimpleTemplate;
      case 'modern': return ModernTemplate;
      case 'minimal': return MinimalTemplate;
      case 'elegant': return ElegantTemplate;
      case 'executive': return ExecutiveTemplate;
      case 'design': return DesignTemplate;
      case 'tech': return TechTemplate;
      case 'serif': return SerifTemplate;
      case 'nordic': return NordicTemplate;
      default: return SimpleTemplate;
    }
  }, [template]);
  
  return (
    <div className="resume-preview" data-template={template}>
      {/* Watermark for non-premium plans */}
      {watermark && (
        <div className="watermark">
          <span>CvPerfect</span>
        </div>
      )}
      
      {/* Render selected template */}
      <TemplateRenderer data={safeData} />
    </div>
  );
});

LiveResumeEditor.displayName = 'LiveResumeEditor';

// ==========================================
// TEMPLATE COMPONENTS
// Based on top CV builder competition designs
// ==========================================

/**
 * Simple Classic Template - Clean, traditional layout
 * Inspired by: Classic Microsoft Word templates
 */
const SimpleTemplate = ({ data }) => {
  const safeData = ensureSafeData(data);
  
  return (
    <div className="template-simple">
      {/* Header */}
      <header className="cv-header">
        <h1 className="name">{safeData.header.name || 'Your Name'}</h1>
        <p className="title">{safeData.header.title || 'Professional Title'}</p>
        <div className="contact-info">
          {safeData.header.email && <span>✉️ {safeData.header.email}</span>}
          {safeData.header.phone && <span>📱 {safeData.header.phone}</span>}
          {safeData.header.location && <span>📍 {safeData.header.location}</span>}
        </div>
      </header>
      
      {/* Summary */}
      {safeData.summary && (
        <section className="cv-section">
          <h2>Professional Summary</h2>
          <p>{safeData.summary}</p>
        </section>
      )}
      
      {/* Experience */}
      {safeData.experience?.length > 0 && (
        <section className="cv-section">
          <h2>Experience</h2>
          {safeData.experience.map((exp, idx) => (
            <div key={idx} className="experience-item">
              <div className="exp-header">
                <h3>{exp.position}</h3>
                <span className="period">{exp.period}</span>
              </div>
              <p className="company">{exp.company}</p>
              <p className="description">{exp.description}</p>
            </div>
          ))}
        </section>
      )}
      
      {/* Education */}
      {safeData.education?.length > 0 && (
        <section className="cv-section">
          <h2>Education</h2>
          {safeData.education.map((edu, idx) => (
            <div key={idx} className="education-item">
              <div className="edu-header">
                <h3>{edu.degree}</h3>
                <span className="period">{edu.period}</span>
              </div>
              <p className="school">{edu.school}</p>
            </div>
          ))}
        </section>
      )}
      
      {/* Skills */}
      {safeData.skills?.length > 0 && (
        <section className="cv-section">
          <h2>Skills</h2>
          <div className="skills-list">
            {safeData.skills.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

/**
 * Modern Pro Template - Contemporary design with sidebar
 * Inspired by: Canva, Resume.io modern templates
 */
const ModernTemplate = ({ data }) => {
  const safeData = ensureSafeData(data);
  
  return (
    <div className="template-modern">
      <div className="modern-sidebar">
        {/* Photo Circle */}
        {safeData.header.photo?.url && (
          <div className="photo-container">
            <img src={safeData.header.photo.url} alt={safeData.header.name} />
          </div>
        )}
        
        {/* Contact */}
        <div className="sidebar-section">
          <h3>Contact</h3>
          {safeData.header.email && <p>📧 {safeData.header.email}</p>}
          {safeData.header.phone && <p>📱 {safeData.header.phone}</p>}
          {safeData.header.location && <p>📍 {safeData.header.location}</p>}
        </div>
        
        {/* Skills */}
        {safeData.skills?.length > 0 && (
          <div className="sidebar-section">
            <h3>Skills</h3>
            {safeData.skills.map((skill, idx) => (
              <div key={idx} className="skill-bar">
                <span>{skill}</span>
                <div className="bar">
                  <div className="bar-fill" style={{ width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Links */}
        {safeData.links?.length > 0 && (
          <div className="sidebar-section">
            <h3>Links</h3>
            {safeData.links.map((link, idx) => (
              <a key={idx} href={link.url} className="link-item">
                {link.type === 'linkedin' && '🔗 LinkedIn'}
                {link.type === 'github' && '💻 GitHub'}
                {link.type === 'portfolio' && '🌐 Portfolio'}
              </a>
            ))}
          </div>
        )}
      </div>
      
      <div className="modern-main">
        {/* Header */}
        <header className="modern-header">
          <h1>{safeData.header.name || 'Your Name'}</h1>
          <h2>{safeData.header.title || 'Professional Title'}</h2>
        </header>
        
        {/* Summary */}
        {safeData.summary && (
          <section className="modern-section">
            <h3>About Me</h3>
            <p>{safeData.summary}</p>
          </section>
        )}
        
        {/* Experience */}
        {safeData.experience?.length > 0 && (
          <section className="modern-section">
            <h3>Professional Experience</h3>
            {safeData.experience.map((exp, idx) => (
              <div key={idx} className="modern-exp">
                <div className="exp-timeline">
                  <div className="timeline-dot" />
                  <div className="timeline-line" />
                </div>
                <div className="exp-content">
                  <h4>{exp.position} @ {exp.company}</h4>
                  <span className="exp-period">{exp.period}</span>
                  <p>{exp.description}</p>
                </div>
              </div>
            ))}
          </section>
        )}
        
        {/* Education */}
        {safeData.education?.length > 0 && (
          <section className="modern-section">
            <h3>Education</h3>
            {safeData.education.map((edu, idx) => (
              <div key={idx} className="modern-edu">
                <h4>{edu.degree}</h4>
                <p>{edu.school} • {edu.period}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

// Koniec części 1

// Początek części 2

/**
 * Minimal Pro Template - Ultra clean, whitespace-focused
 * Inspired by: Scandinavian design, Apple aesthetic
 */
const MinimalTemplate = ({ data }) => {
  const safeData = ensureSafeData(data);
  
  return (
    <div className="template-minimal">
      {/* Centered Header */}
      <header className="minimal-header">
        <h1>{safeData.header.name || 'Your Name'}</h1>
        <div className="minimal-divider" />
        <p className="minimal-title">{safeData.header.title}</p>
        <div className="minimal-contact">
          {safeData.header.email} {safeData.header.phone && `• ${safeData.header.phone}`}
        </div>
      </header>
      
      {/* Content with generous spacing */}
      <div className="minimal-content">
        {safeData.summary && (
          <section className="minimal-section">
            <p className="summary-text">{safeData.summary}</p>
          </section>
        )}
        
        {safeData.experience?.length > 0 && (
          <section className="minimal-section">
            <h2>Experience</h2>
            {safeData.experience.map((exp, idx) => (
              <article key={idx} className="minimal-item">
                <div className="item-header">
                  <strong>{exp.position}</strong>
                  <span>{exp.period}</span>
                </div>
                <p className="item-subtitle">{exp.company}</p>
                <p className="item-description">{exp.description}</p>
              </article>
            ))}
          </section>
        )}
        
        {safeData.education?.length > 0 && (
          <section className="minimal-section">
            <h2>Education</h2>
            {safeData.education.map((edu, idx) => (
              <article key={idx} className="minimal-item">
                <div className="item-header">
                  <strong>{edu.degree}</strong>
                  <span>{edu.period}</span>
                </div>
                <p className="item-subtitle">{edu.school}</p>
              </article>
            ))}
          </section>
        )}
        
        {safeData.skills?.length > 0 && (
          <section className="minimal-section">
            <h2>Skills</h2>
            <p className="skills-inline">
              {safeData.skills.join(' • ')}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

/**
 * Elegant Pro Template - Sophisticated with accent colors
 * Inspired by: Zety elegant templates
 */
const ElegantTemplate = ({ data }) => {
  const safeData = ensureSafeData(data);
  
  return (
    <div className="template-elegant">
      {/* Gradient accent header */}
      <header className="elegant-header">
        <div className="header-gradient">
          <h1>{safeData.header.name}</h1>
          <p className="subtitle">{safeData.header.title}</p>
        </div>
        <div className="header-info">
          <span>{safeData.header.email}</span>
          <span>{safeData.header.phone}</span>
          <span>{safeData.header.location}</span>
        </div>
      </header>
      
      <div className="elegant-body">
        {/* Two-column layout */}
        <div className="elegant-columns">
          <div className="main-column">
            {safeData.summary && (
              <section className="elegant-section">
                <h2>Profile</h2>
                <p>{safeData.summary}</p>
              </section>
            )}
            
            {safeData.experience?.length > 0 && (
              <section className="elegant-section">
                <h2>Experience</h2>
                {safeData.experience.map((exp, idx) => (
                  <div key={idx} className="elegant-exp">
                    <h3>{exp.position}</h3>
                    <p className="company-line">
                      <strong>{exp.company}</strong> | {exp.period}
                    </p>
                    <p>{exp.description}</p>
                  </div>
                ))}
              </section>
            )}
          </div>
          
          <aside className="side-column">
            {safeData.skills?.length > 0 && (
              <section className="elegant-section">
                <h2>Expertise</h2>
                <ul className="elegant-skills">
                  {safeData.skills.map((skill, idx) => (
                    <li key={idx}>{skill}</li>
                  ))}
                </ul>
              </section>
            )}
            
            {safeData.education?.length > 0 && (
              <section className="elegant-section">
                <h2>Education</h2>
                {safeData.education.map((edu, idx) => (
                  <div key={idx} className="elegant-edu">
                    <h4>{edu.degree}</h4>
                    <p>{edu.school}</p>
                    <p className="period">{edu.period}</p>
                  </div>
                ))}
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

/**
 * Executive Ultra Template - Premium corporate design
 * Inspired by: High-end executive resume services
 */
const ExecutiveTemplate = ({ data }) => {
  const safeData = ensureSafeData(data);
  
  return (
    <div className="template-executive">
      {/* Prestigious header with gold accents */}
      <header className="exec-header">
        <div className="exec-name-block">
          <h1 className="exec-name">{safeData.header.name}</h1>
          <div className="exec-line" />
          <p className="exec-title">{safeData.header.title}</p>
        </div>
        <div className="exec-contact">
          <div>{safeData.header.email}</div>
          <div>{safeData.header.phone}</div>
          <div>{safeData.header.location}</div>
        </div>
      </header>
      
      {/* Executive Summary */}
      {safeData.summary && (
        <section className="exec-section exec-summary">
          <h2>Executive Summary</h2>
          <p className="summary-text">{safeData.summary}</p>
        </section>
      )}
      
      {/* Core Competencies */}
      {safeData.skills?.length > 0 && (
        <section className="exec-section">
          <h2>Core Competencies</h2>
          <div className="exec-skills-grid">
            {safeData.skills.map((skill, idx) => (
              <div key={idx} className="exec-skill">
                <span className="skill-bullet">▸</span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Professional Experience */}
      {safeData.experience?.length > 0 && (
        <section className="exec-section">
          <h2>Professional Experience</h2>
          {safeData.experience.map((exp, idx) => (
            <div key={idx} className="exec-exp">
              <div className="exp-header">
                <h3>{exp.company}</h3>
                <span className="exp-period">{exp.period}</span>
              </div>
              <h4 className="exp-position">{exp.position}</h4>
              <p className="exp-desc">{exp.description}</p>
            </div>
          ))}
        </section>
      )}
      
      {/* Education & Credentials */}
      {safeData.education?.length > 0 && (
        <section className="exec-section">
          <h2>Education & Credentials</h2>
          {safeData.education.map((edu, idx) => (
            <div key={idx} className="exec-edu">
              <h3>{edu.degree}</h3>
              <p>{edu.school} • {edu.period}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

/**
 * Design Lead Template - Creative with visual elements
 * Inspired by: Behance, Dribbble portfolios
 */
const DesignTemplate = ({ data }) => {
  const safeData = ensureSafeData(data);
  
  return (
    <div className="template-design">
      {/* Creative header with shapes */}
      <header className="design-header">
        <div className="design-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="design-text">
          <h1>{safeData.header.name}</h1>
          <p className="design-title">{safeData.header.title}</p>
        </div>
      </header>
      
      {/* Grid layout */}
      <div className="design-grid">
        {/* About card */}
        {safeData.summary && (
          <div className="design-card card-about">
            <h2>About</h2>
            <p>{safeData.summary}</p>
          </div>
        )}
        
        {/* Skills card */}
        {safeData.skills?.length > 0 && (
          <div className="design-card card-skills">
            <h2>Skills</h2>
            <div className="skill-bubbles">
              {safeData.skills.map((skill, idx) => (
                <span key={idx} className="skill-bubble">{skill}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* Experience cards */}
        {safeData.experience?.map((exp, idx) => (
          <div key={idx} className="design-card card-exp">
            <div className="card-number">{String(idx + 1).padStart(2, '0')}</div>
            <h3>{exp.position}</h3>
            <p className="exp-meta">{exp.company} • {exp.period}</p>
            <p>{exp.description}</p>
          </div>
        ))}
        
        {/* Education card */}
        {safeData.education?.length > 0 && (
          <div className="design-card card-edu">
            <h2>Education</h2>
            {safeData.education.map((edu, idx) => (
              <div key={idx} className="edu-item">
                <h4>{edu.degree}</h4>
                <p>{edu.school}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Tech Director Template - Developer-focused with code aesthetics
 * Inspired by: GitHub, Stack Overflow profiles
 */
const TechTemplate = ({ data }) => {
  const safeData = ensureSafeData(data);
  
  return (
    <div className="template-tech">
      {/* Terminal-style header */}
      <header className="tech-header">
        <div className="terminal-bar">
          <div className="terminal-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div className="terminal-title">resume.js</div>
        </div>
        <div className="terminal-content">
          <pre>
            <code>
              {`const developer = {
  name: "${safeData.header.name || 'Your Name'}",
  role: "${safeData.header.title || 'Software Developer'}",
  contact: {
    email: "${safeData.header.email || 'email@example.com'}",
    phone: "${safeData.header.phone || '+1234567890'}"
  }
};`}
            </code>
          </pre>
        </div>
      </header>
      
      {/* Tech content */}
      <div className="tech-body">
        {/* README section */}
        {safeData.summary && (
          <section className="tech-section">
            <h2>## README.md</h2>
            <p className="tech-summary">{safeData.summary}</p>
          </section>
        )}
        
        {/* Tech Stack */}
        {safeData.skills?.length > 0 && (
          <section className="tech-section">
            <h2>## Tech Stack</h2>
            <div className="tech-stack">
              {safeData.skills.map((skill, idx) => (
                <span key={idx} className="tech-badge">
                  <span className="badge-icon">⚡</span>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
        
        {/* Work History */}
        {safeData.experience?.length > 0 && (
          <section className="tech-section">
            <h2>## Work History</h2>
            {safeData.experience.map((exp, idx) => (
              <div key={idx} className="tech-exp">
                <div className="commit-line">
                  <span className="commit-hash">#{idx + 1}</span>
                  <span className="commit-message">{exp.position} @ {exp.company}</span>
                  <span className="commit-date">{exp.period}</span>
                </div>
                <p className="commit-desc">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {/* Education */}
        {safeData.education?.length > 0 && (
          <section className="tech-section">
            <h2>## Education</h2>
            {safeData.education.map((edu, idx) => (
              <div key={idx} className="tech-edu">
                <code>{edu.degree} // {edu.school} ({edu.period})</code>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

// Koniec części 2

// Początek części 3

/**
 * Classic Serif Pro Template - Traditional academic style
 * Inspired by: LaTeX academic CVs
 */
const SerifTemplate = ({ data }) => {
  const safeData = ensureSafeData(data);
  
  return (
    <div className="template-serif">
      {/* Classic centered header */}
      <header className="serif-header">
        <h1 className="serif-name">{safeData.header.name}</h1>
        <div className="serif-rule" />
        <p className="serif-title">{safeData.header.title}</p>
        <p className="serif-contact">
          {safeData.header.email} | {safeData.header.phone} | {safeData.header.location}
        </p>
      </header>
      
      {/* Traditional sections */}
      <div className="serif-body">
        {safeData.summary && (
          <section className="serif-section">
            <h2>Professional Profile</h2>
            <p className="serif-text">{safeData.summary}</p>
          </section>
        )}
        
        {safeData.experience?.length > 0 && (
          <section className="serif-section">
            <h2>Professional Experience</h2>
            {safeData.experience.map((exp, idx) => (
              <div key={idx} className="serif-exp">
                <div className="serif-exp-header">
                  <strong>{exp.position}</strong>
                  <em>{exp.period}</em>
                </div>
                <p className="serif-company">{exp.company}</p>
                <p className="serif-desc">{exp.description}</p>
              </div>
            ))}
          </section>
        )}
        
        {safeData.education?.length > 0 && (
          <section className="serif-section">
            <h2>Education</h2>
            {safeData.education.map((edu, idx) => (
              <div key={idx} className="serif-edu">
                <div className="serif-edu-header">
                  <strong>{edu.degree}</strong>
                  <em>{edu.period}</em>
                </div>
                <p>{edu.school}</p>
              </div>
            ))}
          </section>
        )}
        
        {safeData.skills?.length > 0 && (
          <section className="serif-section">
            <h2>Core Competencies</h2>
            <p className="serif-skills">
              {safeData.skills.join(' • ')}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

/**
 * Nordic Clean Template - Scandinavian minimalism
 * Inspired by: IKEA, Nordic design principles
 */
const NordicTemplate = ({ data }) => {
  const safeData = ensureSafeData(data);
  
  return (
    <div className="template-nordic">
      {/* Clean Nordic header */}
      <header className="nordic-header">
        <div className="nordic-photo">
          {safeData.header.photo?.url ? (
            <img src={safeData.header.photo.url} alt={safeData.header.name} />
          ) : (
            <div className="photo-placeholder" />
          )}
        </div>
        <div className="nordic-info">
          <h1>{safeData.header.name}</h1>
          <p className="nordic-title">{safeData.header.title}</p>
          <div className="nordic-contact">
            <a href={`mailto:${safeData.header.email}`}>{safeData.header.email}</a>
            <span>{safeData.header.phone}</span>
            <span>{safeData.header.location}</span>
          </div>
        </div>
      </header>
      
      {/* Clean content blocks */}
      <div className="nordic-content">
        {safeData.summary && (
          <section className="nordic-block">
            <h2>Om mig</h2>
            <p>{safeData.summary}</p>
          </section>
        )}
        
        {safeData.experience?.length > 0 && (
          <section className="nordic-block">
            <h2>Erfarenhet</h2>
            {safeData.experience.map((exp, idx) => (
              <article key={idx} className="nordic-item">
                <h3>{exp.position}</h3>
                <p className="nordic-meta">{exp.company} • {exp.period}</p>
                <p>{exp.description}</p>
              </article>
            ))}
          </section>
        )}
        
        {safeData.education?.length > 0 && (
          <section className="nordic-block">
            <h2>Utbildning</h2>
            {safeData.education.map((edu, idx) => (
              <article key={idx} className="nordic-item">
                <h3>{edu.degree}</h3>
                <p className="nordic-meta">{edu.school} • {edu.period}</p>
              </article>
            ))}
          </section>
        )}
        
        {safeData.skills?.length > 0 && (
          <section className="nordic-block">
            <h2>Kompetenser</h2>
            <div className="nordic-skills">
              {safeData.skills.map((skill, idx) => (
                <span key={idx} className="nordic-skill">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// ==========================================
// PHOTO UPLOAD COMPONENT
// ==========================================

/**
 * PhotoUpload - Secure image upload with crop and validation
 * Implements multi-layer security checks
 */
const PhotoUpload = ({ photo, onUpload, loading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropData, setCropData] = useState({ x: 0, y: 0, scale: 1 });
  
  /**
   * Validate image file with multiple security layers
   * @param {File} file - The uploaded file
   * @returns {Promise<boolean>} - Validation result
   */
  const validateImage = async (file) => {
    // Layer 1: Check file extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
    }
    
    // Layer 2: Check MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error('Invalid MIME type detected.');
    }
    
    // Layer 3: Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }
    
    // Layer 4: Check magic bytes (file signature)
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check for JPEG magic bytes (FF D8 FF)
    const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
    
    // Check for PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)
    const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && 
                  bytes[2] === 0x4E && bytes[3] === 0x47;
    
    // Check for WebP magic bytes (RIFF....WEBP)
    const isWebP = bytes[0] === 0x52 && bytes[1] === 0x49 && 
                   bytes[2] === 0x46 && bytes[3] === 0x46 &&
                   bytes[8] === 0x57 && bytes[9] === 0x45 && 
                   bytes[10] === 0x42 && bytes[11] === 0x50;
    
    if (!isJPEG && !isPNG && !isWebP) {
      throw new Error('File signature does not match allowed image types.');
    }
    
    // Layer 5: Additional security - scan for suspicious patterns
    const fileText = await file.text().catch(() => '');
    const suspiciousPatterns = ['<script', '<svg', 'javascript:', 'onerror='];
    for (const pattern of suspiciousPatterns) {
      if (fileText.toLowerCase().includes(pattern)) {
        throw new Error('Potentially malicious content detected.');
      }
    }
    
    return true;
  };
  
  /**
   * Handle file selection
   * @param {File} file - Selected file
   */
  const handleFile = async (file) => {
    try {
      // Validate the file
      await validateImage(file);
      
      // If validation passes, process the file
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropMode(true);
        setCropData({ 
          x: 0, 
          y: 0, 
          scale: 1, 
          originalImage: reader.result 
        });
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Image validation failed:', error);
      alert(error.message);
    }
  };
  
  /**
   * Handle drag and drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  /**
   * Apply crop and save photo
   */
  const applyCrop = () => {
    // Here you would implement actual image cropping logic
    // For now, we'll save the crop data with the original image
    onUpload({
      url: cropData.originalImage,
      cropped: true,
      position: { x: cropData.x, y: cropData.y },
      scale: cropData.scale
    });
    setCropMode(false);
  };
  
  return (
    <div className="photo-upload-container">
      {!photo?.url && !cropMode ? (
        // Upload interface
        <div 
          className={`photo-dropzone ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            id="photo-input"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => handleFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <label htmlFor="photo-input" className="dropzone-label">
            <div className="dropzone-icon">📷</div>
            <p className="dropzone-text">
              Drag & drop your photo here or click to browse
            </p>
            <p className="dropzone-hint">
              JPG, PNG, WebP • Max 5MB • Square crop recommended
            </p>
          </label>
        </div>
      ) : cropMode ? (
        // Crop interface
        <div className="photo-crop-container">
          <div className="crop-preview">
            <div 
              className="crop-image"
              style={{
                backgroundImage: `url(${cropData.originalImage})`,
                backgroundPosition: `${cropData.x}px ${cropData.y}px`,
                backgroundSize: `${cropData.scale * 100}%`
              }}
            >
              <div className="crop-overlay">
                <div className="crop-circle" />
              </div>
            </div>
          </div>
          
          <div className="crop-controls">
            <div className="control-group">
              <label>Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={cropData.scale}
                onChange={(e) => setCropData({
                  ...cropData,
                  scale: parseFloat(e.target.value)
                })}
              />
            </div>
            
            <div className="control-group">
              <label>Position</label>
              <div className="position-controls">
                <button onClick={() => setCropData({
                  ...cropData,
                  y: cropData.y - 10
                })}>↑</button>
                <button onClick={() => setCropData({
                  ...cropData,
                  y: cropData.y + 10
                })}>↓</button>
                <button onClick={() => setCropData({
                  ...cropData,
                  x: cropData.x - 10
                })}>←</button>
                <button onClick={() => setCropData({
                  ...cropData,
                  x: cropData.x + 10
                })}>→</button>
              </div>
            </div>
            
            <div className="crop-actions">
              <button 
                className="btn btn-ghost"
                onClick={() => setCropMode(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={applyCrop}
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Display uploaded photo
        <div className="photo-display">
          <div className="photo-preview">
            <img src={photo.url} alt="Profile" />
            {loading && (
              <div className="photo-loading">
                <div className="spinner" />
              </div>
            )}
          </div>
          <div className="photo-actions">
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => setCropMode(true)}
            >
              Edit
            </button>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => onUpload({ url: null })}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

PhotoUpload.propTypes = {
  photo: PropTypes.shape({
    url: PropTypes.string,
    cropped: PropTypes.bool,
    position: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    })
  }),
  onUpload: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

// Export the main component
export default LiveResumeEditor;

// Koniec części 3