/**
 * AppleSelect - Apple 风格下拉选择框组件
 * 
 * 基于 Radix UI Select 实现的 Apple 风格下拉选择组件。
 * 特点：圆角设计、毛玻璃效果、柔和阴影、流畅动画、键盘导航支持。
 * 
 * @component
 * @example
 * ```tsx
 * // 基础用法
 * <AppleSelect
 *   value={value}
 *   onValueChange={setValue}
 *   options={[
 *     { label: '选项 1', value: '1' },
 *     { label: '选项 2', value: '2' },
 *   ]}
 *   placeholder="请选择"
 * />
 * 
 * // 带标签和帮助文本
 * <AppleSelect
 *   label="角色"
 *   helpText="选择用户角色"
 *   value={role}
 *   onValueChange={setRole}
 *   options={roleOptions}
 * />
 * 
 * // 错误状态
 * <AppleSelect
 *   label="类型"
 *   error="请选择一个类型"
 *   value={type}
 *   onValueChange={setType}
 *   options={typeOptions}
 * />
 * ```
 */

import { forwardRef } from 'react';
import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * 选项接口
 */
export interface SelectOption {
  /** 显示文本 */
  label: string;
  /** 选项值 */
  value: string;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * AppleSelect 组件属性接口
 */
export interface AppleSelectProps {
  /** 当前选中的值 */
  value: string;
  /** 值变化回调 */
  onValueChange: (value: string) => void;
  /** 选项列表 */
  options: SelectOption[];
  /** 占位符文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 错误消息 */
  error?: string;
  /** 标签文本 */
  label?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 自定义类名 */
  className?: string;
  /** 名称（用于表单） */
  name?: string;
}

/**
 * AppleSelect 下拉选择框组件
 * 
 * 验证需求: 1.4, 6.1
 */
export const AppleSelect = forwardRef<HTMLButtonElement, AppleSelectProps>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder = '请选择',
      disabled = false,
      error,
      label,
      helpText,
      className,
      name,
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-2', className)}>
        {/* 标签 */}
        {label && (
          <label
            className="text-sm font-medium text-[var(--color-text-primary)]"
            htmlFor={name}
          >
            {label}
          </label>
        )}

        {/* Select 组件 */}
        <Select.Root
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          name={name}
        >
          <Select.Trigger
            ref={ref}
            id={name}
            className={cn(
              // 基础样式
              'flex w-full items-center justify-between',
              'rounded-[var(--radius-md)] border',
              'bg-[var(--color-background-elevated)]',
              'px-4 py-3',
              'text-[var(--color-text-primary)]',
              'transition-all duration-200',
              // 聚焦样式
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-0',
              // 悬停样式
              'hover:bg-[var(--color-background-paper)]',
              // 禁用样式
              'disabled:cursor-not-allowed disabled:opacity-50',
              // 错误样式
              error
                ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]'
                : 'border-transparent',
              // 占位符样式
              !value && 'text-[var(--color-text-disabled)]'
            )}
            aria-label={label || placeholder}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${name}-error` : helpText ? `${name}-help` : undefined
            }
          >
            <Select.Value placeholder={placeholder} />
            <Select.Icon className="ml-2">
              <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)]" />
            </Select.Icon>
          </Select.Trigger>

          {/* 下拉内容 */}
          <Select.Portal>
            <Select.Content
              className={cn(
                // 基础样式
                'relative z-50 min-w-[8rem] overflow-hidden',
                'rounded-[var(--radius-md)]',
                'bg-[var(--color-background-elevated)]',
                'backdrop-blur-xl',
                'shadow-[var(--shadow-lg)]',
                'border border-[var(--color-text-disabled)]/20',
                // 动画
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                'data-[side=bottom]:slide-in-from-top-2',
                'data-[side=left]:slide-in-from-right-2',
                'data-[side=right]:slide-in-from-left-2',
                'data-[side=top]:slide-in-from-bottom-2'
              )}
              position="popper"
              sideOffset={4}
            >
              {/* 向上箭头（当下拉菜单在上方时） */}
              <Select.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
                <ChevronUp className="h-4 w-4 text-[var(--color-text-secondary)]" />
              </Select.ScrollUpButton>

              {/* 选项视口 */}
              <Select.Viewport className="p-1">
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </Select.Viewport>

              {/* 向下箭头（当下拉菜单在下方时） */}
              <Select.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
                <ChevronDown className="h-4 w-4 text-[var(--color-text-secondary)]" />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {/* 帮助文本或错误消息 */}
        {helpText && !error && (
          <p
            id={`${name}-help`}
            className="text-xs text-[var(--color-text-secondary)]"
          >
            {helpText}
          </p>
        )}
        {error && (
          <p
            id={`${name}-error`}
            className="text-xs text-[var(--color-error)]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

AppleSelect.displayName = 'AppleSelect';

/**
 * SelectItem - 选项组件
 */
interface SelectItemProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, disabled, children }, ref) => {
    return (
      <Select.Item
        ref={ref}
        value={value}
        disabled={disabled}
        className={cn(
          // 基础样式
          'relative flex w-full cursor-pointer select-none items-center',
          'rounded-[var(--radius-sm)]',
          'py-2 pl-8 pr-2',
          'text-sm text-[var(--color-text-primary)]',
          'outline-none transition-colors duration-150',
          // 聚焦和悬停样式
          'focus:bg-[var(--color-background-paper)]',
          'data-[highlighted]:bg-[var(--color-background-paper)]',
          // 选中样式
          'data-[state=checked]:text-[var(--color-primary)]',
          'data-[state=checked]:font-medium',
          // 禁用样式
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
        )}
      >
        {/* 选中指示器 */}
        <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
          <Select.ItemIndicator>
            <Check className="h-4 w-4" />
          </Select.ItemIndicator>
        </span>

        {/* 选项文本 */}
        <Select.ItemText>{children}</Select.ItemText>
      </Select.Item>
    );
  }
);

SelectItem.displayName = 'SelectItem';

export default AppleSelect;
