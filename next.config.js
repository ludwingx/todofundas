/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Enable SWC minification
  swcMinify: true,
  // Configure images
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Configure webpack
  webpack: (config, { isServer }) => {
    // Add custom webpack configuration here if needed
    return config
  },
}

// For production builds, add additional configurations
if (process.env.NODE_ENV === 'production') {
  nextConfig.output = 'standalone'
}

module.exports = nextConfig
