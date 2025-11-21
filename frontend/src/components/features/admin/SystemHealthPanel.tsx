/**
 * SystemHealthPanel - 系统健康状态面板
 * Week 7 Days 2-3: 系统健康监控
 */

'use client';

import { Card } from '@/components/ui';
import { ActivityIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon } from 'lucide-react';
import type { SystemHealth } from '@/hooks/useAdminDashboard';

export interface SystemHealthPanelProps {
  health: SystemHealth;
  className?: string;
}

const healthItems = [
  { key: 'llm_api' as const, label: 'LLM API', icon: ActivityIcon },
  { key: 'rag_index' as const, label: 'RAG索引', icon: ActivityIcon },
  { key: 'redis_cache' as const, label: 'Redis缓存', icon: ActivityIcon },
  { key: 'database' as const, label: '数据库', icon: ActivityIcon },
];

export function SystemHealthPanel({ health, className }: SystemHealthPanelProps) {
  const getStatusIcon = (status: string) => {
    if (status === 'OK') {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    } else if (status.includes('Error')) {
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
    return <AlertCircleIcon className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'OK') return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (status.includes('Error')) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
  };

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <ActivityIcon className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            系统健康状态
          </h3>
        </div>

        {/* Health Items */}
        <div className="space-y-3">
          {healthItems.map((item) => {
            const healthData = health[item.key];
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className={`p-4 rounded-lg border ${getStatusColor(healthData.status)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {healthData.details}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthData.status)}
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {healthData.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
