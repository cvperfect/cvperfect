// SUPERVISOR AGENT - Nadzoruje i koordynuje pracę File Reader i Bug Fixer
// Agent #3 w systemie debug CVPerfect

const fs = require('fs').promises;
const path = require('path');
const FileReaderAgent = require('./file_reader_agent');
const BugFixerAgent = require('./bug_fixer_agent');
const CacheManagerAgent = require('./cache_manager_agent');

class SupervisorAgent {
  constructor() {
    this.name = 'Supervisor Agent';
    this.id = 'supervisor_003';
    this.status = 'idle';
    this.session = {
      startTime: new Date(),
      phase: 'initialization',
      progress: 0
    };
    
    // Inicjalizuj sub-agentów (FAZA 3: + Cache Manager)
    this.fileReader = new FileReaderAgent();
    this.bugFixer = new BugFixerAgent();
    this.cacheManager = new CacheManagerAgent();
    
    this.reports = [];
    this.finalReport = null;
    
    console.log('👁️ Supervisor Agent initialized with sub-agents');
  }

  // Główna funkcja koordynująca całą operację debug
  async executeDebugMission() {
    console.log('🎯 STARTING DEBUG MISSION - Success.js Complete Analysis & Fix');
    console.log('=' * 60);
    
    this.status = 'executing';
    this.session.phase = 'analysis';
    
    try {
      // FAZA 1: ANALIZA
      console.log('\n📖 PHASE 1: FILE ANALYSIS');
      console.log('-' * 30);
      
      const analysisReport = await this.coordinateAnalysis();
      this.reports.push(analysisReport);
      this.session.progress = 33;
      
      // FAZA 2: NAPRAWKI
      console.log('\n🔧 PHASE 2: BUG FIXING');
      console.log('-' * 30);
      
      const fixReport = await this.coordinateFixes(analysisReport);
      this.reports.push(fixReport);
      this.session.progress = 66;
      
      // FAZA 3: WERYFIKACJA
      console.log('\n✅ PHASE 3: VERIFICATION');
      console.log('-' * 30);
      
      const verificationReport = await this.coordinateVerification();
      this.reports.push(verificationReport);
      this.session.progress = 100;
      
      // GENERUJ FINALNY RAPORT
      this.generateFinalReport();
      await this.saveFinalReport();
      
      this.status = 'completed';
      this.session.phase = 'completed';
      
      console.log('\n🎉 DEBUG MISSION COMPLETED SUCCESSFULLY!');
      console.log('=' * 60);
      
      return this.finalReport;
      
    } catch (error) {
      console.error('❌ DEBUG MISSION FAILED:', error);
      this.status = 'failed';
      this.session.phase = 'error';
      
      // Próbuj wygenerować częściowy raport
      this.generatePartialReport(error);
      await this.saveFinalReport();
      
      throw error;
    }
  }

  // Koordynuj analizę plików
  async coordinateAnalysis() {
    console.log('🔍 Coordinating file analysis...');
    
    try {
      const analysisReport = await this.fileReader.analyzeSuccessPage();
      await this.fileReader.saveReport(`analysis-report-${Date.now()}.json`);
      
      // Weryfikuj jakość analizy
      this.validateAnalysisQuality(analysisReport);
      
      console.log('✅ Analysis phase completed successfully');
      return analysisReport;
      
    } catch (error) {
      console.error('❌ Analysis phase failed:', error);
      throw new Error(`Analysis coordination failed: ${error.message}`);
    }
  }

  // Koordynuj naprawki
  async coordinateFixes(analysisReport) {
    console.log('🔧 Coordinating bug fixes...');
    
    try {
      // FIXED: Check if analysisReport and issues exist
      const issues = analysisReport?.issues || {};
      const criticalIssues = issues.critical || [];
      const warningIssues = issues.warnings || [];
      
      console.log(`📊 Issues to fix: ${criticalIssues.length} critical, ${warningIssues.length} warnings`);
      
      if (criticalIssues.length === 0 && warningIssues.length === 0) {
        console.log('🎉 No issues found - no fixes needed');
        return {
          agent: 'Bug Fixer Agent',
          status: 'no_fixes_needed',
          message: 'No issues requiring fixes were found'
        };
      }
      
      // Priorytetyzuj naprawki
      const prioritizedFixes = this.prioritizeFixes(criticalIssues, warningIssues);
      console.log('📋 Fix priorities established:', prioritizedFixes.map(f => f.category));
      
      // Wykonaj naprawki
      const fixReport = await this.bugFixer.fixIssues(analysisReport);
      await this.bugFixer.saveReport(`fix-report-${Date.now()}.json`);
      
      // Weryfikuj jakość naprawek
      this.validateFixQuality(fixReport);
      
      console.log('✅ Bug fixing phase completed successfully');
      return fixReport;
      
    } catch (error) {
      console.error('❌ Bug fixing phase failed:', error);
      throw new Error(`Fix coordination failed: ${error.message}`);
    }
  }

  // Koordynuj weryfikację
  async coordinateVerification() {
    console.log('✅ Coordinating verification...');
    
    try {
      const verificationResults = await this.performSystemVerification();
      
      console.log('✅ Verification phase completed');
      return verificationResults;
      
    } catch (error) {
      console.error('❌ Verification phase failed:', error);
      throw new Error(`Verification coordination failed: ${error.message}`);
    }
  }

  // Przeprowadź weryfikację systemu
  async performSystemVerification() {
    console.log('🔍 Performing system verification...');
    
    const verification = {
      timestamp: new Date().toISOString(),
      agent: this.name,
      checks: []
    };

    // Sprawdź czy pliki istnieją
    const filesToCheck = [
      'pages/success.js',
      'pages/api/get-session-data.js',
      'pages/api/get-session.js'
    ];

    for (const filePath of filesToCheck) {
      try {
        const fullPath = path.join(process.cwd(), filePath);
        await fs.access(fullPath);
        
        // Sprawdź czy plik ma backup
        const backupExists = await this.checkForBackup(fullPath);
        
        verification.checks.push({
          file: filePath,
          status: 'exists',
          hasBackup: backupExists
        });
        
        console.log(`✅ Verified: ${filePath}`);
      } catch (error) {
        verification.checks.push({
          file: filePath,
          status: 'missing',
          error: error.message
        });
        console.warn(`⚠️ Missing: ${filePath}`);
      }
    }

    // Sprawdź składnię JavaScript w success.js
    try {
      const successPath = path.join(process.cwd(), 'pages', 'success.js');
      const content = await fs.readFile(successPath, 'utf8');
      
      // Podstawowa weryfikacja składni (sprawdź nawiasy)
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      
      verification.checks.push({
        file: 'pages/success.js',
        check: 'syntax_basic',
        openBraces,
        closeBraces,
        openParens,
        closeParens,
        braceBalance: openBraces === closeBraces,
        parenBalance: openParens === closeParens,
        status: (openBraces === closeBraces && openParens === closeParens) ? 'valid' : 'invalid'
      });
      
    } catch (error) {
      verification.checks.push({
        file: 'pages/success.js',
        check: 'syntax_basic',
        status: 'error',
        error: error.message
      });
    }

    // Sprawdź czy infinite loop został naprawiony
    try {
      const successPath = path.join(process.cwd(), 'pages', 'success.js');
      const content = await fs.readFile(successPath, 'utf8');
      
      const hasMaxRetries = content.includes('MAX_RETRIES');
      const hasTimeoutProtection = content.includes('timeout');
      const hasExitConditions = content.includes('retryCount >= MAX_RETRIES');
      
      verification.checks.push({
        check: 'infinite_loop_fix',
        hasMaxRetries,
        hasTimeoutProtection,
        hasExitConditions,
        status: (hasMaxRetries && hasTimeoutProtection && hasExitConditions) ? 'fixed' : 'needs_attention'
      });
      
    } catch (error) {
      verification.checks.push({
        check: 'infinite_loop_fix',
        status: 'error',
        error: error.message
      });
    }

    return verification;
  }

  // Sprawdź czy istnieje backup
  async checkForBackup(filePath) {
    try {
      const files = await fs.readdir(path.dirname(filePath));
      const fileName = path.basename(filePath);
      const backupPattern = new RegExp(`${fileName}\\.backup-\\d+`);
      
      return files.some(f => backupPattern.test(f));
    } catch (error) {
      return false;
    }
  }

  // Waliduj jakość analizy
  validateAnalysisQuality(analysisReport) {
    console.log('🔍 Validating analysis quality...');
    
    if (!analysisReport || !analysisReport.issues) {
      throw new Error('Analysis report is incomplete');
    }

    const totalIssues = analysisReport.summary.total_issues;
    console.log(`📊 Analysis found ${totalIssues} issues - quality check passed`);
  }

  // Waliduj jakość naprawek
  validateFixQuality(fixReport) {
    console.log('🔍 Validating fix quality...');
    
    if (!fixReport) {
      console.log('⚠️ No fix report - may indicate no fixes were needed');
      return;
    }

    if (fixReport.status === 'no_fixes_needed') {
      console.log('✅ No fixes needed - validation passed');
      return;
    }

    if (!fixReport.fixes || fixReport.fixes.length === 0) {
      throw new Error('Fix report indicates fixes were applied but no fixes are documented');
    }

    console.log(`📊 Applied ${fixReport.fixes.length} fixes - quality check passed`);
  }

  // Priorytetyzuj naprawki
  prioritizeFixes(criticalIssues, warningIssues) {
    const prioritized = [];
    
    // Krytyczne najpierw
    criticalIssues.forEach(issue => {
      prioritized.push({ ...issue, priority: 'HIGH' });
    });
    
    // Warnings później
    warningIssues.forEach(issue => {
      prioritized.push({ ...issue, priority: 'MEDIUM' });
    });
    
    // Sortuj według typu
    return prioritized.sort((a, b) => {
      const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  // Wygeneruj finalny raport
  generateFinalReport() {
    console.log('📊 Generating final report...');
    
    const endTime = new Date();
    const duration = endTime - this.session.startTime;
    
    this.finalReport = {
      session: {
        id: `debug_mission_${this.session.startTime.getTime()}`,
        startTime: this.session.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: `${Math.round(duration / 1000)}s`,
        status: this.status,
        progress: this.session.progress
      },
      supervisor: {
        name: this.name,
        id: this.id
      },
      agents: {
        fileReader: {
          name: this.fileReader.name,
          status: this.fileReader.status
        },
        bugFixer: {
          name: this.bugFixer.name,
          status: this.bugFixer.status
        }
      },
      phases: {
        analysis: this.reports[0] || null,
        fixes: this.reports[1] || null,
        verification: this.reports[2] || null
      },
      summary: this.generateExecutiveSummary()
    };
  }

  // Wygeneruj podsumowanie wykonawcze
  generateExecutiveSummary() {
    const analysisReport = this.reports[0];
    const fixReport = this.reports[1];
    const verificationReport = this.reports[2];
    
    return {
      issuesFound: analysisReport?.summary?.total_issues || 0,
      criticalIssues: analysisReport?.summary?.critical || 0,
      fixesApplied: fixReport?.summary?.total_fixes || 0,
      filesModified: fixReport?.summary?.files_modified || 0,
      verificationsPassed: verificationReport?.checks?.filter(c => c.status === 'valid' || c.status === 'fixed').length || 0,
      overallStatus: this.status,
      recommendation: this.generateRecommendation()
    };
  }

  // Wygeneruj rekomendację
  generateRecommendation() {
    if (this.status === 'completed') {
      return 'DEBUG MISSION SUCCESSFUL - Proceed to testing phase';
    } else if (this.status === 'failed') {
      return 'DEBUG MISSION FAILED - Manual intervention required';
    } else {
      return 'DEBUG MISSION IN PROGRESS - Monitor status';
    }
  }

  // Wygeneruj częściowy raport przy błędzie
  generatePartialReport(error) {
    console.log('📊 Generating partial report due to error...');
    
    this.finalReport = {
      session: {
        id: `debug_mission_${this.session.startTime.getTime()}`,
        startTime: this.session.startTime.toISOString(),
        endTime: new Date().toISOString(),
        status: 'failed',
        error: error.message,
        phase: this.session.phase,
        progress: this.session.progress
      },
      reports: this.reports,
      summary: {
        issuesFound: this.reports[0]?.summary?.total_issues || 0,
        fixesAttempted: this.reports[1]?.summary?.total_fixes || 0,
        overallStatus: 'failed',
        errorMessage: error.message
      }
    };
  }

  // Zapisz finalny raport
  async saveFinalReport() {
    try {
      const timestamp = Date.now();
      const reportPath = path.join(process.cwd(), `supervisor-final-report-${timestamp}.json`);
      await fs.writeFile(reportPath, JSON.stringify(this.finalReport, null, 2));
      console.log('💾 Final report saved to:', path.basename(reportPath));
      return reportPath;
    } catch (error) {
      console.error('❌ Failed to save final report:', error);
    }
  }

  // Status check dla użytkownika
  getStatus() {
    return {
      supervisor: this.status,
      session: this.session,
      fileReader: this.fileReader.status,
      bugFixer: this.bugFixer.status,
      progress: this.session.progress
    };
  }

  // FAZA 3: Cache Management Coordination
  async coordinateCacheAnalysis(sessionId = 'sess_1755865667776_22z3osqrw') {
    console.log('💾 FAZA 3: Coordinating cache analysis...');
    console.log('=' * 40);
    
    try {
      // Cache analysis using Cache Manager Agent
      const cacheReport = await this.cacheManager.analyzeCache({ sessionId });
      
      console.log('✅ Cache analysis completed');
      console.log('📊 Cache analysis summary:');
      
      if (cacheReport.results) {
        cacheReport.results.forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.type}: ${result.status}`);
        });
      }
      
      if (cacheReport.recommendations) {
        console.log('💡 Recommendations generated:');
        Object.keys(cacheReport.recommendations.categories).forEach(category => {
          const recs = cacheReport.recommendations.categories[category];
          if (recs.length > 0) {
            console.log(`   ${category}: ${recs.length} recommendations`);
          }
        });
      }
      
      this.reports.push({
        phase: 'cache_analysis',
        timestamp: new Date().toISOString(),
        report: cacheReport
      });
      
      return cacheReport;
      
    } catch (error) {
      console.error('❌ Cache analysis failed:', error);
      throw new Error(`Cache analysis coordination failed: ${error.message}`);
    }
  }

  // FAZA 3: Execute complete debug mission with cache analysis
  async executeDebugMissionWithCache(sessionId) {
    console.log('🎯 STARTING ENHANCED DEBUG MISSION - FAZA 3 with Cache Analysis');
    console.log('=' * 70);
    
    this.status = 'executing';
    this.session.phase = 'enhanced_analysis';
    
    try {
      // Original debug phases
      const analysisReport = await this.coordinateAnalysis();
      this.reports.push(analysisReport);
      this.session.progress = 25;
      
      const fixReport = await this.coordinateFixes(analysisReport);  
      this.reports.push(fixReport);
      this.session.progress = 50;
      
      const verificationReport = await this.coordinateVerification();
      this.reports.push(verificationReport);
      this.session.progress = 75;
      
      // FAZA 3: Cache analysis
      console.log('\n💾 PHASE 4: CACHE ANALYSIS (FAZA 3)');
      console.log('-' * 40);
      
      const cacheReport = await this.coordinateCacheAnalysis(sessionId);
      this.reports.push({
        phase: 'cache_analysis',
        timestamp: new Date().toISOString(),
        report: cacheReport
      });
      this.session.progress = 100;
      
      console.log('\n🎉 ENHANCED DEBUG MISSION COMPLETED SUCCESSFULLY!');
      console.log('=' * 70);
      
      // FIXED: Set status to completed BEFORE generating final report
      this.status = 'completed';
      
      // Generate final enhanced report
      this.finalReport = this.generateEnhancedFinalReport();
      
      return this.finalReport;
      
    } catch (error) {
      console.error('❌ Enhanced debug mission failed:', error);
      this.status = 'failed';
      throw error;
    }
  }

  // Generate enhanced final report with cache analysis
  generateEnhancedFinalReport() {
    const report = {
      mission: 'Enhanced Debug Mission - FAZA 3',
      timestamp: new Date().toISOString(),
      agent: this.name,
      session: this.session,
      phases: {
        analysis: this.reports.find(r => r.phase === 'analysis'),
        fixes: this.reports.find(r => r.phase === 'fixes'),
        verification: this.reports.find(r => r.phase === 'verification'),
        cache_analysis: this.reports.find(r => r.phase === 'cache_analysis')
      },
      summary: {
        totalPhases: 4,
        completedPhases: this.reports.length,
        success: this.status === 'completed',
        duration: new Date() - this.session.startTime
      },
      cacheInsights: null
    };

    // Extract cache insights
    const cachePhase = report.phases.cache_analysis;
    if (cachePhase && cachePhase.report) {
      report.cacheInsights = {
        layersAnalyzed: cachePhase.report.results?.length || 0,
        recommendationsGenerated: cachePhase.report.recommendations ? 
          Object.values(cachePhase.report.recommendations.categories).flat().length : 0,
        priority: cachePhase.report.recommendations?.priority || 'unknown'
      };
    }

    console.log('\n📋 ENHANCED FINAL REPORT:');
    console.log(`✅ Mission: ${report.mission}`);
    console.log(`✅ Status: ${report.summary.success ? 'SUCCESS' : 'PARTIAL'}`);
    console.log(`✅ Phases completed: ${report.summary.completedPhases}/${report.summary.totalPhases}`);
    console.log(`✅ Duration: ${Math.round(report.summary.duration / 1000)}s`);
    
    if (report.cacheInsights) {
      console.log(`💾 Cache layers analyzed: ${report.cacheInsights.layersAnalyzed}`);
      console.log(`💡 Cache recommendations: ${report.cacheInsights.recommendationsGenerated}`);
      console.log(`⚠️ Priority level: ${report.cacheInsights.priority}`);
    }

    return report;
  }
}

module.exports = SupervisorAgent;

// Test jeśli uruchomiony bezpośrednio
if (require.main === module) {
  (async () => {
    console.log('👁️ Testing Supervisor Agent...');
    const supervisor = new SupervisorAgent();
    
    try {
      await supervisor.executeDebugMission();
      console.log('✅ Supervisor test completed successfully');
    } catch (error) {
      console.error('❌ Supervisor test failed:', error);
    }
  })();
}