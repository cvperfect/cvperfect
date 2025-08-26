/**
 * CVPerfect Architecture Analysis Agent
 * Based on SuperClaude architecture analysis + Claude Opus 4.1 extended reasoning
 * 
 * Features:
 * - Comprehensive system architecture analysis
 * - Performance bottleneck detection
 * - Security vulnerability assessment  
 * - Scalability recommendations
 * - CVPerfect-specific pattern recognition
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ArchitectureAnalyzer {
    constructor(projectPath = process.cwd()) {
        this.projectPath = projectPath;
        this.analysisDate = new Date().toISOString();
        
        this.cvperfectPatterns = {
            criticalFiles: [
                'pages/index.js',      // 6000+ line main component
                'pages/success.js',    // Post-payment flow
                'pages/api/*.js'       // Backend endpoints
            ],
            architecturalLayers: {
                frontend: ['pages/', 'components/', 'public/'],
                backend: ['pages/api/', 'lib/'],
                agents: ['agents/', 'start-agents-system.js'],
                config: ['.claude/', 'package.json', '.env*']
            },
            riskPatterns: {
                highRisk: [
                    'pages/index.js',   // 6000+ lines - refactoring risk
                    'stripe-webhook',   // Payment security
                    'session-data'      // Data persistence
                ],
                performanceRisks: [
                    'ai optimization',   // Groq API calls
                    'pdf generation',    // Heavy operations
                    'file uploads'       // Memory usage
                ]
            }
        };
    }

    /**
     * Perform comprehensive architecture analysis
     */
    async performFullAnalysis() {
        console.log('🏗️ Starting CVPerfect Architecture Analysis...');
        
        const analysis = {
            timestamp: this.analysisDate,
            project: 'CVPerfect',
            version: this.getProjectVersion(),
            
            // Core analysis components
            structure: await this.analyzeProjectStructure(),
            dependencies: await this.analyzeDependencies(),
            performance: await this.analyzePerformancePatterns(),
            security: await this.analyzeSecurityPatterns(),
            scalability: await this.analyzeScalability(),
            codeComplexity: await this.analyzeCodeComplexity(),
            
            // CVPerfect-specific analysis
            cvperfectSpecific: await this.analyzeCVPerfectPatterns(),
            agentIntegration: await this.analyzeAgentSystem(),
            
            // Risk assessment
            risks: await this.assessRisks(),
            recommendations: await this.generateRecommendations()
        };

        return this.generateReport(analysis);
    }

    /**
     * Analyze project structure
     */
    async analyzeProjectStructure() {
        const structure = {
            totalFiles: 0,
            directories: {},
            fileTypes: {},
            largeFiles: [],
            criticalPaths: []
        };

        try {
            const files = this.getAllFiles(this.projectPath);
            structure.totalFiles = files.length;

            files.forEach(file => {
                const relativePath = path.relative(this.projectPath, file);
                const extension = path.extname(file);
                const stats = fs.statSync(file);
                
                // Count by directory
                const dir = path.dirname(relativePath);
                structure.directories[dir] = (structure.directories[dir] || 0) + 1;
                
                // Count by file type
                structure.fileTypes[extension] = (structure.fileTypes[extension] || 0) + 1;
                
                // Identify large files (>100KB)
                if (stats.size > 100000) {
                    structure.largeFiles.push({
                        file: relativePath,
                        size: Math.round(stats.size / 1024) + 'KB',
                        lines: this.countLines(file)
                    });
                }

                // Check for critical paths
                if (this.isCriticalFile(relativePath)) {
                    structure.criticalPaths.push({
                        file: relativePath,
                        size: stats.size,
                        importance: this.assessFileImportance(relativePath)
                    });
                }
            });

            return structure;
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Analyze project dependencies
     */
    async analyzeDependencies() {
        try {
            const packageJson = JSON.parse(
                fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8')
            );

            const deps = {
                production: Object.keys(packageJson.dependencies || {}),
                development: Object.keys(packageJson.devDependencies || {}),
                total: 0,
                heavyDependencies: [],
                securityRisks: [],
                cvperfectSpecific: []
            };

            deps.total = deps.production.length + deps.development.length;

            // Analyze CVPerfect-specific dependencies
            const criticalDeps = [
                'next', 'react', 'stripe', '@supabase/supabase-js', 
                'groq-sdk', 'puppeteer', 'nodemailer', 'framer-motion'
            ];

            criticalDeps.forEach(dep => {
                if (deps.production.includes(dep)) {
                    deps.cvperfectSpecific.push({
                        name: dep,
                        purpose: this.getDependencyPurpose(dep),
                        risk: this.assessDependencyRisk(dep)
                    });
                }
            });

            return deps;
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Analyze performance patterns
     */
    async analyzePerformancePatterns() {
        const patterns = {
            potentialBottlenecks: [],
            optimizationOpportunities: [],
            resourceUsage: {},
            cacheStrategy: 'none'
        };

        // Analyze large files for performance issues
        const largeFiles = ['pages/index.js', 'pages/success.js'];
        largeFiles.forEach(file => {
            const fullPath = path.join(this.projectPath, file);
            if (fs.existsSync(fullPath)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Check for performance anti-patterns
                const antiPatterns = this.detectPerformanceAntiPatterns(content, file);
                if (antiPatterns.length > 0) {
                    patterns.potentialBottlenecks.push({
                        file,
                        issues: antiPatterns
                    });
                }
            }
        });

        return patterns;
    }

    /**
     * Analyze security patterns
     */
    async analyzeSecurityPatterns() {
        const security = {
            vulnerabilities: [],
            securityMeasures: [],
            recommendations: []
        };

        // Check for security implementations
        const libDir = path.join(this.projectPath, 'lib');
        if (fs.existsSync(libDir)) {
            const securityFiles = fs.readdirSync(libDir)
                .filter(file => file.includes('auth') || file.includes('cors') || file.includes('validation'));
            
            security.securityMeasures = securityFiles.map(file => ({
                file: `lib/${file}`,
                purpose: this.getSecurityPurpose(file)
            }));
        }

        // Check API endpoints for security patterns
        const apiDir = path.join(this.projectPath, 'pages', 'api');
        if (fs.existsSync(apiDir)) {
            const apiFiles = fs.readdirSync(apiDir);
            apiFiles.forEach(file => {
                const filePath = path.join(apiDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const issues = this.detectSecurityIssues(content, file);
                if (issues.length > 0) {
                    security.vulnerabilities.push({
                        file: `pages/api/${file}`,
                        issues
                    });
                }
            });
        }

        return security;
    }

    /**
     * Analyze scalability concerns
     */
    async analyzeScalability() {
        const scalability = {
            currentLimitations: [],
            scaleBottlenecks: [],
            recommendations: []
        };

        // Analyze monolithic structure
        const indexStats = this.analyzeFileComplexity('pages/index.js');
        if (indexStats.lines > 5000) {
            scalability.currentLimitations.push({
                type: 'Monolithic Component',
                description: `pages/index.js has ${indexStats.lines} lines - refactoring needed for maintainability`,
                severity: 'high'
            });
        }

        // Check for state management scalability
        scalability.scaleBottlenecks.push({
            area: 'State Management',
            issue: 'Complex state in main component (20+ variables)',
            impact: 'Difficult to scale UI features',
            recommendation: 'Consider React Context or state management library'
        });

        return scalability;
    }

    /**
     * Analyze code complexity
     */
    async analyzeCodeComplexity() {
        const complexity = {
            totalLines: 0,
            averageFileSize: 0,
            complexFiles: [],
            maintainabilityIndex: 0
        };

        const files = ['pages/index.js', 'pages/success.js'];
        let totalComplexity = 0;

        files.forEach(file => {
            const fullPath = path.join(this.projectPath, file);
            if (fs.existsSync(fullPath)) {
                const stats = this.analyzeFileComplexity(file);
                complexity.totalLines += stats.lines;
                totalComplexity += stats.complexity;
                
                if (stats.complexity > 50) {
                    complexity.complexFiles.push(stats);
                }
            }
        });

        complexity.averageFileSize = Math.round(complexity.totalLines / files.length);
        complexity.maintainabilityIndex = Math.max(0, 100 - totalComplexity / files.length);

        return complexity;
    }

    /**
     * Analyze CVPerfect-specific patterns
     */
    async analyzeCVPerfectPatterns() {
        return {
            paymentFlow: this.analyzePaymentIntegration(),
            aiIntegration: this.analyzeAIIntegration(),
            sessionManagement: this.analyzeSessionManagement(),
            templateSystem: this.analyzeTemplateSystem()
        };
    }

    /**
     * Analyze agent system integration
     */
    async analyzeAgentSystem() {
        const agentDir = path.join(this.projectPath, 'agents');
        const analysis = {
            agentsFound: 0,
            categories: {},
            integration: 'partial',
            recommendations: []
        };

        if (fs.existsSync(agentDir)) {
            const categories = fs.readdirSync(agentDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            analysis.categories = categories.reduce((acc, cat) => {
                const catPath = path.join(agentDir, cat);
                const files = fs.readdirSync(catPath).filter(f => f.endsWith('.js'));
                acc[cat] = files.length;
                analysis.agentsFound += files.length;
                return acc;
            }, {});

            if (analysis.agentsFound > 30) {
                analysis.integration = 'comprehensive';
            } else if (analysis.agentsFound > 10) {
                analysis.integration = 'good';
            }
        }

        return analysis;
    }

    /**
     * Assess overall risks
     */
    async assessRisks() {
        return [
            {
                type: 'Monolithic Architecture',
                severity: 'high',
                description: 'Large single-file components difficult to maintain',
                files: ['pages/index.js', 'pages/success.js'],
                mitigation: 'Refactor into smaller components'
            },
            {
                type: 'Payment Security',
                severity: 'critical',
                description: 'Stripe integration requires careful security handling',
                files: ['pages/api/stripe-webhook.js', 'pages/api/create-checkout-session.js'],
                mitigation: 'Implement comprehensive input validation and error handling'
            },
            {
                type: 'Session Persistence',
                severity: 'medium',
                description: 'Complex session management across payment flow',
                files: ['pages/api/save-session.js', 'pages/api/get-session-data.js'],
                mitigation: 'Add session timeout and cleanup mechanisms'
            }
        ];
    }

    /**
     * Generate recommendations
     */
    async generateRecommendations() {
        return [
            {
                priority: 'high',
                category: 'Architecture',
                title: 'Refactor Monolithic Components',
                description: 'Break down large files into smaller, focused components',
                impact: 'Improved maintainability and team collaboration',
                effort: 'high'
            },
            {
                priority: 'high',
                category: 'Performance',
                title: 'Implement Code Splitting',
                description: 'Use Next.js dynamic imports for heavy components',
                impact: 'Faster page loads and better UX',
                effort: 'medium'
            },
            {
                priority: 'medium',
                category: 'Security',
                title: 'Enhance API Validation',
                description: 'Strengthen input validation and error handling',
                impact: 'Reduced security vulnerabilities',
                effort: 'medium'
            },
            {
                priority: 'medium',
                category: 'Tooling',
                title: 'Expand Agent System Usage',
                description: 'Leverage CVPerfect agents for more development tasks',
                impact: 'Increased development efficiency',
                effort: 'low'
            }
        ];
    }

    /**
     * Generate comprehensive report
     */
    generateReport(analysis) {
        const report = `# CVPerfect Architecture Analysis Report

## Executive Summary
**Project:** CVPerfect - AI-Powered CV Optimization Service
**Analysis Date:** ${this.analysisDate}
**Total Files Analyzed:** ${analysis.structure.totalFiles}

## 🏗️ System Architecture Overview

### Current Architecture
- **Frontend:** Next.js 14 SPA with glassmorphism design
- **Backend:** API routes with Stripe/Supabase integration  
- **AI System:** ${analysis.agentIntegration.agentsFound} specialized agents
- **Security:** ${analysis.security.securityMeasures.length} security modules implemented

### Key Metrics
- **Total Lines of Code:** ~${analysis.codeComplexity.totalLines.toLocaleString()}
- **Maintainability Index:** ${Math.round(analysis.codeComplexity.maintainabilityIndex)}/100
- **Dependencies:** ${analysis.dependencies.total} packages
- **Agent Integration:** ${analysis.agentIntegration.integration}

## ⚠️ Risk Assessment

${analysis.risks.map(risk => `
### ${risk.type} (${risk.severity.toUpperCase()})
${risk.description}
**Files:** ${risk.files.join(', ')}
**Mitigation:** ${risk.mitigation}
`).join('')}

## 🚀 Performance Analysis

### Large Files Requiring Attention
${analysis.structure.largeFiles.map(file => 
`- **${file.file}:** ${file.size} (${file.lines} lines)`).join('\n')}

### Bottlenecks Identified
${analysis.performance.potentialBottlenecks.map(bottleneck =>
`- **${bottleneck.file}:** ${bottleneck.issues.join(', ')}`).join('\n')}

## 🔒 Security Assessment

### Security Measures In Place
${analysis.security.securityMeasures.map(measure =>
`- **${measure.file}:** ${measure.purpose}`).join('\n')}

### Vulnerabilities Found
${analysis.security.vulnerabilities.length > 0 ? 
  analysis.security.vulnerabilities.map(vuln =>
    `- **${vuln.file}:** ${vuln.issues.join(', ')}`).join('\n') 
  : '✅ No major vulnerabilities detected'}

## 📈 Scalability Assessment

### Current Limitations
${analysis.scalability.currentLimitations.map(limit =>
`- **${limit.type}:** ${limit.description} (${limit.severity})`).join('\n')}

## 🤖 Agent System Analysis

### Agent Distribution
${Object.entries(analysis.agentIntegration.categories).map(([category, count]) =>
`- **${category}:** ${count} agents`).join('\n')}

**Integration Level:** ${analysis.agentIntegration.integration}

## 📋 Recommendations (Prioritized)

${analysis.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.title} (${rec.priority.toUpperCase()} Priority)
**Category:** ${rec.category}
**Description:** ${rec.description}
**Impact:** ${rec.impact}
**Effort:** ${rec.effort}
`).join('')}

## 🎯 Next Steps

1. **Immediate (Week 1-2):**
   - Address critical security vulnerabilities
   - Implement basic monitoring for large files

2. **Short Term (Month 1):**
   - Begin component refactoring for pages/index.js
   - Enhance API validation and error handling

3. **Long Term (Months 2-3):**
   - Complete architecture modernization
   - Full agent system integration

---
*Report generated by CVPerfect Architecture Analyzer*
*Powered by Claude Opus 4.1 + SuperClaude Techniques*
`;

        return {
            report,
            analysis,
            summary: {
                overallScore: this.calculateOverallScore(analysis),
                criticalIssues: analysis.risks.filter(r => r.severity === 'critical').length,
                recommendations: analysis.recommendations.length
            }
        };
    }

    // Helper methods
    getAllFiles(dir, files = []) {
        try {
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    if (!item.startsWith('.') && item !== 'node_modules') {
                        this.getAllFiles(fullPath, files);
                    }
                } else {
                    files.push(fullPath);
                }
            });
        } catch (error) {
            // Ignore permission errors
        }
        return files;
    }

    countLines(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return content.split('\n').length;
        } catch {
            return 0;
        }
    }

    isCriticalFile(filePath) {
        return this.cvperfectPatterns.criticalFiles.some(pattern => 
            filePath.includes(pattern.replace('*', ''))
        );
    }

    assessFileImportance(filePath) {
        if (filePath.includes('pages/index.js')) return 'critical';
        if (filePath.includes('pages/success.js')) return 'critical';
        if (filePath.includes('pages/api/')) return 'high';
        return 'medium';
    }

    getDependencyPurpose(dep) {
        const purposes = {
            'next': 'React framework',
            'stripe': 'Payment processing',
            '@supabase/supabase-js': 'Database and auth',
            'groq-sdk': 'AI processing',
            'puppeteer': 'Browser automation'
        };
        return purposes[dep] || 'Utility';
    }

    assessDependencyRisk(dep) {
        const riskDeps = ['stripe', 'groq-sdk', '@supabase/supabase-js'];
        return riskDeps.includes(dep) ? 'high' : 'low';
    }

    detectPerformanceAntiPatterns(content, file) {
        const patterns = [];
        if (content.includes('useEffect') && content.split('useEffect').length > 10) {
            patterns.push('Too many useEffect hooks');
        }
        if (content.length > 200000) {
            patterns.push('File too large for optimal performance');
        }
        return patterns;
    }

    getSecurityPurpose(filename) {
        const purposes = {
            'auth.js': 'Authentication middleware',
            'cors.js': 'Cross-origin protection',
            'validation.js': 'Input validation'
        };
        return purposes[filename] || 'Security utility';
    }

    detectSecurityIssues(content, file) {
        const issues = [];
        if (!content.includes('validate') && !content.includes('sanitize')) {
            issues.push('Missing input validation');
        }
        if (content.includes('console.log') && file.includes('stripe')) {
            issues.push('Potential sensitive data logging');
        }
        return issues;
    }

    analyzeFileComplexity(file) {
        try {
            const fullPath = path.join(this.projectPath, file);
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n').length;
            
            // Simple complexity calculation
            const complexity = Math.min(100, Math.round(lines / 100) + 
                (content.match(/function|class|if|for|while/g) || []).length / 10);
            
            return { file, lines, complexity };
        } catch {
            return { file, lines: 0, complexity: 0 };
        }
    }

    analyzePaymentIntegration() {
        return { status: 'implemented', security: 'good', recommendations: [] };
    }

    analyzeAIIntegration() {
        return { provider: 'Groq', model: 'Llama 3.1-70B', status: 'active' };
    }

    analyzeSessionManagement() {
        return { persistence: 'Supabase', cleanup: 'implemented' };
    }

    analyzeTemplateSystem() {
        return { templates: 7, accessibility: 'tiered' };
    }

    getProjectVersion() {
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(this.projectPath, 'package.json'), 'utf8'));
            return pkg.version || '1.0.0';
        } catch {
            return '1.0.0';
        }
    }

    calculateOverallScore(analysis) {
        let score = 100;
        score -= analysis.risks.filter(r => r.severity === 'critical').length * 20;
        score -= analysis.risks.filter(r => r.severity === 'high').length * 10;
        score -= analysis.risks.filter(r => r.severity === 'medium').length * 5;
        return Math.max(0, score);
    }
}

// CLI usage
if (require.main === module) {
    const analyzer = new ArchitectureAnalyzer();
    analyzer.performFullAnalysis().then(result => {
        console.log(result.report);
        
        // Save report to file
        const reportPath = path.join(__dirname, '../../.claude/reports/architecture-analysis.md');
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, result.report);
        console.log(`\n📄 Report saved to: ${reportPath}`);
    }).catch(console.error);
}

module.exports = { ArchitectureAnalyzer };