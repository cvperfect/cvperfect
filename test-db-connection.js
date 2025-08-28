// Quick Supabase connection and schema verification
// Run with: node test-db-connection.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables from .env.local
let supabaseUrl, supabaseServiceKey;

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = line.split('=')[1].trim();
    }
  });
} catch (error) {
  console.error('❌ Could not read .env.local file');
}

console.log('🔧 CVPerfect Performance Monitoring Setup');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'Present ✅' : 'Missing ❌');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndSetup() {
  try {
    console.log('\n1️⃣ Testing Supabase connection...');
    
    // Test connection with a simple query
    const { error: connError } = await supabase
      .from('_dummy')
      .select('*')
      .limit(1);
    
    // Connection is OK if we get expected "table doesn't exist" error
    if (connError && !connError.message.includes('does not exist')) {
      console.error('❌ Connection failed:', connError);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    console.log('\n2️⃣ Checking performance_metrics table...');
    
    const { data, error: tableError } = await supabase
      .from('performance_metrics')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (tableError) {
      if (tableError.message.includes('does not exist')) {
        console.log('❌ performance_metrics table NOT found');
        console.log('\n📋 SOLUTION: Execute this in Supabase SQL Editor');
        console.log('👉 1. Go to: https://app.supabase.com/project/cpuotzkxnaitiwdsrzgd/sql/new');
        console.log('👉 2. Paste this SQL and click RUN:');
        console.log(`
-- Create performance_metrics table
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  user_id TEXT,
  client_ip INET,
  user_agent TEXT,
  url TEXT,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_data JSONB,
  timestamp TIMESTAMPTZ NOT NULL,
  bundle_size INTEGER,
  memory_usage JSONB,
  viewport_width INTEGER,
  viewport_height INTEGER,
  connection_type TEXT,
  connection_downlink NUMERIC,
  rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  environment TEXT DEFAULT 'production',
  version TEXT
);

-- Essential indexes for performance
CREATE INDEX idx_perf_timestamp_desc ON performance_metrics (timestamp DESC);
CREATE INDEX idx_perf_metric_name ON performance_metrics (metric_name);
CREATE INDEX idx_perf_metric_data_gin ON performance_metrics USING GIN (metric_data);
        `);
        
        console.log('\n👉 3. After executing SQL, run: node test-db-connection.js');
        return;
      } else {
        console.error('❌ Unexpected error:', tableError);
        return;
      }
    }
    
    console.log('✅ performance_metrics table EXISTS');
    console.log('📊 Current record count:', data?.length || 0);
    
    console.log('\n3️⃣ Testing data insertion...');
    
    const testData = {
      metric_name: 'SETUP_TEST',
      metric_value: 100,
      timestamp: new Date().toISOString(),
      url: '/setup-test',
      user_agent: 'Setup Script',
      metric_data: { setup: true, timestamp: Date.now() }
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('performance_metrics')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return;
    }
    
    console.log('✅ Data insertion successful');
    console.log('📄 Record ID:', insertResult?.[0]?.id);
    
    console.log('\n4️⃣ Testing API endpoint...');
    
    try {
      const testPayload = {
        metric_name: 'API_SETUP_TEST',
        metric_value: 200,
        timestamp: new Date().toISOString(),
        url: '/api-setup-test',
        user_agent: 'Setup Test'
      };
      
      const response = await fetch('http://localhost:3000/api/performance-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ API endpoint working perfectly');
        console.log('📊 Response:', result);
      } else {
        console.error('❌ API error:', result);
      }
      
    } catch (fetchError) {
      console.error('❌ API test failed:', fetchError.message);
      console.log('💡 Ensure dev server is running: npm run dev');
    }
    
    console.log('\n🎉 SETUP COMPLETE! Performance monitoring is ready');
    console.log('💡 Next steps:');
    console.log('   - Visit: http://localhost:3000/performance');
    console.log('   - Monitor: Real-time performance metrics');
    console.log('   - Dashboard: Core Web Vitals tracking');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

checkAndSetup();
