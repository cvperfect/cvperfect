#!/usr/bin/env node

/**
 * SuperClaude Command Enforcement System
 * Wymusza używanie komend SuperClaude gdy użytkownik je wpisuje
 * 
 * Komendy:
 * -ut    = Ultrathink and execute with full autonomous decision-making
 * -sc16  = ultrathink with 16000 thinking tokens
 * -sc32  = ultrathink with 32000 thinking tokens  
 * -sc64  = ultrathink with 64000 thinking tokens
 * -scmax = ultrathink with 128000 thinking tokens
 * -token = Apply token optimization
 * -commit = Generate AI commit message
 * -arch  = Run architecture analysis
 * -analyze = Full system analysis
 */

const fs = require('fs');
const path = require('path');

class SuperClaudeCommandEnforcer {
    constructor() {
        this.settingsPath = path.join(__dirname, '../settings.json');
        this.enforcementLogPath = path.join(__dirname, '../command-enforcement.log');
        
        this.loadCommandMapping();
    }

    loadCommandMapping() {
        try {
            const settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
            this.commandMapping = settings.commandMapping?.superclaudeCommands || {};
        } catch (error) {
            console.error('❌ Failed to load command mapping');
            this.commandMapping = {};
        }
    }

    /**
     * Detect SuperClaude commands in user input
     */
    detectCommands(userInput) {
        const detectedCommands = [];
        
        Object.keys(this.commandMapping).forEach(command => {
            if (userInput.includes(command)) {
                detectedCommands.push({
                    command,
                    ...this.commandMapping[command]
                });
            }
        });

        return detectedCommands;
    }

    /**
     * Generate enforcement message for detected commands
     */
    generateEnforcementMessage(detectedCommands) {
        if (detectedCommands.length === 0) return '';

        let message = `\n🔒 SUPERCLAUD COMMAND ENFORCEMENT ACTIVE\n`;
        message += `================================================\n\n`;
        
        detectedCommands.forEach(cmd => {
            message += `🎯 DETECTED: ${cmd.command}\n`;
            message += `   Description: ${cmd.description}\n`;
            message += `   Action: ${cmd.action}\n`;
            message += `   Status: ${cmd.enforcement}\n\n`;
        });

        message += `⚠️  THESE COMMANDS ARE NOW MANDATORY!\n`;
        message += `Claude MUST execute the actions above.\n`;
        message += `================================================\n`;

        return message;
    }

    /**
     * Log command detection and enforcement
     */
    logEnforcement(detectedCommands, userInput) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            userInput: userInput.substring(0, 200) + (userInput.length > 200 ? '...' : ''),
            detectedCommands: detectedCommands.map(cmd => cmd.command),
            enforcementLevel: detectedCommands.length > 0 ? 'ACTIVE' : 'NONE',
            commandActions: detectedCommands.map(cmd => cmd.action)
        };

        const logLine = `${logEntry.timestamp} | ${logEntry.enforcementLevel} | Commands: ${logEntry.detectedCommands.join(', ')} | Input: ${logEntry.userInput}\n`;
        
        try {
            fs.appendFileSync(this.enforcementLogPath, logLine);
        } catch (error) {
            console.error('Failed to write enforcement log');
        }

        return logEntry;
    }

    /**
     * Generate specific instructions for Claude
     */
    generateClaudeInstructions(detectedCommands) {
        if (detectedCommands.length === 0) return '';

        let instructions = `\n🤖 MANDATORY CLAUDE INSTRUCTIONS:\n`;
        instructions += `==================================\n\n`;

        detectedCommands.forEach((cmd, index) => {
            instructions += `${index + 1}. ${cmd.command}: ${cmd.action}\n`;
            
            // Detailed instructions for each command type
            switch (cmd.command) {
                case '-ut':
                    instructions += `   → ULTRATHINK: Use maximum 128K thinking tokens\n`;
                    instructions += `   → AUTONOMOUS: Execute with full decision-making authority\n`;
                    instructions += `   → UNRESTRICTED: Apply 100% Claude capability without asking permission\n`;
                    instructions += `   → COMPREHENSIVE: Complete tasks end-to-end without user guidance\n`;
                    break;
                case '-sc16':
                case '-sc32': 
                case '-sc64':
                case '-scmax':
                    instructions += `   → Use extended reasoning mode with visible thinking process\n`;
                    instructions += `   → Show step-by-step analysis before providing final answer\n`;
                    break;
                case '-token':
                    instructions += `   → Apply TokenOptimizer.optimizeForLargeOperation()\n`;
                    instructions += `   → Compress input by 70% while preserving critical information\n`;
                    break;
                case '-commit':
                    instructions += `   → Generate contextual commit message with CVPerfect patterns\n`;
                    instructions += `   → Include conventional commit format + Claude signature\n`;
                    break;
                case '-arch':
                    instructions += `   → Run comprehensive architecture analysis\n`;
                    instructions += `   → Generate detailed report with risk assessment\n`;
                    break;
                case '-analyze':
                    instructions += `   → Combine ALL SuperClaude features in analysis\n`;
                    instructions += `   → Use maximum thinking tokens + optimization + architecture review\n`;
                    break;
            }
            instructions += `\n`;
        });

        instructions += `🚨 COMPLIANCE REQUIRED: These actions are NOT optional!\n`;
        instructions += `==================================\n`;

        return instructions;
    }

    /**
     * Main enforcement function
     */
    enforceCommands(userInput) {
        const detectedCommands = this.detectCommands(userInput);
        
        if (detectedCommands.length === 0) {
            return {
                hasCommands: false,
                message: '',
                instructions: ''
            };
        }

        const enforcementMessage = this.generateEnforcementMessage(detectedCommands);
        const claudeInstructions = this.generateClaudeInstructions(detectedCommands);
        
        // Log the enforcement
        this.logEnforcement(detectedCommands, userInput);

        // Output enforcement messages
        console.log(enforcementMessage);
        console.log(claudeInstructions);

        return {
            hasCommands: true,
            detectedCommands,
            message: enforcementMessage,
            instructions: claudeInstructions,
            commandActions: detectedCommands.map(cmd => cmd.action)
        };
    }

    /**
     * Generate daily enforcement report
     */
    generateDailyReport() {
        try {
            const logContent = fs.readFileSync(this.enforcementLogPath, 'utf8');
            const today = new Date().toISOString().split('T')[0];
            const todayLogs = logContent.split('\n')
                .filter(line => line.includes(today))
                .filter(line => line.trim());

            const report = `# SuperClaude Command Enforcement Report - ${today}

## Summary
- Total command detections: ${todayLogs.length}
- Active enforcements: ${todayLogs.filter(line => line.includes('ACTIVE')).length}

## Command Usage
${todayLogs.map(line => {
    const parts = line.split(' | ');
    return `- ${parts[0]}: ${parts[2]} (${parts[1]})`;
}).join('\n')}

## Most Used Commands
${this.getMostUsedCommands(todayLogs)}

---
*Generated by SuperClaude Command Enforcer*
`;

            const reportPath = path.join(__dirname, '../reports', `command-enforcement-${today}.md`);
            fs.mkdirSync(path.dirname(reportPath), { recursive: true });
            fs.writeFileSync(reportPath, report);
            
            return report;
        } catch (error) {
            return `Error generating report: ${error.message}`;
        }
    }

    getMostUsedCommands(logs) {
        const commandCounts = {};
        logs.forEach(line => {
            const commandMatch = line.match(/Commands: ([^|]+)/);
            if (commandMatch) {
                const commands = commandMatch[1].split(', ');
                commands.forEach(cmd => {
                    commandCounts[cmd] = (commandCounts[cmd] || 0) + 1;
                });
            }
        });

        return Object.entries(commandCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([cmd, count]) => `- ${cmd}: ${count} uses`)
            .join('\n');
    }
}

// CLI usage
if (require.main === module) {
    const enforcer = new SuperClaudeCommandEnforcer();
    const userInput = process.argv.slice(2).join(' ');
    
    if (!userInput) {
        console.log('Usage: node superclaud-command-enforcer.js <user input>');
        process.exit(1);
    }

    const result = enforcer.enforceCommands(userInput);
    
    if (result.hasCommands) {
        console.log(`\n✅ Enforcement active for ${result.detectedCommands.length} commands`);
        // Output machine-readable result for other scripts
        console.log('\n--- ENFORCEMENT RESULT ---');
        console.log(JSON.stringify({
            hasCommands: result.hasCommands,
            commands: result.detectedCommands.map(cmd => cmd.command),
            actions: result.commandActions
        }));
    } else {
        console.log('ℹ️  No SuperClaude commands detected');
    }
}

module.exports = { SuperClaudeCommandEnforcer };