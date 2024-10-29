/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("sharp");
    }
    return config;
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 1024],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
    domains: ["pspn4pqflsrqqzjp.public.blob.vercel-storage.com"],
  },
  transpilePackages: ["viem"],
};

module.exports = nextConfig;
