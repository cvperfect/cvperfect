#!/usr/bin/env node
/**
 * CVPerfect Agents System Startup
 * Uruchamia wszystkich 40 agentów pod kontrolą Supreme Orchestrator
 */

const SupremeOrchestrator = require('./agents/orchestration/supreme_orchestrator');

class CVPerfectAgentsSystem {
    constructor() {
        this.orchestrator = new SupremeOrchestrator();
        this.isRunning = false;
    }
    
    async start() {
        console.log('🚀 Starting CVPerfect Agents System...');
        console.log('='.repeat(50));
        
        try {
            // Initialize Supreme Orchestrator
            const initialized = await this.orchestrator.initialize();
            
            if (!initialized) {
                throw new Error('Failed to initialize Supreme Orchestrator');
            }
            
            this.isRunning = true;
            
            // Display system status
            await this.showSystemStatus();
            
            // Setup CLI interface
            this.setupCLI();
            
            console.log('\n✅ CVPerfect Agents System is now running!');
            console.log('Type "help" for available commands or "status" for system status');
            
        } catch (error) {
            console.error('❌ Failed to start system:', error);
            process.exit(1);
        }
    }
    
    async showSystemStatus() {
        const status = await this.orchestrator.getSystemStatus();
        
        console.log('\n📊 System Status:');
        console.log('-'.repeat(30));
        console.log(`Orchestrator: ${status.orchestrator.status}`);
        console.log(`Model: ${status.orchestrator.model}`);
        console.log(`Total Agents: ${status.orchestrator.totalAgents}`);
        console.log(`Available Workflows: ${status.workflows.available.length}`);
        console.log(`Active Workflows: ${status.workflows.active}`);
    }
    
    setupCLI() {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'CVPerfect> '
        });
        
        rl.prompt();
        
        rl.on('line', async (input) => {
            const command = input.trim().toLowerCase();
            
            try {
                await this.handleCommand(command, rl);
            } catch (error) {
                console.error('❌ Command error:', error.message);
            }
            
            rl.prompt();
        });
    }
    
    async handleCommand(command, rl) {
        const [cmd, ...args] = command.split(' ');
        
        switch (cmd) {
            case 'help':
                this.showHelp();
                break;
                
            case 'status':
                await this.showSystemStatus();
                break;
                
            case 'agents':
                this.listAgents();
                break;
                
            case 'workflows':
                this.listWorkflows();
                break;
                
            case 'run':
                if (args.length < 1) {
                    console.log('Usage: run <workflow_name> [input]');
                    break;
                }
                await this.runWorkflow(args[0], args.slice(1).join(' '));
                break;
                
            case 'agent':
                if (args.length < 2) {
                    console.log('Usage: agent <agent_name> <task>');
                    break;
                }
                await this.runSingleAgent(args[0], args.slice(1).join(' '));
                break;
                
            case 'quit':
            case 'exit':
                console.log('👋 Shutting down CVPerfect Agents System...');
                process.exit(0);
                break;
                
            default:
                console.log(`Unknown command: ${cmd}. Type "help" for available commands.`);
        }
    }
    
    showHelp() {
        console.log('\n🤖 CVPerfect Agents System Commands:');
        console.log('-'.repeat(40));
        console.log('help                    - Show this help');
        console.log('status                  - Show system status');
        console.log('agents                  - List all available agents');
        console.log('workflows               - List all available workflows');
        console.log('run <workflow> [input]  - Execute a workflow');
        console.log('agent <name> <task>     - Execute single agent');
        console.log('quit/exit               - Shutdown system');
        console.log('\nExample workflows:');
        console.log('- cv_optimization       - Optimize CV content');
        console.log('- security_audit        - Security vulnerability scan');
        console.log('- performance_optimization - Performance analysis');
        console.log('- code_quality          - Code quality analysis');
    }
    
    listAgents() {
        const agents = this.orchestrator.listAvailableAgents();
        console.log(`\n🤖 Available Agents (${agents.length}):`);
        console.log('-'.repeat(30));
        agents.forEach((agent, index) => {
            console.log(`${(index + 1).toString().padStart(2)}. ${agent}`);
        });
    }
    
    listWorkflows() {
        const workflows = this.orchestrator.listAvailableWorkflows();
        console.log(`\n🔄 Available Workflows (${workflows.length}):`);
        console.log('-'.repeat(30));
        workflows.forEach((workflow, index) => {
            console.log(`${(index + 1).toString().padStart(2)}. ${workflow}`);
        });
    }
    
    async runWorkflow(workflowName, input = '') {
        console.log(`\n🎯 Starting workflow: ${workflowName}`);
        console.log('⏳ Please wait...');
        
        const result = await this.orchestrator.executeWorkflow(workflowName, input || 'default_input');
        
        if (result.success) {
            console.log(`\n✅ Workflow completed successfully!`);
            console.log(`📊 Summary: ${result.summary.successRate} success rate`);
            console.log(`🤖 Agents: ${result.summary.successful}/${result.summary.totalAgents} successful`);
        } else {
            console.log(`\n❌ Workflow failed: ${result.error}`);
        }
    }
    
    async runSingleAgent(agentName, task) {
        console.log(`\n🤖 Executing agent: ${agentName}`);
        console.log('⏳ Please wait...');
        
        const result = await this.orchestrator.executeAgent(agentName, {
            type: 'analyze',
            target: task
        });
        
        if (result.success) {
            console.log(`\n✅ Agent completed successfully!`);
            console.log(`📊 Result:`, result.result);
        } else {
            console.log(`\n❌ Agent failed: ${result.error}`);
        }
    }
}

// Start the system if run directly
if (require.main === module) {
    const system = new CVPerfectAgentsSystem();
    system.start().catch(console.error);
}

module.exports = CVPerfectAgentsSystem;
