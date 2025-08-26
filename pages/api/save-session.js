/**
 * SAVE SESSION API - CVPerfect
 * Session persistence during payment flow
 * 
 * Features:
 * - Session data persistence
 * - CV data storage
 * - User metadata tracking
 * - Expiration management
 * - Data validation and sanitization
 */

const { createClient } = require('@supabase/supabase-js');
const { CVPerfectValidation } = require('../../lib/validation');
const { CVPerfectCORS } = require('../../lib/cors');
const { CVPerfectErrors } = require('../../lib/error-responses');
const { CVPerfectTimeouts } = require('../../lib/timeout-utils');
const { CVPerfectAuth } = require('../../lib/auth');

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

class SessionManager {
    constructor() {
        this.defaultExpiration = 24 * 60 * 60 * 1000; // 24 hours
        this.tableName = 'cvperfect_sessions';
    }

    // Save session data to database
    async saveSession(sessionData) {
        try {
            const sessionId = sessionData.sessionId || CVPerfectAuth.generateSessionId();
            const expiresAt = new Date(Date.now() + this.defaultExpiration);

            const sessionRecord = {
                session_id: sessionId,
                user_id: sessionData.userId || null,
                cv_data: sessionData.cvData || null,
                cv_text: sessionData.cvText || null,
                parsed_data: sessionData.parsedData || null,
                selected_plan: sessionData.selectedPlan || 'Basic',
                payment_status: sessionData.paymentStatus || 'pending',
                metadata: {
                    userAgent: sessionData.userAgent,
                    ipAddress: sessionData.ipAddress,
                    language: sessionData.language || 'pl',
                    source: sessionData.source || 'direct'
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString()
            };

            // Insert or update session
            const { data, error } = await supabase
                .from(this.tableName)
                .upsert(sessionRecord, { onConflict: 'session_id' })
                .select()
                .single();

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            return {
                success: true,
                sessionId: sessionId,
                expiresAt: expiresAt.toISOString(),
                data: data
            };

        } catch (error) {
            console.error('Session save error:', error);
            throw error;
        }
    }

    // Update existing session
    async updateSession(sessionId, updates) {
        try {
            const updateData = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from(this.tableName)
                .update(updateData)
                .eq('session_id', sessionId)
                .select()
                .single();

            if (error) {
                throw new Error(`Database error: ${error.message}`);
            }

            if (!data) {
                throw new Error('Session not found');
            }

            return {
                success: true,
                sessionId: sessionId,
                data: data
            };

        } catch (error) {
            console.error('Session update error:', error);
            throw error;
        }
    }

    // Validate session data before saving
    validateSessionData(data) {
        const errors = [];
        const sanitized = {};

        // Validate session ID format
        if (data.sessionId) {
            const sessionValidation = CVPerfectValidation.validateSessionId(data.sessionId);
            if (!sessionValidation.isValid) {
                errors.push(sessionValidation.error);
            } else {
                sanitized.sessionId = sessionValidation.sessionId;
            }
        }

        // Validate CV data if present
        if (data.cvData) {
            if (typeof data.cvData === 'string') {
                try {
                    data.cvData = JSON.parse(data.cvData);
                } catch (e) {
                    errors.push('Invalid CV data JSON format');
                }
            }

            if (data.cvData && typeof data.cvData === 'object') {
                const cvValidation = CVPerfectValidation.validateCVData(data.cvData);
                if (!cvValidation.isValid) {
                    errors.push(`CV data validation failed: ${cvValidation.errors.join(', ')}`);
                } else {
                    sanitized.cvData = cvValidation.sanitized;
                }
            }
        }

        // Validate CV text
        if (data.cvText) {
            sanitized.cvText = CVPerfectValidation.sanitizeText(data.cvText);
            if (sanitized.cvText.length > 50000) {
                errors.push('CV text too long (max 50,000 characters)');
            }
        }

        // Validate selected plan
        const allowedPlans = ['Basic', 'Gold', 'Premium'];
        if (data.selectedPlan) {
            const plan = CVPerfectValidation.sanitizeText(data.selectedPlan);
            if (!allowedPlans.includes(plan)) {
                errors.push(`Invalid plan: ${plan}. Must be one of: ${allowedPlans.join(', ')}`);
            } else {
                sanitized.selectedPlan = plan;
            }
        }

        // Validate payment status
        const allowedStatuses = ['pending', 'processing', 'completed', 'failed', 'expired'];
        if (data.paymentStatus) {
            const status = CVPerfectValidation.sanitizeText(data.paymentStatus);
            if (!allowedStatuses.includes(status)) {
                errors.push(`Invalid payment status: ${status}`);
            } else {
                sanitized.paymentStatus = status;
            }
        }

        // Sanitize metadata
        if (data.userAgent) {
            sanitized.userAgent = CVPerfectValidation.sanitizeText(data.userAgent);
        }
        if (data.ipAddress) {
            sanitized.ipAddress = CVPerfectValidation.sanitizeText(data.ipAddress);
        }
        if (data.language) {
            const language = CVPerfectValidation.sanitizeText(data.language);
            if (['pl', 'en'].includes(language)) {
                sanitized.language = language;
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            sanitized: errors.length === 0 ? sanitized : null
        };
    }

    // Clean up expired sessions
    async cleanupExpiredSessions() {
        try {
            const now = new Date().toISOString();
            
            const { data, error } = await supabase
                .from(this.tableName)
                .delete()
                .lt('expires_at', now)
                .select();

            if (error) {
                throw new Error(`Cleanup error: ${error.message}`);
            }

            return {
                success: true,
                deletedCount: data ? data.length : 0
            };

        } catch (error) {
            console.error('Session cleanup error:', error);
            throw error;
        }
    }

    // Get session statistics
    async getSessionStats() {
        try {
            const now = new Date().toISOString();
            
            // Count active sessions
            const { count: activeCount, error: activeError } = await supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true })
                .gt('expires_at', now);

            if (activeError) throw activeError;

            // Count by payment status
            const { data: statusData, error: statusError } = await supabase
                .from(this.tableName)
                .select('payment_status')
                .gt('expires_at', now);

            if (statusError) throw statusError;

            const statusCounts = {};
            statusData.forEach(session => {
                statusCounts[session.payment_status] = (statusCounts[session.payment_status] || 0) + 1;
            });

            return {
                success: true,
                stats: {
                    activeSessions: activeCount || 0,
                    statusBreakdown: statusCounts,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('Session stats error:', error);
            throw error;
        }
    }
}

const sessionManager = new SessionManager();

// API handler
export default async function handler(req, res) {
    // Apply CORS
    CVPerfectCORS.general()(req, res, () => {});

    if (req.method !== 'POST') {
        return res.status(405).json(CVPerfectErrors.validation('Method not allowed'));
    }

    try {
        // Get client context
        const clientContext = {
            userAgent: req.headers['user-agent'],
            ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            language: req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'pl'
        };

        // Validate session data
        const requestData = {
            ...req.body,
            ...clientContext
        };

        const validation = sessionManager.validateSessionData(requestData);
        if (!validation.isValid) {
            return res.status(400).json(CVPerfectErrors.validation(
                'Session data validation failed',
                validation.errors
            ));
        }

        // Save session with timeout
        const saveOperation = async () => {
            return await sessionManager.saveSession(validation.sanitized);
        };

        const result = await CVPerfectTimeouts.withTimeout(
            saveOperation(),
            CVPerfectTimeouts.getAPITimeout('session'),
            'Session save timeout'
        );

        res.status(200).json(result);

    } catch (error) {
        console.error('Save session error:', error);
        
        if (error.name === 'TimeoutError') {
            return res.status(408).json(CVPerfectErrors.externalAPI('database', 'Session save timeout'));
        }

        if (error.message.includes('Database error')) {
            return res.status(500).json(CVPerfectErrors.serverError('Database operation failed'));
        }

        return res.status(500).json(CVPerfectErrors.serverError('Session save failed'));
    }
}

// Export session manager for use in other APIs
export { sessionManager };