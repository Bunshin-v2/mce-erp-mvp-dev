/** @type {import('next').NextConfig} */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ywiwcrbwvdrjtujjgejx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Allow Google/Meta images for user avatars involved in integrations later
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
    ],
  },
  compiler: {
    // Remove console.log in production to keep client logs clean
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  experimental: {
    // serverActions: true, // Enabled by default in Next 14+
  },
};

export default nextConfig;
