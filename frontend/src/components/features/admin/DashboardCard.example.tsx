/**
 * DashboardCard 组件使用示例
 * 
 * 展示 DashboardCard 组件的各种使用场景
 */

import { Users, Activity, BookOpen, TrendingUp } from 'lucide-react';
import { DashboardCard } from './DashboardCard';

export function DashboardCardExamples() {
  return (
    <div className="p-8 space-y-8 bg-[var(--color-background-paper)]">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
          DashboardCard 组件示例
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          展示仪表盘卡片组件的各种使用场景
        </p>
      </div>

      {/* 基础示例 */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
          1. 基础用法
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="总用户数"
            value={1234}
            icon={Users}
            iconColor="var(--color-primary)"
          />
          
          <DashboardCard
            title="活跃用户"
            value={856}
            icon={Activity}
            iconColor="var(--color-success)"
          />
          
          <DashboardCard
            title="内容总数"
            value={5678}
            icon={BookOpen}
            iconColor="var(--color-secondary)"
          />
          
          <DashboardCard
            title="API 调用"
            value="12.5K"
            icon={TrendingUp}
            iconColor="var(--color-warning)"
          />
        </div>
      </section>

      {/* 带趋势指示器 */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
          2. 带趋势指示器
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="总用户数"
            value={1234}
            change={{ value: 12.5, trend: 'up' }}
            icon={Users}
            iconColor="var(--color-primary)"
          />
          
          <DashboardCard
            title="活跃用户"
            value={856}
            change={{ value: 8.3, trend: 'up' }}
            icon={Activity}
            iconColor="var(--color-success)"
          />
          
          <DashboardCard
            title="内容总数"
            value={5678}
            change={{ value: 3.2, trend: 'down' }}
            icon={BookOpen}
            iconColor="var(--color-secondary)"
          />
          
          <DashboardCard
            title="API 调用"
            value="12.5K"
            change={{ value: 15.7, trend: 'up' }}
            icon={TrendingUp}
            iconColor="var(--color-warning)"
          />
        </div>
      </section>

      {/* 加载状态 */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
          3. 加载状态
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="总用户数"
            value={0}
            icon={Users}
            loading
          />
          
          <DashboardCard
            title="活跃用户"
            value={0}
            icon={Activity}
            loading
          />
          
          <DashboardCard
            title="内容总数"
            value={0}
            icon={BookOpen}
            loading
          />
          
          <DashboardCard
            title="API 调用"
            value={0}
            icon={TrendingUp}
            loading
          />
        </div>
      </section>

      {/* 不同颜色主题 */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
          4. 不同颜色主题
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="主色调"
            value={1234}
            change={{ value: 12.5, trend: 'up' }}
            icon={Users}
            iconColor="var(--color-primary)"
          />
          
          <DashboardCard
            title="成功色"
            value={856}
            change={{ value: 8.3, trend: 'up' }}
            icon={Activity}
            iconColor="var(--color-success)"
          />
          
          <DashboardCard
            title="警告色"
            value={5678}
            change={{ value: 3.2, trend: 'down' }}
            icon={BookOpen}
            iconColor="var(--color-warning)"
          />
          
          <DashboardCard
            title="错误色"
            value="12.5K"
            change={{ value: 15.7, trend: 'down' }}
            icon={TrendingUp}
            iconColor="var(--color-error)"
          />
        </div>
      </section>

      {/* 响应式布局 */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
          5. 响应式布局（调整浏览器窗口查看效果）
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          在移动端显示为单列，平板显示为双列，桌面显示为四列
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <DashboardCard
            title="总用户数"
            value={1234}
            change={{ value: 12.5, trend: 'up' }}
            icon={Users}
            iconColor="var(--color-primary)"
          />
          
          <DashboardCard
            title="活跃用户"
            value={856}
            change={{ value: 8.3, trend: 'up' }}
            icon={Activity}
            iconColor="var(--color-success)"
          />
          
          <DashboardCard
            title="内容总数"
            value={5678}
            change={{ value: 3.2, trend: 'down' }}
            icon={BookOpen}
            iconColor="var(--color-secondary)"
          />
          
          <DashboardCard
            title="API 调用"
            value="12.5K"
            change={{ value: 15.7, trend: 'up' }}
            icon={TrendingUp}
            iconColor="var(--color-warning)"
          />
        </div>
      </section>
    </div>
  );
}

export default DashboardCardExamples;
