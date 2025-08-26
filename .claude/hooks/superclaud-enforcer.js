#!/usr/bin/env node

/**
 * SuperClaude Feature Enforcement System
 * Ensures all new capabilities are used in every session
 * 
 * This script FORCES Claude to use:
 * - Token optimization for large operations
 * - Extended thinking mode for complex tasks  
 * - AI commit generation for all changes
 * - Architecture analysis for structural modifications
 */

const fs = require('fs');
const path = require('path');

class SuperClaudeEnforcer {
    constructor() {
        this.settingsPath = path.join(__dirname, '../settings.json');
        this.sessionLogPath = path.join(__dirname, '../session-compliance.json');
        this.enforcementActive = true;
        
        this.loadSettings();
        this.initializeSession();
    }

    loadSettings() {
        try {
            const settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
            this.enforcement = settings.superclaudeEnforcement || {};
        } catch (error) {
            console.error('❌ Failed to load SuperClaude enforcement settings');
            this.enforcement = { enabled: false };
        }
    }

    initializeSession() {
        const sessionData = {
            sessionId: Date.now(),
            timestamp: new Date().toISOString(),
            enforcementMode: this.enforcement.mode || 'strict',
            featuresRequired: Object.keys(this.enforcement.mandatoryFeatures || {}),
            complianceScore: 0,
            violations: [],
            enforcementActions: []
        };

        this.saveSessionLog(sessionData);
        this.displayEnforcementNotice();
    }

    displayEnforcementNotice() {
        if (!this.enforcement.enabled) return;

        console.log(`
🔒 SUPERCLAUD ENFORCEMENT SYSTEM ACTIVE
=====================================

🎯 MODE: ${this.enforcement.mode.toUpperCase()}
📋 MANDATORY FEATURES:
${Object.entries(this.enforcement.mandatoryFeatures || {}).map(([key, config]) => 
    `   ✅ ${key}: ${config.enabled ? 'ENABLED' : 'DISABLED'}`
).join('\n')}

⚠️  ENFORCEMENT RULES:
${Object.entries(this.enforcement.enforcementRules || {}).map(([trigger, rule]) => 
    `   • ${trigger}: ${rule}`
).join('\n')}

🔥 W tej sesji MUSISZ używać nowych funkcji!
=====================================
`);
    }

    /**
     * Check if token optimization should be enforced
     */
    checkTokenOptimizationRequired(context) {
        if (!this.enforcement.mandatoryFeatures?.tokenOptimization?.enabled) return false;

        const fileSize = context.fileSize || 0;
        const complexity = context.complexity || 'simple';
        const triggerSize = this.enforcement.mandatoryFeatures.tokenOptimization.triggerOnFileSize;
        const triggerComplexity = this.enforcement.mandatoryFeatures.tokenOptimization.triggerOnComplexity;

        if (fileSize > triggerSize) return true;
        if (complexity === 'medium' || complexity === 'complex') return true;

        return false;
    }

    /**
     * Check if extended thinking mode should be enforced  
     */
    checkExtendedThinkingRequired(task) {
        if (!this.enforcement.mandatoryFeatures?.extendedThinking?.enabled) return false;

        // Keywords that trigger extended thinking
        const complexKeywords = [
            'analyze', 'architecture', 'optimize', 'refactor', 
            'debug', 'complex', 'system', 'performance',
            'security', 'scalability', 'design'
        ];

        const taskLower = task.toLowerCase();
        return complexKeywords.some(keyword => taskLower.includes(keyword));
    }

    /**
     * Generate enforcement reminder for Claude
     */
    generateEnforcementReminder(violationType, context = {}) {
        const reminders = {
            tokenOptimization: `
🔧 TOKEN OPTIMIZATION REQUIRED
Current operation detected as: ${context.reason || 'large/complex'}
MANDATORY: Use TokenOptimizer.optimizeForLargeOperation()
Command: "Use token optimization for this operation"
`,
            extendedThinking: `
🧠 EXTENDED THINKING MODE REQUIRED  
Task complexity detected: ${context.complexity || 'high'}
MANDATORY: Use extended reasoning mode
Command: "ultrathink with ${context.suggestedTokens || 32000} thinking tokens: [your task]"
`,
            aiCommitGeneration: `
🤖 AI COMMIT GENERATION REQUIRED
Code changes detected, manual commits NOT ALLOWED
MANDATORY: Use AI-generated commit messages
Command: node .claude/hooks/ai-commit-generator.js
`,
            architectureAnalysis: `
🏗️ ARCHITECTURE ANALYSIS REQUIRED
Structural changes detected
MANDATORY: Run architecture analysis
Command: node agents/analysis/architecture_analyzer.js
`
        };

        return reminders[violationType] || '⚠️ SuperClaude enforcement violation detected';
    }

    /**
     * Log compliance violation
     */
    logViolation(type, details) {
        const sessionLog = this.loadSessionLog();
        sessionLog.violations.push({
            type,
            details,
            timestamp: new Date().toISOString()
        });
        
        sessionLog.complianceScore = Math.max(0, sessionLog.complianceScore - 10);
        this.saveSessionLog(sessionLog);
        
        console.log(`❌ COMPLIANCE VIOLATION: ${type}`);
        console.log(this.generateEnforcementReminder(type, details));
    }

    /**
     * Log successful feature usage
     */
    logCompliance(feature, details) {
        const sessionLog = this.loadSessionLog();
        sessionLog.enforcementActions.push({
            feature,
            details,
            timestamp: new Date().toISOString(),
            status: 'compliant'
        });
        
        sessionLog.complianceScore += 5;
        this.saveSessionLog(sessionLog);
        
        console.log(`✅ COMPLIANCE: ${feature} used correctly`);
    }

    /**
     * Generate session compliance report
     */
    generateComplianceReport() {
        const sessionLog = this.loadSessionLog();
        
        const report = `
# SuperClaude Compliance Report
**Session:** ${sessionLog.sessionId}
**Date:** ${sessionLog.timestamp}
**Enforcement Mode:** ${sessionLog.enforcementMode}

## Compliance Score: ${sessionLog.complianceScore}/100

### ✅ Features Used Correctly (${sessionLog.enforcementActions.length})
${sessionLog.enforcementActions.map(action => 
    `- **${action.feature}**: ${action.details.summary || 'Used correctly'} (${action.timestamp})`
).join('\n')}

### ❌ Violations Detected (${sessionLog.violations.length})
${sessionLog.violations.map(violation => 
    `- **${violation.type}**: ${violation.details.reason || 'Rule violated'} (${violation.timestamp})`
).join('\n')}

### 📊 Compliance Status
${sessionLog.complianceScore >= 80 ? '🎉 EXCELLENT - All features used correctly' : 
  sessionLog.complianceScore >= 60 ? '⚠️ GOOD - Minor violations detected' : 
  '🚨 POOR - Multiple violations, enforcement needed'}

---
*Generated by SuperClaude Enforcement System*
`;

        const reportPath = path.join(__dirname, '../compliance-reports', `session-${sessionLog.sessionId}.md`);
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, report);
        
        return report;
    }

    loadSessionLog() {
        try {
            return JSON.parse(fs.readFileSync(this.sessionLogPath, 'utf8'));
        } catch {
            return {
                sessionId: Date.now(),
                timestamp: new Date().toISOString(),
                complianceScore: 100,
                violations: [],
                enforcementActions: []
            };
        }
    }

    saveSessionLog(data) {
        fs.writeFileSync(this.sessionLogPath, JSON.stringify(data, null, 2));
    }

    /**
     * Main enforcement check - called by hooks
     */
    enforceCompliance(operation, context = {}) {
        if (!this.enforcement.enabled) return true;

        let compliant = true;

        // Check token optimization requirement
        if (this.checkTokenOptimizationRequired(context)) {
            if (!context.usedTokenOptimization) {
                this.logViolation('tokenOptimization', {
                    reason: `File size: ${context.fileSize}, Complexity: ${context.complexity}`
                });
                compliant = false;
            } else {
                this.logCompliance('tokenOptimization', context);
            }
        }

        // Check extended thinking requirement
        if (this.checkExtendedThinkingRequired(operation)) {
            if (!context.usedExtendedThinking) {
                this.logViolation('extendedThinking', {
                    reason: 'Complex task detected',
                    suggestedTokens: 32000
                });
                compliant = false;
            } else {
                this.logCompliance('extendedThinking', context);
            }
        }

        return compliant;
    }
}

// CLI usage
if (require.main === module) {
    const enforcer = new SuperClaudeEnforcer();
    
    const operation = process.argv[2] || 'general';
    const context = {
        fileSize: parseInt(process.argv[3]) || 0,
        complexity: process.argv[4] || 'simple',
        usedTokenOptimization: process.argv[5] === 'true',
        usedExtendedThinking: process.argv[6] === 'true'
    };
    
    const compliant = enforcer.enforceCompliance(operation, context);
    
    if (compliant) {
        console.log('✅ Session compliant with SuperClaude requirements');
    } else {
        console.log('❌ Compliance violations detected - check output above');
        process.exit(1);
    }
}

module.exports = { SuperClaudeEnforcer };