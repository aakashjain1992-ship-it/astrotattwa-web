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
  }
};

module.exports = nextConfig;
