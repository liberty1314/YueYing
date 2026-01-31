/**
 * AppleSwitch 组件使用示例
 * 
 * 展示 AppleSwitch 组件的各种用法和配置
 */

'use client';

import { useState } from 'react';
import { AppleSwitch } from './AppleSwitch';

export function AppleSwitchExample() {
  const [basicSwitch, setBasicSwitch] = useState(false);
  const [withLabel, setWithLabel] = useState(true);
  const [withDescription, setWithDescription] = useState(false);
  const [disabledOn, setDisabledOn] = useState(true);
  const [disabledOff, setDisabledOff] = useState(false);
  const [smallSwitch, setSmallSwitch] = useState(true);
  const [mediumSwitch, setMediumSwitch] = useState(true);
  const [largeSwitch, setLargeSwitch] = useState(true);

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
          AppleSwitch 组件示例
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Apple iOS 风格的开关组件，支持多种尺寸和配置
        </p>
      </div>

      {/* 基础用法 */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          基础用法
        </h3>
        <div className="p-6 rounded-[var(--radius-lg)] bg-[var(--color-background-paper)]">
          <AppleSwitch
            checked={basicSwitch}
            onCheckedChange={setBasicSwitch}
          />
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            当前状态: {basicSwitch ? '开启' : '关闭'}
          </p>
        </div>
      </section>

      {/* 带标签 */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          带标签
        </h3>
        <div className="p-6 rounded-[var(--radius-lg)] bg-[var(--color-background-paper)]">
          <AppleSwitch
            checked={withLabel}
            onCheckedChange={setWithLabel}
            label="启用功能"
          />
        </div>
      </section>

      {/* 带标签和描述 */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          带标签和描述
        </h3>
        <div className="p-6 rounded-[var(--radius-lg)] bg-[var(--color-background-paper)]">
          <AppleSwitch
            checked={withDescription}
            onCheckedChange={setWithDescription}
            label="自动刷新"
            description="每 30 秒自动刷新数据"
          />
        </div>
      </section>

      {/* 禁用状态 */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          禁用状态
        </h3>
        <div className="p-6 rounded-[var(--radius-lg)] bg-[var(--color-background-paper)] space-y-4">
          <AppleSwitch
            checked={disabledOn}
            onCheckedChange={setDisabledOn}
            label="禁用（开启状态）"
            disabled
          />
          <AppleSwitch
            checked={disabledOff}
            onCheckedChange={setDisabledOff}
            label="禁用（关闭状态）"
            disabled
          />
        </div>
      </section>

      {/* 不同尺寸 */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          不同尺寸
        </h3>
        <div className="p-6 rounded-[var(--radius-lg)] bg-[var(--color-background-paper)] space-y-4">
          <AppleSwitch
            checked={smallSwitch}
            onCheckedChange={setSmallSwitch}
            label="小尺寸 (sm)"
            description="w-9 h-5"
            size="sm"
          />
          <AppleSwitch
            checked={mediumSwitch}
            onCheckedChange={setMediumSwitch}
            label="中等尺寸 (md) - 默认"
            description="w-11 h-6"
            size="md"
          />
          <AppleSwitch
            checked={largeSwitch}
            onCheckedChange={setLargeSwitch}
            label="大尺寸 (lg)"
            description="w-14 h-8"
            size="lg"
          />
        </div>
      </section>

      {/* 实际应用场景 */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          实际应用场景
        </h3>
        <div className="p-6 rounded-[var(--radius-lg)] bg-[var(--color-background-paper)] space-y-4">
          <AppleSwitch
            checked={true}
            onCheckedChange={() => {}}
            label="推送通知"
            description="接收系统推送通知"
          />
          <AppleSwitch
            checked={false}
            onCheckedChange={() => {}}
            label="暗色模式"
            description="使用暗色主题"
          />
          <AppleSwitch
            checked={true}
            onCheckedChange={() => {}}
            label="自动保存"
            description="自动保存草稿"
          />
          <AppleSwitch
            checked={false}
            onCheckedChange={() => {}}
            label="数据分析"
            description="允许收集匿名使用数据"
          />
        </div>
      </section>

      {/* 代码示例 */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          代码示例
        </h3>
        <div className="p-6 rounded-[var(--radius-lg)] bg-[var(--color-background-paper)]">
          <pre className="text-sm text-[var(--color-text-primary)] overflow-x-auto">
            <code>{`// 基础用法
<AppleSwitch
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
  label="启用功能"
/>

// 带描述
<AppleSwitch
  checked={autoRefresh}
  onCheckedChange={setAutoRefresh}
  label="自动刷新"
  description="每 30 秒自动刷新数据"
/>

// 不同尺寸
<AppleSwitch checked={value} onCheckedChange={setValue} size="sm" />
<AppleSwitch checked={value} onCheckedChange={setValue} size="md" />
<AppleSwitch checked={value} onCheckedChange={setValue} size="lg" />

// 禁用状态
<AppleSwitch
  checked={value}
  onCheckedChange={setValue}
  disabled
/>`}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}
