/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pspn4pqflsrqqzjp.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "cdn.stamp.fyi",
      },
      {
        protocol: "https",
        hostname: "mirror.xyz",
      },
      {
        protocol: "https",
        hostname: "mirror-media.xyz",
      },
      {
        protocol: "https",
        hostname: "arweave.net",
      },
      {
        protocol: "https",
        hostname: "images.mirror-media.xyz",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizeCss: true,
    optimisticClientCache: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: "",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
