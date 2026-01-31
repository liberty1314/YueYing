/**
 * useAdminSystemSettings Hook
 * 管理员系统设置管理 Hook
 * 
 * 功能：
 * - 获取完整的系统设置（需要登录）
 * - 更新系统设置（仅管理员）
 * - 自动缓存和重新验证
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import { eventBus, Events } from '@/lib/events';

/**
 * 系统设置接口（完整版，用于管理员）
 */
export interface AdminSystemSettings {
  id: number;
  enable_explore: boolean;
  allow_user_ai_tag_settings: boolean;
  allow_anonymous_home_access: boolean;
  enable_stats: boolean;
  enable_ai_assistant: boolean;
}

/**
 * 系统设置更新请求
 */
export interface SystemSettingsUpdateRequest {
  enable_explore?: boolean;
  allow_user_ai_tag_settings?: boolean;
  allow_anonymous_home_access?: boolean;
  enable_stats?: boolean;
  enable_ai_assistant?: boolean;
}

/**
 * 获取系统设置（管理员完整版）
 */
export function useAdminSystemSettings() {
  return useQuery<AdminSystemSettings>({
    queryKey: ['admin', 'system-settings'],
    queryFn: async () => {
      // 需要认证
      const data = await api.get<AdminSystemSettings>('/system-settings', true);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟 (React Query v5)
  });
}

/**
 * 更新系统设置
 */
export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SystemSettingsUpdateRequest) => {
      const result = await api.put<AdminSystemSettings>('/system-settings', data);
      return result;
    },
    onSuccess: () => {
      // 使管理员系统设置缓存失效
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-settings'] });
      
      // 触发系统设置更新事件，通知其他组件刷新
      eventBus.emit(Events.SYSTEM_SETTINGS_UPDATED);
    },
  });
}
