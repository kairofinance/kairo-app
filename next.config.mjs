/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "pspn4pqflsrqqzjp.public.blob.vercel-storage.com",
      "cdn.stamp.fyi",
      "mirror.xyz",
      "mirror-media.xyz",
      "arweave.net",
      "images.mirror-media.xyz",
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
