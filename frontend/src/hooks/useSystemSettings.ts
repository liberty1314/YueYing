/**
 * useSystemSettings Hook
 * 获取系统设置的自定义 Hook
 * 
 * 特性：
 * - 自动缓存（5分钟）
 * - 监听设置更新事件，实时刷新
 * - 错误处理和默认值
 */

import { useState, useEffect, useCallback } from 'react';
import { api, CachePresets } from '@/lib/apiClient';
import { eventBus, Events } from '@/lib/events';

export interface SystemSettings {
    id: number;
    enable_explore: boolean;
    allow_user_ai_tag_settings: boolean;
    allow_anonymous_home_access: boolean;
    enable_stats: boolean;
    enable_ai_assistant: boolean;
}

export function useSystemSettings() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            // 使用中等缓存时间（5分钟），因为系统设置不会频繁变化
            // 调用公开端点，不需要认证
            const data = await api.get<Partial<SystemSettings>>(
                '/system-settings/public',
                false, // 不需要认证
                CachePresets.MEDIUM
            );
            // 合并默认值，因为公开端点只返回部分字段
            setSettings({
                id: 0,
                enable_explore: data.enable_explore ?? true,
                allow_user_ai_tag_settings: true,
                allow_anonymous_home_access: data.allow_anonymous_home_access ?? true,
                enable_stats: data.enable_stats ?? true,
                enable_ai_assistant: data.enable_ai_assistant ?? true,
            });
            setError(null);
        } catch (err) {
            console.error('Failed to fetch system settings:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
            // 如果获取失败，使用默认值（全部启用）
            setSettings({
                id: 0,
                enable_explore: true,
                allow_user_ai_tag_settings: true,
                allow_anonymous_home_access: true,
                enable_stats: true,
                enable_ai_assistant: true,
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();

        // 监听系统设置更新事件
        const unsubscribe = eventBus.on(Events.SYSTEM_SETTINGS_UPDATED, () => {
            console.log('[useSystemSettings] Settings updated, refetching...');
            fetchSettings();
        });

        return () => {
            unsubscribe();
        };
    }, [fetchSettings]);

    return { settings, loading, error, refetch: fetchSettings };
}
