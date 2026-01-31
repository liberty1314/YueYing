/**
 * LogFilterBar 组件使用示例
 */

'use client';

import { useState } from 'react';
import { LogFilterBar } from './LogFilterBar';
import { LogFilters } from '@/types/log';

/**
 * 基础用法示例
 */
export function BasicExample() {
  const [filters, setFilters] = useState<LogFilters>({
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
  });
  
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">基础用法</h2>
      <LogFilterBar
        filters={filters}
        onFiltersChange={setFilters}
      />
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">
        {JSON.stringify(filters, null, 2)}
      </pre>
    </div>
  );
}

/**
 * 带自动刷新的示例
 */
export function WithAutoRefreshExample() {
  const [filters, setFilters] = useState<LogFilters>({
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    // 模拟刷新
    setTimeout(() => {
      setIsRefreshing(false);
      console.log('日志已刷新');
    }, 1000);
  };
  
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">带自动刷新</h2>
      <LogFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          自动刷新: {autoRefresh ? '开启' : '关闭'}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          刷新间隔: {refreshInterval} 秒
        </p>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm">
          {JSON.stringify(filters, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/**
 * 完整功能示例
 */
export function FullFeaturedExample() {
  const [filters, setFilters] = useState<LogFilters>({
    level: ['ERROR', 'WARNING'],
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
    search: '',
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      console.log('日志已刷新');
    }, 1000);
  };
  
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">完整功能示例</h2>
      <LogFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <div className="space-y-2">
        <h3 className="font-semibold">当前过滤器状态：</h3>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(filters, null, 2)}
        </pre>
        <h3 className="font-semibold">自动刷新设置：</h3>
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
          <li>自动刷新: {autoRefresh ? '开启' : '关闭'}</li>
          <li>刷新间隔: {refreshInterval} 秒</li>
          <li>正在刷新: {isRefreshing ? '是' : '否'}</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * 所有示例的容器
 */
export default function LogFilterBarExamples() {
  return (
    <div className="space-y-8">
      <BasicExample />
      <WithAutoRefreshExample />
      <FullFeaturedExample />
    </div>
  );
}
