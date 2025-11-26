/**
 * PieChartWidget - 饼图组件
 * Week 6: 数据可视化 - 类型分布饼图
 */

'use client';

import { Card } from '@/components/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { PieChartIcon } from 'lucide-react';
import {
  contentTypeColors,
  contentTypeLabels,
  getTooltipStyle,
  chartHeights,
  getColorPalette
} from '@/lib/chart-theme';
import { useState } from 'react';

export interface PieChartData {
  name: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface PieChartWidgetProps {
  title: string;
  data: PieChartData[];
  className?: string;
  showLegend?: boolean;
  showPercentage?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  height?: number;
  isDark?: boolean;
  onSliceClick?: (data: PieChartData, index: number) => void;
}

// 激活扇形渲染函数
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

export function PieChartWidget({
  title,
  data,
  className,
  showLegend = true,
  showPercentage = true,
  innerRadius = 0,
  outerRadius = 100,
  height = chartHeights.md,
  isDark = false,
  onSliceClick,
}: PieChartWidgetProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 处理饼图数据，添加颜色
  const chartData = data.map((item, index) => {
    let color = item.color;

    // 如果数据有type属性，尝试从contentTypeColors获取颜色
    if (!color && (item as any).type && contentTypeColors[(item as any).type as keyof typeof contentTypeColors]) {
      color = contentTypeColors[(item as any).type as keyof typeof contentTypeColors];
    }

    // 如果还没有颜色，从调色板获取
    if (!color) {
      const palette = getColorPalette(data.length);
      color = palette[index % palette.length];
    }

    // 计算百分比
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const percentage = total > 0 ? (item.value / total) * 100 : 0;

    return {
      ...item,
      color,
      percentage,
    };
  });

  const handlePieClick = (entry: any, index: number) => {
    if (onSliceClick) {
      onSliceClick(entry, index);
    }
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <PieChartIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={showPercentage}
              label={showPercentage ? (entry: any) => `${entry.name} ${entry.percentage.toFixed(1)}%` : undefined}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              fill="#8884d8"
              dataKey="value"
              onClick={handlePieClick}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              activeShape={activeIndex !== null ? renderActiveShape : undefined}
              cursor={onSliceClick ? 'pointer' : 'default'}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={getTooltipStyle(isDark)}
              formatter={(value: number, name: string, props: any) => [
                `${value} (${props.payload.percentage.toFixed(1)}%)`,
                name
              ]}
            />
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>

        {/* Details List */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {chartData.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between ${onSliceClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1' : ''}`}
              onClick={() => onSliceClick && handlePieClick(item, index)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.value}
                </span>
                {showPercentage && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-primary-500">{totalValue}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">总计</p>
        </div>
      </div>
    </Card>
  );
}
