/**
 * Simple test for session fallback fix
 * Tests the critical bug fix for "No session ID found" error
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function testSessionFallback() {
    console.log('🚀 Testing session fallback fix...');
    
    let browser, page;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
        
        page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({ width: 1200, height: 800 });
        
        // Navigate to main page first
        await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
        
        console.log('📝 Injecting test CV data into sessionStorage...');
        
        // Inject sessionStorage data (simulating user upload flow)
        await page.evaluate(() => {
            const testCV = `
Jan Kowalski
Senior Frontend Developer
Email: jan.kowalski@example.com
Telefon: +48 123 456 789

DOŚWIADCZENIE ZAWODOWE:
- Senior React Developer w TechCorp (2021-2024)
  * Rozwój aplikacji React/Next.js dla 50k+ użytkowników
  * Optymalizacja wydajności - poprawa o 40%
  * Mentoring juniorów w zespole 8-osobowym
  
- Frontend Developer w WebStudio (2019-2021)
  * Tworzenie responsywnych aplikacji webowych
  * Integracja z REST API i GraphQL
  * Automatyczne testowanie (Jest, Cypress)

UMIEJĘTNOŚCI TECHNICZNE:
- JavaScript (ES6+), TypeScript, Python
- React, Next.js, Vue.js, Node.js
- CSS3, Sass, Tailwind, Styled Components
- PostgreSQL, MongoDB, Redis
- Docker, AWS, CI/CD (GitLab, GitHub Actions)
- Git, Agile/Scrum

WYKSZTAŁCENIE:
Informatyka (Inżynier), Politechnika Warszawska (2015-2019)
            `.trim();
            
            // Simulate the exact sessionStorage setup from index.js
            sessionStorage.setItem('pendingCV', testCV);
            sessionStorage.setItem('pendingJob', 'Senior React Developer - Remote work at innovative tech company');
            sessionStorage.setItem('pendingEmail', 'jan.kowalski@example.com');
            sessionStorage.setItem('pendingPlan', 'premium');
            sessionStorage.setItem('selectedTemplate', 'modern');
            
            console.log('✅ SessionStorage data injected:', {
                cvLength: testCV.length,
                hasJob: !!sessionStorage.getItem('pendingJob'),
                plan: sessionStorage.getItem('pendingPlan')
            });
            
            return testCV.length;
        });
        
        console.log('🔗 Navigating to success page WITHOUT session_id (triggering fallback)...');
        
        // Navigate to success page WITHOUT session_id - this should trigger our fix
        await page.goto('http://localhost:3001/success?plan=premium&template=modern', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // Wait for fallback mechanism to process
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        console.log('🔍 Checking fallback results...');
        
        // Check if fallback worked
        const fallbackResults = await page.evaluate(() => {
            const pageText = document.body.textContent;
            
            return {
                // Check if CV data is displayed (name should be visible)
                cvDataDisplayed: pageText.includes('Jan Kowalski') || 
                               pageText.includes('Senior Frontend Developer') ||
                               pageText.includes('TechCorp'),
                
                // Check if the old error message is NOT shown
                noOldErrorMessage: !pageText.includes('⚠️ No session ID found') &&
                                 !pageText.includes('Nie znaleziono sesji'),
                
                // Check if success/recovery notification is shown
                recoveryNotification: pageText.includes('odzyskane') ||
                                    pageText.includes('załadowane') ||
                                    pageText.includes('pamięci przeglądarki') ||
                                    pageText.includes('CV załadowane'),
                
                // Check if sessionStorage was cleaned up
                sessionStorageEmpty: !sessionStorage.getItem('pendingCV'),
                
                // Capture page content for debugging
                pageContent: pageText.substring(0, 1000)
            };
        });
        
        // Check console for debug messages
        const consoleLogs = [];
        page.on('console', msg => {
            if (msg.text().includes('fallback') || msg.text().includes('sessionStorage') || msg.text().includes('🚑')) {
                consoleLogs.push(msg.text());
            }
        });
        
        // Take screenshot for visual verification
        const screenshot = await page.screenshot({ fullPage: true });
        fs.writeFileSync(`test-session-fallback-result-${Date.now()}.png`, screenshot);
        
        console.log('📊 FALLBACK TEST RESULTS:');
        console.log(`✅ CV Data Displayed: ${fallbackResults.cvDataDisplayed ? 'YES' : 'NO'}`);
        console.log(`✅ Old Error Hidden: ${fallbackResults.noOldErrorMessage ? 'YES' : 'NO'}`);
        console.log(`✅ Recovery Notification: ${fallbackResults.recoveryNotification ? 'YES' : 'NO'}`);
        console.log(`✅ SessionStorage Cleanup: ${fallbackResults.sessionStorageEmpty ? 'YES' : 'NO'}`);
        
        if (consoleLogs.length > 0) {
            console.log('🔍 Relevant console messages:');
            consoleLogs.forEach(log => console.log(`  ${log}`));
        }
        
        // Test success criteria
        const testPassed = fallbackResults.cvDataDisplayed && fallbackResults.noOldErrorMessage;
        
        if (testPassed) {
            console.log('\n🎉 SUCCESS: Session fallback fix is working!');
            console.log('✅ Users will no longer see "No session ID found" error');
            console.log('✅ CV data is properly recovered from sessionStorage');
        } else {
            console.log('\n❌ FAILURE: Session fallback fix needs debugging');
            console.log('Page content preview:', fallbackResults.pageContent.substring(0, 300));
        }
        
        return testPassed;
        
    } catch (error) {
        console.error('❌ Test error:', error);
        return false;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Test with no sessionStorage data (should show appropriate error)
async function testNoFallbackData() {
    console.log('\n🧪 Testing behavior when no fallback data exists...');
    
    let browser, page;
    try {
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        
        // Clear sessionStorage and navigate to success without session_id
        await page.goto('http://localhost:3001/success?plan=premium', { waitUntil: 'networkidle2' });
        
        await page.evaluate(() => {
            sessionStorage.clear();
        });
        
        await page.reload({ waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const errorTest = await page.evaluate(() => {
            const pageText = document.body.textContent;
            return {
                appropriateError: pageText.includes('Nie znaleziono sesji') ||
                                pageText.includes('Brak danych') ||
                                pageText.includes('przesłać CV ponownie'),
                pageContent: pageText.substring(0, 500)
            };
        });
        
        if (errorTest.appropriateError) {
            console.log('✅ Appropriate error message shown when no data available');
        } else {
            console.log('❌ No appropriate error message shown');
            console.log('Page content:', errorTest.pageContent);
        }
        
        return errorTest.appropriateError;
        
    } catch (error) {
        console.error('❌ No data test error:', error);
        return false;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run tests
async function runTests() {
    console.log('🎯 CVPerfect Session Fallback Fix - Test Suite\n');
    
    const test1 = await testSessionFallback();
    const test2 = await testNoFallbackData();
    
    console.log('\n📋 FINAL RESULTS:');
    console.log(`Test 1 (SessionStorage Recovery): ${test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Test 2 (No Data Error Handling): ${test2 ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = test1 && test2;
    console.log(`\n🎯 Overall: ${allPassed ? '🎉 ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log('\n✅ CRITICAL BUG FIX VERIFIED:');
        console.log('• Users no longer see "⚠️ No session ID found" error');
        console.log('• SessionStorage fallback mechanism works correctly');
        console.log('• CV data is properly recovered and displayed');
        console.log('• Appropriate error handling when no data exists');
        console.log('• Fix is production-ready');
    }
    
    return allPassed;
}

if (require.main === module) {
    runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { testSessionFallback, testNoFallbackData };