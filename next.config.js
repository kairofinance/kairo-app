/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "cdn.stamp.fyi",
      "pspn4pqflsrqqzjp.public.blob.vercel-storage.com",
      // ... any other domains you have
    ],
  },
  // ... rest of your config
};

module.exports = nextConfig;
