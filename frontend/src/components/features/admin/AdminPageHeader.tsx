/**
 * AdminPageHeader - 后台管理页面头部组件
 * 
 * 提供统一的页面头部布局，包含标题、描述、面包屑导航和操作按钮区域。
 * 采用 Apple 风格设计，使用设计 token 确保视觉一致性。
 * 
 * @component
 * @example
 * ```tsx
 * // 基础用法
 * <AdminPageHeader
 *   title="用户管理"
 *   description="管理系统用户账户和权限"
 * />
 * 
 * // 带面包屑导航
 * <AdminPageHeader
 *   title="用户详情"
 *   breadcrumbs={[
 *     { label: '首页', href: '/admin' },
 *     { label: '用户管理', href: '/admin/users' },
 *     { label: '用户详情' }
 *   ]}
 * />
 * 
 * // 带操作按钮
 * <AdminPageHeader
 *   title="用户管理"
 *   actions={
 *     <AppleButton variant="primary" onClick={handleCreate}>
 *       创建用户
 *     </AppleButton>
 *   }
 * />
 * ```
 */

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 面包屑导航项接口
 */
export interface Breadcrumb {
  /** 显示标签 */
  label: string;
  /** 链接地址（可选，最后一项通常不需要链接） */
  href?: string;
}

/**
 * AdminPageHeader 组件属性接口
 */
export interface AdminPageHeaderProps {
  /** 页面标题 */
  title: string;
  /** 页面描述（可选） */
  description?: string;
  /** 面包屑导航（可选） */
  breadcrumbs?: Breadcrumb[];
  /** 右侧操作按钮区域（可选） */
  actions?: React.ReactNode;
  /** 自定义 CSS 类名 */
  className?: string;
}

/**
 * AdminPageHeader 组件
 * 
 * 后台管理页面的统一头部组件，提供标题、描述、面包屑导航和操作按钮区域。
 * 
 * 设计特点：
 * - 使用 Apple 风格排版（大标题 + 副标题）
 * - 面包屑导航使用 `var(--color-text-secondary)`
 * - 操作按钮区域支持自定义内容
 * - 底部使用细分隔线（`var(--color-text-disabled)` 1px）
 * - 响应式布局，小屏幕上标题和操作按钮垂直排列
 * 
 * @param {AdminPageHeaderProps} props - 组件属性
 * @returns {JSX.Element} AdminPageHeader 组件
 */
export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: AdminPageHeaderProps): JSX.Element {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 pb-6 border-b',
        'border-[var(--color-text-disabled)]',
        className
      )}
    >
      {/* 面包屑导航 */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="面包屑导航" className="flex items-center gap-2">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <React.Fragment key={index}>
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className={cn(
                      'text-sm font-medium',
                      'text-[var(--color-text-secondary)]',
                      'hover:text-[var(--color-primary)]',
                      'transition-colors duration-200'
                    )}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isLast
                        ? 'text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-secondary)]'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
                
                {/* 分隔符 */}
                {!isLast && (
                  <ChevronRight
                    className="w-4 h-4 text-[var(--color-text-disabled)]"
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* 标题和操作按钮区域 */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* 标题和描述 */}
        <div className="flex flex-col gap-2">
          <h1
            className={cn(
              'text-3xl font-bold',
              'text-[var(--color-text-primary)]',
              'tracking-tight'
            )}
          >
            {title}
          </h1>
          
          {description && (
            <p
              className={cn(
                'text-base',
                'text-[var(--color-text-secondary)]',
                'max-w-2xl'
              )}
            >
              {description}
            </p>
          )}
        </div>

        {/* 操作按钮区域 */}
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminPageHeader;
