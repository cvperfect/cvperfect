/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: false,
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // CDN and edge optimization
  assetPrefix: process.env.CDN_URL || '',
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  
  // Image optimization for global CDN
  images: {
    domains: ['cvperfect.com', 'cdn.cvperfect.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // HTTP headers for global optimization
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      // EMERGENCY TTFB OPTIMIZATION: Ultra-aggressive caching for success page
      {
        source: '/success',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300, max-age=30'
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=120'
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding'
          },
          {
            key: 'X-Page-Speed-Optimized',
            value: 'emergency-mode'
          }
        ]
      },
      // API endpoint caching
      {
        source: '/api/get-session-data',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  
  // Redirects for SEO and performance
  async redirects() {
    return [
      {
        source: '/www/(.*)',
        destination: '/$1',
        permanent: true,
      },
    ]
  },
  
  webpack: (config, { _buildId, dev, isServer, _defaultLoaders, _webpack }) => {
    // SAFE Bundle optimization - avoiding chunk loading conflicts
    if (!isServer && !dev) {
      // Conservative chunk splitting to avoid runtime errors
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Keep Next.js default behavior but add safe optimizations
          default: false,
          vendors: false,
          
          // Safe splitting for large libraries only
          pdfLibs: {
            test: /[\\/]node_modules[\\/](jspdf|html2canvas)[\\/]/,
            name: 'pdf-libs',
            chunks: 'all',
            priority: 30,
            minSize: 20000,
          },
          
          // Safe splitting for document libraries
          docLibs: {
            test: /[\\/]node_modules[\\/](docx|file-saver)[\\/]/,
            name: 'doc-libs', 
            chunks: 'all',
            priority: 25,
            minSize: 20000,
          },
          
          // Animation libraries - safe splitting
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion|gsap)[\\/]/,
            name: 'animations',
            chunks: 'all',
            priority: 20,
            minSize: 10000,
          },
          
          // Utilities - conservative approach
          utils: {
            test: /[\\/]node_modules[\\/](dompurify|canvas-confetti)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 15,
            minSize: 5000,
          },
        },
      };
      
      // Safe optimization settings
      config.optimization.minimize = true;
      config.optimization.usedExports = true;
      
      // Conservative compression - only if plugin available
      if (process.env.NODE_ENV === 'production') {
        try {
          const CompressionPlugin = require('compression-webpack-plugin');
          config.plugins.push(
            new CompressionPlugin({
              algorithm: 'gzip',
              test: /\.(js|css|html|svg)$/,
              threshold: 10000, // Higher threshold for safety
              minRatio: 0.8,
            })
          );
        } catch (error) {
          console.warn('CompressionPlugin not available, skipping compression optimization');
        }
      }
    }
    
    // Optimize for edge runtime
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      });
    }
    
    return config;
  },
}

module.exports = nextConfig