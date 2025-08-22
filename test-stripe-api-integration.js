// Stripe API Integration Test - Direct API testing for CvPerfect
// Tests Stripe API endpoints and session management

const fetch = require('node-fetch');
const fs = require('fs').promises;

const BASE_URL = 'http://localhost:3007';

// Test data
const TEST_CV_DATA = `Jan Kowalski
Software Developer

DOŚWIADCZENIE ZAWODOWE:
• Senior Developer w TechCorp (2021-2024)
  - Rozwój aplikacji webowych w React i Node.js
  - Zarządzanie zespołem 5 programistów

• Mid-level Developer w StartupXYZ (2019-2021)
  - Tworzenie API REST w Node.js i Express
  - Praca z bazami danych MongoDB i PostgreSQL

WYKSZTAŁCENIE:
• Informatyka, Politechnika Warszawska (2015-2019)
  - Specjalizacja: Inżynieria Oprogramowania

UMIEJĘTNOŚCI TECHNICZNE:
• Języki programowania: JavaScript, Python, TypeScript
• Frameworki: React, Vue.js, Angular, Express
• Bazy danych: MongoDB, PostgreSQL, Redis`;

const JOB_POSTING = `Poszukujemy Senior Full-Stack Developer:
• Min. 5 lat doświadczenia w JavaScript/TypeScript
• Znajomość React, Node.js, i baz danych
• Doświadczenie z systemami płatności online`;

class StripeApiTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            apiTests: [],
            paymentFlowTests: [],
            sessionTests: [],
            errors: []
        };
    }

    async testApiEndpoint(url, method = 'GET', data = null, description = '') {
        console.log(`🧪 Testing ${method} ${url} - ${description}`);
        
        try {
            const requestOptions = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                requestOptions.body = JSON.stringify(data);
            }

            const response = await fetch(url, requestOptions);
            
            let responseData;
            try {
                responseData = await response.json();
            } catch (e) {
                responseData = await response.text();
            }

            const result = {
                url,
                method,
                description,
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                data: responseData,
                headers: Object.fromEntries(response.headers.entries()),
                error: null,
                timestamp: new Date().toISOString()
            };

            this.results.apiTests.push(result);
            
            if (response.ok) {
                console.log(`✅ ${method} ${url} - Success (${response.status})`);
            } else {
                console.log(`❌ ${method} ${url} - Failed (${response.status}): ${response.statusText}`);
            }
            
            return result;
        } catch (error) {
            const result = {
                url,
                method,
                description,
                status: 0,
                statusText: 'Network Error',
                ok: false,
                data: null,
                headers: {},
                error: error.message,
                timestamp: new Date().toISOString()
            };
            
            this.results.apiTests.push(result);
            console.log(`💥 ${method} ${url} - Network Error: ${error.message}`);
            return result;
        }
    }

    async testSessionManagement() {
        console.log('\n🗃️  Testing Session Management...');
        
        const sessionId = `test_session_${Date.now()}`;
        const sessionData = {
            sessionId,
            cvData: TEST_CV_DATA,
            jobPosting: JOB_POSTING,
            email: 'test.user@example.com',
            plan: 'basic',
            template: 'simple',
            photo: null
        };

        // Test save-session endpoint
        const saveResult = await this.testApiEndpoint(
            `${BASE_URL}/api/save-session`,
            'POST',
            sessionData,
            'Save session data before payment'
        );

        // Test get-session-data endpoint
        const getResult = await this.testApiEndpoint(
            `${BASE_URL}/api/get-session-data?session_id=${sessionId}`,
            'GET',
            null,
            'Retrieve saved session data'
        );

        this.results.sessionTests.push({
            sessionId,
            saveSuccess: saveResult.ok,
            getSuccess: getResult.ok,
            dataIntegrity: getResult.ok && getResult.data?.session?.metadata?.cv === TEST_CV_DATA
        });

        return { sessionId, saveResult, getResult };
    }

    async testPaymentPlans() {
        console.log('\n💳 Testing Payment Plan Creation...');

        const plans = [
            { name: 'basic', price: '19.99 zł', priceId: 'price_1Rwooh4FWb3xY5tDRxqQ4y69' },
            { name: 'gold', price: '49 zł', priceId: 'price_1Rwooh4FWb3xY5tDRxqQ4y69' },
            { name: 'premium', price: '79 zł', priceId: 'price_1Rwooh4FWb3xY5tDRxqQ4y69' }
        ];

        const paymentResults = [];

        for (const plan of plans) {
            console.log(`\n💰 Testing ${plan.name.toUpperCase()} Plan (${plan.price})...`);

            // First save session data
            const sessionId = `checkout_session_${Date.now()}_${plan.name}`;
            const sessionData = {
                sessionId,
                cvData: TEST_CV_DATA,
                jobPosting: JOB_POSTING,
                email: 'test.payment@example.com',
                plan: plan.name,
                template: 'simple',
                photo: null
            };

            await this.testApiEndpoint(
                `${BASE_URL}/api/save-session`,
                'POST',
                sessionData,
                `Save session for ${plan.name} plan`
            );

            // Test create-checkout-session
            const checkoutData = {
                plan: plan.name,
                email: 'test.payment@example.com',
                cv: TEST_CV_DATA.substring(0, 400), // Stripe metadata limit
                job: JOB_POSTING.substring(0, 200),
                fullSessionId: sessionId
            };

            const checkoutResult = await this.testApiEndpoint(
                `${BASE_URL}/api/create-checkout-session`,
                'POST',
                checkoutData,
                `Create Stripe checkout for ${plan.name}`
            );

            paymentResults.push({
                plan: plan.name,
                price: plan.price,
                sessionId,
                checkoutSuccess: checkoutResult.ok,
                stripeUrl: checkoutResult.data?.url,
                stripeSessionId: checkoutResult.data?.id,
                error: checkoutResult.error
            });

            // If checkout was successful, test session retrieval from Stripe
            if (checkoutResult.ok && checkoutResult.data?.id) {
                await this.testApiEndpoint(
                    `${BASE_URL}/api/get-session-data?session_id=${checkoutResult.data.id}`,
                    'GET',
                    null,
                    `Retrieve Stripe session for ${plan.name}`
                );
            }
        }

        this.results.paymentFlowTests = paymentResults;
        return paymentResults;
    }

    async testStripeWebhookPayload() {
        console.log('\n🔌 Testing Stripe Webhook Understanding...');

        // Test webhook endpoint (should fail without proper signature, but we can see if it's accessible)
        const webhookResult = await this.testApiEndpoint(
            `${BASE_URL}/api/stripe-webhook`,
            'POST',
            { test: 'payload' },
            'Test webhook endpoint accessibility'
        );

        // This should return 400 because we don't have proper Stripe signature
        return webhookResult;
    }

    async testApiHealthCheck() {
        console.log('\n🏥 Testing API Health...');

        // Test basic endpoints accessibility
        const healthTests = [
            { endpoint: '/api/save-session', method: 'OPTIONS', description: 'CORS preflight for save-session' },
            { endpoint: '/api/get-session-data', method: 'OPTIONS', description: 'CORS preflight for get-session-data' },
            { endpoint: '/api/create-checkout-session', method: 'GET', description: 'GET method support for checkout' }
        ];

        for (const test of healthTests) {
            await this.testApiEndpoint(
                `${BASE_URL}${test.endpoint}`,
                test.method,
                null,
                test.description
            );
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Stripe API Integration Tests...\n');

        try {
            // Test API health
            await this.testApiHealthCheck();

            // Test session management
            await this.testSessionManagement();

            // Test payment plans
            await this.testPaymentPlans();

            // Test webhook understanding
            await this.testStripeWebhookPayload();

            return this.results;

        } catch (error) {
            console.error('❌ Test suite error:', error);
            this.results.errors.push(error.message);
            throw error;
        }
    }

    async generateReport() {
        const report = {
            ...this.results,
            summary: {
                totalApiTests: this.results.apiTests.length,
                successfulApiTests: this.results.apiTests.filter(t => t.ok).length,
                failedApiTests: this.results.apiTests.filter(t => !t.ok).length,
                paymentFlowTests: this.results.paymentFlowTests.length,
                successfulPaymentFlows: this.results.paymentFlowTests.filter(t => t.checkoutSuccess).length,
                sessionTests: this.results.sessionTests.length,
                totalErrors: this.results.errors.length
            }
        };

        // Add analysis
        report.analysis = {
            apiEndpointsWorking: report.summary.successfulApiTests > 0,
            sessionManagementWorking: this.results.sessionTests.some(t => t.saveSuccess && t.getSuccess),
            paymentCreationWorking: this.results.paymentFlowTests.some(t => t.checkoutSuccess),
            commonErrors: this.results.apiTests
                .filter(t => !t.ok)
                .map(t => `${t.status}: ${t.statusText}`)
                .filter((v, i, a) => a.indexOf(v) === i)
        };

        // Add recommendations
        report.recommendations = [];
        
        if (report.summary.failedApiTests > 0) {
            report.recommendations.push('Fix API endpoint errors to ensure payment flow reliability');
        }
        
        if (!report.analysis.sessionManagementWorking) {
            report.recommendations.push('Fix session management - critical for payment data preservation');
        }
        
        if (!report.analysis.paymentCreationWorking) {
            report.recommendations.push('Fix Stripe checkout session creation - payments cannot work without this');
        }

        report.recommendations.push('Test with real Stripe test cards for complete payment flow validation');
        report.recommendations.push('Implement proper error handling and user feedback for failed payments');
        report.recommendations.push('Add logging and monitoring for payment transactions');

        // Save report
        const reportFile = 'stripe-api-integration-report.json';
        await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
        
        // Print summary
        console.log('\n' + '='.repeat(70));
        console.log('🎯 STRIPE API INTEGRATION TEST RESULTS');
        console.log('='.repeat(70));
        console.log(`📊 API Tests: ${report.summary.successfulApiTests}/${report.summary.totalApiTests} successful`);
        console.log(`💳 Payment Flows: ${report.summary.successfulPaymentFlows}/${report.summary.paymentFlowTests} successful`);
        console.log(`🗃️  Session Tests: ${report.summary.sessionTests} performed`);
        console.log(`⚠️  Total Errors: ${report.summary.totalErrors}`);
        console.log('\n📋 ANALYSIS:');
        console.log(`✅ API Endpoints Working: ${report.analysis.apiEndpointsWorking}`);
        console.log(`✅ Session Management: ${report.analysis.sessionManagementWorking}`);
        console.log(`✅ Payment Creation: ${report.analysis.paymentCreationWorking}`);
        
        if (report.analysis.commonErrors.length > 0) {
            console.log(`\n❌ Common Errors:`);
            report.analysis.commonErrors.forEach(error => console.log(`   • ${error}`));
        }
        
        console.log('\n📝 RECOMMENDATIONS:');
        report.recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`));
        console.log('='.repeat(70));
        console.log(`📄 Full report saved: ${reportFile}`);
        
        return report;
    }
}

// Main execution
async function runStripeApiTests() {
    const tester = new StripeApiTester();
    
    try {
        await tester.runAllTests();
        return await tester.generateReport();
    } catch (error) {
        console.error('❌ Test execution failed:', error);
        await tester.generateReport(); // Generate partial report
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    runStripeApiTests()
        .then(report => {
            console.log('\n✅ Stripe API integration test completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Test suite failed:', error.message);
            process.exit(1);
        });
}

module.exports = { runStripeApiTests };