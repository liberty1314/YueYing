import React, { forwardRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    error?: boolean;
}

/**
 * 认证表单专用输入框组件
 * 
 * 特点：带图标、聚焦动画、错误状态、密码显示切换
 */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
    ({ icon, error, className = '', type, ...props }, ref) => {
        const theme = useTheme();
        const isDark = theme.palette.mode === 'dark';
        const [showPassword, setShowPassword] = useState(false);

        const isPasswordInput = type === 'password';
        const inputType = isPasswordInput && showPassword ? 'text' : type;

        return (
            <div className="relative flex items-center">
                {icon && (
                    <div className={`absolute left-4 z-10 transition-colors ${error
                        ? 'text-red-400'
                        : isDark
                            ? 'text-slate-400'
                            : 'text-gray-400'
                        }`}>
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    type={inputType}
                    className={`
                        w-full h-12 px-4 
                        ${icon ? 'pl-12' : 'pl-4'}
                        ${isPasswordInput ? 'pr-12' : 'pr-4'}
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
                {isPasswordInput && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-4 z-10 transition-colors cursor-pointer ${error
                                ? 'text-red-400 hover:text-red-300'
                                : isDark
                                    ? 'text-slate-400 hover:text-slate-300'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        );
    }
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;
