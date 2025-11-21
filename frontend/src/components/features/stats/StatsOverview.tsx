/**
 * StatsOverview - 统计概览卡片
 * 
 * Week 6: 数据可视化 - 关键指标概览
 */

'use client';

import { Card } from '@/components/ui';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
}

interface StatsOverviewProps {
  stats: StatItem[];
  className?: string;
}

export function StatsOverview({ stats, className }: StatsOverviewProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="space-y-2">
            {/* Icon & Label */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
              {stat.icon && (
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  {stat.icon}
                </div>
              )}
            </div>

            {/* Value */}
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>

              {/* Trend */}
              {stat.change !== undefined && stat.trend && (
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <TrendingUpIcon className="w-4 h-4" />
                  ) : (
                    <TrendingDownIcon className="w-4 h-4" />
                  )}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
