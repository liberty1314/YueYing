/**
 * Navbar - 顶部导航栏（高级版 - Glassmorphism + Framer Motion）
 * 
 * 特性：
 * - 毛玻璃效果 (Glassmorphism)
 * - 流动光标动画 (Magic Motion with layoutId)
 * - 微交互反馈
 * - 响应式设计
 */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimatedThemeToggler } from '@/components/ui';
import { SmartSearchBar } from '@/components/features/search/SmartSearchBar';
import { useAuthStore } from '@/stores/authStore';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { authApi } from '@/lib/api';
import {
  HomeIcon,
  LayoutGridIcon,
  BotIcon,
  SparklesIcon,
  BarChart3Icon,
  SearchIcon,
  SettingsIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  LogOutIcon,
  ShieldIcon,
  LogInIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresExplore?: boolean;
}

const allNavItems: NavItem[] = [
  { href: '/', label: '首页', icon: HomeIcon },
  { href: '/library', label: '我的记录', icon: LayoutGridIcon },
  { href: '/assistant', label: 'AI助手', icon: BotIcon },
  { href: '/recommendations', label: '智能推荐', icon: SparklesIcon, requiresExplore: true },
  { href: '/analytics', label: '数据统计', icon: BarChart3Icon },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { settings } = useSystemSettings();

  // 根据系统设置过滤导航项
  const navItems = useMemo(() => {
    return allNavItems.filter(item => {
      // 如果菜单项需要探索功能，检查系统设置
      if (item.requiresExplore) {
        return settings?.enable_explore ?? true; // 默认显示，直到设置加载完成
      }
      return true;
    });
  }, [settings]);

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
      logout();
      setUserMenuOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
      // 即使API调用失败，也清除本地状态
      logout();
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-[#1C1C1E]/70 border-b border-gray-200/40 dark:border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - 增加悬停效果 */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold group"
          >
            <motion.div
              className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              {/* 光泽效果 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
                initial={{ x: '-100%', y: '-100%' }}
                whileHover={{ x: '100%', y: '100%' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
              <SparklesIcon className="w-5 h-5 text-white relative z-10" />
            </motion.div>
            <motion.span
              className="hidden sm:inline text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              阅影
            </motion.span>
          </Link>

          {/* Desktop Navigation - 流动光标效果 */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/30 rounded-full p-1 backdrop-blur-sm border border-gray-200/40 dark:border-gray-700/40 shadow-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.div
                  key={item.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Link
                    href={item.href}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors z-10"
                  >
                    {/* 流动光标 - 使用 layoutId 实现魔术移动效果 */}
                    {active && (
                      <motion.div
                        layoutId="navbar-active-pill"
                        className="absolute inset-0 bg-white dark:bg-gray-700 rounded-full shadow-md"
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 35,
                          mass: 0.8,
                        }}
                      />
                    )}

                    {/* Hover 效果 - 未激活时显示 */}
                    {!active && (
                      <motion.div
                        className="absolute inset-0 bg-gray-200/50 dark:bg-gray-600/30 rounded-full"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}

                    {/* 图标和文字 - 保持在光标上方 */}
                    <motion.div
                      className="relative z-10 flex items-center gap-2"
                      animate={{
                        scale: active ? 1 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors duration-200',
                          active
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400'
                        )}
                      />
                      <span
                        className={cn(
                          'transition-all duration-200',
                          active
                            ? 'text-gray-900 dark:text-white font-semibold'
                            : 'text-gray-600 dark:text-gray-400'
                        )}
                      >
                        {item.label}
                      </span>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* 搜索按钮（移动端）- 增加动画 */}
            <motion.button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{ rotate: searchOpen ? 90 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <SearchIcon className="w-5 h-5" />
            </motion.button>

            {/* 搜索栏（桌面端）- 增加聚焦动画 */}
            <motion.div
              className="hidden md:block w-64"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
              transition={{
                opacity: { delay: 0.1 },
                x: { delay: 0.1 },
                scale: { type: 'spring', stiffness: 400, damping: 17 }
              }}
            >
              <SmartSearchBar />
            </motion.div>

            {/* 主题切换 */}
            <AnimatedThemeToggler />

            {/* 用户菜单或登录按钮 */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition-shadow ring-2 ring-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {(() => {
                    // Check all possible avatar field names
                    const userObj = user as any;
                    const avatarUrl = userObj?.avatar_url || userObj?.avatarUrl || userObj?.avatar;

                    if (avatarUrl) {
                      const src = avatarUrl.startsWith('/')
                        ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${avatarUrl}`
                        : avatarUrl;

                      return (
                        <img
                          src={src}
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      );
                    }

                    return <UserIcon className="w-5 h-5 text-white" />;
                  })()}
                </motion.button>

                {/* 用户下拉菜单 - 增加动画 */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{
                        duration: 0.2,
                        ease: [0.4, 0, 0.2, 1] // iOS 风格的缓动曲线
                      }}
                      className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50"
                    >
                      <motion.div
                        className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                      </motion.div>
                      <div className="py-1">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <motion.div whileTap={{ scale: 0.98 }}>
                            <Link
                              href="/settings"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
                            >
                              <SettingsIcon className="w-4 h-4" />
                              设置
                            </Link>
                          </motion.div>
                        </motion.div>
                        {user.is_admin && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            <motion.div whileTap={{ scale: 0.98 }}>
                              <Link
                                href="/admin"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
                              >
                                <ShieldIcon className="w-4 h-4" />
                                管理后台
                              </Link>
                            </motion.div>
                          </motion.div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: user.is_admin ? 0.2 : 0.15 }}
                        >
                          <motion.div whileTap={{ scale: 0.98 }}>
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            >
                              <LogOutIcon className="w-4 h-4" />
                              {isLoggingOut ? '退出中...' : '退出登录'}
                            </button>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-purple-600 text-white rounded-full hover:shadow-lg transition-shadow text-sm font-medium"
                >
                  <LogInIcon className="w-4 h-4 text-white" />
                  <span className="text-white">登录</span>
                </Link>
              </motion.div>
            )}

            {/* Mobile Menu Button - 增加旋转动画 */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? (
                  <XIcon className="w-5 h-5" />
                ) : (
                  <MenuIcon className="w-5 h-5" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Search - 增加滑入动画 */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4">
                <SmartSearchBar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation - 增加列表动画 */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1] // iOS 风格的缓动曲线
              }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    >
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden',
                            active
                              ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-200/50 dark:border-blue-700/50'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
                          )}
                        >
                          <Icon className="w-5 h-5 relative z-10" />
                          <span className="relative z-10">{item.label}</span>
                          {active && (
                            <motion.div
                              layoutId="mobile-active-bg"
                              className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl"
                              transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 35,
                                mass: 0.8,
                              }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
