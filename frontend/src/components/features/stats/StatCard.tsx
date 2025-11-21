/**
 * StatCard - 统计卡片组件
 * Week 6: 数据可视化 - 支持动画、趋势指示器和进度环
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { TrendingUpIcon, TrendingDownIcon, LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  suffix?: string;
  onClick?: () => void;
  className?: string;
  animate?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-primary-500',
  iconBgColor = 'bg-primary-100 dark:bg-primary-900/30',
  trend,
  trendValue,
  suffix,
  onClick,
  className,
  animate = true,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 数字动画效果
  useEffect(() => {
    if (!animate || typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    setIsAnimating(true);
    const duration = 1000; // 1秒动画
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, value);
      setDisplayValue(Math.round(current));

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
        setIsAnimating(false);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animate]);

  // 趋势颜色
  const trendColor = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  }[trend || 'neutral'];

  // 趋势图标
  const TrendIcon = trend === 'up' ? TrendingUpIcon : trend === 'down' ? TrendingDownIcon : null;

  return (
    <Card
      variant="elevated"
      className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className || ''}`}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header: Label and Icon */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </span>
          {Icon && (
            <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          )}
        </div>

        {/* Value and Trend */}
        <div className="flex items-end justify-between">
          <div>
            <p className={`text-3xl font-bold text-gray-900 dark:text-white ${isAnimating ? 'transition-all' : ''}`}>
              {displayValue}
              {suffix && <span className="text-xl ml-1">{suffix}</span>}
            </p>
          </div>

          {/* Trend Indicator */}
          {trend && trendValue !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
              {TrendIcon && <TrendIcon className="w-4 h-4" />}
              <span>{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>

        {/* Optional Progress Bar */}
        {trend && trendValue !== undefined && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
              <span>
                {trend === 'up' ? '较上期增长' : trend === 'down' ? '较上期下降' : '较上期持平'}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * StatCardGrid - 统计卡片网格容器
 */
export interface StatCardGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export function StatCardGrid({ children, cols = 4, className }: StatCardGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[cols];

  return (
    <div className={`grid ${gridCols} gap-4 ${className || ''}`}>
      {children}
    </div>
  );
}
