/**
 * LineChartWidget - 折线图组件
 * Week 6: 数据可视化 - 时间趋势折线图
 */

'use client';

import { Card } from '@/components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUpIcon } from 'lucide-react';
import { chartColors, getTooltipStyle, getGridStyle, getAxisStyle, chartHeights } from '@/lib/chart-theme';
import { useState } from 'react';

export interface LineChartDataPoint {
  date: string;
  value: number;
  [key: string]: string | number;
}

export interface LineConfig {
  dataKey: string;
  name: string;
  color: string;
  showArea?: boolean;
}

export interface LineChartWidgetProps {
  title: string;
  data: LineChartDataPoint[];
  lines: LineConfig[];
  xAxisKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  className?: string;
  isDark?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  enableZoom?: boolean;
}

export function LineChartWidget({
  title,
  data,
  lines,
  xAxisKey = 'date',
  xAxisLabel,
  yAxisLabel,
  height = chartHeights.md,
  className,
  isDark = false,
  showGrid = true,
  showLegend = true,
  enableZoom = false,
}: LineChartWidgetProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const hasAreaChart = lines.some(line => line.showArea);

  const ChartComponent = hasAreaChart ? AreaChart : LineChart;

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
  const totalValue = data.reduce((sum, point) => {
    const value = lines.reduce((s, line) => s + (Number(point[line.dataKey]) || 0), 0);
    return sum + value;
  }, 0);

  const avgValue = data.length > 0 ? (totalValue / data.length).toFixed(1) : '0';

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <TrendingUpIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            onMouseMove={(state) => {
              if (state.isTooltipActive !== false && typeof state.activeTooltipIndex === 'number') {
                setActiveIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {showGrid && <CartesianGrid {...getGridStyle(isDark)} />}
            <XAxis
              dataKey={xAxisKey}
              {...getAxisStyle(isDark)}
              tickFormatter={formatXAxis}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
            />
            <YAxis
              {...getAxisStyle(isDark)}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            <Tooltip
              contentStyle={getTooltipStyle(isDark)}
              labelFormatter={(label) => {
                try {
                  const date = new Date(label);
                  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
                } catch {
                  return label;
                }
              }}
            />
            {showLegend && <Legend />}
            
            {/* 渲染线条或区域 */}
            {lines.map((lineConfig, index) => {
              if (lineConfig.showArea) {
                return (
                  <Area
                    key={index}
                    type="monotone"
                    dataKey={lineConfig.dataKey}
                    name={lineConfig.name}
                    stroke={lineConfig.color}
                    fill={lineConfig.color}
                    fillOpacity={0.2}
                    strokeWidth={2}
                    dot={{ fill: lineConfig.color, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                );
              }
              return (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={lineConfig.dataKey}
                  name={lineConfig.name}
                  stroke={lineConfig.color}
                  strokeWidth={2}
                  dot={{ fill: lineConfig.color, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              );
            })}
          </ChartComponent>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-500">
                {data.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">数据点</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-500">
                {avgValue}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">平均值</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
