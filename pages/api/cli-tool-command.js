// CVPerfect /cli-tool Command API Endpoint
// Handles all /cli-tool command variations with CLI tool execution

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
    
    const { tool, args = [], options = {} } = req.body

    // Validate required parameters
    if (!tool) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: tool',
        availableTools: ['cv-analyzer', 'data-export', 'perf-audit', 'list', 'info', 'stats']
      })
    }

    console.log(`🔧 CLI tool command:`, { tool, args, options })

    // Execute cli-tool command
    const result = await commandHandler.executeCommand('cli-tool', [tool, ...args], options)
    
    // Format output for Claude Code display
    const formattedResult = commandHandler.formatOutput(result)

    return res.status(200).json({
      success: true,
      command: `/cli-tool ${tool} ${args.join(' ')}`.trim(),
      timestamp: new Date().toISOString(),
      ...formattedResult
    })

  } catch (error) {
    console.error('❌ CLI tool command error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'CLI tool command failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// Support larger payloads for file processing
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}