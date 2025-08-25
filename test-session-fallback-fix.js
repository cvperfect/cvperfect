// Test Session Fallback Fix System
// Purpose: Test proper handling of invalid/expired session IDs

const fs = require('fs')
const path = require('path')

console.log('🧪 Testing Session Fallback Fix System...\n')

class SessionFallbackTest {
    constructor() {
        console.log('🚀 Setting up Session Fallback Test...')
    }

    async testProblemSession() {
        console.log('🧪 Testing problematic session handling...')
        
        try {
            const response = await fetch('http://localhost:3001/api/get-session-data?session_id=sess_1756022122778_t57bzyvas')
            const data = await response.json()
            
            // Inject test CV data into sessionStorage (simulating upload flow)
            await this.driver.executeScript(() => {
                const testCV = `
Jan Kowalski
Doświadczony programista JavaScript
Email: jan.kowalski@example.com
Telefon: +48 123 456 789

DOŚWIADCZENIE ZAWODOWE:
- Senior Frontend Developer w ABC Corp (2020-2024)
  * Tworzenie aplikacji React/Next.js
  * Optymalizacja wydajności aplikacji
  * Zarządzanie zespołem 3 programistów
  
- Frontend Developer w XYZ Ltd (2018-2020)
  * Rozwój aplikacji webowych w JavaScript
  * Integracja z API REST
  * Testowanie automatyczne

UMIEJĘTNOŚCI:
- JavaScript (ES6+), TypeScript
- React, Next.js, Node.js
- CSS3, Sass, Styled Components
- Git, Docker, AWS

WYKSZTAŁCENIE:
Informatyka, Politechnika Warszawska (2014-2018)
                `.trim();
                
                // Set all the sessionStorage items that index.js would set
                sessionStorage.setItem('pendingCV', testCV);
                sessionStorage.setItem('pendingJob', 'Senior React Developer - praca zdalna w nowoczesnej firmie tech');
                sessionStorage.setItem('pendingEmail', 'jan.kowalski@example.com');
                sessionStorage.setItem('pendingPlan', 'premium');
                
                console.log('✅ Test CV data injected into sessionStorage');
                return {
                    cvLength: testCV.length,
                    hasJob: !!sessionStorage.getItem('pendingJob'),
                    hasEmail: !!sessionStorage.getItem('pendingEmail'),
                    plan: sessionStorage.getItem('pendingPlan')
                };
            });
            
            console.log('📝 SessionStorage populated with test CV data');
            
            // Navigate to success page WITHOUT session_id parameter (this should trigger our fix)
            await this.driver.get('http://localhost:3001/success?plan=premium&template=modern');
            console.log('🔗 Navigated to success page WITHOUT session_id parameter');
            
            // Wait for fallback mechanism to work
            await this.driver.sleep(5000);
            
            // Check if fallback mechanism worked
            const fallbackTest = await this.driver.executeScript(() => {
                // Check if CV data is loaded
                const cvDisplayed = document.querySelector('[data-testid="cv-content"]') || 
                                  document.querySelector('.cv-preview') ||
                                  document.body.textContent.includes('Jan Kowalski');
                
                // Check if success notification appeared
                const successNotification = document.body.textContent.includes('odzyskane') ||
                                           document.body.textContent.includes('załadowane') ||
                                           document.body.textContent.includes('pamięci przeglądarki');
                
                // Check if error message is NOT shown
                const noErrorMessage = !document.body.textContent.includes('Nie znaleziono sesji');
                
                // Check sessionStorage was cleaned up
                const sessionStorageCleanedUp = !sessionStorage.getItem('pendingCV');
                
                return {
                    cvDisplayed: cvDisplayed,
                    successNotification: successNotification,
                    noErrorMessage: noErrorMessage,
                    sessionStorageCleanedUp: sessionStorageCleanedUp,
                    pageText: document.body.textContent.substring(0, 500)
                };
            });
            
            console.log('🔍 Fallback test results:', fallbackTest);
            
            // Verify all conditions
            if (fallbackTest.cvDisplayed) {
                console.log('✅ SUCCESS: CV data was recovered and displayed');
            } else {
                console.log('❌ FAIL: CV data not displayed');
            }
            
            if (fallbackTest.noErrorMessage) {
                console.log('✅ SUCCESS: No error message shown');
            } else {
                console.log('❌ FAIL: Error message still shown');
            }
            
            if (fallbackTest.sessionStorageCleanedUp) {
                console.log('✅ SUCCESS: SessionStorage cleaned up after use');
            } else {
                console.log('⚠️ WARNING: SessionStorage not cleaned up');
            }
            
            // Take screenshot for visual verification
            const screenshot = await this.driver.takeScreenshot();
            require('fs').writeFileSync(`test-fallback-results-${Date.now()}.png`, screenshot, 'base64');
            console.log('📸 Screenshot saved for visual verification');
            
            const overallSuccess = fallbackTest.cvDisplayed && fallbackTest.noErrorMessage;
            
            return {
                success: overallSuccess,
                details: fallbackTest
            };
            
        } catch (error) {
            console.error('❌ SessionStorage fallback test error:', error);
            return { success: false, error: error.message };
        }
    }

    async testNoFallbackData() {
        console.log('🧪 Testing behavior when no fallback data exists...');
        
        try {
            // Clear all sessionStorage first
            await this.driver.executeScript(() => {
                sessionStorage.clear();
                console.log('🗑️ SessionStorage cleared');
            });
            
            // Navigate to success page without session_id and without sessionStorage
            await this.driver.get('http://localhost:3001/success?plan=premium');
            await this.driver.sleep(3000);
            
            const noDataTest = await this.driver.executeScript(() => {
                const errorMessageShown = document.body.textContent.includes('Nie znaleziono sesji') ||
                                        document.body.textContent.includes('Brak danych') ||
                                        document.body.textContent.includes('przesłać CV ponownie');
                
                return {
                    errorMessageShown: errorMessageShown,
                    pageText: document.body.textContent.substring(0, 300)
                };
            });
            
            if (noDataTest.errorMessageShown) {
                console.log('✅ SUCCESS: Appropriate error message shown when no data available');
            } else {
                console.log('❌ FAIL: No error message shown when no data available');
            }
            
            return { success: noDataTest.errorMessageShown, details: noDataTest };
            
        } catch (error) {
            console.error('❌ No data test error:', error);
            return { success: false, error: error.message };
        }
    }

    async cleanup() {
        if (this.driver) {
            await this.driver.quit();
            console.log('🧹 Browser cleanup complete');
        }
    }

    async runAllTests() {
        console.log('🎯 Starting comprehensive session fallback tests...\n');
        
        try {
            await this.setup();
            
            console.log('=== TEST 1: SessionStorage Fallback Recovery ===');
            const test1 = await this.testSessionStorageFallback();
            
            console.log('\n=== TEST 2: No Fallback Data Available ===');
            const test2 = await this.testNoFallbackData();
            
            console.log('\n📊 FINAL TEST RESULTS:');
            console.log(`Test 1 (Fallback Recovery): ${test1.success ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`Test 2 (No Data Error): ${test2.success ? '✅ PASS' : '❌ FAIL'}`);
            
            const overallSuccess = test1.success && test2.success;
            console.log(`\n🎯 Overall Test Result: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
            
            if (overallSuccess) {
                console.log('\n🎉 SUCCESS: Session fallback fix is working correctly!');
                console.log('✅ Users will no longer see "No session ID found" error');
                console.log('✅ SessionStorage fallback mechanism is functional');
                console.log('✅ Appropriate error handling when no data is available');
            }
            
            return overallSuccess;
            
        } catch (error) {
            console.error('❌ Test runner error:', error);
            return false;
        } finally {
            await this.cleanup();
        }
    }
}

// Run the tests
if (require.main === module) {
    const tester = new SessionFallbackTest();
    tester.runAllTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Fatal test error:', error);
            process.exit(1);
        });
}

module.exports = SessionFallbackTest;