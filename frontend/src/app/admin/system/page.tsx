/**
 * System Settings Page
 * Week 9 Days 3-4: 系统设置页面
 * 
 * 注意：此页面已被 /app/admin/layout.tsx 包装在 AdminLayout 中
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { SaveIcon, SettingsIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';
import { api } from '@/lib/apiClient';

interface SystemSettings {
  id: number;
  enable_explore: boolean;
  allow_user_ai_tag_settings: boolean;
  allow_anonymous_home_access: boolean;
}

interface SettingCardProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const SettingCard = ({ title, description, checked, onChange }: SettingCardProps) => (
  <Card className="p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      <div className="ml-4">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`
            relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            ${checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
          `}
        >
          <span
            aria-hidden="true"
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
    </div>
  </Card>
);

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.get<SystemSettings>('/api/system-settings', true);
      setSettings(data);
      setOriginalSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showToast('获取系统设置失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const updateData = {
        enable_explore: settings.enable_explore,
        allow_user_ai_tag_settings: settings.allow_user_ai_tag_settings,
        allow_anonymous_home_access: settings.allow_anonymous_home_access,
      };
      
      const updated = await api.put<SystemSettings>('/api/system-settings', updateData, true);
      setSettings(updated);
      setOriginalSettings(updated);
      showToast('系统设置已保存', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast(error instanceof Error ? error.message : '保存失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (originalSettings) {
      setSettings({ ...originalSettings });
      showToast('已恢复为未保存前的状态', 'info');
    }
  };

  const hasChanges = settings && originalSettings && (
    settings.enable_explore !== originalSettings.enable_explore ||
    settings.allow_user_ai_tag_settings !== originalSettings.allow_user_ai_tag_settings ||
    settings.allow_anonymous_home_access !== originalSettings.allow_anonymous_home_access
  );

  if (loading || !settings) {
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
          <div className="fixed top-4 right-4 z-50">
            <div className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 
              toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              {toast.message}
            </div>
          </div>
        )}

      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">系统设置</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              配置全局系统功能和权限
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            重置
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="gap-2"
          >
            <SaveIcon className="w-5 h-5" />
            {saving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>

      {/* 变更提示 */}
      {hasChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                有未保存的更改
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                您已修改了系统设置，请点击"保存设置"按钮以应用更改
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 功能开关区块 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          功能开关
        </h2>
        <div className="space-y-3">
          <SettingCard
            title="启用探索/推荐功能"
            description="开启后，用户可以在首页看到个性化推荐内容和探索页面"
            checked={settings.enable_explore}
            onChange={(checked) => setSettings({ ...settings, enable_explore: checked })}
          />
            
          <SettingCard
            title="允许用户自行设置 AI 自动标签"
            description="开启后，用户可以在个人设置中控制是否启用 AI 自动标签功能"
            checked={settings.allow_user_ai_tag_settings}
            onChange={(checked) => setSettings({ ...settings, allow_user_ai_tag_settings: checked })}
          />
            
          <SettingCard
            title="允许未登录用户访问首页"
            description="开启后，未登录用户可以访问首页并查看公开内容；关闭后将强制登录"
            checked={settings.allow_anonymous_home_access}
            onChange={(checked) => setSettings({ ...settings, allow_anonymous_home_access: checked })}
          />
        </div>
      </div>

      {/* 当前配置摘要 */}
      <Card className="p-5 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              当前配置摘要
            </h3>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• 探索功能: <span className="font-medium">{settings.enable_explore ? '已启用' : '已禁用'}</span></li>
              <li>• 用户 AI 标签设置权限: <span className="font-medium">{settings.allow_user_ai_tag_settings ? '允许' : '禁止'}</span></li>
              <li>• 匿名首页访问: <span className="font-medium">{settings.allow_anonymous_home_access ? '允许' : '禁止'}</span></li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 提示信息 */}
      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
        <p className="mb-2">
          <strong>注意事项：</strong>
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>修改系统设置后，部分功能可能需要用户刷新页面才能生效</li>
          <li>如果设置了环境变量 <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">FORCE_READ_ENV_SETTINGS=true</code>，系统将忽略数据库配置并使用环境变量中的值</li>
          <li>建议在非高峰时段修改系统设置，以减少对用户的影响</li>
        </ul>
      </div>
    </div>
  );
}
