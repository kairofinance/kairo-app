/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["pspn4pqflsrqqzjp.public.blob.vercel-storage.com"],
  },
  transpilePackages: ["@react-pdf/renderer", "viem"],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
