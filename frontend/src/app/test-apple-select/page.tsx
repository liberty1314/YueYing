/**
 * AppleSelect 组件测试页面
 * 
 * 用于验证 AppleSelect 组件的各种功能和状态
 */

'use client';

import { useState } from 'react';
import { AppleSelect, type SelectOption } from '@/components/ui/AppleSelect';

export default function TestAppleSelectPage() {
  const [basicValue, setBasicValue] = useState('');
  const [roleValue, setRoleValue] = useState('user');
  const [statusValue, setStatusValue] = useState('');

  // 基础选项
  const basicOptions: SelectOption[] = [
    { label: '选项 1', value: '1' },
    { label: '选项 2', value: '2' },
    { label: '选项 3', value: '3' },
    { label: '选项 4（禁用）', value: '4', disabled: true },
  ];

  // 角色选项
  const roleOptions: SelectOption[] = [
    { label: '管理员', value: 'admin' },
    { label: '普通用户', value: 'user' },
    { label: '访客', value: 'guest' },
  ];

  // 状态选项
  const statusOptions: SelectOption[] = [
    { label: '活跃', value: 'active' },
    { label: '待审核', value: 'pending' },
    { label: '已禁用', value: 'disabled' },
    { label: '已删除', value: 'deleted' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background-default)] p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            AppleSelect 组件测试
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            测试 AppleSelect 组件的各种功能和状态
          </p>
        </div>

        <div className="space-y-8">
          {/* 基础用法 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              1. 基础用法
            </h2>
            <AppleSelect
              value={basicValue}
              onValueChange={setBasicValue}
              options={basicOptions}
              placeholder="请选择一个选项"
            />
            <p className="text-sm text-[var(--color-text-secondary)]">
              当前选中值: {basicValue || '未选择'}
            </p>
          </section>

          {/* 带标签和帮助文本 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              2. 带标签和帮助文本
            </h2>
            <AppleSelect
              label="用户角色"
              helpText="选择用户的角色类型"
              value={roleValue}
              onValueChange={setRoleValue}
              options={roleOptions}
              name="role"
            />
            <p className="text-sm text-[var(--color-text-secondary)]">
              当前选中值: {roleValue}
            </p>
          </section>

          {/* 错误状态 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              3. 错误状态
            </h2>
            <AppleSelect
              label="状态"
              error={!statusValue ? '请选择一个状态' : undefined}
              value={statusValue}
              onValueChange={setStatusValue}
              options={statusOptions}
              name="status"
            />
            <p className="text-sm text-[var(--color-text-secondary)]">
              当前选中值: {statusValue || '未选择'}
            </p>
          </section>

          {/* 禁用状态 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              4. 禁用状态
            </h2>
            <AppleSelect
              label="禁用的选择框"
              helpText="此选择框已被禁用"
              value="disabled"
              onValueChange={() => {}}
              options={[
                { label: '禁用选项', value: 'disabled' },
              ]}
              disabled
            />
          </section>

          {/* 多个选择框组合 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              5. 表单示例
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <AppleSelect
                label="角色"
                value={roleValue}
                onValueChange={setRoleValue}
                options={roleOptions}
              />
              <AppleSelect
                label="状态"
                value={statusValue}
                onValueChange={setStatusValue}
                options={statusOptions}
              />
            </div>
          </section>

          {/* 键盘导航说明 */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              键盘导航支持
            </h2>
            <div className="rounded-[var(--radius-md)] bg-[var(--color-background-paper)] p-4">
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li>• <kbd className="rounded bg-[var(--color-background-elevated)] px-2 py-1">Tab</kbd> - 聚焦到选择框</li>
                <li>• <kbd className="rounded bg-[var(--color-background-elevated)] px-2 py-1">Space</kbd> / <kbd className="rounded bg-[var(--color-background-elevated)] px-2 py-1">Enter</kbd> - 打开下拉菜单</li>
                <li>• <kbd className="rounded bg-[var(--color-background-elevated)] px-2 py-1">↑</kbd> / <kbd className="rounded bg-[var(--color-background-elevated)] px-2 py-1">↓</kbd> - 在选项间导航</li>
                <li>• <kbd className="rounded bg-[var(--color-background-elevated)] px-2 py-1">Enter</kbd> - 选择当前选项</li>
                <li>• <kbd className="rounded bg-[var(--color-background-elevated)] px-2 py-1">Esc</kbd> - 关闭下拉菜单</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
