/**
 * UserGrowthChart - 用户增长趋势图
 * Week 7 Days 2-3: 30天DAU折线图
 */

'use client';

import { Card } from '@/components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { UsersIcon } from 'lucide-react';
import { chartColors, getTooltipStyle, getGridStyle, getAxisStyle, chartHeights } from '@/lib/chart-theme';
import type { DAUTrendPoint } from '@/hooks/useAdminDashboard';

export interface UserGrowthChartProps {
  data: DAUTrendPoint[];
  className?: string;
  isDark?: boolean;
}

export function UserGrowthChart({ data, className, isDark = false }: UserGrowthChartProps) {
  // 格式化日期显示
  const formatXAxis = (value: string) => {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } catch {
      return value;
    }
  };

  // 计算统计数据
  const avgDAU = data.length > 0 
    ? Math.round(data.reduce((sum, point) => sum + point.dau, 0) / data.length)
    : 0;

  const maxDAU = data.length > 0
    ? Math.max(...data.map(point => point.dau))
    : 0;

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <UsersIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            用户活跃趋势（30天）
          </h3>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={chartHeights.md}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.blue[500]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors.blue[500]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...getGridStyle(isDark)} />
            <XAxis
              dataKey="date"
              {...getAxisStyle(isDark)}
              tickFormatter={formatXAxis}
            />
            <YAxis
              {...getAxisStyle(isDark)}
              label={{ value: 'DAU', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={getTooltipStyle(isDark)}
              labelFormatter={(label) => {
                try {
                  const date = new Date(label);
                  return date.toLocaleDateString('zh-CN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                } catch {
                  return label;
                }
              }}
              formatter={(value: number) => [value, '活跃用户']}
            />
            <Area
              type="monotone"
              dataKey="dau"
              stroke={chartColors.blue[500]}
              fill="url(#dauGradient)"
              strokeWidth={2}
              dot={{ fill: chartColors.blue[500], r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-primary-500">{data.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">数据天数</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary-500">{avgDAU}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">平均DAU</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary-500">{maxDAU}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">峰值DAU</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
