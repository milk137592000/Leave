/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXT_PUBLIC_LIFF_ID: process.env.LIFF_ID,
  },
};

export default nextConfig;