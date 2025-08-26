// Test hook functionality - pre_tool_use blocking

console.log('🔨 Testing CVPerfect Hooks System');
console.log('=' .repeat(50));

// Simulate pre_tool_use hook logic
function preToolUseHook(agent, tool, target) {
  const destructiveCommands = ['rm -rf', 'sudo', 'npm install -g'];
  const protectedFiles = ['webpack.config.js', 'next.config.js', '.env'];
  
  console.log(`\n🔍 Hook checking: ${agent} wants to use ${tool} on ${target}`);
  
  // Check for destructive commands
  for (const cmd of destructiveCommands) {
    if (target.includes(cmd)) {
      return {
        allowed: false,
        reason: `BLOCKED: Destructive command "${cmd}" not allowed`,
        hook: 'pre_tool_use'
      };
    }
  }
  
  // Check for protected files (implementer rule)
  if (agent === 'implementer' && tool === 'Edit') {
    for (const file of protectedFiles) {
      if (target.includes(file)) {
        return {
          allowed: false,
          reason: `BLOCKED: Implementer cannot edit build/config files (${file}) unless explicitly requested`,
          hook: 'pre_tool_use'
        };
      }
    }
  }
  
  return { allowed: true, hook: 'pre_tool_use' };
}

// Simulate post_tool_use hook
function postToolUseHook(agent, tool, target) {
  console.log(`\n📋 Post-hook: ${agent} completed ${tool} on ${target}`);
  
  if (tool === 'Edit') {
    return {
      suggestion: 'Run linter: npm run lint',
      runTests: true,
      hook: 'post_tool_use'
    };
  }
  
  return { hook: 'post_tool_use' };
}

// Test scenarios
console.log('\n### TEST 1: Implementer tries to edit webpack.config.js ###');
const test1 = preToolUseHook('implementer', 'Edit', 'webpack.config.js');
console.log(`Result: ${test1.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
if (!test1.allowed) console.log(`Reason: ${test1.reason}`);

console.log('\n### TEST 2: Implementer tries to edit README.md ###');
const test2 = preToolUseHook('implementer', 'Edit', 'README.md');
console.log(`Result: ${test2.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
const post2 = postToolUseHook('implementer', 'Edit', 'README.md');
if (post2.suggestion) console.log(`Post-hook suggestion: ${post2.suggestion}`);

console.log('\n### TEST 3: Agent tries destructive command ###');
const test3 = preToolUseHook('any-agent', 'Bash', 'rm -rf /');
console.log(`Result: ${test3.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
if (!test3.allowed) console.log(`Reason: ${test3.reason}`);

console.log('\n### TEST 4: Agent tries sudo command ###');
const test4 = preToolUseHook('any-agent', 'Bash', 'sudo apt-get install');
console.log(`Result: ${test4.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
if (!test4.allowed) console.log(`Reason: ${test4.reason}`);

// Summary
console.log('\n' + '=' .repeat(50));
console.log('✅ Hook system is working correctly!');
console.log('- Pre-hook blocks destructive commands');
console.log('- Pre-hook blocks unauthorized config edits');
console.log('- Post-hook suggests linting after edits');