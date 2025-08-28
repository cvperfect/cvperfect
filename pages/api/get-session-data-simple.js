/**
 * SIMPLE SESSION DATA API - CVPerfect
 * Minimal version for debugging 500 errors
 */

// API handler
export default async function handler(req, res) {
    console.log('Simple API handler called:', req.method, req.query);
    
    try {
        // Basic method check
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

        // Validate format
        const isTestFormat = /^test\d+$/.test(sessionId);
        console.log('Is test format:', isTestFormat);
        
        if (!isTestFormat) {
            return res.status(400).json({ 
                success: false, 
                error: { message: 'Invalid session ID format' }
            });
        }

        // Since we can't connect to database, return 404 (session not found)
        console.log('Returning 404 for session:', sessionId);
        return res.status(404).json({ 
            success: false, 
            error: { 
                message: 'Session not found',
                sessionId: sessionId 
            }
        });

    } catch (error) {
        console.error('Simple API error:', error);
        return res.status(500).json({ 
            success: false, 
            error: { 
                message: 'Internal server error',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });
    }
}