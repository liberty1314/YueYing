import { useQuery } from '@tanstack/react-query';
import { systemSettingsApi } from '@/lib/system-settings-api';
import { useAuthStore } from '@/store/authStore';
import type { SystemSettings } from '@/types/system-settings';

/**
 * 全局系统设置 Hook
 * 使用 React Query 缓存系统设置，避免重复请求
 * 仅在用户已登录时获取设置
 */
export function useSystemSettings() {
  const { isAuthenticated } = useAuthStore();

  return useQuery<SystemSettings, Error, SystemSettings, string[]>({
    queryKey: ['system-settings'],
    queryFn: async (): Promise<SystemSettings> => {
      const settings = await systemSettingsApi.getSettings();
      return settings;
    },
    enabled: isAuthenticated, // 仅在已登录时才请求
    staleTime: 5 * 60 * 1000, // 5 分钟内认为数据是新鲜的
    gcTime: 10 * 60 * 1000, // 缓存 10 分钟（v5 使用 gcTime 替代 cacheTime）
    refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    refetchOnMount: false, // 组件挂载时不重新获取（使用缓存）
    retry: 1, // 失败后重试 1 次
  });
}

