'use client';

import { LucideIcon } from 'lucide-react';
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
                'flex flex-col items-center justify-center py-16 px-4 animate-fadeIn',
                className
            )}
        >
            {/* Icon */}
            {Icon && (
                <div className="mb-6 p-6 rounded-full bg-gray-100 dark:bg-gray-800">
                    <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
            )}

            {/* Title */}
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
                    {description}
                </p>
            )}

            {/* Actions */}
            {(primaryAction || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            {primaryAction.label}
                        </button>
                    )}
                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
                        >
                            {secondaryAction.label}
                        </button>
                    )}
                </div>
            )}

            {/* Hints */}
            {hints && hints.length > 0 && (
                <div className="max-w-lg w-full">
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                            💡 提示
                        </p>
                        <ul className="space-y-1">
                            {hints.map((hint, index) => (
                                <li
                                    key={index}
                                    className="text-sm text-blue-800 dark:text-blue-400 flex items-start"
                                >
                                    <span className="mr-2">•</span>
                                    <span>{hint}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
