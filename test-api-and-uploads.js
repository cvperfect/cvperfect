const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class APIAndUploadTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = [];
    }

    async init() {
        console.log('🔧 TEST API I UPLOAD PLIKÓW');
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
    }

    log(test, status, details = '') {
        const result = { test, status, details, timestamp: new Date().toISOString() };
        this.results.push(result);
        const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${emoji} ${test}: ${status}`);
        if (details) console.log(`   ${details}`);
    }

    // TEST API ENDPOINTS BEZPOŚREDNIO
    async testAPIEndpoints() {
        console.log('\n🔌 TEST API ENDPOINTS');
        
        const endpoints = [
            {
                name: 'demo-optimize (POST)',
                url: 'http://localhost:3010/api/demo-optimize',
                method: 'POST',
                body: {
                    cvText: 'Jan Kowalski\\n\\nDoświadczenie:\\n- Programista JavaScript 2 lata\\n- React, Node.js\\n\\nWykształcenie:\\n- Informatyka, Politechnika Warszawska',
                    jobPosting: 'Poszukujemy Frontend Developera z React'
                }
            },
            {
                name: 'create-checkout-session (POST)',
                url: 'http://localhost:3010/api/create-checkout-session',
                method: 'POST',
                body: {
                    plan: 'gold',
                    successUrl: 'http://localhost:3010/success',
                    cancelUrl: 'http://localhost:3010'
                }
            },
            {
                name: 'parse-cv (POST)',
                url: 'http://localhost:3010/api/parse-cv',
                method: 'POST',
                body: {
                    fileContent: 'Sample CV content for testing'
                }
            },
            {
                name: 'contact (POST)',
                url: 'http://localhost:3010/api/contact',
                method: 'POST',
                body: {
                    name: 'Test User',
                    email: 'test@example.com',
                    message: 'Test message'
                }
            }
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint.url, {
                    method: endpoint.method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(endpoint.body)
                });

                const responseText = await response.text();
                let responseData;
                try {
                    responseData = JSON.parse(responseText);
                } catch {
                    responseData = responseText;
                }

                if (response.ok) {
                    this.log(`API ${endpoint.name}`, 'PASS', `Status: ${response.status}`);
                    
                    // Szczegółowa analiza dla demo-optimize
                    if (endpoint.name.includes('demo-optimize') && responseData.optimizedCV) {
                        this.log('AI Optimization Response', 'PASS', `Otrzymano zoptymalizowane CV (${responseData.optimizedCV.length} znaków)`);
                    }
                    
                } else if (response.status === 400 || response.status === 422) {
                    // Oczekiwane błędy walidacji
                    this.log(`API ${endpoint.name}`, 'WARNING', `Błąd walidacji: ${response.status}`);
                } else {
                    this.log(`API ${endpoint.name}`, 'FAIL', `Nieoczekiwany status: ${response.status}`);
                }

            } catch (error) {
                this.log(`API ${endpoint.name}`, 'FAIL', `Błąd sieci: ${error.message}`);
            }
        }
    }

    // TEST UPLOAD PLIKÓW
    async testFileUpload() {
        console.log('\n📁 TEST UPLOAD PLIKÓW');
        
        await this.page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });

        // Utwórz testowy plik CV
        const testCVContent = `Jan Kowalski
Programista JavaScript

DOŚWIADCZENIE:
- Frontend Developer w XYZ Company (2022-2024)
- Tworzenie aplikacji React
- Współpraca z zespołem backend

WYKSZTAŁCENIE:
- Informatyka, Politechnika Warszawska (2018-2022)

UMIEJĘTNOŚCI:
- JavaScript, React, Node.js
- HTML5, CSS3, TypeScript
- Git, Docker, Jest`;

        const testFilePath = path.join(process.cwd(), 'test-cv.txt');
        fs.writeFileSync(testFilePath, testCVContent);

        try {
            // Znajdź input file
            const fileInput = await this.page.$('input[type="file"]');
            
            if (fileInput) {
                await fileInput.uploadFile(testFilePath);
                this.log('Upload pliku', 'PASS', 'Plik został załadowany');
                
                // Sprawdź czy plik został przetworzony
                await this.page.waitForTimeout(1000);
                
                const fileProcessed = await this.page.evaluate(() => {
                    // Sprawdź czy na stronie pojawiły się informacje o pliku
                    const fileInfo = document.querySelector('[class*="file"], [class*="upload"]');
                    return fileInfo ? fileInfo.textContent : null;
                });

                if (fileProcessed) {
                    this.log('Przetwarzanie pliku', 'PASS', 'Plik został rozpoznany przez system');
                } else {
                    this.log('Przetwarzanie pliku', 'WARNING', 'Brak widocznych informacji o przetwarzaniu');
                }

            } else {
                this.log('Input file', 'FAIL', 'Nie znaleziono pola do uploadu plików');
            }

            // Wyczyść testowy plik
            fs.unlinkSync(testFilePath);

        } catch (error) {
            this.log('Test upload', 'FAIL', error.message);
        }
    }

    // TEST MODAL INTERACTIONS
    async testModalInteractions() {
        console.log('\n🪟 TEST INTERAKCJI Z MODALAMI');
        
        await this.page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });

        try {
            // Znajdź główny przycisk CTA i kliknij
            const ctaButton = await this.page.$('.hero-button, .nav-cta, button:first-of-type');
            
            if (ctaButton) {
                await ctaButton.click();
                await this.page.waitForTimeout(500);
                
                // Sprawdź czy modal się otworzył
                const modalVisible = await this.page.evaluate(() => {
                    const modals = document.querySelectorAll('[class*="modal"], [role="dialog"], [style*="display: block"]');
                    return Array.from(modals).some(modal => {
                        const style = window.getComputedStyle(modal);
                        return style.display !== 'none' && style.visibility !== 'hidden';
                    });
                });

                if (modalVisible) {
                    this.log('Otwieranie modalu', 'PASS', 'Modal został otwarty');
                    
                    // Test zamykania modalu
                    const closeButton = await this.page.$('[class*="close"], .modal-close, button[aria-label="close"]');
                    if (closeButton) {
                        await closeButton.click();
                        await this.page.waitForTimeout(300);
                        
                        const modalClosed = await this.page.evaluate(() => {
                            const modals = document.querySelectorAll('[class*="modal"], [role="dialog"]');
                            return !Array.from(modals).some(modal => {
                                const style = window.getComputedStyle(modal);
                                return style.display !== 'none' && style.visibility !== 'hidden';
                            });
                        });

                        if (modalClosed) {
                            this.log('Zamykanie modalu', 'PASS', 'Modal został zamknięty');
                        } else {
                            this.log('Zamykanie modalu', 'WARNING', 'Modal pozostał otwarty');
                        }
                    } else {
                        this.log('Przycisk zamknij', 'WARNING', 'Nie znaleziono przycisku zamykania');
                    }
                    
                } else {
                    this.log('Otwieranie modalu', 'FAIL', 'Modal nie został otwarty');
                }
            } else {
                this.log('Przycisk CTA', 'FAIL', 'Nie znaleziono głównego przycisku');
            }

        } catch (error) {
            this.log('Test modali', 'FAIL', error.message);
        }
    }

    // TEST LANGUAGE SWITCHING
    async testLanguageSwitching() {
        console.log('\n🌍 TEST PRZEŁĄCZANIA JĘZYKA');
        
        await this.page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });

        try {
            // Pobierz tekst początkowy
            const initialText = await this.page.evaluate(() => {
                const heroSection = document.querySelector('.hero, [class*="hero"]');
                return heroSection ? heroSection.textContent : document.body.textContent;
            });

            // Znajdź i kliknij przełącznik języka EN
            const enButton = await this.page.$('button[class*="lang"]:not(.active), .lang-btn:not(.active)');
            
            if (enButton) {
                await enButton.click();
                await this.page.waitForTimeout(1000);
                
                const newText = await this.page.evaluate(() => {
                    const heroSection = document.querySelector('.hero, [class*="hero"]');
                    return heroSection ? heroSection.textContent : document.body.textContent;
                });

                if (initialText !== newText) {
                    this.log('Przełączanie języka', 'PASS', 'Tekst uległ zmianie po przełączeniu');
                    
                    // Sprawdź czy pojawiły się angielskie słowa
                    const hasEnglish = newText.toLowerCase().includes('optimize') || 
                                     newText.toLowerCase().includes('resume') ||
                                     newText.toLowerCase().includes('professional');
                                     
                    if (hasEnglish) {
                        this.log('Tłumaczenie EN', 'PASS', 'Wykryto angielskie słowa');
                    } else {
                        this.log('Tłumaczenie EN', 'WARNING', 'Nie wykryto typowo angielskich słów');
                    }
                } else {
                    this.log('Przełączanie języka', 'WARNING', 'Tekst się nie zmienił');
                }
            } else {
                this.log('Przycisk EN', 'WARNING', 'Nie znaleziono przycisku języka EN');
            }

        } catch (error) {
            this.log('Test języka', 'FAIL', error.message);
        }
    }

    // TEST EDGE CASES
    async testEdgeCases() {
        console.log('\n⚠️ TEST PRZYPADKÓW BRZEGOWYCH');

        // Test bez JavaScript
        await this.page.setJavaScriptEnabled(false);
        try {
            await this.page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });
            
            const content = await this.page.evaluate(() => {
                return document.body.textContent.length;
            });

            if (content > 100) {
                this.log('Działanie bez JS', 'PASS', 'Strona wyświetla treść bez JavaScript');
            } else {
                this.log('Działanie bez JS', 'FAIL', 'Strona wymaga JavaScript do działania');
            }
        } catch (error) {
            this.log('Test bez JS', 'FAIL', error.message);
        }
        
        // Włącz z powrotem JS
        await this.page.setJavaScriptEnabled(true);

        // Test bardzo małego viewport
        await this.page.setViewport({ width: 280, height: 400 });
        try {
            await this.page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });
            
            const isUsable = await this.page.evaluate(() => {
                const buttons = document.querySelectorAll('button');
                return Array.from(buttons).some(btn => btn.offsetWidth > 0 && btn.offsetHeight > 0);
            });

            if (isUsable) {
                this.log('Bardzo mały ekran (280px)', 'PASS', 'Przyciski pozostają dostępne');
            } else {
                this.log('Bardzo mały ekran (280px)', 'FAIL', 'Elementy interfejsu niedostępne');
            }
        } catch (error) {
            this.log('Test małego ekranu', 'FAIL', error.message);
        }
    }

    async runAllTests() {
        try {
            await this.init();
            
            await this.testAPIEndpoints();
            await this.testFileUpload();
            await this.testModalInteractions();
            await this.testLanguageSwitching();
            await this.testEdgeCases();
            
            this.generateSummary();

        } catch (error) {
            console.error(`Krytyczny błąd: ${error.message}`);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    generateSummary() {
        console.log('\n📊 PODSUMOWANIE TESTÓW API I FUNKCJONALNOŚCI');
        console.log('=============================================');
        
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const warnings = this.results.filter(r => r.status === 'WARNING').length;
        
        console.log(`✅ Zaliczone: ${passed}`);
        console.log(`❌ Niezaliczone: ${failed}`);
        console.log(`⚠️ Ostrzeżenia: ${warnings}`);
        console.log(`📄 Łącznie: ${this.results.length}`);

        const score = (passed / this.results.length) * 100;
        console.log(`\n🎯 WYNIK: ${score.toFixed(1)}%`);

        // Zapisz raport
        fs.writeFileSync('api-upload-test-report.json', JSON.stringify({
            summary: { passed, failed, warnings, total: this.results.length, score },
            results: this.results,
            timestamp: new Date().toISOString()
        }, null, 2));

        console.log('\n📁 Raport zapisany: api-upload-test-report.json');
    }
}

(async () => {
    const tester = new APIAndUploadTester();
    await tester.runAllTests();
})();