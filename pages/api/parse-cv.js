/**
 * CV PARSING API - CVPerfect
 * PDF/DOCX file parsing and text extraction
 * 
 * Features:
 * - PDF text extraction using pdf-parse
 * - DOCX text extraction using mammoth
 * - Image/photo preservation
 * - File validation and sanitization
 * - Structured data extraction (name, email, phone, etc.)
 */

const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { CVPerfectValidation } = require('../../lib/validation');
const { CVPerfectCORS } = require('../../lib/cors');
const { CVPerfectErrors } = require('../../lib/error-responses');
const { CVPerfectTimeouts } = require('../../lib/timeout-utils');
const { CVPerfectLimits } = require('../../lib/request-limits');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
        }
    }
});

class CVParser {
    constructor() {
        this.supportedTypes = ['pdf', 'docx'];
    }

    // Extract text from PDF
    async parsePDF(buffer) {
        try {
            const data = await pdfParse(buffer);
            return {
                text: data.text,
                pages: data.numpages,
                info: data.info,
                metadata: data.metadata
            };
        } catch (error) {
            throw new Error(`PDF parsing failed: ${error.message}`);
        }
    }

    // Extract text from DOCX
    async parseDOCX(buffer) {
        try {
            const result = await mammoth.extractRawText({ buffer });
            const images = await mammoth.images.inline(data => {
                return { path: data.path, type: data.contentType };
            });
            
            return {
                text: result.value,
                messages: result.messages,
                images: images || []
            };
        } catch (error) {
            throw new Error(`DOCX parsing failed: ${error.message}`);
        }
    }

    // Extract structured data from CV text
    extractStructuredData(text) {
        const data = {
            name: this.extractName(text),
            email: this.extractEmail(text),
            phone: this.extractPhone(text),
            experience: this.extractExperience(text),
            skills: this.extractSkills(text),
            education: this.extractEducation(text),
            summary: this.extractSummary(text)
        };

        return data;
    }

    // Extract name from CV text
    extractName(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        // Name is usually in the first few lines
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            
            // Skip lines that look like headers or emails
            if (line.includes('@') || line.toLowerCase().includes('curriculum') || 
                line.toLowerCase().includes('cv') || line.length > 50) {
                continue;
            }
            
            // Check if line looks like a name (2-4 words, proper capitalization)
            const namePattern = /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)?$/;
            if (namePattern.test(line)) {
                return line;
            }
        }

        return null;
    }

    // Extract email from CV text
    extractEmail(text) {
        const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const matches = text.match(emailPattern);
        return matches ? matches[0] : null;
    }

    // Extract phone from CV text
    extractPhone(text) {
        const phonePatterns = [
            /\+48\s?\d{3}\s?\d{3}\s?\d{3}/g, // Polish international
            /\d{3}[\s-]?\d{3}[\s-]?\d{3}/g, // Polish local
            /\(\+48\)\s?\d{3}\s?\d{3}\s?\d{3}/g // Polish with parentheses
        ];

        for (const pattern of phonePatterns) {
            const matches = text.match(pattern);
            if (matches) {
                return matches[0].replace(/\s/g, '');
            }
        }

        return null;
    }

    // Extract experience section
    extractExperience(text) {
        const experience = [];
        const sections = this.splitIntoSections(text);
        
        // Find experience section
        const expSection = sections.find(section => 
            /doświadczenie|experience|praca|career|employment/i.test(section.title)
        );

        if (expSection) {
            const entries = this.parseExperienceEntries(expSection.content);
            experience.push(...entries);
        }

        return experience;
    }

    // Extract skills section
    extractSkills(text) {
        const skills = [];
        const sections = this.splitIntoSections(text);
        
        // Find skills section
        const skillsSection = sections.find(section => 
            /umiejętności|skills|kompetencje|technologie|technologies/i.test(section.title)
        );

        if (skillsSection) {
            const skillLines = skillsSection.content.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            for (const line of skillLines) {
                // Extract skills from comma-separated lists or bullet points
                const lineSkills = line.split(/[,•▪▫-]/)
                    .map(skill => skill.trim())
                    .filter(skill => skill.length > 2 && skill.length < 50);
                
                skills.push(...lineSkills);
            }
        }

        return [...new Set(skills)]; // Remove duplicates
    }

    // Extract education section
    extractEducation(text) {
        const education = [];
        const sections = this.splitIntoSections(text);
        
        // Find education section
        const eduSection = sections.find(section => 
            /wykształcenie|education|studia|university|college|szkoła/i.test(section.title)
        );

        if (eduSection) {
            const entries = this.parseEducationEntries(eduSection.content);
            education.push(...entries);
        }

        return education;
    }

    // Extract summary/objective
    extractSummary(text) {
        const sections = this.splitIntoSections(text);
        
        const summarySection = sections.find(section => 
            /podsumowanie|summary|objective|cel|profil|about|o\s+mnie/i.test(section.title)
        );

        if (summarySection) {
            return summarySection.content.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join(' ')
                .substring(0, 500); // Limit to 500 characters
        }

        return null;
    }

    // Split CV text into logical sections
    splitIntoSections(text) {
        const sections = [];
        const lines = text.split('\n');
        let currentSection = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Check if line looks like a section header
            if (this.isSectionHeader(trimmedLine)) {
                if (currentSection) {
                    sections.push(currentSection);
                }
                currentSection = {
                    title: trimmedLine,
                    content: ''
                };
            } else if (currentSection && trimmedLine) {
                currentSection.content += trimmedLine + '\n';
            }
        }

        if (currentSection) {
            sections.push(currentSection);
        }

        return sections;
    }

    // Check if line looks like a section header
    isSectionHeader(line) {
        const headerPatterns = [
            /^[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ\s]{3,30}$/,
            /^[A-Z][A-Z\s]{3,30}$/,
            /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż\s]{3,30}:?$/
        ];

        return headerPatterns.some(pattern => pattern.test(line)) && line.length < 50;
    }

    // Parse experience entries
    parseExperienceEntries(content) {
        const entries = [];
        const blocks = content.split(/\n\s*\n/); // Split by double newlines

        for (const block of blocks) {
            if (block.trim().length < 10) continue;

            const lines = block.split('\n').map(l => l.trim());
            const entry = {
                company: '',
                position: '',
                duration: '',
                description: ''
            };

            // Try to identify company, position, dates
            for (let i = 0; i < lines.length && i < 4; i++) {
                const line = lines[i];
                
                if (this.looksLikeDate(line)) {
                    entry.duration = line;
                } else if (!entry.position && this.looksLikePosition(line)) {
                    entry.position = line;
                } else if (!entry.company && line.length > 0) {
                    entry.company = line;
                }
            }

            entry.description = lines.slice(2).join(' ');
            entries.push(entry);
        }

        return entries;
    }

    // Parse education entries
    parseEducationEntries(content) {
        const entries = [];
        const blocks = content.split(/\n\s*\n/);

        for (const block of blocks) {
            if (block.trim().length < 10) continue;

            const lines = block.split('\n').map(l => l.trim());
            const entry = {
                institution: '',
                degree: '',
                year: '',
                description: ''
            };

            // Parse education entry
            for (let i = 0; i < lines.length && i < 3; i++) {
                const line = lines[i];
                
                if (this.looksLikeDate(line) || /\d{4}/.test(line)) {
                    entry.year = line;
                } else if (!entry.degree && (line.includes('Magister') || line.includes('Inżynier') || line.includes('Bachelor') || line.includes('Master'))) {
                    entry.degree = line;
                } else if (!entry.institution && line.length > 0) {
                    entry.institution = line;
                }
            }

            entries.push(entry);
        }

        return entries;
    }

    // Check if text looks like a date
    looksLikeDate(text) {
        const datePatterns = [
            /\d{4}\s*-\s*\d{4}/,
            /\d{4}\s*-\s*present/i,
            /\d{4}\s*-\s*obecnie/i,
            /\d{2}\/\d{4}/,
            /\d{4}/
        ];

        return datePatterns.some(pattern => pattern.test(text));
    }

    // Check if text looks like a job position
    looksLikePosition(text) {
        const positionKeywords = [
            'developer', 'programista', 'manager', 'kierownik', 'specialist', 
            'specjalista', 'analyst', 'analityk', 'engineer', 'inżynier',
            'consultant', 'konsultant', 'senior', 'junior', 'lead'
        ];

        return positionKeywords.some(keyword => 
            text.toLowerCase().includes(keyword.toLowerCase())
        );
    }
}

const parser = new CVParser();

// API handler
export default async function handler(req, res) {
    // Apply CORS
    CVPerfectCORS.general()(req, res, () => {});

    if (req.method !== 'POST') {
        return res.status(405).json(CVPerfectErrors.validation('Method not allowed'));
    }

    try {
        // Apply rate limiting
        await new Promise((resolve, reject) => {
            CVPerfectLimits.fileUpload()(req, res, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        // Handle file upload
        await new Promise((resolve, reject) => {
            upload.single('cv')(req, res, (error) => {
                if (error) {
                    reject(new Error(`File upload error: ${error.message}`));
                } else {
                    resolve();
                }
            });
        });

        if (!req.file) {
            return res.status(400).json(CVPerfectErrors.fileError('No file uploaded'));
        }

        // Validate file
        const fileValidation = CVPerfectValidation.validateFileUpload(req.file);
        if (!fileValidation.isValid) {
            return res.status(400).json(CVPerfectErrors.fileError(fileValidation.errors.join(', ')));
        }

        const file = req.file;
        const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'docx';

        // Parse CV with timeout
        const parseOperation = async () => {
            let parseResult;
            
            if (fileType === 'pdf') {
                parseResult = await parser.parsePDF(file.buffer);
            } else {
                parseResult = await parser.parseDOCX(file.buffer);
            }

            // Extract structured data
            const structuredData = parser.extractStructuredData(parseResult.text);

            return {
                success: true,
                data: {
                    fileName: file.originalname,
                    fileSize: file.size,
                    fileType: fileType,
                    parseResult: {
                        text: parseResult.text,
                        textLength: parseResult.text.length,
                        pages: parseResult.pages || 1,
                        images: parseResult.images || []
                    },
                    extractedData: structuredData,
                    timestamp: new Date().toISOString()
                }
            };
        };

        const result = await CVPerfectTimeouts.withTimeout(
            parseOperation(), 
            CVPerfectTimeouts.getAPITimeout('cv-parsing'),
            'CV parsing timeout'
        );

        res.status(200).json(result);

    } catch (error) {
        console.error('CV parsing error:', error);
        
        if (error.name === 'TimeoutError') {
            return res.status(408).json(CVPerfectErrors.externalAPI('cv-parser', 'Parsing timeout'));
        }

        return res.status(500).json(CVPerfectErrors.cvParsing(error.message));
    }
}

// Configure Next.js API route
export const config = {
    api: {
        bodyParser: false, // Disable default body parser for multer
        sizeLimit: '10mb'
    }
};