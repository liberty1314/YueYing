/**
 * API Keys Management Page
 * 
 * 使用 ConfigForm 组件实现 API 密钥管理
 * 验证需求: 15.3
 * 
 * 注意：此页面已被 /app/admin/layout.tsx 包装在 AdminLayout 中
 */

'use client';

import { useMemo } from 'react';
import { z } from 'zod';
import { ConfigForm, ConfigField } from '@/components/admin/ConfigForm';
import { useApiKeys } from '@/hooks/useApiKeys';
import { Skeleton } from '@/components/ui/Skeleton';
import { AppleCard } from '@/components/ui/AppleCard';
import { Badge } from '@/components/ui/badge';
import { Key, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ApiKeysPage() {
  const { configs, presets, loading, error, updateConfig } = useApiKeys();

  // 定义 API 密钥配置字段
  const fields: ConfigField[] = useMemo(() => [
    // TMDB 配置
    {
      name: 'tmdb_api_key',
      label: 'TMDB API 密钥',
      type: 'password',
      placeholder: 'eyJhbGciOiJIUzI1NiJ9...',
      helpText: '从 TMDB 获取的 API 密钥，用于获取电影和电视剧信息',
      section: 'TMDB (电影和电视剧)',
      validation: z.string().optional(),
    },
    {
      name: 'tmdb_enabled',
      label: '启用 TMDB',
      type: 'switch',
      helpText: '是否启用 TMDB 数据源',
      section: 'TMDB (电影和电视剧)',
    },
    {
      name: 'tmdb_description',
      label: '备注',
      type: 'textarea',
      placeholder: '可选，添加配置说明',
      helpText: '帮助你记住这个配置的用途',
      section: 'TMDB (电影和电视剧)',
      rows: 2,
    },
    // Google Books 配置
    {
      name: 'google_books_api_key',
      label: 'Google Books API 密钥',
      type: 'password',
      placeholder: 'AIzaSy...',
      helpText: '从 Google Cloud Console 获取的 API 密钥，用于获取图书信息',
      section: 'Google Books (图书)',
      validation: z.string().optional(),
    },
    {
      name: 'google_books_enabled',
      label: '启用 Google Books',
      type: 'switch',
      helpText: '是否启用 Google Books 数据源',
      section: 'Google Books (图书)',
    },
    {
      name: 'google_books_description',
      label: '备注',
      type: 'textarea',
      placeholder: '可选，添加配置说明',
      helpText: '帮助你记住这个配置的用途',
      section: 'Google Books (图书)',
      rows: 2,
    },
    // Bangumi 配置
    {
      name: 'bangumi_api_key',
      label: 'Bangumi API 密钥',
      type: 'password',
      placeholder: 'bgm_...',
      helpText: '从 Bangumi 获取的 API 密钥，用于获取动漫、游戏等 ACG 内容信息',
      section: 'Bangumi (动漫和游戏)',
      validation: z.string().optional(),
    },
    {
      name: 'bangumi_enabled',
      label: '启用 Bangumi',
      type: 'switch',
      helpText: '是否启用 Bangumi 数据源',
      section: 'Bangumi (动漫和游戏)',
    },
    {
      name: 'bangumi_description',
      label: '备注',
      type: 'textarea',
      placeholder: '可选，添加配置说明',
      helpText: '帮助你记住这个配置的用途',
      section: 'Bangumi (动漫和游戏)',
      rows: 2,
    },
  ], []);

  // 构建初始值
  const initialValues = useMemo(() => {
    const values: Record<string, any> = {};
    
    // 为每个服务设置初始值
    const services = ['tmdb', 'google_books', 'bangumi'];
    services.forEach(service => {
      const config = configs.find(c => c.service === service);
      values[`${service}_api_key`] = config?.api_key || '';
      values[`${service}_enabled`] = config?.enabled ?? true;
      values[`${service}_description`] = config?.description || '';
    });
    
    return values;
  }, [configs]);

  // 提交处理
  const handleSubmit = async (data: Record<string, any>) => {
    // 为每个服务更新配置
    const services = ['tmdb', 'google_books', 'bangumi'];
    
    for (const service of services) {
      const updateData: Record<string, any> = {};
      
      // 只包含有值的字段
      if (data[`${service}_api_key`]) {
        updateData.api_key = data[`${service}_api_key`];
      }
      if (data[`${service}_enabled`] !== undefined) {
        updateData.enabled = data[`${service}_enabled`];
      }
      if (data[`${service}_description`]) {
        updateData.description = data[`${service}_description`];
      }
      
      // 如果有更新数据，则调用 API
      if (Object.keys(updateData).length > 0) {
        await updateConfig(service, updateData);
      }
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
          API 密钥管理
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

  // 获取测试状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-[var(--color-error)]" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-[var(--color-warning)]" />;
      default:
        return null;
    }
  };

  // 获取测试状态徽章
  const getStatusBadge = (config: any) => {
    if (!config.has_key) {
      return <Badge variant="default">未配置</Badge>;
    }
    
    switch (config.test_status) {
      case 'success':
        return <Badge variant="success">连接正常</Badge>;
      case 'failed':
        return <Badge variant="error">连接失败</Badge>;
      case 'pending':
        return <Badge variant="warning">待测试</Badge>;
      default:
        return <Badge variant="default">未测试</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 配置表单 */}
      <ConfigForm
        title="API 密钥管理"
        description="配置外部数据源的 API 密钥，用于获取电影、图书、动漫等内容信息"
        fields={fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* API 密钥状态概览 */}
      {configs.length > 0 && (
        <AppleCard variant="elevated" sx={{ p: 4 }}>
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-[var(--color-primary)]" />
            <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
              密钥状态
            </h3>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            查看各个数据源的配置状态和连接测试结果
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {configs.map((config) => (
              <div
                key={config.service}
                className="p-4 rounded-[var(--radius-md)] border border-[var(--color-text-disabled)]/20 bg-[var(--color-background-paper)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-[var(--color-text-primary)] capitalize">
                    {config.service === 'google_books' ? 'Google Books' : 
                     config.service === 'tmdb' ? 'TMDB' : 
                     'Bangumi'}
                  </h4>
                  {getStatusBadge(config)}
                </div>
                
                {/* API 密钥预览 */}
                {config.has_key && config.api_key_preview && (
                  <div className="mb-2">
                    <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                      密钥预览
                    </p>
                    <code className="text-xs font-mono text-[var(--color-text-primary)] bg-[var(--color-background-elevated)] px-2 py-1 rounded">
                      {config.api_key_preview}
                    </code>
                  </div>
                )}
                
                {/* 测试状态 */}
                {config.test_status && config.test_status !== 'unknown' && (
                  <div className="flex items-start gap-2 mt-2">
                    {getStatusIcon(config.test_status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {config.test_message || '无测试信息'}
                      </p>
                      {config.last_tested_at && (
                        <p className="text-xs text-[var(--color-text-disabled)] mt-1">
                          最后测试: {new Date(config.last_tested_at).toLocaleString('zh-CN')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 启用状态 */}
                <div className="mt-2 pt-2 border-t border-[var(--color-text-disabled)]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      状态
                    </span>
                    <Badge variant={config.enabled ? 'success' : 'default'}>
                      {config.enabled ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AppleCard>
      )}

      {/* 环境变量预设信息 */}
      {presets && Object.keys(presets).length > 0 && (
        <AppleCard variant="elevated" sx={{ p: 4 }}>
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">
            环境变量预设
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            以下数据源已在环境变量中配置了 API 密钥
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(presets).map(([service, preset]: [string, any]) => (
              <div
                key={service}
                className="p-4 rounded-[var(--radius-md)] border border-[var(--color-text-disabled)]/20 bg-[var(--color-background-paper)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-[var(--color-text-primary)] capitalize">
                    {service === 'google_books' ? 'Google Books' : 
                     service === 'tmdb' ? 'TMDB' : 
                     service}
                  </h4>
                  <Badge variant={preset.has_key ? 'success' : 'default'}>
                    {preset.has_key ? '已配置' : '未配置'}
                  </Badge>
                </div>
                {preset.description && (
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {preset.description}
                  </p>
                )}
                {preset.base_url && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Base URL: {preset.base_url}
                  </p>
                )}
              </div>
            ))}
          </div>
        </AppleCard>
      )}

      {/* 空状态 */}
      {configs.length === 0 && (
        <AppleCard variant="elevated" sx={{ p: 8 }}>
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Key className="w-16 h-16 text-[var(--color-text-disabled)]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
                暂无 API 密钥配置
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                请在上方表单中配置外部数据源的 API 密钥，以便获取电影、图书、动漫等内容信息
              </p>
            </div>
          </div>
        </AppleCard>
      )}
    </div>
  );
}
