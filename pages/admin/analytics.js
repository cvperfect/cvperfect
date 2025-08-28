/**
 * CVPerfect Admin Analytics Page
 * Enterprise analytics dashboard with authentication
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');

  // Check authentication on mount
  useEffect(() => {
    // Check for stored admin session
    const storedKey = localStorage.getItem('cvperfect_admin_key');
    if (storedKey) {
      setAdminKey(storedKey);
      validateAdminKey(storedKey);
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Validate admin key
  const validateAdminKey = async (key) => {
    try {
      const response = await fetch('/api/analytics-dashboard?metric=overview&timeframe=7d', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': key
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('cvperfect_admin_key', key);
      } else {
        setError('Invalid admin key');
        localStorage.removeItem('cvperfect_admin_key');
      }
    } catch (err) {
      setError('Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle admin login
  const handleLogin = (e) => {
    e.preventDefault();
    if (adminKey.trim()) {
      setAuthLoading(true);
      setError('');
      validateAdminKey(adminKey.trim());
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminKey('');
    localStorage.removeItem('cvperfect_admin_key');
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Authentication form
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Login - CVPerfect Analytics</title>
          <meta name="robots" content="noindex" />
        </Head>
        
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                CVPerfect Admin Access
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Enter admin key to access analytics dashboard
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="admin-key" className="sr-only">
                  Admin Key
                </label>
                <input
                  id="admin-key"
                  name="admin-key"
                  type="password"
                  required
                  className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Admin API Key"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={authLoading || !adminKey.trim()}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? 'Authenticating...' : 'Access Dashboard'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
              <p>Protected admin area. Unauthorized access is prohibited.</p>
              <p className="mt-1">Contact system administrator for access.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Authenticated dashboard
  return (
    <>
      <Head>
        <title>Analytics Dashboard - CVPerfect Admin</title>
        <meta name="robots" content="noindex" />
        <meta name="description" content="CVPerfect enterprise analytics dashboard" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">CVPerfect Admin</h1>
                <nav className="ml-8 space-x-4">
                  <a 
                    href="/admin/analytics" 
                    className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium"
                  >
                    Analytics
                  </a>
                  <a 
                    href="/admin/users" 
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                  >
                    Users
                  </a>
                  <a 
                    href="/admin/security" 
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                  >
                    Security
                  </a>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Admin Access</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main>
          <AnalyticsDashboard 
            adminKey={adminKey}
            refreshInterval={300000} // 5 minutes
            timeframe="30d"
          />
        </main>
      </div>
    </>
  );
}