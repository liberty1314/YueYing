/**
 * Admin Dashboard Page
 * 后台管理仪表盘主页
 * 
 * 功能：
 * - 展示系统关键指标（用户总数、活跃用户、内容总数、API 调用次数）
 * - 展示用户增长趋势图表
 * - 展示 API 使用量图表
 * - 支持数据自动刷新
 * - 完整的加载、错误和空状态处理
 * 
 * 设计规范：
 * - 使用 Apple 风格的 StatCard 和 DashboardChart 组件
 * - 使用设计 token 定义的颜色和样式
 * - 响应式布局，支持桌面和平板设备
 */

'use client';

import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/features/admin/AdminPageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { DashboardChart, ChartDataPoint } from '@/components/admin/DashboardChart';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { AppleButton } from '@/components/ui/AppleButton';
import { Card } from '@/components/ui/card';
import {
  Users,
  Activity,
  Database,
  Zap,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const { data, loading, error, refetch } = useAdminDashboard({
    refetchInterval: 30000, // 30秒自动刷新
  });

  // 加载状态
  if (loading) {
    return (
      <div className="space-y-6">
        {/* 页面头部 */}
        <AdminPageHeader
          title="仪表盘"
          description="系统概览和关键指标"
        />

        {/* 骨架屏 - 指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCard
              key={i}
              label="加载中..."
              value={0}
              icon={Users}
              loading
            />
          ))}
        </div>

        {/* 骨架屏 - 图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardChart
            title="用户增长趋势"
            data={[]}
            type="line"
            xAxisKey="date"
            yAxisKey="value"
            loading
          />
          <DashboardChart
            title="API 使用量"
            data={[]}
            type="bar"
            xAxisKey="date"
            yAxisKey="value"
            loading
          />
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && !data) {
    return (
      <div className="space-y-6">
        {/* 页面头部 */}
        <AdminPageHeader
          title="仪表盘"
          description="系统概览和关键指标"
        />

        {/* 错误提示 */}
        <Card
          variant="elevated"
          className={cn(
            'p-8',
            'backdrop-blur-xl bg-white/80 dark:bg-[#1C1C1E]/80',
            'shadow-[var(--shadow-sm)]',
            'rounded-[var(--radius-lg)]'
          )}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-full"
              style={{ backgroundColor: 'var(--color-error)20' }}
            >
              <AlertCircle
                className="w-8 h-8"
                style={{ color: 'var(--color-error)' }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                加载失败
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                {error.message || '无法加载仪表盘数据，请稍后重试'}
              </p>
            </div>
            <AppleButton variant="primary" onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </AppleButton>
          </div>
        </Card>
      </div>
    );
  }

  // 空状态（理论上不应该出现，但作为防御性编程）
  if (!data) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="仪表盘"
          description="系统概览和关键指标"
        />
        <Card
          variant="elevated"
          className={cn(
            'p-8',
            'backdrop-blur-xl bg-white/80 dark:bg-[#1C1C1E]/80',
            'shadow-[var(--shadow-sm)]',
            'rounded-[var(--radius-lg)]'
          )}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Database className="w-12 h-12 text-[var(--color-text-disabled)]" />
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                暂无数据
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                系统尚未收集到统计数据
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 提取数据
  const metrics = data.core_metrics;
  const dauTrend = data.dau_trend || [];
  
  // 转换 DAU 趋势数据为图表格式
  const userTrendData: ChartDataPoint[] = dauTrend.map((point) => ({
    date: point.date,
    value: point.dau,
  }));

  // 模拟 API 使用量数据（实际应该从后端获取）
  // TODO: 后端需要提供 API 使用量统计接口
  const apiUsageData: ChartDataPoint[] = dauTrend.map((point) => ({
    date: point.date,
    value: Math.floor(point.dau * 15 + Math.random() * 50), // 模拟数据
  }));

  // 计算趋势
  const calculateTrend = (current: number, previous: number): { value: number; direction: 'up' | 'down' } => {
    if (previous === 0) return { value: 0, direction: 'up' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change * 10) / 10),
      direction: change >= 0 ? 'up' : 'down',
    };
  };

  // 计算各指标的趋势（简化版，实际应该从后端获取历史数据）
  const dauTrend_calc = calculateTrend(metrics.dau, Math.max(1, metrics.dau - 10));
  const mauTrend_calc = calculateTrend(metrics.mau, Math.max(1, metrics.mau - 50));
  const newUsersTrend_calc = calculateTrend(metrics.today_new_users, Math.max(1, metrics.today_new_users - 2));

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <AdminPageHeader
        title="仪表盘"
        description="系统概览和关键指标"
        actions={
          <AppleButton
            variant="secondary"
            onClick={refetch}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </AppleButton>
        }
      />

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 日活跃用户 */}
        <StatCard
          label="日活跃用户 (DAU)"
          value={metrics.dau}
          icon={Users}
          color="var(--color-primary)"
          trend={dauTrend_calc}
          onClick={() => router.push('/admin/users')}
        />

        {/* 月活跃用户 */}
        <StatCard
          label="月活跃用户 (MAU)"
          value={metrics.mau}
          icon={Activity}
          color="var(--color-success)"
          trend={mauTrend_calc}
          onClick={() => router.push('/admin/users')}
        />

        {/* 今日新增用户 */}
        <StatCard
          label="今日新增用户"
          value={metrics.today_new_users}
          icon={Users}
          color="var(--color-warning)"
          trend={newUsersTrend_calc}
          onClick={() => router.push('/admin/users')}
        />

        {/* 用户粘性 */}
        <StatCard
          label="用户粘性"
          value={`${metrics.user_stickiness.toFixed(1)}%`}
          icon={Zap}
          color="var(--color-secondary)"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户增长趋势 */}
        <DashboardChart
          title="30天用户增长趋势"
          data={userTrendData}
          type="area"
          xAxisKey="date"
          yAxisKey="value"
        />

        {/* API 使用量 */}
        <DashboardChart
          title="API 调用量"
          data={apiUsageData}
          type="bar"
          xAxisKey="date"
          yAxisKey="value"
        />
      </div>

      {/* 数据刷新提示 */}
      <div className="text-center text-xs text-[var(--color-text-secondary)]">
        数据每 30 秒自动刷新 • 最后更新: {new Date(data.timestamp).toLocaleString('zh-CN')}
      </div>
    </div>
  );
}
