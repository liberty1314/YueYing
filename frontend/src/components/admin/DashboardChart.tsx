/**
 * DashboardChart - 仪表盘图表组件
 * 
 * 用于展示时间序列数据的图表组件，支持折线图、柱状图和面积图。
 * 采用 Apple 风格设计，使用设计 token 配置颜色，支持响应式尺寸。
 * 基于 Recharts 库实现，提供流畅的动画和交互体验。
 * 
 * @example
 * ```tsx
 * <DashboardChart
 *   title="用户增长趋势"
 *   data={[
 *     { date: '2024-01', users: 120 },
 *     { date: '2024-02', users: 150 },
 *   ]}
 *   type="line"
 *   xAxisKey="date"
 *   yAxisKey="users"
 * />
 * ```
 */

import { forwardRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  AreaChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { SkeletonChart } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface DashboardChartProps {
  /** 图表标题 */
  title: string;
  /** 图表数据 */
  data: ChartDataPoint[];
  /** 图表类型 */
  type: 'line' | 'bar' | 'area';
  /** X 轴数据键 */
  xAxisKey: string;
  /** Y 轴数据键 */
  yAxisKey: string;
  /** 加载状态 */
  loading?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 自定义工具提示组件 - Apple 风格
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'px-3 py-2 rounded-[var(--radius-md)]',
        'backdrop-blur-xl bg-white/90 dark:bg-[#1C1C1E]/90',
        'shadow-[var(--shadow-md)]',
        'border border-[var(--color-text-disabled)]/20'
      )}
    >
      <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <p
          key={index}
          className="text-sm font-semibold"
          style={{ color: entry.color }}
        >
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
};

const DashboardChart = forwardRef<HTMLDivElement, DashboardChartProps>(
  (
    {
      title,
      data,
      type,
      xAxisKey,
      yAxisKey,
      loading = false,
      className,
    },
    ref
  ) => {
    // 加载状态
    if (loading) {
      return (
        <div ref={ref} className={className}>
          <SkeletonChart />
        </div>
      );
    }

    // 空数据状态
    if (!data || data.length === 0) {
      return (
        <Card
          ref={ref}
          variant="elevated"
          className={cn(
            'p-6',
            'backdrop-blur-xl bg-white/80 dark:bg-[#1C1C1E]/80',
            'shadow-[var(--shadow-sm)]',
            'rounded-[var(--radius-lg)]',
            className
          )}
        >
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
            {title}
          </h3>
          <div className="flex items-center justify-center h-64 text-[var(--color-text-secondary)]">
            暂无数据
          </div>
        </Card>
      );
    }

    // 图表配置
    const chartConfig = {
      margin: { top: 10, right: 10, left: 0, bottom: 0 },
      className: 'text-xs',
    };

    // 通用组件配置
    const commonComponents = (
      <>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-text-disabled)"
          opacity={0.3}
          vertical={false}
        />
        <XAxis
          dataKey={xAxisKey}
          stroke="var(--color-text-secondary)"
          tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: 'var(--color-text-disabled)', opacity: 0.3 }}
        />
        <YAxis
          stroke="var(--color-text-secondary)"
          tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: 'var(--color-text-disabled)', opacity: 0.3 }}
          tickFormatter={(value) => {
            // 格式化大数字
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M`;
            }
            if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toString();
          }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.1 }} />
        <Legend
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
          }}
        />
      </>
    );

    // 渲染对应类型的图表
    const renderChart = () => {
      switch (type) {
        case 'line':
          return (
            <LineChart data={data} {...chartConfig}>
              {commonComponents}
              <Line
                type="monotone"
                dataKey={yAxisKey}
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{
                  fill: 'var(--color-primary)',
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  fill: 'var(--color-primary)',
                  stroke: 'var(--color-background-default)',
                  strokeWidth: 2,
                }}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </LineChart>
          );

        case 'bar':
          return (
            <BarChart data={data} {...chartConfig}>
              {commonComponents}
              <Bar
                dataKey={yAxisKey}
                fill="var(--color-primary)"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </BarChart>
          );

        case 'area':
          return (
            <AreaChart data={data} {...chartConfig}>
              {commonComponents}
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={yAxisKey}
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#colorGradient)"
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          );

        default:
          return null;
      }
    };

    return (
      <Card
        ref={ref}
        variant="elevated"
        className={cn(
          'p-6',
          'backdrop-blur-xl bg-white/80 dark:bg-[#1C1C1E]/80',
          'shadow-[var(--shadow-sm)]',
          'hover:shadow-[var(--shadow-md)]',
          'rounded-[var(--radius-lg)]',
          'transition-shadow duration-200',
          className
        )}
      >
        {/* 图表标题 */}
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
          {title}
        </h3>

        {/* 图表容器 - 响应式 */}
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </Card>
    );
  }
);

DashboardChart.displayName = 'DashboardChart';

export { DashboardChart };
