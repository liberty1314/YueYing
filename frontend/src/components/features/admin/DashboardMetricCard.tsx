/**
 * DashboardMetricCard - 仪表盘指标卡片
 * Week 7 Days 2-3: 仪表盘核心组件
 */

'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon, LucideIcon } from 'lucide-react';

export interface DashboardMetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
    label?: string;
  };
  suffix?: string;
  subtitle?: string;
  className?: string;
}

export function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-primary-500',
  iconBgColor = 'bg-primary-100 dark:bg-primary-900/30',
  trend,
  suffix,
  subtitle,
  className,
}: DashboardMetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUpIcon className="w-4 h-4" />;
      case 'down':
        return <TrendingDownIcon className="w-4 h-4" />;
      default:
        return <MinusIcon className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Card variant="elevated" className={className}>
      <div className="p-6">
        {/* Header: Label and Icon */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </span>
          <div className={`w-12 h-12 rounded-lg ${iconBgColor} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>

        {/* Value */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
              {suffix && <span className="text-xl ml-1">{suffix}</span>}
            </p>
          </div>

          {/* Trend Indicator */}
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Subtitle or Trend Label */}
        {(subtitle || trend?.label) && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {trend?.label || subtitle}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
