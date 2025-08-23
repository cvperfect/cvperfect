const puppeteer = require('puppeteer');
const path = require('path');

async function testCVOptimizationSystem() {
    console.log('🚀 Starting CV Optimization System Test...');
    
    const browser = await puppeteer.launch({
        headless: false, // Set to false to see what's happening
        devtools: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--allow-running-insecure-content'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Listen to console messages
    page.on('console', msg => {
        console.log('🖥️ BROWSER CONSOLE:', msg.text());
    });

    // Listen to page errors
    page.on('pageerror', error => {
        console.log('❌ PAGE ERROR:', error.message);
    });

    try {
        console.log('\n📍 Step 1: Navigate to success page simulation');
        console.log('🌐 Going to http://localhost:3007/success');
        
        await page.goto('http://localhost:3007/success', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Take screenshot of success page
        await page.screenshot({ 
            path: 'test-success-page-load.png',
            fullPage: true 
        });
        console.log('✅ Screenshot saved: test-success-page-load.png');

        // Check what's shown on success page
        const pageTitle = await page.title();
        console.log('📄 Page title:', pageTitle);

        const bodyText = await page.evaluate(() => {
            return document.body.innerText.substring(0, 500) + '...';
        });
        console.log('📝 Page content preview:', bodyText);

        console.log('\n📍 Step 2: Navigate to homepage and test CV upload');
        console.log('🌐 Going to http://localhost:3007');
        
        await page.goto('http://localhost:3007', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        // Take screenshot of homepage
        await page.screenshot({ 
            path: 'test-homepage-load.png',
            fullPage: true 
        });
        console.log('✅ Screenshot saved: test-homepage-load.png');

        // Look for file upload elements
        console.log('\n🔍 Searching for file upload elements...');
        
        const uploadElements = await page.evaluate(() => {
            const elements = [];
            
            // Look for file inputs
            const fileInputs = document.querySelectorAll('input[type="file"]');
            elements.push(`Found ${fileInputs.length} file input elements`);
            
            // Look for drag-drop areas (common classes/attributes)
            const dragAreas = document.querySelectorAll('[class*="drag"], [class*="drop"], [class*="upload"]');
            elements.push(`Found ${dragAreas.length} potential drag-drop areas`);
            
            // Look for upload-related text
            const uploadText = document.body.innerText.toLowerCase();
            const hasUploadText = uploadText.includes('upload') || uploadText.includes('przeciągnij') || uploadText.includes('dodaj cv');
            elements.push(`Upload-related text found: ${hasUploadText}`);
            
            return elements;
        });

        uploadElements.forEach(element => console.log('📤', element));

        // Try to find specific CV upload areas
        console.log('\n🎯 Looking for specific CV upload areas...');
        
        try {
            // Look for any button or area that might trigger file upload
            const uploadTriggers = await page.$$eval('*', elements => {
                return elements.filter(el => {
                    const text = el.innerText?.toLowerCase() || '';
                    const className = el.className?.toLowerCase() || '';
                    return text.includes('cv') || text.includes('przeciągnij') || 
                           text.includes('upload') || className.includes('upload');
                }).slice(0, 5).map(el => ({
                    tag: el.tagName,
                    text: el.innerText?.substring(0, 100),
                    class: el.className
                }));
            });

            console.log('🎯 Upload triggers found:', uploadTriggers);

            // Try to simulate file upload if we find input elements
            const fileInputs = await page.$$('input[type="file"]');
            if (fileInputs.length > 0) {
                console.log('📁 Found file inputs, attempting to simulate upload...');
                
                // Create a simple test file path (we'll use package.json as a test file)
                const testFilePath = path.join(__dirname, 'package.json');
                
                try {
                    await fileInputs[0].uploadFile(testFilePath);
                    console.log('✅ File upload simulation successful');
                    
                    // Wait for any processing
                    await page.waitForTimeout(2000);
                    
                    // Check for notification
                    const notification = await page.evaluate(() => {
                        const body = document.body.innerText.toLowerCase();
                        return body.includes('plik cv zostal odczytany') || 
                               body.includes('file read') ||
                               body.includes('uploaded');
                    });
                    
                    console.log('🔔 Upload notification found:', notification);
                    
                } catch (uploadError) {
                    console.log('⚠️ File upload simulation failed:', uploadError.message);
                }
            }

        } catch (error) {
            console.log('⚠️ Error during upload area search:', error.message);
        }

        console.log('\n📍 Step 3: Test success.js AI optimization');
        console.log('🌐 Going back to http://localhost:3007/success');
        
        await page.goto('http://localhost:3007/success', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        // Check browser console for CV optimization logs
        console.log('🔍 Monitoring console for AI optimization logs...');
        
        // Wait and monitor console
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Try to trigger any AI optimization if there are buttons
        try {
            const optimizationButtons = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                return buttons.filter(btn => {
                    const text = btn.innerText?.toLowerCase() || '';
                    return text.includes('optimize') || text.includes('optymalizuj') || 
                           text.includes('ai') || text.includes('analyze');
                }).map(btn => btn.innerText);
            });

            console.log('🤖 AI optimization buttons found:', optimizationButtons);

            if (optimizationButtons.length > 0) {
                console.log('🎯 Attempting to trigger AI optimization...');
                await page.click('button');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

        } catch (error) {
            console.log('⚠️ Error during AI optimization trigger:', error.message);
        }

        // Take final screenshot of success page
        await page.screenshot({ 
            path: 'test-success-page-final.png',
            fullPage: true 
        });
        console.log('✅ Final screenshot saved: test-success-page-final.png');

        console.log('\n📍 Step 4: Check console logs summary');
        
        // Get any errors or logs from the page
        const consoleLogs = await page.evaluate(() => {
            return {
                errors: window.console._errors || [],
                logs: window.console._logs || [],
                currentURL: window.location.href,
                userAgent: navigator.userAgent
            };
        });

        console.log('📊 Page info:', {
            url: consoleLogs.currentURL,
            userAgent: consoleLogs.userAgent.substring(0, 100) + '...'
        });

        console.log('\n✅ Testing completed successfully!');
        console.log('📸 Screenshots saved:');
        console.log('   - test-homepage-load.png');
        console.log('   - test-success-page-load.png');  
        console.log('   - test-success-page-final.png');

    } catch (error) {
        console.error('❌ Test failed:', error);
        
        // Take error screenshot
        try {
            await page.screenshot({ 
                path: 'test-error-screenshot.png',
                fullPage: true 
            });
            console.log('📸 Error screenshot saved: test-error-screenshot.png');
        } catch (screenshotError) {
            console.log('❌ Could not take error screenshot:', screenshotError.message);
        }
    } finally {
        await browser.close();
    }
}

// Run the test
testCVOptimizationSystem().catch(console.error);