'use client';

import { LucideIcon, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    primaryAction?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    hints?: string[];
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    primaryAction,
    secondaryAction,
    hints,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-20 px-4 animate-fadeIn',
                className
            )}
        >
            {/* Icon - 增强视觉吸引力 */}
            {Icon && (
                <div className="mb-8 relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                    <div className="relative p-8 rounded-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-100 dark:border-blue-900/50 shadow-lg">
                        <Icon className="w-20 h-20 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
                    </div>
                </div>
            )}

            {/* Title - 更突出的标题 */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                {title}
            </h2>

            {/* Description - 优化排版 */}
            {description && (
                <p className="text-base text-gray-600 dark:text-gray-400 text-center max-w-lg mb-10 leading-relaxed">
                    {description}
                </p>
            )}

            {/* Actions - 增强 CTA 按钮 */}
            {(primaryAction || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            className="group relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
                        >
                            <span className="relative z-10">{primaryAction.label}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    )}
                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className="px-8 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 border border-gray-200 dark:border-gray-700"
                        >
                            {secondaryAction.label}
                        </button>
                    )}
                </div>
            )}

            {/* Hints - 优化提示框设计 */}
            {hints && hints.length > 0 && (
                <div className="max-w-2xl w-full">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800/50 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <Lightbulb className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-base font-semibold text-blue-900 dark:text-blue-300">
                                使用提示
                            </p>
                        </div>
                        <ul className="space-y-3">
                            {hints.map((hint, index) => (
                                <li
                                    key={index}
                                    className="text-sm text-blue-800 dark:text-blue-400 flex items-start gap-3 group"
                                >
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-900/50 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-300 group-hover:scale-110 transition-transform">
                                        {index + 1}
                                    </span>
                                    <span className="flex-1 leading-relaxed">{hint}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
