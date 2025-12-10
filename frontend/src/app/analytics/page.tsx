/**
 * Analytics Page - 数据统计页面
 * 路由: /analytics
 * 
 * 展示高级感的 Bento Grid 布局数据仪表盘
 */

'use client';

import { AnalyticsDashboard } from '@/components/features/stats/analytics';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import ProtectedRoute from '@/components/shared/ProtectedRoute';

export default function AnalyticsPage() {
  const { data, loading, error, refetch } = useAnalyticsData();

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[var(--color-background-paper)] dark:bg-[#0F0F0F] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">加载数据失败: {error.message}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AnalyticsDashboard data={data || undefined} loading={loading} onRefresh={refetch} />
    </ProtectedRoute>
  );
}
