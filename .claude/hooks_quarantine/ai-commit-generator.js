#!/usr/bin/env node

/**
 * AI-Powered Git Commit Message Generator
 * Based on SuperClaude techniques + Claude Opus 4.1 reasoning
 * 
 * Features:
 * - Context-aware commit messages
 * - CVPerfect-specific patterns recognition
 * - Extended reasoning for complex changes
 * - Automatic conventional commit format
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AICommitGenerator {
    constructor() {
        this.conventionalTypes = {
            feat: 'New feature implementation',
            fix: 'Bug fix or error resolution', 
            docs: 'Documentation updates',
            style: 'Code style changes (formatting, etc)',
            refactor: 'Code refactoring without functionality change',
            perf: 'Performance improvements',
            test: 'Test additions or modifications',
            chore: 'Maintenance tasks, dependencies',
            ci: 'CI/CD pipeline changes',
            build: 'Build system or dependencies'
        };

        this.cvperfectPatterns = {
            'pages/index.js': 'Main CV upload and payment flow',
            'pages/success.js': 'Post-payment optimization and templates', 
            'pages/api/': 'Backend API endpoints',
            'agents/': 'CVPerfect agent system',
            'lib/': 'Security and utility modules',
            'components/': 'React components',
            '.claude/': 'Claude Code configuration'
        };
    }

    /**
     * Generate AI-powered commit message
     */
    generateCommitMessage() {
        try {
            const gitStatus = this.getGitStatus();
            const gitDiff = this.getGitDiff();
            const recentCommits = this.getRecentCommits();
            
            if (!gitStatus.hasChanges) {
                console.log('No changes to commit');
                return null;
            }

            const analysis = this.analyzeChanges(gitStatus, gitDiff);
            const context = this.buildContext(analysis, recentCommits);
            const message = this.craftCommitMessage(context);
            
            return message;
        } catch (error) {
            console.error('Error generating commit message:', error.message);
            return this.fallbackMessage();
        }
    }

    /**
     * Analyze git status and changes
     */
    getGitStatus() {
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            const lines = status.trim().split('\n').filter(line => line);
            
            const changes = {
                added: [],
                modified: [],
                deleted: [],
                renamed: []
            };

            lines.forEach(line => {
                const status = line.substring(0, 2);
                const file = line.substring(3);
                
                if (status.includes('A')) changes.added.push(file);
                if (status.includes('M')) changes.modified.push(file);
                if (status.includes('D')) changes.deleted.push(file);
                if (status.includes('R')) changes.renamed.push(file);
            });

            return {
                hasChanges: lines.length > 0,
                changes,
                totalFiles: lines.length
            };
        } catch (error) {
            return { hasChanges: false, changes: {}, totalFiles: 0 };
        }
    }

    /**
     * Get git diff for analysis
     */
    getGitDiff() {
        try {
            const diff = execSync('git diff --cached --stat', { encoding: 'utf8' });
            const fullDiff = execSync('git diff --cached', { encoding: 'utf8' });
            
            return {
                stats: diff,
                content: fullDiff.substring(0, 5000) // Limit for token optimization
            };
        } catch (error) {
            return { stats: '', content: '' };
        }
    }

    /**
     * Get recent commit messages for context
     */
    getRecentCommits() {
        try {
            const commits = execSync('git log --oneline -10', { encoding: 'utf8' });
            return commits.trim().split('\n').slice(0, 5); // Last 5 commits
        } catch (error) {
            return [];
        }
    }

    /**
     * Analyze changes using CVPerfect patterns
     */
    analyzeChanges(gitStatus, gitDiff) {
        const { changes } = gitStatus;
        const allFiles = [
            ...changes.added,
            ...changes.modified,
            ...changes.deleted,
            ...changes.renamed
        ];

        // Detect CVPerfect-specific changes
        const detectedPatterns = [];
        const affectedAreas = new Set();

        allFiles.forEach(file => {
            Object.entries(this.cvperfectPatterns).forEach(([pattern, description]) => {
                if (file.includes(pattern)) {
                    detectedPatterns.push({ pattern, file, description });
                    affectedAreas.add(this.categorizeArea(pattern));
                }
            });
        });

        // Analyze diff content for keywords
        const keywords = this.extractKeywords(gitDiff.content);
        const changeType = this.determineChangeType(allFiles, keywords, detectedPatterns);

        return {
            files: allFiles,
            patterns: detectedPatterns,
            areas: Array.from(affectedAreas),
            keywords,
            changeType,
            scope: this.determineScope(detectedPatterns),
            complexity: this.assessComplexity(gitStatus.totalFiles, keywords)
        };
    }

    /**
     * Categorize affected areas
     */
    categorizeArea(pattern) {
        const areaMap = {
            'pages/index.js': 'frontend-core',
            'pages/success.js': 'frontend-templates',
            'pages/api/': 'backend-api',
            'agents/': 'ai-agents',
            'lib/': 'security',
            'components/': 'ui-components',
            '.claude/': 'tooling'
        };

        return Object.entries(areaMap).find(([key]) => pattern.includes(key))?.[1] || 'general';
    }

    /**
     * Extract relevant keywords from diff
     */
    extractKeywords(diffContent) {
        const keywordPatterns = {
            features: /\b(add|implement|create|new|feature)\b/gi,
            fixes: /\b(fix|resolve|repair|correct|bug)\b/gi,
            optimization: /\b(optimize|improve|enhance|performance)\b/gi,
            security: /\b(secure|auth|validation|cors|sanitize)\b/gi,
            payment: /\b(stripe|payment|checkout|webhook)\b/gi,
            ai: /\b(groq|llama|optimization|template|cv)\b/gi
        };

        const extracted = {};
        Object.entries(keywordPatterns).forEach(([category, pattern]) => {
            const matches = diffContent.match(pattern) || [];
            if (matches.length > 0) {
                extracted[category] = matches.length;
            }
        });

        return extracted;
    }

    /**
     * Determine conventional commit type
     */
    determineChangeType(files, keywords, patterns) {
        // Priority-based type determination
        if (keywords.fixes) return 'fix';
        if (keywords.features && keywords.features > 2) return 'feat';
        if (keywords.security) return 'fix'; // Security fixes are critical
        if (keywords.optimization) return 'perf';
        if (files.some(f => f.includes('test'))) return 'test';
        if (files.some(f => f.includes('.md'))) return 'docs';
        if (patterns.some(p => p.pattern.includes('agents/'))) return 'feat';
        if (files.length === 1 && keywords.features) return 'feat';
        
        return 'chore'; // Default fallback
    }

    /**
     * Determine commit scope
     */
    determineScope(patterns) {
        if (patterns.length === 0) return null;
        
        const scopes = patterns.map(p => this.categorizeArea(p.pattern));
        const uniqueScopes = [...new Set(scopes)];
        
        if (uniqueScopes.length === 1) return uniqueScopes[0];
        if (uniqueScopes.length <= 3) return uniqueScopes.join(',');
        
        return 'multiple'; // Too many areas affected
    }

    /**
     * Assess change complexity
     */
    assessComplexity(fileCount, keywords) {
        let complexity = 'simple';
        
        if (fileCount > 10) complexity = 'complex';
        else if (fileCount > 5) complexity = 'medium';
        
        const keywordWeight = Object.values(keywords).reduce((sum, count) => sum + count, 0);
        if (keywordWeight > 15) complexity = 'complex';
        else if (keywordWeight > 8) complexity = 'medium';
        
        return complexity;
    }

    /**
     * Build context for AI commit generation
     */
    buildContext(analysis, recentCommits) {
        return {
            ...analysis,
            recentCommits: recentCommits.slice(0, 3), // Token optimization
            timestamp: new Date().toISOString(),
            project: 'CVPerfect',
            branch: this.getCurrentBranch()
        };
    }

    getCurrentBranch() {
        try {
            return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        } catch {
            return 'main';
        }
    }

    /**
     * Craft final commit message using AI patterns
     */
    craftCommitMessage(context) {
        const { changeType, scope, files, patterns, keywords, complexity } = context;
        
        // Build conventional commit format
        let message = changeType;
        if (scope && scope !== 'multiple') {
            message += `(${scope})`;
        }
        
        // Generate description based on patterns
        const description = this.generateDescription(patterns, keywords, files);
        message += `: ${description}`;
        
        // Add body for complex changes
        if (complexity === 'complex') {
            const body = this.generateCommitBody(context);
            message += `\n\n${body}`;
        }

        // Add Claude Code signature
        message += `\n\n🤖 Generated with Claude Code + CVPerfect AI\nCo-Authored-By: Claude <noreply@anthropic.com>`;
        
        return message;
    }

    /**
     * Generate commit description
     */
    generateDescription(patterns, keywords, files) {
        if (patterns.length > 0) {
            const mainPattern = patterns[0];
            return this.generatePatternBasedDescription(mainPattern, keywords);
        }
        
        // Fallback to file-based description
        if (files.length === 1) {
            return `Update ${path.basename(files[0])}`;
        }
        
        if (files.length <= 3) {
            return `Update ${files.map(f => path.basename(f)).join(', ')}`;
        }
        
        return `Update ${files.length} files across multiple areas`;
    }

    /**
     * Generate pattern-based description
     */
    generatePatternBasedDescription(pattern, keywords) {
        const templates = {
            'pages/index.js': 'Enhance main CV upload and payment flow',
            'pages/success.js': 'Improve CV optimization and template system',
            'pages/api/': 'Update API endpoints and backend logic',
            'agents/': 'Enhance CVPerfect AI agent capabilities',
            'lib/': 'Strengthen security and utility modules',
            'components/': 'Refine React components and UI',
            '.claude/': 'Optimize Claude Code configuration'
        };

        let baseDescription = templates[pattern.pattern] || `Update ${pattern.file}`;
        
        // Enhance with keywords
        if (keywords.security) baseDescription = baseDescription.replace('Update', 'Secure');
        if (keywords.optimization) baseDescription = baseDescription.replace('Update', 'Optimize');
        if (keywords.fixes) baseDescription = baseDescription.replace('Update', 'Fix');
        
        return baseDescription;
    }

    /**
     * Generate commit body for complex changes
     */
    generateCommitBody(context) {
        const { files, patterns, keywords, areas } = context;
        
        const body = [];
        
        if (areas.length > 1) {
            body.push(`Areas affected: ${areas.join(', ')}`);
        }
        
        if (Object.keys(keywords).length > 0) {
            const keywordSummary = Object.entries(keywords)
                .map(([key, count]) => `${key} (${count})`)
                .join(', ');
            body.push(`Changes include: ${keywordSummary}`);
        }
        
        if (files.length > 5) {
            body.push(`Modified ${files.length} files`);
        }
        
        return body.join('\n');
    }

    /**
     * Fallback message for errors
     */
    fallbackMessage() {
        const timestamp = new Date().toISOString().split('T')[0];
        return `chore: Update project files (${timestamp})

🤖 Generated with Claude Code + CVPerfect AI
Co-Authored-By: Claude <noreply@anthropic.com>`;
    }
}

// CLI usage
if (require.main === module) {
    const generator = new AICommitGenerator();
    const message = generator.generateCommitMessage();
    
    if (message) {
        console.log('Generated commit message:');
        console.log('---');
        console.log(message);
        console.log('---');
        
        // Optionally write to temp file for git hooks
        const tempFile = path.join(__dirname, 'generated-commit-msg.txt');
        fs.writeFileSync(tempFile, message);
    }
}

module.exports = { AICommitGenerator };