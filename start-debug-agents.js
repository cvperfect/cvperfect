#!/usr/bin/env node

// SYSTEM DEBUG 3 AGENTÓW - SUCCESS.JS 
// Główny launcher do uruchamiania systemu debug CVPerfect

const SupervisorAgent = require('./agents/debug/supervisor_agent');
const path = require('path');

console.log(`
🎯 CVPerfect DEBUG SYSTEM - 3 AGENTS
==========================================
Agent #1: File Reader    - Czyta i analizuje pliki
Agent #2: Bug Fixer      - Naprawia znalezione błędy  
Agent #3: Supervisor     - Nadzoruje i koordynuje
==========================================
`);

async function main() {
  console.log('🚀 Starting CVPerfect Debug Mission...\n');
  
  try {
    // Inicjalizuj Supervisor Agent (który zarządza pozostałymi)
    const supervisor = new SupervisorAgent();
    
    // Uruchom pełną misję debug
    const finalReport = await supervisor.executeDebugMission();
    
    console.log('\n📊 FINAL MISSION SUMMARY:');
    console.log('=========================');
    console.log(`Status: ${finalReport.session.status}`);
    console.log(`Duration: ${finalReport.session.duration}`);
    console.log(`Issues Found: ${finalReport.summary.issuesFound}`);
    console.log(`Critical Issues: ${finalReport.summary.criticalIssues}`);
    console.log(`Fixes Applied: ${finalReport.summary.fixesApplied}`);
    console.log(`Files Modified: ${finalReport.summary.filesModified}`);
    console.log(`Recommendation: ${finalReport.summary.recommendation}`);
    
    if (finalReport.session.status === 'completed') {
      console.log('\n🎉 SUCCESS! Debug mission completed successfully');
      console.log('📋 Ready for CHECKPOINT 1 verification');
      console.log('\nNext steps:');
      console.log('1. Check if agents run without errors');
      console.log('2. Review generated reports');
      console.log('3. Verify communication between agents');
      console.log('4. Proceed to Phase 2 if everything looks good');
    } else {
      console.log('\n❌ FAILED! Debug mission encountered errors');
      console.log('📋 Manual intervention required');
    }
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR in debug mission:', error.message);
    console.error('Stack trace:', error.stack);
    
    console.log('\n📋 RECOVERY RECOMMENDATIONS:');
    console.log('1. Check file permissions');
    console.log('2. Verify Node.js version compatibility');
    console.log('3. Check if pages/success.js exists');
    console.log('4. Review error details above');
    
    process.exit(1);
  }
}

// Dodaj graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  console.log('💾 Any partial reports should be saved');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Uruchom system
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { SupervisorAgent };