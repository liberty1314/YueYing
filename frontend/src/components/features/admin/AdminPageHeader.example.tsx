/**
 * AdminPageHeader 组件使用示例
 * 
 * 本文件展示了 AdminPageHeader 组件的各种使用场景和最佳实践。
 */

'use client';

import React from 'react';
import { AdminPageHeader } from './AdminPageHeader';
import { AppleButton } from '@/components/ui/AppleButton';
import { Plus, Download, Settings, RefreshCw, Upload } from 'lucide-react';

/**
 * 示例 1: 基础用法
 * 最简单的使用方式，只包含标题
 */
export function BasicExample() {
  return (
    <div className="p-6 bg-[var(--color-background-default)]">
      <AdminPageHeader title="用户管理" />
    </div>
  );
}

/**
 * 示例 2: 带描述
 * 添加描述文本，提供页面上下文信息
 */
export function WithDescriptionExample() {
  return (
    <div className="p-6 bg-[var(--color-background-default)]">
      <AdminPageHeader
        title="用户管理"
        description="管理系统用户账户、角色和权限设置"
      />
    </div>
  );
}

/**
 * 示例 3: 带面包屑导航
 * 显示页面层级关系，帮助用户了解当前位置
 */
export function WithBreadcrumbsExample() {
  return (
    <div className="p-6 bg-[var(--color-background-default)]">
      <AdminPageHeader
        title="用户详情"
        description="查看和编辑用户信息"
        breadcrumbs={[
          { label: '首页', href: '/admin' },
          { label: '用户管理', href: '/admin/users' },
          { label: '用户详情' },
        ]}
      />
    </div>
  );
}

/**
 * 示例 4: 带单个操作按钮
 * 最常见的使用场景，提供主要操作入口
 */
export function WithSingleActionExample() {
  const handleCreateUser = () => {
    console.log('创建用户');
  };

  return (
    <div className="p-6 bg-[var(--color-background-default)]">
      <AdminPageHeader
        title="用户管理"
        description="管理系统用户账户和权限"
        actions={
          <AppleButton variant="primary" onClick={handleCreateUser}>
            <Plus className="w-5 h-5 mr-2" />
            创建用户
          </AppleButton>
        }
      />
    </div>
  );
}

/**
 * 示例 5: 带多个操作按钮
 * 提供多个操作选项，主次分明
 */
export function WithMultipleActionsExample() {
  const handleExport = () => {
    console.log('导出数据');
  };

  const handleImport = () => {
    console.log('导入数据');
  };

  const handleCreateUser = () => {
    console.log('创建用户');
  };

  return (
    <div className="p-6 bg-[var(--color-background-default)]">
      <AdminPageHeader
        title="用户管理"
        description="管理系统用户账户和权限"
        actions={
          <>
            <AppleButton variant="ghost" onClick={handleImport}>
              <Upload className="w-5 h-5 mr-2" />
              导入
            </AppleButton>
            <AppleButton variant="ghost" onClick={handleExport}>
              <Download className="w-5 h-5 mr-2" />
              导出
            </AppleButton>
            <AppleButton variant="primary" onClick={handleCreateUser}>
              <Plus className="w-5 h-5 mr-2" />
              创建用户
            </AppleButton>
          </>
        }
      />
    </div>
  );
}

/**
 * 示例 6: 完整示例
 * 包含所有功能：标题、描述、面包屑、多个操作按钮
 */
export function CompleteExample() {
  const handleRefresh = () => {
    console.log('刷新数据');
  };

  const handleSettings = () => {
    console.log('打开设置');
  };

  const handleExport = () => {
    console.log('导出数据');
  };

  const handleCreateUser = () => {
    console.log('创建用户');
  };

  return (
    <div className="p-6 bg-[var(--color-background-default)]">
      <AdminPageHeader
        title="用户管理"
        description="管理系统用户账户、角色和权限设置。支持批量导入导出、权限配置和活动监控。"
        breadcrumbs={[
          { label: '首页', href: '/admin' },
          { label: '用户管理' },
        ]}
        actions={
          <>
            <AppleButton variant="text" onClick={handleRefresh}>
              <RefreshCw className="w-5 h-5" />
            </AppleButton>
            <AppleButton variant="text" onClick={handleSettings}>
              <Settings className="w-5 h-5" />
            </AppleButton>
            <AppleButton variant="ghost" onClick={handleExport}>
              <Download className="w-5 h-5 mr-2" />
              导出
            </AppleButton>
            <AppleButton variant="primary" onClick={handleCreateUser}>
              <Plus className="w-5 h-5 mr-2" />
              创建用户
            </AppleButton>
          </>
        }
      />
    </div>
  );
}

/**
 * 示例 7: LLM 配置页面
 * 实际使用场景示例
 */
export function LLMConfigPageExample() {
  const handleAddConfig = () => {
    console.log('添加 LLM 配置');
  };

  const handleTestConnection = () => {
    console.log('测试连接');
  };

  return (
    <div className="p-6 bg-[var(--color-background-default)]">
      <AdminPageHeader
        title="LLM 配置"
        description="配置大语言模型的 API 密钥、参数和默认设置"
        breadcrumbs={[
          { label: '首页', href: '/admin' },
          { label: 'LLM 配置' },
        ]}
        actions={
          <>
            <AppleButton variant="ghost" onClick={handleTestConnection}>
              测试连接
            </AppleButton>
            <AppleButton variant="primary" onClick={handleAddConfig}>
              <Plus className="w-5 h-5 mr-2" />
              添加配置
            </AppleButton>
          </>
        }
      />
    </div>
  );
}

/**
 * 示例 8: 系统日志页面
 * 实际使用场景示例
 */
export function SystemLogsPageExample() {
  const handleRefresh = () => {
    console.log('刷新日志');
  };

  const handleExport = () => {
    console.log('导出日志');
  };

  const handleClearLogs = () => {
    console.log('清空日志');
  };

  return (
    <div className="p-6 bg-[var(--color-background-default)]">
      <AdminPageHeader
        title="系统日志"
        description="查看和管理系统运行日志，支持实时刷新和日志导出"
        breadcrumbs={[
          { label: '首页', href: '/admin' },
          { label: '系统日志' },
        ]}
        actions={
          <>
            <AppleButton variant="text" onClick={handleRefresh}>
              <RefreshCw className="w-5 h-5" />
            </AppleButton>
            <AppleButton variant="ghost" onClick={handleExport}>
              <Download className="w-5 h-5 mr-2" />
              导出
            </AppleButton>
            <AppleButton variant="secondary" onClick={handleClearLogs}>
              清空日志
            </AppleButton>
          </>
        }
      />
    </div>
  );
}

/**
 * 示例 9: 自定义样式
 * 演示如何使用 className 自定义样式
 */
export function CustomStyleExample() {
  return (
    <div className="p-6 bg-[var(--color-background-default)]">
      <AdminPageHeader
        title="自定义样式示例"
        description="使用 className 属性自定义组件样式"
        className="border-b-2 border-[var(--color-primary)] pb-8"
      />
    </div>
  );
}

/**
 * 示例 10: 无分隔线
 * 演示如何移除底部分隔线
 */
export function NoBorderExample() {
  return (
    <div className="p-6 bg-[var(--color-background-default)]">
      <AdminPageHeader
        title="无分隔线示例"
        description="移除底部分隔线，适用于特殊布局需求"
        className="border-b-0"
      />
    </div>
  );
}

/**
 * 示例集合组件
 * 展示所有示例
 */
export function AdminPageHeaderExamples() {
  return (
    <div className="space-y-12 p-8 bg-[var(--color-background-default)]">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
          AdminPageHeader 组件示例
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-8">
          以下展示了 AdminPageHeader 组件的各种使用场景和最佳实践。
        </p>
      </div>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
          1. 基础用法
        </h3>
        <BasicExample />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
          2. 带描述
        </h3>
        <WithDescriptionExample />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
          3. 带面包屑导航
        </h3>
        <WithBreadcrumbsExample />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
          4. 带单个操作按钮
        </h3>
        <WithSingleActionExample />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
          5. 带多个操作按钮
        </h3>
        <WithMultipleActionsExample />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
          6. 完整示例
        </h3>
        <CompleteExample />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
          7. LLM 配置页面示例
        </h3>
        <LLMConfigPageExample />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
          8. 系统日志页面示例
        </h3>
        <SystemLogsPageExample />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
          9. 自定义样式
        </h3>
        <CustomStyleExample />
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
          10. 无分隔线
        </h3>
        <NoBorderExample />
      </section>
    </div>
  );
}

export default AdminPageHeaderExamples;
