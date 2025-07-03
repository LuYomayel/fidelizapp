/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost"],
  },
  experimental: {
    externalDir: true,
  },
  transpilePackages: ["@shared"],
};

module.exports = {
  ...nextConfig,
  typescript: {
    ignoreBuildErrors: true,
  },
};
