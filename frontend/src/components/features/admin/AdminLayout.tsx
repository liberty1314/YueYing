/**
 * AdminLayout - 后台管理布局容器
 * Week 7 Day 1: 后台管理基础设施
 */

'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './AdminSidebar';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  MenuIcon,
  BellIcon,
  UserCircleIcon,
  LogOutIcon,
  SettingsIcon,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // 清除本地存储的认证信息
    localStorage.removeItem('token');
    router.push('/login');
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
          <div className="h-full px-4 flex items-center justify-between">
            {/* Left: Mobile Menu + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="打开菜单"
              >
                <MenuIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>

              {title && (
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      {description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                aria-label="通知"
              >
                <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.full_name || user?.username || '管理员'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => router.push('/settings')}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="设置"
                  >
                    <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                    aria-label="退出登录"
                  >
                    <LogOutIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Apple 风格页面切换动画 */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{
                  duration: 0.35,
                  ease: [0.4, 0.0, 0.2, 1], // Apple 风格的 cubic-bezier
                }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4">
          <div className="px-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <p>© 2024 阅影·log. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400">帮助文档</a>
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400">API文档</a>
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400">反馈</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
