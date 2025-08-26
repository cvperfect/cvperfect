/**
 * ROOT CAUSE ANALYSIS MASTER AGENT
 * Mistrz analizy przyczyn błędów - wykorzystuje metodologię Five Whys i RCA
 * Inspirowany najnowszymi technikami 2024-2025 z badań nad debugowaniem
 */

class RootCauseAnalysisMaster {
    constructor() {
        this.name = 'Root Cause Analysis Master';
        this.id = 'rca_master_001';
        this.status = 'ready';
        this.methodology = 'Five Whys + Fishbone + FMEA';
        this.analysisResults = [];
        this.rootCauses = [];
        
        console.log('🔍 Root Cause Analysis Master initialized with advanced RCA methodologies');
    }

    // METODOLOGIA FIVE WHYS - Core technique dla software debugging
    async performFiveWhysAnalysis(problem, context = {}) {
        console.log('❓ Starting Five Whys Analysis for:', problem.description);
        
        const analysis = {
            problem: problem.description,
            timestamp: new Date().toISOString(),
            whys: [],
            rootCause: null,
            recommendations: []
        };

        let currentIssue = problem.description;
        let whyCount = 0;
        const MAX_WHYS = 5;

        try {
            // Iteracyjne zadawanie pytań "dlaczego?"
            while (whyCount < MAX_WHYS) {
                whyCount++;
                
                const why = await this.askWhy(currentIssue, whyCount, context);
                analysis.whys.push({
                    level: whyCount,
                    question: `Why #${whyCount}: ${currentIssue}`,
                    answer: why.answer,
                    evidence: why.evidence,
                    dataSource: why.dataSource
                });

                // Jeśli znaleźliśmy root cause, zatrzymaj
                if (why.isRootCause || whyCount === MAX_WHYS) {
                    analysis.rootCause = why.answer;
                    break;
                }

                currentIssue = why.answer;
            }

            // Wygeneruj rekomendacje na podstawie root cause
            analysis.recommendations = await this.generateRecommendations(analysis.rootCause, context);
            
            console.log('✅ Five Whys Analysis completed. Root cause:', analysis.rootCause);
            this.analysisResults.push(analysis);
            return analysis;

        } catch (error) {
            console.error('❌ Five Whys Analysis failed:', error);
            throw error;
        }
    }

    // Inteligentne zadawanie pytania "dlaczego?" z kontekstem software development
    async askWhy(issue, level, context) {
        console.log(`🤔 Why #${level}: ${issue}`);
        
        const patterns = {
            // CVPerfect-specific patterns
            'infinite loop': {
                answers: [
                    'Function calls itself without proper exit condition',
                    'Recursive call lacks termination logic',
                    'State dependency causes continuous re-execution',
                    'Missing timeout or retry limit',
                    'Hoisting issue with function reference'
                ],
                evidence: ['console.logs show repeated calls', 'browser freezes', 'memory spike'],
                rootCauseIndicators: ['missing MAX_RETRIES', 'no timeout', 'wrong function reference']
            },
            
            'session data not loading': {
                answers: [
                    'API endpoint returns empty response',
                    'Session ID is invalid or expired',
                    'Database connection timeout',
                    'Authentication middleware blocking request',
                    'Race condition between requests'
                ],
                evidence: ['404 errors', 'empty response body', 'network timeouts'],
                rootCauseIndicators: ['session cleanup too aggressive', 'auth token expired']
            },

            'payment flow broken': {
                answers: [
                    'Stripe webhook not receiving events',
                    'Session metadata not properly saved',
                    'CORS issues blocking API calls',
                    'Environment variables misconfigured',
                    'Webhook secret mismatch'
                ],
                evidence: ['failed webhook deliveries', 'stripe logs show errors', 'CORS preflight fails'],
                rootCauseIndicators: ['webhook URL wrong', 'environment mismatch']
            },

            'memory leak': {
                answers: [
                    'Event listeners not cleaned up',
                    'Timers/intervals not cleared',
                    'React components not unmounted properly',
                    'Global variables accumulating data',
                    'Circular references preventing garbage collection'
                ],
                evidence: ['memory usage grows over time', 'performance degrades', 'browser slows'],
                rootCauseIndicators: ['missing cleanup functions', 'useEffect without return']
            }
        };

        // Znajdź najlepszy pattern match
        const matchingPattern = this.findPatternMatch(issue, patterns);
        
        if (matchingPattern) {
            const pattern = patterns[matchingPattern];
            const answer = pattern.answers[Math.min(level - 1, pattern.answers.length - 1)];
            
            return {
                answer: answer,
                evidence: pattern.evidence,
                dataSource: `pattern_match_${matchingPattern}`,
                isRootCause: pattern.rootCauseIndicators.some(indicator => 
                    answer.toLowerCase().includes(indicator)
                )
            };
        }

        // Fallback do generic software debugging
        return this.genericWhyAnalysis(issue, level, context);
    }

    // Generic software debugging analysis gdy nie ma specific pattern
    async genericWhyAnalysis(issue, level, context) {
        const genericPatterns = {
            1: 'Code execution path leads to unexpected behavior',
            2: 'Logic error in conditional statements or loops', 
            3: 'Incorrect assumptions about data structure or state',
            4: 'Missing error handling or validation',
            5: 'Inadequate testing or code review process'
        };

        return {
            answer: genericPatterns[level] || 'Root cause requires deeper investigation',
            evidence: ['code analysis needed', 'logs review required'],
            dataSource: 'generic_pattern',
            isRootCause: level >= 4
        };
    }

    // Znajdź najlepszy pattern match używając keywords
    findPatternMatch(issue, patterns) {
        const issueLower = issue.toLowerCase();
        
        for (const [pattern, data] of Object.entries(patterns)) {
            const keywords = pattern.split(' ');
            if (keywords.some(keyword => issueLower.includes(keyword))) {
                return pattern;
            }
        }
        
        return null;
    }

    // Generuj actionable recommendations na podstawie root cause
    async generateRecommendations(rootCause, context) {
        const recommendations = [];

        if (!rootCause) {
            return ['Further investigation required to identify root cause'];
        }

        // CVPerfect-specific recommendations
        const rootCauseLower = rootCause.toLowerCase();

        if (rootCauseLower.includes('retry') || rootCauseLower.includes('recursion')) {
            recommendations.push(
                'Implement MAX_RETRIES constant with proper bounds checking',
                'Add timeout protection using Promise.race pattern',
                'Include exponential backoff for retry logic',
                'Add explicit exit conditions at function start'
            );
        }

        if (rootCauseLower.includes('cleanup') || rootCauseLower.includes('memory')) {
            recommendations.push(
                'Add cleanup function to useEffect hooks',
                'Clear all timers and intervals on component unmount',
                'Remove event listeners in cleanup phase',
                'Implement proper dependency arrays for hooks'
            );
        }

        if (rootCauseLower.includes('session') || rootCauseLower.includes('data')) {
            recommendations.push(
                'Add session data validation before processing',
                'Implement fallback data sources (sessionStorage, localStorage)',
                'Add proper error states for missing data',
                'Include retry logic with different endpoints'
            );
        }

        if (rootCauseLower.includes('webhook') || rootCauseLower.includes('stripe')) {
            recommendations.push(
                'Verify webhook endpoint URL configuration',
                'Check webhook secret in environment variables',
                'Add webhook event logging for debugging',
                'Implement webhook retry mechanism'
            );
        }

        // Generic software engineering recommendations
        if (recommendations.length === 0) {
            recommendations.push(
                'Add comprehensive error handling and logging',
                'Implement input validation and sanitization', 
                'Add unit tests covering edge cases',
                'Review code for race conditions and timing issues',
                'Add monitoring and alerting for this issue type'
            );
        }

        return recommendations;
    }

    // FISHBONE DIAGRAM ANALYSIS - dla complex problems
    async performFishboneAnalysis(problem, categories = ['People', 'Process', 'Technology', 'Environment']) {
        console.log('🐟 Performing Fishbone (Ishikawa) Analysis for:', problem.description);

        const fishbone = {
            problem: problem.description,
            timestamp: new Date().toISOString(),
            categories: {},
            potentialCauses: [],
            primaryCauses: []
        };

        // Analyze each category
        for (const category of categories) {
            fishbone.categories[category] = await this.analyzeFishboneCategory(problem, category);
        }

        // Identify primary causes
        fishbone.primaryCauses = this.identifyPrimaryCauses(fishbone.categories);

        console.log('✅ Fishbone Analysis completed. Primary causes:', fishbone.primaryCauses.length);
        return fishbone;
    }

    // Analyze specific category w fishbone
    async analyzeFishboneCategory(problem, category) {
        const categoryAnalysis = {
            name: category,
            causes: [],
            impact: 'low'
        };

        switch (category.toLowerCase()) {
            case 'people':
                categoryAnalysis.causes = [
                    'Developer experience level with React hooks',
                    'Code review process quality',
                    'Understanding of session management',
                    'Knowledge of Stripe integration patterns'
                ];
                break;

            case 'process':
                categoryAnalysis.causes = [
                    'Testing procedures for payment flow',
                    'Deployment and rollback procedures', 
                    'Code quality gates and standards',
                    'Error monitoring and alerting setup'
                ];
                break;

            case 'technology':
                categoryAnalysis.causes = [
                    'Next.js version compatibility issues',
                    'React strict mode side effects',
                    'Stripe SDK version conflicts',
                    'Browser compatibility problems'
                ];
                break;

            case 'environment':
                categoryAnalysis.causes = [
                    'Production vs development environment differences',
                    'Environment variable configuration',
                    'Network latency and timeout settings',
                    'Database connection pool settings'
                ];
                break;
        }

        return categoryAnalysis;
    }

    // Identify primary causes z fishbone analysis
    identifyPrimaryCauses(categories) {
        const primaryCauses = [];

        for (const [categoryName, category] of Object.entries(categories)) {
            // Score causes based on likelihood and impact
            category.causes.forEach(cause => {
                const score = this.scoreCause(cause, categoryName);
                if (score > 0.7) {
                    primaryCauses.push({
                        cause: cause,
                        category: categoryName,
                        score: score
                    });
                }
            });
        }

        return primaryCauses.sort((a, b) => b.score - a.score);
    }

    // Score individual cause based na likelihood and CVPerfect context
    scoreCause(cause, category) {
        const causeLower = cause.toLowerCase();
        let score = 0.5; // baseline

        // CVPerfect-specific scoring
        if (causeLower.includes('session') || causeLower.includes('payment')) score += 0.3;
        if (causeLower.includes('react') || causeLower.includes('hook')) score += 0.2;
        if (causeLower.includes('testing') || causeLower.includes('review')) score += 0.1;
        if (causeLower.includes('environment') || causeLower.includes('config')) score += 0.25;

        return Math.min(score, 1.0);
    }

    // FAILURE MODE AND EFFECTS ANALYSIS (FMEA) - proactive risk assessment
    async performFMEAAnalysis(system, components) {
        console.log('⚠️ Performing FMEA Analysis for system:', system);

        const fmea = {
            system: system,
            timestamp: new Date().toISOString(),
            components: [],
            highRiskModes: [],
            recommendations: []
        };

        // Analyze each component
        for (const component of components) {
            const componentAnalysis = await this.analyzeFMEAComponent(component);
            fmea.components.push(componentAnalysis);

            // Identify high-risk failure modes (RPN > 100)
            componentAnalysis.failureModes.forEach(mode => {
                if (mode.rpn > 100) {
                    fmea.highRiskModes.push({
                        component: component.name,
                        failureMode: mode,
                        priority: mode.rpn > 200 ? 'critical' : 'high'
                    });
                }
            });
        }

        // Generate system-wide recommendations
        fmea.recommendations = this.generateFMEARecommendations(fmea.highRiskModes);

        console.log('✅ FMEA Analysis completed. High-risk modes:', fmea.highRiskModes.length);
        return fmea;
    }

    // Analyze component dla FMEA
    async analyzeFMEAComponent(component) {
        const analysis = {
            name: component.name,
            function: component.function,
            failureModes: []
        };

        // Define common failure modes dla CVPerfect components
        const commonFailureModes = {
            'Payment Processing': [
                {
                    mode: 'Stripe webhook timeout',
                    effects: 'Payment confirmed but user not redirected',
                    severity: 8,
                    occurrence: 3,
                    detection: 6,
                    rpn: 144
                },
                {
                    mode: 'Session data loss during payment',
                    effects: 'User pays but CV data missing',
                    severity: 9,
                    occurrence: 2,
                    detection: 4,
                    rpn: 72
                }
            ],

            'CV Processing': [
                {
                    mode: 'AI API rate limit exceeded',
                    effects: 'CV optimization fails silently',
                    severity: 7,
                    occurrence: 4,
                    detection: 5,
                    rpn: 140
                },
                {
                    mode: 'Large file processing timeout',
                    effects: 'User upload fails without clear error',
                    severity: 6,
                    occurrence: 5,
                    detection: 7,
                    rpn: 210
                }
            ],

            'Session Management': [
                {
                    mode: 'Session cleanup too aggressive',
                    effects: 'Active user sessions terminated early',
                    severity: 8,
                    occurrence: 3,
                    detection: 4,
                    rpn: 96
                },
                {
                    mode: 'Infinite retry loop',
                    effects: 'Browser freezes, poor user experience',
                    severity: 9,
                    occurrence: 2,
                    detection: 3,
                    rpn: 54
                }
            ]
        };

        analysis.failureModes = commonFailureModes[component.name] || [];
        return analysis;
    }

    // Generate recommendations z FMEA analysis
    generateFMEARecommendations(highRiskModes) {
        const recommendations = [];

        highRiskModes.forEach(riskMode => {
            const mode = riskMode.failureMode;
            
            if (mode.mode.includes('timeout')) {
                recommendations.push({
                    type: 'preventive',
                    priority: riskMode.priority,
                    action: 'Implement timeout monitoring and graceful degradation',
                    component: riskMode.component
                });
            }

            if (mode.mode.includes('retry') || mode.mode.includes('infinite')) {
                recommendations.push({
                    type: 'corrective',
                    priority: riskMode.priority,
                    action: 'Add circuit breaker pattern and retry limits',
                    component: riskMode.component
                });
            }

            if (mode.mode.includes('session') || mode.mode.includes('data')) {
                recommendations.push({
                    type: 'detective',
                    priority: riskMode.priority,
                    action: 'Enhance logging and add data validation checkpoints',
                    component: riskMode.component
                });
            }
        });

        return recommendations;
    }

    // Master method - comprehensive RCA analysis
    async performComprehensiveRCA(problem, context = {}) {
        console.log('🎯 Starting Comprehensive Root Cause Analysis...');

        const comprehensiveAnalysis = {
            problem: problem,
            timestamp: new Date().toISOString(),
            methodologies: {},
            consolidatedRootCauses: [],
            prioritizedRecommendations: [],
            confidence: 0
        };

        try {
            // 1. Five Whys Analysis
            comprehensiveAnalysis.methodologies.fiveWhys = 
                await this.performFiveWhysAnalysis(problem, context);

            // 2. Fishbone Analysis
            comprehensiveAnalysis.methodologies.fishbone = 
                await this.performFishboneAnalysis(problem);

            // 3. FMEA Analysis (if components provided)
            if (context.components) {
                comprehensiveAnalysis.methodologies.fmea = 
                    await this.performFMEAAnalysis(problem.system || 'CVPerfect', context.components);
            }

            // 4. Consolidate findings
            comprehensiveAnalysis.consolidatedRootCauses = 
                this.consolidateRootCauses(comprehensiveAnalysis.methodologies);

            // 5. Prioritize recommendations
            comprehensiveAnalysis.prioritizedRecommendations = 
                this.prioritizeRecommendations(comprehensiveAnalysis.methodologies);

            // 6. Calculate confidence score
            comprehensiveAnalysis.confidence = 
                this.calculateConfidenceScore(comprehensiveAnalysis.methodologies);

            console.log('✅ Comprehensive RCA completed with confidence:', comprehensiveAnalysis.confidence);
            return comprehensiveAnalysis;

        } catch (error) {
            console.error('❌ Comprehensive RCA failed:', error);
            throw error;
        }
    }

    // Consolidate root causes z multiple methodologies
    consolidateRootCauses(methodologies) {
        const rootCauses = [];

        // From Five Whys
        if (methodologies.fiveWhys?.rootCause) {
            rootCauses.push({
                source: 'Five Whys',
                cause: methodologies.fiveWhys.rootCause,
                confidence: 0.8
            });
        }

        // From Fishbone
        if (methodologies.fishbone?.primaryCauses) {
            methodologies.fishbone.primaryCauses.slice(0, 3).forEach(primaryCause => {
                rootCauses.push({
                    source: 'Fishbone',
                    cause: primaryCause.cause,
                    confidence: primaryCause.score
                });
            });
        }

        // From FMEA
        if (methodologies.fmea?.highRiskModes) {
            methodologies.fmea.highRiskModes.slice(0, 2).forEach(riskMode => {
                rootCauses.push({
                    source: 'FMEA',
                    cause: riskMode.failureMode.mode,
                    confidence: riskMode.failureMode.rpn / 300 // normalize RPN to 0-1
                });
            });
        }

        return rootCauses.sort((a, b) => b.confidence - a.confidence);
    }

    // Prioritize recommendations z multiple sources
    prioritizeRecommendations(methodologies) {
        const allRecommendations = [];

        // From Five Whys
        if (methodologies.fiveWhys?.recommendations) {
            methodologies.fiveWhys.recommendations.forEach(rec => {
                allRecommendations.push({
                    source: 'Five Whys',
                    action: rec,
                    priority: 'high',
                    effort: 'medium'
                });
            });
        }

        // From FMEA
        if (methodologies.fmea?.recommendations) {
            methodologies.fmea.recommendations.forEach(rec => {
                allRecommendations.push({
                    source: 'FMEA',
                    action: rec.action,
                    priority: rec.priority,
                    effort: rec.type === 'preventive' ? 'high' : 'medium'
                });
            });
        }

        // Deduplicate and prioritize
        return this.deduplicateAndPrioritize(allRecommendations);
    }

    // Deduplicate recommendations and prioritize
    deduplicateAndPrioritize(recommendations) {
        const unique = [];
        const seen = new Set();

        recommendations.forEach(rec => {
            const key = rec.action.toLowerCase().substring(0, 50);
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(rec);
            }
        });

        return unique.sort((a, b) => {
            const priorityScore = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            return priorityScore[b.priority] - priorityScore[a.priority];
        });
    }

    // Calculate confidence score na podstawie methodology agreement
    calculateConfidenceScore(methodologies) {
        let totalScore = 0;
        let methodologyCount = 0;

        if (methodologies.fiveWhys) {
            totalScore += 0.8; // Five Whys baseline confidence
            methodologyCount++;
        }

        if (methodologies.fishbone) {
            const avgPrimaryScore = methodologies.fishbone.primaryCauses
                .reduce((sum, cause) => sum + cause.score, 0) / methodologies.fishbone.primaryCauses.length;
            totalScore += avgPrimaryScore;
            methodologyCount++;
        }

        if (methodologies.fmea) {
            const highRiskRatio = methodologies.fmea.highRiskModes.length / methodologies.fmea.components.length;
            totalScore += Math.min(highRiskRatio * 1.5, 1.0); // Cap at 1.0
            methodologyCount++;
        }

        return methodologyCount > 0 ? (totalScore / methodologyCount) : 0;
    }

    // Get status and metrics
    getStatus() {
        return {
            name: this.name,
            id: this.id,
            status: this.status,
            methodology: this.methodology,
            totalAnalyses: this.analysisResults.length,
            rootCausesIdentified: this.rootCauses.length,
            capabilities: [
                'Five Whys Analysis',
                'Fishbone (Ishikawa) Diagram',
                'Failure Mode and Effects Analysis (FMEA)',
                'Comprehensive RCA Integration',
                'Software-specific Pattern Recognition',
                'CVPerfect Context Understanding'
            ]
        };
    }
}

module.exports = RootCauseAnalysisMaster;

// Test jeśli uruchomiony bezpośrednio
if (require.main === module) {
    console.log('🔍 Root Cause Analysis Master ready for comprehensive debugging');
    
    // Example usage
    const rcaMaster = new RootCauseAnalysisMaster();
    
    const testProblem = {
        description: 'Users report that success page shows infinite loading after payment',
        system: 'CVPerfect',
        severity: 'critical'
    };
    
    const testContext = {
        components: [
            { name: 'Payment Processing', function: 'Handle Stripe payments and redirect' },
            { name: 'Session Management', function: 'Store and retrieve user session data' },
            { name: 'CV Processing', function: 'Process and optimize CV content' }
        ],
        environment: 'production',
        lastWorking: '2024-08-20',
        affectedUsers: 15
    };
    
    // rcaMaster.performComprehensiveRCA(testProblem, testContext)
    //     .then(analysis => console.log('Test RCA completed:', analysis))
    //     .catch(error => console.error('Test RCA failed:', error));
}