#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-case-declarations */
/**
 * CVPerfect CLI Tools Integration Framework
 * Framework for integrating external CLI tools with Claude Code
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class CLIToolsManager {
    constructor() {
        this.toolsDir = path.join(process.cwd(), 'cli-tools');
        this.configFile = path.join(this.toolsDir, 'tools-config.json');
        this.ensureDirectories();
        this.loadConfig();
    }

    // Ensure tools directory exists
    ensureDirectories() {
        if (!fs.existsSync(this.toolsDir)) {
            fs.mkdirSync(this.toolsDir, { recursive: true });
        }
    }

    // Load tools configuration
    loadConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                this.config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
            } else {
                this.config = {
                    version: '1.0',
                    tools: {},
                    created: new Date().toISOString()
                };
                this.saveConfig();
            }
        } catch (error) {
            console.error('❌ Error loading config:', error.message);
            this.config = { version: '1.0', tools: {} };
        }
    }

    // Save tools configuration
    saveConfig() {
        try {
            fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('❌ Error saving config:', error.message);
        }
    }

    // Register a new CLI tool
    registerTool(name, config) {
        const toolConfig = {
            name: name,
            command: config.command,
            description: config.description,
            usage: config.usage || `${config.command} [options]`,
            examples: config.examples || [],
            options: config.options || {},
            category: config.category || 'general',
            version: config.version || '1.0',
            registered: new Date().toISOString(),
            ...config
        };

        this.config.tools[name] = toolConfig;
        this.saveConfig();

        console.log(`✅ Tool registered: ${name}`);
        return toolConfig;
    }

    // Execute a CLI tool
    async executeTool(toolName, args = [], options = {}) {
        const tool = this.config.tools[toolName];
        if (!tool) {
            throw new Error(`Tool '${toolName}' not found. Available tools: ${Object.keys(this.config.tools).join(', ')}`);
        }

        const command = tool.command;
        const fullCommand = `${command} ${args.join(' ')}`;
        
        console.log(`🔧 Executing: ${fullCommand}`);
        console.log(`📄 Description: ${tool.description}`);

        return new Promise((resolve, reject) => {
            const execOptions = {
                timeout: options.timeout || 30000,
                maxBuffer: 1024 * 1024 * 10, // 10MB
                cwd: options.cwd || process.cwd()
            };

            exec(fullCommand, execOptions, (error, stdout, stderr) => {
                if (error) {
                    reject({
                        error: error.message,
                        code: error.code,
                        stderr: stderr,
                        command: fullCommand
                    });
                } else {
                    resolve({
                        success: true,
                        stdout: stdout,
                        stderr: stderr,
                        command: fullCommand,
                        tool: toolName
                    });
                }
            });
        });
    }

    // List all registered tools
    listTools(category = null) {
        const tools = Object.values(this.config.tools);
        
        if (category) {
            return tools.filter(tool => tool.category === category);
        }
        
        return tools;
    }

    // Get tool information
    getToolInfo(toolName) {
        return this.config.tools[toolName] || null;
    }

    // Remove a tool
    removeTool(toolName) {
        if (this.config.tools[toolName]) {
            delete this.config.tools[toolName];
            this.saveConfig();
            console.log(`✅ Tool removed: ${toolName}`);
            return true;
        }
        return false;
    }

    // Check if command exists on system
    async checkCommand(command) {
        return new Promise((resolve) => {
            exec(`which ${command}`, (error) => {
                resolve(!error);
            });
        });
    }

    // Install example tools
    async installExampleTools() {
        console.log('📦 Installing example CLI tools for CVPerfect...');

        // CV Analyzer tool
        this.registerTool('cv-analyzer', {
            command: 'node cv-analyzer.js',
            description: 'Analyze CV files for ATS compatibility and quality scores',
            category: 'cv-processing',
            usage: 'cv-analyzer <cv-file> [options]',
            examples: [
                'cv-analyzer resume.pdf --format json',
                'cv-analyzer cv.docx --ats-check --keywords tech'
            ],
            options: {
                '--format': 'Output format (json, text, html)',
                '--ats-check': 'Run ATS compatibility check',
                '--keywords': 'Comma-separated keywords to check',
                '--score': 'Include quality score analysis'
            }
        });

        // Data Export tool
        this.registerTool('data-export', {
            command: 'node data-manager.js',
            description: 'Export CVPerfect data in various formats',
            category: 'data-management',
            usage: 'data-export <type> [options]',
            examples: [
                'data-export cv --format csv --date-range 30d',
                'data-export analytics --format json'
            ],
            options: {
                '--format': 'Export format (csv, json, xlsx)',
                '--date-range': 'Date range filter (7d, 30d, 90d)',
                '--output': 'Output file path'
            }
        });

        // Performance Audit tool
        this.registerTool('perf-audit', {
            command: 'node performance-audit.js',
            description: 'Run performance audit on CVPerfect website',
            category: 'performance',
            usage: 'perf-audit [url] [options]',
            examples: [
                'perf-audit http://localhost:3001 --mobile',
                'perf-audit --lighthouse --report html'
            ],
            options: {
                '--mobile': 'Run mobile performance test',
                '--lighthouse': 'Use Lighthouse for comprehensive audit',
                '--report': 'Report format (html, json, csv)'
            }
        });

        // Create example CV analyzer script
        await this.createCVAnalyzer();

        console.log('✅ Example tools installed successfully');
        console.log('\nAvailable tools:');
        this.listTools().forEach(tool => {
            console.log(`  • ${tool.name} - ${tool.description}`);
        });
    }

    // Create example CV analyzer script
    async createCVAnalyzer() {
        const analyzerScript = `#!/usr/bin/env node
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
            throw new Error(\`File not found: \${filePath}\`);
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
            return \`Sample CV content for analysis from \${filePath}\`;
        }
    }

    calculateATSScore(content) {
        let score = 50; // Base score
        
        // Check for common ATS-friendly elements
        if (content.includes('Experience') || content.includes('Work History')) score += 15;
        if (content.includes('Education')) score += 10;
        if (content.includes('Skills')) score += 15;
        if (content.includes('Email') || content.includes('@')) score += 5;
        if (content.includes('Phone') || /\\d{3}[-.\\s]?\\d{3}[-.\\s]?\\d{4}/.test(content)) score += 5;
        
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
        console.log(\`
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
        \`);
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
            console.log(\`CV Analysis Report for \${analysis.file}\`);
            console.log('=' + '='.repeat(30));
            console.log(\`ATS Score: \${analysis.ats_score}/100\`);
            console.log(\`Word Count: \${analysis.word_count}\`);
            console.log(\`Readability: \${analysis.readability.complexity}\`);
            console.log(\`Sections Found: \${analysis.sections.join(', ')}\`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

module.exports = CVAnalyzer;
`;

        const analyzerPath = path.join(process.cwd(), 'cv-analyzer.js');
        fs.writeFileSync(analyzerPath, analyzerScript);
        console.log(`✅ Created CV analyzer script: ${analyzerPath}`);
    }

    // Get usage statistics
    getStats() {
        const tools = Object.values(this.config.tools);
        const categories = [...new Set(tools.map(tool => tool.category))];
        
        return {
            total_tools: tools.length,
            categories: categories.map(category => ({
                name: category,
                count: tools.filter(tool => tool.category === category).length
            })),
            tools_by_category: categories.reduce((acc, category) => {
                acc[category] = tools.filter(tool => tool.category === category).map(tool => ({
                    name: tool.name,
                    description: tool.description
                }));
                return acc;
            }, {})
        };
    }
}

// Export for use as module
module.exports = CLIToolsManager;

// CLI interface
if (require.main === module) {
    const manager = new CLIToolsManager();
    
    const command = process.argv[2];
    const arg1 = process.argv[3];
    const args = process.argv.slice(4);
    
    switch (command) {
        case 'list':
            const tools = manager.listTools(arg1);
            console.log('Available CLI Tools:');
            tools.forEach(tool => {
                console.log(`  📧 ${tool.name} (${tool.category})`);
                console.log(`     ${tool.description}`);
                console.log(`     Usage: ${tool.usage}`);
                if (tool.examples.length > 0) {
                    console.log(`     Example: ${tool.examples[0]}`);
                }
                console.log('');
            });
            break;
            
        case 'run':
            if (!arg1) {
                console.error('❌ Tool name required');
                process.exit(1);
            }
            manager.executeTool(arg1, args)
                .then(result => {
                    console.log('✅ Tool execution completed');
                    console.log('Output:', result.stdout);
                    if (result.stderr) {
                        console.log('Errors:', result.stderr);
                    }
                })
                .catch(error => {
                    console.error('❌ Tool execution failed:', error.error);
                    if (error.stderr) {
                        console.error('Details:', error.stderr);
                    }
                    process.exit(1);
                });
            break;
            
        case 'info':
            if (!arg1) {
                console.error('❌ Tool name required');
                process.exit(1);
            }
            const toolInfo = manager.getToolInfo(arg1);
            if (toolInfo) {
                console.log(JSON.stringify(toolInfo, null, 2));
            } else {
                console.error(`❌ Tool '${arg1}' not found`);
                process.exit(1);
            }
            break;
            
        case 'install-examples':
            manager.installExampleTools()
                .then(() => {
                    console.log('✅ Example tools installation completed');
                })
                .catch(error => {
                    console.error('❌ Installation failed:', error.message);
                    process.exit(1);
                });
            break;
            
        case 'stats':
            console.log(JSON.stringify(manager.getStats(), null, 2));
            break;
            
        default:
            console.log(`
CVPerfect CLI Tools Manager

Usage:
  node cli-tools-manager.js <command> [options]

Commands:
  list [category]           - List all tools (optionally by category)
  run <tool> [args...]      - Execute a specific tool
  info <tool>              - Show detailed tool information
  install-examples         - Install example tools for CVPerfect
  stats                    - Show tools statistics

Examples:
  node cli-tools-manager.js list
  node cli-tools-manager.js run cv-analyzer resume.pdf --format json
  node cli-tools-manager.js info cv-analyzer
  node cli-tools-manager.js install-examples
            `);
    }
}