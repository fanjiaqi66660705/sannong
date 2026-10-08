/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/@vite/client",
        destination: "/api/vite-client",
      },
    ];
  },
};

module.exports = nextConfig;
