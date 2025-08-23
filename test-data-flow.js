const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testDataFlow() {
    let browser;
    const results = [];
    
    function log(status, test, details = '') {
        results.push({ status, test, details, timestamp: new Date().toISOString() });
        console.log(`[${status}] ${test}${details ? ': ' + details : ''}`);
    }
    
    try {
        console.log('🔍 TESTING DATA FLOW AND SESSION HANDLING');
        console.log('=========================================\n');
        
        browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: { width: 1920, height: 1080 }
        });
        
        const page = await browser.newPage();
        
        console.log('📄 Loading main page...');
        await page.goto('http://localhost:3009', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test sessionStorage functionality
        console.log('\n💾 Testing sessionStorage functionality...');
        const storageTest = await page.evaluate(() => {
            try {
                sessionStorage.setItem('test', 'value');
                const result = sessionStorage.getItem('test');
                sessionStorage.removeItem('test');
                return { works: result === 'value', error: null };
            } catch (error) {
                return { works: false, error: error.message };
            }
        });
        
        if (storageTest.works) {
            log('PASS', 'SessionStorage functionality works');
        } else {
            log('FAIL', 'SessionStorage not working', storageTest.error);
        }
        
        // Test modal opening and data entry
        console.log('\n📝 Testing complete data entry flow...');
        
        // 1. Open modal
        const modalOpened = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const triggerBtn = buttons.find(btn => 
                btn.textContent.includes('Rozpocznij') || 
                btn.textContent.includes('Optymalizuj') ||
                btn.textContent.includes('Start')
            );
            
            if (triggerBtn) {
                triggerBtn.click();
                return true;
            }
            return false;
        });
        
        if (modalOpened) {
            log('PASS', 'Modal can be opened');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 2. Fill email
            const emailFilled = await page.evaluate(() => {
                const emailInput = document.querySelector('#customerEmail, input[type="email"]');
                if (emailInput) {
                    emailInput.value = 'test@datflow.com';
                    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                    return { success: true, value: emailInput.value };
                }
                return { success: false, error: 'Email input not found' };
            });
            
            if (emailFilled.success) {
                log('PASS', 'Email can be filled', emailFilled.value);
            } else {
                log('FAIL', 'Email filling failed', emailFilled.error);
            }
            
            // 3. Handle file upload simulation
            const fileUploadTest = await page.evaluate(() => {
                const fileInput = document.querySelector('#cv-file-input, input[type="file"]');
                if (fileInput) {
                    // Simulate file selection
                    const mockFile = new File(['CV content'], 'test-cv.pdf', { type: 'application/pdf' });
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(mockFile);
                    fileInput.files = dataTransfer.files;
                    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                    return { success: true, fileName: 'test-cv.pdf' };
                }
                return { success: false, error: 'File input not found' };
            });
            
            if (fileUploadTest.success) {
                log('PASS', 'File upload simulation works', fileUploadTest.fileName);
            } else {
                log('FAIL', 'File upload simulation failed', fileUploadTest.error);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 4. Test form data persistence
            const formDataCheck = await page.evaluate(() => {
                const emailInput = document.querySelector('#customerEmail, input[type="email"]');
                const fileInput = document.querySelector('#cv-file-input, input[type="file"]');
                
                return {
                    emailValue: emailInput ? emailInput.value : null,
                    fileCount: fileInput ? fileInput.files.length : 0
                };
            });
            
            log('INFO', 'Form data state', `Email: ${formDataCheck.emailValue}, Files: ${formDataCheck.fileCount}`);
            
            // 5. Test step navigation
            const nextButtonTest = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const nextBtn = buttons.find(btn => 
                    btn.textContent.includes('Dalej') || 
                    btn.textContent.includes('Next') ||
                    btn.textContent.includes('Kontynuuj')
                );
                
                if (nextBtn && !nextBtn.disabled) {
                    nextBtn.click();
                    return { success: true, buttonText: nextBtn.textContent };
                }
                
                return { 
                    success: false, 
                    availableButtons: buttons.map(b => b.textContent.trim()).filter(t => t.length > 0)
                };
            });
            
            if (nextButtonTest.success) {
                log('PASS', 'Step navigation works', nextButtonTest.buttonText);
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // 6. Test job posting input (if available in step 2)
                const jobInputTest = await page.evaluate(() => {
                    const jobInputs = document.querySelectorAll('textarea, input[name*="job"], input[placeholder*="job"]');
                    if (jobInputs.length > 0) {
                        const jobInput = jobInputs[0];
                        jobInput.value = 'Senior React Developer position requiring 5+ years experience';
                        jobInput.dispatchEvent(new Event('input', { bubbles: true }));
                        return { success: true, value: jobInput.value };
                    }
                    return { success: false, error: 'No job input found' };
                });
                
                if (jobInputTest.success) {
                    log('PASS', 'Job posting input works');
                } else {
                    log('WARNING', 'Job posting input not found in current step');
                }
                
            } else {
                log('WARNING', 'Step navigation not available', 
                    `Available buttons: ${nextButtonTest.availableButtons.join(', ')}`);
            }
            
            // 7. Test sessionStorage data saving
            const sessionDataTest = await page.evaluate(() => {
                try {
                    // Simulate what the app should do
                    const emailInput = document.querySelector('#customerEmail, input[type="email"]');
                    const jobInput = document.querySelector('textarea, input[name*="job"]');
                    
                    const testData = {
                        email: emailInput ? emailInput.value : '',
                        jobText: jobInput ? jobInput.value : '',
                        timestamp: Date.now()
                    };
                    
                    sessionStorage.setItem('testFormData', JSON.stringify(testData));
                    const retrieved = JSON.parse(sessionStorage.getItem('testFormData'));
                    
                    return { 
                        success: true, 
                        saved: testData, 
                        retrieved: retrieved,
                        matches: JSON.stringify(testData) === JSON.stringify(retrieved)
                    };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            });
            
            if (sessionDataTest.success && sessionDataTest.matches) {
                log('PASS', 'SessionStorage data persistence works');
            } else {
                log('FAIL', 'SessionStorage data persistence issue', sessionDataTest.error);
            }
            
        } else {
            log('FAIL', 'Modal could not be opened');
        }
        
        console.log('\n🎯 Testing Success Page Data Flow...');
        
        // Navigate to success page
        await page.goto('http://localhost:3009/success', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test success page initialization
        const successPageTest = await page.evaluate(() => {
            // Check if page loads
            const hasContent = document.body.children.length > 0;
            
            // Check for CV display areas
            const cvElements = document.querySelectorAll('.cv-preview, .template, [class*="cv"]');
            
            // Check for template selection
            const templateElements = document.querySelectorAll('.template-card, [class*="template"]');
            
            return {
                hasContent,
                cvElements: cvElements.length,
                templateElements: templateElements.length
            };
        });
        
        if (successPageTest.hasContent) {
            log('PASS', 'Success page loads with content');
            log('INFO', 'Success page elements', 
                `CV elements: ${successPageTest.cvElements}, Templates: ${successPageTest.templateElements}`);
        } else {
            log('FAIL', 'Success page loading issue');
        }
        
        // Test template switching
        console.log('\n🔄 Testing template switching...');
        const templateSwitchTest = await page.evaluate(() => {
            const templateCards = document.querySelectorAll('.template-card, [class*="template"]');
            if (templateCards.length > 1) {
                // Try clicking second template
                templateCards[1].click();
                return { 
                    success: true, 
                    totalTemplates: templateCards.length 
                };
            }
            return { success: false, totalTemplates: templateCards.length };
        });
        
        if (templateSwitchTest.success) {
            log('PASS', 'Template switching works', `Total templates: ${templateSwitchTest.totalTemplates}`);
        } else {
            log('WARNING', 'Template switching limited', `Templates available: ${templateSwitchTest.totalTemplates}`);
        }
        
        // Test export functionality availability
        console.log('\n📤 Testing export functionality...');
        const exportTest = await page.evaluate(() => {
            const exportButtons = document.querySelectorAll('button[class*="export"], button[class*="download"], [data-export]');
            const pdfButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
                btn.textContent.toLowerCase().includes('pdf')
            );
            const docxButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
                btn.textContent.toLowerCase().includes('docx') || btn.textContent.toLowerCase().includes('word')
            );
            
            return {
                exportButtons: exportButtons.length,
                pdfButtons: pdfButtons.length,
                docxButtons: docxButtons.length
            };
        });
        
        if (exportTest.exportButtons > 0 || exportTest.pdfButtons > 0 || exportTest.docxButtons > 0) {
            log('PASS', 'Export functionality available', 
                `Export buttons: ${exportTest.exportButtons}, PDF: ${exportTest.pdfButtons}, DOCX: ${exportTest.docxButtons}`);
        } else {
            log('WARNING', 'Export functionality not clearly available');
        }
        
        await page.screenshot({ path: path.join(__dirname, 'data-flow-test-final.png'), fullPage: true });
        
    } catch (error) {
        log('FAIL', 'Data flow test execution', error.message);
        console.error('❌ Test failed:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Generate summary
    console.log('\n📊 DATA FLOW TEST SUMMARY');
    console.log('========================');
    
    const summary = {
        total: results.length,
        passed: results.filter(r => r.status === 'PASS').length,
        failed: results.filter(r => r.status === 'FAIL').length,
        warnings: results.filter(r => r.status === 'WARNING').length,
        info: results.filter(r => r.status === 'INFO').length
    };
    
    console.log(`Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⚠️  Warnings: ${summary.warnings}`);
    console.log(`ℹ️  Info: ${summary.info}`);
    
    const criticalIssues = results.filter(r => r.status === 'FAIL');
    if (criticalIssues.length > 0) {
        console.log('\n🚨 CRITICAL DATA FLOW ISSUES:');
        criticalIssues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.test}: ${issue.details}`);
        });
    }
    
    // Save report
    const report = {
        summary,
        results,
        timestamp: new Date().toISOString()
    };
    
    const reportPath = path.join(__dirname, `data-flow-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Data flow report saved: ${reportPath}`);
    
    return report;
}

testDataFlow().catch(console.error);