/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production-ready configuration
  eslint: {
    // Enable ESLint during builds for production quality
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enable TypeScript checking during builds
    ignoreBuildErrors: false,
  },
  // Optimize for production
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig

