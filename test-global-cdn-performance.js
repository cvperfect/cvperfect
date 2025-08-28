#!/usr/bin/env node

/**
 * Global CDN Performance Testing Suite for CVPerfect
 * Tests CDN deployment, edge functions, and global performance optimization
 */

const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
const fs = require('fs').promises;

class GlobalCDNPerformanceTester {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    this.browser = null;
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async runAllTests() {
    console.log('=� Starting Global CDN Performance Testing Suite\n');
    console.log(`Testing URL: ${this.baseUrl}\n`);

    try {
      await this.setupBrowser();

      // Core CDN Tests
      await this.testCDNLatency();
      await this.testCacheHeaders();
      await this.testCompressionOptimization();
      await this.testStaticAssetPerformance();
      
      // Edge Function Tests  
      await this.testEdgeAuthentication();
      await this.testEdgeCVProcessing();
      await this.testEdgePerformanceMonitoring();
      
      // Regional Performance Tests
      await this.testRegionalOptimization();
      await this.testCoreWebVitals();
      await this.testAPILatencyOptimization();
      
      // Global Load Testing
      await this.testGlobalLoadBalancing();
      await this.testFailoverMechanisms();
      
      await this.generateReport();

    } catch (error) {
      console.error('L Testing suite failed:', error);
      this.addResult('CRITICAL_ERROR', false, `Testing suite crashed: ${error.message}`);
    } finally {
      await this.cleanup();
    }

    return this.results;
  }

  async setupBrowser() {
    console.log('=' Setting up browser for testing...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
  }

  async testCDNLatency() {
    console.log('=� Testing CDN latency and global distribution...');
    
    const testRegions = [
      { name: 'Primary', url: this.baseUrl },
      { name: 'Static Assets', url: `${this.baseUrl}/favicon.ico` },
      { name: 'API Health', url: `${this.baseUrl}/api/health` }
    ];

    for (const region of testRegions) {
      try {
        const startTime = performance.now();
        const response = await fetch(region.url, { method: 'HEAD' });
        const latency = performance.now() - startTime;

        const cfRay = response.headers.get('cf-ray');
        const cfCache = response.headers.get('cf-cache-status');
        const server = response.headers.get('server');

        const isOptimal = latency < 500; // 500ms threshold
        const hasCDN = cfRay || server?.includes('cloudflare');

        this.addResult(
          `CDN_LATENCY_${region.name.toUpperCase()}`,
          isOptimal && hasCDN,
          `Latency: ${latency.toFixed(0)}ms, CDN: ${hasCDN ? '' : 'L'}, Cache: ${cfCache || 'N/A'}`
        );

        if (latency > 1000) {
          this.addResult('CDN_LATENCY_WARNING', false, `High latency detected: ${latency.toFixed(0)}ms for ${region.name}`);
        }

      } catch (error) {
        this.addResult(`CDN_LATENCY_${region.name.toUpperCase()}`, false, `Failed: ${error.message}`);
      }
    }
  }

  async testCacheHeaders() {
    console.log('=� Testing cache optimization headers...');
    
    const testUrls = [
      { url: `${this.baseUrl}/`, expectedCache: 'no-cache', type: 'HTML' },
      { url: `${this.baseUrl}/favicon.ico`, expectedCache: 'public', type: 'Static' },
      { url: `${this.baseUrl}/api/health`, expectedCache: 'no-store', type: 'API' }
    ];

    for (const test of testUrls) {
      try {
        const response = await fetch(test.url, { method: 'HEAD' });
        const cacheControl = response.headers.get('cache-control') || '';
        const etag = response.headers.get('etag');
        const lastModified = response.headers.get('last-modified');

        const hasOptimalCaching = cacheControl.includes(test.expectedCache);
        const hasCacheHeaders = etag || lastModified;

        this.addResult(
          `CACHE_HEADERS_${test.type}`,
          hasOptimalCaching,
          `Cache-Control: ${cacheControl}, ETag: ${etag ? '' : 'L'}`
        );

      } catch (error) {
        this.addResult(`CACHE_HEADERS_${test.type}`, false, `Failed: ${error.message}`);
      }
    }
  }

  async testCompressionOptimization() {
    console.log('=� Testing compression optimization (Brotli/Gzip)...');

    try {
      const response = await fetch(`${this.baseUrl}/`, {
        headers: {
          'Accept-Encoding': 'br, gzip, deflate'
        }
      });

      const contentEncoding = response.headers.get('content-encoding');
      const contentLength = response.headers.get('content-length');

      const hasBrotli = contentEncoding?.includes('br');
      const hasGzip = contentEncoding?.includes('gzip');
      const hasCompression = hasBrotli || hasGzip;

      this.addResult(
        'COMPRESSION_OPTIMIZATION',
        hasCompression,
        `Encoding: ${contentEncoding || 'none'}, Brotli: ${hasBrotli ? '' : 'L'}, Size: ${contentLength || 'unknown'}`
      );

      if (!hasCompression) {
        this.addResult('COMPRESSION_WARNING', false, 'No compression detected - potential performance impact');
      }

    } catch (error) {
      this.addResult('COMPRESSION_OPTIMIZATION', false, `Failed: ${error.message}`);
    }
  }

  async testStaticAssetPerformance() {
    console.log('=� Testing static asset performance and optimization...');

    const page = await this.browser.newPage();
    
    try {
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });

      // Get all resource loading times
      const resourceTimings = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources.map(resource => ({
          name: resource.name,
          duration: resource.duration,
          transferSize: resource.transferSize,
          encodedBodySize: resource.encodedBodySize,
          type: resource.initiatorType
        }));
      });

      let slowAssets = 0;
      let totalSize = 0;
      let cachedAssets = 0;

      for (const resource of resourceTimings) {
        totalSize += resource.transferSize || 0;
        
        if (resource.duration > 1000) {
          slowAssets++;
        }
        
        if (resource.transferSize === 0 && resource.encodedBodySize > 0) {
          cachedAssets++;
        }
      }

      const averageLoadTime = resourceTimings.reduce((sum, r) => sum + r.duration, 0) / resourceTimings.length;
      const cacheHitRate = cachedAssets / resourceTimings.length;

      this.addResult(
        'STATIC_ASSET_PERFORMANCE',
        slowAssets < 3 && averageLoadTime < 500,
        `Avg load: ${averageLoadTime.toFixed(0)}ms, Slow assets: ${slowAssets}, Cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`
      );

      this.addResult(
        'BUNDLE_SIZE_OPTIMIZATION',
        totalSize < 2000000, // 2MB threshold
        `Total transfer size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`
      );

    } catch (error) {
      this.addResult('STATIC_ASSET_PERFORMANCE', false, `Failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async testEdgeAuthentication() {
    console.log('= Testing edge authentication optimization...');

    try {
      const authData = {
        sessionId: 'test_session_12345',
        planType: 'premium',
        userId: 'test_user'
      };

      const response = await fetch(`${this.baseUrl}/api/edge/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authData)
      });

      const result = await response.json();
      const edgeRegion = response.headers.get('x-edge-region');
      const dbRegion = response.headers.get('x-db-region');

      const isWorking = response.ok && result.success;
      const hasRegionalOptimization = edgeRegion && dbRegion;

      this.addResult(
        'EDGE_AUTHENTICATION',
        isWorking,
        `Status: ${response.status}, Edge: ${edgeRegion}, DB: ${dbRegion}`
      );

      if (hasRegionalOptimization) {
        this.addResult('REGIONAL_OPTIMIZATION', true, `Optimized routing: ${edgeRegion} � ${dbRegion}`);
      }

    } catch (error) {
      this.addResult('EDGE_AUTHENTICATION', false, `Failed: ${error.message}`);
    }
  }

  async testEdgeCVProcessing() {
    console.log('> Testing edge CV processing optimization...');

    try {
      const cvData = {
        cvData: { text: 'Test CV content for processing' },
        planType: 'premium',
        sessionId: 'test_session_cv',
        processingType: 'optimization'
      };

      const startTime = performance.now();
      const response = await fetch(`${this.baseUrl}/api/edge/cv-process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cvData)
      });
      const processingTime = performance.now() - startTime;

      const result = await response.json();
      const mlRegion = response.headers.get('x-ml-region');
      const edgeProcessingTime = response.headers.get('x-processing-time');

      const isWorking = response.ok && result.success;
      const isFast = processingTime < 2000; // 2 second threshold

      this.addResult(
        'EDGE_CV_PROCESSING',
        isWorking && isFast,
        `Processing time: ${processingTime.toFixed(0)}ms, ML region: ${mlRegion}`
      );

    } catch (error) {
      this.addResult('EDGE_CV_PROCESSING', false, `Failed: ${error.message}`);
    }
  }

  async testEdgePerformanceMonitoring() {
    console.log('=� Testing edge performance monitoring...');

    try {
      const performanceData = {
        metrics: {},
        sessionId: 'test_session_perf',
        userAgent: 'CVPerfect-Test/1.0',
        coreWebVitals: {
          lcp: 1500,
          fid: 50,
          cls: 0.05,
          fcp: 1200,
          ttfb: 300
        },
        customMetrics: {
          pageLoadTime: 2000,
          bundleSize: 500000,
          memoryUsage: 50000000
        }
      };

      const response = await fetch(`${this.baseUrl}/api/edge/performance-monitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(performanceData)
      });

      const result = await response.json();
      const edgeRegion = response.headers.get('x-edge-region');

      const isWorking = response.ok && result.success;
      const hasAlerts = result.alerts && Array.isArray(result.alerts);
      const hasRecommendations = result.recommendations && Array.isArray(result.recommendations);

      this.addResult(
        'EDGE_PERFORMANCE_MONITORING',
        isWorking && hasAlerts && hasRecommendations,
        `Region: ${edgeRegion}, Alerts: ${result.alerts?.length || 0}, Recommendations: ${result.recommendations?.length || 0}`
      );

    } catch (error) {
      this.addResult('EDGE_PERFORMANCE_MONITORING', false, `Failed: ${error.message}`);
    }
  }

  async testRegionalOptimization() {
    console.log('< Testing regional optimization and routing...');

    const regions = [
      { name: 'US', headers: { 'CF-IPCountry': 'US' } },
      { name: 'EU', headers: { 'CF-IPCountry': 'DE' } },
      { name: 'PL', headers: { 'CF-IPCountry': 'PL' } },
      { name: 'ASIA', headers: { 'CF-IPCountry': 'JP' } }
    ];

    for (const region of regions) {
      try {
        const response = await fetch(`${this.baseUrl}/api/health`, {
          headers: region.headers
        });

        const apiRegion = response.headers.get('x-api-region');
        const edgeRegion = response.headers.get('x-edge-region');

        this.addResult(
          `REGIONAL_ROUTING_${region.name}`,
          response.ok,
          `API Region: ${apiRegion}, Edge: ${edgeRegion}`
        );

      } catch (error) {
        this.addResult(`REGIONAL_ROUTING_${region.name}`, false, `Failed: ${error.message}`);
      }
    }
  }

  async testCoreWebVitals() {
    console.log('<� Testing Core Web Vitals optimization...');

    const page = await this.browser.newPage();
    
    try {
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });

      // Measure Core Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = {};
          let metricsCollected = 0;
          const totalMetrics = 3;

          // LCP (Largest Contentful Paint)
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              vitals.lcp = entries[entries.length - 1].startTime;
              metricsCollected++;
              if (metricsCollected === totalMetrics) resolve(vitals);
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // FID (First Input Delay)
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              vitals.fid = entries[0].processingStart - entries[0].startTime;
              metricsCollected++;
              if (metricsCollected === totalMetrics) resolve(vitals);
            }
          }).observe({ entryTypes: ['first-input'] });

          // CLS (Cumulative Layout Shift)
          new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            vitals.cls = clsValue;
            metricsCollected++;
            if (metricsCollected === totalMetrics) resolve(vitals);
          }).observe({ entryTypes: ['layout-shift'] });

          // Fallback timeout
          setTimeout(() => {
            resolve(vitals);
          }, 5000);
        });
      });

      const lcpGood = (webVitals.lcp || 0) < 2500;
      const fidGood = (webVitals.fid || 0) < 100;
      const clsGood = (webVitals.cls || 0) < 0.1;

      this.addResult(
        'CORE_WEB_VITALS_LCP',
        lcpGood,
        `LCP: ${(webVitals.lcp || 0).toFixed(0)}ms (target: <2500ms)`
      );

      this.addResult(
        'CORE_WEB_VITALS_FID',
        fidGood,
        `FID: ${(webVitals.fid || 0).toFixed(0)}ms (target: <100ms)`
      );

      this.addResult(
        'CORE_WEB_VITALS_CLS',
        clsGood,
        `CLS: ${(webVitals.cls || 0).toFixed(3)} (target: <0.1)`
      );

    } catch (error) {
      this.addResult('CORE_WEB_VITALS', false, `Failed: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async testAPILatencyOptimization() {
    console.log('� Testing API latency optimization...');

    const apiEndpoints = [
      '/api/health',
      '/api/ping',
      '/api/performance-dashboard'
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const startTime = performance.now();
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        const latency = performance.now() - startTime;

        const isOptimal = latency < 200; // 200ms threshold
        const ttfb = response.headers.get('x-ttfb');

        this.addResult(
          `API_LATENCY_${endpoint.replace('/api/', '').toUpperCase()}`,
          isOptimal,
          `Latency: ${latency.toFixed(0)}ms, TTFB: ${ttfb || 'N/A'}`
        );

      } catch (error) {
        this.addResult(`API_LATENCY_${endpoint.replace('/api/', '').toUpperCase()}`, false, `Failed: ${error.message}`);
      }
    }
  }

  async testGlobalLoadBalancing() {
    console.log('� Testing global load balancing and failover...');

    try {
      const concurrentRequests = 10;
      const requests = Array.from({ length: concurrentRequests }, (_, i) =>
        fetch(`${this.baseUrl}/api/health?test=${i}`)
          .then(response => ({
            index: i,
            status: response.status,
            time: performance.now(),
            region: response.headers.get('x-edge-region')
          }))
      );

      const results = await Promise.all(requests);
      const successRate = results.filter(r => r.status === 200).length / concurrentRequests;
      const avgResponseTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;

      this.addResult(
        'GLOBAL_LOAD_BALANCING',
        successRate >= 0.9, // 90% success rate threshold
        `Success rate: ${(successRate * 100).toFixed(1)}%, Avg response: ${avgResponseTime.toFixed(0)}ms`
      );

    } catch (error) {
      this.addResult('GLOBAL_LOAD_BALANCING', false, `Failed: ${error.message}`);
    }
  }

  async testFailoverMechanisms() {
    console.log('=� Testing failover mechanisms and redundancy...');

    // Test primary health endpoint
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const healthData = await response.json();

      const hasHealthCheck = response.ok && healthData.status === 'healthy';
      const hasDatabase = healthData.database === 'connected';
      const hasServices = healthData.services && Object.keys(healthData.services).length > 0;

      this.addResult(
        'FAILOVER_HEALTH_CHECK',
        hasHealthCheck && hasDatabase,
        `Health: ${healthData.status}, DB: ${healthData.database}, Services: ${Object.keys(healthData.services || {}).length}`
      );

    } catch (error) {
      this.addResult('FAILOVER_HEALTH_CHECK', false, `Failed: ${error.message}`);
    }
  }

  addResult(testName, passed, details) {
    const result = {
      test: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    };

    this.results.tests.push(result);
    
    if (passed) {
      this.results.summary.passed++;
      console.log(`   ${testName}: ${details}`);
    } else if (testName.includes('WARNING')) {
      this.results.summary.warnings++;
      console.log(`  �  ${testName}: ${details}`);
    } else {
      this.results.summary.failed++;
      console.log(`  L ${testName}: ${details}`);
    }
  }

  async generateReport() {
    console.log('\n=� Generating comprehensive test report...');

    const report = {
      ...this.results,
      performance_metrics: {
        total_tests: this.results.tests.length,
        success_rate: (this.results.summary.passed / this.results.tests.length * 100).toFixed(1),
        critical_failures: this.results.tests.filter(t => !t.passed && !t.test.includes('WARNING')).length
      }
    };

    try {
      await fs.writeFile('test-results-global-cdn-performance.json', JSON.stringify(report, null, 2));
      console.log(' Report saved to test-results-global-cdn-performance.json');
    } catch (error) {
      console.error('L Failed to save report:', error);
    }

    // Display summary
    console.log('\n<� GLOBAL CDN PERFORMANCE TEST SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${this.results.tests.length}`);
    console.log(` Passed: ${this.results.summary.passed}`);
    console.log(`L Failed: ${this.results.summary.failed}`);
    console.log(`�  Warnings: ${this.results.summary.warnings}`);
    console.log(`Success Rate: ${report.performance_metrics.success_rate}%`);
    
    if (this.results.summary.failed === 0) {
      console.log('\n<� All critical tests passed! CDN is optimally configured for global performance.');
    } else {
      console.log(`\n�  ${this.results.summary.failed} critical issues detected. Review failed tests above.`);
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new GlobalCDNPerformanceTester();
  tester.runAllTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Testing failed:', error);
      process.exit(1);
    });
}

module.exports = GlobalCDNPerformanceTester;