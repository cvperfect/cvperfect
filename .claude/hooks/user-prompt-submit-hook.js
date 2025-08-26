#!/usr/bin/env node
// CLAUDE PROTOCOL AUTO-ENFORCER - Automatyczne wymuszanie wszystkich reguł CLAUDE.md
// Na podstawie superclaud-enforcer.js z cvperfect1

const message = process.argv[2] || '';

// 🔧 SHORTCUT MAPPINGS  
const shortcuts = {
  '-sa': ' 🔒 USE_SUBAGENT_REQUIRED',
  '-th': ' 🔒 THINK_MODE_REQUIRED', 
  '-tth': ' 🔒 THINK_HARD_MODE_REQUIRED',
  '-uth': ' 🔒 ULTRATHINK_MODE_REQUIRED',
  '-tdd': ' 🔒 TEST_DRIVEN_DEVELOPMENT_REQUIRED',
  '-cf': ' 🔒 COMPILE_FIRST_REQUIRED',
  '-vf': ' 🔒 VERIFY_FULL_SEQUENCE_REQUIRED',
  '-ag': ' 🔒 USE_CVPERFECT_AGENTS_REQUIRED',
  '-db': ' 🔒 USE_DEBUG_AGENTS_REQUIRED',
  '-td': ' 🔒 CREATE_TODO_LIST_REQUIRED',
  '-ah': ' 🔒 ANTI_HALLUCINATION_MODE_REQUIRED'
};

// 🤖 AUTO-DETECTION PATTERNS
const patterns = {
  multiStep: /\b(implement|create|build|develop|setup|configure|fix.*and|add.*and|refactor.*and)\b/i,
  debug: /\b(fix|bug|error|debug|problem|issue|broken|failing|crash|napraw)\b/i,
  complex: /\b(analyze|optimize|refactor|architecture|performance|security|audit)\b/i,
  payment: /\b(payment|stripe|checkout|webhook|subscription|plan|płatność)\b/i,
  cvperfect: /\b(cv|template|export|pdf|docx|success|agent|optimization)\b/i,
  testing: /\b(test|testing|spec|jest|cypress|validation)\b/i
};

let enhanced = message;
const flags = new Set();

// 🎯 CONVERT SHORTCUTS
Object.keys(shortcuts).forEach(shortcut => {
  if (message.includes(shortcut)) {
    enhanced = enhanced.replace(new RegExp(shortcut, 'g'), shortcuts[shortcut]);
    flags.add(shortcuts[shortcut].trim().replace('🔒 ', '').replace('_REQUIRED', ''));
  }
});

// 🤖 AUTO-DETECTION
if (patterns.multiStep.test(message)) {
  flags.add('CREATE_TODO_LIST');
  flags.add('USE_SUBAGENT');
}

if (patterns.debug.test(message)) {
  flags.add('USE_DEBUG_AGENTS');  
  flags.add('ANTI_HALLUCINATION_MODE');
  flags.add('COMPILE_FIRST');
}

if (patterns.complex.test(message)) {
  flags.add('ULTRATHINK_MODE');
  flags.add('USE_SUBAGENT');
}

if (patterns.payment.test(message) || patterns.cvperfect.test(message)) {
  flags.add('USE_CVPERFECT_AGENTS');
}

if (patterns.testing.test(message)) {
  flags.add('COMPILE_FIRST');
  flags.add('TEST_DRIVEN_DEVELOPMENT');
}

// 🚀 ADD PROTOCOL ENFORCEMENT
if (flags.size > 0) {
  enhanced += `

🔒 PROTOCOL_ENFORCER ACTIVE - MANDATORY COMPLIANCE:
${Array.from(flags).map(flag => `✅ ${flag}_REQUIRED`).join('\n')}

MANDATORY_EXECUTION_RULES:
${flags.has('CREATE_TODO_LIST') ? '• MUST use TodoWrite tool for task tracking\n' : ''}${flags.has('USE_SUBAGENT') ? '• MUST use Task tool with specialized sub-agent\n' : ''}${flags.has('USE_DEBUG_AGENTS') ? '• MUST use debug agents: node start-debug-agents.js\n' : ''}${flags.has('USE_CVPERFECT_AGENTS') ? '• MUST use CVPerfect 40-agent system: node start-agents-system.js\n' : ''}${flags.has('ULTRATHINK_MODE') ? '• MUST use maximum analysis budget (ultrathink mode)\n' : ''}${flags.has('COMPILE_FIRST') ? '• MUST run npm run build before any tests\n' : ''}${flags.has('ANTI_HALLUCINATION_MODE') ? '• MUST verify all claims and test all fixes\n' : ''}${flags.has('TEST_DRIVEN_DEVELOPMENT') ? '• MUST follow Test → Mock → Implementation pattern\n' : ''}
⚠️ VIOLATION_RESPONSE: Any ignored rule will trigger ERROR and correction request.
21 COMPLETE PROTOCOL RULES from CLAUDE.md - ALL MANDATORY`;
}

// 🔧 DODATOWE HOOKI: PR creation i digest mode
if (message.includes('create PR') || message.includes('create pr')) {
  enhanced += '\n\n🤖 AUTO_PR_CREATION: Use create-PR.md command template for GitHub PR automation';
}

if (message.endsWith('-d')) {
  enhanced = enhanced.replace(/-d\s*$/, '');
  enhanced += '\n\n🔒 DIGEST_MODE_ACTIVE: Keep answer short, focus on key points only. Use bullet points, max 5 lines.';
}

console.log(enhanced);