/**
 * RetentionHeatmap - 用户留存率热力图
 * Week 7 Days 2-3: 用户留存分析
 */

'use client';

import { Card } from '@/components/ui';
import { CalendarDaysIcon } from 'lucide-react';
import type { RetentionData } from '@/hooks/useAdminDashboard';

export interface RetentionHeatmapProps {
  data: RetentionData[];
  className?: string;
}

export function RetentionHeatmap({ data, className }: RetentionHeatmapProps) {
  // 获取颜色（基于留存率）
  const getRetentionColor = (rate: number | undefined) => {
    const safeRate = rate ?? 0;
    if (safeRate >= 80) return 'bg-green-500';
    if (safeRate >= 60) return 'bg-green-400';
    if (safeRate >= 40) return 'bg-yellow-400';
    if (safeRate >= 20) return 'bg-orange-400';
    return 'bg-red-400';
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const retentionDays = ['Day 1', 'Day 3', 'Day 7', 'Day 30'];

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <CalendarDaysIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            用户留存率热力图
          </h3>
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">
                  群组日期
                </th>
                {retentionDays.map((day) => (
                  <th key={day} className="text-center py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">
                    {day}
                  </th>
                ))}
                <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">
                  群组大小
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((cohort, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">
                    {formatDate(cohort.cohort_date)}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-12 h-8 rounded flex items-center justify-center text-white text-xs font-semibold ${getRetentionColor(cohort.day_1)}`}
                        title={`${(cohort.day_1 ?? 0).toFixed(1)}%`}
                      >
                        {(cohort.day_1 ?? 0).toFixed(0)}%
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-12 h-8 rounded flex items-center justify-center text-white text-xs font-semibold ${getRetentionColor(cohort.day_3)}`}
                        title={`${(cohort.day_3 ?? 0).toFixed(1)}%`}
                      >
                        {(cohort.day_3 ?? 0).toFixed(0)}%
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-12 h-8 rounded flex items-center justify-center text-white text-xs font-semibold ${getRetentionColor(cohort.day_7)}`}
                        title={`${(cohort.day_7 ?? 0).toFixed(1)}%`}
                      >
                        {(cohort.day_7 ?? 0).toFixed(0)}%
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center">
                      <div
                        className={`w-12 h-8 rounded flex items-center justify-center text-white text-xs font-semibold ${getRetentionColor(cohort.day_30)}`}
                        title={`${(cohort.day_30 ?? 0).toFixed(1)}%`}
                      >
                        {(cohort.day_30 ?? 0).toFixed(0)}%
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                    {cohort.cohort_size}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">留存率颜色说明：</p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">≥80%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-yellow-400" />
              <span className="text-gray-600 dark:text-gray-400">40-60%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-400" />
              <span className="text-gray-600 dark:text-gray-400">&lt;20%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
