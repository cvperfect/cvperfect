/**
 * Supreme Orchestrator Agent (Claude Opus Model)
 * Master controller for all 40 CVPerfect agents
 */

const fs = require('fs');
const path = require('path');

class SupremeOrchestrator {
    constructor() {
        this.model = "claude-opus-4-1";
        this.agents = new Map();
        this.activeWorkflows = new Map();
        this.status = "initializing";
        this.agentsLoaded = false;
    }
    
    async initialize() {
        console.log("🚀 Supreme Orchestrator initializing...");
        
        try {
            await this.loadAllAgents();
            await this.setupCommunicationChannels();
            await this.initializeWorkflows();
            
            this.status = "ready";
            console.log("✅ Supreme Orchestrator ready with", this.agents.size, "agents");
            
            return true;
        } catch (error) {
            console.error("❌ Supreme Orchestrator initialization failed:", error);
            this.status = "error";
            return false;
        }
    }
    
    async loadAllAgents() {
        const agentsDir = path.join(__dirname, '..');
        const categories = ['core', 'ai_optimization', 'quality', 'content', 
                          'code_analysis', 'auto_repair', 'security', 'performance', 'business'];
        
        for (const category of categories) {
            const categoryPath = path.join(agentsDir, category);
            if (fs.existsSync(categoryPath)) {
                const agentFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith('_agent.js'));
                
                for (const agentFile of agentFiles) {
                    try {
                        const AgentClass = require(path.join(categoryPath, agentFile));
                        const agent = new AgentClass();
                        this.agents.set(agent.name, agent);
                        console.log(`📦 Loaded agent: ${agent.name}`);
                    } catch (error) {
                        console.error(`❌ Failed to load agent ${agentFile}:`, error);
                    }
                }
            }
        }
        
        this.agentsLoaded = true;
    }
    
    async setupCommunicationChannels() {
        // Setup inter-agent communication
        this.messageQueue = [];
        this.eventEmitter = require('events');
        this.communicationHub = new this.eventEmitter();
        
        console.log("📡 Communication channels established");
    }
    
    async initializeWorkflows() {
        // Define standard workflows
        this.workflows = {
            'cv_optimization': [
                'codebase_scanner', 'cv_content_analysis', 'ats_optimization', 
                'industry_keywords', 'language_enhancement', 'cv_format_design'
            ],
            'security_audit': [
                'security_scanner', 'authentication_guard', 'api_security', 
                'data_protection', 'gdpr_compliance'
            ],
            'performance_optimization': [
                'performance_monitor', 'load_testing', 'cache_optimization', 
                'error_recovery'
            ],
            'code_quality': [
                'static_code_analysis', 'runtime_error_detection', 'code_quality', 
                'dependency_audit', 'auto_fix'
            ]
        };
        
        console.log("🔄 Workflows initialized");
    }
    
    async executeWorkflow(workflowName, input) {
        console.log(`🎯 Executing workflow: ${workflowName}`);
        
        if (!this.workflows[workflowName]) {
            throw new Error(`Unknown workflow: ${workflowName}`);
        }
        
        const workflowId = this.generateWorkflowId();
        const agentSequence = this.workflows[workflowName];
        const results = [];
        
        this.activeWorkflows.set(workflowId, {
            name: workflowName,
            status: 'running',
            startTime: new Date(),
            agents: agentSequence,
            currentStep: 0
        });
        
        try {
            for (let i = 0; i < agentSequence.length; i++) {
                const agentName = agentSequence[i];
                const agent = this.agents.get(agentName);
                
                if (!agent) {
                    console.warn(`⚠️  Agent ${agentName} not found, skipping...`);
                    continue;
                }
                
                console.log(`🤖 Executing agent: ${agentName} (${i + 1}/${agentSequence.length})`);
                
                const result = await agent.execute({
                    type: this.getTaskTypeForWorkflow(workflowName),
                    target: input,
                    workflowId: workflowId,
                    step: i + 1
                });
                
                results.push(result);
                
                // Update workflow progress
                this.activeWorkflows.get(workflowId).currentStep = i + 1;
                
                if (!result.success) {
                    console.error(`❌ Agent ${agentName} failed:`, result.error);
                    // Decide whether to continue or abort based on error severity
                }
            }
            
            this.activeWorkflows.get(workflowId).status = 'completed';
            console.log(`✅ Workflow ${workflowName} completed successfully`);
            
            return {
                success: true,
                workflowId: workflowId,
                results: results,
                summary: this.generateWorkflowSummary(results)
            };
            
        } catch (error) {
            this.activeWorkflows.get(workflowId).status = 'error';
            console.error(`❌ Workflow ${workflowName} failed:`, error);
            
            return {
                success: false,
                workflowId: workflowId,
                error: error.message,
                results: results
            };
        }
    }
    
    getTaskTypeForWorkflow(workflowName) {
        const taskTypes = {
            'cv_optimization': 'optimize',
            'security_audit': 'analyze',
            'performance_optimization': 'optimize',
            'code_quality': 'analyze'
        };
        
        return taskTypes[workflowName] || 'analyze';
    }
    
    generateWorkflowId() {
        return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateWorkflowSummary(results) {
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        return {
            totalAgents: results.length,
            successful: successful,
            failed: failed,
            successRate: (successful / results.length * 100).toFixed(1) + '%'
        };
    }
    
    async getSystemStatus() {
        const agentStatuses = Array.from(this.agents.values()).map(agent => agent.getStatus());
        const activeWorkflowCount = this.activeWorkflows.size;
        
        return {
            orchestrator: {
                status: this.status,
                model: this.model,
                agentsLoaded: this.agentsLoaded,
                totalAgents: this.agents.size
            },
            agents: agentStatuses,
            workflows: {
                active: activeWorkflowCount,
                available: Object.keys(this.workflows)
            },
            timestamp: new Date().toISOString()
        };
    }
    
    async executeAgent(agentName, task) {
        const agent = this.agents.get(agentName);
        if (!agent) {
            throw new Error(`Agent ${agentName} not found`);
        }
        
        console.log(`🤖 Executing single agent: ${agentName}`);
        return await agent.execute(task);
    }
    
    listAvailableAgents() {
        return Array.from(this.agents.keys()).sort();
    }
    
    listAvailableWorkflows() {
        return Object.keys(this.workflows);
    }
}

module.exports = SupremeOrchestrator;
