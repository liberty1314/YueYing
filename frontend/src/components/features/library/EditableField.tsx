/**
 * EditableField - 可编辑字段组件
 * 
 * 根据 isEditing 状态在只读文本和可编辑输入框之间切换
 */

'use client';

import { cn } from '@/lib/utils';

interface EditableFieldProps {
    label?: string;
    value: string;
    isEditing: boolean;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
    rows?: number;
}

export function EditableField({
    label,
    value,
    isEditing,
    onChange,
    className = '',
    placeholder = '',
    multiline = false,
    rows = 1,
}: EditableFieldProps) {
    if (!isEditing) {
        return (
            <div>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <span className={cn('block', className)}>
                    {value || placeholder}
                </span>
            </div>
        );
    }

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={rows}
                    placeholder={placeholder}
                    className={cn(
                        'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                        'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'resize-none',
                        className
                    )}
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
                        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                        'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        className
                    )}
                />
            )}
        </div>
    );
}
