#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Start the Puppeteer MCP server
const serverPath = path.join(__dirname, 'node_modules', '@modelcontextprotocol', 'server-puppeteer', 'dist', 'index.js');

console.log('🚀 Starting Puppeteer MCP Server...');
console.log('📂 Server path:', serverPath);
console.log('👻 Browser running in headless mode (no UI)');
console.log('🔧 DevTools disabled for performance');
console.log('⚡ Full speed mode enabled');
console.log('📡 MCP Server ready for Claude Code connection...\n');

const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PUPPETEER_HEADLESS: 'true', // Hidden mode - no browser window
    PUPPETEER_TIMEOUT: '30000',
    PUPPETEER_DEVTOOLS: 'false', // No DevTools
    PUPPETEER_SLOWMO: '0', // Full speed
    PUPPETEER_ARGS: '--no-sandbox,--disable-dev-shm-usage,--disable-gpu'
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down Puppeteer MCP Server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down Puppeteer MCP Server...');
  server.kill('SIGTERM');
});