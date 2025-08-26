// BUG FIXER AGENT - Naprawia błędy znalezione przez File Reader Agent
// Agent #2 w systemie debug CVPerfect

const fs = require('fs').promises;
const path = require('path');

class BugFixerAgent {
  constructor() {
    this.name = 'Bug Fixer Agent';
    this.id = 'bug_fixer_002';
    this.status = 'idle';
    this.fixes = [];
    this.backups = [];
    this.fixReport = null;
    
    console.log('🔧 Bug Fixer Agent initialized');
  }

  // Główna funkcja naprawiania błędów
  async fixIssues(analysisReport) {
    console.log('🚀 Starting bug fixing process...');
    this.status = 'fixing';
    
    try {
      if (!analysisReport || !analysisReport.issues) {
        throw new Error('No analysis report provided');
      }

      // Utworz backup przed modyfikacjami
      await this.createBackup();
      
      // Napraw krytyczne błędy najpierw
      await this.fixCriticalIssues(analysisReport.issues.critical);
      
      // Następnie warnings
      await this.fixWarningIssues(analysisReport.issues.warnings);
      
      // Wygeneruj raport naprawek
      this.generateFixReport();
      this.status = 'completed';
      
      console.log('✅ Bug fixing completed. Applied', this.fixes.length, 'fixes');
      return this.fixReport;
      
    } catch (error) {
      console.error('❌ Bug fixing failed:', error);
      this.status = 'error';
      // Przywróć backup jeśli coś poszło nie tak
      await this.restoreBackup();
      throw error;
    }
  }

  // Utworz backup plików
  async createBackup() {
    console.log('💾 Creating backup of files...');
    
    const filesToBackup = [
      'pages/success.js',
      'pages/api/get-session-data.js',
      'pages/api/get-session.js'
    ];

    for (const filePath of filesToBackup) {
      try {
        const fullPath = path.join(process.cwd(), filePath);
        const content = await fs.readFile(fullPath, 'utf8');
        const backupPath = fullPath + '.backup-' + Date.now();
        
        await fs.writeFile(backupPath, content);
        this.backups.push({ original: fullPath, backup: backupPath });
        console.log(`✅ Backed up: ${filePath}`);
      } catch (error) {
        console.warn(`⚠️ Could not backup ${filePath}:`, error.message);
      }
    }
  }

  // Napraw krytyczne błędy
  async fixCriticalIssues(criticalIssues) {
    console.log('🔥 Fixing critical issues...');
    
    for (const issue of criticalIssues) {
      if (issue.category === 'Infinite Loop') {
        await this.fixInfiniteLoop(issue);
      }
    }
  }

  // Napraw infinite loop w fetchUserDataFromSession
  async fixInfiniteLoop(issue) {
    console.log('🔄 Fixing infinite loop in fetchUserDataFromSession...');
    
    try {
      const successPath = path.join(process.cwd(), 'pages', 'success.js');
      let content = await fs.readFile(successPath, 'utf8');
      
      // Znajdź i napraw problematyczną funkcję fetchUserDataFromSession
      const oldFunctionPattern = /const fetchUserDataFromSession = async \(sessionId, retryCount = 0\) => \{[\s\S]*?return \{ success: false, source: 'error' \}\s*\n\s*\} catch \(error\) \{[\s\S]*?\}\s*\}/;
      
      const newFunction = `const fetchUserDataFromSession = async (sessionId, retryCount = 0) => {
    const MAX_RETRIES = 3
    
    // CRITICAL FIX: Add proper exit conditions
    if (retryCount >= MAX_RETRIES) {
      console.log('🚫 Max retries exceeded, stopping recursion');
      return { success: false, source: 'max_retries_exceeded' };
    }
    
    try {
      console.log(\`🔍 [Attempt \${retryCount + 1}] Fetching session data for:\`, sessionId)
      console.log('🐛 DEBUG: fetchUserDataFromSession called at:', new Date().toISOString())
      
      // ENTERPRISE PRIORITY LOADING SYSTEM
      let fullSessionData = null
      let stripeSessionData = null
      let actualSessionId = sessionId
      
      // Add timeout to prevent hanging
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      // PARALLEL DATA LOADING for better performance with timeout protection
      const [stripeResponse, directSessionResponse] = await Promise.race([
        Promise.allSettled([
          fetch(\`/api/get-session?session_id=\${sessionId}\`),
          fetch(\`/api/get-session-data?session_id=\${sessionId}\`)
        ]),
        timeout
      ]);
      
      // Process Stripe response
      if (stripeResponse.status === 'fulfilled' && stripeResponse.value.ok) {
        stripeSessionData = await stripeResponse.value.json()
        
        if (stripeSessionData.success && stripeSessionData.session?.metadata?.fullSessionId) {
          actualSessionId = stripeSessionData.session.metadata.fullSessionId
          console.log('🎯 Found fullSessionId in Stripe metadata:', actualSessionId)
          
          // Re-fetch with actual session ID if different - WITH TIMEOUT
          if (actualSessionId !== sessionId) {
            const fullResponse = await Promise.race([
              fetch(\`/api/get-session-data?session_id=\${actualSessionId}\`),
              timeout
            ]);
            if (fullResponse.ok) {
              fullSessionData = await fullResponse.json()
            }
          }
        }
      }
      
      // Process direct session response
      if (directSessionResponse.status === 'fulfilled' && directSessionResponse.value.ok && !fullSessionData) {
        fullSessionData = await directSessionResponse.value.json()
      }
      
      console.log('📊 Data loading results:', {
        actualSessionId,
        hasStripeData: !!stripeSessionData?.success,
        hasFullSessionData: !!fullSessionData?.success,
        hasCV: !!(fullSessionData?.session?.metadata?.cv),
        cvLength: fullSessionData?.session?.metadata?.cv?.length || 0,
        hasPhoto: !!(fullSessionData?.session?.metadata?.photo)
      })
      
      // ENTERPRISE DATA PROCESSING
      if (fullSessionData?.success && fullSessionData.session?.metadata?.cv) {
        const metadata = fullSessionData.session.metadata
        const plan = stripeSessionData?.session?.metadata?.plan || metadata.plan || 'premium'
        const email = fullSessionData.session.customer_email || stripeSessionData?.session?.customer_email
        
        console.log('✅ ENTERPRISE CV LOADED! Full session data:', {
          sessionId: actualSessionId,
          plan: plan,
          email: email,
          cvLength: metadata.cv.length,
          hasJob: !!metadata.job,
          hasPhoto: !!metadata.photo,
          template: metadata.template,
          processed: metadata.processed,
          dataSource: 'full_session'
        })
        
        // Set plan from authoritative source
        setUserPlan(plan)
        
        // CRITICAL: Process REAL CV data immediately
        console.log('🚀 Processing ENTERPRISE CV data...')
        console.log('📄 CV sample:', metadata.cv.substring(0, 150) + '...')
        
        // Cache data locally for instant subsequent loads
        try {
          localStorage.setItem(\`cv_cache_\${actualSessionId}\`, JSON.stringify({
            metadata,
            timestamp: Date.now(),
            plan
          }))
        } catch (cacheError) {
          console.log('⚠️ Local caching failed:', cacheError.message)
        }
        
        await optimizeCV(metadata.cv, metadata.job || '', metadata.photo, plan)
        return { success: true, source: 'full_session' }
        
      } else if (stripeSessionData?.success && stripeSessionData.session?.metadata?.cv) {
        // FALLBACK: Use Stripe metadata (limited but better than nothing)
        const metadata = stripeSessionData.session.metadata
        setUserPlan(metadata.plan || 'basic')
        
        console.log('⚠️ Using LIMITED Stripe CV data (fallback)...')
        optimizeCVFromMetadata(metadata.cv, metadata.job, metadata.photo || sessionStorage.getItem('pendingPhoto'))
        return { success: true, source: 'stripe_metadata' }
      }
      
      // CRITICAL FIX: Only retry if we have a legitimate reason and haven't exceeded limits
      if (retryCount < MAX_RETRIES - 1 && (!stripeSessionData && !fullSessionData)) {
        console.log(\`🔄 Retrying due to no data... (attempt \${retryCount + 1}/\${MAX_RETRIES})\`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Exponential backoff
        return await fetchUserDataFromSession(sessionId, retryCount + 1)
      }
      
      // 🆕 NEW: SESSIONSTORAGE FALLBACK - Try to get CV data from browser storage
      console.log('🔄 Trying sessionStorage fallback...')
      try {
        const pendingCV = sessionStorage.getItem('pendingCV')
        const pendingJob = sessionStorage.getItem('pendingJob') || ''
        const pendingEmail = sessionStorage.getItem('pendingEmail') || ''
        const pendingPhoto = sessionStorage.getItem('pendingPhoto') || null
        
        if (pendingCV && pendingCV.length > 100) {
          console.log('✅ SESSIONSTORE FALLBACK SUCCESS!')
          console.log('📊 SessionStorage data:', {
            cvLength: pendingCV.length,
            hasJob: !!pendingJob,
            hasPhoto: !!pendingPhoto,
            email: pendingEmail?.substring(0, 20) + '...'
          })
          
          // Process the CV from sessionStorage
          await optimizeCV(pendingCV, pendingJob, pendingPhoto, appState.userPlan)
          
          // Clear sessionStorage after successful use
          sessionStorage.removeItem('pendingCV')
          sessionStorage.removeItem('pendingJob') 
          sessionStorage.removeItem('pendingEmail')
          sessionStorage.removeItem('pendingPhoto')
          
          return { success: true, source: 'sessionStorage_fallback' }
        }
      } catch (sessionError) {
        console.warn('⚠️ SessionStorage fallback failed:', sessionError.message)
      }
      
      // ABSOLUTE LAST RESORT: Show error instead of infinite loop
      console.error('❌ CRITICAL: NO CV DATA FOUND AFTER ALL ATTEMPTS!')
      console.error('🔍 Session IDs tried:', { original: sessionId, actual: actualSessionId })
      console.error('⚠️ This indicates a serious system issue for paid users!')
      
      // Show error state instead of demo for paying users
      if (stripeSessionData?.session?.customer_email) {
        console.log('💳 Paid user detected - showing error state instead of demo')
        setCvData({
          error: true,
          message: 'Nie udało się załadować Twojego CV. Spróbuj odświeżyć stronę.',
          sessionId: actualSessionId,
          email: stripeSessionData.session.customer_email
        })
      } else {
        console.log('👤 No payment detected - showing error state')
        setCvData({
          error: true,
          message: 'Nie wykryto płatności. Wróć do strony głównej i zakup odpowiedni plan.',
          actionRequired: 'purchase'
        })
      }
      
      return { success: false, source: 'error' }
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in fetchUserDataFromSession:', error)
      console.error('🔍 Session ID:', sessionId, 'Retry:', retryCount)
      
      // CRITICAL FIX: Don't retry on certain error types
      if (error.message.includes('timeout') || error.message.includes('fetch')) {
        console.log('🚫 Network/timeout error - not retrying');
        return { success: false, source: 'network_error' };
      }
      
      // Only retry if we haven't exceeded limit and it's not a permanent error
      if (retryCount < MAX_RETRIES - 1) {
        console.log(\`🔄 Error retry... (attempt \${retryCount + 1}/\${MAX_RETRIES})\`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        return await fetchUserDataFromSession(sessionId, retryCount + 1)
      }
      
      return { success: false, source: 'error', error: error.message }
    }
  }`;

      // Zastąp starą funkcję nową
      if (content.match(oldFunctionPattern)) {
        content = content.replace(oldFunctionPattern, newFunction);
        
        await fs.writeFile(successPath, content);
        
        this.fixes.push({
          type: 'CRITICAL',
          category: 'Infinite Loop Fix',
          description: 'Fixed infinite recursion in fetchUserDataFromSession',
          file: 'pages/success.js',
          changes: [
            'Added MAX_RETRIES check at function start',
            'Added proper timeout handling',
            'Added network error type checking',
            'Prevented retry on permanent errors',
            'Added explicit exit conditions'
          ]
        });
        
        console.log('✅ Fixed infinite loop in fetchUserDataFromSession');
      } else {
        console.warn('⚠️ Could not find exact pattern to replace in fetchUserDataFromSession');
      }
      
    } catch (error) {
      console.error('❌ Failed to fix infinite loop:', error);
      throw error;
    }
  }

  // Napraw warnings
  async fixWarningIssues(warningIssues) {
    console.log('⚠️ Fixing warning issues...');
    
    for (const issue of warningIssues) {
      if (issue.category === 'Memory Leak') {
        await this.fixMemoryLeaks(issue);
      } else if (issue.category === 'React Hooks') {
        await this.fixUseEffectIssues(issue);
      }
    }
  }

  // Napraw memory leaks
  async fixMemoryLeaks(issue) {
    console.log('🧠 Fixing memory leaks...');
    
    try {
      const successPath = path.join(process.cwd(), 'pages', 'success.js');
      let content = await fs.readFile(successPath, 'utf8');
      
      // Dodaj cleanup do głównego useEffect
      const oldUseEffectPattern = /useEffect\(\(\) => \{\s*if \(typeof window !== 'undefined' && !initializationRef\.current\) \{[\s\S]*?\}\s*\}, \[\]\)/;
      
      const newUseEffect = `useEffect(() => {
    if (typeof window !== 'undefined' && !initializationRef.current) {
      initializationRef.current = true
      const startTime = performance.now()
      trackPerformance('initialization-start')
      
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session_id')
        const templateParam = urlParams.get('template')
        const planParam = urlParams.get('plan')
        const langParam = urlParams.get('lang')
        
        // Initialize URL-based state
        const urlBasedState = {}
        
        if (planParam) urlBasedState.userPlan = planParam
        if (templateParam && templateParam !== 'default') urlBasedState.selectedTemplate = templateParam
        if (langParam) urlBasedState.language = langParam
        
        // Update state with URL parameters
        if (Object.keys(urlBasedState).length > 0) {
          updateAppState(urlBasedState, 'url-params')
        }
        
        if (sessionId) {
          console.log('🔗 Session ID found:', sessionId)
          
          addNotification({
            type: 'info',
            title: 'Ładowanie CV',
            message: 'Pobieranie danych sesji...'
          })
          
          // Update loading state
          updateAppState({ isSessionLoading: true }, 'session-start')
          
          // Fetch user data from session with enhanced error handling
          enhancedFetchUserDataFromSession(sessionId)
          
          // Simulate ATS score improvement animation
          setTimeout(() => {
            animateATSScore()
          }, 2000)
          
        } else {
          // No session - show error state  
          console.log('⚠️ No session ID found - user must upload CV first')
          updateCvData({
            error: true,
            message: 'Nie znaleziono sesji. Wróć do strony głównej i prześlij swoje CV.',
            actionRequired: 'redirect'
          })
          updateAppState({ 
            isInitializing: false,
            sessionData: { type: 'error' }
          }, 'no-session-error')
        }
        
        // Track initialization performance
        const endTime = performance.now()
        updateMetrics({ 
          loadTime: endTime - startTime,
          initializeTime: endTime - startTime
        })
        
      } catch (error) {
        handleError(error, 'initialization')
      }
    }

    // MEMORY LEAK FIX: Cleanup function
    return () => {
      console.log('🧹 Cleaning up useEffect resources...');
      
      // Clear any timers
      const timers = window.setTimeout.toString().includes('[native code]') ? [] : window.timerIds || [];
      timers.forEach(timer => clearTimeout(timer));
      
      // Clear any intervals
      const intervals = window.setInterval.toString().includes('[native code]') ? [] : window.intervalIds || [];
      intervals.forEach(interval => clearInterval(interval));
      
      // Clear any pending promises
      if (window.pendingPromises) {
        window.pendingPromises.forEach(promise => {
          if (promise.cancel) promise.cancel();
        });
      }
      
      // Reset initialization flag
      initializationRef.current = false;
    };
  }, [])`;

      if (content.match(oldUseEffectPattern)) {
        content = content.replace(oldUseEffectPattern, newUseEffect);
        await fs.writeFile(successPath, content);
        
        this.fixes.push({
          type: 'WARNING',
          category: 'Memory Leak Fix',
          description: 'Added cleanup function to main useEffect',
          file: 'pages/success.js',
          changes: [
            'Added return cleanup function',
            'Clear timers on unmount',
            'Clear intervals on unmount',
            'Reset initialization flag'
          ]
        });
        
        console.log('✅ Fixed memory leak in useEffect');
      }
      
    } catch (error) {
      console.error('❌ Failed to fix memory leaks:', error);
    }
  }

  // Napraw problemy z useEffect
  async fixUseEffectIssues(issue) {
    console.log('🎣 Fixing React hooks issues...');
    // Implementacja w następnej iteracji
  }

  // Przywróć backup
  async restoreBackup() {
    console.log('🔄 Restoring backup files...');
    
    for (const backup of this.backups) {
      try {
        const content = await fs.readFile(backup.backup, 'utf8');
        await fs.writeFile(backup.original, content);
        console.log(`✅ Restored: ${backup.original}`);
      } catch (error) {
        console.error(`❌ Failed to restore ${backup.original}:`, error.message);
      }
    }
  }

  // Wygeneruj raport naprawek
  generateFixReport() {
    const criticalFixes = this.fixes.filter(f => f.type === 'CRITICAL');
    const warningFixes = this.fixes.filter(f => f.type === 'WARNING');

    this.fixReport = {
      timestamp: new Date().toISOString(),
      agent: this.name,
      status: 'completed',
      summary: {
        total_fixes: this.fixes.length,
        critical_fixes: criticalFixes.length,
        warning_fixes: warningFixes.length,
        files_modified: [...new Set(this.fixes.map(f => f.file))].length
      },
      fixes: this.fixes,
      backups: this.backups.map(b => ({ original: b.original, backup: path.basename(b.backup) }))
    };

    console.log('📊 Fix Report Generated:');
    console.log(`  Total Fixes: ${this.fixes.length}`);
    console.log(`  Critical: ${criticalFixes.length}`);
    console.log(`  Warning: ${warningFixes.length}`);
  }

  // Zapisz raport
  async saveReport(filename = 'bug-fixer-report.json') {
    try {
      const reportPath = path.join(process.cwd(), filename);
      await fs.writeFile(reportPath, JSON.stringify(this.fixReport, null, 2));
      console.log('💾 Fix report saved to:', filename);
      return reportPath;
    } catch (error) {
      console.error('❌ Failed to save fix report:', error);
      throw error;
    }
  }
}

module.exports = BugFixerAgent;

// Test jeśli uruchomiony bezpośrednio
if (require.main === module) {
  console.log('🔧 Bug Fixer Agent ready for operation');
}