/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["pspn4pqflsrqqzjp.public.blob.vercel-storage.com"],
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
    optimizeFonts: true,
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
