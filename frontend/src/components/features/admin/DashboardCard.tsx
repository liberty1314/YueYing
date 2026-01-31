/**
 * DashboardCard - 仪表盘卡片组件
 * 
 * 用于展示关键指标数据，包含图标、标题、数值和趋势指示器。
 * 采用 Apple 风格设计，支持毛玻璃效果、柔和阴影和悬停动画。
 * 
 * @example
 * ```tsx
 * <DashboardCard
 *   title="总用户数"
 *   value={1234}
 *   change={{ value: 12.5, trend: 'up' }}
 *   icon={Users}
 *   iconColor="var(--color-primary)"
 * />
 * ```
 */

import { forwardRef } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export interface DashboardCardProps {
  /** 指标标题 */
  title: string;
  /** 指标数值 */
  value: string | number;
  /** 变化趋势（可选） */
  change?: {
    /** 变化百分比 */
    value: number;
    /** 趋势方向 */
    trend: 'up' | 'down';
  };
  /** 图标组件 */
  icon: LucideIcon;
  /** 图标颜色（使用 CSS 变量） */
  iconColor?: string;
  /** 加载状态 */
  loading?: boolean;
  /** 自定义类名 */
  className?: string;
}

const DashboardCard = forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ title, value, change, icon: Icon, iconColor = 'var(--color-primary)', loading = false, className }, ref) => {
    // 加载状态
    if (loading) {
      return (
        <Card
          ref={ref}
          variant="elevated"
          className={cn(
            'p-6 space-y-4',
            'backdrop-blur-xl bg-white/80 dark:bg-[#1C1C1E]/80',
            'shadow-[var(--shadow-md)]',
            'rounded-[var(--radius-lg)]',
            className
          )}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton width="60%" height={16} />
              <Skeleton width="40%" height={32} />
              <Skeleton width="30%" height={14} />
            </div>
            <Skeleton variant="circular" width={48} height={48} />
          </div>
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        variant="elevated"
        hoverable
        className={cn(
          'p-6 space-y-4',
          'backdrop-blur-xl bg-white/80 dark:bg-[#1C1C1E]/80',
          'shadow-[var(--shadow-md)]',
          'hover:shadow-[var(--shadow-lg)]',
          'rounded-[var(--radius-lg)]',
          'transition-all duration-300 ease-in-out',
          className
        )}
      >
        <div className="flex items-start justify-between">
          {/* 左侧：标题和数值 */}
          <div className="space-y-2 flex-1">
            {/* 标题 */}
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
              {title}
            </h3>
            
            {/* 数值 */}
            <p className="text-3xl font-semibold text-[var(--color-text-primary)]">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            
            {/* 趋势指示器 */}
            {change && (
              <div className="flex items-center gap-1">
                {change.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[var(--color-error)]" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    change.trend === 'up'
                      ? 'text-[var(--color-success)]'
                      : 'text-[var(--color-error)]'
                  )}
                >
                  {change.trend === 'up' ? '+' : '-'}
                  {Math.abs(change.value)}%
                </span>
              </div>
            )}
          </div>

          {/* 右侧：图标 */}
          <div
            className={cn(
              'flex items-center justify-center',
              'w-12 h-12 rounded-full',
              'transition-transform duration-300',
              'group-hover:scale-110'
            )}
            style={{
              backgroundColor: `${iconColor}20`, // 20% 透明度
            }}
          >
            <Icon
              className="w-6 h-6"
              style={{ color: iconColor }}
            />
          </div>
        </div>
      </Card>
    );
  }
);

DashboardCard.displayName = 'DashboardCard';

export { DashboardCard };
