import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/common/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '阅影·log - AI驱动的个人娱乐记录平台',
  description:
    '智能、私密的电影、动漫、电视剧和书籍记录工具，提供AI标签生成、个性化推荐和智能对话助手',
  keywords: [
    '电影记录',
    '书籍记录',
    '动漫记录',
    'AI推荐',
    '观影记录',
    '阅读记录',
  ],
  authors: [{ name: 'YueYing Team' }],
  creator: 'YueYing Team',
  publisher: 'YueYing',
  robots: 'index, follow',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const themeColor = [
  { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}

