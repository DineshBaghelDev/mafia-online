/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Optimize for production
  swcMinify: true,
};

module.exports = nextConfig;
