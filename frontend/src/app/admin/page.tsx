/**
 * Admin Dashboard Page
 * Week 7 Days 2-3: 仪表盘主页面
 */

'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui';
import {
  DashboardMetricCard,
  UserGrowthChart,
  SystemHealthPanel,
  RetentionHeatmap
} from '@/components/features/admin';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import {
  UsersIcon,
  ActivityIcon,
  TrendingUpIcon,
  PercentIcon,
  RefreshCwIcon
} from 'lucide-react';

export default function AdminDashboard() {
  const { data, loading, error, refetch } = useAdminDashboard({
    refetchInterval: 30000, // 30秒自动刷新
  });

  // 计算指标趋势
  const calculateTrend = (current: number, total: number): number => {
    if (total === 0) return 0;
    return (current / total) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">仪表盘</h1>
        </div>
        {/* 骨架屏 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">仪表盘</h1>
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <ActivityIcon className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">加载失败</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message}
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </Card>
      </div>
    );
  }

  const metrics = data?.core_metrics;
  const dauTrend = data?.dau_trend || [];
  const retention = data?.retention_trends || [];
  const health = data?.system_health;

  // 计算趋势数据
  const dauTrendValue = metrics ? calculateTrend(metrics.dau, metrics.mau) : 0;
  const newUsersTrendValue = metrics ? (metrics.today_new_users / 10) : 0; // 模拟趋势

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">仪表盘</h1>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCwIcon className="w-4 h-4" />
          刷新
        </button>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          label="日活跃用户 (DAU)"
          value={metrics?.dau || 0}
          icon={UsersIcon}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          trend={{
            direction: dauTrendValue > 50 ? 'up' : 'neutral',
            value: dauTrendValue,
            label: '占月活跃用户'
          }}
        />
        <DashboardMetricCard
          label="月活跃用户 (MAU)"
          value={metrics?.mau || 0}
          icon={ActivityIcon}
          iconColor="text-green-500"
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          trend={{
            direction: 'up',
            value: metrics?.user_stickiness || 0,
            label: '用户粘性'
          }}
          suffix="%"
        />
        <DashboardMetricCard
          label="今日新增用户"
          value={metrics?.today_new_users || 0}
          icon={TrendingUpIcon}
          iconColor="text-orange-500"
          iconBgColor="bg-orange-100 dark:bg-orange-900/30"
          trend={{
            direction: newUsersTrendValue > 5 ? 'up' : 'neutral',
            value: newUsersTrendValue,
            label: '较昨日'
          }}
        />
        <DashboardMetricCard
          label="用户粘性"
          value={metrics?.user_stickiness || 0}
          icon={PercentIcon}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          suffix="%"
          subtitle="DAU/MAU 比率"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 30天用户增长趋势 */}
        <UserGrowthChart data={dauTrend} />

        {/* 系统健康状态 */}
        {health && <SystemHealthPanel health={health} />}
      </div>

      {/* 留存率热力图 */}
      {retention.length > 0 && (
        <RetentionHeatmap data={retention} />
      )}

      {/* 数据刷新提示 */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        数据每30秒自动刷新 • 最后更新: {new Date().toLocaleTimeString('zh-CN')}
      </div>
    </div>
  );
}
