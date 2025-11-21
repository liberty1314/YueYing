/**
 * Statistics Page - 数据统计页面
 * 
 * Week 6: 数据可视化统计页面
 * 整合Recharts图表组件和AI洞察面板
 */

'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { WatchTimeChart } from '@/components/features/stats/WatchTimeChart';
import { ContentTypeDistribution } from '@/components/features/stats/ContentTypeDistribution';
import { RatingDistribution } from '@/components/features/stats/RatingDistribution';
import { AIInsightsPanel } from '@/components/features/stats/AIInsightsPanel';
import { StatsOverview } from '@/components/features/stats/StatsOverview';
import { BarChartIcon, PackageIcon, StarIcon, ClockIcon } from 'lucide-react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { api, APIError, CachePresets } from '@/lib/apiClient';
import { SkeletonChart, ErrorDisplay } from '@/components/ui';

interface StatsData {
  watchTime: Array<{ month: string; hours: number; items: number }>;
  contentType: Array<{ type: string; count: number; percentage: number }>;
  rating: Array<{ range: string; count: number; avgRating: number }>;
  overview: {
    totalItems: number;
    totalHours: number;
    avgRating: number;
    thisMonthItems: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // 调用综合统计API（启用中等缓存）
      const statsData = await api.get<any>(
        '/api/stats/comprehensive?time_period=month&months=6',
        true,
        CachePresets.MEDIUM // 5分钟缓存
      );
      
      // 适配后端数据格式
      const adaptedData: StatsData = {
        watchTime: statsData.time_trend.data.map((point: any) => ({
          month: point.date,
          hours: Math.round(point.count * 2), // 模拟时长，假设每项 2 小时
          items: point.count,
        })),
        contentType: statsData.type_distribution.map((item: any) => ({
          type: item.type,
          count: item.count,
          percentage: item.percentage,
        })),
        rating: [
          { range: '9-10分', count: 0, avgRating: 9.5 },
          { range: '8-9分', count: 0, avgRating: 8.5 },
          { range: '7-8分', count: 0, avgRating: 7.5 },
          { range: '6-7分', count: 0, avgRating: 6.5 },
          { range: '0-6分', count: 0, avgRating: 5.0 },
        ].map((range, index) => {
          const ratingData = statsData.rating_distribution.filter(
            (r: any) => r.rating >= index * 2 && r.rating < (index + 1) * 2
          );
          const count = ratingData.reduce((sum: number, r: any) => sum + r.count, 0);
          return { ...range, count };
        }),
        overview: {
          totalItems: statsData.overview.total_items,
          totalHours: Math.round(statsData.overview.total_items * 2), // 模拟时长
          avgRating: statsData.overview.average_rating || 0,
          thisMonthItems: statsData.overview.this_month_added,
        },
      };
      
      setData(adaptedData);
    } catch (err) {
      if (err instanceof APIError) {
        console.error('Failed to fetch stats:', err.detail);
        setError(err);
      } else if (err instanceof Error) {
        setError(err);
      }
      // 使用模拟数据作为后备（仅开发环境）
      if (process.env.NODE_ENV === 'development') {
        setData({
          watchTime: [
            { month: '1月', hours: 45, items: 12 },
            { month: '2月', hours: 52, items: 15 },
            { month: '3月', hours: 38, items: 10 },
            { month: '4月', hours: 65, items: 18 },
            { month: '5月', hours: 58, items: 16 },
            { month: '6月', hours: 72, items: 20 },
          ],
          contentType: [
            { type: 'movie', count: 45, percentage: 40 },
            { type: 'tv', count: 35, percentage: 31 },
            { type: 'anime', count: 20, percentage: 18 },
            { type: 'book', count: 8, percentage: 7 },
            { type: 'game', count: 5, percentage: 4 },
          ],
          rating: [
            { range: '9-10分', count: 25, avgRating: 9.5 },
            { range: '8-9分', count: 40, avgRating: 8.5 },
            { range: '7-8分', count: 30, avgRating: 7.5 },
            { range: '6-7分', count: 15, avgRating: 6.5 },
            { range: '0-6分', count: 3, avgRating: 5.0 },
          ],
          overview: {
            totalItems: 113,
            totalHours: 330,
            avgRating: 8.2,
            thisMonthItems: 20,
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 加载状态显示骨架屏
  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChartIcon className="w-8 h-8 text-primary-500" />
                数据统计
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                查看你的观看习惯和内容偏好分析
              </p>
            </div>

            {/* 骨架屏 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonChart />
              <SkeletonChart />
            </div>
            <SkeletonChart />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  // 错误状态显示
  if (error && !data) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <ErrorDisplay
              error={error}
              onRetry={fetchStats}
              size="lg"
            />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!data) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              暂无统计数据
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              开始添加内容到收藏库，以查看统计数据
            </p>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  const overviewStats = [
    {
      label: '总收藏数',
      value: data.overview.totalItems,
      change: 15,
      trend: 'up' as const,
      icon: <PackageIcon className="w-4 h-4" />,
    },
    {
      label: '总观看时长',
      value: `${data.overview.totalHours}h`,
      change: 12,
      trend: 'up' as const,
      icon: <ClockIcon className="w-4 h-4" />,
    },
    {
      label: '平均评分',
      value: data.overview.avgRating.toFixed(1),
      icon: <StarIcon className="w-4 h-4" />,
    },
    {
      label: '本月新增',
      value: data.overview.thisMonthItems,
      change: 8,
      trend: 'down' as const,
      icon: <BarChartIcon className="w-4 h-4" />,
    },
  ];

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BarChartIcon className="w-8 h-8 text-primary-500" />
              数据统计
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              查看你的观看习惯和内容偏好分析
            </p>
          </div>

          {/* Overview Stats */}
          <StatsOverview stats={overviewStats} />

          {/* AI Insights */}
          <AIInsightsPanel />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Watch Time Chart */}
            <WatchTimeChart data={data.watchTime} />

            {/* Content Type Distribution */}
            <ContentTypeDistribution data={data.contentType} />
          </div>

          {/* Rating Distribution - Full Width */}
          <RatingDistribution data={data.rating} />
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
