/**
 * RatingDistribution - 评分分布图表
 * 
 * Week 6: 数据可视化 - 使用Recharts展示评分分布
 */

'use client';

import { Card } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StarIcon } from 'lucide-react';

interface RatingData {
  range: string;
  count: number;
  avgRating: number;
}

interface RatingDistributionProps {
  data: RatingData[];
  className?: string;
}

export function RatingDistribution({ data, className }: RatingDistributionProps) {
  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <StarIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            评分分布
          </h3>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="range"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: '数量', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number) => [`${value} 项`, '数量']}
            />
            <Legend />
            <Bar
              dataKey="count"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              name="数量"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-500">
                {data.reduce((sum, item) => sum + item.count, 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">已评分</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-500">
                {(
                  data.reduce((sum, item) => sum + item.avgRating * item.count, 0) /
                  data.reduce((sum, item) => sum + item.count, 0)
                ).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">平均评分</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-500">
                {Math.max(...data.map((item) => item.avgRating)).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">最高评分</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
