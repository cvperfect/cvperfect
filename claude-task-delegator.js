/**
 * Claude Task Delegator - integracja Claude Code z systemem agentów CVPerfect
 * Automatyczne przechwytywanie i delegowanie zadań
 */

const CVPerfectAgentsBridge = require('./claude-agents-bridge');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class ClaudeTaskDelegator {
    constructor() {
        this.bridge = new CVPerfectAgentsBridge();
        this.activeTasks = new Map();
        this.taskHistory = [];
        this.communicationSocket = null;
        
        if (this.bridge.isActivated()) {
            console.log('🚀 Claude Task Delegator activated for CVPerfect');
            this.setupCommunication();
        }
    }

    // Ustaw komunikację z systemem agentów
    setupCommunication() {
        // Sprawdź czy system agentów działa
        this.checkAgentsSystem();
        
        // Monitoruj plik komunikacyjny
        this.startFileWatcher();
    }

    // Sprawdź czy system agentów jest uruchomiony
    checkAgentsSystem() {
        exec('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', (error, stdout, stderr) => {
            if (error) {
                console.log('⚠️ Nie można sprawdzić statusu agentów');
                return;
            }
            
            const nodeProcesses = stdout.split('\n').filter(line => 
                line.includes('node.exe') && line.includes('start-agents-system')
            );
            
            if (nodeProcesses.length > 0) {
                console.log('✅ System agentów CVPerfect jest uruchomiony');
            } else {
                console.log('🔄 Uruchamiam system agentów...');
                this.startAgentsSystem();
            }
        });
    }

    // Uruchom system agentów jeśli nie działa
    startAgentsSystem() {
        const agentsProcess = spawn('node', ['start-agents-system.js'], {
            cwd: process.cwd(),
            detached: true,
            stdio: 'ignore'
        });
        
        agentsProcess.unref();
        console.log('🚀 System agentów uruchomiony w tle');
    }

    // Monitoruj plik komunikacyjny
    startFileWatcher() {
        const commFile = path.join(process.cwd(), '.agents-communication.json');
        
        if (fs.existsSync(commFile)) {
            fs.watchFile(commFile, (curr, prev) => {
                this.processAgentResponses();
            });
        }
    }

    // Przetwórz odpowiedzi od agentów
    processAgentResponses() {
        try {
            const commFile = path.join(process.cwd(), '.agents-communication.json');
            const commData = JSON.parse(fs.readFileSync(commFile, 'utf8'));
            
            // Sprawdź zakończone zadania
            commData.completed_tasks.forEach(task => {
                if (this.activeTasks.has(task.id)) {
                    console.log(`✅ Zadanie ${task.id} ukończone przez agenta ${task.assigned_agent}`);
                    this.activeTasks.delete(task.id);
                    this.taskHistory.push(task);
                }
            });
            
        } catch (error) {
            console.error('❌ Błąd przetwarzania odpowiedzi agentów:', error);
        }
    }

    // Główna funkcja delegowania zadania
    async delegateToAgents(taskDescription, options = {}) {
        if (!this.bridge.isActivated()) {
            return {
                success: false,
                message: 'CVPerfect Agents Bridge nie jest aktywny',
                fallback: true
            };
        }

        console.log(`\n🎯 Delegowanie zadania do agentów CVPerfect:`);
        console.log(`📝 Zadanie: ${taskDescription}`);

        try {
            const result = await this.bridge.delegateTask(taskDescription, options.type || 'claude_task');
            
            if (result.success) {
                this.activeTasks.set(result.taskId, {
                    description: taskDescription,
                    agent: result.assignedAgent,
                    startTime: new Date(),
                    options: options
                });

                console.log(`✅ Zadanie przekazane do agenta: ${result.assignedAgent}`);
                console.log(`🔗 ID zadania: ${result.taskId}`);
                console.log(`📊 Trafność: ${result.confidence}%`);

                // Poczekaj na zakończenie (z timeoutem)
                const taskResult = await this.waitForTaskCompletion(result.taskId, options.timeout || 30000);
                
                return {
                    success: true,
                    taskId: result.taskId,
                    agent: result.assignedAgent,
                    result: taskResult,
                    confidence: result.confidence
                };
            } else {
                console.log(`❌ Nie udało się delegować zadania: ${result.message}`);
                return {
                    success: false,
                    message: result.message,
                    fallback: true
                };
            }

        } catch (error) {
            console.error('❌ Błąd delegowania zadania:', error);
            return {
                success: false,
                message: error.message,
                fallback: true
            };
        }
    }

    // Czekaj na zakończenie zadania
    async waitForTaskCompletion(taskId, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkStatus = () => {
                const task = this.bridge.checkTaskStatus(taskId);
                
                if (task && task.status === 'completed') {
                    resolve(task.result || 'Zadanie ukończone przez agenta');
                    return;
                }
                
                if (Date.now() - startTime > timeout) {
                    resolve('Timeout - zadanie w trakcie realizacji przez agenta');
                    return;
                }
                
                setTimeout(checkStatus, 1000);
            };
            
            checkStatus();
        });
    }

    // Sprawdź czy należy użyć agentów dla danego zadania
    shouldUseAgents(taskDescription) {
        if (!this.bridge.isActivated()) return false;
        
        const task = taskDescription.toLowerCase();
        
        // Zadania, które zawsze powinny być wykonane przez agentów
        const agentTasks = [
            'optymizuj', 'optimize', 'napraw', 'fix', 'bug', 'błąd',
            'dodaj funkcję', 'add feature', 'refactor', 'refaktoryzuj',
            'testuj', 'test', 'sprawdź', 'check', 'analyze', 'analizuj',
            'security', 'bezpieczeństwo', 'performance', 'wydajność',
            'database', 'baza danych', 'api', 'endpoint', 'stripe',
            'payment', 'płatność', 'cv', 'template', 'szablon'
        ];
        
        return agentTasks.some(keyword => task.includes(keyword));
    }

    // Pobierz status aktywnych zadań
    getActiveTasksStatus() {
        const status = [];
        
        this.activeTasks.forEach((task, taskId) => {
            const duration = new Date() - task.startTime;
            status.push({
                id: taskId,
                description: task.description,
                agent: task.agent,
                duration: Math.round(duration / 1000) + 's'
            });
        });
        
        return status;
    }

    // Pobierz historię zadań
    getTaskHistory(limit = 10) {
        return this.taskHistory.slice(-limit);
    }

    // Sprawdź czy delegator jest aktywny
    isActive() {
        return this.bridge.isActivated();
    }
}

// Singleton instance
let delegatorInstance = null;

function getDelegator() {
    if (!delegatorInstance) {
        delegatorInstance = new ClaudeTaskDelegator();
    }
    return delegatorInstance;
}

// Export funkcji pomocniczych
module.exports = {
    ClaudeTaskDelegator,
    getDelegator,
    
    // Główna funkcja do użycia przez Claude
    async executeWithAgents(taskDescription, options = {}) {
        const delegator = getDelegator();
        
        if (delegator.shouldUseAgents(taskDescription)) {
            console.log('🤖 Używam agentów CVPerfect do wykonania zadania...');
            return await delegator.delegateToAgents(taskDescription, options);
        } else {
            return {
                success: false,
                message: 'Zadanie nie wymaga użycia agentów',
                fallback: true
            };
        }
    },
    
    // Status systemu
    getSystemStatus() {
        const delegator = getDelegator();
        return {
            active: delegator.isActive(),
            activeTasks: delegator.getActiveTasksStatus(),
            taskHistory: delegator.getTaskHistory()
        };
    }
};

// Auto-test przy uruchomieniu
if (require.main === module) {
    const delegator = new ClaudeTaskDelegator();
    console.log('🔧 Claude Task Delegator ready');
    console.log(`📊 System active: ${delegator.isActive()}`);
}