// FILE READER AGENT - Czyta i analizuje pliki Success.js
// Agent #1 w systemie debug CVPerfect

const fs = require('fs').promises;
const path = require('path');

class FileReaderAgent {
  constructor() {
    this.name = 'File Reader Agent';
    this.id = 'file_reader_001';
    this.status = 'idle';
    this.findings = [];
    this.analysisReport = null;
    
    console.log('📖 File Reader Agent initialized');
  }

  // Główna funkcja analizy success.js
  async analyzeSuccessPage() {
    console.log('🔍 Starting analysis of success.js page...');
    this.status = 'analyzing';
    
    try {
      const successPath = path.join(process.cwd(), 'pages', 'success.js');
      const apiGetSessionPath = path.join(process.cwd(), 'pages', 'api', 'get-session-data.js');
      const apiGetSessionStripePath = path.join(process.cwd(), 'pages', 'api', 'get-session.js');
      
      // Czytaj główne pliki
      const successContent = await fs.readFile(successPath, 'utf8');
      const apiContent = await fs.readFile(apiGetSessionPath, 'utf8');
      const stripeApiContent = await fs.readFile(apiGetSessionStripePath, 'utf8');
      
      // Analizuj success.js
      await this.analyzeSuccessFile(successContent);
      
      // Analizuj API endpoints
      await this.analyzeApiEndpoints(apiContent, stripeApiContent);
      
      // Wyszukaj test files
      await this.analyzeTestFiles();
      
      this.generateAnalysisReport();
      this.status = 'completed';
      
      console.log('✅ Analysis completed. Found', this.findings.length, 'issues');
      return this.analysisReport;
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      this.status = 'error';
      throw error;
    }
  }

  // Analiza pliku success.js
  async analyzeSuccessFile(content) {
    console.log('🔍 Analyzing success.js file...');
    
    const lines = content.split('\n');
    
    // Szukaj infinite loops
    this.checkForInfiniteLoops(content, lines);
    
    // Szukaj memory leaks
    this.checkForMemoryLeaks(content, lines);
    
    // Szukaj problematycznych useEffect
    this.checkUseEffectIssues(content, lines);
    
    // Szukaj session loading issues
    this.checkSessionLoadingIssues(content, lines);
    
    // Sprawdź XSS protection
    this.checkXSSProtection(content, lines);
    
    console.log('✅ Success.js analysis complete');
  }

  // Sprawdź infinite loops
  checkForInfiniteLoops(content, lines) {
    // Szukaj rekurencyjnych wywołań
    const recursivePatterns = [
      /fetchUserDataFromSession\(.*sessionId.*retryCount/g,
      /enhancedFetchUserDataFromSession.*retryCount/g,
      /await.*fetchUserDataFromSession.*retryCount \+ 1/g
    ];
    
    recursivePatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 1) {
        this.findings.push({
          type: 'CRITICAL',
          category: 'Infinite Loop',
          issue: `Potential infinite recursion in pattern ${index + 1}`,
          pattern: pattern.source,
          occurrences: matches.length,
          risk: 'HIGH'
        });
      }
    });

    // Szukaj konkretnych linii z problemami
    lines.forEach((line, lineNumber) => {
      if (line.includes('return await fetchUserDataFromSession(sessionId, retryCount + 1)')) {
        this.findings.push({
          type: 'CRITICAL',
          category: 'Infinite Loop',
          issue: 'Direct recursive call without proper exit condition',
          line: lineNumber + 1,
          code: line.trim(),
          risk: 'HIGH'
        });
      }
    });
  }

  // Sprawdź memory leaks
  checkForMemoryLeaks(content, lines) {
    // Szukaj useEffect bez cleanup
    const useEffectPattern = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]+\}/g;
    const cleanupPattern = /return\s*\(\s*\)\s*=>\s*\{/g;
    
    const useEffects = content.match(useEffectPattern) || [];
    const cleanups = content.match(cleanupPattern) || [];
    
    if (useEffects.length > cleanups.length) {
      this.findings.push({
        type: 'WARNING',
        category: 'Memory Leak',
        issue: 'useEffect hooks without cleanup functions',
        useEffectCount: useEffects.length,
        cleanupCount: cleanups.length,
        risk: 'MEDIUM'
      });
    }

    // Szukaj event listeners bez remove
    lines.forEach((line, lineNumber) => {
      if (line.includes('addEventListener') && !content.includes('removeEventListener')) {
        this.findings.push({
          type: 'WARNING',
          category: 'Memory Leak',
          issue: 'Event listener without removal',
          line: lineNumber + 1,
          risk: 'MEDIUM'
        });
      }
    });
  }

  // Sprawdź problemy z useEffect
  checkUseEffectIssues(content, lines) {
    // Szukaj dependency arrays problemów
    const dependencyIssues = [];
    
    lines.forEach((line, lineNumber) => {
      if (line.includes('useEffect') && line.includes('[]') && 
          content.includes('updateAppState') && content.includes('addNotification')) {
        dependencyIssues.push({
          line: lineNumber + 1,
          issue: 'Empty dependency array with function calls'
        });
      }
    });

    if (dependencyIssues.length > 0) {
      this.findings.push({
        type: 'WARNING',
        category: 'React Hooks',
        issue: 'useEffect dependency array issues',
        details: dependencyIssues,
        risk: 'MEDIUM'
      });
    }
  }

  // Sprawdź session loading
  checkSessionLoadingIssues(content, lines) {
    // Szukaj problemów z session loading
    if (content.includes('fetchUserDataFromSession') && 
        content.includes('enhancedFetchUserDataFromSession')) {
      this.findings.push({
        type: 'INFO',
        category: 'Data Flow',
        issue: 'Multiple session loading functions - potential confusion',
        risk: 'LOW'
      });
    }

    // Sprawdź error handling
    const errorHandlingPattern = /catch\s*\(\s*error\s*\)\s*\{[^}]*\}/g;
    const errorHandlers = content.match(errorHandlingPattern) || [];
    const functionCount = (content.match(/async function|async \w+\s*=/g) || []).length;
    
    if (errorHandlers.length < functionCount * 0.5) {
      this.findings.push({
        type: 'WARNING',
        category: 'Error Handling',
        issue: 'Insufficient error handling in async functions',
        risk: 'MEDIUM'
      });
    }
  }

  // Sprawdź XSS protection
  checkXSSProtection(content, lines) {
    if (content.includes('DOMPurify.sanitize')) {
      this.findings.push({
        type: 'INFO',
        category: 'Security',
        issue: 'XSS protection implemented with DOMPurify',
        risk: 'LOW'
      });
    } else if (content.includes('innerHTML') || content.includes('dangerouslySetInnerHTML')) {
      this.findings.push({
        type: 'WARNING',
        category: 'Security',
        issue: 'HTML injection without sanitization',
        risk: 'HIGH'
      });
    }
  }

  // Analizuj API endpoints
  async analyzeApiEndpoints(apiContent, stripeApiContent) {
    console.log('🔍 Analyzing API endpoints...');
    
    // Sprawdź error handling w API
    if (!apiContent.includes('try') || !apiContent.includes('catch')) {
      this.findings.push({
        type: 'WARNING',
        category: 'API Security',
        issue: 'Missing error handling in get-session-data.js',
        risk: 'MEDIUM'
      });
    }

    // Sprawdź CORS handling
    if (apiContent.includes('handleCORSPreflight')) {
      this.findings.push({
        type: 'INFO',
        category: 'API Security',
        issue: 'CORS preflight handling implemented',
        risk: 'LOW'
      });
    }
  }

  // Analizuj pliki testowe
  async analyzeTestFiles() {
    console.log('🔍 Analyzing test files...');
    
    try {
      const files = await fs.readdir(process.cwd());
      const testFiles = files.filter(f => f.startsWith('test-success'));
      
      this.findings.push({
        type: 'INFO',
        category: 'Testing',
        issue: `Found ${testFiles.length} test files for success page`,
        testFiles: testFiles,
        risk: 'LOW'
      });

      // Sprawdź czy testy są aktualne
      for (const testFile of testFiles.slice(0, 3)) { // Sprawdź tylko pierwsze 3
        try {
          const testContent = await fs.readFile(path.join(process.cwd(), testFile), 'utf8');
          if (testContent.includes('Anna Kowalska')) {
            this.findings.push({
              type: 'WARNING',
              category: 'Testing',
              issue: `Test file ${testFile} checks for demo data`,
              risk: 'MEDIUM'
            });
          }
        } catch (err) {
          // Skip if can't read file
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not analyze test files:', error.message);
    }
  }

  // Wygeneruj raport analizy
  generateAnalysisReport() {
    const critical = this.findings.filter(f => f.type === 'CRITICAL');
    const warnings = this.findings.filter(f => f.type === 'WARNING');
    const info = this.findings.filter(f => f.type === 'INFO');

    this.analysisReport = {
      timestamp: new Date().toISOString(),
      agent: this.name,
      status: 'completed',
      summary: {
        total_issues: this.findings.length,
        critical: critical.length,
        warnings: warnings.length,
        info: info.length
      },
      issues: {
        critical,
        warnings,
        info
      },
      recommendations: this.generateRecommendations(critical, warnings)
    };

    console.log('📊 Analysis Report Generated:');
    console.log(`  Critical Issues: ${critical.length}`);
    console.log(`  Warnings: ${warnings.length}`);
    console.log(`  Info: ${info.length}`);
  }

  // Wygeneruj rekomendacje
  generateRecommendations(critical, warnings) {
    const recommendations = [];

    if (critical.some(c => c.category === 'Infinite Loop')) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Fix infinite recursion in fetchUserDataFromSession',
        impact: 'Prevents page crashes and hanging'
      });
    }

    if (warnings.some(w => w.category === 'Memory Leak')) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Add cleanup functions to useEffect hooks',
        impact: 'Prevents memory leaks and performance degradation'
      });
    }

    if (warnings.some(w => w.category === 'Error Handling')) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Improve error handling in async functions',
        impact: 'Better user experience and debugging'
      });
    }

    return recommendations;
  }

  // Zapisz raport do pliku
  async saveReport(filename = 'file-reader-analysis-report.json') {
    try {
      const reportPath = path.join(process.cwd(), filename);
      await fs.writeFile(reportPath, JSON.stringify(this.analysisReport, null, 2));
      console.log('💾 Analysis report saved to:', filename);
      return reportPath;
    } catch (error) {
      console.error('❌ Failed to save report:', error);
      throw error;
    }
  }
}

module.exports = FileReaderAgent;

// Test jeśli uruchomiony bezpośrednio
if (require.main === module) {
  (async () => {
    const agent = new FileReaderAgent();
    await agent.analyzeSuccessPage();
    await agent.saveReport();
  })();
}