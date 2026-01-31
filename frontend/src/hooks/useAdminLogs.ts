/**
 * 管理后台日志相关 React Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';

/**
 * 获取日志列表
 */
export function useAdminLogs(params?: {
    page?: number;
    page_size?: number;
    level?: string;
    start_time?: string;
    end_time?: string;
    keyword?: string;
}) {
    return useQuery({
        queryKey: ['admin', 'logs', params],
        queryFn: () => adminApi.getLogs(params),
        placeholderData: (previousData) => previousData, // React Query v5 替代 keepPreviousData
        refetchInterval: false, // 不自动刷新，由用户控制
    });
}

/**
 * 获取可用的日志级别
 */
export function useLogLevels() {
    return useQuery({
        queryKey: ['admin', 'logs', 'levels'],
        queryFn: () => adminApi.getLogLevels(),
        staleTime: Infinity, // 日志级别不会变化
    });
}

/**
 * 获取日志统计信息
 */
export function useLogStats() {
    return useQuery({
        queryKey: ['admin', 'logs', 'stats'],
        queryFn: () => adminApi.getLogStats(),
        refetchInterval: 30000, // 每 30 秒刷新一次
    });
}

/**
 * 获取最新日志（tail）
 */
export function useTailLogs(n: number = 100, enabled: boolean = false) {
    return useQuery({
        queryKey: ['admin', 'logs', 'tail', n],
        queryFn: () => adminApi.tailLogs(n),
        enabled,
        refetchInterval: enabled ? 5000 : false, // 启用时每 5 秒刷新
    });
}
