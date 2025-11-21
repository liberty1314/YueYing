/**
 * Cache Management Page
 * Week 9 Days 1-2: 缓存管理页面
 * 
 * 注意：此页面已被 /app/admin/layout.tsx 包装在 AdminLayout 中
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { DatabaseIcon, RefreshCwIcon, TrashIcon, ZapIcon, TrendingUpIcon } from 'lucide-react';
import { api } from '@/lib/apiClient';

export default function CachePage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const data = await api.get('/api/admin/cache/stats', true);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = async () => {
    if (!confirm('确定要清空所有缓存吗？')) return;
    try {
      await api.post('/api/admin/cache/clear', { clear_l1: true, clear_l2: true }, true);
      await fetchStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const handleWarm = async () => {
    try {
      await api.post('/api/admin/cache-warming/warm', {}, true);
      alert('缓存预热已启动');
    } catch (error) {
      console.error('Failed to warm cache:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const l1Stats = stats?.l1_stats || {};
  const l2Stats = stats?.l2_stats || {};
  const hitRate = l1Stats.hit_rate || 0;

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DatabaseIcon className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">缓存管理</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              实时监控和管理
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStats} disabled={refreshing} className="gap-2">
            <RefreshCwIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button variant="outline" onClick={handleWarm} className="gap-2">
            <TrendingUpIcon className="w-5 h-5" />
            预热缓存
          </Button>
          <Button variant="primary" onClick={handleClear} className="gap-2 bg-red-600 hover:bg-red-700">
            <TrashIcon className="w-5 h-5" />
            清空缓存
          </Button>
        </div>
      </div>

      {/* 缓存统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">命中率</h3>
            <Badge variant="success">{hitRate.toFixed(1)}%</Badge>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {hitRate > 70 ? '优秀' : hitRate > 50 ? '良好' : '需优化'}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">L1 缓存</h3>
            <Badge variant="default">{l1Stats.size || 0} 条</Badge>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {l1Stats.hits || 0} / {l1Stats.total_operations || 0}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">L2 (Redis)</h3>
            <Badge variant="default">{l2Stats.size || 0} 条</Badge>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {l2Stats.hits || 0} / {l2Stats.total_operations || 0}
          </div>
        </Card>
      </div>

      {/* 缓存详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">缓存详情</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">L1 平均延迟</div>
              <div className="text-lg font-semibold">{l1Stats.avg_latency_ms?.toFixed(2) || 0} ms</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">L2 平均延迟</div>
              <div className="text-lg font-semibold">{l2Stats.avg_latency_ms?.toFixed(2) || 0} ms</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={fetchStats} disabled={refreshing} className="gap-2">
          <RefreshCwIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          刷新
        </Button>
        <Button variant="outline" onClick={handleWarm} className="gap-2">
          <ZapIcon className="w-5 h-5" />
          预热缓存
        </Button>
        <Button variant="primary" onClick={handleClear} className="gap-2 bg-red-600 hover:bg-red-700">
          <TrashIcon className="w-5 h-5" />
          清空缓存
        </Button>
      </div>

      {/* 刷新提示 */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        数据每5秒自动刷新 • 最后更新: {new Date().toLocaleTimeString('zh-CN')}
      </div>
    </div>
  );
}
