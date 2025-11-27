/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      encoding: false,
    };

    if (!isServer) {
      config.externals.push('pino-pretty', 'lokijs', 'encoding');
    }

    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
