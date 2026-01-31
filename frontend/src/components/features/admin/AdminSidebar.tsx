/**
 * AdminSidebar - 后台管理侧边导航栏（Apple 风格重设计）
 * 
 * 功能特性：
 * - Apple 风格设计（毛玻璃效果、柔和阴影、流畅动画）
 * - 导航项列表渲染（Dashboard、Users、LLM Config、API Keys、Logs、System、RAG）
 * - 活动状态高亮（使用 var(--color-primary) 作为背景色）
 * - 悬停动画效果（200ms ease-in-out）
 * - 顶部 Logo 和应用名称
 * - 底部用户信息和退出按钮
 * - 响应式折叠功能（<1024px）
 * - 宽度过渡动画（280px ↔ 80px）
 * - 折叠/展开切换按钮
 * 
 * 验证需求: 3.1, 3.2, 3.3, 3.6, 3.7, 3.8, 8.2, 8.3
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Brain,
  Key,
  FileText,
  Settings,
  Database,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminUIStore } from '@/stores/adminUIStore';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, href: '/admin' },
  { id: 'users', label: '用户管理', icon: Users, href: '/admin/users' },
  { id: 'llm-config', label: 'LLM 配置', icon: Brain, href: '/admin/llm-config' },
  { id: 'api-keys', label: 'API 密钥', icon: Key, href: '/admin/api-keys' },
  { id: 'logs', label: '系统日志', icon: FileText, href: '/admin/logs' },
  { id: 'system', label: '系统设置', icon: Settings, href: '/admin/system' },
  { id: 'rag', label: 'RAG 管理', icon: Database, href: '/admin/rag' },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, setSidebarCollapsed, toggleSidebar } = useAdminUIStore();

  // 响应式断点行为：在小于 1024px 时自动折叠
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    // 初始检查
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    // 清除本地存储的认证信息
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'h-screen flex flex-col',
        'bg-[var(--color-background-elevated)]/80',
        'backdrop-blur-xl',
        'border-r border-[var(--color-text-disabled)]/20',
        'shadow-[var(--shadow-md)]',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-[80px]' : 'w-[280px]',
        className
      )}
    >
      {/* 折叠/展开切换按钮 */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-3 top-8 z-10',
          'w-6 h-6 rounded-full',
          'bg-[var(--color-background-elevated)]',
          'border border-[var(--color-text-disabled)]/20',
          'shadow-[var(--shadow-sm)]',
          'flex items-center justify-center',
          'text-[var(--color-text-secondary)]',
          'hover:text-[var(--color-primary)]',
          'hover:border-[var(--color-primary)]/30',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50'
        )}
        aria-label={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
        title={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* 顶部 Logo 和应用名称 */}
      <div className="h-20 flex items-center px-6 border-b border-[var(--color-text-disabled)]/20">
        {sidebarCollapsed ? (
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-[var(--shadow-sm)] mx-auto">
            <span className="text-white font-bold text-lg">阅</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center shadow-[var(--shadow-sm)]">
              <span className="text-white font-bold text-lg">阅</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-[var(--color-text-primary)]">
                阅影·log
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)]">
                管理后台
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 导航项列表 */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 py-3',
                    'rounded-[var(--radius-md)]',
                    'transition-all duration-200 ease-in-out',
                    'group relative',
                    sidebarCollapsed ? 'px-0 justify-center' : 'px-4',
                    active
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'text-[var(--color-text-primary)] hover:bg-[var(--color-background-paper)]'
                  )}
                  aria-current={active ? 'page' : undefined}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 flex-shrink-0',
                      active
                        ? 'text-[var(--color-primary)]'
                        : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'
                    )}
                  />
                  {!sidebarCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">
                        {item.label}
                      </span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--color-error)] text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {active && !sidebarCollapsed && (
                    <div className="absolute right-2 w-1 h-6 bg-[var(--color-primary)] rounded-full" />
                  )}
                  {active && sidebarCollapsed && (
                    <div className="absolute left-0 w-1 h-8 bg-[var(--color-primary)] rounded-r-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 底部用户信息和退出按钮 */}
      <div className="p-4 border-t border-[var(--color-text-disabled)]/20">
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={handleLogout}
              className={cn(
                'p-2 rounded-[var(--radius-sm)]',
                'text-[var(--color-error)]',
                'hover:bg-[var(--color-error)]/10',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-error)]/50'
              )}
              aria-label="退出登录"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-background-paper)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                管理员
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] truncate">
                admin@yueying.log
              </p>
            </div>
            <button
              onClick={handleLogout}
              className={cn(
                'p-2 rounded-[var(--radius-sm)]',
                'text-[var(--color-error)]',
                'hover:bg-[var(--color-error)]/10',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-error)]/50'
              )}
              aria-label="退出登录"
              title="退出登录"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
