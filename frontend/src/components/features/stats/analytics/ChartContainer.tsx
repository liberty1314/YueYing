/**
 * ChartContainer - 图表容器组件
 * 
 * 统一的图表容器，提供标题、描述和操作区域
 */

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ChartContainerProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    delay?: number;
    className?: string;
}

export function ChartContainer({
    title,
    description,
    action,
    children,
    delay = 0,
    className,
}: ChartContainerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{
                y: -4,
                transition: { duration: 0.2 }
            }}
            className={cn(
                'group relative overflow-hidden',
                'bg-white dark:bg-[#1C1C1E]',
                'rounded-2xl',
                'border border-gray-100 dark:border-white/5',
                'shadow-sm hover:shadow-xl',
                'transition-shadow duration-300',
                'p-6',
                className
            )}
        >
            {/* 背景装饰 */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/10 dark:via-transparent dark:to-purple-950/10"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: delay + 0.1 }}
                >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    )}
                </motion.div>
                {action && (
                    <motion.div
                        className="flex-shrink-0"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: delay + 0.2 }}
                    >
                        {action}
                    </motion.div>
                )}
            </div>

            {/* Chart Content */}
            <motion.div
                className="relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.3 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
