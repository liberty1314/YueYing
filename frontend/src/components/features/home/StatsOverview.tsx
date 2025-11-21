/**
 * StatsOverview - 统计概览卡片
 * 
 * 展示用户的观影/阅读统计
 */

'use client';

import { Card, CardContent } from '@/components/ui';
import { TrendingUpIcon, BarChart3Icon, ClockIcon, SparklesIcon } from 'lucide-react';

interface StatsData {
  totalItems: number;
  thisMonth: number;
  totalHours: number;
  aiInsights: number;
}

interface StatsOverviewProps {
  stats?: StatsData;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  // 如果没有数据，显示空状态
  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '总记录数', icon: BarChart3Icon, color: 'text-primary-500', bgColor: 'bg-primary-100 dark:bg-primary-900/30' },
          { label: '本月新增', icon: TrendingUpIcon, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: '累计时长', icon: ClockIcon, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'AI洞察', icon: SparklesIcon, color: 'text-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-500 dark:text-gray-600 mt-1">
                      --
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  const statCards = [
    {
      label: '总记录数',
      value: stats.totalItems,
      icon: BarChart3Icon,
      color: 'text-primary-500',
      bgColor: 'bg-primary-100 dark:bg-primary-900/30',
    },
    {
      label: '本月新增',
      value: stats.thisMonth,
      icon: TrendingUpIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: '累计时长',
      value: `${stats.totalHours}h`,
      icon: ClockIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'AI洞察',
      value: stats.aiInsights,
      icon: SparklesIcon,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
