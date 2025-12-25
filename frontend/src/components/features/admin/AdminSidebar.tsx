/**
 * AdminSidebar - 后台管理侧边导航栏
 * Week 7 Day 1: 后台管理基础设施
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboardIcon,
  UsersIcon,
  BrainCircuitIcon,
  KeyIcon,
  FileTextIcon,
  DatabaseIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
}

const navItems: NavItem[] = [
  {
    name: '仪表盘',
    href: '/admin',
    icon: LayoutDashboardIcon,
    description: '核心指标和系统概览',
  },
  {
    name: '用户管理',
    href: '/admin/users',
    icon: UsersIcon,
    description: '用户列表和权限管理',
  },
  {
    name: 'LLM配置',
    href: '/admin/llm-config',
    icon: BrainCircuitIcon,
    description: 'AI模型提供商配置',
  },
  {
    name: 'API密钥',
    href: '/admin/api-keys',
    icon: KeyIcon,
    description: '第三方服务API配置',
  },
  {
    name: '系统日志',
    href: '/admin/logs',
    icon: FileTextIcon,
    description: '实时日志流和历史记录',
  },
  {
    name: '缓存管理',
    href: '/admin/cache',
    icon: DatabaseIcon,
    description: 'Redis缓存监控和管理',
  },
  {
    name: '系统设置',
    href: '/admin/system',
    icon: SettingsIcon,
    description: '全局系统配置',
  },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        ${collapsed ? 'w-20' : 'w-64'} 
        bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out
        flex flex-col
        ${className || ''}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {/* {!collapsed && (
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            后台管理
          </h2>
        )} */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${active
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? item.name : ''}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />

                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                      {item.description && !active && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  )}

                  {!collapsed && active && (
                    <div className="w-1 h-6 bg-primary-600 dark:bg-primary-400 rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {!collapsed ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>阅影·log 管理后台</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full" title="系统运行中" />
          </div>
        )}
      </div>
    </aside>
  );
}
