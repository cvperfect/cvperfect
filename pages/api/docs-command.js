// CVPerfect /docs Command API Endpoint
// Handles documentation search, generation, and management

import { CVPerfectCommandHandler } from '../../lib/command-handler'
import { handleCORSPreflight } from '../../lib/cors'
import fs from 'fs/promises'
import path from 'path'

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
    
    const { action, query, path: docPath, options = {} } = req.body

    // Validate required parameters
    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: action',
        availableActions: ['search', 'read', 'generate', 'list', 'update']
      })
    }

    console.log(`📚 Docs command:`, { action, query, docPath, options })

    // Execute docs command
    const result = await commandHandler.executeCommand('docs', [action], {
      query,
      path: docPath,
      ...options
    })
    
    // Format output for Claude Code display
    const formattedResult = commandHandler.formatOutput(result)

    return res.status(200).json({
      success: true,
      command: `/docs ${action} ${query || docPath || ''}`.trim(),
      timestamp: new Date().toISOString(),
      ...formattedResult
    })

  } catch (error) {
    console.error('❌ Docs command error:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Docs command failed',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// Support larger payloads for documentation processing
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}