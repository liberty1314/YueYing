/**
 * DashboardChart 组件使用示例
 * 
 * 展示如何在 Dashboard 页面中使用 DashboardChart 组件
 */

import { DashboardChart } from './DashboardChart';

// 示例数据
const userGrowthData = [
  { date: '2024-01', users: 120 },
  { date: '2024-02', users: 150 },
  { date: '2024-03', users: 180 },
  { date: '2024-04', users: 220 },
  { date: '2024-05', users: 280 },
  { date: '2024-06', users: 350 },
];

const apiUsageData = [
  { date: '周一', calls: 1200 },
  { date: '周二', calls: 1500 },
  { date: '周三', calls: 1800 },
  { date: '周四', calls: 2200 },
  { date: '周五', calls: 2800 },
  { date: '周六', calls: 1600 },
  { date: '周日', calls: 1400 },
];

const contentAddedData = [
  { month: '1月', items: 45 },
  { month: '2月', items: 52 },
  { month: '3月', items: 68 },
  { month: '4月', items: 71 },
  { month: '5月', items: 89 },
  { month: '6月', items: 95 },
];

export function DashboardChartExamples() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
        DashboardChart 组件示例
      </h1>

      {/* 折线图示例 */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          折线图 (Line Chart)
        </h2>
        <DashboardChart
          title="用户增长趋势"
          data={userGrowthData}
          type="line"
          xAxisKey="date"
          yAxisKey="users"
        />
      </section>

      {/* 柱状图示例 */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          柱状图 (Bar Chart)
        </h2>
        <DashboardChart
          title="每周 API 调用量"
          data={apiUsageData}
          type="bar"
          xAxisKey="date"
          yAxisKey="calls"
        />
      </section>

      {/* 面积图示例 */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          面积图 (Area Chart)
        </h2>
        <DashboardChart
          title="内容添加趋势"
          data={contentAddedData}
          type="area"
          xAxisKey="month"
          yAxisKey="items"
        />
      </section>

      {/* 加载状态示例 */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          加载状态
        </h2>
        <DashboardChart
          title="加载中的图表"
          data={[]}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
          loading={true}
        />
      </section>

      {/* 空数据状态示例 */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          空数据状态
        </h2>
        <DashboardChart
          title="暂无数据的图表"
          data={[]}
          type="line"
          xAxisKey="date"
          yAxisKey="value"
        />
      </section>

      {/* 响应式布局示例 */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          响应式布局 (Grid)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardChart
            title="用户增长"
            data={userGrowthData}
            type="line"
            xAxisKey="date"
            yAxisKey="users"
          />
          <DashboardChart
            title="API 调用"
            data={apiUsageData}
            type="bar"
            xAxisKey="date"
            yAxisKey="calls"
          />
        </div>
      </section>

      {/* 实际使用场景示例 */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          实际使用场景 - Dashboard 页面
        </h2>
        <div className="space-y-6">
          {/* 第一行：两个图表 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <DashboardChart
              title="用户增长趋势"
              data={userGrowthData}
              type="area"
              xAxisKey="date"
              yAxisKey="users"
            />
            <DashboardChart
              title="API 调用统计"
              data={apiUsageData}
              type="bar"
              xAxisKey="date"
              yAxisKey="calls"
            />
          </div>

          {/* 第二行：一个大图表 */}
          <DashboardChart
            title="内容添加趋势"
            data={contentAddedData}
            type="line"
            xAxisKey="month"
            yAxisKey="items"
          />
        </div>
      </section>
    </div>
  );
}

/**
 * 在实际的 Dashboard 页面中使用的示例
 * 
 * @example
 * ```tsx
 * // app/admin/page.tsx
 * 'use client';
 * 
 * import { DashboardChart } from '@/components/admin/DashboardChart';
 * import { useDashboardStats } from '@/hooks/useAdmin';
 * 
 * export default function AdminDashboard() {
 *   const { data: stats, isLoading } = useDashboardStats();
 * 
 *   return (
 *     <div className="space-y-6">
 *       <h1 className="text-2xl font-bold">仪表盘</h1>
 *       
 *       <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
 *         <DashboardChart
 *           title="用户增长趋势"
 *           data={stats?.user_trend_data || []}
 *           type="area"
 *           xAxisKey="date"
 *           yAxisKey="value"
 *           loading={isLoading}
 *         />
 *         
 *         <DashboardChart
 *           title="API 使用量"
 *           data={stats?.api_usage_data || []}
 *           type="bar"
 *           xAxisKey="date"
 *           yAxisKey="value"
 *           loading={isLoading}
 *         />
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
