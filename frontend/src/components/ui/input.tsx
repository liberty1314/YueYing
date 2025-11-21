/**
 * Input 组件 - 输入框
 * 
 * 统一的表单输入组件
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, fullWidth = false, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'rounded-lg border bg-white dark:bg-[#1C1C1E]',
          'px-4 py-2 text-base',
          'text-gray-900 dark:text-white',
          'transition-colors duration-200',
          'placeholder:text-gray-500 dark:placeholder:text-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',

          // Default border
          'border-gray-300 dark:border-gray-700',

          // Focus state
          {
            'focus:border-blue-600 dark:focus:border-blue-400 focus:ring-blue-500/20': !error,
            'border-red-500 focus:border-red-500 focus:ring-red-500/20': error,
          },

          // Full width
          {
            'w-full': fullWidth,
          },

          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
