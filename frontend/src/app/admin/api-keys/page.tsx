/**
 * API Keys Management Page
 * Week 8 Day 3: API密钥管理页面
 * 
 * 注意：此页面已被 /app/admin/layout.tsx 包装在 AdminLayout 中
 * 因此不需要再单独包装 AdminLayout
 */

'use client';

import { useState } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { useApiKeys, type ApiKeyConfig, type ApiKeyConfigUpdate } from '@/hooks/useApiKeys';
import { KeyIcon, CheckCircleIcon, XCircleIcon, EyeIcon, EyeOffIcon, SaveIcon, TestTubeIcon } from 'lucide-react';

const serviceNames: Record<string, string> = {
  tmdb: 'TMDB (电影数据库)',
  google_books: 'Google Books (图书数据)',
  bangumi: 'Bangumi (番组计划)',
};

export default function ApiKeysPage() {
  const { configs, presets, loading, error, updateConfig, testConnection } = useApiKeys();
  const [editingService, setEditingService] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, ApiKeyConfigUpdate>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (service: string, config: ApiKeyConfig) => {
    setEditingService(service);
    setFormData({
      ...formData,
      [service]: {
        api_key: '',
        base_url: config.base_url || '',
        enabled: config.enabled,
        description: config.description || '',
      },
    });
  };

  const handleSave = async (service: string) => {
    try {
      const data = formData[service];
      if (!data) return;

      await updateConfig(service, data);
      showToast('配置已保存', 'success');
      setEditingService(null);
      const newFormData = { ...formData };
      delete newFormData[service];
      setFormData(newFormData);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '保存失败', 'error');
    }
  };

  const handleTest = async (service: string) => {
    setTesting({ ...testing, [service]: true });
    setTestResults({ ...testResults, [service]: null });
    try {
      const result = await testConnection(service);
      setTestResults({ ...testResults, [service]: result.success ? 'success' : 'error' });
      showToast(result.message, result.success ? 'success' : 'error');
    } catch (err) {
      setTestResults({ ...testResults, [service]: 'error' });
      showToast(err instanceof Error ? err.message : '测试失败', 'error');
    } finally {
      setTesting({ ...testing, [service]: false });
    }
  };

  const getStatusBadge = (config: ApiKeyConfig) => {
    if (!config.has_key) {
      return <Badge variant="default">未配置</Badge>;
    }
    if (config.test_status === 'success') {
      return <Badge variant="success">已验证</Badge>;
    }
    if (config.test_status === 'failed') {
      return <Badge variant="error">验证失败</Badge>;
    }
    return <Badge variant="warning">未测试</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast 通知 */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* 页面头部 */}
      <div className="flex items-center gap-3">
        <KeyIcon className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">API密钥管理</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            共 {configs.length} 个服务
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          加载失败: {error.message}
        </div>
      )}

      {/* 服务卡片列表 */}
      <div className="grid grid-cols-1 gap-6">
        {configs.map((config) => {
          const isEditing = editingService === config.service;
          const currentFormData = formData[config.service] || {};

          return (
            <Card key={config.service} className="p-6">
              <div className="space-y-4">
                {/* 服务头部 */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {serviceNames[config.service] || config.service}
                      </h3>
                      {getStatusBadge(config)}
                      <Badge variant={config.enabled ? 'success' : 'default'}>
                        {config.enabled ? '已启用' : '已禁用'}
                      </Badge>
                    </div>
                    {config.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{config.description}</p>
                    )}
                  </div>
                </div>

                {/* API密钥输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API密钥
                  </label>
                  {isEditing ? (
                    <div className="relative">
                      <Input
                        type={showKeys[config.service] ? 'text' : 'password'}
                        value={currentFormData.api_key || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [config.service]: { ...currentFormData, api_key: e.target.value }
                        })}
                        placeholder="输入新的API密钥..."
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys({ ...showKeys, [config.service]: !showKeys[config.service] })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showKeys[config.service] ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <code className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-gray-100">
                        {config.api_key_preview || '未配置'}
                      </code>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(config.service, config)}>
                        编辑
                      </Button>
                    </div>
                  )}
                </div>

                {/* Base URL（编辑模式） */}
                {isEditing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Base URL (可选)
                    </label>
                    <Input
                      value={currentFormData.base_url || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        [config.service]: { ...currentFormData, base_url: e.target.value }
                      })}
                      placeholder="默认使用官方URL"
                    />
                  </div>
                )}

                {/* 启用开关（编辑模式） */}
                {isEditing && (
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`enabled-${config.service}`}
                      checked={currentFormData.enabled ?? config.enabled}
                      onChange={(e) => setFormData({
                        ...formData,
                        [config.service]: { ...currentFormData, enabled: e.target.checked }
                      })}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`enabled-${config.service}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      启用此服务
                    </label>
                  </div>
                )}

                {/* 测试状态 */}
                {config.last_tested_at && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    最后测试: {new Date(config.last_tested_at).toLocaleString('zh-CN')}
                    {config.test_message && ` - ${config.test_message}`}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setEditingService(null)}>
                        取消
                      </Button>
                      <Button variant="primary" onClick={() => handleSave(config.service)} className="gap-2">
                        <SaveIcon className="w-5 h-5" />
                        保存配置
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleTest(config.service)}
                      disabled={!config.has_key || testing[config.service]}
                      className="gap-2"
                    >
                      <TestTubeIcon className="w-5 h-5" />
                      {testing[config.service] ? '测试中...' : '测试连接'}
                      {testResults[config.service] === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                      {testResults[config.service] === 'error' && <XCircleIcon className="w-5 h-5 text-red-500" />}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 环境变量预设提示 */}
      {presets && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 环境变量预设</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            系统已从环境变量检测到 API 密钥配置。
            如果数据库中未配置密钥，将自动使用环境变量中的值。
          </p>
        </Card>
      )}
    </div>
  );
}
