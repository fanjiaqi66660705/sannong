/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // GitHub Pages 静态导出配置
  output: "export",
  basePath: "/sannong",
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;
