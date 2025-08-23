const puppeteer = require('puppeteer');
const fs = require('fs');

async function detailedAnalysisTest() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 },
        devtools: true,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });

    let detailedResults = {
        homepageUpload: { status: '❌', details: [], elements: [] },
        paymentButtons: { status: '❌', details: [], elements: [] },
        successPageElements: { status: '❌', details: [], elements: [] },
        functionalButtons: { status: '❌', details: [], elements: [] }
    };

    let allConsoleMessages = [];

    try {
        const page = await browser.newPage();
        
        // Monitor console messages
        page.on('console', msg => {
            allConsoleMessages.push({
                type: msg.type(),
                text: msg.text(),
                timestamp: new Date().toISOString(),
                url: page.url()
            });
        });

        console.log('🔍 DETAILED ANALYSIS OF CVPERFECT COMPONENTS\n');

        // ===========================================
        // 1. DETAILED HOMEPAGE UPLOAD ANALYSIS
        // ===========================================
        console.log('📋 1. HOMEPAGE UPLOAD ELEMENT ANALYSIS');
        console.log('==========================================');

        await page.goto('http://localhost:3008', { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('✅ Homepage loaded');

        // Comprehensive search for upload elements
        console.log('🔍 Searching for file upload elements...');

        // Look for all possible upload-related elements
        const allInputs = await page.$$eval('input', inputs => {
            return inputs.map(input => ({
                type: input.type,
                id: input.id,
                name: input.name,
                className: input.className,
                accept: input.accept,
                style: input.style.cssText,
                hidden: input.hidden,
                display: window.getComputedStyle(input).display
            }));
        });

        console.log(`📝 Found ${allInputs.length} input elements:`);
        allInputs.forEach((input, index) => {
            console.log(`   ${index + 1}. Type: ${input.type}, ID: ${input.id}, Class: ${input.className}`);
            console.log(`      Accept: ${input.accept}, Display: ${input.display}, Hidden: ${input.hidden}`);
            detailedResults.homepageUpload.elements.push(`Input ${index + 1}: ${input.type} (${input.className})`);
        });

        // Look for file inputs specifically
        const fileInputs = allInputs.filter(input => input.type === 'file');
        if (fileInputs.length > 0) {
            console.log(`✅ Found ${fileInputs.length} file input(s)`);
            detailedResults.homepageUpload.details.push(`✅ Found ${fileInputs.length} file input(s)`);
        } else {
            console.log('❌ No file inputs found');
            detailedResults.homepageUpload.details.push('❌ No file inputs found');
        }

        // Look for dropzone elements
        const dropzoneSearch = await page.$$eval('*', elements => {
            return elements.filter(el => {
                const text = el.textContent || '';
                const className = el.className || '';
                const id = el.id || '';
                return text.toLowerCase().includes('przeciągnij') || 
                       text.toLowerCase().includes('drag') ||
                       text.toLowerCase().includes('drop') ||
                       className.toLowerCase().includes('drop') ||
                       className.toLowerCase().includes('upload') ||
                       id.toLowerCase().includes('drop') ||
                       id.toLowerCase().includes('upload');
            }).map(el => ({
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                textContent: el.textContent.substring(0, 100)
            }));
        });

        console.log(`📝 Found ${dropzoneSearch.length} potential dropzone elements:`);
        dropzoneSearch.forEach((elem, index) => {
            console.log(`   ${index + 1}. ${elem.tagName}.${elem.className} - "${elem.textContent}"`);
            detailedResults.homepageUpload.elements.push(`Dropzone ${index + 1}: ${elem.tagName} (${elem.textContent})`);
        });

        detailedResults.homepageUpload.status = fileInputs.length > 0 || dropzoneSearch.length > 0 ? '✅' : '❌';

        // ===========================================
        // 2. DETAILED PAYMENT BUTTON ANALYSIS
        // ===========================================
        console.log('\n💳 2. PAYMENT BUTTON ANALYSIS');
        console.log('==========================================');

        // Search for all buttons and analyze them
        const allButtons = await page.$$eval('button, a, div[role="button"]', buttons => {
            return buttons.map(button => ({
                tagName: button.tagName,
                className: button.className,
                id: button.id,
                textContent: button.textContent.trim().substring(0, 50),
                dataset: Object.keys(button.dataset).map(key => `${key}:${button.dataset[key]}`),
                href: button.href || '',
                onclick: button.onclick ? 'has-onclick' : '',
                type: button.type || ''
            }));
        });

        console.log(`📝 Found ${allButtons.length} clickable elements:`);

        // Look for payment-related buttons
        const paymentButtons = allButtons.filter(button => {
            const text = button.textContent.toLowerCase();
            const className = button.className.toLowerCase();
            return text.includes('złotowy') || text.includes('gold') || text.includes('basic') || 
                   text.includes('premium') || text.includes('plan') ||
                   className.includes('plan') || className.includes('payment') ||
                   className.includes('gold') || className.includes('premium') || className.includes('basic');
        });

        console.log(`💰 Found ${paymentButtons.length} payment-related buttons:`);
        paymentButtons.forEach((button, index) => {
            console.log(`   ${index + 1}. ${button.tagName}: "${button.textContent}" (${button.className})`);
            detailedResults.paymentButtons.elements.push(`${button.tagName}: ${button.textContent} (${button.className})`);
        });

        if (paymentButtons.length > 0) {
            detailedResults.paymentButtons.details.push(`✅ Found ${paymentButtons.length} payment buttons`);
            detailedResults.paymentButtons.status = '✅';
        } else {
            detailedResults.paymentButtons.details.push('❌ No payment buttons found');
        }

        // Take detailed homepage screenshot
        await page.screenshot({ path: 'detailed-homepage-analysis.png', fullPage: true });

        // ===========================================
        // 3. SUCCESS PAGE DETAILED ANALYSIS
        // ===========================================
        console.log('\n🎉 3. SUCCESS PAGE DETAILED ANALYSIS');
        console.log('==========================================');

        await page.goto('http://localhost:3008/success', { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('✅ Success page loaded');

        // Wait for page to fully load and check for errors
        await new Promise(resolve => setTimeout(resolve, 3000));

        const successPageErrors = allConsoleMessages.filter(msg => 
            msg.url.includes('/success') && msg.type === 'error'
        );

        if (successPageErrors.length === 0) {
            console.log('✅ No console errors on success page');
            detailedResults.successPageElements.details.push('✅ No console errors detected');
        } else {
            console.log(`❌ Found ${successPageErrors.length} console errors on success page`);
            successPageErrors.forEach(error => {
                console.log(`   Error: ${error.text}`);
                detailedResults.successPageElements.details.push(`❌ Error: ${error.text}`);
            });
        }

        // Analyze all buttons on success page
        const successButtons = await page.$$eval('button, a[role="button"], div[role="button"]', buttons => {
            return buttons.map(button => ({
                tagName: button.tagName,
                className: button.className,
                id: button.id,
                textContent: button.textContent.trim().substring(0, 50),
                dataset: Object.keys(button.dataset).map(key => `${key}:${button.dataset[key]}`),
                visible: window.getComputedStyle(button).display !== 'none' && 
                        window.getComputedStyle(button).visibility !== 'hidden',
                clickable: !button.disabled
            }));
        });

        console.log(`📝 Found ${successButtons.length} buttons on success page:`);
        successButtons.forEach((button, index) => {
            console.log(`   ${index + 1}. ${button.tagName}: "${button.textContent}" (${button.className}) - Visible: ${button.visible}, Clickable: ${button.clickable}`);
            detailedResults.successPageElements.elements.push(`${button.tagName}: ${button.textContent} (Visible: ${button.visible})`);
        });

        // Look for key functional buttons
        const functionalButtons = successButtons.filter(button => {
            const text = button.textContent.toLowerCase();
            return text.includes('optymalizuj') || text.includes('optimize') ||
                   text.includes('email') || text.includes('pobierz') || text.includes('download') ||
                   text.includes('pdf') || text.includes('docx');
        });

        console.log(`🔧 Found ${functionalButtons.length} functional buttons:`);
        functionalButtons.forEach((button, index) => {
            console.log(`   ${index + 1}. ${button.textContent} (${button.className})`);
            detailedResults.functionalButtons.elements.push(`${button.textContent} (${button.className})`);
        });

        if (functionalButtons.length >= 4) { // Should have AI optimize, PDF, DOCX, Email
            detailedResults.functionalButtons.details.push('✅ All main functional buttons present');
            detailedResults.functionalButtons.status = '✅';
        } else {
            detailedResults.functionalButtons.details.push(`⚠️ Only ${functionalButtons.length}/4 functional buttons found`);
        }

        // Check for templates
        const templates = await page.$$eval('*', elements => {
            return elements.filter(el => {
                const className = el.className || '';
                const text = el.textContent || '';
                return className.toLowerCase().includes('template') ||
                       text.toLowerCase().includes('prosty') ||
                       text.toLowerCase().includes('nowoczesny') ||
                       text.toLowerCase().includes('wykonawczy');
            }).map(el => ({
                tagName: el.tagName,
                className: el.className,
                textContent: el.textContent.substring(0, 50)
            }));
        });

        console.log(`📋 Found ${templates.length} template-related elements:`);
        templates.forEach((template, index) => {
            console.log(`   ${index + 1}. ${template.tagName}: "${template.textContent}" (${template.className})`);
        });

        detailedResults.successPageElements.status = successPageErrors.length === 0 ? '✅' : '❌';

        // Take detailed success page screenshot
        await page.screenshot({ path: 'detailed-success-analysis.png', fullPage: true });

        // ===========================================
        // GENERATE DETAILED REPORT
        // ===========================================
        console.log('\n📊 DETAILED ANALYSIS REPORT');
        console.log('==========================================');

        const report = {
            timestamp: new Date().toISOString(),
            testResults: detailedResults,
            consoleErrors: allConsoleMessages.filter(msg => msg.type === 'error'),
            summary: {
                homepageUploadFound: detailedResults.homepageUpload.status === '✅',
                paymentButtonsFound: detailedResults.paymentButtons.status === '✅',
                successPageWorking: detailedResults.successPageElements.status === '✅',
                functionalButtonsPresent: detailedResults.functionalButtons.status === '✅'
            }
        };

        // Save detailed report
        fs.writeFileSync('detailed-analysis-report.json', JSON.stringify(report, null, 2));

        // Display results
        Object.entries(detailedResults).forEach(([testName, result]) => {
            console.log(`\n${result.status} ${testName.toUpperCase()}`);
            result.details.forEach(detail => console.log(`   ${detail}`));
            if (result.elements.length > 0) {
                console.log(`   Elements found: ${result.elements.length}`);
                result.elements.slice(0, 3).forEach(elem => console.log(`     - ${elem}`));
                if (result.elements.length > 3) {
                    console.log(`     ... and ${result.elements.length - 3} more`);
                }
            }
        });

        return report;

    } catch (error) {
        console.log(`❌ Detailed analysis failed: ${error.message}`);
        return { error: error.message };
    } finally {
        await browser.close();
    }
}

// Run detailed analysis
detailedAnalysisTest().then(report => {
    console.log('\n✨ Detailed analysis completed!');
    console.log('📁 Results saved to detailed-analysis-report.json');
    console.log('📸 Screenshots saved for visual verification');
    process.exit(0);
}).catch(error => {
    console.error('💥 Detailed analysis failed:', error);
    process.exit(1);
});