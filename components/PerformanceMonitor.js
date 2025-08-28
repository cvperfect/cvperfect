import { useEffect, useState } from "react"

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({})
  const [isDevMode, setIsDevMode] = useState(false)
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDevMode(process.env.NODE_ENV === "development")
      
      // Initialize web vitals with dynamic import
      const initWebVitals = async () => {
        try {
          const { onLCP, onFID, onCLS, onFCP, onTTFB } = await import("web-vitals")
          
          onLCP((metric) => {
            setMetrics(prev => ({ ...prev, lcp: metric }))
            reportMetric("LCP", metric)
          })
          
          onFID((metric) => {
            setMetrics(prev => ({ ...prev, fid: metric }))
            reportMetric("FID", metric)
          })
          
          onCLS((metric) => {
            setMetrics(prev => ({ ...prev, cls: metric }))
            reportMetric("CLS", metric)
          })
          
          onFCP((metric) => {
            setMetrics(prev => ({ ...prev, fcp: metric }))
            reportMetric("FCP", metric)
          })
          
          onTTFB((metric) => {
            setMetrics(prev => ({ ...prev, ttfb: metric }))
            reportMetric("TTFB", metric)
          })
        } catch (error) {
          console.log("Web vitals not available")
        }
      }
      
      initWebVitals()
    }
  }, [])
  
  const reportMetric = async (name, metric) => {
    if (typeof window === "undefined") return
    
    try {
      await fetch("/api/performance-metrics", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-key": "cvp_admin_2025_secure_key_xyz789"
        },
        body: JSON.stringify({
          metric_name: name,
          metric_value: metric.value,
          metric_data: metric,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {
        // Silent fail - monitoring shouldn't break the app
      })
    } catch (error) {
      // Silent fail
    }
  }
  
  if (!isDevMode) return null
  
  return (
    <div style={{
      position: "fixed",
      top: "10px",
      right: "10px",
      background: "rgba(0,0,0,0.8)",
      color: "white",
      padding: "10px",
      borderRadius: "5px",
      fontSize: "12px",
      zIndex: 10000,
      maxWidth: "250px"
    }}>
      <h4>Performance</h4>
      <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp.value)}ms` : "..."}</div>
      <div>FID: {metrics.fid ? `${Math.round(metrics.fid.value)}ms` : "..."}</div>
      <div>CLS: {metrics.cls ? Math.round(metrics.cls.value * 1000) / 1000 : "..."}</div>
      <div>FCP: {metrics.fcp ? `${Math.round(metrics.fcp.value)}ms` : "..."}</div>
      <div>TTFB: {metrics.ttfb ? `${Math.round(metrics.ttfb.value)}ms` : "..."}</div>
    </div>
  )
}

export default PerformanceMonitor
