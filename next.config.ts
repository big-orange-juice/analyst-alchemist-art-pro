import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/v1/api/v2/auth/:path*',
        destination: '/api/auth/:path*'
      }
    ];
  }
};

export default nextConfig;
