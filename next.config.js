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
    ignoreBuildErrors: true,  // Skip TS check - run separately
  },
};

module.exports = nextConfig;
