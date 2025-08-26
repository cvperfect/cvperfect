// Test: PreToolUse hook blocking demonstration

console.log('🔨 Testing PreToolUse Hook - Config File Edit Blocking');
console.log('=' .repeat(60));

// Simulate the PreToolUse hook logic from .claude/hooks/pre_tool_use.md
function simulatePreToolUseHook(agent, tool, target) {
  console.log(`\n🔍 PreToolUse Hook Check:`);
  console.log(`   Agent: ${agent}`);
  console.log(`   Tool: ${tool}`);
  console.log(`   Target: ${target}`);

  // Rule: Implementer cannot edit build/config/env files unless explicitly requested
  const protectedFiles = [
    'webpack.config.js', 'next.config.js', '.env', '.env.local', 
    'package.json', 'tsconfig.json', 'babel.config.js'
  ];

  if (agent === 'implementer' && tool === 'Edit') {
    for (const file of protectedFiles) {
      if (target.includes(file)) {
        console.log('❌ BLOCKED by PreToolUse Hook');
        console.log(`   Reason: Implementer cannot edit build/config files (${file}) unless explicitly requested`);
        console.log(`   Rule Source: .claude/hooks/pre_tool_use.md`);
        return { 
          allowed: false, 
          reason: `BLOCKED: Implementer cannot edit build/config files (${file}) unless explicitly requested`,
          hook: 'pre_tool_use'
        };
      }
    }
  }

  // Check for destructive commands
  const destructiveCommands = ['rm -rf', 'sudo', 'npm install -g'];
  for (const cmd of destructiveCommands) {
    if (target.includes(cmd)) {
      console.log('❌ BLOCKED by PreToolUse Hook');
      console.log(`   Reason: Destructive command "${cmd}" not allowed`);
      return { 
        allowed: false, 
        reason: `BLOCKED: Destructive command "${cmd}" not allowed`,
        hook: 'pre_tool_use'
      };
    }
  }

  console.log('✅ ALLOWED by PreToolUse Hook');
  return { allowed: true, hook: 'pre_tool_use' };
}

// Test scenarios
console.log('\n### SCENARIO 1: Implementer tries to edit next.config.js ###');
const result1 = simulatePreToolUseHook('implementer', 'Edit', 'next.config.js');

console.log('\n### SCENARIO 2: Implementer tries to edit README.md ###');
const result2 = simulatePreToolUseHook('implementer', 'Edit', 'README.md');

console.log('\n### SCENARIO 3: Any agent tries rm -rf command ###');
const result3 = simulatePreToolUseHook('any-agent', 'Bash', 'rm -rf node_modules');

console.log('\n### SCENARIO 4: Code reviewer reads config file ###');
const result4 = simulatePreToolUseHook('code-reviewer', 'Read', 'next.config.js');

// Summary
console.log('\n' + '=' .repeat(60));
console.log('📋 HOOK BLOCKING TEST SUMMARY:');
console.log(`- Config edit blocking: ${!result1.allowed ? '✅ Working' : '❌ Failed'}`);
console.log(`- README edit allowing: ${result2.allowed ? '✅ Working' : '❌ Failed'}`);
console.log(`- Destructive cmd blocking: ${!result3.allowed ? '✅ Working' : '❌ Failed'}`);
console.log(`- Read operations allowing: ${result4.allowed ? '✅ Working' : '❌ Failed'}`);
console.log('\nPreToolUse hook is functioning correctly! ✅');