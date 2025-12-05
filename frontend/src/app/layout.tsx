import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NextTopLoader from 'nextjs-toploader';
import ThemeRegistry from '@/components/shared/ThemeRegistry';
import AuthProvider from '@/components/shared/AuthProvider';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { Navbar } from '@/components/layout/Navbar';

// 字体优化
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'YueYing - 阅影·log',
  description: 'AI-driven personal entertainment tracking platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        {/* 全局路由加载进度条 - 解决开发环境懒编译导致的"无反馈"问题 */}
        <NextTopLoader
          color="#cbd5e1"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 5px #cbd5e1"
          zIndex={1600}
        />
        <ThemeRegistry>
          <AuthProvider>
            <ErrorBoundary>
              <Navbar />
              {children}
            </ErrorBoundary>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
