/**
 * CVPerfect Python CLI Utilities
 * Helper functions for Python CLI integration
 */

import { spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

// Configuration
const PYTHON_CMD = process.env.PYTHON_PATH || 'python';
const PYTHON_TIMEOUT = parseInt(process.env.PYTHON_TIMEOUT || '30000', 10);
const TEMP_DIR = path.join(process.cwd(), 'temp');

/**
 * Ensures temp directory exists
 */
export async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    console.warn('Failed to create temp directory:', error.message);
  }
}

/**
 * Checks if Python CLI is available
 */
export async function checkPythonAvailability() {
  return new Promise((resolve) => {
    const testProcess = spawn(PYTHON_CMD, ['--version'], { 
      stdio: 'pipe',
      timeout: 5000
    });

    let output = '';
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    testProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    testProcess.on('close', (code) => {
      if (code === 0 && output.includes('Python')) {
        console.log('✅ Python available:', output.trim());
        resolve(true);
      } else {
        console.warn('⚠️ Python not available or failed');
        resolve(false);
      }
    });

    testProcess.on('error', () => {
      console.warn('⚠️ Python command not found');
      resolve(false);
    });

    setTimeout(() => {
      testProcess.kill();
      resolve(false);
    }, 5000);
  });
}

/**
 * Checks if CVPerfect Python module is available
 */
export async function checkCVPerfectPython() {
  return new Promise((resolve) => {
    const testProcess = spawn(PYTHON_CMD, ['-c', 'import cvperfect_py; print("CVPerfect Python OK")'], { 
      stdio: 'pipe',
      timeout: 5000,
      cwd: process.cwd()
    });

    let output = '';
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    testProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    testProcess.on('close', (code) => {
      if (code === 0 && output.includes('CVPerfect Python OK')) {
        console.log('✅ CVPerfect Python module available');
        resolve(true);
      } else {
        console.warn('⚠️ CVPerfect Python module not found:', output);
        resolve(false);
      }
    });

    testProcess.on('error', (error) => {
      console.warn('⚠️ Failed to check CVPerfect Python:', error.message);
      resolve(false);
    });

    setTimeout(() => {
      testProcess.kill();
      resolve(false);
    }, 5000);
  });
}

/**
 * Creates a temporary file with unique name
 */
export async function createTempFile(content, extension = '.txt') {
  const tempName = `cvperfect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
  const tempPath = path.join(TEMP_DIR, tempName);
  
  await ensureTempDir();
  await fs.writeFile(tempPath, content, 'utf8');
  
  return tempPath;
}

/**
 * Cleans up temporary files and directories
 */
export async function cleanupTempFiles(tempPaths) {
  if (!Array.isArray(tempPaths)) {
    tempPaths = [tempPaths];
  }

  for (const tempPath of tempPaths) {
    try {
      const stats = await fs.stat(tempPath);
      if (stats.isDirectory()) {
        await fs.rm(tempPath, { recursive: true, force: true });
      } else {
        await fs.unlink(tempPath);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to cleanup ${tempPath}:`, error.message);
    }
  }
}

/**
 * Plan-to-template mapping
 */
const PLAN_TEMPLATES = {
  basic: 'standard',
  gold: 'modern', 
  premium: 'executive'
};

/**
 * Maps subscription plan to Python template
 */
export function getPythonTemplate(plan) {
  return PLAN_TEMPLATES[plan?.toLowerCase()] || 'standard';
}

/**
 * System health check for Python integration
 */
export async function healthCheck() {
  const health = {
    timestamp: new Date().toISOString(),
    python: {
      available: false,
      version: null,
      path: PYTHON_CMD
    },
    cvperfect: {
      available: false,
      module_path: null
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      node_version: process.version,
      temp_dir: TEMP_DIR,
      temp_writable: false
    }
  };

  // Check Python
  try {
    health.python.available = await checkPythonAvailability();
  } catch (error) {
    console.error('Python health check failed:', error);
  }

  // Check CVPerfect Python
  try {
    health.cvperfect.available = await checkCVPerfectPython();
  } catch (error) {
    console.error('CVPerfect Python health check failed:', error);
  }

  // Check temp directory
  try {
    await ensureTempDir();
    const testFile = path.join(TEMP_DIR, 'health_check.txt');
    await fs.writeFile(testFile, 'test', 'utf8');
    await fs.unlink(testFile);
    health.system.temp_writable = true;
  } catch (error) {
    console.error('Temp directory health check failed:', error);
  }

  return health;
}

/**
 * Performance monitoring wrapper
 */
export function withPerformanceMonitoring(name, fn) {
  return async function(...args) {
    const start = Date.now();
    
    try {
      const result = await fn.apply(this, args);
      const duration = Date.now() - start;
      
      console.log(`📊 ${name} completed in ${duration}ms`);
      
      return {
        ...result,
        performance: {
          operation: name,
          duration_ms: duration,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`📊 ${name} failed after ${duration}ms:`, error.message);
      throw error;
    }
  };
}

export default {
  checkPythonAvailability,
  checkCVPerfectPython,
  createTempFile,
  cleanupTempFiles,
  getPythonTemplate,
  healthCheck,
  withPerformanceMonitoring
};