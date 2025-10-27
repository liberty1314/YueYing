export const siteConfig = {
  name: '阅影·log',
  description: 'AI驱动的个人娱乐记录平台',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  links: {
    github: 'https://github.com/yourusername/yueying',
    docs: '/docs',
  },
}

export type SiteConfig = typeof siteConfig

