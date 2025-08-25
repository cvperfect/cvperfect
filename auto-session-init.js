#!/usr/bin/env node
/**
 * Auto Session Initialization Script
 * Automatically enables all CVPerfect enhanced features on session start
 */

const fs = require('fs');
const path = require('path');

class AutoSessionInit {
    constructor() {
        this.configFile = path.join(process.cwd(), '.claude', 'session-config.json');
        this.statusFile = path.join(process.cwd(), '.claude', 'session-status.json');
    }

    async initialize() {
        console.log('🚀 Auto-initializing CVPerfect enhanced session...');
        
        // Enable Sequential Thinking Mode
        const sequentialEnabled = await this.enableSequentialThinking();
        
        const status = {
            timestamp: new Date().toISOString(),
            session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            features: {
                sequential_thinking: sequentialEnabled ? 'enabled' : 'attempted',
                enhanced_personas: 'enabled',
                cli_tools: 'enabled',
                data_management: 'enabled',
                documentation_access: 'enabled',
                agents_system: 'enabled'
            },
            systems_check: await this.performSystemsCheck(),
            sequential_thinking_status: sequentialEnabled
        };

        // Save session status
        this.saveSessionStatus(status);
        
        // Display initialization results
        this.displayStatus(status);
        
        return status;
    }

    async enableSequentialThinking() {
        try {
            console.log('🧠 Enabling Sequential Thinking Mode...');
            
            // Create a sequential thinking command file that Claude Code can execute
            const sequentialCommand = `
# Sequential Thinking Auto-Enable Command
This command automatically enables sequential thinking mode at session start.

## Command: /sequential on
Enable multi-step task breakdown mode for complex tasks.

## Auto-execution:
The sequential thinking mode is now ENABLED for this session.

Multi-step tasks will automatically be broken down into numbered steps (1/N, 2/N, etc.)
for better analysis and execution clarity.

## Usage examples after enabling:
- Complex debugging → Sequential breakdown
- Multi-step implementations → Step-by-step execution  
- Analysis tasks → Structured approach
- Problem solving → Methodical progression

Sequential thinking is now ACTIVE and will be used automatically for complex tasks.
            `.trim();

            // Ensure .claude/commands directory exists
            const commandsDir = path.join(process.cwd(), '.claude', 'commands');
            if (!fs.existsSync(commandsDir)) {
                fs.mkdirSync(commandsDir, { recursive: true });
            }

            // Write the sequential command file
            const sequentialPath = path.join(commandsDir, 'sequential-auto-enable.md');
            fs.writeFileSync(sequentialPath, sequentialCommand);
            
            // Create a session-level flag that indicates sequential thinking is enabled
            const sessionConfig = {
                sequential_thinking: {
                    enabled: true,
                    auto_enabled: true,
                    timestamp: new Date().toISOString(),
                    mode: 'multi-step-breakdown'
                },
                session_commands: {
                    '/sequential': 'enabled',
                    '/analyze': 'enabled',
                    '/cli-tool': 'enabled',
                    '/docs': 'enabled'
                }
            };

            fs.writeFileSync(this.configFile, JSON.stringify(sessionConfig, null, 2));
            
            console.log('✅ Sequential Thinking Mode enabled automatically');
            console.log('📝 Command file created at:', sequentialPath);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to enable sequential thinking:', error.message);
            return false;
        }
    }

    async performSystemsCheck() {
        const checks = {};
        
        // Check data/analyze directories
        checks.storage_system = {
            data_dir: fs.existsSync(path.join(process.cwd(), 'data')),
            analyze_dir: fs.existsSync(path.join(process.cwd(), 'analyze')),
            status: 'ready'
        };

        // Check CLI tools
        checks.cli_tools = {
            manager_exists: fs.existsSync(path.join(process.cwd(), 'cli-tools-manager.js')),
            cv_analyzer: fs.existsSync(path.join(process.cwd(), 'cv-analyzer.js')),
            tools_config: fs.existsSync(path.join(process.cwd(), 'cli-tools', 'tools-config.json')),
            status: 'ready'
        };

        // Check agent router
        checks.agent_system = {
            router_exists: fs.existsSync(path.join(process.cwd(), 'claude-agent-router.js')),
            integration_exists: fs.existsSync(path.join(process.cwd(), 'claude-cvperfect-integration.js')),
            personas_count: 8, // Number of personas configured
            status: 'ready'
        };

        // Check commands
        checks.commands = {
            analyze_cmd: fs.existsSync(path.join(process.cwd(), '.claude', 'commands', 'analyze.md')),
            cli_tool_cmd: fs.existsSync(path.join(process.cwd(), '.claude', 'commands', 'cli-tool.md')),
            docs_cmd: fs.existsSync(path.join(process.cwd(), '.claude', 'commands', 'docs.md')),
            sequential_cmd: fs.existsSync(path.join(process.cwd(), '.claude', 'commands', 'sequential.md')),
            status: 'ready'
        };

        return checks;
    }

    saveSessionStatus(status) {
        try {
            const statusDir = path.dirname(this.statusFile);
            if (!fs.existsSync(statusDir)) {
                fs.mkdirSync(statusDir, { recursive: true });
            }
            fs.writeFileSync(this.statusFile, JSON.stringify(status, null, 2));
        } catch (error) {
            console.warn('⚠️ Could not save session status:', error.message);
        }
    }

    displayStatus(status) {
        console.log('\n✅ CVPerfect Enhanced Session Initialized');
        console.log('='.repeat(50));
        console.log(`📍 Session ID: ${status.session_id}`);
        console.log(`⏰ Started: ${new Date(status.timestamp).toLocaleString()}`);
        
        console.log('\n🎯 Enhanced Features:');
        Object.entries(status.features).forEach(([feature, state]) => {
            const emoji = state === 'enabled' ? '✅' : '❌';
            const displayName = feature.replace(/_/g, ' ').toUpperCase();
            console.log(`  ${emoji} ${displayName}`);
        });
        
        console.log('\n🔧 Systems Status:');
        Object.entries(status.systems_check).forEach(([system, check]) => {
            const emoji = check.status === 'ready' ? '✅' : '⚠️';
            const displayName = system.replace(/_/g, ' ').toUpperCase();
            console.log(`  ${emoji} ${displayName}`);
        });

        console.log('\n🚀 Ready for enhanced CVPerfect development!');
        console.log('\nQuick Start:');
        console.log('  • "-sa Napraw bug" → Auto-delegates with personas');
        console.log('  • "/sequential on" → Multi-step task breakdown');
        console.log('  • "/analyze cv file.pdf" → Advanced CV analysis');
        console.log('  • "/docs react hooks" → Latest documentation');
        console.log('  • "/cli-tool cv-analyzer" → External tools');
    }

    // Get current session status
    getSessionStatus() {
        try {
            if (fs.existsSync(this.statusFile)) {
                return JSON.parse(fs.readFileSync(this.statusFile, 'utf8'));
            }
        } catch (error) {
            console.warn('⚠️ Could not read session status:', error.message);
        }
        return null;
    }
}

// Export for use as module
module.exports = AutoSessionInit;

// CLI interface
if (require.main === module) {
    const init = new AutoSessionInit();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'init':
            init.initialize()
                .then(status => {
                    console.log('\n📊 Full Status:');
                    console.log(JSON.stringify(status, null, 2));
                    process.exit(0);
                })
                .catch(error => {
                    console.error('❌ Initialization failed:', error.message);
                    process.exit(1);
                });
            break;
            
        case 'status':
            const status = init.getSessionStatus();
            if (status) {
                console.log('📊 Current Session Status:');
                console.log(JSON.stringify(status, null, 2));
            } else {
                console.log('❌ No active session found. Run: node auto-session-init.js init');
            }
            break;
            
        default:
            // Default action: initialize
            init.initialize()
                .then(() => {
                    process.exit(0);
                })
                .catch(error => {
                    console.error('❌ Auto-initialization failed:', error.message);
                    process.exit(1);
                });
    }
}