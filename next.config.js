/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript type checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Configure images
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Add empty turbopack config to silence Next.js 16 warning
  turbopack: {},
};

// For production builds, add additional configurations
if (process.env.NODE_ENV === "production") {
  nextConfig.output = "standalone";
}

module.exports = nextConfig;
