/**
 * LLM Configuration Page
 * 
 * 使用 ConfigForm 组件实现 LLM 配置管理
 * 验证需求: 15.2
 * 
 * 注意：此页面已被 /app/admin/layout.tsx 包装在 AdminLayout 中
 */

'use client';

import { useMemo } from 'react';
import { z } from 'zod';
import { ConfigForm, ConfigField } from '@/components/admin/ConfigForm';
import { useLLMConfig } from '@/hooks/useLLMConfig';
import { Skeleton } from '@/components/ui/Skeleton';
import { AppleCard } from '@/components/ui/AppleCard';
import { Badge } from '@/components/ui/badge';

export default function LLMConfigPage() {
  const { config, presets, loading, error, updateConfig, createConfig } = useLLMConfig();

  // 定义 LLM 配置字段
  const fields: ConfigField[] = useMemo(() => [
    {
      name: 'provider',
      label: 'LLM 提供商',
      type: 'select',
      options: [
        { label: 'SiliconFlow', value: 'siliconflow' },
        { label: 'DeepSeek', value: 'deepseek' },
        { label: 'OpenAI', value: 'openai' },
        { label: 'Anthropic Claude', value: 'anthropic' },
      ],
      helpText: '选择 LLM 服务提供商',
      section: '基础配置',
      validation: z.string().min(1, '请选择提供商'),
    },
    {
      name: 'api_key',
      label: 'API 密钥',
      type: 'password',
      placeholder: 'sk-...',
      helpText: '从提供商处获取的 API 密钥',
      section: '基础配置',
      validation: z.string().min(1, 'API 密钥不能为空'),
    },
    {
      name: 'base_url',
      label: 'Base URL',
      type: 'text',
      placeholder: 'https://api.siliconflow.cn/v1',
      helpText: '可选，自定义 API 端点地址',
      section: '基础配置',
    },
    {
      name: 'default_model',
      label: '默认模型',
      type: 'text',
      placeholder: 'deepseek-ai/DeepSeek-V3',
      helpText: '默认使用的模型名称',
      section: '基础配置',
    },
    {
      name: 'temperature',
      label: '温度 (Temperature)',
      type: 'number',
      placeholder: '0.7',
      helpText: '控制输出的随机性，范围 0-2，值越高输出越随机',
      section: '模型参数',
      min: 0,
      max: 2,
      step: 0.1,
      validation: z.number().min(0, '温度不能小于 0').max(2, '温度不能大于 2'),
    },
    {
      name: 'max_tokens',
      label: '最大 Token 数',
      type: 'number',
      placeholder: '2000',
      helpText: '生成文本的最大长度',
      section: '模型参数',
      min: 1,
      max: 100000,
      validation: z.number().min(1, '最大 Token 数至少为 1').max(100000, '最大 Token 数不能超过 100000').nullable(),
    },
    {
      name: 'top_p',
      label: 'Top P',
      type: 'number',
      placeholder: '1.0',
      helpText: '核采样参数，范围 0-1',
      section: '模型参数',
      min: 0,
      max: 1,
      step: 0.1,
      validation: z.number().min(0, 'Top P 不能小于 0').max(1, 'Top P 不能大于 1'),
    },
    {
      name: 'enabled',
      label: '启用 LLM 服务',
      type: 'switch',
      helpText: '是否启用 LLM 功能',
      section: '功能开关',
    },
    {
      name: 'auto_tag_enabled',
      label: '启用自动标签生成',
      type: 'switch',
      helpText: '是否自动为内容生成标签',
      section: '功能开关',
    },
    {
      name: 'description',
      label: '描述',
      type: 'textarea',
      placeholder: '可选，添加配置说明',
      helpText: '帮助你记住这个配置的用途',
      section: '其他设置',
      rows: 3,
    },
  ], []);

  // 初始值
  const initialValues = useMemo(() => ({
    provider: config?.provider || 'siliconflow',
    api_key: config?.api_key || '',
    base_url: config?.base_url || '',
    default_model: config?.default_model || '',
    temperature: config?.temperature ?? 0.7,
    max_tokens: config?.max_tokens || null,
    top_p: config?.top_p ?? 1.0,
    enabled: config?.enabled ?? true,
    auto_tag_enabled: config?.auto_tag_enabled ?? false,
    description: config?.description || '',
  }), [config]);

  // 提交处理
  const handleSubmit = async (data: Record<string, any>) => {
    if (config) {
      await updateConfig(data);
    } else {
      await createConfig(data);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          LLM 配置
        </h1>
        <AppleCard variant="elevated" sx={{ p: 4 }}>
          <div className="text-center space-y-2">
            <p className="text-[var(--color-error)]">加载失败</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {error.message}
            </p>
          </div>
        </AppleCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 配置表单 */}
      <ConfigForm
        title="LLM 配置"
        description="配置大语言模型的参数和 API 密钥"
        fields={fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* 环境变量预设信息 */}
      {presets && Object.keys(presets).length > 0 && (
        <AppleCard variant="elevated" sx={{ p: 4 }}>
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">
            环境变量预设
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            以下提供商已在环境变量中配置了 API 密钥
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(presets).map(([provider, preset]) => (
              <div
                key={provider}
                className="p-4 rounded-[var(--radius-md)] border border-[var(--color-text-disabled)]/20 bg-[var(--color-background-paper)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-[var(--color-text-primary)] capitalize">
                    {provider}
                  </h4>
                  <Badge variant={preset.api_key ? 'success' : 'default'}>
                    {preset.api_key ? '已配置' : '未配置'}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {preset.description}
                </p>
                {preset.default_model && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    默认模型: {preset.default_model}
                  </p>
                )}
              </div>
            ))}
          </div>
        </AppleCard>
      )}
    </div>
  );
}
