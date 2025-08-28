/**
 * CVPerfect Python Integration API v2.0
 * Advanced process pooling with concurrent CV processing
 * 
 * Features:
 * - Process pool management for Gold/Premium plans
 * - Concurrent request handling with queue system
 * - Memory-optimized Python worker processes
 * - Enhanced error recovery and fallback
 * - Plan-based performance scaling
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Environment configuration
const USE_PYTHON = process.env.USE_PYTHON_CLI === 'true' || false;
const PYTHON_TIMEOUT = parseInt(process.env.PYTHON_TIMEOUT || '30000', 10); // 30s
const MAX_CV_LENGTH = 50000; // 50KB max CV size

// Process pool configuration
const POOL_CONFIG = {
  basic: { maxWorkers: 1, timeout: 30000 },
  gold: { maxWorkers: 3, timeout: 45000 },
  premium: { maxWorkers: 5, timeout: 60000 }
};

// Global process pool
class PythonProcessPool {
  constructor() {
    this.workers = new Map(); // plan -> array of workers
    this.queue = new Map(); // plan -> queue of requests
    this.activeRequests = new Map(); // worker -> current request
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    console.log('🔧 Initializing Python Process Pool...');
    
    // Initialize workers for each plan
    for (const [plan, config] of Object.entries(POOL_CONFIG)) {
      this.workers.set(plan, []);
      this.queue.set(plan, []);
      
      // Pre-spawn workers for premium plan (always ready)
      if (plan === 'premium') {
        await this._createWorkers(plan, 2); // Pre-spawn 2 workers
      }
    }
    
    this.initialized = true;
    console.log('✅ Python Process Pool initialized');
  }

  async _createWorkers(plan, count) {
    const workers = this.workers.get(plan) || [];
    const config = POOL_CONFIG[plan];
    
    for (let i = 0; i < count; i++) {
      if (workers.length >= config.maxWorkers) break;
      
      const worker = await this._createWorker(plan);
      if (worker) {
        workers.push(worker);
      }
    }
    
    this.workers.set(plan, workers);
  }

  async _createWorker(plan) {
    try {
      console.log(`🔨 Creating Python worker for ${plan} plan`);
      
      // Create a persistent Python process
      const worker = spawn('python', ['-m', 'cvperfect_py.worker'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      worker.plan = plan;
      worker.busy = false;
      worker.created = Date.now();
      worker.requestCount = 0;
      
      // Handle worker errors
      worker.on('error', (error) => {
        console.error(`🚨 Worker error (${plan}):`, error);
        this._removeWorker(worker);
      });

      worker.on('exit', (code) => {
        console.warn(`⚠️ Worker exited (${plan}):`, code);
        this._removeWorker(worker);
      });

      return worker;
      
    } catch (error) {
      console.error(`🚨 Failed to create worker for ${plan}:`, error);
      return null;
    }
  }

  async processCV(sessionData, plan = 'basic') {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      const request = {
        sessionData,
        plan,
        resolve,
        reject,
        created: Date.now()
      };

      // Add to queue
      const planQueue = this.queue.get(plan);
      planQueue.push(request);

      // Try to assign worker immediately
      this._processQueue(plan).catch(reject);
    });
  }

  async _processQueue(plan) {
    const planQueue = this.queue.get(plan);
    const workers = this.workers.get(plan);
    
    if (planQueue.length === 0) return;
    
    // Find available worker
    let availableWorker = workers.find(w => !w.busy);
    
    // Create new worker if needed and allowed
    if (!availableWorker && workers.length < POOL_CONFIG[plan].maxWorkers) {
      availableWorker = await this._createWorker(plan);
      if (availableWorker) {
        workers.push(availableWorker);
      }
    }

    // Process request if worker available
    if (availableWorker) {
      const request = planQueue.shift();
      this._assignWorker(availableWorker, request);
    }
  }

  _assignWorker(worker, request) {
    worker.busy = true;
    worker.requestCount++;
    this.activeRequests.set(worker, request);

    const timeout = setTimeout(() => {
      request.reject(new Error('Python worker timeout'));
      this._releaseWorker(worker);
    }, POOL_CONFIG[request.plan].timeout);

    this._sendRequest(worker, request)
      .then(result => {
        clearTimeout(timeout);
        request.resolve(result);
        this._releaseWorker(worker);
      })
      .catch(error => {
        clearTimeout(timeout);
        request.reject(error);
        this._releaseWorker(worker);
      });
  }

  async _sendRequest(worker, request) {
    return new Promise((resolve, reject) => {
      const requestId = crypto.randomUUID();
      const payload = {
        id: requestId,
        action: 'optimize_cv',
        data: request.sessionData,
        plan: request.plan
      };

      let response = '';
      let error = '';

      const dataHandler = (data) => {
        response += data.toString();
        
        // Check for complete JSON response
        try {
          const parsed = JSON.parse(response);
          if (parsed.id === requestId) {
            worker.stdout.off('data', dataHandler);
            worker.stderr.off('data', errorHandler);
            resolve(parsed.result);
          }
        } catch (e) {
          // Incomplete JSON, continue listening
        }
      };

      const errorHandler = (data) => {
        error += data.toString();
      };

      worker.stdout.on('data', dataHandler);
      worker.stderr.on('data', errorHandler);

      // Send request
      worker.stdin.write(JSON.stringify(payload) + '\n');
      
      // Timeout for individual request
      setTimeout(() => {
        worker.stdout.off('data', dataHandler);
        worker.stderr.off('data', errorHandler);
        reject(new Error(`Worker request timeout: ${error || 'No error details'}`));
      }, POOL_CONFIG[request.plan].timeout * 0.8);
    });
  }

  _releaseWorker(worker) {
    worker.busy = false;
    this.activeRequests.delete(worker);
    
    // Clean up worker if it has processed too many requests
    if (worker.requestCount > 100) {
      this._removeWorker(worker);
    }
    
    // Process next item in queue
    this._processQueue(worker.plan);
  }

  _removeWorker(worker) {
    const workers = this.workers.get(worker.plan) || [];
    const index = workers.indexOf(worker);
    
    if (index > -1) {
      workers.splice(index, 1);
      
      // Clean up
      if (!worker.killed) {
        worker.kill('SIGTERM');
      }
      
      this.activeRequests.delete(worker);
    }
  }

  async shutdown() {
    console.log('🔄 Shutting down Python Process Pool...');
    
    for (const [plan, workers] of this.workers) {
      for (const worker of workers) {
        if (!worker.killed) {
          worker.kill('SIGTERM');
        }
      }
      workers.length = 0;
    }
    
    this.initialized = false;
    console.log('✅ Python Process Pool shutdown complete');
  }
}

// Global pool instance
const pythonPool = new PythonProcessPool();

// Process cleanup on server shutdown
process.on('SIGTERM', async () => {
  console.log('📤 Server shutdown: cleaning up Python processes...');
  await pythonPool.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📤 Server interrupt: cleaning up Python processes...');
  await pythonPool.shutdown();
  process.exit(0);
});

process.on('exit', () => {
  console.log('👋 Server exit: final cleanup');
});

// Initialize Supabase for user validation (optional)
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

/**
 * Executes Python CLI using process pool (v2.0)
 */
async function executePythonCLI(sessionData, plan = 'basic', template = 'standard') {
  const startTime = Date.now();
  
  try {
    console.log(`🐍 Processing CV with Python Pool (${plan} plan)`);
    
    // Use process pool for execution
    const results = await pythonPool.processCV({
      ...sessionData,
      template,
      plan
    }, plan);

    // Add metadata
    results.metadata = {
      ...results.metadata,
      provider: 'CVPerfect Python Pool v2.0',
      processingTime: Date.now() - startTime,
      version: '2.1.0',
      plan: plan,
      template: template,
      pooled: true
    };

    console.log(`✅ Python Pool completed (${Date.now() - startTime}ms)`);
    return results;

  } catch (poolError) {
    console.warn('⚠️ Process pool failed, falling back to CLI spawn:', poolError.message);
    
    // Fallback to original CLI method
    return await executePythonCLIFallback(sessionData, plan, template, startTime);
  }
}

/**
 * Fallback Python CLI execution (original method)
 */
async function executePythonCLIFallback(sessionData, plan = 'basic', template = 'standard', startTime = Date.now()) {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
      // Create temporary directory for this session
      const sessionId = crypto.randomUUID();
      const tempDir = path.join(process.cwd(), 'temp', sessionId);
      await fs.mkdir(tempDir, { recursive: true });

      // Write CV to temporary file
      const tempCvPath = path.join(tempDir, 'input_cv.txt');
      await fs.writeFile(tempCvPath, sessionData.currentCV, 'utf8');

      // Write job posting if provided
      let jobPostingPath = null;
      if (sessionData.jobPosting && sessionData.jobPosting.trim()) {
        jobPostingPath = path.join(tempDir, 'job_posting.txt');
        await fs.writeFile(jobPostingPath, sessionData.jobPosting, 'utf8');
      }

      // Prepare Python command
      const pythonCmd = 'python';
      const scriptArgs = [
        '-m', 'cvperfect_py.cli',
        'optimize',
        '--cv', tempCvPath,
        '--out', tempDir,
        '--plan', plan,
        '--template', template,
        '--lang', 'auto'
      ];

      if (jobPostingPath) {
        scriptArgs.push('--job', jobPostingPath);
      }

      console.log('🔄 Fallback: Executing Python CLI spawn');

      // Execute Python process
      const pythonProcess = spawn(pythonCmd, scriptArgs, {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: PYTHON_TIMEOUT
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', async (code) => {
        try {
          if (code !== 0) {
            console.error('🚨 Python CLI fallback failed:', { code, stderr: stderr.slice(0, 500) });
            reject(new Error(`Python fallback process exited with code ${code}: ${stderr.slice(0, 200)}`));
            return;
          }

          // Read results (same as before)
          const resultsPath = {
            html: path.join(tempDir, 'optimized_cv.html'),
            improvements: path.join(tempDir, 'improvements.json'),
            report: path.join(tempDir, 'report.json'),
            suggestions: path.join(tempDir, 'suggestions.json')
          };

          const results = {};

          // Read HTML output
          try {
            results.optimizedCV = await fs.readFile(resultsPath.html, 'utf8');
          } catch (e) {
            console.warn('⚠️ HTML output not found, generating basic version');
            results.optimizedCV = generateBasicHTML(sessionData);
          }

          // Read improvements
          try {
            const improvementsData = await fs.readFile(resultsPath.improvements, 'utf8');
            results.improvements = JSON.parse(improvementsData);
          } catch (e) {
            results.improvements = ['CV zostało przetworzone przez system fallback'];
          }

          // Read report (ATS score, etc.)
          try {
            const reportData = await fs.readFile(resultsPath.report, 'utf8');
            const report = JSON.parse(reportData);
            results.atsScore = report.ats_score || 75;
            results.subscores = report.subscores || {};
            results.keywordMatch = report.keyword_match || 80;
          } catch (e) {
            results.atsScore = 75;
            results.keywordMatch = 80;
          }

          // Read suggestions
          try {
            const suggestionsData = await fs.readFile(resultsPath.suggestions, 'utf8');
            results.suggestions = JSON.parse(suggestionsData);
          } catch (e) {
            results.suggestions = [];
          }

          // Generate cover letter
          results.coverLetter = generateCoverLetter(sessionData, results.optimizedCV);

          // Add metadata
          results.metadata = {
            provider: 'CVPerfect Python CLI (Fallback)',
            processingTime: Date.now() - startTime,
            version: '2.1.0',
            plan: plan,
            template: template,
            sessionId: sessionId.slice(0, 8),
            fallback: true
          };

          // Cleanup temp files
          try {
            await fs.rm(tempDir, { recursive: true, force: true });
          } catch (e) {
            console.warn('⚠️ Cleanup failed:', e.message);
          }

          resolve(results);

        } catch (error) {
          console.error('🚨 Error processing fallback results:', error);
          reject(error);
        }
      });

      pythonProcess.on('error', (error) => {
        console.error('🚨 Python fallback process error:', error);
        reject(error);
      });

      // Set timeout
      setTimeout(() => {
        if (!pythonProcess.killed) {
          pythonProcess.kill('SIGTERM');
          reject(new Error('Python fallback process timeout'));
        }
      }, PYTHON_TIMEOUT);

      } catch (error) {
        console.error('🚨 Python CLI fallback setup error:', error);
        reject(error);
      }
    })();
  });
}

/**
 * Generate basic HTML when Python processing fails
 */
function generateBasicHTML(sessionData) {
  const name = extractNameFromCV(sessionData.currentCV);
  return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>CV - ${name}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; }
        .section { margin: 20px 0; }
        .fallback-note { background: #f39c12; color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="fallback-note">⚠️ CV wygenerowane w trybie awaryjnym</div>
    <h1>${name}</h1>
    <div class="section">
        <h2>Treść CV</h2>
        <pre style="white-space: pre-wrap; font-family: inherit;">${sessionData.currentCV}</pre>
    </div>
</body>
</html>`;
}

/**
 * Fallback to Groq API when Python fails
 */
async function fallbackToGroq(sessionData) {
  console.log('🔄 Falling back to Groq API');
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: sessionData.currentCV,
        jobPosting: sessionData.jobPosting,
        email: sessionData.email
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API failed: ${response.status}`);
    }

    const groqResult = await response.json();
    
    // Add fallback metadata
    groqResult.metadata = {
      ...groqResult.metadata,
      fallbackUsed: true,
      provider: 'Groq AI (Fallback)',
      pythonFailed: true
    };

    return groqResult;

  } catch (error) {
    console.error('🚨 Groq fallback failed:', error);
    throw new Error('Both Python and Groq processing failed');
  }
}

/**
 * Simple cover letter generator
 */
function generateCoverLetter(sessionData, optimizedCV) {
  const name = extractNameFromCV(sessionData.currentCV);
  const email = sessionData.email || 'email@example.com';
  
  return `Szanowni Państwo,

Z dużym zainteresowaniem aplikuję na stanowisko${sessionData.jobPosting ? ' opisane w Państwa ogłoszeniu' : ' w Państwa firmie'}. ${name} - jestem przekonany/a, że moje umiejętności idealnie odpowiadają Państwa wymaganiom.

Moje kluczowe kompetencje obejmują:
• Doświadczenie w realizacji projektów zgodnie z wysokimi standardami
• Umiejętności współpracy zespołowej i komunikacji
• Ciągłe doskonalenie zawodowe i adaptację do nowych technologii
• Efektywne rozwiązywanie problemów i zarządzanie czasem

Jestem entuzjastycznie nastawiony/a do możliwości dołączenia do Państwa zespołu i wniesienia swojego wkładu w rozwój organizacji.

Z poważaniem,
${name}
${email}`;
}

/**
 * Enhanced name extraction with better accuracy
 */
function extractNameFromCV(cvText) {
  if (!cvText || cvText.length < 10) return 'Kandydat';
  
  // Try HTML parsing first
  const htmlNameMatch = cvText.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (htmlNameMatch) {
    const cleanName = htmlNameMatch[1].replace(/<[^>]*>/g, '').trim();
    if (cleanName.length > 2 && cleanName.length < 50) return cleanName;
  }
  
  // Try plain text parsing
  const lines = cvText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 2);

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Skip common headers
    if (/^(cv|resume|curriculum|životopis)/i.test(line)) continue;
    
    // Look for name pattern
    if (/^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+/.test(line)) {
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        return words.slice(0, 3).join(' '); // Max 3 words for name
      }
    }
  }
  
  return 'Kandydat';
}

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const startTime = Date.now();

  try {
    const { currentCV, email, jobPosting, sessionId, plan = 'basic', template = 'standard' } = req.body;

    // Enhanced validation
    if (!currentCV || !email) {
      return res.status(400).json({
        success: false,
        error: 'CV i email są wymagane'
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Nieprawidłowy format email'
      });
    }

    if (currentCV.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'CV jest za krótkie (minimum 10 znaków)'
      });
    }

    if (currentCV.length > MAX_CV_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `CV jest za długie (maksimum ${MAX_CV_LENGTH / 1000}KB)`
      });
    }

    console.log(`🔍 Processing CV for: ${email}, plan: ${plan}, Python enabled: ${USE_PYTHON}`);

    // Prepare session data
    const sessionData = {
      currentCV: currentCV.trim(),
      email: email.trim(),
      jobPosting: jobPosting?.trim() || '',
      sessionId: sessionId || 'unknown',
      plan,
      template
    };

    let result = null;

    // Try Python Pool if enabled (preferred for Gold/Premium)
    if (USE_PYTHON && (plan === 'gold' || plan === 'premium')) {
      try {
        console.log(`🐍 Using Python Pool for ${plan} plan processing...`);
        result = await executePythonCLI(sessionData, plan, template);
        console.log('✅ Python Pool processing successful');
      } catch (pythonError) {
        console.warn('⚠️ Python Pool failed, trying Groq fallback:', pythonError.message);
        
        try {
          result = await fallbackToGroq(sessionData);
          console.log('✅ Groq fallback successful');
        } catch (fallbackError) {
          console.error('🚨 Both Python Pool and Groq failed:', fallbackError.message);
          throw new Error('CV processing completely failed. Please try again later.');
        }
      }
    } else if (USE_PYTHON && plan === 'basic') {
      // Basic plan can use either Python or Groq
      try {
        console.log('🐍 Basic plan: Attempting Python processing...');
        result = await executePythonCLI(sessionData, plan, template);
        console.log('✅ Basic Python processing successful');
      } catch (pythonError) {
        console.warn('⚠️ Python failed, using Groq for basic plan:', pythonError.message);
        try {
          result = await fallbackToGroq(sessionData);
          console.log('✅ Groq fallback successful');
        } catch (fallbackError) {
          console.error('🚨 Both processing methods failed:', fallbackError.message);
          throw new Error('CV processing completely failed. Please try again later.');
        }
      }
    } else {
      // Use Groq directly if Python is disabled
      console.log('🤖 Using Groq API (Python disabled or fallback)');
      try {
        result = await fallbackToGroq(sessionData);
      } catch (groqError) {
        console.error('🚨 Groq processing failed:', groqError.message);
        throw new Error('CV processing failed. Please try again later.');
      }
    }

    // User validation (optional - for paid plans)
    if (supabase && email) {
      try {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!userError && user) {
          // Update usage count
          await supabase
            .from('users')
            .update({ 
              usage_count: user.usage_count + 1,
              last_used_at: new Date().toISOString()
            })
            .eq('email', email);

          // Add user info to metadata
          result.metadata = {
            ...result.metadata,
            userPlan: user.plan,
            remainingUses: user.usage_limit - (user.usage_count + 1)
          };
        }
      } catch (dbError) {
        console.warn('⚠️ Database update failed:', dbError.message);
        // Don't fail the request for database issues
      }
    }

    // Add processing metadata
    result.metadata = {
      ...result.metadata,
      totalProcessingTime: Date.now() - startTime,
      apiVersion: '2.1.0',
      timestamp: new Date().toISOString(),
      pythonEnabled: USE_PYTHON
    };

    // Success response
    return res.status(200).json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('🚨 API Error:', error.message);
    
    // Enhanced error responses
    const errorResponse = {
      success: false,
      error: error.message || 'Wystąpił błąd podczas przetwarzania CV',
      metadata: {
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        errorType: error.name || 'UnknownError'
      }
    };

    // Specific error handling
    if (error.message?.includes('timeout')) {
      return res.status(408).json({
        ...errorResponse,
        error: 'Przetwarzanie przekroczyło limit czasu. Spróbuj z krótszym CV.'
      });
    }

    if (error.message?.includes('Python')) {
      return res.status(503).json({
        ...errorResponse,
        error: 'System przetwarzania jest tymczasowo niedostępny. Spróbuj ponownie.'
      });
    }

    return res.status(500).json(errorResponse);
  }
}