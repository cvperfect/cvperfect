import { useEffect, useRef, useState } from "react";
import { onCLS, onFCP, onLCP, onTTFB } from "web-vitals";

const PerformanceMonitor = ({ 
  userId = null, 
  page = "unknown", 
  enableBundleTracking = true, 
  enableProductionMode = false 
}) => {
  const [vitals, setVitals] = useState({
    CLS: null,
    FCP: null, 
    LCP: null,
    TTFB: null
  });
  
  const [customMetrics, setCustomMetrics] = useState({
    pageLoadTime: null,
    domContentLoaded: null,
    firstPaint: null,
    resourceLoadTime: null,
    memoryUsage: null,
    bundleSize: null,
    chunkLoadTime: null
  });

  const performanceStartTime = useRef(null);
  const isReported = useRef(false);

  // Send metrics to analytics endpoint
  const sendMetrics = async (metricData) => {
    if (typeof window === "undefined") return;
    
    try {
      // Fix API format: use metric_name and metric_value as required
      const formattedData = {
        metric_name: metricData.type || metricData.metric_name,
        metric_value: metricData.value || metricData.metric_value,
        metric_data: {
          // Include original metric data
          ...(metricData.metric_data || {}),
          // Add context data
          rating: metricData.rating,
          target: metricData.target,
          passed: metricData.passed,
          startTime: metricData.startTime,
          userId: userId,
          page: page,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink
          } : null
        },
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        url: window.location.href
      };

      await fetch("/api/performance-metrics", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-key": "cvp_admin_2025_secure_key_xyz789"
        },
        body: JSON.stringify(formattedData)
      });
    } catch (error) {
      console.warn("Performance metrics failed to send:", error);
    }
  };

  // Core Web Vitals collection
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    performanceStartTime.current = performance.now();

    // Cumulative Layout Shift (target: < 0.1)
    onCLS((metric) => {
      setVitals(prev => ({ ...prev, CLS: metric.value }));
      sendMetrics({ 
        type: "CLS", 
        value: metric.value, 
        rating: metric.rating,
        target: 0.1,
        passed: metric.value < 0.1
      });
    });

    // First Contentful Paint (target: < 1.8s)
    onFCP((metric) => {
      setVitals(prev => ({ ...prev, FCP: metric.value }));
      sendMetrics({ 
        type: "FCP", 
        value: metric.value, 
        rating: metric.rating,
        target: 1800,
        passed: metric.value < 1800
      });
    });

    // Note: FID (First Input Delay) has been deprecated in favor of INP (Interaction to Next Paint)
    // For now, we focus on the core supported metrics: LCP, CLS, FCP, TTFB

    // Largest Contentful Paint (target: < 2.5s)
    onLCP((metric) => {
      setVitals(prev => ({ ...prev, LCP: metric.value }));
      sendMetrics({ 
        type: "LCP", 
        value: metric.value, 
        rating: metric.rating,
        target: 2500,
        passed: metric.value < 2500
      });
    });

    // Time to First Byte (target: < 800ms)
    onTTFB((metric) => {
      setVitals(prev => ({ ...prev, TTFB: metric.value }));
      sendMetrics({ 
        type: "TTFB", 
        value: metric.value, 
        rating: metric.rating,
        target: 800,
        passed: metric.value < 800
      });
    });

  }, [userId, page]);

  // Custom performance metrics including bundle size tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    const collectCustomMetrics = () => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const paint = performance.getEntriesByType("paint");
      
      let loadTime = 0;
      let domContentLoaded = 0;
      
      // Page load metrics
      if (navigation) {
        loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        
        setCustomMetrics(prev => ({
          ...prev,
          pageLoadTime: loadTime,
          domContentLoaded: domContentLoaded
        }));
      }

      // Paint metrics
      const firstPaint = paint.find(entry => entry.name === "first-paint");
      if (firstPaint) {
        setCustomMetrics(prev => ({
          ...prev,
          firstPaint: firstPaint.startTime
        }));
      }

      // Resource loading performance
      const resources = performance.getEntriesByType("resource");
      const totalResourceTime = resources.reduce((sum, resource) => 
        sum + (resource.responseEnd - resource.startTime), 0);
      
      // Bundle size and chunk tracking
      let bundleData = null;
      if (enableBundleTracking) {
        bundleData = calculateBundleMetrics(resources);
        setCustomMetrics(prev => ({
          ...prev,
          bundleSize: bundleData.totalSize,
          chunkLoadTime: bundleData.loadTime
        }));
      }
      
      setCustomMetrics(prev => ({
        ...prev,
        resourceLoadTime: totalResourceTime
      }));

      // Memory usage (if available)
      if (performance.memory) {
        setCustomMetrics(prev => ({
          ...prev,
          memoryUsage: {
            usedJSMemory: performance.memory.usedJSMemory,
            totalJSMemory: performance.memory.totalJSMemory,
            jsMemoryLimit: performance.memory.jsMemoryLimit
          }
        }));
      }

      // Send custom metrics summary
      if (!isReported.current) {
        sendMetrics({
          type: "CUSTOM_METRICS",
          value: loadTime || 0,  // Use primary metric as scalar value
          metric_data: {
            pageLoadTime: loadTime,
            domContentLoaded: domContentLoaded,
            firstPaint: firstPaint?.startTime,
            resourceLoadTime: totalResourceTime,
            bundleSize: bundleData?.totalSize,
            chunkLoadTime: bundleData?.loadTime,
            memoryUsage: performance.memory ? {
              usedJSMemory: performance.memory.usedJSMemory,
              totalJSMemory: performance.memory.totalJSMemory
            } : null
          }
        });
        isReported.current = true;
      }
    };

    // Bundle size calculation helper
    const calculateBundleMetrics = (resources) => {
      const jsResources = resources.filter(resource => 
        resource.name.includes('.js') || resource.name.includes('/_next/static/')
      );
      
      const totalSize = jsResources.reduce((sum, resource) => {
        return sum + (resource.transferSize || resource.decodedBodySize || 0);
      }, 0);
      
      const loadTime = jsResources.reduce((max, resource) => {
        const resourceTime = resource.responseEnd - resource.startTime;
        return Math.max(max, resourceTime);
      }, 0);
      
      // Track bundle budget (293kB target)
      if (totalSize > 300000) { // 293kB in bytes
        sendMetrics({
          type: "BUNDLE_BUDGET_EXCEEDED",
          value: totalSize,
          target: 300000,
          passed: false,
          page: page
        });
      }
      
      return { totalSize, loadTime };
    };

    // Wait for page load completion
    if (document.readyState === "complete") {
      setTimeout(collectCustomMetrics, 1000);
    } else {
      window.addEventListener("load", () => {
        setTimeout(collectCustomMetrics, 1000);
      });
    }

    // Performance observer for long tasks
    if ("PerformanceObserver" in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            sendMetrics({
              type: "LONG_TASK",
              value: entry.duration,
              startTime: entry.startTime,
              target: 50,
              passed: false
            });
          }
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ["longtask"] });
      } catch (_e) {
        // Long task observer not supported
      }

      return () => {
        try {
          longTaskObserver.disconnect();
        } catch (error) {
          // Observer already disconnected
          console.debug("Observer disconnect error:", error);
        }
      };
    }
  }, [userId, page, enableBundleTracking]);

  // Performance budget warnings and alerts
  useEffect(() => {
    const isDevelopment = typeof window !== "undefined" && 
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    
    if (isDevelopment || enableProductionMode) {
      const checkPerformanceBudgets = () => {
        const warnings = [];
        const criticalAlerts = [];
        
        // Core Web Vitals checks
        if (vitals.LCP > 2500) {
          const message = `LCP (${Math.round(vitals.LCP)}ms) exceeds 2.5s target`;
          if (vitals.LCP > 4000) {
            criticalAlerts.push(message);
          } else {
            warnings.push(message);
          }
        }
        
        // FID tracking removed - deprecated metric
        
        if (vitals.CLS > 0.1) {
          const message = `CLS (${vitals.CLS.toFixed(3)}) exceeds 0.1 target`;
          if (vitals.CLS > 0.25) {
            criticalAlerts.push(message);
          } else {
            warnings.push(message);
          }
        }
        
        if (vitals.FCP > 1800) warnings.push(`FCP (${Math.round(vitals.FCP)}ms) exceeds 1.8s target`);
        if (vitals.TTFB > 800) warnings.push(`TTFB (${Math.round(vitals.TTFB)}ms) exceeds 800ms target`);

        // Custom metrics checks
        if (customMetrics.bundleSize > 300000) {
          const sizeKB = Math.round(customMetrics.bundleSize / 1024);
          warnings.push(`Bundle size (${sizeKB}KB) exceeds 293KB target`);
        }
        
        if (customMetrics.memoryUsage && customMetrics.memoryUsage.usedJSMemory > 50000000) { // 50MB
          const memoryMB = Math.round(customMetrics.memoryUsage.usedJSMemory / 1024 / 1024);
          warnings.push(`Memory usage (${memoryMB}MB) is high`);
        }

        // Log warnings and alerts
        if (criticalAlerts.length > 0) {
          console.group("🚨 CRITICAL Performance Issues");
          criticalAlerts.forEach(alert => console.error(alert));
          console.groupEnd();
          
          // Send critical alerts to monitoring
          sendMetrics({
            type: "PERFORMANCE_CRITICAL_ALERT",
            value: criticalAlerts.length,
            metric_data: {
              alerts: criticalAlerts,
              timestamp: new Date().toISOString(),
              page: page
            }
          });
        }
        
        if (warnings.length > 0) {
          console.group("⚠️ Performance Budget Warnings");
          warnings.forEach(warning => console.warn(warning));
          console.groupEnd();
        }
      };

      // Check budgets after all vitals are collected
      const hasAllVitals = Object.values(vitals).every(v => v !== null);
      if (hasAllVitals) {
        setTimeout(checkPerformanceBudgets, 2000);
      }
    }
  }, [vitals, customMetrics, page, enableProductionMode]);

  // Return null - this is a monitoring component, no UI
  return null;
};

export default PerformanceMonitor;
