/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: false,
  },
  eslint: {
    ignoreDuringBuilds: true
  }
}

module.exports = nextConfig