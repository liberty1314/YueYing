/**
 * Badge 组件 - 徽章/标签
 * 
 * 用于展示状态、标签等信息
 */

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-full',
          'transition-colors duration-200',

          // Variants
          {
            'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100': variant === 'default',
            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': variant === 'primary',
            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300': variant === 'success',
            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300': variant === 'warning',
            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300': variant === 'error',
            'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300': variant === 'outline',
          },

          // Sizes
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md',
            'px-3 py-1.5 text-base': size === 'lg',
          },

          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
