/**
 * BarChartWidget - 柱状图组件
 * Week 6: 数据可视化 - 评分分布柱状图
 */

'use client';

import { Card } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChartIcon } from 'lucide-react';
import { chartColors, getTooltipStyle, getGridStyle, getAxisStyle, chartHeights } from '@/lib/chart-theme';
import { useState } from 'react';

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartWidgetProps {
  title: string;
  data: BarChartData[];
  valueLabel?: string;
  height?: number;
  className?: string;
  onBarClick?: (data: BarChartData, index: number) => void;
  showValues?: boolean;
  isDark?: boolean;
}

export function BarChartWidget({
  title,
  data,
  valueLabel = '数量',
  height = chartHeights.md,
  className,
  onBarClick,
  showValues = false,
  isDark = false,
}: BarChartWidgetProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleBarClick = (entry: any, index: number) => {
    if (onBarClick) {
      onBarClick(entry, index);
    }
  };

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // 为每个柱子分配颜色
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || chartColors.primary[500],
  }));

  const maxValue = Math.max(...data.map(d => d.value), 0);

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <BarChartIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            onMouseMove={(state) => {
              if (state.isTooltipActive !== false && typeof state.activeTooltipIndex === 'number') {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={handleMouseLeave}
          >
            <CartesianGrid {...getGridStyle(isDark)} />
            <XAxis
              dataKey="label"
              {...getAxisStyle(isDark)}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              {...getAxisStyle(isDark)}
              label={{ value: valueLabel, angle: -90, position: 'insideLeft' }}
              domain={[0, maxValue * 1.1]}
            />
            <Tooltip
              contentStyle={getTooltipStyle(isDark)}
              formatter={(value: number) => [value, valueLabel]}
              cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar
              dataKey="value"
              radius={[8, 8, 0, 0]}
              onClick={handleBarClick}
              cursor={onBarClick ? 'pointer' : 'default'}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Summary */}
        {showValues && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-500">
                  {data.reduce((sum, item) => sum + item.value, 0)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">总计</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-500">
                  {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">平均值</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
