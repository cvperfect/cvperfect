/**
 * Claude <-> CVPerfect Integration Module
 * Główny punkt integracji Claude Code z systemem agentów CVPerfect
 */

const { executeWithAgents, getSystemStatus } = require('./claude-task-delegator');
const path = require('path');
const fs = require('fs');

class ClaudeCVPerfectIntegration {
    constructor() {
        this.isInCVPerfectProject = this.detectCVPerfectProject();
        this.integrationActive = false;
        
        if (this.isInCVPerfectProject) {
            this.initializeIntegration();
        }
    }

    // Wykryj czy jesteśmy w projekcie CVPerfect
    detectCVPerfectProject() {
        const currentDir = process.cwd();
        const indicators = [
            'cvperfect',
            'CLAUDE.md',
            'start-agents-system.js',
            'package.json'
        ];

        // Sprawdź nazwę katalogu
        if (currentDir.toLowerCase().includes('cvperfect')) {
            return true;
        }

        // Sprawdź pliki charakterystyczne
        const hasIndicators = indicators.some(indicator => {
            const filePath = path.join(currentDir, indicator);
            return fs.existsSync(filePath);
        });

        // Sprawdź package.json
        const packageJsonPath = path.join(currentDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                if (packageJson.name && packageJson.name.toLowerCase().includes('cvperfect')) {
                    return true;
                }
            } catch (error) {
                // Ignore JSON parse errors
            }
        }

        return hasIndicators;
    }

    // Inicjalizuj integrację
    initializeIntegration() {
        console.log('🔗 Inicjalizuję integrację Claude <-> CVPerfect...');
        
        try {
            // Sprawdź status systemu agentów
            const status = getSystemStatus();
            
            if (status.active) {
                this.integrationActive = true;
                console.log('✅ Integracja Claude <-> CVPerfect aktywna');
                console.log(`📊 Aktywne zadania: ${status.activeTasks.length}`);
                console.log(`📚 Historia zadań: ${status.taskHistory.length}`);
            } else {
                console.log('⚠️ System agentów CVPerfect nie jest aktywny');
                this.integrationActive = false;
            }
            
        } catch (error) {
            console.error('❌ Błąd inicjalizacji integracji:', error);
            this.integrationActive = false;
        }
    }

    // Główna funkcja wykonania zadania przez agentów
    async executeTask(taskDescription, options = {}) {
        if (!this.isInCVPerfectProject) {
            return {
                success: false,
                message: 'Nie jesteśmy w projekcie CVPerfect',
                useClaudeDirectly: true
            };
        }

        if (!this.integrationActive) {
            return {
                success: false,
                message: 'Integracja z agentami nie jest aktywna',
                useClaudeDirectly: true
            };
        }

        console.log(`\n🚀 Wykonuję zadanie przez agentów CVPerfect:`);
        console.log(`📝 "${taskDescription}"`);

        try {
            const result = await executeWithAgents(taskDescription, options);
            
            if (result.success) {
                console.log(`✅ Zadanie wykonane przez agenta: ${result.agent}`);
                return result;
            } else if (result.fallback) {
                console.log(`🔄 Przekazuję do Claude Code (fallback)`);
                return {
                    success: false,
                    message: result.message,
                    useClaudeDirectly: true
                };
            } else {
                return result;
            }
            
        } catch (error) {
            console.error('❌ Błąd wykonania zadania przez agentów:', error);
            return {
                success: false,
                message: error.message,
                useClaudeDirectly: true
            };
        }
    }

    // Sprawdź czy zadanie powinno być wykonane przez agentów
    shouldUseAgents(taskDescription) {
        if (!this.isInCVPerfectProject || !this.integrationActive) {
            return false;
        }

        const task = taskDescription.toLowerCase();
        
        // Zadania typowe dla CVPerfect
        const cvperfectTasks = [
            // Frontend
            'react', 'component', 'jsx', 'css', 'styling', 'responsive', 'ui', 'ux',
            
            // Backend/API
            'api', 'endpoint', 'server', 'database', 'stripe', 'payment', 'groq',
            
            // CVPerfect specific
            'cv', 'resume', 'template', 'ats', 'optimization', 'szablon', 'optymalizacja',
            
            // Maintenance
            'bug', 'błąd', 'fix', 'napraw', 'optimize', 'optymizuj', 'test', 'testuj',
            'refactor', 'refaktoryzuj', 'analyze', 'analizuj', 'check', 'sprawdź',
            
            // Security & Performance
            'security', 'bezpieczeństwo', 'performance', 'wydajność', 'gdpr',
            
            // Business
            'analytics', 'marketing', 'seo', 'language', 'język', 'polish', 'polski'
        ];

        return cvperfectTasks.some(keyword => task.includes(keyword));
    }

    // Pobierz status integracji
    getIntegrationStatus() {
        return {
            inCVPerfectProject: this.isInCVPerfectProject,
            integrationActive: this.integrationActive,
            systemStatus: this.integrationActive ? getSystemStatus() : null
        };
    }

    // Sprawdź czy integracja jest aktywna
    isActive() {
        return this.isInCVPerfectProject && this.integrationActive;
    }
}

// Singleton instance
let integrationInstance = null;

function getIntegration() {
    if (!integrationInstance) {
        integrationInstance = new ClaudeCVPerfectIntegration();
    }
    return integrationInstance;
}

// Export głównych funkcji
module.exports = {
    ClaudeCVPerfectIntegration,
    getIntegration,
    
    // Główna funkcja dla Claude Code
    async processTask(taskDescription, options = {}) {
        const integration = getIntegration();
        
        if (integration.shouldUseAgents(taskDescription)) {
            const result = await integration.executeTask(taskDescription, options);
            
            if (result.useClaudeDirectly) {
                return {
                    useAgents: false,
                    message: 'Używaj standardowych narzędzi Claude Code',
                    reason: result.message
                };
            } else {
                return {
                    useAgents: true,
                    success: result.success,
                    result: result.result || result.message,
                    agent: result.agent,
                    taskId: result.taskId
                };
            }
        } else {
            return {
                useAgents: false,
                message: 'Zadanie nie wymaga użycia agentów CVPerfect'
            };
        }
    },
    
    // Status integracji
    getStatus() {
        const integration = getIntegration();
        return integration.getIntegrationStatus();
    },
    
    // Sprawdź czy jesteśmy w CVPerfect
    isInCVPerfect() {
        const integration = getIntegration();
        return integration.isInCVPerfectProject;
    }
};

// Auto-test przy uruchomieniu
if (require.main === module) {
    const integration = new ClaudeCVPerfectIntegration();
    console.log('🔗 Claude <-> CVPerfect Integration ready');
    console.log(`📂 In CVPerfect project: ${integration.isInCVPerfectProject}`);
    console.log(`⚡ Integration active: ${integration.integrationActive}`);
    
    if (integration.isActive()) {
        console.log('🎯 Gotowy do delegowania zadań do agentów CVPerfect');
    }
}