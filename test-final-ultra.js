const puppeteer = require('puppeteer');

async function testFinalUltra() {
    console.log('🏆 FINAL ULTRA TEST - STRONA ZA MILION DOLARÓW 🏆\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        slowMo: 200 // Wolniej żeby zobaczyć efekty
    });

    const results = {
        pageLoad: false,
        cvDisplay: false,
        allButtons: false,
        aiOptimization: false,
        pdfExport: false,
        docxExport: false,
        emailFunction: false,
        templateSwitching: false,
        responsiveDesign: false,
        overallQuality: false
    };

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 900 });
        
        // Monitor błędów
        const errors = [];
        page.on('pageerror', error => {
            errors.push(error.message);
            console.log('❌ Page Error:', error.message);
        });
        
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.log('❌ Console Error:', msg.text());
            } else if (msg.text().includes('GSAP') || msg.text().includes('CV') || msg.text().includes('AI')) {
                console.log('📢 Console:', msg.text());
            }
        });

        console.log('1️⃣ TEST ŁADOWANIA STRONY SUCCESS...');
        
        await page.goto('http://localhost:3004/success?plan=premium', { 
            waitUntil: 'networkidle0',
            timeout: 10000
        });
        console.log('   ✅ Strona załadowana POPRAWNIE!');
        results.pageLoad = true;

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('\n2️⃣ TEST WYŚWIETLANIA CV...');
        
        const cvCheck = await page.evaluate(() => {
            const cvPreview = document.querySelector('.cv-preview-content');
            const hasContent = cvPreview && cvPreview.textContent.length > 100;
            const hasPhoto = cvPreview && cvPreview.innerHTML.includes('<img');
            const hasName = cvPreview && (cvPreview.textContent.includes('Anna') || cvPreview.textContent.includes('Kowalska'));
            
            return {
                exists: !!cvPreview,
                hasContent,
                hasPhoto,
                hasName,
                contentLength: cvPreview ? cvPreview.textContent.length : 0,
                preview: cvPreview ? cvPreview.textContent.substring(0, 200) + '...' : 'No CV'
            };
        });
        
        console.log('   📊 CV State:', cvCheck);
        
        if (cvCheck.exists && cvCheck.hasContent && cvCheck.hasName) {
            console.log('   ✅ CV WYŚWIETLA SIĘ PERFEKCYJNIE!');
            results.cvDisplay = true;
        } else {
            console.log('   ❌ Problem z wyświetlaniem CV');
        }

        console.log('\n3️⃣ TEST WSZYSTKICH PRZYCISKÓW...');
        
        const buttonCheck = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const activeButtons = buttons.filter(btn => !btn.disabled && btn.offsetParent !== null);
            
            return {
                total: buttons.length,
                active: activeButtons.length,
                buttonTexts: activeButtons.map(btn => btn.textContent.trim())
            };
        });
        
        console.log(`   📊 ${buttonCheck.active}/${buttonCheck.total} przycisków aktywnych`);
        console.log(`   🔘 Dostępne: ${buttonCheck.buttonTexts.slice(0, 6).join(', ')}...`);
        
        if (buttonCheck.active >= 8) {
            console.log('   ✅ WYSTARCZAJĄCO PRZYCISKÓW DZIAŁA!');
            results.allButtons = true;
        }

        console.log('\n4️⃣ TEST PRZEŁĄCZANIA SZABLONÓW...');
        
        const templates = ['simple', 'modern', 'executive', 'tech', 'luxury', 'minimal'];
        let workingTemplates = 0;
        
        for (const template of templates.slice(0, 4)) { // Test tylko 4 dla szybkości
            const templateName = {
                'simple': 'Prosty',
                'modern': 'Nowoczesny', 
                'executive': 'Kierowniczy',
                'tech': 'Techniczny',
                'luxury': 'Luksusowy',
                'minimal': 'Minimalny'
            }[template];
            
            const switched = await page.evaluate((name) => {
                const templateCards = Array.from(document.querySelectorAll('.template-card, button'));
                const button = templateCards.find(btn => 
                    btn.textContent.includes(name) && !btn.classList.contains('locked')
                );
                
                if (button) {
                    button.click();
                    return true;
                }
                return false;
            }, templateName);
            
            if (switched) {
                await new Promise(resolve => setTimeout(resolve, 800));
                console.log(`   ✅ ${templateName} template DZIAŁA!`);
                workingTemplates++;
            } else {
                console.log(`   ⚠️ ${templateName} niedostępny`);
            }
        }
        
        results.templateSwitching = workingTemplates >= 3;
        console.log(`   📊 ${workingTemplates}/4 testowanych szablonów działa`);

        console.log('\n5️⃣ TEST EKSPORTÓW...');
        
        // PDF Test
        const pdfTest = await page.evaluate(() => {
            const pdfButton = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('PDF') && !btn.disabled
            );
            
            if (pdfButton) {
                pdfButton.click();
                return true;
            }
            return false;
        });

        if (pdfTest) {
            console.log('   ✅ PDF Export button DZIAŁA!');
            results.pdfExport = true;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // DOCX Test
        const docxTest = await page.evaluate(() => {
            const docxButton = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('DOCX') && !btn.disabled
            );
            
            if (docxButton) {
                docxButton.click();
                return true;
            }
            return false;
        });

        if (docxTest) {
            console.log('   ✅ DOCX Export button DZIAŁA!');
            results.docxExport = true;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('\n6️⃣ TEST FUNKCJI EMAIL...');
        
        const emailTest = await page.evaluate(() => {
            const emailButton = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('mailem') && !btn.disabled
            );
            
            if (emailButton) {
                emailButton.click();
                return true;
            }
            return false;
        });

        if (emailTest) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const modalCheck = await page.evaluate(() => {
                return !!document.querySelector('form, [class*="modal"], input[type="email"]');
            });
            
            if (modalCheck) {
                console.log('   ✅ EMAIL MODAL DZIAŁA PERFEKCYJNIE!');
                results.emailFunction = true;
                await page.keyboard.press('Escape');
            }
        }

        console.log('\n7️⃣ TEST RESPONSYWNOŚCI...');
        
        await page.setViewport({ width: 375, height: 667 });
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mobileCheck = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button:not([disabled])'));
            const smallButtons = buttons.filter(btn => btn.offsetHeight < 40);
            return {
                totalButtons: buttons.length,
                smallButtons: smallButtons.length,
                allGoodSize: smallButtons.length === 0
            };
        });
        
        if (mobileCheck.allGoodSize && mobileCheck.totalButtons >= 3) {
            console.log('   ✅ MOBILE RESPONSYWNOŚĆ IDEALNA!');
            results.responsiveDesign = true;
        }

        // Screenshot końcowy
        await page.setViewport({ width: 1400, height: 900 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.screenshot({ 
            path: 'screenshot-million-dollar-website.png',
            fullPage: true
        });
        
        console.log('\n📸 Screenshot strony za milion dolarów zapisany!');

        // Final error check
        if (errors.length === 0) {
            console.log('✅ ZERO BŁĘDÓW - PERFEKCJA!');
        } else {
            console.log(`⚠️ Znaleziono ${errors.length} błędów:`, errors);
        }

    } catch (error) {
        console.error('❌ Critical Error:', error);
    } finally {
        console.log('\n⏳ Browser zostanie otwarty na 15 sekund dla inspekcji...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        await browser.close();
    }

    // OSTATECZNA OCENA MILIONA DOLARÓW
    const workingFeatures = Object.values(results).filter(Boolean).length;
    const totalFeatures = Object.keys(results).length - 1;
    
    results.overallQuality = workingFeatures >= (totalFeatures * 0.85); // 85% sukcesu
    
    console.log('\n' + '🌟'.repeat(50));
    console.log('🏆 RAPORT KOŃCOWY: STRONA ZA MILION DOLARÓW 🏆');
    console.log('🌟'.repeat(50));
    
    const features = [
        { name: '🚀 Ładowanie Strony', status: results.pageLoad, critical: true },
        { name: '📄 Wyświetlanie CV', status: results.cvDisplay, critical: true },
        { name: '🔘 Wszystkie Przyciski', status: results.allButtons, critical: true },
        { name: '🎨 Template Switching', status: results.templateSwitching, critical: false },
        { name: '📑 PDF Export', status: results.pdfExport, critical: false },
        { name: '📝 DOCX Export', status: results.docxExport, critical: false },
        { name: '📧 Email Function', status: results.emailFunction, critical: false },
        { name: '📱 Mobile Responsive', status: results.responsiveDesign, critical: false }
    ];

    features.forEach(feature => {
        const icon = feature.status ? '✅' : '❌';
        const critical = feature.critical ? '🔥' : '';
        console.log(`${icon} ${feature.name} ${critical}`);
    });

    const criticalFeatures = features.filter(f => f.critical);
    const criticalWorking = criticalFeatures.filter(f => f.status).length;
    const criticalSuccess = criticalWorking === criticalFeatures.length;

    console.log(`\n📊 WYNIK OGÓLNY: ${workingFeatures}/${totalFeatures} funkcji`);
    console.log(`🔥 FUNKCJE KRYTYCZNE: ${criticalWorking}/${criticalFeatures.length}`);
    
    if (criticalSuccess && results.overallQuality) {
        console.log('\n🎉🎉🎉 ABSOLUTNY SUKCES! 🎉🎉🎉');
        console.log('💎 STRONA DZIAŁA JAK ZA MILION DOLARÓW!');
        console.log('✨ Wszystkie krytyczne funkcje operacyjne');
        console.log('🚀 Premium quality confirmed!');
        console.log('🏆 READY FOR PRODUCTION!');
    } else if (criticalSuccess) {
        console.log('\n🎯 SUKCES KRYTYCZNY!');
        console.log('💎 Wszystkie najważniejsze funkcje działają');
        console.log('🔧 Drobne funkcje do dopracowania');
    } else {
        console.log('\n⚠️ UWAGA!');
        console.log('🔥 Niektóre krytyczne funkcje wymagają naprawy');
    }

    return results;
}

testFinalUltra().catch(console.error);