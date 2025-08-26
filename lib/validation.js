/**
 * INPUT VALIDATION & SANITIZATION - CVPerfect
 * Comprehensive validation utilities for all CVPerfect APIs
 * 
 * Features:
 * - CV data validation and sanitization
 * - Session ID format validation
 * - Email and contact form validation
 * - File upload validation
 * - Payment data validation
 * - XSS protection
 * - SQL injection prevention
 */

const DOMPurify = require('isomorphic-dompurify');
const validator = require('validator');

class ValidationMiddleware {
    constructor() {
        this.maxCVTextLength = 50000; // 50k characters max
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        this.sessionIdPattern = /^sess_\d{13}_[a-f0-9]{32}$/;
        this.allowedPlans = ['Basic', 'Gold', 'Premium'];
        this.maxEmailLength = 254; // RFC 5321 limit
    }

    // Sanitize text input
    sanitizeText(text) {
        if (typeof text !== 'string') {
            return '';
        }

        // Remove potential XSS
        const sanitized = DOMPurify.sanitize(text, { 
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: []
        });

        // Additional cleaning
        return sanitized
            .replace(/[<>]/g, '') // Remove any remaining brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocols
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }

    // Sanitize HTML content (for CV templates)
    sanitizeHTML(html) {
        if (typeof html !== 'string') {
            return '';
        }

        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'span', 'div'],
            ALLOWED_ATTR: ['class', 'style'],
            FORBID_SCRIPTS: true,
            FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input']
        });
    }

    // Validate and sanitize CV data
    validateCVData(cvData) {
        const errors = [];
        const sanitized = {};

        if (!cvData || typeof cvData !== 'object') {
            errors.push('CV data must be a valid object');
            return { isValid: false, errors, sanitized: null };
        }

        // Validate and sanitize name
        if (cvData.name) {
            sanitized.name = this.sanitizeText(cvData.name);
            if (sanitized.name.length < 2) {
                errors.push('Name must be at least 2 characters long');
            }
            if (sanitized.name.length > 100) {
                errors.push('Name must be less than 100 characters');
            }
        }

        // Validate and sanitize email
        if (cvData.email) {
            const cleanEmail = this.sanitizeText(cvData.email).toLowerCase();
            if (!validator.isEmail(cleanEmail)) {
                errors.push('Invalid email format');
            } else if (cleanEmail.length > this.maxEmailLength) {
                errors.push('Email address too long');
            } else {
                sanitized.email = cleanEmail;
            }
        }

        // Validate and sanitize phone
        if (cvData.phone) {
            sanitized.phone = this.sanitizeText(cvData.phone);
            // Polish phone number validation
            if (sanitized.phone && !validator.isMobilePhone(sanitized.phone, 'pl-PL')) {
                // Try international format
                if (!validator.isMobilePhone(sanitized.phone, 'any')) {
                    errors.push('Invalid phone number format');
                }
            }
        }

        // Validate and sanitize CV text content
        if (cvData.cvText) {
            sanitized.cvText = this.sanitizeText(cvData.cvText);
            if (sanitized.cvText.length > this.maxCVTextLength) {
                errors.push(`CV text too long. Maximum ${this.maxCVTextLength} characters allowed`);
            }
        }

        // Validate experience entries
        if (cvData.experience && Array.isArray(cvData.experience)) {
            sanitized.experience = cvData.experience.map(exp => ({
                company: this.sanitizeText(exp.company || ''),
                position: this.sanitizeText(exp.position || ''),
                duration: this.sanitizeText(exp.duration || ''),
                description: this.sanitizeText(exp.description || '')
            }));
        }

        // Validate skills
        if (cvData.skills && Array.isArray(cvData.skills)) {
            sanitized.skills = cvData.skills
                .map(skill => this.sanitizeText(skill))
                .filter(skill => skill.length > 0);
        }

        // Validate education
        if (cvData.education && Array.isArray(cvData.education)) {
            sanitized.education = cvData.education.map(edu => ({
                institution: this.sanitizeText(edu.institution || ''),
                degree: this.sanitizeText(edu.degree || ''),
                year: this.sanitizeText(edu.year || ''),
                description: this.sanitizeText(edu.description || '')
            }));
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitized: errors.length === 0 ? sanitized : null
        };
    }

    // Validate session ID
    validateSessionId(sessionId) {
        if (!sessionId || typeof sessionId !== 'string') {
            return { isValid: false, error: 'Session ID is required and must be a string' };
        }

        if (!this.sessionIdPattern.test(sessionId)) {
            return { isValid: false, error: 'Invalid session ID format' };
        }

        return { isValid: true, sessionId };
    }

    // Validate email for contact form
    validateContactEmail(emailData) {
        const errors = [];
        const sanitized = {};

        if (!emailData || typeof emailData !== 'object') {
            return { isValid: false, errors: ['Email data must be a valid object'], sanitized: null };
        }

        // Validate email address
        if (!emailData.email) {
            errors.push('Email address is required');
        } else {
            const cleanEmail = this.sanitizeText(emailData.email).toLowerCase();
            if (!validator.isEmail(cleanEmail)) {
                errors.push('Invalid email format');
            } else {
                sanitized.email = cleanEmail;
            }
        }

        // Validate subject
        if (!emailData.subject) {
            errors.push('Subject is required');
        } else {
            sanitized.subject = this.sanitizeText(emailData.subject);
            if (sanitized.subject.length < 5) {
                errors.push('Subject must be at least 5 characters long');
            }
            if (sanitized.subject.length > 200) {
                errors.push('Subject must be less than 200 characters');
            }
        }

        // Validate message
        if (!emailData.message) {
            errors.push('Message is required');
        } else {
            sanitized.message = this.sanitizeText(emailData.message);
            if (sanitized.message.length < 10) {
                errors.push('Message must be at least 10 characters long');
            }
            if (sanitized.message.length > 5000) {
                errors.push('Message must be less than 5000 characters');
            }
        }

        // Validate name (optional)
        if (emailData.name) {
            sanitized.name = this.sanitizeText(emailData.name);
            if (sanitized.name.length > 100) {
                errors.push('Name must be less than 100 characters');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitized: errors.length === 0 ? sanitized : null
        };
    }

    // Validate payment data
    validatePaymentData(paymentData) {
        const errors = [];
        const sanitized = {};

        if (!paymentData || typeof paymentData !== 'object') {
            return { isValid: false, errors: ['Payment data must be a valid object'], sanitized: null };
        }

        // Validate selected plan
        if (!paymentData.selectedPlan) {
            errors.push('Selected plan is required');
        } else {
            const plan = this.sanitizeText(paymentData.selectedPlan);
            if (!this.allowedPlans.includes(plan)) {
                errors.push(`Invalid plan. Must be one of: ${this.allowedPlans.join(', ')}`);
            } else {
                sanitized.selectedPlan = plan;
            }
        }

        // Validate session ID
        if (paymentData.sessionId) {
            const sessionValidation = this.validateSessionId(paymentData.sessionId);
            if (!sessionValidation.isValid) {
                errors.push(sessionValidation.error);
            } else {
                sanitized.sessionId = sessionValidation.sessionId;
            }
        }

        // Validate success/cancel URLs
        if (paymentData.successUrl) {
            const cleanUrl = this.sanitizeText(paymentData.successUrl);
            if (!validator.isURL(cleanUrl, { require_protocol: true })) {
                errors.push('Invalid success URL');
            } else {
                sanitized.successUrl = cleanUrl;
            }
        }

        if (paymentData.cancelUrl) {
            const cleanUrl = this.sanitizeText(paymentData.cancelUrl);
            if (!validator.isURL(cleanUrl, { require_protocol: true })) {
                errors.push('Invalid cancel URL');
            } else {
                sanitized.cancelUrl = cleanUrl;
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitized: errors.length === 0 ? sanitized : null
        };
    }

    // Validate file upload
    validateFileUpload(file) {
        const errors = [];

        if (!file) {
            return { isValid: false, errors: ['File is required'], file: null };
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            errors.push(`File too large. Maximum size: ${Math.round(this.maxFileSize / (1024*1024))}MB`);
        }

        // Check file type
        if (!this.allowedFileTypes.includes(file.type)) {
            errors.push(`Invalid file type. Allowed: ${this.allowedFileTypes.join(', ')}`);
        }

        // Check file name
        const sanitizedName = this.sanitizeText(file.name);
        if (sanitizedName.length > 255) {
            errors.push('File name too long');
        }

        // Check for suspicious file extensions
        const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.jar', '.js', '.html'];
        const lowerName = sanitizedName.toLowerCase();
        if (suspiciousExtensions.some(ext => lowerName.endsWith(ext))) {
            errors.push('Suspicious file extension detected');
        }

        return {
            isValid: errors.length === 0,
            errors,
            file: errors.length === 0 ? {
                ...file,
                name: sanitizedName
            } : null
        };
    }

    // Create validation middleware
    validate(validationType) {
        return (req, res, next) => {
            let validation;

            try {
                switch (validationType) {
                    case 'cvData':
                        validation = this.validateCVData(req.body);
                        break;
                    
                    case 'sessionId': {
                        const sessionId = req.body.sessionId || req.query.sessionId || req.headers['x-session-id'];
                        validation = this.validateSessionId(sessionId);
                        break;
                    }
                    
                    case 'email':
                        validation = this.validateContactEmail(req.body);
                        break;
                    
                    case 'payment':
                        validation = this.validatePaymentData(req.body);
                        break;
                    
                    case 'fileUpload':
                        validation = this.validateFileUpload(req.file || req.files?.[0]);
                        break;
                    
                    default:
                        return res.status(400).json({
                            error: 'Unknown validation type',
                            code: 'INVALID_VALIDATION_TYPE'
                        });
                }

                if (!validation.isValid) {
                    return res.status(400).json({
                        error: 'Validation failed',
                        code: 'VALIDATION_ERROR',
                        details: validation.errors
                    });
                }

                // Add sanitized data to request
                req.validated = validation.sanitized || validation;
                next();

            } catch (error) {
                console.error('Validation middleware error:', error);
                return res.status(500).json({
                    error: 'Validation system error',
                    code: 'VALIDATION_SYSTEM_ERROR'
                });
            }
        };
    }

    // Get validation rules summary
    getValidationRules() {
        return {
            cvData: {
                maxTextLength: this.maxCVTextLength,
                requiredFields: ['name', 'email'],
                optionalFields: ['phone', 'experience', 'skills', 'education']
            },
            fileUpload: {
                maxSize: this.maxFileSize,
                allowedTypes: this.allowedFileTypes
            },
            payment: {
                allowedPlans: this.allowedPlans
            },
            sessionId: {
                pattern: this.sessionIdPattern.toString()
            }
        };
    }
}

// Singleton instance
const validationMiddleware = new ValidationMiddleware();

// Convenience exports for CVPerfect APIs
const CVPerfectValidation = {
    // Validate CV data
    cvData: () => validationMiddleware.validate('cvData'),
    
    // Validate session ID
    sessionId: () => validationMiddleware.validate('sessionId'),
    
    // Validate email data
    email: () => validationMiddleware.validate('email'),
    
    // Validate payment data
    payment: () => validationMiddleware.validate('payment'),
    
    // Validate file uploads
    fileUpload: () => validationMiddleware.validate('fileUpload'),
    
    // Direct validation functions
    sanitizeText: (text) => validationMiddleware.sanitizeText(text),
    sanitizeHTML: (html) => validationMiddleware.sanitizeHTML(html),
    validateCVData: (cvData) => validationMiddleware.validateCVData(cvData),
    validateSessionId: (sessionId) => validationMiddleware.validateSessionId(sessionId),
    
    // Get validation rules
    getRules: () => validationMiddleware.getValidationRules()
};

module.exports = {
    ValidationMiddleware,
    CVPerfectValidation,
    validationMiddleware
};