/**
 * Claude Agent Router - Bridge between Claude Code Task tool and CVPerfect 40-agent system
 * Handles `-sa` shortcut delegation and task routing
 */

const { executeWithAgents, getSystemStatus } = require('./claude-task-delegator');

class ClaudeAgentRouter {
    constructor() {
        this.isInitialized = false;
        this.agentMappings = this.setupAgentMappings();
        this.taskPatterns = this.setupTaskPatterns();
        this.fallbackAvailable = true;
    }

    // Mapowanie typów agentów Claude na agentów CVPerfect
    setupAgentMappings() {
        return {
            // Claude's built-in subagent types → CVPerfect agents
            'general-purpose': 'supreme_orchestrator',
            'statusline-setup': 'frontend_development',
            'output-style-setup': 'frontend_development',
            
            // CVPerfect-specific mappings
            'frontend': 'frontend_development',
            'backend': 'backend_api',
            'api': 'backend_api',
            'cv-optimization': 'ats_optimization',
            'cv-analysis': 'cv_content_analysis',
            'security': 'api_security',
            'testing': 'testing_qa',
            'debug': 'auto_fix',
            'performance': 'performance_monitor',
            'cache': 'cache_optimization',
            'analytics': 'data_analytics_insights',
            'marketing': 'marketing_automation',
            'gdpr': 'gdpr_compliance'
        };
    }

    // Wzorce do automatycznego wykrywania typu zadania z PERSONAS
    setupTaskPatterns() {
        return {
            frontend: {
                keywords: ['react', 'component', 'jsx', 'css', 'responsive', 'ui', 'ux', 'styling', 'glassmorphism', 'modal'],
                agent: 'frontend_development',
                confidence: 0.9,
                persona: {
                    mindset: 'frontend_developer',
                    focus: ['user_experience', 'responsive_design', 'component_architecture', 'css_optimization'],
                    approach: 'visual_first'
                }
            },
            backend: {
                keywords: ['api', 'endpoint', 'server', 'database', 'supabase', 'stripe', 'webhook', 'auth'],
                agent: 'backend_api',
                confidence: 0.9,
                persona: {
                    mindset: 'backend_engineer',
                    focus: ['data_integrity', 'api_design', 'performance', 'scalability'],
                    approach: 'data_driven'
                }
            },
            cv_optimization: {
                keywords: ['cv', 'resume', 'optimize', 'ats', 'template', 'groq', 'ai analysis', 'cv content'],
                agent: 'ats_optimization',
                confidence: 0.95,
                persona: {
                    mindset: 'cv_specialist',
                    focus: ['ats_compatibility', 'content_quality', 'format_optimization', 'keyword_density'],
                    approach: 'ai_powered'
                }
            },
            security: {
                keywords: ['security', 'auth', 'cors', 'validation', 'xss', 'csrf', 'gdpr', 'protection'],
                agent: 'api_security',
                confidence: 0.9,
                persona: {
                    mindset: 'security_analyst',
                    focus: ['threat_assessment', 'data_protection', 'compliance', 'vulnerability_scanning'],
                    approach: 'security_first'
                }
            },
            testing: {
                keywords: ['test', 'debug', 'bug', 'fix', 'error', 'regression', 'qa'],
                agent: 'testing_qa',
                confidence: 0.85,
                persona: {
                    mindset: 'qa_engineer',
                    focus: ['test_coverage', 'edge_cases', 'regression_prevention', 'automated_testing'],
                    approach: 'systematic_testing'
                }
            },
            performance: {
                keywords: ['performance', 'optimization', 'speed', 'cache', 'memory', 'bundle'],
                agent: 'performance_monitor',
                confidence: 0.8,
                persona: {
                    mindset: 'performance_engineer',
                    focus: ['load_times', 'memory_usage', 'caching_strategy', 'bundle_optimization'],
                    approach: 'metrics_driven'
                }
            },
            payment: {
                keywords: ['payment', 'stripe', 'checkout', 'pricing', 'subscription', 'billing'],
                agent: 'payment_integration',
                confidence: 0.9,
                persona: {
                    mindset: 'fintech_developer',
                    focus: ['payment_security', 'transaction_integrity', 'compliance', 'user_flow'],
                    approach: 'security_and_ux'
                }
            },
            architecture: {
                keywords: ['architecture', 'design', 'structure', 'refactor', 'modular', 'scalable'],
                agent: 'supreme_orchestrator',
                confidence: 0.85,
                persona: {
                    mindset: 'solution_architect',
                    focus: ['system_design', 'scalability', 'maintainability', 'best_practices'],
                    approach: 'holistic_design'
                }
            }
        };
    }

    // Główna funkcja routingu dla `-sa` shortcut
    async routeTask(taskDescription, options = {}) {
        console.log(`\n🚀 Claude Agent Router: Processing task for -sa shortcut`);
        console.log(`📝 Task: "${taskDescription}"`);

        try {
            // 1. Sprawdź czy system agentów CVPerfect jest dostępny
            const cvperfectStatus = this.checkCVPerfectAgents();
            
            if (!cvperfectStatus.available) {
                console.log(`⚠️ CVPerfect agents unavailable: ${cvperfectStatus.reason}`);
                return this.fallbackToClaudeTask(taskDescription, options);
            }

            // 2. Określ typ agenta na podstawie opisu zadania
            const routingDecision = this.determineAgentType(taskDescription, options);
            
            console.log(`🎯 Routing decision: ${routingDecision.agent} (confidence: ${routingDecision.confidence})`);
            if (routingDecision.persona) {
                console.log(`🎭 Persona: ${routingDecision.persona.mindset} (${routingDecision.persona.approach})`);
                console.log(`🎯 Focus areas: ${routingDecision.persona.focus.join(', ')}`);
            }

            // 3. Deleguj do odpowiedniego agenta CVPerfect
            const result = await this.delegateToCVPerfectAgent(routingDecision.agent, taskDescription, options);
            
            if (result.success) {
                console.log(`✅ Task delegated successfully to ${routingDecision.agent}`);
                return result;
            } else {
                console.log(`❌ CVPerfect delegation failed: ${result.message}`);
                return this.fallbackToClaudeTask(taskDescription, options);
            }

        } catch (error) {
            console.error(`❌ Error in agent routing:`, error);
            return this.fallbackToClaudeTask(taskDescription, options);
        }
    }

    // Sprawdź dostępność systemu agentów CVPerfect
    checkCVPerfectAgents() {
        try {
            const status = getSystemStatus();
            
            if (status && status.active) {
                return {
                    available: true,
                    activeAgents: status.activeAgents || 0,
                    orchestratorStatus: status.orchestrator?.status || 'unknown'
                };
            } else {
                return {
                    available: false,
                    reason: 'System agentów CVPerfect nie jest aktywny'
                };
            }
        } catch (error) {
            return {
                available: false,
                reason: `Błąd sprawdzania statusu: ${error.message}`
            };
        }
    }

    // Określ typ agenta na podstawie opisu zadania
    determineAgentType(taskDescription, options = {}) {
        const description = taskDescription.toLowerCase();
        
        // 1. Sprawdź czy użytkownik podał konkretny typ agenta
        if (options.agentType && this.agentMappings[options.agentType]) {
            return {
                agent: this.agentMappings[options.agentType],
                confidence: 1.0,
                source: 'explicit'
            };
        }

        // 2. Użyj pattern matching do automatycznego wykrycia
        let bestMatch = {
            agent: 'supreme_orchestrator',
            confidence: 0.0,
            source: 'default'
        };

        for (const [patternName, pattern] of Object.entries(this.taskPatterns)) {
            let matchScore = 0;
            
            for (const keyword of pattern.keywords) {
                if (description.includes(keyword)) {
                    matchScore += 1 / pattern.keywords.length;
                }
            }

            const confidence = matchScore * pattern.confidence;
            
            if (confidence > bestMatch.confidence) {
                bestMatch = {
                    agent: pattern.agent,
                    confidence: confidence,
                    source: 'pattern-match',
                    pattern: patternName,
                    persona: pattern.persona
                };
            }
        }

        return bestMatch;
    }

    // Deleguj zadanie do agenta CVPerfect
    async delegateToCVPerfectAgent(agentType, taskDescription, options = {}) {
        try {
            console.log(`🔄 Delegating to CVPerfect agent: ${agentType}`);
            
            // executeWithAgents oczekuje prostego stringa jako taskDescription
            const taskOptions = {
                agentType: agentType,
                priority: options.priority || 'normal',
                timeout: options.timeout || 30000,
                context: {
                    fromClaude: true,
                    shortcut: '-sa',
                    timestamp: Date.now()
                }
            };

            // Użyj systemu delegacji CVPerfect - przekaż string jako taskDescription
            const result = await executeWithAgents(taskDescription, taskOptions);
            
            return {
                success: true,
                agent: agentType,
                result: result,
                source: 'cvperfect-agents'
            };

        } catch (error) {
            return {
                success: false,
                message: error.message,
                agent: agentType
            };
        }
    }

    // Fallback do wbudowanego Task tool Claude
    fallbackToClaudeTask(taskDescription, options = {}) {
        console.log(`🔄 Falling back to Claude's built-in Task tool`);
        
        // Określ odpowiedni subagent_type dla Claude Task tool
        let subagentType = 'general-purpose';
        
        const description = taskDescription.toLowerCase();
        if (description.includes('status') || description.includes('setup')) {
            subagentType = 'statusline-setup';
        } else if (description.includes('output') || description.includes('style')) {
            subagentType = 'output-style-setup';
        }

        return {
            success: true,
            useFallback: true,
            taskTool: {
                description: taskDescription,
                prompt: taskDescription,
                subagent_type: subagentType
            },
            message: 'Zadanie zostanie przekazane do wbudowanego systemu agentów Claude',
            source: 'claude-task-tool'
        };
    }

    // Status routera
    getStatus() {
        const cvperfectStatus = this.checkCVPerfectAgents();
        
        return {
            router: 'active',
            cvperfectAgents: cvperfectStatus.available,
            agentMappings: Object.keys(this.agentMappings).length,
            taskPatterns: Object.keys(this.taskPatterns).length,
            fallbackAvailable: this.fallbackAvailable,
            timestamp: new Date().toISOString()
        };
    }
}

// Export instancji singletona
const agentRouter = new ClaudeAgentRouter();

module.exports = {
    ClaudeAgentRouter,
    routeTask: (taskDescription, options) => agentRouter.routeTask(taskDescription, options),
    getRouterStatus: () => agentRouter.getStatus()
};