/**
 * ContentTypeDistribution - 内容类型分布图表
 * 
 * Week 6: 数据可视化 - 使用Recharts展示内容类型分布
 */

'use client';

import { Card } from '@/components/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PackageIcon } from 'lucide-react';

interface ContentTypeData {
  type: string;
  count: number;
  percentage: number;
}

interface ContentTypeDistributionProps {
  data: ContentTypeData[];
  className?: string;
}

const COLORS = {
  movie: '#3b82f6',
  tv: '#10b981',
  anime: '#f59e0b',
  book: '#ef4444',
};

const TYPE_LABELS = {
  movie: '电影',
  tv: '剧集',
  anime: '动画',
  book: '书籍',
};

export function ContentTypeDistribution({ data, className }: ContentTypeDistributionProps) {
  const chartData = data.map((item) => ({
    name: TYPE_LABELS[item.type as keyof typeof TYPE_LABELS] || item.type,
    value: item.count,
    percentage: item.percentage,
  }));

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <PackageIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            内容类型分布
          </h3>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => `${entry.name} ${entry.percentage.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => {
                const type = data[index].type as keyof typeof COLORS;
                return <Cell key={`cell-${index}`} fill={COLORS[type] || '#6b7280'} />;
              })}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} 项`, '数量']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Details */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {data.map((item) => {
            const type = item.type as keyof typeof COLORS;
            const label = TYPE_LABELS[type] || item.type;
            const color = COLORS[type] || '#6b7280';

            return (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-2xl font-bold text-primary-500">{totalCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">总收藏数</p>
        </div>
      </div>
    </Card>
  );
}
