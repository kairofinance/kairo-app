/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      // Add your production domain pattern here as well
    ],
  },
  transpilePackages: ["viem"],
};

module.exports = nextConfig;
