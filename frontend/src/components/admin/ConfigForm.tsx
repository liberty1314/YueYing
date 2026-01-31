/**
 * ConfigForm - 通用配置表单组件
 * 
 * 动态渲染配置表单，支持多种字段类型和分组。
 * 使用 React Hook Form + Zod 进行表单验证。
 * 
 * 验证需求: 6.2, 6.3, 6.4, 6.6, 6.7, 6.8
 * 
 * @component
 * @example
 * ```tsx
 * // 基础用法
 * <ConfigForm
 *   title="LLM 配置"
 *   description="配置大语言模型参数"
 *   fields={[
 *     {
 *       name: 'provider',
 *       label: '提供商',
 *       type: 'select',
 *       options: [
 *         { label: 'OpenAI', value: 'openai' },
 *         { label: 'Anthropic', value: 'anthropic' },
 *       ],
 *       section: '基础配置',
 *     },
 *     {
 *       name: 'temperature',
 *       label: '温度',
 *       type: 'number',
 *       helpText: '控制输出的随机性，范围 0-2',
 *       section: '模型参数',
 *     },
 *   ]}
 *   initialValues={{ provider: 'openai', temperature: 0.7 }}
 *   onSubmit={async (data) => {
 *     await updateConfig(data);
 *   }}
 * />
 * ```
 */

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodSchema } from 'zod';
import { AppleInput } from '@/components/ui/AppleInput';
import { AppleSelect, SelectOption } from '@/components/ui/AppleSelect';
import { Switch } from '@/components/ui/Switch';
import { AppleCard } from '@/components/ui/AppleCard';
import { AppleButton } from '@/components/ui/AppleButton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * 配置字段定义
 */
export interface ConfigField {
  /** 字段名称（用于表单数据） */
  name: string;
  /** 字段标签 */
  label: string;
  /** 字段类型 */
  type: 'text' | 'number' | 'select' | 'switch' | 'textarea' | 'password';
  /** 占位符文本 */
  placeholder?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 选项列表（仅用于 select 类型） */
  options?: SelectOption[];
  /** Zod 验证规则 */
  validation?: ZodSchema;
  /** 字段分组（相同 section 的字段会被分组显示） */
  section?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 最小值（仅用于 number 类型） */
  min?: number;
  /** 最大值（仅用于 number 类型） */
  max?: number;
  /** 步长（仅用于 number 类型） */
  step?: number;
  /** 行数（仅用于 textarea 类型） */
  rows?: number;
}

/**
 * ConfigForm 组件属性
 */
export interface ConfigFormProps {
  /** 表单标题 */
  title: string;
  /** 表单描述 */
  description?: string;
  /** 字段配置列表 */
  fields: ConfigField[];
  /** 初始值 */
  initialValues: Record<string, any>;
  /** 提交回调 */
  onSubmit: (data: Record<string, any>) => Promise<void>;
  /** 是否加载中 */
  loading?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * ConfigForm 通用配置表单组件
 * 
 * 验证需求: 6.2, 6.3, 6.4, 6.6, 6.7, 6.8
 */
export function ConfigForm({
  title,
  description,
  fields,
  initialValues,
  onSubmit,
  loading = false,
  className,
}: ConfigFormProps) {
  const { toast } = useToast();

  // 构建 Zod schema
  const schema = z.object(
    fields.reduce((acc, field) => {
      if (field.validation) {
        acc[field.name] = field.validation;
      } else {
        // 默认验证规则
        switch (field.type) {
          case 'text':
          case 'password':
          case 'textarea':
            acc[field.name] = z.string();
            break;
          case 'number':
            acc[field.name] = z.number();
            break;
          case 'select':
            acc[field.name] = z.string();
            break;
          case 'switch':
            acc[field.name] = z.boolean();
            break;
        }
      }
      return acc;
    }, {} as Record<string, ZodSchema>)
  );

  // 初始化表单
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  // 提交处理
  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      await onSubmit(data);
      toast({
        title: '保存成功',
        description: '配置已成功更新',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: '保存失败',
        description: error.message || '保存配置时发生错误',
        variant: 'error',
      });
    }
  };

  // 按 section 分组字段
  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || '默认';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {} as Record<string, ConfigField[]>);

  // 渲染字段
  const renderField = (field: ConfigField) => {
    const error = errors[field.name]?.message as string | undefined;

    switch (field.type) {
      case 'text':
      case 'password':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <AppleInput
                {...formField}
                type={field.type}
                label={field.label}
                placeholder={field.placeholder}
                helpText={field.helpText}
                error={error}
                disabled={field.disabled || loading}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <AppleInput
                {...formField}
                type="number"
                label={field.label}
                placeholder={field.placeholder}
                helpText={field.helpText}
                error={error}
                disabled={field.disabled || loading}
                min={field.min}
                max={field.max}
                step={field.step}
                onChange={(e) => {
                  const value = e.target.value;
                  formField.onChange(value === '' ? '' : Number(value));
                }}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <AppleSelect
                value={formField.value}
                onValueChange={formField.onChange}
                label={field.label}
                options={field.options || []}
                placeholder={field.placeholder}
                helpText={field.helpText}
                error={error}
                disabled={field.disabled || loading}
                name={formField.name}
              />
            )}
          />
        );

      case 'switch':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-[var(--color-text-primary)]">
                      {field.label}
                    </label>
                    {field.helpText && (
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={formField.value}
                    onChange={formField.onChange}
                    disabled={field.disabled || loading}
                  />
                </div>
                {error && (
                  <p className="text-xs text-[var(--color-error)]">{error}</p>
                )}
              </div>
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: formField }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                  {field.label}
                </label>
                <textarea
                  {...formField}
                  placeholder={field.placeholder}
                  disabled={field.disabled || loading}
                  rows={field.rows || 4}
                  className={cn(
                    'w-full rounded-[var(--radius-md)] border',
                    'bg-[var(--color-background-elevated)]',
                    'text-[var(--color-text-primary)]',
                    'placeholder:text-[var(--color-text-disabled)]',
                    'px-4 py-3',
                    'text-base',
                    'transition-all duration-200 ease-in-out',
                    'focus:outline-none',
                    'focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50',
                    'focus:border-[var(--color-primary)]',
                    'focus:bg-[var(--color-background-default)]',
                    'hover:border-[var(--color-text-secondary)]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'disabled:bg-[var(--color-background-paper)]',
                    error
                      ? 'border-[var(--color-error)] focus:ring-[var(--color-error)] focus:ring-opacity-30'
                      : 'border-transparent',
                    'resize-vertical'
                  )}
                />
                {field.helpText && !error && (
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {field.helpText}
                  </p>
                )}
                {error && (
                  <p className="text-xs text-[var(--color-error)]">{error}</p>
                )}
              </div>
            )}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* 表单头部 */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </div>

      {/* 表单内容 */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 按 section 分组渲染字段 */}
        {Object.entries(groupedFields).map(([section, sectionFields]) => (
          <AppleCard key={section} variant="elevated" sx={{ p: 3 }}>
            {/* Section 标题 */}
            {section !== '默认' && (
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-4">
                {section}
              </h3>
            )}

            {/* 字段列表 */}
            <div className="space-y-4">
              {sectionFields.map((field) => (
                <div key={field.name}>{renderField(field)}</div>
              ))}
            </div>
          </AppleCard>
        ))}

        {/* 提交按钮 */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-[var(--color-background-default)] py-4 border-t border-[var(--color-text-disabled)]/20">
          <AppleButton
            type="button"
            variant="secondary"
            onClick={() => reset()}
            disabled={isSubmitting || loading}
          >
            重置
          </AppleButton>
          <AppleButton
            type="submit"
            variant="primary"
            disabled={isSubmitting || loading}
            loading={isSubmitting || loading}
          >
            保存配置
          </AppleButton>
        </div>
      </form>
    </div>
  );
}

export default ConfigForm;
