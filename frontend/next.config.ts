import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 启用 React 严格模式
  reactStrictMode: true,

  // 启用 React Compiler
  reactCompiler: true,

  // 输出配置（用于 Docker 生产环境）
  output: 'standalone',

  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
      {
        protocol: 'https',
        hostname: 'img2.doubanio.com',
      },
      {
        protocol: 'https',
        hostname: 'img1.doubanio.com',
      },
      {
        protocol: 'https',
        hostname: 'lain.bgm.tv',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // 环境变量配置
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // 实验性功能
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
};

export default nextConfig;
