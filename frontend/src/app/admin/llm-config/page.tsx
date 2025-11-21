/**
 * LLM Configuration Page
 * Week 7 Day 5: LLM配置页面
 * 
 * 注意：此页面已被 /app/admin/layout.tsx 包装在 AdminLayout 中
 */

'use client';

import { useState } from 'react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { useLLMConfig, type LLMProvider, type LLMConfigUpdate } from '@/hooks/useLLMConfig';
import { BrainCircuitIcon, CheckCircleIcon, XCircleIcon, EyeIcon, EyeOffIcon, SaveIcon } from 'lucide-react';

export default function LLMConfigPage() {
  const { config, presets, loading, error, updateConfig, createConfig, testConnection } = useLLMConfig();
  
  const [formData, setFormData] = useState<LLMConfigUpdate>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const success = await testConnection();
      setTestResult(success ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (config) {
        await updateConfig(formData);
      } else {
        await createConfig(formData as Required<LLMConfigUpdate>);
      }
      showToast('配置已保存', 'success');
      setFormData({});
    } catch (err) {
      showToast(err instanceof Error ? err.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentValue = (key: keyof LLMConfigUpdate) => {
    return formData[key] !== undefined ? formData[key] : config?.[key as keyof typeof config];
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
        <BrainCircuitIcon className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">LLM配置</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {config ? '已配置' : '未配置'} {config && `• 提供商: ${config.provider}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          加载失败: {error.message}
        </div>
      )}

      {/* LLM 提供商配置卡片 */}
      <div className="grid grid-cols-1 gap-6">
        {/* 主配置表单 */}
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">基础配置</h2>

          {/* 提供商选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              LLM提供商
            </label>
            <select
              value={getCurrentValue('provider') as string}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value as LLMProvider })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="siliconflow">SiliconFlow</option>
              <option value="deepseek">DeepSeek</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic Claude</option>
            </select>
          </div>

          {/* API密钥 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API密钥
            </label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={getCurrentValue('api_key') as string || ''}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showApiKey ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Base URL (可选)
            </label>
            <Input
              value={getCurrentValue('base_url') as string || ''}
              onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
              placeholder="https://api.siliconflow.cn/v1"
            />
          </div>

          {/* 默认模型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              默认模型
            </label>
            <Input
              value={getCurrentValue('default_model') as string || ''}
              onChange={(e) => setFormData({ ...formData, default_model: e.target.value })}
              placeholder="deepseek-ai/DeepSeek-V3"
            />
          </div>

          {/* 温度参数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              温度 (Temperature): {getCurrentValue('temperature') || 0.7}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={getCurrentValue('temperature') as number || 0.7}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* 功能开关 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enabled"
                checked={getCurrentValue('enabled') as boolean ?? true}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                启用LLM服务
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_tag"
                checked={getCurrentValue('auto_tag_enabled') as boolean ?? false}
                onChange={(e) => setFormData({ ...formData, auto_tag_enabled: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="auto_tag" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                启用自动标签生成
              </label>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleTest}
              variant="outline"
              disabled={testing || !getCurrentValue('api_key')}
              className="gap-2"
            >
              {testing ? '测试中...' : '测试连接'}
              {testResult === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
              {testResult === 'error' && <XCircleIcon className="w-5 h-5 text-red-500" />}
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={saving || Object.keys(formData).length === 0}
              className="gap-2"
            >
              <SaveIcon className="w-5 h-5" />
              {saving ? '保存中...' : '保存配置'}
            </Button>
          </div>
        </Card>

        {/* 预设配置 */}
        {presets && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              环境变量预设
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(presets).map(([provider, preset]) => (
                <div
                  key={provider}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {provider}
                    </h3>
                    <Badge variant={preset.api_key ? 'success' : 'default'}>
                      {preset.api_key ? '已配置' : '未配置'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {preset.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
