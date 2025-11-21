/**
 * WatchTimeChart - 观看时长统计图表
 * 
 * Week 6: 数据可视化 - 使用Recharts展示每月观看时长趋势
 */

'use client';

import { Card } from '@/components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ClockIcon } from 'lucide-react';

interface WatchTimeData {
  month: string;
  hours: number;
  items: number;
}

interface WatchTimeChartProps {
  data: WatchTimeData[];
  className?: string;
}

export function WatchTimeChart({ data, className }: WatchTimeChartProps) {
  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <ClockIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            观看时长趋势
          </h3>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: '小时', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number) => [`${value} 小时`, '观看时长']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="观看时长"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-500">
                {data.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">总观看时长（小时）</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-500">
                {data.reduce((sum, item) => sum + item.items, 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">总观看数量</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
