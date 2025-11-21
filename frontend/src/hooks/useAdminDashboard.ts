/**
 * 管理员仪表盘数据 Hook
 * Week 7 Days 2-3: 仪表盘页面开发
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, APIError, CachePresets } from '@/lib/apiClient';

// ========== 类型定义 ==========

export interface CoreMetrics {
  dau: number;                    // 日活跃用户
  mau: number;                    // 月活跃用户
  user_stickiness: number;        // 用户粘性 (DAU/MAU %)
  today_new_users: number;        // 今日新增用户
}

export interface DAUTrendPoint {
  date: string;                   // 日期 YYYY-MM-DD
  dau: number;                    // 当天活跃用户数
}

export interface RetentionData {
  cohort_date: string;            // 用户群组日期
  day_1?: number;                 // Day 1 留存率（可选）
  day_3?: number;                 // Day 3 留存率（可选）
  day_7?: number;                 // Day 7 留存率（可选）
  day_30?: number;                // Day 30 留存率（可选）
  cohort_size: number;            // 群组大小
}

export interface SystemHealthStatus {
  status: string;                 // 'OK' | 'Error'
  details: string;                // 详细信息
}

export interface SystemHealth {
  llm_api: SystemHealthStatus;
  rag_index: SystemHealthStatus;
  redis_cache: SystemHealthStatus;
  database: SystemHealthStatus;
}

export interface DashboardData {
  core_metrics: CoreMetrics;
  dau_trend: DAUTrendPoint[];
  retention_trends: RetentionData[];
  system_health: SystemHealth;
  timestamp: string;
}

interface UseDashboardOptions {
  enabled?: boolean;
  refetchInterval?: number;        // 自动刷新间隔（毫秒）
}

interface UseDashboardResult<T = DashboardData> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ========== Hook 实现 ==========

/**
 * 管理员仪表盘数据Hook
 * 
 * @param options - 配置选项
 * @returns 仪表盘数据、加载状态、错误信息、刷新函数
 */
export function useAdminDashboard(
  options: UseDashboardOptions = {}
): UseDashboardResult {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    try {
      const result = await api.get<DashboardData>(
        '/admin/stats/dashboard',
        true,
        CachePresets.SHORT // 1分钟缓存
      );
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();

    // 自动刷新机制
    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 基础管理员统计数据Hook（向后兼容）
 */
export interface BasicAdminStats {
  total_users: number;
  total_items: number;
  ai_calls: number;
  storage_used_mb: number;
  active_users_today: number;
  new_users_week: number;
}

export function useBasicAdminStats(
  options: UseDashboardOptions = {}
): UseDashboardResult<BasicAdminStats> {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<BasicAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);
    try {
      const result = await api.get<BasicAdminStats>(
        '/admin/stats',
        true,
        CachePresets.SHORT
      );
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch basic admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();

    if (refetchInterval && refetchInterval > 0) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}
