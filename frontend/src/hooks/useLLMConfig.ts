/**
 * LLM配置管理 Hook
 * Week 7 Day 5: LLM配置页面开发
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, CachePresets } from '@/lib/apiClient';

// ========== 类型定义 ==========

export type LLMProvider = 'siliconflow' | 'openai' | 'deepseek' | 'anthropic';

export interface LLMConfig {
  id: number;
  provider: LLMProvider;
  api_key: string;
  base_url: string | null;
  default_model: string | null;
  temperature: number;
  max_tokens: number | null;
  top_p: number;
  enabled: boolean;
  auto_tag_enabled: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface LLMConfigUpdate {
  provider?: LLMProvider;
  api_key?: string;
  base_url?: string | null;
  default_model?: string | null;
  temperature?: number;
  max_tokens?: number | null;
  top_p?: number;
  enabled?: boolean;
  auto_tag_enabled?: boolean;
  description?: string | null;
}

export interface ProviderPreset {
  provider: string;
  api_key: string | null;
  base_url: string;
  default_model: string;
  description: string;
}

interface UseLLMConfigResult {
  config: LLMConfig | null;
  presets: Record<string, ProviderPreset> | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateConfig: (data: LLMConfigUpdate) => Promise<LLMConfig>;
  createConfig: (data: LLMConfigUpdate) => Promise<LLMConfig>;
  testConnection: (testData?: {
    provider: LLMProvider;
    api_key: string;
    base_url?: string;
    model?: string;
  }) => Promise<boolean>;
}

// ========== Hook 实现 ==========

export function useLLMConfig(): UseLLMConfigResult {
  const [config, setConfig] = useState<LLMConfig | null>(null);
  const [presets, setPresets] = useState<Record<string, ProviderPreset> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [configData, presetsData] = await Promise.all([
        api.get<LLMConfig>('/llm-config', true, CachePresets.SHORT).catch(() => null),
        api.get<Record<string, ProviderPreset>>('/llm-config/presets', true, CachePresets.MEDIUM),
      ]);
      setConfig(configData);
      setPresets(presetsData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch LLM config:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(async (data: LLMConfigUpdate): Promise<LLMConfig> => {
    const updated = await api.put<LLMConfig>('/llm-config', data, true);
    setConfig(updated);
    return updated;
  }, []);

  const createConfig = useCallback(async (data: LLMConfigUpdate): Promise<LLMConfig> => {
    const created = await api.post<LLMConfig>('/llm-config', data, true);
    setConfig(created);
    return created;
  }, []);

  const testConnection = useCallback(async (testData?: {
    provider: LLMProvider;
    api_key: string;
    base_url?: string;
    model?: string;
  }): Promise<boolean> => {
    try {
      // 如果提供了测试数据，使用测试接口
      if (testData) {
        const response = await api.post<{ success: boolean; message: string }>('/llm-config/test', {
          provider: testData.provider,
          api_key: testData.api_key,
          base_url: testData.base_url || null,
          model: testData.model || null,
        }, true);
        return response.success;
      }

      // 否则使用当前配置测试
      await api.get('/llm/models', true);
      return true;
    } catch (err) {
      console.error('Test connection failed:', err);
      return false;
    }
  }, []);

  return {
    config,
    presets,
    loading,
    error,
    refetch: fetchConfig,
    updateConfig,
    createConfig,
    testConnection,
  };
}
