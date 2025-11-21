import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
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
