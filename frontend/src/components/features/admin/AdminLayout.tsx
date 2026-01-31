/**
 * AdminLayout - 后台管理布局容器（Apple 风格重设计）
 * 
 * 功能特性：
 * - 整合 AdminSidebar 和主内容区域
 * - 响应式布局（桌面、平板）
 * - 主题切换器（AnimatedThemeToggler）固定在右上角
 * - 使用 Flexbox 布局
 * - 侧边栏固定在左侧
 * - 主内容区域占据剩余空间
 * - 使用设计 token
 * - Apple 风格页面切换动画
 * 
 * 验证需求: 8.1, 8.2, 10.5
 */

'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './AdminSidebar';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-[var(--color-background-default)]">
      {/* 侧边栏 - 固定在左侧 */}
      <AdminSidebar />

      {/* 主内容区域 - 占据剩余空间 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 - 包含主题切换器 */}
        <header className="h-16 flex items-center justify-end px-6 border-b border-[var(--color-text-disabled)]/20 bg-[var(--color-background-elevated)]/50 backdrop-blur-sm sticky top-0 z-30">
          {/* 主题切换器 - 固定在右上角 */}
          <AnimatedThemeToggler
            className={cn(
              'w-10 h-10 rounded-[var(--radius-md)]',
              'flex items-center justify-center',
              'text-[var(--color-text-primary)]',
              'hover:bg-[var(--color-background-paper)]',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50'
            )}
          />
        </header>

        {/* 页面内容 - Apple 风格页面切换动画 */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0.0, 0.2, 1], // Apple 风格的 cubic-bezier
                }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
