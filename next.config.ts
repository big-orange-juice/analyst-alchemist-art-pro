import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    FILE_UPLOAD_URL: process.env.FILE_UPLOAD_URL
  }
  // no rewrites needed; frontend calls /api/auth/* directly
};

export default nextConfig;
