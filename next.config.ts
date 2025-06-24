import type { NextConfig } from "next";

// Bypass SSL verification in development (solo se necessario)
if (process.env.NODE_ENV === 'development' && process.env.BYPASS_SSL === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  // Spostato da experimental a root level
  serverExternalPackages: ['twilio'],
  experimental: {
    // Altre configurazioni experimental se necessarie
  }
};

export default nextConfig;
