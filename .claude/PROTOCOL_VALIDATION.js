// CLAUDE PROTOCOL VALIDATOR - Sprawdza zgodność odpowiedzi z regułami
// Używane przez system do walidacji każdej odpowiedzi

class ProtocolValidator {
  constructor() {
    this.violations = [];
    this.mandatoryRules = [
      'TASK_TOOL_USAGE',
      'TODO_WRITE_USAGE', 
      'SUBAGENT_USAGE',
      'COMPILE_FIRST',
      'TDD_WORKFLOW',
      'VERIFICATION_SEQUENCE',
      'ANTI_HALLUCINATION',
      'SYSTEM_INVARIANTS',
      'CONTEXT_MANAGEMENT',
      'CVP_AGENTS_USAGE'
    ];
  }

  // 🔍 VALIDATE RESPONSE COMPLIANCE
  validateResponse(response, userMessage, requiredFlags = []) {
    this.violations = [];
    
    // Check TodoWrite usage for multi-step tasks
    if (this.isMultiStepTask(userMessage) && !this.hasToolUsage(response, 'TodoWrite')) {
      this.violations.push('❌ VIOLATION: Multi-step task requires TodoWrite tool');
    }
    
    // Check Task/Sub-agent usage for complex tasks  
    if (this.needsSubAgent(userMessage) && !this.hasToolUsage(response, 'Task')) {
      this.violations.push('❌ VIOLATION: Complex/specialized task requires sub-agent');
    }
    
    // Check CVPerfect agents for domain-specific tasks
    if (this.needsCVPAgents(userMessage) && !this.mentionsAgentSystem(response)) {
      this.violations.push('❌ VIOLATION: CVPerfect features require agent system');
    }
    
    // Check Debug agents for fix/debug tasks
    if (this.needsDebugAgents(userMessage) && !this.mentionsDebugSystem(response)) {
      this.violations.push('❌ VIOLATION: Debug/fix tasks require debug agent system');
    }
    
    // Check compile-first for testing
    if (this.mentionsTesting(response) && !this.mentionsCompileFirst(response)) {
      this.violations.push('❌ VIOLATION: Tests require compilation first (npm run build)');
    }
    
    // Check verification sequence
    if (this.needsVerification(userMessage) && !this.hasVerificationSequence(response)) {
      this.violations.push('❌ VIOLATION: Missing lint→build→test→verify sequence');
    }
    
    // Check system invariants protection
    if (this.touchesInvariants(userMessage) && !this.protectsInvariants(response)) {
      this.violations.push('❌ VIOLATION: Must protect system invariants (CV, payment, AI, templates)');
    }
    
    return {
      isValid: this.violations.length === 0,
      violations: this.violations,
      score: this.calculateComplianceScore(response, userMessage)
    };
  }

  // 🎯 DETECTION METHODS
  isMultiStepTask(message) {
    const stepIndicators = /\b(and|then|also|additionally|furthermore|moreover|plus|implement.*and|create.*and|fix.*and)\b/gi;
    const complexWords = /\b(implement|develop|build|create|setup|configure|refactor|optimize)\b/i;
    return stepIndicators.test(message) || (message.split(/\s+/).length > 15 && complexWords.test(message));
  }

  needsSubAgent(message) {
    const specializedDomains = /\b(security|performance|database|api|testing|deployment|optimization|analysis|debugging)\b/i;
    const complexity = message.split(/\s+/).length > 20;
    return specializedDomains.test(message) || complexity;
  }

  needsCVPAgents(message) {
    return /\b(payment|stripe|cv|template|export|pdf|docx|optimization|ai|groq|analysis)\b/i.test(message);
  }

  needsDebugAgents(message) {
    return /\b(fix|bug|error|debug|problem|issue|broken|failing|crash|repair)\b/i.test(message);
  }

  needsVerification(message) {
    return /\b(deploy|production|release|publish|test|verify|validate)\b/i.test(message);
  }

  touchesInvariants(message) {
    return /\b(cv upload|payment|stripe|template|export|session|api)\b/i.test(message);
  }

  // 🔍 RESPONSE ANALYSIS METHODS
  hasToolUsage(response, toolName) {
    const toolPattern = new RegExp(`<invoke name="${toolName}">`, 'i');
    return toolPattern.test(response);
  }

  mentionsAgentSystem(response) {
    return /\b(cvperfect.*agent|40.*agent|start-agents-system|supreme.*orchestrator)\b/i.test(response);
  }

  mentionsDebugSystem(response) {
    return /\b(debug.*agent|start-debug-agents|6.*agent.*debug|systematic.*debug)\b/i.test(response);
  }

  mentionsTesting(response) {
    return /\b(test|testing|spec|jest|cypress|npm.*test|node.*test)\b/i.test(response);
  }

  mentionsCompileFirst(response) {
    return /\b(npm.*run.*build|compile.*first|build.*before)\b/i.test(response);
  }

  hasVerificationSequence(response) {
    const sequence = /\b(lint.*build.*test|build.*test.*verify|verification.*sequence)\b/i;
    return sequence.test(response);
  }

  protectsInvariants(response) {
    return /\b(invariant|preserve|protect.*system|regression.*test|baseline)\b/i.test(response);
  }

  // 📊 COMPLIANCE SCORING
  calculateComplianceScore(response, userMessage) {
    let score = 100;
    const deductions = {
      'Missing TodoWrite': -20,
      'Missing Sub-agent': -15,  
      'Missing CVP Agents': -25,
      'Missing Debug Agents': -20,
      'No Compile First': -10,
      'No Verification': -15,
      'No Invariant Protection': -25
    };
    
    this.violations.forEach(violation => {
      Object.keys(deductions).forEach(key => {
        if (violation.includes(key.replace('Missing ', '').replace('No ', ''))) {
          score += deductions[key];
        }
      });
    });
    
    return Math.max(0, score);
  }

  // 🚨 AUTO-CORRECTION SUGGESTIONS  
  generateCorrections(violations) {
    const corrections = [];
    
    violations.forEach(violation => {
      if (violation.includes('TodoWrite')) {
        corrections.push('ADD: <invoke name="TodoWrite"> for task tracking');
      }
      if (violation.includes('sub-agent')) {
        corrections.push('ADD: <invoke name="Task"> with specialized sub-agent');
      }
      if (violation.includes('CVPerfect')) {
        corrections.push('ADD: node start-agents-system.js or CVPerfect agent usage');
      }
      if (violation.includes('Debug')) {
        corrections.push('ADD: node start-debug-agents.js or debug agent usage');
      }
      if (violation.includes('compile')) {
        corrections.push('ADD: npm run build before any tests');
      }
    });
    
    return corrections;
  }
}

// 🚀 EXPORT FOR USE
if (typeof module !== 'undefined') {
  module.exports = ProtocolValidator;
}

// Global access for browser/Claude environment
if (typeof window !== 'undefined') {
  window.ProtocolValidator = ProtocolValidator;
}