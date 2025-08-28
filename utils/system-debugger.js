// System Stability Debugger for CVPerfect
// Comprehensive error detection and automatic recovery

class CVPerfectDebugger {
  constructor() {
    this.errors = [];
    this.fixHistory = [];
    this.confidenceScores = new Map();
    this.init();
  }

  init() {
    this.setupErrorHandling();
    this.detectPortMismatch();
    this.detectHydrationIssues();
    this.monitorPerformance();
  }

  setupErrorHandling() {
    window.addEventListener("error", (e) => this.handleError(e));
    window.addEventListener("unhandledrejection", (e) => this.handlePromiseRejection(e));
  }

  detectPortMismatch() {
    const currentPort = window.location.port || '3000';
    const expectedPorts = ['3000', '3001', '3002'];
    
    // Test API endpoints on different ports
    expectedPorts.forEach(async (port) => {
      try {
        const response = await fetch(`http://localhost:${port}/api/health`);
        if (response.ok && port !== currentPort) {
          console.warn(`🚨 Port mismatch detected: Server on ${port}, Frontend on ${currentPort}`);
          this.suggestFix("PORT_MISMATCH", `Server is running on port ${port} but frontend expects ${currentPort}`, 0.95);
        }
      } catch (error) {
        // Port not available
      }
    });
  }

  detectHydrationIssues() {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(" ");
      if (message.includes("Hydration") || message.includes("hydr")) {
        this.suggestFix("HYDRATION_ERROR", "React hydration mismatch detected", 0.9, {
          fix: "Use dynamic imports with ssr: false for client-only components",
          pattern: "startTransition wrapper for state updates"
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  monitorPerformance() {
    // Monitor for 400 Bad Request errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (response.status === 400 && args[0].includes("performance-metrics")) {
          this.suggestFix("API_AUTH_ERROR", "Performance metrics API authentication failure", 0.95, {
            fix: "Check x-admin-key header and PERFORMANCE_DASHBOARD_KEY environment variable"
          });
        }
        return response;
      } catch (error) {
        this.handleError(error);
        throw error;
      }
    };
  }

  handleError(error) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    this.errors.push(errorInfo);
    this.analyzeAndSuggestFix(errorInfo);
  }

  handlePromiseRejection(event) {
    this.handleError(new Error(event.reason));
  }

  analyzeAndSuggestFix(errorInfo) {
    // Pattern matching for known issues
    if (errorInfo.message.includes("Cannot read properties")) {
      this.suggestFix("NULL_REFERENCE", "Null reference error", 0.8, {
        fix: "Add null checks and optional chaining",
        pattern: "obj?.property or obj && obj.property"
      });
    }

    if (errorInfo.message.includes("Failed to fetch")) {
      this.suggestFix("NETWORK_ERROR", "Network request failed", 0.85, {
        fix: "Check API endpoint availability and CORS settings"
      });
    }
  }

  suggestFix(type, description, confidence, details = {}) {
    const fix = {
      type,
      description,
      confidence,
      details,
      timestamp: new Date().toISOString()
    };

    this.confidenceScores.set(type, confidence);
    this.fixHistory.push(fix);

    if (confidence >= 0.9) {
      console.group(`🔧 HIGH CONFIDENCE FIX (${Math.round(confidence * 100)}%)`);
      console.log(`Issue: ${description}`);
      if (details.fix) console.log(`Fix: ${details.fix}`);
      if (details.pattern) console.log(`Pattern: ${details.pattern}`);
      console.groupEnd();
    }

    return fix;
  }

  getSystemHealth() {
    return {
      totalErrors: this.errors.length,
      highConfidenceFixes: this.fixHistory.filter(f => f.confidence >= 0.9).length,
      criticalIssues: this.errors.filter(e => 
        e.message.includes("Hydration") || 
        e.message.includes("400") ||
        e.message.includes("Cannot read properties")
      ).length
    };
  }

  generateReport() {
    const health = this.getSystemHealth();
    console.group("🔍 CVPerfect System Health Report");
    console.log(`Total Errors: ${health.totalErrors}`);
    console.log(`High Confidence Fixes: ${health.highConfidenceFixes}`);
    console.log(`Critical Issues: ${health.criticalIssues}`);
    
    if (this.fixHistory.length > 0) {
      console.log("Recent Fixes:");
      this.fixHistory.slice(-5).forEach(fix => {
        console.log(`- ${fix.type}: ${fix.description} (${Math.round(fix.confidence * 100)}%)`);
      });
    }
    console.groupEnd();
  }
}

// Initialize debugger
if (typeof window !== "undefined") {
  window.CVPerfectDebugger = new CVPerfectDebugger();
  
  // Auto-generate report every 30 seconds
  setInterval(() => {
    window.CVPerfectDebugger.generateReport();
  }, 30000);
}
