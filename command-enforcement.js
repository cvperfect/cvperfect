// COMMAND ENFORCEMENT SYSTEM
// Automatyczne wykrywanie i wymuszanie wykonania skrótów Claude Code
// Created: 2025-08-25 for CVPerfect
// Purpose: Zapewnić że WSZYSTKIE skróty użytkownika są zawsze wykonywane

class CommandEnforcementSystem {
  constructor() {
    this.MANDATORY_FLAGS = {
      // THINKING MODES - najwyższy priorytet
      '-ut': {
        name: 'ultrathink',
        priority: 1,
        action: 'aktivuj maksymalny budżet obliczeniowy',
        description: 'ULTRATHINK MODE - krytyczne zadania',
        required: true
      },
      '-th': {
        name: 'thinkHard', 
        priority: 2,
        action: 'aktywuj głęboką analizę',
        description: 'THINK HARD MODE - systematyczne podejście',
        required: true
      },
      '-t': {
        name: 'think',
        priority: 3,
        action: 'aktywuj strukturalne myślenie',
        description: 'THINK MODE - podstawowa analiza',
        required: true
      },
      '-td': {
        name: 'thinkDeeper',
        priority: 2,
        action: 'aktywuj bardzo głęboką analizę',
        description: 'THINK DEEPER MODE - dokładne przemyślenie',
        required: true
      },
      
      // WORKFLOW SHORTCUTS
      '-p': {
        name: 'planFirst',
        priority: 4,
        action: 'stwórz szczegółowy plan przed implementacją',
        description: 'PLAN FIRST - nie koduj bez planu',
        required: true
      },
      '-r': {
        name: 'research',
        priority: 4,
        action: 'zbadaj cały codebase przed rozpoczęciem',
        description: 'RESEARCH FIRST - przeanalizuj context',
        required: true
      },
      '-sa': {
        name: 'useSubAgent',
        priority: 3,
        action: 'deleguj do systemu 40 agentów CVPerfect',
        description: 'SUB-AGENT - automatyczna delegacja',
        required: true
      },
      '-todo': {
        name: 'createTodoList',
        priority: 4,
        action: 'użyj TodoWrite tool do śledzenia postępu',
        description: 'TODO LIST - zarządzanie zadaniami',
        required: true
      },
      '-test': {
        name: 'testDriven',
        priority: 5,
        action: 'napisz testy przed implementacją',
        description: 'TEST-DRIVEN - TDD approach',
        required: true
      },
      '-mc': {
        name: 'multiClaude',
        priority: 6,
        action: 'zaproponuj użycie kilku instancji Claude',
        description: 'MULTI-CLAUDE - równoległa praca',
        required: false
      },
      
      // SECURITY & DEBUGGING
      '-fix': {
        name: 'safeFix',
        priority: 3,
        action: 'implementuj z pełną ochroną regresji',
        description: 'SAFE FIX - bezpieczne naprawianie',
        required: true
      },
      '-debug': {
        name: 'debugLoop',
        priority: 4,
        action: 'uruchom systematyczną pętlę debugowania',
        description: 'DEBUG LOOP - systematyczne debugowanie',
        required: true
      },
      '-dm': {
        name: 'debugMasters',
        priority: 2,
        action: 'aktywuj wszystkich 3 Debug Masters',
        description: 'DEBUG MASTERS - zaawansowane debugowanie',
        required: true
      },
      '-check': {
        name: 'regressionCheck',
        priority: 5,
        action: 'uruchom pełną serię testów regresji',
        description: 'REGRESSION CHECK - sprawdź czy nic się nie zepsuło',
        required: true
      },
      
      // SESSION MANAGEMENT
      '-clear': {
        name: 'clearContext',
        priority: 7,
        action: 'sugeruj /clear jeśli kontekst > 70%',
        description: 'CLEAR CONTEXT - zarządzanie pamięcią',
        required: false
      },
      '-init': {
        name: 'sessionInit',
        priority: 6,
        action: 'przeczytaj wszystkie pliki konfiguracyjne',
        description: 'SESSION INIT - pełny setup projektu',
        required: false
      }
    };
    
    this.detectedFlags = [];
    this.executedActions = [];
    this.violationCount = 0;
    this.sessionStats = {
      totalCommands: 0,
      flagsDetected: 0,
      flagsExecuted: 0,
      violationsCount: 0
    };
  }
  
  // GŁÓWNA METODA - wykrywa i wymusza wykonanie wszystkich flag
  enforceExecution(userInput, sessionId = null) {
    console.log('🔍 COMMAND ENFORCEMENT SYSTEM - SCANNING INPUT...');
    
    // Wykryj wszystkie flagi
    this.detectedFlags = this.detectFlags(userInput);
    
    if (this.detectedFlags.length === 0) {
      console.log('✅ No command flags detected - normal execution');
      return { success: true, flagsCount: 0, actions: [] };
    }
    
    // Sortuj według priorytetu 
    const sortedFlags = this.sortByPriority(this.detectedFlags);
    
    console.log(`⚡ MANDATORY EXECUTION REQUIRED:`);
    console.log(`📌 Detected ${sortedFlags.length} flags:`, sortedFlags.map(f => f.flag).join(', '));
    
    // Wymuszenie wykonania
    const enforcement = this.createEnforcementPlan(sortedFlags);
    
    // Update statistics
    this.updateSessionStats(sortedFlags.length);
    
    return {
      success: true,
      flagsCount: sortedFlags.length,
      actions: enforcement.actions,
      executionPlan: enforcement.plan,
      priorityOrder: enforcement.priorityOrder,
      requiredActions: enforcement.required,
      violations: this.violationCount
    };
  }
  
  // Wykrywa wszystkie flagi w tekście użytkownika
  detectFlags(input) {
    const flagPattern = /-[a-z]+/g;
    const matches = input.match(flagPattern) || [];
    const validFlags = [];
    
    matches.forEach(flag => {
      if (this.MANDATORY_FLAGS[flag]) {
        validFlags.push({
          flag: flag,
          config: this.MANDATORY_FLAGS[flag],
          position: input.indexOf(flag)
        });
      } else {
        console.warn(`⚠️  Unknown flag detected: ${flag} (will be ignored)`);
      }
    });
    
    // Remove duplicates
    const unique = validFlags.filter((flag, index, self) => 
      self.findIndex(f => f.flag === flag.flag) === index
    );
    
    return unique;
  }
  
  // Sortuje flagi według priorytetu
  sortByPriority(flags) {
    return flags.sort((a, b) => a.config.priority - b.config.priority);
  }
  
  // Tworzy plan wymuszenia wykonania
  createEnforcementPlan(sortedFlags) {
    const actions = [];
    const requiredActions = [];
    const priorityOrder = [];
    
    sortedFlags.forEach((flagData, index) => {
      const { flag, config } = flagData;
      
      // Dodaj do planu wykonania
      const action = {
        step: index + 1,
        flag: flag,
        name: config.name,
        action: config.action,
        description: config.description,
        priority: config.priority,
        required: config.required,
        status: 'MANDATORY'
      };
      
      actions.push(action);
      priorityOrder.push(`${index + 1}. ${flag} → ${config.description}`);
      
      if (config.required) {
        requiredActions.push(action);
      }
      
      // Log enforcement
      console.log(`   ${index + 1}. ${flag} → ${config.name}`);
      console.log(`      Action: ${config.action}`);
      console.log(`      Priority: ${config.priority} | Required: ${config.required ? 'YES' : 'NO'}`);
    });
    
    console.log(`📋 ENFORCEMENT PLAN CREATED:`);
    console.log(`   Total actions: ${actions.length}`);
    console.log(`   Required actions: ${requiredActions.length}`);
    console.log(`   Optional actions: ${actions.length - requiredActions.length}`);
    
    return {
      actions: actions,
      plan: this.generateExecutionInstructions(actions),
      priorityOrder: priorityOrder,
      required: requiredActions
    };
  }
  
  // Generuje szczegółowe instrukcje wykonania
  generateExecutionInstructions(actions) {
    let instructions = '🎯 MANDATORY EXECUTION PLAN:\n\n';
    
    actions.forEach((action, index) => {
      instructions += `STEP ${action.step}: ${action.flag}\n`;
      instructions += `   ${action.description}\n`;
      instructions += `   Action: ${action.action}\n`;
      instructions += `   Priority: ${action.priority} | ${action.required ? 'REQUIRED' : 'OPTIONAL'}\n`;
      
      // Add specific implementation guidance
      instructions += this.getImplementationGuidance(action.flag);
      instructions += '\n';
    });
    
    instructions += '⚠️  FAILURE TO EXECUTE ALL REQUIRED ACTIONS = COMPLIANCE VIOLATION\n';
    instructions += '✅ SUCCESS CRITERIA: All required actions must be completed\n';
    
    return instructions;
  }
  
  // Dodaje szczegółowe wskazówki implementacji dla każdej flagi
  getImplementationGuidance(flag) {
    const guidance = {
      '-ut': '   💡 Use maximum analysis budget, consider all edge cases, detailed step-by-step planning',
      '-th': '   💡 Deep systematic analysis, alternative solutions, thorough planning',
      '-t': '   💡 Basic structural thinking, clear reasoning',
      '-td': '   💡 Very deep analysis, consequences evaluation, comprehensive review',
      '-p': '   💡 Create detailed plan BEFORE coding, break into steps, define success criteria',
      '-r': '   💡 Study existing patterns, analyze dependencies, understand context fully',
      '-sa': '   💡 Use Task tool with general-purpose subagent, delegate complex multi-step tasks',
      '-todo': '   💡 Use TodoWrite tool, minimum 3-5 concrete steps, track progress',
      '-test': '   💡 Write tests before implementation, create mocks, then implement functionality',
      '-mc': '   💡 Suggest parallel Claude instances, explain work division, provide setup instructions',
      '-fix': '   💡 Read CLAUDE_BEST_PRACTICES.md, check git status, create backups, regression protection',
      '-debug': '   💡 Systematic debugging loop, collect errors, analyze causes, test hypotheses',
      '-dm': '   💡 Activate all 3 Debug Masters: RCA, AI Debugging Copilot, Systematic Debugging',
      '-check': '   💡 Run npm lint + build + tests, compare with previous state, test core functionality',
      '-clear': '   💡 Suggest /clear when context > 70%, explain importance, propose clean restart',
      '-init': '   💡 Read CLAUDE.md + CLAUDE_BEST_PRACTICES.md + project configs, full context init'
    };
    
    return guidance[flag] || '   💡 Execute as defined in SHORTCUTS_HANDLER.md';
  }
  
  // Weryfikacja wykonania (do użycia po zakończeniu)
  verifyExecution(executedFlags) {
    console.log('🔍 COMPLIANCE VERIFICATION...');
    
    const requiredFlags = this.detectedFlags.filter(f => f.config.required);
    const executedSet = new Set(executedFlags);
    
    const missedRequired = requiredFlags.filter(f => !executedSet.has(f.flag));
    
    if (missedRequired.length > 0) {
      this.violationCount++;
      this.sessionStats.violationsCount++;
      
      console.error('❌ COMPLIANCE VIOLATION DETECTED!');
      console.error('❌ MISSED REQUIRED FLAGS:', missedRequired.map(f => f.flag).join(', '));
      console.error('❌ These actions were MANDATORY and must be executed!');
      
      return {
        success: false,
        violation: true,
        missedFlags: missedRequired,
        violationCount: this.violationCount
      };
    }
    
    this.sessionStats.flagsExecuted += executedFlags.length;
    console.log(`✅ COMPLIANCE VERIFIED: All ${requiredFlags.length} required flags executed`);
    
    return {
      success: true,
      violation: false,
      executedCount: executedFlags.length,
      requiredCount: requiredFlags.length
    };
  }
  
  // Update session statistics
  updateSessionStats(flagsCount) {
    this.sessionStats.totalCommands++;
    this.sessionStats.flagsDetected += flagsCount;
  }
  
  // Get current session statistics
  getSessionStats() {
    return {
      ...this.sessionStats,
      complianceRate: this.sessionStats.flagsDetected > 0 
        ? (this.sessionStats.flagsExecuted / this.sessionStats.flagsDetected * 100).toFixed(1) + '%'
        : '100%'
    };
  }
  
  // Reset statistics
  resetStats() {
    this.sessionStats = {
      totalCommands: 0,
      flagsDetected: 0,
      flagsExecuted: 0,
      violationsCount: 0
    };
    this.violationCount = 0;
  }
}

// Export for use in hooks and other systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CommandEnforcementSystem };
} else if (typeof window !== 'undefined') {
  window.CommandEnforcementSystem = CommandEnforcementSystem;
}

// Initialize global instance
const globalEnforcement = new CommandEnforcementSystem();

console.log('✅ COMMAND ENFORCEMENT SYSTEM LOADED');
console.log('📌 All user flags will be detected and enforced automatically');
console.log('⚡ Supported flags:', Object.keys(globalEnforcement.MANDATORY_FLAGS).join(', '));