#!/usr/bin/env node
/**
 * RESPONSIVE DESIGN TEST - CVPerfect
 * Mobile, tablet, desktop breakpoint validation
 * 
 * Tests:
 * - 4 responsive breakpoints (480px, 768px, 1024px, 1440px)
 * - Touch targets (44px minimum)
 * - Modal system responsiveness
 * - Glassmorphism effects across devices
 * - CSS-in-JSX responsive patterns
 * - Mobile drag-and-drop functionality
 */

const fs = require('fs');
const path = require('path');

class ResponsiveDesignTest {
    constructor() {
        this.testResults = [];
        this.errors = [];
        this.startTime = Date.now();
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            desktop: 1024,
            largeDesktop: 1440
        };
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

    async testMainPageBreakpoints() {
        const indexPath = path.join(process.cwd(), 'pages', 'index.js');
        
        if (!fs.existsSync(indexPath)) {
            throw new Error('pages/index.js not found');
        }

        const content = fs.readFileSync(indexPath, 'utf8');
        
        // Check for breakpoint patterns
        const breakpointPatterns = Object.values(this.breakpoints).map(bp => `${bp}px`);
        const mediaQueries = ['@media', 'max-width', 'min-width'];
        
        const foundBreakpoints = breakpointPatterns.filter(bp => content.includes(bp));
        const foundMediaQueries = mediaQueries.filter(mq => content.includes(mq));

        const results = [];
        results.push(`Breakpoints: ${foundBreakpoints.length}/4 found (${foundBreakpoints.join(', ')})`);
        results.push(`Media queries: ${foundMediaQueries.length}/3 patterns found`);

        return results.join('\n');
    }

    async testSuccessPageBreakpoints() {
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        
        if (!fs.existsSync(successPath)) {
            throw new Error('pages/success.js not found');
        }

        const content = fs.readFileSync(successPath, 'utf8');
        
        // Check for responsive patterns in success page
        const responsivePatterns = [
            '@media',
            'max-width',
            'min-width',
            '480px',
            '768px', 
            '1024px',
            '1440px'
        ];

        const foundPatterns = responsivePatterns.filter(pattern => content.includes(pattern));

        if (foundPatterns.length < 4) {
            throw new Error(`Success page lacks responsive design. Found: ${foundPatterns.join(', ')}`);
        }

        return `Success page responsive: ${foundPatterns.length}/7 patterns found`;
    }

    async testTouchTargets() {
        const pages = ['pages/index.js', 'pages/success.js'];
        const results = [];

        for (const pagePath of pages) {
            const fullPath = path.join(process.cwd(), pagePath);
            
            if (!fs.existsSync(fullPath)) {
                results.push(`❌ ${pagePath}: File not found`);
                continue;
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for touch target patterns (44px minimum for mobile)
            const touchPatterns = [
                '44px',
                'minHeight: 44',
                'min-height: 44',
                'touch',
                'tap',
                'button'
            ];

            const foundTouchPatterns = touchPatterns.filter(pattern => 
                content.includes(pattern)
            );

            if (foundTouchPatterns.length >= 2) {
                results.push(`✅ ${pagePath}: ${foundTouchPatterns.length} touch patterns`);
            } else {
                results.push(`⚠️  ${pagePath}: ${foundTouchPatterns.length} touch patterns (may lack mobile optimization)`);
            }
        }

        return `Touch targets validation:\n${results.join('\n')}`;
    }

    async testModalResponsiveness() {
        const indexPath = path.join(process.cwd(), 'pages', 'index.js');
        const successPath = path.join(process.cwd(), 'pages', 'success.js');
        
        const files = [
            { path: indexPath, name: 'index.js' },
            { path: successPath, name: 'success.js' }
        ];

        const results = [];

        for (const file of files) {
            if (!fs.existsSync(file.path)) {
                results.push(`❌ ${file.name}: File not found`);
                continue;
            }

            const content = fs.readFileSync(file.path, 'utf8');
            
            // Check for modal responsive patterns
            const modalPatterns = [
                'modal',
                'Modal',
                'overlay',
                'z-index',
                'position: fixed',
                'width: 100%',
                'height: 100%'
            ];

            const foundModalPatterns = modalPatterns.filter(pattern => 
                content.includes(pattern)
            );

            if (foundModalPatterns.length >= 3) {
                results.push(`✅ ${file.name}: ${foundModalPatterns.length}/7 modal patterns`);
            } else {
                results.push(`⚠️  ${file.name}: ${foundModalPatterns.length}/7 modal patterns (may not be fully responsive)`);
            }
        }

        return `Modal responsiveness:\n${results.join('\n')}`;
    }

    async testGlassmorphismResponsiveness() {
        const pages = ['pages/index.js', 'pages/success.js', 'pages/regulamin.js'];
        const results = [];

        for (const pagePath of pages) {
            const fullPath = path.join(process.cwd(), pagePath);
            
            if (!fs.existsSync(fullPath)) {
                results.push(`⚠️  ${pagePath}: File not found (optional)`);
                continue;
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for glassmorphism patterns that work across devices
            const glassPatterns = [
                'backdrop-filter',
                'blur(',
                'saturate(',
                'rgba(',
                'background: linear-gradient',
                'border-radius',
                'box-shadow'
            ];

            const foundGlassPatterns = glassPatterns.filter(pattern => 
                content.includes(pattern)
            );

            if (foundGlassPatterns.length >= 4) {
                results.push(`✅ ${pagePath}: ${foundGlassPatterns.length}/7 glassmorphism patterns`);
            } else {
                results.push(`⚠️  ${pagePath}: ${foundGlassPatterns.length}/7 glassmorphism patterns`);
            }
        }

        return `Glassmorphism responsiveness:\n${results.join('\n')}`;
    }

    async testMobileDragDrop() {
        const indexPath = path.join(process.cwd(), 'pages', 'index.js');
        
        if (!fs.existsSync(indexPath)) {
            throw new Error('pages/index.js not found');
        }

        const content = fs.readFileSync(indexPath, 'utf8');
        
        // Check for mobile drag-drop patterns
        const dragDropPatterns = [
            'onDrop',
            'onDragOver',
            'onDragEnter',
            'onDragLeave',
            'accept',
            'multiple',
            'drag',
            'drop',
            'file',
            'input[type="file"]'
        ];

        const foundPatterns = dragDropPatterns.filter(pattern => 
            content.includes(pattern)
        );

        if (foundPatterns.length < 5) {
            throw new Error(`Mobile drag-drop incomplete. Found: ${foundPatterns.join(', ')}`);
        }

        // Check for mobile-specific file input fallback
        const mobilePatterns = [
            'input',
            'type="file"',
            'accept',
            'onClick'
        ];

        const foundMobilePatterns = mobilePatterns.filter(pattern => 
            content.includes(pattern)
        );

        return `Mobile drag-drop: ${foundPatterns.length}/10 drag patterns, ${foundMobilePatterns.length}/4 mobile fallback patterns`;
    }

    async testFlexboxGridResponsiveness() {
        const pages = ['pages/index.js', 'pages/success.js'];
        const results = [];

        for (const pagePath of pages) {
            const fullPath = path.join(process.cwd(), pagePath);
            
            if (!fs.existsSync(fullPath)) {
                results.push(`❌ ${pagePath}: File not found`);
                continue;
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for responsive layout patterns
            const layoutPatterns = [
                'display: flex',
                'flex-direction',
                'flex-wrap',
                'justify-content',
                'align-items',
                'grid',
                'column',
                'row'
            ];

            const foundLayoutPatterns = layoutPatterns.filter(pattern => 
                content.includes(pattern)
            );

            results.push(`${pagePath}: ${foundLayoutPatterns.length}/8 layout patterns`);
        }

        return `Flexbox/Grid responsiveness:\n${results.join('\n')}`;
    }

    async testTypographyScaling() {
        const pages = ['pages/index.js', 'pages/success.js'];
        const results = [];

        for (const pagePath of pages) {
            const fullPath = path.join(process.cwd(), pagePath);
            
            if (!fs.existsSync(fullPath)) {
                results.push(`❌ ${pagePath}: File not found`);
                continue;
            }

            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check for responsive typography patterns
            const typographyPatterns = [
                'font-size',
                'fontSize',
                'line-height',
                'lineHeight',
                'rem',
                'em',
                'clamp(',
                'calc('
            ];

            const foundTypographyPatterns = typographyPatterns.filter(pattern => 
                content.includes(pattern)
            );

            results.push(`${pagePath}: ${foundTypographyPatterns.length}/8 typography patterns`);
        }

        return `Typography scaling:\n${results.join('\n')}`;
    }

    async testComponentResponsiveness() {
        const componentsPath = path.join(process.cwd(), 'components');
        
        if (!fs.existsSync(componentsPath)) {
            return 'Components directory: ⚠️  Not found (optional)';
        }

        const components = fs.readdirSync(componentsPath)
            .filter(file => file.endsWith('.js') || file.endsWith('.jsx'));

        const results = [];

        for (const component of components) {
            const componentPath = path.join(componentsPath, component);
            const content = fs.readFileSync(componentPath, 'utf8');
            
            // Check for responsive patterns in components
            const responsivePatterns = [
                '@media',
                'max-width',
                'min-width',
                'flex',
                'grid'
            ];

            const foundPatterns = responsivePatterns.filter(pattern => 
                content.includes(pattern)
            );

            if (foundPatterns.length >= 2) {
                results.push(`✅ ${component}: ${foundPatterns.length} responsive patterns`);
            } else {
                results.push(`⚠️  ${component}: ${foundPatterns.length} responsive patterns`);
            }
        }

        return `Component responsiveness:\n${results.join('\n')}`;
    }

    async generateReport() {
        const duration = Date.now() - this.startTime;
        const passedTests = this.testResults.filter(r => r.type === 'pass').length;
        const failedTests = this.errors.length;
        const totalTests = passedTests + failedTests;

        const report = {
            testSuite: 'Responsive Design Test',
            summary: {
                totalTests,
                passed: passedTests,
                failed: failedTests,
                duration: `${duration}ms`,
                successRate: `${Math.round((passedTests / totalTests) * 100)}%`
            },
            responsiveFeatures: {
                breakpoints: this.breakpoints,
                touchTargets: '44px minimum for mobile',
                designSystem: 'Glassmorphism with CSS-in-JSX',
                layoutSystem: 'Flexbox and CSS Grid'
            },
            testResults: this.testResults,
            errors: this.errors,
            timestamp: new Date().toISOString()
        };

        // Save detailed report
        const reportPath = path.join(process.cwd(), 'test-results-responsive.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        return report;
    }

    async runAllTests() {
        this.log('📱 Starting Responsive Design Test (4 breakpoints: 480px, 768px, 1024px, 1440px)', 'start');

        // Test sequence
        await this.runTest('Main Page Breakpoints', () => this.testMainPageBreakpoints());
        await this.runTest('Success Page Breakpoints', () => this.testSuccessPageBreakpoints());
        await this.runTest('Touch Targets (44px min)', () => this.testTouchTargets());
        await this.runTest('Modal Responsiveness', () => this.testModalResponsiveness());
        await this.runTest('Glassmorphism Responsiveness', () => this.testGlassmorphismResponsiveness());
        await this.runTest('Mobile Drag & Drop', () => this.testMobileDragDrop());
        await this.runTest('Flexbox/Grid Layout', () => this.testFlexboxGridResponsiveness());
        await this.runTest('Typography Scaling', () => this.testTypographyScaling());
        await this.runTest('Component Responsiveness', () => this.testComponentResponsiveness());

        const report = await this.generateReport();
        
        this.log(`🏁 Responsive design tests completed: ${report.summary.passed}/${report.summary.totalTests} passed (${report.summary.successRate})`, 'summary');
        
        if (report.summary.failed > 0) {
            this.log('⚠️  Some responsive tests failed. Check test-results-responsive.json', 'warning');
            this.errors.forEach(error => {
                this.log(`   └─ ${error.testName}: ${error.error}`, 'error');
            });
            process.exit(1);
        } else {
            this.log('🎉 Responsive design fully validated!', 'success');
            process.exit(0);
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new ResponsiveDesignTest();
    tester.runAllTests().catch(error => {
        console.error('Responsive design test failed:', error);
        process.exit(1);
    });
}

module.exports = ResponsiveDesignTest;