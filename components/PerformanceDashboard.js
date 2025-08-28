import { useEffect, useState, useRef } from "react"

const PerformanceDashboard = ({ 
  refreshInterval = 5000, 
  showAlerts = true, 
  enableExport = true,
  timeRange = "1h" 
}) => {
  const [data, setData] = useState({ metrics: [], aggregated: {} })
  const [loading, setLoading] = useState(true)
  const [realTimeData, setRealTimeData] = useState({})
  const [selectedRange, setSelectedRange] = useState(timeRange)
  const [alerts, setAlerts] = useState([])
  const intervalRef = useRef(null)

  // CVPerfect Core Web Vitals thresholds
  const thresholds = {
    LCP: { good: 2500, poor: 4000, unit: "ms" },
    FID: { good: 100, poor: 300, unit: "ms" },
    CLS: { good: 0.1, poor: 0.25, unit: "" },
    FCP: { good: 1800, poor: 3000, unit: "ms" },
    TTFB: { good: 600, poor: 1500, unit: "ms" }
  }

  useEffect(() => {
    fetchData()
    startRealTimeUpdates()
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [refreshInterval, selectedRange])

  const startRealTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = setInterval(() => {
      fetchData(true)
    }, refreshInterval)
  }

  const fetchData = async (isRealTime = false) => {
    try {
      const response = await fetch(`/api/performance-dashboard?range=${selectedRange}`)
      const result = await response.json()
      if (result.success) {
        setData(result)
        if (isRealTime) {
          setRealTimeData(result.aggregated)
        }
        if (showAlerts && result.aggregated.alertsCount > 0) {
          fetchAlerts()
        }
      }
    } catch (error) {
      console.error("Failed to fetch performance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/performance-alerts?range=${selectedRange}`)
      const result = await response.json()
      if (result.success) {
        setAlerts(result.alerts || [])
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
    }
  }

  const getScoreColor = (metricName, value) => {
    const threshold = thresholds[metricName]
    if (!threshold || !value) return "text-gray-500"
    
    if (value <= threshold.good) return "text-green-400"
    if (value <= threshold.poor) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBackground = (metricName, value) => {
    const threshold = thresholds[metricName]
    if (!threshold || !value) return "from-gray-500/20 to-gray-600/20"
    
    if (value <= threshold.good) return "from-green-400/20 to-green-500/20"
    if (value <= threshold.poor) return "from-yellow-400/20 to-yellow-500/20"
    return "from-red-400/20 to-red-500/20"
  }

  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      range: selectedRange,
      coreWebVitals: data.aggregated,
      recentMetrics: data.metrics.slice(0, 100),
      alerts: alerts
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cvperfect-performance-${selectedRange}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatValue = (metricName, value) => {
    const threshold = thresholds[metricName]
    if (!threshold || !value) return "N/A"
    
    if (metricName === "CLS") {
      return value.toFixed(3)
    }
    return `${Math.round(value)}${threshold.unit}`
  }

  const formatMemoryUsage = (bytes) => {
    if (!bytes) return "N/A"
    const mb = bytes / 1024 / 1024
    return `${mb.toFixed(1)}MB`
  }

  const formatBundleSize = (bytes) => {
    if (!bytes) return "N/A"
    const kb = bytes / 1024
    return `${kb.toFixed(0)}KB`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <style jsx>{`
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.1);
            border-top: 5px solid #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white/70">Loading performance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-6">
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .glass-card-hover {
          transition: all 0.3s ease;
        }
        .glass-card-hover:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }
        .metric-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          margin: 0 auto;
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .real-time-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #10B981;
          animation: pulse 2s infinite;
        }
        .alert-badge {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
      `}</style>

      {/* Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white gradient-text mb-2">
              CVPerfect Performance Dashboard
            </h1>
            <div className="flex items-center gap-2 text-white/70">
              <div className="real-time-indicator"></div>
              <span>Real-time monitoring active</span>
              {data.aggregated.alertsCount > 0 && (
                <div className="alert-badge ml-4">
                  {data.aggregated.alertsCount} alerts
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            {/* Time Range Selector */}
            <select 
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white backdrop-blur-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            
            {enableExport && (
              <button 
                onClick={exportData}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-300"
              >
                Export Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {Object.entries({
          LCP: data.aggregated.avgLCP || 0,
          FID: data.aggregated.avgFID || 0,
          CLS: data.aggregated.avgCLS || 0,
          FCP: data.aggregated.avgFCP || 0,
          TTFB: data.aggregated.avgTTFB || 0
        }).map(([metric, value]) => (
          <div key={metric} className="glass-card glass-card-hover p-6">
            <div className="text-center">
              <div className={`metric-circle bg-gradient-to-br ${getScoreBackground(metric, value)} pulse-animation`}>
                <div className={`text-2xl font-bold ${getScoreColor(metric, value)}`}>
                  {formatValue(metric, value)}
                </div>
                <div className="text-white/70 text-sm font-medium">{metric}</div>
              </div>
              <div className="mt-4">
                <div className="text-white/50 text-xs">
                  Target: ≤{thresholds[metric].good}{thresholds[metric].unit}
                </div>
                <div className={`text-xs font-medium mt-1 ${getScoreColor(metric, value)}`}>
                  {value <= thresholds[metric].good ? "Good" : 
                   value <= thresholds[metric].poor ? "Needs Improvement" : "Poor"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Bundle Size */}
        <div className="glass-card glass-card-hover p-6">
          <h3 className="text-white font-bold text-lg mb-4">Bundle Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Bundle Size</span>
              <span className={`font-bold ${
                (data.aggregated.avgBundle || 0) > 300000 ? "text-red-400" : "text-green-400"
              }`}>
                {formatBundleSize(data.aggregated.avgBundle)}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  (data.aggregated.avgBundle || 0) > 300000 ? "bg-red-400" : "bg-green-400"
                }`}
                style={{
                  width: `${Math.min(((data.aggregated.avgBundle || 0) / 500000) * 100, 100)}%`
                }}
              ></div>
            </div>
            <div className="text-xs text-white/50">Target: 293KB</div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="glass-card glass-card-hover p-6">
          <h3 className="text-white font-bold text-lg mb-4">Memory Usage</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">JS Memory</span>
              <span className="text-blue-400 font-bold">
                {formatMemoryUsage(data.aggregated.avgMemory)}
              </span>
            </div>
            <div className="text-xs text-white/50">
              Target: &lt;50MB
            </div>
          </div>
        </div>

        {/* API Performance */}
        <div className="glass-card glass-card-hover p-6">
          <h3 className="text-white font-bold text-lg mb-4">API Performance</h3>
          <div className="space-y-2">
            {(data.aggregated.slowAPIs || []).slice(0, 3).map((api, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-white/70 truncate">{api.endpoint}</span>
                <span className={`font-bold ${
                  api.avgDuration > 1000 ? "text-red-400" : 
                  api.avgDuration > 500 ? "text-yellow-400" : "text-green-400"
                }`}>
                  {Math.round(api.avgDuration)}ms
                </span>
              </div>
            ))}
            {(data.aggregated.slowAPIs || []).length === 0 && (
              <div className="text-white/50 text-sm">No slow APIs detected</div>
            )}
          </div>
        </div>

        {/* Performance Score */}
        <div className="glass-card glass-card-hover p-6">
          <h3 className="text-white font-bold text-lg mb-4">Overall Score</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {calculateOverallScore(data.aggregated)}
            </div>
            <div className="text-white/70">Performance Score</div>
          </div>
        </div>
      </div>

      {/* Recent Metrics and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Metrics */}
        <div className="glass-card p-6">
          <h3 className="text-white font-bold text-lg mb-4">Recent Metrics</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.metrics.slice(0, 20).map((metric, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-white/10">
                <div>
                  <span className="text-white/90 font-medium">{metric.metric_name}</span>
                  <div className="text-white/50 text-xs">
                    {new Date(metric.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className={`font-bold ${getScoreColor(metric.metric_name, parseFloat(metric.metric_value))}`}>
                  {formatValue(metric.metric_name, parseFloat(metric.metric_value))}
                </div>
              </div>
            ))}
            {data.metrics.length === 0 && (
              <div className="text-white/50 text-center py-8">No metrics data available</div>
            )}
          </div>
        </div>

        {/* Performance Alerts */}
        {showAlerts && (
          <div className="glass-card p-6">
            <h3 className="text-white font-bold text-lg mb-4">Performance Alerts</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.slice(0, 10).map((alert, index) => (
                <div key={index} className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-red-400 font-medium">{alert.metric_type} Alert</div>
                      <div className="text-white/70 text-sm">{alert.page}</div>
                      <div className="text-white/50 text-xs">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-red-400 font-bold">
                      {formatValue(alert.metric_type, parseFloat(alert.value))}
                    </div>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-green-400 text-center py-8">
                  🎉 No performance alerts - All systems running smoothly!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to calculate overall performance score
function calculateOverallScore(aggregated) {
  const scores = []
  const thresholds = {
    avgLCP: { good: 2500, poor: 4000 },
    avgFID: { good: 100, poor: 300 },
    avgCLS: { good: 0.1, poor: 0.25 },
    avgFCP: { good: 1800, poor: 3000 },
    avgTTFB: { good: 600, poor: 1500 }
  }
  
  Object.entries(thresholds).forEach(([metric, threshold]) => {
    const value = aggregated[metric]
    if (value !== undefined && value !== null) {
      if (value <= threshold.good) scores.push(100)
      else if (value <= threshold.poor) scores.push(75)
      else scores.push(50)
    }
  })
  
  if (scores.length === 0) return "N/A"
  
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  return Math.round(average)
}

export default PerformanceDashboard
