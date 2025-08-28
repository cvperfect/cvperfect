/**
 * GET SESSION DATA API - CVPerfect
 * Session retrieval for success page (Fixed version)
 * 
 * Root Cause: Missing environment variables causing 500 errors
 * Solution: Graceful degradation in development mode
 */

// Cached dependencies to avoid Fast Refresh issues
let cachedDependencies = null;

// Lazy imports to avoid startup errors
function loadDependencies() {
    // Return cached dependencies if available (Fast Refresh stability)
    if (cachedDependencies) {
        return cachedDependencies;
    }
    
    try {
        const { createClient } = require('@supabase/supabase-js');
        const { CVPerfectValidation } = require('../../lib/validation');
        const { CVPerfectErrors } = require('../../lib/error-responses');
        
        cachedDependencies = { createClient, CVPerfectValidation, CVPerfectErrors };
        return cachedDependencies;
    } catch (error) {
        console.error('Failed to load dependencies:', error.message);
        return null;
    }
}

// Initialize Supabase client with proper error handling
function createSupabaseClient() {
    const deps = loadDependencies();
    if (!deps) return null;
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.log('Missing Supabase environment variables - running in offline mode');
        return null;
    }
    
    try {
        return deps.createClient(supabaseUrl, supabaseKey);
    } catch (error) {
        console.error('Supabase client creation failed:', error.message);
        return null;
    }
}

class SessionRetriever {
    constructor() {
        this.tableName = 'cvperfect_sessions';
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    // Get session data by session ID
    async getSessionData(sessionId) {
        try {
            // Create Supabase client on-demand
            const supabase = createSupabaseClient();
            if (!supabase) {
                // In development mode, simulate session not found
                if (process.env.NODE_ENV === 'development') {
                    throw new Error('Session not found');
                }
                throw new Error('Database connection not available');
            }
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
            const supabase = createSupabaseClient();
            if (!supabase) return;
            
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
            const supabase = createSupabaseClient();
            if (!supabase) return;
            
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
            const supabase = createSupabaseClient();
            if (!supabase) {
                throw new Error('Database connection not available');
            }
            
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
        const deps = loadDependencies();
        
        // Remove sensitive internal fields
        const sanitized = { ...sessionData };
        
        // Remove database-specific fields
        delete sanitized.id;
        delete sanitized.internal_notes;
        
        // Sanitize CV text if present
        if (sanitized.cvText && deps?.CVPerfectValidation) {
            sanitized.cvText = deps.CVPerfectValidation.sanitizeText(sanitized.cvText);
        }

        // Sanitize parsed data
        if (sanitized.parsedData && typeof sanitized.parsedData === 'object') {
            sanitized.parsedData = this.sanitizeParsedData(sanitized.parsedData);
        }

        return sanitized;
    }

    // Sanitize parsed CV data
    sanitizeParsedData(parsedData) {
        const deps = loadDependencies();
        const sanitized = {};

        // Fallback sanitization function
        const safeSanitize = (text) => {
            if (deps?.CVPerfectValidation) {
                return deps.CVPerfectValidation.sanitizeText(text);
            }
            // Basic sanitization if validation not available
            return String(text || '').replace(/<[^>]*>/g, '').trim();
        };

        // Sanitize basic fields
        if (parsedData.name) {
            sanitized.name = safeSanitize(parsedData.name);
        }

        if (parsedData.email) {
            sanitized.email = safeSanitize(parsedData.email);
        }

        if (parsedData.phone) {
            sanitized.phone = safeSanitize(parsedData.phone);
        }

        // Sanitize arrays
        if (parsedData.skills && Array.isArray(parsedData.skills)) {
            sanitized.skills = parsedData.skills.map(skill => 
                safeSanitize(skill)
            ).filter(skill => skill.length > 0);
        }

        if (parsedData.experience && Array.isArray(parsedData.experience)) {
            sanitized.experience = parsedData.experience.map(exp => ({
                company: safeSanitize(exp.company || ''),
                position: safeSanitize(exp.position || ''),
                duration: safeSanitize(exp.duration || ''),
                description: safeSanitize(exp.description || '')
            }));
        }

        if (parsedData.education && Array.isArray(parsedData.education)) {
            sanitized.education = parsedData.education.map(edu => ({
                institution: safeSanitize(edu.institution || ''),
                degree: safeSanitize(edu.degree || ''),
                year: safeSanitize(edu.year || ''),
                description: safeSanitize(edu.description || '')
            }));
        }

        if (parsedData.summary) {
            sanitized.summary = safeSanitize(parsedData.summary);
        }

        return sanitized;
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const sessionRetriever = new SessionRetriever();

// API handler with TTFB optimization and early response
export default async function handler(req, res) {
    const startTime = Date.now();
    console.log('Session data API called:', req.method, req.query);
    
    try {
        // TTFB OPTIMIZATION: Set headers and cache control immediately
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        res.setHeader('X-Response-Time', `${Date.now() - startTime}ms`);
        
        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }

        if (req.method !== 'GET' && req.method !== 'POST') {
            return res.status(405).json({ 
                success: false, 
                error: { message: 'Method not allowed' }
            });
        }

        // Get session ID
        const sessionId = req.query.sessionId || req.query.session_id || req.body?.sessionId;
        console.log('Session ID extracted:', sessionId);

        if (!sessionId) {
            return res.status(400).json({ 
                success: false, 
                error: { message: 'Session ID is required' }
            });
        }

        // Validate session ID format
        const isCVPerfectFormat = /^sess_\d{13}_[a-f0-9]{32}$/.test(sessionId);
        const isStripeFormat = /^cs_(test|live)_[a-zA-Z0-9]{24,}$/.test(sessionId);
        const isTestFormat = /^test\d+$/.test(sessionId);
        
        console.log('Session ID validation:', { isCVPerfectFormat, isStripeFormat, isTestFormat });
        
        if (!isCVPerfectFormat && !isStripeFormat && !isTestFormat) {
            return res.status(400).json({ 
                success: false, 
                error: { message: 'Invalid session ID format' }
            });
        }

        // TTFB OPTIMIZATION: Fast path for test sessions - immediate response
        if (isTestFormat || (isStripeFormat && process.env.NODE_ENV === 'development')) {
            const sessionType = isTestFormat ? 'Test' : 'Stripe Test';
            console.log(`🧪 ${sessionType} session detected - FAST RESPONSE for:`, sessionId);
            
            // PERFORMANCE: Pre-built mock data to avoid processing delays
            const mockCVs = {
                'test123': `Anna Kowalska
Email: anna.kowalska@gmail.com
Telefon: +48 555 123 456

Doświadczenie:
- Marketing Manager w Digital Agency (2020-2024)
- Social Media Specialist w StartupXYZ (2018-2020)
- Junior Marketer w LocalBusiness (2017-2018)

Wykształcenie:
- Magister Marketing i Zarządzanie, Uniwersytet Ekonomiczny (2017)

Umiejętności:
Google Ads, Facebook Ads, Instagram Marketing, Analytics, Canva, Photoshop`,
                
                'default': `Piotr Nowak
Email: piotr.nowak@outlook.com
Telefon: +48 600 789 123

Doświadczenie:
- Frontend Developer w TechCorp (2021-2024)
- Junior Developer w WebStudio (2019-2021)

Wykształcenie:
- Inżynier Informatyki, Politechnika Warszawska (2019)

Umiejętności:
React, JavaScript, TypeScript, HTML, CSS, Git, Figma`
            };
            
            const selectedCV = mockCVs[sessionId] || mockCVs['default'];
            const mockCVData = selectedCV;

            // Determine plan based on session type
            const mockPlan = isStripeFormat ? 'premium' : 'premium';
            const paymentStatus = isStripeFormat ? 'completed' : 'completed';

            // Extract email from selected CV
            const emailLine = selectedCV.split('\n').find(line => line.toLowerCase().includes('email'));
            const mockEmail = emailLine ? emailLine.replace(/Email:\s*/, '') : 'user@cvperfect.pl';
            
            return res.status(200).json({
                success: true,
                sessionData: {
                    session_id: sessionId,
                    selected_plan: mockPlan,
                    payment_status: paymentStatus,
                    created_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h expiry
                },
                cvData: mockCVData,
                email: mockEmail,
                photo: null,
                plan: mockPlan,
                sessionId: sessionId,
                paymentStatus: paymentStatus,
                source: `mock_${sessionType.toLowerCase().replace(' ', '_')}_session`
            });
        }

        // Try to get session data from database
        const supabase = createSupabaseClient();
        
        if (!supabase) {
            const isDev = process.env.NODE_ENV === 'development';
            const errorMsg = isDev ? 
                'Database not available in development mode' : 
                'Session not found';
                
            console.log(`💾 No database connection - ENV: ${process.env.NODE_ENV}, Session: ${sessionId}`);
            
            return res.status(404).json({ 
                success: false, 
                error: { 
                    message: errorMsg,
                    category: 'NOT_FOUND',
                    code: 404,
                    sessionId: sessionId,
                    environment: process.env.NODE_ENV,
                    suggestion: isDev ? 'Use test123 or set up Supabase for full functionality' : 'Please check your session ID'
                }
            });
        }

        try {
            console.log('Attempting database query for session:', sessionId);
            const { data, error } = await supabase
                .from('cvperfect_sessions')
                .select('*')
                .eq('session_id', sessionId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return res.status(404).json({ 
                        success: false, 
                        error: { message: 'Session not found' }
                    });
                }
                
                // Handle missing table (common in development)
                if (error.message.includes('does not exist')) {
                    console.log('Database table does not exist - returning session not found');
                    return res.status(404).json({ 
                        success: false, 
                        error: { 
                            message: 'Session not found',
                            category: 'NOT_FOUND',
                            code: 404
                        }
                    });
                }
                
                throw new Error(`Database error: ${error.message}`);
            }

            // Check if session is expired
            const now = new Date();
            const expiresAt = new Date(data.expires_at);
            
            if (expiresAt < now) {
                return res.status(410).json({ 
                    success: false, 
                    error: { message: 'Session expired' }
                });
            }

            // Return session data
            const response = {
                success: true,
                sessionData: data,
                cvData: data.cv_text || data.cv_data || '',
                email: data.email || '',
                photo: data.photo || '',
                plan: data.selected_plan || 'premium',
                sessionId: data.session_id,
                paymentStatus: data.payment_status
            };

            return res.status(200).json(response);

        } catch (dbError) {
            console.error('Database operation failed:', dbError.message);
            return res.status(500).json({ 
                success: false, 
                error: { 
                    message: 'Database operation failed',
                    details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
                }
            });
        }
        
    } catch (error) {
        console.error('API handler error:', error);
        return res.status(500).json({ 
            success: false, 
            error: { 
                message: 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            }
        });
    }
}

// Export session retriever for use in other APIs
export { sessionRetriever };