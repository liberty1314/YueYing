/**
 * System Settings Page
 * 
 * 系统设置管理页面，使用 ConfigForm 组件实现
 * 验证需求: 15.5
 * 
 * 功能：
 * - 显示所有系统设置选项
 * - 按类别分组（功能开关、用户权限、访问控制）
 * - 使用 Switch 组件进行开关控制
 * - 实时保存和反馈
 * 
 * 注意：此页面已被 /app/admin/layout.tsx 包装在 AdminLayout 中
 */

'use client';

import { useMemo } from 'react';
import { ConfigForm, ConfigField } from '@/components/admin/ConfigForm';
import { useAdminSystemSettings, useUpdateSystemSettings } from '@/hooks/useAdminSystemSettings';
import { Skeleton } from '@/components/ui/Skeleton';
import { AppleCard } from '@/components/ui/AppleCard';
import { AlertCircle, Info } from 'lucide-react';

export default function SystemSettingsPage() {
  const { data: settings, isLoading, error } = useAdminSystemSettings();
  const updateSettings = useUpdateSystemSettings();

  // 定义系统设置字段
  const fields: ConfigField[] = useMemo(() => [
    // 功能开关
    {
      name: 'enable_explore',
      label: '启用探索/推荐功能',
      type: 'switch',
      helpText: '启用后，用户可以访问探索页面查看个性化推荐内容',
      section: '功能开关',
    },
    {
      name: 'enable_stats',
      label: '启用数据统计页面',
      type: 'switch',
      helpText: '启用后，用户可以访问统计页面查看数据分析和可视化图表',
      section: '功能开关',
    },
    {
      name: 'enable_ai_assistant',
      label: '启用 AI 助手页面',
      type: 'switch',
      helpText: '启用后，用户可以使用 AI 助手进行对话和查询',
      section: '功能开关',
    },
    
    // 用户权限
    {
      name: 'allow_user_ai_tag_settings',
      label: '允许用户自定义 AI 标签设置',
      type: 'switch',
      helpText: '启用后，用户可以在个人设置中配置 AI 自动标签生成的偏好',
      section: '用户权限',
    },
    
    // 访问控制
    {
      name: 'allow_anonymous_home_access',
      label: '允许未登录用户访问首页',
      type: 'switch',
      helpText: '启用后，未登录用户可以浏览首页内容（但无法查看个人数据）',
      section: '访问控制',
    },
  ], []);

  // 初始值
  const initialValues = useMemo(() => ({
    enable_explore: settings?.enable_explore ?? false,
    enable_stats: settings?.enable_stats ?? true,
    enable_ai_assistant: settings?.enable_ai_assistant ?? true,
    allow_user_ai_tag_settings: settings?.allow_user_ai_tag_settings ?? true,
    allow_anonymous_home_access: settings?.allow_anonymous_home_access ?? true,
  }), [settings]);

  // 提交处理
  const handleSubmit = async (data: Record<string, any>) => {
    await updateSettings.mutateAsync(data);
  };

  // 加载状态
  if (isLoading) {
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
          系统设置
        </h1>
        <AppleCard variant="elevated" sx={{ p: 4 }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-[var(--color-error)] font-medium">加载失败</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {error instanceof Error ? error.message : '未知错误'}
              </p>
            </div>
          </div>
        </AppleCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 配置表单 */}
      <ConfigForm
        title="系统设置"
        description="配置系统全局功能开关和访问控制"
        fields={fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        loading={isLoading}
      />

      {/* 提示信息 */}
      <AppleCard variant="elevated" sx={{ p: 4 }}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
              关于系统设置
            </h3>
            <div className="text-sm text-[var(--color-text-secondary)] space-y-2">
              <p>
                系统设置控制全局功能的启用和禁用，影响所有用户的访问权限。
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>功能开关</strong>：控制探索、统计、AI 助手等功能模块的可用性
                </li>
                <li>
                  <strong>用户权限</strong>：控制用户可以自定义的设置范围
                </li>
                <li>
                  <strong>访问控制</strong>：控制未登录用户的访问权限
                </li>
              </ul>
              <p className="text-xs text-[var(--color-text-disabled)] mt-3">
                💡 提示：修改设置后会立即生效，所有用户的访问权限将实时更新。
              </p>
            </div>
          </div>
        </div>
      </AppleCard>

      {/* 环境变量说明 */}
      <AppleCard variant="elevated" sx={{ p: 4 }}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
              环境变量配置
            </h3>
            <div className="text-sm text-[var(--color-text-secondary)] space-y-2">
              <p>
                系统设置可以通过环境变量进行初始化配置。如果设置了以下环境变量，
                系统将在首次启动时使用这些默认值：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 font-mono text-xs">
                <li>DEFAULT_ENABLE_EXPLORE</li>
                <li>DEFAULT_ALLOW_USER_AI_TAG_SETTINGS</li>
                <li>DEFAULT_ALLOW_ANONYMOUS_HOME_ACCESS</li>
                <li>DEFAULT_ENABLE_STATS</li>
                <li>DEFAULT_ENABLE_AI_ASSISTANT</li>
              </ul>
              <p className="text-xs text-[var(--color-text-disabled)] mt-3">
                ⚠️ 注意：环境变量仅在数据库中没有设置记录时生效。
                一旦通过此页面保存设置，将以数据库中的值为准。
              </p>
            </div>
          </div>
        </div>
      </AppleCard>
    </div>
  );
}
