/**
 * CVPerfect Enterprise Analytics Dashboard Component
 * Real-time business intelligence and performance visualization
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = {
  primary: '#0066CC',
  secondary: '#00AA44', 
  warning: '#FF6B00',
  danger: '#CC0000',
  success: '#22CC22',
  info: '#0099FF'
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.warning, COLORS.info];

export default function AnalyticsDashboard({ 
  adminKey = 'cvp_admin_2025_secure_key_xyz789',
  refreshInterval = 300000, // 5 minutes
  timeframe = '30d' 
}) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  // Fetch analytics data
  const fetchAnalytics = async (metric = 'overview') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics-dashboard?metric=${metric}&timeframe=${selectedTimeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': adminKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics');
      }

      setDashboardData(result.data);
      setError(null);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refresh interval
  useEffect(() => {
    fetchAnalytics(selectedMetric);
    
    const interval = setInterval(() => {
      fetchAnalytics(selectedMetric);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [selectedMetric, selectedTimeframe, refreshInterval]);

  // Handle metric change
  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
    fetchAnalytics(metric);
  };

  // KPI Cards Component
  const KPICards = ({ kpis }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <KPICard 
        title="Monthly Revenue" 
        value={`${kpis.totalRevenue || 0} PLN`} 
        change={kpis.revenueGrowth || 0}
        color={COLORS.success}
      />
      <KPICard 
        title="Total Sessions" 
        value={kpis.totalSessions || 0} 
        change={kpis.sessionGrowth || 0}
        color={COLORS.primary}
      />
      <KPICard 
        title="Conversion Rate" 
        value={`${kpis.conversionRate || 0}%`} 
        change={kpis.conversionGrowth || 0}
        color={COLORS.warning}
      />
      <KPICard 
        title="ML Success Rate" 
        value={`${kpis.successRate || 0}%`} 
        change={kpis.mlGrowth || 0}
        color={COLORS.info}
      />
    </div>
  );

  // Individual KPI Card
  const KPICard = ({ title, value, change, color }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '↗' : '↘'} {Math.abs(change)}%
        </div>
      </div>
    </div>
  );

  // Revenue Chart Component
  const RevenueChart = ({ revenueData }) => {
    const chartData = revenueData?.dailyRevenue?.map(day => ({
      date: new Date(day.date).toLocaleDateString(),
      revenue: day.revenue || 0,
      transactions: day.transactions || 0
    })) || [];

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke={COLORS.success} 
              fill={COLORS.success} 
              fillOpacity={0.3}
              name="Revenue (PLN)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Plan Distribution Chart
  const PlanDistributionChart = ({ planData }) => {
    const chartData = planData?.map((plan, index) => ({
      name: plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1),
      value: plan.count,
      revenue: plan.revenue,
      color: CHART_COLORS[index % CHART_COLORS.length]
    })) || [];

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Plan Distribution</h3>
        <div className="flex flex-col lg:flex-row items-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="lg:ml-8">
            {chartData.map((plan, index) => (
              <div key={plan.name} className="flex items-center mb-2">
                <div 
                  className="w-4 h-4 rounded mr-3" 
                  style={{ backgroundColor: plan.color }}
                />
                <span className="text-sm">
                  {plan.name}: {plan.value} users (${plan.revenue} PLN)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ML Performance Chart
  const MLPerformanceChart = ({ mlData }) => {
    const chartData = mlData?.optimizationTrends?.map(day => ({
      date: new Date(day.date).toLocaleDateString(),
      optimizations: day.optimizations || 0,
      successRate: day.success_rate || 0,
      avgProcessingTime: day.avg_processing_time || 0
    })) || [];

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">ML Performance Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="optimizations" 
              fill={COLORS.primary} 
              name="Optimizations"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="successRate" 
              stroke={COLORS.success} 
              name="Success Rate (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Control Panel
  const ControlPanel = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex space-x-4 mb-4 md:mb-0">
          <select 
            value={selectedMetric}
            onChange={(e) => handleMetricChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="overview">Overview</option>
            <option value="revenue">Revenue</option>
            <option value="users">Users</option>
            <option value="ml-performance">ML Performance</option>
          </select>
          
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => fetchAnalytics(selectedMetric)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <span className="text-sm text-gray-500">
            Last updated: {dashboardData ? new Date().toLocaleTimeString() : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Analytics Error</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => fetchAnalytics(selectedMetric)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard Render
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CVPerfect Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time business intelligence and performance metrics</p>
        </div>

        <ControlPanel />

        {loading && !dashboardData ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* KPI Cards */}
            {dashboardData.overview?.kpis && <KPICards kpis={dashboardData.overview.kpis} />}

            {/* Revenue Charts */}
            {dashboardData.revenue && (
              <>
                <RevenueChart revenueData={dashboardData.revenue} />
                {dashboardData.revenue.planBreakdown && (
                  <PlanDistributionChart planData={dashboardData.revenue.planBreakdown} />
                )}
              </>
            )}

            {/* ML Performance Charts */}
            {dashboardData.mlPerformance && (
              <MLPerformanceChart mlData={dashboardData.mlPerformance} />
            )}

            {/* Summary Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dashboardData.overview && (
                  <div>
                    <h4 className="font-medium text-gray-700">Overview</h4>
                    <pre className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded">
                      {JSON.stringify(dashboardData.overview, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}