// COMPLIANCE TRACKER SYSTEM
// Weryfikuje czy wszystkie skróty użytkownika zostały wykonane
// Created: 2025-08-25 for CVPerfect Command Enforcement
// Purpose: Zapewnić 100% compliance z komendami użytkownika

const fs = require('fs').promises;
const path = require('path');

class ComplianceTracker {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.requiredActions = [];
    this.executedActions = [];
    this.violations = [];
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.complianceLog = [];
    
    // Compliance thresholds
    this.COMPLIANCE_THRESHOLDS = {
      EXCELLENT: 100,  // All flags executed
      GOOD: 85,        // Most flags executed
      WARNING: 70,     // Some flags missed
      CRITICAL: 50     // Many flags missed
    };
    
    // Track session statistics
    this.sessionStats = {
      startTime: Date.now(),
      totalCommands: 0,
      flagsRequired: 0,
      flagsExecuted: 0,
      violations: 0,
      complianceRate: 100
    };
    
    console.log(`📋 COMPLIANCE TRACKER INITIALIZED`);
    console.log(`📊 Session ID: ${this.sessionId}`);
  }
  
  // GŁÓWNA METODA - śledzi komendę użytkownika
  trackUserCommand(userInput, timestamp = Date.now()) {
    console.log('📋 COMPLIANCE TRACKING: Analyzing user command...');
    
    // Wykryj wszystkie flagi
    const detectedFlags = this.extractFlags(userInput);
    
    if (detectedFlags.length === 0) {
      console.log('✅ No flags detected - no compliance tracking needed');
      return { success: true, flagsCount: 0, tracking: false };
    }
    
    // Reset dla nowej komendy
    this.requiredActions = detectedFlags;
    this.executedActions = [];
    
    // Update statistics
    this.sessionStats.totalCommands++;
    this.sessionStats.flagsRequired += detectedFlags.length;
    
    // Log tracking start
    const trackingEntry = {
      timestamp: timestamp,
      command: userInput.substring(0, 100) + (userInput.length > 100 ? '...' : ''),
      requiredFlags: detectedFlags,
      status: 'TRACKING_STARTED',
      sessionId: this.sessionId
    };
    
    this.complianceLog.push(trackingEntry);
    
    console.log(`📌 TRACKING ${detectedFlags.length} MANDATORY FLAGS:`);
    detectedFlags.forEach((flag, index) => {
      console.log(`   ${index + 1}. ${flag} → MUST BE EXECUTED`);
    });
    
    return {
      success: true,
      flagsCount: detectedFlags.length,
      requiredFlags: detectedFlags,
      tracking: true,
      sessionId: this.sessionId
    };
  }
  
  // Ekstraktuje flagi z tekstu użytkownika
  extractFlags(input) {
    const flagPattern = /-[a-z]+/g;
    const matches = input.match(flagPattern) || [];
    
    // Usuń duplikaty i zachowaj kolejność
    const uniqueFlags = [...new Set(matches)];
    
    console.log(`🔍 Flag extraction: Found ${uniqueFlags.length} unique flags`);
    
    return uniqueFlags;
  }
  
  // Rejestruje wykonanie flagi
  markFlagExecuted(flag, evidence = null, timestamp = Date.now()) {
    if (!this.requiredActions.includes(flag)) {
      console.warn(`⚠️  Attempted to mark non-required flag as executed: ${flag}`);
      return { success: false, reason: 'flag_not_required' };
    }
    
    if (this.executedActions.includes(flag)) {
      console.warn(`⚠️  Flag already marked as executed: ${flag}`);
      return { success: false, reason: 'already_executed' };
    }
    
    this.executedActions.push(flag);
    this.sessionStats.flagsExecuted++;
    
    // Log execution
    const executionEntry = {
      timestamp: timestamp,
      flag: flag,
      evidence: evidence,
      status: 'EXECUTED',
      sessionId: this.sessionId
    };
    
    this.complianceLog.push(executionEntry);
    
    console.log(`✅ FLAG EXECUTED: ${flag}`);
    if (evidence) {
      console.log(`   Evidence: ${evidence.substring(0, 50)}${evidence.length > 50 ? '...' : ''}`);
    }
    
    return { success: true, executed: true };
  }
  
  // Weryfikuje kompletność wykonania wszystkich flag
  async verifyCompliance(saveReport = true) {
    console.log('🔍 COMPLIANCE VERIFICATION STARTING...');
    
    const missed = this.requiredActions.filter(flag => !this.executedActions.includes(flag));
    const executedCount = this.executedActions.length;
    const requiredCount = this.requiredActions.length;
    const complianceRate = requiredCount > 0 ? (executedCount / requiredCount) * 100 : 100;
    
    // Update session stats
    this.sessionStats.complianceRate = complianceRate;
    
    // Determine compliance level
    let complianceLevel = 'CRITICAL';
    if (complianceRate >= this.COMPLIANCE_THRESHOLDS.EXCELLENT) {
      complianceLevel = 'EXCELLENT';
    } else if (complianceRate >= this.COMPLIANCE_THRESHOLDS.GOOD) {
      complianceLevel = 'GOOD';
    } else if (complianceRate >= this.COMPLIANCE_THRESHOLDS.WARNING) {
      complianceLevel = 'WARNING';
    }
    
    const verificationResult = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      compliance: {
        rate: complianceRate,
        level: complianceLevel,
        status: missed.length === 0 ? 'COMPLIANT' : 'VIOLATION'
      },
      execution: {
        required: requiredCount,
        executed: executedCount,
        missed: missed.length,
        missedFlags: missed
      },
      details: {
        requiredFlags: this.requiredActions,
        executedFlags: this.executedActions,
        violations: missed
      }
    };
    
    // Log rezultat
    if (missed.length === 0) {
      console.log(`✅ COMPLIANCE VERIFIED: PERFECT EXECUTION`);
      console.log(`📊 All ${requiredCount} required flags executed (${complianceRate}%)`);
    } else {
      this.sessionStats.violations++;
      
      console.error(`❌ COMPLIANCE VIOLATION DETECTED!`);
      console.error(`📊 Compliance Rate: ${complianceRate.toFixed(1)}% (${complianceLevel})`);
      console.error(`❌ MISSED REQUIRED FLAGS (${missed.length}):`);
      
      missed.forEach((flag, index) => {
        console.error(`   ${index + 1}. ${flag} → NOT EXECUTED!`);
      });
      
      console.error(`✅ EXECUTED FLAGS (${executedCount}):`);
      this.executedActions.forEach((flag, index) => {
        console.error(`   ${index + 1}. ${flag} → OK`);
      });
      
      // Add to violations log
      const violation = {
        timestamp: Date.now(),
        sessionId: this.sessionId,
        missedFlags: missed,
        executedFlags: this.executedActions,
        complianceRate: complianceRate,
        severity: complianceLevel
      };
      
      this.violations.push(violation);
      this.complianceLog.push({
        timestamp: Date.now(),
        status: 'VIOLATION',
        details: violation
      });
    }
    
    // Save report if requested
    if (saveReport) {
      await this.saveComplianceReport(verificationResult);
    }
    
    return verificationResult;
  }
  
  // Zapisuje raport compliance do pliku
  async saveComplianceReport(verificationResult) {
    try {
      const reportsDir = path.join(this.projectRoot, '.claude', 'compliance-reports');
      
      // Ensure reports directory exists
      await fs.mkdir(reportsDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `compliance-report-${timestamp}.json`;
      const filepath = path.join(reportsDir, filename);
      
      const fullReport = {
        metadata: {
          generated: new Date().toISOString(),
          sessionId: this.sessionId,
          tracker: 'ComplianceTracker v1.0'
        },
        verification: verificationResult,
        sessionStats: this.sessionStats,
        fullLog: this.complianceLog,
        violations: this.violations
      };
      
      await fs.writeFile(filepath, JSON.stringify(fullReport, null, 2));
      
      console.log(`📄 Compliance report saved: ${filename}`);
      console.log(`📊 Report location: ${filepath}`);
      
      return { success: true, filepath: filepath, filename: filename };
      
    } catch (error) {
      console.error('❌ Failed to save compliance report:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  // Zwraca aktualny status compliance
  getComplianceStatus() {
    const requiredCount = this.requiredActions.length;
    const executedCount = this.executedActions.length;
    const rate = requiredCount > 0 ? (executedCount / requiredCount) * 100 : 100;
    
    return {
      sessionId: this.sessionId,
      status: requiredCount === executedCount ? 'COMPLIANT' : 'PENDING',
      progress: {
        required: requiredCount,
        executed: executedCount,
        remaining: requiredCount - executedCount,
        rate: rate
      },
      flags: {
        required: this.requiredActions,
        executed: this.executedActions,
        remaining: this.requiredActions.filter(f => !this.executedActions.includes(f))
      },
      sessionStats: this.sessionStats
    };
  }
  
  // Reset trackera dla nowej komendy
  reset() {
    this.requiredActions = [];
    this.executedActions = [];
    
    console.log('🔄 Compliance tracker reset for new command');
  }
  
  // Pobiera statystyki sesji
  getSessionStatistics() {
    const currentTime = Date.now();
    const sessionDuration = currentTime - this.sessionStats.startTime;
    
    return {
      ...this.sessionStats,
      sessionDuration: Math.round(sessionDuration / 1000), // seconds
      averageComplianceRate: this.sessionStats.totalCommands > 0 
        ? (this.sessionStats.flagsExecuted / this.sessionStats.flagsRequired * 100).toFixed(1) + '%'
        : '100%',
      violationRate: this.sessionStats.totalCommands > 0 
        ? (this.sessionStats.violations / this.sessionStats.totalCommands * 100).toFixed(1) + '%'
        : '0%'
    };
  }
}

// Export for use in other modules
module.exports = { ComplianceTracker };

// Initialize global instance if running directly
if (require.main === module) {
  const globalTracker = new ComplianceTracker();
  
  // Example usage
  console.log('🧪 COMPLIANCE TRACKER DEMO:');
  
  globalTracker.trackUserCommand('Fix payment bug -ut -debug -test -check');
  console.log('\n📊 Status after tracking:', globalTracker.getComplianceStatus());
  
  // Simulate flag execution
  globalTracker.markFlagExecuted('-ut', 'Activated ultrathink mode');
  globalTracker.markFlagExecuted('-debug', 'Started debug loop');
  // Missing: -test and -check
  
  // Verify compliance
  globalTracker.verifyCompliance(false).then(result => {
    console.log('\n📋 Final verification:', result);
    console.log('\n📊 Session stats:', globalTracker.getSessionStatistics());
  });
}

console.log('✅ COMPLIANCE TRACKER SYSTEM LOADED');
console.log('📋 Ready to track and verify flag execution compliance');