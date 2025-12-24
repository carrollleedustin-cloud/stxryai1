/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect Netlify environment
const isNetlify = process.env.NETLIFY === 'true';
const isProduction = process.env.NODE_ENV === 'production';
const shouldAnalyze = process.env.ANALYZE === 'true';

const nextConfig = {
  productionBrowserSourceMaps: false, // Disable for production performance
  distDir: process.env.DIST_DIR || '.next',

  // Performance Optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Trailing slashes for Netlify compatibility
  trailingSlash: false,

  // Output configuration for Netlify
  output: isNetlify ? 'standalone' : undefined,

  // Compiler Optimizations
  compiler: {
    removeConsole: isProduction ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  eslint: {
    // Run linting separately, skip during build to avoid deprecated option errors
    ignoreDuringBuilds: true,
  },

  // TypeScript - ignore build errors in production (type checking done in CI/locally)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: !isProduction,
    },
  },

  // Image Optimization - Netlify handles this via plugin
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Use Netlify's image CDN when deployed
    loader: isNetlify ? 'default' : 'default',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'YOUR_PROJECT_URL.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'your-site-name.netlify.app',
      },
    ],
  },

  // Webpack Optimizations
  webpack(config, { isServer }) {
    // Ensure @ alias resolves correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    // Custom loader
    config.module.rules.push({
      test: /\.(jsx|tsx)$/,
      exclude: [/node_modules/],
      use: [{
        loader: '@dhiwise/component-tagger/nextLoader',
      }],
    });

    // Optimize bundle size
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Separate chunk for React/Next.js
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Separate chunk for large libraries
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
                if (!match) {
                  return 'npm.unknown';
                }
                const packageName = match[1];
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 30,
            },
          },
          maxInitialRequests: 25,
          minSize: 20000,
        },
      };
    }

    return config;
  },

  // Experimental Features
  experimental: {
    optimizeCss: true,
    // Tree-shake imports from large packages
    optimizePackageImports: [
      'framer-motion',
      '@radix-ui/react-icons',
      'lucide-react',
      'date-fns',
      'recharts',
      '@heroicons/react',
      '@supabase/supabase-js',
      'cmdk',
    ],
  },

  // Module IDs for better caching
  ...(isProduction && {
    generateBuildId: async () => {
      // Use git commit hash for consistent build IDs across deployments
      return process.env.COMMIT_REF || `build-${Date.now()}`;
    },
  }),

  // Headers for security (Netlify also handles this but good for local dev)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { 
            key: 'Content-Security-Policy', 
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.anthropic.com wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; ')
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/authentication',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/authentication',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/authentication',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
