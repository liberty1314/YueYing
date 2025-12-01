/**
 * Input 组件 - 输入框
 * 
 * 统一的表单输入组件，样式与登录页面的 AuthInput 保持一致
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { useTheme } from '@mui/material/styles';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, fullWidth = false, type = 'text', ...props }, ref) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
      <input
        type={type}
        ref={ref}
        className={`
          ${fullWidth ? 'w-full' : ''}
          h-12 px-4
          rounded-xl
          border-2
          ${error
            ? isDark
              ? 'border-red-500/50 bg-red-500/5 focus:border-red-400 focus:shadow-[0_0_0_5px_rgba(239,68,68,0.2)]'
              : 'border-red-400 bg-red-50/50 focus:border-red-500 focus:shadow-[0_0_0_5px_rgba(239,68,68,0.15)]'
            : isDark
              ? 'border-transparent bg-slate-900/60 focus:border-sky-400 focus:bg-slate-900 focus:shadow-[0_0_0_5px_rgba(56,189,248,0.2)]'
              : 'border-transparent bg-slate-50 focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_0_5px_rgba(129,140,248,0.2)]'
          }
          ${isDark ? 'text-slate-50' : 'text-gray-900'}
          placeholder:${isDark ? 'text-slate-400' : 'text-gray-400'}
          text-sm
          outline-none
          transition-all duration-300 ease-in-out
          disabled:cursor-not-allowed disabled:opacity-60
          hover:${!error && (isDark ? 'border-sky-400/50' : 'border-indigo-300')}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
