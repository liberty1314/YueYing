/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 React 严格模式
  reactStrictMode: true,

  // 输出配置（用于 Docker 生产环境）
  output: 'standalone',

  // 图片优化配置
  images: {
    domains: [
      'localhost',
      'image.tmdb.org', // TMDB 图片
      'books.google.com', // Google Books 封面
      'img2.doubanio.com', // 豆瓣图片
      'img1.doubanio.com',
      's4.anilist.co', // AniList 图片
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // 环境变量配置
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // 实验性功能
  experimental: {
    // 启用服务端组件
    serverActions: true,
  },

  // Webpack 配置
  webpack: (config, { isServer }) => {
    // 可以在这里添加自定义 webpack 配置
    return config;
  },

  // 开发环境配置
  ...(process.env.NODE_ENV === 'development' && {
    // 开发环境下的额外配置
  }),
};

module.exports = nextConfig;

