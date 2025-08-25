// CVPerfect /analyze Command API Endpoint
// Handles all /analyze command variations with CVPerfect agent integration

import { CVPerfectCommandHandler } from '../../lib/command-handler'
import { handleCORSPreflight } from '../../lib/cors'

const commandHandler = new CVPerfectCommandHandler()

export default async function handler(req, res) {
  // Handle CORS preflight
  const shouldContinue = handleCORSPreflight(req, res)
  if (!shouldContinue) return

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    })
  }

  try {
    res.setHeader('Content-Type', 'application/json')
    
    const { type, target, options = {} } = req.body

    // Validate required parameters
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: type',
        availableTypes: ['cv', 'code', 'performance', 'security', 'business', 'list', 'show', 'compare']
      })
    }

    console.log(`📊 Analyze command:`, { type, target, options })

    // Execute analyze command
    const result = await commandHandler.executeCommand('analyze', [type, target], options)
    
    // Format output for Claude Code display
    const formattedResult = commandHandler.formatOutput(result)

    return res.status(200).json({
      success: true,
      command: `/analyze ${type} ${target || ''}`.trim(),
      timestamp: new Date().toISOString(),
      ...formattedResult
    })

  } catch (error) {
    console.error('❌ Analyze command error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Analysis command failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// Route mapping for different analyze types
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Support large CV files
    },
  },
}