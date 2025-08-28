// Debug API test to find root cause of 500 error
console.log('Starting API debug test...');

// Test 1: Check if dotenv exists
try {
  require('dotenv').config({ path: '.env.local' });
  console.log(' dotenv loaded');
} catch (e) {
  console.log('  dotenv not available, using process.env directly');
}

console.log('\n=== ENVIRONMENT CHECK ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');

// Test 2: Import dependencies one by one
console.log('\n=== DEPENDENCY CHECK ===');
let hasSupabase = false;
try {
  const { createClient } = require('@supabase/supabase-js');
  console.log(' Supabase client import OK');
  hasSupabase = true;
} catch (error) {
  console.error('L Supabase import error:', error.message);
}

try {
  const { CVPerfectValidation } = require('./lib/validation');
  console.log(' Validation import OK');
} catch (error) {
  console.error('L Validation import error:', error.message);
}

try {
  const { CVPerfectCORS } = require('./lib/cors');
  console.log(' CORS import OK');
} catch (error) {
  console.error('L CORS import error:', error.message);
}

try {
  const { CVPerfectErrors } = require('./lib/error-responses');
  console.log(' Error responses import OK');
} catch (error) {
  console.error('L Error responses import error:', error.message);
}

try {
  const { CVPerfectTimeouts } = require('./lib/timeout-utils');
  console.log(' Timeout utils import OK');
} catch (error) {
  console.error('L Timeout utils import error:', error.message);
}

console.log('\nRoot cause analysis complete. If all imports are OK, the issue might be:');
console.log('1. Missing environment variables');
console.log('2. Supabase connection failure');
console.log('3. Middleware execution error');

console.log('\nChecking specific patterns...');

// Test the exact validation logic
const sessionId = 'test123';
const isCVPerfectFormat = /^sess_\d{13}_[a-f0-9]{32}$/.test(sessionId);
const isStripeFormat = /^cs_(test|live)_[a-zA-Z0-9]{24,}$/.test(sessionId);
const isTestFormat = /^test\d+$/.test(sessionId);

console.log('Session ID validation for "test123":');
console.log('  CVPerfect format:', isCVPerfectFormat);
console.log('  Stripe format:', isStripeFormat);
console.log('  Test format:', isTestFormat);
console.log('  Should pass:', isCVPerfectFormat || isStripeFormat || isTestFormat);

if (hasSupabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('\nTesting Supabase connection...');
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  supabase
    .from('cvperfect_sessions')
    .select('session_id')
    .eq('session_id', 'test123')
    .single()
    .then(({ data, error }) => {
      if (error && error.code === 'PGRST116') {
        console.log(' Supabase connection OK (session not found as expected)');
      } else if (error) {
        console.error('L Supabase query error:', error.message);
      } else {
        console.log(' Supabase connection OK');
      }
    })
    .catch(err => {
      console.error('L Supabase connection error:', err.message);
    });
}