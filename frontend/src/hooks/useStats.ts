/**
 * 统计数据 Hooks
 * Week 6: 数据可视化 - 统一的统计数据获取和管理
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, APIError, CachePresets } from '@/lib/apiClient';

// ============= 类型定义 =============

export interface OverviewStats {
  total_items: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  average_rating: number | null;
  total_rated: number;
  this_month_added: number;
}

export interface TypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface TimeTrendPoint {
  date: string;
  count: number;
  cumulative_count?: number;
}

export interface TimeTrend {
  period: string;
  data: TimeTrendPoint[];
}

export interface TagStats {
  tag_name: string;
  count: number;
  color?: string;
}

export interface ComprehensiveStats {
  overview: OverviewStats;
  type_distribution: TypeDistribution[];
  status_distribution: StatusDistribution[];
  rating_distribution: RatingDistribution[];
  time_trend: TimeTrend;
  top_tags: TagStats[];
}

interface UseStatsOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseStatsResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ============= Hook 实现 =============

/**
 * 获取概览统计数据
 */
export function useStatsOverview(options: UseStatsOptions = {}): UseStatsResult<OverviewStats> {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<OverviewStats>(
        '/api/stats/overview',
        true,
        CachePresets.MEDIUM // 5分钟缓存
      );
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch overview stats:', error);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
    
    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 获取类型分布统计
 */
export function useTypeDistribution(options: UseStatsOptions = {}): UseStatsResult<TypeDistribution[]> {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<TypeDistribution[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<TypeDistribution[]>(
        '/api/stats/type-distribution',
        true,
        CachePresets.MEDIUM
      );
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch type distribution:', error);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
    
    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 获取评分分布统计
 */
export function useRatingDistribution(options: UseStatsOptions = {}): UseStatsResult<RatingDistribution[]> {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<RatingDistribution[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<RatingDistribution[]>(
        '/api/stats/rating-distribution',
        true,
        CachePresets.MEDIUM
      );
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch rating distribution:', error);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchData();
    
    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 获取时间趋势数据
 */
export function useTimeTrend(
  timePeriod: 'month' | 'quarter' | 'year' = 'month',
  months: number = 6,
  options: UseStatsOptions = {}
): UseStatsResult<TimeTrend> {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<TimeTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<TimeTrend>(
        `/api/stats/time-trend?time_period=${timePeriod}&months=${months}`,
        true,
        CachePresets.MEDIUM
      );
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch time trend:', error);
    } finally {
      setLoading(false);
    }
  }, [enabled, timePeriod, months]);

  useEffect(() => {
    fetchData();
    
    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 获取热门标签统计
 */
export function useTopTags(limit: number = 20, options: UseStatsOptions = {}): UseStatsResult<TagStats[]> {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<TagStats[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<TagStats[]>(
        `/api/stats/top-tags?limit=${limit}`,
        true,
        CachePresets.MEDIUM
      );
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch top tags:', error);
    } finally {
      setLoading(false);
    }
  }, [enabled, limit]);

  useEffect(() => {
    fetchData();
    
    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * 获取综合统计数据（一次性获取所有统计）
 */
export function useComprehensiveStats(
  timePeriod: 'month' | 'quarter' | 'year' = 'month',
  months: number = 6,
  options: UseStatsOptions = {}
): UseStatsResult<ComprehensiveStats> {
  const { enabled = true, refetchInterval } = options;
  const [data, setData] = useState<ComprehensiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<ComprehensiveStats>(
        `/api/stats/comprehensive?time_period=${timePeriod}&months=${months}`,
        true,
        CachePresets.MEDIUM
      );
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch comprehensive stats:', error);
    } finally {
      setLoading(false);
    }
  }, [enabled, timePeriod, months]);

  useEffect(() => {
    fetchData();
    
    if (refetchInterval) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}
