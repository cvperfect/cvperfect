/**
 * AI DEBUGGING COPILOT MASTER AGENT
 * Mistrz AI-driven debugging inspirowany GitHub Copilot 2025 i najnowszymi AI tools
 * Wykorzystuje pattern recognition, automated fix suggestions, i intelligent code analysis
 */

class AIDebuggingCopilotMaster {
    constructor() {
        this.name = 'AI Debugging Copilot Master';
        this.id = 'ai_debug_copilot_001';
        this.status = 'ready';
        this.aiModels = ['pattern_recognition', 'code_analysis', 'fix_suggestion', 'predictive_debugging'];
        this.debuggingHistory = [];
        this.learnedPatterns = new Map();
        this.fixSuccessRate = 0;
        
        // Initialize pattern recognition database
        this.initializePatternDatabase();
        
        console.log('🤖 AI Debugging Copilot Master initialized with advanced AI debugging capabilities');
    }

    // Initialize pattern recognition database z CVPerfect-specific patterns
    initializePatternDatabase() {
        this.patterns = {
            // React/Next.js Patterns
            'react_infinite_render': {
                signatures: [
                    'useEffect.*without.*dependency',
                    'setState.*inside.*useEffect.*no.*deps',
                    'infinite.*render.*loop',
                    'component.*renders.*continuously'
                ],
                fixes: [
                    'Add dependency array to useEffect',
                    'Use useCallback for function dependencies',
                    'Add condition to prevent unnecessary setState',
                    'Use useRef for values that shouldnt trigger re-renders'
                ],
                confidence: 0.9
            },

            'react_memory_leak': {
                signatures: [
                    'memory.*leak.*useEffect',
                    'cleanup.*function.*missing',
                    'event.*listener.*not.*removed',
                    'timer.*interval.*not.*cleared'
                ],
                fixes: [
                    'Add cleanup function to useEffect return',
                    'Clear timers and intervals in cleanup',
                    'Remove event listeners on unmount',
                    'Cancel pending promises in cleanup'
                ],
                confidence: 0.85
            },

            // CVPerfect Specific Patterns
            'cvperfect_session_loss': {
                signatures: [
                    'session.*data.*undefined',
                    'metadata.*missing.*after.*payment',
                    'stripe.*session.*empty',
                    'cv.*data.*not.*found'
                ],
                fixes: [
                    'Add session data validation before processing',
                    'Implement fallback to sessionStorage/localStorage',
                    'Add retry logic for session data fetching',
                    'Validate Stripe webhook payload'
                ],
                confidence: 0.95
            },

            'cvperfect_infinite_retry': {
                signatures: [
                    'fetchUserDataFromSession.*infinite',
                    'recursive.*call.*no.*exit',
                    'retry.*count.*unlimited',
                    'browser.*freeze.*after.*payment'
                ],
                fixes: [
                    'Add MAX_RETRIES constant at function start',
                    'Implement timeout protection with Promise.race',
                    'Add explicit exit conditions for edge cases',
                    'Use exponential backoff for retry delays'
                ],
                confidence: 0.98
            },

            // Payment & API Patterns
            'stripe_webhook_failure': {
                signatures: [
                    'stripe.*webhook.*timeout',
                    'payment.*success.*user.*not.*redirected',
                    'webhook.*secret.*mismatch',
                    'cors.*error.*webhook'
                ],
                fixes: [
                    'Verify webhook endpoint URL configuration',
                    'Check STRIPE_WEBHOOK_SECRET environment variable',
                    'Add webhook event logging and monitoring',
                    'Implement webhook retry mechanism with exponential backoff'
                ],
                confidence: 0.92
            },

            'api_rate_limiting': {
                signatures: [
                    'rate.*limit.*exceeded',
                    'too.*many.*requests.*429',
                    'api.*quota.*reached',
                    'groq.*api.*limit'
                ],
                fixes: [
                    'Implement request queuing with rate limiting',
                    'Add exponential backoff for failed requests',
                    'Cache API responses to reduce calls',
                    'Add request throttling middleware'
                ],
                confidence: 0.88
            },

            // Performance Patterns
            'performance_degradation': {
                signatures: [
                    'page.*load.*slow',
                    'memory.*usage.*high',
                    'cpu.*spike.*frontend',
                    'bundle.*size.*large'
                ],
                fixes: [
                    'Implement code splitting for large components',
                    'Add lazy loading for non-critical components',
                    'Optimize image loading with next/image',
                    'Remove unused dependencies from bundle'
                ],
                confidence: 0.8
            },

            // Security Patterns
            'security_vulnerability': {
                signatures: [
                    'xss.*vulnerability',
                    'injection.*attack.*possible',
                    'csrf.*token.*missing',
                    'sensitive.*data.*exposed'
                ],
                fixes: [
                    'Sanitize user input using DOMPurify',
                    'Add CSRF protection middleware',
                    'Implement proper input validation',
                    'Use environment variables for sensitive data'
                ],
                confidence: 0.93
            }
        };

        console.log('📊 Pattern database initialized with', Object.keys(this.patterns).length, 'patterns');
    }

    // MAIN AI DEBUGGING FUNCTION - comprehensive analysis
    async performAIDebugging(errorContext, sourceCode = null) {
        console.log('🚀 Starting AI-powered debugging analysis...');

        const debugSession = {
            id: `debug_${Date.now()}`,
            timestamp: new Date().toISOString(),
            errorContext: errorContext,
            analysis: {},
            suggestions: [],
            confidence: 0,
            estimatedFixTime: 0
        };

        try {
            // 1. Pattern Recognition Analysis
            debugSession.analysis.patternMatches = await this.analyzePatterns(errorContext, sourceCode);
            
            // 2. Code Context Analysis
            if (sourceCode) {
                debugSession.analysis.codeAnalysis = await this.analyzeCode(sourceCode);
            }

            // 3. Historical Learning
            debugSession.analysis.historicalInsights = await this.analyzeHistory(errorContext);

            // 4. Generate AI-powered fix suggestions
            debugSession.suggestions = await this.generateFixSuggestions(debugSession.analysis);

            // 5. Calculate confidence score
            debugSession.confidence = this.calculateConfidence(debugSession.analysis);

            // 6. Estimate fix time
            debugSession.estimatedFixTime = this.estimateFixTime(debugSession.suggestions);

            // 7. Store session for learning
            this.debuggingHistory.push(debugSession);
            
            console.log('✅ AI debugging completed. Confidence:', debugSession.confidence);
            console.log('🔧 Generated', debugSession.suggestions.length, 'fix suggestions');
            
            return debugSession;

        } catch (error) {
            console.error('❌ AI debugging analysis failed:', error);
            throw error;
        }
    }

    // Advanced pattern recognition using AI-like analysis
    async analyzePatterns(errorContext, sourceCode) {
        console.log('🔍 Analyzing patterns with AI recognition...');

        const patternMatches = [];
        const errorText = this.extractErrorText(errorContext);

        for (const [patternName, pattern] of Object.entries(this.patterns)) {
            let matchScore = 0;
            const matches = [];

            // Check signatures against error context
            for (const signature of pattern.signatures) {
                const regex = new RegExp(signature, 'i');
                if (regex.test(errorText)) {
                    matchScore += 0.3;
                    matches.push(signature);
                }

                // Also check source code if available
                if (sourceCode && regex.test(sourceCode)) {
                    matchScore += 0.4;
                    matches.push(`code: ${signature}`);
                }
            }

            // Bonus score dla CVPerfect-specific patterns
            if (patternName.includes('cvperfect') && matchScore > 0) {
                matchScore += 0.2;
            }

            // If we have a significant match, add to results
            if (matchScore >= 0.3) {
                patternMatches.push({
                    pattern: patternName,
                    score: Math.min(matchScore, 1.0),
                    confidence: pattern.confidence * matchScore,
                    matches: matches,
                    suggestedFixes: pattern.fixes
                });
            }
        }

        return patternMatches.sort((a, b) => b.confidence - a.confidence);
    }

    // Extract meaningful text z error context
    extractErrorText(errorContext) {
        let text = '';

        if (typeof errorContext === 'string') {
            text = errorContext;
        } else if (errorContext.error) {
            text += errorContext.error.message || errorContext.error.toString();
        } else if (errorContext.description) {
            text += errorContext.description;
        }

        if (errorContext.stackTrace) {
            text += ' ' + errorContext.stackTrace;
        }

        if (errorContext.logs) {
            text += ' ' + errorContext.logs.join(' ');
        }

        return text.toLowerCase();
    }

    // Advanced code analysis using static analysis techniques
    async analyzeCode(sourceCode) {
        console.log('📝 Performing static code analysis...');

        const analysis = {
            issues: [],
            metrics: {},
            suggestions: []
        };

        // Detect common React anti-patterns
        analysis.issues = analysis.issues.concat(this.detectReactAntiPatterns(sourceCode));
        
        // Detect performance issues
        analysis.issues = analysis.issues.concat(this.detectPerformanceIssues(sourceCode));
        
        // Detect security vulnerabilities
        analysis.issues = analysis.issues.concat(this.detectSecurityIssues(sourceCode));
        
        // Calculate code metrics
        analysis.metrics = this.calculateCodeMetrics(sourceCode);

        // Generate improvement suggestions
        analysis.suggestions = this.generateImprovementSuggestions(analysis.issues);

        return analysis;
    }

    // Detect React anti-patterns in kod
    detectReactAntiPatterns(code) {
        const issues = [];

        // useEffect without dependencies
        if (/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?\}\s*\)/.test(code)) {
            issues.push({
                type: 'react_antipattern',
                severity: 'high',
                description: 'useEffect without dependency array detected',
                line: this.findLineNumber(code, 'useEffect'),
                suggestion: 'Add dependency array to useEffect or use empty array [] for mount-only effects'
            });
        }

        // setState in render
        if (/setState.*render|render.*setState/.test(code)) {
            issues.push({
                type: 'react_antipattern',
                severity: 'critical',
                description: 'setState called during render cycle',
                suggestion: 'Move setState to useEffect or event handlers'
            });
        }

        // Missing key props in lists
        if (/map\s*\(\s*\([^)]*\)\s*=>\s*</.test(code) && !/key\s*=/.test(code)) {
            issues.push({
                type: 'react_antipattern',
                severity: 'medium',
                description: 'Missing key prop in mapped elements',
                suggestion: 'Add unique key prop to mapped React elements'
            });
        }

        return issues;
    }

    // Detect performance issues w kodzie
    detectPerformanceIssues(code) {
        const issues = [];

        // Large bundle imports
        if (/import.*{[^}]{100,}}.*from/.test(code)) {
            issues.push({
                type: 'performance',
                severity: 'medium',
                description: 'Large import statement detected',
                suggestion: 'Consider tree shaking or dynamic imports for large libraries'
            });
        }

        // Synchronous expensive operations in render
        if (/JSON\.parse.*render|JSON\.stringify.*render/.test(code)) {
            issues.push({
                type: 'performance',
                severity: 'medium',
                description: 'Expensive synchronous operation in render',
                suggestion: 'Move expensive operations to useMemo or useEffect'
            });
        }

        return issues;
    }

    // Detect security vulnerabilities
    detectSecurityIssues(code) {
        const issues = [];

        // Potential XSS with dangerouslySetInnerHTML
        if (/dangerouslySetInnerHTML/.test(code) && !/DOMPurify|sanitize/.test(code)) {
            issues.push({
                type: 'security',
                severity: 'high',
                description: 'Potential XSS with dangerouslySetInnerHTML',
                suggestion: 'Sanitize HTML content with DOMPurify before setting innerHTML'
            });
        }

        // Hardcoded secrets
        if (/api[_-]?key|secret|password.*=.*['"][^'"]{10,}['"]/.test(code)) {
            issues.push({
                type: 'security',
                severity: 'critical',
                description: 'Potential hardcoded secret detected',
                suggestion: 'Move secrets to environment variables'
            });
        }

        return issues;
    }

    // Calculate code quality metrics
    calculateCodeMetrics(code) {
        return {
            linesOfCode: code.split('\n').length,
            complexity: this.calculateCyclomaticComplexity(code),
            duplicatedLines: this.findDuplicatedLines(code),
            testCoverage: this.estimateTestCoverage(code),
            maintainabilityIndex: this.calculateMaintainabilityIndex(code)
        };
    }

    // Calculate cyclomatic complexity (simplified)
    calculateCyclomaticComplexity(code) {
        const patterns = [/if\s*\(/, /else\s+if/, /for\s*\(/, /while\s*\(/, /case\s+/, /catch\s*\(/];
        let complexity = 1; // Base complexity

        patterns.forEach(pattern => {
            const matches = code.match(new RegExp(pattern.source, 'g'));
            if (matches) complexity += matches.length;
        });

        return complexity;
    }

    // Find duplicated lines (simplified detection)
    findDuplicatedLines(code) {
        const lines = code.split('\n').filter(line => line.trim().length > 10);
        const lineCount = new Map();
        let duplicates = 0;

        lines.forEach(line => {
            const trimmed = line.trim();
            lineCount.set(trimmed, (lineCount.get(trimmed) || 0) + 1);
        });

        lineCount.forEach(count => {
            if (count > 1) duplicates += count - 1;
        });

        return duplicates;
    }

    // Estimate test coverage based on code patterns
    estimateTestCoverage(code) {
        const hasTests = /test\s*\(|it\s*\(|describe\s*\(/.test(code);
        const testLines = (code.match(/test\s*\(|it\s*\(|expect\s*\(/g) || []).length;
        const codeLines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('//')).length;
        
        if (!hasTests) return 0;
        return Math.min((testLines / codeLines) * 100, 100);
    }

    // Calculate maintainability index (simplified)
    calculateMaintainabilityIndex(code) {
        const complexity = this.calculateCyclomaticComplexity(code);
        const linesOfCode = code.split('\n').length;
        const commentRatio = (code.match(/\/\/|\/\*/g) || []).length / linesOfCode;
        
        // Simplified MI calculation
        let mi = 171 - 5.2 * Math.log(linesOfCode) - 0.23 * complexity + 16.2 * Math.log(linesOfCode) * commentRatio;
        return Math.max(0, Math.min(100, mi));
    }

    // Find line number gdzie pattern występuje
    findLineNumber(code, pattern) {
        const lines = code.split('\n');
        const regex = new RegExp(pattern, 'i');
        
        for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
                return i + 1;
            }
        }
        return null;
    }

    // Generate improvement suggestions na podstawie issues
    generateImprovementSuggestions(issues) {
        return issues.map(issue => ({
            type: 'improvement',
            priority: issue.severity === 'critical' ? 'high' : 'medium',
            description: issue.suggestion,
            category: issue.type
        }));
    }

    // Analyze historical debugging data dla learning
    async analyzeHistory(errorContext) {
        console.log('📚 Analyzing historical debugging patterns...');

        const insights = {
            similarCases: [],
            successfulFixes: [],
            commonPatterns: [],
            recommendation: null
        };

        const errorText = this.extractErrorText(errorContext).toLowerCase();

        // Find similar historical cases
        this.debuggingHistory.forEach(session => {
            const sessionErrorText = this.extractErrorText(session.errorContext).toLowerCase();
            const similarity = this.calculateSimilarity(errorText, sessionErrorText);

            if (similarity > 0.6) {
                insights.similarCases.push({
                    session: session,
                    similarity: similarity,
                    confidence: session.confidence,
                    successful: session.successful || false
                });
            }
        });

        // Extract successful fixes from similar cases
        insights.successfulFixes = insights.similarCases
            .filter(case_ => case_.successful && case_.confidence > 0.7)
            .map(case_ => case_.session.suggestions)
            .flat()
            .slice(0, 5);

        // Generate recommendation based on history
        if (insights.similarCases.length > 0) {
            const avgConfidence = insights.similarCases.reduce((sum, case_) => sum + case_.confidence, 0) / insights.similarCases.length;
            insights.recommendation = {
                message: `Found ${insights.similarCases.length} similar cases with ${(avgConfidence * 100).toFixed(1)}% avg confidence`,
                suggestion: insights.successfulFixes.length > 0 ? 'Apply successful fixes from similar cases' : 'Pattern recognized but no successful fixes recorded'
            };
        }

        return insights;
    }

    // Calculate similarity między error texts (simplified)
    calculateSimilarity(text1, text2) {
        const words1 = new Set(text1.split(/\s+/));
        const words2 = new Set(text2.split(/\s+/));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size; // Jaccard similarity
    }

    // Generate AI-powered fix suggestions
    async generateFixSuggestions(analysis) {
        console.log('🔧 Generating AI-powered fix suggestions...');

        const suggestions = [];

        // From pattern matches
        if (analysis.patternMatches) {
            analysis.patternMatches.forEach(match => {
                match.suggestedFixes.forEach((fix, index) => {
                    suggestions.push({
                        type: 'pattern_fix',
                        priority: match.confidence > 0.8 ? 'high' : 'medium',
                        confidence: match.confidence,
                        description: fix,
                        pattern: match.pattern,
                        estimatedEffort: this.estimateEffort(fix),
                        automatable: this.isAutomatable(fix)
                    });
                });
            });
        }

        // From code analysis
        if (analysis.codeAnalysis?.suggestions) {
            analysis.codeAnalysis.suggestions.forEach(suggestion => {
                suggestions.push({
                    type: 'code_improvement',
                    priority: suggestion.priority,
                    confidence: 0.7, // Static analysis confidence
                    description: suggestion.description,
                    category: suggestion.category,
                    estimatedEffort: 'low',
                    automatable: true
                });
            });
        }

        // From historical insights
        if (analysis.historicalInsights?.successfulFixes?.length > 0) {
            analysis.historicalInsights.successfulFixes.slice(0, 3).forEach(fix => {
                suggestions.push({
                    type: 'historical_fix',
                    priority: 'high',
                    confidence: 0.85, // High confidence dla proven fixes
                    description: fix.description || fix,
                    source: 'historical_data',
                    estimatedEffort: 'medium',
                    automatable: false
                });
            });
        }

        // CVPerfect-specific suggestions
        suggestions.push(...this.generateCVPerfectSpecificSuggestions(analysis));

        // Sort by confidence and priority
        return suggestions.sort((a, b) => {
            const priorityScore = { 'high': 3, 'medium': 2, 'low': 1 };
            if (priorityScore[b.priority] !== priorityScore[a.priority]) {
                return priorityScore[b.priority] - priorityScore[a.priority];
            }
            return b.confidence - a.confidence;
        });
    }

    // Generate CVPerfect-specific suggestions
    generateCVPerfectSpecificSuggestions(analysis) {
        const suggestions = [];

        // Session management suggestions
        suggestions.push({
            type: 'cvperfect_specific',
            priority: 'medium',
            confidence: 0.8,
            description: 'Add sessionStorage fallback for CV data persistence',
            implementation: 'Store CV data in sessionStorage before payment as backup',
            estimatedEffort: 'low',
            automatable: true
        });

        // Error handling suggestions  
        suggestions.push({
            type: 'cvperfect_specific',
            priority: 'medium',
            confidence: 0.75,
            description: 'Implement comprehensive error boundaries for payment flow',
            implementation: 'Add React ErrorBoundary components around payment and CV processing',
            estimatedEffort: 'medium',
            automatable: false
        });

        // Performance suggestions
        suggestions.push({
            type: 'cvperfect_specific',
            priority: 'low',
            confidence: 0.7,
            description: 'Add caching layer for AI optimization results',
            implementation: 'Cache AI optimization results to reduce API calls and improve UX',
            estimatedEffort: 'high',
            automatable: false
        });

        return suggestions;
    }

    // Estimate effort required dla fix
    estimateEffort(fixDescription) {
        const desc = fixDescription.toLowerCase();
        
        if (desc.includes('add') && (desc.includes('line') || desc.includes('check'))) return 'low';
        if (desc.includes('implement') || desc.includes('refactor')) return 'high';
        if (desc.includes('replace') || desc.includes('modify')) return 'medium';
        
        return 'medium'; // default
    }

    // Check if fix is automatable
    isAutomatable(fixDescription) {
        const desc = fixDescription.toLowerCase();
        
        // Simple additions/modifications are automatable
        if (desc.includes('add dependency array') || desc.includes('add key prop')) return true;
        if (desc.includes('replace') && desc.includes('with')) return true;
        
        // Complex logic changes are not automatable
        if (desc.includes('refactor') || desc.includes('redesign')) return false;
        if (desc.includes('implement') && desc.includes('new')) return false;
        
        return false; // default to manual
    }

    // Calculate overall confidence score
    calculateConfidence(analysis) {
        let totalScore = 0;
        let factors = 0;

        // Pattern match confidence
        if (analysis.patternMatches?.length > 0) {
            const avgPatternConfidence = analysis.patternMatches.reduce((sum, match) => sum + match.confidence, 0) / analysis.patternMatches.length;
            totalScore += avgPatternConfidence * 0.4;
            factors++;
        }

        // Code analysis confidence
        if (analysis.codeAnalysis?.issues?.length > 0) {
            const criticalIssues = analysis.codeAnalysis.issues.filter(issue => issue.severity === 'critical').length;
            const codeConfidence = criticalIssues > 0 ? 0.9 : 0.6;
            totalScore += codeConfidence * 0.3;
            factors++;
        }

        // Historical confidence
        if (analysis.historicalInsights?.similarCases?.length > 0) {
            const avgHistoricalConfidence = analysis.historicalInsights.similarCases.reduce((sum, case_) => sum + case_.confidence, 0) / analysis.historicalInsights.similarCases.length;
            totalScore += avgHistoricalConfidence * 0.3;
            factors++;
        }

        return factors > 0 ? totalScore / factors : 0.5; // Default moderate confidence
    }

    // Estimate fix time na podstawie suggestions
    estimateFixTime(suggestions) {
        const effortHours = {
            'low': 0.5,
            'medium': 2,
            'high': 8
        };

        let totalHours = 0;
        suggestions.slice(0, 5).forEach(suggestion => { // Top 5 suggestions
            totalHours += effortHours[suggestion.estimatedEffort] || 2;
        });

        return Math.round(totalHours * 10) / 10; // Round to 1 decimal
    }

    // Learn from debugging session outcome
    async learnFromOutcome(sessionId, successful, actualFix = null) {
        console.log('📖 Learning from debugging outcome...');

        const session = this.debuggingHistory.find(s => s.id === sessionId);
        if (!session) {
            console.warn('Session not found for learning:', sessionId);
            return;
        }

        session.successful = successful;
        session.actualFix = actualFix;
        session.learnedAt = new Date().toISOString();

        // Update pattern confidence based on outcome
        if (successful && session.analysis.patternMatches) {
            session.analysis.patternMatches.forEach(match => {
                if (this.patterns[match.pattern]) {
                    // Increase confidence for successful pattern
                    this.patterns[match.pattern].confidence = Math.min(
                        this.patterns[match.pattern].confidence + 0.05,
                        1.0
                    );
                }
            });
        }

        // Update learned patterns
        if (successful && actualFix) {
            const errorSignature = this.extractErrorText(session.errorContext);
            this.learnedPatterns.set(errorSignature, {
                fix: actualFix,
                confidence: 0.8,
                learned: new Date().toISOString()
            });
        }

        // Update success rate
        const successfulSessions = this.debuggingHistory.filter(s => s.successful === true).length;
        const totalCompletedSessions = this.debuggingHistory.filter(s => s.hasOwnProperty('successful')).length;
        this.fixSuccessRate = totalCompletedSessions > 0 ? successfulSessions / totalCompletedSessions : 0;

        console.log('✅ Learning completed. Success rate:', (this.fixSuccessRate * 100).toFixed(1) + '%');
    }

    // AUTOMATED FIX APPLICATION (advanced feature)
    async applyAutomatedFix(suggestion, sourceCode) {
        console.log('🤖 Attempting automated fix application...');

        if (!suggestion.automatable) {
            throw new Error('Suggestion is not marked as automatable');
        }

        let fixedCode = sourceCode;

        try {
            switch (suggestion.type) {
                case 'pattern_fix':
                    fixedCode = await this.applyPatternFix(suggestion, sourceCode);
                    break;
                
                case 'code_improvement':
                    fixedCode = await this.applyCodeImprovement(suggestion, sourceCode);
                    break;
                
                default:
                    throw new Error(`Automated fix not implemented for type: ${suggestion.type}`);
            }

            console.log('✅ Automated fix applied successfully');
            return {
                success: true,
                fixedCode: fixedCode,
                appliedFix: suggestion.description
            };

        } catch (error) {
            console.error('❌ Automated fix failed:', error);
            return {
                success: false,
                error: error.message,
                suggestion: 'Manual fix required'
            };
        }
    }

    // Apply pattern-based fix
    async applyPatternFix(suggestion, sourceCode) {
        console.log('🔧 Applying pattern fix:', suggestion.pattern);

        let fixedCode = sourceCode;

        if (suggestion.pattern === 'react_infinite_render') {
            // Add dependency array to useEffect
            fixedCode = fixedCode.replace(
                /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*\)/g,
                'useEffect(() => {$1}, [])'
            );
        }

        if (suggestion.pattern === 'cvperfect_infinite_retry') {
            // Add MAX_RETRIES check at function start
            fixedCode = fixedCode.replace(
                /(const fetchUserDataFromSession = async \(sessionId, retryCount = 0\) => \{)/,
                '$1\n    const MAX_RETRIES = 3;\n    if (retryCount >= MAX_RETRIES) {\n      console.log(\'🚫 Max retries exceeded\');\n      return { success: false, source: \'max_retries\' };\n    }'
            );
        }

        return fixedCode;
    }

    // Apply code improvement
    async applyCodeImprovement(suggestion, sourceCode) {
        console.log('📈 Applying code improvement:', suggestion.category);

        let fixedCode = sourceCode;

        if (suggestion.category === 'react_antipattern') {
            // Add missing key props
            if (suggestion.description.includes('key prop')) {
                fixedCode = fixedCode.replace(
                    /\.map\s*\(\s*\(([^)]+)\)\s*=>\s*(<[^>]+)>/g,
                    '.map(($1, index) => $2 key={index}>'
                );
            }
        }

        return fixedCode;
    }

    // Get comprehensive status and metrics
    getStatus() {
        return {
            name: this.name,
            id: this.id,
            status: this.status,
            aiModels: this.aiModels,
            totalSessions: this.debuggingHistory.length,
            successRate: (this.fixSuccessRate * 100).toFixed(1) + '%',
            learnedPatterns: this.learnedPatterns.size,
            patternDatabase: Object.keys(this.patterns).length,
            capabilities: [
                'AI Pattern Recognition',
                'Automated Fix Suggestions', 
                'Code Quality Analysis',
                'Historical Learning',
                'CVPerfect Context Understanding',
                'Automated Fix Application',
                'Confidence Scoring',
                'Performance Metrics'
            ],
            metrics: {
                avgConfidence: this.debuggingHistory.length > 0 ? 
                    (this.debuggingHistory.reduce((sum, s) => sum + s.confidence, 0) / this.debuggingHistory.length).toFixed(2) : 0,
                mostCommonPattern: this.getMostCommonPattern(),
                avgFixTime: this.debuggingHistory.length > 0 ?
                    (this.debuggingHistory.reduce((sum, s) => sum + s.estimatedFixTime, 0) / this.debuggingHistory.length).toFixed(1) + ' hours' : '0 hours'
            }
        };
    }

    // Get most common pattern z historical data
    getMostCommonPattern() {
        const patternCounts = {};
        
        this.debuggingHistory.forEach(session => {
            if (session.analysis.patternMatches) {
                session.analysis.patternMatches.forEach(match => {
                    patternCounts[match.pattern] = (patternCounts[match.pattern] || 0) + 1;
                });
            }
        });

        const mostCommon = Object.entries(patternCounts).sort(([,a], [,b]) => b - a)[0];
        return mostCommon ? `${mostCommon[0]} (${mostCommon[1]} times)` : 'None';
    }
}

module.exports = AIDebuggingCopilotMaster;

// Test jeśli uruchomiony bezpośrednio
if (require.main === module) {
    console.log('🤖 AI Debugging Copilot Master ready for intelligent debugging');
    
    // Example usage
    const aiCopilot = new AIDebuggingCopilotMaster();
    
    const testError = {
        error: {
            message: 'Maximum update depth exceeded. This can happen when useEffect infinitely calls setState.',
            stack: 'at fetchUserDataFromSession (success.js:234)'
        },
        description: 'Users report infinite loading after payment on success page',
        logs: ['fetchUserDataFromSession called repeatedly', 'browser becomes unresponsive'],
        context: 'CVPerfect payment flow completion'
    };
    
    // Test source code
    const testSourceCode = `
    useEffect(() => {
        if (sessionId) {
            fetchUserDataFromSession(sessionId);
        }
    });
    
    const fetchUserDataFromSession = async (sessionId, retryCount = 0) => {
        const response = await fetch('/api/get-session-data');
        if (!response.ok) {
            return await fetchUserDataFromSession(sessionId, retryCount + 1);
        }
    };
    `;
    
    // aiCopilot.performAIDebugging(testError, testSourceCode)
    //     .then(result => {
    //         console.log('AI Debugging Result:', result);
    //         console.log('Status:', aiCopilot.getStatus());
    //     })
    //     .catch(error => console.error('AI Debugging failed:', error));
}