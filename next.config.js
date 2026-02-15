/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "font-src 'self' data:",
      "img-src 'self' data: blob:",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const corsHeaders = [
  { key: 'Access-Control-Allow-Origin', value: 'https://astrotattwa.com' },
  { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
  { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
  { key: 'Access-Control-Max-Age', value: '86400' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['swisseph'],

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('swisseph');
    }
    return config;
  },

  turbopack: {},

  typescript: {
    ignoreBuildErrors: true, // Skip TS check - run separately
  },

  // ✅ Security headers on all routes + CORS on API routes
  headers: async () => [
    {
      // Apply security headers to every route
      source: '/(.*)',
      headers: securityHeaders,
    },
    {
      // Apply CORS headers to all API routes
      source: '/api/(.*)',
      headers: corsHeaders,
    },
  ],
};

module.exports = nextConfig;
