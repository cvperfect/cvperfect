#!/usr/bin/env node

/**
 * Auto Feature Injector - FORCING Claude to use SuperClaude features
 * This script automatically injects SuperClaude capabilities without user commands
 * 
 * NEVER SKIP - ALWAYS ENFORCE
 */

const fs = require('fs');
const path = require('path');

class AutoFeatureInjector {
    constructor() {
        this.settingsPath = path.join(__dirname, '../settings.json');
        this.logPath = path.join(__dirname, '../auto-enforcement.log');
        this.loadSettings();
    }

    loadSettings() {
        try {
            const settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
            this.enforcement = settings.superclaudeEnforcement?.mandatoryFeatures || {};
        } catch (error) {
            console.error('❌ Failed to load auto-enforcement settings');
            this.enforcement = {};
        }
    }

    /**
     * FORCE Claude to use extended thinking based on keywords
     */
    forceExtendedThinking(userInput) {
        if (!this.enforcement.extendedThinking?.enabled) return '';

        const triggerKeywords = this.enforcement.extendedThinking.autoTriggerKeywords || [];
        const inputLower = userInput.toLowerCase();
        
        const triggered = triggerKeywords.some(keyword => inputLower.includes(keyword));
        
        if (triggered) {
            const tokens = this.enforcement.extendedThinking.minThinkingTokens || 32000;
            this.logAutoAction('EXTENDED_THINKING', tokens);
            
            return `\n🤖 AUTO-INJECTED: Extended thinking with ${tokens} tokens for complex analysis.\nClaude MUST use: ultrathink with ${tokens} thinking tokens\n`;
        }
        
        return '';
    }

    /**
     * FORCE Claude to use token optimization for large operations
     */
    forceTokenOptimization(userInput) {
        if (!this.enforcement.tokenOptimization?.enabled) return '';

        const largeOpKeywords = ['large', 'pages/index.js', 'pages/success.js', 'comprehensive', 'entire', 'full', 'complete'];
        const inputLower = userInput.toLowerCase();
        
        const triggered = largeOpKeywords.some(keyword => inputLower.includes(keyword));
        
        if (triggered) {
            this.logAutoAction('TOKEN_OPTIMIZATION', '70%');
            return `\n🤖 AUTO-INJECTED: Token optimization (70% compression) for large operation.\nClaude MUST apply token optimization techniques.\n`;
        }
        
        return '';
    }

    /**
     * FORCE Claude to generate AI commits for code changes
     */
    forceAICommits(userInput) {
        if (!this.enforcement.aiCommitGeneration?.enabled) return '';

        const codeKeywords = ['fix', 'add', 'update', 'refactor', 'implement', 'create', 'modify', 'change', 'commit'];
        const inputLower = userInput.toLowerCase();
        
        const triggered = codeKeywords.some(keyword => inputLower.includes(keyword));
        
        if (triggered) {
            this.logAutoAction('AI_COMMIT_GENERATION', 'enabled');
            return `\n🤖 AUTO-INJECTED: AI commit message generation for code changes.\nClaude MUST generate commit message when making changes.\n`;
        }
        
        return '';
    }

    /**
     * FORCE Claude to run architecture analysis
     */
    forceArchitectureAnalysis(userInput) {
        if (!this.enforcement.architectureAnalysis?.enabled) return '';

        const archKeywords = this.enforcement.architectureAnalysis.autoTriggerKeywords || [];
        const inputLower = userInput.toLowerCase();
        
        const triggered = archKeywords.some(keyword => inputLower.includes(keyword));
        
        if (triggered) {
            this.logAutoAction('ARCHITECTURE_ANALYSIS', 'full_system');
            return `\n🤖 AUTO-INJECTED: Architecture analysis for structural changes.\nClaude MUST run: node agents/analysis/architecture_analyzer.js\n`;
        }
        
        return '';
    }

    /**
     * Log automatic actions for tracking
     */
    logAutoAction(feature, value) {
        const logEntry = `${new Date().toISOString()} | AUTO_INJECTED | ${feature} | ${value}\n`;
        try {
            fs.appendFileSync(this.logPath, logEntry);
        } catch (error) {
            console.error('Failed to log auto action');
        }
    }

    /**
     * MAIN INJECTION FUNCTION - called by hooks
     */
    injectFeatures(userInput) {
        if (!userInput) return '';

        let injectedContent = '';
        
        // FORCE all applicable features
        injectedContent += this.forceExtendedThinking(userInput);
        injectedContent += this.forceTokenOptimization(userInput);
        injectedContent += this.forceAICommits(userInput);
        injectedContent += this.forceArchitectureAnalysis(userInput);
        
        if (injectedContent) {
            const header = `\n${'='.repeat(60)}\n🔒 SUPERCLAUD AUTO-ENFORCEMENT SYSTEM\n${'='.repeat(60)}`;
            const footer = `\n⚠️  COMPLIANCE MANDATORY - These features will be applied automatically!\n${'='.repeat(60)}\n`;
            
            return header + injectedContent + footer;
        }
        
        return '';
    }

    /**
     * Generate daily auto-enforcement report
     */
    generateDailyReport() {
        try {
            const logContent = fs.readFileSync(this.logPath, 'utf8');
            const today = new Date().toISOString().split('T')[0];
            const todayEntries = logContent.split('\n')
                .filter(line => line.includes(today) && line.includes('AUTO_INJECTED'))
                .filter(line => line.trim());

            const report = `# Auto-Enforcement Report - ${today}

## Features Auto-Applied: ${todayEntries.length}

${todayEntries.map(entry => {
    const parts = entry.split(' | ');
    return `- ${parts[1]}: ${parts[2]} (${parts[3]})`;
}).join('\n')}

## Summary
- Extended Thinking: ${todayEntries.filter(e => e.includes('EXTENDED_THINKING')).length} times
- Token Optimization: ${todayEntries.filter(e => e.includes('TOKEN_OPTIMIZATION')).length} times  
- AI Commits: ${todayEntries.filter(e => e.includes('AI_COMMIT')).length} times
- Architecture Analysis: ${todayEntries.filter(e => e.includes('ARCHITECTURE')).length} times

---
*Auto-generated by SuperClaude Enforcement System*
`;

            const reportPath = path.join(__dirname, '../reports', `auto-enforcement-${today}.md`);
            fs.mkdirSync(path.dirname(reportPath), { recursive: true });
            fs.writeFileSync(reportPath, report);
            
            return report;
        } catch (error) {
            return `Error generating auto-enforcement report: ${error.message}`;
        }
    }
}

// CLI usage
if (require.main === module) {
    const injector = new AutoFeatureInjector();
    const userInput = process.argv.slice(2).join(' ');
    
    if (!userInput) {
        console.log('🤖 Auto Feature Injector - SuperClaude Enforcement');
        console.log('Usage: node auto-feature-injector.js <user input>');
        process.exit(0);
    }

    const injectedContent = injector.injectFeatures(userInput);
    
    if (injectedContent) {
        console.log(injectedContent);
    } else {
        console.log('ℹ️  No auto-enforcement triggers detected in input');
    }
}

module.exports = { AutoFeatureInjector };