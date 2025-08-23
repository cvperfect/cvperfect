/**
 * Claude Code <-> CVPerfect Agents Bridge
 * Automatyczne delegowanie zadań do odpowiednich agentów
 */

const fs = require('fs');
const path = require('path');

class CVPerfectAgentsBridge {
    constructor() {
        this.isActive = this.checkCVPerfectProject();
        this.agentMapping = this.setupAgentMapping();
        this.communicationFile = path.join(__dirname, '.agents-communication.json');
        
        if (this.isActive) {
            console.log('🤖 CVPerfect Agents Bridge activated');
            this.initializeCommunication();
        }
    }

    // Sprawdź czy jesteśmy w projekcie CVPerfect
    checkCVPerfectProject() {
        const currentDir = process.cwd();
        const packageJsonPath = path.join(currentDir, 'package.json');
        
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                return packageJson.name === 'cvperfect' || currentDir.includes('cvperfect');
            } catch (error) {
                return currentDir.includes('cvperfect');
            }
        }
        
        return currentDir.includes('cvperfect');
    }

    // Mapowanie typów zadań na agentów
    setupAgentMapping() {
        return {
            // Frontend Development
            'react': 'frontend_development',
            'component': 'frontend_development', 
            'jsx': 'frontend_development',
            'css': 'css_style_fix',
            'styling': 'css_style_fix',
            'responsive': 'frontend_development',
            'ui': 'user_experience',
            'ux': 'user_experience',
            
            // Backend & API
            'api': 'backend_api',
            'endpoint': 'backend_api',
            'server': 'backend_api',
            'database': 'database_repair',
            'stripe': 'backend_api',
            'payment': 'backend_api',
            
            // Security
            'security': 'api_security',
            'auth': 'authentication_guard',
            'gdpr': 'gdpr_compliance',
            'privacy': 'data_protection',
            
            // Performance & Optimization  
            'performance': 'performance_monitor',
            'optimize': 'cache_optimization',
            'speed': 'performance_monitor',
            'bundle': 'performance_monitor',
            
            // Testing & QA
            'test': 'testing_qa',
            'bug': 'runtime_error_detection',
            'error': 'auto_fix',
            'fix': 'auto_fix',
            'debug': 'runtime_error_detection',
            
            // Code Quality
            'refactor': 'code_refactoring',
            'clean': 'code_quality',
            'lint': 'static_code_analysis',
            'code': 'code_quality',
            
            // Infrastructure
            'deploy': 'devops_infrastructure',
            'build': 'devops_infrastructure',
            'docker': 'devops_infrastructure',
            
            // Content & Localization
            'language': 'multilingual_support',
            'translate': 'multilingual_support',
            'polish': 'polish_market_specialist',
            'seo': 'seo_content',
            
            // CV-specific
            'cv': 'cv_content_analysis',
            'resume': 'cv_content_analysis',
            'ats': 'ats_optimization',
            'template': 'cv_format_design',
            'job': 'job_matching',
            
            // Business
            'analytics': 'data_analytics_insights',
            'marketing': 'marketing_automation',
            'support': 'customer_support',
            'legal': 'legal_compliance'
        };
    }

    // Inicjalizuj komunikację z systemem agentów
    initializeCommunication() {
        const commData = {
            bridge_active: true,
            last_update: new Date().toISOString(),
            pending_tasks: [],
            completed_tasks: []
        };
        
        fs.writeFileSync(this.communicationFile, JSON.stringify(commData, null, 2));
    }

    // Analizuj zadanie i wybierz odpowiedniego agenta
    analyzeTask(taskDescription) {
        if (!this.isActive) return null;
        
        const task = taskDescription.toLowerCase();
        let selectedAgent = 'frontend_development'; // domyślny agent
        let confidence = 0;
        
        // Znajdź najlepiej pasującego agenta
        for (const [keyword, agent] of Object.entries(this.agentMapping)) {
            if (task.includes(keyword)) {
                const keywordFreq = (task.match(new RegExp(keyword, 'g')) || []).length;
                const currentConfidence = keywordFreq * keyword.length;
                
                if (currentConfidence > confidence) {
                    confidence = currentConfidence;
                    selectedAgent = agent;
                }
            }
        }
        
        return {
            agent: selectedAgent,
            confidence: confidence,
            keywords_found: Object.keys(this.agentMapping).filter(k => task.includes(k))
        };
    }

    // Deleguj zadanie do agenta
    async delegateTask(taskDescription, taskType = 'general') {
        if (!this.isActive) {
            return { success: false, message: 'CVPerfect Agents Bridge not active' };
        }
        
        const analysis = this.analyzeTask(taskDescription);
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const taskData = {
            id: taskId,
            description: taskDescription,
            type: taskType,
            assigned_agent: analysis.agent,
            confidence: analysis.confidence,
            keywords: analysis.keywords_found,
            status: 'pending',
            created_at: new Date().toISOString(),
            claude_session: true
        };
        
        // Zapisz zadanie do pliku komunikacyjnego
        try {
            const commData = JSON.parse(fs.readFileSync(this.communicationFile, 'utf8'));
            commData.pending_tasks.push(taskData);
            commData.last_update = new Date().toISOString();
            fs.writeFileSync(this.communicationFile, JSON.stringify(commData, null, 2));
            
            console.log(`🎯 Zadanie delegowane do agenta: ${analysis.agent}`);
            console.log(`📋 Opis: ${taskDescription}`);
            console.log(`🔍 Słowa kluczowe: ${analysis.keywords_found.join(', ')}`);
            
            return {
                success: true,
                taskId: taskId,
                assignedAgent: analysis.agent,
                confidence: analysis.confidence,
                message: `Zadanie delegowane do agenta ${analysis.agent}`
            };
            
        } catch (error) {
            console.error('❌ Błąd delegowania zadania:', error);
            return { success: false, message: error.message };
        }
    }

    // Sprawdź status zadania
    checkTaskStatus(taskId) {
        if (!this.isActive) return null;
        
        try {
            const commData = JSON.parse(fs.readFileSync(this.communicationFile, 'utf8'));
            
            // Sprawdź zadania w trakcie
            let task = commData.pending_tasks.find(t => t.id === taskId);
            if (task) return { ...task, status: 'pending' };
            
            // Sprawdź zadania zakończone
            task = commData.completed_tasks.find(t => t.id === taskId);
            if (task) return { ...task, status: 'completed' };
            
            return null;
        } catch (error) {
            return { error: error.message };
        }
    }

    // Pobierz wyniki zadania
    getTaskResult(taskId) {
        const task = this.checkTaskStatus(taskId);
        return task && task.result ? task.result : null;
    }

    // Sprawdź czy bridge jest aktywny
    isActivated() {
        return this.isActive;
    }

    // Pobierz listę dostępnych agentów
    getAvailableAgents() {
        return [...new Set(Object.values(this.agentMapping))];
    }
}

// Export dla użycia w Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CVPerfectAgentsBridge;
}

// Export dla użycia w przeglądarce
if (typeof window !== 'undefined') {
    window.CVPerfectAgentsBridge = CVPerfectAgentsBridge;
}

// Auto-inicjalizacja w CVPerfect
if (require.main === module) {
    const bridge = new CVPerfectAgentsBridge();
    console.log('🌉 CVPerfect Agents Bridge ready');
    console.log(`📊 Available agents: ${bridge.getAvailableAgents().length}`);
    console.log(`🎯 Bridge active: ${bridge.isActivated()}`);
}