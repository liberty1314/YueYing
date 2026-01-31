/**
 * StatCard - 统计卡片组件
 * 
 * 紧凑的统计数据展示卡片，用于 Dashboard 页面。
 * 相比 DashboardCard 更加紧凑，支持点击跳转功能。
 * 采用 Apple 风格设计，带有圆形图标背景和悬停效果。
 * 
 * @example
 * ```tsx
 * <StatCard
 *   label="活跃用户"
 *   value={856}
 *   icon={Users}
 *   trend={{ value: 8.2, direction: 'up' }}
 *   color="var(--color-primary)"
 *   onClick={() => router.push('/admin/users')}
 * />
 * ```
 */

import { forwardRef } from 'react';
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  /** 统计标签 */
  label: string;
  /** 统计数值 */
  value: string | number;
  /** 图标组件 */
  icon: LucideIcon;
  /** 趋势数据（可选） */
  trend?: {
    /** 变化百分比 */
    value: number;
    /** 趋势方向 */
    direction: 'up' | 'down';
  };
  /** 图标颜色（使用 CSS 变量） */
  color?: string;
  /** 加载状态 */
  loading?: boolean;
  /** 点击事件处理（可点击跳转） */
  onClick?: () => void;
  /** 自定义类名 */
  className?: string;
}

const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label,
      value,
      icon: Icon,
      trend,
      color = 'var(--color-primary)',
      loading = false,
      onClick,
      className,
    },
    ref
  ) => {
    // 加载状态
    if (loading) {
      return (
        <Card
          ref={ref}
          variant="elevated"
          className={cn(
            'p-4',
            'backdrop-blur-xl bg-white/80 dark:bg-[#1C1C1E]/80',
            'shadow-[var(--shadow-sm)]',
            'rounded-[var(--radius-md)]',
            className
          )}
        >
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height={12} />
              <Skeleton width="40%" height={20} />
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        variant="elevated"
        hoverable={!!onClick}
        onClick={onClick}
        className={cn(
          'p-4',
          'backdrop-blur-xl bg-white/80 dark:bg-[#1C1C1E]/80',
          'shadow-[var(--shadow-sm)]',
          'hover:shadow-[var(--shadow-md)]',
          'rounded-[var(--radius-md)]',
          'transition-all duration-200 ease-in-out',
          onClick && 'cursor-pointer',
          className
        )}
      >
        <div className="flex items-center gap-3">
          {/* 图标 - 圆形背景 */}
          <div
            className={cn(
              'flex items-center justify-center',
              'w-10 h-10 rounded-full',
              'transition-transform duration-200',
              onClick && 'group-hover:scale-110'
            )}
            style={{
              backgroundColor: `${color}20`, // 20% 透明度
            }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>

          {/* 内容区域 */}
          <div className="flex-1 min-w-0">
            {/* 标签 */}
            <p className="text-xs font-medium text-[var(--color-text-secondary)] truncate">
              {label}
            </p>

            {/* 数值和趋势 */}
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-semibold text-[var(--color-text-primary)]">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>

              {/* 趋势指示器 */}
              {trend && (
                <div className="flex items-center gap-0.5">
                  {trend.direction === 'up' ? (
                    <ArrowUp className="w-3 h-3 text-[var(--color-success)]" />
                  ) : (
                    <ArrowDown className="w-3 h-3 text-[var(--color-error)]" />
                  )}
                  <span
                    className={cn(
                      'text-xs font-medium',
                      trend.direction === 'up'
                        ? 'text-[var(--color-success)]'
                        : 'text-[var(--color-error)]'
                    )}
                  >
                    {Math.abs(trend.value)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export { StatCard };
