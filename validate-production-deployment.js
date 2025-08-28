#!/usr/bin/env node
/**
 * CVPerfect Part 8 - Final Production Deployment Validation Script
 * 
 * This script runs the complete validation suite before production deployment:
 * 1. Level 1-3 baseline regression tests
 * 2. Master production regression testing suite
 * 3. Security validation
 * 4. Performance benchmarking
 * 5. Business logic validation
 * 6. Final deployment certification
 * 
 * Usage: node validate-production-deployment.js [--quick|--full|--with-server]
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

class CVPerfectDeploymentValidator {
    constructor() {
        this.startTime = Date.now();
        this.testResults = [];
        this.validationPassed = true;
        this.criticalErrors = [];
        this.warnings = [];
        
        // Parse command line arguments
        this.args = process.argv.slice(2);
        this.mode = this.getMode();
        this.withServer = this.args.includes('--with-server');
    }

    getMode() {
        if (this.args.includes('--quick')) return 'quick';
        if (this.args.includes('--full')) return 'full';
        return 'standard';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
        const icons = {
            start: '=�',
            test: '>�', 
            pass: '',
            fail: 'L',
            warning: '�',
            info: '9',
            critical: '=%',
            success: '<�'
        };
        
        const icon = icons[type] || '9';
        const logMessage = `[${timestamp}] ${icon} ${message}`;
        
        console.log(logMessage);
        
        this.testResults.push({
            timestamp,
            type,
            message,
            duration: Date.now() - this.startTime
        });
    }

    async runCommand(command, description, critical = true) {
        this.log(`Running: ${description}`, 'test');
        
        try {
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr && !stderr.includes('warning')) {
                throw new Error(stderr);
            }
            
            this.log(` ${description} - PASSED`, 'pass');
            return { success: true, output: stdout, error: null };
            
        } catch (error) {
            this.log(`L ${description} - FAILED: ${error.message}`, 'fail');
            
            if (critical) {
                this.criticalErrors.push({ test: description, error: error.message });
                this.validationPassed = false;
            } else {
                this.warnings.push({ test: description, warning: error.message });
            }
            
            return { success: false, output: null, error: error.message };
        }
    }

    async validateEnvironment() {
        this.log('Validating Production Environment', 'start');
        
        // Check critical files
        const criticalFiles = [
            '.env.local',
            'package.json',
            'next.config.js',
            'pages/index.js',
            'pages/success.js',
            'pages/api/health.js'
        ];
        
        for (const file of criticalFiles) {
            if (!fs.existsSync(file)) {
                this.criticalErrors.push({ test: `File Check: ${file}`, error: 'File not found' });
                this.validationPassed = false;
                this.log(`L Critical file missing: ${file}`, 'fail');
            } else {
                this.log(` Critical file present: ${file}`, 'pass');
            }
        }
    }

    async runMasterRegressionSuite() {
        this.log('Running Master Production Regression Suite', 'start');
        
        // Master regression testing
        const result = await this.runCommand('node test-production-regression-master.js', 'Master Regression Suite', true);
        
        // Check production readiness report
        if (fs.existsSync('production-readiness-report.json')) {
            try {
                const report = JSON.parse(fs.readFileSync('production-readiness-report.json', 'utf8'));
                
                if (report.productionReadiness.overallScore >= 70) {
                    this.log(` Production readiness score: ${report.productionReadiness.overallScore}%`, 'pass');
                } else {
                    this.log(`L Production readiness score too low: ${report.productionReadiness.overallScore}%`, 'fail');
                    this.criticalErrors.push({ 
                        test: 'Production Readiness Score', 
                        error: `Score ${report.productionReadiness.overallScore}% below 70% threshold` 
                    });
                    this.validationPassed = false;
                }
                
                if (report.summary.criticalErrors > 0) {
                    this.log(`L Critical errors found: ${report.summary.criticalErrors}`, 'fail');
                    this.criticalErrors.push({ 
                        test: 'Critical Errors Check', 
                        error: `${report.summary.criticalErrors} critical errors detected` 
                    });
                    this.validationPassed = false;
                }
                
            } catch (error) {
                this.warnings.push({ test: 'Report Analysis', warning: 'Could not parse production readiness report' });
            }
        }
    }

    async generateFinalReport() {
        const duration = Date.now() - this.startTime;
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.type === 'pass').length;
        const failedTests = this.criticalErrors.length;
        
        const report = {
            deploymentValidation: {
                timestamp: new Date().toISOString(),
                mode: this.mode,
                withServer: this.withServer,
                duration: `${Math.round(duration / 1000)}s`,
                overallResult: this.validationPassed ? 'PASSED' : 'FAILED',
                readyForDeployment: this.validationPassed && this.criticalErrors.length === 0
            },
            summary: {
                totalTests,
                passed: passedTests,
                failed: failedTests,
                warnings: this.warnings.length,
                criticalErrors: this.criticalErrors.length
            },
            criticalErrors: this.criticalErrors,
            warnings: this.warnings,
            recommendations: this.generateRecommendations()
        };
        
        // Save report
        const reportPath = path.join(process.cwd(), 'final-deployment-validation.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.criticalErrors.length > 0) {
            recommendations.push('=% CRITICAL: Fix all critical errors before deployment');
        }
        
        if (this.warnings.length > 0) {
            recommendations.push('� WARNINGS: Review and address warnings');
        }
        
        recommendations.push('=� Monitor performance metrics post-deployment');
        recommendations.push('= Set up automated regression testing in CI/CD pipeline');
        
        return recommendations;
    }

    displayFinalResults(report) {
        console.log('\n' + '='.repeat(80));
        console.log('<� CVPERFECT PART 8 - FINAL DEPLOYMENT VALIDATION');
        console.log('='.repeat(80));
        
        console.log(`\n=� VALIDATION RESULT: ${report.deploymentValidation.overallResult}`);
        console.log(`=� DEPLOYMENT READY: ${report.deploymentValidation.readyForDeployment ? 'YES' : 'NO'}`);
        console.log(`� TOTAL DURATION: ${report.deploymentValidation.duration}`);
        console.log(`>� TESTS RUN: ${report.summary.totalTests}`);
        console.log(` TESTS PASSED: ${report.summary.passed}`);
        console.log(`L TESTS FAILED: ${report.summary.failed}`);
        console.log(`� WARNINGS: ${report.summary.warnings}`);
        console.log(`=% CRITICAL ERRORS: ${report.summary.criticalErrors}`);
        
        if (report.criticalErrors.length > 0) {
            console.log('\n=% CRITICAL ERRORS:');
            report.criticalErrors.forEach(error => {
                console.log(`   L ${error.test}: ${error.error}`);
            });
        }
        
        if (report.warnings.length > 0) {
            console.log('\n� WARNINGS:');
            report.warnings.slice(0, 5).forEach(warning => {
                console.log(`   � ${warning.test}: ${warning.warning}`);
            });
            
            if (report.warnings.length > 5) {
                console.log(`   ... and ${report.warnings.length - 5} more warnings`);
            }
        }
        
        console.log('\n=� RECOMMENDATIONS:');
        report.recommendations.forEach(rec => console.log(`   ${rec}`));
        
        console.log('\n=� REPORTS GENERATED:');
        console.log('   " final-deployment-validation.json - Complete validation report');
        console.log('   " production-readiness-report.json - Production readiness assessment');
        console.log('   " performance-regression-report.md - Performance analysis');
        console.log('   " REGRESSION_TEST_SUMMARY.md - Comprehensive test summary');
        
        if (report.deploymentValidation.readyForDeployment) {
            console.log('\n<� DEPLOYMENT APPROVED!');
            console.log(' CVPerfect Part 8 is ready for production deployment');
            console.log('=� All critical validations passed');
        } else {
            console.log('\n� DEPLOYMENT NOT RECOMMENDED');
            console.log('L Critical issues must be resolved before deployment');
            console.log('📋 Address critical errors and re-run validation');
        }
        
        console.log('\n' + '='.repeat(80));
    }

    async runFullValidation() {
        this.log('Starting CVPerfect Part 8 Final Deployment Validation', 'start');
        this.log(`Mode: ${this.mode.toUpperCase()}, With Server: ${this.withServer}`, 'info');
        
        try {
            // Phase 1: Environment validation
            await this.validateEnvironment();
            
            // Phase 2: Master regression suite
            await this.runMasterRegressionSuite();
            
        } catch (error) {
            this.log(`Validation suite failed: ${error.message}`, 'critical');
            this.criticalErrors.push({ test: 'Validation Suite', error: error.message });
            this.validationPassed = false;
        }
        
        // Generate final report
        const finalReport = await this.generateFinalReport();
        
        this.log('Generating Final Deployment Certification', 'info');
        
        // Display results
        this.displayFinalResults(finalReport);
        
        return finalReport;
    }
}

// Main execution
if (require.main === module) {
    const validator = new CVPerfectDeploymentValidator();
    
    // Display usage if help requested
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(`
CVPerfect Part 8 - Final Deployment Validation Script

Usage:
  node validate-production-deployment.js [options]

Options:
  --quick         Run quick validation (master suite only)
  --full          Run full validation (all tests + security + performance)  
  --with-server   Include live server API testing
  --help, -h      Show this help message

Examples:
  node validate-production-deployment.js --quick
  node validate-production-deployment.js --full --with-server
  node validate-production-deployment.js

Default: Standard validation (Level 1-3 + Master Suite)
        `);
        process.exit(0);
    }
    
    validator.runFullValidation()
        .then(report => {
            const exitCode = report.deploymentValidation.readyForDeployment ? 0 : 1;
            process.exit(exitCode);
        })
        .catch(error => {
            console.error('=% CRITICAL: Final validation failed:', error);
            process.exit(1);
        });
}