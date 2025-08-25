#!/usr/bin/env node
/**
 * CV Analyzer Tool - Example CLI tool for CVPerfect
 * Analyzes CV files for ATS compatibility and quality
 */

const fs = require('fs');
const path = require('path');

class CVAnalyzer {
    constructor() {
        this.keywords = {
            tech: ['javascript', 'react', 'node.js', 'python', 'sql', 'git'],
            management: ['leadership', 'team', 'project', 'strategy', 'planning'],
            business: ['sales', 'marketing', 'customer', 'revenue', 'growth']
        };
    }

    analyze(filePath, options = {}) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const content = this.extractText(filePath);
        const analysis = {
            file: path.basename(filePath),
            timestamp: new Date().toISOString(),
            content_length: content.length,
            word_count: content.split(' ').length,
            ats_score: this.calculateATSScore(content),
            keyword_density: this.analyzeKeywords(content, options.keywords),
            readability: this.calculateReadability(content),
            sections: this.identifySections(content)
        };

        return analysis;
    }

    extractText(filePath) {
        // Simple text extraction (in real implementation would handle PDF/DOCX)
        if (filePath.endsWith('.txt')) {
            return fs.readFileSync(filePath, 'utf8');
        } else {
            return `Sample CV content for analysis from ${filePath}`;
        }
    }

    calculateATSScore(content) {
        let score = 50; // Base score
        
        // Check for common ATS-friendly elements
        if (content.includes('Experience') || content.includes('Work History')) score += 15;
        if (content.includes('Education')) score += 10;
        if (content.includes('Skills')) score += 15;
        if (content.includes('Email') || content.includes('@')) score += 5;
        if (content.includes('Phone') || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(content)) score += 5;
        
        return Math.min(score, 100);
    }

    analyzeKeywords(content, keywordCategory = 'tech') {
        const keywords = this.keywords[keywordCategory] || this.keywords.tech;
        const contentLower = content.toLowerCase();
        
        return keywords.map(keyword => ({
            keyword: keyword,
            count: (contentLower.match(new RegExp(keyword, 'g')) || []).length,
            density: ((contentLower.match(new RegExp(keyword, 'g')) || []).length / content.split(' ').length * 100).toFixed(2) + '%'
        }));
    }

    calculateReadability(content) {
        const sentences = content.split(/[.!?]+/).length - 1;
        const words = content.split(' ').length;
        const avgWordsPerSentence = words / sentences;
        
        return {
            sentences: sentences,
            words: words,
            avg_words_per_sentence: avgWordsPerSentence.toFixed(1),
            complexity: avgWordsPerSentence > 20 ? 'High' : avgWordsPerSentence > 15 ? 'Medium' : 'Low'
        };
    }

    identifySections(content) {
        const sections = [];
        const sectionPatterns = [
            'Summary', 'Objective', 'Experience', 'Work History', 'Employment',
            'Education', 'Skills', 'Certifications', 'Projects', 'Languages'
        ];
        
        sectionPatterns.forEach(pattern => {
            if (new RegExp(pattern, 'i').test(content)) {
                sections.push(pattern);
            }
        });
        
        return sections;
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const filePath = args[0];
    
    if (!filePath) {
        console.log(`
CV Analyzer Tool

Usage: cv-analyzer <cv-file> [options]

Options:
  --format <format>    Output format (json, text) [default: json]
  --keywords <type>    Keyword category (tech, management, business) [default: tech]
  --ats-check         Include ATS compatibility check
  --help              Show this help message

Examples:
  cv-analyzer resume.pdf --format json
  cv-analyzer cv.txt --keywords management --ats-check
        `);
        process.exit(0);
    }

    try {
        const analyzer = new CVAnalyzer();
        const options = {
            keywords: args.includes('--keywords') ? args[args.indexOf('--keywords') + 1] : 'tech',
            format: args.includes('--format') ? args[args.indexOf('--format') + 1] : 'json'
        };
        
        const analysis = analyzer.analyze(filePath, options);
        
        if (options.format === 'json') {
            console.log(JSON.stringify(analysis, null, 2));
        } else {
            console.log(`CV Analysis Report for ${analysis.file}`);
            console.log('=' + '='.repeat(30));
            console.log(`ATS Score: ${analysis.ats_score}/100`);
            console.log(`Word Count: ${analysis.word_count}`);
            console.log(`Readability: ${analysis.readability.complexity}`);
            console.log(`Sections Found: ${analysis.sections.join(', ')}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

module.exports = CVAnalyzer;
