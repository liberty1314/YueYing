/**
 * Switch 组件 - 开关按钮
 * 
 * 统一的开关组件，采用新拟态（Neumorphism）设计风格
 */

import { useTheme } from '@mui/material/styles';

export interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

/**
 * Switch 开关组件
 * 
 * 采用新拟态设计风格，带有柔和的阴影效果和平滑的过渡动画
 * 
 * @example
 * ```tsx
 * <Switch
 *   checked={enabled}
 *   onChange={setEnabled}
 * />
 * ```
 */
export function Switch({ checked, onChange, disabled = false, className = '' }: SwitchProps) {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <label
            className={`
                inline-flex items-center cursor-pointer
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => !disabled && onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only peer"
                />
                <div
                    className={`
                        relative h-[30px] w-[60px] rounded-full overflow-hidden
                        transition-all duration-400 ease-in-out
                        ${isDark
                            ? 'bg-slate-800 shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.05),inset_4px_4px_8px_rgba(0,0,0,0.4)]'
                            : 'bg-[#ecf0f3] shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.8),inset_4px_4px_8px_rgba(209,217,230,0.8)]'
                        }
                    `}
                >
                    <div
                        className={`
                            absolute top-0 left-0 h-full w-[200%] rounded-full
                            transition-transform duration-400 ease-[cubic-bezier(0.85,0.05,0.18,1.35)]
                            ${checked ? 'translate-x-[25%]' : 'translate-x-[-75%]'}
                            ${isDark
                                ? checked
                                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-[0_2px_8px_rgba(56,189,248,0.4)]'
                                    : 'bg-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                                : checked
                                    ? 'bg-gradient-to-r from-[#0071e3] to-[#0077ed] shadow-[0_2px_8px_rgba(0,113,227,0.3)]'
                                    : 'bg-[#ecf0f3] shadow-[0_2px_8px_rgba(209,217,230,0.6)]'
                            }
                        `}
                    />
                </div>
            </div>
        </label>
    );
}

export default Switch;
