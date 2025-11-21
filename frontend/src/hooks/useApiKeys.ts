/**
 * API密钥管理 Hook
 * Week 8 Day 3: API密钥管理页面开发
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, CachePresets } from '@/lib/apiClient';

// ========== 类型定义 ==========

export type ApiKeyService = 'tmdb' | 'google_books' | 'bangumi';

export interface ApiKeyConfig {
  service: string;
  api_key: string | null;
  api_key_preview: string | null;
  has_key: boolean;
  base_url: string | null;
  enabled: boolean;
  last_tested_at: string | null;
  test_status: string;
  test_message: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyConfigUpdate {
  api_key?: string;
  base_url?: string;
  enabled?: boolean;
  description?: string;
}

export interface ApiKeyTestResponse {
  success: boolean;
  message: string;
  tested_at: string;
}

interface UseApiKeysResult {
  configs: ApiKeyConfig[];
  presets: Record<string, any> | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateConfig: (service: string, data: ApiKeyConfigUpdate) => Promise<ApiKeyConfig>;
  testConnection: (service: string) => Promise<ApiKeyTestResponse>;
}

// ========== Hook 实现 ==========

export function useApiKeys(): UseApiKeysResult {
  const [configs, setConfigs] = useState<ApiKeyConfig[]>([]);
  const [presets, setPresets] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [configsData, presetsData] = await Promise.all([
        api.get<{ configs: ApiKeyConfig[] }>('/api/admin/api-keys', true, CachePresets.SHORT),
        api.get<Record<string, any>>('/api/admin/api-keys/presets', true, CachePresets.MEDIUM),
      ]);
      setConfigs(configsData.configs);
      setPresets(presetsData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const updateConfig = useCallback(async (service: string, data: ApiKeyConfigUpdate): Promise<ApiKeyConfig> => {
    const updated = await api.put<ApiKeyConfig>(`/api/admin/api-keys/${service}`, data, true);
    await fetchConfigs();
    return updated;
  }, [fetchConfigs]);

  const testConnection = useCallback(async (service: string): Promise<ApiKeyTestResponse> => {
    return await api.post<ApiKeyTestResponse>(`/api/admin/api-keys/${service}/test`, {}, true);
  }, []);

  return {
    configs,
    presets,
    loading,
    error,
    refetch: fetchConfigs,
    updateConfig,
    testConnection,
  };
}
