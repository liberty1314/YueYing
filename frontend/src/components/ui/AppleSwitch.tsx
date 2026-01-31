/**
 * AppleSwitch 组件 - Apple 风格开关
 * 
 * 基于 Radix UI Switch 实现的 Apple iOS 风格开关组件
 * 支持三种尺寸、标签、描述文本和平滑动画
 */

'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export interface AppleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * AppleSwitch 开关组件
 * 
 * Apple iOS 风格的开关组件，具有以下特点：
 * - 开启状态使用绿色背景（var(--color-success)）
 * - 关闭状态使用灰色背景（var(--color-text-disabled)）
 * - 平滑的过渡动画（200ms ease-in-out）
 * - 圆形滑块带有柔和阴影
 * - 支持三种尺寸（sm、md、lg）
 * - 支持标签和描述文本
 * 
 * @example
 * ```tsx
 * // 基础用法
 * <AppleSwitch
 *   checked={isEnabled}
 *   onCheckedChange={setIsEnabled}
 *   label="启用功能"
 * />
 * 
 * // 带描述
 * <AppleSwitch
 *   checked={autoRefresh}
 *   onCheckedChange={setAutoRefresh}
 *   label="自动刷新"
 *   description="每 30 秒自动刷新数据"
 * />
 * 
 * // 不同尺寸
 * <AppleSwitch checked={value} onCheckedChange={setValue} size="sm" />
 * <AppleSwitch checked={value} onCheckedChange={setValue} size="md" />
 * <AppleSwitch checked={value} onCheckedChange={setValue} size="lg" />
 * ```
 */
const AppleSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  AppleSwitchProps
>(({ checked, onCheckedChange, label, description, disabled, size = 'md', className }, ref) => {
  // 开关容器尺寸
  const sizeClasses = {
    sm: 'w-9 h-5',
    md: 'w-11 h-6',
    lg: 'w-14 h-8',
  };

  // 滑块尺寸
  const thumbSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  // 滑块位移距离
  const thumbTranslateClasses = {
    sm: 'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5',
    md: 'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5',
    lg: 'data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1',
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {(label || description) && (
        <div className="flex-1 mr-4">
          {label && (
            <label className="text-sm font-medium text-[var(--color-text-primary)] cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <SwitchPrimitives.Root
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          sizeClasses[size],
          'relative inline-flex shrink-0 cursor-pointer rounded-full',
          'transition-colors duration-200 ease-in-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'data-[state=checked]:bg-[var(--color-success)]',
          'data-[state=unchecked]:bg-[var(--color-text-disabled)]'
        )}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            thumbSizeClasses[size],
            thumbTranslateClasses[size],
            'pointer-events-none inline-block rounded-full',
            'bg-white shadow-[var(--shadow-sm)]',
            'transform transition-transform duration-200 ease-in-out'
          )}
        />
      </SwitchPrimitives.Root>
    </div>
  );
});

AppleSwitch.displayName = 'AppleSwitch';

export { AppleSwitch };
