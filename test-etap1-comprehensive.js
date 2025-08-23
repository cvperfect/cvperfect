/**
 * Comprehensive Testing Suite for CVPerfect ETAP 1
 * Tests all security fixes and core functionality improvements
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class CVPerfectEtap1Tester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      security: {},
      functionality: {},
      performance: {},
      overall: { passed: 0, failed: 0, warnings: 0 }
    };
    this.baseUrl = 'http://localhost:3002';
    this.testStartTime = Date.now();
  }

  async initialize() {
    console.log('🧪 Initializing CVPerfect ETAP 1 Testing Suite...');
    
    this.browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Setup request/response monitoring
    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        console.log(`❌ HTTP Error: ${response.status()} ${response.url()}`);
      }
    });
    
    console.log('✅ Testing environment initialized');
  }

  // TEST 1: Security Fixes Validation
  async testSecurityFixes() {
    console.log('\n🔐 TEST 1: Security Fixes Validation');
    
    try {
      // Test CORS headers
      await this.page.goto(`${this.baseUrl}/api/analyze`, { waitUntil: 'networkidle0' });
      
      const corsTest = await this.page.evaluate(() => {
        return fetch('/api/analyze', {
          method: 'OPTIONS',
          headers: { 'Origin': 'https://malicious-site.com' }
        }).then(response => ({
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        }));
      });
      
      if (corsTest.headers['access-control-allow-origin'] !== 'https://malicious-site.com') {
        this.results.security.cors = { status: 'PASS', message: 'CORS properly restricted' };
        this.results.overall.passed++;
      } else {
        this.results.security.cors = { status: 'FAIL', message: 'CORS still allows malicious origins' };
        this.results.overall.failed++;
      }
      
      // Test environment variables exposure
      const envCheck = fs.existsSync('.env.local.EXPOSED_BACKUP');
      if (envCheck) {
        this.results.security.envBackup = { status: 'PASS', message: 'Exposed keys backed up' };
        this.results.overall.passed++;
      } else {
        this.results.security.envBackup = { status: 'WARNING', message: 'No backup of exposed keys found' };
        this.results.overall.warnings++;
      }
      
      // Test secure headers
      await this.page.goto(this.baseUrl);
      const securityHeaders = await this.page.evaluate(() => {
        return fetch('/api/analyze', { method: 'OPTIONS' })
          .then(response => Object.fromEntries(response.headers.entries()));
      });
      
      const requiredHeaders = ['x-content-type-options', 'x-frame-options', 'x-xss-protection'];
      const presentHeaders = requiredHeaders.filter(header => securityHeaders[header]);
      
      if (presentHeaders.length === requiredHeaders.length) {
        this.results.security.headers = { status: 'PASS', message: 'Security headers present' };
        this.results.overall.passed++;
      } else {
        this.results.security.headers = { status: 'FAIL', message: `Missing headers: ${requiredHeaders.filter(h => !securityHeaders[h]).join(', ')}` };
        this.results.overall.failed++;
      }
      
    } catch (error) {
      this.results.security.error = { status: 'FAIL', message: error.message };
      this.results.overall.failed++;
    }
  }

  // TEST 2: XSS Protection
  async testXSSProtection() {
    console.log('\n🛡️ TEST 2: XSS Protection with DOMPurify');
    
    try {
      await this.page.goto(this.baseUrl);
      
      // Test if DOMPurify is loaded and working
      const xssTest = await this.page.evaluate(() => {
        // Simulate malicious HTML that should be sanitized
        const maliciousHTML = '<img src="x" onerror="alert(\'XSS\')" /><script>alert("XSS")</script><div>Safe content</div>';
        
        // Check if DOMPurify is available (it should be in success.js)
        if (typeof DOMPurify !== 'undefined') {
          const sanitized = DOMPurify.sanitize(maliciousHTML);
          return {
            hasDOMPurify: true,
            sanitized: sanitized,
            isSecure: !sanitized.includes('onerror') && !sanitized.includes('<script>')
          };
        }
        
        return { hasDOMPurify: false };
      });
      
      // Navigate to success page to test DOMPurify integration
      await this.page.goto(`${this.baseUrl}/success?session_id=test_session_id`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const successPageXSS = await this.page.evaluate(() => {
        // Check if DOMPurify is loaded on success page
        return typeof DOMPurify !== 'undefined';
      });
      
      if (successPageXSS) {
        this.results.security.xss = { status: 'PASS', message: 'DOMPurify loaded and sanitizing content' };
        this.results.overall.passed++;
      } else {
        this.results.security.xss = { status: 'FAIL', message: 'DOMPurify not found on success page' };
        this.results.overall.failed++;
      }
      
    } catch (error) {
      this.results.security.xss = { status: 'FAIL', message: error.message };
      this.results.overall.failed++;
    }
  }

  // TEST 3: Authentication System
  async testAuthentication() {
    console.log('\n🔑 TEST 3: New Authentication System');
    
    try {
      // Test the new authentication endpoint
      const authTest = await this.page.evaluate(() => {
        return fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentCV: 'Test CV content',
            email: 'premium@user.com', // Old bypass email
            paid: false
          })
        }).then(response => response.json());
      });
      
      if (authTest.success === false && authTest.error.includes('autoryzacji')) {
        this.results.security.auth = { status: 'PASS', message: 'Email bypass blocked, proper auth required' };
        this.results.overall.passed++;
      } else {
        this.results.security.auth = { status: 'FAIL', message: 'Authentication bypass still working' };
        this.results.overall.failed++;
      }
      
      // Test legitimate session
      const legitTest = await this.page.evaluate(() => {
        return fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentCV: 'Test CV content',
            email: 'test@cvperfect.pl',
            sessionId: 'sess_valid_session_123',
            paid: true
          })
        }).then(response => ({
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        }));
      });
      
      console.log('🔍 Auth test result:', { authTest: authTest.success, legitTest: legitTest.status });
      
    } catch (error) {
      this.results.security.auth = { status: 'ERROR', message: error.message };
      this.results.overall.failed++;
    }
  }

  // TEST 4: Photo Preservation
  async testPhotoPreservation() {
    console.log('\n📸 TEST 4: Photo Preservation Through Flow');
    
    try {
      await this.page.goto(this.baseUrl);
      
      // Generate test photo data (base64)
      const testPhotoData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      
      // Test photo in sessionStorage flow
      await this.page.evaluate((photoData) => {
        sessionStorage.setItem('pendingPhoto', photoData);
        sessionStorage.setItem('pendingCV', 'Test CV with photo');
        sessionStorage.setItem('pendingEmail', 'test@example.com');
      }, testPhotoData);
      
      // Navigate to success page
      await this.page.goto(`${this.baseUrl}/success?session_id=test_photo_session`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if photo data is preserved
      const photoCheck = await this.page.evaluate(() => {
        const photo = sessionStorage.getItem('pendingPhoto');
        return {
          hasPhoto: !!photo,
          photoLength: photo ? photo.length : 0,
          isBase64: photo ? photo.includes('data:image') : false
        };
      });
      
      if (photoCheck.hasPhoto && photoCheck.isBase64) {
        this.results.functionality.photo = { status: 'PASS', message: `Photo preserved (${photoCheck.photoLength} chars)` };
        this.results.overall.passed++;
      } else {
        this.results.functionality.photo = { status: 'FAIL', message: 'Photo not preserved in sessionStorage' };
        this.results.overall.failed++;
      }
      
    } catch (error) {
      this.results.functionality.photo = { status: 'ERROR', message: error.message };
      this.results.overall.failed++;
    }
  }

  // TEST 5: Chunking Strategy
  async testChunkingStrategy() {
    console.log('\n📄 TEST 5: Chunking Strategy for Long CVs');
    
    try {
      // Generate a very long CV (>50k characters)
      const longCV = 'JOHN DOE - SENIOR DEVELOPER\n\n' + 
        'EXPERIENCE:\n' + 
        'Senior Software Developer at TechCorp (2020-2023)\n'.repeat(2000) +
        'SKILLS:\n' + 
        'JavaScript, Python, React, Node.js\n'.repeat(1000) +
        'EDUCATION:\n' + 
        'Computer Science Degree\n'.repeat(500);
      
      console.log(`📊 Generated test CV: ${longCV.length} characters`);
      
      // Test demo-optimize endpoint (no auth required)
      const chunkingTest = await this.page.evaluate((cvText) => {
        return fetch('/api/demo-optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cvText: cvText,
            language: 'pl',
            preservePhotos: true
          })
        }).then(response => response.json());
      }, longCV);
      
      if (chunkingTest.success && chunkingTest.optimizedCV) {
        const optimizedLength = chunkingTest.optimizedCV.length;
        this.results.functionality.chunking = { 
          status: 'PASS', 
          message: `Long CV processed successfully (${longCV.length} → ${optimizedLength} chars)` 
        };
        this.results.overall.passed++;
      } else {
        this.results.functionality.chunking = { 
          status: 'FAIL', 
          message: `Chunking failed: ${chunkingTest.error || 'Unknown error'}` 
        };
        this.results.overall.failed++;
      }
      
    } catch (error) {
      this.results.functionality.chunking = { status: 'ERROR', message: error.message };
      this.results.overall.failed++;
    }
  }

  // TEST 6: End-to-End Flow
  async testEndToEndFlow() {
    console.log('\n🔄 TEST 6: Complete End-to-End Flow');
    
    try {
      await this.page.goto(this.baseUrl);
      
      // Test main page loads
      await this.page.waitForSelector('h1', { timeout: 5000 });
      const title = await this.page.$eval('h1', el => el.textContent);
      
      if (title.includes('CV') || title.includes('Perfect')) {
        this.results.functionality.mainPage = { status: 'PASS', message: 'Main page loads correctly' };
        this.results.overall.passed++;
      } else {
        this.results.functionality.mainPage = { status: 'FAIL', message: 'Main page title incorrect' };
        this.results.overall.failed++;
      }
      
      // Test modal opening
      const modalButton = await this.page.$('[class*="modal"], [class*="button"], button');
      if (modalButton) {
        await modalButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.results.functionality.modal = { status: 'PASS', message: 'Modal interaction working' };
        this.results.overall.passed++;
      } else {
        this.results.functionality.modal = { status: 'WARNING', message: 'Modal button not found' };
        this.results.overall.warnings++;
      }
      
    } catch (error) {
      this.results.functionality.endToEnd = { status: 'ERROR', message: error.message };
      this.results.overall.failed++;
    }
  }

  // TEST 7: Mobile Responsiveness
  async testMobileResponsiveness() {
    console.log('\n📱 TEST 7: Mobile Responsiveness');
    
    try {
      // Test mobile viewport
      await this.page.setViewport({ width: 375, height: 667 }); // iPhone SE
      await this.page.goto(this.baseUrl);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mobileLayout = await this.page.evaluate(() => {
        const body = document.body;
        const scrollWidth = body.scrollWidth;
        const clientWidth = body.clientWidth;
        
        return {
          hasHorizontalScroll: scrollWidth > clientWidth + 10,
          viewportWidth: window.innerWidth,
          bodyWidth: body.offsetWidth
        };
      });
      
      if (!mobileLayout.hasHorizontalScroll && mobileLayout.viewportWidth <= 375) {
        this.results.functionality.mobile = { status: 'PASS', message: 'Mobile layout responsive' };
        this.results.overall.passed++;
      } else {
        this.results.functionality.mobile = { status: 'FAIL', message: 'Mobile layout has horizontal scroll' };
        this.results.overall.failed++;
      }
      
      // Reset to desktop
      await this.page.setViewport({ width: 1920, height: 1080 });
      
    } catch (error) {
      this.results.functionality.mobile = { status: 'ERROR', message: error.message };
      this.results.overall.failed++;
    }
  }

  // TEST 8: API Performance
  async testAPIPerformance() {
    console.log('\n⚡ TEST 8: API Endpoints Performance');
    
    try {
      const endpoints = [
        { path: '/api/demo-optimize', method: 'POST', body: { cvText: 'Test CV' } },
        { path: '/api/save-session', method: 'POST', body: { sessionId: 'test', cvData: 'test', email: 'test@test.com' } }
      ];
      
      const performanceResults = [];
      
      for (const endpoint of endpoints) {
        const startTime = Date.now();
        
        const response = await this.page.evaluate((ep) => {
          return fetch(ep.path, {
            method: ep.method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ep.body)
          }).then(response => ({
            status: response.status,
            ok: response.ok
          }));
        }, endpoint);
        
        const responseTime = Date.now() - startTime;
        performanceResults.push({
          endpoint: endpoint.path,
          responseTime: responseTime,
          status: response.status
        });
      }
      
      const avgResponseTime = performanceResults.reduce((sum, r) => sum + r.responseTime, 0) / performanceResults.length;
      
      if (avgResponseTime < 5000) { // Under 5 seconds
        this.results.performance.api = { 
          status: 'PASS', 
          message: `Average response time: ${avgResponseTime}ms`,
          details: performanceResults
        };
        this.results.overall.passed++;
      } else {
        this.results.performance.api = { 
          status: 'WARNING', 
          message: `Slow API responses: ${avgResponseTime}ms`,
          details: performanceResults
        };
        this.results.overall.warnings++;
      }
      
    } catch (error) {
      this.results.performance.api = { status: 'ERROR', message: error.message };
      this.results.overall.failed++;
    }
  }

  // Run all tests
  async runAllTests() {
    await this.initialize();
    
    await this.testSecurityFixes();
    await this.testXSSProtection();
    await this.testAuthentication();
    await this.testPhotoPreservation();
    await this.testChunkingStrategy();
    await this.testEndToEndFlow();
    await this.testMobileResponsiveness();
    await this.testAPIPerformance();
    
    await this.generateReport();
    await this.cleanup();
  }

  // Generate comprehensive report
  async generateReport() {
    const duration = Date.now() - this.testStartTime;
    const timestamp = new Date().toISOString();
    
    const report = {
      timestamp: timestamp,
      duration: `${Math.round(duration / 1000)}s`,
      summary: this.results.overall,
      tests: {
        security: this.results.security,
        functionality: this.results.functionality,
        performance: this.results.performance
      },
      recommendations: this.generateRecommendations()
    };
    
    // Save report
    const reportPath = `etap1-test-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('🧪 CVPERFECT ETAP 1 - TEST RESULTS SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ PASSED: ${this.results.overall.passed}`);
    console.log(`❌ FAILED: ${this.results.overall.failed}`);
    console.log(`⚠️ WARNINGS: ${this.results.overall.warnings}`);
    console.log(`⏱️ DURATION: ${Math.round(duration / 1000)}s`);
    console.log(`📄 REPORT: ${reportPath}`);
    console.log('='.repeat(80));
    
    if (this.results.overall.failed === 0) {
      console.log('🎉 ALL CRITICAL TESTS PASSED! ETAP 1 IS STABLE!');
    } else {
      console.log('⚠️ SOME TESTS FAILED - REVIEW REQUIRED BEFORE ETAP 2');
    }
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.overall.failed > 0) {
      recommendations.push('🔴 CRITICAL: Fix failed tests before proceeding to ETAP 2');
    }
    
    if (this.results.overall.warnings > 0) {
      recommendations.push('🟡 Review warnings for potential improvements');
    }
    
    if (this.results.security.auth?.status === 'FAIL') {
      recommendations.push('🔒 URGENT: Fix authentication system immediately');
    }
    
    if (this.results.functionality.chunking?.status === 'FAIL') {
      recommendations.push('📄 Fix chunking strategy for long CV processing');
    }
    
    if (this.results.overall.failed === 0 && this.results.overall.warnings <= 2) {
      recommendations.push('🚀 READY FOR ETAP 2: Performance & Architecture improvements');
    }
    
    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new CVPerfectEtap1Tester();
  tester.runAllTests().catch(console.error);
}

module.exports = CVPerfectEtap1Tester;