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
      'lain.bgm.tv', // Bangumi 图片
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // 环境变量配置
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // 性能优化配置
  swcMinify: true, // 使用 SWC 进行代码压缩（更快）

  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'], // 优化包导入
  },

  // Webpack 配置
  webpack: (config, { isServer }) => {
    // 优化构建性能
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // 开发环境配置
  ...(process.env.NODE_ENV === 'development' && {
    // 开发环境下的额外配置
  }),
};

module.exports = nextConfig;

