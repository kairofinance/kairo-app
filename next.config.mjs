/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  transpilePackages: ["wagmi", "viem", "connectkit"],
  images: {
    domains: ["images.unsplash.com", "lottie.host"],
  },
};

export default nextConfig;
