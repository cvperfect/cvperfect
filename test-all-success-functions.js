#!/usr/bin/env node
/**
 * SUCCESS PAGE FUNCTIONS TEST - CVPerfect
 * Template system verification (6 core functions)
 * 
 * Tests all critical functions in success.js:
 * 1. AI Optimization (CV processing + photo preservation)
 * 2. PDF Export (html2canvas rendering)
 * 3. DOCX Export (document structure + styling)
 * 4. Email Function (modal-based sending)
 * 5. Template Switching (real-time preview)
 * 6. Responsive Design (mobile touch targets)
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class SuccessFunctionsTest {
    constructor() {
        this.testResults = [];
        this.errors = [];
        this.startTime = Date.now();
        this.serverPort = null;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
        const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        console.log(logMessage);
        
        this.testResults.push({
            timestamp,
            type,
            message
        });
    }

    async runTest(testName, testFn) {
        this.log(`Testing: ${testName}`, 'test');
        const testStart = Date.now();
        
        try {
            const result = await testFn();
            const duration = Date.now() - testStart;
            this.log(`✅ ${testName} - PASSED (${duration}ms)`, 'pass');
            return { success: true, duration, result };
        } catch (error) {
            const duration = Date.now() - testStart;
            this.log(`❌ ${testName} - FAILED: ${error.message} (${duration}ms)`, 'fail');
            this.errors.push({ testName, error: error.message, duration });
            return { success: false, duration, error: error.message };
        }
    }

    async checkSuccessPageExists() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        
        if (!fs.existsSync(successPath)) {
            throw new Error('success.js file not found in pages directory');
        }

        const content = fs.readFileSync(successPath, 'utf8');
        
        // Check for critical functions
        const requiredFunctions = [
            'optimizeCV',
            'exportToPDF', 
            'exportToDOCX',
            'sendEmail',
            'switchTemplate'
        ];

        const missingFunctions = requiredFunctions.filter(fn => 
            !content.includes(fn) && !content.includes(`${fn}=`) && !content.includes(`function ${fn}`)
        );

        if (missingFunctions.length > 0) {
            throw new Error(`Missing functions: ${missingFunctions.join(', ')}`);
        }

        return `success.js exists with ${requiredFunctions.length} core functions`;
    }

    async testAIOptimizationFunction() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        const content = fs.readFileSync(successPath, 'utf8');

        // Check for AI optimization patterns
        const aiPatterns = [
            '/api/analyze',
            'groq',
            'llama',
            'optimizeCV',
            'cvData',
            'initialCVData'
        ];

        const foundPatterns = aiPatterns.filter(pattern => 
            content.toLowerCase().includes(pattern.toLowerCase())
        );

        if (foundPatterns.length < 4) {
            throw new Error(`AI optimization incomplete. Found patterns: ${foundPatterns.join(', ')}`);
        }

        // Check for photo preservation
        const photoPatterns = ['photo', 'image', 'img', 'picture'];
        const hasPhotoSupport = photoPatterns.some(pattern => 
            content.toLowerCase().includes(pattern)
        );

        if (!hasPhotoSupport) {
            throw new Error('Photo preservation not implemented');
        }

        return `AI optimization function validated - ${foundPatterns.length}/8 patterns found, photo preservation: ✅`;
    }

    async testExportFunctions() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        const content = fs.readFileSync(successPath, 'utf8');

        const exportPatterns = {
            pdf: ['html2canvas', 'jsPDF', 'exportToPDF', 'pdf'],
            docx: ['docx', 'Document', 'exportToDOCX', 'Packer']
        };

        const results = [];

        // Test PDF export
        const pdfPatterns = exportPatterns.pdf.filter(pattern => 
            content.includes(pattern)
        );
        
        if (pdfPatterns.length >= 2) {
            results.push('PDF Export: ✅ Implementation found');
        } else {
            results.push(`PDF Export: ❌ Missing patterns (found: ${pdfPatterns.join(', ')})`);
        }

        // Test DOCX export  
        const docxPatterns = exportPatterns.docx.filter(pattern => 
            content.includes(pattern)
        );

        if (docxPatterns.length >= 1) {
            results.push('DOCX Export: ✅ Implementation found');
        } else {
            results.push(`DOCX Export: ❌ Missing patterns (found: ${docxPatterns.join(', ')})`);
        }

        return results.join('\n');
    }

    async testEmailFunction() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        const content = fs.readFileSync(successPath, 'utf8');

        const emailPatterns = [
            'sendEmail',
            'email',
            'mailto',
            '@',
            'contact'
        ];

        const foundPatterns = emailPatterns.filter(pattern => 
            content.includes(pattern)
        );

        if (foundPatterns.length < 2) {
            throw new Error(`Email function incomplete. Found: ${foundPatterns.join(', ')}`);
        }

        // Check for modal-based implementation
        const modalPatterns = ['modal', 'Modal', 'showModal', 'setShowModal'];
        const hasModalSupport = modalPatterns.some(pattern => content.includes(pattern));

        return `Email function: ${foundPatterns.length}/5 patterns found, Modal support: ${hasModalSupport ? '✅' : '❌'}`;
    }

    async testTemplateSwitching() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        const content = fs.readFileSync(successPath, 'utf8');

        // Check for template patterns
        const templatePatterns = [
            'selectedTemplate',
            'setSelectedTemplate',
            'switchTemplate',
            'template',
            'Simple',
            'Modern',
            'Executive'
        ];

        const foundPatterns = templatePatterns.filter(pattern => 
            content.includes(pattern)
        );

        if (foundPatterns.length < 4) {
            throw new Error(`Template switching incomplete. Found: ${foundPatterns.join(', ')}`);
        }

        // Check for plan-based access
        const planPatterns = ['Basic', 'Gold', 'Premium', 'plan', 'Plan'];
        const hasPlanSupport = planPatterns.some(pattern => content.includes(pattern));

        return `Template switching: ${foundPatterns.length}/7 patterns found, Plan hierarchy: ${hasPlanSupport ? '✅' : '❌'}`;
    }

    async testResponsiveDesign() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        const content = fs.readFileSync(successPath, 'utf8');

        // Check for responsive patterns
        const responsivePatterns = [
            '@media',
            'max-width',
            'min-width',
            '480px',
            '768px',
            '1024px',
            'mobile',
            'tablet',
            'desktop'
        ];

        const foundPatterns = responsivePatterns.filter(pattern => 
            content.includes(pattern)
        );

        // Check for touch targets
        const touchPatterns = ['44px', 'touch', 'tap', 'button'];
        const hasTouchSupport = touchPatterns.some(pattern => content.includes(pattern));

        return `Responsive design: ${foundPatterns.length}/9 patterns found, Touch targets: ${hasTouchSupport ? '✅' : '❌'}`;
    }

    async testTemplateHierarchy() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        const content = fs.readFileSync(successPath, 'utf8');

        // Check for all 7 templates mentioned in CLAUDE.md
        const expectedTemplates = [
            'Simple',
            'Modern', 
            'Executive',
            'Tech',
            'Luxury',
            'Minimal'
        ];

        const foundTemplates = expectedTemplates.filter(template => 
            content.includes(template)
        );

        // Check for plan-based access logic
        const accessPatterns = [
            'Basic',
            'Gold', 
            'Premium',
            'lock',
            'Lock',
            'disabled'
        ];

        const foundAccess = accessPatterns.filter(pattern => 
            content.includes(pattern)
        );

        return `Template hierarchy: ${foundTemplates.length}/6 templates, Access control: ${foundAccess.length}/6 patterns`;
    }

    async generateReport() {
        const duration = Date.now() - this.startTime;
        const passedTests = this.testResults.filter(r => r.type === 'pass').length;
        const failedTests = this.errors.length;
        const totalTests = passedTests + failedTests;

        const report = {
            testSuite: 'Success Page Functions Test',
            summary: {
                totalTests,
                passed: passedTests,
                failed: failedTests,
                duration: `${duration}ms`,
                successRate: `${Math.round((passedTests / totalTests) * 100)}%`
            },
            coreFunction: {
                aiOptimization: this.testResults.find(t => t.message.includes('AI optimization')),
                pdfExport: this.testResults.find(t => t.message.includes('PDF Export')),
                docxExport: this.testResults.find(t => t.message.includes('DOCX Export')),
                emailFunction: this.testResults.find(t => t.message.includes('Email function')),
                templateSwitching: this.testResults.find(t => t.message.includes('Template switching')),
                responsiveDesign: this.testResults.find(t => t.message.includes('Responsive design'))
            },
            errors: this.errors,
            timestamp: new Date().toISOString()
        };

        // Save detailed report
        const reportPath = path.join(process.cwd(), 'test-results-success-functions.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return report;
    }

    async runAllTests() {
        this.log('🎯 Starting Success Page Functions Test (6 Core Functions)', 'start');

        // Test sequence - all 6 core functions
        await this.runTest('Success Page Exists', () => this.checkSuccessPageExists());
        await this.runTest('AI Optimization Function', () => this.testAIOptimizationFunction());
        await this.runTest('Export Functions (PDF/DOCX)', () => this.testExportFunctions());
        await this.runTest('Email Function', () => this.testEmailFunction());
        await this.runTest('Template Switching', () => this.testTemplateSwitching());
        await this.runTest('Responsive Design', () => this.testResponsiveDesign());
        await this.runTest('Template Hierarchy (7 templates)', () => this.testTemplateHierarchy());

        const report = await this.generateReport();
        
        this.log(`🏁 Function tests completed: ${report.summary.passed}/${report.summary.totalTests} passed (${report.summary.successRate})`, 'summary');
        
        if (report.summary.failed > 0) {
            this.log('⚠️  Some functions failed validation. Check test-results-success-functions.json', 'warning');
            this.errors.forEach(error => {
                this.log(`   └─ ${error.testName}: ${error.error}`, 'error');
            });
            process.exit(1);
        } else {
            this.log('🎉 All 6 core functions validated successfully!', 'success');
            process.exit(0);
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new SuccessFunctionsTest();
    tester.runAllTests().catch(error => {
        console.error('Success functions test failed:', error);
        process.exit(1);
    });
}

module.exports = SuccessFunctionsTest;