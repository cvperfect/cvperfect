const puppeteer = require('puppeteer');
const fs = require('fs');

class DetailedCvPerfectTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.screenshotCounter = 0;
        this.issues = [];
    }

    async init() {
        console.log('🔍 SZCZEGÓŁOWA ANALIZA CVPERFECT');
        this.browser = await puppeteer.launch({
            headless: false, // Widoczna przeglądarka dla lepszego debugowania
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            slowMo: 100 // Spowolnienie dla lepszego śledzenia
        });
        this.page = await this.browser.newPage();
        
        // Przechwytuj wszystkie błędy
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.issues.push({
                    type: 'Console Error',
                    message: msg.text(),
                    location: msg.location() ? msg.location().url : 'unknown'
                });
            }
        });
        
        this.page.on('pageerror', error => {
            this.issues.push({
                type: 'JavaScript Error',
                message: error.message,
                stack: error.stack
            });
        });

        this.page.on('requestfailed', request => {
            this.issues.push({
                type: 'Request Failed',
                url: request.url(),
                failure: request.failure().errorText
            });
        });
    }

    async takeScreenshot(name) {
        const filename = `detailed-${++this.screenshotCounter}-${name}.png`;
        await this.page.screenshot({ path: filename, fullPage: true });
        console.log(`📸 ${filename}`);
        return filename;
    }

    // SZCZEGÓŁOWY TEST STRONY GŁÓWNEJ
    async analyzeMainPage() {
        console.log('\n🏠 ANALIZA STRONY GŁÓWNEJ');
        await this.page.goto('http://localhost:3010', { waitUntil: 'networkidle2' });
        
        // Sprawdź strukturę DOM
        const pageAnalysis = await this.page.evaluate(() => {
            const analysis = {
                title: document.title,
                hasHeader: !!document.querySelector('header, .header'),
                hasNavigation: !!document.querySelector('nav, .nav, .navigation'),
                hasMainContent: !!document.querySelector('main, .main, #main'),
                hasFooter: !!document.querySelector('footer, .footer'),
                totalElements: document.querySelectorAll('*').length,
                totalButtons: document.querySelectorAll('button').length,
                totalLinks: document.querySelectorAll('a').length,
                totalImages: document.querySelectorAll('img').length,
                hasModals: !!document.querySelector('[class*="modal"], [role="dialog"]')
            };
            
            // Znajdź główne przyciski CTA
            const ctaButtons = [];
            document.querySelectorAll('button').forEach((btn, index) => {
                const text = btn.textContent.trim();
                const classes = btn.className;
                if (text.length > 0) {
                    ctaButtons.push({
                        index,
                        text: text.substring(0, 50),
                        classes: classes.substring(0, 100),
                        visible: btn.offsetWidth > 0 && btn.offsetHeight > 0
                    });
                }
            });
            analysis.ctaButtons = ctaButtons;

            // Sprawdź przełącznik języka
            const langElements = [];
            document.querySelectorAll('*').forEach((el, index) => {
                const text = el.textContent;
                if ((text.includes('EN') || text.includes('PL')) && text.length < 10) {
                    langElements.push({
                        tag: el.tagName,
                        text: text.trim(),
                        clickable: el.tagName === 'BUTTON' || el.onclick || el.style.cursor === 'pointer'
                    });
                }
            });
            analysis.languageSwitcher = langElements;

            return analysis;
        });

        console.log(`📋 Struktura strony:`);
        console.log(`   - Elementy DOM: ${pageAnalysis.totalElements}`);
        console.log(`   - Przyciski: ${pageAnalysis.totalButtons}`);
        console.log(`   - Linki: ${pageAnalysis.totalLinks}`);
        console.log(`   - Obrazy: ${pageAnalysis.totalImages}`);
        console.log(`   - Header: ${pageAnalysis.hasHeader ? '✅' : '❌'}`);
        console.log(`   - Navigation: ${pageAnalysis.hasNavigation ? '✅' : '❌'}`);
        console.log(`   - Main Content: ${pageAnalysis.hasMainContent ? '✅' : '❌'}`);
        console.log(`   - Footer: ${pageAnalysis.hasFooter ? '✅' : '❌'}`);

        console.log(`\n🔘 Główne przyciski CTA (${pageAnalysis.ctaButtons.length}):`);
        pageAnalysis.ctaButtons.forEach((btn, i) => {
            console.log(`   ${i + 1}. "${btn.text}" ${btn.visible ? '✅' : '❌'}`);
        });

        if (pageAnalysis.languageSwitcher.length > 0) {
            console.log(`\n🌍 Przełącznik języka znaleziony: ${pageAnalysis.languageSwitcher.length} elementów`);
        } else {
            console.log('\n🌍 Przełącznik języka: ❌ Nie znaleziono');
        }

        await this.takeScreenshot('main-page-analysis');
        return pageAnalysis;
    }

    // TEST INTERAKCJI Z UŻYTKOWNIKIEM
    async testUserInteractions() {
        console.log('\n👆 TEST INTERAKCJI Z UŻYTKOWNIKIEM');
        
        // Test kliknięcia w pierwszy widoczny przycisk
        const buttons = await this.page.$$('button');
        if (buttons.length > 0) {
            console.log(`Znaleziono ${buttons.length} przycisków. Testuję pierwszy...`);
            
            try {
                // Sprawdź czy przycisk jest widoczny
                const isVisible = await buttons[0].isIntersectingViewport();
                if (isVisible) {
                    await buttons[0].click();
                    await this.page.waitForTimeout(1000);
                    
                    // Sprawdź co się zmieniło na stronie
                    const changes = await this.page.evaluate(() => {
                        return {
                            hasModal: !!document.querySelector('[style*="display: block"], [class*="show"], [class*="open"]'),
                            url: window.location.href,
                            activeElement: document.activeElement.tagName
                        };
                    });

                    console.log(`   Rezultat kliknięcia:`);
                    console.log(`   - Modal otwarty: ${changes.hasModal ? '✅' : '❌'}`);
                    console.log(`   - URL: ${changes.url}`);
                    console.log(`   - Aktywny element: ${changes.activeElement}`);

                    await this.takeScreenshot('after-button-click');
                } else {
                    console.log(`   ❌ Pierwszy przycisk nie jest widoczny`);
                }
            } catch (error) {
                console.log(`   ❌ Błąd podczas kliknięcia: ${error.message}`);
            }
        } else {
            console.log('   ❌ Brak przycisków na stronie');
        }
    }

    // ANALIZA PLIKÓW STATYCZNYCH
    async analyzeStaticAssets() {
        console.log('\n📁 ANALIZA ZASOBÓW STATYCZNYCH');
        
        // Test ładowania CSS i JS
        const resources = await this.page.evaluate(() => {
            const resources = {
                stylesheets: [],
                scripts: [],
                images: [],
                failed: []
            };
            
            // CSS
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                resources.stylesheets.push({
                    href: link.href,
                    loaded: !link.sheet ? false : true
                });
            });
            
            // JavaScript
            document.querySelectorAll('script[src]').forEach(script => {
                resources.scripts.push({
                    src: script.src,
                    loaded: script.readyState === 'complete' || !script.readyState
                });
            });
            
            // Images
            document.querySelectorAll('img').forEach(img => {
                resources.images.push({
                    src: img.src,
                    loaded: img.complete && img.naturalWidth > 0
                });
            });
            
            return resources;
        });

        console.log(`📊 Zasoby statyczne:`);
        console.log(`   - Style CSS: ${resources.stylesheets.length}`);
        console.log(`   - Skrypty JS: ${resources.scripts.length}`);
        console.log(`   - Obrazy: ${resources.images.length}`);

        // Sprawdź nieudane zasoby
        const failedStyles = resources.stylesheets.filter(s => !s.loaded);
        const failedScripts = resources.scripts.filter(s => !s.loaded);
        const failedImages = resources.images.filter(i => !i.loaded);

        if (failedStyles.length > 0) {
            console.log(`   ❌ Nieudane CSS: ${failedStyles.length}`);
            failedStyles.forEach(s => console.log(`      - ${s.href}`));
        }
        if (failedScripts.length > 0) {
            console.log(`   ❌ Nieudane JS: ${failedScripts.length}`);
            failedScripts.forEach(s => console.log(`      - ${s.src}`));
        }
        if (failedImages.length > 0) {
            console.log(`   ❌ Nieudane obrazy: ${failedImages.length}`);
            failedImages.forEach(i => console.log(`      - ${i.src}`));
        }

        return resources;
    }

    // TEST FORMULARZY
    async testForms() {
        console.log('\n📝 TEST FORMULARZY');
        
        const forms = await this.page.$$('form');
        const inputs = await this.page.$$('input, textarea, select');
        
        console.log(`Znaleziono ${forms.length} formularzy i ${inputs.length} pól`);

        if (inputs.length > 0) {
            // Test pierwszego pola input
            const firstInput = inputs[0];
            const inputInfo = await firstInput.evaluate(el => ({
                type: el.type,
                name: el.name,
                placeholder: el.placeholder,
                required: el.required,
                disabled: el.disabled
            }));

            console.log(`Pierwsze pole: ${inputInfo.type} (${inputInfo.name})`);
            
            try {
                await firstInput.focus();
                await firstInput.type('Test input value');
                
                const value = await firstInput.evaluate(el => el.value);
                console.log(`   ✅ Udało się wpisać tekst: "${value}"`);
                
                await this.takeScreenshot('form-filled');
            } catch (error) {
                console.log(`   ❌ Błąd podczas wypełniania: ${error.message}`);
            }
        }

        return { forms: forms.length, inputs: inputs.length };
    }

    // TEST PERFORMANCE
    async testPerformance() {
        console.log('\n⚡ TEST WYDAJNOŚCI');
        
        const metrics = await this.page.metrics();
        
        console.log(`📊 Metryki wydajności:`);
        console.log(`   - Dokumenty: ${metrics.Documents}`);
        console.log(`   - Ramki: ${metrics.Frames}`);
        console.log(`   - Nasłuchiwacze: ${metrics.JSEventListeners}`);
        console.log(`   - Węzły JS: ${metrics.Nodes}`);
        console.log(`   - Czas JS: ${Math.round(metrics.ScriptDuration * 1000)}ms`);
        console.log(`   - Zadania: ${metrics.TaskDuration ? Math.round(metrics.TaskDuration * 1000) + 'ms' : 'N/A'}`);

        // Test czas ładowania strony
        const timing = await this.page.evaluate(() => {
            const t = performance.timing;
            return {
                dns: t.domainLookupEnd - t.domainLookupStart,
                connect: t.connectEnd - t.connectStart,
                request: t.responseStart - t.requestStart,
                response: t.responseEnd - t.responseStart,
                dom: t.domContentLoadedEventEnd - t.navigationStart,
                load: t.loadEventEnd - t.navigationStart
            };
        });

        console.log(`⏱️  Czasy ładowania:`);
        console.log(`   - DNS: ${timing.dns}ms`);
        console.log(`   - Połączenie: ${timing.connect}ms`);
        console.log(`   - Żądanie: ${timing.request}ms`);
        console.log(`   - Odpowiedź: ${timing.response}ms`);
        console.log(`   - DOM gotowy: ${timing.dom}ms`);
        console.log(`   - Pełne załadowanie: ${timing.load}ms`);

        return { metrics, timing };
    }

    // TEST MOBILI
    async testMobile() {
        console.log('\n📱 TEST MOBILNY (Szczegółowy)');
        
        await this.page.setViewport({ width: 375, height: 667 });
        await this.page.reload({ waitUntil: 'networkidle2' });
        
        const mobileAnalysis = await this.page.evaluate(() => {
            const analysis = {
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                scrollable: {
                    horizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth,
                    vertical: document.documentElement.scrollHeight > document.documentElement.clientHeight
                },
                touchTargets: []
            };
            
            // Sprawdź rozmiary elementów klikalnych
            document.querySelectorAll('button, a, [onclick], [role="button"]').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    analysis.touchTargets.push({
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                        tooSmall: rect.width < 44 || rect.height < 44,
                        text: el.textContent.trim().substring(0, 30)
                    });
                }
            });
            
            return analysis;
        });

        console.log(`📐 Viewport: ${mobileAnalysis.viewport.width}x${mobileAnalysis.viewport.height}`);
        console.log(`📜 Scrollowanie:`);
        console.log(`   - Poziome: ${mobileAnalysis.scrollable.horizontal ? '❌ TAK' : '✅ NIE'}`);
        console.log(`   - Pionowe: ${mobileAnalysis.scrollable.vertical ? '✅ TAK' : '❌ NIE'}`);

        const tooSmallTargets = mobileAnalysis.touchTargets.filter(t => t.tooSmall);
        console.log(`👆 Cele dotykowe:`);
        console.log(`   - Wszystkich: ${mobileAnalysis.touchTargets.length}`);
        console.log(`   - Za małych (<44px): ${tooSmallTargets.length}`);
        
        if (tooSmallTargets.length > 0) {
            console.log(`   ❌ Problematyczne elementy:`);
            tooSmallTargets.slice(0, 5).forEach((target, i) => {
                console.log(`      ${i + 1}. ${target.width}x${target.height}px: "${target.text}"`);
            });
        }

        await this.takeScreenshot('mobile-analysis');
        return mobileAnalysis;
    }

    async runDetailedAnalysis() {
        try {
            await this.init();
            
            const mainPageAnalysis = await this.analyzeMainPage();
            await this.testUserInteractions();
            const staticAssets = await this.analyzeStaticAssets();
            const formsAnalysis = await this.testForms();
            const performance = await this.testPerformance();
            const mobileAnalysis = await this.testMobile();

            // PODSUMOWANIE
            console.log('\n🎯 SZCZEGÓŁOWE PODSUMOWANIE');
            console.log('================================');

            // Problemy krytyczne
            const criticalIssues = this.issues.filter(i => 
                i.type === 'JavaScript Error' || 
                (i.type === 'Console Error' && !i.message.includes('400'))
            );

            if (criticalIssues.length > 0) {
                console.log('\n🚨 PROBLEMY KRYTYCZNE:');
                criticalIssues.forEach((issue, i) => {
                    console.log(`${i + 1}. ${issue.type}: ${issue.message}`);
                });
            }

            // Problemy z UX
            const uxIssues = [];
            if (!mainPageAnalysis.hasMainContent) uxIssues.push('Brak głównej sekcji content');
            if (mainPageAnalysis.ctaButtons.filter(b => b.visible).length === 0) uxIssues.push('Brak widocznych przycisków CTA');
            if (mainPageAnalysis.languageSwitcher.length === 0) uxIssues.push('Brak przełącznika języka');

            if (uxIssues.length > 0) {
                console.log('\n⚠️  PROBLEMY UX:');
                uxIssues.forEach((issue, i) => {
                    console.log(`${i + 1}. ${issue}`);
                });
            }

            // Wydajność
            console.log('\n📊 WYDAJNOŚĆ:');
            if (performance.timing.load < 3000) {
                console.log('✅ Szybkie ładowanie (<3s)');
            } else if (performance.timing.load < 5000) {
                console.log('⚠️  Średnie ładowanie (3-5s)');
            } else {
                console.log('❌ Wolne ładowanie (>5s)');
            }

            // Mobile
            console.log('\n📱 MOBILE:');
            if (!mobileAnalysis.scrollable.horizontal) {
                console.log('✅ Brak poziomego scrollowania');
            } else {
                console.log('❌ Problemy z poziomym scrollowaniem');
            }

            const report = {
                timestamp: new Date().toISOString(),
                mainPage: mainPageAnalysis,
                staticAssets,
                forms: formsAnalysis,
                performance,
                mobile: mobileAnalysis,
                issues: this.issues,
                screenshots: this.screenshotCounter
            };

            fs.writeFileSync('detailed-analysis-report.json', JSON.stringify(report, null, 2));
            console.log('\n📄 Szczegółowy raport zapisany: detailed-analysis-report.json');
            console.log(`📸 Utworzono ${this.screenshotCounter} zrzutów ekranu`);

        } catch (error) {
            console.error(`🚨 Krytyczny błąd: ${error.message}`);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Uruchom szczegółową analizę
(async () => {
    const tester = new DetailedCvPerfectTester();
    await tester.runDetailedAnalysis();
})();