/**
 * StatCard 组件使用示例
 * 
 * 展示 StatCard 组件的各种使用场景
 */

import { Users, Activity, FileText, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';

// ============================================
// 示例 1: 基础用法
// ============================================
export function BasicStatCardExample() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
        基础用法
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="总用户数"
          value={1234}
          icon={Users}
          color="var(--color-primary)"
        />
        
        <StatCard
          label="活跃用户"
          value={856}
          icon={Activity}
          color="var(--color-success)"
        />
        
        <StatCard
          label="内容总数"
          value={5678}
          icon={FileText}
          color="var(--color-secondary)"
        />
        
        <StatCard
          label="API 调用"
          value="12.5K"
          icon={TrendingUp}
          color="var(--color-warning)"
        />
      </div>
    </div>
  );
}

// ============================================
// 示例 2: 带趋势指示器
// ============================================
export function StatCardWithTrendExample() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
        带趋势指示器
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="总用户数"
          value={1234}
          icon={Users}
          trend={{ value: 12.5, direction: 'up' }}
          color="var(--color-primary)"
        />
        
        <StatCard
          label="活跃用户"
          value={856}
          icon={Activity}
          trend={{ value: 8.2, direction: 'up' }}
          color="var(--color-success)"
        />
        
        <StatCard
          label="内容总数"
          value={5678}
          icon={FileText}
          trend={{ value: 3.1, direction: 'down' }}
          color="var(--color-secondary)"
        />
        
        <StatCard
          label="API 调用"
          value="12.5K"
          icon={TrendingUp}
          trend={{ value: 15.7, direction: 'up' }}
          color="var(--color-warning)"
        />
      </div>
    </div>
  );
}

// ============================================
// 示例 3: 可点击跳转
// ============================================
export function ClickableStatCardExample() {
  const handleUserClick = () => {
    console.log('跳转到用户管理页面');
    // router.push('/admin/users');
  };
  
  const handleActivityClick = () => {
    console.log('跳转到活动日志页面');
    // router.push('/admin/logs');
  };
  
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
        可点击跳转
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="总用户数"
          value={1234}
          icon={Users}
          trend={{ value: 12.5, direction: 'up' }}
          color="var(--color-primary)"
          onClick={handleUserClick}
        />
        
        <StatCard
          label="活跃用户"
          value={856}
          icon={Activity}
          trend={{ value: 8.2, direction: 'up' }}
          color="var(--color-success)"
          onClick={handleActivityClick}
        />
        
        <StatCard
          label="内容总数"
          value={5678}
          icon={FileText}
          color="var(--color-secondary)"
        />
        
        <StatCard
          label="API 调用"
          value="12.5K"
          icon={TrendingUp}
          color="var(--color-warning)"
        />
      </div>
      
      <p className="text-sm text-[var(--color-text-secondary)]">
        提示：前两个卡片可以点击，悬停时会显示悬停效果
      </p>
    </div>
  );
}

// ============================================
// 示例 4: 加载状态
// ============================================
export function LoadingStatCardExample() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
        加载状态
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="总用户数"
          value={0}
          icon={Users}
          loading
        />
        
        <StatCard
          label="活跃用户"
          value={0}
          icon={Activity}
          loading
        />
        
        <StatCard
          label="内容总数"
          value={0}
          icon={FileText}
          loading
        />
        
        <StatCard
          label="API 调用"
          value={0}
          icon={TrendingUp}
          loading
        />
      </div>
    </div>
  );
}

// ============================================
// 示例 5: 响应式布局
// ============================================
export function ResponsiveStatCardExample() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
        响应式布局
      </h2>
      
      <p className="text-sm text-[var(--color-text-secondary)]">
        在不同屏幕尺寸下自动调整布局：
        <br />
        - 移动端：1 列
        <br />
        - 平板：2 列
        <br />
        - 桌面：4 列
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="总用户数"
          value={1234}
          icon={Users}
          trend={{ value: 12.5, direction: 'up' }}
          color="var(--color-primary)"
        />
        
        <StatCard
          label="活跃用户"
          value={856}
          icon={Activity}
          trend={{ value: 8.2, direction: 'up' }}
          color="var(--color-success)"
        />
        
        <StatCard
          label="内容总数"
          value={5678}
          icon={FileText}
          trend={{ value: 3.1, direction: 'down' }}
          color="var(--color-secondary)"
        />
        
        <StatCard
          label="API 调用"
          value="12.5K"
          icon={TrendingUp}
          trend={{ value: 15.7, direction: 'up' }}
          color="var(--color-warning)"
        />
      </div>
    </div>
  );
}

// ============================================
// 示例 6: 完整的 Dashboard 示例
// ============================================
export function DashboardStatCardsExample() {
  const stats = [
    {
      label: '总用户数',
      value: 1234,
      icon: Users,
      trend: { value: 12.5, direction: 'up' as const },
      color: 'var(--color-primary)',
      onClick: () => console.log('跳转到用户管理'),
    },
    {
      label: '活跃用户',
      value: 856,
      icon: Activity,
      trend: { value: 8.2, direction: 'up' as const },
      color: 'var(--color-success)',
      onClick: () => console.log('跳转到活动日志'),
    },
    {
      label: '内容总数',
      value: 5678,
      icon: FileText,
      trend: { value: 3.1, direction: 'down' as const },
      color: 'var(--color-secondary)',
    },
    {
      label: 'API 调用',
      value: '12.5K',
      icon: TrendingUp,
      trend: { value: 15.7, direction: 'up' as const },
      color: 'var(--color-warning)',
    },
  ];
  
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
        Dashboard 统计卡片
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            color={stat.color}
            onClick={stat.onClick}
          />
        ))}
      </div>
    </div>
  );
}
