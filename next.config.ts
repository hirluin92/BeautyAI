import type { NextConfig } from "next";

// Bypass SSL verification in development (solo se necessario)
if (process.env.NODE_ENV === 'development' && process.env.BYPASS_SSL === 'true') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const nextConfig: NextConfig = {
  // 🚨 TEMPORANEO: Abilita per permettere il build mentre risolvi gli errori
  typescript: {
    // Cambia a false quando hai risolto tutti gli errori TS
    ignoreBuildErrors: false,
  },
  eslint: {
    // Cambia a false quando hai risolto tutti gli errori ESLint
    ignoreDuringBuilds: false,
  },
  
  // ✅ Configurazioni di performance
  serverExternalPackages: ['twilio'],
  
  experimental: {
    // Bundle optimization per ridurre size
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'date-fns'
    ],
    // Altre configurazioni experimental se necessarie
  },
  
  // ✅ Performance optimizations
  compiler: {
    // Rimuovi console.log in produzione
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // ✅ Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // ✅ Headers di sicurezza
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;