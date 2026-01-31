/**
 * ConfigForm 组件使用示例
 * 
 * 展示 ConfigForm 组件的各种用法场景
 */

import { useState } from 'react';
import { z } from 'zod';
import { ConfigForm, ConfigField } from './ConfigForm';

/**
 * 示例 1: LLM 配置表单
 */
export function LLMConfigExample() {
  const fields: ConfigField[] = [
    {
      name: 'provider',
      label: '提供商',
      type: 'select',
      options: [
        { label: 'SiliconFlow', value: 'siliconflow' },
        { label: 'DeepSeek', value: 'deepseek' },
        { label: 'OpenAI', value: 'openai' },
        { label: 'Anthropic', value: 'anthropic' },
      ],
      helpText: '选择 LLM 服务提供商',
      section: '基础配置',
      validation: z.string().min(1, '请选择提供商'),
    },
    {
      name: 'model_name',
      label: '模型名称',
      type: 'text',
      placeholder: '例如: gpt-4, claude-3-opus',
      helpText: '输入要使用的模型名称',
      section: '基础配置',
      validation: z.string().min(1, '模型名称不能为空'),
    },
    {
      name: 'api_key',
      label: 'API 密钥',
      type: 'password',
      placeholder: '输入 API 密钥',
      helpText: '从提供商处获取的 API 密钥',
      section: '基础配置',
      validation: z.string().min(1, 'API 密钥不能为空'),
    },
    {
      name: 'base_url',
      label: 'Base URL',
      type: 'text',
      placeholder: 'https://api.example.com',
      helpText: '可选，自定义 API 端点',
      section: '基础配置',
    },
    {
      name: 'temperature',
      label: '温度',
      type: 'number',
      placeholder: '0.7',
      helpText: '控制输出的随机性，范围 0-2',
      section: '模型参数',
      min: 0,
      max: 2,
      step: 0.1,
      validation: z.number().min(0).max(2),
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
      validation: z.number().min(1).max(100000),
    },
    {
      name: 'is_default',
      label: '设为默认',
      type: 'switch',
      helpText: '将此配置设为默认使用',
      section: '其他设置',
    },
  ];

  const initialValues = {
    provider: 'siliconflow',
    model_name: 'Qwen/Qwen2.5-7B-Instruct',
    api_key: '',
    base_url: '',
    temperature: 0.7,
    max_tokens: 2000,
    is_default: true,
  };

  const handleSubmit = async (data: Record<string, any>) => {
    console.log('提交 LLM 配置:', data);
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <ConfigForm
      title="LLM 配置"
      description="配置大语言模型的参数和 API 密钥"
      fields={fields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}

/**
 * 示例 2: 系统设置表单
 */
export function SystemSettingsExample() {
  const fields: ConfigField[] = [
    {
      name: 'site_name',
      label: '站点名称',
      type: 'text',
      placeholder: '阅影·log',
      helpText: '显示在浏览器标题栏的名称',
      section: '基本信息',
      validation: z.string().min(1, '站点名称不能为空'),
    },
    {
      name: 'site_description',
      label: '站点描述',
      type: 'textarea',
      placeholder: '一个 AI 驱动的个人娱乐追踪平台',
      helpText: '用于 SEO 和社交媒体分享',
      section: '基本信息',
      rows: 3,
    },
    {
      name: 'items_per_page',
      label: '每页显示数量',
      type: 'number',
      placeholder: '20',
      helpText: '列表页面每页显示的项目数量',
      section: '显示设置',
      min: 10,
      max: 100,
      validation: z.number().min(10).max(100),
    },
    {
      name: 'enable_registration',
      label: '允许用户注册',
      type: 'switch',
      helpText: '是否允许新用户注册账号',
      section: '用户设置',
    },
    {
      name: 'require_email_verification',
      label: '需要邮箱验证',
      type: 'switch',
      helpText: '新用户注册后是否需要验证邮箱',
      section: '用户设置',
    },
    {
      name: 'session_timeout',
      label: '会话超时时间（分钟）',
      type: 'number',
      placeholder: '60',
      helpText: '用户会话的超时时间',
      section: '安全设置',
      min: 5,
      max: 1440,
      validation: z.number().min(5).max(1440),
    },
    {
      name: 'enable_2fa',
      label: '启用双因素认证',
      type: 'switch',
      helpText: '要求用户使用双因素认证',
      section: '安全设置',
    },
  ];

  const initialValues = {
    site_name: '阅影·log',
    site_description: '一个 AI 驱动的个人娱乐追踪平台',
    items_per_page: 20,
    enable_registration: true,
    require_email_verification: false,
    session_timeout: 60,
    enable_2fa: false,
  };

  const handleSubmit = async (data: Record<string, any>) => {
    console.log('提交系统设置:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <ConfigForm
      title="系统设置"
      description="配置系统的全局参数"
      fields={fields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}

/**
 * 示例 3: API 密钥配置表单
 */
export function APIKeyConfigExample() {
  const fields: ConfigField[] = [
    {
      name: 'service',
      label: '服务类型',
      type: 'select',
      options: [
        { label: 'TMDB (电影数据库)', value: 'tmdb' },
        { label: 'Google Books (图书)', value: 'google_books' },
        { label: 'Bangumi (番组计划)', value: 'bangumi' },
      ],
      helpText: '选择要配置的外部服务',
      validation: z.string().min(1, '请选择服务类型'),
    },
    {
      name: 'api_key',
      label: 'API 密钥',
      type: 'password',
      placeholder: '输入 API 密钥',
      helpText: '从服务提供商处获取的 API 密钥',
      validation: z.string().min(1, 'API 密钥不能为空'),
    },
    {
      name: 'description',
      label: '描述',
      type: 'textarea',
      placeholder: '可选，添加备注信息',
      helpText: '帮助你记住这个密钥的用途',
      rows: 2,
    },
    {
      name: 'is_active',
      label: '启用',
      type: 'switch',
      helpText: '是否启用此 API 密钥',
    },
  ];

  const initialValues = {
    service: 'tmdb',
    api_key: '',
    description: '',
    is_active: true,
  };

  const handleSubmit = async (data: Record<string, any>) => {
    console.log('提交 API 密钥配置:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <ConfigForm
      title="API 密钥配置"
      description="配置外部服务的 API 密钥"
      fields={fields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}

/**
 * 示例 4: 简单配置表单（无分组）
 */
export function SimpleConfigExample() {
  const fields: ConfigField[] = [
    {
      name: 'username',
      label: '用户名',
      type: 'text',
      placeholder: '输入用户名',
      validation: z.string().min(3, '用户名至少 3 个字符'),
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'text',
      placeholder: 'user@example.com',
      validation: z.string().email('请输入有效的邮箱地址'),
    },
    {
      name: 'age',
      label: '年龄',
      type: 'number',
      placeholder: '18',
      min: 1,
      max: 150,
      validation: z.number().min(1).max(150),
    },
    {
      name: 'notifications',
      label: '接收通知',
      type: 'switch',
      helpText: '是否接收系统通知',
    },
  ];

  const initialValues = {
    username: '',
    email: '',
    age: 18,
    notifications: true,
  };

  const handleSubmit = async (data: Record<string, any>) => {
    console.log('提交简单配置:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <ConfigForm
      title="用户信息"
      description="编辑你的个人信息"
      fields={fields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}

/**
 * 示例页面 - 展示所有示例
 */
export default function ConfigFormExamples() {
  const [activeExample, setActiveExample] = useState<
    'llm' | 'system' | 'apikey' | 'simple'
  >('llm');

  return (
    <div className="min-h-screen bg-[var(--color-background-default)] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            ConfigForm 组件示例
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            展示 ConfigForm 组件的各种使用场景
          </p>
        </div>

        {/* 示例选择器 */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveExample('llm')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeExample === 'llm'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-background-paper)] text-[var(--color-text-primary)]'
            }`}
          >
            LLM 配置
          </button>
          <button
            onClick={() => setActiveExample('system')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeExample === 'system'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-background-paper)] text-[var(--color-text-primary)]'
            }`}
          >
            系统设置
          </button>
          <button
            onClick={() => setActiveExample('apikey')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeExample === 'apikey'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-background-paper)] text-[var(--color-text-primary)]'
            }`}
          >
            API 密钥
          </button>
          <button
            onClick={() => setActiveExample('simple')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeExample === 'simple'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-background-paper)] text-[var(--color-text-primary)]'
            }`}
          >
            简单表单
          </button>
        </div>

        {/* 示例内容 */}
        <div>
          {activeExample === 'llm' && <LLMConfigExample />}
          {activeExample === 'system' && <SystemSettingsExample />}
          {activeExample === 'apikey' && <APIKeyConfigExample />}
          {activeExample === 'simple' && <SimpleConfigExample />}
        </div>
      </div>
    </div>
  );
}
