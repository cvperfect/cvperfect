const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class CvPerfectTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.screenshotCounter = 0;
    }

    async init() {
        console.log('🚀 Inicjalizacja testów CvPerfect...');
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        this.page = await this.browser.newPage();
        
        // Ustawienia konsoli i błędów
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.logError(`Console Error: ${msg.text()}`);
            }
        });
        
        this.page.on('pageerror', error => {
            this.logError(`Page Error: ${error.message}`);
        });
    }

    async takeScreenshot(name, width = 1920, height = 1080) {
        await this.page.setViewport({ width, height });
        const filename = `screenshot-${++this.screenshotCounter}-${name}.png`;
        await this.page.screenshot({ path: filename, fullPage: true });
        console.log(`📸 Zrzut ekranu zapisany: ${filename}`);
        return filename;
    }

    logTest(testName, status, details = '') {
        const result = {
            test: testName,
            status: status, // 'PASS', 'FAIL', 'WARNING'
            details: details,
            timestamp: new Date().toISOString()
        };
        this.testResults.push(result);
        
        const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${emoji} ${testName}: ${status}`);
        if (details) console.log(`   ${details}`);
    }

    logError(message) {
        console.error(`🚨 BŁĄD: ${message}`);
        this.testResults.push({
            test: 'ERROR',
            status: 'FAIL',
            details: message,
            timestamp: new Date().toISOString()
        });
    }

    // TEST 1: Dostępność strony
    async testSiteAccess() {
        console.log('\n🧪 TEST 1: Dostępność strony');
        try {
            const response = await this.page.goto('http://localhost:3003', { 
                waitUntil: 'networkidle2',
                timeout: 10000 
            });
            
            if (response.status() === 200) {
                this.logTest('Dostęp do strony głównej', 'PASS', 'Status 200 OK');
                await this.takeScreenshot('main-page');
            } else {
                this.logTest('Dostęp do strony głównej', 'FAIL', `Status: ${response.status()}`);
            }

            // Sprawdź tytuł strony
            const title = await this.page.title();
            if (title.includes('CvPerfect') || title.length > 0) {
                this.logTest('Tytuł strony', 'PASS', `Tytuł: "${title}"`);
            } else {
                this.logTest('Tytuł strony', 'FAIL', 'Brak lub nieprawidłowy tytuł');
            }

        } catch (error) {
            this.logTest('Dostęp do strony głównej', 'FAIL', error.message);
        }
    }

    // TEST 2: Responsywność
    async testResponsiveness() {
        console.log('\n🧪 TEST 2: Responsywność');
        
        const viewports = [
            { width: 375, height: 667, name: 'Mobile (375px)' },
            { width: 768, height: 1024, name: 'Tablet (768px)' },
            { width: 1920, height: 1080, name: 'Desktop (1920px)' }
        ];

        for (const viewport of viewports) {
            try {
                await this.page.setViewport(viewport);
                await this.page.reload({ waitUntil: 'networkidle2' });
                
                // Sprawdź overflow-x
                const hasHorizontalScroll = await this.page.evaluate(() => {
                    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
                });

                if (!hasHorizontalScroll) {
                    this.logTest(`Responsywność ${viewport.name}`, 'PASS', 'Brak poziomego scrollowania');
                } else {
                    this.logTest(`Responsywność ${viewport.name}`, 'WARNING', 'Wykryto poziomy scrolling');
                }

                await this.takeScreenshot(`responsive-${viewport.width}px`, viewport.width, viewport.height);

                // Test klikalności elementów na mobile
                if (viewport.width === 375) {
                    await this.testMobileClickability();
                }

            } catch (error) {
                this.logTest(`Responsywność ${viewport.name}`, 'FAIL', error.message);
            }
        }
    }

    async testMobileClickability() {
        try {
            // Sprawdź elementy klikalne
            const clickableElements = await this.page.$$eval('button, a, [onclick]', elements => {
                return elements.map(el => {
                    const rect = el.getBoundingClientRect();
                    return {
                        tag: el.tagName,
                        width: rect.width,
                        height: rect.height,
                        visible: rect.width > 0 && rect.height > 0
                    };
                }).filter(el => el.visible);
            });

            const tooSmallElements = clickableElements.filter(el => el.width < 44 || el.height < 44);
            
            if (tooSmallElements.length === 0) {
                this.logTest('Mobile Touch Targets', 'PASS', 'Wszystkie elementy ≥44px');
            } else {
                this.logTest('Mobile Touch Targets', 'WARNING', `${tooSmallElements.length} elementów <44px`);
            }

        } catch (error) {
            this.logTest('Mobile Touch Targets', 'FAIL', error.message);
        }
    }

    // TEST 3: Formularze i modale
    async testFormsAndModals() {
        console.log('\n🧪 TEST 3: Formularze i modale');
        
        await this.page.setViewport({ width: 1920, height: 1080 });
        await this.page.goto('http://localhost:3003', { waitUntil: 'networkidle2' });

        try {
            // Znajdź i kliknij główny przycisk CTA
            const mainButton = await this.page.$('button[class*="cta"], .cta-button, button:contains("Optymalizuj")');
            
            if (mainButton) {
                await mainButton.click();
                await this.page.waitForTimeout(1000);
                
                // Sprawdź czy modal się otworzył
                const modal = await this.page.$('[class*="modal"], .modal, [role="dialog"]');
                if (modal) {
                    this.logTest('Otwieranie modalu głównego', 'PASS');
                    await this.takeScreenshot('modal-opened');
                } else {
                    this.logTest('Otwieranie modalu głównego', 'FAIL', 'Modal nie został otwarty');
                }
            } else {
                this.logTest('Przycisk główny CTA', 'FAIL', 'Nie znaleziono przycisku głównego');
            }

            // Test przełączania języków
            await this.testLanguageSwitching();

        } catch (error) {
            this.logTest('Test formularzy i modali', 'FAIL', error.message);
        }
    }

    async testLanguageSwitching() {
        try {
            // Szukaj przełącznika języka
            const langSwitcher = await this.page.$('[class*="lang"], button:contains("EN"), button:contains("PL")');
            
            if (langSwitcher) {
                const originalText = await this.page.evaluate(() => document.body.innerText);
                await langSwitcher.click();
                await this.page.waitForTimeout(500);
                
                const newText = await this.page.evaluate(() => document.body.innerText);
                
                if (originalText !== newText) {
                    this.logTest('Przełączanie języków', 'PASS', 'Tekst uległ zmianie');
                } else {
                    this.logTest('Przełączanie języków', 'WARNING', 'Brak widocznych zmian w tekście');
                }
            } else {
                this.logTest('Przełącznik języka', 'WARNING', 'Nie znaleziono przełącznika języka');
            }
        } catch (error) {
            this.logTest('Przełączanie języków', 'FAIL', error.message);
        }
    }

    // TEST 4: Przepływ danych
    async testDataFlow() {
        console.log('\n🧪 TEST 4: Przepływ danych');
        
        try {
            // Test sessionStorage
            await this.page.evaluate(() => {
                sessionStorage.setItem('test-key', 'test-value');
            });
            
            const storedValue = await this.page.evaluate(() => {
                return sessionStorage.getItem('test-key');
            });
            
            if (storedValue === 'test-value') {
                this.logTest('SessionStorage', 'PASS', 'Dane są zapisywane i odczytywane');
            } else {
                this.logTest('SessionStorage', 'FAIL', 'Problem z zapisem/odczytem danych');
            }

            // Test przekierowania na success page
            await this.page.goto('http://localhost:3003/success', { waitUntil: 'networkidle2' });
            
            const url = this.page.url();
            if (url.includes('/success')) {
                this.logTest('Dostęp do success page', 'PASS');
                await this.takeScreenshot('success-page');
            } else {
                this.logTest('Dostęp do success page', 'FAIL', 'Przekierowanie nie działa');
            }

        } catch (error) {
            this.logTest('Test przepływu danych', 'FAIL', error.message);
        }
    }

    // TEST 5: API Endpoints
    async testAPIEndpoints() {
        console.log('\n🧪 TEST 5: API Endpoints');
        
        const endpoints = [
            { url: '/api/demo-optimize', method: 'POST' },
            { url: '/api/create-checkout-session', method: 'POST' },
            { url: '/api/parse-cv', method: 'POST' }
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await this.page.evaluate(async (url, method) => {
                    const res = await fetch(url, {
                        method: method,
                        headers: { 'Content-Type': 'application/json' },
                        body: method === 'POST' ? JSON.stringify({}) : undefined
                    });
                    return {
                        status: res.status,
                        ok: res.ok
                    };
                }, `http://localhost:3003${endpoint.url}`, endpoint.method);

                if (response.status === 200 || response.status === 400 || response.status === 422) {
                    // 400/422 to oczekiwane dla pustych requestów
                    this.logTest(`API ${endpoint.url}`, 'PASS', `Status: ${response.status}`);
                } else if (response.status === 500) {
                    this.logTest(`API ${endpoint.url}`, 'WARNING', `Server error: ${response.status}`);
                } else {
                    this.logTest(`API ${endpoint.url}`, 'FAIL', `Unexpected status: ${response.status}`);
                }

            } catch (error) {
                this.logTest(`API ${endpoint.url}`, 'FAIL', error.message);
            }
        }
    }

    // TEST 6: UX i Animacje
    async testUXAndAnimations() {
        console.log('\n🧪 TEST 6: UX i Animacje');
        
        await this.page.goto('http://localhost:3003', { waitUntil: 'networkidle2' });

        try {
            // Sprawdź błędy w konsoli
            const consoleErrors = [];
            this.page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text());
                }
            });

            await this.page.reload({ waitUntil: 'networkidle2' });
            await this.page.waitForTimeout(2000);

            if (consoleErrors.length === 0) {
                this.logTest('Błędy konsoli', 'PASS', 'Brak błędów JavaScript');
            } else {
                this.logTest('Błędy konsoli', 'FAIL', `${consoleErrors.length} błędów: ${consoleErrors[0]}`);
            }

            // Test obecności animacji
            const hasAnimations = await this.page.evaluate(() => {
                const elements = document.querySelectorAll('*');
                for (let el of elements) {
                    const style = window.getComputedStyle(el);
                    if (style.animation !== 'none' || style.transition !== 'none') {
                        return true;
                    }
                }
                return false;
            });

            if (hasAnimations) {
                this.logTest('Animacje CSS', 'PASS', 'Wykryto animacje/przejścia');
            } else {
                this.logTest('Animacje CSS', 'WARNING', 'Brak animacji CSS');
            }

        } catch (error) {
            this.logTest('Test UX i animacji', 'FAIL', error.message);
        }
    }

    // TEST 7: Scenariusze krytyczne
    async testCriticalScenarios() {
        console.log('\n🧪 TEST 7: Scenariusze krytyczne');

        // Test bez sessionStorage
        try {
            await this.page.evaluate(() => {
                sessionStorage.clear();
                localStorage.clear();
            });

            await this.page.goto('http://localhost:3003/success', { waitUntil: 'networkidle2' });
            
            // Sprawdź czy strona radzi sobie z brakiem danych
            const hasError = await this.page.$('.error, [class*="error"]');
            if (!hasError) {
                this.logTest('Obsługa braku sesji', 'PASS', 'Strona działa bez danych sesji');
            } else {
                this.logTest('Obsługa braku sesji', 'WARNING', 'Wyświetlane są błędy');
            }

        } catch (error) {
            this.logTest('Test bez sesji', 'FAIL', error.message);
        }

        // Test z bardzo małymi rozmiarami okna
        try {
            await this.page.setViewport({ width: 320, height: 480 });
            await this.page.goto('http://localhost:3003', { waitUntil: 'networkidle2' });
            
            const isUsable = await this.page.evaluate(() => {
                // Sprawdź czy podstawowe elementy są widoczne
                const mainContent = document.querySelector('main, .main, #main');
                return mainContent && mainContent.offsetHeight > 0;
            });

            if (isUsable) {
                this.logTest('Bardzo małe ekrany (320px)', 'PASS');
                await this.takeScreenshot('tiny-screen', 320, 480);
            } else {
                this.logTest('Bardzo małe ekrany (320px)', 'FAIL', 'Strona nieużywalna');
            }

        } catch (error) {
            this.logTest('Test małych ekranów', 'FAIL', error.message);
        }
    }

    async runAllTests() {
        console.log('🎯 ROZPOCZĘCIE KOMPLEKSOWYCH TESTÓW CVPERFECT');
        console.log('================================================');

        try {
            await this.init();
            
            await this.testSiteAccess();
            await this.testResponsiveness();
            await this.testFormsAndModals();
            await this.testDataFlow();
            await this.testAPIEndpoints();
            await this.testUXAndAnimations();
            await this.testCriticalScenarios();
            
            this.generateReport();

        } catch (error) {
            this.logError(`Krytyczny błąd testów: ${error.message}`);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    generateReport() {
        console.log('\n📊 RAPORT KOŃCOWY');
        console.log('==================');
        
        const passed = this.testResults.filter(t => t.status === 'PASS').length;
        const failed = this.testResults.filter(t => t.status === 'FAIL').length;
        const warnings = this.testResults.filter(t => t.status === 'WARNING').length;
        
        console.log(`✅ Testy zaliczone: ${passed}`);
        console.log(`❌ Testy niezaliczone: ${failed}`);
        console.log(`⚠️  Ostrzeżenia: ${warnings}`);
        console.log(`📄 Łączna liczba testów: ${this.testResults.length}`);

        // Zapisz szczegółowy raport
        const report = {
            summary: { passed, failed, warnings, total: this.testResults.length },
            timestamp: new Date().toISOString(),
            results: this.testResults
        };

        fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📁 Szczegółowy raport zapisany w: test-report.json');

        // Wyświetl krytyczne błędy
        const criticalErrors = this.testResults.filter(t => t.status === 'FAIL');
        if (criticalErrors.length > 0) {
            console.log('\n🚨 KRYTYCZNE BŁĘDY:');
            criticalErrors.forEach((error, i) => {
                console.log(`${i + 1}. ${error.test}: ${error.details}`);
            });
        }

        // Ocena ogólna
        const score = (passed / this.testResults.length) * 100;
        console.log(`\n🎯 OCENA OGÓLNA: ${score.toFixed(1)}%`);
        
        if (score >= 90) {
            console.log('🏆 DOSKONALE! Strona działa bardzo dobrze.');
        } else if (score >= 70) {
            console.log('👍 DOBRZE! Są drobne problemy do naprawienia.');
        } else if (score >= 50) {
            console.log('⚠️  ŚREDNIO! Wymagane są poprawki.');
        } else {
            console.log('❌ ŹLE! Strona wymaga pilnych napraw.');
        }
    }
}

// Uruchom testy
(async () => {
    const tester = new CvPerfectTester();
    await tester.runAllTests();
})();