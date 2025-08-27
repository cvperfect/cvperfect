/**
 * GET SESSION DATA API - CVPerfect
 * Session retrieval for success page
 * 
 * Features:
 * - Session data retrieval by ID
 * - Automatic session validation
 * - Data sanitization and security
 * - Expiration checking
 * - Usage tracking
 */

const { createClient } = require('@supabase/supabase-js');
const { CVPerfectValidation } = require('../../lib/validation');
const { CVPerfectCORS } = require('../../lib/cors');
const { CVPerfectErrors } = require('../../lib/error-responses');
const { CVPerfectTimeouts } = require('../../lib/timeout-utils');
// CVPerfectAuth removed - using direct validation patterns instead

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

class SessionRetriever {
    constructor() {
        this.tableName = 'cvperfect_sessions';
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    // Get session data by session ID
    async getSessionData(sessionId) {
        try {
            // Validate session ID format - support multiple formats:
            // 1. CVPerfect format: sess_timestamp_hex
            // 2. Stripe format: cs_test_* or cs_live_*
            // 3. Test format: test123 (for development)
            const isCVPerfectFormat = /^sess_\d{13}_[a-f0-9]{32}$/.test(sessionId);
            const isStripeFormat = /^cs_(test|live)_[a-zA-Z0-9]{24,}$/.test(sessionId);
            const isTestFormat = /^test\d+$/.test(sessionId);
            
            if (!isCVPerfectFormat && !isStripeFormat && !isTestFormat) {
                throw new Error('Invalid session ID format');
            }

            const { data, error } = await supabase
                .from(this.tableName)
                .select('*')
                .eq('session_id', sessionId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // No rows returned
                    throw new Error('Session not found');
                }
                throw new Error(`Database error: ${error.message}`);
            }

            // Check if session is expired
            const now = new Date();
            const expiresAt = new Date(data.expires_at);
            
            if (expiresAt < now) {
                // Clean up expired session
                await this.deleteSession(sessionId);
                throw new Error('Session expired');
            }

            // Update last accessed time
            await this.updateLastAccessed(sessionId);

            return {
                success: true,
                sessionData: {
                    sessionId: data.session_id,
                    userId: data.user_id,
                    cvData: data.cv_data,
                    cvText: data.cv_text,
                    parsedData: data.parsed_data,
                    selectedPlan: data.selected_plan,
                    paymentStatus: data.payment_status,
                    metadata: data.metadata,
                    createdAt: data.created_at,
                    updatedAt: data.updated_at,
                    expiresAt: data.expires_at
                }
            };

        } catch (error) {
            console.error('Session retrieval error:', error);
            throw error;
        }
    }

    // Get session data with retry logic
    async getSessionDataWithRetry(sessionId) {
        let lastError;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await this.getSessionData(sessionId);
            } catch (error) {
                lastError = error;
                
                // Don't retry for client errors
                if (error.message.includes('Invalid session') || 
                    error.message.includes('Session not found') ||
                    error.message.includes('Session expired')) {
                    throw error;
                }

                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        throw lastError;
    }

    // Update last accessed timestamp
    async updateLastAccessed(sessionId) {
        try {
            await supabase
                .from(this.tableName)
                .update({ 
                    updated_at: new Date().toISOString(),
                    last_accessed_at: new Date().toISOString()
                })
                .eq('session_id', sessionId);
        } catch (error) {
            // Non-critical error, just log it
            console.warn('Failed to update last accessed time:', error);
        }
    }

    // Delete expired or invalid session
    async deleteSession(sessionId) {
        try {
            await supabase
                .from(this.tableName)
                .delete()
                .eq('session_id', sessionId);
        } catch (error) {
            console.warn('Failed to delete expired session:', error);
        }
    }

    // Get session data by user criteria
    async getSessionsByCriteria(criteria) {
        try {
            let query = supabase.from(this.tableName).select('*');

            // Apply filters based on criteria
            if (criteria.userId) {
                query = query.eq('user_id', criteria.userId);
            }

            if (criteria.paymentStatus) {
                query = query.eq('payment_status', criteria.paymentStatus);
            }

            if (criteria.selectedPlan) {
                query = query.eq('selected_plan', criteria.selectedPlan);
            }

            // Only return non-expired sessions
            query = query.gt('expires_at', new Date().toISOString());

            // Limit results
            query = query.limit(criteria.limit || 10);

            // Order by creation date
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            return {
                success: true,
                sessions: data || [],
                count: data ? data.length : 0
            };

        } catch (error) {
            console.error('Session criteria retrieval error:', error);
            throw error;
        }
    }

    // Sanitize session data for client response
    sanitizeSessionData(sessionData) {
        // Remove sensitive internal fields
        const sanitized = { ...sessionData };
        
        // Remove database-specific fields
        delete sanitized.id;
        delete sanitized.internal_notes;
        
        // Sanitize CV text if present
        if (sanitized.cvText) {
            sanitized.cvText = CVPerfectValidation.sanitizeText(sanitized.cvText);
        }

        // Sanitize parsed data
        if (sanitized.parsedData && typeof sanitized.parsedData === 'object') {
            sanitized.parsedData = this.sanitizeParsedData(sanitized.parsedData);
        }

        return sanitized;
    }

    // Sanitize parsed CV data
    sanitizeParsedData(parsedData) {
        const sanitized = {};

        // Sanitize basic fields
        if (parsedData.name) {
            sanitized.name = CVPerfectValidation.sanitizeText(parsedData.name);
        }

        if (parsedData.email) {
            sanitized.email = CVPerfectValidation.sanitizeText(parsedData.email);
        }

        if (parsedData.phone) {
            sanitized.phone = CVPerfectValidation.sanitizeText(parsedData.phone);
        }

        // Sanitize arrays
        if (parsedData.skills && Array.isArray(parsedData.skills)) {
            sanitized.skills = parsedData.skills.map(skill => 
                CVPerfectValidation.sanitizeText(skill)
            ).filter(skill => skill.length > 0);
        }

        if (parsedData.experience && Array.isArray(parsedData.experience)) {
            sanitized.experience = parsedData.experience.map(exp => ({
                company: CVPerfectValidation.sanitizeText(exp.company || ''),
                position: CVPerfectValidation.sanitizeText(exp.position || ''),
                duration: CVPerfectValidation.sanitizeText(exp.duration || ''),
                description: CVPerfectValidation.sanitizeText(exp.description || '')
            }));
        }

        if (parsedData.education && Array.isArray(parsedData.education)) {
            sanitized.education = parsedData.education.map(edu => ({
                institution: CVPerfectValidation.sanitizeText(edu.institution || ''),
                degree: CVPerfectValidation.sanitizeText(edu.degree || ''),
                year: CVPerfectValidation.sanitizeText(edu.year || ''),
                description: CVPerfectValidation.sanitizeText(edu.description || '')
            }));
        }

        if (parsedData.summary) {
            sanitized.summary = CVPerfectValidation.sanitizeText(parsedData.summary);
        }

        return sanitized;
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const sessionRetriever = new SessionRetriever();

// API handler
export default async function handler(req, res) {
    // Apply CORS
    CVPerfectCORS.general()(req, res, () => {});

    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json(CVPerfectErrors.validation('Method not allowed'));
    }

    try {
        // Get session ID from query params or body (handle both snake_case and camelCase)
        const sessionId = req.query.sessionId || req.query.session_id || req.body?.sessionId;

        if (!sessionId) {
            return res.status(400).json(CVPerfectErrors.validation('Session ID is required'));
        }

        // Get session data with timeout and retry
        const getSessionOperation = async () => {
            return await sessionRetriever.getSessionDataWithRetry(sessionId);
        };

        const result = await CVPerfectTimeouts.withTimeout(
            getSessionOperation(),
            CVPerfectTimeouts.getAPITimeout('session'),
            'Session retrieval timeout'
        );

        // Sanitize session data before sending to client
        const sanitizedData = sessionRetriever.sanitizeSessionData(result.sessionData);

        // Create backward-compatible response format for success.js
        // Frontend expects: { success: true, cvData: "...", email: "...", photo: "..." }
        const compatibleResponse = {
            success: true,
            sessionData: sanitizedData,  // Keep nested structure for new code
            
            // Flat structure for backward compatibility with success.js
            cvData: sanitizedData.cvText || sanitizedData.cvData || '',
            email: sanitizedData.email || '',
            photo: sanitizedData.photo || '',
            plan: sanitizedData.selectedPlan || 'premium',
            jobPosting: sanitizedData.jobPosting || '',
            sessionId: sanitizedData.sessionId,
            paymentStatus: sanitizedData.paymentStatus
        };

        res.status(200).json(compatibleResponse);
    } catch (error) {
        console.error('Get session data error:', error);
        
        if (error.name === 'TimeoutError') {
            return res.status(408).json(CVPerfectErrors.externalAPI('database', 'Session retrieval timeout'));
        }

        if (error.message.includes('Session not found')) {
            return res.status(404).json(CVPerfectErrors.notFound('Session'));
        }

        if (error.message.includes('Session expired')) {
            return res.status(410).json(CVPerfectErrors.session('Session expired'));
        }

        if (error.message.includes('Invalid session')) {
            return res.status(400).json(CVPerfectErrors.validation('Invalid session ID'));
        }

        if (error.message.includes('Database error')) {
            return res.status(500).json(CVPerfectErrors.serverError('Database operation failed'));
        }

        return res.status(500).json(CVPerfectErrors.serverError('Session retrieval failed'));
    }
}

// Export session retriever for use in other APIs
export { sessionRetriever };