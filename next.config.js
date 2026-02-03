/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize swisseph for server-side only
      config.externals = config.externals || [];
      config.externals.push('swisseph');
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['swisseph']
  },

  env: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};


module.exports = nextConfig;
