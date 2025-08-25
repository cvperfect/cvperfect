/**
 * CVPerfect - 4 Critical Issues Verification Test
 * Tests the current status of 4 reported issues:
 * 1. Mobile Navigation Missing (375px)
 * 2. Success Page Template Loading 
 * 3. ESLint Deprecated Options
 * 4. Statistics Display Issue
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class CVPerfectIssuesVerifier {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            issues: {},
            summary: {
                total: 4,
                fixed: 0,
                broken: 0,
                unknown: 0
            }
        };
    }

    async runAllTests() {
        console.log('🔍 CVPerfect Issues Verification Starting...\n');
        
        // Test 1: ESLint Deprecated Options (fastest to check)
        await this.testESLintIssues();
        
        // Test 2-4: Browser-based tests
        const browser = await puppeteer.launch({
            headless: false, // Show browser for visual confirmation
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: null
        });

        try {
            // Test 2: Mobile Navigation
            await this.testMobileNavigation(browser);
            
            // Test 3: Statistics Display
            await this.testStatisticsDisplay(browser);
            
            // Test 4: Success Page Templates
            await this.testSuccessPageTemplates(browser);
            
        } catch (error) {
            console.error('❌ Browser tests failed:', error.message);
        } finally {
            await browser.close();
        }

        // Generate final report
        this.generateReport();
    }

    async testESLintIssues() {
        console.log('1️⃣  Testing ESLint Deprecated Options...');
        
        try {
            const { spawn } = require('child_process');
            
            const eslintProcess = spawn('npm', ['run', 'lint'], {
                stdio: ['inherit', 'pipe', 'pipe'],
                shell: true
            });

            let stdout = '';
            let stderr = '';

            eslintProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            eslintProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            eslintProcess.on('close', (code) => {
                const hasDeprecationWarnings = stdout.includes('deprecated') || stderr.includes('deprecated');
                const hasWarnings = stdout.includes('warning') || stderr.includes('warning');
                const hasErrors = stdout.includes('error') || stderr.includes('error');

                this.results.issues.eslintDeprecated = {
                    status: hasDeprecationWarnings ? 'BROKEN' : 'FIXED',
                    details: {
                        exitCode: code,
                        hasDeprecationWarnings,
                        hasWarnings,
                        hasErrors,
                        output: stdout.substring(0, 500) + (stdout.length > 500 ? '...' : '')
                    }
                };

                console.log(hasDeprecationWarnings ? 
                    '❌ ESLint still has deprecated options' : 
                    '✅ ESLint deprecated options resolved'
                );
            });

        } catch (error) {
            this.results.issues.eslintDeprecated = {
                status: 'UNKNOWN',
                details: { error: error.message }
            };
            console.log('⚠️  Could not test ESLint - assuming broken');
        }
    }

    async testMobileNavigation(browser) {
        console.log('\n2️⃣  Testing Mobile Navigation (375px)...');
        
        const page = await browser.newPage();
        
        try {
            // Set mobile viewport (375px width - typical mobile)
            await page.setViewport({ width: 375, height: 667 });
            
            // Navigate to main page
            await page.goto('http://localhost:3001', { 
                waitUntil: 'networkidle2', 
                timeout: 10000 
            });

            // Wait for page to fully load
            await page.waitForTimeout(2000);

            // Look for language switcher elements
            const languageSwitcherVisible = await page.evaluate(() => {
                // Check for common language switcher selectors
                const selectors = [
                    '[data-testid="language-switcher"]',
                    '.language-switcher', 
                    '.lang-switch',
                    'button[aria-label*="language"]',
                    'button[aria-label*="język"]',
                    '.language-toggle',
                    '[data-lang]'
                ];

                for (const selector of selectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        const style = window.getComputedStyle(element);
                        const isVisible = style.display !== 'none' && 
                                         style.visibility !== 'hidden' && 
                                         style.opacity !== '0';
                        if (isVisible) {
                            return {
                                found: true,
                                selector,
                                visible: true,
                                text: element.textContent || element.getAttribute('aria-label') || ''
                            };
                        }
                    }
                }

                // Also check for any button with PL/EN text
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                    const text = button.textContent.trim();
                    if (text.match(/^(PL|EN|Polish|English)$/i)) {
                        const style = window.getComputedStyle(button);
                        const isVisible = style.display !== 'none' && 
                                         style.visibility !== 'hidden' && 
                                         style.opacity !== '0';
                        return {
                            found: true,
                            selector: 'button with PL/EN text',
                            visible: isVisible,
                            text: text
                        };
                    }
                }

                return { found: false, visible: false };
            });

            // Take screenshot for visual confirmation
            await page.screenshot({ 
                path: `mobile-nav-test-${Date.now()}.png`,
                fullPage: true 
            });

            this.results.issues.mobileNavigation = {
                status: languageSwitcherVisible.found && languageSwitcherVisible.visible ? 'FIXED' : 'BROKEN',
                details: {
                    viewport: '375x667',
                    languageSwitcher: languageSwitcherVisible,
                    screenshotTaken: true
                }
            };

            console.log(languageSwitcherVisible.found && languageSwitcherVisible.visible ? 
                '✅ Mobile navigation language switcher is visible' : 
                '❌ Mobile navigation language switcher missing or hidden'
            );

        } catch (error) {
            this.results.issues.mobileNavigation = {
                status: 'UNKNOWN',
                details: { error: error.message }
            };
            console.log('⚠️  Could not test mobile navigation');
        } finally {
            await page.close();
        }
    }

    async testStatisticsDisplay(browser) {
        console.log('\n3️⃣  Testing Statistics Display...');
        
        const page = await browser.newPage();
        
        try {
            await page.goto('http://localhost:3001', { 
                waitUntil: 'networkidle2', 
                timeout: 10000 
            });

            // Wait for statistics to potentially load
            await page.waitForTimeout(3000);

            const statisticsData = await page.evaluate(() => {
                // Look for statistics section
                const statsSelectors = [
                    '.statistics',
                    '.stats',
                    '[data-testid="statistics"]',
                    '.success-stats',
                    '.numbers',
                    '.metrics'
                ];

                const results = [];

                for (const selector of statsSelectors) {
                    const elements = document.querySelectorAll(selector + ' *');
                    elements.forEach(el => {
                        const text = el.textContent.trim();
                        // Look for patterns like "1,234" or "—" or "---"
                        if (text.match(/^[\d,]+$/) || text.match(/^[—\-]+$/)) {
                            results.push({
                                text: text,
                                selector: selector,
                                element: el.tagName.toLowerCase(),
                                hasNumbers: /^\d/.test(text),
                                hasDashes: /^[—\-]/.test(text)
                            });
                        }
                    });
                }

                // Also look for any element containing statistics-like text
                const allElements = document.querySelectorAll('*');
                for (const el of allElements) {
                    const text = el.textContent.trim();
                    // Look for context + numbers/dashes (e.g., "CVs analyzed: 1,234")
                    if (text.match(/(analyzed|created|improved|success|users?):\s*[\d,—\-]+/i)) {
                        results.push({
                            text: text,
                            selector: 'contextual stats',
                            element: el.tagName.toLowerCase(),
                            hasNumbers: /\d/.test(text),
                            hasDashes: /[—\-]/.test(text),
                            contextual: true
                        });
                    }
                }

                return {
                    found: results.length > 0,
                    statistics: results,
                    totalNumbers: results.filter(r => r.hasNumbers).length,
                    totalDashes: results.filter(r => r.hasDashes).length
                };
            });

            this.results.issues.statisticsDisplay = {
                status: statisticsData.totalNumbers > 0 && statisticsData.totalDashes === 0 ? 'FIXED' : 
                        statisticsData.totalDashes > 0 ? 'BROKEN' : 'UNKNOWN',
                details: statisticsData
            };

            console.log(statisticsData.totalNumbers > 0 && statisticsData.totalDashes === 0 ? 
                '✅ Statistics showing numbers properly' : 
                statisticsData.totalDashes > 0 ? 
                '❌ Statistics still showing dashes instead of numbers' :
                '⚠️  No statistics found to verify'
            );

        } catch (error) {
            this.results.issues.statisticsDisplay = {
                status: 'UNKNOWN',
                details: { error: error.message }
            };
            console.log('⚠️  Could not test statistics display');
        } finally {
            await page.close();
        }
    }

    async testSuccessPageTemplates(browser) {
        console.log('\n4️⃣  Testing Success Page Template Loading...');
        
        const page = await browser.newPage();
        
        try {
            // This test requires a valid session - try to access success page
            // We'll look for indicators of template loading vs actual content
            
            await page.goto('http://localhost:3001/success', { 
                waitUntil: 'networkidle2', 
                timeout: 10000 
            });

            // Wait for potential content loading
            await page.waitForTimeout(4000);

            const templateStatus = await page.evaluate(() => {
                // Check for loading indicators
                const loadingIndicators = document.querySelectorAll('[class*="loading"], [class*="spinner"], .loading-state');
                
                // Check for actual template content
                const templateElements = document.querySelectorAll('[class*="template"], .cv-template, [data-template]');
                
                // Check for error messages about missing data
                const errorMessages = document.querySelectorAll('[class*="error"], .error-message, .no-data');
                
                // Check for placeholder text
                const placeholderText = document.body.textContent;
                const hasPlaceholders = placeholderText.includes('Loading') || 
                                       placeholderText.includes('Ładowanie') || 
                                       placeholderText.includes('Please wait');

                return {
                    hasLoadingIndicators: loadingIndicators.length > 0,
                    hasTemplateContent: templateElements.length > 0,
                    hasErrors: errorMessages.length > 0,
                    hasPlaceholders,
                    loadingCount: loadingIndicators.length,
                    templateCount: templateElements.length,
                    errorCount: errorMessages.length,
                    bodyText: placeholderText.substring(0, 200)
                };
            });

            // Take screenshot of success page
            await page.screenshot({ 
                path: `success-page-test-${Date.now()}.png`,
                fullPage: true 
            });

            this.results.issues.successPageTemplates = {
                status: !templateStatus.hasLoadingIndicators && 
                        templateStatus.hasTemplateContent && 
                        !templateStatus.hasErrors ? 'FIXED' : 'BROKEN',
                details: {
                    ...templateStatus,
                    screenshotTaken: true
                }
            };

            console.log(!templateStatus.hasLoadingIndicators && templateStatus.hasTemplateContent && !templateStatus.hasErrors ? 
                '✅ Success page templates loading properly' : 
                '❌ Success page still showing loading state or errors'
            );

        } catch (error) {
            this.results.issues.successPageTemplates = {
                status: 'UNKNOWN',
                details: { error: error.message }
            };
            console.log('⚠️  Could not test success page templates');
        } finally {
            await page.close();
        }
    }

    generateReport() {
        console.log('\n📊 FINAL VERIFICATION REPORT\n');
        console.log('=' .repeat(50));
        
        const issues = this.results.issues;
        let fixedCount = 0;
        let brokenCount = 0;
        let unknownCount = 0;

        // Count statuses
        Object.values(issues).forEach(issue => {
            if (issue.status === 'FIXED') fixedCount++;
            else if (issue.status === 'BROKEN') brokenCount++;
            else unknownCount++;
        });

        this.results.summary = {
            total: 4,
            fixed: fixedCount,
            broken: brokenCount,
            unknown: unknownCount
        };

        console.log(`📈 SUMMARY: ${fixedCount}/4 issues FIXED`);
        console.log(`❌ BROKEN: ${brokenCount} issues still need attention`);
        console.log(`❓ UNKNOWN: ${unknownCount} issues could not be verified\n`);

        // Detailed results
        console.log('DETAILED RESULTS:');
        console.log('-'.repeat(30));
        
        console.log(`1. ESLint Deprecated Options: ${issues.eslintDeprecated?.status || 'NOT_TESTED'}`);
        console.log(`2. Mobile Navigation (375px): ${issues.mobileNavigation?.status || 'NOT_TESTED'}`);
        console.log(`3. Statistics Display: ${issues.statisticsDisplay?.status || 'NOT_TESTED'}`);
        console.log(`4. Success Page Templates: ${issues.successPageTemplates?.status || 'NOT_TESTED'}`);

        // Save detailed report
        const reportPath = `verification-report-${Date.now()}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Detailed report saved: ${reportPath}`);

        // Recommendations
        console.log('\n🎯 RECOMMENDATIONS:');
        if (brokenCount > 0) {
            console.log('❗ Priority fixes needed for broken issues');
        }
        if (unknownCount > 0) {
            console.log('🔍 Manual verification recommended for unknown status issues');
        }
        if (fixedCount === 4) {
            console.log('🎉 All issues appear to be resolved!');
        }
    }
}

// Run the verification
if (require.main === module) {
    const verifier = new CVPerfectIssuesVerifier();
    verifier.runAllTests().catch(console.error);
}

module.exports = CVPerfectIssuesVerifier;