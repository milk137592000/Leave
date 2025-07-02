/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    LINE_LOGIN_CHANNEL_ID: process.env.LINE_LOGIN_CHANNEL_ID,
    LINE_LOGIN_CHANNEL_SECRET: process.env.LINE_LOGIN_CHANNEL_SECRET,
    LINE_CHANNEL_ID: process.env.LINE_CHANNEL_ID,
    LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET,
    LINE_CHANNEL_ACCESS_TOKEN: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    LIFF_ID: process.env.LIFF_ID,
    NEXT_PUBLIC_LIFF_ID: process.env.NEXT_PUBLIC_LIFF_ID,
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
};

export default nextConfig;