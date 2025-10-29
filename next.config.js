/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-ready configuration
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during builds
    ignoreBuildErrors: true,
  },
  // Optimize for production
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig

